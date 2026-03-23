import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Invoice, InvoiceReminder, Destination, Settings, PaymentType, InvoiceStatus } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import { format } from 'date-fns';
import { formatLocalDate, getTodayLocalDate } from '../utils/dateUtils';
import { getInvoiceDisplayStatus } from '../utils/invoiceUtils';
import jsPDF from 'jspdf';

const BILLING_TYPE_LABELS: Record<string, string> = {
  mile: 'By Mile',
  mini_run: 'Mini Run',
  day_rate: 'Day Rate',
  hourly: 'Hourly',
  chase_pole: 'Chase/Pole',
};

const getRateLabel = (items: any[]): string => {
  if (!items || items.length === 0) return 'Rate';
  const types = items.map(item => item.type).filter(Boolean);
  if (types.length === 0) return 'Rate';
  
  // If all items have the same type, use that type's label
  const uniqueTypes = [...new Set(types)];
  if (uniqueTypes.length === 1) {
    const type = uniqueTypes[0];
    if (type === 'mile') return 'Mile Rate';
    if (type === 'hourly') return 'Hourly Rate';
    if (type === 'day_rate') return 'Day Rate';
    if (type === 'mini_run') return 'Mini Run Rate';
    if (type === 'chase_pole') return 'Chase/Pole Rate';
  }
  
  return 'Rate';
};

const getMilesLabel = (items: any[]): string => {
  if (!items || items.length === 0) return 'Miles';
  const types = items.map(item => item.type).filter(Boolean);
  if (types.length === 0) return 'Miles';
  
  // If all items have the same type, use that type's label
  const uniqueTypes = [...new Set(types)];
  if (uniqueTypes.length === 1) {
    const type = uniqueTypes[0];
    if (type === 'hourly') return 'Hours';
    if (type === 'day_rate') return 'Days';
    // For mile, chase_pole, mini_run, default to Miles
  }
  
  return 'Miles';
};

/**
 * Extracts normalized customer information from an invoice.
 * Priority order:
 * 1. invoice.customer.phones/emails/addresses arrays (primary first)
 * 2. invoice.customer.phone/email/address (direct fields)
 * 3. invoice.customer_name/customer_phone/etc. (flat fields from JOIN)
 */
const extractCustomerInfo = (invoice: Invoice | null): {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
} => {
  if (!invoice) {
    return { name: 'N/A' };
  }

  const customer = invoice.customer || (invoice as any);
  const invoiceAny = invoice as any;

  // Extract name - priority: customer.name, customer_name, 'N/A'
  const name = customer?.name || invoiceAny.customer_name || 'N/A';

  // Extract address - priority: primary from addresses array, customer.address, customer_address
  let address: string | undefined;
  if (customer?.addresses && customer.addresses.length > 0) {
    const primaryAddress = customer.addresses.find((a: any) => a.is_primary) || customer.addresses[0];
    address = primaryAddress?.address;
  }
  if (!address) {
    address = customer?.address || invoiceAny.customer_address;
  }

  // Extract phone - priority: primary from phones array, customer.phone, customer_phone
  let phone: string | undefined;
  if (customer?.phones && customer.phones.length > 0) {
    const primaryPhone = customer.phones.find((p: any) => p.is_primary) || customer.phones[0];
    phone = primaryPhone?.phone;
  }
  if (!phone) {
    phone = customer?.phone || invoiceAny.customer_phone;
  }

  // Extract email - priority: primary from emails array, customer.email, customer_email
  let email: string | undefined;
  if (customer?.emails && customer.emails.length > 0) {
    const primaryEmail = customer.emails.find((e: any) => e.is_primary) || customer.emails[0];
    email = primaryEmail?.email;
  }
  if (!email) {
    email = customer?.email || invoiceAny.customer_email;
  }

  // Extract tax_id - priority: customer.tax_id, customer_tax_id
  const tax_id = customer?.tax_id || invoiceAny.customer_tax_id;

  return {
    name,
    address,
    phone,
    email,
    tax_id,
  };
};

