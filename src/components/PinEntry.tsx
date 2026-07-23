import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Delete, LogIn, ShieldCheck, Lock as LockIcon, ArrowLeft } from 'lucide-react';
import { usePin } from '../contexts/PinContext';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

import { storeConfig, getAppSettings } from '../config';

export default function PinEntry() {
  const { t } = useLanguage();
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { login } = usePin();
  const navigate = useNavigate();
  const settings = getAppSettings();

  const handleLogin = (pinToTry: string) => {
    const level = login(pinToTry);

    if (!level) {
      // ❌ รหัสผิด: แสดง Error
      setIsError(true);
      setPin('');
      return;
    }

    // ✅ รหัสถูกต้อง: พาวิ่งไปหน้า Dashboard ตามสิทธิ์ที่ได้จริง (ไม่ผูกกับรหัสตายตัว
    // เพื่อให้ยังใช้งานได้แม้เจ้าของ/แอดมินจะเปลี่ยนรหัส PIN ในภายหลัง)
    if (level === 'manager' && !settings.showPosMode) {
      setIsError(true);
      setPin('');
      return;
    }

    const routesByLevel: Record<NonNullable<typeof level>, string> = {
      admin: '/super-admin',
      owner: '/owner-report',
      manager: '/manager-dashboard',
      staff: '/staff-dashboard',
    };
    navigate(routesByLevel[level]);
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setIsError(false); // ล้างข้อความ Error ทันทีที่เริ่มพิมพ์ใหม่
      
      if (newPin.length === 4) {
        // รอ 0.3 วินาทีให้คนดูทันว่ากดครบแล้วค่อยเช็ค
        setTimeout(() => {
          handleLogin(newPin);
        }, 300);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setIsError(false);
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'Login'];

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-6">
      <motion.div
        animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-10"
      >
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gold/10 rounded-[2rem] flex items-center justify-center mx-auto text-gold border border-gold/20 shadow-xl rotate-3">
            <LockIcon size={48} />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-serif font-bold text-white">{t('Staff Portal / เข้าใช้งานระบบ', 'Staff Portal')}</h1>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
              <p className="text-gold/60 uppercase tracking-[0.3em] text-[10px] font-black">{t('AUTHORIZED PERSONNEL ONLY', 'AUTHORIZED PERSONNEL ONLY')}</p>
              <p className="text-white/40 text-[11px] leading-relaxed italic">
                {t('This area is for authorized staff only. Please return to our booking page if you are a customer.', 'พื้นที่นี้สำหรับทีมงานเท่านั้นค่ะ หากคุณลูกค้าต้องการจองนวด กรุณากลับไปยังหน้าหลักนะคะ')}
              </p>
            </div>
          </div>
        </div>

        {/* PIN Display */}
        <div className="space-y-6">
          <div className="flex justify-center gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-16 h-16 rounded-3xl border-4 flex items-center justify-center transition-all duration-300 text-3xl font-black",
                  pin.length > i 
                    ? "border-gold bg-gold/10 text-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
                    : "border-white/5 bg-white/5"
                )}
              >
                {pin.length > i ? (
                  <div className="w-4 h-4 bg-gold rounded-full shadow-[0_0_10px_gold]" />
                ) : null}
              </div>
            ))}
          </div>
          <AnimatePresence>
            {isError && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-red-400 text-sm font-bold bg-red-400/10 py-3 rounded-2xl border border-red-400/20"
              >
                {t('รหัสไม่ถูกต้องค่ะ ลองใหม่อีกครั้งนะคะคุณพี่', 'Invalid PIN. Please try again.')}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-4">
          {numbers.map((val) => {
            const isSubmit = val === 'Login';
            const isClear = val === 'Clear';
            
            return (
              <button
                key={val}
                onClick={() => {
                  if (isClear) handleClear();
                  else if (isSubmit) {
                    if (pin.length === 4) handleLogin(pin);
                  }
                  else handleNumberClick(val);
                }}
                className={cn(
                  "h-20 rounded-2xl text-xl font-bold transition-all active:scale-95 flex items-center justify-center",
                  isSubmit 
                    ? pin.length === 4 
                      ? "bg-gold text-navy shadow-lg shadow-gold/20" 
                      : "bg-gold/20 text-gold/20 cursor-not-allowed"
                    : isClear
                    ? "bg-white/5 text-red-400 hover:bg-white/10"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                {val === 'Clear' ? <Delete size={24} /> : val === 'Login' ? <LogIn size={24} /> : val}
              </button>
            );
          })}
        </div>

        <div className="text-center space-y-4">
          <p className="text-accent/20 text-[10px] uppercase tracking-widest font-bold">
            Authorized Personnel Only
          </p>
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gold/40 hover:text-gold transition-all text-[11px] font-black uppercase tracking-[0.2em] group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            {t('Back to Website', 'กลับสู่หน้าหลัก')}
          </button>
        </div>

        {/* Resend Email Section */}
        <div className="pt-8 mt-8 border-t border-white/5 space-y-4">
          <p className="text-sm text-white/40 italic">
            {t("Didn't receive your credentials? Enter your registered email to resend:", "ไม่ได้รับรหัสผ่านทางอีเมล? กรอกอีเมลที่ลงทะเบียนไว้เพื่อให้ระบบส่งผลอีกครั้งนะคะ")}
          </p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="yourname@example.com"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
            <button 
              onClick={() => {
                setResendSuccess(true);
                setTimeout(() => setResendSuccess(false), 5000);
              }}
              className="bg-navy text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-navy/80 transition-all border border-white/10"
            >
              {t('ส่งอีกครั้ง', 'Resend')}
            </button>
          </div>
          <AnimatePresence>
            {resendSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center"
              >
                <p className="text-emerald-400 text-[11px] font-bold">
                  {t('Confirmation email has been resent to your inbox!', 'ระบบได้ส่งอีเมลยืนยันไปยังกล่องข้อความของคุณแล้วค่ะ!')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
