import type { Metadata } from 'next';
import Card from '@/components/ui/Card';
import FAQSection from '@/components/sections/FAQ';

export const metadata: Metadata = {
  title: 'FAQ · Pilot Car Admin 2026',
  description:
    'Frequently asked questions about Pilot Car Admin 2026 — offline bookkeeping and invoicing software for pilot car drivers.',
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Answers to common questions about Pilot Car Admin 2026, licensing, offline use,
            and how it fits into your pilot car business.
          </p>
        </div>
      </section>

      {/* FAQ content reusing homepage FAQ section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white">
            <FAQSection />
          </Card>
        </div>
      </section>
    </div>
  );
}

