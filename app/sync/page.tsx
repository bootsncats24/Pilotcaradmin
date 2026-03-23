import { Metadata } from 'next';
import { getFeatureBySlug } from '@/lib/features';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Sync That Just Works | Pilot Car Admin',
  description: 'Your data stays in sync between desktop and mobile (mobile app coming soon). Offline-first with secure, bidirectional sync between devices. No accounts, no cloud dependency, no surprise conflicts.',
};

export default function SyncPage() {
  const feature = getFeatureBySlug('sync');

  if (!feature) {
    return <div>Feature not found</div>;
  }

  return <FeaturePageLayout feature={feature} />;
}
