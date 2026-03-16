'use client';

import { useEffect, useState } from 'react';
import Card from '../ui/Card';
import Image from 'next/image';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  rating: number;
}

interface ImageMetadata {
  features: Record<string, string | null>;
  hero: string | null;
  testimonials: Record<string, string | null>;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'Pilot Car Admin has completely transformed how I manage my business. The offline capability is a game-changer when I\'m on the road.',
    author: 'John Smith',
    role: 'Professional Pilot Car Driver',
    company: 'Smith Transport Services',
    rating: 5,
  },
  {
    quote:
      'The expense tracking and receipt scanning features save me hours every week. Highly recommend!',
    author: 'Sarah Johnson',
    role: 'Independent Contractor',
    company: 'Johnson Pilot Services',
    rating: 5,
  },
  {
    quote:
      'Finally, an invoicing system built for pilot car drivers. The multiple billing types make it so easy to invoice correctly.',
    author: 'Mike Davis',
    role: 'Business Owner',
    company: 'Davis Logistics',
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata>({
    features: {},
    hero: null,
    testimonials: {},
  });

  useEffect(() => {
    const fetchMetadata = () => {
      fetch('/api/images/metadata?' + new Date().getTime())
        .then((res) => res.json())
        .then((data) => setImageMetadata(data))
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
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Don't take our word for it, take theirs
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => {
            const photoUrl = imageMetadata.testimonials[index.toString()]
              ? `/images/testimonials/${imageMetadata.testimonials[index.toString()]}`
              : null;

            return (
              <Card key={index} className="p-8 animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
                {photoUrl && (
                  <div className="mb-4 flex justify-center">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={photoUrl}
                        alt={testimonial.author}
                        fill
                        className="object-contain"
                        sizes="80px"
                      />
                    </div>
                  </div>
                )}
                <StarRating rating={testimonial.rating} />
                <p className="text-gray-700 mb-6 text-lg leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-semibold text-gray-900 text-lg">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  {testimonial.company && (
                    <p className="text-sm text-primary-800 font-medium mt-1">{testimonial.company}</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
