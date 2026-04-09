import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Star, Clock, ChevronRight, Plus, Image as ImageIcon, Sparkles, Phone, Calendar as CalendarIcon, ExternalLink, X, MapPin, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { services } from '../data/services';
import { therapists } from '../data/therapists';
import { storeConfig, getAppSettings } from '../config';
import { cn } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import ServiceImage from './ServiceImage';
import { getCurrentPrice } from '../lib/pricing';
import TherapistModal from './TherapistModal';
import { Service, Therapist } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchWithRetry } from '../lib/apiUtils';
import LoadingOverlay from './LoadingOverlay';

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

  const categories = ['All', 'MASSAGE', 'FACIAL', 'SPA PACKAGES'];
  
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
      <section className="relative h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Full-width Hero Image or Video */}
        <div className="absolute inset-0 z-0">
          {isLoaded && heroVideoUrl ? (
            <video 
              autoPlay 
              muted 
              loop 
              playsInline 
              poster={heroImageUrl}
              className="w-full h-full object-cover"
            >
              <source src={heroVideoUrl} type="video/mp4" />
            </video>
          ) : (
            <motion.img 
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
              src={heroImageUrl} 
              alt="Hero" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-navy/50" />
        </div>

        <div className="relative z-10 px-6 max-w-3xl">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-8 tracking-tight leading-tight"
          >
            {shopDescription}
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              to="/book"
              onClick={() => setShowIntakeNote(true)}
              className="bg-accent text-navy px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:scale-105 transition-all active:scale-95"
            >
              <span>📱</span> {t('Online Booking', 'Online Booking')}
            </Link>
            <a 
              href={`tel:${storeConfig.phone}`}
              className="bg-transparent text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest border border-white flex items-center gap-2 hover:bg-white hover:text-black transition-all active:scale-95"
            >
              <span>📞</span> {t('Call Now', 'Call Now')}
            </a>
          </motion.div>
        </div>
      </section>

      {/* Featured Experiences */}
      {storeConfig.packageTier >= 2 && featuredServices.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-3xl font-serif font-bold text-forest flex items-center gap-3">
                <Sparkles className="text-accent" size={28} />
                ✨ Featured Experiences
              </h3>
              <p className="text-forest/40 text-sm font-medium uppercase tracking-widest">Tailored specifically for your wellbeing</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                      <p className="font-medium text-navy">${price} - Standard Rate</p>
                      <button 
                        onClick={() => handleAddClick(service)}
                        className="px-4 py-2 bg-gold text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gold/90 transition-all"
                      >
                        Book
                      </button>
                    </div>
                    <div className="flex justify-between items-center bg-gold/20 p-3 rounded-xl border border-primary/5">
                      <p className="font-medium text-navy">${Math.round(price * 1.2)} - Remedial Rate</p>
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
      <section className="max-w-7xl mx-auto px-6 relative z-20">
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-primary/5 space-y-8">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-forest/30 group-focus-within:text-accent transition-colors" size={20} />
            <input 
              type="search" 
              placeholder="Find your treatment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cream/30 px-14 py-4 rounded-full border border-primary/5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Category Tabs */}
            <div className="flex overflow-x-auto py-2 gap-3 no-scrollbar w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    activeCategory === cat 
                      ? "bg-primary text-cream shadow-lg" 
                      : "bg-cream text-navy/40 border border-navy/10 hover:bg-navy/5"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {/* Gender Preference Filter */}
            <div className="flex gap-1 p-1 bg-cream rounded-full border border-primary/5 w-full md:w-auto">
              {[
                { value: 'All', label: 'Anyone' },
                { value: 'Female', label: 'Female Only' },
                { value: 'Male', label: 'Male Only' }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setGenderPreference(f.value as any)}
                  className={cn(
                    "flex-1 md:flex-none px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all",
                    genderPreference === f.value 
                      ? "bg-primary text-cream shadow-sm" 
                      : "text-navy/40 hover:text-navy/60"
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
      <section className="max-w-7xl mx-auto px-6 space-y-8 pb-20">
        <div className="space-y-1">
          <h3 className="text-3xl font-serif font-bold text-forest">{t('ทรีทเมนท์ทั้งหมด', 'All Treatments')}</h3>
          <p className="text-forest/40 text-sm font-medium uppercase tracking-widest">{t('เลือกบริการที่เหมาะกับคุณ', 'Choose the perfect service for you')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => {
            const { price } = getCurrentPrice(service);
            return (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-primary/5 flex flex-col h-full group"
              >
                {/* Image Header with Overlay */}
                <div className="relative h-72 overflow-hidden">
                  <ServiceImage src={service.imageUrl} alt={service.name} className="w-full h-full transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h4 className="font-serif font-bold text-2xl leading-tight mb-1">{t(service.name, service.englishName)}</h4>
                    <p className="text-sm font-bold opacity-90">${price} — {service.durationMins}M</p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-navy/60 text-sm font-light leading-relaxed mb-4 line-clamp-3">
                    {t(service.description, service.englishDescription)}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-[9px] text-navy font-bold uppercase bg-navy/5 px-2 py-1 rounded-md border border-navy/10">
                      {service.category === 'MASSAGE' ? 'Muscle Recovery' : 'Skin Rejuvenation'}
                    </span>
                    <span className="text-[9px] text-navy font-bold uppercase bg-navy/5 px-2 py-1 rounded-md border border-navy/10">
                      {service.category === 'MASSAGE' ? 'Firm Pressure' : 'Organic Products'}
                    </span>
                  </div>

                  {/* Pricing Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="bg-section p-3 rounded-xl flex justify-between items-center">
                      <span className="text-[10px] font-bold text-navy/40 uppercase">30M</span>
                      <span className="text-sm font-bold text-navy">${Math.round(price * 0.7)}</span>
                    </div>
                    <div className="bg-section p-3 rounded-xl flex justify-between items-center">
                      <span className="text-[10px] font-bold text-navy/40 uppercase">45M</span>
                      <span className="text-sm font-bold text-navy">${Math.round(price * 0.85)}</span>
                    </div>
                    <div className="bg-section p-3 rounded-xl flex justify-between items-center">
                      <span className="text-[10px] font-bold text-navy/40 uppercase">60M</span>
                      <span className="text-sm font-bold text-navy">${price}</span>
                    </div>
                    <div className="bg-section p-3 rounded-xl flex justify-between items-center">
                      <span className="text-[10px] font-bold text-navy/40 uppercase">90M</span>
                      <span className="text-sm font-bold text-navy">${Math.round(price * 1.4)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAddClick(service)}
                    className="w-full py-4 bg-gold text-primary rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold/90 transition-all active:scale-95 mt-auto"
                  >
                    {t('จองนัดหมาย', 'Book Appointment')}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Find Us Section */}
      {/* Find Us Section */}
      <section id="location" className="relative overflow-hidden bg-white">
        {/* Top Half Background Image */}
        <div className="absolute top-0 left-0 right-0 h-[40%] z-0">
          <img 
            src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=2070&auto=format&fit=crop" 
            alt="Massage Atmosphere" 
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
        </div>

        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-sage text-xs font-bold uppercase tracking-[0.4em]">Visit Us</span>
            <h2 className="text-4xl font-serif font-bold text-forest">Find Us</h2>
          </div>

          {/* Stacked Info Grid (Top Half) */}
          <div className="flex flex-col gap-4">
            {/* Address Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-cream p-6 rounded-2xl border border-primary/5 flex items-center gap-4 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-forest flex-shrink-0">
                <MapPin size={18} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-bold text-sage uppercase tracking-widest">Location</p>
                <p className="text-sm font-serif font-bold text-forest leading-tight">Level 1/76 Pier Street, Altona 3018</p>
              </div>
            </motion.div>

            {/* Hours Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-cream p-6 rounded-2xl border border-primary/5 flex items-center gap-4 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-forest/5 flex items-center justify-center text-forest flex-shrink-0">
                <Clock size={18} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-bold text-sage uppercase tracking-widest">Opening Hours</p>
                <p className="text-sm font-serif font-bold text-forest leading-tight">7 Days: 10:00 AM - 8:00 PM</p>
              </div>
            </motion.div>
          </div>

          {/* Integrated Action & Map (Bottom Half) */}
          <div className="space-y-6">
            {/* Embedded Map */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-[2.5rem] overflow-hidden shadow-lg border-4 border-white aspect-video relative"
            >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3148.834714652417!2d144.8284563!3d-37.8641499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad6613867c69999%3A0x5045675218ce6e0!2s76%20Pier%20St%2C%20Altona%20VIC%203018!5e0!3m2!1sen!2sau!4v1712640000000!5m2!1sen!2sau" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="transition-all duration-700"
              />
            </motion.div>

            {/* Primary Navigation Button (Dark Green) */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeConfig.address)}`, '_blank')}
              className="w-full bg-primary text-cream py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-3"
            >
              <Map size={18} />
              GET DIRECTIONS
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
}
