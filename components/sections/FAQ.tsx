'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Do I need an internet connection to use Pilot Car Admin 2026?',
    answer:
      "No. Pilot Car Admin 2026 is built to run completely offline on your Windows computer. All invoices, expenses, customers, and reports are stored locally so you can work even when you're out of cell range. Internet is only needed for optional things like downloading updates or syncing with the mobile app.",
  },
  {
    question: 'What happens to my data? Is it stored in the cloud?',
    answer:
      "Your business data stays on your devices. We don't put your invoices, expenses, or customer information on our servers by default. That means you keep control of your data and can still access it without an internet connection. You can export data or back it up whenever you want.",
  },
  {
    question: 'What exactly is included in the one-time purchase?',
    answer:
      'Your one-time purchase gives you a license for Pilot Car Admin 2026. That includes all features currently in the 2026 version (invoicing, expenses, mileage, calendar, reports, etc.) plus bug fixes and improvements released for the 2026 edition. There is no monthly subscription fee.',
  },
  {
    question: 'Is this “lifetime updates”? What happens if you release Pilot Car Admin 2027?',
    answer:
      'No, the license is not for lifetime updates across every future version. Your purchase covers the Pilot Car Admin 2026 edition and all updates we ship for that edition. If we later release a separate Pilot Car Admin 2027 edition, that would be a new product with its own pricing. Existing customers may be offered discounts, but 2027 would not be free by default.',
  },
  {
    question: 'What is your refund policy?',
    answer:
      'Because license keys unlock the full software permanently, refunds are generally not offered after a key has been delivered and activated. We strongly recommend trying the live demo and reviewing the features before you buy. In rare cases (like duplicate purchases or unresolvable technical issues), we may review refund requests individually.',
  },
  {
    question: 'Does Pilot Car Admin 2026 work on mobile devices?',
    answer:
      "Pilot Car Admin 2026 is built first for Windows desktop. Mobile sync is available now on Android for mileage, expenses, and on-the-road tasks, with local sync back to desktop. iPhone support is planned later and will depend on user demand. The desktop app is still the primary place where your full business data lives.",
  },
  {
    question: 'Can I use Pilot Car Admin 2026 on multiple computers?',
    answer:
      'Yes. Your license is for you and your pilot car business, not locked to a single machine. You can install and activate Pilot Car Admin 2026 on multiple Windows computers you own or control. Your data can be moved or synced between devices as needed.',
  },
  {
    question: 'How do updates work? Do I have to pay for them?',
    answer:
      'Updates released for the Pilot Car Admin 2026 edition are included with your purchase. When we fix bugs or ship improvements for 2026, you can download and install those at no extra cost. Major future editions (for example, a separate 2027 release) may be sold separately.',
  },
  {
    question: 'Can I export my data for my accountant or taxes?',
    answer:
      "Yes. Pilot Car Admin 2026 is designed to make tax time easier. You can export financial reports, expense summaries, mileage logs, and other data by date range. Exports are provided in accountant-friendly formats like CSV and PDF.",
  },
  {
    question: "What if I'm already using another invoicing or bookkeeping system?",
    answer:
      'You can bring data over gradually. Pilot Car Admin 2026 supports importing expenses and customers from CSV files, and you can also start fresh and manually enter key customers and balances. Once set up, you get features tailored to pilot car work that generic invoicing tools usually lack.',
  },
  {
    question: 'Do you offer support if I have questions?',
    answer:
      "Yes. Email support is included with your purchase. If you need help installing, activating, or understanding how a feature works, you can reach out and we'll do our best to help you get unstuck.",
  },
  {
    question: 'Is my payment information secure?',
    answer:
      'Payments are processed through trusted third-party platforms (such as Gumroad). They handle your card or PayPal details over secure, encrypted connections. We do not store your full payment information on our own servers.',
  },
  {
    question: 'How do I get my license key after purchase?',
    answer:
      "After you purchase, you'll receive an email with your license information. Copy the license key (format similar to XXXX-XXXX-XXXX-XXXX) into the activation screen inside Pilot Car Admin 2026. Once activated, you can use the app completely offline.",
  },
  {
    question: 'What makes Pilot Car Admin different from generic invoicing software?',
    answer:
      'Pilot Car Admin 2026 is built specifically around how pilot car drivers actually work: run-based invoicing, mileage tracking, expenses for runs, scheduling, and business reporting, all designed for offline use with a one-time price instead of a subscription.',
  },
  {
    question: 'Do fleets get an optional mobile run log with Pilot Car Admin?',
    answer:
      'There is an optional complementary phone app for logging runs in the field (no rates on the device). It is meant to work with Pilot Car Admin on Windows: drivers export CSV, and the office imports with Invoice CSV Import and bills in the same desktop app—not as a separate headline product.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Ensure component renders
  if (!faqs || faqs.length === 0) {
    return (
      <section className="py-20 bg-red-500" id="faq">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-white text-4xl">FAQ ERROR - No FAQs found</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-28 bg-white" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600">Get answers to common questions about Pilot Car Admin 2026</p>
        </div>
        <div className="flex flex-col gap-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg bg-primary-100 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="group flex w-full items-start justify-between bg-transparent px-6 lg:px-10 py-6 transition-colors hover:bg-primary-200 text-left"
                aria-expanded={openIndex === index}
              >
                <p className="text-base lg:text-lg font-semibold text-gray-900 pr-4 m-0 transition-all">
                  {faq.question}
                </p>
                <svg
                  className={`w-6 h-6 text-primary-800 flex-shrink-0 transform transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 lg:px-10 pb-6 text-gray-700 leading-relaxed text-base lg:text-lg">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
