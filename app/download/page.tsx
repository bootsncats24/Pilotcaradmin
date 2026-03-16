import type { Metadata } from 'next';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Download · Pilot Car Admin 2026',
  description:
    'Download Pilot Car Admin 2026 for Windows and learn how to activate your license.',
};

const GUMROAD_URL = 'https://gumroad.com/l/your-product-id';

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Download Pilot Car Admin 2026
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">
            Get the Windows desktop installer and start managing your pilot car business offline.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Step 1 — Purchase Your License
            </h2>
            <p className="text-gray-700 mb-4">
              Pilot Car Admin 2026 is a one-time purchase. There are no subscriptions or monthly
              fees.
            </p>
            <Link
              href={GUMROAD_URL}
              className="inline-flex justify-center rounded-md bg-primary-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
            >
              Go to Secure Checkout
            </Link>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Step 2 — Download & Install
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>After purchase, you&apos;ll receive a download link via email.</li>
              <li>Download the Windows installer (.exe) from your purchase email.</li>
              <li>Run the installer and follow the prompts to install Pilot Car Admin 2026.</li>
            </ol>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Step 3 — Activate Your License
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Open Pilot Car Admin 2026 after installation.</li>
              <li>Copy your license key from the email (format: XXXX-XXXX-XXXX-XXXX).</li>
              <li>Paste the license key into the activation screen and click Activate.</li>
              <li>Once activated, the app works completely offline.</li>
            </ol>
          </Card>

          <p className="text-center text-gray-600 text-sm">
            If you have any trouble downloading or activating the app, please{' '}
            <Link href="/support" className="text-primary-800 hover:underline">
              visit Support
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

