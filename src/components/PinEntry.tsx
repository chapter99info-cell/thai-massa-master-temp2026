import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Delete, LogIn, ShieldCheck, Lock as LockIcon } from 'lucide-react';
import { usePin } from '../contexts/PinContext';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

import { storeConfig, getAppSettings } from '../config';

export default function PinEntry() {
  const { t } = useLanguage();
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const { login } = usePin();
  const navigate = useNavigate();
  const settings = getAppSettings();

  const handleLogin = (pinToTry: string) => {
    const success = login(pinToTry);
    if (success) {
      if (pinToTry === '1111') navigate('/staff-dashboard');
      else if (pinToTry === '4444') {
        if (settings.showPosMode) {
          navigate('/manager-dashboard');
        } else {
          setIsError(true);
          setPin('');
        }
      }
      else if (pinToTry === '9999') navigate('/owner-report');
      else if (pinToTry === '7777') navigate('/super-admin');
    } else {
      setIsError(true);
      setPin('');
      // Shake animation is handled by motion on the container
    }
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setIsError(false);
      
      if (newPin.length === 4) {
        // Auto login when 4 digits are reached
        setTimeout(() => handleLogin(newPin), 100);
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
          <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto text-primary border border-primary/20 shadow-xl rotate-3">
            <ShieldCheck size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-serif font-bold text-white">{t('System Access / เข้าสู่ระบบ', 'System Access')}</h1>
            <p className="text-accent/40 uppercase tracking-[0.3em] text-[10px] font-black">{t('Secure POS Terminal', 'Secure POS Terminal')}</p>
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
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(184,150,46,0.2)]" 
                    : "border-white/5 bg-white/5"
                )}
              >
                {pin.length > i ? "*" : null}
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
            const isSpecial = val === 'Clear' || val === 'Login';
            
            return (
              <button
                key={val}
                onClick={() => {
                  if (val === 'Clear') handleClear();
                  else if (val === 'Login') handleLogin(pin);
                  else handleNumberClick(val);
                }}
                className={cn(
                  "h-20 rounded-2xl text-xl font-bold transition-all active:scale-95 flex items-center justify-center",
                  val === 'Login' 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 opacity-50 cursor-not-allowed" 
                    : val === 'Clear'
                    ? "bg-white/5 text-red-400 hover:bg-white/10"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
                disabled={val === 'Login'}
              >
                {val === 'Clear' ? <Delete size={24} /> : val === 'Login' ? <LogIn size={24} /> : val}
              </button>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-accent/20 text-[10px] uppercase tracking-widest font-bold">
            Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
