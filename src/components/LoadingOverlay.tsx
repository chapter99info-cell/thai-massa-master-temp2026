import React from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message }: LoadingOverlayProps) {
  const { t } = useLanguage();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-forest/40 backdrop-blur-md flex items-center justify-center p-6"
    >
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/20 max-w-sm w-full text-center space-y-6">
        <div className="relative w-20 h-20 mx-auto">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 rounded-3xl gold-gradient opacity-20 blur-xl"
          />
          <div className="absolute inset-0 rounded-3xl gold-gradient flex items-center justify-center text-white shadow-xl">
            <Heart size={32} fill="currentColor" className="animate-pulse" />
          </div>
          <motion.div
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2 text-accent"
          >
            <Sparkles size={20} />
          </motion.div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-serif font-bold text-forest">
            {t('กำลังเตรียมความสุขให้คุณพี่นะคะ...', 'Preparing your experience...')}
          </h3>
          <p className="text-accent/70 text-xs font-medium uppercase tracking-widest leading-relaxed">
            {message || t('Chapter99 Solution (by น้องมิรา) กำลังจัดการข้อมูลให้อย่างรวดเร็วค่ะ โปรดรอสักครู่นะคะ', 'Chapter99 Solution (by Nong Mira) is processing your request. Please wait a moment.')}
          </p>
        </div>

        <div className="flex justify-center space-x-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity, 
                delay: i * 0.15 
              }}
              className="w-2 h-2 rounded-full bg-accent"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
