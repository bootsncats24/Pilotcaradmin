import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, InvoiceExtra, Customer, Destination, BillingType, InvoiceStatus, PaymentType } from '../shared/types';
import { MockDataService } from '../services/mockDataService';
import { formatLocalDate, getTodayLocalDate } from '../utils/dateUtils';

interface InvoiceFormProps {
  invoice?: Invoice;
  onSave: () => void;
  onCancel: () => void;
}

const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  mile: 'By Mile',
  mini_run: 'Mini Run',
  day_rate: 'Day Rate',
  hourly: 'Hourly',
  chase_pole: 'Chase/Pole',
};

const getRateLabel = (items: InvoiceItem[]): string => {
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

const getMilesLabel = (items: InvoiceItem[]): string => {
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

const getMilesLabelForItem = (type: BillingType): string => {
  if (type === 'hourly') return 'Hours';
  if (type === 'day_rate') return 'Days';
  return 'Miles';
};

export default function InvoiceForm({ invoice, onSave, onCancel }: InvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [formData, setFormData] = useState<{
    invoice_number: string;
    customer_id: number;
    date: string;
    due_date: string;
    status: InvoiceStatus;
    payment_type?: PaymentType;
    payment_date?: string;
    notes: string;
  }>({
    invoice_number: '',
    customer_id: 0,
    date: getTodayLocalDate(),
    due_date: '',
    status: 'draft',
    payment_type: undefined,
    payment_date: undefined,
    notes: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [extras, setExtras] = useState<InvoiceExtra[]>([]);
  const [overnightRate, setOvernightRate] = useState(0);
  const [overnightNights, setOvernightNights] = useState(0);
  const [itemAmountInputs, setItemAmountInputs] = useState<Record<number, string>>({});
  const [itemMilesInputs, setItemMilesInputs] = useState<Record<number, string>>({});
  const [itemRateInputs, setItemRateInputs] = useState<Record<number, string>>({});
  const [extraAmountInputs, setExtraAmountInputs] = useState<Record<number, string>>({});
  const [overnightRateInput, setOvernightRateInput] = useState<string>('0');
  const [overnightNightsInput, setOvernightNightsInput] = useState<string>('0');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerEmail, setManualCustomerEmail] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualDestinations, setManualDestinations] = useState<Record<number, { from: string; to: string }>>({});
  const [defaultRates, setDefaultRates] = useState({
    mile: 0,
    mini_run: 0,
    day_rate: 0,
    hourly: 0,
    chase_pole: 0,
    overnight: 0,
    tax: 0,
  });
  const [isCustomInvoice, setIsCustomInvoice] = useState(false);

  // Load customers, destinations, and settings once on mount

  useEffect(() => {
    loadData();
    loadDefaultRates();
  }, []);

  // Load invoice data when invoice ID changes
  useEffect(() => {
    if (invoice?.id) {
      loadInvoiceData();
    } else if (!invoice) {
      generateInvoiceNumber();
    }
  }, [invoice?.id]);

  const loadData = async () => {
    try {
      const [customersData, destinationsData] = await Promise.all([
        MockDataService.getCustomers(),
        MockDataService.getDestinations(),
      ]);
      setCustomers(customersData || []);
      setDestinations(destinationsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setCustomers([]);
      setDestinations([]);
    }
  };

  const loadDefaultRates = async () => {
    try {
      const settingsData = await MockDataService.getSettings();
      setSettings(settingsData);
      setDefaultRates({
        mile: settingsData.mile_rate || 0,
        mini_run: settingsData.mini_run_rate || 0,
        day_rate: settingsData.day_rate || 0,
        hourly: settingsData.hourly_rate || 0,
        chase_pole: settingsData.chase_pole_base_rate || 0,
        overnight: settingsData.overnight_rate || 0,
        tax: 0,
      });
      if (!invoice) {
        setOvernightRate(settingsData.overnight_rate || 0);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadInvoiceData = async () => {
    if (!invoice) return;
    
    setFormData({
      invoice_number: invoice.invoice_number,
      customer_id: invoice.customer_id,
      date: invoice.date,
      due_date: invoice.due_date || '',
      status: invoice.status,
      payment_type: invoice.payment_type,
      payment_date: invoice.payment_date,
      notes: invoice.notes || '',
    });

    if (invoice.items) {
      // Detect if this is a custom invoice (items have no run_date, from/to destinations, miles, or complex billing)
      const isCustom = invoice.items.every(item => 
        !item.run_date && 
        !item.from_destination_id && 
        !item.to_destination_id && 
        !item.miles &&
        item.rate === item.amount // In custom invoices, rate equals amount
      );
      setIsCustomInvoice(isCustom);

      if (isCustom) {
        // For custom invoices, just use items as-is
        setItems(invoice.items);
        // Initialize input states
        const amountInputs: Record<number, string> = {};
        invoice.items.forEach((item, idx) => {
          amountInputs[idx] = String(item.amount || '');
        });
        setItemAmountInputs(amountInputs);
      } else {
        // Clean up descriptions that might have manual destination info appended
        // IMPORTANT: Preserve ALL item properties including destination IDs
        const cleanedItems = invoice.items.map(item => {
          const cleanedItem = { ...item }; // Preserve all properties including from_destination_id, to_destination_id, etc.
          // If description has "(From: X, To: Y)" pattern, extract the original description
          if (cleanedItem.description && cleanedItem.description.includes('(From:') && cleanedItem.description.includes('To:')) {
            const match = cleanedItem.description.match(/^(.+?)\s*\(From:.*?To:.*?\)/);
            if (match) {
              cleanedItem.description = match[1].trim();
            }
          }
          // Ensure destination IDs are preserved (they should already be there, but make sure)
          return cleanedItem;
        });
        console.log('Loaded invoice items with destinations:', cleanedItems.map(item => ({
          id: item.id,
          from_id: item.from_destination_id,
          from_name: item.from_destination_name,
          to_id: item.to_destination_id,
          to_name: item.to_destination_name
        })));
        setItems(cleanedItems);
        
        // Initialize input states for items
        const amountInputs: Record<number, string> = {};
        const milesInputs: Record<number, string> = {};
        const rateInputs: Record<number, string> = {};
        cleanedItems.forEach((item, idx) => {
          amountInputs[idx] = String(item.amount || '');
          milesInputs[idx] = item.miles ? String(item.miles) : '';
          rateInputs[idx] = String(item.rate || '');
        });
        setItemAmountInputs(amountInputs);
        setItemMilesInputs(milesInputs);
        setItemRateInputs(rateInputs);
        
        // Load manual destinations if destination IDs are missing but names are stored
        // This handles cases where destinations were entered manually (no ID) but names were stored
        const manualDests: Record<number, { from: string; to: string }> = {};
        cleanedItems.forEach((item, index) => {
          // If no destination IDs but we have stored names, use those as manual destinations
          if (!item.from_destination_id && item.from_destination_name) {
            manualDests[index] = { ...manualDests[index], from: item.from_destination_name };
          }
          if (!item.to_destination_id && item.to_destination_name) {
            manualDests[index] = { ...manualDests[index], to: item.to_destination_name };
          }
        });
        if (Object.keys(manualDests).length > 0) {
          setManualDestinations(manualDests);
        }
      }
    }
    if (invoice.extras) {
      setExtras(invoice.extras);
      // Initialize extra amount inputs
      const extraAmounts: Record<number, string> = {};
      invoice.extras.forEach((extra, idx) => {
        extraAmounts[idx] = String(extra.amount || '');
      });
      setExtraAmountInputs(extraAmounts);
    }
    
    // Initialize overnight inputs
    if (invoice.extras && invoice.extras.length > 0) {
      const overnightExtra = invoice.extras.find(e => e.description?.includes('Overnight Rate'));
      if (overnightExtra) {
        const nightsMatch = overnightExtra.description?.match(/(\d+)\s+night/);
        if (nightsMatch) {
          setOvernightNights(parseInt(nightsMatch[1]));
          setOvernightNightsInput(nightsMatch[1]);
          setOvernightRate(overnightExtra.amount / parseInt(nightsMatch[1]));
          setOvernightRateInput(String(overnightExtra.amount / parseInt(nightsMatch[1])));
        }
      }
    }

    // Check for overnight rate in extras
    const overnightExtra = invoice.extras?.find(e => e.description.toLowerCase().includes('overnight'));
    if (overnightExtra) {
      setOvernightRate(overnightExtra.amount);
      setOvernightNights(1);
    }
  };

  const generateInvoiceNumber = async () => {
    try {
      const number = await MockDataService.generateInvoiceNumber();
      setFormData(prev => ({ ...prev, invoice_number: number }));
    } catch (error) {
      console.error('Error generating invoice number:', error);
    }
  };

  const addRun = () => {
    if (isCustomInvoice) {
      // For custom invoices, add a simple item with just description and price
      const newItem: InvoiceItem = {
        type: 'mile', // Default type, not really used for custom invoices
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      };
      setItems([...items, newItem]);
      setItemAmountInputs(prev => ({ ...prev, [items.length]: String(newItem.amount || '') }));
    } else {
      // Standard invoice run
      const newItem: InvoiceItem = {
        run_date: formData.date,
        type: 'mile',
        description: '',
        quantity: 1, // Always 1 for a run
        rate: defaultRates.mile,
        amount: defaultRates.mile,
        from_destination_id: undefined,
        to_destination_id: undefined,
        miles: undefined,
      };
      setItems([...items, newItem]);
      setItemAmountInputs(prev => ({ ...prev, [items.length]: String(newItem.amount || '') }));
      setItemMilesInputs(prev => ({ ...prev, [items.length]: '' }));
      setItemRateInputs(prev => ({ ...prev, [items.length]: String(newItem.rate || '') }));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const currentItem = updated[index];
    
    // Preserve description when updating other fields
    const preservedDescription = currentItem.description || '';
    
    updated[index] = { ...currentItem, [field]: value };
    
    // Restore description if it was accidentally cleared
    if (field !== 'description' && !updated[index].description && preservedDescription) {
      updated[index].description = preservedDescription;
    }
    
    const item = updated[index];
    
    if (isCustomInvoice) {
      // For custom invoices, amount and rate are the same (price)
      if (field === 'amount') {
        item.rate = value; // Keep rate in sync with amount
      } else if (field === 'rate') {
        item.amount = value; // Keep amount in sync with rate
      }
      item.quantity = 1;
    } else {
      // Auto-calculate based on billing type
      if (field === 'type') {
        // Update rate based on new type
        const rateMap: Record<BillingType, number> = {
          mile: defaultRates.mile,
          mini_run: defaultRates.mini_run,
          day_rate: defaultRates.day_rate,
          hourly: defaultRates.hourly,
          chase_pole: defaultRates.chase_pole,
        };
        const newType = value as BillingType;
        const newRate = rateMap[newType] || 0;
        
        // Update the item with new type and rate
        updated[index] = {
          ...item,
          type: newType,
          rate: newRate,
        };
        
        // Update the rate input field to show the new rate
        setItemRateInputs(prev => ({ ...prev, [index]: String(newRate) }));
        
        // Don't clear description when type changes
        if (!updated[index].description) {
          updated[index].description = preservedDescription || '';
        }
        
        // Re-get item reference after update
        const updatedItem = updated[index];
        
        // Calculate amount based on new type
        updatedItem.quantity = 1;
        if (updatedItem.type === 'mile') {
          // For mile, use miles × rate
          const miles = updatedItem.miles || 0;
          updatedItem.amount = miles * updatedItem.rate;
        } else if (updatedItem.type === 'mini_run') {
          // Fixed rate per run
          updatedItem.amount = updatedItem.rate;
        } else if (updatedItem.type === 'day_rate') {
          // For day rate, use miles as days × rate
          const days = updatedItem.miles || 0;
          updatedItem.amount = days * updatedItem.rate;
        } else if (updatedItem.type === 'hourly') {
          // For hourly, use miles as hours (or add hours field later)
          const hours = updatedItem.miles || 0;
          updatedItem.amount = hours * updatedItem.rate;
        } else if (updatedItem.type === 'chase_pole') {
          // Chase/pole based on miles
          const miles = updatedItem.miles || 0;
          updatedItem.amount = miles * updatedItem.rate;
        }
      } else {
        // Calculate amount based on type - quantity is always 1 for a run
        item.quantity = 1;
        if (field === 'rate' || field === 'miles') {
          if (item.type === 'mile') {
            // For mile, use miles × rate
            const miles = item.miles || 0;
            item.amount = miles * item.rate;
          } else if (item.type === 'mini_run') {
            // Fixed rate per run
            item.amount = item.rate;
          } else if (item.type === 'day_rate') {
            // For day rate, use miles as days × rate
            const days = item.miles || 0;
            item.amount = days * item.rate;
          } else if (item.type === 'hourly') {
            // For hourly, use miles as hours (or add hours field later)
            const hours = item.miles || 0;
            item.amount = hours * item.rate;
          } else if (item.type === 'chase_pole') {
            // Chase/pole based on miles
            const miles = item.miles || 0;
            item.amount = miles * item.rate;
          }
        }
      }
    }
    
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addExtra = () => {
    setExtras([...extras, { description: '', amount: 0 }]);
    setExtraAmountInputs(prev => ({ ...prev, [extras.length]: '0' }));
  };

  const updateExtra = (index: number, field: keyof InvoiceExtra, value: any) => {
    const updated = [...extras];
    updated[index] = { ...updated[index], [field]: value };
    setExtras(updated);
  };

  const removeExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  const addOvernight = () => {
    // Use input values to ensure we have the latest values, fallback to state
    const rate = parseFloat(overnightRateInput) || overnightRate || 0;
    const nights = parseInt(overnightNightsInput) || overnightNights || 0;
    
    if (rate > 0 && nights > 0) {
      const totalAmount = rate * nights;
      const newExtraIndex = extras.length;
      setExtras([...extras, {
        description: `Overnight Rate (${nights} night${nights > 1 ? 's' : ''})`,
        amount: totalAmount,
      }]);
      // Initialize the amount input for the new extra
      setExtraAmountInputs(prev => ({ ...prev, [newExtraIndex]: String(totalAmount) }));
      // Clear both state and input fields
      setOvernightRate(0);
      setOvernightNights(0);
      setOvernightRateInput('0');
      setOvernightNightsInput('0');
    }
  };

  const calculateTotals = () => {
    const itemsTotal = items.reduce((sum, item) => sum + item.amount, 0);
    const extrasTotal = extras.reduce((sum, extra) => sum + extra.amount, 0);
    const total = itemsTotal + extrasTotal;
    return { subtotal: total, tax: 0, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if customer is selected or manually entered
    if (!formData.customer_id && !manualCustomerName.trim()) {
      alert('Please select a customer or enter a customer name');
      return;
    }

    if (items.length === 0) {
      alert(isCustomInvoice ? 'Please add at least one item' : 'Please add at least one run');
      return;
    }

    // Validate payment information when status is paid
    if (formData.status === 'paid') {
      if (!formData.payment_date) {
        alert('Payment date is required when invoice status is Paid');
        return;
      }
      if (!formData.payment_type) {
        alert('Payment type is required when invoice status is Paid');
        return;
      }
    }

    let customerId = formData.customer_id;
    
    // If manual customer name is provided, create a customer on the fly
    if (!customerId && manualCustomerName.trim()) {
      try {
        customerId = await MockDataService.createCustomer({
          name: manualCustomerName.trim(),
          email: manualCustomerEmail.trim() || undefined,
          phone: manualCustomerPhone.trim() || undefined,
        });
      } catch (error) {
        console.error('Error creating customer:', error);
        alert('Failed to create customer. Please try again.');
        return;
      }
    }

    const { subtotal, tax, total } = calculateTotals();

    const invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'> = {
      invoice_number: formData.invoice_number,
      customer_id: customerId,
      destination_id: undefined, // No longer using single destination
      date: formData.date,
      due_date: formData.due_date || undefined,
      status: formData.status,
      payment_type: formData.payment_type,
      payment_date: formData.payment_date,
      subtotal,
      tax,
      total,
      notes: formData.notes,
    };

    // Prepare items for saving
    const itemsToSave = items.map((item, index) => {
      if (isCustomInvoice) {
        // For custom invoices, just ensure description and amount are set
        return {
          type: 'mile' as BillingType, // Default type
          description: (item.description || '').trim() || 'Item',
          quantity: 1,
          rate: item.amount, // Rate equals amount for custom invoices
          amount: item.amount,
        };
      } else {
        // Standard invoice processing
        // NEVER append From/To to description - that's what the From/To column is for!
        let description = item.description || '';
        
        // Ensure description is never empty - use billing type as fallback
        if (!description || description.trim() === '') {
          description = BILLING_TYPE_LABELS[item.type] || item.type;
        }
        
        // Handle manual destinations - if no ID but manual destination exists, store the name
        const manualDest = manualDestinations[index];
        const result: any = { 
          ...item, 
          description: description.trim(),
          // CRITICAL: Preserve destination IDs and names - don't lose them!
          from_destination_id: item.from_destination_id,
          to_destination_id: item.to_destination_id,
          from_destination_name: item.from_destination_name,
          to_destination_name: item.to_destination_name,
        };
        
        // If manual destination is entered but no ID, store the name in from_destination_name/to_destination_name
        if (manualDest) {
          if (manualDest.from && !item.from_destination_id) {
            result.from_destination_name = manualDest.from;
            result.from_destination_id = undefined;
          } else if (manualDest.from && item.from_destination_id) {
            // If both exist, prefer the ID (dropdown selection takes precedence)
            result.from_destination_name = undefined; // Clear manual name when ID is set
          }
          if (manualDest.to && !item.to_destination_id) {
            result.to_destination_name = manualDest.to;
            result.to_destination_id = undefined;
          } else if (manualDest.to && item.to_destination_id) {
            // If both exist, prefer the ID (dropdown selection takes precedence)
            result.to_destination_name = undefined; // Clear manual name when ID is set
          }
        }
        
        return result;
      }
    });

    setSaving(true);
    try {
      // For new invoices, ensure we have a valid invoice number
      if (!invoice?.id) {
        // If invoice number is empty or looks like it needs regeneration, generate a new one
        if (!invoiceData.invoice_number || invoiceData.invoice_number.trim() === '') {
          invoiceData.invoice_number = await MockDataService.generateInvoiceNumber();
        } else {
          // Check if the invoice number already exists (user might have manually entered a duplicate)
          const existingInvoices = await MockDataService.getInvoices({});
          const exists = existingInvoices.some(inv => inv.invoice_number === invoiceData.invoice_number);
          if (exists) {
            // Regenerate if duplicate
            invoiceData.invoice_number = await MockDataService.generateInvoiceNumber();
          }
        }
      }
      
      // Demo mode - show message instead of saving
      if (invoice?.id) {
        alert('Demo Mode: Invoice updates are not saved. This is a demonstration of the invoice editing interface.');
      } else {
        alert('Demo Mode: Invoice creation is not saved. This is a demonstration of the invoice creation interface.');
      }
      // Still call onSave to close the form and show the interface worked
      onSave();
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
      alert(`Error saving invoice: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  const getQuantityLabel = (type: BillingType): string => {
    switch (type) {
      case 'mile': return 'Miles';
      case 'hourly': return 'Hours';
      case 'day_rate': return 'Days';
      case 'mini_run': return 'Runs';
      case 'chase_pole': return 'Miles';
      default: return 'Quantity';
    }
  };

  return (
    <div>
      <div className="demo-banner" style={{ marginBottom: '1rem' }}>
        Demo Mode • Invoice changes are not saved
      </div>
      <div className="card">
        <h2>{invoice?.id ? 'Edit Invoice' : 'New Invoice'}</h2>
        <form onSubmit={handleSubmit}>
        {/* Invoice Type Toggle */}
        <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 'bold' }}>Invoice Type</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="invoiceType"
                value="standard"
                checked={!isCustomInvoice}
                onChange={() => {
                  setIsCustomInvoice(false);
                  // Clear items when switching modes
                  if (items.length > 0 && !invoice?.id) {
                    setItems([]);
                  }
                }}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
              />
              Standard Invoice
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="invoiceType"
                value="custom"
                checked={isCustomInvoice}
                onChange={() => {
                  setIsCustomInvoice(true);
                  // Clear items when switching modes
                  if (items.length > 0 && !invoice?.id) {
                    setItems([]);
                  }
                }}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
              />
              Custom Invoice
            </label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Invoice Number</label>
            <input
              type="text"
              value={formData.invoice_number}
              onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
              required
              style={{ pointerEvents: 'auto', cursor: 'text' }}
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Customer *</label>
            <select
              value={formData.customer_id}
              onChange={(e) => {
                const customerId = parseInt(e.target.value);
                setFormData(prev => ({ ...prev, customer_id: customerId }));
                if (customerId > 0) {
                  setManualCustomerName(''); // Clear manual entry when selecting from list
                  setManualCustomerEmail('');
                  setManualCustomerPhone('');
                }
              }}
              required
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            >
              <option value={0}>Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Or Enter Customer Name Manually</label>
            <input
              type="text"
              value={manualCustomerName}
              onChange={(e) => {
                setManualCustomerName(e.target.value);
                if (e.target.value) {
                  setFormData(prev => ({ ...prev, customer_id: 0 })); // Clear selection when typing manually
                }
              }}
              placeholder="Enter customer name"
              style={{ pointerEvents: 'auto', cursor: 'text' }}
            />
          </div>
          {manualCustomerName && (
            <>
              <div className="form-group">
                <label>Customer Email (Optional)</label>
                <input
                  type="email"
                  value={manualCustomerEmail}
                  onChange={(e) => setManualCustomerEmail(e.target.value)}
                  placeholder="Enter customer email"
                  style={{ pointerEvents: 'auto', cursor: 'text' }}
                />
              </div>
              <div className="form-group">
                <label>Customer Phone (Optional)</label>
                <input
                  type="tel"
                  value={manualCustomerPhone}
                  onChange={(e) => setManualCustomerPhone(e.target.value)}
                  placeholder="Enter customer phone"
                  style={{ pointerEvents: 'auto', cursor: 'text' }}
                />
              </div>
            </>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => {
                const newStatus = e.target.value as InvoiceStatus;
                setFormData(prev => ({ 
                  ...prev, 
                  status: newStatus,
                  // Clear payment fields if status is not paid
                  payment_type: newStatus === 'paid' ? prev.payment_type : undefined,
                  payment_date: newStatus === 'paid' ? prev.payment_date : undefined,
                }));
              }}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Payment Date</label>
            <input
              type="date"
              value={formData.payment_date || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value || undefined }))}
            />
          </div>

          {formData.status === 'paid' && (
            <div className="form-group">
              <label>Payment Type *</label>
              <select
                value={formData.payment_type || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_type: e.target.value as PaymentType || undefined }))}
                required
              >
                <option value="">Select Payment Type</option>
                <option value="check">Check</option>
                <option value="ach">ACH</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="wire">Wire Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>{isCustomInvoice ? 'Items' : 'Runs'}</h3>
            <button
              type="button"
              className="btn btn-primary"
              onClick={addRun}
            >
              + {isCustomInvoice ? 'Add Item' : 'Add Run'}
            </button>
          </div>

          {items.length === 0 ? (
            <p style={{ color: '#7f8c8d' }}>
              {isCustomInvoice 
                ? 'No items added yet. Click "Add Item" to add an item.' 
                : 'No runs added yet. Click "Add Run" to add a run.'}
            </p>
          ) : isCustomInvoice ? (
            // Custom Invoice: Simple table with Description and Price
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Enter description"
                        required
                        style={{ width: '100%', padding: '0.5rem', pointerEvents: 'auto', cursor: 'text' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={itemAmountInputs[index] || ''}
                        onChange={(e) => {
                          setItemAmountInputs(prev => ({ ...prev, [index]: e.target.value }));
                          const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          if (!isNaN(numValue)) {
                            updateItem(index, 'amount', numValue);
                          }
                        }}
                        onBlur={(e) => {
                          const numValue = parseFloat(e.target.value);
                          if (isNaN(numValue) || numValue < 0) {
                            setItemAmountInputs(prev => ({ ...prev, [index]: '0' }));
                            updateItem(index, 'amount', 0);
                          } else {
                            setItemAmountInputs(prev => ({ ...prev, [index]: String(numValue) }));
                            updateItem(index, 'amount', numValue);
                          }
                        }}
                        placeholder="0.00"
                        required
                        inputMode="decimal"
                        style={{ width: '100%', padding: '0.5rem', textAlign: 'right', pointerEvents: 'auto', cursor: 'text' }}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-small btn-danger"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            // Standard Invoice: Full run details
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {items.map((item, index) => (
                <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', background: '#f8f9fa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0 }}>Run {index + 1}</h4>
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Run Date</label>
                      <input
                        type="date"
                        value={item.run_date || formData.date}
                        onChange={(e) => updateItem(index, 'run_date', e.target.value)}
                        style={{ pointerEvents: 'auto', cursor: 'text' }}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>From Destination</label>
                      <select
                        value={item.from_destination_id ? Number(item.from_destination_id) : 0}
                        onChange={(e) => {
                          const destId = parseInt(e.target.value) || undefined;
                          updateItem(index, 'from_destination_id', destId);
                          // Also clear the stored name when selecting from dropdown
                          if (destId) {
                            updateItem(index, 'from_destination_name', undefined);
                            // Clear manual entry when selecting from list
                            setManualDestinations(prev => ({
                              ...prev,
                              [index]: { ...prev[index] || { from: '', to: '' }, from: '' }
                            }));
                          }
                        }}
                        style={{ 
                          pointerEvents: 'auto', 
                          cursor: 'pointer', 
                          zIndex: 9999, 
                          position: 'relative',
                          WebkitAppearance: 'menulist',
                          MozAppearance: 'menulist',
                          appearance: 'menulist'
                        }}
                      >
                        <option value={0}>Select From Destination</option>
                        {destinations.map(d => (
                          <option key={d.id} value={d.id || 0}>{d.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={manualDestinations[index]?.from || item.from_destination_name || ''}
                        onChange={(e) => {
                          setManualDestinations(prev => ({
                            ...prev,
                            [index]: { ...prev[index] || { from: '', to: '' }, from: e.target.value }
                          }));
                          if (e.target.value) {
                            updateItem(index, 'from_destination_id', undefined); // Clear selection when typing manually
                            updateItem(index, 'from_destination_name', e.target.value); // Store manual name
                          } else {
                            updateItem(index, 'from_destination_name', undefined); // Clear name when empty
                          }
                        }}
                        placeholder="Or enter manually"
                        style={{ marginTop: '0.5rem', pointerEvents: 'auto', cursor: 'text' }}
                      />
                    </div>

                    <div className="form-group">
                      <label>To Destination</label>
                      <select
                        value={item.to_destination_id ? Number(item.to_destination_id) : 0}
                        onChange={(e) => {
                          const destId = parseInt(e.target.value) || undefined;
                          updateItem(index, 'to_destination_id', destId);
                          // Also clear the stored name when selecting from dropdown
                          if (destId) {
                            updateItem(index, 'to_destination_name', undefined);
                            // Clear manual entry when selecting from list
                            setManualDestinations(prev => ({
                              ...prev,
                              [index]: { ...prev[index] || { from: '', to: '' }, to: '' }
                            }));
                          }
                        }}
                        style={{ 
                          pointerEvents: 'auto', 
                          cursor: 'pointer', 
                          zIndex: 9999, 
                          position: 'relative',
                          WebkitAppearance: 'menulist',
                          MozAppearance: 'menulist',
                          appearance: 'menulist'
                        }}
                      >
                        <option value={0}>Select To Destination</option>
                        {destinations.map(d => (
                          <option key={d.id} value={d.id || 0}>{d.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={manualDestinations[index]?.to || item.to_destination_name || ''}
                        onChange={(e) => {
                          setManualDestinations(prev => ({
                            ...prev,
                            [index]: { ...prev[index] || { from: '', to: '' }, to: e.target.value }
                          }));
                          if (e.target.value) {
                            updateItem(index, 'to_destination_id', undefined); // Clear selection when typing manually
                            updateItem(index, 'to_destination_name', e.target.value); // Store manual name
                          } else {
                            updateItem(index, 'to_destination_name', undefined); // Clear name when empty
                          }
                        }}
                        placeholder="Or enter manually"
                        style={{ marginTop: '0.5rem', pointerEvents: 'auto', cursor: 'text' }}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{getMilesLabelForItem(item.type)}</label>
                      <input
                        type="text"
                        value={itemMilesInputs[index] || ''}
                        onChange={(e) => {
                          setItemMilesInputs(prev => ({ ...prev, [index]: e.target.value }));
                          const numValue = e.target.value === '' ? undefined : parseFloat(e.target.value);
                          if (e.target.value === '' || !isNaN(numValue!)) {
                            updateItem(index, 'miles', numValue);
                          }
                        }}
                        onBlur={(e) => {
                          const numValue = e.target.value === '' ? undefined : parseFloat(e.target.value);
                          if (e.target.value !== '' && (isNaN(numValue!) || numValue! < 0)) {
                            setItemMilesInputs(prev => ({ ...prev, [index]: '' }));
                            updateItem(index, 'miles', undefined);
                          } else if (numValue !== undefined) {
                            setItemMilesInputs(prev => ({ ...prev, [index]: String(numValue) }));
                          }
                        }}
                        placeholder={item.type === 'hourly' ? 'Hours' : item.type === 'day_rate' ? 'Days' : 'Miles'}
                        inputMode="decimal"
                        style={{ pointerEvents: 'auto', cursor: 'text' }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Billing Type *</label>
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(index, 'type', e.target.value as BillingType)}
                        required
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      >
                        {Object.entries(BILLING_TYPE_LABELS).map(([type, label]) => (
                          <option key={type} value={type}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description (What you're piloting) *</label>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="e.g., Oversized Load - Wind Turbine Blade"
                      required
                      style={{ pointerEvents: 'auto', cursor: 'text' }}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        {item.type === 'mile' ? 'Mile Rate' :
                         item.type === 'hourly' ? 'Hourly Rate' :
                         item.type === 'day_rate' ? 'Day Rate' :
                         item.type === 'mini_run' ? 'Mini Run Rate' :
                         item.type === 'chase_pole' ? 'Chase/Pole Rate' :
                         'Rate'}
                      </label>
                      <input
                        type="text"
                        value={itemRateInputs[index] || ''}
                        onChange={(e) => {
                          setItemRateInputs(prev => ({ ...prev, [index]: e.target.value }));
                          const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          if (!isNaN(numValue)) {
                            updateItem(index, 'rate', numValue);
                          }
                        }}
                        onBlur={(e) => {
                          const numValue = parseFloat(e.target.value);
                          if (isNaN(numValue) || numValue < 0) {
                            setItemRateInputs(prev => ({ ...prev, [index]: '0' }));
                            updateItem(index, 'rate', 0);
                          } else {
                            setItemRateInputs(prev => ({ ...prev, [index]: String(numValue) }));
                            updateItem(index, 'rate', numValue);
                          }
                        }}
                        placeholder="0.00"
                        inputMode="decimal"
                        style={{ pointerEvents: 'auto', cursor: 'text' }}
                      />
                    </div>

                    <div className="form-group">
                      <label>Amount</label>
                      <div style={{ padding: '0.75rem', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', fontWeight: 'bold' }}>
                        ${item.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>Add-ons</h3>
          
          <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Overnight Rate</h4>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label>Rate per Night</label>
                <input
                  type="text"
                  value={overnightRateInput}
                  onChange={(e) => {
                    setOvernightRateInput(e.target.value);
                    const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    setOvernightRate(isNaN(numValue) ? 0 : numValue);
                  }}
                  onBlur={(e) => {
                    const numValue = parseFloat(e.target.value);
                    if (isNaN(numValue) || numValue < 0) {
                      setOvernightRateInput('0');
                      setOvernightRate(0);
                    } else {
                      setOvernightRateInput(String(numValue));
                      setOvernightRate(numValue);
                    }
                  }}
                  placeholder="0.00"
                  inputMode="decimal"
                  style={{ width: '100%', padding: '0.5rem', pointerEvents: 'auto', cursor: 'text' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Number of Nights</label>
                <input
                  type="text"
                  value={overnightNightsInput}
                  onChange={(e) => {
                    setOvernightNightsInput(e.target.value);
                    const numValue = e.target.value === '' ? 0 : parseInt(e.target.value);
                    setOvernightNights(isNaN(numValue) ? 0 : numValue);
                  }}
                  onBlur={(e) => {
                    const numValue = parseInt(e.target.value);
                    if (isNaN(numValue) || numValue < 0) {
                      setOvernightNightsInput('0');
                      setOvernightNights(0);
                    } else {
                      setOvernightNightsInput(String(numValue));
                      setOvernightNights(numValue);
                    }
                  }}
                  placeholder="0"
                  inputMode="numeric"
                  style={{ width: '100%', padding: '0.5rem', pointerEvents: 'auto', cursor: 'text' }}
                />
              </div>
              <div style={{ flex: '0 0 auto', minWidth: '120px', textAlign: 'center' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', color: '#666' }}>Total</label>
                <div style={{ 
                  padding: '0.5rem', 
                  background: '#f8f9fa', 
                  borderRadius: '4px', 
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  color: '#2c3e50'
                }}>
                  ${(overnightRate * overnightNights).toFixed(2)}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-small btn-primary"
                onClick={addOvernight}
                disabled={overnightRate <= 0 || overnightNights <= 0}
              >
                Add Overnight
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className="btn btn-small btn-secondary"
              onClick={addExtra}
            >
              Add Extra Item
            </button>
          </div>

          {extras.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {extras.map((extra, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={extra.description}
                        onChange={(e) => updateExtra(index, 'description', e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', pointerEvents: 'auto', cursor: 'text' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={extraAmountInputs[index] || ''}
                        onChange={(e) => {
                          setExtraAmountInputs(prev => ({ ...prev, [index]: e.target.value }));
                          const numValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          if (!isNaN(numValue)) {
                            updateExtra(index, 'amount', numValue);
                          }
                        }}
                        onBlur={(e) => {
                          const numValue = parseFloat(e.target.value);
                          if (isNaN(numValue) || numValue < 0) {
                            setExtraAmountInputs(prev => ({ ...prev, [index]: '0' }));
                            updateExtra(index, 'amount', 0);
                          } else {
                            setExtraAmountInputs(prev => ({ ...prev, [index]: String(numValue) }));
                            updateExtra(index, 'amount', numValue);
                          }
                        }}
                        placeholder="0.00"
                        inputMode="decimal"
                        style={{ width: '100%', padding: '0.5rem', pointerEvents: 'auto', cursor: 'text' }}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-small btn-danger"
                        onClick={() => removeExtra(index)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ marginBottom: '1.5rem', background: '#f8f9fa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '2px solid #ddd', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
            <strong>Total:</strong>
            <strong style={{ fontSize: '1.2rem' }}>${total.toFixed(2)}</strong>
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            style={{ pointerEvents: 'auto', cursor: 'text' }}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => setShowPreview(true)}
            disabled={saving || (!formData.customer_id && !manualCustomerName.trim()) || items.length === 0}
          >
            Preview
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </form>

      {showPreview && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            overflow: 'auto',
            padding: '2rem'
          }}
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="card" 
            id="invoice-print"
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              background: 'white',
              cursor: 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Invoice Preview</h2>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowPreview(false)}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h2>INVOICE</h2>
                {settings?.company_name && (
                  <div>
                    <strong>{settings.company_name}</strong>
                    {settings.company_address && <div>{settings.company_address}</div>}
                    {settings.company_phone && <div>Phone: {settings.company_phone}</div>}
                    {settings.company_email && <div>Email: {settings.company_email}</div>}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div><strong>Invoice #:</strong> {formData.invoice_number || 'N/A'}</div>
                <div><strong>Date:</strong> {formatLocalDate(formData.date)}</div>
                {formData.due_date && (
                  <div><strong>Due Date:</strong> {formatLocalDate(formData.due_date)}</div>
                )}
                <div>
                  <span className={`badge badge-${formData.status}`}>
                    {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <h3>Bill To:</h3>
                {(() => {
                  const customer = customers.find(c => c.id === formData.customer_id);
                  if (!customer && !manualCustomerName) return <p>Please select a customer</p>;
                  
                  // Show customer details but NOT the name (looks unprofessional)
                  // Get primary phone, email, and address from arrays if available, otherwise use direct fields
                  const primaryPhone = customer?.phones?.find(p => p.is_primary)?.phone || customer?.phone;
                  const primaryEmail = customer?.emails?.find(e => e.is_primary)?.email || customer?.email;
                  const primaryAddress = customer?.addresses?.find(a => a.is_primary)?.address || customer?.address;
                  const billingAddress = customer?.addresses?.find(a => a.is_billing)?.address || customer?.billing_address;
                  
                  return (
                    <>
                      {primaryAddress && primaryAddress.trim() && <p>{primaryAddress}</p>}
                      {primaryPhone && primaryPhone.trim() && <p>Phone: {primaryPhone}</p>}
                      {primaryEmail && primaryEmail.trim() && <p>Email: {primaryEmail}</p>}
                      {customer?.tax_id && customer.tax_id.trim() && <p>Tax ID: {customer.tax_id}</p>}
                      {billingAddress && billingAddress.trim() && billingAddress !== primaryAddress && <p>Billing Address: {billingAddress}</p>}
                    </>
                  );
                })()}
              </div>
            </div>

            <table className="table" style={{ marginBottom: '2rem' }}>
              <thead>
                <tr>
                  {isCustomInvoice ? (
                    <>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </>
                  ) : (
                    <>
                      <th>Run Date</th>
                      <th>Description</th>
                      <th>From/To</th>
                      <th>{getMilesLabel(items)}</th>
                      <th>{getRateLabel(items)}</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  if (isCustomInvoice) {
                    return (
                      <tr key={index}>
                        <td>{item.description || 'Item'}</td>
                        <td style={{ textAlign: 'right' }}>${item.amount.toFixed(2)}</td>
                      </tr>
                    );
                  }
                  
                  const fromDest = destinations.find(d => d.id === item.from_destination_id);
                  const toDest = destinations.find(d => d.id === item.to_destination_id);
                  const manualDest = manualDestinations[index];
                  const fromName = fromDest?.name || manualDest?.from || 'N/A';
                  const toName = toDest?.name || manualDest?.to || 'N/A';
                  const route = (fromDest || toDest || manualDest?.from || manualDest?.to)
                    ? `${fromName} → ${toName}`
                    : '-';
                  
                  return (
                    <tr key={index}>
                      <td>
                        {item.run_date || formData.date
                          ? formatLocalDate(item.run_date || formData.date, 'MMM dd, yyyy')
                          : '-'}
                      </td>
                      <td>{item.description || BILLING_TYPE_LABELS[item.type] || item.type}</td>
                      <td>{route}</td>
                      <td>{item.miles != null ? (item.miles < 100 ? 'mini run' : item.miles.toFixed(1)) : '-'}</td>
                      <td>${item.rate.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>${item.amount.toFixed(2)}</td>
                    </tr>
                  );
                })}
                {extras.length > 0 && (
                  <>
                    <tr>
                      <td colSpan={5} style={{ background: '#f8f9fa', fontWeight: 'bold' }}>
                        Extras
                      </td>
                    </tr>
                    {extras.map((extra, index) => (
                      <tr key={`extra-${index}`}>
                        <td colSpan={4}>{extra.description}</td>
                        <td></td>
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
                  <strong style={{ fontSize: '1.2rem' }}>${total.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {formData.notes && (
              <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
                <strong>Notes:</strong>
                <p style={{ marginTop: '0.5rem' }}>{formData.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

