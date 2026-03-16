import { Metadata } from 'next';
import { getFeatureBySlug } from '@/lib/features';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';

export const metadata: Metadata = {
  title: 'Calendar & Scheduling Software | Pilot Car Admin',
  description: 'Manage your booked runs and schedule with an intuitive calendar interface. Keep track of all your appointments and runs in one place.',
};

export default function CalendarPage() {
  const feature = getFeatureBySlug('calendar');

  if (!feature) {
    return <div>Feature not found</div>;
  }

  return <FeaturePageLayout feature={feature} />;
}
