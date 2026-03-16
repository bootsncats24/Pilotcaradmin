import type { Metadata } from 'next';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'User Guide · Pilot Car Admin 2026',
  description:
    'Complete user guide for Pilot Car Admin. Learn how to create invoices, track expenses, manage customers, and more.',
};

interface GuideSection {
  id: string;
  title: string;
  description: string;
  steps?: string[];
  tips?: string[];
  subsections?: { title: string; content: string[] }[];
}

const guideSections: GuideSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description:
      'Learn how to install, activate, and set up Pilot Car Admin for the first time.',
    steps: [
      'Download the Pilot Car Admin installer from your purchase confirmation email or the download link provided.',
      'Run the installer and follow the on-screen instructions to install the application.',
      'Launch Pilot Car Admin and enter your license key when prompted.',
      'Complete the initial setup wizard to configure your business information, default rates, and preferences.',
      'Start by adding your first customer or creating a test invoice to familiarize yourself with the interface.',
    ],
    tips: [
      'Keep your license key in a safe place. You\'ll need it if you reinstall the software.',
      'The initial setup wizard helps you configure default settings, but you can change these anytime in Settings.',
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description:
      'Understand your business at a glance with key metrics and recent activity.',
    subsections: [
      {
        title: 'Key Metrics',
        content: [
          'Total Revenue: Sum of all paid invoices',
          'Total Expenses: Sum of all business expenses',
          'Net Profit: Revenue minus expenses',
          'Unpaid Invoices: Total amount of outstanding invoices',
          'Upcoming Bills: Bills due in the next 30 days',
        ],
      },
      {
        title: 'Recent Activity',
        content: [
          'View your most recent invoices, expenses, and transactions',
          'Quick access to edit or view details of any item',
          'Filter by date range or status',
        ],
      },
      {
        title: 'Quick Actions',
        content: [
          'Create new invoice with one click',
          'Add expense or receipt',
          'Record mileage entry',
          'View calendar of scheduled runs',
        ],
      },
    ],
  },
  {
    id: 'invoices',
    title: 'Creating and Managing Invoices',
    description:
      'Create professional invoices with multiple billing types designed for pilot car services.',
    steps: [
      'Click "New Invoice" from the Dashboard or Invoices page.',
      'Select a customer from your customer list, or create a new customer on the fly.',
      'Choose your billing type:',
      '  • By Mile: Charge per mile traveled',
      '  • Mini Run: Fixed rate for short runs',
      '  • Day Rate: Flat daily rate',
      '  • Hourly: Charge by the hour',
      '  • Chase/Pole: Specialized pilot car service rate',
      'Enter the run details: origin, destination, miles, dates, and any special notes.',
      'Add extras if applicable (overnight rates, additional services, etc.).',
      'Review the automatically calculated total.',
      'Set the invoice status: Draft, Sent, Paid, or mark as Overdue.',
      'Save the invoice. You can print or export as PDF at any time.',
    ],
    subsections: [
      {
        title: 'Invoice Statuses',
        content: [
          'Draft: Invoice is being prepared and hasn\'t been sent',
          'Sent: Invoice has been sent to the customer',
          'Paid: Customer has paid the invoice',
          'Overdue: Invoice is past its due date',
          'Cancelled: Invoice has been cancelled',
        ],
      },
      {
        title: 'Setting Reminders',
        content: [
          'Set automatic reminders for follow-up on unpaid invoices',
          'Configure reminder frequency (e.g., 7 days, 14 days, 30 days)',
          'View all upcoming reminders on the Dashboard',
        ],
      },
      {
        title: 'PDF Export',
        content: [
          'Click "Print" or "Export PDF" on any invoice',
          'Professional formatting with your business information',
          'Includes all invoice details, line items, and totals',
        ],
      },
    ],
  },
  {
    id: 'customers',
    title: 'Customer & Destination Management',
    description:
      'Organize customer information and frequently used destinations for quick access.',
    steps: [
      'Navigate to the Customers page from the main menu.',
      'Click "New Customer" to add a customer.',
      'Enter customer details: name, company, tax ID (if applicable).',
      'Add contact information: multiple phone numbers, email addresses, and physical addresses.',
      'Save the customer. They\'ll now appear in your customer list and can be selected when creating invoices.',
    ],
    subsections: [
      {
        title: 'Managing Destinations',
        content: [
          'Add frequently used destinations with addresses',
          'Store distance information for quick reference',
          'Link destinations to customers for faster invoice creation',
          'Search destinations by name or address',
        ],
      },
      {
        title: 'CSV Import',
        content: [
          'Import multiple customers at once using CSV files',
          'Download the CSV template from the Customers page',
          'Fill in customer information and upload',
          'Review imported customers before finalizing',
        ],
      },
      {
        title: 'Search and Filter',
        content: [
          'Use the search bar to quickly find customers by name, company, or contact info',
          'Filter customers by various criteria',
          'View customer history: all invoices and transactions',
        ],
      },
    ],
  },
  {
    id: 'expenses',
    title: 'Expense Tracking',
    description:
      'Track all your business expenses with receipt scanning, categorization, and reporting.',
    steps: [
      'Go to the Expenses page from the main menu.',
      'Click "Add Expense" to manually enter an expense.',
      'Enter the expense details: date, amount, description, and category.',
      'Attach a receipt image if available (on mobile app, use OCR scanning).',
      'Mark the expense as business or personal.',
      'Save the expense. It will be included in your expense reports.',
    ],
    subsections: [
      {
        title: 'Receipt Scanning (Mobile App)',
        content: [
          'Use your mobile device camera to scan receipts',
          'OCR technology automatically extracts date, amount, and vendor information',
          'Review and edit extracted information before saving',
          'Receipt images are stored securely with the expense',
        ],
      },
      {
        title: 'CSV Import',
        content: [
          'Import expenses from bank statements or accounting software',
          'Download CSV template with required columns',
          'Map columns to expense fields during import',
          'Review and categorize imported expenses',
        ],
      },
      {
        title: 'Categories and Rules',
        content: [
          'Create custom expense categories (Fuel, Maintenance, Meals, etc.)',
          'Set up category rules for automatic categorization',
          'Rules can match by vendor name, description keywords, or amount ranges',
          'Save time by letting the app categorize expenses automatically',
        ],
      },
      {
        title: 'Bill Tracking',
        content: [
          'Track recurring bills (insurance, subscriptions, etc.)',
          'Set up automatic reminders for upcoming bills',
          'Mark bills as paid and track payment history',
          'View all upcoming bills on the Dashboard',
        ],
      },
    ],
  },
  {
    id: 'mileage',
    title: 'Mileage Tracking',
    description:
      'Track vehicle mileage for accurate tax deduction calculations.',
    steps: [
      'Navigate to the Mileage Tracking page.',
      'Click "Add Mileage Entry" to record a trip.',
      'Select the vehicle you used for the trip.',
      'Enter the trip details: date, starting odometer reading, ending odometer reading.',
      'Specify if the trip was business or personal.',
      'Add notes about the trip purpose if needed.',
      'Save the entry. The app calculates total business miles automatically.',
    ],
    subsections: [
      {
        title: 'Multiple Vehicles',
        content: [
          'Add multiple vehicles to track mileage separately',
          'Each vehicle maintains its own mileage history',
          'View combined or individual vehicle reports',
        ],
      },
      {
        title: 'Tax Deduction Calculations',
        content: [
          'The app automatically calculates tax deductions based on current IRS rates',
          'View mileage summaries by date range',
          'Export mileage reports for tax preparation',
          'Separate business and personal miles for accurate reporting',
        ],
      },
      {
        title: 'Reports',
        content: [
          'Generate mileage reports for any date range',
          'View total miles, business miles, and deduction amounts',
          'Filter by vehicle or trip type',
          'Export reports as PDF or CSV',
        ],
      },
    ],
  },
  {
    id: 'calendar',
    title: 'Calendar & Scheduling',
    description:
      'Manage your booked runs and schedule with an intuitive monthly calendar interface.',
    steps: [
      'Open the Calendar page to view your monthly schedule.',
      'Click on any date to add a new booked run.',
      'Enter run details: customer, origin, destination, estimated dates.',
      'Set the run status: Confirmed, Tentative, Completed, or Cancelled.',
      'Add estimated miles and rate for planning purposes.',
      'Add notes or special instructions.',
      'Save the run. It will appear on your calendar with color-coded status.',
    ],
    subsections: [
      {
        title: 'Calendar Views',
        content: [
          'Monthly grid view shows all runs at a glance',
          'Color-coded statuses for quick identification',
          'Click any run to view or edit details',
          'Navigate between months easily',
        ],
      },
      {
        title: 'Double-Booking Detection',
        content: [
          'The app warns you if you try to schedule overlapping runs',
          'Review conflicts before confirming bookings',
          'Helps prevent scheduling mistakes',
        ],
      },
      {
        title: 'Upcoming Runs List',
        content: [
          'View a list of all upcoming runs',
          'Filter by status or date range',
          'Quick access to run details and customer information',
        ],
      },
    ],
  },
  {
    id: 'reports',
    title: 'Financial Reports',
    description:
      'Generate comprehensive financial reports for your business and tax preparation.',
    steps: [
      'Navigate to the Reports page from the main menu.',
      'Select the report type: Profit & Loss, Expense Summary, or Tax Summary.',
      'Choose a date range for the report.',
      'Apply any additional filters (categories, customers, etc.).',
      'Click "Generate Report" to view the results.',
      'Export the report as PDF or CSV if needed.',
    ],
    subsections: [
      {
        title: 'Profit & Loss Report',
        content: [
          'Shows total revenue, expenses, and net profit',
          'Breakdown by month or custom date range',
          'Compare periods to track business growth',
          'Perfect for understanding your business financial health',
        ],
      },
      {
        title: 'Expense Summary',
        content: [
          'View expenses grouped by category',
          'See which categories you spend the most on',
          'Identify areas for cost reduction',
          'Export for accounting software integration',
        ],
      },
      {
        title: 'Tax Summary',
        content: [
          'Summary of all tax-deductible expenses',
          'Mileage deduction totals',
          'Business expense breakdown',
          'Export for tax preparation',
        ],
      },
    ],
  },
  {
    id: 'settings',
    title: 'Settings & Preferences',
    description:
      'Configure your business information, default rates, and application preferences.',
    subsections: [
      {
        title: 'Business Information',
        content: [
          'Update your business name, address, and contact information',
          'Set your tax ID or EIN',
          'Configure default invoice terms and payment methods',
          'This information appears on all invoices',
        ],
      },
      {
        title: 'Default Rates',
        content: [
          'Set default rates for each billing type',
          'Rates can be overridden when creating individual invoices',
          'Update rates as your pricing changes',
        ],
      },
      {
        title: 'Preferences',
        content: [
          'Choose date format, currency, and number formats',
          'Set default invoice numbering',
          'Configure reminder settings',
          'Customize dashboard display options',
        ],
      },
    ],
  },
  {
    id: 'sync',
    title: 'Mobile Sync',
    description:
      'Sync your data between desktop and mobile apps seamlessly.',
    steps: [
      'Ensure both devices are on the same network.',
      'Open Pilot Car Admin on your desktop computer.',
      'Open the mobile app on your phone or tablet.',
      'Both apps will automatically discover each other on the network.',
      'Initiate sync from either device.',
      'Review any conflicts (if data was changed on both devices).',
      'Confirm sync to complete the process.',
    ],
    tips: [
      'Sync regularly to keep data up to date on all devices',
      'The app handles conflict resolution automatically',
      'All data is encrypted during transfer',
      'You can sync manually or set up automatic sync intervals',
    ],
  },
  {
    id: 'tips',
    title: 'Tips & Best Practices',
    description:
      'Get the most out of Pilot Car Admin with these helpful tips.',
    subsections: [
      {
        title: 'Daily Workflow',
        content: [
          'Start each day by reviewing your calendar for scheduled runs',
          'Create invoices immediately after completing a run',
          'Record expenses and mileage as they occur',
          'Review your dashboard weekly to track business performance',
        ],
      },
      {
        title: 'Staying Organized',
        content: [
          'Use consistent naming conventions for customers and destinations',
          'Categorize expenses consistently for better reporting',
          'Set up category rules to automate expense categorization',
          'Keep customer information up to date',
        ],
      },
      {
        title: 'Tax Preparation',
        content: [
          'Run monthly expense and mileage reports',
          'Export reports at year-end for tax preparation',
          'Keep receipts organized using the receipt attachment feature',
          'Use the Tax Summary report to see all deductible expenses',
        ],
      },
      {
        title: 'Backup & Data Safety',
        content: [
          'Your data is stored locally on your device',
          'Regularly backup your data folder (located in AppData)',
          'Use mobile sync as an additional backup method',
          'Export important reports and save them separately',
        ],
      },
    ],
  },
];

