// Mock Data Service - Replaces DatabaseService with mock data
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
  Settings,
  Category,
  Transaction,
  CategoryRule,
  Receipt,
  Vehicle,
  MileageEntry,
  Bill,
  BillPayment,
  BookedRun,
} from '../shared/types';
import { getTodayLocalDate } from '../utils/dateUtils';
import {
  vehicles as mockVehicles,
  customers as mockCustomers,
  destinations as mockDestinations,
  categories as mockCategories,
  runs as mockRuns,
  invoices as mockInvoices,
  mileage as mockMileage,
  expenses as mockExpenses,
  bills as mockBills,
  showDemoMessage,
} from '../data/mockData';

// ID mapping from string IDs to numeric IDs
const idMap: Record<string, number> = {};
let nextNumericId = 1;

function getNumericId(stringId: string): number {
  if (!idMap[stringId]) {
    idMap[stringId] = nextNumericId++;
  }
  return idMap[stringId];
}

// Initialize ID mappings
function initializeIdMaps() {
  mockVehicles.forEach(v => getNumericId(v.id));
  mockCustomers.forEach(c => getNumericId(c.id));
  mockDestinations.forEach(d => getNumericId(d.id));
  mockRuns.forEach(r => getNumericId(r.id));
  mockInvoices.forEach(i => getNumericId(i.id));
  mockMileage.forEach(m => getNumericId(m.id));
  mockExpenses.forEach(e => getNumericId(e.id));
  mockBills.forEach(b => getNumericId(b.id));
}

// Initialize on module load
initializeIdMaps();

export class MockDataService {
  static async query<T = any>(queryStr: string, params: any[] = []): Promise<T> {
    // Mock query - return empty array for most queries
    return [] as T;
  }

  static async transaction(queries: Array<{ query: string; params: any[] }>): Promise<any[]> {
    showDemoMessage();
    return [];
  }

  // ==================== Customer Methods ====================

