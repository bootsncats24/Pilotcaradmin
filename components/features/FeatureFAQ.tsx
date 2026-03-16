'use client';

import { useState } from 'react';
import { FeatureFAQ as FeatureFAQType } from '@/lib/features';

interface FeatureFAQProps {
  faqs: FeatureFAQType[];
}

export default function FeatureFAQ({ faqs }: FeatureFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
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
