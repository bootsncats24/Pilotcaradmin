import type { Metadata } from 'next';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Support · Pilot Car Admin 2026',
  description:
    'Get help with installing, activating, and using Pilot Car Admin 2026.',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Support</h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">
            Need help with Pilot Car Admin 2026? Start here.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Common Support Resources
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li>
                <Link href="/user-guide" className="text-primary-800 hover:underline">
                  Read the User Guide
                </Link>{' '}
                for step-by-step instructions on invoices, expenses, mileage, calendar, and more.
              </li>
              <li>
                <Link href="/faq" className="text-primary-800 hover:underline">
                  Visit the FAQ
                </Link>{' '}
                for quick answers about licensing, offline use, and updates.
              </li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Support
            </h2>
            <p className="text-gray-700 mb-4">
              If you can&apos;t find the answer you need in the User Guide or FAQ, you can reach us
              directly:
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Email (preferred for most questions):
            </p>
            <p className="font-mono text-primary-800 text-lg mb-4">
              siteopsstudio@gmail.com
            </p>
            <p className="text-gray-700 text-sm">
              When you contact support, please include your license key (if available), a brief
              description of the issue, and any error messages you see. This helps us resolve your
              issue faster.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}

