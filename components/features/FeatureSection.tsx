'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '../ui/Button';
import { FeatureSection as FeatureSectionType } from '@/lib/features';
import Image from 'next/image';

interface FeatureSectionProps {
  section: FeatureSectionType;
  index: number;
  isNew?: boolean;
  featureSlug?: string;
  imageUrl?: string | null;
}

export default function FeatureSection({ section, index, isNew = false, featureSlug, imageUrl }: FeatureSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`py-16 lg:py-24 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col lg:flex-row items-center gap-12 ${
          index % 2 === 1 ? 'lg:flex-row-reverse' : ''
        }`}>
          {/* Text Content */}
          <div className="flex-1 lg:max-w-2xl">
            {isNew && (
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-sm font-semibold rounded-full mb-4">
                NEW
              </span>
            )}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {section.title}
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 mb-6 leading-relaxed">
              {section.description}
            </p>
            {section.features && section.features.length > 0 && (
              <ul className="space-y-3 mb-8">
                {section.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start text-gray-700">
                    <svg
                      className="w-6 h-6 text-primary-800 mr-3 flex-shrink-0 mt-0.5"
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
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            <Button
              href="/pricing"
              variant="primary"
              className="text-lg px-8 py-4"
            >
              {section.ctaText || 'View Pricing'}
            </Button>
          </div>
          
          {/* Image */}
          <div className="flex-1 lg:max-w-lg w-full">
            {imageUrl ? (
              <div
                className={`relative rounded-2xl aspect-video bg-gray-100 flex items-center justify-center overflow-hidden transition-all duration-700 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Image
                  src={imageUrl}
                  alt={section.title}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div
                className={`relative bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 rounded-2xl p-16 aspect-video flex items-center justify-center overflow-hidden transition-all duration-700 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10"></div>
                <div className="text-8xl opacity-50 relative z-10">
                  {section.title.includes('invoice') && '📄'}
                  {section.title.includes('expense') && '💰'}
                  {section.title.includes('mileage') && '🚗'}
                  {(section.title.includes('calendar') || section.title.includes('schedule') || section.title.includes('booked runs')) && '📅'}
                  {!section.title.includes('invoice') && !section.title.includes('expense') && !section.title.includes('mileage') && !section.title.includes('calendar') && !section.title.includes('schedule') && !section.title.includes('booked runs') && '✨'}
                </div>
                {/* Animated background circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-300/20 rounded-full blur-xl"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
