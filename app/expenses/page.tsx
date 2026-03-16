import { Metadata } from 'next';
import { getFeatureBySlug } from '@/lib/features';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Expense Tracking Software | Pilot Car Admin',
  description: 'Keep track of your expenses with mobile receipt scanning, bank account imports, and automated expense categorization.',
};

export default function ExpensesPage() {
  const feature = getFeatureBySlug('expenses');

  if (!feature) {
    return <div>Feature not found</div>;
  }

  return <FeaturePageLayout feature={feature} />;
}
