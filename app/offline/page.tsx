import { Metadata } from 'next';
import { getFeatureBySlug } from '@/lib/features';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Offline-First by Design | Pilot Car Admin',
  description: 'Works without service—syncs when you\'re ready. Pilot Car Admin runs fully offline. Track jobs, mileage, expenses, and invoices all day, then sync across devices when convenient.',
};

export default function OfflinePage() {
  const feature = getFeatureBySlug('offline');

  if (!feature) {
    return <div>Feature not found</div>;
  }

  return <FeaturePageLayout feature={feature} />;
}
