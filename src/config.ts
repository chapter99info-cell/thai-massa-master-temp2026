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
  storeName: 'Mira Thai Massage Altona',
  primaryColor: '#4A90E2',
  accentColor: '#E1D4B6',
  backgroundColor: '#FDFDF2',
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
  masterPin: '7777',
  brandLogoUrl: '',
  heroVideoUrl: '',
  heroImageUrl: '',
  shopDescription: '',
};

export const getAppSettings = (): AppSettings => {
  const saved = localStorage.getItem('APP_SETTINGS');
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

export const saveAppSettings = (settings: AppSettings) => {
  localStorage.setItem('APP_SETTINGS', JSON.stringify(settings));
  console.log('Logging to Google Sheets (APP_SETTINGS):', settings);
};
