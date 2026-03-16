import Card from '@/components/ui/Card';
import Image from 'next/image';
import imageMetadata from '@/lib/image-metadata.json';

interface FeatureDetail {
  title: string;
  description: string;
  features: string[];
  imageSlug?: string; // Slug to look up image in homeFeatures
}

const featureDetails: FeatureDetail[] = [
  {
    title: 'Professional Invoicing',
    description:
      'Create and manage professional invoices with multiple billing types designed for pilot car drivers.',
    features: [
      'Multiple billing types: By Mile, Mini Run, Day Rate, Hourly, Chase/Pole',
      'Custom extras and overnight rates',
      'Invoice status tracking (Draft, Sent, Paid, Overdue, Cancelled)',
      'PDF export and printing',
      'Invoice reminders and overdue detection',
      'Search and filter invoices',
    ],
    imageSlug: 'invoice',
  },
  {
    title: 'Customer & Destination Management',
    description:
      'Organize customer information and track frequently used destinations with ease.',
    features: [
      'Store customer details (address, phone, email, tax ID)',
      'Multiple phone numbers, emails, and addresses per customer',
      'Track destinations with addresses and distances',
      'Quick access to frequently used locations',
      'Customer and destination search',
      'CSV import for bulk customer creation',
    ],
    imageSlug: undefined, // No screenshot available
  },
  {
    title: 'Expense Tracking',
    description:
      'Track all your business expenses with receipt scanning, CSV import, and category organization.',
    features: [
      'Receipt scanning with OCR technology (mobile app only)',
      'CSV import from bank statements',
      'Transaction management and categorization',
      'Bill tracking and recurring payments',
      'Category rules for automatic categorization',
      'Duplicate detection based on date and amount',
    ],
    imageSlug: 'expenses',
  },
  {
    title: 'Mileage Tracking',
    description:
      'Track vehicle mileage for accurate tax deduction calculations.',
    features: [
      'Track business vs personal miles',
      'Multiple vehicle support',
      'Tax deduction calculations',
      'Mileage reports and summaries',
      'Date range filtering',
    ],
    imageSlug: 'mileage-tracking',
  },
  {
    title: 'Calendar & Scheduling',
    description:
      'Manage your booked runs and schedule with an intuitive monthly calendar interface. Track run statuses, locations, and estimates all in one place.',
    features: [
      'Monthly calendar grid view with color-coded statuses',
      'Add, edit, and delete runs directly from calendar',
      'Multi-day run support with estimated end dates',
      'Double-booking detection and warnings',
      'Upcoming runs list view',
      'Customer and destination association',
      'Estimated miles and rate tracking',
      'Notes field for additional details',
    ],
    imageSlug: 'calendar',
  },
  {
    title: 'Financial Reports',
    description:
      'Generate comprehensive financial reports for your business and tax preparation.',
    features: [
      'Profit & Loss reports',
      'Expense by category summaries',
      'Tax summary reports',
      'Date range filtering',
      'Export capabilities',
    ],
    imageSlug: undefined, // No screenshot available
  },
  {
    title: 'Offline Operation',
    description:
      'Works completely offline. No internet connection required for day-to-day operations.',
    features: [
      'Full functionality without internet',
      'Local database storage',
      'Secure data on your device',
      'Fast performance',
    ],
    imageSlug: undefined, // No screenshot available
  },
  {
    title: 'Mobile Sync',
    description:
      'Sync your data between desktop and mobile apps seamlessly.',
    features: [
      'Automatic sync between devices',
      'Network discovery',
      'Secure data transfer',
      'Conflict resolution',
    ],
    imageSlug: undefined, // No screenshot available
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Powerful Features for Pilot Car Drivers
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Everything you need to manage your business efficiently and
              professionally
            </p>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {featureDetails.map((feature, index) => {
              const imageFilename = feature.imageSlug 
                ? (imageMetadata.homeFeatures as Record<string, string>)[feature.imageSlug]
                : null;
              const imageUrl = imageFilename 
                ? `/images/features/${imageFilename}`
                : null;
              const isEven = index % 2 === 0;
              
              return (
                <Card key={index} className="hover:border-primary-300 overflow-hidden">
                  <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}>
                    {/* Image Section */}
                    {imageUrl ? (
                      <div className={`flex-shrink-0 w-full lg:w-1/2 ${isEven ? 'lg:pr-4' : 'lg:pl-4'}`}>
                        <div className="relative w-full aspect-video lg:aspect-square rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-gray-50">
                          <Image
                            src={imageUrl}
                            alt={`${feature.title} screenshot`}
                            fill
                            className="object-contain"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className={`flex-shrink-0 w-full lg:w-1/2 ${isEven ? 'lg:pr-4' : 'lg:pl-4'}`}>
                        <div className="relative w-full aspect-video lg:aspect-square rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 flex flex-col items-center justify-center p-8">
                          <div className="text-7xl mb-4 opacity-60">📋</div>
                          <p className="text-primary-700 text-sm font-medium text-center opacity-70">
                            Screenshot coming soon
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Content Section */}
                    <div className="flex-1 w-full lg:w-1/2">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {feature.title}
                      </h2>
                      <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                        {feature.description}
                      </p>
                      <ul className="space-y-3">
                        {feature.features.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="flex items-start text-gray-700"
                          >
                            <svg
                              className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0 mt-0.5"
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
                            <span className="text-base leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
