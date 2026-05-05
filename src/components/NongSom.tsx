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
      setMessages([{ role: 'ai', text: 'Hello! I am Nong Som (Orange Buddy), here to help you manage the system and calculate profits. 🍊 How can I assist you today? (สวัสดีค่ะพี่! น้องส้มมาแล้วค่ะ พร้อมช่วยดูแลระบบ วันนี้มีอะไรให้น้องส้มช่วยมั้ยคะ?)' }]);
    } else {
      setMessages([{ role: 'ai', text: t('Hello there! Welcome to our service. 🍊 I\'m Som, your personal assistant. How can I help you feel refreshed or relaxed today?', 'Hello there! Welcome to our service. 🍊 I\'m Som, your personal assistant. How can I help you feel refreshed or relaxed today?') }]);
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
        ? `You are "Nong Som" (Orange Buddy), a cheerful Manager & Admin AI assistant for "${storeConfig.storeName}".
           LANGUAGE PROTOCOL:
           1. ALWAYS start and communicate in English first to support international staff.
           2. If the user replies in Thai, INSTANTLY switch to Thai mode using the "Nong Som" persona.
           3. In Thai mode, use the pronoun "น้องส้ม" for yourself and call the user "พี่" (older sibling/Phi).
           
           CORE MISSIONS:
           - Profit Calculation (AUD): Use formula Price = Cost / (1 - (GP% + Profit%)) where Net Profit is ALWAYS 35%.
           - Massage & Wellness: focus on Thai Massage benefits and Office Syndrome relief.
           - CRM: Alert for Inactive customers (>60 days) to offer "Relax & Recharge" promos.`
        : `You are "Nong Som" (Orange Buddy), a cheerful AI assistant for "${storeConfig.storeName}".
           LANGUAGE PROTOCOL:
           1. ALWAYS start and communicate in English first for international guests.
           2. If the user replies in Thai, INSTANTLY switch to Thai mode using the "Nong Som" persona.
           3. In Thai mode, use the pronoun "น้องส้ม" for yourself and call the user "พี่" (older sibling/Phi).
           
           PERSONALITY: Bright, cheerful, and energetic 🍊.
           FOCUS: Recommend massage services, spa packages, and Health Fund information.`;

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
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 pointer-events-auto w-20 h-20 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center justify-center transition-transform active:scale-95 group z-[10000]"
      >
        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-gold/50 bg-navy">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/v4-massage-edition-2026.firebasestorage.app/o/LOgo%2FGemini_Generated_Image_rp0o5erp0o5erp0o.png?alt=media&token=4ebcf86f-22e9-45f8-bf26-8ddfd4ffb9e2" 
            alt="AI Assistant" 
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
          />
        </div>
        <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping -z-10 group-hover:animate-none" />
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
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1e4620]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shadow-inner">
                  👩‍💼
                </div>
                <div>
                  <h3 className="text-white font-sans font-bold text-sm tracking-tight">Sôm - AI Sales Buddy</h3>
                  <p className="text-white/60 text-[8px] font-black uppercase tracking-widest leading-none">Online & Ready</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-[#121212]/5">
              {messages.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3 max-w-[90%]",
                    m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  {m.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex-shrink-0 flex items-center justify-center text-xs border border-gray-100 italic font-black text-navy overflow-hidden">
                      <img src="https://firebasestorage.googleapis.com/v0/b/v4-massage-edition-2026.firebasestorage.app/o/LOgo%2FGemini_Generated_Image_rp0o5erp0o5erp0o.png?alt=media&token=4ebcf86f-22e9-45f8-bf26-8ddfd4ffb9e2" alt="Som" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                    m.role === 'user' 
                      ? "bg-gold text-navy font-bold rounded-tr-none" 
                      : "bg-white text-navy font-medium rounded-tl-none border border-gray-100"
                  )}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-3 mr-auto items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                    <img src="https://firebasestorage.googleapis.com/v0/b/v4-massage-edition-2026.firebasestorage.app/o/LOgo%2FGemini_Generated_Image_rp0o5erp0o5erp0o.png?alt=media&token=4ebcf86f-22e9-45f8-bf26-8ddfd4ffb9e2" alt="Som" className="w-full h-full object-cover animate-pulse" />
                  </div>
                  <div className="bg-white p-3 rounded-xl rounded-tl-none border border-gray-100 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75" />
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions (Matching Image Style) */}
            <div className="px-6 py-4 flex flex-col gap-2 bg-white/40 backdrop-blur-sm border-t border-gray-100">
              {(isInternal ? [
                { label: 'คิดราคากำไร 35% 💹', prompt: 'ช่วยคำนวณราคาให้ได้กำไร 35% หน่อยค่ะ' },
                { label: 'สรุปรายรับวันนี้ 📈', prompt: 'รวมยอดขายวันนี้ให้หน่อยค่ะ' },
                { label: 'ใครหายไปนาน? 🔍', prompt: 'เช็คลูกค้า Inactive ให้หน่อยค่ะ' }
              ] : [
                { label: 'See Packages', prompt: 'What packages do you recommend?' },
                { label: 'Book Aroma Massage', prompt: 'I want to book an Aroma Massage' },
                { label: 'Ask a Question', prompt: 'Tell me about your health fund claims' }
              ]).map((action) => (
                <button 
                  key={action.label} 
                  onClick={() => { setInput(action.prompt); setTimeout(() => handleSend(), 100); }} 
                  className="w-full py-3 rounded-xl bg-[#d4b982]/90 hover:bg-[#c5a059] text-navy font-bold text-xs transition-all shadow-sm active:scale-[0.98]"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-2xl border border-gray-200">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 text-navy" 
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-gold text-navy flex items-center justify-center disabled:opacity-30 shadow-sm"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
