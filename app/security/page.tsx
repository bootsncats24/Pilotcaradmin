import { Metadata } from 'next';
import { getFeatureBySlug } from '@/lib/features';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Built Secure from the Ground Up | Pilot Car Admin',
  description: 'Your business data stays yours. App lock, auto-lock, license validation, tamper detection, and local-first storage—designed for independent operators.',
};

export default function SecurityPage() {
  const feature = getFeatureBySlug('security');

  if (!feature) {
    return <div>Feature not found</div>;
  }

  return <FeaturePageLayout feature={feature} />;
}
