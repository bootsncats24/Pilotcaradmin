import { FeatureData } from '@/lib/features';
import FeatureHero from './FeatureHero';
import FeatureSection from './FeatureSection';
import FeatureFAQ from './FeatureFAQ';
import RelatedFeatures from './RelatedFeatures';
import CTA from '../sections/CTA';
import { getImageMetadata } from '@/lib/imageUtils';

interface FeaturePageLayoutProps {
  feature: FeatureData;
}

export default async function FeaturePageLayout({ feature }: FeaturePageLayoutProps) {
  const imageMetadata = await getImageMetadata();

  return (
    <>
      <FeatureHero feature={feature} />
      {feature.sections.map((section, index) => {
        // Get section-specific image
        const sectionKey = `${feature.slug}-${index}`;
        const sectionImageUrl = imageMetadata.featureSections[sectionKey]
          ? `/images/features/${imageMetadata.featureSections[sectionKey]}`
          : null;

        return (
          <FeatureSection
            key={index}
            section={section}
            index={index}
            isNew={index === 0 && feature.id === 'invoice'}
            featureSlug={feature.slug}
            imageUrl={sectionImageUrl}
          />
        );
      })}
      <FeatureFAQ faqs={feature.faqs} />
      <RelatedFeatures
        currentFeatureSlug={feature.slug}
        relatedFeatureSlugs={feature.relatedFeatures}
      />
      <CTA />
    </>
  );
}
