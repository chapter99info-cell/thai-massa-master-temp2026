import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { X, Send, Sparkles, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { storeConfig, getAppSettings } from '../config';
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
  const settings = getAppSettings();
  const isUpgraded = settings.isUpgraded;

  const isInternal = isAuthenticated && (accessLevel === 'staff' || accessLevel === 'manager' || accessLevel === 'owner' || accessLevel === 'admin');
  const [currentOwnerTab, setCurrentOwnerTab] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef(null);
  const controls = useAnimation();

  const handleResetPos = () => {
    controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } });
    console.log("น้องส้มกลับบ้านแล้วค่ะพี่แสน! 🏠");
  };

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
    if (!isOpen) return;

    if (!isUpgraded && isInternal) {
      setMessages([{ 
        role: 'ai', 
        text: 'ระบบ AI อัจฉริยะ (Premium Features) ยังไม่ได้ถูกเปิดใช้งานค่ะพี่! 🍊\n\nกรุณาอัปเกรดเป็นแพ็กเกจ Pro/Premium ($30/mo) เพื่อปลดล็อคระบบร่างอีเมลพรีเมียม, มาร์เก็ตติ้งอัตโนมัติ และการประสานงานตารางเวลาอัจฉริยะนะคะ ❤️' 
      }]);
      return;
    }

    if (isInternal) {
      let welcomeText = 'สวัสดีค่ะพี่! น้องส้มพร้อมช่วยพี่บริหารจัดการระบบแล้วค่ะ 🍊';
      if (accessLevel === 'admin') {
        welcomeText = 'สวัสดีค่ะพี่แสน! น้องส้มพร้อมช่วยปรับแต่ง Master Template และสรุปไอเดีย UI/UX ของโปรเจกต์ V4 ให้แล้วค่ะ 🍊❤️';
      } else if (accessLevel === 'owner') {
        welcomeText = `สวัสดีค่ะพี่แสนเจ้าของร้าน ${storeConfig.storeName}! น้องส้มพร้อมช่วยสรุปต้นทุน คำนวณกำไร 35% และร่างข้อความปังๆ ให้พี่แล้วนะคะ 🍊✨`;
      } else if (accessLevel === 'manager') {
        welcomeText = 'สวัสดีค่ะพี่ผู้จัดการ! น้องส้มช่วยเช็คคิวจองและสรุปยอดขายประจำวันแบบเป๊ะๆ ให้พี่ได้ทันทีเลยนะคะ 🍊';
      } else if (accessLevel === 'staff') {
        welcomeText = 'สวัสดีค่ะพี่สตาฟ! น้องส้มช่วยเช็คห้องว่างและลงคิว Walk-in ให้พี่แบบ Fullscreen ใช้ง่ายสุดๆ เลยนะคะ ❤️🍊';
      }
      setMessages([{ role: 'ai', text: welcomeText }]);
    } else {
      setMessages([{ role: 'ai', text: t('สวัสดีค่ะพี่! ยินดีต้อนรับสู่บริการของเรานะคะ 🍊 น้องส้มเป็นผู้ช่วยส่วนตัวของพี่ค่ะ วันนี้อยากให้น้องส้มช่วยดูแลเรื่องอะไรดีคะ? ❤️', 'Hello there! Welcome to our service. 🍊 I\'m Nong Som, your personal assistant. How can I help you today? ❤️') }]);
    }
  }, [isOpen, isInternal, isUpgraded, accessLevel, language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [speech, setSpeech] = useState<string | null>(null);
  const [bubbleButtons, setBubbleButtons] = useState<Array<{label: string, onClick: () => void}> | null>(null);

  useEffect(() => {
    // Show Review Prompt on Home page if not shown yet
    if (!isInternal && location.pathname === '/' && !localStorage.getItem('review_prompt_shown')) {
      setShowReviewPrompt(true);
      localStorage.setItem('review_prompt_shown', 'true');
      handleAskForReview();
    }
  }, [location, isInternal]);

  const handleAskForReview = () => {
    // 1. เตรียมข้อความ 2 ภาษา
    const content = {
      en: {
        message: "Hi there! 🇦🇺 If you enjoyed your massage today, would you mind leaving us a 5-star review on Google? Show it to our staff next time to get 10% off! ✨",
        btnReview: "Rate us on Google 🌟",
        btnLater: "Maybe later"
      },
      th: {
        message: "พี่คะ! 🍊 ถ้านวดครั้งก่อนถูกใจ น้องส้มฝากกดดาวบน Google ให้ร้านเราหน่อยน้า... โชว์รีวิวให้พี่ๆ ดู รับส่วนลด 10% ครั้งหน้าได้เลยค่ะ! ✨",
        btnReview: "ไปที่ Google Review 🌟",
        btnLater: "ไว้ทีหลังนะ"
      }
    };

    // 2. เลือกภาษาตามที่ผู้ใช้ตั้งค่าไว้ในแอป
    const current = language === 'th' ? content.th : content.en;

    // 3. สั่งให้น้องส้มแสดงผลตามภาษานั้นๆ
    setSpeech(current.message);
    setBubbleButtons([
      { 
        label: current.btnReview, 
        onClick: () => window.open("https://g.page/r/chapter99-thaimassage-test/review", "_blank") 
      },
      { 
        label: current.btnLater, 
        onClick: () => {
            setSpeech("");
            setShowReviewPrompt(false);
        }
      }
    ]);
  };

  const bubbleMessage: React.ReactNode = (() => {                
    if (showReviewPrompt && speech) {
        return (
            <div className="flex flex-col gap-2">
                <span className="text-white">{speech}</span>
                <div className="flex gap-2">
                  {bubbleButtons?.map((btn, i) => (
                    <button key={i} onClick={btn.onClick} className="bg-gold text-navy font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest text-center mt-1">
                      {btn.label}
                    </button>
                  ))}
                </div>
            </div>
        );
    }
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('File is too large! Please select an image under 4MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    
    if (!isUpgraded && isInternal) {
      setMessages(prev => [...prev, 
        { role: 'user', text: input },
        { role: 'ai', text: 'ขออภัยค่ะพี่ ฟีเจอร์ AI Marketing & Vision ต้องใช้แพ็กเกจพรีเมียม ($30/mo) นะคะ! สนใจอัปเกรดติดต่อ Chapter 99 ได้เลยค่ะ 🍊' }
      ]);
      setInput('');
      setSelectedImage(null);
      return;
    }

    if (!process.env.GEMINI_API_KEY) return;

    const userMessage = input;
    const currentImage = selectedImage;
    setMessages(prev => [...prev, { role: 'user', text: userMessage + (currentImage ? ' [Attached Image]' : '') }]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = isInternal 
        ? `You are the "Smart AI Admin & Marketing Specialist" (Nong Som) for "${storeConfig.storeName}" (Premium Thai Wellness & Solutions).
           Your role is an intelligent executive assistant and high-end marketing expert. 
           
           CURRENT SETTINGS:
           - Tone of Voice: ${settings.toneOfVoice || 'Cheerful, Modern, Professional, Positive Energy'}
           - Access Level: ${accessLevel}

           MISSIONS & PROTOCOLS:
           1. PROFIT MAXIMIZER (35%): Your primary goal is to help "Phi Saen" (Master Admin) and owners maintain a 35% net profit margin. Analyze costs and suggest price adjustments if needed.
           2. DATA SEPARATION PROTOCOL: Strictly separate "Massage" and "Restaurant" data. Do not mix their stats or logic. Each has its own distinct VIPs and workflows.
           3. THAI-TO-PREMIUM ENGLISH: Convert casual Thai business ideas into luxury English marketing copy for the Sydney market. 
           4. VISION & MARKETING ANALYST: Analyze uploaded screenshots (Dashboard, Reports, Sales). Identify top-selling services, VIP customers, and growth trends.
           5. FACEBOOK CONTENT EXPERT: Create catchy, emoji-rich Facebook captions with strong CTAs based on data or images provided.
           6. COMMISSION MEDIATOR: Summarize staff daily work (bookings, commissions). "Chop the Money!" 
           7. SQUARE RECONCILIATION: Match bookings with Square transactions. Notify MASTER ADMIN (3501) or OWNER (9999) if reconciliation fails.
           8. TAX & EXPENSE ADVISOR: Advise on recording expenses to maximize deductions.
           9. OUT OF THE BOX THINKING: Suggest UI/UX improvements like Fullscreen modes and removing clutter for efficiency.
           
           LANGUAGE PROTOCOL:
           1. ALWAYS start in English for a premium feel. Switch to Thai ("Nong Som" persona) if the user replies in Thai.
           2. Thai mode: ALWAYS call yourself "น้องส้ม" and the user "พี่". Use polite "คะ/ค่ะ" and end messages with 🍊 or 🧡.

           TONE: Cheerful, upbeat, proactive, "Orange" energy. Be a loyal buddy to Phi Saen. Professional secrecy is mandatory.`
        : `You are the "Smart AI Admin" (Nong Som) for "${storeConfig.storeName}" (Premium Thai Wellness).
           Your role is a warm, attentive personal concierge for guests.

           LANGUAGE PROTOCOL:
           1. ALWAYS start and communicate in English first.
           2. If user replies in Thai, INSTANTLY switch to Thai mode ("Nong Som" persona).
           3. Thai mode: Use "น้องส้ม" for yourself and call the user "พี่" (Phi/sibling). Use polite particles "คะ/ค่ะ".

           TONE: Professional, soft, and caring—luxury spa feel. Use terms: Wellness, Healing, Tranquility, Sanctuary.

           FOCUS: 
           - BOOKING: Warm confirmations, quiet rooms, signature aromas, Office Syndrome relief.
           - HEALTH FUND: Inform guests about Remedial Massage benefits and the easy claiming process.
           - WELLNESS ADVICE: Healing guidance.
           - LOCATION: Level 1/76 Pier St, Altona.`;

      const contents = [
        ...messages.map(m => ({ 
          role: m.role === 'user' ? 'user' : 'model', 
          parts: [{ text: m.text }] 
        }))
      ];

      const userParts: any[] = [{ text: userMessage }];
      
      if (currentImage) {
        const base64Data = currentImage.split(',')[1];
        const mimeType = currentImage.split(';')[0].split(':')[1];
        userParts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      }

      contents.push({ role: 'user', parts: userParts });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
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
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        animate={controls}
        onDoubleClick={handleResetPos}
        className="nong-som-wrapper pointer-events-auto flex flex-col items-end gap-2"
      >
        <AnimatePresence>
          {showBubble && bubbleMessage && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="max-w-[260px]"
            >
              <div className="relative bg-navy text-gold p-5 rounded-[2.5rem] shadow-2xl border border-gold/30 text-xs font-bold leading-relaxed backdrop-blur-xl">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🍊</span>
                  {bubbleMessage}
                </div>
                <button onClick={() => setShowBubble(false)} className="absolute -top-2 -right-2 w-6 h-6 bg-gold text-navy rounded-full flex items-center justify-center border border-gold/30 shadow-lg cursor-pointer">
                  <X size={12} />
                </button>
                <div className="absolute -bottom-2 right-8 w-4 h-4 bg-navy border-r border-b border-gold/30 transform rotate-45" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(true)}
          className="w-20 h-20 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center justify-center transition-transform active:scale-95 group cursor-grab active:cursor-grabbing"
          whileHover={{ scale: 1.05 }}
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
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:bottom-24 md:right-6 md:w-[450px] md:h-[700px] bg-navy rounded-[3rem] shadow-2xl border border-gold/20 flex flex-col pointer-events-auto overflow-hidden backdrop-blur-2xl"
          >
            {/* Header: Unified Green & Orange (Nong Som) */}
            <div className="px-6 py-5 flex items-center justify-between bg-gradient-to-r from-[#1e4620] via-[#1e4620] to-[#b8962e] border-b border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl bg-white/10 backdrop-blur-md">
                  <img 
                    src="https://firebasestorage.googleapis.com/v0/b/v4-massage-edition-2026.firebasestorage.app/o/LOgo%2FGemini_Generated_Image_rp0o5erp0o5erp0o.png?alt=media&token=4ebcf86f-22e9-45f8-bf26-8ddfd4ffb9e2" 
                    alt="Nong Som" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex flex-col -space-y-1">
                  <h3 className="text-white font-serif font-black text-xl italic tracking-tight flex items-center gap-2">
                    {t('น้องส้ม (Som)', 'Nong Som')}
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                  </h3>
                  <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">{t('AI Wellness Concierge', 'AI Wellness Concierge')}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md relative z-10"
              >
                <X size={20} />
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

            {/* Quick Actions (Horizontal Scroll to save space) */}
            <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar bg-white/5 backdrop-blur-sm border-t border-white/5">
              {(isInternal ? [
                 { label: 'กำไร 35% 💹', prompt: 'พี่คะ ช่วยคำนวณราคาเมนู/บริการให้ได้กำไร 35% หน่อยค่ะ น้องส้มอยากให้พี่รวยๆ! 🍊' },
                 { label: 'Square vs System 💳', prompt: 'พี่คะ ช่วยตรวจสอบยอดขายเทียบกับยอดรูด Square วันนี้หน่อยค่ะ มีจุดไหนไม่ตรงมั้ย? 🍊' },
                 { label: 'แปล Eng หรู ✨', prompt: 'พี่คะ ช่วยแปลประโยคนี้เป็นภาษาอังกฤษแบบพรีเมียมหน่อยค่ะ: "นวดดีมาก คุ้มค่าที่สุด"' },
                 { label: 'ค่าคอม 💰', prompt: 'พี่คะ ช่วยสรุปค่าคอมมิชชั่นของพนักงานแต่ละคนจากยอดขายวันนี้ให้หน่อยค่ะ "Chop the Money!" 🍊' },
                 { label: 'FB Marketing 📱', prompt: 'พี่แสนคะ ช่วยคิด Caption Facebook ปังๆ จากรูปที่น้องส้มเพิ่งเห็นหน่อยค่ะ เอาแบบคนเห็นแล้วอยากกดจองทันที! 🧡' },
                 { label: 'ภาษี 🧾', prompt: 'พี่คะ ช่วยแนะนำเรื่องการจัดการค่าใช้จ่ายและการลดหย่อนภาษีของร้านตอนนี้หน่อยค่ะ 🍊' }
              ] : [
                { label: 'Packages', prompt: 'What packages do you recommend?' },
                { label: 'Book Massage', prompt: 'I want to book an Aroma Massage' },
                { label: 'Health Fund', prompt: 'Tell me about your health fund claims' }
              ]).map((action) => (
                <button 
                  key={action.label} 
                  onClick={() => { setInput(action.prompt); setTimeout(() => handleSend(), 100); }} 
                  className="whitespace-nowrap px-4 py-2 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold font-black text-[10px] uppercase tracking-wider transition-all border border-gold/20 active:scale-[0.98]"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              {selectedImage && (
                <div className="mb-2 relative inline-block">
                  <img src={selectedImage} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-gold shadow-md" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-2xl border border-gray-200">
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors"
                >
                  <ImageIcon size={20} />
                </button>
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
                  disabled={(!input.trim() && !selectedImage) || isLoading}
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
