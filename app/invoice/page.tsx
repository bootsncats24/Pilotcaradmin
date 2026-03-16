import { Metadata } from 'next';
import { getFeatureBySlug } from '@/lib/features';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Invoicing Software | Pilot Car Admin',
  description: 'Create and send professional invoices in minutes. Automatically add tracked time and expenses, calculate taxes, and track payment status.',
};

export default function InvoicePage() {
  const feature = getFeatureBySlug('invoice');

  if (!feature) {
    return <div>Feature not found</div>;
  }

  return <FeaturePageLayout feature={feature} />;
}