export default function InvoiceView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderNotes, setReminderNotes] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [editingPaymentDate, setEditingPaymentDate] = useState(false);
  const [paymentDateInput, setPaymentDateInput] = useState('');
  const [editingPaymentType, setEditingPaymentType] = useState(false);
  const [paymentTypeInput, setPaymentTypeInput] = useState('');

  useEffect(() => {
    const load = async () => {
      if (id) {
        await loadInvoice(parseInt(id));
      }
      try {
        const [dests, settingsData] = await Promise.all([
          MockDataService.getDestinations(),
          MockDataService.getSettings()
        ]);
        setDestinations(dests || []);
        setSettings(settingsData);
        console.log('Loaded settings:', settingsData);
        console.log('Company name:', settingsData?.company_name);
      } catch (error) {
        console.error('Error loading data for invoice view:', error);
        setDestinations([]);
      }
    };

    load();
  }, [id]);

  // Initialize payment date and type inputs when invoice loads
  useEffect(() => {
    if (invoice) {
      setPaymentDateInput(invoice.payment_date || getTodayLocalDate());
      setEditingPaymentDate(!invoice.payment_date);
      setPaymentTypeInput(invoice.payment_type || '');
      setEditingPaymentType(!invoice.payment_type);
    }
  }, [invoice]);

  const loadInvoice = async (invoiceId: number) => {
    try {
      setLoading(true);
      const data = await MockDataService.getInvoice(invoiceId);
      if (data) {
        console.log('Loaded invoice:', data);
        console.log('Invoice items:', data.items);
        console.log('Invoice extras:', data.extras);
        setInvoice(data);
      } else {
        alert('Invoice not found');
        navigate('/invoices');
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      alert(`Error loading invoice: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    if (!invoice || !reminderDate) {
      alert('Please select a reminder date');
      return;
    }

    try {
      await MockDataService.createReminder({
        invoice_id: invoice.id!,
        reminder_date: reminderDate,
        notes: reminderNotes,
        completed: false,
      });
      setReminderDate('');
      setReminderNotes('');
      loadInvoice(invoice.id!);
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Error creating reminder');
    }
  };

  const handleToggleReminder = async (reminderId: number, completed: boolean) => {
    try {
      await MockDataService.updateReminder(reminderId, { completed: !completed });
      if (invoice) {
        loadInvoice(invoice.id!);
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      alert('Error updating reminder');
    }
  };

  const handleDeleteReminder = async (reminderId: number) => {
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      await MockDataService.deleteReminder(reminderId);
      if (invoice) {
        loadInvoice(invoice.id!);
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('Error deleting reminder');
    }
  };

  const handleUpdatePaymentDate = async () => {
    if (!invoice || !paymentDateInput) {
      alert('Please select a payment date');
      return;
    }

    try {
      // Update invoice with new payment date, preserving all other fields
      await MockDataService.updateInvoice(
        invoice.id!,
        {
          ...invoice,
          payment_date: paymentDateInput,
          // If status is not 'paid', update it to 'paid'
          status: invoice.status !== 'paid' ? 'paid' : invoice.status,
        },
        invoice.items || [],
        invoice.extras || []
      );
      
      // Reload invoice to show updated data
      await loadInvoice(invoice.id!);
      setEditingPaymentDate(false);
    } catch (error) {
      console.error('Error updating payment date:', error);
      alert('Error updating payment date');
    }
  };

  const handleUpdatePaymentType = async () => {
    if (!invoice) {
      return;
    }

    try {
      // Update invoice with new payment type, preserving all other fields
      await MockDataService.updateInvoice(
        invoice.id!,
        {
          ...invoice,
          payment_type: (paymentTypeInput as PaymentType) || undefined,
        },
        invoice.items || [],
        invoice.extras || []
      );
      
      // Reload invoice to show updated data
      await loadInvoice(invoice.id!);
      setEditingPaymentType(false);
    } catch (error) {
      console.error('Error updating payment type:', error);
      alert('Error updating payment type');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    if (!invoice || !settings) return;

    // Detect if this is a custom invoice
    const isCustom = invoice.items && invoice.items.length > 0 && invoice.items.every(item => 
      !item.run_date && 
      !item.from_destination_id && 
      !item.to_destination_id && 
      !item.miles &&
      item.rate === item.amount
    );

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;

    // Helper function to convert hex color to RGB
    const hexToRgb = (hex: string): [number, number, number] => {
      if (!hex || !hex.startsWith('#')) return [30, 30, 30]; // Default dark gray
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    // RESERVE LEFT SPACE FOR LOGO - use user-defined size or defaults
    // Users can adjust logo size in Settings to fit their logo perfectly
    // Ensure values are numbers (database might return strings)
    const logoHeight = Number(settings.logo_height) || 70; // User-defined or default
    const logoWidth = Number(settings.logo_width) || 90; // User-defined or default
    const logoAreaWidth = logoWidth + 15; // Logo width + spacing
    
    // Debug: Log logo size being used
    console.log('PDF Export - Logo size:', { width: logoWidth, height: logoHeight, settings: { logo_width: settings.logo_width, logo_height: settings.logo_height } });
    let logoAdded = false;
    
    // Add logo in reserved left area - MAXIMUM QUALITY, LARGE SIZE
    if (settings.company_logo) {
      try {
        const base64Logo = settings.company_logo.trim();
        if (base64Logo && base64Logo.length >= 100) {
          const isPNG = base64Logo.substring(0, 5) === 'iVBOR';
          const isJPEG = base64Logo.substring(0, 4) === '/9j/';
          
          if (isPNG || isJPEG) {
            const imageFormat: 'PNG' | 'JPEG' = isPNG ? 'PNG' : 'JPEG';
            const mimeType = isPNG ? 'image/png' : 'image/jpeg';
            const logoData = `data:${mimeType};base64,${base64Logo}`;
            
            try {
              // Use user-defined logo size from settings
              // Ensure values are valid numbers
              const finalWidth = Number(logoWidth) || 90;
              const finalHeight = Number(logoHeight) || 70;
              
              console.log('Adding logo to PDF:', { width: finalWidth, height: finalHeight, format: imageFormat });
              doc.addImage(logoData, imageFormat, margin, margin, finalWidth, finalHeight);
              logoAdded = true;
            } catch (addError) {
              console.error('jsPDF addImage error:', addError);
            }
          }
        }
      } catch (error) {
        console.error('Error processing logo for PDF:', error);
      }
    }
    
    // HEADER ROW: INVOICE at top right
    const headerY = margin + 10;
    const rightMargin = pageWidth - margin;
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const titleColor = settings.invoice_title_color 
      ? hexToRgb(settings.invoice_title_color)
      : [30, 30, 30];
    doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
    doc.text('INVOICE', rightMargin, headerY, { align: 'right' });
    
    // Invoice details below INVOICE header
    let invoiceDetailsY = headerY + 12;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Invoice #: ${invoice.invoice_number}`, rightMargin, invoiceDetailsY, { align: 'right' });
    invoiceDetailsY += 6;
    doc.text(`Date: ${formatLocalDate(invoice.date)}`, rightMargin, invoiceDetailsY, { align: 'right' });
    if (invoice.due_date) {
      invoiceDetailsY += 6;
      doc.text(`Due Date: ${formatLocalDate(invoice.due_date)}`, rightMargin, invoiceDetailsY, { align: 'right' });
    }
    
    // Start billing section below logo area (or invoice details if no logo)
    yPos = Math.max(margin + logoHeight + 15, invoiceDetailsY + 10);
    
    // TWO COLUMN LAYOUT: Bill To (left) and Company Info (right)
    // This works whether logo exists or not - company info always goes in right column
    const billToX = margin; // Left column
    const companyInfoX = pageWidth / 2 + 20; // Right column
    
    // Customer Info - LEFT COLUMN
    doc.setFillColor(245, 247, 250);
    doc.rect(margin, yPos - 3, pageWidth - 2 * margin, 1, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    const headerColor = settings.invoice_header_color 
      ? hexToRgb(settings.invoice_header_color)
      : [40, 40, 40];
    doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.text('Bill To:', billToX, yPos);
    
    // Company Info - RIGHT COLUMN (next to Bill To)
    let companyInfoY = yPos;
    if (settings.company_name) {
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
      doc.text(settings.company_name, companyInfoX, companyInfoY);
      companyInfoY += 8;
    }
    
    // Bill To details - LEFT COLUMN
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const customerInfo = extractCustomerInfo(invoice);
    
    doc.setFont('helvetica', 'bold');
    doc.text(customerInfo.name, billToX, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    if (customerInfo.address) {
      const addressLines = customerInfo.address.split('\n');
      addressLines.forEach((line: string) => {
        doc.text(line, billToX, yPos);
        yPos += 5;
      });
    }
    if (customerInfo.phone) {
      doc.text(`Phone: ${customerInfo.phone}`, billToX, yPos);
      yPos += 5;
    }
    if (customerInfo.email) {
      doc.text(`Email: ${customerInfo.email}`, billToX, yPos);
      yPos += 5;
    }
    if (customerInfo.tax_id) {
      doc.text(`Tax ID: ${customerInfo.tax_id}`, billToX, yPos);
      yPos += 5;
    }
    
    // Company Info details - RIGHT COLUMN
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    if (settings.company_address) {
      const addressLines = settings.company_address.split('\n');
      addressLines.forEach((line: string) => {
        doc.text(line, companyInfoX, companyInfoY);
        companyInfoY += 5;
      });
    }
    if (settings.company_phone) {
      doc.text(`Phone: ${settings.company_phone}`, companyInfoX, companyInfoY);
      companyInfoY += 5;
    }
    if (settings.company_email) {
      doc.text(`Email: ${settings.company_email}`, companyInfoX, companyInfoY);
      companyInfoY += 5;
    }
    
    // Use the maximum Y position from both columns
    yPos = Math.max(yPos, companyInfoY) + 8;

    // Destination (only for standard invoices)
    if (!isCustom && (invoice.destination || (invoice as any).destination_name)) {
      doc.setFontSize(14);
      doc.text('Destination:', margin, yPos);
      yPos += 7;
      doc.setFontSize(11);
      const dest = invoice.destination || (invoice as any);
      doc.text(dest.destination_name || 'N/A', margin, yPos);
      yPos += 5;
      if (dest.destination_address) {
        doc.text(dest.destination_address, margin, yPos);
        yPos += 5;
      }
      yPos += 5;
    }

    // Get dynamic labels for table headers
    const rateLabel = getRateLabel(invoice.items || []);
    const milesLabel = getMilesLabel(invoice.items || []);

    // Items table header - Enhanced styling with background
    yPos += 3;
    const tableMargin = 15;
    doc.setFillColor(240, 242, 245);
    doc.rect(tableMargin, yPos - 4, pageWidth - 2 * tableMargin, 8, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    if (isCustom) {
      // Custom invoice: simplified table
      doc.text('Description', margin, yPos);
      doc.text('Amount', pageWidth - margin - 30, yPos, { align: 'right' });
    } else {
      // Standard invoice: full table with EXPANDED column spacing
      // Page width is ~210mm, margins are 15mm each side = 180mm usable width
      // Distribute columns with proper spacing to prevent ANY overlap
      doc.setFontSize(8);
      
      // Calculate column positions with generous spacing - ensure NO overlap
      // Leave 3-4mm gaps between columns for safety
      const col1 = tableMargin; // Description (starts at 15mm, 35mm wide)
      const col2 = col1 + 38; // Run Date (starts at 53mm, 16mm wide) - 3mm gap
      const col3 = col2 + 19; // From/To (starts at 72mm, 38mm wide) - 3mm gap
      const col4 = col3 + 41; // Miles/Hours/Days (starts at 113mm, 14mm wide) - 3mm gap
      const col5 = col4 + 17; // Rate (starts at 130mm, 25mm wide) - 3mm gap - increased for "Hourly Rate"
      const col6 = pageWidth - tableMargin - 2; // Amount (right-aligned, starts ~193mm, 20mm wide) - 43mm gap
      
      doc.text('Description', col1, yPos);
      doc.text('Run Date', col2, yPos);
      doc.text('From/To', col3, yPos);
      doc.text(milesLabel, col4, yPos);
      // Rate label - increased width to fit "Hourly Rate" (11 chars, needs ~25mm at 8pt)
      doc.text(rateLabel, col5, yPos);
      doc.text('Amount', col6, yPos, { align: 'right' });
    }
    yPos += 6;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(tableMargin, yPos, pageWidth - tableMargin, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    if (invoice.items) {
      // Helper function to get destination name
      const getDestinationName = (id?: number, storedName?: string) => {
        if (storedName) return storedName;
        if (!id) return '';
        const dest = destinations.find(d => d.id === id);
        return dest ? dest.name : '';
      };

      invoice.items.forEach(item => {
        if (yPos > 250) {
          doc.addPage();
          yPos = margin;
        }
        if (isCustom) {
          // Custom invoice: just description and amount
          const pdfDescription = (item.description && item.description.trim()) || 'Item';
          doc.text(pdfDescription, margin, yPos);
          doc.text(`$${item.amount.toFixed(2)}`, pageWidth - margin - 30, yPos, { align: 'right' });
        } else {
          // Standard invoice: full details
          // Use compact date format (MM/DD/YY) for PDF
          const runDateStr = item.run_date
            ? (() => {
                const date = new Date(item.run_date);
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const year = String(date.getFullYear()).slice(-2);
                return `${month}/${day}/${year}`;
              })()
            : '-';
          const fromName = getDestinationName(item.from_destination_id, item.from_destination_name);
          const toName = getDestinationName(item.to_destination_id, item.to_destination_name);
          // Determine miles display - only show "mini run" if type is mini_run, otherwise show the value
          let milesValue = '-';
          if (item.type === 'mini_run') {
            milesValue = 'mini run';
          } else if (item.miles != null) {
            milesValue = item.miles.toFixed(1);
          }
          
          // Use smaller font for data rows to fit more text
          const tableMargin = 15;
          doc.setFontSize(8);
          doc.setTextColor(50, 50, 50);
          
          // Helper to wrap text to multiple lines - NEVER truncate, always wrap
          const wrapText = (text: string, maxWidth: number): string[] => {
            if (!text || text === '-') return ['-'];
            // Use jsPDF's splitTextToSize to wrap text properly
            const wrapped = doc.splitTextToSize(text, maxWidth);
            return wrapped;
          };
          
          // Use same column positions as headers with matching widths
          const col1 = tableMargin; // Description (35mm)
          const col2 = col1 + 38; // Run Date (16mm)
          const col3 = col2 + 19; // From/To (38mm) - will wrap to multiple lines
          const col4 = col3 + 41; // Miles (14mm)
          const col5 = col4 + 17; // Rate (25mm - increased for "Hourly Rate")
          const col6 = pageWidth - tableMargin - 2; // Amount (right-aligned, 20mm)
          
          // Wrap description to fit column width - ensure description is shown
          const pdfDescription = (item.description && item.description.trim()) 
            ? item.description 
            : (BILLING_TYPE_LABELS[item.type] || item.type || 'Service');
          const descriptionLines = wrapText(pdfDescription, 35);
          
          // Format route - wrap each part separately to prevent overlap
          const fromText = fromName || 'N/A';
          const toText = toName || 'N/A';
          const fromLines = wrapText(`From: ${fromText}`, 38);
          const toLines = wrapText(`To: ${toText}`, 38);
          
          // Miles value (14mm width) - should fit "mini run"
          const milesLines = wrapText(milesValue, 14);
          
          // Calculate row height based on maximum lines needed
          // Each line is ~4mm tall, add 1mm spacing between lines
          const lineHeight = 4;
          const maxLines = Math.max(
            descriptionLines.length,
            fromLines.length + toLines.length,
            milesLines.length,
            1 // At least 1 line for date/rate/amount
          );
          const currentRowHeight = Math.max(12, maxLines * lineHeight + 2); // Minimum 12mm, or based on content
          
          // Add subtle row separator BEFORE drawing content
          doc.setDrawColor(240, 240, 240);
          doc.setLineWidth(0.2);
          doc.line(tableMargin, yPos - 2, pageWidth - tableMargin, yPos - 2);
          
          // Draw description - wrap to multiple lines if needed
          let descY = yPos + 2;
          descriptionLines.forEach((line, idx) => {
            doc.text(line, col1, descY);
            descY += lineHeight;
          });
          
          // Draw run date - single line, vertically centered
          const dateY = yPos + (currentRowHeight / 2) - 2;
          doc.text(runDateStr || '-', col2, dateY);
          
          // Draw route - From and To, each can wrap to multiple lines
          let routeY = yPos + 2;
          fromLines.forEach((line) => {
            doc.text(line, col3, routeY);
            routeY += lineHeight;
          });
          toLines.forEach((line) => {
            doc.text(line, col3, routeY);
            routeY += lineHeight;
          });
          
          // Draw miles - wrap if needed
          const milesY = yPos + (currentRowHeight / 2) - 2;
          milesLines.forEach((line, idx) => {
            doc.text(line, col4, milesY + (idx * lineHeight));
          });
          
          // Draw rate and amount - single line, vertically centered
          const rateY = yPos + (currentRowHeight / 2) - 2;
          doc.setFont('helvetica', 'normal');
          doc.text(`$${Number(item.rate).toFixed(2)}`, col5, rateY);
          doc.setFont('helvetica', 'bold');
          doc.text(`$${Number(item.amount).toFixed(2)}`, col6, rateY, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10); // Reset font size
          
          // Adjust yPos for next row - use calculated height
          yPos += currentRowHeight;
        }
      });
    }

    if (invoice.extras && invoice.extras.length > 0) {
      yPos += 3;
      doc.setFont('helvetica', 'bold');
      doc.text('Extras:', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      invoice.extras.forEach(extra => {
        if (yPos > 250) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(extra.description, margin, yPos);
        doc.text(`$${extra.amount.toFixed(2)}`, pageWidth - margin - 30, yPos, { align: 'right' });
        yPos += 6;
      });
    }

    yPos += 8;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(tableMargin, yPos, pageWidth - tableMargin, yPos);
    yPos += 10;

    // Total - Enhanced styling
    doc.setFillColor(250, 250, 250);
    doc.rect(pageWidth - margin - 80, yPos - 4, 60, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text('Total:', pageWidth - margin - 60, yPos, { align: 'right' });
    doc.setFontSize(16);
    doc.text(`$${invoice.total.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });

    // Notes
    if (invoice.notes) {
      yPos += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Notes:', margin, yPos);
      yPos += 6;
      const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
      doc.text(notesLines, margin, yPos);
    }

    doc.save(`invoice-${invoice.invoice_number}.pdf`);
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  if (!invoice) {
    return <div className="card">Invoice not found</div>;
  }

  // Debug: Log settings state
  console.log('Rendering invoice view. Settings:', settings);
  console.log('Company name:', settings?.company_name);

  const customerInfo = extractCustomerInfo(invoice);
  const destination = invoice.destination || (invoice as any);
  // CRITICAL: Always prioritize stored destination name - invoice is useless without pickup/delivery info
  const getDestinationName = (id?: number, storedName?: string) => {
    // Always prefer stored name - invoice is useless without pickup/delivery info
    if (storedName) return storedName;
    if (!id) return '';
    const d = destinations.find(x => x.id === id);
    return d ? d.name || '' : '';
  };

  // Detect if this is a custom invoice
  const isCustomInvoice = invoice.items && invoice.items.length > 0 && invoice.items.every(item => 
    !item.run_date && 
    !item.from_destination_id && 
    !item.to_destination_id && 
    !item.miles &&
    item.rate === item.amount // In custom invoices, rate equals amount
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Invoice {invoice.invoice_number}</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/invoices')}>
            Back to List
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/invoices', { state: { invoice } })}>
            Edit
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            Print
          </button>
          <button className="btn btn-success" onClick={handleExportPDF}>
            Export PDF
          </button>
        </div>
      </div>

      <div className="card" id="invoice-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            {settings?.company_name ? (
              <>
                {settings.company_logo && (() => {
                  // Detect image format
                  const base64Logo = settings.company_logo;
                  const mimeType = base64Logo.startsWith('iVBOR') ? 'image/png' : 'image/jpeg';
                  return (
                    <img
                      src={`data:${mimeType};base64,${base64Logo}`}
                      alt="Company Logo"
                      style={{
                        maxWidth: '150px',
                        maxHeight: '150px',
                        width: 'auto',
                        height: 'auto',
                        marginBottom: '1rem',
                        display: 'block',
                        objectFit: 'contain',
                        background: 'transparent',
                      }}
                    />
                  );
                })()}
                <h2 style={{ 
                  marginBottom: '0.5rem',
                  color: settings?.invoice_header_color || '#1a1a1a'
                }}>{settings.company_name}</h2>
                {settings.company_address && (
                  <div style={{ marginBottom: '0.25rem', color: '#555', whiteSpace: 'pre-line' }}>
                    {settings.company_address}
                  </div>
                )}
                {settings.company_phone && <div style={{ marginBottom: '0.25rem', color: '#555' }}>Phone: {settings.company_phone}</div>}
                {settings.company_email && <div style={{ color: '#555' }}>Email: {settings.company_email}</div>}
              </>
            ) : (
              <div style={{ color: '#999', fontStyle: 'italic' }}>
                Company information not set. Go to Settings to add your company details.
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ 
              marginBottom: '1rem',
              color: settings?.invoice_title_color || '#1a1a1a'
            }}>INVOICE</h2>
            <div><strong>Invoice #:</strong> {invoice.invoice_number}</div>
            <div><strong>Date:</strong> {formatLocalDate(invoice.date)}</div>
            {invoice.due_date && (
              <div><strong>Due Date:</strong> {formatLocalDate(invoice.due_date)}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {(() => {
                const displayStatus = getInvoiceDisplayStatus(invoice);
                return (
                  <>
                    <span className={`badge ${getStatusBadgeClass(displayStatus)}`}>
                      {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                    </span>
                    <select
                      className="btn btn-small invoice-status-select"
                      value={invoice.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value as InvoiceStatus;
                        try {
                          // If marking as paid and no payment date exists, set it to today
                          if (newStatus === 'paid' && !invoice.payment_date) {
                            await MockDataService.updateInvoiceStatus(
                              invoice.id!, 
                              newStatus, 
                              new Date().toISOString().split('T')[0]
                            );
                          } else {
                            await MockDataService.updateInvoiceStatus(invoice.id!, newStatus);
                          }
                          await loadInvoice(invoice.id!);
                        } catch (error) {
                          console.error('Error updating invoice status:', error);
                          alert('Error updating invoice status');
                        }
                      }}
                      style={{ marginLeft: '0.5rem' }}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="responsive-two-col" style={{ marginBottom: '2rem' }}>
          <div>
            <h3 style={{ color: settings?.invoice_header_color || '#1a1a1a' }}>Bill To:</h3>
            <p><strong>{customerInfo.name}</strong></p>
            {customerInfo.address && <p>{customerInfo.address}</p>}
            {customerInfo.phone && <p>Phone: {customerInfo.phone}</p>}
            {customerInfo.email && <p>Email: {customerInfo.email}</p>}
            {customerInfo.tax_id && <p>Tax ID: {customerInfo.tax_id}</p>}
          </div>

          {destination.destination_name && (
            <div>
              <h3 style={{ color: settings?.invoice_header_color || '#1a1a1a' }}>Destination:</h3>
              <p><strong>{destination.destination_name}</strong></p>
              {destination.destination_address && <p>{destination.destination_address}</p>}
            </div>
          )}
        </div>

        <table className="table" style={{ marginBottom: '2rem', tableLayout: 'auto' }}>
          <thead>
            <tr>
              {isCustomInvoice ? (
                <>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </>
              ) : (
                <>
                  <th>Description</th>
                  <th>Run Date</th>
                  <th>From/To</th>
                  <th>{getMilesLabel(invoice.items || [])}</th>
                  <th>{getRateLabel(invoice.items || [])}</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, index) => {
                if (isCustomInvoice) {
                  // Ensure description is displayed for custom invoices
                  const displayDescription = (item.description && item.description.trim()) 
                    ? item.description 
                    : 'Item';
                  
                  return (
                    <tr key={index}>
                      <td
                        data-label="Description"
                        style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
                      >
                        {displayDescription}
                      </td>
                      <td data-label="Amount" style={{ textAlign: 'right' }}>
                        ${item.amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                }

                // CRITICAL: Use stored destination names - invoice is useless without pickup/delivery info
                const fromName = getDestinationName(item.from_destination_id, item.from_destination_name);
                const toName = getDestinationName(item.to_destination_id, item.to_destination_name);
                // Format route with line breaks for better readability - use string with line breaks
                const route =
                  fromName || toName ? `From: ${fromName || 'N/A'}\nTo: ${toName || 'N/A'}` : '-';
                const runDateStr = item.run_date
                  ? formatLocalDate(item.run_date)
                  : '-';

                // Determine miles display - only show "mini run" if type is mini_run, otherwise show the value
                let milesDisplay = '-';
                if (item.type === 'mini_run') {
                  milesDisplay = 'mini run';
                } else if (item.miles != null) {
                  milesDisplay = item.miles.toFixed(1);
                }

                // Ensure description is displayed - handle empty strings properly
                const displayDescription = (item.description && item.description.trim()) 
                  ? item.description 
                  : (BILLING_TYPE_LABELS[item.type] || item.type || 'Service');

                return (
                  <tr key={index}>
                    <td
                      data-label="Description"
                      style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        maxWidth: '250px',
                      }}
                    >
                      {displayDescription}
                    </td>
                    <td data-label="Run Date" style={{ whiteSpace: 'nowrap' }}>
                      {runDateStr}
                    </td>
                    <td
                      data-label="From/To"
                      style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'pre-line',
                        maxWidth: '200px',
                        verticalAlign: 'top',
                      }}
                    >
                      {route}
                    </td>
                    <td data-label={getMilesLabel(invoice.items || [])} style={{ whiteSpace: 'nowrap' }}>
                      {milesDisplay}
                    </td>
                    <td data-label={getRateLabel(invoice.items || [])} style={{ whiteSpace: 'nowrap' }}>
                      ${item.rate.toFixed(2)}
                    </td>
                    <td data-label="Amount" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      ${item.amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isCustomInvoice ? 2 : 6} style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                  No items found for this invoice
                </td>
              </tr>
            )}
            {invoice.extras && invoice.extras.length > 0 && (
              <>
                <tr>
                  <td colSpan={isCustomInvoice ? 1 : 5} style={{ background: '#f8f9fa', fontWeight: 'bold' }}>
                    Extras
                  </td>
                  {isCustomInvoice && <td></td>}
                </tr>
                {invoice.extras.map((extra, index) => (
                  <tr key={`extra-${index}`}>
                    <td colSpan={isCustomInvoice ? 1 : 5}>{extra.description}</td>
                    <td style={{ textAlign: 'right' }}>${extra.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '2px solid #ddd', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
              <strong style={{ fontSize: '1.2rem' }}>Total:</strong>
              <strong style={{ fontSize: '1.2rem' }}>${invoice.total.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Payment Information - Moved from header to after total */}
        {(invoice.status === 'paid' || invoice.payment_type || invoice.payment_date || editingPaymentType || editingPaymentDate) && (
          <div style={{ 
            marginBottom: '2rem', 
            padding: '1.5rem', 
            backgroundColor: '#f0f9ff', 
            border: '2px solid #0ea5e9', 
            borderRadius: '8px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <h4 style={{ marginTop: '0', marginBottom: '1rem', color: '#0c4a6e' }}>Payment Information</h4>
            {editingPaymentType || !invoice.payment_type ? (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Payment Type:</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={paymentTypeInput}
                    onChange={(e) => setPaymentTypeInput(e.target.value)}
                    style={{ 
                      padding: '0.5rem', 
                      borderRadius: '4px', 
                      border: '1px solid #ccc',
                      fontSize: '0.9rem',
                      minWidth: '150px'
                    }}
                  >
                    <option value="">Select Payment Type</option>
                    <option value="check">Check</option>
                    <option value="ach">ACH</option>
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="wire">Wire Transfer</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpdatePaymentType}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    {invoice.payment_type ? 'Update' : 'Set Type'}
                  </button>
                  {invoice.payment_type && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingPaymentType(false);
                        setPaymentTypeInput(invoice.payment_type || '');
                      }}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <strong>Payment Type:</strong> {invoice.payment_type.charAt(0).toUpperCase() + invoice.payment_type.slice(1).replace('_', ' ')}
                  </div>
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => setEditingPaymentType(true)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
            {editingPaymentDate || !invoice.payment_date ? (
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Payment Date:</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="date"
                    value={paymentDateInput}
                    onChange={(e) => setPaymentDateInput(e.target.value)}
                    style={{ 
                      padding: '0.5rem', 
                      borderRadius: '4px', 
                      border: '1px solid #ccc',
                      fontSize: '0.9rem'
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleUpdatePaymentDate}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    {invoice.payment_date ? 'Update' : 'Set Date'}
                  </button>
                  {invoice.payment_date && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingPaymentDate(false);
                        setPaymentDateInput(invoice.payment_date || getTodayLocalDate());
                      }}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <strong>Payment Date:</strong> {formatLocalDate(invoice.payment_date)}
                  </div>
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => setEditingPaymentDate(true)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {invoice.notes && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
            <strong>Notes:</strong>
            <p style={{ marginTop: '0.5rem' }}>{invoice.notes}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Reminders</h3>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <label>Reminder Date</label>
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              style={{ width: '100%', padding: '0.75rem' }}
            />
          </div>
          <div style={{ flex: 2 }}>
            <label>Notes</label>
            <input
              type="text"
              value={reminderNotes}
              onChange={(e) => setReminderNotes(e.target.value)}
              placeholder="Reminder notes..."
              style={{ width: '100%', padding: '0.75rem' }}
            />
          </div>
          <button className="btn btn-primary" onClick={handleAddReminder}>
            Add Reminder
          </button>
        </div>

        {invoice.reminders && invoice.reminders.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoice.reminders.map((reminder) => (
                <tr key={reminder.id}>
                  <td>{formatLocalDate(reminder.reminder_date)}</td>
                  <td>{reminder.notes || '-'}</td>
                  <td>
                    {reminder.completed ? (
                      <span className="badge badge-paid">Completed</span>
                    ) : (
                      <span className="badge badge-sent">Pending</span>
                    )}
                  </td>
                  <td>
                    <div className="invoice-actions-bar">
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() =>
                          handleToggleReminder(reminder.id!, reminder.completed)
                        }
                      >
                        {reminder.completed ? 'Mark Pending' : 'Mark Complete'}
                      </button>
                      <button
                        className="btn btn-small btn-quiet-danger"
                        onClick={() => handleDeleteReminder(reminder.id!)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#7f8c8d' }}>No reminders set</p>
        )}
      </div>
    </>
  );
}

function getStatusBadgeClass(status: string): string {
  return `badge badge-${status}`;
}

