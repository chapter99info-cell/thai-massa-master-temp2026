import React, { useState, useEffect } from 'react';
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
  Star
} from 'lucide-react';
import { therapists } from '../data/therapists';
import { services } from '../data/services';
import { StaffStatus, QueueItem, AlertEntry, AttendanceEntry, Bed } from '../types';
import { storeConfig, getAppSettings, INITIAL_BEDS } from '../config';
import { cn } from '../lib/utils';
import { usePin } from '../contexts/PinContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBookings } from '../contexts/BookingContext';
import { printerService, ReceiptData } from '../services/PrinterService';

import AdBanner from './AdBanner';
import PrintableReceipt from './PrintableReceipt';

interface ManagerDashboardProps {
  enablePrinting?: boolean;
  billingPlan?: 'Monthly' | 'GP%';
}

export default function ManagerDashboard({ enablePrinting = true, billingPlan = 'GP%' }: ManagerDashboardProps) {
  const { logout } = usePin();
  const { t } = useLanguage();
  const { beds, bookings, updateBedStatus } = useBookings();
  const settings = getAppSettings();
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
    therapistId: 'none'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [miraMessage, setMiraMessage] = useState<string | null>(null);
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
  const [activeTab, setActiveTab] = useState<'control' | 'payments'>('control');

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

  const GP_RATE = 0.005; // 0.5%

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
      setFormError(t('ป้าลืมใส่ชื่อลูกค้าหรือเปล่าคะ? หนูรบกวนตรวจดูอีกนิดนึงนะคะ', 'Did you forget the customer name? Please double check.'));
      return;
    }

    if (newWalkIn.therapistId === 'none') {
      setFormError(t('กรุณาเลือกคุณพี่หมอด้วยนะคะ', 'Please select a therapist.'));
      return;
    }

    if (!newWalkIn.bedId) {
      setFormError(t('กรุณาเลือกเตียงให้คุณพี่หมอด้วยนะคะ', 'Please select a bed.'));
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

    // Assign immediately
    setStaff(prev => prev.map(s => {
      if (s.therapistId === data.therapistId) {
        return {
          ...s,
          status: 'Working',
          remainingSeconds: newBooking.durationMins * 60,
          currentCustomer: newBooking.customerName,
          currentService: newBooking.serviceName,
          currentPrice: newBooking.price,
          currentBedNumber: bed.number,
          currentBedType: bed.type,
          providerNumber: therapist?.providerNumber
        };
      }
      return s;
    }));

    updateBedStatus(bed.id, 'In Use');
    setMiraMessage(t(`คุณพี่คะ หนูใส่สีส้มไว้ที่เตียงที่นวดเสร็จแล้วแต่ยังไม่ได้เก็บเงินนะคะ พอคุณพี่ได้รับเงินแล้วกด "ยืนยันการชำระเงิน" หนูจะเปลี่ยนเป็นสีเขียวให้ทันทีค่ะ`, `I've marked the bed orange for unpaid sessions. Once you receive payment and click "Confirm Payment", I'll turn it green.`));
    
    setIsQuickAddOpen(false);
    setFormError(null);
    setNewWalkIn({ customerName: '', serviceId: services[0].id, therapistId: 'none' });
    setPendingWalkIn(null);
    setShowInsuranceWarning(false);
  };

  const processPayment = (method: 'Cash' | 'Card' | 'PayID' | 'HICAPS') => {
    if (!paymentSession) return;
    
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
      bedType: paymentSession.currentBedType
    };
    
    setSalesLog(prev => [...prev, logData]);
    setLastSaleDate(now);
    
    if (method === 'PayID') {
      setMiraMessage(t(`บันทึกยอด PayID เรียบร้อย (เวลา ${exactTime}) หนูจดวินาทีไว้ให้ป้าเช็คแล้วค่ะ!`, `PayID payment recorded (Time: ${exactTime}). I've noted the exact second for the owner to check!`));
    } else {
      setMiraMessage(t('บันทึกการชำระเงินเรียบร้อยค่ะ!', 'Payment recorded successfully!'));
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
    setMiraMessage(t('จ่ายเงินเรียบร้อยแล้วค่ะ เตียงพร้อมรับแขกใหม่แล้ว!', 'Payment successful! The bed is now vacant and ready for the next customer.'));
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
    <div className="min-h-screen bg-[#0A0E17] text-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-800/50 px-8 py-4 flex justify-between items-center shrink-0 z-40 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-lg rotate-3">
            <LayoutGrid size={28} />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-serif font-bold text-white tracking-tight">{storeConfig.storeName}</h1>
            <p className="text-slate-500 uppercase tracking-[0.2em] text-[8px] font-bold">
              {t('Manager POS / พนักงานคุมร้าน', 'Manager POS')}
            </p>
          </div>
        </div>

        {/* Tab Navigation - Center */}
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveTab('control')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'control' 
                ? "bg-primary text-white shadow-lg" 
                : "text-slate-400 hover:text-white"
            )}
          >
            <LayoutGrid size={16} />
            <span>{t('🛏️ Control Board', 'Control Board')}</span>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'payments' 
                ? "bg-primary text-white shadow-lg" 
                : "text-slate-400 hover:text-white"
            )}
          >
            <DollarSign size={16} />
            <span>{t('💰 Today\'s Payments', 'Today\'s Payments')}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setMiraMessage(t('พี่ๆ คะ... ถ้ามีลูกค้าใหม่มาถึงร้าน พี่กดปุ่มนี้แล้วยื่น iPad ให้แขกกรอกประวัติได้เลยนะคะ ข้อมูลสุขภาพและประกันจะถูกเก็บเข้าระบบดิจิทัลทันที ไม่ต้องใช้กระดาษให้รกแล้วค่ะ!', 'P\'s... If a new customer arrives, press this button and hand the iPad to the guest. Health and insurance data will be saved digitally immediately!'));
              setIsIntakeOpen(true);
            }}
            className="flex items-center gap-2 px-6 h-12 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20"
          >
            <FileText size={18} />
            <span className="text-[11px] uppercase tracking-widest hidden lg:inline">📋 {t('New Client / ลงทะเบียนลูกค้าใหม่', 'New Client Intake')}</span>
            <span className="text-[11px] uppercase tracking-widest lg:hidden">📋 New Client</span>
          </button>

          <button 
            onClick={() => setIsStaffStatusOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl font-bold border border-indigo-500/20 hover:bg-indigo-500/20 transition-all shadow-lg"
          >
            <Users size={16} />
            <span className="text-[10px] uppercase tracking-widest hidden lg:inline">👥 {t('จัดการสถานะ/พักเบรก', 'Staff Status')}</span>
            <span className="text-[10px] uppercase tracking-widest lg:hidden">👥 Status</span>
          </button>

          <button 
            onClick={() => setShowAlerts(true)}
            className="relative w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-slate-700"
          >
            <Bell size={20} />
            {newAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
            )}
          </button>
          
          <button 
            onClick={logout}
            className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700 hover:bg-red-500/20 hover:text-red-400 transition-all shadow-lg"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Chapter99 Solution (by Nong Mira) Action Prompt (Toast Notification) */}
      <AnimatePresence>
        {miraMessage && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-4 right-4 md:left-auto md:right-8 md:w-[400px] z-[200] bg-primary/90 backdrop-blur-md border border-white/20 p-4 md:p-6 rounded-2xl md:rounded-[2rem] flex items-center gap-4 shadow-2xl"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white flex items-center justify-center text-primary shadow-lg flex-shrink-0">
              <Heart size={20} className="md:size-24" fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-xs md:text-sm leading-tight font-sans break-words">{miraMessage}</p>
              <p className="text-[8px] md:text-[10px] text-white/60 uppercase font-black tracking-widest mt-1">Chapter99 Solution (by Nong Mira)</p>
            </div>
            <button 
              onClick={() => setMiraMessage(null)}
              className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto space-y-10 bg-[#0A0E17]">
        {activeTab === 'control' ? (
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
                                bedId: bed.id
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
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Therapist</span>
                              <span className="text-sm font-bold text-primary">{assignedStaff.therapistName}</span>
                            </div>
                            {assignedStaff.status === 'Working' && assignedStaff.remainingSeconds && (
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Time Left</span>
                                <span className="text-sm font-mono font-bold text-orange-400">
                                  {Math.floor(assignedStaff.remainingSeconds / 60)}:{(assignedStaff.remainingSeconds % 60).toString().padStart(2, '0')}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Direct Action Buttons for iPad POS Efficiency */}
                          <div className="space-y-2">
                            {assignedStaff.status === 'PaymentPending' && bed.paymentStatus === 'Unpaid' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPaymentSession(assignedStaff);
                                }}
                                className="w-full py-3 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg shadow-orange-900/20 active:scale-95 transition-transform"
                              >
                                {t('เก็บเงิน / Collect', 'Collect Payment')}
                              </button>
                            )}
                            {bed.paymentStatus === 'Paid' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Trigger print for this specific session
                                  const sale = salesLog.find(s => s.bedNumber === bed.number && s.type === 'SALE');
                                  if (sale) {
                                    // Logic to re-print
                                    console.log('Re-printing receipt for bed', bed.number);
                                  }
                                }}
                                className="w-full py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2"
                              >
                                <Receipt size={14} />
                                {t('พิมพ์ใบเสร็จ / Print', 'Print Receipt')}
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

                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
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
                          "flex-shrink-0 flex flex-col items-center gap-3 px-8 py-6 rounded-[2rem] border-2 transition-all min-w-[160px]",
                          s.status === 'Available' 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-slate-800/50 border-slate-700 text-slate-500"
                        )}
                      >
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-lg font-black">
                          {index + 1}
                        </div>
                        <span className="font-bold text-lg">{s.therapistName}</span>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            s.status === 'Available' ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                          )} />
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                            {s.status === 'Available' ? t('ว่าง', 'Available') : t('ติดแขก', 'Busy')}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-slate-900/80 p-10 rounded-[3rem] border border-slate-800/50 shadow-2xl backdrop-blur-md text-center space-y-6">
              <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary mx-auto border border-primary/30">
                <TrendingUp size={40} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white">{t('สรุปยอดขายวันนี้', 'Today\'s Sales Summary')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Total Sales</p>
                  <p className="text-3xl font-black text-white">${salesLog.reduce((acc, s) => acc + s.amount, 0).toFixed(2)}</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Transactions</p>
                  <p className="text-3xl font-black text-white">{salesLog.length}</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">Average Bill</p>
                  <p className="text-3xl font-black text-white">
                    ${salesLog.length > 0 ? (salesLog.reduce((acc, s) => acc + s.amount, 0) / salesLog.length).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-serif font-bold text-white">{t('รายการล่าสุด', 'Recent Transactions')}</h3>
                  <button className="text-primary text-xs font-bold hover:underline">View All Report</button>
                </div>
                <div className="space-y-3">
                  {salesLog.slice(-5).reverse().map((sale, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{sale.customer}</p>
                        <p className="text-[10px] text-slate-500">{sale.service} • {sale.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary">${sale.amount.toFixed(2)}</p>
                        <p className="text-[8px] text-slate-500">{new Date(sale.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                  {salesLog.length === 0 && (
                    <p className="text-slate-500 text-sm italic py-10">{t('ยังไม่มีรายการขายในวันนี้ค่ะ', 'No sales recorded yet today.')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-10 pb-10">
          <AdBanner />
        </div>
      </div>

      {/* Floating Action Buttons (FABs) Stack - Moved outside scrollable area and adjusted for mobile nav */}
      <div className="fixed bottom-28 right-6 md:bottom-10 md:right-10 z-50 flex flex-col items-center gap-3 md:gap-4 no-print">
        {/* Chapter99 Solution (by Nong Mira) (M) Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.dispatchEvent(new CustomEvent('open-nong-mira'))}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-primary shadow-xl flex items-center justify-center border-2 border-primary/20 hover:bg-primary/5 transition-colors group scale-85 md:scale-100"
        >
          <div className="relative">
            <Heart size={18} className="md:size-6" fill="currentColor" />
            <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-primary text-white rounded-full flex items-center justify-center border border-white">
              <span className="text-[8px] md:text-[10px] font-black">M</span>
            </div>
          </div>
          
          {/* Tooltip/Message for Chapter99 Solution (by Nong Mira) */}
          <div className="absolute right-full mr-4 bg-white text-primary p-3 rounded-2xl rounded-br-none shadow-xl border border-primary/10 text-[10px] font-bold w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
            {t('พี่แสนคะ หนูทำระบบ "จดเวลาเป๊ะๆ" ให้แล้วนะ พอพี่กดรับเงิน PayID ปุ๊บ หนูจะแอบจดวินาทีที่เงินเข้าไว้ให้ป้าทันที พี่ไม่ต้องเสียเวลาถ่ายรูปสลิปให้วุ่นวายค่ะ ป้าไปเช็คในแอปแบงค์ตอนไหนก็เจอ เพราะเวลาหนูแก้ไม่ได้ค่ะ!', "Master Admin, I've added the 'Exact Time' system. When you confirm a PayID payment, I'll record the exact second for the owner. No need to take slip photos anymore; the owner can just check their bank app against my recorded time!")}
          </div>
        </motion.button>

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
      </div>

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
                      {t('พี่แสนคะ หนูซ่อนตารางพักเบรกไว้ในปุ่มเล็กๆ ให้แล้วนะคะ หน้าจอหลักจะได้มีพื้นที่ดูเตียงลูกค้าแบบเต็มตา พอจะให้ใครไปกินข้าว ค่อยกดปุ่มเปิดขึ้นมาดูค่ะ!', 'Master Admin, I\'ve hidden the break table in this button to save space. Open it when you need to manage staff breaks!')}
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

      {/* Quick Add Modal */}
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
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-serif font-bold text-white">{t('Walk-in / รับลูกค้า', 'Walk-in')}</h3>
                    <p className="text-slate-500 text-sm">{t('ใส่ข้อมูลลูกค้าเพื่อเริ่มงานทันทีนะคะ', 'Enter customer info to start session.')}</p>
                  </div>
                  <button onClick={() => setIsQuickAddOpen(false)} className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <X size={28} />
                  </button>
                </div>

                <form onSubmit={handleQuickAdd} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Customer Name</label>
                    <input 
                      type="text"
                      value={newWalkIn.customerName}
                      onChange={(e) => {
                        setNewWalkIn(prev => ({ ...prev, customerName: e.target.value }));
                        setFormError(null);
                      }}
                      placeholder="Enter Name"
                      className={cn(
                        "w-full bg-slate-800 border-2 rounded-2xl px-6 py-5 text-xl text-white focus:border-primary outline-none transition-all",
                        formError ? "border-red-500/50" : "border-slate-700"
                      )}
                    />
                    {formError && <p className="text-red-400 text-xs font-medium">{formError}</p>}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Select Service</label>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {services.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setNewWalkIn(prev => ({ ...prev, serviceId: s.id }))}
                          className={cn(
                            "p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center",
                            newWalkIn.serviceId === s.id 
                              ? "bg-primary/20 border-primary text-white" 
                              : "bg-slate-800 border-slate-700 text-slate-400"
                          )}
                        >
                          <span className="font-bold">{s.name}</span>
                          <span className="text-xs opacity-60">${s.standardPrice}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">{t('เลือกพนักงาน / Therapist', 'Therapist')}</label>
                      <div className="flex items-center gap-2 text-primary animate-pulse">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[10px]">M</div>
                        <span className="text-[9px] font-bold italic">
                          {t('พี่แสนคะ... แนะนำคนว่างคิวแรกได้เลยค่ะ!', 'Tip: Recommend the first available staff!')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2 no-scrollbar p-1">
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
                                "relative p-4 rounded-2xl border-2 text-left transition-all group",
                                newWalkIn.therapistId === s.therapistId 
                                  ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(184,150,46,0.2)]" 
                                  : isNextAvailable 
                                    ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50"
                                    : "bg-slate-800 border-slate-700 hover:border-slate-600"
                              )}
                            >
                              {isNextAvailable && (
                                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg z-10 animate-bounce flex items-center gap-1">
                                  <Star size={8} fill="currentColor" />
                                  NEXT AVAILABLE
                                </div>
                              )}
                              
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-500 border border-slate-600 overflow-hidden relative">
                                  {therapistData?.imageUrl ? (
                                    <img src={therapistData.imageUrl} alt={s.therapistName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <User size={20} />
                                  )}
                                  <div className="absolute bottom-0 right-0 bg-slate-900/80 p-0.5 rounded-tl-lg">
                                    <span className="text-[8px]">
                                      {s.gender === 'Male' ? '👨' : s.gender === 'Female' ? '👩' : '⚧️'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{s.therapistName}</span>
                                    {insStatus.status !== 'valid' && (
                                      <span className="text-[8px] text-red-400 font-black">⚠️</span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {therapistData?.specialties.slice(0, 2).map((spec, i) => (
                                      <span key={i} className="text-[7px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-bold uppercase tracking-tighter border border-slate-700">
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

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Bed Number / เลือกเตียง</label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {beds.filter(b => b.status === 'Vacant').map(b => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setNewWalkIn(prev => ({ ...prev, bedId: b.id }))}
                          className={cn(
                            "py-3 rounded-xl border-2 font-bold text-sm transition-all",
                            newWalkIn.bedId === b.id 
                              ? "bg-primary/20 border-primary text-white" 
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                          )}
                        >
                          {b.number}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-6 gold-gradient text-white rounded-2xl font-bold text-xl shadow-2xl hover:opacity-90 transition-opacity uppercase tracking-[0.2em]"
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

                {/* Chapter99 Solution (by Nong Mira) Guidance */}
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">M</div>
                  <p className="text-xs text-primary leading-relaxed">
                    {t('พี่จิ้มเลือกวิธีจ่ายเงินที่ลูกค้าใช้ได้เลยค่ะ ถ้าเป็น PayID หนูเตือนให้ถ่ายรูปสลิปไว้ด้วย ป้าจะได้เช็คยอดง่ายค่ะ!', 'Please select the payment method. For PayID, don\'t forget to take a photo of the slip for easier tracking!')}
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-[2.5rem] p-8 border border-slate-700/50 space-y-6">
                  <div className="flex justify-between items-center pb-6 border-b border-slate-700">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{t('ลูกค้า / Customer', 'Customer')}</p>
                      <p className="text-2xl font-bold text-white font-sans">{paymentSession.currentCustomer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{t('บริการ / Service', 'Service')}</p>
                      <p className="text-xl font-bold text-slate-300 font-sans">{paymentSession.currentService}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{t('ระยะเวลา / Duration', 'Duration')}</p>
                      <p className="text-xl font-medium text-slate-400 font-sans">{paymentSession.remainingSeconds ? 'Active' : '60 mins'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{t('ยอดรวม / Total', 'Total')}</p>
                      <p className="text-5xl font-black text-primary font-sans">${paymentSession.currentPrice}</p>
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
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Insurance Claim ($)</label>
                          <input 
                            type="number"
                            value={hicapsData.claim || ''}
                            onChange={(e) => setHicapsData(prev => ({ ...prev, claim: parseFloat(e.target.value) || 0 }))}
                            placeholder="0.00"
                            className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-4 text-white font-mono text-xl focus:border-primary outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Gap Payment ($)</label>
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
                            setMiraMessage(t('รับทราบปัญหาแล้วค่ะ หนูจะแจ้งให้พี่ๆ หมอทราบนะคะ', "Issue acknowledged! I'll let the staff know."));
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
                
                {/* Chapter99 Solution (by Nong Mira) Help */}
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-start gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">M</div>
                  <p className="text-xs text-primary leading-relaxed">
                    {t('พี่ๆ คะ กดปุ่มพิมพ์ใบเสร็จตรงนี้ได้เลยนะคะ หนูจัดหน้ากระดาษให้พอดีกับเครื่องปริ้นท์สลิปแล้ว ฝรั่งเอาไปเคลมประกันได้เป๊ะๆ ไม่มีพลาดแน่นอนค่ะ!', 'You can print the receipt here. I\'ve formatted it perfectly for thermal printers so customers can claim insurance easily!')}
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
                      <span>${paymentSession.currentPrice?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2 mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${((paymentSession.currentPrice || 0) / 1.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (10%):</span>
                      <span>{((paymentSession.currentPrice || 0) / 11).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-200">
                      <span>TOTAL:</span>
                      <span>${paymentSession.currentPrice?.toFixed(2)}</span>
                    </div>
                  </div>

                  {paymentMethod === 'HICAPS' && (
                    <div className="bg-slate-200/50 p-2 rounded mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Insurance Claim:</span>
                        <span>-${hicapsData.claim.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Gap Payment:</span>
                        <span>${hicapsData.gap.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div className="text-center pt-4 border-t border-slate-200 mt-4">
                    <p>Payment Method: {paymentMethod}</p>
                    <p className="mt-2 italic">Thank you for visiting us!</p>
                  </div>
                </div>

                <div className={cn("grid gap-4", (settings.enableThermalPrinting && enablePrinting) ? "grid-cols-2" : "grid-cols-1")}>
                  {settings.enableThermalPrinting && enablePrinting && (
                    <button 
                      onClick={handlePrint}
                      className="py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Receipt size={18} />
                      Print Tax Invoice
                    </button>
                  )}
                  <button 
                    onClick={closeReceipt}
                    className="py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-all"
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
            <span className="font-black text-base">${paymentSession?.currentPrice?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[9px] italic opacity-70">
            <span>Service Duration</span>
            <span>{paymentSession?.remainingSeconds ? 'Active Session' : '60 mins'}</span>
          </div>
        </div>
 
        <div className="border-t-2 border-black pt-3 mt-4 space-y-1 bg-slate-50/50 p-2">
          <div className="flex justify-between text-[10px]">
            <span>Subtotal (Excl. GST):</span>
            <span>${((paymentSession?.currentPrice || 0) / 1.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span>GST (10%):</span>
            <span>${((paymentSession?.currentPrice || 0) / 11).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black pt-2 border-t-4 border-black text-xl mt-2">
            <span>TOTAL AUD:</span>
            <span>${paymentSession?.currentPrice?.toFixed(2)}</span>
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
              <span className="font-bold">-${hicapsData.claim.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-sm border-t border-black pt-1">
              <span>Gap to Pay:</span>
              <span>${hicapsData.gap.toFixed(2)}</span>
            </div>
          </div>
        )}
 
        <div className="text-center pt-8 border-t-2 border-black mt-8">
          <p className="font-black text-xs uppercase tracking-widest">Thank you for visiting!</p>
          <p className="text-[8px] mt-2 opacity-60">Mira Thai Massage Sydney • ABN {storeConfig.abn}</p>
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
