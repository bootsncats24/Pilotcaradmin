import type { Metadata } from 'next';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund Policy · Pilot Car Admin 2026',
  description:
    'Refund policy for Pilot Car Admin 2026 licenses purchased through Gumroad or other channels.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Refund Policy
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl">
            How refunds are handled for Pilot Car Admin 2026 purchases.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="prose prose-sm sm:prose-base max-w-none">
            <h2>Overview</h2>
            <p>
              Because Pilot Car Admin 2026 is delivered as a digital product with license keys that
              unlock the full software, we generally do not offer refunds once a license key has
              been issued and activated.
            </p>

            <h2>Before You Buy</h2>
            <ul>
              <li>
                We encourage you to review the{' '}
                <Link href="/features">Features</Link> and try the{' '}
                <Link href="/demo">Live Demo</Link> (where available) before purchasing.
              </li>
              <li>
                If you have questions about whether Pilot Car Admin 2026 is a good fit, please{' '}
                <Link href="/contact">contact us</Link> first.
              </li>
            </ul>

            <h2>Refund Eligibility</h2>
            <ul>
              <li>
                Refunds are generally not provided after the license key has been delivered and
                activated.
              </li>
              <li>
                In rare cases (for example, duplicate purchases or technical issues that cannot be
                resolved), refunds may be considered on a case-by-case basis.
              </li>
            </ul>

            <h2>Requesting a Refund</h2>
            <p>
              If you believe you are eligible for a refund (for example, due to a duplicate
              purchase or an unresolved technical issue), please contact us at{' '}
              <span className="font-mono">siteopsstudio@gmail.com</span> with:
            </p>
            <ul>
              <li>Your purchase email address</li>
              <li>Your license key</li>
              <li>The date of purchase</li>
              <li>A brief description of the issue</li>
            </ul>

            <h2>Third-Party Platforms</h2>
            <p>
              If you purchased through a third-party platform such as Gumroad, their specific
              refund policies may also apply. We will work within those policies to resolve any
              issues.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}

