import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, CreditCard, Send, Mail, User, ShieldCheck, Sparkles, QrCode, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { QRCodeSVG } from 'qrcode.react';
import { storeConfig } from '../config';
import { formatCurrency } from '../lib/utils';

const VOUCHER_OPTIONS = [
  { id: 'v1', value: 50, label: '$50 Silver Gift' },
  { id: 'v2', value: 100, label: '$100 Gold Gift' },
  { id: 'v3', value: 200, label: '$200 Platinum Gift' },
  { id: 'v4', value: 500, label: '$500 Royal Gift' },
];

export default function VoucherStore() {
  const { t } = useLanguage();
  const [selectedVoucher, setSelectedVoucher] = useState(VOUCHER_OPTIONS[1]);
  const [step, setStep] = useState<'selection' | 'details' | 'success'>('selection');
  const [details, setDetails] = useState({
    recipientName: '',
    recipientEmail: '',
    senderName: '',
    message: ''
  });

  const handlePurchase = () => {
    setStep('success');
  };

  const voucherCode = `GP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
          <Gift size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-serif font-black text-navy">{t('บัตรกำนัลดิจิทัล', 'Digital Gift Vouchers')}</h2>
          <p className="text-slate-500 text-sm">{t('มอบของขวัญแห่งความผ่อนคลายให้คนที่คุณรัก', 'Give the gift of relaxation to your loved ones')}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'selection' && (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {VOUCHER_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedVoucher(opt)}
                  className={`p-6 rounded-3xl border-4 transition-all text-left relative overflow-hidden group ${
                    selectedVoucher.id === opt.id 
                    ? 'border-amber-500 bg-amber-50 shadow-xl shadow-amber-500/10' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                    selectedVoucher.id === opt.id ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Sparkles size={20} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{opt.label}</div>
                  <div className="text-3xl font-serif font-black text-navy">{formatCurrency(opt.value)}</div>
                  
                  {selectedVoucher.id === opt.id && (
                    <motion.div 
                      layoutId="check"
                      className="absolute top-4 right-4 text-amber-500"
                    >
                      <ShieldCheck size={24} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <div className="bg-navy rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border-8 border-white/5 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
              
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest border border-white/10">Premium Gift</span>
                </div>
                <h3 className="text-4xl font-serif font-black mb-4 leading-tight">
                  {t('เลือกมูลค่าบัตรที่ต้องการ', 'Select your voucher value')}
                </h3>
                <p className="text-white/60 text-lg max-w-md">
                  {t('บัตรกำนัลสามารถใช้แทนเงินสดได้กับทุกบริการในร้าน พร้อมส่งทางอีเมลทันทีหลังชำระเงิน', 'Valid for all services. Electronic delivery instantly after purchase.')}
                </p>
              </div>

              <div className="relative z-10 w-full md:w-auto">
                <button 
                  onClick={() => setStep('details')}
                  className="w-full md:w-auto px-10 py-5 bg-amber-500 text-navy font-black rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-3"
                >
                  {t('ดำเนินการต่อ', 'Continue')} <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div 
            key="details"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="space-y-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <User className="text-amber-500" />
                <h4 className="text-xl font-serif font-bold text-navy">{t('รายละเอียดผู้รับ', 'Recipient Details')}</h4>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 ml-1">{t('ชื่อผู้รับ', 'Recipient Name')}</label>
                  <input 
                    type="text" 
                    value={details.recipientName}
                    onChange={e => setDetails({...details, recipientName: e.target.value})}
                    placeholder="Enter name"
                    className="w-full px-5 py-3 rounded-2xl border-slate-100 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 ml-1">{t('อีเมลผู้รับ', 'Recipient Email')}</label>
                  <input 
                    type="email" 
                    value={details.recipientEmail}
                    onChange={e => setDetails({...details, recipientEmail: e.target.value})}
                    placeholder="example@mail.com"
                    className="w-full px-5 py-3 rounded-2xl border-slate-100 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 ml-1">{t('ชื่อผู้ส่ง', 'Sender Name')}</label>
                  <input 
                    type="text" 
                    value={details.senderName}
                    onChange={e => setDetails({...details, senderName: e.target.value})}
                    placeholder="Your name"
                    className="w-full px-5 py-3 rounded-2xl border-slate-100 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 ml-1">{t('ข้อความอวยพร', 'Personal Message')}</label>
                  <textarea 
                    rows={3}
                    value={details.message}
                    onChange={e => setDetails({...details, message: e.target.value})}
                    placeholder="Happy Birthday!"
                    className="w-full px-5 py-3 rounded-2xl border-slate-100 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-amber-500 p-8 rounded-[3rem] text-navy shadow-xl shadow-amber-500/20 flex flex-col justify-between h-64 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:scale-110 transition-transform">
                  <Gift size={64} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">{storeConfig.storeName} GIFT</div>
                  <h4 className="text-3xl font-serif font-black">{details.recipientName || 'Recipient'}</h4>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Value</div>
                    <div className="text-4xl font-serif font-black">{formatCurrency(selectedVoucher.value)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Expires</div>
                    <div className="font-bold">May 2027</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex-1 space-y-6">
                 <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                   <div className="text-slate-400 font-bold">{t('สรุปยอดชำระ', 'Subtotal')}</div>
                   <div className="text-2xl font-serif font-black text-navy">{formatCurrency(selectedVoucher.value)}</div>
                 </div>

                 <button 
                  onClick={handlePurchase}
                  className="w-full py-5 bg-navy text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                >
                  <CreditCard size={20} /> {t('ชำระเงิน', 'Secure Checkout')}
                </button>
                
                <button 
                  onClick={() => setStep('selection')}
                  className="w-full text-slate-400 text-xs font-bold hover:text-navy transition-all"
                >
                  {t('ย้อนกลับ', 'Back to selection')}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 rounded-[2rem] bg-emerald-500 text-white flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30 scale-110">
              <Sparkles size={48} />
            </div>
            
            <h3 className="text-4xl font-serif font-black text-navy mb-4">
              {t('สั่งซื้อบัตรกำนัลสำเร็จ!', 'Voucher Purchased!')}
            </h3>
            <p className="text-slate-500 max-w-md mx-auto mb-12">
              {t('น้องส้มส่ง E-Voucher ไปที่อีเมลผู้รับเรียบร้อยแล้วค่ะ! 🍊 พี่สามารถดาวน์โหลดเก็บไว้หรือแชร์ลิงก์ให้ทางแอปแชทได้ทันทีนะคะ', 'Nong Som has sent the E-Voucher to the recipient\'s email! 🍊 You can also download it or share the link via chat apps instantly.')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center gap-6">
                <div className="p-4 bg-white border-2 border-slate-50 rounded-3xl">
                  <QRCodeSVG value={`https://ais-v4.app/redeem/${voucherCode}`} size={160} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Your Code</div>
                  <div className="text-2xl font-serif font-black text-navy tracking-widest uppercase">{voucherCode}</div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button className="flex-1 flex items-center justify-center gap-3 px-6 py-8 rounded-[2.5rem] bg-amber-500 text-navy font-black hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/10 group">
                  <Download className="group-hover:translate-y-1 transition-transform" /> {t('ดาวน์โหลด PDF', 'Download PDF')}
                </button>
                <button 
                  onClick={() => {
                    setStep('selection');
                    setDetails({ recipientName: '', recipientEmail: '', senderName: '', message: '' });
                  }}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-8 rounded-[2.5rem] bg-navy text-white font-black hover:bg-slate-800 transition-all shadow-xl group"
                >
                  {t('ซื้อเพิ่มอีกใบ', 'Buy Another Gift')} <Gift />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