export default function UserGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-center">
            User Guide
          </h1>
          <p className="text-xl text-primary-100 text-center max-w-2xl mx-auto">
            Learn how to use Pilot Car Admin to manage your pilot car business efficiently.
            From creating invoices to tracking expenses, this guide covers everything you need to know.
          </p>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-8 bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {guideSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-3 py-1 text-sm text-gray-700 hover:text-primary-800 hover:bg-primary-50 rounded-md transition-colors"
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Guide Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {guideSections.map((section, index) => (
            <Card key={section.id} id={section.id} className="scroll-mt-24">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-primary-800">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {section.description}
                  </p>
                </div>

                {section.steps && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Step-by-Step Instructions
                    </h3>
                    <ol className="space-y-2 list-decimal list-inside">
                      {section.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-gray-700 leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {section.subsections && (
                  <div className="space-y-6">
                    {section.subsections.map((subsection, subIndex) => (
                      <div key={subIndex}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {subsection.title}
                        </h3>
                        <ul className="space-y-2">
                          {subsection.content.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className="flex items-start text-gray-700"
                            >
                              <svg
                                className="w-5 h-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {section.tips && (
                  <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      💡 Tips
                    </h3>
                    <ul className="space-y-1">
                      {section.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-gray-700">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Help Section */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need More Help?
          </h2>
          <p className="text-gray-600 mb-6">
            If you can&apos;t find what you&apos;re looking for in this guide, we&apos;re here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex justify-center rounded-md bg-primary-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/features"
              className="inline-flex justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              View Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
