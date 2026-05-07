/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import NongSom from './components/NongSom';
import Cart from './components/Cart';
import StaffDashboard from './components/StaffDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import ManagerInsights from './components/ManagerInsights';
import PinEntry from './components/PinEntry';
import MasterAdminDashboard from './components/MasterAdminDashboard';
import PartnerDirectory from './components/PartnerDirectory';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { PinProvider, usePin } from './contexts/PinContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { BookingProvider } from './contexts/BookingContext';
import { ErrorBoundary } from './components/ErrorBoundary';

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
          // Trigger a re-render if needed, though localStorage update might be enough for next mount
          // For immediate update, we could use a state or context
        }
      }
    };
    fetchBranding();
  }, []);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <BookingProvider>
          <AuthProvider>
            <PinProvider>
              <CartProvider>
                <Router>
                  <Routes>
                    {/* Public Routes with Layout */}
                    <Route path="/" element={<Layout><Home /></Layout>} />
                    <Route path="/book" element={<Layout><Home /></Layout>} />
                    <Route path="/cart" element={<Layout><Cart /></Layout>} />
                    <Route path="/partners" element={<Layout><PartnerDirectory /></Layout>} />
                    <Route path="/profile" element={<Layout><div className="p-8 text-center font-serif italic">User Profile Coming Soon</div></Layout>} />

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
                        <ManagerInsights />
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
                  <NongSom />
                </Router>
              </CartProvider>
            </PinProvider>
          </AuthProvider>
        </BookingProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
