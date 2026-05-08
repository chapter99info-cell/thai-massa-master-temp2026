import { GoogleGenAI } from "@google/genai";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Clock, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Timer, 
  DollarSign, 
  UserPlus,
  User,
  X,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Wallet,
  Banknote,
  FileText,
  Receipt,
  Heart,
  Bell,
  AlertTriangle,
  LayoutGrid,
  PanelLeftOpen,
  PanelLeftClose,
  PiggyBank,
  Camera,
  Upload,
  LogOut,
  Star,
  QrCode,
  ShieldCheck,
  Download,
  Lock as LockIcon,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { therapists } from '../data/therapists';
import { services } from '../data/services';
import { StaffStatus, QueueItem, AlertEntry, AttendanceEntry, Bed, SecurityEvent, AuditLog } from '../types';
import { storeConfig, getAppSettings, INITIAL_BEDS } from '../config';
import { cn, formatCurrency } from '../lib/utils';
import { usePin } from '../contexts/PinContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBookings } from '../contexts/BookingContext';
import { printerService, ReceiptData } from '../services/PrinterService';
import { googleSheetService } from '../services/googleSheetService';

import AdBanner from './AdBanner';
import PrintableReceipt from './PrintableReceipt';

interface ManagerDashboardProps {
  enablePrinting?: boolean;
  billingPlan?: 'Monthly' | 'GP%';
}

