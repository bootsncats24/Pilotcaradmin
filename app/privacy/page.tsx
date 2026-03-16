import type { Metadata } from 'next';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Privacy Policy · Pilot Car Admin 2026',
  description:
    'Privacy policy for Pilot Car Admin 2026, explaining how your data is handled and stored.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl">
            How Pilot Car Admin 2026 handles your data and protects your privacy.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="prose prose-sm sm:prose-base max-w-none">
            <h2>Overview</h2>
            <p>
              Pilot Car Admin 2026 is designed to keep your business data on your own devices.
              The desktop application stores your invoices, customers, expenses, and other records
              locally on your computer, not on our servers.
            </p>

            <h2>Data Storage</h2>
            <ul>
              <li>Business data (invoices, expenses, mileage, customers) is stored locally.</li>
              <li>
                Optional sync between desktop and mobile happens directly over your local network.
              </li>
              <li>
                We do not have access to your local business data unless you explicitly share it
                with us for support.
              </li>
            </ul>

            <h2>Licensing & Payment</h2>
            <ul>
              <li>License purchases are processed securely via Gumroad or another payment provider.</li>
              <li>We do not store your full payment card details on our servers.</li>
              <li>
                We may store your email address and basic license information to manage your
                purchase and provide support.
              </li>
            </ul>

            <h2>Support & Communication</h2>
            <ul>
              <li>
                If you email us, we will receive the information you send (such as your name, email
                address, and any details in your message).
              </li>
              <li>
                Support emails are used only to respond to your request and improve the product.
              </li>
            </ul>

            <h2>Your Choices</h2>
            <ul>
              <li>You can export or back up your data from the app at any time.</li>
              <li>
                You can request that we delete support emails or license records associated with
                your email address where legally and operationally feasible.
              </li>
            </ul>

            <h2>Contact</h2>
            <p>
              If you have questions about this privacy policy, contact us at{' '}
              <span className="font-mono">siteopsstudio@gmail.com</span>.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}