  static async getCustomers(): Promise<Customer[]> {
    return mockCustomers.map(c => ({
      id: getNumericId(c.id),
      name: c.name,
      address: undefined,
      phone: (c as any).phone || undefined,
      email: (c as any).email || undefined,
      tax_id: undefined,
      billing_address: undefined,
      notes: undefined,
      phones: (c as any).phone ? [{ customer_id: getNumericId(c.id), phone: (c as any).phone, label: 'Primary', is_primary: true }] : [],
      emails: (c as any).email ? [{ customer_id: getNumericId(c.id), email: (c as any).email, label: 'Primary', is_primary: true }] : [],
      addresses: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  static async getCustomer(id: number): Promise<Customer | undefined> {
    const customers = await this.getCustomers();
    return customers.find(c => c.id === id);
  }

  static async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    showDemoMessage();
    return 0;
  }

  static async updateCustomer(id: number, customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    showDemoMessage();
  }

  static async deleteCustomer(id: number): Promise<void> {
    showDemoMessage();
  }

  // ==================== Destination Methods ====================

  static async getDestinations(): Promise<Destination[]> {
    return mockDestinations.map(d => ({
      id: getNumericId(d.id),
      name: d.name,
      address: d.address,
      distance: d.distance,
      notes: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  static async getDestination(id: number): Promise<Destination | undefined> {
    const destinations = await this.getDestinations();
    return destinations.find(d => d.id === id);
  }

  static async createDestination(destination: Omit<Destination, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    showDemoMessage();
    return 0;
  }

  static async updateDestination(id: number, destination: Omit<Destination, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    showDemoMessage();
  }

  static async deleteDestination(id: number): Promise<void> {
    showDemoMessage();
  }

  // ==================== Invoice Methods ====================

  static async getInvoices(filters?: { status?: string; customerId?: number; startDate?: string; endDate?: string }): Promise<Invoice[]> {
    let result = mockInvoices.map((inv, idx) => {
      const run = mockRuns.find(r => r.id === inv.runId);
      const customer = mockCustomers.find(c => c.name === inv.customerName || c.id === run?.customerId);
      const customerId = customer ? getNumericId(customer.id) : 1;
      
      // Map status
      let status: Invoice['status'] = 'sent';
      if (inv.status === 'Paid') status = 'paid';
      else if (inv.status === 'Overdue') status = 'overdue';
      else if (inv.status === 'Sent') status = 'sent';
      else if (inv.status === 'Draft') status = 'draft';
      else if (inv.status === 'Cancelled') status = 'cancelled';

      // Calculate due date (typically 30 days from issue date)
      const issueDate = new Date(inv.issueDate || inv.runDate);
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 30);

      return {
        id: getNumericId(inv.id),
        invoice_number: (inv as any).invoiceNumber || inv.id,
        customer_id: customerId,
        destination_id: undefined,
        date: inv.issueDate || inv.runDate,
        due_date: dueDate.toISOString().split('T')[0],
        status: status,
        payment_type: inv.status === 'Paid' ? 'check' as const : undefined,
        payment_date: inv.paidDate,
        subtotal: inv.total * 0.95, // Approximate
        tax: inv.total * 0.05, // Approximate
        total: inv.total,
        notes: undefined,
        items: this.getInvoiceItemsForInvoice(inv.id),
        extras: [],
        reminders: [],
        customer: customer ? {
          id: getNumericId(customer.id),
          name: customer.name,
        } : undefined,
        created_at: inv.issueDate || inv.runDate,
        updated_at: inv.issueDate || inv.runDate,
      } as Invoice;
    });

    // Apply filters
    if (filters?.status) {
      result = result.filter(inv => inv.status === filters.status);
    }
    if (filters?.customerId) {
      result = result.filter(inv => inv.customer_id === filters.customerId);
    }
    if (filters?.startDate) {
      result = result.filter(inv => inv.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      result = result.filter(inv => inv.date <= filters.endDate!);
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getInvoice(id: number): Promise<Invoice | undefined> {
    const invoices = await this.getInvoices();
    return invoices.find(inv => inv.id === id);
  }

  static getInvoiceItemsForInvoice(invoiceId: string): InvoiceItem[] {
    const invoice = mockInvoices.find(i => i.id === invoiceId);
    if (!invoice) return [];
    
    const run = mockRuns.find(r => r.id === invoice.runId);
    if (!run) return [];

    // Create invoice items based on billing type from invoice data
    const items: InvoiceItem[] = [];
    const inv = invoice as any;
    const runDate = inv.runDate || run.startDate;
    
    if (inv.billingType === 'By Mile' || run.rateType === 'By Mile') {
      const loadedMiles = inv.loadedMiles || run.loadedMiles || 100;
      const ratePerMile = inv.ratePerMile || run.ratePerMile || 2.50; // Default to $2.50 (within $2.40–$2.75 range)
      const loadedTotal = inv.loadedTotal || (loadedMiles * ratePerMile);
      const pickup = inv.pickup || run.pickup || '';
      const delivery = inv.delivery || run.delivery || '';
      
      items.push({
        id: 1,
        invoice_id: getNumericId(invoiceId),
        run_date: runDate,
        type: 'mile' as const,
        description: `Pilot car services - ${loadedMiles} loaded miles @ $${ratePerMile.toFixed(2)}/mile`,
        quantity: loadedMiles,
        rate: ratePerMile,
        amount: loadedTotal,
        miles: loadedMiles,
        from_destination_name: pickup,
        to_destination_name: delivery,
      });

      // Add overnight if applicable
      if (inv.overnight && inv.overnight > 0) {
        items.push({
          id: 2,
          invoice_id: getNumericId(invoiceId),
          run_date: runDate,
          type: 'other' as const,
          description: 'Overnight fee',
          quantity: 1,
          rate: inv.overnight,
          amount: inv.overnight,
        });
      }

      // Add extras if applicable
      if (inv.extras && inv.extras > 0) {
        items.push({
          id: 3,
          invoice_id: getNumericId(invoiceId),
          run_date: runDate,
          type: 'other' as const,
          description: 'Additional services',
          quantity: 1,
          rate: inv.extras,
          amount: inv.extras,
        });
      }
    } else if (inv.billingType === 'Mini Run' || run.rateType === 'Mini Run') {
      const flatRate = inv.flatRate || 250;
      const pickup = inv.pickup || run.pickup || '';
      const delivery = inv.delivery || run.delivery || '';
      items.push({
        id: 1,
        invoice_id: getNumericId(invoiceId),
        run_date: runDate,
        type: 'mini_run' as const,
        description: `Mini run pilot car services - ${pickup} to ${delivery}`,
        quantity: 1,
        rate: flatRate,
        amount: flatRate,
        from_destination_name: pickup,
        to_destination_name: delivery,
      });
    } else if (inv.billingType === 'Day Rate' || run.rateType === 'Day Rate') {
      const dayRate = inv.dayRate || run.dayRate || 850;
      const pickup = inv.pickup || run.pickup || '';
      const delivery = inv.delivery || run.delivery || '';
      items.push({
        id: 1,
        invoice_id: getNumericId(invoiceId),
        run_date: runDate,
        type: 'day_rate' as const,
        description: 'Day rate pilot car services',
        quantity: 1,
        rate: dayRate,
        amount: dayRate,
        from_destination_name: pickup,
        to_destination_name: delivery,
      });
    } else if (run.rateType === 'Hourly') {
      items.push({
        id: 1,
        invoice_id: getNumericId(invoiceId),
        run_date: runDate,
        type: 'hourly' as const,
        description: 'Hourly pilot car services',
        quantity: 6, // Default 6 hours
        rate: 90,
        amount: 540,
      });
    } else if (run.rateType === 'Chase/Pole') {
      items.push({
        id: 1,
        invoice_id: getNumericId(invoiceId),
        run_date: runDate,
        type: 'chase_pole' as const,
        description: 'Chase/Pole pilot car services',
        quantity: 1,
        rate: 350, // Realistic rate from $300-$400
        amount: 350,
      });
    }

    return items;
  }

  static async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    const invoice = mockInvoices.find(i => getNumericId(i.id) === invoiceId);
    if (!invoice) return [];
    return this.getInvoiceItemsForInvoice(invoice.id);
  }

  static async getInvoiceExtras(invoiceId: number): Promise<InvoiceExtra[]> {
    return [];
  }

  static async getInvoiceReminders(invoiceId: number): Promise<InvoiceReminder[]> {
    return [];
  }

  static async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: InvoiceItem[], extras: InvoiceExtra[]): Promise<number> {
    showDemoMessage();
    return 0;
  }

  static async updateInvoice(id: number, invoice: Partial<Invoice>, items: InvoiceItem[], extras: InvoiceExtra[]): Promise<void> {
    showDemoMessage();
  }

  static async updateInvoiceStatus(id: number, status: string, paymentDate?: string, paymentType?: string): Promise<void> {
    showDemoMessage();
  }

  static async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const nextNum = mockInvoices.length + 1;
    return `INV-${year}-${String(nextNum).padStart(4, '0')}`;
  }

  // ==================== Settings Methods ====================

  static async getSettings(): Promise<Settings> {
    return {
      id: 1,
      mile_rate: 2.50, // By Mile (100+ loaded miles): $2.40–$2.75 per loaded mile
      mini_run_rate: 250, // Mini Run (under 100 loaded miles): $250 flat
      day_rate: 850, // Day Rate: $800–$900
      hourly_rate: 90,
      chase_pole_base_rate: 350, // Chase/Pole: $300–$400 per day
      overnight_rate: 175, // Overnight: $175
      default_tax_rate: 0.05,
      irs_mileage_rate: 0.655,
      company_name: 'Pilot Car Services',
      company_address: '',
      company_phone: '',
      company_email: '',
      onboarding_completed: 1,
      intro_guide_completed: 1,
      starting_invoice_number: 1,
      invoice_number_include_year: true,
    };
  }

  static async updateSettings(settings: Partial<Settings>): Promise<void> {
    showDemoMessage();
  }

  // ==================== Transaction Methods ====================

  static async getTransactions(filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: number;
    isBusiness?: boolean;
    search?: string;
  }): Promise<Transaction[]> {
    let result = mockExpenses.map(exp => {
      const category = mockCategories.find(c => c.name === exp.category);
      const categoryId = category ? category.id : undefined;
      
      return {
        id: getNumericId(exp.id),
        date: exp.date,
        description: `${exp.vendor} - ${exp.category}`,
        amount: exp.amount,
        vendor: exp.vendor,
        category_id: categoryId,
        account_type: undefined,
        is_business: exp.category !== 'Personal',
        notes: exp.runId ? `Run: ${exp.runId}` : undefined,
        receipt_id: undefined,
        csv_import_id: undefined,
        is_locked: false,
        created_at: exp.date,
        updated_at: exp.date,
        category_name: category?.name,
        category_color: category?.color,
      } as any;
    });

    // Apply filters
    if (filters?.startDate) {
      result = result.filter(t => t.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      result = result.filter(t => t.date <= filters.endDate!);
    }
    if (filters?.categoryId) {
      result = result.filter(t => t.category_id === filters.categoryId);
    }
    if (filters?.isBusiness !== undefined) {
      result = result.filter(t => t.is_business === filters.isBusiness);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchLower) ||
        t.vendor?.toLowerCase().includes(searchLower)
      );
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async getTransaction(id: number): Promise<Transaction | undefined> {
    const transactions = await this.getTransactions();
    return transactions.find(t => t.id === id);
  }

  static async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    showDemoMessage();
    return 0;
  }

  static async updateTransaction(id: number, transaction: Partial<Transaction>): Promise<void> {
    showDemoMessage();
  }

  static async deleteTransaction(id: number): Promise<void> {
    showDemoMessage();
  }

  // ==================== Category Methods ====================

  static async getCategories(): Promise<Category[]> {
    return mockCategories.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      irs_category: undefined,
      parent_id: undefined,
      is_system: c.is_system,
      color: c.color,
      sort_order: c.id,
      created_at: new Date().toISOString(),
    }));
  }

  static async getCategory(id: number): Promise<Category | undefined> {
    const categories = await this.getCategories();
    return categories.find(c => c.id === id);
  }

  static async createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<number> {
    showDemoMessage();
    return 0;
  }

  static async updateCategory(id: number, category: Partial<Category>): Promise<void> {
    showDemoMessage();
  }

  static async deleteCategory(id: number): Promise<void> {
    showDemoMessage();
  }

  static async getCategoryRules(): Promise<CategoryRule[]> {
    return [];
  }

  static async createCategoryRule(rule: Omit<CategoryRule, 'id' | 'created_at'>): Promise<number> {
    showDemoMessage();
    return 0;
  }

  static async deleteCategoryRule(id: number): Promise<void> {
    showDemoMessage();
  }

  // ==================== Vehicle Methods ====================

  static async getVehicles(): Promise<Vehicle[]> {
    return mockVehicles.map(v => ({
      id: getNumericId(v.id),
      name: v.name,
      make: v.make,
      model: v.model,
      year: v.year,
      license_plate: v.plate,
      is_active: true,
      created_at: new Date().toISOString(),
    }));
  }

  static async getVehicle(id: number): Promise<Vehicle | undefined> {
    const vehicles = await this.getVehicles();
    return vehicles.find(v => v.id === id);
  }

  static async createVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at'>): Promise<number> {
    showDemoMessage();
    return 0;
  }

  static async updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<void> {
    showDemoMessage();
  }

  static async deleteVehicle(id: number): Promise<void> {
    showDemoMessage();
  }

  // ==================== Mileage Methods ====================

  static async getMileageEntries(filters?: { vehicleId?: number; startDate?: string; endDate?: string }): Promise<MileageEntry[]> {
    let result = mockMileage.map(m => {
      const vehicleId = getNumericId(m.vehicleId);
      return {
        id: getNumericId(m.id),
        vehicle_id: vehicleId,
        date: m.date,
        start_odometer: undefined,
        end_odometer: undefined,
        miles: m.miles,
        is_business: m.classification === 'Business',
        purpose: m.runId ? `Run: ${m.runId}` : 'Personal trip',
        start_location: undefined,
        end_location: undefined,
        notes: undefined,
        created_at: m.date,
      } as MileageEntry;
    });

    // Apply filters
    if (filters?.vehicleId) {
      const vehicle = mockVehicles.find(v => getNumericId(v.id) === filters.vehicleId);
      if (vehicle) {
        const vehicleStringId = vehicle.id;
        result = result.filter(m => {
          const mileage = mockMileage.find(me => me.id === m.id);
          return mileage?.vehicleId === vehicleStringId;
        });
      }
    }
    if (filters?.startDate) {
      result = result.filter(m => m.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      result = result.filter(m => m.date <= filters.endDate!);
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async createMileageEntry(entry: Omit<MileageEntry, 'id' | 'created_at'>): Promise<number> {
    showDemoMessage();
    return 0;
  }

  static async updateMileageEntry(id: number, entry: Partial<MileageEntry>): Promise<void> {
    showDemoMessage();
  }

  static async deleteMileageEntry(id: number): Promise<void> {
    showDemoMessage();
  }

  static async getLastEndOdometerForVehicle(vehicleId: number): Promise<number | undefined> {
    const entries = await this.getMileageEntries({ vehicleId });
    if (entries.length === 0) return undefined;
    // Return a mock odometer reading
    return 45000;
  }

  // ==================== Bill Methods ====================

  static async getBills(filters?: { upcoming?: boolean; status?: string }): Promise<Bill[]> {
    let result = mockBills.map(b => {
      const today = getTodayLocalDate();
      const dueDate = b.dueDate;
      const isOverdue = dueDate < today;
      
      let status: Bill['status'] = 'active';
      if (isOverdue) status = 'overdue';
      else if (b.dueDate <= today) status = 'active';

      return {
        id: getNumericId(b.id),
        name: b.name,
        description: undefined,
        amount: b.amount,
        due_date: b.dueDate,
        category_id: undefined,
        vendor: undefined,
        account_number: undefined,
        website: undefined,
        notes: undefined,
        is_recurring: true,
        recurrence_type: 'monthly' as const,
        recurrence_interval: 1,
        next_due_date: b.dueDate,
        last_paid_date: undefined,
        status: status,
        auto_pay: false,
        payment_history: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Bill;
    });

    // Apply filters
    if (filters?.upcoming) {
      const today = getTodayLocalDate();
      result = result.filter(b => b.due_date >= today);
    }
    if (filters?.status) {
      result = result.filter(b => b.status === filters.status);
    }

    return result.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }

  static async getBill(id: number): Promise<Bill | undefined> {
    const bills = await this.getBills();
    return bills.find(b => b.id === id);
  }

  static async createBill(bill: Omit<Bill, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    showDemoMessage();
    return 0;
  }

  static async updateBill(id: number, bill: Partial<Bill>): Promise<void> {
    showDemoMessage();
  }

  static async deleteBill(id: number): Promise<void> {
    showDemoMessage();
  }

  static async markBillAsPaid(billId: number, paymentDate: string, amount: number, transactionId?: number): Promise<void> {
    showDemoMessage();
  }

  // ==================== BookedRun Methods ====================

  static async getBookedRuns(filters?: { startDate?: string; endDate?: string }): Promise<BookedRun[]> {
    let result = mockRuns.map(r => {
      const customer = mockCustomers.find(c => c.id === r.customerId);
      return {
        id: getNumericId(r.id),
        run_date: r.startDate,
        estimated_end_date: r.endDate,
        customer_id: customer ? getNumericId(customer.id) : undefined,
        destination_id: undefined,
        from_location: undefined,
        to_location: undefined,
        description: `${r.rateType} - ${customer?.name || 'Unknown'}`,
        estimated_miles: undefined,
        estimated_rate: r.estimatedTotal,
        status: r.status.toLowerCase(),
        notes: undefined,
        customer: customer ? {
          id: getNumericId(customer.id),
          name: customer.name,
        } : undefined,
        created_at: r.startDate,
        updated_at: r.startDate,
      } as BookedRun;
    });

    // Apply filters
    if (filters?.startDate) {
      result = result.filter(r => r.run_date >= filters.startDate!);
    }
    if (filters?.endDate) {
      result = result.filter(r => r.run_date <= filters.endDate!);
    }

    return result.sort((a, b) => new Date(a.run_date).getTime() - new Date(b.run_date).getTime());
  }

  static async createBookedRun(run: Omit<BookedRun, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    showDemoMessage();
    return 0;
  }

  static async updateBookedRun(id: number, run: Partial<BookedRun>): Promise<void> {
    showDemoMessage();
  }

  static async deleteBookedRun(id: number): Promise<void> {
    showDemoMessage();
  }

  // ==================== Receipt Methods ====================

  static async getReceipts(filters?: { transactionId?: number }): Promise<Receipt[]> {
    return [];
  }

  static async getReceipt(id: number): Promise<Receipt | undefined> {
    return undefined;
  }

  static async createReceipt(receipt: Omit<Receipt, 'id' | 'upload_date'>): Promise<number> {
    showDemoMessage();
    return 0;
  }

  static async updateReceipt(id: number, receipt: Partial<Receipt>): Promise<void> {
    showDemoMessage();
  }

  static async deleteReceipt(id: number): Promise<void> {
    showDemoMessage();
  }

  // ==================== Invoice Reminder Methods ====================

  static async getUpcomingReminders(days: number = 7): Promise<InvoiceReminder[]> {
    return [];
  }

  static async createReminder(reminder: Omit<InvoiceReminder, 'id'>): Promise<number> {
    showDemoMessage();
    return 0;
  }

  static async updateReminder(id: number, reminder: Partial<InvoiceReminder>): Promise<void> {
    showDemoMessage();
  }

  static async deleteReminder(id: number): Promise<void> {
    showDemoMessage();
  }

  // ==================== Utility Methods ====================

  static async fixAndNormalizeInvoiceStatuses(): Promise<number> {
    return 0;
  }
}
