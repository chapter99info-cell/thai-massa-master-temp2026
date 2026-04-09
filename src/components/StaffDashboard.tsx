import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock as LockIcon, Play, CheckCircle, Clock, User, DollarSign, LogOut, RefreshCw, Heart, X, AlertTriangle, LogIn, ChevronDown } from 'lucide-react';
import { storeConfig, getAppSettings } from '../config';
import { StaffSession, AttendanceEntry, AlertEntry } from '../types';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { therapists } from '../data/therapists';
import { fetchWithRetry } from '../lib/apiUtils';
import LoadingOverlay from './LoadingOverlay';

import { usePin } from '../contexts/PinContext';

// Mock initial data for the dashboard
const INITIAL_SESSIONS: StaffSession[] = [
  { id: 's1', customerName: 'John Smith', serviceName: 'Traditional Thai Massage', durationMins: 60, therapistName: 'Nok', price: 95, status: 'pending', bedNumber: '1', bedType: 'Foot' },
  { id: 's2', customerName: 'Sarah Wilson', serviceName: 'Aromatherapy Oil Massage', durationMins: 60, therapistName: 'Mali', price: 110, status: 'pending', bedNumber: '3', bedType: 'Body' },
  { id: 's3', customerName: 'Michael Brown', serviceName: 'Deep Tissue Relief', durationMins: 90, therapistName: 'Aree', price: 150, status: 'pending', bedNumber: '6', bedType: 'VIP' },
];

import AdBanner from './AdBanner';

