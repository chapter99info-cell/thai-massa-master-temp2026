import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Clock, LogOut } from 'lucide-react';
import { usePin } from '../contexts/PinContext';

export default function SessionWarning() {
  const { showSessionWarning, resetTimer, logout } = usePin();

  return (
    <AnimatePresence>
      {showSessionWarning && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-navy/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[3rem] p-12 max-w-xl w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] border-t-[12px] border-amber-500 text-center space-y-8"
          >
            <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
              <Clock size={48} className="animate-pulse" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-4xl font-serif font-black text-charcoal italic tracking-tight">Session Timing Out</h3>
              <p className="text-xl text-slate-500 font-medium">You have been inactive for a while. For security, you will be automatically logged out in less than 1 minute.</p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={resetTimer}
                className="w-full py-6 bg-charcoal text-white rounded-2xl text-xl font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl"
              >
                Continue Session
              </button>
              <button
                onClick={logout}
                className="w-full py-4 text-slate-400 hover:text-rose-500 font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Logout Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
