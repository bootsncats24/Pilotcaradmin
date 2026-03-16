import { Metadata } from 'next';
import { getFeatureBySlug } from '@/lib/features';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Mileage Tracking Software | Pilot Car Admin',
  description: 'Track vehicle mileage for tax deductions. Separate business and personal miles, support multiple vehicles, and generate mileage reports.',
};

export default function MileageTrackingPage() {
  const feature = getFeatureBySlug('mileage-tracking');

  if (!feature) {
    return <div>Feature not found</div>;
  }

  return <FeaturePageLayout feature={feature} />;
}
