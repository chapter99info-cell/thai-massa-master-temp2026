import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, Heart } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { storeConfig } from '../config';
import { cn } from '../lib/utils';
import { usePin } from '../contexts/PinContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Chapter99Solution() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const location = useLocation();
  const { accessLevel, isAuthenticated } = usePin();
  const isInternal = isAuthenticated && (accessLevel === 'staff' || accessLevel === 'owner' || accessLevel === 'admin');
  
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-nong-mira', handleOpen);
    return () => window.removeEventListener('open-nong-mira', handleOpen);
  }, []);

  useEffect(() => {
    // Initial message based on view
    if (isInternal) {
      setMessages([{ role: 'ai', text: 'Hello! Chapter99 Solution (by Nong Mira) is ready to assist you with the system. How can I help today?' }]);
    } else {
      setMessages([{ role: 'ai', text: t('สวัสดีค่ะ! ยินดีต้อนรับสู่ Mira Thai Massage ค่ะ หนูคือ Chapter99 Solution (by น้องมิรา) ผู้ช่วย AI ของคุณพี่ค่ะ วันนี้ให้หนูช่วยแนะนำบริการไหนดีคะ?', 'Hi! How can I help you feel better today?') }]);
    }
  }, [isInternal, language]);

  if (storeConfig.packageTier < 3) return null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Contextual Help Logic
  const getContextualMessage = () => {
    if (!isInternal) {
      if (location.pathname === '/') {
        return t('สวัสดีค่ะ! สนใจนวดแบบไหนดีคะ? จองออนไลน์ได้ทันที หรือโทรหาเราได้เลยค่ะ!', 'Welcome! Looking for a massage? Book online now or give us a call!');
      }
      return null;
    }

    if (location.pathname === '/staff-dashboard' && accessLevel === 'staff') {
      return 'คุณพี่หมอเริ่มนวดแล้ว หนูเริ่มจับเวลาให้แล้วนะคะ สู้ๆ ค่ะ';
    }
    if (location.pathname === '/owner-dashboard' && accessLevel === 'owner') {
      return 'คุณพี่คะ คุณพี่หมอแจ้งว่าของบางอย่างใกล้หมดแล้ว ลองเช็คดูที่หน้าแจ้งเตือนนะคะ';
    }
    if (location.pathname === '/owner-report' && accessLevel === 'owner') {
      return 'คุณพี่เจ้าของร้านคะ ลูกค้าชำระเงินเรียบร้อยแล้ว หนูคำนวณภาษี GST และลง Sales Log ให้แล้วค่ะ';
    }
    if (location.pathname === '/super-admin' && accessLevel === 'admin') {
      return 'พี่แสนคะ เลือกเปิดฟีเจอร์ที่ลูกค้าคนนี้ซื้อได้เลยนะคะ เดี๋ยวหนูจะซ่อนส่วนที่เขาไม่ได้ซื้อไว้ให้เองค่ะ';
    }
    return null;
  };

  const bubbleMessage = getContextualMessage();
  const isManagerDashboard = location.pathname === '/manager-dashboard';

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = isInternal 
        ? `You are "Chapter99 Solution (by Nong Mira)", a polite, gentle, and supportive younger niece assistant for the staff and owner of "${storeConfig.storeName}".
           TONE: Strictly Thai, polite, using "คุณพี่", "คุณพี่หมอ", "คุณพี่เจ้าของร้าน", "พี่แสน", "นะคะ", "ค่ะ".
           ROLE: Help with shop operations, explain how to use the dashboard, and provide encouragement.
           STRICT RULES:
           1. NEVER use "ป้า".
           2. Always be supportive and admiring of your "Older Sisters/Brothers" (Pee).
           3. If talking to "Pee Saen" (Admin), focus on system architecture and configuration.`
        : `You are "Chapter99 Solution (by Nong Mira)", a professional and premium AI Concierge for "${storeConfig.storeName}", a high-end Thai Massage shop in Sydney.
           TONE: 100% English, professional, welcoming, and premium.
           ROLE: Help customers choose services, explain benefits of Thai massage, and provide shop info.
           STRICT RULES:
           1. NO Thai characters in the response.
           2. Focus on the luxury and health benefits of the treatments.
           Address: ${storeConfig.address}, Phone: ${storeConfig.phone}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction,
        },
      });

      const aiText = response.text || (isInternal ? "ขออภัยค่ะ Chapter99 Solution (by น้องมิรา) ไม่เข้าใจคำถาม ลองใหม่อีกครั้งนะคะ" : "I apologize, I didn't quite catch that. Could you please rephrase?");
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: isInternal ? "ขออภัยค่ะ ระบบขัดข้องเล็กน้อย ลองใหม่อีกครั้งนะคะ" : "I'm sorry, I'm having a bit of trouble. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[90]">
      {/* Contextual Help Bubble */}
      <AnimatePresence>
        {bubbleMessage && showBubble && !isOpen && (
          <motion.div
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragTransition={{
              modifyTarget: (target) => {
                const screenWidth = window.innerWidth;
                const bubbleWidth = 240;
                const padding = 24;
                const snapThreshold = screenWidth / 2;
                return Math.abs(target) > snapThreshold ? -(screenWidth - padding * 2 - bubbleWidth) : 0;
              },
              bounceStiffness: 600,
              bounceDamping: 20
            }}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-40 right-6 pointer-events-auto max-w-[240px] z-[100]"
          >
            <div className="relative bg-primary text-cream p-5 rounded-3xl shadow-2xl border border-white/10 text-xs font-medium leading-relaxed">
              <div className="font-sans">
                {isInternal ? bubbleMessage : "Hi! How can I help you feel better today?"}
              </div>
              <button 
                onClick={() => setShowBubble(false)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center border border-white/20 shadow-lg"
              >
                <X size={12} />
              </button>
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-primary transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      {!isManagerDashboard && (
        <motion.button
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          dragTransition={{
            modifyTarget: (target) => {
              const screenWidth = window.innerWidth;
              const buttonWidth = 64;
              const padding = 24;
              // Snap to left (0) or right (screenWidth - padding*2 - buttonWidth)
              // Since it starts at right-6, target is relative to that.
              // We want to snap to either 0 (stay right) or - (screenWidth - padding*2)
              const threshold = -(screenWidth / 2);
              return target < threshold ? -(screenWidth - padding * 2 - buttonWidth) : 0;
            },
            bounceStiffness: 400,
            bounceDamping: 30
          }}
          whileDrag={{ scale: 1.1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 pointer-events-auto w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center text-primary border-2 border-primary/5 scale-90 md:scale-100 origin-bottom-right group z-[100]"
        >
          <div className="relative w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform overflow-hidden">
            <img 
              src="https://picsum.photos/seed/mira/100/100" 
              alt="Chapter99 Solution" 
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors" />
            <span className="absolute inset-0 flex items-center justify-center text-white font-serif font-bold text-2xl drop-shadow-md">M</span>
          </div>
          {/* Pulse Effect */}
          <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping -z-10" />
        </motion.button>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            className="fixed inset-x-0 bottom-0 pointer-events-auto max-w-lg mx-auto h-[70vh] glass rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-primary/10 flex items-center justify-between bg-primary text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm relative">
                  <Heart size={20} fill="currentColor" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <span className="text-primary text-[10px] font-black">M</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg">
                    {isInternal ? 'Chapter99 Solution' : t('คุยกับ Chapter99 Solution 🇹🇭', 'Chapter99 Solution')}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-80">
                    {isInternal ? 'Your Personal Assistant' : t('ทูตวัฒนธรรมของ Chapter99 Solution', 'Premium Wellness Assistant')}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream/50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm font-sans",
                    msg.role === 'user' 
                      ? "ml-auto bg-primary text-white rounded-tr-none" 
                      : "mr-auto bg-white text-charcoal border border-primary/5 rounded-tl-none"
                  )}
                >
                  {msg.text}
                </div>
              ))}
              {isLoading && (
                <div className="mr-auto bg-white/50 p-3 rounded-2xl animate-pulse flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-white/80 backdrop-blur-sm border-t border-primary/5">
              {(isInternal ? [
                { label: 'วิธีใช้ระบบ', prompt: 'Chapter99 Solution (by น้องมิรา) คะ สอนวิธีใช้ระบบหน่อยค่ะ' },
                { label: 'สรุปยอดวันนี้', prompt: 'วันนี้ยอดขายเป็นยังไงบ้างคะ' },
                { label: 'ให้กำลังใจ', prompt: 'ขอกำลังใจหน่อยค่ะ Chapter99 Solution (by น้องมิรา)' }
              ] : [
                { label: 'Office Syndrome Relief', prompt: 'I have severe neck and shoulder pain. What do you recommend?' },
                { label: 'Relaxing Sleep', prompt: 'I am having trouble sleeping lately. Which massage helps?' },
                { label: 'Deep Tissue', prompt: 'I want a strong massage for muscle recovery.' }
              ]).map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    setInput(action.prompt);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="flex-shrink-0 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider hover:bg-primary/10 transition-colors font-sans"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-primary/10">
              <div className="flex items-center space-x-2 bg-cream rounded-full px-4 py-2 border border-primary/10 focus-within:border-primary transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isInternal ? "ถาม Chapter99 Solution (by น้องมิรา) ได้เลยนะคะ..." : t("ถาม Chapter99 Solution (by น้องมิรา) ได้เลยนะคะ...", "Ask Chapter99 Solution (by Nong Mira) anything...")}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 font-sans"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="text-primary disabled:opacity-30 p-1"
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
