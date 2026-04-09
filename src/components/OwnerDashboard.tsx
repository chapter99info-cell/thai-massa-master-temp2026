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
  Trash2,
  Edit3,
  MessageCircle,
  QrCode,
  Shield,
  Lock
} from 'lucide-react';
import { therapists } from '../data/therapists';
import { services } from '../data/services';
import { StaffStatus, QueueItem, AlertEntry, AttendanceEntry, Bed, Gender } from '../types';
import { storeConfig, getAppSettings, saveAppSettings, INITIAL_BEDS } from '../config';
import { cn } from '../lib/utils';
import { usePin } from '../contexts/PinContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBookings } from '../contexts/BookingContext';

export default function OwnerDashboard() {
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
      dailyGuarantee: t.dailyGuarantee,
      commissionRate: t.commissionRate,
      pin: t.pin
    }))
  );

  const [queue, setQueue] = useState<QueueItem[]>([
    { id: 'q1', customerName: 'David Miller', serviceName: 'Traditional Thai Massage', durationMins: 60, price: 95 },
    { id: 'q2', customerName: 'Emma Stone', serviceName: 'Organic Glow Facial', durationMins: 60, price: 125 },
    { id: 'q3', customerName: 'Liam Neeson', serviceName: 'Deep Tissue Relief', durationMins: 90, price: 150 },
  ]);

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [paymentSession, setPaymentSession] = useState<StaffStatus | null>(null);
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
  const [alerts, setAlerts] = useState<AlertEntry[]>([
    { id: '1', therapistId: 't1', therapistName: 'พี่นก', issue: 'น้ำมันหมด', timestamp: new Date().toISOString(), status: 'NEW' }
  ]);
  const [activeTab, setActiveTab] = useState<'overview' | 'summary' | 'alerts' | 'staff' | 'security'>('overview');
  const [isAssigningBed, setIsAssigningBed] = useState(false);
  const [assigningData, setAssigningData] = useState<{ therapistId: string; bookingId: string } | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceEntry[]>([
    { id: 'a1', therapistId: 't1', therapistName: 'พี่นก', timestamp: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0] + 'T09:00:00Z', type: 'CLOCK_IN' },
    { id: 'a2', therapistId: 't1', therapistName: 'พี่นก', timestamp: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0] + 'T18:00:00Z', type: 'CLOCK_OUT' },
    { id: 'a3', therapistId: 't2', therapistName: 'พี่มะลิ', timestamp: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0] + 'T10:00:00Z', type: 'CLOCK_IN' },
    { id: 'a4', therapistId: 't2', therapistName: 'พี่มะลิ', timestamp: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0] + 'T19:30:00Z', type: 'CLOCK_OUT' },
    { id: 'a5', therapistId: 't3', therapistName: 'พี่อารี', timestamp: new Date().toISOString().split('T')[0] + 'T09:30:00Z', type: 'CLOCK_IN' },
  ]);
  const [showPayrollReport, setShowPayrollReport] = useState(false);
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [salesLog, setSalesLog] = useState<any[]>([
    { id: 'l1', amount: 95, method: 'Cash', timestamp: new Date().toISOString(), customer: 'David Miller', service: 'Traditional Thai Massage', therapist: 'Nok', bedNumber: '1' },
    { id: 'l2', amount: 110, method: 'Card', timestamp: new Date().toISOString(), customer: 'Sarah Wilson', service: 'Aromatherapy Oil Massage', therapist: 'Mali', bedNumber: '3' },
    { id: 'l3', amount: 150, method: 'PayID', timestamp: new Date().toISOString(), customer: 'Liam Neeson', service: 'Deep Tissue Relief', therapist: 'Aree', bedNumber: '6' },
  ]);

  const [editingStaff, setEditingStaff] = useState<StaffStatus | null>(null);
  const [pinForm, setPinForm] = useState({ currentPin: '', newPin: '' });
  const { refreshPins } = usePin();

  const handleUpdatePin = () => {
    if (pinForm.currentPin !== settings.ownerPin) {
      alert(t('รหัสผ่านปัจจุบันไม่ถูกต้องค่ะคุณป้า', 'Current PIN is incorrect.'));
      return;
    }
    if (pinForm.newPin.length !== 4) {
      alert(t('กรุณาตั้งรหัสผ่าน 4 หลักนะคะ', 'Please set a 4-digit PIN.'));
      return;
    }

    const newSettings = { ...settings, ownerPin: pinForm.newPin };
    saveAppSettings(newSettings);
    refreshPins();
    setPinForm({ currentPin: '', newPin: '' });
    setMiraMessage(t('เปลี่ยนรหัสผ่านเรียบร้อยแล้วค่ะคุณป้า หนูอัปเดตข้อมูลให้แล้วนะคะ!', 'PIN updated successfully! I\'ve updated the settings for you.'));
  };
  const [isStaffManagementOpen, setIsStaffManagementOpen] = useState(false);
  const [isAddingNewStaff, setIsAddingNewStaff] = useState(false);

  // Sync Bed Status with Staff Status (Live Monitor)
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

  const generatePayrollReport = () => {
    const report: { [key: string]: { 
      name: string, 
      days: Set<string>, 
      totalMs: number,
      dailyCommissions: { [date: string]: number },
      dailyGuarantee: number
    } } = {};
    
    // Sort logs by timestamp
    const sortedLogs = [...attendanceLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const activeSessions: { [key: string]: string } = {};

    sortedLogs.forEach(log => {
      const date = log.timestamp.split('T')[0];
      if (!report[log.therapistId]) {
        const staffMember = staff.find(s => s.therapistId === log.therapistId);
        report[log.therapistId] = { 
          name: log.therapistName, 
          days: new Set(), 
          totalMs: 0,
          dailyCommissions: {},
          dailyGuarantee: staffMember?.dailyGuarantee || 120
        };
      }
      
      if (log.type === 'CLOCK_IN') {
        activeSessions[log.therapistId] = log.timestamp;
        report[log.therapistId].days.add(date);
      } else if (log.type === 'CLOCK_OUT' && activeSessions[log.therapistId]) {
        const start = new Date(activeSessions[log.therapistId]).getTime();
        const end = new Date(log.timestamp).getTime();
        report[log.therapistId].totalMs += (end - start);
        delete activeSessions[log.therapistId];
      }
    });

    // Calculate Commissions from salesLog
    salesLog.forEach(sale => {
      const date = sale.timestamp.split('T')[0];
      // Match by name from staff state to get ID
      const staffMember = staff.find(s => s.therapistName === sale.therapist);
      if (staffMember && report[staffMember.therapistId]) {
        if (!report[staffMember.therapistId].dailyCommissions[date]) {
          report[staffMember.therapistId].dailyCommissions[date] = 0;
        }
        const rate = staffMember.commissionRate || 0.5;
        report[staffMember.therapistId].dailyCommissions[date] += (sale.amount * rate);
        
        // Track total service amount
        if (!(report[staffMember.therapistId] as any).totalServiceAmount) {
          (report[staffMember.therapistId] as any).totalServiceAmount = 0;
        }
        (report[staffMember.therapistId] as any).totalServiceAmount += sale.amount;
        (report[staffMember.therapistId] as any).commissionRate = rate;
      }
    });

    const finalReport = Object.values(report).map(r => {
      let totalCommission = 0;
      let grandTotalToPay = 0;
      let topUpRequired = false;
      
      // Calculate based on days worked
      r.days.forEach(date => {
        const dayComm = r.dailyCommissions[date] || 0;
        totalCommission += dayComm;
        const dailyPay = Math.max(dayComm, r.dailyGuarantee);
        grandTotalToPay += dailyPay;
        if (dailyPay > dayComm) topUpRequired = true;
      });

      return {
        name: r.name,
        daysWorked: r.days.size,
        totalHours: (r.totalMs / (1000 * 60 * 60)).toFixed(1),
        totalCommission: totalCommission,
        topUpAmount: grandTotalToPay - totalCommission,
        grandTotalToPay: grandTotalToPay,
        totalServiceAmount: (r as any).totalServiceAmount || 0,
        commissionRate: (r as any).commissionRate || 0.5,
        guaranteeStatus: topUpRequired ? 'Top-up Required' : 'Met'
      };
    });

    setPayrollData(finalReport);
    setShowPayrollReport(true);
    setMiraMessage(t('คุณป้าคะ หนูคำนวณส่วนแบ่งให้พี่ๆ หมอตามเปอร์เซ็นต์ที่ป้าตั้งไว้ (45/50/60) เรียบร้อยแล้วค่ะ แถมยังช่วยเช็คให้ด้วยว่ายอดถึงประกันมือมั้ย ป้าไม่ต้องมานั่งกดเครื่องคิดเลขแยกรายคนให้ปวดหัวแล้วค่ะ หนูรวมยอดสุทธิที่ป้าต้องจ่ายไว้ให้ในปุ่มเดียวเลย!', 'Owner, I\'ve calculated the commissions based on the percentages you set (45/50/60). I also checked if they met the daily guarantee. No more manual calculations for each person! I\'ve summarized the total pay in one button for you!'));
  };

  const newAlertsCount = alerts.filter(a => a.status === 'NEW').length;

  const getInsuranceStatus = (expiryDate?: string) => {
    if (!expiryDate) return { status: 'valid', message: '' };
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'expired', message: 'Insurance Expired - Please Update' };
    if (diffDays <= 30) return { status: 'warning', message: `Expiring in ${diffDays} days` };
    return { status: 'valid', message: '' };
  };

  useEffect(() => {
    const expiredCount = staff.filter(s => getInsuranceStatus(s.insuranceExpiry).status === 'expired').length;
    const warningCount = staff.filter(s => getInsuranceStatus(s.insuranceExpiry).status === 'warning').length;

    if (expiredCount > 0) {
      setMiraMessage(t('คุณป้าคะ หนูช่วยเฝ้าวันหมดอายุประกันมือให้พี่ๆ หมอแล้วนะ ถ้าใครใกล้หมดหนูจะขึ้นตัวแดงเตือนป้าทันที ป้าจะได้รีบบอกให้เขาไปต่อประกัน ร้านเราจะได้ปลอดภัยและเคลม HICAPS ได้ตลอดเวลาค่ะ', "Owner, I'm monitoring the insurance expiry for the therapists. If someone's insurance is expired, I'll alert you immediately so you can remind them to renew it. This keeps our shop safe and ensures we can always claim HICAPS."));
    } else if (warningCount > 0) {
      setMiraMessage(t('คุณป้าคะ มีพี่หมอบางคนประกันมือใกล้หมดอายุแล้วนะคะ หนูขึ้นตัวเหลืองเตือนไว้ให้แล้วค่ะ', "Owner, some therapists' insurance is expiring soon. I've marked them with a yellow warning."));
    } else if (newAlertsCount > 0 && settings.showInventoryAlerts) {
      setMiraMessage(t('คุณพี่คะ คุณพี่หมอแจ้งว่าของบางอย่างใกล้หมดแล้ว ลองเช็คดูที่หน้าแจ้งเตือนนะคะ', "Owner, the staff reported that some items are running low. Please check the alerts page."));
    } else {
      setMiraMessage(t('พี่แสนคะ หนูเชื่อมปุ่มแจ้งปัญหาของพี่ๆ หมอเข้ากับหน้าจอคุณป้าแล้วนะ พอมีใครกดแจ้งว่าน้ำมันหมด ปุ๊บ! หน้าจอคุณป้าจะขึ้นเตือนทันที ป้าจะได้สั่งของได้ทันใจ ไม่ต้องรอให้ของหมดเกลี้ยงร้านค่ะ', "Owner, I've linked the staff's issue reporting button to your screen. When someone reports 'Oil out', your screen will alert you immediately so you can order supplies right away!"));
    }
  }, [newAlertsCount, settings.showInventoryAlerts]);

  const handleDeleteStaff = (id: string) => {
    if (window.confirm(t('คุณแน่ใจนะคะว่าจะลบพนักงานคนนี้? ข้อมูลจะหายไปถาวรเลยนะคะ', 'Are you sure you want to delete this staff member? This action cannot be undone.'))) {
      setStaff(prev => prev.filter(s => s.therapistId !== id));
      setMiraMessage(t('ลบข้อมูลพนักงานเรียบร้อยแล้วค่ะคุณป้า', 'Staff member deleted successfully.'));
    }
  };

  const GP_RATE = 0.005; // 0.5%

  // Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setStaff(prev => prev.map(s => {
        if (s.status === 'Working' && s.remainingSeconds && s.remainingSeconds > 0) {
          const nextSec = s.remainingSeconds - 1;
          if (nextSec === 0) {
            return { ...s, status: 'PaymentPending', remainingSeconds: undefined };
          }
          return { ...s, remainingSeconds: nextSec };
        }
        return s;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAssign = (therapistId: string) => {
    if (!selectedBookingId) return;
    
    const booking = queue.find(q => q.id === selectedBookingId);
    if (!booking) return;

    const therapist = staff.find(s => s.therapistId === therapistId);
    if (!therapist || therapist.status !== 'Available') return;

    setAssigningData({ therapistId, bookingId: selectedBookingId });
    setIsAssigningBed(true);
  };

  const confirmAssignment = (bedId: string) => {
    if (!assigningData) return;
    const { therapistId, bookingId } = assigningData;
    const booking = queue.find(q => q.id === bookingId);
    if (!booking) return;

    const bed = beds.find(b => b.id === bedId);
    if (!bed) return;

    setStaff(prev => prev.map(s => {
      if (s.therapistId === therapistId) {
        return {
          ...s,
          status: 'Working',
          remainingSeconds: booking.durationMins * 60,
          currentCustomer: booking.customerName,
          currentService: booking.serviceName,
          currentPrice: booking.price,
          currentBedNumber: bed.number,
          currentBedType: bed.type,
          providerNumber: s.providerNumber
        };
      }
      return s;
    }));

    updateBedStatus(bedId, 'In Use');
    setQueue(prev => prev.filter(q => q.id !== bookingId));
    setSelectedBookingId(null);
    setIsAssigningBed(false);
    setAssigningData(null);
    setMiraMessage(t(`คุณพี่หมอคะ งานใหม่ประจำที่ เตียง ${bed.number} นะคะ เตรียมเตียงตามสีที่หนูโชว์ไว้ได้เลยค่ะ`, `New job at Bed ${bed.number}. Please prepare the bed according to the color shown.`));
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWalkIn.customerName.trim()) {
      setFormError(t('ป้าลืมใส่ชื่อลูกค้าหรือเปล่าคะ? หนูรบกวนตรวจดูอีกนิดนึงนะคะ', 'Did you forget the customer name? Please double check.'));
      return;
    }

    const service = services.find(s => s.id === newWalkIn.serviceId);
    if (!service) return;

    const therapist = therapists.find(t => t.id === newWalkIn.therapistId);

    const newBooking: QueueItem = {
      id: `walkin-${Date.now()}`,
      customerName: newWalkIn.customerName,
      serviceName: service.name,
      durationMins: service.durationMins,
      price: service.standardPrice
    };

    if (newWalkIn.therapistId !== 'none') {
      if (!newWalkIn.bedId) {
        setFormError(t('กรุณาเลือกเตียงให้คุณพี่หมอด้วยนะคะ', 'Please select a bed for the therapist.'));
        return;
      }

      const bed = beds.find(b => b.id === newWalkIn.bedId);
      if (!bed) return;

      // Assign immediately
      setStaff(prev => prev.map(s => {
        if (s.therapistId === newWalkIn.therapistId) {
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

      if (newWalkIn.bedId) {
        updateBedStatus(newWalkIn.bedId, 'In Use');
      }
      setMiraMessage(t(`คุณพี่หมอคะ งานใหม่ประจำที่ เตียง ${bed.number} นะคะ เตรียมเตียงตามสีที่หนูโชว์ไว้ได้เลยค่ะ`, `New job at Bed ${bed.number}. Please prepare the bed according to the color shown.`));
    } else {
      setQueue(prev => [...prev, newBooking]);
    }

    setIsQuickAddOpen(false);
    setFormError(null);
    setNewWalkIn({ customerName: '', serviceId: services[0].id, therapistId: 'none' });
  };

  const processPayment = (method: 'Cash' | 'Card' | 'PayID' | 'HICAPS') => {
    if (!paymentSession) return;
    
    setPaymentMethod(method);
    
    const amount = method === 'HICAPS' ? hicapsData.claim + hicapsData.gap : (paymentSession.currentPrice || 0);

    // Mock Logging Logic
    const logData = {
      id: `sale-${Date.now()}`,
      timestamp: new Date().toISOString(),
      shopName: storeConfig.storeName,
      customer: paymentSession.currentCustomer,
      service: paymentSession.currentService,
      therapist: paymentSession.therapistName,
      providerNumber: paymentSession.providerNumber,
      amount: amount,
      insuranceClaim: method === 'HICAPS' ? hicapsData.claim : 0,
      gapPayment: method === 'HICAPS' ? hicapsData.gap : 0,
      gst: amount / 11, // 10% GST included in price
      developerFee: (amount * settings.gpFeePercent) / 100,
      method: method,
      type: 'SALE',
      bedNumber: paymentSession.currentBedNumber,
      bedType: paymentSession.currentBedType
    };
    
    setSalesLog(prev => [...prev, logData]);
    
    // Update Bed to Paid for Live Monitor
    if (paymentSession.currentBedNumber) {
      const bed = beds.find(b => b.number === paymentSession.currentBedNumber);
      if (bed) {
        updateBedStatus(bed.id, 'In Use'); // In Use but Paid
      }
    }

    console.log('Logging to SALES_LOG (Column C):', logData);
    
    setMiraMessage(t('คุณพี่เจ้าของร้านคะ ลูกค้าชำระเงินเรียบร้อยแล้วค่ะ หนูบันทึกบัญชีภาษีและค่าระบบให้แล้วนะคะ', 'Owner, the payment is complete. I have recorded the tax and system fees.'));
    setShowReceipt(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const closeReceipt = () => {
    if (paymentSession) {
      setStaff(prev => prev.map(s => {
        if (s.therapistId === paymentSession.therapistId) {
          return { 
            ...s, 
            status: 'Available', 
            currentCustomer: undefined, 
            currentService: undefined, 
            currentPrice: undefined,
            currentBedNumber: undefined,
            currentBedType: undefined
          };
        }
        return s;
      }));

      // Reset Bed Status
      if (paymentSession.currentBedNumber) {
        const bed = beds.find(b => b.number === paymentSession.currentBedNumber);
        if (bed) {
          updateBedStatus(bed.id, 'Vacant');
        }
      }
    }
    setPaymentSession(null);
    setShowReceipt(false);
    setPaymentMethod(null);
    setHicapsData({ claim: 0, gap: 0 });
  };

  const toggleBreak = (therapistId: string) => {
    setStaff(prev => prev.map(s => {
      if (s.therapistId === therapistId) {
        if (s.status === 'Working') return s;
        return {
          ...s,
          status: s.status === 'Break' ? 'Available' : 'Break'
        };
      }
      return s;
    }));
  };

  const calculateSummary = () => {
    const totals = {
      Cash: 0,
      Card: 0,
      PayID: 0,
      total: 0,
      gpFee: 0
    };

    salesLog.forEach(sale => {
      if (sale.type === 'VOID') return;
      if (sale.method === 'Cash') totals.Cash += sale.amount;
      if (sale.method === 'Card') totals.Card += sale.amount;
      if (sale.method === 'PayID') totals.PayID += sale.amount;
      totals.total += sale.amount;
    });

    totals.gpFee = (totals.total * settings.gpFeePercent) / 100;
    return totals;
  };

  const calculatePending = () => {
    return staff
      .filter(s => s.status === 'Working' || s.status === 'PaymentPending')
      .reduce((acc, s) => acc + (s.currentPrice || 0), 0);
  };

  const summary = calculateSummary();
  const pendingAmount = calculatePending();

  const handleVoidTransaction = (id: string) => {
    setSalesLog(prev => prev.map(sale => 
      sale.id === id ? { ...sale, type: 'VOID', amount: 0 } : sale
    ));
    setMiraMessage(t('หนูยกเลิกรายการให้แล้วนะคะคุณพี่ ยอดเงินจะถูกหักออกจากการคำนวณทันทีค่ะ', "I've voided the transaction. The amount will be deducted from calculations immediately."));
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, status: 'RESOLVED' } : alert
    ));
    setMiraMessage(t('รับทราบปัญหาแล้วค่ะ หนูจะแจ้งให้พี่ๆ หมอทราบนะคะว่าคุณป้ากำลังจัดการให้ค่ะ', "Issue acknowledged! I'll let the staff know you're handling it."));
  };

  useEffect(() => {
    if (activeTab === 'summary') {
      setMiraMessage(t(`คุณพี่คะ วันนี้หนูสรุปยอดมาให้แล้วค่ะ ยอดรวมคือ $${summary.total.toFixed(2)} สบายใจได้เลยนะคะ`, `Owner, here is today's summary. The total is $${summary.total.toFixed(2)}.`));
    } else if (activeTab === 'overview') {
      setMiraMessage(t('พี่แสนคะ หนูทำระบบ "จดเวลาเป๊ะๆ" ให้แล้วนะ พอพี่กดรับเงิน PayID ปุ๊บ หนูจะแอบจดวินาทีที่เงินเข้าไว้ให้ป้าทันที พี่ไม่ต้องเสียเวลาถ่ายรูปสลิปให้วุ่นวายค่ะ ป้าไปเช็คในแอปแบงค์ตอนไหนก็เจอ เพราะเวลาหนูแก้ไม่ได้ค่ะ!', "Master Admin, I've added the 'Exact Time' system. When you confirm a PayID payment, I'll record the exact second for the owner. No need to take slip photos anymore; the owner can just check their bank app against my recorded time!"));
    } else if (activeTab === 'summary') {
      setMiraMessage(t('คุณป้าคะ หนูสรุปยอดมาให้แล้วค่ะ พร้อมระบบตรวจสอบ PayID แบบใหม่ ป้าเทียบเวลากับแอปธนาคารได้เลยนะคะ ตรงกันเป๊ะแน่นอนค่ะ!', "Owner, here is your summary with the new PayID audit system. You can compare the recorded times with your bank app for perfect accuracy!"));
    } else if (activeTab === 'alerts' && newAlertsCount > 0) {
      setMiraMessage(t('คุณพี่คะ คุณพี่หมอแจ้งว่าของบางอย่างใกล้หมดแล้ว ลองเช็คดูที่หน้าแจ้งเตือนนะคะ', "Owner, the staff reported that some items are running low. Please check the alerts page."));
    }
  }, [activeTab, summary.total, newAlertsCount]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-slate-800 px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-lg rotate-3">
            <TrendingUp size={24} className="md:size-32" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-serif font-bold text-white tracking-tight">{t('ระบบจัดการร้าน / POS Control Center', 'POS Control Center')}</h1>
            <p className="text-slate-500 uppercase tracking-[0.2em] text-[8px] md:text-[10px] font-bold">
              {storeConfig.storeName} • {t('สวัสดีค่ะคุณพี่เจ้าของร้าน', 'Welcome, Owner')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-6 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700 shrink-0">
            <button 
              onClick={() => setIsStaffManagementOpen(true)}
              className="px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
              title={t('จัดการพนักงาน', 'Manage Staff')}
            >
              <Users size={16} />
              ⚙️ {t('จัดการพนักงาน', 'MANAGE STAFF')}
            </button>
            <button 
              onClick={() => setActiveTab('overview')}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeTab === 'overview' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Users size={16} />
              OVERVIEW
            </button>
            {settings.showDailySummary && (
              <button 
                onClick={() => setActiveTab('summary')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                  activeTab === 'summary' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <FileText size={16} />
                SUMMARY
              </button>
            )}
            {settings.showInventoryAlerts && (
              <button 
                onClick={() => setActiveTab('alerts')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative",
                  activeTab === 'alerts' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Bell size={16} />
                ALERTS
                {newAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-800" />
                )}
              </button>
            )}
            {settings.showStaffClockInOut && (
              <button 
                onClick={() => setActiveTab('staff')}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                  activeTab === 'staff' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Clock size={16} />
                STAFF
              </button>
            )}
            <button 
              onClick={() => setActiveTab('security')}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeTab === 'security' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Shield size={16} />
              SECURITY
            </button>
          </div>
          <div className="w-px h-8 bg-slate-800 mx-2" />
          <button 
            onClick={logout}
            className="flex flex-col items-center justify-center px-6 py-3 bg-slate-800 text-slate-300 rounded-2xl font-bold border border-slate-700 hover:bg-slate-700 transition-all shadow-lg"
          >
            <span className="text-[10px] uppercase tracking-widest">Logout</span>
            <span className="text-[10px]">ออกระบบ</span>
          </button>
        </div>
      </header>

      {/* Financial Snapshot Bar */}
      <div className="px-4 md:px-8 py-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap md:flex-nowrap items-center justify-center gap-4 md:gap-12 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <DollarSign size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('สรุปยอดวันนี้ (Collected)', 'Collected')}</span>
            <span className="text-sm font-black text-emerald-400">${summary.total.toFixed(2)}</span>
          </div>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/20">
            <Clock size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('รายรับทั้งหมด (Pending)', 'Pending')}</span>
            <span className="text-sm font-black text-orange-400">${pendingAmount.toFixed(2)}</span>
          </div>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <TrendingUp size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Flow</span>
            <span className="text-sm font-black text-white">${(summary.total + pendingAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>

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
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute inset-0 flex flex-col lg:flex-row overflow-hidden"
            >
        {/* Left Side: Therapists */}
          <div className="w-full lg:w-2/3 p-4 md:p-10 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-800 space-y-6 md:space-y-10 bg-[#0F172A]">
            {/* Bed Management System (Bed Status) */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <LayoutGrid size={20} />
                  </div>
                  <h4 className="text-xl font-serif font-bold text-white">{t('สถานะเตียง / Bed Status', 'Bed Status')}</h4>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <button 
                    onClick={() => setIsQuickAddOpen(true)}
                    className="flex items-center gap-2 px-4 md:px-6 py-2 gold-gradient text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg text-[10px] md:text-xs shrink-0"
                  >
                    <Plus size={14} className="md:size-16" />
                    {t('+ เพิ่มรายการ', 'Add New')}
                  </button>
                  <div className="flex gap-4 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{t('Vacant / ว่าง', 'Vacant')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-400">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>{t('In Use / ไม่ว่าง', 'In Use')}</span>
                  </div>
                </div>
              </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {beds.map(bed => {
                  const assignedStaff = staff.find(s => s.currentBedNumber === bed.number);
                  const onlineBooking = bookings.find(b => b.bedId === bed.id && b.status === 'Reserved');
                  
                  return (
                    <div 
                      key={bed.id}
                      className={cn(
                        "p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden",
                        bed.status === 'Vacant' 
                          ? "bg-slate-900/50 border-slate-800 text-slate-500" 
                          : bed.status === 'Reserved'
                          ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/20"
                          : "bg-slate-800 border-slate-700 text-white shadow-xl"
                      )}
                    >
                      <div className={cn(
                        "absolute top-2 right-2",
                        bed.status === 'Vacant' ? "text-emerald-500/40" : bed.status === 'Reserved' ? "text-primary" : "text-red-500"
                      )}>
                        {bed.status === 'Vacant' ? <PanelLeftOpen size={14} /> : bed.status === 'Reserved' ? <Clock size={14} /> : <PanelLeftClose size={14} />}
                      </div>
                      
                      {/* Status Badge */}
                      {bed.status === 'Reserved' && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white rounded-full text-[6px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm animate-pulse">
                          <Clock size={8} />
                          {t('จองออนไลน์', 'RESERVED')}
                        </div>
                      )}
                      {bed.status === 'In Use' && (
                        <div className={cn(
                          "absolute top-2 left-2 px-2 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm",
                          bed.paymentStatus === 'Paid' ? "bg-emerald-500 text-white" : "bg-orange-500 text-white animate-pulse"
                        )}>
                          <PiggyBank size={8} />
                          {bed.paymentStatus === 'Paid' ? 'PAID' : 'UNPAID'}
                        </div>
                      )}

                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center mb-1",
                        bed.type === 'Foot' ? "bg-blue-500 text-white" : 
                        bed.type === 'Body' ? "bg-amber-500 text-white" : 
                        "bg-purple-500 text-white"
                      )}>
                        <span className="text-lg font-black">{bed.number}</span>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60">
                          {bed.type === 'Foot' ? t('เตียงนวดเท้า', 'Foot Bed') : bed.type === 'Body' ? t('เตียงนวดตัว', 'Body Bed') : t('ห้อง VIP', 'VIP Room')}
                        </p>
                        <p className={cn(
                          "text-[10px] font-bold",
                          bed.status === 'Reserved' ? "text-primary" :
                          bed.status === 'In Use' && (bed.paymentStatus === 'Paid' ? "text-emerald-400" : "text-orange-400")
                        )}>
                          {bed.status === 'Vacant' ? t('ว่าง', 'Vacant') : bed.status === 'Reserved' ? (onlineBooking?.customerName || t('จองแล้ว', 'Reserved')) : (bed.paymentStatus === 'Paid' ? t('จ่ายแล้ว', 'Paid') : t('ยังไม่จ่าย', 'Unpaid'))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-serif font-bold text-white flex items-center gap-4">
                <Users className="text-primary" size={32} />
                {t('รายชื่อคุณพี่หมอ / Therapist Grid', 'Therapist Grid')}
              </h2>
              {staff.some(s => s.status === 'Available') && (
                <p className="text-accent/80 text-sm font-medium italic font-sans">
                  {t(`คุณพี่หมอ ${staff.find(s => s.status === 'Available')?.therapistName} ว่างอยู่ค่ะ รับลูกค้าเพิ่มไหมคะ?`, `Therapist ${staff.find(s => s.status === 'Available')?.therapistName} is available. Add a customer?`)}
                </p>
              )}
            </div>
            {selectedBookingId && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary text-white px-6 py-3 rounded-2xl border border-primary/30 text-xs font-black animate-pulse shadow-xl"
              >
                {t('SELECT THERAPIST / เลือกคุณพี่หมอเลยค่ะ', 'SELECT THERAPIST')}
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {staff.map((s) => (
              <motion.div
                key={s.therapistId}
                layout
                onClick={() => selectedBookingId && s.status === 'Available' && handleAssign(s.therapistId)}
                className={cn(
                  "p-6 rounded-[2rem] border-2 transition-all duration-300 relative overflow-hidden cursor-pointer",
                  s.status === 'Available' ? (selectedBookingId ? "bg-primary/5 border-primary animate-pulse" : "bg-slate-800/50 border-slate-700/50 hover:border-green-500/50") :
                  s.status === 'Working' ? "bg-orange-500/5 border-orange-500/30" :
                  "bg-slate-800/50 border-red-500/20"
                )}
              >
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-slate-700 overflow-hidden border-2 border-slate-600">
                        <img 
                          src={therapists.find(t => t.id === s.therapistId)?.imageUrl} 
                          alt={s.therapistName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-slate-800",
                        s.status === 'Available' ? "bg-green-500" :
                        s.status === 'Working' ? "bg-orange-500" : "bg-red-500"
                      )} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{s.therapistName}</h3>
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

                  {s.currentBedNumber && (
                    <div className={cn(
                      "px-3 py-1 rounded-lg border text-[10px] font-black flex items-center gap-2",
                      s.currentBedType === 'Foot' ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                      s.currentBedType === 'Body' ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                      "bg-purple-500/10 border-purple-500/30 text-purple-400"
                    )}>
                      <LayoutGrid size={12} />
                      {t('BED', 'BED')} {s.currentBedNumber}
                    </div>
                  )}

                  {s.status === 'Working' && s.remainingSeconds && (
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 text-orange-400 font-mono text-xl font-bold">
                        <Timer size={18} />
                        {Math.floor(s.remainingSeconds / 60)}:{(s.remainingSeconds % 60).toString().padStart(2, '0')}
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{t('Timer / เวลาเหลือ', 'Timer')}</p>
                    </div>
                  )}

                  {s.status === 'PaymentPending' && (
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 text-green-400 font-bold text-xl animate-pulse">
                        <DollarSign size={20} />
                        {t('COLLECT', 'COLLECT')}
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">{t('Payment Due', 'Payment Due')}</p>
                    </div>
                  )}
                </div>

                {s.status === 'Working' && (
                  <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{t('Customer / ลูกค้า', 'Customer')}</p>
                    <p className="text-sm font-bold text-slate-200">{s.currentCustomer}</p>
                    <p className="text-[10px] text-accent/80 font-bold mt-1 uppercase">{s.currentService}</p>
                  </div>
                )}

                {s.status === 'PaymentPending' && (
                  <div className="mt-6 p-4 bg-green-500/10 rounded-2xl border border-green-500/30">
                    <p className="text-[10px] text-green-400 uppercase font-bold">Session Finished</p>
                    <p className="text-sm font-bold text-slate-200">{s.currentCustomer}</p>
                    <p className="text-sm font-bold text-accent">${s.currentPrice}</p>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  {s.status === 'Working' ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setStaff(prev => prev.map(st => st.therapistId === s.therapistId ? { ...st, status: 'PaymentPending', remainingSeconds: undefined } : st));
                      }}
                      className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-600 transition-all"
                    >
                      {t('จบงาน / Finish', 'Finish')}
                    </button>
                  ) : s.status === 'PaymentPending' ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentSession(s);
                      }}
                      className="flex-1 py-4 bg-green-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all"
                    >
                      {t('จ่ายเงิน / Pay', 'Pay')}
                    </button>
                  ) : (
                    <button 
                      disabled={s.status === 'Working'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBreak(s.therapistId);
                      }}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all",
                        s.status === 'Break' 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20" 
                          : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-30"
                      )}
                    >
                      {s.status === 'Break' ? t('จบพัก / End Break', 'End Break') : t('พักเบรก / Set Break', 'Set Break')}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Waiting List */}
        <div className="w-full lg:w-1/3 bg-slate-900/30 p-4 md:p-10 overflow-y-auto space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white flex items-center gap-4">
                <Clock className="text-accent md:size-32" size={24} />
                {t('คิวลูกค้า / Waiting List', 'Waiting List')}
              </h2>
              <p className="text-slate-500 text-sm font-medium font-sans">{t(`สวัสดีค่ะคุณพี่ วันนี้มีคิวรออยู่ ${queue.length} คิวค่ะ`, `Welcome! You have ${queue.length} customers waiting today.`)}</p>
            </div>
            <span className="bg-slate-800 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700">
              {queue.length} Pending
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {queue.map((q) => {
                const isSelected = selectedBookingId === q.id;
                const gpFee = (q.price * settings.gpFeePercent) / 100;
                const netToShop = q.price - gpFee;

                return (
                  <motion.div
                    key={q.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedBookingId(isSelected ? null : q.id)}
                    className={cn(
                      "p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer group",
                      isSelected 
                        ? "bg-accent/10 border-accent shadow-lg shadow-accent/10" 
                        : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{q.customerName}</h4>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{q.serviceName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">${q.price}</p>
                        <p className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">{q.durationMins} MINS</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700/30 mb-4">
                      <div>
                        <p className="text-[8px] text-slate-500 uppercase font-bold">GP Fee</p>
                        <p className="text-xs font-bold text-red-400/70">-${gpFee.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-500 uppercase font-bold">Net</p>
                        <p className="text-xs font-bold text-green-400">${netToShop.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className={cn(
                      "w-full py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                      isSelected ? "bg-accent text-white" : "bg-slate-700 text-slate-300 group-hover:bg-slate-600"
                    )}>
                      {isSelected ? t("Select Therapist Left", "Select Therapist Left") : t("Click to Assign", "Click to Assign")}
                      <ChevronRight size={14} className={cn("transition-transform", isSelected && "rotate-180")} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {queue.length === 0 && (
              <div className="text-center py-20 bg-slate-800/20 rounded-[2rem] border-2 border-dashed border-slate-800">
                <CheckCircle className="mx-auto text-slate-800 mb-4" size={48} />
                <p className="text-slate-600 font-serif italic">Queue is currently clear</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
          )}

          {/* Summary Tab */}
          {settings.showDailySummary && activeTab === 'summary' && (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 p-10 overflow-y-auto bg-[#0F172A]"
            >
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20 shadow-2xl rotate-3">
                    <TrendingUp size={40} />
                  </div>
                  <h3 className="text-4xl font-serif font-bold text-white">รายงานสรุปยอดรายวัน</h3>
                  <p className="text-slate-500 uppercase tracking-[0.3em] text-xs font-bold">Daily Performance Summary</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <Banknote size={24} />
                      <span className="text-xs font-black uppercase tracking-widest">{t('ยอดเงินสด', 'Cash Total')}</span>
                    </div>
                    <p className="text-4xl font-black text-white">${summary.Cash.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center gap-3 text-blue-400">
                      <CreditCard size={24} />
                      <span className="text-xs font-black uppercase tracking-widest">{t('ยอดบัตร', 'Card Total')}</span>
                    </div>
                    <p className="text-4xl font-black text-white">${summary.Card.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center gap-3 text-indigo-400">
                      <Wallet size={24} />
                      <span className="text-xs font-black uppercase tracking-widest">{t('ยอด PayID', 'PayID Total')}</span>
                    </div>
                    <p className="text-4xl font-black text-white">${summary.PayID.toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-500/10 p-10 rounded-[3rem] border border-indigo-500/20 shadow-2xl flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">{t('รายรับรวม', 'Gross Revenue')}</p>
                      <h4 className="text-5xl font-black text-white">${summary.total.toFixed(2)}</h4>
                    </div>
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400">
                      <TrendingUp size={32} />
                    </div>
                  </div>
                      <div className="bg-primary/10 p-10 rounded-[3rem] border border-primary/20 shadow-2xl flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">{t('ค่าดูแลระบบ', 'System GP Fee')} ({settings.gpFeePercent}%)</p>
                          <h4 className="text-5xl font-black text-white">${summary.gpFee.toFixed(2)}</h4>
                        </div>
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-primary">
                          <DollarSign size={32} />
                        </div>
                      </div>
                </div>

                {/* PayID Audit Note */}
                <div className="bg-indigo-500/5 border border-indigo-500/20 p-8 rounded-[2.5rem] flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white shadow-lg">
                    <Clock size={24} />
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-lg font-bold text-white">ระบบตรวจสอบ PayID อัตโนมัติ (Auto-Audit)</h5>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {t('คุณป้าคะ หนูจดเวลาที่เงินเข้าแบบเป๊ะๆ (วินาที) ไว้ให้แล้วนะคะ ป้าสามารถเปิดแอปธนาคารแล้วเทียบยอดเงินเข้ากับเวลาที่หนูจดไว้ได้เลยค่ะ ข้อมูลนี้ระบบจดเอง พี่ๆ เมเนเจอร์แก้ไขไม่ได้ค่ะ สบายใจได้เลย!', 'Owner, I have recorded the exact time (including seconds) for every PayID transaction. You can compare your bank statement with my recorded time to verify payments. This data is system-generated and cannot be edited by managers!')}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/30 p-10 rounded-[3rem] border border-slate-800">
                  <h4 className="text-xl font-serif font-bold text-white mb-6">Recent Transactions (Admin Control)</h4>
                  <div className="space-y-4">
                    {salesLog.slice(-10).reverse().map((sale, i) => (
                      <div key={i} className={cn(
                        "flex justify-between items-center p-4 rounded-2xl border transition-all",
                        sale.type === 'VOID' ? "bg-red-500/5 border-red-500/20 opacity-50" : "bg-slate-800/30 border-slate-700/30"
                      )}>
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            sale.type === 'VOID' ? "bg-slate-700 text-slate-500" : "bg-slate-700 text-slate-400"
                          )}>
                            {sale.method === 'Cash' ? <Banknote size={18} /> : sale.method === 'Card' ? <CreditCard size={18} /> : <Wallet size={18} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-white">{sale.customer} - {sale.service}</p>
                              {sale.type === 'VOID' && <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">VOIDED</span>}
                            </div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                              {new Date(sale.timestamp).toLocaleTimeString()} {sale.transactionTimestamp && <span className="text-primary font-black ml-1">({sale.transactionTimestamp})</span>} • Bed {sale.bedNumber} • {sale.therapist}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <p className={cn(
                            "text-lg font-black",
                            sale.type === 'VOID' ? "text-slate-500 line-through" : "text-white"
                          )}>${sale.amount.toFixed(2)}</p>
                          
                          {sale.type !== 'VOID' && (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleVoidTransaction(sale.id)}
                                className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                                title="Void Transaction"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Alerts Tab */}
          {settings.showInventoryAlerts && activeTab === 'alerts' && (
            <motion.div 
              key="alerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 p-10 overflow-y-auto bg-[#0F172A]"
            >
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-4xl font-serif font-bold text-white flex items-center gap-4">
                      <Bell className="text-primary" size={40} />
                      การแจ้งเตือน / Alerts
                    </h3>
                    <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">รายการปัญหาที่คุณพี่หมอแจ้งเข้ามานะคะ</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {alerts.filter(a => a.status === 'NEW').length > 0 ? (
                    alerts.filter(a => a.status === 'NEW').map((alert) => (
                      <div 
                        key={alert.id}
                        className={cn(
                          "p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
                          alert.status === 'NEW' ? "bg-amber-500/5 border-amber-500/30 shadow-xl" : "bg-slate-800/50 border-slate-700/50"
                        )}
                      >
                        <div className="flex gap-4 md:gap-6 items-center">
                          <div className={cn(
                            "w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] flex items-center justify-center shadow-lg border",
                            alert.status === 'NEW' ? "bg-amber-500 text-white border-amber-400" : "bg-slate-800 text-slate-500 border-slate-700"
                          )}>
                            <AlertTriangle size={24} className="md:size-32" />
                          </div>
                          <div>
                            <p className="text-lg md:text-2xl font-bold text-white">{alert.issue}</p>
                            <p className="text-[10px] md:text-sm text-slate-500 font-medium">แจ้งโดย: {alert.therapistName} • {new Date(alert.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        {alert.status === 'NEW' && (
                          <button 
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-emerald-500 text-white text-[10px] md:text-xs font-black rounded-xl md:rounded-2xl hover:opacity-90 transition-all uppercase tracking-[0.2em] shadow-lg"
                          >
                            รับทราบ / Acknowledge
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-32 space-y-6">
                      <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto text-slate-700 border border-slate-800">
                        <CheckCircle size={48} />
                      </div>
                      <p className="text-slate-500 text-xl font-medium italic">ไม่มีการแจ้งเตือนใหม่ค่ะ</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Staff Attendance Tab */}
          {settings.showStaffClockInOut && activeTab === 'staff' && (
            <motion.div 
              key="staff"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 p-10 overflow-y-auto bg-[#0F172A]"
            >
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-4xl font-serif font-bold text-white flex items-center gap-4">
                      <Clock className="text-accent" size={40} />
                      ลงชื่อเข้า-ออกงาน / Staff Attendance
                    </h3>
                    <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">ตรวจสอบเวลาเข้างานของคุณพี่หมอนะคะ</p>
                  </div>
                  <button 
                    onClick={generatePayrollReport}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    <FileText size={20} />
                    <span>Weekly Payroll Report / สรุปชั่วโมงทำงาน</span>
                  </button>
                </div>

                <div className="bg-slate-900/30 rounded-[3rem] border border-slate-800 overflow-hidden">
                  <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                    <h4 className="text-xl font-serif font-bold text-white">Attendance Summary</h4>
                    <p className="text-xs text-slate-500">Daily attendance and hours summary</p>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-800/50 border-b border-slate-800">
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Time In</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Time Out</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {(() => {
                        const summary: any[] = [];
                        const grouped = attendanceLogs.reduce((acc: any, log) => {
                          const date = log.timestamp.split('T')[0];
                          const key = `${date}_${log.therapistId}`;
                          if (!acc[key]) acc[key] = { date, name: log.therapistName, in: null, out: null };
                          if (log.type === 'CLOCK_IN') acc[key].in = log.timestamp;
                          if (log.type === 'CLOCK_OUT') acc[key].out = log.timestamp;
                          return acc;
                        }, {});

                        Object.values(grouped).forEach((entry: any) => {
                          let hours = '0.0';
                          if (entry.in && entry.out) {
                            const diff = new Date(entry.out).getTime() - new Date(entry.in).getTime();
                            hours = (diff / (1000 * 60 * 60)).toFixed(1);
                          }
                          summary.push({ ...entry, hours });
                        });

                        return summary.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-8 py-6 text-slate-400 font-mono text-xs">{row.date}</td>
                            <td className="px-8 py-6 font-bold text-white">{row.name}</td>
                            <td className="px-8 py-6 text-emerald-400 text-xs">
                              {row.in ? new Date(row.in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                            </td>
                            <td className="px-8 py-6 text-orange-400 text-xs">
                              {row.out ? new Date(row.out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                            </td>
                            <td className="px-8 py-6 text-right font-mono font-bold text-accent">{row.hours} hrs</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-900/30 rounded-[3rem] border border-slate-800 overflow-hidden">
                  <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                    <h4 className="text-xl font-serif font-bold text-white">Therapist Management</h4>
                    <p className="text-xs text-slate-500">Manage provider numbers and staff information</p>
                  </div>
                  <div className="overflow-x-auto no-scrollbar -mx-4 md:mx-0">
                    <table className="w-full text-left min-w-[800px] md:min-w-0">
                    <thead>
                      <tr className="bg-slate-800/50 border-b border-slate-800">
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Therapist</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Provider Number</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Insurance Expiry</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Daily Guarantee</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {staff.map((s, i) => {
                        const insStatus = getInsuranceStatus(s.insuranceExpiry);
                        return (
                          <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-700 overflow-hidden">
                                  <img 
                                    src={therapists.find(t => t.id === s.therapistId)?.imageUrl} 
                                    alt={s.therapistName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-white">{s.therapistName}</span>
                                  {insStatus.status !== 'valid' && (
                                    <span className={cn(
                                      "text-[8px] font-black uppercase tracking-widest flex items-center gap-1",
                                      insStatus.status === 'expired' ? "text-red-500" : "text-amber-500"
                                    )}>
                                      <AlertCircle size={8} />
                                      {insStatus.message}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <input 
                                type="text"
                                value={s.providerNumber || ''}
                                onChange={(e) => {
                                  setStaff(prev => prev.map(st => st.therapistId === s.therapistId ? { ...st, providerNumber: e.target.value } : st));
                                }}
                                placeholder="Enter Provider No."
                                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-primary outline-none"
                              />
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="date"
                                  value={s.insuranceExpiry || ''}
                                  onChange={(e) => {
                                    setStaff(prev => prev.map(st => st.therapistId === s.therapistId ? { ...st, insuranceExpiry: e.target.value } : st));
                                  }}
                                  className={cn(
                                    "bg-slate-900 border rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-primary outline-none",
                                    insStatus.status === 'expired' ? "border-red-500/50 text-red-400" : 
                                    insStatus.status === 'warning' ? "border-amber-500/50 text-amber-400" : "border-slate-700"
                                  )}
                                />
                                {insStatus.status === 'expired' && <AlertCircle size={16} className="text-red-500 animate-pulse" />}
                                {insStatus.status === 'warning' && <AlertTriangle size={16} className="text-amber-500" />}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500 text-xs">$</span>
                                <input 
                                  type="number"
                                  value={s.dailyGuarantee || 120}
                                  onChange={(e) => {
                                    setStaff(prev => prev.map(st => st.therapistId === s.therapistId ? { ...st, dailyGuarantee: Number(e.target.value) } : st));
                                  }}
                                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-primary outline-none"
                                />
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <button 
                                onClick={() => setEditingStaff(s)}
                                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-all"
                              >
                                <Edit3 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

                <div className="bg-slate-900/30 rounded-[3rem] border border-slate-800 overflow-hidden">
                  <div className="p-8 border-b border-slate-800">
                    <h4 className="text-xl font-serif font-bold text-white">Attendance Log</h4>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-800/50 border-b border-slate-800">
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Therapist</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {attendanceLogs.slice().reverse().map((entry, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-8 py-6 font-bold text-white">{entry.therapistName}</td>
                          <td className="px-8 py-6 text-slate-400">
                            {new Date(entry.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-8 py-6">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                              entry.type === 'CLOCK_IN' ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                            )}>
                              {entry.type === 'CLOCK_IN' ? 'IN' : 'OUT'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div 
              key="security"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 p-10 overflow-y-auto bg-[#0F172A]"
            >
              <div className="max-w-2xl mx-auto space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                    <Shield size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-white tracking-tight">
                      {t('ตั้งค่าความปลอดภัย / Security Settings', 'Security Settings')}
                    </h2>
                    <p className="text-slate-500 uppercase tracking-widest text-xs font-bold mt-1">
                      {t('จัดการรหัสผ่านเข้าถึงระบบของคุณป้าค่ะ', 'Manage your system access PINs')}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-10 space-y-8">
                   {/* PIN Change Form */}
                   <div className="space-y-6">
                      <h3 className="text-xl font-serif font-bold text-white flex items-center gap-3">
                        <Lock size={20} className="text-accent" />
                        {t('เปลี่ยนระหัสเข้าเครื่อง / Change Owner PIN', 'Change Owner PIN')}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            {t('รหัสผ่านปัจจุบัน', 'Current PIN')}
                          </label>
                          <input 
                            type="password"
                            maxLength={4}
                            value={pinForm.currentPin}
                            onChange={(e) => setPinForm({...pinForm, currentPin: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-accent/20 outline-none font-mono text-2xl tracking-[0.5em]"
                            placeholder="****"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            {t('รหัสผ่านใหม่ (4 หลัก)', 'New PIN (4 Digits)')}
                          </label>
                          <input 
                            type="password"
                            maxLength={4}
                            value={pinForm.newPin}
                            onChange={(e) => setPinForm({...pinForm, newPin: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-accent/20 outline-none font-mono text-2xl tracking-[0.5em]"
                            placeholder="****"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={handleUpdatePin}
                        className="w-full py-5 gold-gradient text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        {t('บันทึกรหัสใหม่ / Save New PIN', 'Save New PIN')}
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Staff Management Modal */}
      <AnimatePresence>
        {isStaffManagementOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStaffManagementOpen(false)}
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
                      {t('จัดการพนักงาน / Staff Management', 'Staff Management')}
                    </h3>
                    <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl mt-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">M</div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {t('คุณป้าคะ ถ้ามีหมอใหม่เข้าทำงาน หรือจะปรับเรทค่าคอมมิชชั่น ให้ป้ามากดปุ่ม "⚙️ จัดการพนักงาน" ตรงนี้นะคะ ข้อมูลจะถูกแยกเก็บไว้เป็นความลับ ไม่ปนกับหน้าดูคิวของเมเนเจอร์ค่ะ!', 'Owner, if there\'s a new therapist or you want to adjust commission rates, use this "Manage Staff" button. This information is kept private and separate from the manager\'s view!')}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setIsStaffManagementOpen(false)} className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <X size={28} />
                  </button>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={() => {
                      setIsAddingNewStaff(true);
                      setEditingStaff({
                        therapistId: `t${Date.now()}`,
                        therapistName: '',
                        status: 'Available',
                        gender: 'Female',
                        pin: '',
                        providerNumber: '',
                        insuranceExpiry: '',
                        dailyGuarantee: 120,
                        commissionRate: 0.5
                      });
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    <Plus size={18} />
                    {t('+ เพิ่มพนักงานใหม่', 'Add New Staff')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {staff.map((s) => (
                    <div 
                      key={s.therapistId}
                      className="p-6 rounded-[2rem] bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden border border-slate-600">
                          <img 
                            src={therapists.find(t => t.id === s.therapistId)?.imageUrl || 'https://picsum.photos/seed/staff/200/200'} 
                            alt={s.therapistName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{s.therapistName}</h4>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">PIN: {s.pin || '****'}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500">{t('ประกันมือ', 'Guarantee')}:</span>
                          <span className="text-slate-300 font-bold">${s.dailyGuarantee}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500">{t('ค่ามือ', 'Commission')}:</span>
                          <span className="text-slate-300 font-bold">{(s.commissionRate || 0.5) * 100}%</span>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-2">
                        <button 
                          onClick={() => {
                            setIsAddingNewStaff(false);
                            setEditingStaff(s);
                          }}
                          className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                        >
                          <Edit3 size={14} />
                          {t('แก้ไข / Edit', 'Edit')}
                        </button>
                        <button 
                          onClick={() => handleDeleteStaff(s.therapistId)}
                          className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20"
                          title={t('ลบพนักงาน', 'Delete Staff')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit/Add Staff Modal */}
      <AnimatePresence>
        {editingStaff && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setEditingStaff(null);
                setIsAddingNewStaff(false);
              }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 rounded-[3rem] border border-slate-700 shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-serif font-bold text-white">
                    {isAddingNewStaff ? t('เพิ่มพนักงานใหม่ / Add New Staff', 'Add New Staff') : t('แก้ไขข้อมูล / Edit Staff', 'Edit Staff')}
                  </h3>
                  <button onClick={() => {
                    setEditingStaff(null);
                    setIsAddingNewStaff(false);
                  }} className="text-slate-400 hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Gender / เพศ</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'Male', label: '👨 Male / ชาย' },
                        { value: 'Female', label: '👩 Female / หญิง' },
                        { value: 'Other', label: '⚧️ Other / อื่นๆ' }
                      ].map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => setEditingStaff({ ...editingStaff, gender: g.value as Gender })}
                          className={cn(
                            "flex-1 py-3 rounded-xl border-2 text-[10px] font-bold transition-all",
                            editingStaff.gender === g.value 
                              ? "bg-primary/20 border-primary text-white" 
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                          )}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 italic mt-2">
                      💡 {t('พี่แสนคะ... ถ้าไม่อยากใช้ชื่อจริง สามารถใส่เป็น "Therapist 1" แล้วใช้ไอคอนเพศช่วยแยกได้นะคะ', 'P\'Saen... If you don\'t want to use real names, you can use "Therapist 1" and use gender icons to distinguish.')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Name & Nickname</label>
                    <input 
                      type="text"
                      value={editingStaff.therapistName}
                      onChange={(e) => setEditingStaff({ ...editingStaff, therapistName: e.target.value })}
                      placeholder="e.g. พี่นก (Nok)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">4-Digit PIN (for login)</label>
                    <input 
                      type="text"
                      maxLength={4}
                      value={editingStaff.pin || ''}
                      onChange={(e) => setEditingStaff({ ...editingStaff, pin: e.target.value.replace(/\D/g, '') })}
                      placeholder="1234"
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Provider Number (for HICAPS)</label>
                    <input 
                      type="text"
                      value={editingStaff.providerNumber || ''}
                      onChange={(e) => setEditingStaff({ ...editingStaff, providerNumber: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Insurance Expiry Date</label>
                    <input 
                      type="date"
                      value={editingStaff.insuranceExpiry || ''}
                      onChange={(e) => setEditingStaff({ ...editingStaff, insuranceExpiry: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Daily Guarantee ($)</label>
                    <input 
                      type="number"
                      value={editingStaff.dailyGuarantee || 120}
                      onChange={(e) => setEditingStaff({ ...editingStaff, dailyGuarantee: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Commission Rate (%)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number"
                        value={(editingStaff.commissionRate || 0.5) * 100}
                        onChange={(e) => setEditingStaff({ ...editingStaff, commissionRate: Number(e.target.value) / 100 })}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-primary font-mono"
                      />
                      <span className="text-slate-500 font-bold">%</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (isAddingNewStaff) {
                      setStaff(prev => [...prev, editingStaff]);
                      console.log('SYNCING NEW STAFF TO STAFF_SHEET:', editingStaff);
                    } else {
                      setStaff(prev => prev.map(s => s.therapistId === editingStaff.therapistId ? editingStaff : s));
                      console.log('SYNCING EDITED STAFF TO STAFF_SHEET:', editingStaff);
                    }
                    setEditingStaff(null);
                    setIsAddingNewStaff(false);
                    setMiraMessage(isAddingNewStaff ? t('เพิ่มพนักงานใหม่เรียบร้อยแล้วค่ะ', 'New staff added successfully.') : t('อัปเดตข้อมูลพี่หมอเรียบร้อยแล้วค่ะ', 'Staff information updated successfully.'));
                  }}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
                >
                  {isAddingNewStaff ? t('Add Staff / เพิ่มพนักงาน', 'Add Staff') : t('Save Changes / บันทึก', 'Save Changes')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payroll Report Modal */}
      <AnimatePresence>
        {showPayrollReport && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayrollReport(false)}
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
                      <FileText className="text-primary" size={28} />
                      {t('สรุปชั่วโมงทำงานรายสัปดาห์', 'Weekly Payroll Report')}
                    </h3>
                    <p className="text-slate-500 text-sm">{t('สรุปยอดวันและชั่วโมงทำงานของพี่ๆ หมอค่ะ', 'Summary of working days and hours.')}</p>
                  </div>
                  <button onClick={() => setShowPayrollReport(false)} className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-800 border-b border-slate-700">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('ชื่อพนักงาน', 'Staff Name')}</th>
                        <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{t('จำนวนวัน', 'Days')}</th>
                        <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">{t('ยอดนวด', 'Service Amt')}</th>
                        <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{t('ค่ามือ %', 'Comm %')}</th>
                        <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">{t('รายได้', 'Earned')}</th>
                        <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{t('สถานะ', 'Status')}</th>
                        <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">{t('ประกันมือ', 'Top-up')}</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">{t('ยอดจ่ายสุทธิ', 'Total Pay')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {payrollData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">{row.name}</td>
                          <td className="px-4 py-4 text-center text-slate-300 font-mono text-xs">{row.daysWorked}</td>
                          <td className="px-4 py-4 text-right text-slate-300 font-mono text-xs">${row.totalServiceAmount.toFixed(2)}</td>
                          <td className="px-4 py-4 text-center text-slate-300 font-mono text-xs">{(row.commissionRate * 100).toFixed(0)}%</td>
                          <td className="px-4 py-4 text-right font-mono text-xs text-slate-300">${row.totalCommission.toFixed(2)}</td>
                          <td className="px-4 py-4 text-center">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                              row.guaranteeStatus === 'Met' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                            )}>
                              {row.guaranteeStatus}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right font-mono text-xs text-amber-400">${row.topUpAmount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-primary">${row.grandTotalToPay.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      window.print();
                      setMiraMessage(t('กำลังเตรียมพิมพ์รายงานให้คุณพี่นะคะ', 'Preparing to print the report for you.'));
                    }}
                    className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <FileText size={18} />
                    Export / Print
                  </button>
                  <button 
                    onClick={() => setShowPayrollReport(false)}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
                  >
                    Close / ปิด
                  </button>
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
                    <h3 className="text-3xl font-serif font-bold text-white">Quick Add / เพิ่มลูกค้าด่วน</h3>
                    <p className="text-slate-500 text-sm">ใส่ข้อมูลลูกค้าเพื่อเริ่มคิวใหม่นะคะ</p>
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
                    <AnimatePresence>
                      {formError && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-red-400 text-xs font-medium"
                        >
                          {formError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Select Service</label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
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

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Assign Therapist</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewWalkIn(prev => ({ ...prev, therapistId: 'none', bedId: undefined }))}
                        className={cn(
                          "p-4 rounded-xl border-2 text-center transition-all font-bold text-xs",
                          newWalkIn.therapistId === 'none' 
                            ? "bg-slate-700 border-slate-500 text-white" 
                            : "bg-slate-800 border-slate-700 text-slate-500"
                        )}
                      >
                        QUEUE ONLY
                      </button>
                      {staff.filter(s => s.status === 'Available').map(s => (
                        <button
                          key={s.therapistId}
                          type="button"
                          onClick={() => setNewWalkIn(prev => ({ ...prev, therapistId: s.therapistId }))}
                          className={cn(
                            "p-4 rounded-xl border-2 text-center transition-all font-bold text-xs",
                            newWalkIn.therapistId === s.therapistId 
                              ? "bg-green-500/20 border-green-500 text-white" 
                              : "bg-slate-800 border-slate-700 text-slate-500"
                          )}
                        >
                          {s.therapistName}
                        </button>
                      ))}
                    </div>
                  </div>

                  {newWalkIn.therapistId !== 'none' && (
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Select Bed / เลือกเตียง</label>
                      <div className="grid grid-cols-3 gap-2">
                        {beds.map(bed => (
                          <button
                            key={bed.id}
                            type="button"
                            disabled={bed.status === 'In Use'}
                            onClick={() => setNewWalkIn(prev => ({ ...prev, bedId: bed.id }))}
                            className={cn(
                              "p-3 rounded-xl border-2 text-center transition-all text-[10px] font-bold",
                              bed.status === 'In Use' ? "bg-slate-950/50 border-slate-800 opacity-40 cursor-not-allowed" :
                              newWalkIn.bedId === bed.id ? "bg-primary/20 border-primary text-white" : "bg-slate-800 border-slate-700 text-slate-500"
                            )}
                          >
                            Bed {bed.number}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-6 gold-gradient text-white rounded-2xl font-bold text-xl shadow-2xl hover:opacity-90 transition-opacity uppercase tracking-[0.2em]"
                  >
                    ยืนยัน / Confirm
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Bed Modal */}
      <AnimatePresence>
        {isAssigningBed && assigningData && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssigningBed(false)}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-slate-900 rounded-[3.5rem] border border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-12 space-y-10">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary border border-primary/20 shadow-lg">
                    <LayoutGrid size={40} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-4xl font-serif font-bold text-white">เลือกเตียง / Select Bed</h2>
                    <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">กรุณาเลือกเตียงที่ว่างสำหรับงานนี้นะคะ</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {beds.map(bed => (
                    <button
                      key={bed.id}
                      disabled={bed.status === 'In Use'}
                      onClick={() => confirmAssignment(bed.id)}
                      className={cn(
                        "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-3 relative group",
                        bed.status === 'In Use' 
                          ? "bg-slate-950/50 border-slate-800 opacity-40 cursor-not-allowed" 
                          : "bg-slate-800 border-slate-700 hover:border-primary hover:bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black",
                        bed.type === 'Foot' ? "bg-blue-500/20 text-blue-400" : 
                        bed.type === 'Body' ? "bg-amber-500/20 text-amber-400" : 
                        "bg-purple-500/20 text-purple-400"
                      )}>
                        {bed.number}
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
                          {bed.type} Bed
                        </p>
                        <p className="text-[8px] font-bold text-slate-500">
                          {bed.status === 'Vacant' ? 'Available' : 'Occupied'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setIsAssigningBed(false)}
                  className="w-full py-4 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-300 transition-colors"
                >
                  Cancel / ยกเลิก
                </button>
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
                  <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto text-green-500 border border-green-500/20 shadow-lg rotate-3">
                    <DollarSign size={40} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-4xl font-serif font-bold text-white">สรุปยอดชำระเงิน</h2>
                    <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Payment Summary</p>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-[2.5rem] p-8 border border-slate-700/50 space-y-6">
                  <div className="flex justify-between items-center pb-6 border-b border-slate-700">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">ลูกค้า / Customer</p>
                      <p className="text-2xl font-bold text-white font-sans">{paymentSession.currentCustomer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">คุณพี่หมอ / Therapist</p>
                      <p className="text-xl font-bold text-slate-300 font-sans">{paymentSession.therapistName}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">บริการ / Service</p>
                      <p className="text-xl font-medium text-primary font-sans">{paymentSession.currentService}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">ยอดรวม (Inc. GST) / Total</p>
                      <p className="text-4xl font-black text-white font-sans">${paymentSession.currentPrice}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-center text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] font-sans">เลือกวิธีชำระเงิน / Select Payment Method</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => processPayment('Cash')}
                      className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-800 rounded-3xl border-2 border-slate-700 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <Banknote size={24} className="text-slate-400 group-hover:text-primary" />
                      <span className="font-bold text-white text-sm">เงินสด / CASH</span>
                    </button>
                    <button 
                      onClick={() => processPayment('Card')}
                      className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-800 rounded-3xl border-2 border-slate-700 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <CreditCard size={24} className="text-slate-400 group-hover:text-primary" />
                      <span className="font-bold text-white text-sm">บัตร / CARD</span>
                    </button>
                    <button 
                      onClick={() => processPayment('PayID')}
                      className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-800 rounded-3xl border-2 border-slate-700 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <Wallet size={24} className="text-slate-400 group-hover:text-primary" />
                      <span className="font-bold text-white text-sm">เพย์ไอดี / PAYID</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('HICAPS')}
                      className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-800 rounded-3xl border-2 border-slate-700 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <Receipt size={24} className="text-slate-400 group-hover:text-primary" />
                      <span className="font-bold text-white text-sm">HICAPS</span>
                    </button>
                  </div>

                  {paymentMethod === 'HICAPS' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-slate-800/80 p-6 rounded-3xl border border-primary/30 space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Insurance Claim</label>
                          <input 
                            type="number"
                            value={hicapsData.claim}
                            onChange={(e) => setHicapsData(prev => ({ ...prev, claim: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Gap Payment</label>
                          <input 
                            type="number"
                            value={hicapsData.gap}
                            onChange={(e) => setHicapsData(prev => ({ ...prev, gap: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => processPayment('HICAPS')}
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest shadow-lg"
                      >
                        Confirm HICAPS
                      </button>
                    </motion.div>
                  )}
                </div>

                <button 
                  onClick={() => setPaymentSession(null)}
                  className="w-full py-4 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-300 transition-colors"
                >
                  Cancel / ยกเลิก
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payroll Report Modal */}
      <AnimatePresence>
        {showPayrollReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayrollReport(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 rounded-[3rem] border border-slate-700 shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-serif font-bold text-white">Weekly Payroll Report</h3>
                    <p className="text-slate-500 text-sm">สรุปชั่วโมงทำงานรายสัปดาห์</p>
                  </div>
                  <button onClick={() => setShowPayrollReport(false)} className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <X size={28} />
                  </button>
                </div>

                <div className="bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-800 border-b border-slate-700">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Staff Name</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Days Worked</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {payrollData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">{row.name}</td>
                          <td className="px-6 py-4 text-center text-slate-300">{row.daysWorked}</td>
                          <td className="px-6 py-4 text-right text-primary font-mono font-bold">{row.totalHours} hrs</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      window.print();
                      setMiraMessage(t('หนูเตรียมไฟล์สรุปให้แล้วนะคะ คุณป้าสามารถสั่งพิมพ์หรือบันทึกเป็น PDF ได้เลยค่ะ', "I've prepared the summary file. You can print it or save it as a PDF now."));
                    }}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <FileText size={18} />
                    Export to PDF / Print
                  </button>
                  <button 
                    onClick={() => {
                      setMiraMessage(t('ส่งข้อมูลสรุปเข้า Line ให้คุณป้าเรียบร้อยแล้วนะคะ!', "The summary has been sent to your Line!"));
                    }}
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                  >
                    <TrendingUp size={18} />
                    Send to Line
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

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handlePrint}
                    className="py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Receipt size={18} />
                    Print
                  </button>
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
        )}
      </AnimatePresence>

      {/* Print-only Receipt (Hidden from UI) */}
      <div className="hidden print-only bg-white text-black p-4 font-mono text-[12px] receipt-80mm">
        <div className="text-center border-b border-black pb-2 mb-2">
          <p className="font-bold text-lg uppercase">{storeConfig.storeName}</p>
          <p>Sydney, Australia</p>
          <p>ABN: {settings.storeId || '12 345 678 910'}</p>
          <p className="mt-2 font-bold text-sm">TAX INVOICE</p>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{paymentSession?.currentCustomer}</span>
          </div>
          <div className="flex justify-between">
            <span>Therapist:</span>
            <span>{paymentSession?.therapistName}</span>
          </div>
          {paymentSession?.providerNumber && (
            <div className="flex justify-between font-bold">
              <span>Provider No:</span>
              <span>{paymentSession.providerNumber}</span>
            </div>
          )}
        </div>
        
        <div className="border-t border-black pt-2 mt-2">
          <div className="flex justify-between font-bold">
            <span>{paymentSession?.currentService}</span>
            <span>${paymentSession?.currentPrice?.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-black pt-2 mt-2 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${((paymentSession?.currentPrice || 0) / 1.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (10%):</span>
            <span>{((paymentSession?.currentPrice || 0) / 11).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black pt-1 border-t border-black text-sm">
            <span>TOTAL:</span>
            <span>${paymentSession?.currentPrice?.toFixed(2)}</span>
          </div>
        </div>

        {paymentMethod === 'HICAPS' && (
          <div className="border border-black p-2 mt-2 space-y-1">
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

        <div className="text-center pt-4 border-t border-black mt-4">
          <p>Payment Method: {paymentMethod}</p>
          <p className="mt-4 italic">Thank you for visiting us!</p>
        </div>
      </div>
      {/* QR Code Modal */}
    </div>
  );
}
