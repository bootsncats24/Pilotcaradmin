import { Metadata } from 'next';
import { getFeatureBySlug } from '@/lib/features';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Invoicing Software | Pilot Car Admin',
  description:
    'Pilot car invoicing by mile, mini run, day rate, hourly, chase/pole. Optional complementary mobile run log for fleets (CSV handoff). Invoice CSV Import and PDFs on Windows.',
};

export default function InvoicePage() {
  const feature = getFeatureBySlug('invoice');

  if (!feature) {
    return <div>Feature not found</div>;
  }

  return <FeaturePageLayout feature={feature} />;
}
