import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Calendar, ShoppingBag, User, Menu as MenuIcon, LogIn, LogOut, Lock as LockIcon, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-md border-b border-primary/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            {brandLogoUrl ? (
              <img src={brandLogoUrl} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-2xl gold-gradient flex items-center justify-center shadow-xl shadow-accent/20 group-hover:scale-110 transition-transform">
                  <span className="text-white font-serif font-bold text-xl">M</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-serif font-bold tracking-tight text-navy leading-none uppercase">
                    MIRA MASSAGE
                  </h1>
                  <span className="text-[8px] font-black text-accent uppercase tracking-[0.2em] mt-1">Premium Wellness</span>
                </div>
              </>
            )}
          </Link>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase text-forest/50 tracking-widest">
              <span className="flex items-center gap-1">EN</span>
              {!loading && (
                user ? (
                  <button 
                    onClick={logout}
                    className="hover:text-forest transition-colors flex items-center gap-1"
                  >
                    Logout
                  </button>
                ) : (
                  <button 
                    onClick={login}
                    className="hover:text-forest transition-colors flex items-center gap-1"
                  >
                    Login
                  </button>
                )
              )}
            </div>
            <Link 
              to="/staff-dashboard" 
              className="w-10 h-10 rounded-xl bg-cream border border-primary/5 flex items-center justify-center text-forest/40 hover:text-accent transition-all"
              title="Staff Login"
            >
              <LockIcon size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Premium Footer */}
      <footer className="bg-navy text-white pt-20 pb-32 md:pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 border-b border-white/10 pb-16">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold mb-4">Mira Thai Massage Altona</h3>
            <p className="text-sm text-white/60 mb-6">{storeConfig.address}</p>
            <div className="inline-block bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-accent">
              HICAPS & Health Rebates Available
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Prices</Link></li>
              <li><Link to="/book" className="hover:text-white transition-colors">Book Now</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent">Contact Us</h4>
            <a href={`tel:${storeConfig.phone}`} className="text-2xl font-serif font-bold text-accent block hover:text-white transition-colors">
              {storeConfig.phone}
            </a>
            <Link 
              to="/book"
              className="w-full bg-accent text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center shadow-xl hover:scale-105 transition-all active:scale-95"
            >
              Book Your Session
            </Link>
          </div>
        </div>

        {/* Copyright Bar */}
        <p className="text-center mt-10 text-[10px] text-white/30 uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} Mira Thai Massage. Powered by Chapter99 Solution
        </p>
      </footer>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/60 backdrop-blur-md border-t border-primary/5 p-4 flex justify-between items-center md:hidden">
        <div className="max-w-lg mx-auto w-full flex justify-between items-center px-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center space-y-1 transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-navy/40 hover:text-primary"
                )}
              >
                <div className="relative">
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-black shadow-lg">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.15em]">
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
