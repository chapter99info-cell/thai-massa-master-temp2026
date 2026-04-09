export type Gender = 'Male' | 'Female' | 'Other';

export interface Therapist {
  id: string;
  name: string;
  imageUrl: string;
  specialties: string[];
  gender: Gender;
  providerNumber?: string;
  insuranceExpiry?: string;
  dailyGuarantee?: number;
  commissionRate?: number;
  pin?: string;
  isHicapsEnabled?: boolean;
}

export interface Service {
  id: string;
  name: string;
  englishName?: string;
  description: string;
  englishDescription?: string;
  standardPrice: number;
  earlyBirdPrice: number;
  weekendPrice: number;
  durationMins: number;
  category: 'MASSAGE' | 'FACIAL' | 'SPA_PACKAGES' | string;
  imageUrl: string;
  isFeatured?: boolean;
}

export interface CartItem extends Service {
  quantity: number;
  therapist?: Therapist;
  selectedPrice: number;
}

export interface Bed {
  id: string;
  number: string;
  type: 'Foot' | 'Body' | 'VIP';
  status: 'Vacant' | 'In Use';
  paymentStatus?: 'Unpaid' | 'Paid';
}

export interface StaffStatus {
  therapistId: string;
  therapistName: string;
  status: 'Available' | 'Working' | 'Break' | 'PaymentPending';
  remainingSeconds?: number;
  currentCustomer?: string;
  currentService?: string;
  currentPrice?: number;
  currentBedNumber?: string;
  currentBedType?: 'Foot' | 'Body' | 'VIP';
  providerNumber?: string;
  insuranceExpiry?: string;
  insuranceClaimAmount?: number;
  gapPayment?: number;
  dailyGuarantee?: number;
  commissionRate?: number;
  lastAvailableAt?: string;
  gender?: Gender;
  pin?: string;
}

export interface QueueItem {
  id: string;
  customerName: string;
  serviceName: string;
  durationMins: number;
  price: number;
  assignedTherapistId?: string;
  assignedBedId?: string;
}

export interface StaffSession {
  id: string;
  customerName: string;
  serviceName: string;
  durationMins: number;
  therapistName: string;
  price: number;
  status: 'pending' | 'active' | 'completed';
  startTime?: number;
  endTime?: number;
  remainingSeconds?: number;
  bedNumber?: string;
  bedType?: 'Foot' | 'Body' | 'VIP';
}

export interface AttendanceEntry {
  id: string;
  therapistId: string;
  therapistName: string;
  timestamp: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT';
}

export interface AlertEntry {
  id: string;
  therapistId: string;
  therapistName: string;
  issue: string;
  timestamp: string;
  status: 'NEW' | 'READ';
}

export interface AppSettings {
  clientName: string;
  storeId: string;
  googleSheetId?: string;
  gpFeePercent: number;
  showPosMode: boolean;
  showDailySummary: boolean;
  showStaffClockInOut: boolean;
  showInventoryAlerts: boolean;
  showAds: boolean;
  enableThermalPrinting: boolean;
  printerConnection: 'AUTO' | 'USB' | 'BLUETOOTH' | 'CLOUD';
  sunmiCloudToken?: string;
  adTitle?: string;
  adEnglishTitle?: string;
  adImageUrl?: string;
  adTargetLink?: string;
  clientIntakeUrl?: string;
  billingPlan?: 'Monthly' | 'GP%';
  ownerPin?: string;
  staffPin?: string;
  managerPin?: string;
  masterPin?: string;
  brandLogoUrl?: string;
  heroVideoUrl?: string;
  heroImageUrl?: string;
  shopDescription?: string;
}
