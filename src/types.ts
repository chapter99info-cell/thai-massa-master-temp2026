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
  postCareTips?: { th: string; en: string }[];
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
  currentServiceId?: string;
  currentPrice?: number;
  currentBedNumber?: string;
  currentBedType?: 'Foot' | 'Body' | 'VIP';
  healthFund?: string | null;
  memberId?: string | null;
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

export interface Booking {
  id: string;
  customerName: string;
  serviceName: string;
  serviceEnglishName?: string;
  therapistName: string;
  therapistId: string;
  price: number;
  durationMins: number;
  timeSlot: string;
  date: string;
  healthFund?: string | null;
  memberId?: string | null;
  paymentMethod: 'clinic' | 'online';
  bedId?: string;
  status: 'Reserved' | 'In Use' | 'Completed' | 'Cancelled';
  timestamp: string;
  createdBy?: string; // Role or PIN ID
  closedBy?: string;
}

export interface Sale {
  id: string;
  timestamp: string;
  customer: string;
  service: string;
  therapist: string;
  amount: number;
  method: 'Cash' | 'Card' | 'PayID' | 'HICAPS';
  createdBy: string;
  closedBy: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  role: string;
  eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT' | 'FINANCIAL_EDIT_DENIED';
  details: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  performer: string; // PIN Role/ID
  action: string;
  details: string;
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
  isUpgraded?: boolean;
  toneOfVoice?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string; // YYYY-MM-DD
  memberTier: 'General' | 'Silver' | 'Gold' | 'VIP';
  totalVisits: number;
  totalSpent: number;
  lastVisitDate: string; // ISO string
  notes?: string;
}

export interface GiftVoucher {
  id: string;
  code: string;
  value: number;
  balance: number;
  recipientEmail?: string;
  recipientName?: string;
  senderName: string;
  senderEmail?: string;
  message?: string;
  expiryDate: string;
  isRedeemed: boolean;
  type: 'E-VOUCHER' | 'PHYSICAL';
}

export interface Expense {
  id: string;
  timestamp: string;
  category: 'Rent' | 'Utilities' | 'Supplies' | 'Marketing' | 'Staff' | 'Other';
  description: string;
  amount: number;
  recordedBy: string;
  receiptUrl?: string;
  isTaxDeductible: boolean;
}

export interface ProfitLossSummary {
  revenue: number;
  expenses: number;
  grossProfit: number;
  estimatedTax: number;
  netProfit: number;
  period: string;
}
