import React from 'react';
import { ExternalLink, Megaphone } from 'lucide-react';
import { getAppSettings } from '../config';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdBanner() {
  const settings = getAppSettings();
  const { t } = useLanguage();

  if (!settings.showAds || !settings.adImageUrl) return null;

  return (
    <div className="w-full max-w-md mx-auto mt-auto pt-6">
      <div className="bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden group relative">
        <a 
          href={settings.adTargetLink || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block relative aspect-[320/50] w-full"
        >
          <img 
            src={settings.adImageUrl} 
            alt="Sponsor" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
          
          {/* Badge */}
          <div className="absolute top-2 left-2 bg-primary/90 text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm">
            <Megaphone size={8} fill="currentColor" />
            <span>{t(settings.adTitle || 'Partner ของเรา', settings.adEnglishTitle || 'Our Partner')}</span>
          </div>

          {/* External Link Icon */}
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-white/90 rounded-lg flex items-center justify-center text-primary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink size={12} />
          </div>
        </a>
      </div>
      <p className="text-[8px] text-center text-accent/30 mt-2 uppercase font-bold tracking-widest">
        {t('Advertisement / พื้นที่โฆษณา', 'Advertisement / Sponsored')}
      </p>
    </div>
  );
}
