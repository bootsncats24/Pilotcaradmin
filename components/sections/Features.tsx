'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface Feature {
  title: string;
  description: string | string[]; // Can be array of lines for better readability
  learnMore: string;
  ctaText?: string; // Context-aware CTA text
  badge?: string; // Badge text (e.g., "Driver Favorite")
  credibilityLine?: string; // Short italic credibility line
  screenshotCaption?: string; // Caption for screenshot
}

const mainFeatures: Feature[] = [
  {
    title: '🚗 Mileage That Actually Makes Sense',
    description: [
      'Track loaded, deadhead, and deductible miles—without guessing later.',
      'Log mileage by vehicle, classify business vs personal, and generate IRS-ready mileage reports automatically.',
      'Built around how pilot car drivers really run miles.'
    ],
    learnMore: '/mileage-tracking',
    ctaText: 'See mileage reports',
    badge: 'Driver Favorite',
    credibilityLine: 'The feature we use most on every run.'
  },
  {
    title: 'Get Paid Faster with Smart Invoicing',
    description: [
      'Invoices built for pilot car billing—not generic templates.',
      'Create invoices by mile, mini run, day rate, hourly, or chase/pole.',
      'Add overnight rates and extras, track status, and export clean PDFs.',
      'Fleets: optional complementary mobile run log (same workflow)—drivers export CSV; you import in Pilot Car Admin on the desktop.',
    ],
    learnMore: '/invoice',
    ctaText: 'View invoice examples',
    credibilityLine: 'No more wrestling with templates that don\'t fit.'
  },
  {
    title: 'Offline-First by Design',
    description: [
      "Works without service—syncs when you're ready.",
      'Pilot Car Admin runs fully offline. Track jobs, mileage, expenses, and invoices all day, then sync across devices when convenient.'
    ],
    learnMore: '/offline',
    ctaText: 'How offline-first works',
    screenshotCaption: 'Runs fully offline — syncs when you\'re ready'
  },
  {
    title: 'Expenses, Receipts & Bills—Handled',
    description: [
      'Know where your money goes without sorting piles later.',
      'Track expenses, scan receipts with OCR, split transactions, manage recurring bills, and auto-categorize for tax time.'
    ],
    learnMore: '/expenses',
    ctaText: 'See expense tracking',
  },
  {
    title: 'Sync That Just Works',
    description: [
      'Your data stays in sync between desktop and mobile, with Android available now.',
      'Offline-first with secure, bidirectional sync between devices. No accounts, no cloud dependency. iPhone support is planned later based on demand.'
    ],
    learnMore: '/sync',
    ctaText: 'See sync in action',
  },
  {
    title: 'Built Secure from the Ground Up',
    description: [
      'Your business data stays yours.',
      'App lock, auto-lock, license validation, tamper detection, and local-first storage—designed for independent operators.'
    ],
    learnMore: '/security',
    ctaText: 'Learn about security',
  },
];


