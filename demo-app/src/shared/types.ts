// Phase 1: Core Business Types

export interface Customer {
  id?: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  billing_address?: string;
  notes?: string;
  phones?: CustomerPhone[];
  emails?: CustomerEmail[];
  addresses?: CustomerAddress[];
  created_at?: string;
  updated_at?: string;
}

export interface CustomerPhone {
  id?: number;
  customer_id: number;
  phone: string;
  label?: string;
  is_primary: boolean;
  created_at?: string;
}

export interface CustomerEmail {
  id?: number;
  customer_id: number;
  email: string;
  label?: string;
  is_primary: boolean;
  created_at?: string;
}

export interface CustomerAddress {
  id?: number;
  customer_id: number;
  address: string;
  label?: string;
  is_primary: boolean;
  is_billing: boolean;
  created_at?: string;
}

export interface Destination {
  id?: number;
  name: string;
  address?: string;
  distance?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type BillingType = 'mile' | 'mini_run' | 'day_rate' | 'hourly' | 'chase_pole';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type PaymentType = 'cash' | 'check' | 'credit_card' | 'ach' | 'wire' | 'bank_transfer' | 'other';

export interface Invoice {
  id?: number;
  invoice_number: string;
  customer_id: number;
  destination_id?: number;
  date: string;
  due_date?: string;
  status: InvoiceStatus;
  payment_type?: PaymentType;
  payment_date?: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  items?: InvoiceItem[];
  extras?: InvoiceExtra[];
  reminders?: InvoiceReminder[];
  customer?: Customer; // Populated when loading
  destination?: Destination; // Populated when loading
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id?: number;
  invoice_id?: number; // Optional - set when saving
  run_date?: string;
  type: BillingType;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  from_destination_id?: number;
  to_destination_id?: number;
  from_destination_name?: string;
  to_destination_name?: string;
  miles?: number;
}

export interface InvoiceExtra {
  id?: number;
  invoice_id?: number; // Optional - set when saving
  description: string;
  amount: number;
}

export interface InvoiceReminder {
  id?: number;
  invoice_id: number;
  reminder_date: string;
  notes?: string;
  completed: boolean;
}

export interface Settings {
  id?: number;
  mile_rate: number;
  mini_run_rate: number;
  day_rate: number;
  hourly_rate: number;
  chase_pole_base_rate: number;
  overnight_rate: number;
  default_tax_rate: number;
  irs_mileage_rate?: number;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  onboarding_completed?: number; // 0 or 1 (SQLite boolean)
  intro_guide_completed?: number; // 0 or 1 (SQLite boolean)
  starting_invoice_number?: number;
  invoice_number_include_year?: boolean;
  company_logo?: string; // Base64 encoded logo image
  logo_width?: number; // Logo width in PDF (default: 90)
  logo_height?: number; // Logo height in PDF (default: 70)
  invoice_header_color?: string; // Hex color for invoice header
  invoice_title_color?: string; // Hex color for invoice title text
}

// Phase 2: Expense Tracking Types

export interface Category {
  id?: number;
  name: string;
  description?: string;
  irs_category?: string;
  parent_id?: number;
  is_system: boolean;
  color?: string;
  sort_order?: number;
  created_at?: string;
}

export interface CategoryRule {
  id?: number;
  keyword: string;
  category_id: number;
  priority?: number;
  created_at?: string;
}

export interface Transaction {
  id?: number;
  date: string;
  description: string;
  amount: number;
  vendor?: string;
  category_id?: number;
  account_type?: string;
  is_business: boolean;
  notes?: string;
  receipt_id?: number;
  csv_import_id?: number;
  is_locked?: boolean; // Optional, defaults to false
  created_at?: string;
  updated_at?: string;
}

export interface CSVImport {
  id?: number;
  filename: string;
  import_date?: string;
  bank_name?: string;
  row_count: number;
  notes?: string;
}

export interface CSVMapping {
  id?: number;
  bank_name: string;
  date_column?: string;
  description_column?: string;
  amount_column?: string;
  debit_column?: string;
  credit_column?: string;
  vendor_column?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Receipt {
  id?: number;
  transaction_id?: number;
  filename: string;
  file_path: string;
  file_type?: string;
  upload_date?: string;
  ocr_data?: string; // JSON string, not OCRData object
  vendor?: string;
  total?: number;
  tax?: number;
  receipt_date?: string;
}

export interface OCRData {
  vendor?: string;
  total?: number;
  tax?: number;
  date?: string;
  items?: Array<{ description: string; amount: number }>;
  raw_text?: string;
  confidence?: number;
}

export interface Vehicle {
  id?: number;
  name: string;
  make?: string;
  model?: string;
  year?: number;
  license_plate?: string;
  is_active: boolean;
  created_at?: string;
}

export interface MileageEntry {
  id?: number;
  vehicle_id: number;
  date: string;
  start_odometer?: number;
  end_odometer?: number;
  miles: number;
  is_business: boolean;
  purpose?: string;
  start_location?: string;
  end_location?: string;
  notes?: string;
  created_at?: string;
}

export interface VehicleExpense {
  id?: number;
  vehicle_id: number;
  date: string;
  type: string;
  amount: number;
  vendor?: string;
  notes?: string;
  created_at?: string;
}

export interface Reconciliation {
  id?: number;
  account_name: string;
  period_start: string;
  period_end: string;
  starting_balance: number;
  ending_balance: number;
  reconciled_date?: string;
  status: string;
  notes?: string;
}

export interface BusinessProfile {
  id?: number;
  name: string;
  ein?: string;
  address?: string;
  tax_year_start?: string;
  accounting_method: string;
  is_active: boolean;
  created_at?: string;
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type BillStatus = 'active' | 'paid' | 'overdue' | 'cancelled';

export interface Bill {
  id?: number;
  name: string;
  description?: string;
  amount: number;
  due_date: string;
  category_id?: number;
  vendor?: string;
  account_number?: string;
  website?: string;
  notes?: string;
  is_recurring: boolean;
  recurrence_type: RecurrenceType;
  recurrence_interval?: number; // Optional
  next_due_date?: string;
  last_paid_date?: string;
  status: BillStatus;
  auto_pay: boolean;
  payment_history?: BillPayment[];
  created_at?: string;
  updated_at?: string;
}

export interface BillPayment {
  id?: number;
  bill_id: number;
  payment_date: string;
  amount: number;
  notes?: string;
  transaction_id?: number;
  created_at?: string;
}

export interface BookedRun {
  id?: number;
  run_date: string;
  estimated_end_date?: string;
  customer_id?: number;
  destination_id?: number;
  from_location?: string;
  to_location?: string;
  description: string;
  estimated_miles?: number;
  estimated_rate?: number;
  status: string;
  notes?: string;
  customer?: Customer; // Populated when loading
  destination?: Destination; // Populated when loading
  created_at?: string;
  updated_at?: string;
}

// Authentication Types

export interface AuthResult {
  success: boolean;
  message?: string;
  error?: string;
  recoveryKey?: string;
  user?: {
    id: number;
    username: string;
  };
}

// Report Types

export interface CategoryExpense {
  category_id?: number;
  category_name: string;
  category_color?: string;
  total: number;
  transaction_count: number;
}

export interface ProfitLossReport {
  period: string;
  income: {
    total: number;
    by_category: CategoryExpense[];
    invoices?: Invoice[]; // Optional - may be included
  };
  expenses: {
    total: number;
    by_category: CategoryExpense[];
  };
  net_profit: number;
}

export interface TaxSummary {
  tax_year: string;
  year?: number; // Alternative field name
  total_income: number;
  total_expenses: number;
  net_profit: number;
  expense_by_irs_category: Record<string, number>;
  mileage_deduction?: number;
  total_business_miles?: number;
}
