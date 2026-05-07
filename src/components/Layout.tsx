import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Calendar, ShoppingBag, User, Menu as MenuIcon, LogIn, LogOut, Lock as LockIcon, Phone, MapPin, Clock, ShieldCheck, Flower2 } from 'lucide-react';
import { storeConfig, getAppSettings } from '../config';
import { cn } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { usePin } from '../contexts/PinContext';
import { useLanguage } from '../contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, login, logout, loading } = useAuth();
  const { accessLevel, isAuthenticated: isPinAuth } = usePin();
  const { language, setLanguage } = useLanguage();
  const settings = getAppSettings();
  const brandLogoUrl = settings.brandLogoUrl;
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    ...(storeConfig.packageTier >= 2 ? [
      { icon: Calendar, label: 'Book Now', path: '/book' },
      { icon: ShoppingBag, label: 'Summary', path: '/cart', badge: totalItems },
    ] : []),
    ...(isPinAuth ? [
      { 
        icon: MenuIcon, 
        label: 'Dashboard', 
        path: accessLevel === 'staff' ? '/staff-dashboard' : accessLevel === 'owner' ? '/owner-report' : '/super-admin' 
      }
    ] : []),
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-pearl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-ocean/5">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="w-12 h-12 rounded-2xl border border-ocean/10 bg-ocean/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl shadow-ocean/5 overflow-hidden">
              <div className="text-ocean font-serif font-black text-2xl italic">S</div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-serif font-black tracking-tight text-navy leading-none uppercase italic">
                {storeConfig.storeName}
              </h1>
              <span className="text-[9px] font-black text-ocean/40 uppercase tracking-[0.3em] mt-1 italic">Ocean Breeze - Altona</span>
            </div>
          </Link>
          
          <div className="flex items-center space-x-8">
            <div className="flex items-center gap-8 text-[10px] font-black uppercase text-ocean/40 tracking-widest">
              {!loading && (
                user ? (
                  <button 
                    onClick={logout}
                    className="hover:text-ocean transition-colors flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                ) : (
                  <Link 
                    to="/staff-dashboard"
                    className="login-link hover:text-ocean transition-colors border-b-2 border-transparent hover:border-gold flex items-center gap-2"
                  >
                    <LockIcon size={14} className="text-gold" />
                    <span>Staff Portal</span>
                  </Link>
                )
              )}
            </div>
            <Link 
              to="/cart" 
              className="relative w-12 h-12 rounded-2xl bg-gold text-navy flex items-center justify-center shadow-xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all"
            >
              <ShoppingBag size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-navy text-white text-[10px] flex items-center justify-center font-black shadow-2xl border-2 border-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Premium Footer */}
      <footer className="bg-navy text-white pt-20 pb-32 md:pb-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 border-b border-white/10 pb-16">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-black text-gold mb-4 italic">Premium Thai Wellness</h3>
            <p className="text-sm text-white/60 mb-6">{storeConfig.address}</p>
            <div className="inline-block bg-gold/10 border border-gold/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gold shadow-lg shadow-gold/5">
              HICAPS & Health Rebates Available
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70 font-medium">
              <li><Link to="/" className="hover:text-gold transition-colors uppercase tracking-[0.2em] text-[10px]">Services</Link></li>
              <li><Link to="/" className="hover:text-gold transition-colors uppercase tracking-[0.2em] text-[10px]">Prices</Link></li>
              <li><Link to="/book" className="hover:text-gold transition-colors uppercase tracking-[0.2em] text-[10px]">Book Now</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gold">Contact Us</h4>
            <a href={`tel:${storeConfig.phone}`} className="text-3xl font-serif font-black text-gold block hover:text-white transition-colors drop-shadow-sm">
              {storeConfig.phone}
            </a>
            <Link 
              to="/book"
              className="w-full bg-gold text-navy py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center shadow-xl hover:scale-[1.02] transition-all active:scale-95"
            >
              Book Reservation
            </Link>
          </div>
        </div>

        {/* Copyright Bar */}
        <p className="text-center mt-10 text-[10px] text-white/40 uppercase tracking-[0.4em] font-black">
          © {new Date().getFullYear()} Premium Thai Wellness. Powered by Chapter99 Solution
        </p>
      </footer>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-2xl border-t border-ocean/5 p-5 flex justify-between items-center md:hidden shadow-2xl">
        <div className="max-w-lg mx-auto w-full flex justify-between items-center px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center space-y-1.5 transition-all duration-300",
                  isActive ? "text-ocean scale-110" : "text-ocean/30 hover:text-ocean/60"
                )}
              >
                <div className="relative">
                  <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gold text-navy text-[9px] flex items-center justify-center font-black shadow-lg border border-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
