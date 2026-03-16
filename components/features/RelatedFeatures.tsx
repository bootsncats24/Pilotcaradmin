import Link from 'next/link';
import { getAllFeatures, getFeatureBySlug } from '@/lib/features';

interface RelatedFeaturesProps {
  currentFeatureSlug: string;
  relatedFeatureSlugs: string[];
}

export default function RelatedFeatures({ currentFeatureSlug, relatedFeatureSlugs }: RelatedFeaturesProps) {
  const relatedFeatures = relatedFeatureSlugs
    .map(slug => getFeatureBySlug(slug))
    .filter(Boolean);

  if (relatedFeatures.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            All Pilot Car Admin features
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getAllFeatures().map((feature) => (
            <Link
              key={feature.id}
              href={`/${feature.slug}`}
              className={`block p-6 rounded-lg transition-all duration-300 ${
                feature.slug === currentFeatureSlug
                  ? 'bg-primary-800 text-white hover:bg-primary-700'
                  : 'bg-white text-gray-900 hover:bg-primary-50 hover:shadow-md'
              }`}
            >
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className={`text-sm ${
                feature.slug === currentFeatureSlug ? 'text-primary-100' : 'text-gray-600'
              }`}>
                {feature.heroDescription.substring(0, 100)}...
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