function FeatureCard({ feature, index, imageUrl, isHero = false }: { feature: Feature; index: number; imageUrl?: string | null; isHero?: boolean }) {
  const descriptionLines = Array.isArray(feature.description) ? feature.description : [feature.description];
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Get emoji for feature
  const getEmoji = () => {
    if (feature.title === '🚗 Mileage That Actually Makes Sense' || feature.title.includes('Mileage That Actually Makes Sense')) return '🚗';
    if (feature.title === 'Get Paid Faster with Smart Invoicing') return '💰';
    if (feature.title === 'Offline-First by Design') return '📴';
    if (feature.title === 'Expenses, Receipts & Bills—Handled') return '📄';
    if (feature.title === 'Sync That Just Works') return '🔄';
    if (feature.title === 'Built Secure from the Ground Up') return '🔒';
    return '';
  };

  // Clean title (remove emoji if present)
  // Use Unicode property escapes to match any emoji character
  const cleanTitle = feature.title.replace(/^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier_Base}]\s*/u, '');

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-8 scale-95'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Link href={feature.learnMore} className="block group h-full">
        <div className={`relative h-full flex flex-col rounded-3xl bg-white border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${
          isHero 
            ? 'border-2 border-primary-300/60 hover:border-primary-400 shadow-2xl lg:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-primary-100/50' 
            : 'border border-gray-200/80 hover:border-primary-300/60 shadow-md hover:shadow-xl'
        }`}>
          {/* Background gradient overlay - Enhanced for hero/Mileage card */}
          <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-500 pointer-events-none ${
            isHero
              ? 'from-primary-50/50 via-primary-100/30 to-primary-50/40 group-hover:from-primary-50/80 group-hover:via-primary-100/50 group-hover:to-primary-50/70'
              : 'from-white via-primary-50/0 to-primary-50/0 group-hover:from-primary-50/40 group-hover:via-primary-50/20 group-hover:to-primary-100/30'
          }`}></div>
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500 pointer-events-none" 
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          ></div>
          
          {/* Badge */}
          {feature.badge && (
            <div className="absolute top-4 left-4 z-20">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-600 text-white shadow-lg">
                {feature.badge}
              </span>
            </div>
          )}

          {/* Screenshot or Icon at top */}
          {imageUrl ? (
            <div className={`relative w-full bg-gradient-to-br from-gray-50 via-gray-50/50 to-white overflow-hidden ${
              isHero ? 'h-64 lg:h-80' : 'h-48 lg:h-56'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 via-white/50 to-white/80"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-50/20 to-transparent"></div>
              <Image
                src={imageUrl}
                alt={feature.title}
                fill
                className="object-contain p-4 lg:p-6 group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              {/* Screenshot caption */}
              {feature.screenshotCaption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent p-4">
                  <p className="text-white text-xs font-medium text-center">{feature.screenshotCaption}</p>
                </div>
              )}
            </div>
          ) : (
            <div className={`relative w-full bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 flex items-center justify-center overflow-hidden ${
              isHero ? 'h-48 lg:h-56' : 'h-32 lg:h-40'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent group-hover:from-white/20 group-hover:via-white/10 transition-all duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-400/20 to-transparent"></div>
              <div className={`transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10 ${
                isHero ? 'text-8xl lg:text-9xl' : 'text-6xl lg:text-7xl'
              }`}>
                {getEmoji()}
              </div>
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className={`relative z-10 flex flex-col h-full ${isHero ? 'p-8 lg:p-10' : 'p-6 lg:p-8'}`}>
            {/* Icon/Emoji (only show if no screenshot) */}
            {!imageUrl && (
              <div className="mb-5">
                <div className={`relative rounded-2xl bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 flex items-center justify-center overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl ${
                  isHero ? 'w-16 h-16 lg:w-20 lg:h-20' : 'w-12 h-12 lg:w-14 lg:h-14'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <div className={`transform group-hover:scale-110 transition-transform duration-500 relative z-10 ${
                    isHero ? 'text-3xl lg:text-4xl' : 'text-2xl lg:text-3xl'
                  }`}>
                    {getEmoji()}
                  </div>
                </div>
              </div>
            )}

            {/* Title */}
            <h3 className={`font-bold text-gray-900 mb-4 group-hover:text-primary-800 transition-colors duration-300 leading-tight ${
              isHero ? 'text-2xl lg:text-3xl xl:text-4xl' : 'text-xl lg:text-2xl'
            }`}>
              {cleanTitle}
            </h3>

            {/* Description - Multi-line for better readability */}
            <div className={`text-gray-600 mb-4 leading-relaxed flex-grow space-y-2 ${
              isHero ? 'text-base lg:text-lg' : 'text-sm lg:text-base'
            }`}>
              {descriptionLines.map((line, lineIndex) => (
                <p key={lineIndex}>{line}</p>
              ))}
            </div>

            {/* Credibility line */}
            {feature.credibilityLine && (
              <p className="text-gray-500 italic text-sm mb-4">
                {feature.credibilityLine}
              </p>
            )}

            {/* CTA Link */}
            <div className={`inline-flex items-center text-primary-700 font-semibold group-hover:text-primary-800 transition-all duration-300 mt-auto ${
              isHero ? 'text-base lg:text-lg' : ''
            }`}>
              <span className="mr-2 group-hover:mr-3 transition-all duration-300">{feature.ctaText || 'Learn more'}</span>
              <svg
                className={`transform transition-transform duration-300 group-hover:translate-x-2 ${
                  isHero ? 'w-6 h-6' : 'w-5 h-5'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Decorative corner accent */}
          <div className={`absolute top-0 right-0 bg-gradient-to-br from-primary-200/30 via-primary-100/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
            isHero ? 'w-40 h-40' : 'w-32 h-32'
          }`}></div>
          
          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-200/0 to-transparent group-hover:via-primary-400/50 transition-all duration-500"></div>
        </div>
      </Link>
    </div>
  );
}

export default function Features() {
  const [headingVisible, setHeadingVisible] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [imageMetadata, setImageMetadata] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const fetchMetadata = () => {
      fetch('/api/images/metadata?' + new Date().getTime())
        .then((res) => res.json())
        .then((data) => setImageMetadata(data.homeFeatures || {}))
        .catch((error) => console.error('Error fetching image metadata:', error));
    };
    
    fetchMetadata();
    // Refresh every 5 seconds to pick up changes
    const interval = setInterval(fetchMetadata, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeadingVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (headingRef.current) {
      observer.observe(headingRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-20">
          <h2
            ref={headingRef}
            className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 leading-tight transition-all duration-700 ${
              headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Every feature was built by a{' '}
            <span className="text-primary-800">pilot car driver</span>
            {' '}—from real runs, real mileage, and real billing headaches.
          </h2>
          <p className={`text-lg lg:text-xl text-gray-600 mb-6 transition-all duration-700 ${
            headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '150ms' }}>
            Built from thousands of real runs, not assumptions.
          </p>
          <div className={`h-1 w-24 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto rounded-full transition-all duration-700 ${
            headingVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`} style={{ transitionDelay: '200ms' }}></div>
        </div>
        
        {/* Feature Cards - Organized by rows */}
        
        {/* Two-card hero row (Mileage + Invoicing) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
          {mainFeatures.slice(0, 2).map((feature, index) => {
            const slugMap: Record<string, string> = {
              '🚗 Mileage That Actually Makes Sense': 'mileage-tracking',
              'Get Paid Faster with Smart Invoicing': 'invoice',
            };
            const slug = slugMap[feature.title] || feature.title.toLowerCase().replace(/\s+/g, '-');
            const imageUrl = imageMetadata[slug] ? `/images/features/${imageMetadata[slug]}` : null;
            const isMileage = feature.title.includes('Mileage');
            
            return (
              <FeatureCard 
                key={index} 
                feature={feature} 
                index={index} 
                imageUrl={imageUrl}
                isHero={isMileage}
              />
            );
          })}
        </div>

        {/* Four-card row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12 lg:mb-16">
          {mainFeatures.slice(2, 6).map((feature, index) => {
            const slugMap: Record<string, string> = {
              'Offline-First by Design': 'offline',
              'Expenses, Receipts & Bills—Handled': 'expenses',
              'Sync That Just Works': 'sync',
              'Built Secure from the Ground Up': 'security',
            };
            const slug = slugMap[feature.title] || feature.title.toLowerCase().replace(/\s+/g, '-');
            const imageUrl = imageMetadata[slug] ? `/images/features/${imageMetadata[slug]}` : null;
            
            return (
              <FeatureCard 
                key={index + 2} 
                feature={feature} 
                index={index + 2} 
                imageUrl={imageUrl}
              />
            );
          })}
        </div>
        
        {/* Credibility closer */}
        <div className="text-center mt-16 lg:mt-20">
          <p className="text-lg lg:text-xl text-gray-600 font-medium max-w-3xl mx-auto leading-relaxed">
            No cloud lock-in. No generic templates. Just tools built for how pilot car drivers actually work.
          </p>
        </div>
      </div>
    </section>
  );
}
