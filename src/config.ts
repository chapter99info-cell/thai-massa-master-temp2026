import { AppSettings, Bed } from './types';

export interface StoreConfig {
  storeName: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  abn: string;
  address: string;
  phone: string;
  packageTier: 1 | 2 | 3; // 1=Basic, 2=Pro, 3=Premium
}

export const storeConfig: StoreConfig = {
  storeName: 'Premium Thai Wellness',
  primaryColor: '#0EA5E9',
  accentColor: '#D4AF37',
  backgroundColor: '#F8FAFC',
  abn: '12 345 678 901',
  address: 'Level 1/76 Pier Street, Altona 3018',
  phone: '0466 992 456',
  packageTier: 3, // Full access for development
};

export const INITIAL_BEDS: Bed[] = [
  { id: 'b1', number: '1', type: 'Foot', status: 'Vacant' },
  { id: 'b2', number: '2', type: 'Foot', status: 'Vacant' },
  { id: 'b3', number: '3', type: 'Body', status: 'Vacant' },
  { id: 'b4', number: '4', type: 'Body', status: 'Vacant' },
  { id: 'b5', number: '5', type: 'Body', status: 'Vacant' },
  { id: 'b6', number: '6', type: 'VIP', status: 'Vacant' },
];

const DEFAULT_SETTINGS: AppSettings = {
  clientName: 'Chapter99 Solutions',
  storeId: 'MIRA-SYD-001',
  googleSheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  gpFeePercent: 0.5,
  showPosMode: true,
  showDailySummary: true,
  showStaffClockInOut: true,
  showInventoryAlerts: true,
  showAds: true,
  enableThermalPrinting: true,
  printerConnection: 'AUTO',
  adImageUrl: 'https://picsum.photos/seed/thai-food/800/200',
  adTargetLink: 'https://example.com/partner-restaurant',
  clientIntakeUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeoxElNhSHBMm1edtK72I2JWbzYlmBUC-lEN-N21GTvfrrQ5Q/viewform',
  billingPlan: 'GP%',
  ownerPin: '9999',
  staffPin: '1111',
  managerPin: '4444',
  masterPin: '3501',
  brandLogoUrl: '',
  heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-massage-therapist-working-on-a-client-4444-large.mp4',
  heroImageUrl: 'https://images.unsplash.com/photo-1544161515-4ae6ce6db874?q=80&w=2070&auto=format&fit=crop',
  shopDescription: 'Experience True Serenity - Premium Wellness in Altona',
  isUpgraded: false,
  toneOfVoice: 'Warm, International, Professional, and Relaxing',
};

export const getAppSettings = (): AppSettings => {
  const saved = localStorage.getItem('APP_SETTINGS');
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

export const saveAppSettings = (settings: AppSettings) => {
  localStorage.setItem('APP_SETTINGS', JSON.stringify(settings));
  console.log('Logging to Google Sheets (APP_SETTINGS):', settings);
};
