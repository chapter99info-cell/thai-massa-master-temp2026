import { AppSettings, Bed } from './types';
import { CLIENT_CONFIG } from './config/clientConfig';

export interface StoreConfig {
  storeName: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  abn: string;
  address: string;
  phone: string;
  packageTier: 1 | 2 | 3; // 1=Basic, 2=Pro, 3=Premium
  gstRate: number;
}

export const storeConfig: StoreConfig = {
  storeName: CLIENT_CONFIG.shopName,
  primaryColor: CLIENT_CONFIG.themeColor, // Professional Gold
  accentColor: '#E2C374', // Soft Gold
  backgroundColor: CLIENT_CONFIG.backgroundColor, // Deep Navy
  abn: CLIENT_CONFIG.abn,
  address: CLIENT_CONFIG.address,
  phone: CLIENT_CONFIG.phone,
  packageTier: 3, // Full access for development
  gstRate: 0.10, // 10% GST default
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
  clientName: CLIENT_CONFIG.shopName,
  storeId: 'PREMIUM-SYD-001',
  googleSheetId: CLIENT_CONFIG.googleSheetId,
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
  heroImageUrl: '',
  shopDescription: 'Premium Thai Wellness - Your Ultimate Escape for Body and Soul',
  isUpgraded: false,
  toneOfVoice: CLIENT_CONFIG.aiPersona,
};

export const getAppSettings = (): AppSettings => {
  const saved = localStorage.getItem('app_settings_v4');
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

export const saveAppSettings = (settings: AppSettings) => {
  localStorage.setItem('app_settings_v4', JSON.stringify(settings));
  console.log('Logging to Google Sheets (APP_SETTINGS):', settings);
};