export default function ManagerDashboard({ enablePrinting = true, billingPlan = 'GP%' }: ManagerDashboardProps) {
  const { logout, accessLevel } = usePin();
  const { t } = useLanguage();
  const { beds, bookings, updateBedStatus } = useBookings();
  const settings = getAppSettings();
  
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [staff, setStaff] = useState<StaffStatus[]>(
    therapists.map(t => ({
      therapistId: t.id,
      therapistName: t.name,
      status: 'Available',
      gender: t.gender,
      providerNumber: t.providerNumber,
      insuranceExpiry: t.insuranceExpiry,
      lastAvailableAt: new Date(Date.now() - Math.random() * 10000000).toISOString()
    }))
  );

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [paymentSession, setPaymentSession] = useState<StaffStatus | null>(null);
  const [lastSaleDate, setLastSaleDate] = useState<Date>(new Date());
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'PayID' | 'HICAPS' | null>(null);
  const [hicapsData, setHicapsData] = useState({ claim: 0, gap: 0 });
  const [newWalkIn, setNewWalkIn] = useState<{ customerName: string; serviceId: string; therapistId: string; bedId?: string }>({
      customerName: '',
      serviceId: services[0].id,
      therapistId: 'none',
      healthFund: '',
      memberId: ''
    });
  const [formError, setFormError] = useState<string | null>(null);
  const [somMessage, setSomMessage] = useState<string | null>(null);
  const [salesLog, setSalesLog] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<AlertEntry[]>([
    { id: '1', therapistId: 't1', therapistName: 'พี่นก', issue: 'น้ำมันหมด', timestamp: new Date().toISOString(), status: 'NEW' }
  ]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showInsuranceWarning, setShowInsuranceWarning] = useState(false);
  const [pendingWalkIn, setPendingWalkIn] = useState<any>(null);
  const [payIdSlip, setPayIdSlip] = useState<string | null>(null);
  const [isStaffStatusOpen, setIsStaffStatusOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'control' | 'payments' | 'calendar' | 'crm' | 'audit' | 'expenses' | 'marketing'>('control');
  const [customers, setCustomers] = useState<any[]>([
    { id: 'c1', name: 'John Doe', visits: 12, lastVisit: '2026-03-01', birthday: '1990-05-05' },
    { id: 'c2', name: 'Jane Smith', visits: 1, lastVisit: '2026-05-01', birthday: '1995-10-10' },
    { id: 'c3', name: 'Bob Wilson', visits: 5, lastVisit: '2025-12-01', birthday: '1985-01-01' },
    { id: 'c4', name: 'Alice Brown', visits: 15, lastVisit: '2026-04-20', birthday: '2000-05-05' },
  ]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: 0, category: 'Supplies' });
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [isAiProcessingMarketing, setIsAiProcessingMarketing] = useState(false);
  const [marketingInput, setMarketingInput] = useState('');
  const [marketingOutput, setMarketingOutput] = useState('');
  const generateMarketingPost = async () => {
    setIsAiProcessingMarketing(true);
    setMarketingOutput('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      // Updated prompt to ask for tips and structure the response
      const prompt = `ในฐานะ "น้องส้ม" เลขาส่วนตัวอัจฉริยะ ช่วยเปลี่ยนไอเดียภาษาไทยนี้: "${marketingInput}" ให้เป็น Content ภาษาอังกฤษระดับพรีเมียม (Luxury) สำหรับโพสต์ลง Social Media ของร้าน ${storeConfig.storeName} ที่ Sydney โดยใช้โทนเสียงแบบ ${settings.toneOfVoice || 'Warm and Professional'}.

      โครงสร้างที่ต้องการ:
      1. Premium English Caption (Luxury & Professional)
      2. Recommended Visual Tips: (คำแนะนำสั้นๆ ว่าต้องใช้รูปภาพหรือวิดีโอแบบไหน เพื่อให้ดูหรูหราที่สุด)

      ใส่ Hashtag ที่เกี่ยวข้องและปิดท้ายด้วย 🍊🧡 ทุกครั้ง`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "คุณคือ 'น้องส้ม' (Nong Som) ผู้เชี่ยวชาญด้านการตลาด Wellness และ Restaurant ระดับพรีเมียม คุณเรียกตัวเองว่า 'น้องส้ม' และเรียกผู้ใช้งานว่า 'พี่' เสมอ คุณเก่งเรื่องการเขียน Content ภาษาอังกฤษที่ดูแพง หรูหรา ใส่ใจรายละเอียด และสร้างภาพลักษณ์อันโดดเด่นให้ร้านอาหารหรือร้านนวดใน Sydney",
        }
      });

      const text = response.text;
      if (text) {
        setMarketingOutput(text);
        setSomMessage(t('ปั่น Content หรูๆ พร้อม Tips ถ่ายรูปให้แล้วค่ะพี่! กด Copy ไปโพสต์ได้เลย (Chop the Money!) 🍊', 'Premium content with visual tips generated! Copy and post it now! 🍊'));
      } else {
        setMarketingOutput("ขอโทษทีค่ะพี่ น้องส้มขัดข้องนิดหน่อย ลองใหม่อีกทีนะคะ 🍊");
      }
    } catch (error) {
      console.error("AI Marketing Error:", error);
      setMarketingOutput("พี่คะ น้องส้มเหนื่อยนิสนึง ขอพักแป๊บนะคะ หรือพี่ลืมใส่ API Key หรือเปล่าคะ? 🍊");
    } finally {
      setIsAiProcessingMarketing(false);
    }
  };
  const [monthlySummary, setMonthlySummary] = useState<{
    count: number;
    totalRevenue: number;
    gst: number;
    gpAmount: number;
    month: string;
  } | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [historyBookings, setHistoryBookings] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [selectedHistoryBooking, setSelectedHistoryBooking] = useState<any | null>(null);
  const [showHistoryReceipt, setShowHistoryReceipt] = useState(false);
  const [isSummaryAuthorized, setIsSummaryAuthorized] = useState(false);
  const [showPinLock, setShowPinLock] = useState(false);
  const [pinBuffer, setPinBuffer] = useState('');
  const [pinError, setPinError] = useState(false);

  const checkAuthorization = (action: () => void) => {
    if (accessLevel === 'owner' || accessLevel === 'admin' || isSummaryAuthorized) {
      action();
    } else {
      setShowPinLock(true);
      setPendingAction(() => action);
    }
  };

  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const handlePinSubmit = () => {
    // In a real app, verify against server or encrypted config
    // For this demo, manager/owner PIN is 9999
    if (pinBuffer === '9999') {
      setIsSummaryAuthorized(true);
      setShowPinLock(false);
      setPinBuffer('');
      setPinError(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } else {
      setPinError(true);
      setPinBuffer('');
      setTimeout(() => setPinError(false), 1000);
    }
  };

  const loadBookingHistory = async () => {
    setIsHistoryLoading(true);
    const data = await googleSheetService.fetchBookings();
    if (data && data.length > 1) {
      // Data is [headers, row1, row2...]
      const headers = data[0];
      const rows = data.slice(1).map((row: any[], idx: number) => {
        const booking: any = { id: `hist-${idx}` };
        headers.forEach((header: string, hIdx: number) => {
          booking[header.toLowerCase().replace(/ /g, '_')] = row[hIdx];
        });
        
        // Map custom fields for PrintableReceipt
        return {
          ...booking,
          customerName: booking.customer_name || booking.name || 'Guest',
          serviceName: booking.service_name || booking.service || 'Service',
          therapistName: booking.therapist_name || booking.therapist || 'Staff',
          amount: parseFloat(booking.price) || 0,
          paymentMethod: booking.payment_method || booking.method || 'Cash',
          date: new Date(booking.timestamp || booking.date || Date.now())
        };
      });
      // Sort by date descending
      setHistoryBookings(rows.sort((a, b) => b.date.getTime() - a.date.getTime()));
    }
    setIsHistoryLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'payments') {
      loadBookingHistory();
    }
  }, [activeTab]);

  const totalCashSales = salesLog.filter(s => s.method === 'Cash').reduce((acc, s) => acc + s.amount, 0);
  const cashLimit = 500; // Notify owner if cash > $500
  
  useEffect(() => {
    if (totalCashSales > cashLimit && accessLevel === 'owner') {
      setSomMessage(t(`ว้าว! วันนี้เก็บเงินสดได้เยอะเลยค่ะพี่ (${formatCurrency(totalCashSales)}) อย่าลืมแบ่งไปฝากธนาคารให้ยอดตรงกับบัญชีนะคะ น้องส้มเป็นห่วงค่ะ! 🍊`, `Wow! You've collected a lot of cash today (${formatCurrency(totalCashSales)}). Don't forget to deposit it into the bank to match your accounting records! 🍊`));
    }
  }, [totalCashSales, accessLevel]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const expense = {
      id: `exp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...newExpense,
      recordedBy: accessLevel || 'unknown'
    };
    setExpenses(prev => [expense, ...prev]);
    setIsExpenseModalOpen(false);
    setNewExpense({ description: '', amount: 0, category: 'Supplies' });
    setSomMessage(t('บันทึกรายจ่ายเรียบร้อยค่ะ! น้องส้มจะเก็บใบเสร็จนี้ไว้ให้พี่แสน (Master Admin) สรุปภาษีตอนสิ้นเดือนนะคะ 🍊', 'Expense recorded! I will keep this record for the Master Admin to summarize for tax at the end of the month. 🍊'));
  };

  const newAlertsCount = alerts.filter(a => a.status === 'NEW').length;

  const getInsuranceStatus = (expiryDate?: string) => {
    if (!expiryDate) return { status: 'valid', message: '' };
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'expired', message: 'Insurance Expired' };
    if (diffDays <= 30) return { status: 'warning', message: `Expiring in ${diffDays} days` };
    return { status: 'valid', message: '' };
  };

  const GP_RATE = settings.gpFeePercent / 100;

  const generateMonthlySummary = async () => {
    setIsSummaryLoading(true);
    setSomMessage(t('กำลังดึงข้อมูลการจองเพื่อสรุปยอดรายเดือนนะคะ รอแป๊บนึงค่ะ 🍊', 'Generating monthly summary... please wait. 🍊'));
    
    try {
      const allBookings = await googleSheetService.fetchBookings();
      
      // Filter for current month (assuming index 4 is timestamp in the sheet based on common patterns)
      // Usually Google Sheet data from Apps Script comes as array of arrays [headers, row1, row2...]
      // We'll calculate based on what we have.
      
      let count = 0;
      let totalRevenue = 0;
      
      if (allBookings.length > 1) {
        // Skip header
        const rows = allBookings.slice(1);
        count = rows.length;
        
        // Find price column index (Price is usually standard in our logs)
        // Here we'll sum up the revenue.
        rows.forEach(row => {
          // Row structure: [id, timestamp, shop, customer, service, therapist, price, method, type...]
          const price = parseFloat(row[8]) || 0; // Adjusting based on typical schema
          totalRevenue += price;
        });
      } else {
        // Fallback to local session data if sheet is empty or fetch failed
        count = salesLog.length;
        totalRevenue = salesLog.reduce((acc, s) => acc + s.amount, 0);
      }
      
      const gst = totalRevenue / 11;
      const gpAmount = totalRevenue * GP_RATE;
      const month = new Date().toLocaleString('th-TH', { month: 'long', year: 'numeric' });
      
      setMonthlySummary({
        count,
        totalRevenue,
        gst,
        gpAmount,
        month
      });
      setShowSummaryModal(true);
    } catch (error) {
      console.error(error);
      setSomMessage(t('อุ๊ย! ดึงข้อมูลไม่สำเร็จค่ะ ลองตรวจสอบเน็ตดูอีกทีนะคะ 🍊', 'Failed to generate summary. Please check your connection. 🍊'));
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!monthlySummary) return;
    
    setIsSummaryLoading(true);
    const result = await googleSheetService.savePerformanceSummary({
      month: monthlySummary.month,
      bookingsCount: monthlySummary.count,
      revenue: monthlySummary.totalRevenue,
      gst: monthlySummary.gst,
      platformGP: monthlySummary.gpAmount,
      timestamp: new Date().toISOString()
    });
    
    if (result.success) {
      setSomMessage(t('สรุปยอดส่งบัญชีเรียบร้อยแล้วค่ะ! พี่ไม่ต้องกังวลแล้วนะคะ 🍊', 'Monthly summary saved to Performance_Summary! 🍊'));
      setShowSummaryModal(false);
    } else {
      setSomMessage(t('บันทึกไม่สำเร็จค่ะ โถ่... ลองกดใหม่อีกทีนะคะพี่ 🍊', 'Failed to save summary. Please try again. 🍊'));
    }
    setIsSummaryLoading(false);
  };

  // Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setStaff(prev => prev.map(s => {
        if (s.status === 'Working' && s.remainingSeconds && s.remainingSeconds > 0) {
          const nextSec = s.remainingSeconds - 1;
          if (nextSec === 0) {
            // When session ends, bed remains 'In Use' but paymentStatus is 'Unpaid'
            return { ...s, status: 'PaymentPending', remainingSeconds: undefined };
          }
          return { ...s, remainingSeconds: nextSec };
        }
        return s;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update Bed Payment Status based on Staff Status
  useEffect(() => {
    staff.forEach(s => {
      if (s.currentBedNumber) {
        const bed = beds.find(b => b.number === s.currentBedNumber);
        if (bed && (s.status === 'Working' || s.status === 'PaymentPending')) {
          if (bed.status !== 'In Use') {
            updateBedStatus(bed.id, 'In Use');
          }
        }
      }
    });
  }, [staff, beds, updateBedStatus]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWalkIn.customerName.trim()) {
      setFormError(t('พี่ลืมใส่ชื่อลูกค้าหรือเปล่าคะ? น้องส้มรบกวนตรวจดูอีกนิดนึงนะคะ 🍊', 'Did you forget the customer name? Please double check. 🍊'));
      return;
    }

    if (newWalkIn.therapistId === 'none') {
      const suggestion = getSmartQueueSuggestion();
      if (suggestion) {
        setSomMessage(suggestion);
      }
      setFormError(t('กรุณาเลือกพี่หมอด้วยนะคะ 🍊', 'Please select a therapist. 🍊'));
      return;
    }

    if (!newWalkIn.bedId) {
      setFormError(t('กรุณาเลือกเตียงให้พี่หมอด้วยนะคะ 🍊', 'Please select a bed. 🍊'));
      return;
    }

    const service = services.find(s => s.id === newWalkIn.serviceId);
    if (!service) return;

    const bed = beds.find(b => b.id === newWalkIn.bedId);
    if (!bed) return;

    const selectedStaff = staff.find(s => s.therapistId === newWalkIn.therapistId);
    const insStatus = getInsuranceStatus(selectedStaff?.insuranceExpiry);

    if (insStatus.status === 'expired') {
      setPendingWalkIn(newWalkIn);
      setShowInsuranceWarning(true);
      return;
    }

    proceedWithQuickAdd(newWalkIn);
  };

  const getSmartQueueSuggestion = () => {
    const activeSessions = staff.filter(s => s.status === 'Working' || s.status === 'PaymentPending');
    const availableStaff = staff.filter(s => s.status === 'Available');
    
    if (availableStaff.length === 0 && activeSessions.length > 0) {
      // Find the one that finishes soonest
      const sortedByTime = [...activeSessions].sort((a, b) => (a.remainingSeconds || 0) - (b.remainingSeconds || 0));
      const nextOne = sortedByTime[0];
      const minsLeft = nextOne.remainingSeconds ? Math.ceil(nextOne.remainingSeconds / 60) : 0;
      
      return t(
        `ขณะนี้พี่ๆ หมอยังติดภารกิจอยู่ทุกคนเลยค่ะ แย่จัง... 🍊 แต่ไม่ต้องห่วงนะคะ! พี่${nextOne.therapistName} จะว่างในอีกประมาณ ${minsLeft} นาทีค่ะ พี่อยากให้น้องส้มร่างข้อความตอบปฏิเสธแบบน่ารักๆ พร้อมเสนอเวลาให้ลูกค้ามั้ยคะ?`,
        `All therapists are currently busy... 🍊 Don't worry! ${nextOne.therapistName} will be available in about ${minsLeft} mins. Would you like me to draft a polite message with this alternative time for the customer?`
      );
    }
    return null;
  };

  const proceedWithQuickAdd = (data: any) => {
    const service = services.find(s => s.id === data.serviceId);
    if (!service) return;

    const bed = beds.find(b => b.id === data.bedId);
    if (!bed) return;

    const therapist = therapists.find(t => t.id === data.therapistId);

    const newBooking: QueueItem = {
      id: `walkin-${Date.now()}`,
      customerName: data.customerName,
      serviceName: `${service.name} (${service.englishName})`,
      durationMins: service.durationMins,
      price: service.standardPrice
    };

    // Log action
    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      performer: accessLevel || 'unknown',
      action: 'CREATE_BOOKING',
      details: `Created walk-in booking for ${data.customerName}`
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    // Assign immediately
    setStaff(prev => prev.map(s => {
      if (s.therapistId === data.therapistId) {
        return {
          ...s,
          status: 'Working',
          remainingSeconds: newBooking.durationMins * 60,
          currentCustomer: newBooking.customerName,
          currentService: newBooking.serviceName,
          currentServiceId: service.id,
          currentPrice: newBooking.price,
          currentBedNumber: bed.number,
          currentBedType: bed.type,
          healthFund: data.healthFund,
          memberId: data.memberId,
          providerNumber: therapist?.providerNumber,
          // Add createdBy for audit
          createdBy: accessLevel || 'unknown'
        } as any;
      }
      return s;
    }));

    updateBedStatus(bed.id, 'In Use');
    setSomMessage(t(`คุณพี่คะ หนูใส่สีส้มไว้ที่เตียงที่นวดเสร็จแล้วแต่ยังไม่ได้เก็บเงินนะคะ พอคุณพี่ได้รับเงินแล้วกด "ยืนยันการชำระเงิน" หนูจะเปลี่ยนเป็นสีเขียวให้ทันทีค่ะ`, `I've marked the bed orange for unpaid sessions. Once you receive payment and click "Confirm Payment", I'll turn it green.`));
    
    setIsQuickAddOpen(false);
    setFormError(null);
    setNewWalkIn({ customerName: '', serviceId: services[0].id, therapistId: 'none', healthFund: '', memberId: '' });
    setPendingWalkIn(null);
    setShowInsuranceWarning(false);
  };

  const processPayment = (method: 'Cash' | 'Card' | 'PayID' | 'HICAPS') => {
    if (!paymentSession) return;

    if (accessLevel === 'staff') {
      const securityEvent: SecurityEvent = {
        id: `sec-${Date.now()}`,
        timestamp: new Date().toISOString(),
        role: 'staff',
        eventType: 'FINANCIAL_EDIT_DENIED',
        details: 'Staff attempted to process payment. Access Denied.'
      };
      setSecurityLogs(prev => [securityEvent, ...prev]);
      setSomMessage(t('ขออภัยค่ะพี่ ฟังก์ชันการเงินล็อคไว้เฉพาะ Manager/Owner นะคะ น้องส้มลงบันทึกไว้ให้พี่แสนดูแล้วค่ะ 🍊', 'Sorry, financial functions are restricted to Manager/Owner. I have logged this attempt for the owner. 🍊'));
      return;
    }
    
    setPaymentMethod(method);
    
    const amount = method === 'HICAPS' ? hicapsData.claim + hicapsData.gap : (paymentSession.currentPrice || 0);

    const now = new Date();
    const exactTime = now.toLocaleTimeString('en-AU', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Audit System Integration for PayID
    const captureAuditTimestamp = () => {
      console.log(`[AUDIT] PayID Payment Captured at ${exactTime} for ${paymentSession.therapistName}`);
      // In a real app, this would call a backend API to save to SALES_LOG Google Sheet
    };

    if (method === 'PayID') {
      captureAuditTimestamp();
    }

    const systemFee = billingPlan === 'GP%' ? (amount * settings.gpFeePercent) / 100 : 0;
    
    const logData = {
      id: `sale-${Date.now()}`,
      timestamp: now.toISOString(),
      transactionTimestamp: method === 'PayID' ? exactTime : undefined,
      shopName: storeConfig.storeName,
      customer: paymentSession.currentCustomer,
      service: paymentSession.currentService,
      therapist: paymentSession.therapistName,
      providerNumber: paymentSession.providerNumber,
      amount: amount,
      insuranceClaim: method === 'HICAPS' ? hicapsData.claim : 0,
      gapPayment: method === 'HICAPS' ? hicapsData.gap : 0,
      gst: amount / 11,
      developerFee: systemFee,
      method: method,
      type: 'SALE',
      bedNumber: paymentSession.currentBedNumber,
      bedType: paymentSession.currentBedType,
      createdBy: (paymentSession as any).createdBy || 'unknown',
      closedBy: accessLevel || 'unknown'
    };
    
    setSalesLog(prev => [...prev, logData]);

    // Add Audit Log
    const paymentAudit: AuditLog = {
      id: `audit-pay-${Date.now()}`,
      timestamp: now.toISOString(),
      performer: accessLevel || 'unknown',
      action: 'PROCESS_PAYMENT',
      details: `Processed ${method} payment of $${amount.toFixed(2)} for ${paymentSession.currentCustomer}`
    };
    setAuditLogs(prev => [paymentAudit, ...prev]);
    setLastSaleDate(now);
    
    if (method === 'PayID') {
      setSomMessage(t(`บันทึกยอด PayID เรียบร้อย (เวลา ${exactTime}) น้องส้มจดวินาทีไว้ให้พี่เช็คแล้วค่ะ! 🍊`, `PayID payment recorded (Time: ${exactTime}). I've noted the exact second for the owner to check! 🍊`));
    } else if (method === 'HICAPS' || paymentSession.healthFund) {
      setSomMessage(t(`ชำระเงินเรียบร้อยแล้วค่ะ! น้องส้มเตรียมร่างอีเมลส่งใบเสร็จ Remedial Massage สำหรับเคลมประกันให้ลูกค้าแล้วนะคะ พี่แสนกดเปิด Nong Som เพื่อดูดราฟต์ได้เลยค่ะ 🍊`, `Payment successful! I've prepared a draft email with the Remedial Massage receipt for the customer's insurance claim. Ask me to see the draft! 🍊`));
    } else {
      setSomMessage(t('บันทึกการชำระเงินเรียบร้อยแล้วค่ะพี่! 🍊', 'Payment recorded successfully! 🍊'));
    }
    
    // Post-Action Loop
    // We don't reset staff/beds yet, we show the receipt first
    setShowReceipt(true);

    // Automatic Printing Trigger (Professional Automation)
    if (enablePrinting) {
      handlePrint();
    }
  };

  const handlePrint = async () => {
    if (!paymentSession || !paymentMethod || !enablePrinting) return;

    const receiptData: ReceiptData = {
      storeName: storeConfig.storeName,
      abn: storeConfig.abn,
      address: storeConfig.address,
      date: new Date().toLocaleString(),
      customer: paymentSession.currentCustomer || 'Guest',
      therapist: paymentSession.therapistName,
      providerNumber: paymentSession.providerNumber,
      service: paymentSession.currentService || 'Massage Service',
      price: paymentSession.currentPrice || 0,
      paymentMethod: paymentMethod,
      hicaps: paymentMethod === 'HICAPS' ? hicapsData : undefined
    };

    try {
      if (settings.printerConnection === 'USB') {
        await printerService.printViaUSB(receiptData);
      } else if (settings.printerConnection === 'BLUETOOTH') {
        await printerService.printViaBluetooth(receiptData);
      } else if (settings.printerConnection === 'CLOUD' && settings.sunmiCloudToken) {
        await printerService.printViaCloud(receiptData, settings.sunmiCloudToken);
      } else if (settings.printerConnection === 'AUTO') {
        // Auto logic: try cloud if token exists, else fallback to window print
        if (settings.sunmiCloudToken) {
          await printerService.printViaCloud(receiptData, settings.sunmiCloudToken);
        } else {
          window.print();
        }
      } else {
        window.print();
      }
    } catch (error) {
      console.error('Print failed, falling back to window print', error);
      window.print();
    }
  };

  const closeReceipt = () => {
    if (paymentSession) {
      setStaff(prev => prev.map(s => {
        if (s.therapistId === paymentSession.therapistId) {
          return { 
            ...s, 
            status: 'Available', 
            lastAvailableAt: new Date().toISOString(),
            currentCustomer: undefined, 
            currentService: undefined, 
            currentPrice: undefined,
            currentBedNumber: undefined,
            currentBedType: undefined
          };
        }
        return s;
      }));

      if (paymentSession.currentBedNumber) {
        const bed = beds.find(b => b.number === paymentSession.currentBedNumber);
        if (bed) {
          updateBedStatus(bed.id, 'Vacant');
        }
      }
    }

    setPaymentSession(null);
    setPaymentMethod(null);
    setHicapsData({ claim: 0, gap: 0 });
    setPayIdSlip(null);
    setShowReceipt(false);
    setSomMessage(t('จ่ายเงินเรียบร้อยแล้วค่ะพี่! เตียงพร้อมรับแขกใหม่แล้วนะคะ 🍊', 'Payment successful! The bed is now vacant and ready for the next customer. 🍊'));
  };

  const toggleBreak = (therapistId: string) => {
    setStaff(prev => prev.map(s => {
      if (s.therapistId === therapistId) {
        if (s.status === 'Working') return s;
        return {
          ...s,
          status: s.status === 'Break' ? 'Available' : 'Break',
          lastAvailableAt: s.status === 'Break' ? new Date().toISOString() : s.lastAvailableAt
        };
      }
      return s;
    }));
  };

  return (
    <div className="min-h-screen bg-pearl text-navy flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-ocean/90 backdrop-blur-2xl border-b border-white/20 px-8 py-8 flex justify-between items-center shrink-0 z-40 sticky top-0 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-white/20 flex items-center justify-center text-white border-2 border-white/30 shadow-2xl rotate-3 scale-110">
            <LayoutGrid size={40} />
          </div>
          <div className="hidden md:block space-y-1">
            <h1 className="text-4xl md:text-5xl font-serif font-black text-white tracking-tight italic leading-tight">{storeConfig.storeName}</h1>
            <p className="text-white/70 uppercase tracking-[0.4em] text-sm md:text-xl font-black">
              {t('Manager Control Hub • Ocean Breeze', 'Premium Management Solution')}
            </p>
          </div>
        </div>

        {/* Mini Bar Navigation */}
        <div className="flex bg-white/10 p-1.5 rounded-[2rem] border border-white/20 backdrop-blur-xl shrink-0 gap-1 overflow-x-auto">
          <button onClick={() => setActiveTab('calendar')} className={cn("px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all", activeTab === 'calendar' ? "bg-gold text-navy" : "text-white/70 hover:bg-white/10")}>
            {t('MANAGE STAFF', 'MANAGE STAFF')}
          </button>
          <button onClick={() => setActiveTab('control')} className={cn("px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all", activeTab === 'control' ? "bg-gold text-navy" : "text-white/70 hover:bg-white/10")}>
            {t('OVERVIEW', 'OVERVIEW')}
          </button>
          <button onClick={() => generateMonthlySummary()} className="px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-white/70 hover:bg-white/10 transition-all">
            {t('SUMMARY', 'SUMMARY')}
          </button>
          <button onClick={() => setShowAlerts(true)} className="relative px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-white/70 hover:bg-white/10 transition-all">
            {t('ALERTS', 'ALERTS')}
            {newAlertsCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />}
          </button>
          <button onClick={() => setActiveTab('crm')} className={cn("px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all", activeTab === 'crm' ? "bg-gold text-navy" : "text-white/70 hover:bg-white/10")}>
            {t('CRM', 'CRM')}
          </button>
          <button onClick={() => setActiveTab('marketing')} className={cn("px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all", activeTab === 'marketing' ? "bg-indigo-400 text-white" : "text-white/70 hover:bg-white/10")}>
            {t('AI MARKETING', 'AI MARKETING')}
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setSomMessage(t('พี่ค่ะ ยื่นหน้าจอนี้ให้ลูกค้าลงทะเบียนได้เลยนะคะ ข้อมูลสุขภาพลูกค้าจะไหลเข้าระบบ CRM น้องส้มสวยๆ เลยค่ะ! 🍊', 'P\'... Hand this to the customer for registration. Their health data will sync perfectly to CRM! 🍊'));
              setIsIntakeOpen(true);
            }}
            className="flex items-center gap-3 px-8 h-14 bg-white/20 text-white rounded-[2rem] font-black border border-white/30 hover:bg-white hover:text-ocean transition-all shadow-2xl backdrop-blur-md"
          >
            <FileText size={20} />
            <span className="text-[10px] uppercase tracking-[0.3em] hidden lg:inline">{t('New Guest', 'New Guest Intake')}</span>
          </button>

          <button 
            onClick={() => setShowAlerts(true)}
            className="relative w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white hover:text-ocean transition-all border border-white/30 shadow-2xl shadow-navy/20"
          >
            <Bell size={24} />
            {newAlertsCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>
          
          <button 
            onClick={logout}
            className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-200 flex items-center justify-center border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all shadow-2xl"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {somMessage && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-4 right-4 md:left-auto md:right-8 md:w-[400px] z-[200] bg-orange-500/90 backdrop-blur-md border border-white/20 p-4 md:p-6 rounded-2xl md:rounded-[2rem] flex items-center gap-4 shadow-2xl"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white flex items-center justify-center text-orange-500 shadow-lg flex-shrink-0">
              <Sparkles size={20} className="md:size-24" fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-xs md:text-sm leading-tight font-sans break-words">{somMessage}</p>
              <p className="text-[8px] md:text-[10px] text-white/60 uppercase font-black tracking-widest mt-1">Nong Som (น้องส้ม) 🍊</p>
            </div>
            <button 
              onClick={() => setSomMessage(null)}
              className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto space-y-10 bg-[#0A0E17]">
        {activeTab === 'calendar' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-serif font-black text-white">{t('ตารางการทำงานรายคน', 'Staff Weekly Schedule')}</h3>
                <p className="text-slate-500 text-sm mt-1">{t('ตารางจัดสรรพนักงานแบบรายคอลัมน์ (Melbooking Inspired)', 'Multi-column Therapist Board')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {staff.map(s => (
                <div key={s.therapistId} className="flex flex-col gap-4 bg-slate-900/50 rounded-[3rem] p-6 border border-slate-800 h-[600px] overflow-hidden relative">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20 text-lg font-black">
                      {s.therapistName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-bold">{s.therapistName}</div>
                      <div className={cn(
                        "text-[8px] uppercase font-black tracking-widest",
                        s.status === 'Available' ? "text-emerald-400" : s.status === 'Working' ? "text-orange-400" : "text-slate-400"
                      )}>
                        {s.status}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 py-4 overflow-y-auto scrollbar-hide">
                    {/* Active Session */}
                    {s.status === 'Working' && (
                      <motion.div 
                        layoutId={`session-${s.therapistId}`}
                        className="bg-orange-500 p-4 rounded-3xl text-white shadow-xl shadow-orange-900/20"
                      >
                         <div className="flex justify-between items-start mb-2">
                           <div className="text-[8px] font-black uppercase tracking-widest opacity-60">Working Now</div>
                           <Clock size={12} />
                         </div>
                         <div className="font-bold text-sm mb-1">{s.currentCustomer}</div>
                         <div className="text-[10px] opacity-80 leading-tight">{s.currentService}</div>
                         <div className="mt-4 flex items-center gap-2">
                           <div className="text-xl font-black">{Math.floor((s.remainingSeconds || 0) / 60)}:{(s.remainingSeconds || 0) % 60 < 10 ? '0' : ''}{(s.remainingSeconds || 0) % 60}</div>
                           <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden flex-1">
                             <motion.div 
                               initial={{ width: '0%' }}
                               animate={{ width: `${((s.remainingSeconds || 0) / (3600)) * 100}%` }}
                               className="h-full bg-white"
                             />
                           </div>
                         </div>
                      </motion.div>
                    )}

                    {/* Pending Payment */}
                    {s.status === 'PaymentPending' && (
                      <div className="bg-amber-500 p-4 rounded-3xl text-white animate-pulse shadow-lg shadow-amber-900/20">
                         <div className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-2">Service Ended</div>
                         <div className="font-bold text-sm mb-1">{s.currentCustomer}</div>
                         <div className="text-[10px] opacity-80">Waiting for Payment</div>
                      </div>
                    )}

                    {/* Empty Slots */}
                    {s.status === 'Available' && (
                      <div className="h-24 rounded-3xl border-2 border-dashed border-gold/10 flex flex-col items-center justify-center text-gold/20 hover:border-gold/40 hover:text-gold/40 transition-all cursor-pointer group bg-gold/5">
                        <Plus size={24} className="mb-1 group-hover:scale-125 transition-transform" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Assign Guest</span>
                      </div>
                    )}

                    {/* Next Bookings */}
                    <div className="border-t border-gold/5 pt-4">
                      <div className="text-[8px] font-black uppercase tracking-widest text-gold/20 mb-3 ml-1 tracking-[0.2em]">Up Next</div>
                      <div className="bg-gold/5 border border-gold/10 p-3 rounded-2xl mb-2 opacity-30">
                        <div className="text-[8px] font-black uppercase tracking-widest text-gold/40 mb-1">Coming Soon</div>
                        <div className="text-xs font-bold text-gold/30 italic">No reserved guests</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'crm' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-4xl font-serif font-black text-gold italic tracking-tight">{t('ฐานข้อมูลลูกค้า (CRM)', 'VIP Customer Registry')}</h3>
                <p className="text-gold/50 text-sm mt-2 font-medium tracking-wide uppercase tracking-[0.2em]">{t('ประวัติและสถานะลูกค้าแบบเจาะลึก', 'Intelligent Business Insights & CRM')}</p>
              </div>
              <button className="px-8 py-4 bg-gold text-navy rounded-full font-black flex items-center gap-2 hover:scale-105 transition-all shadow-2xl shadow-gold/20">
                <UserPlus size={20} /> {t('เพิ่มข้อมูลลูกค้า', 'Register Guest')}
              </button>
            </div>

            <div className="bg-white/5 rounded-[4rem] border border-gold/10 p-10 overflow-hidden shadow-2xl backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gold/5 text-left">
                      <th className="pb-8 text-[10px] font-black uppercase tracking-[0.3em] text-gold/30">{t('ชื่อลูกค้า', 'Guest Name')}</th>
                      <th className="pb-8 text-[10px] font-black uppercase tracking-[0.3em] text-gold/30">{t('จำนวนครั้งที่มา', 'Loyalty Count')}</th>
                      <th className="pb-8 text-[10px] font-black uppercase tracking-[0.3em] text-gold/30">{t('ครั้งล่าสุด', 'Last Visit')}</th>
                      <th className="pb-8 text-[10px] font-black uppercase tracking-[0.3em] text-gold/30">{t('สถานะลูกค้า', 'Status Profiling')}</th>
                      <th className="pb-8 text-[10px] font-black uppercase tracking-[0.3em] text-gold/30 text-right">{t('ดำเนินการ', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(customer => {
                      const isVIP = customer.visits >= 10;
                      const isNew = customer.visits <= 1;
                      const lastVisitDate = new Date(customer.lastVisit);
                      const diffDays = Math.ceil((new Date().getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
                      const isInactive = diffDays > 60;
                      const todayStr = new Date().toISOString().slice(5, 10);
                      const isBirthday = customer.birthday.slice(5, 10) === todayStr;

                      return (
                        <tr key={customer.id} className="border-b border-gold/5 group hover:bg-gold/5 transition-all">
                          <td className="py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-gold/5 flex items-center justify-center text-gold font-serif font-black text-xl border border-gold/10 group-hover:border-gold/30 transition-all">
                                {customer.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-white text-lg">{customer.name}</div>
                                <div className="text-[10px] text-gold/40 font-black uppercase tracking-widest">{customer.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-8">
                            <div className="text-3xl font-serif font-black text-gold">{customer.visits}</div>
                            <div className="text-[8px] text-gold/30 font-black uppercase tracking-widest">times</div>
                          </td>
                          <td className="py-8">
                            <div className="text-gold/60 text-sm font-medium">{customer.lastVisit}</div>
                            <div className="text-[8px] text-gold/30 font-black uppercase tracking-widest">{diffDays} days ago</div>
                          </td>
                          <td className="py-8">
                            <div className="flex flex-wrap gap-3">
                              {isVIP && (
                                <span className="px-4 py-1.5 bg-gold/10 text-gold rounded-full text-[9px] font-black uppercase tracking-widest border border-gold/20 flex items-center gap-2 shadow-lg">
                                  <Star size={10} fill="currentColor" /> VIP Elite
                                </span>
                              )}
                              {isNew && (
                                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">New Discovery</span>
                              )}
                              {isInactive && (
                                <span className="px-4 py-1.5 bg-sky-500/10 text-sky-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-sky-500/20 flex items-center gap-2">
                                  <Clock size={10} /> Inactive
                                </span>
                              )}
                              {isBirthday && (
                                <span className="px-4 py-1.5 bg-rose-500/10 text-rose-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-500/20 flex items-center gap-2 shadow-lg animate-bounce">
                                  <Heart size={10} fill="currentColor" /> Special Day
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-8 text-right">
                             <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all">
                               {isInactive && (
                                 <button 
                                   onClick={() => setSomMessage(`พี่คะ! ส่งโปรโมชั่น 'Relax & Recharge' ให้พี่ ${customer.name} ดีมั้ยคะ? ลด 15% รับรองแขกกลับมาคึกคักแน่นอนค่ะ 🍊`)}
                                   className="px-4 py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-400 shadow-xl"
                                 >
                                   เสนอโปร Relax & Recharge 🍊
                                 </button>
                               )}
                               <button className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center hover:bg-gold hover:text-navy border border-gold/20 transition-all">
                                 <ChevronRight size={20} />
                               </button>
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (accessLevel === 'owner' || accessLevel === 'admin') && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Security Logs */}
              <div className="bg-slate-900/80 p-8 rounded-[3rem] border border-red-500/10 shadow-2xl backdrop-blur-md space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-white text-left">{t('บันทึกความปลอดภัย', 'Security Events')}</h3>
                    <p className="text-slate-500 text-xs text-left">{t('ประวัติการพยายามเข้าถึงฟังก์ชันที่ถูกจำกัด', 'Unauthorized access attempts history')}</p>
                  </div>
                </div>
                
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {securityLogs.length > 0 ? securityLogs.map(log => (
                    <div key={log.id} className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-1 bg-red-500 text-white text-[8px] font-black rounded uppercase tracking-widest">{log.eventType}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-300 text-left font-bold">{log.details}</p>
                      <p className="text-[10px] text-red-400/60 uppercase font-black tracking-widest">Role: {log.role}</p>
                    </div>
                  )) : (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-600 mb-4">
                        <CheckCircle size={32} />
                      </div>
                      <p className="text-slate-600 italic text-sm">No security incidents detected.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Audit Logs */}
              <div className="bg-slate-900/80 p-8 rounded-[3rem] border border-indigo-500/10 shadow-2xl backdrop-blur-md space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-white text-left">{t('Audit Log / ประวัติการทำงาน', 'Activity Audit Log')}</h3>
                    <p className="text-slate-500 text-xs text-left">{t('ตรวจสอบว่าใครเป็นคนลงคิวและปิดยอด', 'Track who created and closed transactions')}</p>
                  </div>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {auditLogs.length > 0 ? auditLogs.map(log => (
                    <div key={log.id} className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-2 border-l-4 border-l-indigo-500">
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">{log.action}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-300 text-left">{log.details}</p>
                      <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Performer: {log.performer}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-600 mb-4">
                        <Clock size={32} />
                      </div>
                      <p className="text-slate-600 italic text-sm">No activity recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (accessLevel === 'owner' || accessLevel === 'admin') && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8">
            <div className="bg-slate-900/80 p-10 rounded-[3rem] border border-indigo-500/10 shadow-2xl backdrop-blur-md space-y-10">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Sparkles size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-serif font-bold text-white">{t('AI Marketing Hub 🍊', 'AI Marketing Hub')}</h3>
                    <p className="text-slate-500 text-sm">{t('เปลี่ยนภาษาไทยบ้านๆ ให้เป็น Content ภาษาอังกฤษระดับพรีเมียม', 'Convert casual Thai into premium English content.')}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60">{t('Thai Concept / ไอเดียบอกน้องส้ม', 'Thai Concept')}</label>
                    <textarea 
                      value={marketingInput}
                      onChange={(e) => setMarketingInput(e.target.value)}
                      placeholder={t('เช่น นวดไทยที่นี่ดีที่สุดใน Altona ราคากันเอง พนักงานฝีมือดี...', 'e.g. Best Thai massage in Altona, friendly prices...')}
                      className="w-full h-48 bg-slate-800/50 border border-indigo-500/10 rounded-3xl p-6 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
                    />
                    <button 
                      disabled={!marketingInput || isAiProcessingMarketing}
                      onClick={generateMarketingPost}
                      className={cn(
                        "w-full py-4 bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                        (!marketingInput || isAiProcessingMarketing) ? "opacity-50 grayscale cursor-not-allowed" : "hover:scale-105 active:scale-95 shadow-xl shadow-indigo-900/20"
                      )}
                    >
                      {isAiProcessingMarketing ? <Timer className="animate-spin" /> : <Sparkles />}
                      {isAiProcessingMarketing ? t('กำลังเขียน...', 'Generating...') : t('Generate Premium Eng Content', 'Generate Premium Eng Content')}
                    </button>
                  </div>

                    <div className="space-y-4">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60">{t('Luxury Result / ผลลัพธ์ระดับพรีเมียม', 'Luxury Result')}</label>
                      <div className="w-full h-48 relative group">
                        {marketingOutput ? (
                          <>
                            {/* Glowing Gold Border Container */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#B8962E] to-[#F5F5DC] rounded-3xl blur-[1px]" />
                            <div className="relative m-[1px] h-[calc(100%-2px)] bg-[#0A0D17] border border-indigo-500/20 rounded-[1.4rem] p-6 text-indigo-100 text-sm leading-relaxed overflow-y-auto italic font-serif shadow-[0_0_20px_rgba(184,150,46,0.2)] whitespace-pre-wrap">
                              {marketingOutput}
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(marketingOutput);
                                  setSomMessage(t('คัดลอกเรียบร้อยค่ะ! 🍊', 'Copied to clipboard! 🍊'));
                                }}
                                className="absolute top-4 right-4 p-2 bg-gold/20 hover:bg-gold text-white hover:text-navy rounded-lg transition-all shadow-[0_0_10px_rgba(184,150,46,0.3)]"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-600 opacity-50">
                             <ImageIcon size={32} className="mb-2" />
                             <p className="text-[10px] font-black uppercase tracking-widest">Waiting for input...</p>
                          </div>
                        )}
                      </div>
                    </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (accessLevel === 'owner' || accessLevel === 'admin') && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8">
            <div className="bg-slate-900/80 p-10 rounded-[3rem] border border-rose-500/10 shadow-2xl backdrop-blur-md space-y-8">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                      <Wallet size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-serif font-bold text-white">{t('บันทึกรายจ่ายร้าน', 'Store Expense Log')}</h3>
                      <p className="text-slate-500 text-sm">{t('บันทึกทุกยอดใช้จ่ายเพื่อใช้ลดหย่อนภาษีนะคะ 🍊', 'Record all expenses for tax deduction benefits.')}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      disabled={isAiScanning}
                      onClick={() => {
                        setIsAiScanning(true);
                        setSomMessage(t('กำลังเปิดระบบ AI Bulk Scan... กรุณารอสักครู่นะคะพี่ 🍊', 'Opening AI Bulk Scan system... Please wait a moment! 🍊'));
                        setTimeout(() => {
                           setIsAiScanning(false);
                           setSomMessage(t('ระบบ AI Scan พร้อมแล้วค่ะ! พี่สามารถอัปโหลดรูปใบเสร็จหลายๆ ใบพร้อมกันได้เลยค่ะ เดี๋ยวส้มสรุปให้ 🍊', 'AI Scan ready! You can upload multiple receipt photos at once, I will summarize them for you! 🍊'));
                        }, 2000);
                      }}
                      className={cn(
                        "px-8 py-4 bg-indigo-500 text-white rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-indigo-900/20",
                        isAiScanning && "animate-pulse opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Camera size={20} /> {isAiScanning ? t('กำลังสแกน...', 'Scanning...') : t('Bulk AI Scan', 'Bulk AI Scan')}
                    </button>
                    <button 
                      onClick={() => setIsExpenseModalOpen(true)}
                      className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-rose-900/20"
                    >
                      <Plus size={20} /> {t('เพิ่มรายจ่าย', 'Add Expense')}
                    </button>
                  </div>
               </div>

               <div className="space-y-4">
                 {expenses.length > 0 ? expenses.map(exp => (
                   <div key={exp.id} className="p-6 rounded-[2rem] bg-slate-800/50 border border-slate-700/50 flex justify-between items-center group hover:bg-slate-800 transition-all border-l-4 border-l-rose-500">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-xl">
                          {exp.category === 'Supplies' ? '🧵' : exp.category === 'Rent' ? '🏢' : exp.category === 'Utilities' ? '⚡' : '💸'}
                        </div>
                        <div>
                          <p className="text-white font-bold">{exp.description}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{exp.category} • {new Date(exp.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-serif font-bold text-rose-400">-${exp.amount.toFixed(2)}</div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">By: {exp.recordedBy}</p>
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-20 bg-slate-800/20 rounded-[3rem] border border-dashed border-slate-700/50">
                      <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto text-slate-600 mb-6">
                        <FileText size={40} />
                      </div>
                      <p className="text-slate-400 font-medium">{t('ยังไม่มีการบันทึกรายจ่ายในเดือนนี้ค่ะพี่ 🍊', 'No expenses recorded yet this month.')}</p>
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'control' && (
          <>
            {/* Bed Status Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <LayoutGrid size={20} />
                  </div>
                  <h4 className="text-xl font-serif font-bold text-white">{t('สถานะเตียงและการชำระเงิน / Bed & Payment Status', 'Bed & Payment Status')}</h4>
                </div>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2 text-orange-400">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>{t('กำลังนวด', 'Unpaid')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{t('รอทำความสะอาด', 'Paid')}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
                {beds.map(bed => {
                  const assignedStaff = staff.find(s => s.currentBedNumber === bed.number);
                  const onlineBooking = bookings.find(b => b.bedId === bed.id && b.status === 'Reserved');
                  
                  return (
                    <div 
                      key={bed.id}
                      onClick={() => {
                        if (bed.status === 'In Use' && bed.paymentStatus === 'Unpaid' && assignedStaff) {
                          setPaymentSession(assignedStaff);
                        }
                      }}
                      className={cn(
                        "p-6 rounded-[2.5rem] border-2 transition-all flex flex-col gap-4 relative overflow-hidden h-full",
                        bed.status === 'Vacant' 
                          ? "bg-slate-900/50 border-slate-800 text-slate-500" 
                          : bed.status === 'Reserved'
                          ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/20"
                          : "bg-slate-800 border-slate-700 text-white shadow-xl",
                        bed.status === 'In Use' && bed.paymentStatus === 'Unpaid' && "cursor-pointer hover:border-orange-500/50 ring-2 ring-orange-500/20"
                      )}
                    >
                      {/* Bed Number with Type Background */}
                      <div className="flex justify-between items-start">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg",
                          bed.type === 'Foot' ? "bg-blue-500 text-white" : 
                          bed.type === 'Body' ? "bg-amber-500 text-white" : 
                          "bg-purple-500 text-white"
                        )}>
                          {bed.number}
                        </div>
                        
                        {/* Status Badge */}
                        {bed.status === 'Reserved' && (
                          <div className="px-3 py-1 bg-primary text-white rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm animate-pulse">
                            <Clock size={10} />
                            {t('จองออนไลน์', 'RESERVED')}
                          </div>
                        )}
                        {bed.status === 'In Use' && (
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm",
                            bed.paymentStatus === 'Paid' ? "bg-emerald-500 text-white" : "bg-orange-500 text-white animate-pulse"
                          )}>
                            <PiggyBank size={10} />
                            {bed.paymentStatus === 'Paid' ? t('ชำระแล้ว', 'PAID') : t('รอชำระเงิน', 'UNPAID')}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                          {bed.type === 'Foot' ? t('Foot Massage', 'Foot Massage') : bed.type === 'Body' ? t('Body Massage', 'Body Massage') : t('VIP Room', 'VIP Room')}
                        </p>
                        <p className="text-lg font-bold truncate">
                          {bed.status === 'Vacant' 
                            ? t('ว่าง', 'VACANT') 
                            : bed.status === 'Reserved'
                            ? (onlineBooking?.customerName || t('จองแล้ว', 'RESERVED'))
                            : (bed.paymentStatus === 'Paid' ? t('รอทำความสะอาด', 'PAID') : (assignedStaff?.currentCustomer || t('กำลังนวด', 'OCCUPIED')))}
                        </p>
                      </div>

                      {bed.status === 'Reserved' && onlineBooking && (
                        <div className="pt-4 border-t border-primary/20 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-primary/60 font-bold uppercase tracking-tighter">Service</span>
                            <span className="text-xs font-bold">{onlineBooking.serviceName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-primary/60 font-bold uppercase tracking-tighter">Time</span>
                            <span className="text-xs font-bold">{onlineBooking.timeSlot}</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Logic to "Start" the reserved booking
                              setNewWalkIn({
                                customerName: onlineBooking.customerName,
                                serviceId: services.find(s => s.name === onlineBooking.serviceName || s.englishName === onlineBooking.serviceEnglishName)?.id || services[0].id,
                                therapistId: onlineBooking.therapistId,
                                bedId: bed.id,
                                healthFund: onlineBooking.healthFund || '',
                                memberId: onlineBooking.memberId || ''
                              });
                              setIsQuickAddOpen(true);
                            }}
                            className="w-full py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest mt-2"
                          >
                            {t('เริ่มงาน / Start', 'Start Session')}
                          </button>
                        </div>
                      )}

                      {assignedStaff && (
                        <div className="pt-4 border-t border-slate-700/50 space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500 font-black uppercase tracking-widest">{t('Therapist', 'Therapist')}</span>
                              <span className="text-2xl font-black text-primary leading-none tracking-wide">{assignedStaff.therapistName}</span>
                            </div>
                            {assignedStaff.status === 'Working' && assignedStaff.remainingSeconds && (
                              <div className="flex justify-between items-center bg-orange-500/10 px-4 py-2 rounded-xl">
                                <span className="text-xs text-orange-400 font-bold uppercase">{t('Time Left', 'Time Left')}</span>
                                <span className="text-2xl font-mono font-black text-orange-400">
                                  {Math.floor(assignedStaff.remainingSeconds / 60)}:{(assignedStaff.remainingSeconds % 60).toString().padStart(2, '0')}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            {assignedStaff.status === 'PaymentPending' && bed.paymentStatus === 'Unpaid' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPaymentSession(assignedStaff);
                                }}
                                className="w-full py-5 bg-orange-500 text-white rounded-2xl text-xl font-black uppercase tracking-widest text-center shadow-xl shadow-orange-900/40 active:scale-95 transition-all border-b-4 border-orange-700"
                              >
                                {t('เก็บเงิน / Collect', 'Collect')}
                              </button>
                            )}
                            {bed.paymentStatus === 'Paid' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const sale = salesLog.find(s => s.bedNumber === bed.number && s.type === 'SALE');
                                  if (sale) {
                                    console.log('Re-printing receipt for bed', bed.number);
                                  }
                                }}
                                className="w-full py-5 bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/30 rounded-2xl text-xl font-black uppercase tracking-widest text-center flex items-center justify-center gap-3 active:scale-95 transition-all"
                              >
                                <Receipt size={24} />
                                {t('พิมพ์ / Print', 'Print')}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Curtain Icon */}
                      <div className={cn(
                        "absolute bottom-4 right-4 opacity-10",
                        bed.status === 'Vacant' ? "text-emerald-500" : "text-red-500"
                      )}>
                        {bed.status === 'Vacant' ? <PanelLeftOpen size={24} /> : <PanelLeftClose size={24} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Staff Queue Board (Public) */}
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-slate-900/80 p-8 rounded-[3rem] border border-slate-800/50 shadow-2xl backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
                      <Users className="text-primary" size={28} />
                      {t('👥 Live Staff Queue / ลำดับคิวช่าง (Public Board)', 'Live Staff Queue')}
                    </h3>
                    <p className="text-slate-500 text-xs">
                      {t('ระบบจัดคิวให้ตามจริง ใครว่างก่อนได้คิวแรก โปร่งใสยุติธรรม ไร้ดราม่าแน่นอนค่ะ!', 'The queue is automatically sorted by wait time for transparency and fairness!')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-8 overflow-x-auto pb-8 no-scrollbar">
                  {staff
                    .sort((a, b) => {
                      const isAvailable = (s: StaffStatus) => s.status === 'Available';
                      const isBusy = (s: StaffStatus) => s.status === 'Working' || s.status === 'PaymentPending';
                      
                      if (isAvailable(a) && !isAvailable(b)) return -1;
                      if (!isAvailable(a) && isAvailable(b)) return 1;
                      
                      if (isAvailable(a) && isAvailable(b)) {
                        // Longest wait time first (earliest lastAvailableAt)
                        return new Date(a.lastAvailableAt || 0).getTime() - new Date(b.lastAvailableAt || 0).getTime();
                      }
                      
                      if (isBusy(a) && isBusy(b)) {
                        // Shortest remaining time first
                        return (a.remainingSeconds || 0) - (b.remainingSeconds || 0);
                      }
                      
                      // Break status at the very end
                      if (a.status === 'Break' && b.status !== 'Break') return 1;
                      if (a.status !== 'Break' && b.status === 'Break') return -1;
                      
                      return 0;
                    })
                    .map((s, index) => (
                      <motion.div
                        key={s.therapistId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "flex-shrink-0 flex flex-col items-center gap-4 px-10 py-8 rounded-[3rem] border-4 transition-all min-w-[200px] shadow-2xl",
                          s.status === 'Available' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10" :
                          s.status === 'Working' ? "bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-orange-500/10" :
                          s.status === 'PaymentPending' ? "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse border-dashed" :
                          "bg-red-500/10 border-red-500/30 text-red-400"
                        )}
                      >
                        <div className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center border-4 text-2xl font-black shadow-lg",
                          s.status === 'Available' ? "bg-emerald-500 text-white border-emerald-400" :
                          s.status === 'Working' ? "bg-orange-500 text-white border-orange-400" :
                          s.status === 'PaymentPending' ? "bg-amber-500 text-white border-amber-400" :
                          "bg-red-500 text-white border-red-400"
                        )}>
                          {index + 1}
                        </div>
                        <span className="font-black text-2xl tracking-wide">{s.therapistName}</span>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-4 h-4 rounded-full shadow-inner",
                            s.status === 'Available' ? "bg-emerald-500 animate-pulse" :
                            s.status === 'Working' ? "bg-orange-500 animate-spin-slow" :
                            s.status === 'PaymentPending' ? "bg-amber-500 animate-ping" :
                            "bg-red-500"
                          )} />
                          <span className="text-lg font-black uppercase tracking-[0.2em] leading-none opacity-90">
                            {s.status === 'Available' ? t('ว่าง', 'Available') : 
                             s.status === 'Working' ? t('ทำงาน', 'Working') :
                             s.status === 'PaymentPending' ? t('รอจ่าย', 'Unpaid') :
                             t('พักเบรก', 'Break')}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'payments' && (
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in zoom-in-95">
            <div className="bg-slate-900/80 p-16 rounded-[4rem] border-2 border-slate-800/50 shadow-2xl backdrop-blur-xl text-center space-y-10">
              <div className="w-24 h-24 bg-primary/20 rounded-[2rem] flex items-center justify-center text-primary mx-auto border-2 border-primary/30 shadow-xl">
                <TrendingUp size={48} />
              </div>
              <h2 className="text-5xl font-serif font-black text-white italic tracking-tight leading-relaxed">{t('สรุปยอดขายวันนี้', 'Today\'s Sales Summary')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-800/60 p-10 rounded-[3rem] border-2 border-slate-700 shadow-inner group hover:border-primary/40 transition-all">
                  <p className="text-slate-400 text-sm font-black uppercase tracking-[0.4em] mb-4">Total Sales</p>
                  <p className="text-6xl md:text-7xl font-black text-primary drop-shadow-2xl tracking-tighter">{formatCurrency(salesLog.reduce((acc, s) => acc + s.amount, 0))}</p>
                </div>
                <div className="bg-slate-800/60 p-10 rounded-[3rem] border-2 border-slate-700 shadow-inner group hover:border-primary/40 transition-all">
                  <p className="text-slate-400 text-sm font-black uppercase tracking-[0.4em] mb-4">Transactions</p>
                  <p className="text-6xl font-black text-white">{salesLog.length}</p>
                </div>
                <div className="bg-slate-800/60 p-10 rounded-[3rem] border-2 border-slate-700 shadow-inner group hover:border-primary/40 transition-all">
                  <p className="text-slate-400 text-sm font-black uppercase tracking-[0.4em] mb-4">Average Bill</p>
                  <p className="text-5xl font-black text-white">
                    {formatCurrency(salesLog.length > 0 ? (salesLog.reduce((acc, s) => acc + s.amount, 0) / salesLog.length) : 0)}
                  </p>
                </div>
              </div>

              <div className="pt-12 border-t border-slate-800/50">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-4xl font-serif font-black text-white italic">{t('รายการล่าสุด (ภายในแอป)', 'Recent App Sessions')}</h3>
                  <button 
                    onClick={() => checkAuthorization(generateMonthlySummary)}
                    disabled={isSummaryLoading}
                    className="bg-primary text-navy px-12 py-6 rounded-[2.5rem] text-2xl font-black uppercase tracking-[0.1em] hover:scale-105 transition-all flex items-center gap-4 shadow-2xl shadow-primary/30"
                  >
                    {isSummaryLoading ? (
                      <Timer className="animate-spin" size={32} />
                    ) : (
                      <FileText size={32} />
                    )}
                    {t('สรุปยอดรายเดือน', 'Monthly Summary')}
                  </button>
                </div>
                <div className="space-y-4">
                  {salesLog.slice(-5).reverse().map((sale, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-800/40 p-8 rounded-[2.5rem] border-2 border-slate-800 transition-all hover:bg-slate-800/60">
                      <div className="text-left space-y-2">
                        <p className="text-2xl font-black text-white leading-[1.8] tracking-wide">{sale.customer}</p>
                        <p className="text-lg text-slate-400 font-medium leading-[1.8]">{sale.service} • {sale.method}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-3xl font-black text-primary">{formatCurrency(sale.amount)}</p>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{new Date(sale.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                  {salesLog.length === 0 && (
                    <div className="py-24 text-center bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-800">
                      <p className="text-slate-500 text-2xl font-serif italic">{t('ยังไม่มีรายการขายในเซสชันนี้ค่ะ', 'No sales in this session yet.')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Receipt History Center (New Section) */}
            <div className="bg-slate-900/80 p-12 rounded-[4rem] border-2 border-slate-800/50 shadow-2xl backdrop-blur-xl space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-white/5 pb-10 gap-6">
                <div>
                  <h2 className="text-5xl font-serif font-black text-white flex items-center gap-4 italic tracking-tight">
                    <Receipt className="text-gold" size={48} />
                    {t('คลังประวัติใบเสร็จ', 'Receipt History Center')}
                  </h2>
                  <p className="text-slate-400 text-xl font-medium mt-3 leading-[1.8]">{t('ดึงข้อมูลจากระบบ Google Sheet ทั้งหมดเพื่อออกใบเสร็จย้อนหลัง', 'Reprint/Generate receipts from all historical bookings.')}</p>
                </div>
                <button 
                  onClick={loadBookingHistory}
                  disabled={isHistoryLoading}
                  className="w-full md:w-auto px-12 py-6 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] text-xl font-black uppercase tracking-[0.2em] border-2 border-white/10 transition-all flex items-center justify-center gap-4 active:scale-95"
                >
                  <Clock className={isHistoryLoading ? 'animate-spin' : ''} size={24} />
                  {isHistoryLoading ? 'Loading...' : t('Refresh History', 'Refresh')}
                </button>
              </div>

              <div className="max-h-[600px] overflow-y-auto pr-4 custom-scrollbar space-y-6">
                {historyBookings.length > 0 ? (
                  historyBookings.map((booking, idx) => (
                    <div 
                      key={idx} 
                      className="group flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800/40 p-10 rounded-[3rem] border-2 border-white/5 hover:border-gold/50 hover:bg-gold/5 transition-all gap-8 shadow-xl"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-gold/10 flex items-center justify-center text-gold border-2 border-gold/20 shadow-inner">
                          <User size={32} />
                        </div>
                        <div className="text-left space-y-2">
                          <p className="text-2xl font-black text-white group-hover:text-gold transition-colors leading-[1.8] tracking-wide">{booking.customerName}</p>
                          <p className="text-lg text-slate-400 font-medium leading-[1.8]">
                            {booking.date.toLocaleDateString('en-AU')} • <span className="font-bold text-slate-300">{booking.therapistName}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end border-t-2 md:border-t-0 border-white/5 pt-8 md:pt-0">
                        <div className="text-left md:text-right space-y-1">
                          <p className="text-4xl font-black text-white tracking-tighter">{formatCurrency(booking.amount)}</p>
                          <p className="text-xs text-slate-500 font-black uppercase tracking-[0.4em]">{booking.paymentMethod}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedHistoryBooking(booking);
                            setShowHistoryReceipt(true);
                          }}
                          className="bg-primary/20 hover:bg-primary text-primary hover:text-navy px-10 py-5 rounded-[2rem] border-2 border-primary/40 transition-all shadow-xl flex items-center gap-3 group/btn active:scale-95"
                        >
                          <Receipt size={24} className="group-hover/btn:scale-110 transition-transform" />
                          <span className="text-xl font-black uppercase tracking-[0.1em]">{t('Receipt', 'Receipt')}</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center bg-slate-800/10 rounded-[4rem] border-2 border-dashed border-slate-800 space-y-6">
                    <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-slate-600 mx-auto shadow-inner">
                      <FileText size={48} />
                    </div>
                    <p className="text-slate-500 text-2xl font-serif italic">{isHistoryLoading ? t('กำลังโหลดประวัติ...', 'Loading history...') : t('ไม่พบข้อมูลประวัติใบเสร็จค่ะ', 'No historical records found.')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-10 pb-10">
          <AdBanner />
        </div>
      </div>

      {/* Floating Action Buttons (FABs) Stack - Moved outside scrollable area and adjusted for mobile nav */}
      {/* Removed Nong Som AI Button */}
      
      {/* WALK-IN Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsQuickAddOpen(true)}
        className="w-16 h-16 md:w-20 md:h-20 gold-gradient text-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl flex flex-col items-center justify-center gap-0.5 md:gap-1 border-4 border-white/10 scale-85 md:scale-100"
      >
        <Plus size={24} className="md:size-32" strokeWidth={3} />
        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Walk-in</span>
      </motion.button>

      {/* Staff Status & Break Management Modal */}
      <AnimatePresence>
        {isStaffStatusOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStaffStatusOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 rounded-[3rem] border border-slate-700 shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
                      <Users className="text-primary" size={28} />
                      {t('จัดการสถานะและพักเบรก / Staff Status', 'Staff Status & Breaks')}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {t('พี่ๆ คะ น้องส้มซ่อนตารางพักเบรกไว้ในปุ่มเล็กๆ ให้แล้วนะคะ หน้าจอหลักจะได้มีพื้นที่ดูเตียงลูกค้าแบบเต็มตา พอจะให้ใครไปกินข้าว ค่อยกดปุ่มเปิดขึ้นมาดูนะคะ! 🍊', 'I\'ve hidden the break table in this button to save space. Open it when you need to manage staff breaks! 🍊')}
                    </p>
                  </div>
                  <button onClick={() => setIsStaffStatusOpen(false)} className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <X size={28} />
                  </button>
                </div>

                {/* Insurance Warning Message inside Modal */}
                {staff.some(s => getInsuranceStatus(s.insuranceExpiry).status === 'expired') && (
                  <div className="w-full bg-red-500/10 border border-red-500/20 p-4 md:p-6 rounded-2xl flex items-center gap-4 text-red-400 box-border">
                    <AlertTriangle size={24} className="shrink-0" />
                    <p className="text-[13px] md:text-sm font-bold leading-tight">
                      {t('มีพนักงานบางคนประกันมือหมดอายุแล้วนะคะ รบกวนตรวจสอบในตารางด้านล่างด้วยค่ะ', 'Some staff have expired insurance. Please check the list below.')}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {staff.map((s) => {
                    const insStatus = getInsuranceStatus(s.insuranceExpiry);
                    return (
                      <motion.div
                        key={s.therapistId}
                        layout
                        className={cn(
                          "p-6 rounded-[2rem] border-2 transition-all duration-300 relative overflow-hidden",
                          s.status === 'Available' ? "bg-slate-800/50 border-slate-700/50" :
                          s.status === 'Working' ? "bg-orange-500/5 border-orange-500/30" :
                          "bg-slate-800/50 border-red-500/20"
                        )}
                      >
                        <div className="flex justify-between items-start relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-2xl bg-slate-700 overflow-hidden border-2 border-slate-600 flex items-center justify-center text-slate-500">
                                {therapists.find(t => t.id === s.therapistId)?.imageUrl ? (
                                  <img src={therapists.find(t => t.id === s.therapistId)?.imageUrl} alt={s.therapistName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <User size={24} />
                                )}
                                <div className="absolute bottom-0 right-0 bg-slate-900/80 p-1 rounded-tl-xl">
                                  <span className="text-[10px]">
                                    {s.gender === 'Male' ? '👨' : s.gender === 'Female' ? '👩' : '⚧️'}
                                  </span>
                                </div>
                              </div>
                              <div className={cn(
                                "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-slate-900",
                                s.status === 'Available' ? "bg-green-500" :
                                s.status === 'Working' ? "bg-orange-500" : "bg-red-500"
                              )} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">{s.therapistName}</h3>
                              <p className={cn(
                                "text-[10px] uppercase font-black tracking-widest",
                                s.status === 'Available' ? "text-green-400" :
                                s.status === 'Working' ? "text-orange-400" : "text-red-400"
                              )}>
                                {s.status === 'Working' ? t('BUSY / ทำงาน', 'BUSY') : 
                                 s.status === 'Available' ? t('AVAILABLE / ว่าง', 'AVAILABLE') : 
                                 t('BREAK / พัก', 'BREAK')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {insStatus.status !== 'valid' && (
                          <div className={cn(
                            "mt-4 p-3 rounded-xl border flex items-center gap-2",
                            insStatus.status === 'expired' ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          )}>
                            <AlertTriangle size={14} />
                            <span className="text-[10px] font-bold">{insStatus.message}</span>
                          </div>
                        )}

                        <div className="mt-6">
                          <button 
                            disabled={s.status === 'Working' || s.status === 'PaymentPending'}
                            onClick={() => toggleBreak(s.therapistId)}
                            className={cn(
                              "w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all",
                              s.status === 'Break' 
                                ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20" 
                                : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                            )}
                          >
                            {s.status === 'Break' ? t('จบพัก / End Break', 'End Break') : t('พักเบรก / Set Break', 'Set Break')}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Monthly Summary Modal */}
      <AnimatePresence>
        {showSummaryModal && monthlySummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSummaryModal(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 rounded-[3rem] border border-slate-700 shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary mx-auto mb-4 border border-primary/30">
                    <PiggyBank size={40} />
                  </div>
                  <h3 className="text-4xl md:text-5xl font-serif font-black text-white leading-relaxed">{t('สรุปยอดส่งบัญชี', 'Accounting Summary')}</h3>
                  <p className="text-slate-400 text-xl font-medium">{monthlySummary.month}</p>
                </div>

                <div className="space-y-6 bg-slate-800/30 p-10 rounded-[3rem] border-2 border-slate-700 shadow-inner">
                  <div className="flex justify-between items-center py-4 border-b border-white/10">
                    <span className="text-slate-300 text-xl font-medium leading-[1.8]">{t('จำนวนคิวจอง', 'Total Bookings')}</span>
                    <span className="text-white text-3xl font-black">{monthlySummary.count}</span>
                  </div>
                  <div className="flex justify-between items-center py-6 border-b border-white/10">
                    <span className="text-slate-300 text-xl font-medium leading-[1.8]">{t('รายได้รวม (Gross)', 'Total Revenue')}</span>
                    <span className="text-primary text-6xl md:text-7xl font-black tracking-tighter drop-shadow-lg">{formatCurrency(monthlySummary.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-white/10">
                    <span className="text-slate-300 text-xl font-medium leading-[1.8]">{t('ภาษี GST (10%)', 'GST (10%)')}</span>
                    <span className="text-emerald-400 text-3xl font-bold">{formatCurrency(monthlySummary.gst)}</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="text-slate-300 text-xl font-medium leading-[1.8]">{t('ค่าบริการระบบ (GP %)', 'Platform Fee')}</span>
                    <span className="text-rose-400 text-3xl font-bold">-{formatCurrency(monthlySummary.gpAmount)}</span>
                  </div>
                </div>

                <div className="bg-primary/10 border-2 border-primary/30 p-8 rounded-[2.5rem] shadow-lg">
                  <div className="flex items-center gap-3 text-primary mb-4">
                    <Sparkles size={24} />
                    <span className="text-sm font-black uppercase tracking-[0.3em]">{t('Nong Som\'s Note', 'Smart Advice')}</span>
                  </div>
                  <p className="text-lg md:text-xl text-primary font-semibold italic leading-[1.8] tracking-wide">
                    {t('คุณป้าคะ น้องส้มช่วยแยกยอดภาษีกับค่า GP ไว้ให้เรียบร้อยแล้วค่ะ นักบัญชีชอบแน่นอน! กดบันทึกเพื่อเก็บเข้า Sheet Performance ได้เลยนะคะ 🍊', 'Auntie, I\'ve separated the tax and GP fees for you. Your accountant will love it! Click confirm to save to Performance Summary. 🍊')}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <button 
                    onClick={() => setShowSummaryModal(false)}
                    className="flex-1 py-8 rounded-[2.5rem] bg-slate-800 text-white text-xl font-black uppercase tracking-[0.2em] border-2 border-slate-700 hover:bg-slate-700 transition-all active:scale-95"
                  >
                    {t('ยกเลิก', 'Cancel')}
                  </button>
                  <button 
                    onClick={handleSaveSummary}
                    disabled={isSummaryLoading}
                    className="flex-[2] py-8 rounded-[2.5rem] bg-primary text-navy text-2xl font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-primary/40 disabled:opacity-50 active:scale-95 border-b-8 border-primary-dark"
                  >
                    {isSummaryLoading ? t('กำลังบันทึก...', 'Saving...') : t('สรุปยอดส่งบัญชี', 'Save & Send')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isQuickAddOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickAddOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 rounded-[3rem] border border-slate-700 shadow-2xl overflow-hidden"
            >
              <div className="p-12 space-y-10">
                <div className="flex justify-between items-center">
                  <div className="space-y-3">
                    <h3 className="text-5xl font-serif font-black text-white italic tracking-tight">{t('Walk-in / รับลูกค้า', 'Walk-in')}</h3>
                    <p className="text-slate-400 text-xl font-medium leading-[1.8]">{t('ใส่ข้อมูลลูกค้าเพื่อเริ่มงานทันทีนะคะ', 'Enter customer info to start session.')}</p>
                  </div>
                  <button onClick={() => setIsQuickAddOpen(false)} className="w-16 h-16 rounded-[1.5rem] bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors border-2 border-slate-700">
                    <X size={32} />
                  </button>
                </div>

                <form onSubmit={handleQuickAdd} className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-sm uppercase font-black text-slate-500 tracking-[0.4em]">Customer Name</label>
                    <input 
                      type="text"
                      value={newWalkIn.customerName}
                      onChange={(e) => {
                        setNewWalkIn(prev => ({ ...prev, customerName: e.target.value }));
                        setFormError(null);
                      }}
                      placeholder="Enter Name"
                      className={cn(
                        "w-full bg-slate-800 border-4 rounded-[2rem] px-10 py-8 text-3xl text-white focus:border-primary outline-none transition-all shadow-inner",
                        formError ? "border-red-500/50" : "border-slate-700"
                      )}
                    />
                    {formError && <p className="text-red-400 text-xl font-bold leading-[1.8]">{formError}</p>}
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm uppercase font-black text-slate-500 tracking-[0.4em]">Select Service</label>
                    <div className="grid grid-cols-1 gap-4 max-h-60 overflow-y-auto pr-4 custom-scrollbar">
                      {services.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setNewWalkIn(prev => ({ ...prev, serviceId: s.id }))}
                          className={cn(
                            "p-6 rounded-[1.5rem] border-2 text-left transition-all flex justify-between items-center group",
                            newWalkIn.serviceId === s.id 
                              ? "bg-primary/20 border-primary text-white" 
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                          )}
                        >
                          <span className="text-2xl font-black leading-[1.6] group-hover:text-primary transition-colors">{t(s.name, s.englishName)}</span>
                          <span className="text-xl font-black text-slate-300">{formatCurrency(s.standardPrice)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end gap-10">
                      <label className="text-sm uppercase font-black text-slate-500 tracking-[0.4em] mb-2">{t('เลือกพนักงาน / Therapist', 'Therapist')}</label>
                      <div className="flex items-center gap-3 text-orange-500 animate-pulse bg-orange-500/5 px-4 py-2 rounded-full border border-orange-500/10">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">🍊</div>
                        <span className="text-xs font-black italic tracking-wider">
                          {t('พี่ๆ คะ... น้องส้มแนะนำคนว่างคิวแรกให้แล้วนะคะ! 🍊', 'Tip: Nong Som recommends the first available staff! 🍊')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-4 no-scrollbar p-2">
                      {staff
                        .filter(s => s.status === 'Available')
                        .sort((a, b) => new Date(a.lastAvailableAt || 0).getTime() - new Date(b.lastAvailableAt || 0).getTime())
                        .map((s, index) => {
                          const therapistData = therapists.find(t => t.id === s.therapistId);
                          const isNextAvailable = index === 0;
                          const insStatus = getInsuranceStatus(s.insuranceExpiry);
                          
                          return (
                            <button
                              key={s.therapistId}
                              type="button"
                              onClick={() => setNewWalkIn(prev => ({ ...prev, therapistId: s.therapistId }))}
                              className={cn(
                                "relative p-8 rounded-[2rem] border-2 text-left transition-all group",
                                newWalkIn.therapistId === s.therapistId 
                                  ? "bg-primary/20 border-primary shadow-2xl" 
                                  : isNextAvailable 
                                    ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50"
                                    : "bg-slate-800 border-slate-700 hover:border-slate-600"
                              )}
                            >
                              {isNextAvailable && (
                                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-2xl z-10 animate-bounce flex items-center gap-2 border-2 border-white/20">
                                  <Star size={10} fill="currentColor" />
                                  NEXT AVAILABLE
                                </div>
                              )}
                              
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.2rem] bg-slate-700 flex items-center justify-center text-slate-500 border-2 border-slate-600 overflow-hidden relative shadow-inner">
                                  {therapistData?.imageUrl ? (
                                    <img src={therapistData.imageUrl} alt={s.therapistName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <User size={32} />
                                  )}
                                  <div className="absolute bottom-0 right-0 bg-slate-900/80 p-1 rounded-tl-xl">
                                    <span className="text-xs">
                                      {s.gender === 'Male' ? '👨' : s.gender === 'Female' ? '👩' : '⚧️'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-3">
                                    <span className="text-xl font-black text-white group-hover:text-primary transition-colors">{s.therapistName}</span>
                                    {insStatus.status !== 'valid' && (
                                      <span className="text-lg text-red-400 font-black animate-pulse">⚠️</span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {therapistData?.specialties.slice(0, 2).map((spec, i) => (
                                      <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-black uppercase tracking-tighter border border-slate-700">
                                        {spec}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm uppercase font-black text-slate-500 tracking-[0.4em]">Bed Number / เลือกเตียง</label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {beds.filter(b => b.status === 'Vacant').map(b => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setNewWalkIn(prev => ({ ...prev, bedId: b.id }))}
                          className={cn(
                            "py-6 rounded-[1.5rem] border-2 font-black text-2xl transition-all shadow-md active:scale-90",
                            newWalkIn.bedId === b.id 
                              ? "bg-primary/20 border-primary text-white shadow-xl" 
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                          )}
                        >
                          {b.number}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-3">
                      <label className="text-xs uppercase font-black text-slate-500 tracking-[0.4em]">Health Fund (Optional)</label>
                      <input 
                        type="text"
                        value={(newWalkIn as any).healthFund || ''}
                        onChange={(e) => setNewWalkIn(prev => ({ ...prev, healthFund: e.target.value }))}
                        placeholder="e.g. BUPA, Medibank"
                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-5 text-xl text-white focus:border-primary outline-none shadow-inner"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs uppercase font-black text-slate-500 tracking-[0.4em]">Member ID (Optional)</label>
                      <input 
                        type="text"
                        value={(newWalkIn as any).memberId || ''}
                        onChange={(e) => setNewWalkIn(prev => ({ ...prev, memberId: e.target.value }))}
                        placeholder="Member Number"
                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-5 text-xl text-white focus:border-primary outline-none shadow-inner"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-10 gold-gradient text-white rounded-[2.5rem] font-black text-3xl shadow-2xl hover:opacity-90 transition-all uppercase tracking-[0.3em] active:scale-95 border-b-8 border-primary-dark"
                  >
                    เริ่มงาน / Start Session
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {paymentSession && !showReceipt && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setPaymentSession(null);
                setPaymentMethod(null);
                setHicapsData({ claim: 0, gap: 0 });
                setPayIdSlip(null);
              }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 rounded-[3.5rem] border border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-12 space-y-10">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary border border-primary/20 shadow-lg rotate-3">
                    <DollarSign size={40} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-4xl font-serif font-bold text-white">
                      {t(`ปิดยอด/รับเงิน - เตียง ${paymentSession.currentBedNumber}`, `Payment - Bed ${paymentSession.currentBedNumber}`)}
                    </h2>
                    <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Payment Confirmation</p>
                  </div>
                </div>

                {/* Nong Som Guidance */}
                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">🍊</div>
                  <p className="text-xs text-orange-600 leading-relaxed font-bold">
                    {t('พี่จิ้มเลือกวิธีจ่ายเงินที่ลูกค้าใช้ได้เลยนะคะ ถ้าเป็น PayID น้องส้มจามเวลาเข้าให้พี่เจ้าของร้านเป๊ะๆ เลยค่ะ พี่ไม่ต้องห่วงนะคะ! 🍊', 'Please select the payment method. For PayID, I will record the exact time for the owner! 🍊')}
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-[3.5rem] p-12 border-2 border-slate-700/50 space-y-8 shadow-inner">
                  <div className="flex justify-between items-center pb-8 border-b-2 border-slate-700/50">
                    <div>
                      <p className="text-sm text-slate-400 uppercase font-bold tracking-[0.4em] mb-2">{t('ลูกค้า / Customer', 'Customer')}</p>
                      <p className="text-4xl font-black text-white font-sans leading-[1.6]">{paymentSession.currentCustomer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400 uppercase font-bold tracking-[0.4em] mb-2">{t('บริการ / Service', 'Service')}</p>
                      <p className="text-3xl font-bold text-slate-300 font-sans leading-[1.6]">{paymentSession.currentService}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-400 uppercase font-bold tracking-[0.4em] mb-2">{t('ระยะเวลา / Duration', 'Duration')}</p>
                      <p className="text-2xl font-medium text-slate-400 font-sans">{paymentSession.remainingSeconds ? 'Active' : '60 mins'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400 uppercase font-bold tracking-[0.4em] mb-2">{t('ยอดรวม / Total', 'Total')}</p>
                      <p className="text-7xl font-black text-primary font-sans drop-shadow-xl tracking-tighter">{formatCurrency(paymentSession.currentPrice || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-center text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] font-sans">{t('เลือกวิธีชำระเงิน / Select Payment Method', 'Select Payment Method')}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => processPayment('Cash')}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 p-6 bg-slate-800 rounded-3xl border-2 transition-all group",
                        paymentMethod === 'Cash' ? "border-primary bg-primary/5" : "border-slate-700 hover:border-primary/50"
                      )}
                    >
                      <Banknote size={24} className={cn(paymentMethod === 'Cash' ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
                      <span className="font-bold text-white text-sm">{t('เงินสด / CASH', 'CASH')}</span>
                    </button>
                    <button 
                      onClick={() => processPayment('Card')}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 p-6 bg-slate-800 rounded-3xl border-2 transition-all group",
                        paymentMethod === 'Card' ? "border-primary bg-primary/5" : "border-slate-700 hover:border-primary/50"
                      )}
                    >
                      <CreditCard size={24} className={cn(paymentMethod === 'Card' ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
                      <span className="font-bold text-white text-sm">{t('บัตร / CARD', 'CARD')}</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('PayID')}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 p-6 bg-slate-800 rounded-3xl border-2 transition-all group",
                        paymentMethod === 'PayID' ? "border-primary bg-primary/5" : "border-slate-700 hover:border-primary/50"
                      )}
                    >
                      <Wallet size={24} className={cn(paymentMethod === 'PayID' ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
                      <span className="font-bold text-white text-sm">{t('เพย์ไอดี / PAYID', 'PAYID')}</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('HICAPS')}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 p-6 bg-slate-800 rounded-3xl border-2 transition-all group",
                        paymentMethod === 'HICAPS' ? "border-primary bg-primary/5" : "border-slate-700 hover:border-primary/50"
                      )}
                    >
                      <Receipt size={24} className={cn(paymentMethod === 'HICAPS' ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
                      <span className="font-bold text-white text-sm">HICAPS</span>
                    </button>
                  </div>

                  {paymentMethod === 'HICAPS' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-slate-800/80 p-6 rounded-3xl border border-primary/30 space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Insurance Claim (AUD)</label>
                          <input 
                            type="number"
                            value={hicapsData.claim || ''}
                            onChange={(e) => setHicapsData(prev => ({ ...prev, claim: parseFloat(e.target.value) || 0 }))}
                            placeholder="0.00"
                            className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-4 text-white font-mono text-xl focus:border-primary outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Gap Payment (AUD)</label>
                          <input 
                            type="number"
                            value={hicapsData.gap || ''}
                            onChange={(e) => setHicapsData(prev => ({ ...prev, gap: parseFloat(e.target.value) || 0 }))}
                            placeholder="0.00"
                            className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-4 text-white font-mono text-xl focus:border-primary outline-none"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => processPayment('HICAPS')}
                        disabled={!hicapsData.claim && !hicapsData.gap}
                        className="w-full py-5 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        Confirm HICAPS / ยืนยันประกัน
                      </button>
                    </motion.div>
                  )}

                  {paymentMethod === 'PayID' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-slate-800/80 p-6 rounded-3xl border border-primary/30 space-y-6"
                    >
                      <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <Timer size={18} className="animate-pulse" />
                          <span className="text-xs font-black uppercase tracking-widest">Auto-Timestamp Audit Active</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          {t('ระบบกำลังบันทึกเวลาวินาทีที่ชำระเงินโดยอัตโนมัติ เพื่อให้เจ้าของร้านตรวจสอบกับ Statement ได้ทันที ไม่จำเป็นต้องถ่ายรูปสลิปค่ะ', 'The system is automatically recording the exact second of payment for the owner to verify against the bank statement. Photo is optional.')}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => processPayment('PayID')}
                          className="py-5 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:opacity-90 transition-opacity"
                        >
                          Confirm PayID / ยืนยันยอด
                        </button>
                        <label className="flex items-center justify-center gap-3 px-4 py-5 bg-slate-900 border border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-800 transition-all group">
                          <Camera size={20} className="text-slate-500 group-hover:text-primary" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('ถ่ายรูปสลิป (ถ้ามี)', 'Add Photo (Optional)')}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment"
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setPayIdSlip(URL.createObjectURL(file));
                                processPayment('PayID');
                              }
                            }}
                          />
                        </label>
                      </div>
                      
                      {payIdSlip && (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-700">
                          <img src={payIdSlip} alt="Slip" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => setPayIdSlip(null)}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}

                      <button 
                        onClick={() => processPayment('PayID')}
                        className="w-full py-5 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:opacity-90 transition-opacity"
                      >
                        Confirm PayID / ยืนยันการโอน
                      </button>
                    </motion.div>
                  )}
                </div>

                <button 
                  onClick={() => {
                    setPaymentSession(null);
                    setPaymentMethod(null);
                    setHicapsData({ claim: 0, gap: 0 });
                    setPayIdSlip(null);
                  }}
                  className="w-full py-4 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-300 transition-colors"
                >
                  Cancel / ยกเลิก
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt View */}
      <AnimatePresence>
        {showAlerts && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAlerts(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 rounded-[3rem] border border-slate-700 shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
                      <Bell className="text-primary" size={28} />
                      {t('การแจ้งเตือน / Alerts', 'Alerts')}
                    </h3>
                    <p className="text-slate-500 text-sm">{t('รายการปัญหาที่พี่ๆ หมอแจ้งเข้ามาค่ะ', 'Issues reported by staff.')}</p>
                  </div>
                  <button onClick={() => setShowAlerts(false)} className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {alerts.filter(a => a.status === 'NEW').length > 0 ? (
                    alerts.filter(a => a.status === 'NEW').map((alert) => (
                      <div 
                        key={alert.id}
                        className="p-6 rounded-2xl bg-slate-800 border border-slate-700 flex justify-between items-center"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <AlertTriangle size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-white">{alert.issue}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">By: {alert.therapistName}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: 'RESOLVED' } : a));
                            setSomMessage(t('น้องส้มรับทราบปัญหาแล้วค่ะ เดี๋ยวจะรีบบอกพี่เจ้าของร้านให้นะคะ 🍊', "Nong Som acknowledged the issue! I'll let the owner know. 🍊"));
                          }}
                          className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                        >
                          OK
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 space-y-4">
                      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
                        <CheckCircle size={32} />
                      </div>
                      <p className="text-slate-500 text-sm italic">{t('ไม่มีรายการแจ้งปัญหาใหม่ค่ะ', 'No new alerts.')}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Insurance Warning Modal */}
      <AnimatePresence>
        {showInsuranceWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInsuranceWarning(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 rounded-[3rem] border border-slate-700 shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-8 text-center">
                <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto text-red-500">
                  <AlertTriangle size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-white">
                    {t('ประกันมือหมดอายุ', 'Insurance Expired')}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {t('พนักงานคนนี้ประกันมือหมดอายุแล้ว จะยังดำเนินการต่อหรือไม่?', 'This therapist\'s insurance has expired. Do you still want to proceed?')}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowInsuranceWarning(false)}
                    className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
                  >
                    {t('ยกเลิก / Cancel', 'Cancel')}
                  </button>
                  <button 
                    onClick={() => proceedWithQuickAdd(pendingWalkIn)}
                    className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                  >
                    {t('ดำเนินการต่อ / Proceed', 'Proceed')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt View */}
      <AnimatePresence>
        {showReceipt && paymentSession && (
          <>
            <PrintableReceipt 
              session={paymentSession} 
              paymentMethod={paymentMethod || 'Cash'} 
              hicapsData={paymentMethod === 'HICAPS' ? hicapsData : undefined}
              date={lastSaleDate}
            />
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm no-print">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white text-slate-900 rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-6 text-center">
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg mb-2">
                  <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-serif font-bold tracking-tight">{t('ชำระเงินสำเร็จ!', 'Payment Successful!')}</h2>
                
                {/* Post-Care Advice */}
                {paymentSession.currentServiceId && services.find(s => s.id === paymentSession.currentServiceId)?.postCareTips && (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-left space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-800 border-b border-emerald-100 pb-2 flex items-center gap-2">
                       <Heart size={14} fill="currentColor" /> {t('คำแนะนำหลังการบริการ', 'Post-Care Advice')}
                    </h4>
                    <div className="space-y-2">
                      {services.find(s => s.id === paymentSession.currentServiceId)?.postCareTips?.map((tip, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</span>
                          <p className="text-[11px] font-medium text-emerald-900 leading-tight">
                            {t(tip.th, tip.en)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nong Som Help */}
                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-start gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">🍊</div>
                  <p className="text-xs text-orange-600 font-bold leading-relaxed">
                    {t('พี่ๆ คะ กดปุ่มพิมพ์ใบเสร็จตรงนี้ได้เลยนะคะ น้องส้มจัดหน้ากระดาษไว้ให้พี่แล้วค่ะ ฝรั่งเอาไปเคลมประกันได้ง่ายๆ เลยนะคะ! 🍊', 'You can print the receipt here. I\'ve formatted it perfectly for thermal printers so customers can claim insurance easily! 🍊')}
                  </p>
                </div>

                {/* Thermal Receipt Preview */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-left font-mono text-[10px] space-y-2">
                  <div className="text-center border-b border-slate-200 pb-2 mb-2">
                    <p className="font-bold text-sm uppercase">{storeConfig.storeName}</p>
                    <p>Sydney, Australia</p>
                    <p>ABN: {settings.storeId || '12 345 678 910'}</p>
                    <p className="mt-1 font-bold">TAX INVOICE</p>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{paymentSession.currentCustomer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Therapist:</span>
                    <span>{paymentSession.therapistName}</span>
                  </div>
                  {paymentSession.providerNumber && (
                    <div className="flex justify-between font-bold">
                      <span>Provider No:</span>
                      <span>{paymentSession.providerNumber}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>{paymentSession.currentService}</span>
                      <span>{formatCurrency(paymentSession.currentPrice || 0)}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2 mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency((paymentSession.currentPrice || 0) / 1.1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (10%):</span>
                      <span>{((paymentSession.currentPrice || 0) / 11).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-200">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(paymentSession.currentPrice || 0)}</span>
                    </div>
                  </div>

                  {paymentMethod === 'HICAPS' && (
                    <div className="bg-slate-200/50 p-2 rounded mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Insurance Claim:</span>
                        <span>-{formatCurrency(hicapsData.claim)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Gap Payment:</span>
                        <span>{formatCurrency(hicapsData.gap)}</span>
                      </div>
                    </div>
                  )}

                  <div className="text-center pt-4 border-t border-slate-200 mt-4">
                    <p>Payment Method: {paymentMethod}</p>
                    <p className="mt-2 italic">Thank you for visiting us!</p>
                  </div>
                </div>

                {/* Wellness Reward Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-navy p-6 rounded-[2rem] text-left border border-gold/20 shadow-xl space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                      <Heart size={20} fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="text-gold font-serif font-black text-sm italic">{t('รางวัลพิเศษสำหรับคุณ!', 'Wellness Loyalty Reward')}</h4>
                      <p className="text-[8px] text-gold/40 uppercase font-black tracking-widest leading-none mt-1">Exclusive for our guests</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gold/80 font-medium leading-relaxed">
                    {t(
                      'สบายตัวแล้ว อย่าลืมดูแลตัวเองต่อเนื่องนะคะ! จองล่วงหน้าสำหรับครั้งถัดไป รับส่วนลดพิเศษ 10% ทันที!',
                      'Feeling relaxed? Keep the wellness going! Book your next session in advance and get 10% off instantly.'
                    )}
                  </p>

                  <button className="w-full py-3 bg-gold text-navy rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-white hover:text-navy transition-all flex items-center justify-center gap-2">
                    <Sparkles size={14} /> {t('จองล่วงหน้าเลย 🍊', 'Book Next Session')}
                  </button>
                </motion.div>

                {/* Digital Receipt QR */}
                <div className="bg-navy p-6 rounded-[2.5rem] text-white space-y-4 border border-white/10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary">
                      <QrCode size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black uppercase tracking-widest">{t('สแกนรับใบเสร็จดิจิทัล', 'Digital Receipt QR')}</div>
                      <div className="text-[10px] text-white/50">{t('ใช้สำหรับเคลมประกันสุขภาพได้ทันที', 'Scan for Instant Insurance Claim')}</div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl relative z-10">
                    <QRCodeSVG 
                      value={`https://melbooking.com/claim?customer=${encodeURIComponent(paymentSession.currentCustomer || 'Guest')}&service=${encodeURIComponent(paymentSession.currentService || 'Massage')}&amount=${paymentSession.currentPrice || 0}&provider=${paymentSession.providerNumber || ''}&date=${new Date().toISOString().split('T')[0]}&shop=${encodeURIComponent(storeConfig.storeName)}`} 
                      size={160}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <div className="space-y-2 relative z-10">
                    <p className="text-[11px] text-primary font-bold italic leading-tight">
                      " {t('สแกนรับใบเสร็จสำหรับเคลมประกันได้ที่นี่ค่ะ', 'Scan here to receive your digital receipt for insurance claims.')} "
                    </p>
                    <div className="flex items-center gap-2 justify-center pt-1">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Verified Provider #{paymentSession.providerNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                        window.print();
                    }}
                    className="py-4 bg-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-navy/20 border border-white/10"
                  >
                    <Download size={18} />
                    {t('Generate PDF', 'Export PDF')}
                  </button>
                  <button 
                    onClick={() => {
                        setSomMessage(t('ส่งใบเสร็จไปที่อีเมล {email} สำเร็จแล้วค่ะ! 🍊', `Receipt sent to email! 🍊`).replace('{email}', paymentSession.currentCustomer || 'Customer'));
                    }}
                    className="py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Bell size={18} />
                    {t('Email', 'Send to Email')}
                  </button>
                </div>
                <div className="flex gap-4">
                  {settings.enableThermalPrinting && enablePrinting && (
                    <button 
                      onClick={handlePrint}
                      className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Receipt size={14} />
                      {t('Thermal Print', 'Print Thermal')}
                    </button>
                  )}
                  <button 
                    onClick={closeReceipt}
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                  >
                    Done / เสร็จสิ้น
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
          </>
        )}
      </AnimatePresence>
 
      {/* History Receipt Modal */}
      <AnimatePresence>
        {showPinLock && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-slate-900 rounded-[3rem] border border-white/10 p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-rose-500/20 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6 border border-rose-500/30">
                <LockIcon size={40} className={pinError ? 'animate-shake' : ''} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-2">{t('ยืนยันรหัสผ่าน', 'Manager Authorization')}</h3>
              <p className="text-slate-500 text-xs mb-8">{t('กรุณาใส่รหัสผ่านเพื่อเข้าถึงข้อมูลสรุปยอดรายเดือน (เฉพาะ Manager และ เจ้าของร้าน)', 'Please enter PIN to access monthly summaries.')}</p>
              
              <div className="flex justify-center gap-4 mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all duration-300",
                      pinBuffer.length > i ? "bg-primary border-primary scale-125 shadow-lg shadow-primary/50" : "border-slate-700"
                    )}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map((num) => (
                  <button
                    key={num.toString()}
                    onClick={() => {
                      if (num === 'C') setPinBuffer('');
                      else if (num === 'OK') handlePinSubmit();
                      else if (typeof num === 'number' && pinBuffer.length < 4) {
                        const newPin = pinBuffer + num;
                        setPinBuffer(newPin);
                        if (newPin.length === 4) {
                          // Auto submit if needed, or wait for OK
                        }
                      }
                    }}
                    className={cn(
                      "h-16 rounded-2xl flex items-center justify-center font-black text-xl transition-all active:scale-90",
                      num === 'OK' ? "bg-primary text-navy col-span-1" : 
                      num === 'C' ? "bg-slate-800 text-rose-400" : "bg-slate-800 text-white hover:bg-slate-700"
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setShowPinLock(false)}
                className="mt-8 text-slate-500 text-xs font-bold hover:text-white transition-colors"
              >
                {t('ยกเลิก', 'Cancel')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Receipt Modal */}
      <AnimatePresence>
        {showHistoryReceipt && selectedHistoryBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryReceipt(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10"
            >
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6 no-print">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center text-gold">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-navy">{t('ประวัติใบเสร็จ', 'History Receipt')}</h3>
                    <p className="text-[10px] text-slate-400 -mt-1 uppercase tracking-widest font-black">Remedial Massage Clinic</p>
                  </div>
                </div>
                <button onClick={() => setShowHistoryReceipt(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto pr-2 mb-8 bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                <PrintableReceipt 
                  bookingData={{
                    customerName: selectedHistoryBooking.customerName,
                    serviceName: selectedHistoryBooking.serviceName,
                    therapistName: selectedHistoryBooking.therapistName,
                    providerNumber: selectedHistoryBooking.provider_number || selectedHistoryBooking.providerNo,
                    amount: selectedHistoryBooking.amount,
                    paymentMethod: selectedHistoryBooking.paymentMethod,
                    healthFund: selectedHistoryBooking.health_fund || selectedHistoryBooking.healthFund,
                    memberId: selectedHistoryBooking.member_id || selectedHistoryBooking.memberId,
                    date: selectedHistoryBooking.date
                  }}
                />
                
                {/* Web Preview Card */}
                <div className="bg-white p-8 shadow-sm border border-slate-200 rounded-2xl space-y-4 font-mono text-[11px] text-slate-800">
                  <div className="text-center border-b-2 border-slate-100 pb-6">
                    <h1 className="text-sm font-black uppercase text-navy tracking-tight">{storeConfig.storeName}</h1>
                    <p className="text-[10px] text-slate-500 mt-1 italic">ABN: {storeConfig.abn}</p>
                    <div className="mt-3 inline-block px-4 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">{t('ใบเสร็จรับเงิน (ย้อนหลัง)', 'Tax Invoice')}</div>
                  </div>
                  
                  <div className="space-y-2 py-4">
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span className="text-slate-400">Date:</span> 
                      <span className="font-bold">{selectedHistoryBooking.date.toLocaleDateString('en-AU')}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span className="text-slate-400">Client:</span> 
                      <span className="font-bold text-navy">{selectedHistoryBooking.customerName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span className="text-slate-400">Therapist:</span> 
                      <span className="font-bold">{selectedHistoryBooking.therapistName}</span>
                    </div>
                    {selectedHistoryBooking.provider_number && (
                      <div className="flex justify-between border-b border-slate-50 pb-1 text-emerald-600">
                        <span className="text-slate-400">Provider No:</span> 
                        <span className="font-bold">{selectedHistoryBooking.provider_number}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t-2 border-slate-100 pt-4 space-y-3">
                    <div className="flex justify-between font-bold text-navy text-sm">
                      <span>{selectedHistoryBooking.serviceName}</span>
                      <span>{formatCurrency(selectedHistoryBooking.amount)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>GST Included (1/11)</span>
                      <span>{formatCurrency(selectedHistoryBooking.amount / 11)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-black text-navy border-t-2 border-primary/20 pt-4 bg-primary/5 p-4 rounded-xl">
                      <span>TOTAL PAID</span>
                      <span>{formatCurrency(selectedHistoryBooking.amount)}</span>
                    </div>
                  </div>

                  <div className="text-center pt-8 text-[10px] text-slate-400">
                    <p className="italic underline decoration-slate-200">Payment via {selectedHistoryBooking.paymentMethod}</p>
                    <p className="mt-1 font-bold">REMEDIAL MASSAGE CLINIC RECEIPT</p>
                    <p className="mt-1 text-[8px] opacity-40 uppercase tracking-widest tracking-[0.3em]">Certified Professional Record</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 no-print px-4">
                <button 
                  onClick={() => window.print()}
                  className="flex-[2] py-5 rounded-[2rem] bg-navy text-white font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-navy/20 flex items-center justify-center gap-3"
                >
                  <Download size={20} />
                  {t('Export PDF', 'Generate PDF')}
                </button>
                <button 
                  onClick={() => {
                    setSomMessage(t('ส่งใบเสร็จไปที่อีเมล {email} สำเร็จแล้วค่ะ! 🍊', `Receipt sent to email! 🍊`).replace('{email}', selectedHistoryBooking.customerName));
                  }}
                  className="flex-1 py-5 rounded-[2rem] bg-emerald-500 text-white font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Bell size={20} />
                  {t('Email', 'Email')}
                </button>
                <button 
                  onClick={() => setShowHistoryReceipt(false)}
                  className="flex-1 py-5 rounded-[2rem] bg-slate-100 text-slate-500 font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  {t('Cancel', 'Cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Client Intake Confirmation Modal */}
      <AnimatePresence>
        {isIntakeOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsIntakeOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 p-8 text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-400 border border-emerald-500/30 mx-auto mb-6">
                <FileText size={40} />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">{t('ลงทะเบียนลูกค้าใหม่', 'New Client Intake')}</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-8">Digital Registration / ระบบลงทะเบียน</p>

              <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl mb-8 flex items-start gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-lg flex-shrink-0">
                  <Heart size={20} fill="currentColor" />
                </div>
                <p className="text-white text-sm font-medium leading-relaxed">
                  {t('พี่ๆ คะ... ถ้ามีลูกค้าใหม่มาถึงร้าน พี่กดปุ่มนี้แล้วยื่น iPad ให้แขกกรอกประวัติได้เลยนะคะ ข้อมูลสุขภาพและประกันจะถูกเก็บเข้าระบบดิจิทัลทันที ไม่ต้องใช้กระดาษให้รกแล้วค่ะ!', 'P\'s... If a new customer arrives, press this button and hand the iPad to the guest. Health and insurance data will be saved digitally immediately!')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsIntakeOpen(false)}
                  className="py-4 bg-slate-800 text-slate-400 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-700 transition-all"
                >
                  {t('ยกเลิก', 'Cancel')}
                </button>
                <button 
                  onClick={() => {
                    window.open(settings.clientIntakeUrl, '_blank');
                    setIsIntakeOpen(false);
                  }}
                  className="py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  {t('เปิดฟอร์ม', 'Open Form')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expense Modal */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpenseModalOpen(false)}
              className="absolute inset-0 bg-navy/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-gold/20 rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 blur-[60px] -z-10" />
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-white tracking-tight">{t('บันทึกรายจ่ายใหม่', 'Add New Expense')}</h3>
                  <p className="text-slate-500 text-xs mt-1 uppercase font-black tracking-widest">{t('Tax Deduction Log', 'Tax Deduction Entry')}</p>
                </div>
                <button 
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="p-3 bg-white/5 text-slate-400 hover:text-white rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gold/40 mb-2">{t('Description / รายละเอียด', 'Description')}</label>
                  <input
                    type="text"
                    required
                    value={newExpense.description}
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                    placeholder={t('เช่น ค่าวัสดุอุปกรณ์นวด, ค่าเช่า...', 'e.g. Massage oils, Rent...')}
                    className="w-full bg-slate-800/50 border border-gold/10 rounded-2xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-gold/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gold/40 mb-2">{t('Amount / จำนวนเงิน', 'Amount')}</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gold font-bold">$</span>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={newExpense.amount || ''}
                        onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})}
                        className="w-full bg-slate-800/50 border border-gold/10 rounded-2xl pl-10 pr-6 py-4 text-white focus:outline-none focus:border-gold/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gold/40 mb-2">{t('Category / หมวดหมู่', 'Category')}</label>
                    <select
                      value={newExpense.category}
                      onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                      className="w-full bg-slate-800/50 border border-gold/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-gold/50 appearance-none hover:bg-slate-800 transition-colors"
                    >
                      <option value="Supplies">{t('อุปกรณ์ (Supplies)', 'Supplies')}</option>
                      <option value="Rent">{t('ค่าเช่า (Rent)', 'Rent')}</option>
                      <option value="Utilities">{t('ค่าน้ำ/ไฟ (Utilities)', 'Utilities')}</option>
                      <option value="Maintenance">{t('ค่าซ่อมบำรุง (Maintenance)', 'Maintenance')}</option>
                      <option value="Staff Expenses">{t('สวัสดิการ (Staff)', 'Staff')}</option>
                      <option value="Marketing">{t('การตลาด (Marketing)', 'Marketing')}</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full h-16 bg-gold text-navy rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-3"
                  >
                    <Wallet size={20} />
                    {t('บันทึกรายการ', 'Record Expense')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print-only Receipt (Hidden from UI) */}
      <div className="hidden print-only bg-white text-black p-6 font-mono text-[11px] receipt-80mm">
        <div className="text-center border-b-4 border-black pb-4 mb-4">
          <h1 className="font-black text-2xl uppercase tracking-tighter mb-1">{storeConfig.storeName}</h1>
          <p className="text-[9px] uppercase tracking-widest">{storeConfig.address}</p>
          <p className="text-[9px] font-bold">ABN: {storeConfig.abn}</p>
          <div className="mt-4 border-y-2 border-black py-2">
            <h2 className="font-black text-lg tracking-[0.2em]">TAX INVOICE</h2>
          </div>
        </div>
        
        <div className="space-y-2 mb-4 border-b border-dashed border-black pb-4">
          <div className="flex justify-between">
            <span className="opacity-70 uppercase text-[9px]">Date:</span>
            <span className="font-bold">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70 uppercase text-[9px]">Customer:</span>
            <span className="font-bold">{paymentSession?.currentCustomer}</span>
          </div>
          <div className="flex justify-between border-t border-black/5 pt-2">
            <span className="opacity-70 uppercase text-[9px]">Therapist:</span>
            <span className="font-bold">{paymentSession?.therapistName}</span>
          </div>
          {paymentSession?.providerNumber && (
            <div className="flex justify-between bg-black text-white px-2 py-1 rounded-sm">
              <span className="uppercase text-[8px] font-bold">Provider No:</span>
              <span className="font-black text-[10px]">{paymentSession.providerNumber}</span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-end mb-1">
            <span className="font-black text-sm uppercase flex-1 mr-4">{paymentSession?.currentService}</span>
            <span className="font-black text-base">{formatCurrency(paymentSession?.currentPrice || 0)}</span>
          </div>
          <div className="flex justify-between text-[9px] italic opacity-70">
            <span>Service Duration</span>
            <span>{paymentSession?.remainingSeconds ? 'Active Session' : '60 mins'}</span>
          </div>
        </div>
 
        <div className="border-t-2 border-black pt-3 mt-4 space-y-1 bg-slate-50/50 p-2">
          <div className="flex justify-between text-[10px]">
            <span>Subtotal (Excl. GST):</span>
            <span>{formatCurrency((paymentSession?.currentPrice || 0) / 1.1)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>GST (10%):</span>
            <span>{formatCurrency((paymentSession?.currentPrice || 0) / 11)}</span>
          </div>
          <div className="flex justify-between font-black pt-2 border-t-4 border-black text-xl mt-2">
            <span>TOTAL AUD:</span>
            <span>{formatCurrency(paymentSession?.currentPrice || 0)}</span>
          </div>
        </div>
 
        <div className="mt-6 border-2 border-black p-3 text-center bg-black text-white">
          <p className="font-black text-base uppercase tracking-[0.3em]">*** PAID ***</p>
          <p className="text-[9px] font-bold mt-1">METHOD: {paymentMethod?.toUpperCase()}</p>
        </div>

        {paymentMethod === 'HICAPS' && (
          <div className="border-2 border-dashed border-black p-3 mt-4 space-y-2">
            <p className="text-center font-black text-[10px] uppercase tracking-widest border-b border-black pb-1 mb-2">HICAPS Summary</p>
            <div className="flex justify-between text-[10px]">
              <span>Insurance Benefit:</span>
              <span className="font-bold">-{formatCurrency(hicapsData.claim)}</span>
            </div>
            <div className="flex justify-between font-black text-sm border-t border-black pt-1">
              <span>Gap to Pay:</span>
              <span>{formatCurrency(hicapsData.gap)}</span>
            </div>
          </div>
        )}
 
        <div className="text-center pt-8 border-t-2 border-black mt-8">
          <p className="font-black text-xs uppercase tracking-widest">Thank you for visiting!</p>
          <p className="text-[8px] mt-2 opacity-60">{storeConfig.storeName} • {storeConfig.address} • ABN {storeConfig.abn}</p>
          <div className="mt-6 flex justify-center">
            <div className="w-20 h-20 border-4 border-black flex items-center justify-center p-2">
              <div className="w-full h-full bg-black/10 flex items-center justify-center text-[8px] font-black text-center leading-tight">
                SCAN FOR<br/>LOYALTY
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
