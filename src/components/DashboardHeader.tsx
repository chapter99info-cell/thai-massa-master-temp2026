import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, FileText, Bell, LogOut, Plus } from 'lucide-react';
import { storeConfig } from '../config';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

interface DashboardHeaderProps {
  activeTab: 'calendar' | 'control' | 'crm' | 'marketing' | 'insights';
  setActiveTab?: (tab: 'calendar' | 'control' | 'crm' | 'marketing' | 'insights') => void;
  newAlertsCount: number;
  setShowAlerts: (show: boolean) => void;
  logout: () => void;
  setIsIntakeOpen: (show: boolean) => void;
  onWalkInClick?: () => void;
}

export default function DashboardHeader({ activeTab, setActiveTab, newAlertsCount, setShowAlerts, logout, setIsIntakeOpen, onWalkInClick }: DashboardHeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="bg-ocean/90 backdrop-blur-2xl border-b border-white/20 px-8 py-8 flex justify-between items-center shrink-0 z-40 sticky top-0 shadow-2xl">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-[2rem] bg-white/20 flex items-center justify-center text-white border-2 border-white/30 shadow-2xl rotate-3 scale-110">
          <LayoutGrid size={40} />
        </div>
        <div className="hidden md:block space-y-1">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-white tracking-tight italic leading-tight">{storeConfig.storeName}</h1>
          <p className="text-white/70 uppercase tracking-[0.4em] text-sm md:text-xl font-black">
            {t('Manager Control Hub • Ocean Breeze', 'Premium Management Solution')}
          </p>
        </div>
      </div>

      {/* Mini Bar Navigation */}
      <div className="flex bg-white/10 p-1.5 rounded-[2rem] border border-white/20 backdrop-blur-xl shrink-0 gap-1 overflow-x-auto">
        <Link to="/manager-dashboard" onClick={() => setActiveTab && setActiveTab('calendar')} className={cn("px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all", activeTab === 'calendar' ? "bg-gold text-navy" : "text-white/70 hover:bg-white/10")}>
          {t('MANAGE STAFF', 'MANAGE STAFF')}
        </Link>
        <Link to="/manager-dashboard" onClick={() => setActiveTab && setActiveTab('control')} className={cn("px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all", activeTab === 'control' ? "bg-gold text-navy" : "text-white/70 hover:bg-white/10")}>
          {t('OVERVIEW', 'OVERVIEW')}
        </Link>
        <Link to="/manager-dashboard" className="px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-white/70 hover:bg-white/10 transition-all">
          {t('SUMMARY', 'SUMMARY')}
        </Link>
        <Link to="/manager-dashboard" onClick={() => setActiveTab && setActiveTab('crm')} className={cn("px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all", activeTab === 'crm' ? "bg-gold text-navy" : "text-white/70 hover:bg-white/10")}>
          {t('CRM', 'CRM')}
        </Link>
        <Link to="/ai-marketing" className={cn("px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all", activeTab === 'marketing' ? "bg-indigo-400 text-white" : "text-white/70 hover:bg-white/10")}>
          {t('AI MARKETING', 'AI MARKETING')}
        </Link>
        <Link to="/manager-insights" className={cn("px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all", activeTab === 'insights' ? "bg-emerald-400 text-navy" : "text-white/70 hover:bg-white/10")}>
          {t('AI INSIGHTS', 'AI INSIGHTS')}
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        {onWalkInClick && (
          <button 
            onClick={onWalkInClick}
            className="flex items-center gap-2 px-6 h-14 bg-gold text-navy rounded-[2rem] font-black border border-gold/30 hover:bg-white transition-all shadow-2xl backdrop-blur-md"
          >
            <Plus size={20} />
            <span className="text-[10px] uppercase tracking-[0.2em]">{t('Walk-in', 'Walk-in')}</span>
          </button>
        )}
        <button 
          onClick={() => setIsIntakeOpen(true)}
          className="flex items-center gap-3 px-8 h-14 bg-white/20 text-white rounded-[2rem] font-black border border-white/30 hover:bg-white hover:text-ocean transition-all shadow-2xl backdrop-blur-md"
        >
          <FileText size={20} />
          <span className="text-[10px] uppercase tracking-[0.3em] hidden lg:inline">{t('New Guest', 'New Guest Intake')}</span>
        </button>

        <button 
          onClick={() => setShowAlerts(true)}
          className="relative w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white hover:text-ocean transition-all border border-white/30 shadow-2xl shadow-navy/20"
        >
          <Bell size={24} />
          {newAlertsCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
        
        <button 
          onClick={logout}
          className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-200 flex items-center justify-center border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all shadow-2xl"
        >
          <LogOut size={24} />
        </button>
      </div>
    </header>
  );
}
