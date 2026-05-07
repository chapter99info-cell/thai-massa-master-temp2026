import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Star, Clock, ChevronRight, Plus, Image as ImageIcon, Sparkles, Phone, Calendar as CalendarIcon, ExternalLink, X, MapPin, Map, ShieldCheck, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { services } from '../data/services';
import { therapists } from '../data/therapists';
import { storeConfig, getAppSettings } from '../config';
import { cn, formatCurrency } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import ServiceImage from './ServiceImage';
import { getCurrentPrice } from '../lib/pricing';
import TherapistModal from './TherapistModal';
import { Service, Therapist } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchWithRetry } from '../lib/apiUtils';
import LoadingOverlay from './LoadingOverlay';
import VoucherStore from './VoucherStore';

export default function Home() {
  const { t } = useLanguage();
  const settings = getAppSettings();
  const heroVideoUrl = settings.heroVideoUrl;
  const heroImageUrl = settings.heroImageUrl || "https://images.unsplash.com/photo-1544161515-4ae6ce6db874?q=80&w=2070&auto=format&fit=crop";
  const shopDescription = settings.shopDescription || t('Experience True Serenity - Premium Wellness in Altona', 'Experience True Serenity - Premium Wellness in Altona');

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderPreference, setGenderPreference] = useState<'All' | 'Male' | 'Female'>('All');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showIntakeNote, setShowIntakeNote] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Simulate data fetching with caching and retry
  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      try {
        await fetchWithRetry('services-list', async () => {
          // Simulate network latency for Australian users (Sydney region optimization)
          await new Promise(resolve => setTimeout(resolve, 1200));
          return services;
        });
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  const categoryLabels: Record<string, { th: string; en: string }> = {
    'All': { th: 'ทั้งหมด', en: 'All' },
    'MASSAGE': { th: 'นวดผ่อนคลาย', en: 'Massage' },
    'FACIAL': { th: 'ดูแลผิวหน้า', en: 'Facial' },
    'SPA PACKAGES': { th: 'แพ็กเกจสปา', en: 'Spa Packages' },
    'GIFTS': { th: 'บัตรของขวัญ', en: 'Gift Vouchers' }
  };

  const categories = Object.keys(categoryLabels);
  
  const featuredServices = services.filter(s => s.isFeatured).filter(s => {
    if (genderPreference === 'All') return true;
    return therapists.some(t => {
      if (t.gender !== genderPreference) return false;
      return t.specialties.some(spec => 
        spec.toUpperCase() === s.category.toUpperCase() ||
        (s.category === 'MASSAGE' && (spec.includes('Thai') || spec.includes('Tissue') || spec.includes('Massage')))
      );
    });
  });

  const filteredServices = services.filter(s => {
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (s.englishName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                         s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (s.englishDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesGender = genderPreference === 'All' || therapists.some(t => {
      if (t.gender !== genderPreference) return false;
      
      // Check if therapist can perform this service category
      const canDoCategory = t.specialties.some(spec => 
        spec.toUpperCase() === s.category.toUpperCase() ||
        (s.category === 'MASSAGE' && (spec.includes('Thai') || spec.includes('Tissue') || spec.includes('Massage')))
      );
      
      return canDoCategory;
    });
    
    return matchesCategory && matchesSearch && matchesGender;
  });

  const handleAddClick = (service: Service) => {
    if (storeConfig.packageTier < 2) return;
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleTherapistSelect = (therapist?: Therapist) => {
    if (selectedService) {
      const { price } = getCurrentPrice(selectedService);
      addToCart(selectedService, price, therapist);
    }
  };

  return (
    <div className="space-y-20">
      <AnimatePresence>
        {isLoading && <LoadingOverlay />}
      </AnimatePresence>
      <TherapistModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSelect={handleTherapistSelect}
        service={selectedService}
        defaultGenderFilter={genderPreference}
      />
      {/* Hero Section */}
      <section className="relative h-[95vh] hero-section flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Full-width Hero Image or Video */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src="https://firebasestorage.googleapis.com/v0/b/v4-massage-edition-2026.firebasestorage.app/o/VDO%2FCinematic_video_of_a_luxurious.mp4?alt=media&token=3c1ac19c-067a-411f-905e-df2a5ef3ccbd" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 ocean-overlay" />
          
          {/* Subtle Ocean Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ocean/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-turquoise/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 px-6 max-w-5xl flex flex-col items-center">
          {/* Main Titles */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-white mb-4 tracking-tight leading-[1.1] italic drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              Premium Thai Massage <br /> & Wellness in Altona
            </h2>
            <p className="text-white/90 font-serif text-xl md:text-2xl font-medium drop-shadow-lg">
              Experience the art of healing with our expert therapists.
            </p>
          </motion.div>

          {/* Circular BOOK NOW Button (Redesigned for Premium Theme) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="relative mb-8"
          >
            <Link 
              to="/book"
              className="group relative w-56 h-56 md:w-64 md:h-64 rounded-full bg-navy/80 backdrop-blur-md border-[8px] border-gold/20 flex flex-col items-center justify-center text-white shadow-[0_0_80px_rgba(212,175,55,0.3)] hover:scale-105 hover:bg-navy transition-all duration-700 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 to-transparent" />
              
              {/* Outer Pulsing Glow */}
              <div className="absolute inset-0 rounded-full border-2 border-gold/40 animate-ping opacity-20 pointer-events-none" />
              <div className="absolute inset-4 rounded-full border border-gold/10 animate-pulse pointer-events-none" />

              <span className="relative z-10 text-4xl md:text-5xl font-serif font-black tracking-tighter leading-tight italic uppercase text-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                Book <br /> <span className="text-white text-3xl md:text-4xl">Now</span>
              </span>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.1),transparent)]" />
              
              {/* Shine effect on hover */}
              <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] transition-all duration-1000 group-hover:left-[150%]" />
            </Link>
          </motion.div>

          {/* Subtitle from Reference */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white font-serif text-2xl md:text-3xl italic tracking-wide drop-shadow-lg mb-12"
          >
            Experience Tranquility.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link 
              to="/book"
              className="w-full sm:w-auto bg-gold text-navy px-12 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(212,175,55,0.4)] hover:scale-105 hover:bg-white transition-all active:scale-95"
            >
              Online Booking
            </Link>
            <a 
              href={`tel:${storeConfig.phone}`}
              className="w-full sm:w-auto bg-white/10 backdrop-blur-xl text-white px-12 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] border-2 border-white/40 hover:bg-white hover:text-navy transition-all active:scale-95 shadow-2xl"
            >
              Call Now
            </a>
          </motion.div>
        </div>
      </section>

      {/* Featured Experiences Highlight Grid */}
      <section className="container -mt-32 relative z-20 no-print">
        <div className="featured-grid">
          {[
            {
              id: '1',
              title: 'Traditional Thai Yoga Massage',
              price: 95,
              image: 'https://images.unsplash.com/photo-1544161515-4ae6ce6db874?q=80&w=600&fit=crop',
              category: 'Healing'
            },
            {
              id: '2',
              title: 'Premium Aromatherapy Oil Massage',
              price: 115,
              image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=600&fit=crop',
              category: 'Luxury'
            },
            {
              id: '4',
              title: 'Ultimate Zen Spa Package',
              price: 150,
              image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&fit=crop',
              category: 'Ocean Zen'
            }
          ].map((exp, idx) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="group relative h-[32rem] rounded-[4rem] overflow-hidden border border-white/20 shadow-2xl bg-white"
            >
              <img src={exp.image} alt={exp.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean/80 via-ocean/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
              
              <div className="absolute bottom-12 left-10 right-10 space-y-5">
                <span className="inline-block px-4 py-1.5 bg-gold text-navy text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                  {exp.category}
                </span>
                <h4 className="text-3xl font-serif font-black text-white leading-tight italic drop-shadow-lg">{exp.title}</h4>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3 text-gold">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
                      <Sparkles size={20} className="text-white" />
                    </div>
                    <span className="text-2xl font-black text-white drop-shadow-md">{formatCurrency(exp.price)}</span>
                  </div>
                  <button 
                    onClick={() => {
                      const service = services.find(s => s.id === exp.id);
                      if (service) handleAddClick(service);
                    }}
                    className="w-14 h-14 rounded-full bg-white text-ocean shadow-2xl flex items-center justify-center hover:bg-gold hover:text-navy transition-all hover:scale-110"
                  >
                    <Plus size={28} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Experiences (Original Section) */}
      {storeConfig.packageTier >= 2 && featuredServices.length > 0 && (
        <section className="container space-y-8 no-print">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-3xl font-serif font-bold text-navy flex items-center gap-3">
                <Sparkles className="text-accent" size={28} />
                ✨ Featured Experiences
              </h3>
              <p className="text-navy/40 text-sm font-medium uppercase tracking-widest">Tailored specifically for your wellbeing</p>
            </div>
          </div>
          <div className="featured-grid">
            {featuredServices.map((service) => {
              const { price } = getCurrentPrice(service);
              return (
                <motion.div 
                  key={service.id}
                  whileHover={{ y: -5 }}
                  className="bg-section rounded-[2rem] p-6 border border-primary/5 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                      <ServiceImage src={service.imageUrl} alt={service.name} className="w-full h-full transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif font-bold text-forest leading-tight">{t(service.name, service.englishName)}</h4>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[9px] text-navy font-bold uppercase bg-navy/5 px-2 py-0.5 rounded-full">{service.category}</span>
                    {service.category === 'MASSAGE' && (
                      <>
                        <span className="text-[9px] text-navy font-bold uppercase bg-navy/5 px-2 py-0.5 rounded-full">Stress Relief</span>
                        {service.englishName === 'Traditional Thai Massage' && (
                          <span className="text-[9px] text-navy font-bold uppercase bg-navy/5 px-2 py-0.5 rounded-full">Muscle Recovery</span>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-navy/60 text-sm leading-relaxed">
                    <div className="flex justify-between items-center bg-gold/20 p-3 rounded-xl border border-primary/5">
                      <p className="font-medium text-navy">{formatCurrency(price)} - Standard Rate</p>
                      <button 
                        onClick={() => handleAddClick(service)}
                        className="px-4 py-2 bg-gold text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gold/90 transition-all"
                      >
                        Book
                      </button>
                    </div>
                    <div className="flex justify-between items-center bg-gold/20 p-3 rounded-xl border border-primary/5">
                      <p className="font-medium text-navy">{formatCurrency(Math.round(price * 1.2))} - Remedial Rate</p>
                      <button 
                        onClick={() => handleAddClick(service)}
                        className="px-4 py-2 bg-gold text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gold/90 transition-all"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Search & Filter Section */}
      <section className="container relative z-20 no-print">
        <div className="bg-white/70 p-10 rounded-[4rem] shadow-2xl border border-white/40 space-y-8 backdrop-blur-2xl">
          <div className="relative group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-ocean/40 group-focus-within:text-ocean transition-colors" size={24} />
            <input 
              type="search" 
              placeholder="Find your refreshing treatment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white px-16 py-6 rounded-[2.5rem] border border-ocean/10 text-ocean text-lg focus:outline-none focus:ring-4 focus:ring-ocean/10 transition-all placeholder:text-ocean/20 shadow-inner"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Category Tabs */}
            <div className="flex overflow-x-auto py-2 gap-4 no-scrollbar w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "flex-shrink-0 px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                    activeCategory === cat 
                      ? "bg-ocean text-white shadow-xl shadow-ocean/30 scale-105" 
                      : "bg-white text-ocean/60 border border-ocean/5 hover:border-ocean/20 hover:text-ocean shadow-sm"
                  )}
                >
                  {t(categoryLabels[cat].th, categoryLabels[cat].en)}
                </button>
              ))}
            </div>
            
            {/* Gender Preference Filter */}
            <div className="flex gap-1.5 p-1.5 bg-white rounded-full border border-ocean/5 w-full md:w-auto shadow-inner">
              {[
                { value: 'All', label: 'Anyone' },
                { value: 'Female', label: 'Female Only' },
                { value: 'Male', label: 'Male Only' }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setGenderPreference(f.value as any)}
                  className={cn(
                    "flex-1 md:flex-none px-8 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                    genderPreference === f.value 
                      ? "bg-gold text-navy shadow-md" 
                      : "text-ocean/30 hover:text-ocean/60"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* All Treatments Grid */}
      <section className="container space-y-12 pb-32 no-print">
        <div className="text-center md:text-left space-y-3">
          <h3 className="text-4xl md:text-5xl font-serif font-black text-navy italic tracking-tight">{t('ทรีทเมนท์ทั้งหมด', 'All Vitality Treatments')}</h3>
          <p className="text-ocean/50 text-[10px] font-black uppercase tracking-[0.5em]">{t('เลือกบริการที่เหมาะกับคุณ', 'Find Your Perfect Ocean Breeze Experience')}</p>
        </div>

        {activeCategory === 'GIFTS' ? (
          <VoucherStore />
        ) : (
          <div className="featured-grid">
          {filteredServices.map((service) => {
            const { price } = getCurrentPrice(service);
            return (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[3.5rem] overflow-hidden shadow-xl border border-gold/10 flex flex-col h-full group hover:shadow-2xl hover:border-gold/30 transition-all duration-500"
              >
                {/* Image Header with Overlay */}
                <div className="relative h-80 overflow-hidden">
                  <ServiceImage src={service.imageUrl} alt={service.name} className="w-full h-full transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex justify-between items-end">
                      <h4 className="font-serif font-black text-2xl leading-tight text-navy italic drop-shadow-sm">{t(service.name, service.englishName)}</h4>
                      <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/30 text-[10px] font-black text-navy">
                        {service.durationMins}M
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-10 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4 text-gold">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  
                  <p className="text-navy/60 text-sm font-medium leading-relaxed mb-8 line-clamp-2">
                    {t(service.description, service.englishDescription)}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="text-[9px] text-ocean font-black uppercase bg-ocean/5 px-4 py-1.5 rounded-full border border-ocean/10">
                      {service.category === 'MASSAGE' ? 'Deep Relaxation' : 'Ocean Fresh'}
                    </span>
                    <span className="text-[9px] text-ocean font-black uppercase bg-ocean/5 px-4 py-1.5 rounded-full border border-ocean/10">
                      Certified
                    </span>
                  </div>

                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-ocean/5">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-ocean/30 uppercase tracking-widest">Pricing</span>
                      <span className="text-2xl font-black text-navy">{formatCurrency(price)}</span>
                    </div>
                    <button 
                      onClick={() => handleAddClick(service)}
                      className="bg-gold text-navy h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-navy hover:text-white transition-all active:scale-95 shadow-xl shadow-gold/20"
                    >
                      {t('จองนัดหมาย', 'Book Now')}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      </section>

      {/* Health Fund & Insurance Section */}
      <section className="container py-10 no-print">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gold p-10 rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20" />
          
          <div className="space-y-6 relative z-10 text-navy max-w-xl">
            <div className="flex items-center gap-3 bg-navy/5 px-4 py-2 rounded-full w-fit border border-navy/10">
              <ShieldCheck className="text-navy" size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('เคลมประกันสุขภาพได้', 'Health Fund Claimable')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-black italic leading-[1.1]">
              Professional Remedial <br /> & Health Fund Claims
            </h2>
            <p className="text-navy/70 font-medium leading-relaxed">
              {t(
                'เรามีหมอนวดที่มีใบรับรองระดับมืออาชีพ พร้อมให้บริการนวดบำบัดที่สามารถเคลมประกันสุขภาพ (Remedial Massage) ได้โดยตรงผ่านระบบ HICAPS หรือขอใบเสร็จเพื่อไปเคลมเองได้ค่ะ',
                'Experience professional care with our qualified Remedial Massage therapists. We support instant HICAPS claims and provide official receipts for all major private health funds in Australia.'
              )}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 opacity-50 font-black text-[8px] uppercase tracking-[0.2em] italic">
              <span>• BUPA</span>
              <span>• MEDIBANK</span>
              <span>• AHM</span>
              <span>• NIB</span>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-auto">
            <div className="bg-navy p-8 rounded-[3rem] border border-gold/20 shadow-2xl space-y-6 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20 mx-auto md:mx-0">
                <QrCode size={32} />
              </div>
              <div>
                <h4 className="text-gold font-serif font-black text-xl italic mb-2">Instant HICAPS</h4>
                <p className="text-gold/50 text-xs leading-relaxed max-w-[200px]">
                  Swipe your health fund card and only pay the gap. Easy and fast.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Find Us Section */}
      <section id="location" className="relative overflow-hidden bg-navy">
        {/* Top Half Background Image */}
        <div className="absolute top-0 left-0 right-0 h-[50%] z-0">
          <img 
            src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=2070&auto=format&fit=crop" 
            alt="Massage Atmosphere" 
            className="w-full h-full object-cover opacity-10"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy" />
        </div>

        <div className="max-w-4xl mx-auto px-6 py-32 relative z-10 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-gold text-xs font-black uppercase tracking-[0.6em] opacity-40">{t('มาพบเราได้ที่นี่', 'Visit Us')}</span>
            <h2 className="text-5xl font-serif font-black text-gold italic">{t('การเดินทาง', 'Find Our Sanctuary')}</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Address Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-1 bg-white/5 p-8 rounded-[2.5rem] border border-gold/10 flex items-center gap-6 shadow-2xl backdrop-blur-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold flex-shrink-0 border border-gold/20">
                <MapPin size={24} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black text-gold/40 uppercase tracking-[0.3em] mb-1">Location</p>
                <p className="text-lg font-serif font-black text-gold leading-tight italic">Level 1/76 Pier Street, Altona 3018</p>
              </div>
            </motion.div>

            {/* Hours Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex-1 bg-white/5 p-8 rounded-[2.5rem] border border-gold/10 flex items-center gap-6 shadow-2xl backdrop-blur-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold flex-shrink-0 border border-gold/20">
                <Clock size={24} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black text-gold/40 uppercase tracking-[0.3em] mb-1">Sanctuary Hours</p>
                <p className="text-lg font-serif font-black text-gold leading-tight italic">Every Day: 10:00 AM - 8:00 PM</p>
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-[3.5rem] overflow-hidden shadow-2xl border border-gold/20 aspect-video relative group"
            >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3148.834714652417!2d144.8284563!3d-37.8641499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad6613867c69999%3A0x5045675218ce6e0!2s76%20Pier%20St%2C%20Altona%20VIC%203018!5e0!3m2!1sen!2sau!4v1712640000000!5m2!1sen!2sau" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale transition-all duration-1000 group-hover:grayscale-0 contrast-[1.1]"
              />
              <div className="absolute inset-0 pointer-events-none border-[12px] border-navy/20 rounded-[3.5rem]" />
            </motion.div>

            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: '#c5a059', color: '#000080' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeConfig.address)}`, '_blank')}
              className="w-full bg-white/5 text-gold py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-xl border border-gold/30 flex items-center justify-center gap-4 transition-all"
            >
              <Map size={20} />
              {t('เปิด Google Maps', 'Start Navigation')}
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
}
