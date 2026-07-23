/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import NongSom from './components/NongSom';
import Cart from './components/Cart';
import StaffDashboard from './components/StaffDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AIInsights from './pages/AIInsights';
import AIMarketingPage from './pages/AIMarketingPage';
import MasterConfig3501 from './pages/MasterConfig3501'; 
import PinEntry from './components/PinEntry';
import MasterAdminDashboard from './components/MasterAdminDashboard';
import PartnerDirectory from './components/PartnerDirectory';
import Profile from './pages/Profile';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { PinProvider, usePin } from './contexts/PinContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { BookingProvider } from './contexts/BookingContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import SessionWarning from './components/SessionWarning';

import { storeConfig, getAppSettings, saveAppSettings } from './config';
import { googleSheetService } from './services/googleSheetService';

function ProtectedRoute({ children, level }: { children: React.ReactNode, level: 'staff' | 'manager' | 'owner' | 'admin' }) {
  const { accessLevel, isAuthenticated } = usePin();
  const settings = getAppSettings();
  
  // 🍊 น้องส้มเพิ่ม Log ให้พี่เช็กที่หน้า Console (F12) นะคะ
  console.log("--- Som Debug Access ---");
  console.log("Current Path Level Required:", level);
  console.log("User Authenticated:", isAuthenticated);
  console.log("User Access Level:", accessLevel);
  console.log("Config (showPosMode):", settings.showPosMode);

  if (!isAuthenticated) {
    console.log("🍊 น้องส้มบอกว่า: พี่ต้องไปหน้าใส่ PIN ก่อนนะ!");
    return <PinEntry />;
  }
  
  const levels = { staff: 1, manager: 2, owner: 3, admin: 4 };
  
  if (levels[accessLevel!] < levels[level]) {
    console.log("🍊 น้องส้มบอกว่า: เลเวลพี่ไม่ถึงคลาสนี้ค่ะ!");
    return <PinEntry />;
  }

  if (level === 'manager' && !settings.showPosMode) {
    console.log("🍊 น้องส้มบอกว่า: ลืมเปิดโหมด POS ใน Config หรือเปล่า?");
    return <PinEntry />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const [showInstall, setShowInstall] = React.useState(false);

  React.useEffect(() => {
    const fetchBranding = async () => {
      const settings = getAppSettings();
      if (settings.googleSheetId) {
        const branding = await googleSheetService.fetchAppConfig(settings.googleSheetId);
        if (branding.brandLogoUrl || branding.heroVideoUrl || branding.heroImageUrl || branding.shopDescription) {
          saveAppSettings({
            ...settings,
            ...branding
          });
        }
      }
    };
    fetchBranding();

    const isIpad = /Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIpad && !isStandalone) {
      setShowInstall(true);
    }
  }, []);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <BookingProvider>
          <AuthProvider>
            <PinProvider>
              <CartProvider>
                <Router>
                  {showInstall && (
                    <div id="install-instruction" className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                      <div className="bg-white p-6 rounded-3xl max-w-sm text-center shadow-2xl">
                         <h3 className="font-bold text-lg mb-2">Install for a better experience!</h3>
                         <p className="text-slate-600 mb-4">Tap the 'Share' button and select 'Add to Home Screen' to install this app.</p>
                         <button onClick={() => setShowInstall(false)} className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold">Got it</button>
                      </div>
                    </div>
                  )}
                  <Routes>
                    {/* Public Routes with Layout */}
                    <Route path="/" element={<Layout><Home /></Layout>} />
                    <Route path="/book" element={<Layout><Home /></Layout>} />
                    <Route path="/cart" element={<Layout><Cart /></Layout>} />
                    <Route path="/partners" element={<Layout><PartnerDirectory /></Layout>} />
                    <Route path="/profile" element={<Layout><Profile /></Layout>} />

                    {/* Dashboard Routes (Self-contained Layouts) */}
                    <Route path="/staff-dashboard" element={
                      <ProtectedRoute level="staff">
                        <StaffDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/manager-dashboard" element={
                      <ProtectedRoute level="manager">
                        <ManagerDashboard 
                          enablePrinting={getAppSettings().enableThermalPrinting}
                          billingPlan={getAppSettings().billingPlan || 'GP%'}
                        />
                      </ProtectedRoute>
                    } />
                    <Route path="/manager-insights" element={
                      <ProtectedRoute level="manager">
                        <AIInsights />
                      </ProtectedRoute>
                    } />
                    <Route path="/ai-marketing" element={
                      <ProtectedRoute level="manager">
                        <AIMarketingPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/3501" element={
                      <ProtectedRoute level="admin">
                        <MasterConfig3501 />
                      </ProtectedRoute>
                    } />
                    <Route path="/owner-report" element={
                      <ProtectedRoute level="owner">
                        <OwnerDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/super-admin" element={
                      <ProtectedRoute level="admin">
                        <MasterAdminDashboard />
                      </ProtectedRoute>
                    } />
                  </Routes>
                  <SessionWarning />
                  <NongSomWrapper />
                </Router>
              </CartProvider>
            </PinProvider>
          </AuthProvider>
        </BookingProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

function NongSomWrapper() {
  const location = useLocation();
  const hiddenPaths = [
    '/staff-dashboard',
    '/manager-dashboard',
    '/manager-insights',
    '/ai-marketing',
    '/owner-report',
    '/super-admin',
    '/admin/3501'
  ];
  
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }
  return <NongSom />;
}
