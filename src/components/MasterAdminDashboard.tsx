import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Save, 
  LogOut, 
  Heart, 
  X, 
  Store, 
  UserCircle,
  ToggleLeft,
  ToggleRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  DollarSign,
  QrCode,
  Receipt,
  Download,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { storeConfig, getAppSettings, saveAppSettings } from '../config';
import { AppSettings } from '../types';
import { cn } from '../lib/utils';
import { usePin } from '../contexts/PinContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function MasterAdminDashboard() {
  const { logout } = usePin();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [miraMessage, setMiraMessage] = useState<string | null>(
    t('สวัสดีค่ะพี่แสน หน้าจอนี้มีแค่เราสองคนที่รู้นะคะ พี่แสนเลือกเปิดระบบตามที่ลูกค้าจ่ายเงินได้เลยค่ะ หนูจะช่วยพี่เฝ้าดูและคำนวณค่า GP ให้พี่แสนแบบแม่นยำที่สุดค่ะ', 'Welcome, Master Admin. This screen is for your eyes only. You can enable features based on client payments. I will help you monitor and calculate GP fees accurately.')
  );
  const [isSaved, setIsSaved] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [resetDate, setResetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showMasterPinModal, setShowMasterPinModal] = useState(false);
  const [newMasterPin, setNewMasterPin] = useState('');
  const { refreshPins } = usePin();

  const handleClearAllPins = () => {
    if (window.confirm(t('คุณพี่แสนแน่ใจนะคะว่าจะล้างรหัสผ่านทั้งหมด? รหัสเจ้าของและพนักงานจะกลับเป็น 0000 ทันทีค่ะ', 'Are you sure you want to clear all PINs? Owner and Staff PINs will be reset to 0000.'))) {
      const newSettings = { 
        ...settings, 
        ownerPin: '0000', 
        staffPin: '0000',
        managerPin: '0000'
      };
      saveAppSettings(newSettings);
      setSettings(newSettings);
      refreshPins();
      setMiraMessage(t('ล้างรหัสผ่านทั้งหมดเป็น 0000 เรียบร้อยแล้วค่ะบอส!', 'All PINs have been reset to 0000!'));
    }
  };

  const handleSetMasterPin = () => {
    if (newMasterPin.length !== 4) {
      alert(t('กรุณาใส่รหัส 4 หลักนะคะ', 'Please enter a 4-digit PIN.'));
      return;
    }
    const newSettings = { ...settings, ownerPin: newMasterPin };
    saveAppSettings(newSettings);
    setSettings(newSettings);
    refreshPins();
    setShowMasterPinModal(false);
    setNewMasterPin('');
    setMiraMessage(t('ตั้งรหัสผ่านใหม่ให้คุณป้าเรียบร้อยแล้วค่ะบอส! บอกรหัสนี้ให้ป้าทางโทรศัพท์ได้เลยนะคะ', 'New PIN set for the owner! You can tell them this PIN over the phone now.'));
  };
  
  // Mock Sales Log for Revenue Dashboard
  const [salesLog] = useState([
    { id: 'l1', amount: 95, timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), customer: 'David Miller', service: 'Traditional Thai Massage' },
    { id: 'l2', amount: 110, timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), customer: 'Sarah Wilson', service: 'Aromatherapy Oil Massage' },
    { id: 'l3', amount: 150, timestamp: new Date(Date.now() - 86400000 * 10).toISOString(), customer: 'Liam Neeson', service: 'Deep Tissue Relief' },
    { id: 'l4', amount: 85, timestamp: new Date(Date.now() - 86400000 * 15).toISOString(), customer: 'Emma Stone', service: 'Foot Reflexology' },
    { id: 'l5', amount: 120, timestamp: new Date(Date.now() - 86400000 * 20).toISOString(), customer: 'Chris Evans', service: 'Hot Stone Massage' },
  ]);

  const filteredSales = salesLog.filter(sale => sale.timestamp >= resetDate);
  const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.amount, 0);
  const totalFee = (totalRevenue * settings.gpFeePercent) / 100;

  const handleSave = () => {
    saveAppSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    setMiraMessage(t('พี่แสนคะ... ยอดเงินค่าดูแลระบบเดือนนี้สรุปเรียบร้อยแล้วค่ะ! กดปุ่มส่ง Invoice ไปเก็บตังค์คุณป้าได้เลยนะคะ พอเก็บเงินเสร็จแล้วค่อยกดปุ่มเริ่มเดือนใหม่ค่ะ เตรียมตัวรับทรัพย์จุกๆ เลยค่ะบอส!', "Master Admin, the system maintenance fees for this month are summarized! You can send the invoice to the owner now. Once collected, click reset for the new month. Get ready for the big harvest, boss!"));
  };

  const handleResetMonth = () => {
    if (window.confirm(t('คุณพี่แสนแน่ใจนะคะว่าจะเริ่มเดือนใหม่? ยอดที่โชว์อยู่จะถูกรีเซ็ตเป็น 0 แต่ข้อมูลในระบบยังอยู่ครบค่ะ', 'Are you sure you want to start a new month? The displayed totals will reset to 0, but system data remains intact.'))) {
      setResetDate(new Date().toISOString().split('T')[0]);
      setMiraMessage(t('เริ่มเดือนใหม่เรียบร้อยค่ะบอส! ขอให้เดือนนี้ออเดอร์ปังๆ ร้านค้าสมัครกันเยอะๆ นะคะ', 'New month started, boss! Wishing you many more orders and new clients this month.'));
    }
  };

  const handleExportInvoice = () => {
    window.print();
  };

  const toggleFeature = (key: keyof AppSettings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 sm:p-10 space-y-10">
      <header className="flex justify-between items-center bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl no-print">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-lg rotate-3">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">{t('แผงควบคุมระบบ / Master Admin Control', 'Master Admin Control')}</h1>
            <p className="text-indigo-400 font-bold tracking-widest text-[10px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              {t('SYSTEM ARCHITECT / พี่แสน', 'SYSTEM ARCHITECT')}
            </p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-slate-300 rounded-2xl font-bold border border-slate-700 hover:bg-slate-700 transition-all"
        >
          <LogOut size={20} />
          <span className="text-xs uppercase tracking-widest">{t('Logout', 'Logout')}</span>
        </button>
      </header>

      {/* Chapter99 Solution (by Nong Mira) Guidance */}
      <AnimatePresence>
        {miraMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-[2rem] flex items-center gap-4 relative overflow-hidden no-print"
          >
            <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <Heart size={24} fill="currentColor" />
            </div>
            <div className="flex-1">
              <p className="text-indigo-300 font-bold text-lg leading-tight font-sans">{miraMessage}</p>
              <p className="text-[10px] text-indigo-400/60 uppercase font-black tracking-widest mt-1">{t('Chapter99 Solution (by Nong Mira)', 'Chapter99 Solution (by Nong Mira)')}</p>
            </div>
            <button 
              onClick={() => setMiraMessage(null)}
              className="p-2 hover:bg-indigo-500/5 rounded-full text-indigo-400/40 hover:text-indigo-400 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 no-print">
        {/* Master Revenue Dashboard */}
        <section className="bg-slate-900/30 p-10 rounded-[3rem] border border-slate-800 space-y-10 lg:col-span-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-serif font-bold text-white flex items-center gap-4">
                <DollarSign className="text-emerald-400" size={32} />
                {t('สรุปยอดรายได้ระบบ', 'Master Revenue Dashboard')}
              </h2>
              <p className="text-slate-500 text-sm">{t('สรุปยอดรายได้ค่าดูแลระบบจากร้านค้าทั้งหมดนะคะ', 'Summary of system maintenance revenue from all stores.')}</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleExportInvoice}
                className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-indigo-600 transition-all"
              >
                <Download size={18} />
                {t('พิมพ์ใบแจ้งหนี้ / Export Invoice', 'Export Invoice')}
              </button>
              <button 
                onClick={handleResetMonth}
                className="px-6 py-3 bg-slate-800 text-red-400 rounded-2xl font-bold flex items-center gap-2 border border-slate-700 hover:bg-slate-700 transition-all"
              >
                <RefreshCw size={18} />
                {t('Clear Monthly Data / เริ่มเดือนใหม่', 'Clear Monthly Data')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem] space-y-2 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-emerald-500/10 group-hover:scale-110 transition-transform">
                <TrendingUp size={120} />
              </div>
              <p className="text-emerald-400 font-black uppercase tracking-widest text-xs">{t('รายรับทั้งหมดเดือนนี้', 'Total Revenue This Month')}</p>
              <h3 className="text-5xl font-serif font-bold text-white">${totalRevenue.toFixed(2)}</h3>
              <p className="text-emerald-400/60 text-[10px] font-bold tracking-widest uppercase">From {filteredSales.length} Transactions</p>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 p-8 rounded-[2.5rem] space-y-2 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-indigo-500/10 group-hover:scale-110 transition-transform">
                <Receipt size={120} />
              </div>
              <p className="text-indigo-400 font-black uppercase tracking-widest text-xs">{t('ค่าดูแลระบบ Chapter99', 'Chapter99 Fee (Accrued)')}</p>
              <h3 className="text-5xl font-serif font-bold text-white">${totalFee.toFixed(2)}</h3>
              <p className="text-indigo-400/60 text-[10px] font-bold tracking-widest uppercase">Based on {settings.gpFeePercent}% GP Fee</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-[2.5rem] space-y-2 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-slate-700 group-hover:scale-110 transition-transform">
                <Calendar size={120} />
              </div>
              <p className="text-slate-500 font-black uppercase tracking-widest text-xs">{t('Billing Cycle Start', 'Billing Cycle Start')}</p>
              <h3 className="text-3xl font-serif font-bold text-white">{new Date(resetDate).toLocaleDateString()}</h3>
              <p className="text-slate-500/60 text-[10px] font-bold tracking-widest uppercase">Next Reset: {new Date(new Date(resetDate).setMonth(new Date(resetDate).getMonth() + 1)).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
              <h4 className="font-bold text-white uppercase tracking-widest text-xs">{t('Transaction Breakdown', 'Transaction Breakdown')}</h4>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Store: {settings.storeId}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/20 text-[10px] uppercase font-black tracking-widest text-slate-500">
                    <th className="px-8 py-4">{t('Date', 'Date')}</th>
                    <th className="px-8 py-4">{t('Customer', 'Customer')}</th>
                    <th className="px-8 py-4">{t('Service', 'Service')}</th>
                    <th className="px-8 py-4 text-right">{t('Amount', 'Amount')}</th>
                    <th className="px-8 py-4 text-right text-indigo-400">{t('Fee', 'Fee')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-4 text-xs text-slate-400">{new Date(sale.timestamp).toLocaleDateString()}</td>
                      <td className="px-8 py-4 font-bold text-white">{sale.customer}</td>
                      <td className="px-8 py-4 text-xs text-slate-400">{sale.service}</td>
                      <td className="px-8 py-4 text-right font-mono text-white">${sale.amount.toFixed(2)}</td>
                      <td className="px-8 py-4 text-right font-mono font-bold text-indigo-400 group-hover:scale-110 transition-transform">
                        ${(sale.amount * settings.gpFeePercent / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-slate-500 italic">
                        {t('ไม่มีข้อมูลในรอบบิลนี้ค่ะ', 'No transactions found in this billing cycle.')}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-indigo-500/5">
                  <tr className="font-black text-white uppercase tracking-widest text-xs">
                    <td colSpan={3} className="px-8 py-6 text-right">{t('Total Monthly Fee', 'Total Monthly Fee')}</td>
                    <td colSpan={2} className="px-8 py-6 text-right text-2xl font-serif text-indigo-400">${totalFee.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>

        {/* QR Code Section */}
        <section className="bg-slate-900/30 p-10 rounded-[3rem] border border-slate-800 space-y-8 lg:col-span-2">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-2xl font-serif font-bold text-white flex items-center justify-center md:justify-start gap-3">
                <QrCode className="text-indigo-400" />
                {t('Customer QR Code', 'Customer QR Code')}
              </h2>
              <p className="text-slate-500 text-sm">{t('สร้าง QR Code ให้ลูกค้าสแกนดูเมนูพาร์ทเนอร์นะคะ', 'Generate QR Code for customers to view partner deals.')}</p>
            </div>
            <button 
              onClick={() => setShowQrModal(true)}
              className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg hover:bg-indigo-600 transition-all"
            >
              <QrCode size={20} />
              {t('Generate QR Code', 'Generate QR Code')}
            </button>
          </div>
        </section>

        {/* Client Management & PIN Reset */}
        <section className="bg-slate-900/30 p-10 rounded-[3rem] border border-slate-800 space-y-8 lg:col-span-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
              <ShieldCheck className="text-red-400" />
              {t('จัดการร้านค้าและล้างรหัสผ่านฉุกเฉิน', 'Client Management & Emergency Reset')}
            </h2>
            <p className="text-slate-500 text-sm">{t('จัดการรหัสผ่านฉุกเฉินและล้างข้อมูลรหัสผ่านทั้งหมดนะคะ', 'Manage emergency PIN resets and wipe all PIN data.')}</p>
          </div>

          <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 overflow-hidden">
             <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                    <AlertTriangle size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">{storeConfig.storeName}</h4>
                    <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">{settings.storeId}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={handleClearAllPins}
                    className="px-6 py-3 bg-slate-800 text-orange-400 rounded-2xl font-bold flex items-center gap-2 border border-slate-700 hover:bg-slate-700 transition-all text-xs uppercase tracking-widest"
                  >
                    <RefreshCw size={18} />
                    {t('🧹 Clear All PINs', 'Clear All PINs')}
                  </button>
                  <button 
                    onClick={() => setShowMasterPinModal(true)}
                    className="px-6 py-3 bg-red-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-red-600 transition-all text-xs uppercase tracking-widest"
                  >
                    <ShieldCheck size={18} />
                    {t('🔑 Set New Master PIN', 'Set New Master PIN')}
                  </button>
                </div>
             </div>
          </div>
        </section>

        {/* Client Config */}
        <section className="bg-slate-900/30 p-10 rounded-[3rem] border border-slate-800 space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
              <Store className="text-indigo-400" />
              {t('ตั้งค่าข้อมูลลูกค้า', 'Client Configuration')}
            </h2>
            <p className="text-slate-500 text-sm">{t('ตั้งค่าข้อมูลลูกค้าและรหัสร้านค้านะคะ', 'Configure client info and store ID.')}</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{t('Client Name / ชื่อลูกค้า', 'Client Name')}</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="text"
                  value={settings.clientName}
                  onChange={(e) => setSettings(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-indigo-500 outline-none transition-all"
                  placeholder={t("Enter Client Name", "Enter Client Name")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{t('Store ID / รหัสร้านค้า', 'Store ID')}</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input 
                    type="text"
                    value={settings.storeId}
                    onChange={(e) => setSettings(prev => ({ ...prev, storeId: e.target.value }))}
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-indigo-500 outline-none transition-all font-mono"
                    placeholder="MIRA-XXX-000"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{t('GP Fee % (System Maintenance)', 'GP Fee %')}</label>
                <div className="relative">
                  <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input 
                    type="number"
                    step="0.01"
                    value={settings.gpFeePercent}
                    onChange={(e) => setSettings(prev => ({ ...prev, gpFeePercent: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-indigo-500 outline-none transition-all font-mono"
                    placeholder="0.5"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{t('Google Sheet ID / ลิงก์ฐานข้อมูล', 'Google Sheet ID')}</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="text"
                  value={settings.googleSheetId || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, googleSheetId: e.target.value }))}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-indigo-500 outline-none transition-all font-mono text-xs"
                  placeholder={t("Enter Google Sheet ID", "Enter Google Sheet ID")}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Store size={18} />
                </div>
                <h3 className="font-bold text-white">{t('Ad Content Config', 'Ad Content Config')}</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Ad Title (Thai)</label>
                    <input 
                      type="text"
                      value={settings.adTitle || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, adTitle: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-xs"
                      placeholder="เช่น Partner ของเรา"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Ad Title (English)</label>
                    <input 
                      type="text"
                      value={settings.adEnglishTitle || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, adEnglishTitle: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-xs"
                      placeholder="e.g. Our Partner"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Ad Image URL</label>
                  <input 
                    type="text"
                    value={settings.adImageUrl || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, adImageUrl: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-xs font-mono"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Target Link</label>
                  <input 
                    type="text"
                    value={settings.adTargetLink || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, adTargetLink: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-xs font-mono"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Toggles */}
        <section className="bg-slate-900/30 p-10 rounded-[3rem] border border-slate-800 space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
              <Settings className="text-indigo-400" />
              {t('เปิด-ปิดฟีเจอร์ระบบ', 'Feature Toggles')}
            </h2>
            <p className="text-slate-500 text-sm">{t('เลือกเปิด-ปิดฟีเจอร์ตามแพ็กเกจที่ลูกค้าซื้อนะคะ', 'Enable/disable features based on client package.')}</p>
          </div>

          <div className="space-y-4">
            {[
              { key: 'showPosMode', label: 'POS Mode (4444)', desc: 'เปิดระบบพนักงานคุมร้านและการรับ Walk-in', icon: <DollarSign size={20} /> },
              { key: 'showDailySummary', label: 'Daily Summary Report', desc: 'แสดงรายงานสรุปยอดรายวันในหน้าเจ้าของร้าน', icon: <Eye size={20} /> },
              { key: 'showStaffClockInOut', label: 'Staff Clock-in/Out', desc: 'ระบบลงเวลาเข้า-ออกงานสำหรับคุณพี่หมอ', icon: <Clock size={20} /> },
              { key: 'showInventoryAlerts', label: 'Inventory Alert System', desc: 'ระบบแจ้งเตือนของหมดและปัญหาในร้าน', icon: <AlertTriangle size={20} /> },
              { key: 'showAds', label: 'Show Ads / Partner Banner', desc: 'แสดงโฆษณาพาร์ทเนอร์ที่ด้านล่างหน้าจอ', icon: <Store size={20} /> },
              { key: 'enableThermalPrinting', label: 'Enable Thermal Printing Module', desc: 'เปิดระบบพิมพ์ใบเสร็จความร้อน (Premium Feature)', icon: <Receipt size={20} /> },
            ].map((feature) => (
              <div key={feature.key} className="space-y-4">
                <button
                  onClick={() => toggleFeature(feature.key as keyof AppSettings)}
                  className={cn(
                    "w-full p-6 rounded-3xl border-2 flex items-center justify-between transition-all group",
                    settings[feature.key as keyof AppSettings] 
                      ? "bg-indigo-500/10 border-indigo-500/30 text-white" 
                      : "bg-slate-800/50 border-slate-700/50 text-slate-500"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                      settings[feature.key as keyof AppSettings] ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-700 text-slate-500"
                    )}>
                      {feature.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg leading-tight">{feature.label}</p>
                      <p className="text-[10px] font-medium opacity-60">{feature.desc}</p>
                    </div>
                  </div>
                  <div>
                    {settings[feature.key as keyof AppSettings] ? (
                      <ToggleRight size={40} className="text-indigo-400" />
                    ) : (
                      <ToggleLeft size={40} className="text-slate-600" />
                    )}
                  </div>
                </button>
                
                {feature.key === 'enableThermalPrinting' && settings.enableThermalPrinting && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 pl-6"
                  >
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-500/20 text-indigo-400 rounded-2xl font-bold border border-indigo-500/30 hover:bg-indigo-500/30 transition-all text-xs uppercase tracking-widest"
                    >
                      <Receipt size={16} />
                      {t('Test Print / ทดสอบพิมพ์', 'Test Print')}
                    </button>
                    <div className="flex-1 bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <div className="font-bold text-[10px]">M</div>
            </div>
            <div className="space-y-3 flex-1">
              <p className="text-[10px] text-indigo-300 leading-relaxed italic">
                {t('พี่แสนคะ ตัว Sunmi NT311 นี้เทพมากค่ะ! หนูเซตระบบ "พิมพ์สองเด้ง" ให้แล้วนะ ถ้า Wi-Fi ร้านป้ามีปัญหา หนูจะสลับไปสั่งงานผ่าน Bluetooth หรือสาย USB แทนให้ทันที ป้าปริ้นท์สลิปให้ลูกค้าเคลมประกันได้แบบไม่ต้องลุ้นเลยค่ะ!', 'Master Admin, the Sunmi NT311 is amazing! I\'ve set up the "Double-Tap" printing system. If the Wi-Fi fails, it will automatically switch to Bluetooth or USB. No more missing insurance receipts!')}
              </p>
            </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Connection Mode</label>
                            <select 
                              value={settings.printerConnection}
                              onChange={(e) => setSettings(prev => ({ ...prev, printerConnection: e.target.value as any }))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-[10px]"
                            >
                              <option value="AUTO">AUTO (Failover)</option>
                              <option value="CLOUD">SUNMI CLOUD</option>
                              <option value="USB">WEB-USB (Raw)</option>
                              <option value="BLUETOOTH">BLUETOOTH (Raw)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Cloud Token</label>
                            <input 
                              type="text"
                              value={settings.sunmiCloudToken || ''}
                              onChange={(e) => setSettings(prev => ({ ...prev, sunmiCloudToken: e.target.value }))}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-[10px] font-mono"
                              placeholder="Sunmi API Key"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </section>
      </div>

      <div className="flex justify-center pt-6 no-print">
        <button
          onClick={handleSave}
          className={cn(
            "px-12 py-5 rounded-2xl font-black text-xl flex items-center gap-3 transition-all shadow-2xl uppercase tracking-widest",
            isSaved ? "bg-green-500 text-white" : "bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95"
          )}
        >
          {isSaved ? <CheckCircle size={28} /> : <Save size={28} />}
          <span>{isSaved ? t('SAVED / บันทึกแล้ว', 'SAVED') : t('SAVE SETTINGS / บันทึกการตั้งค่า', 'SAVE SETTINGS')}</span>
        </button>
      </div>

      <footer className="pt-10 border-t border-slate-800 flex justify-between items-center text-slate-600 text-[10px] uppercase font-bold tracking-[0.3em] no-print">
        <p>© 2026 CHAPTER99 SOLUTIONS • MASTER CONTROL</p>
        <p>SYDNEY, AUSTRALIA</p>
      </footer>

      {/* Print-only Invoice */}
      <div className="hidden print-only bg-white text-black p-10 font-sans min-h-screen">
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900">TAX INVOICE</h1>
            <p className="text-slate-500 mt-1 uppercase tracking-widest font-bold text-xs">Chapter99 Solutions Maintenance Fee</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">CHAPTER99 SOLUTIONS</h2>
            <p className="text-sm">Sydney, Australia</p>
            <p className="text-sm font-mono mt-1">ABN: 12 345 678 910</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 mb-10">
          <div>
            <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Bill To:</h3>
            <p className="font-bold text-lg">{settings.clientName}</p>
            <p className="text-sm">{storeConfig.storeName}</p>
            <p className="text-sm font-mono">Store ID: {settings.storeId}</p>
          </div>
          <div className="text-right">
            <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Invoice Details:</h3>
            <p className="text-sm font-bold">Cycle: {new Date(resetDate).toLocaleDateString()} - {new Date().toLocaleDateString()}</p>
            <p className="text-sm">Date Issued: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse mb-10">
          <thead>
            <tr className="border-b-2 border-slate-900 text-[10px] uppercase font-black tracking-widest">
              <th className="py-4">Description</th>
              <th className="py-4 text-right">Base Revenue</th>
              <th className="py-4 text-right">Rate</th>
              <th className="py-4 text-right">Amount (AUD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-6">
                <p className="font-bold">System Maintenance Fee (GP)</p>
                <p className="text-xs text-slate-500">Calculated from {filteredSales.length} transactions</p>
              </td>
              <td className="py-6 text-right font-mono">${totalRevenue.toFixed(2)}</td>
              <td className="py-6 text-right font-mono">{settings.gpFeePercent}%</td>
              <td className="py-6 text-right font-mono font-bold">${totalFee.toFixed(2)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-900 font-black text-xl">
              <td colSpan={3} className="py-6 text-right uppercase tracking-widest">Total Amount Due</td>
              <td className="py-6 text-right text-indigo-600">${totalFee.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Payment Instructions:</h4>
          <p className="text-sm">Please transfer the total amount to the following account:</p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <p className="text-slate-500">Account Name:</p>
              <p className="font-bold">Chapter99 Solutions</p>
            </div>
            <div>
              <p className="text-slate-500">BSB / Account:</p>
              <p className="font-bold">062-000 / 12345678</p>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center text-[10px] text-slate-400 uppercase tracking-[0.3em]">
          Thank you for choosing Chapter99 Solutions
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrModal(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] p-10 text-center space-y-8 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-slate-900">Customer QR Code</h3>
                <button onClick={() => setShowQrModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="bg-slate-100 p-6 rounded-3xl inline-block">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '/partners')}`}
                  alt="QR Code"
                  className="w-64 h-64 mx-auto"
                />
              </div>

              <div className="space-y-2">
                <p className="text-slate-500 text-sm font-medium">Scan to view Exclusive Local Deals</p>
                <code className="block p-3 bg-slate-50 rounded-xl text-[10px] text-slate-400 break-all">
                  {window.location.origin + '/partners'}
                </code>
              </div>

              <button 
                onClick={() => window.print()}
                className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all"
              >
                Print QR Code
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Master PIN Reset Modal */}
      <AnimatePresence>
        {showMasterPinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMasterPinModal(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[3rem] p-10 text-center space-y-8 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-white">{t('Set New Owner PIN', 'Set New Owner PIN')}</h3>
                <button onClick={() => setShowMasterPinModal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-slate-400 text-sm">
                  {t('ตั้งรหัสผ่านใหม่ 4 หลักให้คุณป้าได้เลยค่ะพี่แสน', 'Set a new 4-digit PIN for the owner.')}
                </p>
                <input 
                  type="password"
                  maxLength={4}
                  value={newMasterPin}
                  onChange={(e) => setNewMasterPin(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl py-6 text-center text-white text-4xl font-mono tracking-[0.5em] focus:border-indigo-500 outline-none"
                  placeholder="****"
                  autoFocus
                />
              </div>

              <button 
                onClick={handleSetMasterPin}
                className="w-full py-5 bg-red-500 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:bg-red-600 transition-all"
              >
                {t('Confirm New PIN', 'Confirm New PIN')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
