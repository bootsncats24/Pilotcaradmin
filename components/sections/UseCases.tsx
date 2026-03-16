'use client';

import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Image from 'next/image';

interface UseCase {
  id: string;
  title: string;
  description: string;
  features: string[];
}

const useCases: UseCase[] = [
  {
    id: 'on-the-road',
    title: 'Track Everything on the Road',
    description: 'Log mileage, expenses, and job details while you\'re driving—no internet required. Everything syncs when you get back to service.',
    features: [
      'Log loaded, deadhead, and deductible miles in real-time',
      'Track expenses and scan receipts with your phone',
      'Record job details, customers, and destinations offline',
      'Sync automatically when you reconnect',
    ],
  },
  {
    id: 'billing',
    title: 'Get Paid Faster',
    description: 'Create professional invoices that match how pilot car drivers actually bill—by mile, mini run, day rate, or hourly. No more fighting with generic templates.',
    features: [
      'Multiple billing types: by mile, mini run, day rate, hourly, chase/pole',
      'Add overnight rates and custom extras automatically',
      'Track invoice status and get automatic overdue alerts',
      'Export clean PDFs ready to send to customers',
    ],
  },
  {
    id: 'tax-time',
    title: 'Tax Time Made Simple',
    description: 'All your business expenses, mileage, and income organized and ready for your accountant. Generate IRS-ready reports in minutes.',
    features: [
      'IRS-ready mileage reports by vehicle',
      'Categorized expenses with receipt tracking',
      'Automatic business vs personal classification',
      'Export everything your accountant needs',
    ],
  },
  {
    id: 'multi-device',
    title: 'Desktop and Mobile, Always in Sync',
    description: 'Start a job on your phone, finish invoicing on your desktop. Your data stays in sync across all devices—no cloud accounts required.',
    features: [
      'Use the mobile app on the road, desktop at home',
      'Secure bidirectional sync between devices',
      'Works fully offline on both platforms',
      'No cloud dependency—your data stays local',
    ],
  },
];

export default function UseCases() {
  const [activeTab, setActiveTab] = useState(0);
  const [imageMetadata, setImageMetadata] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const fetchMetadata = () => {
      fetch('/api/images/metadata?' + new Date().getTime())
        .then((res) => res.json())
        .then((data) => setImageMetadata(data.useCases || {}))
        .catch((error) => console.error('Error fetching image metadata:', error));
    };
    
    fetchMetadata();
    // Refresh every 5 seconds to pick up changes
    const interval = setInterval(fetchMetadata, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Built for how you actually work
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mt-4">
            Whether you're on the road, at your desk, or getting ready for tax season—every feature works the way pilot car drivers need it to.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {useCases.map((useCase, index) => (
            <button
              key={useCase.id}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === index
                  ? 'bg-primary-800 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {useCase.title}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        <div className="max-w-4xl mx-auto">
          {useCases.map((useCase, index) => {
            const imageUrl = imageMetadata[useCase.id] ? `/images/features/${imageMetadata[useCase.id]}` : null;
            
            return (
              <div
                key={useCase.id}
                className={`transition-all duration-500 ${
                  activeTab === index ? 'opacity-100 block' : 'opacity-0 hidden'
                }`}
              >
                <Card className="p-8 lg:p-12">
                  {imageUrl && (
                    <div className="mb-6">
                      <div className="relative w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={useCase.title}
                          fill
                          className="object-contain p-4"
                          sizes="(max-width: 768px) 100vw, 768px"
                        />
                      </div>
                    </div>
                  )}
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{useCase.title}</h3>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">{useCase.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {useCase.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <svg
                          className="w-6 h-6 text-primary-800 flex-shrink-0 mt-0.5"
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
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