export default function StaffDashboard() {
  const { logout } = usePin();
  const { t } = useLanguage();
  const settings = getAppSettings();
  const [sessions, setSessions] = useState<StaffSession[]>(INITIAL_SESSIONS);
  const [completedSessions, setCompletedSessions] = useState<StaffSession[]>([]);
  const [miraMessage, setMiraMessage] = useState<string | null>(t('พี่ๆ หมอคะ งานใหม่จะเด้งขึ้นมาตรงนี้นะคะ พอแขกพร้อมแล้วอย่าลืมกดปุ่ม "เริ่มงาน" นะคะ หนูจะได้ช่วยจับเวลาให้ค่ะ พอจบงานหนูจะรีบแจ้งคุณป้าให้ไปเก็บเงินให้ทันทีเลยค่ะ!', 'Hi therapists! New jobs will appear here. When the guest is ready, don\'t forget to click "Start" so I can help keep time. When finished, I\'ll notify the manager to collect payment immediately!'));
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showClockModal, setShowClockModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [clockAction, setClockAction] = useState<'CLOCK_IN' | 'CLOCK_OUT'>('CLOCK_IN');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceEntry[]>([]);
  const [customIssue, setCustomIssue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleClockInOut = (action: 'CLOCK_IN' | 'CLOCK_OUT') => {
    setClockAction(action);
    setShowClockModal(true);
    setMiraMessage(t('พี่ๆ คะ เลือกชื่อตัวเองแล้วกดตกลงได้เลยค่ะ หนูจะจดเวลาเข้างานไว้ให้คุณป้าดูตอนจ่ายตังค์นะคะ ใครมาสายหนูฟ้องคุณป้าจริงๆ ด้วยนะ (หยอกๆ ค่ะ)', 'Therapists, please select your name and click confirm. I\'ll record your time for the owner to see. If you\'re late, I might tell on you! (Just kidding!)'));
  };

  const confirmClockAction = async () => {
    if (!selectedStaffId) return;

    const staff = therapists.find(t => t.id === selectedStaffId);
    if (!staff) return;

    // Anti-Cheat Logic: Check if already clocked in
    const lastEntry = attendanceLogs.filter(l => l.therapistId === selectedStaffId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    if (clockAction === 'CLOCK_IN' && lastEntry && lastEntry.type === 'CLOCK_IN') {
      setMiraMessage(t('คุณได้ลงเวลาเข้างานไปแล้วค่ะ', 'You have already clocked in.'));
      return;
    }

    if (clockAction === 'CLOCK_OUT' && (!lastEntry || lastEntry.type === 'CLOCK_OUT')) {
      setMiraMessage(t('คุณยังไม่ได้ลงเวลาเข้างานค่ะ', 'You have not clocked in yet.'));
      return;
    }

    const entry: AttendanceEntry = {
      id: `att-${Date.now()}`,
      therapistId: selectedStaffId,
      therapistName: staff.name,
      timestamp: new Date().toISOString(),
      type: clockAction
    };

    setIsLoading(true);
    try {
      await fetchWithRetry(`clock-${clockAction}-${selectedStaffId}`, async () => {
        console.log('Logging to ATTENDANCE Sheet (with Retry Logic):', entry);
        // Simulate API call
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() < 0.1) reject(new Error('Transient Network Error'));
            else resolve(true);
          }, 1500);
        });
      });

      setAttendanceLogs(prev => [...prev, entry]);
      setShowClockModal(false);
      setSelectedStaffId('');
      
      if (clockAction === 'CLOCK_IN') {
        setIsClockedIn(true);
        setMiraMessage(t('ลงชื่อเข้างานเรียบร้อยค่ะ วันนี้สู้ๆ นะคะคุณพี่หมอ', 'Clocked in successfully. Have a great day!'));
      } else {
        setIsClockedIn(false);
        setMiraMessage(t('ลงชื่อออกให้แล้วค่ะ เดินทางกลับปลอดภัยนะคะคุณพี่', 'Clocked out successfully. Have a safe trip home!'));
      }
    } catch (error) {
      setMiraMessage(t('ขออภัยค่ะ ระบบขัดข้องเล็กน้อย Chapter99 Solution (by น้องมิรา) กำลังพยายามกู้คืนข้อมูลให้นะคะ ลองใหม่อีกครั้งค่ะ', 'Sorry, system error. Chapter99 Solution (by Nong Mira) is trying to recover. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportIssue = (issue: string) => {
    const alert: AlertEntry = {
      id: `alert-${Date.now()}`,
      therapistId: 'staff-1',
      therapistName: 'Staff User',
      issue,
      timestamp: new Date().toISOString(),
      status: 'NEW'
    };
    console.log('Logging to ALERTS:', alert);
    setShowIssueModal(false);
    setMiraMessage(t('หนูแจ้งปัญหาให้คุณพี่เจ้าของร้านทราบแล้วนะคะ ไม่ต้องกังวลค่ะ', "I've notified the owner about the issue. Don't worry!"));
  };

  const startSession = (id: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        const startTime = Date.now();
        const endTime = startTime + (s.durationMins * 60 * 1000);
        
        // Data Sync Simulation (Google Sheets)
        console.log('Logging to GOOGLE_SHEETS (SESSIONS):', {
          id: s.id,
          therapistName: s.therapistName,
          customerName: s.customerName,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          status: 'STARTED',
          bedNumber: s.bedNumber,
          bedType: s.bedType
        });

        setMiraMessage(t(`คุณพี่หมอคะ งานใหม่ประจำที่ เตียง ${s.bedNumber} นะคะ เตรียมเตียงตามสีที่หนูโชว์ไว้ได้เลยค่ะ`, `New job at Bed ${s.bedNumber}. Please prepare the bed according to the color shown.`));
        return { ...s, status: 'active', startTime, endTime, remainingSeconds: s.durationMins * 60 };
      }
      return s;
    }));
  };

  const finishSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    setMiraMessage(t('นวดเสร็จแล้ว หนูแจ้งคุณป้าให้ไปเก็บเงินที่เตียงแล้วนะคะ! พักผ่อนก่อนนะคะคุณพี่', "Massage finished! I've notified the manager to collect payment at the bed. Please take a rest."));
    
    // Signal to Manager Dashboard (Simulation)
    console.log('SIGNAL_TO_MANAGER:', {
      type: 'PAYMENT_PENDING',
      bedNumber: session.bedNumber,
      therapistName: session.therapistName,
      customerName: session.customerName
    });

    const systemFee = (session.price * settings.gpFeePercent) / 100;
    const logData = {
      id: session.id,
      shopName: storeConfig.storeName,
      customerName: session.customerName,
      serviceName: session.serviceName,
      therapistName: session.therapistName,
      totalAmount: session.price,
      systemFee: systemFee,
      timestamp: new Date().toISOString(),
      type: 'STAFF_FINISHED_JOB',
      bedNumber: session.bedNumber
    };

    console.log('Logging to SALES_LOG (Completed Job):', logData);
    
    setCompletedSessions(prev => [
      { ...session, status: 'completed', endTime: Date.now() },
      ...prev
    ]);
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions(prev => prev.map(s => {
        if (s.status === 'active' && s.remainingSeconds && s.remainingSeconds > 0) {
          const newRemaining = s.remainingSeconds - 1;
          
          // 5 minute reminder
          if (newRemaining === 300) {
            setMiraMessage(t('เหลืออีก 5 นาทีจะหมดเวลาแล้วนะคะ เตรียมตัวนวดประคบหรือเช็ดตัวลูกค้าได้เลยค่ะ', '5 minutes left! Please prepare to finish the treatment.'));
          }
          
          return { ...s, remainingSeconds: newRemaining };
        }
        return s;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-cream p-6 sm:p-10 space-y-10">
      <AnimatePresence>
        {isLoading && <LoadingOverlay message={t('Chapter99 Solution (by น้องมิรา) กำลังบันทึกข้อมูลให้คุณพี่อยู่นะคะ...', 'Chapter99 Solution (by Nong Mira) is saving your data...')} />}
      </AnimatePresence>
      <header className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-primary/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center shadow-lg">
            <Heart size={24} className="text-white fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-charcoal leading-tight">{storeConfig.storeName}</h1>
            <p className="text-primary font-bold tracking-widest text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              STAFF / คุณพี่หมอ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {settings.showStaffClockInOut && (
            <div className="flex gap-2">
              <button 
                onClick={() => handleClockInOut('CLOCK_IN')}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold hover:bg-green-100 transition-all border border-green-100"
              >
                <LogIn size={18} />
                <span className="text-[10px] uppercase">Clock In / เข้างาน</span>
              </button>
              <button 
                onClick={() => handleClockInOut('CLOCK_OUT')}
                className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl font-bold hover:bg-orange-100 transition-all border border-orange-100"
              >
                <LogOut size={18} />
                <span className="text-[10px] uppercase">Clock Out / ออกงาน</span>
              </button>
            </div>
          )}
          {settings.showInventoryAlerts && (
            <button 
              onClick={() => setShowIssueModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl font-bold hover:bg-amber-100 transition-colors border border-amber-100"
            >
              <AlertTriangle size={18} />
              <span className="text-[10px] uppercase">Report / แจ้งปัญหา</span>
            </button>
          )}
          <button 
            onClick={() => setSessions(INITIAL_SESSIONS)}
            className="p-3 bg-cream border border-primary/10 rounded-xl text-accent hover:bg-primary/5 transition-colors"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors border border-red-100"
          >
            <LogOut size={18} />
            <span className="text-[10px] uppercase">Logout</span>
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

      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-0">
            <h2 className="text-xl font-serif font-bold text-charcoal flex items-center gap-2">
              <Clock className="text-primary" size={20} />
              {t('ตารางนวดวันนี้ / Job Schedule', 'Job Schedule')}
            </h2>
            <p className="text-accent/60 text-[10px] font-medium font-sans">{t(`มีคิวรออยู่ ${sessions.length} งานนะคะ`, `You have ${sessions.length} jobs waiting.`)}</p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold border border-primary/20">
            {sessions.length} Bookings
          </div>
        </div>

        <div className={cn(
          "grid gap-4",
          sessions.length <= 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : 
          sessions.length <= 8 ? "grid-cols-2 lg:grid-cols-4" : 
          "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        )}>
          <AnimatePresence mode="popLayout">
            {sessions.map((session) => {
              const progress = session.status === 'active' 
                ? ((session.durationMins * 60 - (session.remainingSeconds || 0)) / (session.durationMins * 60)) * 100 
                : 0;

              return (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "p-4 rounded-[2rem] shadow-lg border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full min-h-[280px]",
                    session.status === 'active' 
                      ? "bg-white border-orange-400 ring-4 ring-orange-50" 
                      : "bg-white border-primary/10"
                  )}
                >
                  {/* Bed Badge */}
                  {session.bedNumber && (
                    <div className={cn(
                      "absolute top-4 right-4 px-4 py-2 rounded-xl border-2 shadow-sm z-20 flex flex-col items-center justify-center min-w-[60px]",
                      session.bedType === 'Foot' ? "bg-blue-50 border-blue-200 text-blue-600" :
                      session.bedType === 'Body' ? "bg-amber-50 border-amber-200 text-amber-600" :
                      "bg-purple-50 border-purple-200 text-purple-600"
                    )}>
                      <p className="text-[8px] font-black uppercase tracking-widest leading-none mb-1">เตียง / Bed</p>
                      <p className="text-xl font-black leading-none">{session.bedNumber}</p>
                    </div>
                  )}

                  {/* Progress background for active sessions */}
                  {session.status === 'active' && (
                    <motion.div 
                      className="absolute bottom-0 left-0 h-1 bg-orange-500" 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  )}

                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-[8px] uppercase font-bold text-accent/40 tracking-widest">{t('หมอ / Therapist', 'Therapist')}</p>
                        <h3 className="text-2xl font-serif font-bold text-charcoal leading-none">{session.therapistName}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-primary leading-none">${session.price}</p>
                        <p className="text-[8px] text-accent/40 uppercase font-bold tracking-widest">{t('ยอด / Price', 'Price')}</p>
                      </div>
                    </div>

                    <div className="space-y-2 py-2 border-y border-primary/5">
                      <div>
                        <p className="text-[8px] text-accent/40 uppercase font-bold">{t('ลูกค้า / Customer', 'Customer')}</p>
                        <p className="text-sm font-bold text-charcoal truncate">{session.customerName}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-accent/40 uppercase font-bold">{t('บริการ / Service', 'Service')}</p>
                        <p className="text-[10px] font-bold text-primary truncate uppercase">{session.serviceName}</p>
                      </div>
                    </div>

                    {session.status === 'active' && (
                      <div className="py-4 space-y-4">
                        {/* Circular Progress */}
                        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="56"
                              cy="56"
                              r="48"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              className="text-orange-50"
                            />
                            <motion.circle
                              cx="56"
                              cy="56"
                              r="48"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray="301.6"
                              initial={{ strokeDashoffset: 301.6 }}
                              animate={{ strokeDashoffset: 301.6 - (301.6 * progress) / 100 }}
                              className="text-orange-500"
                              transition={{ duration: 1, ease: "linear" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-2xl font-mono font-black text-orange-700">
                              {Math.floor(session.remainingSeconds! / 60)}:{(session.remainingSeconds! % 60).toString().padStart(2, '0')}
                            </p>
                            <p className="text-[8px] uppercase font-black text-orange-600/60 tracking-widest">Left</p>
                          </div>
                        </div>

                        <div className="text-center space-y-1">
                          <p className="text-[8px] font-black text-accent/40 uppercase tracking-widest">{t('Finished at / นวดเสร็จเวลา:', 'Finished at:')}</p>
                          <p className="text-xl font-black text-charcoal">
                            {new Date(session.endTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )}

                    {session.status === 'pending' && (
                      <div className="flex items-center gap-2 text-accent/40">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold">{session.durationMins} Mins / {session.durationMins} นาที</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3">
                    {session.status === 'pending' ? (
                      <button 
                        onClick={() => startSession(session.id)}
                        className="w-full py-3 bg-green-500 text-white rounded-2xl font-black text-sm shadow-md shadow-green-100 flex items-center justify-center gap-2 hover:bg-green-600 transition-all active:scale-95 uppercase tracking-widest"
                      >
                        <Play size={16} fill="currentColor" />
                        <span>{t('เริ่มงาน / Start', 'Start')}</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => finishSession(session.id)}
                        className="w-full py-3 bg-orange-500 text-white rounded-2xl font-black text-sm shadow-md shadow-orange-100 flex items-center justify-center gap-2 hover:bg-orange-600 transition-all active:scale-95 uppercase tracking-widest"
                      >
                        <CheckCircle size={16} />
                        <span>{t('จบงาน / Finish', 'Finish')}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )})}
          </AnimatePresence>
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-primary/5 shadow-sm space-y-4">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 border-2 border-green-100">
              <CheckCircle size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold text-charcoal">{t('จบงานครบแล้วค่ะ', 'All jobs completed!')}</h3>
              <p className="text-accent/60 text-sm">{t('คุณพี่หมอเก่งมากเลยค่ะ พักผ่อนก่อนนะคะ', 'Great job! Please take a rest.')}</p>
            </div>
            <button 
              onClick={() => {
                setSessions(INITIAL_SESSIONS);
                setCompletedSessions([]);
              }}
              className="mt-4 px-6 py-2 bg-primary/10 text-primary rounded-full font-bold hover:bg-primary/20 transition-colors text-sm"
            >
              Reset Data
            </button>
          </div>
        )}
      </section>

      {/* Summary of the Day */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-0">
            <h2 className="text-xl font-serif font-bold text-charcoal flex items-center gap-2">
              <DollarSign className="text-primary" size={20} />
              {t('สรุปงานวันนี้ / Today\'s Summary', 'Today\'s Summary')}
            </h2>
            <p className="text-accent/60 text-[10px] font-medium font-sans">{t('รายการงานที่คุณพี่นวดเสร็จแล้วในวันนี้ค่ะ', 'List of your completed jobs for today.')}</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-xs font-bold border border-emerald-100">
            Total: ${completedSessions.reduce((acc, s) => acc + s.price, 0)}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-cream/50 border-b border-primary/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-accent/40">{t('เวลา / Time', 'Time')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-accent/40">{t('ลูกค้า / Customer', 'Customer')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-accent/40">{t('บริการ / Service', 'Service')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-accent/40 text-right">{t('ราคา / Price', 'Price')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {completedSessions.length > 0 ? (
                  completedSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs font-mono font-bold text-charcoal">
                          {new Date(session.endTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-charcoal">{session.customerName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            session.bedType === 'Foot' ? "bg-blue-500" :
                            session.bedType === 'Body' ? "bg-amber-500" :
                            "bg-purple-500"
                          )} />
                          <p className="text-[10px] font-bold text-primary uppercase">{session.serviceName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-black text-primary">${session.price}</p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-accent/40 text-xs italic">
                      {t('ยังไม่มีรายการที่นวดเสร็จในวันนี้ค่ะ', 'No completed jobs for today yet.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      <AdBanner />

      <footer className="pt-6 border-t border-primary/10 flex justify-between items-center text-accent/40 text-[8px] uppercase font-bold tracking-[0.3em]">
        <p>© 2026 {storeConfig.storeName}</p>
        <p>Sydney, Australia</p>
      </footer>

      {/* Clock In/Out Modal */}
      <AnimatePresence>
        {showClockModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClockModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-primary/10"
            >
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border shadow-sm",
                    clockAction === 'CLOCK_IN' ? "bg-green-50 text-green-500 border-green-100" : "bg-orange-50 text-orange-500 border-orange-100"
                  )}>
                    <Clock size={32} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-charcoal">
                    {clockAction === 'CLOCK_IN' ? t('ลงเวลาเข้างาน / Clock In', 'Clock In') : t('ลงเวลาออกงาน / Clock Out', 'Clock Out')}
                  </h3>
                  <p className="text-accent/60 text-xs">{t('เลือกชื่อของคุณเพื่อลงเวลานะคะ', 'Select your name to record time.')}</p>
                </div>

                {/* Gender Filter for Staff Selection */}
                <div className="flex gap-2 p-1 bg-cream rounded-2xl border border-primary/5">
                  {[
                    { value: 'All', label: t('ทุกคน', 'All') },
                    { value: 'Female', label: t('หญิง', 'Female') },
                    { value: 'Male', label: t('ชาย', 'Male') }
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setGenderFilter(f.value as any)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        genderFilter === f.value 
                          ? "gold-gradient text-white shadow-md" 
                          : "text-accent/40 hover:text-accent/60"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="w-full bg-cream border border-primary/10 rounded-2xl px-4 py-4 text-charcoal font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">{t('-- เลือกชื่อพนักงาน --', '-- Select Staff --')}</option>
                      {therapists
                        .filter(t => genderFilter === 'All' || t.gender === genderFilter)
                        .map(t => {
                          const insStatus = getInsuranceStatus(t.insuranceExpiry);
                          return (
                            <option key={t.id} value={t.id}>
                              {t.name} {insStatus.status === 'expired' ? '⚠️ EXPIRED' : insStatus.status === 'warning' ? '⚠️ SOON' : ''}
                            </option>
                          );
                        })}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40">
                      <ChevronDown size={20} />
                    </div>
                  </div>

                  {selectedStaffId && (() => {
                    const staff = therapists.find(t => t.id === selectedStaffId);
                    const insStatus = getInsuranceStatus(staff?.insuranceExpiry);
                    if (insStatus.status !== 'valid') {
                      return (
                        <div className={cn(
                          "p-4 rounded-2xl border flex items-center gap-3",
                          insStatus.status === 'expired' ? "bg-red-500/5 text-red-500 border-red-100" : "bg-amber-500/5 text-amber-500 border-amber-100"
                        )}>
                          <AlertTriangle size={20} />
                          <div className="text-[10px] leading-tight">
                            <p className="font-bold">{insStatus.message}</p>
                            <p className="opacity-80">{t('กรุณาแจ้งคุณป้าเพื่ออัปเดตข้อมูลประกันมือนะคะ', 'Please notify the owner to update your insurance information.')}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <button
                    onClick={confirmClockAction}
                    disabled={!selectedStaffId}
                    className={cn(
                      "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95",
                      clockAction === 'CLOCK_IN' 
                        ? "bg-green-500 text-white shadow-green-100 hover:bg-green-600" 
                        : "bg-orange-500 text-white shadow-orange-100 hover:bg-orange-600",
                      !selectedStaffId && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {t('ตกลง / Confirm', 'Confirm')}
                  </button>
                </div>

                <button
                  onClick={() => setShowClockModal(false)}
                  className="w-full py-3 text-accent/40 font-bold text-xs uppercase tracking-widest hover:text-accent/60 transition-colors"
                >
                  {t('ยกเลิก / Cancel', 'Cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Issue Reporting Modal */}
      <AnimatePresence>
        {showIssueModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIssueModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-primary/10"
            >
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500 border border-amber-100">
                    <AlertTriangle size={32} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-charcoal">{t('แจ้งปัญหา / Report Issue', 'Report Issue')}</h3>
                  <p className="text-accent/60 text-xs">{t('เลือกปัญหาที่ต้องการแจ้งคุณพี่เจ้าของร้านนะคะ', 'Select the issue you want to report.')}</p>
                </div>

                  <div className="grid grid-cols-1 gap-3">
                    {['น้ำมันหมด', 'ผ้าเช็ดตัวไม่พอ', 'เตียงพัง'].map((issue) => (
                      <button
                        key={issue}
                        onClick={() => handleReportIssue(issue)}
                        className="w-full py-4 bg-cream hover:bg-primary/5 text-charcoal font-bold rounded-2xl border border-primary/5 transition-all text-sm"
                      >
                        {t(issue, issue === 'น้ำมันหมด' ? 'Oil out' : issue === 'ผ้าเช็ดตัวไม่พอ' ? 'Not enough towels' : 'Bed broken')}
                      </button>
                    ))}
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-black text-accent/40 uppercase tracking-widest px-2">{t('อื่นๆ / Other', 'Other')}</p>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={customIssue}
                        onChange={(e) => setCustomIssue(e.target.value)}
                        placeholder={t("พิมพ์ปัญหาที่นี่...", "Type issue here...")}
                        className="flex-1 bg-cream border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        onClick={() => {
                          if (customIssue.trim()) {
                            handleReportIssue(customIssue);
                            setCustomIssue('');
                          }
                        }}
                        className="px-4 bg-primary text-white rounded-xl font-bold text-xs uppercase"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowIssueModal(false)}
                  className="w-full py-3 text-accent/40 font-bold text-xs uppercase tracking-widest hover:text-accent/60 transition-colors"
                >
                  {t('ยกเลิก / Cancel', 'Cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
