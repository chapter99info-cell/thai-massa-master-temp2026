import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  Phone, 
  CreditCard, 
  Clock, 
  User, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Plus, 
  Calendar, 
  ChevronRight, 
  Store, 
  Apple, 
  Smartphone, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useBookings } from '../contexts/BookingContext';
import { storeConfig } from '../config';
import ServiceImage from './ServiceImage';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

type CheckoutStep = 'summary' | 'details' | 'payment' | 'success';

export default function Cart() {
  const { cart, removeFromCart, totalPrice, totalItems, addToCart, clearCart } = useCart();
  const { addBooking, beds } = useBookings();
  const { t } = useLanguage();
  
  const [step, setStep] = useState<CheckoutStep>('summary');
  const [showUpsell, setShowUpsell] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Details Step State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [healthFund, setHealthFund] = useState<string | null>(null);
  
  // Payment Step State
  const [paymentOption, setPaymentOption] = useState<'clinic' | 'online'>('clinic');

  const depositAmount = 20.00;
  const systemFeeRate = 0.005;
  const systemFee = totalPrice * systemFeeRate;

  const timeSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'];
  const healthFunds = ['BUPA', 'Medibank', 'HCF', 'NIB', 'AHM', 'Other'];

  const handleNextStep = () => {
    if (step === 'summary') {
      const hasHotStone = cart.some(item => item.name.includes('Hot Stone') || (item.englishName?.includes('Hot Stone') ?? false));
      if (storeConfig.packageTier >= 3 && !hasHotStone) {
        setShowUpsell(true);
        return;
      }
      setStep('details');
    } else if (step === 'details') {
      setStep('payment');
    }
  };

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    
    // Find an available bed of the right type
    const serviceType = cart[0].category === 'FACIAL' ? 'Facial' : 'Massage';
    const availableBed = beds.find(b => b.status === 'Vacant' && b.type === serviceType);

    const bookingData = {
      customerName: 'Guest Customer', // In a real app, get from auth or form
      serviceName: cart[0].name,
      serviceEnglishName: cart[0].englishName,
      therapistName: cart[0].therapist?.name || 'Any Available',
      therapistId: cart[0].therapist?.id || 'any',
      price: cart[0].selectedPrice,
      durationMins: cart[0].durationMins,
      timeSlot: selectedTime,
      date: selectedDate,
      healthFund: healthFund,
      paymentMethod: paymentOption,
      bedId: availableBed?.id,
      status: 'Reserved',
      timestamp: new Date().toISOString()
    };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add to shared booking state (Manager Dashboard will see this)
      addBooking(bookingData);
      
      setStep('success');
      clearCart();
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const addHotStoneUpsell = () => {
    const hotStoneService = {
      id: 'upsell-hot-stone',
      name: 'นวดหินร้อน 15 นาที',
      englishName: '15-min Hot Stone Therapy',
      description: 'บริการเสริม: หินร้อนช่วยคลายความเครียดและกล้ามเนื้อ',
      englishDescription: 'Add-on: Soothing heated stones to melt away tension.',
      standardPrice: 15,
      earlyBirdPrice: 15,
      weekendPrice: 15,
      durationMins: 15,
      category: 'ADD_ON',
      imageUrl: 'https://picsum.photos/seed/hot-stone/400/400',
    };
    addToCart(hotStoneService as any, 15);
    setShowUpsell(false);
    setStep('details');
  };

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center text-accent/20">
          <Clock size={40} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-charcoal">{t('รายการจองของคุณว่างเปล่า', 'Your Summary is Empty')}</h2>
        <p className="text-accent/60 max-w-xs">{t('คุณยังไม่ได้เลือกทรีทเมนท์ใดๆ สำรวจบริการของเราเพื่อเริ่มต้นการเดินทางของคุณ', "You haven't selected any treatments yet. Explore our services to begin your journey.")}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-8 pb-20">
      {/* Progress Stepper */}
      {step !== 'success' && (
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { id: 'summary', label: 'Review' },
            { id: 'details', label: 'Details' },
            { id: 'payment', label: 'Payment' }
          ].map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all",
                  step === s.id ? "bg-primary border-primary text-white scale-110 shadow-lg" : 
                  (i < ['summary', 'details', 'payment'].indexOf(step) ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-primary/20 text-primary/40")
                )}>
                  {i < ['summary', 'details', 'payment'].indexOf(step) ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-widest",
                  step === s.id ? "text-primary" : "text-primary/30"
                )}>{s.label}</span>
              </div>
              {i < 2 && <div className="w-12 h-[2px] bg-primary/10 -mt-4" />}
            </React.Fragment>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <header className="text-center space-y-2">
              <h2 className="text-3xl font-serif font-bold text-charcoal">{t('สรุปการจอง', 'Booking Summary')}</h2>
              <p className="text-accent/60 text-sm uppercase tracking-widest font-bold">{t('ตรวจสอบรายการที่คุณเลือก', 'Review your selections')}</p>
            </header>

            <div className="space-y-4">
              {cart.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  className="bg-white p-4 rounded-3xl shadow-sm border border-primary/5 flex gap-4"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                    <ServiceImage src={item.imageUrl} alt={t(item.name, item.englishName)} className="w-full h-full" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif font-bold text-charcoal text-lg leading-tight">{t(item.name, item.englishName)}</h4>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-400 p-1 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[10px] text-accent/60 uppercase tracking-widest font-bold">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-primary" />
                        {item.durationMins} {t('นาที', 'Mins')}
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={12} className="text-primary" />
                        {item.therapist?.name || t('พนักงานท่านใดก็ได้', 'Any Therapist')}
                      </div>
                    </div>
                    <div className="pt-1">
                      <span className="text-primary font-bold">${item.selectedPrice}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-primary/10 space-y-6">
              <div className="flex justify-between text-primary font-bold text-xl">
                <span>Total Amount</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleNextStep}
                className="w-full py-4 gold-gradient text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity uppercase tracking-widest"
              >
                Next: Booking Details
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <header className="text-center">
              <h2 className="text-3xl font-serif font-bold text-charcoal">Booking Details</h2>
              <p className="text-accent/60 text-sm uppercase tracking-widest font-bold">Select your preferred time</p>
            </header>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-primary/10 space-y-8">
              {/* Date Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2">
                  <Calendar size={14} />
                  Select Date
                </label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-4 bg-cream/50 rounded-2xl border border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20 text-charcoal font-bold"
                />
              </div>

              {/* Time Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2">
                  <Clock size={14} />
                  Available Time Slots
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "py-3 rounded-xl text-xs font-bold transition-all border",
                        selectedTime === time 
                          ? "bg-primary text-white border-primary shadow-md" 
                          : "bg-cream text-primary/60 border-primary/10 hover:border-primary/30"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Health Fund Selection */}
              <div className="space-y-4 pt-4 border-t border-primary/5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2">
                  <ShieldCheck size={14} />
                  Health Fund (Optional for HICAPS)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {healthFunds.map(fund => (
                    <button
                      key={fund}
                      onClick={() => setHealthFund(healthFund === fund ? null : fund)}
                      className={cn(
                        "py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                        healthFund === fund 
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-md" 
                          : "bg-cream text-emerald-600/60 border-emerald-500/10 hover:border-emerald-500/30"
                      )}
                    >
                      {fund}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleNextStep}
                className="w-full py-4 gold-gradient text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity uppercase tracking-widest"
              >
                Next: Payment & Confirm
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <header className="text-center">
              <h2 className="text-3xl font-serif font-bold text-charcoal">Payment & Confirmation</h2>
              <p className="text-accent/60 text-sm uppercase tracking-widest font-bold">Finalize your premium experience</p>
            </header>

            {/* Booking Summary Card */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-primary/10 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles size={120} className="text-primary" />
              </div>
              
              <div className="space-y-4 relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Booking Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-primary/10">
                      <ServiceImage src={cart[0].imageUrl} alt={cart[0].name} className="w-full h-full" />
                    </div>
                    <div>
                      <p className="font-serif font-bold text-lg text-charcoal">{t(cart[0].name, cart[0].englishName)}</p>
                      <p className="text-xs text-accent/60 font-bold uppercase tracking-widest">{cart[0].durationMins} Mins</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/5">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Therapist</p>
                      <div className="flex items-center gap-2">
                        {cart[0].therapist?.imageUrl ? (
                          <img src={cart[0].therapist.imageUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <User size={14} className="text-primary" />
                        )}
                        <span className="text-sm font-bold text-charcoal">{cart[0].therapist?.name || 'Any Available'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest">Time Slot</p>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-primary" />
                        <span className="text-sm font-bold text-charcoal">{selectedTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* HICAPS Rebate Section */}
                  {healthFund && (
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">HICAPS Estimated Rebate</span>
                        <span className="text-emerald-700 font-bold">-${(cart[0].selectedPrice * 0.6).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
                        <span className="text-sm font-black text-emerald-800 uppercase tracking-widest">Estimated Gap to Pay</span>
                        <span className="text-lg font-black text-emerald-800">${(cart[0].selectedPrice * 0.4).toFixed(2)}</span>
                      </div>
                      <p className="text-[9px] text-emerald-600/60 italic">Note: Final rebate depends on your specific fund policy.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Options Container - Frosted Glass */}
            <div className="glass p-8 rounded-[2.5rem] shadow-2xl border border-white/40 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Payment Options</h3>
              
              <div className="space-y-3">
                {/* Option A: Pay at Clinic */}
                <button
                  onClick={() => setPaymentOption('clinic')}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group",
                    paymentOption === 'clinic' 
                      ? "bg-white border-primary shadow-lg" 
                      : "bg-white/40 border-transparent hover:border-primary/20"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      paymentOption === 'clinic' ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    )}>
                      <Store size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-charcoal">Pay at Clinic</p>
                      <p className="text-[10px] text-accent/60 uppercase font-bold tracking-widest">HICAPS / Cash / Card</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    paymentOption === 'clinic' ? "border-primary bg-primary text-white" : "border-primary/20"
                  )}>
                    {paymentOption === 'clinic' && <CheckCircle2 size={14} />}
                  </div>
                </button>

                {/* Option B: Secure Online Payment */}
                <button
                  onClick={() => setPaymentOption('online')}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group",
                    paymentOption === 'online' 
                      ? "bg-white border-primary shadow-lg" 
                      : "bg-white/40 border-transparent hover:border-primary/20"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      paymentOption === 'online' ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    )}>
                      <CreditCard size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-charcoal">Secure Online Payment</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Apple size={12} className="text-accent" />
                        <Smartphone size={12} className="text-accent" />
                        <div className="flex gap-0.5">
                          <div className="w-4 h-2.5 bg-accent/20 rounded-sm" />
                          <div className="w-4 h-2.5 bg-accent/20 rounded-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    paymentOption === 'online' ? "border-primary bg-primary text-white" : "border-primary/20"
                  )}>
                    {paymentOption === 'online' && <CheckCircle2 size={14} />}
                  </div>
                </button>
              </div>

              {/* Interactive Message */}
              <AnimatePresence mode="wait">
                {paymentOption === 'clinic' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-start gap-3"
                  >
                    <Info className="text-primary shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-primary/80 leading-relaxed italic">
                      Your spot is reserved. Please arrive 10 mins early for your HICAPS processing.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirm Button with Golden Glow */}
              <button
                onClick={handleConfirmBooking}
                disabled={isProcessing}
                className={cn(
                  "w-full py-5 gold-gradient text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-2xl relative overflow-hidden group transition-all active:scale-95",
                  isProcessing ? "opacity-70 cursor-not-allowed" : "hover:shadow-[0_0_30px_rgba(225,212,182,0.5)]"
                )}
              >
                {/* Thai Pattern Accent (Simulated with CSS/SVG) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="url(#thai-pattern)" />
                    <defs>
                      <pattern id="thai-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="currentColor" />
                      </pattern>
                    </defs>
                  </svg>
                </div>
                
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Confirm & Book
                    </>
                  )}
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-8"
          >
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-serif font-bold text-charcoal italic">Booking Confirmed!</h2>
              <p className="text-accent/60 max-w-sm mx-auto leading-relaxed">
                Thank you for choosing {storeConfig.storeName}. We've sent a confirmation to your email.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-primary/10 w-full max-w-sm space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-accent/40 uppercase font-black tracking-widest">Date & Time</span>
                <span className="text-charcoal font-bold">{selectedDate} @ {selectedTime}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-accent/40 uppercase font-black tracking-widest">Location</span>
                <span className="text-charcoal font-bold">Level 1/76 Pier St, Altona</span>
              </div>
            </div>

            <button 
              onClick={() => window.location.href = '/'}
              className="px-10 py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-primary/90 transition-all"
            >
              Return Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUpsell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpsell(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-primary/20"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-pulse">
                  <Sparkles size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-charcoal italic">{t('เพิ่มประสบการณ์ของคุณ?', 'Enhance Your Experience?')}</h3>
                  <p className="text-accent/70 text-sm leading-relaxed">
                    {t('คุณต้องการเพิ่ม', 'Would you like to add a')} <span className="text-primary font-bold">{t('นวดหินร้อน 15 นาที', '15-min Hot Stone therapy')}</span> {t('ในราคาเพียง', 'for only')} <span className="text-primary font-bold">$15</span>?
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={addHotStoneUpsell}
                    className="w-full py-4 gold-gradient text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity uppercase tracking-widest"
                  >
                    <Plus size={20} />
                    {t('ใช่ เพิ่มในการจอง', 'Yes, Add to Booking')}
                  </button>
                  <button 
                    onClick={() => {
                      setShowUpsell(false);
                      setStep('details');
                    }}
                    className="w-full py-4 text-accent/40 font-bold hover:text-accent/60 transition-colors uppercase tracking-widest text-xs"
                  >
                    {t('ไม่ขอบคุณ ไว้โอกาสหน้า', 'No thanks, maybe next time')}
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setShowUpsell(false)}
                className="absolute top-4 right-4 p-2 text-accent/20 hover:text-accent/40 transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

