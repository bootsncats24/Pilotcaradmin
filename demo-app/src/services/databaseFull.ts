import {
  Customer,
  CustomerPhone,
  CustomerEmail,
  CustomerAddress,
  Destination,
  Invoice,
  InvoiceItem,
  InvoiceExtra,
  InvoiceReminder,
  InvoiceStatus,
  Settings,
  Category,
  Transaction,
  CategoryRule,
  CSVImport,
  CSVMapping,
  Receipt,
  Vehicle,
  MileageEntry,
  VehicleExpense,
  Reconciliation,
  BusinessProfile,
  Bill,
  BillPayment,
  BookedRun,
} from '../shared/types';
import { getTodayLocalDate } from '../utils/dateUtils';

// Helper function to wait for electronAPI to be available
function waitForElectronAPI(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      resolve();
      return;
    }
    
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max wait
    const interval = setInterval(() => {
      attempts++;
      if (typeof window !== 'undefined' && window.electronAPI) {
        clearInterval(interval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.error('electronAPI not available. Are you running in Electron?');
        reject(new Error('electronAPI not available after waiting. Make sure you are running the app in Electron, not in a regular browser.'));
      }
    }, 100);
  });
}

export class DatabaseService {
  static async query<T = any>(query: string, params: any[] = []): Promise<T> {
    await waitForElectronAPI();
    if (!window.electronAPI) {
      throw new Error('electronAPI is not available');
    }
    return window.electronAPI.dbQuery(query, params);
  }

  static async transaction(queries: Array<{ query: string; params: any[] }>): Promise<any[]> {
    await waitForElectronAPI();
    if (!window.electronAPI) {
      throw new Error('electronAPI is not available');
    }
    return window.electronAPI.dbTransaction(queries);
  }

  // Customer methods
  static async getCustomers(): Promise<Customer[]> {
    const customers = await this.query<Customer[]>('SELECT * FROM customers ORDER BY name');
    // Load phones, emails, and addresses for each customer
    for (const customer of customers) {
      if (customer.id) {
        customer.phones = await this.query<CustomerPhone[]>('SELECT * FROM customer_phones WHERE customer_id = ? ORDER BY is_primary DESC, id', [customer.id]);
        customer.emails = await this.query<CustomerEmail[]>('SELECT * FROM customer_emails WHERE customer_id = ? ORDER BY is_primary DESC, id', [customer.id]);
        customer.addresses = await this.query<CustomerAddress[]>('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_primary DESC, id', [customer.id]);
      }
    }
    return customers;
  }

  static async getCustomer(id: number): Promise<Customer | undefined> {
    const results = await this.query<Customer[]>('SELECT * FROM customers WHERE id = ?', [id]);
    const customer = results[0];
    if (customer) {
      customer.phones = await this.query<CustomerPhone[]>('SELECT * FROM customer_phones WHERE customer_id = ? ORDER BY is_primary DESC, id', [id]);
      customer.emails = await this.query<CustomerEmail[]>('SELECT * FROM customer_emails WHERE customer_id = ? ORDER BY is_primary DESC, id', [id]);
      customer.addresses = await this.query<CustomerAddress[]>('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_primary DESC, id', [id]);
    }
    return customer;
  }

