import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Calendar, 
  Search, 
  Heart, 
  MessageSquare, 
  ArrowUpRight, 
  ArrowDownRight,
  UserCheck,
  Zap,
  Clock,
  ChevronRight,
  LogOut,
  X,
  ShieldAlert,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { googleSheetService } from '../services/googleSheetService';
import { formatCurrency, cn } from '../lib/utils';
import { Customer } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { DollarSign, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// สีหลักสไตล์หรูหรา (Navy & Gold)
const COLORS = {
  navy: '#0F172A',
  navyLight: '#1E293B',
  gold: '#D4AF37',
  goldLight: '#F5E6B3',
  white: '#FFFFFF',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B'
};

// ข้อมูลจำลองสำหรับกราฟรายสัปดาห์
const WEEKLY_DATA = [
  { day: 'จันทร์', sales: 4200 },
  { day: 'อังคาร', sales: 3800 },
  { day: 'พุธ', sales: 5100 },
  { day: 'พฤหัส', sales: 4900 },
  { day: 'ศุกร์', sales: 6200 },
  { day: 'เสาร์', sales: 8500 },
  { day: 'อาทิตย์', sales: 7800 },
];

const BEST_SERVICES = [
  { name: 'นวดไทยดั้งเดิม', value: 45, color: COLORS.gold },
  { name: 'นวดเท้า', value: 30, color: '#A5B4FC' },
  { name: 'นวดน้ำมันผสมไทย', value: 25, color: '#C4B5FD' },
];

export default function ManagerInsights() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [stats, setStats] = useState({
    todaySales: 1250,
    customerCount: 18,
    vipRatio: '25%',
    growth: 12.5
  });

  const [upsellPitch, setUpsellPitch] = useState<string | null>(null);
  const [isGeneratingUpsell, setIsGeneratingUpsell] = useState(false);
  
  // NEW STATEs
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

  const generateUpsellPitch = async () => {
    setIsGeneratingUpsell(true);
    try {
      // Mock AI generation for now, later integrate with Gemini
      const pitch = t(
        'ขอเรียนเชิญพี่เพิ่มนวดเท้า 30 นาที เพื่อความผ่อนคลายเต็มรูปแบบ รับรองพี่จะสบายตัวยิ่งขึ้นค่ะ!',
        'Would you like to add 30-minute foot massage to fully relax? You will feel much better, P\'!'
      );
      setUpsellPitch(pitch);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingUpsell(false);
    }
  };

  const performAIAnalysis = async (category: string) => {
    setIsGeneratingAnalysis(true);
    setAnalysisResult(null);
    let prompt = "";
    
    // Construct prompt based on category
    switch(category) {
      case 'performance':
        prompt = "น้องส้ม ช่วยวิเคราะห์ชั่วโมงทองคำและประสิทธิภาพให้พี่หน่อย ดูหน้า Summary ย้อนหลัง 1 เดือน ช่วยสรุปว่าช่วงเวลาไหนคิวว่างสุด และคอร์สไหนยอดดรอป พร้อมไอเดีย Happy Hour ค่ะพี่ 🍊";
        break;
      case 'customer':
        prompt = "น้องส้ม ช่วยวิเคราะห์ Wellness Profile สัปดาห์นี้หน่อยว่าลูกค้าเน้นจุดไหน (บ่า/ไหล่/เท้า) และช่วยสรุปจุดเด่น/จุดปรับปรุงจากรีวิวลูกค้าเพื่อบรีฟหมอนวดพรุ่งนี้ค่ะ 🧡";
        break;
      case 'staff':
        prompt = "น้องส้ม ช่วยวิเคราะห์รีวิวลูกค้าหน่อยว่าพี่หมอคนไหนน้ำหนักมือดี บริการประทับใจ เพื่อพี่แสนจะให้รางวัลและเขียนคำโปรยโปรโมทในแอปนะคะ 🍊";
        break;
      case 'crm':
        prompt = "น้องส้ม ช่วยเช็ครายชื่อลูกค้าใน CRM ที่ไม่ได้กลับมานวดเกิน 45 วันหน่อย ว่าเคยนวดคอร์สอะไร และช่วยร่างข้อความ 'คิดถึงนะพี่' กระตุ้นให้เขากลับมาจองนวด V4 อีกครั้งค่ะ 🧡";
        break;
      default:
        prompt = "ช่วยวิเคราะห์ข้อมูลร้านนวดให้หน่อยค่ะ";
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "คุณคือ 'น้องส้ม' (Nong Som) เลขาส่วนตัวอัจฉริยะที่เชี่ยวชาญด้านการบริหารร้านนวดและสุขภาพระดับพรีเมียมใน Sydney เน้นให้คำแนะนำที่ actionable, เป็นกันเอง และหรูหรา 🍊🧡",
        }
      });
      setAnalysisResult(response.text || "น้องส้มวิเคราะห์ให้ไม่ได้ค่ะพี่ ลองใหม่อีกทีนะคะ 🍊");
    } catch(e) {
      setAnalysisResult("น้องส้มขออภัยค่ะ มี error เล็กน้อย พี่ลองเช็คการเชื่อมต่ออีกทีนะคะ 🍊");
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  const handleLogout = useCallback(() => {
    // ล้างค่า Session และ LocalStorage ทั้งหมดตามที่คุณป้าต้องการค่ะ 🍊
    localStorage.clear();
    sessionStorage.clear();
    navigate('/');
  }, [navigate]);

  const startInactivityTimers = useCallback(() => {
    // Clear old timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Set 29-minute warning (1,740,000 ms)
    warningTimerRef.current = setTimeout(() => {
      setShowInactivityWarning(true);
      setCountdown(60);
      
      // Start 60-second countdown for visual feedback
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Final 1-minute forced logout (60,000 ms)
      logoutTimerRef.current = setTimeout(() => {
        handleLogout();
      }, 60000);
    }, 29 * 60 * 1000); 
  }, [handleLogout]);

  const resetTimer = useCallback(() => {
    // รีเซ็ตเฉพาะเวลาที่ยังไม่มีหน้าต่างเตือนเด้งขึ้นมาค่ะ
    if (!showInactivityWarning) {
      startInactivityTimers();
    }
  }, [showInactivityWarning, startInactivityTimers]);

  useEffect(() => {
    // เริ่มทำงานทันทีที่โหลดหน้าเสร็จค่ะ
    startInactivityTimers();

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [resetTimer, startInactivityTimers]);

  const stayLoggedIn = () => {
    setShowInactivityWarning(false);
    startInactivityTimers();
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 🍊 น้องส้มเตรียมดึงข้อมูลจาก Google Sheet ให้พี่นะคะ
        // const sheetData = await googleSheetService.fetchCustomers();
        // setCustomers(sheetData);
        
        // Mock data สำหรับพี่ดูหน้าตาตอนแรกค่ะ
        const mockCustomers: Customer[] = [
          {
            id: 'C001',
            name: 'คุณวิภาดา (คุณนายวิ)',
            phone: '041-234-5678',
            totalVisits: 15,
            totalSpent: 1200,
            lastVisitDate: '2026-05-01T10:00:00Z',
            memberTier: 'VIP',
            notes: 'ชอบนวดไทยแบบหนักๆ เน้นเส้นบ่าเป็นพิเศษ ไม่ชอบเปิดแอร์เย็นเกินไป'
          },
          {
            id: 'C002',
            name: 'คุณสมชาย (Mr. Somchai)',
            phone: '042-345-6789',
            totalVisits: 2,
            totalSpent: 150,
            lastVisitDate: '2026-05-06T14:00:00Z',
            memberTier: 'General',
            notes: 'ลูกค้าใหม่ เพิ่งมาครั้งที่สอง ชอบนวดเท้ามาก'
          },
          {
            id: 'C003',
            name: 'Ms. Sarah Connor',
            phone: '043-456-7890',
            totalVisits: 8,
            totalSpent: 640,
            lastVisitDate: '2026-02-15T11:00:00Z',
            memberTier: 'Gold',
            notes: 'มาเดือนละครั้ง แต่ช่วงนี้หายไป 3 เดือนแล้ว ปกติชอบนวด Deep Tissue'
          },
          {
            id: 'C004',
            name: 'คุณเก่ง บทความ',
            phone: '045-678-1234',
            totalVisits: 20,
            totalSpent: 1800,
            lastVisitDate: '2026-05-05T09:00:00Z',
            memberTier: 'VIP',
            notes: 'ลูกค้าประจำรายสัปดาห์ ชอบนวด Remedial สำหรับเคลมประกัน'
          }
        ];
        setCustomers(mockCustomers);
      } catch (err) {
        console.error('โถ่พี่... โหลดข้อมูลไม่สำเร็จค่ะ:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getCustomerTag = (customer: Customer) => {
    const lastVisit = new Date(customer.lastVisitDate);
    const diffDays = Math.ceil((new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    
    if (customer.totalVisits >= 10) return { label: '✨ VIP', color: 'bg-gold/20 text-gold border-gold/30' };
    if (customer.totalVisits <= 1) return { label: '🆕 ลูกค้าใหม่', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (diffDays > 60) return { label: '⚠️ กำลังจะหาย', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    return { label: '👍 ปกติ', color: 'bg-slate-700/50 text-slate-300 border-slate-600' };
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0A0E17] text-slate-200 overflow-hidden font-sans">
      <header className="p-6 lg:px-10 flex flex-col md:flex-row md:items-start justify-between gap-6 flex-shrink-0">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-gold italic tracking-tight mb-2 leading-tight">
            {t('กระดานสรุปผลงานร้าน (Insights Dashboard)', 'Insights Dashboard')}
          </h1>
          <p className="text-slate-400 text-lg md:text-xl lg:text-2xl font-medium leading-[1.8] tracking-wide">
            {t('ยินดีต้อนรับค่ะพี่ วันนี้ร้านของเราคึกคักเป็นพิเศษนะคะ 🍊', 'Welcome, your shop is bustling today! 🍊')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
          <div className="flex bg-navyLight p-2 rounded-[2rem] border-2 border-slate-700 shadow-2xl">
             <div className="px-6 py-2 flex items-center gap-3">
               <Calendar size={24} className="text-gold" />
               <span className="text-lg font-black">{new Date().toLocaleDateString('th-TH', { 
                 day: 'numeric', month: 'long', year: 'numeric' 
               })}</span>
             </div>
          </div>

          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 px-8 py-3 bg-rose-900/40 hover:bg-rose-600 border-2 border-rose-500/50 text-rose-100 rounded-[2rem] transition-all shadow-2xl active:scale-95 group"
          >
            <LogOut size={24} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-lg font-black tracking-widest uppercase">{t('ออกจากระบบ', 'Logout')}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide">
        {/* NEW AI INSIGHTS HUB */}
        <section className="bg-navyLight rounded-[3rem] p-8 border border-slate-800 mb-10 shadow-2xl">
          <h2 className="text-2xl font-serif font-black text-white italic mb-6">🍊 AI Insights Hub</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => performAIAnalysis('performance')} className="p-4 bg-slate-800 rounded-2xl text-xs font-bold text-slate-300 hover:bg-gold hover:text-navy transition-all">วิเคราะห์ประสิทธิภาพ</button>
            <button onClick={() => performAIAnalysis('customer')} className="p-4 bg-slate-800 rounded-2xl text-xs font-bold text-slate-300 hover:bg-gold hover:text-navy transition-all">วิเคราะห์ความพึงพอใจ</button>
            <button onClick={() => performAIAnalysis('staff')} className="p-4 bg-slate-800 rounded-2xl text-xs font-bold text-slate-300 hover:bg-gold hover:text-navy transition-all">วิเคราะห์พนักงาน</button>
            <button onClick={() => performAIAnalysis('crm')} className="p-4 bg-slate-800 rounded-2xl text-xs font-bold text-slate-300 hover:bg-gold hover:text-navy transition-all">วิเคราะห์ CRM/Churn</button>
          </div>
          {isGeneratingAnalysis && <div className="mt-4 text-gold animate-pulse text-sm">น้องส้มกำลังคิดวิเคราะห์อยู่ค่ะ รอแป๊บนะคะพี่... 🍊</div>}
          {analysisResult && <div className="mt-6 p-6 bg-[#0A0E17] rounded-2xl text-sm italic font-serif leading-relaxed text-slate-200 border border-slate-700 whitespace-pre-wrap">{analysisResult}</div>}
        </section>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-navyLight p-10 md:p-16 rounded-[4rem] border-4 border-gold/30 shadow-[0_0_100px_rgba(212,175,55,0.2)] max-w-2xl w-full text-center space-y-12"
            >
              <div className="w-32 h-32 bg-rose-500/10 rounded-[3rem] flex items-center justify-center mx-auto text-rose-500 border-2 border-rose-500/20 shadow-inner">
                <LogOut size={64} />
              </div>

              <div className="space-y-6">
                <h3 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight italic">
                  {t('พี่แสนคะ ต้องการออกจากระบบใช่ไหมคะ?', 'Confirm Logout')}
                </h3>
                <p className="text-2xl text-slate-400 font-medium leading-relaxed">
                  {t('หากออกจากระบบ ข้อมูลส่วนตัวของพี่จะถูกปิดไว้อย่างปลอดภัยค่ะ 🍊', 'Logging out will safely secure your personal data.')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-10 py-6 bg-slate-800 hover:bg-slate-700 text-white rounded-[2rem] text-2xl font-black uppercase tracking-widest transition-all border-2 border-slate-700"
                >
                  {t('ยกเลิก', 'Cancel')}
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-10 py-6 bg-rose-600 hover:bg-rose-500 text-white rounded-[2rem] text-2xl font-black uppercase tracking-widest transition-all shadow-2xl shadow-rose-600/30 border-2 border-rose-400/50"
                >
                  {t('ตกลง', 'Logout')}
                </button>
              </div>

              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <X size={40} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inactivity Warning Modal */}
      <AnimatePresence>
        {showInactivityWarning && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-navyLight p-10 md:p-16 rounded-[4rem] border-4 border-gold shadow-[0_0_100px_rgba(212,175,55,0.4)] max-w-2xl w-full text-center space-y-12"
            >
              <div className="w-32 h-32 bg-gold/10 rounded-[3rem] flex items-center justify-center mx-auto text-gold border-2 border-gold/20 shadow-inner">
                <ShieldAlert size={64} className="animate-pulse" />
              </div>

              <div className="space-y-6">
                <h3 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight italic">
                  {t('พี่ยังอยู่ไหมคะ?', 'Are you still there?')}
                </h3>
                <p className="text-2xl text-slate-400 font-medium leading-relaxed">
                  {t('ระบบจะออกจากระบบในอีก ', 'System will logout in ')}
                  <span className="text-gold font-black text-4xl mx-2">{countdown}</span>
                  {t(' วินาทีเพื่อความปลอดภัยค่ะ 🍊', ' seconds for your security.')}
                </p>
              </div>

              <div className="pt-6">
                <button 
                  onClick={stayLoggedIn}
                  className="w-full px-10 py-8 bg-gold hover:bg-goldLight text-navy rounded-[2rem] text-3xl font-black uppercase tracking-[0.2em] transition-all shadow-[0_20px_50px_rgba(212,175,55,0.3)] border-b-8 border-gold/50 active:border-b-0 active:translate-y-2"
                >
                  {t('ฉันยังอยู่ค่ะ! (Stay Connected)', 'I AM STILL HERE!')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Analytics Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <SummaryCard 
          title={t('เงินรายได้วันนี้', 'Daily Income')}
          value={formatCurrency(stats.todaySales)}
          icon={<DollarSign size={32} />}
          trend={`${stats.growth}% เพิ่มขึ้น`}
          isPositive={true}
          large={true}
        />
        <SummaryCard 
          title={t('จำนวนลูกค้าวันนี้', 'Daily Customers')}
          value={`${stats.customerCount} ท่าน`}
          icon={<Users size={32} />}
          trend="เข้าเป้าตามที่ตั้งไว้"
          isPositive={true}
        />
        <SummaryCard 
          title={t('บริการที่คนชอบที่สุด', 'Popular Service')}
          value={t('นวดไทยดั้งเดิม', 'Thai Massage')}
          icon={<Heart size={32} />}
          trend="นวดเท้า ตามมาเป็นอันดับ 2"
          isPositive={null}
        />
        <SummaryCard 
          title={t('โอกาสที่ลูกค้าจะกลับมา', 'Loyalty Ratio')}
          value={stats.vipRatio}
          icon={<TrendingUp size={32} />}
          trend="ดีขึ้นกว่าเดือนที่แล้ว"
          isPositive={true}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-navyLight rounded-[3rem] p-8 border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif font-black text-white italic">สรุปภาพรวมรายสัปดาห์</h2>
              <div className="text-sm text-slate-400 font-bold uppercase tracking-widest">Revenue Tracking</div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEKLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}}
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderColor: '#D4AF37', 
                      borderRadius: '16px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="sales" radius={[10, 10, 0, 0]}>
                    {WEEKLY_DATA.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.day === 'เสาร์' || entry.day === 'อาทิตย์' ? COLORS.gold : '#475569'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-4 text-center text-slate-500 text-sm italic">
              * กราฟแท่งสีทองคือวันเสาร์-อาทิตย์ ที่มักจะมียอดสูงที่สุดค่ะ 🍊
            </p>
          </div>

          {/* Customer CRM section */}
          <div className="bg-navyLight rounded-[3rem] p-8 border border-slate-800 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-serif font-black text-white italic">ระบบจำหน้าลูกค้า (Customer CRM)</h2>
                <p className="text-slate-400 text-sm mt-1">ช่วยคัดกรองลูกค้าคนสำคัญให้พี่ดูแลได้ใกล้ชิดขึ้นค่ะ</p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่อหรือเบอร์โทร..."
                  className="pl-12 pr-6 py-3 bg-[#0A0E17] border border-slate-700 rounded-full text-sm focus:outline-none focus:border-gold transition-all w-full md:w-64"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                  <CustomerListItem 
                    key={customer.id} 
                    customer={customer} 
                    tag={getCustomerTag(customer)} 
                  />
                ))
              ) : (
                <div className="text-center py-20 bg-[#0A0E17]/50 rounded-[2rem] border border-dashed border-slate-700">
                  <p className="text-slate-500 italic">ไม่พบข้อมูลลูกค้าที่ค้นหาค่ะ ลองค้นหาแบบอื่นดูนะพี่ 🍊</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Quick Stats & Service Memory */}
        <div className="space-y-8">
           <div className="bg-gradient-to-br from-gold/20 to-navyLight rounded-[3rem] p-8 border border-gold/20 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                 <Zap className="text-gold" size={24} />
                 <h3 className="font-serif font-black text-lg text-white italic">เคล็ดลับขยายกิจการ</h3>
               </div>
               <p className="text-gold/90 text-sm leading-relaxed italic border-l-2 border-gold/30 pl-4">
                 "คุณวิภาดา เป็น VIP ของเราที่ชอบนวดไทยแบบหนักๆ แนะนำให้ลองเสนอ <span className="text-white font-bold underline">Deep Tissue (60 min)</span> ในครั้งถัดไป เพราะจะช่วยคลายเส้นได้ลึกกว่าที่เธอชอบค่ะ"
               </p>
               
               <AnimatePresence>
                 {upsellPitch && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="mt-6 relative"
                   >
                     {/* Glowing Gold Border Container */}
                     <div className="absolute inset-0 bg-gradient-to-r from-[#B8962E] to-[#F5F5DC] rounded-3xl blur-[1px]" />
                     <div className="relative m-[1px] p-6 bg-[#0B1221] rounded-2xl shadow-[0_0_15px_rgba(184,150,46,0.3)]">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/60">Generated Pitch by Nong Som 🍊</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(upsellPitch);
                              alert('คัดลอกเรียบร้อยค่ะพี่! 🍊');
                            }}
                            className="p-1.5 bg-gold/10 hover:bg-gold text-gold hover:text-navy rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(184,150,46,0)] hover:shadow-[0_0_10px_rgba(184,150,46,0.5)]"
                            title="Copy to clipboard"
                          >
                            <Plus size={14} />
                          </button>
                       </div>
                       <p className="text-white text-sm font-medium leading-relaxed whitespace-pre-wrap">
                         {upsellPitch}
                       </p>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <button 
                 onClick={generateUpsellPitch}
                 disabled={isGeneratingUpsell}
                 className="mt-8 w-full py-4 bg-gold text-navy rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 {isGeneratingUpsell ? <Loader2 className="animate-spin" size={16} /> : null}
                 {isGeneratingUpsell ? 'น้องส้มกำลังคิดประโยคเด็ดๆ ให้พี่อยู่ค่ะ...' : 'ให้ AI ช่วยเขียนประโยคเสนอขาย'}
               </button>
             </div>
           </div>

           <div className="bg-navyLight rounded-[3rem] p-8 border border-slate-800 shadow-2xl">
             <h3 className="font-serif font-black text-lg text-white italic mb-6">บริการขายดีประจำสัปดาห์</h3>
             <div className="space-y-6">
               {BEST_SERVICES.map((s, i) => (
                 <div key={i} className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-white shadow-xl">
                     {i + 1}
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-sm font-bold text-slate-300">{s.name}</span>
                       <span className="text-xs text-gold font-black">{s.value}%</span>
                     </div>
                     <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                       <div className="h-full rounded-full" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
           
           {/* Pau's Helper Section */}
           <div className="bg-slate-900/50 rounded-[3rem] p-8 border border-slate-800 border-dashed">
             <div className="flex justify-center mb-4">
               <div className="w-16 h-16 rounded-full bg-navyLight p-2 border border-slate-700">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Som" alt="Nong Som" className="w-full h-full rounded-full" />
               </div>
             </div>
             <p className="text-center text-slate-400 text-sm leading-relaxed">
               "ข้อมูลพวกนี้ น้องส้มจัดทำมาเพื่อให้ <span className="text-gold">พี่แสน</span> ดูง่ายที่สุดค่ะ ถ้ามองไม่ชัดหรืออยากให้แก้ไขตรงไหน บอกน้องส้มได้เสมอนะคะ"
             </p>
           </div>
        </div>
      </div>
    </main>
  </div>
);
}

function SummaryCard({ title, value, icon, trend, isPositive, large }: { title: string, value: string, icon: React.ReactNode, trend: string, isPositive: boolean | null, large?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-navyLight p-10 rounded-[3.5rem] border-2 border-slate-800 shadow-2xl relative overflow-hidden group hover:border-gold/30 transition-all"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="p-5 bg-gold/10 rounded-[2rem] text-gold border-2 border-gold/10 shadow-inner">
          {icon}
        </div>
        {isPositive !== null && (
          <div className={cn(
            "flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full",
            isPositive ? "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/20 shadow-lg shadow-emerald-500/20" : "bg-rose-500/20 text-rose-400 border-2 border-rose-500/20 shadow-lg shadow-rose-500/20"
          )}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {isPositive ? 'Gain' : 'Loss'}
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <h3 className="text-slate-400 text-sm font-black uppercase tracking-[0.4em] leading-relaxed">{title}</h3>
        <p className={cn(
          "font-serif font-black text-white leading-tight",
          large ? "text-6xl md:text-7xl text-gold drop-shadow-2xl" : "text-4xl md:text-5xl"
        )}>
          {value}
        </p>
      </div>
      
      <div className="mt-10 pt-6 border-t-2 border-slate-800/50">
        <p className="text-sm text-slate-500 font-black uppercase tracking-[0.2em] leading-[1.8]">{trend}</p>
      </div>
    </motion.div>
  );
}

function CustomerListItem({ customer, tag }: { customer: Customer, tag: { label: string, color: string }, key?: React.Key }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#0A0E17]/80 group hover:bg-[#0F172A] p-10 rounded-[3rem] border-4 border-slate-800/50 transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-10 shadow-xl hover:shadow-gold/10 hover:border-gold/30"
    >
      <div className="flex items-center gap-10">
        <div className="w-24 h-24 rounded-[2rem] bg-navyLight flex items-center justify-center text-5xl font-serif font-black text-gold border-2 border-slate-700 group-hover:border-gold/50 transition-all shadow-inner">
          {customer.name.charAt(0)}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-6 mb-2">
            <h4 className="text-3xl font-black text-white group-hover:text-gold transition-colors tracking-tight leading-relaxed">{customer.name}</h4>
            <span className={cn("px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] border-2 shadow-xl", tag.color)}>
              {tag.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-8 text-xl text-slate-400">
            <span className="flex items-center gap-3 font-medium"><Clock size={20} /> มาล่าสุด: <span className="text-white">{new Date(customer.lastVisitDate).toLocaleDateString('th-TH')}</span></span>
            <span className="flex items-center gap-3 font-medium"><UserCheck size={20} /> นวดสะสม: <span className="text-white font-black">{customer.totalVisits}</span> ครั้ง</span>
            <span className="flex items-center gap-3 font-black text-gold/80"><TrendingUp size={20} /> ยอดรวม: {formatCurrency(customer.totalSpent)}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 lg:max-w-md bg-navyLight p-8 rounded-[2rem] border-2 border-slate-800 group-hover:border-slate-700 transition-all shadow-inner">
         <div className="flex items-center gap-3 mb-3 text-xs font-black uppercase tracking-[0.4em] text-gold/80">
           <MessageSquare size={16} /> Memory
         </div>
         <p className="text-xl text-slate-300 font-semibold italic line-clamp-3 leading-[1.8] tracking-wide">
           "{customer.notes || 'ยังไม่มีบันทึกพิเศษค่ะพี่'}"
         </p>
      </div>

      <div className="flex justify-end lg:pl-6">
        <button className="w-20 h-20 bg-slate-800 hover:bg-gold text-white hover:text-navy rounded-[1.5rem] transition-all shadow-2xl flex items-center justify-center border-2 border-slate-700 hover:border-gold">
          <ChevronRight size={40} />
        </button>
      </div>
    </motion.div>
  );
}

function DollarSignIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}
