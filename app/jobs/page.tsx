import { Metadata } from 'next';
import { getFeatureBySlug } from '@/lib/features';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Everything Tied to the Job | Pilot Car Admin',
  description: 'Customers, destinations, runs, and invoices—all connected. Every job keeps its customer, destination, mileage, and billing history together—so nothing gets lost between runs.',
};

export default function JobsPage() {
  const feature = getFeatureBySlug('jobs');

  if (!feature) {
    return <div>Feature not found</div>;
  }

  return <FeaturePageLayout feature={feature} />;
}