  static async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO customers (name, address, phone, email, tax_id, billing_address, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customer.name, customer.address || null, customer.phone || null, customer.email || null,
       customer.tax_id || null, customer.billing_address || null, customer.notes || null]
    );
    const customerId = (result as any).lastInsertRowid;
    
    // Insert phones, emails, and addresses
    if (customer.phones && customer.phones.length > 0) {
      for (const phone of customer.phones) {
        await this.query(
          'INSERT INTO customer_phones (customer_id, phone, label, is_primary) VALUES (?, ?, ?, ?)',
          [customerId, phone.phone, phone.label || null, phone.is_primary ? 1 : 0]
        );
      }
    }
    if (customer.emails && customer.emails.length > 0) {
      for (const email of customer.emails) {
        await this.query(
          'INSERT INTO customer_emails (customer_id, email, label, is_primary) VALUES (?, ?, ?, ?)',
          [customerId, email.email, email.label || null, email.is_primary ? 1 : 0]
        );
      }
    }
    if (customer.addresses && customer.addresses.length > 0) {
      for (const address of customer.addresses) {
        await this.query(
          'INSERT INTO customer_addresses (customer_id, address, label, is_primary, is_billing) VALUES (?, ?, ?, ?, ?)',
          [customerId, address.address, address.label || null, address.is_primary ? 1 : 0, address.is_billing ? 1 : 0]
        );
      }
    }
    
    return customerId;
  }

  static async updateCustomer(id: number, customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    await this.query(
      `UPDATE customers SET name = ?, address = ?, phone = ?, email = ?, tax_id = ?, 
       billing_address = ?, notes = ? WHERE id = ?`,
      [customer.name, customer.address || null, customer.phone || null, customer.email || null,
       customer.tax_id || null, customer.billing_address || null, customer.notes || null, id]
    );
    
    // Delete existing phones, emails, and addresses
    await this.query('DELETE FROM customer_phones WHERE customer_id = ?', [id]);
    await this.query('DELETE FROM customer_emails WHERE customer_id = ?', [id]);
    await this.query('DELETE FROM customer_addresses WHERE customer_id = ?', [id]);
    
    // Insert new phones, emails, and addresses
    if (customer.phones && customer.phones.length > 0) {
      for (const phone of customer.phones) {
        await this.query(
          'INSERT INTO customer_phones (customer_id, phone, label, is_primary) VALUES (?, ?, ?, ?)',
          [id, phone.phone, phone.label || null, phone.is_primary ? 1 : 0]
        );
      }
    }
    if (customer.emails && customer.emails.length > 0) {
      for (const email of customer.emails) {
        await this.query(
          'INSERT INTO customer_emails (customer_id, email, label, is_primary) VALUES (?, ?, ?, ?)',
          [id, email.email, email.label || null, email.is_primary ? 1 : 0]
        );
      }
    }
    if (customer.addresses && customer.addresses.length > 0) {
      for (const address of customer.addresses) {
        await this.query(
          'INSERT INTO customer_addresses (customer_id, address, label, is_primary, is_billing) VALUES (?, ?, ?, ?, ?)',
          [id, address.address, address.label || null, address.is_primary ? 1 : 0, address.is_billing ? 1 : 0]
        );
      }
    }
  }

  static async deleteCustomer(id: number): Promise<void> {
    // Cascade delete will handle phones, emails, and addresses
    await this.query('DELETE FROM customers WHERE id = ?', [id]);
  }

  // Destination methods
  static async getDestinations(): Promise<Destination[]> {
    return this.query<Destination[]>('SELECT * FROM destinations ORDER BY name');
  }

  static async getDestination(id: number): Promise<Destination | undefined> {
    const results = await this.query<Destination[]>('SELECT * FROM destinations WHERE id = ?', [id]);
    return results[0];
  }

  static async createDestination(destination: Omit<Destination, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO destinations (name, address, notes)
       VALUES (?, ?, ?)`,
      [destination.name, destination.address || null, destination.notes || null]
    );
    return (result as any).lastInsertRowid;
  }

  static async updateDestination(id: number, destination: Omit<Destination, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    await this.query(
      `UPDATE destinations SET name = ?, address = ?, notes = ? WHERE id = ?`,
      [destination.name, destination.address || null, destination.notes || null, id]
    );
  }

  static async deleteDestination(id: number): Promise<void> {
    await this.query('DELETE FROM destinations WHERE id = ?', [id]);
  }

  // Invoice methods
  static async getInvoices(filters?: { 
    status?: string; 
    customerId?: number; 
    search?: string;
    startDate?: string;
    endDate?: string;
    month?: string; // Format: YYYY-MM
  }): Promise<Invoice[]> {
    // Run status check and fix before loading invoices (lazy check)
    try {
      // First fix any data inconsistencies (one-time normalization)
      await this.fixAndNormalizeInvoiceStatuses();
      // Then run the regular status check
      await this.checkAndUpdateInvoiceStatuses();
      // Clean up descriptions with From/To appended (one-time cleanup)
      await this.cleanupInvoiceItemDescriptions();
    } catch (error) {
      console.error('Error checking invoice statuses:', error);
      // Continue loading invoices even if status check fails
    }
    
    let query = `
      SELECT i.*, c.name as customer_name, c.address as customer_address, 
             c.phone as customer_phone, c.email as customer_email,
             d.name as destination_name, d.address as destination_address
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN destinations d ON i.destination_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.status) {
      if (filters.status === 'overdue') {
        // Overdue means: past due_date, not paid/cancelled, and no payment_date
        // Use case-insensitive comparison to handle any case variations
        const todayStr = new Date().toISOString().split('T')[0];
        query += ' AND i.due_date < ? AND LOWER(i.status) NOT IN (?, ?) AND (i.payment_date IS NULL OR i.payment_date = "")';
        params.push(todayStr, 'paid', 'cancelled');
      } else if (filters.status === 'unpaid') {
        // Unpaid means: NOT paid (by status) AND no payment_date, and not cancelled
        // This shows all invoices that are not paid in any way
        query += ` AND LOWER(i.status) != 'paid' 
                   AND LOWER(i.status) != 'cancelled'
                   AND (i.payment_date IS NULL OR i.payment_date = '')`;
      } else {
        // Use case-insensitive comparison for status filter
        query += ' AND LOWER(i.status) = ?';
        params.push(filters.status.toLowerCase());
      }
    }

    if (filters?.customerId) {
      query += ' AND i.customer_id = ?';
      params.push(filters.customerId);
    }

    if (filters?.search) {
      query += ' AND (i.invoice_number LIKE ? OR c.name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (filters?.startDate) {
      query += ' AND i.date >= ?';
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ' AND i.date <= ?';
      params.push(filters.endDate);
    }

    if (filters?.month) {
      // Filter by month (YYYY-MM format)
      query += ' AND i.date LIKE ?';
      params.push(`${filters.month}%`);
    }

    query += ' ORDER BY i.date DESC, i.invoice_number DESC';

    const invoices = await this.query<any[]>(query, params);
    
    // Load items, extras, and reminders for each invoice
    // Also normalize status values to lowercase to prevent case sensitivity issues
    for (const invoice of invoices) {
      // Normalize status to lowercase to ensure consistency
      if (invoice.status) {
        invoice.status = String(invoice.status).toLowerCase() as InvoiceStatus;
      }
      invoice.items = await this.getInvoiceItems(invoice.id);
      invoice.extras = await this.getInvoiceExtras(invoice.id);
      invoice.reminders = await this.getInvoiceReminders(invoice.id);
    }

    return invoices as Invoice[];
  }

  static async getInvoice(id: number): Promise<Invoice | undefined> {
    // Run cleanup on first invoice load to fix legacy data
    try {
      await this.cleanupInvoiceItemDescriptions();
    } catch (error) {
      console.error('Error cleaning up descriptions:', error);
      // Continue even if cleanup fails
    }
    
    const results = await this.query<Invoice[]>(
      `SELECT i.*, c.name as customer_name, c.address as customer_address, 
              c.phone as customer_phone, c.email as customer_email, c.tax_id as customer_tax_id,
              c.billing_address as customer_billing_address, c.notes as customer_notes,
              d.name as destination_name, d.address as destination_address, d.distance as destination_distance,
              d.notes as destination_notes
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       LEFT JOIN destinations d ON i.destination_id = d.id
       WHERE i.id = ?`,
      [id]
    );

    if (results.length === 0) return undefined;

    const invoice = results[0];
    // Normalize status to lowercase to ensure consistency
    if (invoice.status) {
      invoice.status = String(invoice.status).toLowerCase() as InvoiceStatus;
    }
    invoice.items = await this.getInvoiceItems(id);
    invoice.extras = await this.getInvoiceExtras(id);
    invoice.reminders = await this.getInvoiceReminders(id);

    // Load full customer object with phones, emails, and addresses arrays
    if (invoice.customer_id) {
      invoice.customer = await this.getCustomer(invoice.customer_id);
    }

    return invoice;
  }

  static async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    const items = await this.query<any[]>(`
      SELECT ii.*, 
             COALESCE(ii.from_destination_name, df.name) as from_destination_name,
             COALESCE(ii.to_destination_name, dt.name) as to_destination_name
      FROM invoice_items ii
      LEFT JOIN destinations df ON ii.from_destination_id = df.id
      LEFT JOIN destinations dt ON ii.to_destination_id = dt.id
      WHERE ii.invoice_id = ?
      ORDER BY ii.id
    `, [invoiceId]);
    
    // Clean up descriptions that have From/To appended (legacy data)
    const cleanedItems = items.map(item => {
      if (item.description && item.description.includes('(From:') && item.description.includes('To:')) {
        const match = item.description.match(/^(.+?)\s*\(From:.*?To:.*?\)/);
        if (match) {
          item.description = match[1].trim();
        }
      }
      return item;
    });
    
    return cleanedItems as InvoiceItem[];
  }

  /**
   * Clean up all invoice item descriptions that have From/To information appended.
   * This fixes legacy data where From/To was incorrectly stored in the description field.
   */
  static async cleanupInvoiceItemDescriptions(): Promise<number> {
    try {
      // Get all invoice items with descriptions containing "(From:" pattern
      const items = await this.query<any[]>(`
        SELECT id, description 
        FROM invoice_items 
        WHERE description LIKE '%(From:%' AND description LIKE '%To:%'
      `);
      
      let updatedCount = 0;
      
      for (const item of items) {
        if (item.description && item.description.includes('(From:') && item.description.includes('To:')) {
          // Extract clean description (remove the From/To part)
          const match = item.description.match(/^(.+?)\s*\(From:.*?To:.*?\)/);
          if (match) {
            const cleanDescription = match[1].trim();
            // Only update if we actually extracted a clean description
            if (cleanDescription && cleanDescription !== item.description) {
              await this.query(
                `UPDATE invoice_items SET description = ? WHERE id = ?`,
                [cleanDescription, item.id]
              );
              updatedCount++;
            }
          }
        }
      }
      
      console.log(`[Cleanup] Removed From/To from ${updatedCount} invoice item descriptions`);
      return updatedCount;
    } catch (error) {
      console.error('Error cleaning up invoice item descriptions:', error);
      return 0;
    }
  }

  static async getInvoiceExtras(invoiceId: number): Promise<InvoiceExtra[]> {
    return this.query<InvoiceExtra[]>('SELECT * FROM invoice_extras WHERE invoice_id = ?', [invoiceId]);
  }

  static async getInvoiceReminders(invoiceId: number): Promise<InvoiceReminder[]> {
    return this.query<InvoiceReminder[]>('SELECT * FROM invoice_reminders WHERE invoice_id = ? ORDER BY reminder_date', [invoiceId]);
  }

  static async generateInvoiceNumber(): Promise<string> {
    // Get settings to check if year should be included
    const settings = await this.getSettings();
    const includeYear = settings.invoice_number_include_year !== false; // Default to true for backward compatibility
    
    // Get starting invoice number from settings
    const startingNumber = settings.starting_invoice_number || 1;
    
    if (includeYear) {
      // Use year-based format: INV-YYYY-NNNN
      const today = getTodayLocalDate();
      const year = parseInt(today.split('-')[0]);
      
      // Get all invoice numbers for this year and find the maximum
      const result = await this.query<{ invoice_number: string }[]>(
        `SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY invoice_number DESC`,
        [`INV-${year}-%`]
      );
      
      let maxNum = 0;
      const invoices = Array.isArray(result) ? result : [];
      
      for (const invoice of invoices) {
        // Extract number from format INV-YYYY-NNNN
        const match = invoice.invoice_number?.match(/^INV-\d{4}-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
      
      // Use the higher of: (maxNum + 1) or startingNumber
      const nextNum = Math.max(maxNum + 1, startingNumber);
      return `INV-${year}-${String(nextNum).padStart(4, '0')}`;
    } else {
      // Use simple sequential format: INV-NNNN
      // Get all invoice numbers and find the maximum
      const result = await this.query<{ invoice_number: string }[]>(
        `SELECT invoice_number FROM invoices ORDER BY invoice_number DESC`
      );
      
      let maxNum = 0;
      const invoices = Array.isArray(result) ? result : [];
      
      for (const invoice of invoices) {
        // Extract number from format INV-NNNN
        const match = invoice.invoice_number?.match(/^INV-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
      
      // Use the higher of: (maxNum + 1) or startingNumber
      const nextNum = Math.max(maxNum + 1, startingNumber);
      return `INV-${String(nextNum).padStart(4, '0')}`;
    }
  }

  static async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: InvoiceItem[], extras: InvoiceExtra[]): Promise<number> {
    // Get device ID for sync tracking
    const deviceId = window.electronAPI?.syncGetDeviceId ? await window.electronAPI.syncGetDeviceId() : 'desktop';
    
    const queries = [
      {
        query: `INSERT INTO invoices (invoice_number, customer_id, destination_id, date, due_date, status, payment_type, payment_date, subtotal, tax, total, notes, last_modified, device_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
        params: [
          invoice.invoice_number,
          invoice.customer_id,
          invoice.destination_id || null,
          invoice.date,
          invoice.due_date || null,
          invoice.status,
          invoice.payment_type || null,
          invoice.payment_date || null,
          invoice.subtotal,
          invoice.tax,
          invoice.total,
          invoice.notes || null,
          deviceId
        ]
      }
    ];

    const result = await this.transaction(queries);
    const invoiceId = (result[0] as any).lastInsertRowid;

    // Insert items and extras
    if (items.length > 0 || extras.length > 0) {
      const itemQueries = items.map(item => {
        // Ensure description is never empty - use billing type as fallback
        const description = (item.description && item.description.trim()) || item.type || 'Service';
        return {
          query: `INSERT INTO invoice_items (invoice_id, run_date, type, description, quantity, rate, amount, from_destination_id, to_destination_id, from_destination_name, to_destination_name, miles, last_modified, device_id)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
          params: [
            invoiceId,
            item.run_date || null,
            item.type, 
            description, 
            item.quantity, 
            item.rate, 
            item.amount,
            item.from_destination_id || null,
            item.to_destination_id || null,
            item.from_destination_name || null,
            item.to_destination_name || null,
            item.miles || null,
            deviceId
          ]
        };
      });

      const extraQueries = extras.map(extra => ({
        query: `INSERT INTO invoice_extras (invoice_id, description, amount, last_modified, device_id)
                VALUES (?, ?, ?, datetime('now'), ?)`,
        params: [invoiceId, extra.description, extra.amount, deviceId]
      }));

      await this.transaction([...itemQueries, ...extraQueries]);
    }

    return invoiceId;
  }

  static async updateInvoice(id: number, invoice: Partial<Invoice>, items: InvoiceItem[], extras: InvoiceExtra[]): Promise<void> {
    // Get device ID for sync tracking
    const deviceId = window.electronAPI?.syncGetDeviceId ? await window.electronAPI.syncGetDeviceId() : 'desktop';
    
    const queries = [
      {
        query: `UPDATE invoices SET customer_id = ?, destination_id = ?, date = ?, due_date = ?, 
                status = ?, payment_type = ?, payment_date = ?, subtotal = ?, tax = ?, total = ?, notes = ?, last_modified = datetime('now'), device_id = ? WHERE id = ?`,
        params: [
          invoice.customer_id,
          invoice.destination_id || null,
          invoice.date,
          invoice.due_date || null,
          invoice.status,
          invoice.payment_type || null,
          invoice.payment_date || null,
          invoice.subtotal,
          invoice.tax,
          invoice.total,
          invoice.notes || null,
          deviceId,
          id
        ]
      },
      {
        query: 'DELETE FROM invoice_items WHERE invoice_id = ?',
        params: [id]
      },
      {
        query: 'DELETE FROM invoice_extras WHERE invoice_id = ?',
        params: [id]
      }
    ];

    await this.transaction(queries);

    const itemQueries = items.map(item => {
      // Ensure description is never empty - use billing type as fallback
      const description = (item.description && item.description.trim()) || item.type || 'Service';
      return {
        query: `INSERT INTO invoice_items (invoice_id, run_date, type, description, quantity, rate, amount, from_destination_id, to_destination_id, from_destination_name, to_destination_name, miles, last_modified, device_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
        params: [
          id,
          item.run_date || null,
          item.type, 
          description, 
          item.quantity, 
          item.rate, 
          item.amount,
          item.from_destination_id || null,
          item.to_destination_id || null,
          item.from_destination_name || null,
          item.to_destination_name || null,
          item.miles || null,
          deviceId
        ]
      };
    });

    const extraQueries = extras.map(extra => ({
      query: `INSERT INTO invoice_extras (invoice_id, description, amount, last_modified, device_id)
              VALUES (?, ?, ?, datetime('now'), ?)`,
      params: [id, extra.description, extra.amount, deviceId]
    }));

    await this.transaction([...itemQueries, ...extraQueries]);
    
    // Auto-mark as paid if payment_date is set
    if (invoice.payment_date) {
      await this.markInvoiceAsPaidIfPaymentDateSet(id);
    }
  }

  static async updateInvoiceStatus(id: number, status: string, paymentDate?: string, paymentType?: string): Promise<void> {
    const deviceId = window.electronAPI?.syncGetDeviceId ? await window.electronAPI.syncGetDeviceId() : 'desktop';
    
    // Normalize status to lowercase to prevent case sensitivity issues
    const normalizedStatus = status.toLowerCase();
    
    // CRITICAL: If marking as paid, ALWAYS set both status AND payment_date
    // This ensures the invoice stays paid even if automatic status checks run
    if (normalizedStatus === 'paid') {
      // If paymentDate is provided, use it; otherwise use today's date
      const finalPaymentDate = paymentDate || new Date().toISOString().split('T')[0];
      
      // Update status, payment_date, and payment_type
      // Setting both status='paid' AND payment_date ensures it can't be changed back to overdue
      await this.query(
        'UPDATE invoices SET status = ?, payment_date = ?, payment_type = ?, last_modified = datetime(\'now\'), device_id = ? WHERE id = ?',
        [normalizedStatus, finalPaymentDate, paymentType || null, deviceId, id]
      );
      
      console.log(`[updateInvoiceStatus] Marked invoice ${id} as paid with payment_date=${finalPaymentDate}`);
    } else {
      // Regular status update (not paid)
      await this.query(
        'UPDATE invoices SET status = ?, last_modified = datetime(\'now\'), device_id = ? WHERE id = ?',
        [normalizedStatus, deviceId, id]
      );
      
      // Auto-mark as paid if payment_date is set (only for non-paid status updates)
      if (paymentDate) {
        await this.markInvoiceAsPaidIfPaymentDateSet(id);
      }
    }
  }

  /**
   * Helper function to mark an invoice as paid if payment_date is set
   */
  static async markInvoiceAsPaidIfPaymentDateSet(invoiceId: number): Promise<void> {
    const deviceId = window.electronAPI?.syncGetDeviceId ? await window.electronAPI.syncGetDeviceId() : 'desktop';
    
    // Check if invoice has payment_date but status is not paid (case-insensitive check)
    const invoice = await this.query<any[]>(
      'SELECT id, payment_date, status FROM invoices WHERE id = ?',
      [invoiceId]
    );
    
    if (invoice && invoice.length > 0 && invoice[0].payment_date) {
      const currentStatus = String(invoice[0].status || '').toLowerCase();
      // Only update if status is not already paid or cancelled
      if (currentStatus !== 'paid' && currentStatus !== 'cancelled') {
        await this.query(
          'UPDATE invoices SET status = \'paid\', last_modified = datetime(\'now\'), device_id = ? WHERE id = ?',
          [deviceId, invoiceId]
        );
      }
    }
  }

  /**
   * Fix and normalize all invoice statuses in the database
   * - Normalizes all status values to lowercase
   * - Marks all invoices with payment_date as 'paid'
   * This is a one-time fix for existing data inconsistencies
   */
  static async fixAndNormalizeInvoiceStatuses(): Promise<number> {
    const deviceId = window.electronAPI?.syncGetDeviceId ? await window.electronAPI.syncGetDeviceId() : 'desktop';
    let updatedCount = 0;
    
    try {
      // First, get all invoices with non-lowercase status or status that needs fixing
      const invoicesToFix = await this.query<any[]>(
        `SELECT id, status, payment_date FROM invoices 
         WHERE status != LOWER(status) 
            OR (payment_date IS NOT NULL 
                AND payment_date != '' 
                AND LOWER(status) != 'paid' 
                AND LOWER(status) != 'cancelled')`
      );
      
      // Normalize each invoice status individually to ensure proper handling
      for (const invoice of invoicesToFix) {
        const currentStatus = String(invoice.status || '').toLowerCase();
        let newStatus = currentStatus;
        
        // If invoice has payment_date, it should be 'paid' (unless cancelled)
        if (invoice.payment_date && 
            invoice.payment_date !== '' && 
            invoice.payment_date !== 'null' && 
            invoice.payment_date !== 'undefined' &&
            currentStatus !== 'cancelled') {
          newStatus = 'paid';
        }
        
        // Only update if status changed
        if (newStatus !== currentStatus || String(invoice.status) !== newStatus) {
          await this.query(
            `UPDATE invoices 
             SET status = ?, last_modified = datetime('now'), device_id = ? 
             WHERE id = ?`,
            [newStatus, deviceId, invoice.id]
          );
          updatedCount++;
        }
      }
      
      return updatedCount;
    } catch (error) {
      console.error('Error fixing and normalizing invoice statuses:', error);
      return updatedCount;
    }
  }

  /**
   * Check and update invoice statuses automatically:
   * - Mark invoices as overdue if due_date has passed and status is 'sent'
   * - Mark invoices as paid if payment_date is set
   * Returns the count of invoices updated
   */
  static async checkAndUpdateInvoiceStatuses(): Promise<number> {
    const deviceId = window.electronAPI?.syncGetDeviceId ? await window.electronAPI.syncGetDeviceId() : 'desktop';
    let updatedCount = 0;
    
    try {
      // Mark invoices as overdue: due_date in past, status is 'sent', not already paid/cancelled, no payment_date
      // CRITICAL: Never mark invoices as overdue if they are already paid (by status OR payment_date)
      // Use LOWER() for case-insensitive status comparison
      const overdueResult = await this.query<{ changes: number }>(
        `UPDATE invoices 
         SET status = 'overdue', 
             last_modified = datetime('now'),
             device_id = ?
         WHERE due_date IS NOT NULL 
           AND due_date < date('now')
           AND LOWER(status) = 'sent'
           AND LOWER(status) != 'paid'
           AND LOWER(status) != 'cancelled'
           AND (payment_date IS NULL OR payment_date = '')
           AND id NOT IN (
             SELECT id FROM invoices 
             WHERE LOWER(status) = 'paid' 
             OR (payment_date IS NOT NULL AND payment_date != '')
           )`,
        [deviceId]
      );
      
      // Get the number of rows updated
      const overdueUpdated = (overdueResult as any)?.changes || 0;
      updatedCount += overdueUpdated;
      
      // Mark invoices as paid: payment_date is set, status is not cancelled
      // Use LOWER() for case-insensitive status comparison to handle any case variations
      const paidResult = await this.query<{ changes: number }>(
        `UPDATE invoices 
         SET status = 'paid',
             last_modified = datetime('now'),
             device_id = ?
         WHERE payment_date IS NOT NULL 
           AND payment_date != ''
           AND LOWER(status) != 'cancelled'
           AND LOWER(status) != 'paid'`,
        [deviceId]
      );
      
      const paidUpdated = (paidResult as any)?.changes || 0;
      updatedCount += paidUpdated;
      
      return updatedCount;
    } catch (error) {
      console.error('Error checking and updating invoice statuses:', error);
      return updatedCount;
    }
  }

  static async deleteInvoice(id: number): Promise<void> {
    await this.query('DELETE FROM invoices WHERE id = ?', [id]);
  }

  // Reminder methods
  static async createReminder(reminder: Omit<InvoiceReminder, 'id'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO invoice_reminders (invoice_id, reminder_date, notes, completed)
       VALUES (?, ?, ?, ?)`,
      [reminder.invoice_id, reminder.reminder_date, reminder.notes || null, reminder.completed ? 1 : 0]
    );
    return (result as any).lastInsertRowid;
  }

  static async updateReminder(id: number, reminder: Partial<InvoiceReminder>): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];

    if (reminder.reminder_date !== undefined) {
      updates.push('reminder_date = ?');
      params.push(reminder.reminder_date);
    }
    if (reminder.notes !== undefined) {
      updates.push('notes = ?');
      params.push(reminder.notes);
    }
    if (reminder.completed !== undefined) {
      updates.push('completed = ?');
      params.push(reminder.completed ? 1 : 0);
    }

    params.push(id);
    await this.query(`UPDATE invoice_reminders SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  static async deleteReminder(id: number): Promise<void> {
    await this.query('DELETE FROM invoice_reminders WHERE id = ?', [id]);
  }

  static async getUpcomingReminders(days: number = 7): Promise<InvoiceReminder[]> {
    const today = getTodayLocalDate();
    // Calculate future date as local date string (YYYY-MM-DD)
    const todayDate = new Date();
    todayDate.setDate(todayDate.getDate() + days);
    const year = todayDate.getFullYear();
    const month = (todayDate.getMonth() + 1).toString().padStart(2, '0');
    const day = todayDate.getDate().toString().padStart(2, '0');
    const futureDateStr = `${year}-${month}-${day}`;

    return this.query<InvoiceReminder[]>(
      `SELECT r.*, i.invoice_number, i.status, c.name as customer_name
       FROM invoice_reminders r
       JOIN invoices i ON r.invoice_id = i.id
       JOIN customers c ON i.customer_id = c.id
       WHERE r.completed = 0 AND r.reminder_date >= ? AND r.reminder_date <= ?
       ORDER BY r.reminder_date`,
      [today, futureDateStr]
    );
  }

  // Settings methods
  static async getSettings(): Promise<Settings> {
    const results = await this.query<Settings[]>('SELECT * FROM settings WHERE id = 1');
    if (results.length === 0 || !results[0]) {
      // Return default settings
      return {
        mile_rate: 0,
        mini_run_rate: 0,
        day_rate: 0,
        hourly_rate: 0,
        chase_pole_base_rate: 0,
        overnight_rate: 0,
        default_tax_rate: 0,
      };
    }
    const settings = results[0];
    // Convert INTEGER to boolean for invoice_number_include_year
    if (settings.invoice_number_include_year !== undefined) {
      const value = settings.invoice_number_include_year as any;
      settings.invoice_number_include_year = value === 1 || value === true;
    }
    // Ensure logo_width and logo_height are numbers (SQLite might return as strings)
    if (settings.logo_width !== undefined && settings.logo_width !== null) {
      settings.logo_width = Number(settings.logo_width);
    }
    if (settings.logo_height !== undefined && settings.logo_height !== null) {
      settings.logo_height = Number(settings.logo_height);
    }
    return settings;
  }

  static async updateSettings(settings: Partial<Settings>): Promise<void> {
    // Get device ID from main process
    const deviceId = window.electronAPI?.syncGetDeviceId ? await window.electronAPI.syncGetDeviceId() : 'desktop';
    
    // Base parameters for the UPDATE query
    const baseParams: any[] = [
      settings.mile_rate ?? 0,
      settings.mini_run_rate ?? 0,
      settings.day_rate ?? 0,
      settings.hourly_rate ?? 0,
      settings.chase_pole_base_rate ?? 0,
      settings.overnight_rate ?? 0,
      settings.default_tax_rate ?? 0,
      settings.irs_mileage_rate ?? 0.67,
      settings.company_name || null,
      settings.company_address || null,
      settings.company_phone || null,
      settings.company_email || null,
      settings.onboarding_completed ?? null,
      settings.intro_guide_completed ?? null,
      settings.starting_invoice_number ?? null,
      settings.invoice_number_include_year !== undefined ? (settings.invoice_number_include_year ? 1 : 0) : null,
      settings.company_logo || null,
      settings.logo_width !== undefined && settings.logo_width !== null ? Number(settings.logo_width) : null,
      settings.logo_height !== undefined && settings.logo_height !== null ? Number(settings.logo_height) : null,
      settings.invoice_header_color || null,
      settings.invoice_title_color || null,
    ];
    
    // Try to update with sync columns first
    try {
      const updateQuery = `UPDATE settings SET 
         mile_rate = ?, mini_run_rate = ?, day_rate = ?, hourly_rate = ?,
         chase_pole_base_rate = ?, overnight_rate = ?, default_tax_rate = ?,
         irs_mileage_rate = ?,
         company_name = ?, company_address = ?, company_phone = ?, company_email = ?,
         onboarding_completed = ?, intro_guide_completed = ?, starting_invoice_number = ?, invoice_number_include_year = ?,
         company_logo = ?, logo_width = ?, logo_height = ?, invoice_header_color = ?, invoice_title_color = ?,
         last_modified = datetime('now'), device_id = ?
         WHERE id = 1`;
      await this.query(updateQuery, [...baseParams, deviceId]);
      return; // Success!
    } catch (e: any) {
      const errorMsg = String(e || '');
      // If the error is about missing columns, try without them
      if (errorMsg.includes('no such column: last_modified') || 
          errorMsg.includes('no such column: device_id') ||
          errorMsg.includes('no such column: invoice_number_include_year')) {
        console.log('Some columns not found, updating without them and adding columns...');
        
        // Try to add the columns
        try {
          await this.query('ALTER TABLE settings ADD COLUMN last_modified DATETIME DEFAULT CURRENT_TIMESTAMP');
        } catch (alterError: any) {
          const alterMsg = String(alterError || '');
          if (!alterMsg.includes('duplicate column') && !alterMsg.includes('already exists')) {
            console.warn('Could not add last_modified column:', alterError);
          }
        }
        
        try {
          await this.query('ALTER TABLE settings ADD COLUMN device_id TEXT');
        } catch (alterError: any) {
          const alterMsg = String(alterError || '');
          if (!alterMsg.includes('duplicate column') && !alterMsg.includes('already exists')) {
            console.warn('Could not add device_id column:', alterError);
          }
        }
        
        try {
          await this.query('ALTER TABLE settings ADD COLUMN invoice_number_include_year INTEGER');
          // Set default value to 1 (true) for existing databases
          await this.query('UPDATE settings SET invoice_number_include_year = 1 WHERE invoice_number_include_year IS NULL');
        } catch (alterError: any) {
          const alterMsg = String(alterError || '');
          if (!alterMsg.includes('duplicate column') && !alterMsg.includes('already exists')) {
            console.warn('Could not add invoice_number_include_year column:', alterError);
          }
        }
        
        // Try the update again - this time it should work if columns were added
        // If columns still don't exist (ALTER failed), update without them
        try {
          const updateQueryWithSync = `UPDATE settings SET 
             mile_rate = ?, mini_run_rate = ?, day_rate = ?, hourly_rate = ?,
             chase_pole_base_rate = ?, overnight_rate = ?, default_tax_rate = ?,
             irs_mileage_rate = ?,
             company_name = ?, company_address = ?, company_phone = ?, company_email = ?,
             onboarding_completed = ?, intro_guide_completed = ?, starting_invoice_number = ?, invoice_number_include_year = ?,
             company_logo = ?, logo_width = ?, logo_height = ?, invoice_header_color = ?, invoice_title_color = ?,
             last_modified = datetime('now'), device_id = ?
             WHERE id = 1`;
          await this.query(updateQueryWithSync, [...baseParams, deviceId]);
          return; // Success with sync columns!
        } catch (retryError: any) {
          // If it still fails, update without the problematic columns
          const retryErrorMsg = String(retryError || '');
          console.log('Updating settings without problematic columns (they will be added by migration on next app start)');
          
          // Build query without invoice_number_include_year if it doesn't exist
          if (retryErrorMsg.includes('no such column: invoice_number_include_year')) {
            const updateQueryWithoutInvoiceYear = `UPDATE settings SET 
               mile_rate = ?, mini_run_rate = ?, day_rate = ?, hourly_rate = ?,
               chase_pole_base_rate = ?, overnight_rate = ?, default_tax_rate = ?,
               irs_mileage_rate = ?,
               company_name = ?, company_address = ?, company_phone = ?, company_email = ?,
               onboarding_completed = ?, intro_guide_completed = ?, starting_invoice_number = ?,
               company_logo = ?, logo_width = ?, logo_height = ?, invoice_header_color = ?, invoice_title_color = ?
               WHERE id = 1`;
            const paramsWithoutInvoiceYear = baseParams.slice(0, -4).concat(baseParams.slice(-3)); // Remove invoice_number_include_year but keep logo/colors
            await this.query(updateQueryWithoutInvoiceYear, paramsWithoutInvoiceYear);
          } else {
            const updateQueryWithoutSync = `UPDATE settings SET 
               mile_rate = ?, mini_run_rate = ?, day_rate = ?, hourly_rate = ?,
               chase_pole_base_rate = ?, overnight_rate = ?, default_tax_rate = ?,
               irs_mileage_rate = ?,
               company_name = ?, company_address = ?, company_phone = ?, company_email = ?,
               onboarding_completed = ?, intro_guide_completed = ?, starting_invoice_number = ?, invoice_number_include_year = ?,
               company_logo = ?, logo_width = ?, logo_height = ?, invoice_header_color = ?, invoice_title_color = ?
               WHERE id = 1`;
            await this.query(updateQueryWithoutSync, baseParams);
          }
          return; // Success without problematic columns
        }
      } else if (errorMsg.includes('no such column: invoice_number_include_year')) {
        // Handle case where only invoice_number_include_year is missing
        console.log('invoice_number_include_year column not found, adding it...');
        try {
          await this.query('ALTER TABLE settings ADD COLUMN invoice_number_include_year INTEGER');
          await this.query('UPDATE settings SET invoice_number_include_year = 1 WHERE invoice_number_include_year IS NULL');
          // Retry the original update
          const updateQuery = `UPDATE settings SET 
             mile_rate = ?, mini_run_rate = ?, day_rate = ?, hourly_rate = ?,
             chase_pole_base_rate = ?, overnight_rate = ?, default_tax_rate = ?,
             irs_mileage_rate = ?,
             company_name = ?, company_address = ?, company_phone = ?, company_email = ?,
             onboarding_completed = ?, intro_guide_completed = ?, starting_invoice_number = ?, invoice_number_include_year = ?,
             last_modified = datetime('now'), device_id = ?
             WHERE id = 1`;
          await this.query(updateQuery, [...baseParams, deviceId]);
          return; // Success!
        } catch (alterError: any) {
          const alterMsg = String(alterError || '');
          if (!alterMsg.includes('duplicate column') && !alterMsg.includes('already exists')) {
            console.warn('Could not add invoice_number_include_year column:', alterError);
            // Update without the column
            const updateQueryWithoutInvoiceYear = `UPDATE settings SET 
               mile_rate = ?, mini_run_rate = ?, day_rate = ?, hourly_rate = ?,
               chase_pole_base_rate = ?, overnight_rate = ?, default_tax_rate = ?,
               irs_mileage_rate = ?,
               company_name = ?, company_address = ?, company_phone = ?, company_email = ?,
               onboarding_completed = ?, intro_guide_completed = ?, starting_invoice_number = ?,
               last_modified = datetime('now'), device_id = ?
               WHERE id = 1`;
            const paramsWithoutInvoiceYear = baseParams.slice(0, -1); // Remove last param
            await this.query(updateQueryWithoutInvoiceYear, [...paramsWithoutInvoiceYear, deviceId]);
            return;
          }
        }
      } else {
        // Some other error - rethrow it
        throw e;
      }
    }
  }

  // ==================== Phase 2: Expense Tracking Methods ====================

  // Category methods
  static async getCategories(): Promise<Category[]> {
    return this.query<Category[]>('SELECT * FROM categories ORDER BY sort_order, name');
  }

  static async getCategory(id: number): Promise<Category | undefined> {
    const results = await this.query<Category[]>('SELECT * FROM categories WHERE id = ?', [id]);
    return results[0];
  }

  static async createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO categories (name, description, irs_category, parent_id, is_system, color, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        category.name,
        category.description || null,
        category.irs_category || null,
        category.parent_id || null,
        category.is_system ? 1 : 0,
        category.color || null,
        category.sort_order || 0,
      ]
    );
    return (result as any).lastInsertRowid;
  }

  static async updateCategory(id: number, category: Partial<Category>): Promise<void> {
    await this.query(
      `UPDATE categories SET name = ?, description = ?, irs_category = ?, 
       parent_id = ?, color = ?, sort_order = ? WHERE id = ?`,
      [
        category.name,
        category.description || null,
        category.irs_category || null,
        category.parent_id || null,
        category.color || null,
        category.sort_order || 0,
        id,
      ]
    );
  }

  static async deleteCategory(id: number): Promise<void> {
    await this.query('DELETE FROM categories WHERE id = ? AND is_system = 0', [id]);
  }

  // Transaction methods
  static async getTransactions(filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: number;
    vendor?: string;
    isBusiness?: boolean;
    search?: string;
  }): Promise<Transaction[]> {
    let query = `
      SELECT t.*, c.name as category_name, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.startDate) {
      query += ' AND t.date >= ?';
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += ' AND t.date <= ?';
      params.push(filters.endDate);
    }
    if (filters?.categoryId) {
      query += ' AND t.category_id = ?';
      params.push(filters.categoryId);
    }
    if (filters?.vendor) {
      query += ' AND t.vendor LIKE ?';
      params.push(`%${filters.vendor}%`);
    }
    if (filters?.isBusiness !== undefined) {
      query += ' AND t.is_business = ?';
      params.push(filters.isBusiness ? 1 : 0);
    }
    if (filters?.search) {
      query += ' AND (t.description LIKE ? OR t.vendor LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY t.date DESC, t.id DESC';

    return this.query<Transaction[]>(query, params);
  }

  static async getTransaction(id: number): Promise<Transaction | undefined> {
    const results = await this.query<Transaction[]>(
      `SELECT t.*, c.name as category_name, c.color as category_color
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [id]
    );
    return results[0];
  }

  static async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO transactions (date, description, amount, vendor, category_id, account_type, 
       is_business, notes, receipt_id, csv_import_id, is_locked)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.date,
        transaction.description,
        transaction.amount,
        transaction.vendor || null,
        transaction.category_id || null,
        transaction.account_type || null,
        transaction.is_business ? 1 : 0,
        transaction.notes || null,
        transaction.receipt_id || null,
        transaction.csv_import_id || null,
        transaction.is_locked ? 1 : 0,
      ]
    );
    return (result as any).lastInsertRowid;
  }

  static async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<void> {
    await this.query(
      `UPDATE transactions SET date = ?, description = ?, amount = ?, vendor = ?, 
       category_id = ?, account_type = ?, is_business = ?, notes = ?, receipt_id = ?
       WHERE id = ? AND is_locked = 0`,
      [
        transaction.date,
        transaction.description,
        transaction.amount,
        transaction.vendor || null,
        transaction.category_id || null,
        transaction.account_type || null,
        transaction.is_business ? 1 : 0,
        transaction.notes || null,
        transaction.receipt_id || null,
        id,
      ]
    );
  }

  static async deleteTransaction(id: number): Promise<void> {
    const result = await this.query<{ changes: number }>('DELETE FROM transactions WHERE id = ? AND is_locked = 0', [id]);
    // Check if any rows were actually deleted
    const changes = (result as any)?.changes ?? 0;
    if (changes === 0) {
      // Check if transaction exists and is locked
      const transaction = await this.query<Transaction[]>('SELECT id, is_locked FROM transactions WHERE id = ?', [id]);
      if (transaction && transaction.length > 0) {
        if (transaction[0].is_locked) {
          throw new Error('Transaction cannot be deleted because it is locked or reconciled.');
        }
      }
      throw new Error('Transaction could not be deleted. It may not exist or may be locked.');
    }
  }

  static async lockTransactions(ids: number[]): Promise<void> {
    const placeholders = ids.map(() => '?').join(',');
    await this.query(`UPDATE transactions SET is_locked = 1 WHERE id IN (${placeholders})`, ids);
  }

  static async unlockTransactions(ids: number[]): Promise<void> {
    const placeholders = ids.map(() => '?').join(',');
    await this.query(`UPDATE transactions SET is_locked = 0 WHERE id IN (${placeholders})`, ids);
  }

  // Category Rules methods
  static async getCategoryRules(): Promise<CategoryRule[]> {
    return this.query<CategoryRule[]>(
      `SELECT r.*, c.name as category_name 
       FROM category_rules r
       LEFT JOIN categories c ON r.category_id = c.id
       ORDER BY r.priority DESC, r.keyword`
    );
  }

  static async createCategoryRule(rule: Omit<CategoryRule, 'id' | 'created_at'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO category_rules (keyword, category_id, priority)
       VALUES (?, ?, ?)`,
      [rule.keyword, rule.category_id, rule.priority || 0]
    );
    return (result as any).lastInsertRowid;
  }

  static async deleteCategoryRule(id: number): Promise<void> {
    await this.query('DELETE FROM category_rules WHERE id = ?', [id]);
  }

  static async applyCategoryRules(transactionIds?: number[]): Promise<void> {
    const rules = await this.getCategoryRules();
    let transactions: Transaction[];

    if (transactionIds && transactionIds.length > 0) {
      const placeholders = transactionIds.map(() => '?').join(',');
      transactions = await this.query<Transaction[]>(
        `SELECT * FROM transactions WHERE id IN (${placeholders}) AND is_locked = 0`,
        transactionIds
      );
    } else {
      transactions = await this.query<Transaction[]>(
        'SELECT * FROM transactions WHERE category_id IS NULL AND is_locked = 0'
      );
    }

    for (const transaction of transactions) {
      for (const rule of rules) {
        const keyword = rule.keyword.toLowerCase();
        const description = (transaction.description || '').toLowerCase();
        const vendor = (transaction.vendor || '').toLowerCase();

        if (description.includes(keyword) || vendor.includes(keyword)) {
          await this.query('UPDATE transactions SET category_id = ? WHERE id = ?', [
            rule.category_id,
            transaction.id,
          ]);
          break; // Apply first matching rule
        }
      }
    }
  }

  // CSV Import methods
  static async createCSVImport(csvImport: Omit<CSVImport, 'id' | 'import_date'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO csv_imports (filename, bank_name, row_count, notes)
       VALUES (?, ?, ?, ?)`,
      [csvImport.filename, csvImport.bank_name || null, csvImport.row_count, csvImport.notes || null]
    );
    return (result as any).lastInsertRowid;
  }

  static async getCSVImports(): Promise<CSVImport[]> {
    return this.query<CSVImport[]>('SELECT * FROM csv_imports ORDER BY import_date DESC');
  }

  static async deleteCSVImport(id: number): Promise<void> {
    // Delete all transactions associated with this import
    await this.query('DELETE FROM transactions WHERE csv_import_id = ?', [id]);
    await this.query('DELETE FROM csv_imports WHERE id = ?', [id]);
  }

  // CSV Mapping methods
  static async getCSVMapping(bankName: string): Promise<CSVMapping | undefined> {
    const results = await this.query<CSVMapping[]>(
      'SELECT * FROM csv_mappings WHERE bank_name = ?',
      [bankName]
    );
    return results[0];
  }

  static async saveCSVMapping(mapping: Omit<CSVMapping, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    await this.query(
      `INSERT OR REPLACE INTO csv_mappings 
       (bank_name, date_column, description_column, amount_column, debit_column, credit_column, vendor_column)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        mapping.bank_name,
        mapping.date_column || null,
        mapping.description_column || null,
        mapping.amount_column || null,
        mapping.debit_column || null,
        mapping.credit_column || null,
        mapping.vendor_column || null,
      ]
    );
  }

  // Receipt methods
  static async getReceipts(filters?: { unmatched?: boolean }): Promise<Receipt[]> {
    // Use SELECT * like getReceipt() does - it works correctly there
    let query = 'SELECT * FROM receipts';
    const params: any[] = [];

    if (filters?.unmatched) {
      query += ' WHERE transaction_id IS NULL';
    }

    query += ' ORDER BY upload_date DESC';

    const receipts = await this.query<Receipt[]>(query, params);
    
    // Debug: Log RAW data first
    console.log('📋 DatabaseService.getReceipts RAW data:', receipts);
    if (receipts && receipts.length > 0) {
      console.log('📋 First receipt RAW:', JSON.stringify(receipts[0], null, 2));
    }
    
    // Convert null values to undefined for TypeScript consistency
    // Use explicit field normalization (same pattern as getReceipt() which works correctly)
    const normalizedReceipts = receipts.map(receipt => {
      let normalized: Receipt = {
        ...receipt,
        vendor: receipt.vendor !== null ? receipt.vendor : undefined,
        total: receipt.total !== null ? receipt.total : undefined,
        tax: receipt.tax !== null ? receipt.tax : undefined,
        receipt_date: receipt.receipt_date !== null ? receipt.receipt_date : undefined,
        file_type: receipt.file_type !== null ? receipt.file_type : undefined,
        ocr_data: receipt.ocr_data !== null ? receipt.ocr_data : undefined,
      };
      
      // If individual columns are NULL but ocr_data exists, extract from ocr_data
      if (receipt.ocr_data && (!normalized.vendor || !normalized.total || !normalized.receipt_date)) {
        try {
          const ocrData = typeof receipt.ocr_data === 'string' ? JSON.parse(receipt.ocr_data) : receipt.ocr_data;
          if (ocrData && typeof ocrData === 'object') {
            // Use ocr_data as fallback for missing fields
            if (!normalized.vendor && ocrData.vendor) {
              normalized.vendor = ocrData.vendor;
            }
            if (!normalized.total && ocrData.total !== undefined) {
              normalized.total = ocrData.total;
            }
            if (!normalized.tax && ocrData.tax !== undefined) {
              normalized.tax = ocrData.tax;
            }
            if (!normalized.receipt_date && ocrData.date) {
              normalized.receipt_date = ocrData.date;
            }
          }
        } catch (error) {
          // Silently fail - ocr_data might be malformed
        }
      }
      
      // Debug each receipt
      console.log(`  Receipt ${normalized.id} RAW vendor:`, receipt.vendor, 'type:', typeof receipt.vendor, 'has property:', 'vendor' in receipt);
      console.log(`  Receipt ${normalized.id} NORMALIZED vendor:`, normalized.vendor);
      
      return normalized;
    });
    
    // Debug: Log what we're getting back
    console.log('📋 DatabaseService.getReceipts retrieved', normalizedReceipts.length, 'receipts');
    normalizedReceipts.forEach((receipt, index) => {
      console.log(`  Receipt ${index + 1} (ID: ${receipt.id}):`);
      console.log(`    - vendor:`, receipt.vendor !== undefined && receipt.vendor !== null ? `"${receipt.vendor}"` : 'NULL/UNDEFINED');
      console.log(`    - total:`, receipt.total !== undefined && receipt.total !== null ? receipt.total : 'NULL/UNDEFINED');
      console.log(`    - receipt_date:`, receipt.receipt_date || 'NULL');
    });
    
    return normalizedReceipts;
  }

  static async getReceipt(id: number): Promise<Receipt | undefined> {
    const results = await this.query<Receipt[]>('SELECT * FROM receipts WHERE id = ?', [id]);
    const receipt = results[0];
    if (receipt) {
      // Convert null values to undefined for TypeScript consistency
      let normalizedReceipt: Receipt = {
        ...receipt,
        vendor: receipt.vendor !== null ? receipt.vendor : undefined,
        total: receipt.total !== null ? receipt.total : undefined,
        tax: receipt.tax !== null ? receipt.tax : undefined,
        receipt_date: receipt.receipt_date !== null ? receipt.receipt_date : undefined,
        file_type: receipt.file_type !== null ? receipt.file_type : undefined,
        ocr_data: receipt.ocr_data !== null ? receipt.ocr_data : undefined,
      };
      
      // If individual columns are NULL but ocr_data exists, extract from ocr_data
      if (receipt.ocr_data && (!normalizedReceipt.vendor || !normalizedReceipt.total || !normalizedReceipt.receipt_date)) {
        try {
          const ocrData = typeof receipt.ocr_data === 'string' ? JSON.parse(receipt.ocr_data) : receipt.ocr_data;
          if (ocrData && typeof ocrData === 'object') {
            console.log('📦 Extracting receipt data from ocr_data JSON');
            // Use ocr_data as fallback for missing fields
            if (!normalizedReceipt.vendor && ocrData.vendor) {
              normalizedReceipt.vendor = ocrData.vendor;
              console.log('  ✅ Extracted vendor from ocr_data:', ocrData.vendor);
            }
            if (!normalizedReceipt.total && ocrData.total !== undefined) {
              normalizedReceipt.total = ocrData.total;
              console.log('  ✅ Extracted total from ocr_data:', ocrData.total);
            }
            if (!normalizedReceipt.tax && ocrData.tax !== undefined) {
              normalizedReceipt.tax = ocrData.tax;
              console.log('  ✅ Extracted tax from ocr_data:', ocrData.tax);
            }
            if (!normalizedReceipt.receipt_date && ocrData.date) {
              normalizedReceipt.receipt_date = ocrData.date;
              console.log('  ✅ Extracted date from ocr_data:', ocrData.date);
            }
          }
        } catch (error) {
          console.error('Error parsing ocr_data:', error);
        }
      }
      
      console.log('📥 DatabaseService.getReceipt retrieved:');
      console.log('  - vendor:', normalizedReceipt.vendor !== undefined && normalizedReceipt.vendor !== null ? `"${normalizedReceipt.vendor}"` : 'NULL');
      console.log('  - total:', normalizedReceipt.total !== undefined && normalizedReceipt.total !== null ? normalizedReceipt.total : 'NULL');
      console.log('  - tax:', normalizedReceipt.tax !== undefined && normalizedReceipt.tax !== null ? normalizedReceipt.tax : 'NULL');
      console.log('  - receipt_date:', normalizedReceipt.receipt_date !== undefined && normalizedReceipt.receipt_date !== null ? `"${normalizedReceipt.receipt_date}"` : 'NULL');
      
      return normalizedReceipt;
    }
    return undefined;
  }

  static async createReceipt(receipt: Omit<Receipt, 'id' | 'upload_date'>): Promise<number> {
    // Log what we're about to save
    console.log('💾 DatabaseService.createReceipt called with:');
    console.log('  - vendor:', receipt.vendor !== undefined ? `"${receipt.vendor}"` : 'undefined');
    console.log('  - total:', receipt.total !== undefined ? receipt.total : 'undefined');
    console.log('  - tax:', receipt.tax !== undefined ? receipt.tax : 'undefined');
    console.log('  - receipt_date:', receipt.receipt_date !== undefined ? `"${receipt.receipt_date}"` : 'undefined');
    
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO receipts (transaction_id, filename, file_path, file_type, ocr_data, vendor, total, tax, receipt_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        receipt.transaction_id !== undefined ? receipt.transaction_id : null,
        receipt.filename,
        receipt.file_path,
        receipt.file_type !== undefined ? receipt.file_type : null,
        receipt.ocr_data ? (typeof receipt.ocr_data === 'string' ? receipt.ocr_data : JSON.stringify(receipt.ocr_data)) : null,
        receipt.vendor !== undefined && receipt.vendor !== null && receipt.vendor !== '' ? receipt.vendor : null,
        receipt.total !== undefined && receipt.total !== null ? receipt.total : null,
        receipt.tax !== undefined && receipt.tax !== null ? receipt.tax : null,
        receipt.receipt_date !== undefined && receipt.receipt_date !== null && receipt.receipt_date !== '' ? receipt.receipt_date : null,
      ]
    );
    
    const receiptId = (result as any).lastInsertRowid;
    console.log('✅ Receipt saved to database with ID:', receiptId);
    
    // Immediately verify what was saved
    const verifyReceipt = await this.query<Receipt[]>('SELECT * FROM receipts WHERE id = ?', [receiptId]);
    if (verifyReceipt && verifyReceipt.length > 0) {
      const saved = verifyReceipt[0];
      console.log('🔍 Database verification - what was actually saved:');
      console.log('  - vendor:', saved.vendor !== undefined && saved.vendor !== null ? `"${saved.vendor}"` : 'NULL');
      console.log('  - total:', saved.total !== undefined && saved.total !== null ? saved.total : 'NULL');
      console.log('  - tax:', saved.tax !== undefined && saved.tax !== null ? saved.tax : 'NULL');
      console.log('  - receipt_date:', saved.receipt_date !== undefined && saved.receipt_date !== null ? `"${saved.receipt_date}"` : 'NULL');
    }
    
    return receiptId;
  }

  static async updateReceipt(id: number, receipt: Partial<Receipt>): Promise<void> {
    await this.query(
      `UPDATE receipts SET transaction_id = ?, vendor = ?, total = ?, tax = ?, receipt_date = ?
       WHERE id = ?`,
      [
        receipt.transaction_id || null,
        receipt.vendor || null,
        receipt.total || null,
        receipt.tax || null,
        receipt.receipt_date || null,
        id,
      ]
    );
  }

  static async deleteReceipt(id: number): Promise<void> {
    await this.query('DELETE FROM receipts WHERE id = ?', [id]);
  }

  // Vehicle methods
  static async getVehicles(): Promise<Vehicle[]> {
    return this.query<Vehicle[]>('SELECT * FROM vehicles ORDER BY is_active DESC, name');
  }

  static async getVehicle(id: number): Promise<Vehicle | undefined> {
    const results = await this.query<Vehicle[]>('SELECT * FROM vehicles WHERE id = ?', [id]);
    return results[0];
  }

  static async createVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO vehicles (name, make, model, year, license_plate, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        vehicle.name,
        vehicle.make || null,
        vehicle.model || null,
        vehicle.year || null,
        vehicle.license_plate || null,
        vehicle.is_active ? 1 : 0,
      ]
    );
    return (result as any).lastInsertRowid;
  }

  static async updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<void> {
    await this.query(
      `UPDATE vehicles SET name = ?, make = ?, model = ?, year = ?, license_plate = ?, is_active = ?
       WHERE id = ?`,
      [
        vehicle.name,
        vehicle.make || null,
        vehicle.model || null,
        vehicle.year || null,
        vehicle.license_plate || null,
        vehicle.is_active ? 1 : 0,
        id,
      ]
    );
  }

  static async deleteVehicle(id: number): Promise<void> {
    await this.query('DELETE FROM vehicles WHERE id = ?', [id]);
  }

  // Mileage Entry methods
  static async getMileageEntries(filters?: {
    vehicleId?: number;
    startDate?: string;
    endDate?: string;
    isBusiness?: boolean;
  }): Promise<MileageEntry[]> {
    let query = `
      SELECT m.*, v.name as vehicle_name
      FROM mileage_entries m
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.vehicleId) {
      query += ' AND m.vehicle_id = ?';
      params.push(filters.vehicleId);
    }
    if (filters?.startDate) {
      query += ' AND m.date >= ?';
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += ' AND m.date <= ?';
      params.push(filters.endDate);
    }
    if (filters?.isBusiness !== undefined) {
      query += ' AND m.is_business = ?';
      params.push(filters.isBusiness ? 1 : 0);
    }

    query += ' ORDER BY m.date DESC, m.id DESC';

    return this.query<MileageEntry[]>(query, params);
  }

  static async createMileageEntry(entry: Omit<MileageEntry, 'id' | 'created_at'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO mileage_entries 
       (vehicle_id, date, start_odometer, end_odometer, miles, is_business, purpose, start_location, end_location, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.vehicle_id,
        entry.date,
        entry.start_odometer || null,
        entry.end_odometer || null,
        entry.miles,
        entry.is_business ? 1 : 0,
        entry.purpose || null,
        entry.start_location || null,
        entry.end_location || null,
        entry.notes || null,
      ]
    );
    return (result as any).lastInsertRowid;
  }

  static async updateMileageEntry(id: number, entry: Partial<MileageEntry>): Promise<void> {
    await this.query(
      `UPDATE mileage_entries SET date = ?, start_odometer = ?, end_odometer = ?, miles = ?, 
       is_business = ?, purpose = ?, start_location = ?, end_location = ?, notes = ?
       WHERE id = ?`,
      [
        entry.date,
        entry.start_odometer || null,
        entry.end_odometer || null,
        entry.miles,
        entry.is_business ? 1 : 0,
        entry.purpose || null,
        entry.start_location || null,
        entry.end_location || null,
        entry.notes || null,
        id,
      ]
    );
  }

  static async deleteMileageEntry(id: number): Promise<void> {
    await this.query('DELETE FROM mileage_entries WHERE id = ?', [id]);
  }

  static async getLastEndOdometerForVehicle(vehicleId: number): Promise<number | undefined> {
    const result = await this.query<{ end_odometer: number | null }[]>(
      `SELECT end_odometer 
       FROM mileage_entries 
       WHERE vehicle_id = ? AND end_odometer IS NOT NULL 
       ORDER BY date DESC, id DESC 
       LIMIT 1`,
      [vehicleId]
    );
    return result && result.length > 0 && result[0].end_odometer !== null 
      ? result[0].end_odometer 
      : undefined;
  }

  // Vehicle Expense methods
  static async getVehicleExpenses(vehicleId?: number): Promise<VehicleExpense[]> {
    let query = `
      SELECT ve.*, v.name as vehicle_name
      FROM vehicle_expenses ve
      LEFT JOIN vehicles v ON ve.vehicle_id = v.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (vehicleId) {
      query += ' AND ve.vehicle_id = ?';
      params.push(vehicleId);
    }

    query += ' ORDER BY ve.date DESC, ve.id DESC';

    return this.query<VehicleExpense[]>(query, params);
  }

  static async createVehicleExpense(expense: Omit<VehicleExpense, 'id' | 'created_at'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO vehicle_expenses (vehicle_id, date, type, amount, vendor, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [expense.vehicle_id, expense.date, expense.type, expense.amount, expense.vendor || null, expense.notes || null]
    );
    return (result as any).lastInsertRowid;
  }

  static async deleteVehicleExpense(id: number): Promise<void> {
    await this.query('DELETE FROM vehicle_expenses WHERE id = ?', [id]);
  }

  // Reconciliation methods
  static async getReconciliations(): Promise<Reconciliation[]> {
    return this.query<Reconciliation[]>('SELECT * FROM reconciliations ORDER BY reconciled_date DESC');
  }

  static async createReconciliation(reconciliation: Omit<Reconciliation, 'id' | 'reconciled_date'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO reconciliations 
       (account_name, period_start, period_end, starting_balance, ending_balance, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        reconciliation.account_name,
        reconciliation.period_start,
        reconciliation.period_end,
        reconciliation.starting_balance,
        reconciliation.ending_balance,
        reconciliation.status || 'pending',
        reconciliation.notes || null,
      ]
    );
    return (result as any).lastInsertRowid;
  }

  static async updateReconciliation(id: number, reconciliation: Partial<Reconciliation>): Promise<void> {
    await this.query(
      `UPDATE reconciliations SET status = ?, notes = ? WHERE id = ?`,
      [reconciliation.status, reconciliation.notes || null, id]
    );
  }

  // Business Profile methods
  static async getBusinessProfiles(): Promise<BusinessProfile[]> {
    return this.query<BusinessProfile[]>('SELECT * FROM business_profiles ORDER BY is_active DESC, name');
  }

  static async getBusinessProfile(id: number): Promise<BusinessProfile | undefined> {
    const results = await this.query<BusinessProfile[]>('SELECT * FROM business_profiles WHERE id = ?', [id]);
    return results[0];
  }

  static async createBusinessProfile(profile: Omit<BusinessProfile, 'id' | 'created_at'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO business_profiles (name, ein, address, tax_year_start, accounting_method, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        profile.name,
        profile.ein || null,
        profile.address || null,
        profile.tax_year_start || null,
        profile.accounting_method || 'cash',
        profile.is_active ? 1 : 0,
      ]
    );
    return (result as any).lastInsertRowid;
  }

  static async updateBusinessProfile(id: number, profile: Partial<BusinessProfile>): Promise<void> {
    await this.query(
      `UPDATE business_profiles SET name = ?, ein = ?, address = ?, tax_year_start = ?, 
       accounting_method = ?, is_active = ? WHERE id = ?`,
      [
        profile.name,
        profile.ein || null,
        profile.address || null,
        profile.tax_year_start || null,
        profile.accounting_method || 'cash',
        profile.is_active ? 1 : 0,
        id,
      ]
    );
  }

  static async deleteBusinessProfile(id: number): Promise<void> {
    await this.query('DELETE FROM business_profiles WHERE id = ?', [id]);
  }

  // Bill methods
  static async getBills(filters?: { status?: string; upcoming?: boolean }): Promise<Bill[]> {
    let query = `
      SELECT b.*, c.name as category_name, c.color as category_color
      FROM bills b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.status) {
      query += ' AND b.status = ?';
      params.push(filters.status);
    }

    if (filters?.upcoming) {
      const today = getTodayLocalDate();
      query += ' AND b.due_date >= ? AND b.status = ?';
      params.push(today, 'active');
    }

    query += ' ORDER BY b.due_date ASC, b.name ASC';

    const bills = await this.query<any[]>(query, params);
    
    // Load payment history for each bill
    for (const bill of bills) {
      bill.payment_history = await this.getBillPayments(bill.id);
    }

    return bills.map(b => ({
      ...b,
      is_recurring: b.is_recurring === 1,
      auto_pay: b.auto_pay === 1,
      category: b.category_id ? {
        id: b.category_id,
        name: b.category_name,
        color: b.category_color,
      } : undefined,
    })) as Bill[];
  }

  static async getBill(id: number): Promise<Bill | undefined> {
    const results = await this.query<any[]>(
      `SELECT b.*, c.name as category_name, c.color as category_color
       FROM bills b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ?`,
      [id]
    );

    if (results.length === 0) return undefined;

    const bill = results[0];
    bill.payment_history = await this.getBillPayments(id);

    return {
      ...bill,
      is_recurring: bill.is_recurring === 1,
      auto_pay: bill.auto_pay === 1,
      category: bill.category_id ? {
        id: bill.category_id,
        name: bill.category_name,
        color: bill.category_color,
      } : undefined,
    } as Bill;
  }

  static async createBill(bill: Omit<Bill, 'id' | 'created_at' | 'updated_at' | 'category' | 'payment_history'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO bills (name, description, amount, due_date, category_id, vendor, account_number, website, notes, 
        is_recurring, recurrence_type, recurrence_interval, next_due_date, last_paid_date, status, auto_pay)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bill.name,
        bill.description || null,
        bill.amount,
        bill.due_date,
        bill.category_id || null,
        bill.vendor || null,
        bill.account_number || null,
        bill.website || null,
        bill.notes || null,
        bill.is_recurring ? 1 : 0,
        bill.recurrence_type,
        bill.recurrence_interval || 1,
        bill.next_due_date || null,
        bill.last_paid_date || null,
        bill.status,
        bill.auto_pay ? 1 : 0,
      ]
    );
    return (result as any).lastInsertRowid;
  }

  static async updateBill(id: number, bill: Partial<Bill>): Promise<void> {
    await this.query(
      `UPDATE bills SET name = ?, description = ?, amount = ?, due_date = ?, category_id = ?, vendor = ?, 
       account_number = ?, website = ?, notes = ?, is_recurring = ?, recurrence_type = ?, recurrence_interval = ?, 
       next_due_date = ?, last_paid_date = ?, status = ?, auto_pay = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        bill.name,
        bill.description || null,
        bill.amount,
        bill.due_date,
        bill.category_id || null,
        bill.vendor || null,
        bill.account_number || null,
        bill.website || null,
        bill.notes || null,
        bill.is_recurring ? 1 : 0,
        bill.recurrence_type,
        bill.recurrence_interval || 1,
        bill.next_due_date || null,
        bill.last_paid_date || null,
        bill.status,
        bill.auto_pay ? 1 : 0,
        id,
      ]
    );
  }

  static async deleteBill(id: number): Promise<void> {
    await this.query('DELETE FROM bills WHERE id = ?', [id]);
  }

  static async getBillPayments(billId: number): Promise<BillPayment[]> {
    const payments = await this.query<any[]>(
      `SELECT bp.*, t.date as transaction_date, t.description as transaction_description
       FROM bill_payments bp
       LEFT JOIN transactions t ON bp.transaction_id = t.id
       WHERE bp.bill_id = ?
       ORDER BY bp.payment_date DESC`,
      [billId]
    );

    return payments.map(p => ({
      ...p,
      transaction: p.transaction_id ? {
        id: p.transaction_id,
        date: p.transaction_date,
        description: p.transaction_description,
      } : undefined,
    })) as BillPayment[];
  }

  static async createBillPayment(payment: Omit<BillPayment, 'id' | 'created_at' | 'transaction'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO bill_payments (bill_id, payment_date, amount, notes, transaction_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        payment.bill_id,
        payment.payment_date,
        payment.amount,
        payment.notes || null,
        payment.transaction_id || null,
      ]
    );
    const paymentId = (result as any).lastInsertRowid;

    // Update bill's last_paid_date and calculate next_due_date if recurring
    const bill = await this.getBill(payment.bill_id);
    if (bill && bill.is_recurring) {
      const nextDueDate = this.calculateNextDueDate(
        payment.payment_date,
        bill.recurrence_type,
        bill.recurrence_interval || 1
      );
      await this.updateBill(payment.bill_id, {
        last_paid_date: payment.payment_date,
        next_due_date: nextDueDate,
        due_date: nextDueDate,
      });
    } else if (bill) {
      await this.updateBill(payment.bill_id, {
        last_paid_date: payment.payment_date,
      });
    }

    return paymentId;
  }

  static calculateNextDueDate(currentDate: string, recurrenceType: string, interval: number = 1): string {
    const date = new Date(currentDate);
    
    switch (recurrenceType) {
      case 'daily':
        date.setDate(date.getDate() + interval);
        break;
      case 'weekly':
        date.setDate(date.getDate() + (7 * interval));
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + interval);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + interval);
        break;
      default:
        return currentDate;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static async markBillAsPaid(billId: number, paymentDate: string, amount: number, transactionId?: number): Promise<void> {
    // Create payment record
    await this.createBillPayment({
      bill_id: billId,
      payment_date: paymentDate,
      amount,
      transaction_id: transactionId,
    });

    // Update bill status if fully paid
    const bill = await this.getBill(billId);
    if (bill) {
      const totalPaid = (bill.payment_history || []).reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid >= bill.amount) {
        await this.updateBill(billId, { status: 'paid' });
      }
    }
  }

  // Booked Runs methods
  static async getBookedRuns(filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    customerId?: number;
  }): Promise<BookedRun[]> {
    let query = `
      SELECT br.*, c.name as customer_name, d.name as destination_name
      FROM booked_runs br
      LEFT JOIN customers c ON br.customer_id = c.id
      LEFT JOIN destinations d ON br.destination_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.startDate) {
      query += ' AND br.run_date >= ?';
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      query += ' AND br.run_date <= ?';
      params.push(filters.endDate);
    }
    if (filters?.status) {
      query += ' AND br.status = ?';
      params.push(filters.status);
    }
    if (filters?.customerId) {
      query += ' AND br.customer_id = ?';
      params.push(filters.customerId);
    }

    query += ' ORDER BY br.run_date ASC, br.id ASC';

    const results = await this.query<any[]>(query, params);

    return results.map(r => ({
      ...r,
      customer: r.customer_id ? {
        id: r.customer_id,
        name: r.customer_name,
      } : undefined,
      destination: r.destination_id ? {
        id: r.destination_id,
        name: r.destination_name,
      } : undefined,
    })) as BookedRun[];
  }

  static async getBookedRun(id: number): Promise<BookedRun | undefined> {
    const results = await this.query<any[]>(
      `SELECT br.*, c.name as customer_name, d.name as destination_name
       FROM booked_runs br
       LEFT JOIN customers c ON br.customer_id = c.id
       LEFT JOIN destinations d ON br.destination_id = d.id
       WHERE br.id = ?`,
      [id]
    );

    if (results.length === 0) return undefined;

    const r = results[0];
    return {
      ...r,
      customer: r.customer_id ? {
        id: r.customer_id,
        name: r.customer_name,
      } : undefined,
      destination: r.destination_id ? {
        id: r.destination_id,
        name: r.destination_name,
      } : undefined,
    } as BookedRun;
  }

  static async createBookedRun(run: Omit<BookedRun, 'id' | 'created_at' | 'updated_at' | 'customer' | 'destination'>): Promise<number> {
    const result = await this.query<{ lastInsertRowid: number }>(
      `INSERT INTO booked_runs (run_date, estimated_end_date, customer_id, destination_id, from_location, to_location, 
       description, estimated_miles, estimated_rate, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        run.run_date,
        run.estimated_end_date || null,
        run.customer_id || null,
        run.destination_id || null,
        run.from_location || null,
        run.to_location || null,
        run.description,
        run.estimated_miles || null,
        run.estimated_rate || null,
        run.status,
        run.notes || null,
      ]
    );
    return (result as any).lastInsertRowid;
  }

  static async updateBookedRun(id: number, run: Partial<BookedRun>): Promise<void> {
    await this.query(
      `UPDATE booked_runs SET run_date = ?, estimated_end_date = ?, customer_id = ?, destination_id = ?, from_location = ?, 
       to_location = ?, description = ?, estimated_miles = ?, estimated_rate = ?, status = ?, notes = ?, 
       updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        run.run_date,
        run.estimated_end_date || null,
        run.customer_id || null,
        run.destination_id || null,
        run.from_location || null,
        run.to_location || null,
        run.description,
        run.estimated_miles || null,
        run.estimated_rate || null,
        run.status,
        run.notes || null,
        id,
      ]
    );
  }

  static async deleteBookedRun(id: number): Promise<void> {
    await this.query('DELETE FROM booked_runs WHERE id = ?', [id]);
  }
}

