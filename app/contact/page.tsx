import type { Metadata } from 'next';
import Card from '@/components/ui/Card';

const DISCORD_INVITE_URL =
  process.env.NEXT_PUBLIC_DISCORD_INVITE_URL?.trim() || 'https://discord.gg/EJcMCTSn';

export const metadata: Metadata = {
  title: 'Contact · Pilot Car Admin 2026',
  description:
    'Get in touch with the Pilot Car Admin team for support, onboarding questions, and general inquiries about the software.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero / Intro */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Contact Pilot Car Admin</h1>
          <p className="text-xl text-primary-100 mb-3">
            Questions about setup, licensing, or whether Pilot Car Admin is right for your pilot car
            business?
          </p>
          <p className="text-primary-100">
            Send us an email and we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h2>
            <p className="text-gray-700 text-base sm:text-lg mb-8">
              Have questions about Pilot Car Admin? Need help with installation or activation? 
              Want to share feedback or request a feature?
            </p>
            <div className="mb-8">
              <p className="text-gray-600 text-sm mb-4">Email us at:</p>
              <a
                href="mailto:siteopsstudio@gmail.com"
                className="inline-block text-2xl sm:text-3xl font-mono text-primary-800 hover:text-primary-700 transition-colors break-all"
              >
                siteopsstudio@gmail.com
              </a>
            </div>
            <div className="mb-8">
              <p className="text-gray-600 text-sm mb-4">Join our Discord community:</p>
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-primary-700 text-white px-6 py-3 font-semibold hover:bg-primary-800 transition-colors"
              >
                Join Discord
              </a>
            </div>
            <p className="text-gray-600 text-sm">
              We typically respond within 24-48 hours.
            </p>
          </Card>

          <div className="mt-12 space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">How we can help</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Answer questions before purchasing a license</li>
              <li>Help with installing or activating the desktop app</li>
              <li>Provide support and troubleshooting assistance</li>
              <li>Listen to feedback and feature requests</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

