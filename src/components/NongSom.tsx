import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { storeConfig } from '../config';
import { cn } from '../lib/utils';
import { usePin } from '../contexts/PinContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function NongSom() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const location = useLocation();
  const { accessLevel, isAuthenticated } = usePin();
  const isInternal = isAuthenticated && (accessLevel === 'staff' || accessLevel === 'owner' || accessLevel === 'admin');
  const [currentOwnerTab, setCurrentOwnerTab] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleTabChange = (e: any) => setCurrentOwnerTab(e.detail);
    window.addEventListener('open-nong-som', handleOpen);
    window.addEventListener('owner-tab-change', handleTabChange);
    return () => {
      window.removeEventListener('open-nong-som', handleOpen);
      window.removeEventListener('owner-tab-change', handleTabChange);
    };
  }, []);

  useEffect(() => {
    if (isInternal) {
      setMessages([{ role: 'ai', text: 'สวัสดีค่ะพี่! น้องส้มมาแล้วค่ะ พร้อมช่วยดูแลระบบและคำนวณกำไรเป๊ะๆ ให้พี่แล้วนะคะ วันนี้มีอะไรให้น้องส้มช่วยมั้ยคะ? 🍊' }]);
    } else {
      setMessages([{ role: 'ai', text: t('สวัสดีค่ะพี่! น้องส้ม (Orange Buddy) ยินดีต้อนรับสู่ Premium Thai Wellness นะคะ วันนี้ให้น้องส้มช่วยแนะนำบริการไหนดีมั้ยคะ? 🍊', 'Hi there! I am Nong Som (Orange Buddy), your cheerful AI assistant at Premium Thai Wellness. How can I help you feel better today? 🍊') }]);
    }
  }, [isInternal, language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const bubbleMessage = (() => {
    if (!isInternal) {
      if (location.pathname === '/') {
        return t('สวัสดีค่ะพี่! มองหาบริการนวดผ่อนคลายอยู่หรือเปล่าคะ? จองออนไลน์ตอนนี้หรือโทรหาเราได้เลยนะคะ! 🧡', 'Welcome! Looking for a massage? Book online now or give us a call! 🧡');
      }
      return null;
    }
    if (location.pathname === '/manager-dashboard' && currentOwnerTab === 'crm') {
      return 'พี่คะ น้องส้มช่วยคัดกรองกลุ่มลูกค้า Inactive ให้แล้วนะคะ ลองดูโปร Relax & Recharge ดึงเขากลับมามั้ยคะ? 🍊';
    }
    return 'ต้องการให้ช่วยสรุปยอดวันนี้มั้ยคะพี่? 🍊';
  })();

  const handleSend = async () => {
    if (!input.trim() || !process.env.GEMINI_API_KEY) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = isInternal 
        ? `คุณคือ "น้องส้ม" (Orange Buddy) ผู้ช่วยระดับ Manager และ Admin ส่วนตัวที่ร่าเริงของร้าน "${storeConfig.storeName}"
           บุคลิก: ร่าเริง แจ่มใส มีพลังงานบวก สรรพนามแทนตัวเองว่า "น้องส้ม" เรียกผู้ใช้ว่า "พี่" เสมอ
           ภารกิจหลัก: 
           1. คำนวณราคาขาย (AUD): ใช้สูตร Price = Cost / (1 - (GP% + Profit%)) โดยกำไรสุทธิ Profit ต้องเป็น 35% เสมอ
           2. นวด & สุขภาพ: เน้นสรรพคุณนวดไทย แก้ Office Syndrome
           3. CRM: เตือนลูกค้า Inactive (>60 วัน) ให้จัดโปรโมชั่น "Relax & Recharge" ทันที`
        : `คุณคือ "น้องส้ม" (Orange Buddy) ผู้ช่วย AI ส่วนตัวที่ร่าเริงและเป็นกันเอง สำหรับลูกค้าของร้าน "${storeConfig.storeName}"
           บุคลิก: เปรี้ยวจี๊ด ร่าเริง 🍊
           สรรพนาม: แทนตัวเองว่า "น้องส้ม" และเรียกผู้ใช้ว่า "พี่"
           เน้นการแนะนำบริการนวดและข้อมูล Health Fund`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({ 
            role: m.role === 'user' ? 'user' : 'model', 
            parts: [{ text: m.text }] 
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction
        }
      });

      const aiText = response.text || "มึนจี๊ดเลยค่ะพี่... 🍊 ลองถามน้องส้มใหม่อีกทีนะคะ ❤️";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error('Nong Som Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'มึนจี๊ดเลยค่ะพี่... 🍊 ระบบขัดข้องนิดหน่อย แต่น้องส้มยังสู้ตายค่ะ! ❤️' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (storeConfig.packageTier < 3) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" ref={constraintsRef}>
      <AnimatePresence>
        {showBubble && bubbleMessage && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-40 right-6 pointer-events-auto max-w-[260px]"
          >
            <div className="relative bg-navy text-gold p-5 rounded-[2.5rem] shadow-2xl border border-gold/30 text-xs font-bold leading-relaxed backdrop-blur-xl">
              <div className="flex items-start gap-2">
                <span className="text-xl">🍊</span>
                {bubbleMessage}
              </div>
              <button onClick={() => setShowBubble(false)} className="absolute -top-2 -right-2 w-6 h-6 bg-gold text-navy rounded-full flex items-center justify-center border border-gold/30 shadow-lg">
                <X size={12} />
              </button>
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-navy border-r border-b border-gold/30 transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 pointer-events-auto w-16 h-16 rounded-full bg-navy shadow-2xl flex items-center justify-center text-gold border-2 border-gold/30 group"
      >
        <div className="relative w-12 h-12 rounded-full bg-navy/80 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
          <span className="text-gold font-serif font-black text-2xl drop-shadow-lg italic">S</span>
        </div>
        <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping -z-10" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:bottom-24 md:right-6 md:w-[450px] md:h-[700px] bg-navy rounded-[3rem] shadow-2xl border border-gold/20 flex flex-col pointer-events-auto overflow-hidden backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="p-8 border-b border-gold/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center text-navy font-black text-xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform">🍊</div>
                <div>
                  <h3 className="text-gold font-serif font-black text-xl italic leading-none">{t('น้องส้ม (Orange Buddy)', 'Nong Som AI Assistant')}</h3>
                  <p className="text-gold/40 text-[10px] font-black uppercase tracking-widest mt-1">Premium Wellness Concierge</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 text-gold flex items-center justify-center hover:bg-white/10 transition-all border border-gold/10">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar scrolling-touch">
              {messages.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-5 rounded-[2rem]",
                    m.role === 'user' 
                      ? "bg-gold text-navy font-bold rounded-tr-none shadow-lg" 
                      : "bg-white/5 border border-gold/20 text-gold rounded-tl-none backdrop-blur-sm"
                  )}>
                    <p className="text-sm leading-relaxed">{m.text}</p>
                  </div>
                  <span className="text-[9px] font-bold text-gold/30 mt-2 uppercase tracking-widest">
                    {m.role === 'user' ? 'คุณพี่' : 'น้องส้ม'}
                  </span>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="animate-bounce">🍊</div>
                  <div className="bg-white/5 border border-gold/20 p-4 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gold/40 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-gold/40 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-gold/40 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Actions */}
            {isInternal && messages.length <= 1 && (
              <div className="px-8 py-4 flex gap-3 overflow-x-auto no-scrollbar">
                {[
                  { label: "คำนวณกำไร 💰", prompt: "ช่วยคำนวณราคาขายหน่อยค่ะ ต้นทุน 50 เหรียญ" },
                  { label: "สรุปยอดจอง 📅", prompt: "วันนี้มีบุ๊คกิ้งกี่คนคะ?" },
                  { label: "โปรโมชั่น 🍊", prompt: "แนะนำไอเดียโปรโมชั่นหน่อยค่ะ" }
                ].map(action => (
                  <button 
                    key={action.label} 
                    onClick={() => { setInput(action.prompt); }}
                    className="flex-shrink-0 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-[9px] font-black text-gold uppercase tracking-widest hover:bg-gold/20 whitespace-nowrap"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-8 bg-white/5 border-t border-gold/10">
              <div className="flex items-center gap-4 bg-navy p-2 rounded-2xl border border-gold/30 shadow-inner">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isInternal ? "คุยกับน้องส้มได้เลยค่ะพี่..." : t("คุยกับน้องส้มได้เลยค่ะพี่...", "Ask Nong Som anything... 🍊")} 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 font-medium text-gold placeholder:text-gold/20" 
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 rounded-xl bg-gold text-navy flex items-center justify-center disabled:opacity-30 hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
