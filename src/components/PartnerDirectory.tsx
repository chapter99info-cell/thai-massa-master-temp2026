import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, ExternalLink, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { partnerAds } from '../data/partners';
import { storeConfig } from '../config';

export default function PartnerDirectory() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkIsTablet = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth <= 1024);
    };
    checkIsTablet();
    window.addEventListener('resize', checkIsTablet);
    return () => window.removeEventListener('resize', checkIsTablet);
  }, []);

  // Auto-rotate for tablet slider
  useEffect(() => {
    if (isTablet) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % partnerAds.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isTablet]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % partnerAds.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + partnerAds.length) % partnerAds.length);

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#333333] font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-8 text-center sticky top-0 z-30 shadow-sm">
        <h1 className="text-3xl font-serif font-bold text-[#B8962E] tracking-tight">Exclusive Local Deals for You</h1>
        <p className="text-slate-500 uppercase tracking-[0.2em] text-[10px] font-bold mt-2">
          Curated by {storeConfig.storeName}
        </p>
      </header>

      {/* Nong Mira Welcome */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#B8962E]/10 border border-[#B8962E]/20 p-6 rounded-[2rem] flex items-center gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <Heart size={24} fill="currentColor" />
          </div>
          <div>
            <p className="text-[#B8962E] font-bold text-lg leading-tight">
              "Hi there! While you relax, check out these amazing deals from our local partners specially curated for you."
            </p>
            <p className="text-[10px] text-[#B8962E]/60 uppercase font-black tracking-widest mt-1">Chapter99 Solution (by Nong Mira)</p>
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        {isTablet ? (
          /* Tablet Slider View */
          <div className="relative group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100"
              >
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img 
                    src={partnerAds[currentIndex].imageUrl} 
                    alt={partnerAds[currentIndex].englishName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-[#B8962E] shadow-lg">
                      {partnerAds[currentIndex].category}
                    </span>
                  </div>
                </div>
                <div className="p-10 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-serif font-bold text-[#333333]">{partnerAds[currentIndex].englishName}</h2>
                    <p className="text-slate-600 text-lg leading-relaxed">{partnerAds[currentIndex].englishDescription}</p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <a 
                      href={partnerAds[currentIndex].mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-5 bg-[#B8962E] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-[#B8962E]/20 hover:opacity-90 transition-all"
                    >
                      <MapPin size={20} />
                      View Map
                    </a>
                    <a 
                      href={`tel:${partnerAds[currentIndex].phone}`}
                      className="flex-1 py-5 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                    >
                      <Phone size={20} />
                      Call to Order
                    </a>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={24} />
            </button>

            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {partnerAds.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-[#B8962E]' : 'w-2 bg-slate-300'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Mobile List View */
          <div className="space-y-8">
            {partnerAds.map((ad, idx) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100"
              >
                <div className="aspect-video relative">
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.englishName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-[#B8962E] shadow-md">
                      {ad.category}
                    </span>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-serif font-bold text-[#333333]">{ad.englishName}</h2>
                    <p className="text-slate-600 text-sm leading-relaxed">{ad.englishDescription}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <a 
                      href={ad.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-[#B8962E] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#B8962E]/20"
                    >
                      <MapPin size={18} />
                      View Map
                    </a>
                    <a 
                      href={`tel:${ad.phone}`}
                      className="w-full py-4 bg-slate-50 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-200"
                    >
                      <Phone size={18} />
                      Call to Order
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 px-8 py-10 text-center border-t border-slate-200 opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Partner Directory • {storeConfig.storeName}</p>
      </footer>
    </div>
  );
}
