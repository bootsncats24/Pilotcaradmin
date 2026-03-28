export interface FeatureSection {
  title: string;
  description: string;
  features?: string[];
  image?: string;
  ctaText?: string;
}

export interface FeatureFAQ {
  question: string;
  answer: string;
}

export interface FeatureData {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  heroDescription: string;
  /** Short callout shown under the hero (e.g. new capability). */
  heroHighlight?: string;
  sections: FeatureSection[];
  faqs: FeatureFAQ[];
  relatedFeatures: string[];
}

export const featuresData: Record<string, FeatureData> = {
  invoice: {
    id: 'invoice',
    slug: 'invoice',
    title: 'Invoicing',
    tagline: 'Professional invoicing built for pilot car operators',
    description: 'Create professional invoices with multiple billing types, track payment status automatically, and export PDFs. Perfect for pilot car businesses that need flexible billing options.',
    heroDescription:
      'Create professional invoices in minutes with multiple billing types, automatic status tracking, and PDF export. Track runs, destinations, and payments all in one place.',
    sections: [
      {
        title: 'Flexible billing for every type of run',
        description: 'Pilot Car Admin supports all the billing types you need for your pilot car business. Create invoices for standard runs, mini runs, day rates, hourly work, and chase/pole jobs. Add custom extras and overnight rates to capture every charge.',
        features: [
          'Multiple billing types: By Mile, Mini Run, Day Rate, Hourly, Chase/Pole',
          'Track pickup and delivery destinations for each run',
          'Run date tracking and mileage calculation',
          'Custom extras and overnight rates',
          'Simple custom invoices for non-standard billing',
        ],
      },
      {
        title: 'Automatic status management',
        description: 'Stop manually tracking invoice status. Pilot Car Admin automatically marks invoices as overdue when due dates pass, and updates payment status when you record a payment date. Focus on your business, not paperwork.',
        features: [
          'Automatic overdue detection for sent invoices',
          'Automatic payment status updates when payment date is set',
          'Full status tracking: Draft, Sent, Paid, Overdue, Cancelled',
          'Manual invoice reminders for follow-ups',
          'Payment type and date tracking',
          'Upcoming reminders dashboard',
        ],
      },
      {
        title: 'Professional invoices ready to share',
        description:
          'Export professional PDF invoices with your company logo and branding. Print invoices directly or share them via email. Invoice CSV Import on the desktop pulls in bulk lines from spreadsheets—or from a CSV drivers exported from the optional complementary phone app (fleets), which only exists to feed this same Pilot Car Admin workflow; rates and PDFs stay here on Windows.',
        features: [
          'PDF export with company logo and branding',
          'Print invoices directly from the app',
          'Invoice CSV Import for bulk lines with column mapping',
          'Custom invoice option (simple line items for non-standard billing)',
          'Customer and destination management',
          'Fleets — optional complementary mobile run log: drivers log runs on a phone (no rates there); export CSV; office imports in Pilot Car Admin above',
          'Phone app includes saved customers/places, driver or truck per run, overnight nights—aligned with Admin import columns',
        ],
      },
    ],
    faqs: [
      {
        question: 'What billing types does Pilot Car Admin support?',
        answer: 'Pilot Car Admin supports five billing types: By Mile (standard mileage billing), Mini Run (fixed rate per run), Day Rate (daily rate billing), Hourly (hourly rate billing), and Chase/Pole (specialized chase/pole billing). You can also create custom invoices with simple line items.',
      },
      {
        question: 'How does automatic overdue detection work?',
        answer: 'When an invoice has a due date that has passed and its status is "Sent", Pilot Car Admin automatically marks it as "Overdue". This happens automatically when you view your invoices, so you always know which invoices need attention.',
      },
      {
        question: 'Can I track pickup and delivery locations?',
        answer: 'Yes! Each invoice item can include a "From" and "To" destination. You can select from your saved destinations or enter custom location names. This information is included on your invoices and PDF exports.',
      },
      {
        question: 'Are my invoices safe and secure?',
        answer: 'Absolutely. All your invoice data is stored locally on your device. Your data never leaves your computer unless you choose to export it. You can also sync between devices using the mobile app.',
      },
      {
        question: 'Can I export invoices as PDFs?',
        answer: 'Yes! You can export any invoice as a professional PDF that includes your company logo, customer information, all invoice items with destinations, extras, and totals. PDFs are perfect for emailing to clients or printing.',
      },
      {
        question: 'Can I import invoices from a spreadsheet?',
        answer: 'Yes. Pilot Car Admin includes Invoice CSV Import on the desktop. You map columns (customer, dates, billing type, miles, from/to, description, notes, overnight nights, and more) and preview before committing. That is the office-side tool—not the same thing as the field app.',
      },
      {
        question: 'Is there an optional mobile run log for fleets?',
        answer:
          'Yes—optional, and it goes with Pilot Car Admin. It is a small companion for drivers to log runs on a phone (no rates stored there). They export CSV; the office imports with Invoice CSV Import in Pilot Car Admin on Windows, where rates, invoices, and PDFs are handled.',
      },
    ],
    relatedFeatures: ['expenses', 'mileage-tracking'],
  },
  expenses: {
    id: 'expenses',
    slug: 'expenses',
    title: 'Expenses',
    tagline: 'Expense tracking that keeps you organized',
    description: 'Keep track of your expenses with mobile receipt scanning, bank account imports, and automated expense categorization.',
    heroDescription: 'Keep track of your expenses with mobile receipt scanning, bank account imports, and automated expense categorization.',
    sections: [
      {
        title: 'Track receipts with OCR scanning',
        description: 'Never lose a receipt again. Use our mobile app to scan receipts with OCR technology that automatically extracts the information you need. (Note: Receipt scanning is available on mobile devices only.)',
        features: [
          'Mobile receipt scanning (Android app)',
          'OCR text extraction using ML Kit',
          'Automatic date and amount detection',
          'Photo storage with receipts',
          'Manual entry option if OCR fails',
        ],
      },
      {
        title: 'Import from bank statements',
        description: 'Import your expenses directly from CSV files exported from your bank. Save time by bulk importing transactions instead of entering them one by one.',
        features: [
          'CSV import support for bank statements',
          'Automatic transaction parsing',
          'Duplicate detection based on date and amount',
          'Bulk categorization with auto-categorization rules',
        ],
      },
      {
        title: 'Organize by category',
        description: 'Categorize your expenses for easy tax preparation. Set up category rules to automatically categorize similar expenses.',
        features: [
          'Custom expense categories',
          'Category rules for auto-categorization (keyword matching)',
          'Built-in auto-categorization for common vendors',
          'Bill tracking and recurring bills',
          'Category-based reporting',
        ],
      },
    ],
    faqs: [
      {
        question: 'How does receipt scanning work?',
        answer: 'Use the Android mobile app to take a photo of your receipt. Our OCR technology (using Google ML Kit) extracts the date, amount, and merchant information automatically. If OCR fails, you can manually enter the receipt information. Note: Receipt scanning is only available on mobile devices, not on the desktop app.',
      },
      {
        question: 'Can I import expenses from my bank?',
        answer: 'Yes! Export your bank statements as CSV files and import them directly into Pilot Car Admin. The system will parse the transactions for you.',
      },
      {
        question: 'How do I categorize expenses?',
        answer: 'You can create custom categories and set up rules to automatically categorize expenses based on merchant names or keywords.',
      },
    ],
    relatedFeatures: ['invoice', 'mileage-tracking'],
  },
  'mileage-tracking': {
    id: 'mileage-tracking',
    slug: 'mileage-tracking',
    title: 'Mileage Tracking',
    tagline: 'Track mileage for accurate tax deductions',
    description: 'Track vehicle mileage for tax deductions. Separate business and personal miles, support multiple vehicles, and generate mileage reports.',
    heroDescription: 'Track vehicle mileage for tax deductions. Separate business and personal miles, support multiple vehicles, and generate mileage reports.',
    sections: [
      {
        title: 'Track business vs personal miles',
        description: 'Easily separate your business miles from personal miles. This ensures accurate tax deductions and helps you maximize your deductions.',
        features: [
          'Business and personal mileage separation',
          'Trip tracking',
          'Automatic mileage calculations',
          'Tax deduction calculations',
        ],
      },
      {
        title: 'Support multiple vehicles',
        description: 'Track mileage for multiple vehicles. Perfect for drivers who use different vehicles for different jobs.',
        features: [
          'Multiple vehicle support',
          'Vehicle-specific tracking',
          'Per-vehicle reports',
          'Vehicle information management',
        ],
      },
      {
        title: 'Generate mileage reports',
        description: 'Create comprehensive mileage reports for tax time. Filter by date range and export for your accountant.',
        features: [
          'Date range filtering',
          'Mileage summary reports',
          'Tax deduction summaries',
          'Export capabilities',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do I track my mileage?',
        answer: 'Simply log your trips in Pilot Car Admin. Enter the starting and ending odometer readings, or enter the distance manually. The system will calculate your business miles.',
      },
      {
        question: 'Can I track multiple vehicles?',
        answer: 'Yes! You can add multiple vehicles and track mileage for each one separately. This is perfect for drivers who use different vehicles.',
      },
      {
        question: 'How do I calculate tax deductions?',
        answer: 'Pilot Car Admin automatically calculates your tax deductions based on the current IRS mileage rate and your business miles.',
      },
    ],
    relatedFeatures: ['expenses', 'invoice'],
  },
  calendar: {
    id: 'calendar',
    slug: 'calendar',
    title: 'Calendar & Scheduling',
    tagline: 'Manage your schedule with ease',
    description: 'Manage your booked runs and schedule with an intuitive calendar interface. Keep track of all your appointments and runs in one place.',
    heroDescription: 'Manage your booked runs and schedule with an intuitive calendar interface. Keep track of all your appointments and runs in one place.',
    sections: [
      {
        title: 'Monthly calendar view',
        description: 'See all your booked runs at a glance with a clean, intuitive monthly calendar interface. Color-coded run statuses make it easy to see your schedule at a glance.',
        features: [
          'Monthly calendar grid view of all booked runs',
          'Color-coded status indicators (pending, confirmed, completed, cancelled)',
          'Visual schedule overview with run descriptions',
          'Today highlighting and past date indicators',
          'Quick navigation between months',
        ],
      },
      {
        title: 'Run management',
        description: 'Easily add, edit, and delete runs directly from the calendar. Click any date to add a new run, or click an existing run to edit it.',
        features: [
          'Add new runs by clicking any date',
          'Edit runs directly from the calendar',
          'Delete runs with confirmation',
          'Multi-day run support with estimated end dates',
          'Customer and destination association',
          'Manual customer entry (create on the fly)',
        ],
      },
      {
        title: 'Run details and tracking',
        description: 'Track comprehensive details for each run including locations, estimates, and status. Keep detailed notes and monitor your upcoming schedule.',
        features: [
          'Run status tracking (pending, confirmed, completed, cancelled)',
          'From and to location tracking',
          'Estimated miles and rate tracking',
          'Notes field for additional information',
          'Upcoming runs list view',
          'Date-based filtering by month',
        ],
      },
      {
        title: 'Smart scheduling features',
        description: 'Avoid scheduling conflicts and stay organized with intelligent calendar features designed for pilot car drivers.',
        features: [
          'Double-booking detection and warnings',
          'Quick "Today" button for instant navigation',
          'Upcoming runs automatically filtered (excludes completed/cancelled)',
          'Run details visible in calendar cells',
          'Customer names displayed on runs',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do I view my schedule?',
        answer: 'Navigate to the Calendar section to see all your booked runs in a monthly calendar view. You can navigate between months using the Previous/Next buttons or click "Today" to jump to the current month.',
      },
      {
        question: 'Can I add runs to my calendar?',
        answer: 'Yes! You can add new runs by clicking the "New Run" button or by clicking directly on any date in the calendar. The calendar will warn you if you try to schedule overlapping runs.',
      },
      {
        question: 'How do I track run status?',
        answer: 'Each run in your calendar shows its current status with color coding: green for confirmed, yellow for pending, blue for completed, and red for cancelled. You can update the status when editing a run.',
      },
      {
        question: 'Can I schedule multi-day runs?',
        answer: 'Yes! When creating or editing a run, you can set an estimated end date. The run will appear on all days between the start and end date in the calendar.',
      },
    ],
    relatedFeatures: ['invoice', 'expenses'],
  },
  jobs: {
    id: 'jobs',
    slug: 'jobs',
    title: 'Everything Tied to the Job',
    tagline: 'Customers, destinations, runs, and invoices—all connected',
    description: 'Customers, destinations, runs, and invoices—all connected. Every job keeps its customer, destination, mileage, and billing history together—so nothing gets lost between runs.',
    heroDescription: 'Every job keeps its customer, destination, mileage, and billing history together—so nothing gets lost between runs. Built for how pilot car drivers actually work.',
    sections: [
      {
        title: 'Complete job history in one place',
        description: 'Every run, invoice, and transaction is tied to its job. See the full picture of each job from start to finish—who you worked for, where you went, what you billed, and what you spent.',
        features: [
          'Customer information linked to every job',
          'Destination tracking for pickup and delivery',
          'Invoice history tied to each run',
          'Expense tracking per job',
          'Mileage records connected to runs',
          'Complete audit trail for every job',
        ],
      },
      {
        title: 'Never lose track of job details',
        description: 'Stop searching through separate lists. All the information you need for each job is right where you expect it—connected and organized.',
        features: [
          'Customer contact info accessible from any job',
          'Destination addresses saved and reusable',
          'Run dates and status tracking',
          'Billing history for each customer',
          'Payment tracking tied to invoices',
          'Notes and details preserved',
        ],
      },
      {
        title: 'Built for pilot car workflows',
        description: 'Pilot Car Admin understands that every job has multiple pieces—a customer, destinations, a run, and eventually an invoice. Everything stays connected so you can focus on driving, not data entry.',
        features: [
          'Quick access to customer details from any screen',
          'Reuse destinations across multiple jobs',
          'Automatic invoice creation from run details',
          'Mileage automatically associated with runs',
          'Expense tracking linked to specific jobs',
          'Search and filter by customer or destination',
        ],
      },
    ],
    faqs: [
      {
        question: 'How does job tracking work?',
        answer: 'Every run you create is automatically linked to a customer and destination. When you create an invoice, it\'s tied to that run. All expenses and mileage can be associated with specific jobs, creating a complete history of each job.',
      },
      {
        question: 'Can I see all invoices for a specific customer?',
        answer: 'Yes! When you view a customer, you can see all their associated runs, invoices, and payment history. This makes it easy to track your relationship with each customer over time.',
      },
      {
        question: 'What if I need to reuse a destination?',
        answer: 'Destinations are saved and can be reused across multiple jobs. Just select from your saved destinations when creating a new run or invoice—no need to re-enter the same addresses.',
      },
      {
        question: 'How do I track expenses for a specific job?',
        answer: 'When creating an expense, you can optionally associate it with a specific run or customer. This helps you track job profitability and makes tax time easier.',
      },
    ],
    relatedFeatures: ['invoice', 'expenses', 'mileage-tracking'],
  },
  offline: {
    id: 'offline',
    slug: 'offline',
    title: 'Offline-First by Design',
    tagline: 'Works without service—syncs when you\'re ready',
    description: 'Works without service—syncs when you\'re ready. Pilot Car Admin runs fully offline. Track jobs, mileage, expenses, and invoices all day, then sync across devices when convenient.',
    heroDescription: 'Pilot Car Admin runs fully offline. Track jobs, mileage, expenses, and invoices all day, then sync across devices when convenient. No internet required for your daily work.',
    sections: [
      {
        title: 'Full functionality without internet',
        description: 'Work anywhere, anytime—even in areas with no cell service. Pilot Car Admin stores all your data locally, so you can create invoices, track mileage, log expenses, and manage your schedule without any internet connection.',
        features: [
          'Complete feature set works offline',
          'Local database storage on your device',
          'No cloud dependency for daily operations',
          'Fast performance without network delays',
          'Works in remote areas with no service',
          'Data always available when you need it',
        ],
      },
      {
        title: 'Sync when you\'re ready',
        description: 'When you have internet access, sync your data between devices. Your desktop and mobile apps stay in sync, but you control when the sync happens—not the cloud.',
        features: [
          'Manual sync when you choose',
          'Bidirectional sync between devices',
          'Automatic conflict resolution',
          'Network discovery for local sync',
          'Secure peer-to-peer data transfer',
          'No cloud account required',
        ],
      },
      {
        title: 'Your data, your control',
        description: 'All your business data stays on your devices. No cloud storage means no data breaches, no subscription fees, and no dependency on internet connectivity. You own and control your data completely.',
        features: [
          'Data stored locally on your device',
          'No cloud storage or accounts',
          'Complete privacy and security',
          'No monthly subscription fees',
          'Works even if service goes down',
          'Full backup and export capabilities',
        ],
      },
    ],
    faqs: [
      {
        question: 'Do I need internet to use Pilot Car Admin?',
        answer: 'No! Pilot Car Admin works completely offline. You only need internet if you want to sync data between your desktop and mobile devices. All daily operations work without any internet connection.',
      },
      {
        question: 'How do I sync between devices?',
        answer: 'When both devices are on the same network, you can sync manually from the settings. The apps will discover each other and securely transfer data. You control when sync happens.',
      },
      {
        question: 'What if I lose my device?',
        answer: 'You can export your data at any time to create backups. We recommend regularly exporting your data to an external drive or cloud storage of your choice for backup purposes.',
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes! Since your data is stored locally on your device and never sent to the cloud, it\'s as secure as your device itself. You have complete control over your data.',
      },
    ],
    relatedFeatures: ['sync', 'security'],
  },
  sync: {
    id: 'sync',
    slug: 'sync',
    title: 'Sync That Just Works',
    tagline: 'Your data stays in sync between desktop and mobile (coming soon)',
    description: 'Your data stays in sync between desktop and mobile (mobile app coming soon). Offline-first with secure, bidirectional sync between devices. No accounts, no cloud dependency, no surprise conflicts.',
    heroDescription: 'Offline-first with secure, bidirectional sync between devices. No accounts, no cloud dependency, no surprise conflicts. Your data, synced your way.',
    sections: [
      {
        title: 'Bidirectional sync made simple',
        description: 'Sync your data between desktop and mobile devices seamlessly once the mobile app is released. Changes on one device automatically appear on the other. No manual import/export needed—just sync and go.',
        features: [
          'Automatic bidirectional data sync',
          'Sync invoices, expenses, mileage, and more',
          'Network discovery for easy connection',
          'Secure peer-to-peer transfer',
          'No cloud servers involved',
          'Works on local network',
        ],
      },
      {
        title: 'Smart conflict resolution',
        description: 'When the same data is edited on both devices, Pilot Car Admin intelligently resolves conflicts. You\'ll never lose data or end up with duplicate entries.',
        features: [
          'Automatic conflict detection',
          'Smart merge strategies',
          'Last-write-wins for simple conflicts',
          'Manual resolution for complex cases',
          'Conflict notifications',
          'Data integrity maintained',
        ],
      },
      {
        title: 'No accounts, no hassle',
        description: 'Unlike cloud-based apps, Pilot Car Admin doesn\'t require accounts, logins, or subscriptions. Just connect your devices on the same network and sync. Simple and secure.',
        features: [
          'No account creation required',
          'No email or password needed',
          'No cloud dependency',
          'No subscription fees',
          'Direct device-to-device sync',
          'Complete privacy',
        ],
      },
    ],
    faqs: [
      {
        question: 'How does syncing work?',
        answer: 'When both your desktop and mobile devices are on the same network, you can sync from the settings. The apps discover each other automatically and securely transfer data between devices.',
      },
      {
        question: 'What happens if I edit the same invoice on both devices?',
        answer: 'Pilot Car Admin uses smart conflict resolution. Generally, the last edit wins, but the system will notify you if there are complex conflicts that need manual attention.',
      },
      {
        question: 'Do I need to be online to sync?',
        answer: 'You need both devices on the same local network (WiFi), but you don\'t need internet access. The sync happens directly between your devices.',
      },
      {
        question: 'Is syncing secure?',
        answer: 'Yes! Sync happens directly between your devices on your local network. No data goes through the cloud or external servers. It\'s as secure as your local network.',
      },
    ],
    relatedFeatures: ['offline', 'security'],
  },
  security: {
    id: 'security',
    slug: 'security',
    title: 'Built Secure from the Ground Up',
    tagline: 'Your business data stays yours',
    description: 'Your business data stays yours. App lock, auto-lock, license validation, tamper detection, and local-first storage—designed for independent operators.',
    heroDescription: 'App lock, auto-lock, license validation, tamper detection, and local-first storage—designed for independent operators who value privacy and security.',
    sections: [
      {
        title: 'Local-first security',
        description: 'Your data never leaves your device unless you explicitly export it. No cloud storage means no data breaches, no third-party access, and complete control over your sensitive business information.',
        features: [
          'All data stored locally on your device',
          'No cloud storage or external servers',
          'Complete data ownership',
          'No third-party data access',
          'Export when you choose',
          'Backup on your terms',
        ],
      },
      {
        title: 'App protection features',
        description: 'Protect your app with app lock and auto-lock features. Your business data stays secure even if someone else has access to your device.',
        features: [
          'App lock with PIN or password',
          'Auto-lock after inactivity',
          'Configurable lock timeout',
          'Secure lock screen',
          'Protection against unauthorized access',
          'Privacy when sharing devices',
        ],
      },
      {
        title: 'License and tamper protection',
        description: 'Pilot Car Admin includes license validation and tamper detection to ensure the integrity of the application and protect against unauthorized modifications.',
        features: [
          'License validation',
          'Tamper detection',
          'Application integrity checks',
          'Secure license storage',
          'Protection against modification',
          'Authentic software guarantee',
        ],
      },
      {
        title: 'Designed for independent operators',
        description: 'Built with the understanding that your business data is sensitive. Pilot Car Admin gives you enterprise-level security without the enterprise-level complexity or cost.',
        features: [
          'Simple security that just works',
          'No complex setup required',
          'Privacy by default',
          'Independent operator focused',
          'No data mining or tracking',
          'Respect for your privacy',
        ],
      },
    ],
    faqs: [
      {
        question: 'Where is my data stored?',
        answer: 'All your data is stored locally on your device in an encrypted database. It never leaves your device unless you explicitly export it. No cloud storage is used.',
      },
      {
        question: 'How does app lock work?',
        answer: 'You can set a PIN or password to lock the app. The app will automatically lock after a period of inactivity that you configure. This protects your data if someone else has access to your device.',
      },
      {
        question: 'Is my data encrypted?',
        answer: 'Yes, your data is stored in an encrypted database on your device. This provides an additional layer of security beyond the app lock features.',
      },
      {
        question: 'What is tamper detection?',
        answer: 'Tamper detection ensures that the application hasn\'t been modified or tampered with. This protects both you and the application from unauthorized changes.',
      },
      {
        question: 'Do you collect or sell my data?',
        answer: 'No. Pilot Car Admin doesn\'t collect, track, or sell any of your data. Your business information stays completely private and under your control.',
      },
    ],
    relatedFeatures: ['offline', 'sync'],
  },
};

export function getFeatureBySlug(slug: string): FeatureData | undefined {
  return featuresData[slug];
}

export function getAllFeatures(): FeatureData[] {
  return Object.values(featuresData);
}
