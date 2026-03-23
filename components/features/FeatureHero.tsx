import Button from '../ui/Button';
import { FeatureData } from '@/lib/features';

interface FeatureHeroProps {
  feature: FeatureData;
}

export default function FeatureHero({ feature }: FeatureHeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-16 lg:py-24 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Rating */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-primary-100 font-semibold ml-2">4.5 Excellent</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight animate-fade-in">
            {feature.tagline}
          </h1>
          
          {/* Sub-headline */}
          <p className="text-xl sm:text-2xl lg:text-3xl text-primary-100 mb-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {feature.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button href="/pricing" variant="primary" className="bg-white text-primary-800 hover:bg-primary-50 text-lg px-8 py-4">
              View Pricing
            </Button>
          </div>

          <p className="text-sm text-primary-200 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            One-time purchase, lifetime access.
          </p>
        </div>
      </div>
    </section>
  );
}
