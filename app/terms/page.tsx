import type { Metadata } from 'next';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Terms of Service · Pilot Car Admin 2026',
  description:
    'Terms of Service for using Pilot Car Admin 2026 and related services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Terms of Service
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl">
            The terms that apply when you purchase and use Pilot Car Admin 2026.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="prose prose-sm sm:prose-base max-w-none">
            <h2>License</h2>
            <p>
              When you purchase Pilot Car Admin 2026, you receive a personal, non-transferable
              license to use the software for your own pilot car business. You may install it on
              multiple devices that you own or control.
            </p>

            <h2>Acceptable Use</h2>
            <ul>
              <li>Do not redistribute, resell, or sublicense the software or license keys.</li>
              <li>Do not attempt to bypass licensing or security mechanisms.</li>
              <li>
                Do not use the software for any illegal activities or to store illegal content.
              </li>
            </ul>

            <h2>Updates</h2>
            <p>
              Your purchase includes updates for the Pilot Car Admin 2026 version, including bug
              fixes and minor feature improvements. We may release new versions or editions in the
              future that are sold separately.
            </p>

            <h2>Data & Backups</h2>
            <p>
              Your business data is stored locally on your devices. You are responsible for
              maintaining backups of your data. We are not responsible for data loss due to device
              failure, accidental deletion, or other issues outside our control.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              The software is provided &quot;as is&quot; without warranties of any kind, express or
              implied. To the maximum extent permitted by law, we are not liable for any indirect,
              incidental, or consequential damages arising from use of the software.
            </p>

            <h2>Support</h2>
            <p>
              We provide email-based support on a best-effort basis. Response times may vary.
              Support is limited to helping you install, activate, and use the software as
              designed.
            </p>

            <h2>Changes to These Terms</h2>
            <p>
              We may update these terms from time to time. When we do, we will update the date at
              the top of this page and, where appropriate, notify customers by email or within the
              app or website.
            </p>

            <h2>Contact</h2>
            <p>
              If you have questions about these terms, contact us at{' '}
              <span className="font-mono">siteopsstudio@gmail.com</span>.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}

