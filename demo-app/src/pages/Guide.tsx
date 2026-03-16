import React, { useState, useRef, useEffect } from 'react';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function Guide() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<string>('');
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
      if (!expandedSections.has(sectionId)) {
        toggleSection(sectionId);
      }
    }
  };

  const sections: Section[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: (
        <div>
          <h3>Installation</h3>
          <ol>
            <li>Run the installer: <code>Pilot Car Admin Setup 1.0.0.exe</code></li>
            <li>Follow the installation wizard</li>
            <li>The app will create a desktop shortcut</li>
          </ol>

          <h3>First Launch</h3>
          <ol>
            <li>Open the app</li>
            <li>Set a password (first time only)
              <ul>
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character (!@#$%^&*()_+-=[]{}|;:,.&lt;&gt;?)</li>
              </ul>
            </li>
            <li>Activate your license (if required)
              <ul>
                <li>Enter your license key when prompted</li>
                <li>The app will validate your license online</li>
                <li>Once activated, you're ready to go!</li>
              </ul>
            </li>
          </ol>

          <h3>Logging In</h3>
          <p>Enter your password to access the app. Use "Forgot Password" if available.</p>

          <h3>Locking the App</h3>
          <p>Click the lock icon in the navigation bar to lock the app. Enter your password to unlock.</p>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      content: (
        <div>
          <p>The Dashboard provides a comprehensive overview of your business at a glance.</p>
          
          <h3>Key Statistics</h3>
          <ul>
            <li><strong>Total Invoices:</strong> Count of all invoices (paid, sent, draft)</li>
            <li><strong>Total Revenue:</strong> Sum of all paid invoices (all time)</li>
            <li><strong>This Month Revenue:</strong> Revenue from paid invoices this month (with comparison to last month)</li>
            <li><strong>Unpaid Amount:</strong> Total amount from pending invoices</li>
            <li><strong>Overdue Invoices:</strong> Count of invoices past their due date</li>
            <li><strong>Total Expenses:</strong> Sum of all transactions (business vs personal breakdown)</li>
            <li><strong>This Month Expenses:</strong> Expenses this month (with comparison to last month)</li>
            <li><strong>Net Profit:</strong> This month's revenue minus expenses</li>
          </ul>

          <h3>Dashboard Widgets</h3>
          <ul>
            <li><strong>Recent Invoices:</strong> Last 10 invoices created</li>
            <li><strong>Invoice Status Breakdown:</strong> Visual breakdown of invoice statuses</li>
            <li><strong>Upcoming Reminders:</strong> Reminders scheduled for the next 7 days</li>
            <li><strong>Upcoming Bills:</strong> Next 5 bills due</li>
            <li><strong>Recent Business Expenses:</strong> Last 10 business transactions</li>
          </ul>

          <p><strong>Tip:</strong> Click on any stat card to navigate to the related page for more details.</p>
        </div>
      ),
    },
    {
      id: 'customers',
      title: 'Customer Management',
      content: (
        <div>
          <h3>Adding a Customer</h3>
          <ol>
            <li>Navigate to <strong>Customers</strong> in the menu</li>
            <li>Click the <strong>"New Customer"</strong> button</li>
            <li>Fill in customer information:
              <ul>
                <li>Name (required)</li>
                <li>Phone (can add multiple)</li>
                <li>Email (can add multiple)</li>
                <li>Address (can add multiple)</li>
                <li>Tax ID</li>
                <li>Billing Address</li>
                <li>Notes</li>
              </ul>
            </li>
            <li>Click <strong>"Save"</strong></li>
          </ol>

          <h3>Multiple Contact Methods</h3>
          <p>You can add multiple phones, emails, and addresses for each customer. Mark one as primary, and it will display in the customer list.</p>

          <h3>Viewing Customer Details</h3>
          <p>Click <strong>"View"</strong> on any customer to see all contact information, invoice history, and notes.</p>

          <h3>Editing Customers</h3>
          <p>Click <strong>"Edit"</strong> on any customer to modify their information.</p>

          <h3>Searching Customers</h3>
          <p>Use the search bar at the top of the Customers page to search by name, phone, email, address, or tax ID.</p>

          <h3>Importing Customers from CSV</h3>
          <ol>
            <li>Go to Customers → <strong>"Import CSV"</strong></li>
            <li>Select your CSV file</li>
            <li>Map the columns (name, phone, email, address, etc.)</li>
            <li>Review and confirm the import</li>
          </ol>
        </div>
      ),
    },
    {
      id: 'destinations',
      title: 'Destination Management',
      content: (
        <div>
          <h3>Adding a Destination</h3>
          <ol>
            <li>Navigate to <strong>Destinations</strong> in the menu</li>
            <li>Click <strong>"Add Destination"</strong></li>
            <li>Enter:
              <ul>
                <li>Name</li>
                <li>Address</li>
                <li>Distance (optional)</li>
              </ul>
            </li>
            <li>Click <strong>"Save"</strong></li>
          </ol>

          <h3>Using Destinations</h3>
          <p>When creating invoices, you can select from/to destinations from your saved list, saving time on common routes and tracking distances automatically.</p>

          <h3>Importing Destinations</h3>
          <ol>
            <li>Go to Destinations → <strong>"Import CSV"</strong></li>
            <li>Select your CSV file</li>
            <li>Map the columns and import</li>
          </ol>
        </div>
      ),
    },
    {
      id: 'creating-invoices',
      title: 'Creating Invoices',
      content: (
        <div>
          <h3>Invoice Types</h3>
          <p>There are two types of invoices:</p>
          <ul>
            <li><strong>Standard Invoice:</strong> For pilot car runs with destinations, miles, and billing types</li>
            <li><strong>Custom Invoice:</strong> For simple line items (description and price)</li>
          </ul>

          <h3>Creating a Standard Invoice</h3>
          
          <h4>Step 1: Basic Information</h4>
          <ol>
            <li>Go to <strong>Invoices</strong> → <strong>"New Invoice"</strong></li>
            <li>Invoice number is auto-generated (you can edit it)</li>
            <li>Set the invoice date</li>
            <li>Select a customer (or enter name manually)</li>
            <li>Set due date (optional)</li>
            <li>Set status: Draft, Sent, Paid, Overdue, Cancelled</li>
          </ol>

          <h4>Step 2: Add Runs</h4>
          <ol>
            <li>Click <strong>"Add Run"</strong></li>
            <li>For each run, fill in:
              <ul>
                <li><strong>Run Date:</strong> Date of the run</li>
                <li><strong>From Destination:</strong> Select from dropdown or enter manually</li>
                <li><strong>To Destination:</strong> Select from dropdown or enter manually</li>
                <li><strong>Miles:</strong> Distance traveled</li>
                <li><strong>Billing Type:</strong>
                  <ul>
                    <li>By Mile: miles × rate</li>
                    <li>Mini Run: fixed rate per run</li>
                    <li>Day Rate: fixed daily rate</li>
                    <li>Hourly: hours × hourly rate</li>
                    <li>Chase/Pole: miles × rate</li>
                  </ul>
                </li>
                <li><strong>Description:</strong> What you're piloting (e.g., "Oversized Load - Wind Turbine Blade")</li>
                <li><strong>Rate:</strong> Auto-filled from settings (editable)</li>
                <li><strong>Amount:</strong> Auto-calculated based on billing type</li>
              </ul>
            </li>
            <li>Add multiple runs as needed</li>
          </ol>

          <h4>Step 3: Add-ons</h4>
          <ul>
            <li><strong>Overnight Rate:</strong> Enter rate per night and number of nights, then click "Add Overnight"</li>
            <li><strong>Custom Extras:</strong> Click "Add Extra Item" and enter description and amount</li>
          </ul>

          <h4>Step 4: Review & Save</h4>
          <ol>
            <li>Review the total amount</li>
            <li>Add notes (optional)</li>
            <li>Click <strong>"Save Invoice"</strong></li>
            <li>Use <strong>"Preview"</strong> button to see how the final invoice will look</li>
          </ol>

          <h3>Creating a Custom Invoice</h3>
          <ol>
            <li>Select <strong>"Custom Invoice"</strong> option</li>
            <li>Click <strong>"Add Item"</strong></li>
            <li>Enter description and price for each item</li>
            <li>Add extras if needed</li>
            <li>Save</li>
          </ol>

          <h3>Payment Information</h3>
          <p>When marking an invoice as <strong>Paid</strong>, you must enter:</p>
          <ul>
            <li>Payment Date (required)</li>
            <li>Payment Type (required): Check, ACH, Cash, Credit Card, Wire Transfer, Other</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'managing-invoices',
      title: 'Managing Invoices',
      content: (
        <div>
          <h3>Viewing Invoices</h3>
          <p>The invoice list shows: Invoice #, Date, Customer, Destination, Status, Payment Date, and Total. Click <strong>"View"</strong> to see full details.</p>

          <h3>Filtering Invoices</h3>
          <ul>
            <li><strong>Search:</strong> By invoice number or customer name</li>
            <li><strong>Status:</strong> All, Draft, Sent, Paid, Overdue, Cancelled</li>
            <li><strong>Date:</strong> All Dates, By Month, Date Range</li>
          </ul>

          <h3>Changing Invoice Status</h3>
          <p>Use the status dropdown on any invoice to change its status.</p>

          <h3>Editing Invoices</h3>
          <p>Click <strong>"Edit"</strong> on any invoice to make changes.</p>

          <h3>Deleting Invoices</h3>
          <p>Click <strong>"Delete"</strong> and confirm to remove an invoice.</p>

          <h3>Setting Reminders</h3>
          <ol>
            <li>Open an invoice</li>
            <li>Click <strong>"Set Reminder"</strong></li>
            <li>Choose a follow-up date</li>
            <li>Add notes (optional)</li>
            <li>Reminders appear on Dashboard and Calendar</li>
          </ol>

          <h3>Printing/Exporting Invoices</h3>
          <ol>
            <li>Open an invoice</li>
            <li>Click <strong>"Print"</strong> or <strong>"Export PDF"</strong></li>
            <li>Print directly or save the PDF</li>
          </ol>

          <h3>Invoice Statuses Explained</h3>
          <ul>
            <li><strong>Draft:</strong> Still being worked on, not sent</li>
            <li><strong>Sent:</strong> Sent to customer, awaiting payment</li>
            <li><strong>Paid:</strong> Payment received</li>
            <li><strong>Overdue:</strong> Past due date, requires attention</li>
            <li><strong>Cancelled:</strong> Invoice cancelled</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'transactions',
      title: 'Transactions & Expenses',
      content: (
        <div>
          <h3>Recording a Transaction</h3>
          <ol>
            <li>Go to <strong>Transactions</strong> → <strong>"New Transaction"</strong></li>
            <li>Enter:
              <ul>
                <li>Date</li>
                <li>Description</li>
                <li>Amount (negative for expenses)</li>
                <li>Vendor</li>
                <li>Category</li>
                <li>Business or Personal</li>
                <li>Account Type (optional)</li>
                <li>Notes</li>
              </ul>
            </li>
            <li>Click <strong>"Save"</strong></li>
          </ol>

          <h3>Business vs Personal</h3>
          <p>Mark transactions as <strong>Business</strong> (tax-deductible) or <strong>Personal</strong> (not tax-deductible). These are tracked separately in reports.</p>

          <h3>Filtering Transactions</h3>
          <p>Filter by date range, category, business/personal type, or search by description or vendor.</p>

          <h3>Transaction Totals</h3>
          <p>The page shows totals for: Total (all transactions), Business (business transactions), Personal (personal transactions), and Count (number of transactions).</p>

          <h3>Locked Transactions</h3>
          <p>Transactions locked by reconciliation cannot be edited or deleted. A lock icon indicates locked transactions.</p>
        </div>
      ),
    },
    {
      id: 'receipts',
      title: 'Receipt Management',
      content: (
        <div>
          <h3>Uploading Receipts</h3>
          <ol>
            <li>Go to <strong>Receipts</strong> → <strong>"Upload Receipts"</strong></li>
            <li>Select an image file (JPG, PNG, PDF, etc.)</li>
            <li>The app uses OCR to automatically extract:
              <ul>
                <li>Vendor name</li>
                <li>Total amount</li>
                <li>Tax amount</li>
                <li>Receipt date</li>
                <li>Raw text</li>
              </ul>
            </li>
            <li>Review the extracted data</li>
            <li>The app automatically:
              <ul>
                <li>Saves the receipt image</li>
                <li>Creates a transaction (if total detected)</li>
                <li>Auto-categorizes (if rules match)</li>
                <li>Links receipt to transaction</li>
              </ul>
            </li>
          </ol>

          <h3>Viewing Receipts</h3>
          <p>Receipts are displayed in a grid view with thumbnails. Click any receipt to view details, see extracted data, and view the linked transaction.</p>

          <h3>Matching Receipts to Transactions</h3>
          <ol>
            <li>Open a receipt</li>
            <li>Select a transaction to link</li>
            <li>Save</li>
          </ol>

          <h3>Filtering Receipts</h3>
          <p>Filter by: All, Matched (linked to transactions), or Unmatched (not linked).</p>
        </div>
      ),
    },
    {
      id: 'bills',
      title: 'Bills Management',
      content: (
        <div>
          <h3>Adding a Bill</h3>
          <ol>
            <li>Go to <strong>Bills</strong> → <strong>"Add Bill"</strong></li>
            <li>Enter:
              <ul>
                <li>Bill name</li>
                <li>Vendor</li>
                <li>Amount</li>
                <li>Due date</li>
                <li>Category</li>
                <li>Recurring (optional)</li>
                <li>Notes</li>
              </ul>
            </li>
            <li>Click <strong>"Save"</strong></li>
          </ol>

          <h3>Recurring Bills</h3>
          <p>Set bills as recurring with a frequency (monthly, quarterly, etc.). The app will automatically create future bills.</p>

          <h3>Tracking Bills</h3>
          <p>View upcoming bills on the Dashboard, see overdue bills highlighted, and mark bills as paid.</p>
        </div>
      ),
    },
    {
      id: 'mileage',
      title: 'Mileage Tracking',
      content: (
        <div>
          <h3>Adding Vehicles</h3>
          <ol>
            <li>Go to <strong>Mileage</strong> → <strong>"Vehicles"</strong></li>
            <li>Click <strong>"Add Vehicle"</strong></li>
            <li>Enter: Name, Make/Model, Year, License Plate, Active status</li>
            <li>Save</li>
          </ol>

          <h3>Recording Mileage</h3>
          <ol>
            <li>Go to <strong>Mileage</strong> → <strong>"Mileage Log"</strong></li>
            <li>Click <strong>"New Mileage Entry"</strong></li>
            <li>Enter: Date, Vehicle, Start Location, End Location, Miles, Business or Personal, Purpose</li>
            <li>Save</li>
          </ol>

          <h3>Mileage Summary</h3>
          <p>The page shows: Total Miles (all entries), Business Miles (business entries), IRS Rate (current rate, editable in Settings), and Deduction (business miles × IRS rate).</p>

          <h3>Mileage Deduction Report</h3>
          <p>View total business miles, IRS deduction amount, breakdown by vehicle, and monthly summaries.</p>
        </div>
      ),
    },
    {
      id: 'reports',
      title: 'Reports',
      content: (
        <div>
          <h3>Profit & Loss Report</h3>
          <ol>
            <li>Go to <strong>Reports</strong></li>
            <li>Select <strong>"Profit & Loss"</strong></li>
            <li>Choose date range</li>
            <li>View: Revenue (from paid invoices), Expenses (business transactions), Net Profit/Loss, Monthly breakdown</li>
          </ol>

          <h3>Expenses by Category Report</h3>
          <ol>
            <li>Select <strong>"Expenses by Category"</strong></li>
            <li>Choose date range</li>
            <li>View: Total expenses by category, Percentage breakdown, Category totals</li>
          </ol>

          <h3>Tax Summary Report</h3>
          <ol>
            <li>Select <strong>"Tax Summary"</strong></li>
            <li>Choose tax year</li>
            <li>View: Total revenue, Business expenses, Mileage deductions, Net taxable income, Category breakdowns</li>
          </ol>
        </div>
      ),
    },
    {
      id: 'calendar',
      title: 'Calendar',
      content: (
        <div>
          <h3>Viewing Calendar</h3>
          <p>The Calendar shows invoices by date, reminders, due dates, and bills due dates. Navigate between months to see your schedule.</p>
        </div>
      ),
    },
    {
      id: 'categories',
      title: 'Categories',
      content: (
        <div>
          <h3>Creating Categories</h3>
          <ol>
            <li>Go to <strong>Categories</strong></li>
            <li>Click <strong>"Add Category"</strong></li>
            <li>Enter: Name, Color, Description</li>
            <li>Save</li>
          </ol>

          <h3>Category Rules</h3>
          <p>Set up auto-categorization rules that match keywords to categories. Transactions will be automatically categorized based on these rules.</p>
        </div>
      ),
    },
    {
      id: 'settings',
      title: 'Settings & Configuration',
      content: (
        <div>
          <h3>Billing Rates</h3>
          <p>Set default rates for: Mile Rate, Mini Run Rate, Day Rate, Hourly Rate, Chase/Pole Base Rate, and Overnight Rate. These rates are used when creating invoices.</p>

          <h3>Company Information</h3>
          <p>Enter your company name, address, phone, and email. This information appears on invoices.</p>

          <h3>Changing Password</h3>
          <ol>
            <li>Go to <strong>Settings</strong> → <strong>Security</strong></li>
            <li>Enter: Current Password, New Password (must meet requirements), Confirm New Password</li>
            <li>Click <strong>"Change Password"</strong></li>
          </ol>
        </div>
      ),
    },
    {
      id: 'sync',
      title: 'Data Sync',
      content: (
        <div>
          <h3>Finding Your IP Address</h3>
          <p><strong>Windows:</strong></p>
          <ol>
            <li>Press <strong>Windows + R</strong> → type <strong>cmd</strong> → press Enter</li>
            <li>Type <strong>ipconfig</strong> → press Enter</li>
            <li>Copy the <strong>IPv4 Address</strong> (e.g., 192.168.1.100)</li>
          </ol>
          <p><strong>Android:</strong></p>
          <ol>
            <li>Go to <strong>Settings</strong> → <strong>Wi-Fi</strong></li>
            <li>Tap on your connected network</li>
            <li>Look for "IP address" or "Network details"</li>
            <li>Copy the IP address shown</li>
          </ol>

          <h3>Hub Mode (Desktop App)</h3>
          <p>The desktop app acts as a sync hub. Go to <strong>Settings</strong> → <strong>Data Sync</strong> to see Hub Status showing IP Address, Port, and Active status.</p>

          <h3>Connecting Mobile App</h3>
          <ol>
            <li>On mobile, go to <strong>Settings</strong> → <strong>Data Sync</strong></li>
            <li>Enter the desktop IP address and port</li>
            <li>Both devices must be on the same Wi-Fi network</li>
            <li>Mobile app connects to desktop hub</li>
          </ol>

          <h3>Manual Sync</h3>
          <p>Click <strong>"Sync Now"</strong> to manually sync data. Status shows last sync time, sync status (Idle, Syncing, Error), and connected clients.</p>

          <h3>Troubleshooting Sync</h3>
          <ul>
            <li>Ensure both devices are on the same Wi-Fi network</li>
            <li>Check Windows Firewall settings</li>
            <li>Verify IP address matches your computer's network IP</li>
            <li>Try temporarily disabling firewall to test</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'backup',
      title: 'Backup & Restore',
      content: (
        <div>
          <h3>Quick Backup</h3>
          <ol>
            <li>Go to <strong>Settings</strong> → <strong>Backup & Restore</strong></li>
            <li>Click <strong>"Quick Backup"</strong></li>
            <li>Backup is saved to default location</li>
          </ol>

          <h3>Backup to Specific Location</h3>
          <ol>
            <li>Click <strong>"Backup To..."</strong></li>
            <li>Choose location</li>
            <li>Backup is saved</li>
          </ol>

          <h3>Restoring from Backup</h3>
          <ol>
            <li>Click <strong>"Restore From Backup"</strong></li>
            <li>Select backup file</li>
            <li>Confirm restore</li>
            <li>Restart app to load restored data</li>
          </ol>

          <h3>Best Practices</h3>
          <ul>
            <li>Back up regularly</li>
            <li>Copy backups to external drives or cloud storage</li>
            <li>Keep multiple backup copies</li>
            <li>Test restores periodically</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'csv',
      title: 'CSV Import/Export',
      content: (
        <div>
          <h3>Importing Customers</h3>
          <ol>
            <li>Go to <strong>Customers</strong> → <strong>"Import CSV"</strong></li>
            <li>Select CSV file</li>
            <li>Map columns</li>
            <li>Review preview</li>
            <li>Confirm import</li>
          </ol>

          <h3>Importing Destinations</h3>
          <p>Similar process: Go to Destinations → Import CSV, select file, map columns, and import.</p>

          <h3>Exporting Data</h3>
          <p>Export customers, invoices, and transactions to CSV for backup or external analysis.</p>
        </div>
      ),
    },
    {
      id: 'tips',
      title: 'Tips & Best Practices',
      content: (
        <div>
          <h3>Workflow Tips</h3>
          <ol>
            <li>Set up default rates in Settings first</li>
            <li>Add customers and destinations before creating invoices</li>
            <li>Use categories consistently for expense tracking</li>
            <li>Upload receipts immediately after purchase</li>
            <li>Set reminders for invoice follow-ups</li>
            <li>Back up regularly</li>
          </ol>

          <h3>Invoice Tips</h3>
          <ul>
            <li>Use Standard Invoices for pilot car runs</li>
            <li>Use Custom Invoices for simple line items</li>
            <li>Add detailed descriptions</li>
            <li>Set due dates</li>
            <li>Mark as Sent when emailed</li>
            <li>Mark as Paid when payment received</li>
          </ul>

          <h3>Expense Tracking Tips</h3>
          <ul>
            <li>Record transactions promptly</li>
            <li>Link receipts to transactions</li>
            <li>Use categories consistently</li>
            <li>Mark business vs personal correctly</li>
            <li>Review uncategorized transactions regularly</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      content: (
        <div>
          <h3>App Won't Start</h3>
          <ul>
            <li>Restart your computer</li>
            <li>Reinstall the app</li>
            <li>Check for Windows updates</li>
          </ul>

          <h3>Can't Log In</h3>
          <ul>
            <li>Use "Forgot Password" if available</li>
            <li>Contact support if locked out</li>
          </ul>

          <h3>License Issues</h3>
          <ul>
            <li>Check internet connection</li>
            <li>Verify license key</li>
            <li>Contact support</li>
          </ul>

          <h3>Sync Not Working</h3>
          <ul>
            <li>Ensure both devices on same Wi-Fi</li>
            <li>Check Windows Firewall</li>
            <li>Verify IP address</li>
            <li>Try disabling firewall temporarily</li>
          </ul>

          <h3>Data Not Saving</h3>
          <ul>
            <li>Check disk space</li>
            <li>Verify write permissions</li>
            <li>Restart app</li>
            <li>Check database file location</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'quick-reference',
      title: 'Quick Reference',
      content: (
        <div>
          <table className="table" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Location</th>
                <th>Steps</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Create Invoice</td>
                <td>Invoices → New Invoice</td>
                <td>Fill form → Add runs → Save</td>
              </tr>
              <tr>
                <td>Add Customer</td>
                <td>Customers → New Customer</td>
                <td>Fill form → Save</td>
              </tr>
              <tr>
                <td>Upload Receipt</td>
                <td>Receipts → Upload Receipts</td>
                <td>Select file → Review → Save</td>
              </tr>
              <tr>
                <td>Record Expense</td>
                <td>Transactions → New Transaction</td>
                <td>Fill form → Save</td>
              </tr>
              <tr>
                <td>Track Mileage</td>
                <td>Mileage → New Mileage Entry</td>
                <td>Fill form → Save</td>
              </tr>
              <tr>
                <td>Generate Report</td>
                <td>Reports</td>
                <td>Select type → Choose dates → View</td>
              </tr>
              <tr>
                <td>Backup Data</td>
                <td>Settings → Backup & Restore</td>
                <td>Click Quick Backup</td>
              </tr>
              <tr>
                <td>Sync Data</td>
                <td>Settings → Data Sync</td>
                <td>Click Sync Now</td>
              </tr>
              <tr>
                <td>Change Password</td>
                <td>Settings → Security</td>
                <td>Enter passwords → Save</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
  ];

  // Expand all sections by default
  useEffect(() => {
    setExpandedSections(new Set(sections.map(s => s.id)));
  }, []);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">User Guide</h1>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
        {/* Table of Contents Sidebar */}
        <div style={{ 
          width: '250px', 
          flexShrink: 0,
          position: 'sticky',
          top: '80px',
          alignSelf: 'flex-start',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto'
        }}>
          <div className="card" style={{ padding: '1rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#2c3e50', fontSize: '1.1rem', fontWeight: '600' }}>Table of Contents</h3>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  style={{
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.875rem',
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    backgroundColor: activeSection === section.id ? '#e3f2fd' : '#f8f9fa',
                    color: activeSection === section.id ? '#1976D2' : '#2c3e50',
                    border: activeSection === section.id ? '1px solid #2196F3' : '1px solid #e0e0e0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: activeSection === section.id ? '600' : '400',
                    boxShadow: activeSection === section.id ? '0 2px 4px rgba(33, 150, 243, 0.2)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.backgroundColor = '#e8f4f8';
                      e.currentTarget.style.borderColor = '#b3d9f2';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.borderColor = '#e0e0e0';
                    }
                  }}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {sections.map((section, index) => (
            <div
              key={section.id}
              ref={el => sectionRefs.current[section.id] = el}
              className="card"
              style={{ 
                marginBottom: '1.5rem',
                scrollMarginTop: '80px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '1rem',
                  borderBottom: '1px solid #e0e0e0',
                }}
                onClick={() => toggleSection(section.id)}
              >
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{section.title}</h2>
                <span style={{ fontSize: '1.5rem' }}>
                  {expandedSections.has(section.id) ? '▼' : '▶'}
                </span>
              </div>
              {expandedSections.has(section.id) && (
                <div style={{ padding: '1.5rem' }}>
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Back to Top"
      >
        ↑
      </button>
    </>
  );
}
