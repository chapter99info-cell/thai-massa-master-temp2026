import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Star, 
  UserPlus, 
  Gift, 
  Clock, 
  Phone, 
  Mail, 
  Calendar,
  Search,
  Filter,
  UtensilsCrossed,
  ArrowRight,
  MessageSquare,
  Sparkles,
  X,
  Copy
} from 'lucide-react';
import { Customer } from '../types';
import { INITIAL_CUSTOMERS } from '../data/customers';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

export default function CRMSystem() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'vip' | 'new' | 'birthday' | 'inactive'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [aiPitch, setAiPitch] = useState<{ friendly: string; expert: string; persuasive: string } | null>(null);

  const customers = INITIAL_CUSTOMERS;
  const today = new Date('2026-05-05T00:00:00Z'); // Fixed today for demo

  const categorizedData = useMemo(() => {
    const filtered = customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm)
    );

    const vips = filtered.filter(c => c.memberTier === 'VIP' || c.totalVisits >= 30);
    const newOnes = filtered.filter(c => {
      const visitDate = new Date(c.lastVisitDate || '');
      const diffDays = (today.getTime() - visitDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7 && c.totalVisits <= 2;
    });
    
    const birthdays = filtered.filter(c => {
      if (!c.birthday) return false;
      const bDate = new Date(c.birthday);
      const bDay = bDate.getDate();
      const bMonth = bDate.getMonth();
      const tDay = today.getDate();
      const tMonth = today.getMonth();
      return bMonth === tMonth && (bDay >= tDay && bDay <= tDay + 7);
    });

    const inactive = filtered.filter(c => {
      const visitDate = new Date(c.lastVisitDate || '');
      const diffDays = (today.getTime() - visitDate.getTime()) / (1000 * 3600 * 24);
      return diffDays > 60;
    });

    return {
      all: filtered,
      vip: vips,
      new: newOnes,
      birthday: birthdays,
      inactive: inactive
    };
  }, [searchTerm, today, customers]);

  const displayCustomers = categorizedData[selectedCategory];

  const generatePitch = (customer: Customer) => {
    // Analytics: Convert Thai Preferences to English Strategies
    const pref = (customer.notes || '').toLowerCase();
    const isHeavy = pref.includes('หนัก') || pref.includes('heavy') || pref.includes('deep') || pref.includes('เน้น');
    const isRelax = pref.includes('เบา') || pref.includes('relax') || pref.includes('น้ำมัน');
    const isFrequent = customer.totalVisits > 10;

    const styles = {
      friendly: `Hi ${customer.name}! Lovely to see you again. I recall you ${isHeavy ? 'enjoy more pressure' : 'prefer a lighter touch'}. We've just updated our premium blends—I'd love for you to try our ${isHeavy ? 'Organic Thai Deep Tissue' : 'Signature Aromatherapy Oil'} today!`,
      expert: `As your wellness consultant, I recommend the ${isHeavy ? '90min Remedial Release' : 'Calm & Unwind Therapy'}. Based on your history of ${isHeavy ? 'muscle tension' : 'stress management'}, this will significantly improve your recovery rate.`,
      persuasive: `Treat yourself today, ${customer.name}! Since you're one of our ${isFrequent ? 'top VIPs' : 'valued regulars'}, we have a special upgrade available for you. Our ${isHeavy ? 'Deep Muscle Therapy' : 'Premium Essential Oil'} is perfect for matching your preferred level of care.`
    };
    
    setSelectedCustomer(customer);
    setAiPitch(styles);
    // Auto-scroll to view results
    setTimeout(() => {
      document.getElementById(`ai-box-${customer.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const getCustomerTag = (customer: Customer) => {
    const todayDate = new Date();
    const lastVisitDate = new Date(customer.lastVisitDate || '');
    const diffDays = Math.floor((todayDate.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));

    if (customer.totalVisits >= 30 || customer.memberTier === 'VIP') {
      return { label: 'VIP', color: 'bg-gold text-navy shadow-lg shadow-gold/20' };
    }
    if (customer.totalVisits <= 2) {
      return { label: 'NEW', color: 'bg-emerald-500 text-white' };
    }
    if (diffDays > 60) {
      return { label: 'AT RISK', color: 'bg-rose-500 text-white' };
    }
    return { label: 'ACTIVE', color: 'bg-blue-500 text-white' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif font-black text-white italic tracking-tight">{t('Customer Management', 'Customer CRM')}</h2>
          <p className="text-slate-400 text-xl font-medium">{t('Auto-segmentation & AI-Powered Sales Analytics', 'Auto-segmentation and memory system')}</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
          <Search size={24} className="text-slate-500 ml-2" />
          <input 
            type="text" 
            placeholder={t('Search customer...', 'Search name or phone...')}
            className="bg-transparent border-none focus:ring-0 text-xl text-white w-64 placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats / Categories */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[
          { id: 'all', label: 'All', icon: Users, color: 'slate', count: categorizedData.all.length },
          { id: 'vip', label: 'VIP', icon: Star, color: 'amber', count: categorizedData.vip.length },
          { id: 'new', label: 'New', icon: UserPlus, color: 'emerald', count: categorizedData.new.length },
          { id: 'birthday', label: 'Birthday', icon: Gift, color: 'rose', count: categorizedData.birthday.length },
          { id: 'inactive', label: 'At Risk', icon: Clock, color: 'indigo', count: categorizedData.inactive.length },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={cn(
              "p-6 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group",
              selectedCategory === cat.id 
                ? "bg-primary/20 border-primary shadow-2xl shadow-primary/20 scale-105"
                : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
            )}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110",
              selectedCategory === cat.id ? "bg-primary text-navy" : "bg-slate-800 text-slate-400"
            )}>
              <cat.icon size={28} />
            </div>
            <div className="font-black text-xl text-slate-300 uppercase tracking-widest">{cat.label}</div>
            <div className="text-4xl font-serif font-black text-white mt-1">{cat.count}</div>
          </button>
        ))}
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        {displayCustomers.length > 0 ? (
          displayCustomers.map((customer) => (
            <motion.div
              layout
              key={customer.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/50 p-8 rounded-[3.5rem] border-2 border-slate-800 hover:border-primary/30 hover:bg-slate-800/80 transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="flex gap-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-5xl font-serif font-bold text-slate-500 group-hover:border-primary group-hover:text-primary transition-all">
                    {customer.name.charAt(0)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-black text-3xl text-white tracking-tight">{customer.name}</h4>
                      {(() => {
                        const tag = getCustomerTag(customer);
                        return (
                          <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]", tag.color)}>
                            {tag.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-sm text-slate-500 uppercase font-black tracking-widest"><Phone size={14} /> {customer.phone}</span>
                      {customer.email && <span className="flex items-center gap-2 text-sm text-slate-500 uppercase font-black tracking-widest"><Mail size={14} /> {customer.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-4xl font-black text-emerald-400 font-mono tracking-tighter">${customer.totalSpent}</div>
                  <div className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] mt-1">{customer.totalVisits} VISITS</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800/50 shadow-inner">
                  <div className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] flex items-center gap-2"><Calendar size={14} /> LAST VISIT</div>
                  <div className="text-xl font-bold text-slate-300 mt-2">{new Date(customer.lastVisitDate || '').toLocaleDateString('en-AU')}</div>
                </div>
                {customer.birthday && (
                  <div className="bg-rose-500/5 p-4 rounded-3xl border border-rose-500/10 shadow-inner">
                    <div className="text-[10px] uppercase font-black text-rose-500 tracking-[0.2em] flex items-center gap-2"><Gift size={14} /> BIRTHDAY</div>
                    <div className="text-xl font-bold text-rose-300 mt-2">{new Date(customer.birthday).toLocaleDateString('en-AU', { day: 'numeric', month: 'long' })}</div>
                  </div>
                )}
              </div>

              {/* Intelligence Response Area - INLINE BELOW BUTTON */}
              <AnimatePresence>
                {selectedCustomer?.id === customer.id && aiPitch && (
                  <motion.div 
                    id={`ai-box-${customer.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-4 overflow-hidden"
                  >
                    <div className="ai-glowing-box p-8 space-y-8">
                      <div className="flex items-center gap-4 text-primary">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                          <Sparkles size={24} className="animate-pulse" />
                        </div>
                        <div>
                          <h5 className="font-black text-sm uppercase tracking-[0.4em] text-primary">Intelligence Response Area</h5>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">SaaS Marketer Pro Analysis (AU/NZ Expert)</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {[
                          { id: 'f', label: 'Friendly Approach', text: aiPitch.friendly, icon: '😊' },
                          { id: 'e', label: 'Expert Consultation', text: aiPitch.expert, icon: '🎓' },
                          { id: 'p', label: 'Persuasive Strategy', text: aiPitch.persuasive, icon: '⚡' }
                        ].map(p => (
                          <div key={p.id} className="bg-navy/50 p-6 rounded-3xl border border-white/5 space-y-4 group/line">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{p.icon}</span>
                                <span className="text-xs font-black text-primary/80 uppercase tracking-widest">{p.label}</span>
                              </div>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(p.text);
                                  alert('Copied to clipboard!');
                                }}
                                className="copy-button-glow flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-navy rounded-xl text-xs font-black transition-all"
                              >
                                <Copy size={14} /> COPY SCRIPT
                              </button>
                            </div>
                            <p className="text-lg text-slate-200 font-serif italic leading-relaxed whitespace-pre-wrap">"{p.text}"</p>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => {
                          setSelectedCustomer(null);
                          setAiPitch(null);
                        }}
                        className="w-full py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest border-t border-primary/10 mt-2 hover:text-white transition-all"
                      >
                        Close Analysis
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Sales Assistant Button */}
              <button 
                onClick={() => generatePitch(customer)}
                className={cn(
                  "w-full mt-6 flex items-center justify-center gap-3 px-8 py-5 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all group/ai active:scale-95",
                  selectedCustomer?.id === customer.id 
                    ? "bg-primary text-navy shadow-xl shadow-primary/20" 
                    : "bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-navy"
                )}
              >
                <Sparkles size={20} className="group-hover/ai:animate-pulse" />
                {selectedCustomer?.id === customer.id ? 'ANALYZING...' : 'AI SALES ASSISTANT'}
              </button>

              {/* Notes Preview */}
              {customer.notes && (
                <div className="mt-4 p-4 bg-slate-950/30 rounded-2xl border border-slate-800/50">
                  <p className="text-sm text-slate-400 italic">" {customer.notes} "</p>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-40 text-center">
            <div className="w-32 h-32 bg-slate-900 rounded-[3rem] border border-slate-800 flex items-center justify-center mx-auto text-slate-700 mb-8">
              <Users size={64} />
            </div>
            <p className="text-slate-500 italic text-2xl font-serif">{t('No matching customers found 🍊', 'No customers found in this category. 🍊')}</p>
          </div>
        )}
      </div>

      {/* AI Pitch Modal */}
      <AnimatePresence>
        {aiPitch && selectedCustomer && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiPitch(null)}
              className="absolute inset-0 bg-navy/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-slate-900 p-12 md:p-16 rounded-[4rem] border-4 border-primary shadow-[0_0_150px_rgba(184,150,46,0.3)] max-w-4xl w-full space-y-10"
            >
              <button 
                onClick={() => setAiPitch(null)}
                className="absolute top-8 right-8 p-4 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl"
              >
                <X size={32} />
              </button>

              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-primary/20 rounded-[2.5rem] flex items-center justify-center text-primary shadow-inner">
                  <Sparkles size={48} />
                </div>
                <div>
                  <h3 className="text-5xl font-serif font-black text-white italic tracking-tight">AI Sales Assistant</h3>
                  <p className="text-xl text-slate-400 uppercase font-black tracking-widest mt-2">Personalized Scripts for {selectedCustomer.name}</p>
                </div>
              </div>

              <div className="space-y-8">
                {[
                  { title: 'Friendly & Casual', script: aiPitch.friendly, id: 'friendly' },
                  { title: 'The Expert Advisor', script: aiPitch.expert, id: 'expert' },
                  { title: 'VIP / Persuasive', script: aiPitch.persuasive, id: 'persuasive' }
                ].map((pitch) => (
                  <div key={pitch.id} className="relative group/pitch">
                    <div className="absolute -left-4 top-0 bottom-0 w-2 bg-primary/20 group-hover/pitch:bg-primary transition-all rounded-full" />
                    <div className="pl-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60">{pitch.title}</h5>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(pitch.script);
                            // Potentially add a toast or simple feedback here
                          }}
                          className="opacity-0 group-hover/pitch:opacity-100 flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:text-white transition-all"
                        >
                          <Copy size={12} /> COPY SCRIPT
                        </button>
                      </div>
                      <div className="bg-slate-950/50 p-8 rounded-[2rem] border border-slate-800 shadow-inner group-hover/pitch:bg-slate-800/80 transition-all">
                        <p className="text-2xl text-slate-200 leading-relaxed font-serif italic italic font-medium">"{pitch.script}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => setAiPitch(null)}
                  className="w-full py-8 bg-slate-800 hover:bg-slate-700 text-white rounded-[2rem] text-2xl font-black uppercase tracking-[0.3em] transition-all shadow-2xl border-t-2 border-white/5"
                >
                  Close Assistant
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

