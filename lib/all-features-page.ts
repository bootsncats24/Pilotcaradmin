export interface AllFeaturesPageItem {
  key: string;
  title: string;
}

export const FEATURE_IMAGE_KEYS = {
  invoice: 'invoice',
  expenses: 'expenses',
  mileageTracking: 'mileage-tracking',
  calendar: 'calendar',
  offline: 'offline',
  mobileSync: 'mobile-sync',
} as const;

export const ALL_FEATURES_PAGE_ITEMS: AllFeaturesPageItem[] = [
  { key: FEATURE_IMAGE_KEYS.invoice, title: 'Professional Invoicing' },
  { key: FEATURE_IMAGE_KEYS.expenses, title: 'Expense Tracking' },
  { key: FEATURE_IMAGE_KEYS.mileageTracking, title: 'Mileage Tracking' },
  { key: FEATURE_IMAGE_KEYS.calendar, title: 'Calendar & Scheduling' },
  { key: FEATURE_IMAGE_KEYS.offline, title: 'Offline Operation' },
  { key: FEATURE_IMAGE_KEYS.mobileSync, title: 'Mobile Sync' },
];
