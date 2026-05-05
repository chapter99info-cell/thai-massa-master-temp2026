import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Star, 
  UserPlus, 
  Gift, 
  Clock, 
  Phone, 
  Mail, 
  Calendar,
  Search,
  Filter,
  UtensilsCrossed,
  ArrowRight
} from 'lucide-react';
import { Customer } from '../types';
import { INITIAL_CUSTOMERS } from '../data/customers';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

export default function CRMSystem() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<'all' | 'vip' | 'new' | 'birthday' | 'inactive'>('all');

  const customers = INITIAL_CUSTOMERS;
  const today = new Date('2026-05-05T00:00:00Z'); // Fixed today for demo

  const categorizedData = useMemo(() => {
    const filtered = customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phone.includes(searchTerm)
    );

    const vips = filtered.filter(c => c.memberTier === 'VIP' || c.totalVisits >= 30);
    const newOnes = filtered.filter(c => {
      const visitDate = new Date(c.lastVisitDate);
      const diffDays = (today.getTime() - visitDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7 && c.totalVisits <= 2;
    });
    
    const birthdays = filtered.filter(c => {
      if (!c.birthday) return false;
      const bDate = new Date(c.birthday);
      // Check if birthday month and day are close
      const bDay = bDate.getDate();
      const bMonth = bDate.getMonth();
      const tDay = today.getDate();
      const tMonth = today.getMonth();
      
      // Simplistic check for upcoming birthday in current/next 7 days
      return bMonth === tMonth && (bDay >= tDay && bDay <= tDay + 7);
    });

    const inactive = filtered.filter(c => {
      const visitDate = new Date(c.lastVisitDate);
      const diffDays = (today.getTime() - visitDate.getTime()) / (1000 * 3600 * 24);
      return diffDays > 60;
    });

    return {
      all: filtered,
      vip: vips,
      new: newOnes,
      birthday: birthdays,
      inactive: inactive
    };
  }, [searchTerm, today, customers]);

  const displayCustomers = categorizedData[selectedCategory];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-charcoal">{t('ระบบจัดการลูกค้า (CRM)', 'Customer CRM')}</h2>
          <p className="text-slate-500 text-sm">{t('แบ่งกลุ่มลูกค้าอัตโนมัติและระบบจดจำความประทับใจ', 'Auto-segmentation and memory system')}</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <Search size={20} className="text-slate-400 ml-2" />
          <input 
            type="text" 
            placeholder={t('ค้นหาชื่อหรือเบอร์โทร...', 'Search name or phone...')}
            className="border-none focus:ring-0 text-sm w-48"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats / Categories */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { id: 'all', label: t('ทั้งหมด', 'All'), icon: Users, color: 'slate', count: categorizedData.all.length },
          { id: 'vip', label: t('VIP', 'VIP'), icon: Star, color: 'amber', count: categorizedData.vip.length },
          { id: 'new', label: t('ลูกค้าใหม่', 'New'), icon: UserPlus, color: 'emerald', count: categorizedData.new.length },
          { id: 'birthday', label: t('วันเกิด', 'Birthday'), icon: Gift, color: 'rose', count: categorizedData.birthday.length },
          { id: 'inactive', label: t('Inactive', 'Inactive'), icon: Clock, color: 'indigo', count: categorizedData.inactive.length },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={cn(
              "p-4 rounded-3xl border-2 transition-all text-left relative overflow-hidden group",
              selectedCategory === cat.id 
                ? `bg-${cat.color}-50 border-${cat.color}-500 shadow-lg shadow-${cat.color}-500/10`
                : "bg-white border-slate-100 hover:border-slate-200"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center mb-3",
              selectedCategory === cat.id ? `bg-${cat.color}-500 text-white` : `bg-${cat.color}-100 text-${cat.color}-600`
            )}>
              <cat.icon size={20} />
            </div>
            <div className="font-bold text-sm text-charcoal">{cat.label}</div>
            <div className="text-xl font-serif font-black text-charcoal">{cat.count}</div>
          </button>
        ))}
      </div>

      {/* Customer List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {displayCustomers.length > 0 ? (
          displayCustomers.map((customer) => (
            <motion.div
              layout
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-2xl font-serif font-bold text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg text-charcoal">{customer.name}</h4>
                      {customer.memberTier === 'VIP' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">VIP</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-black tracking-widest"><Phone size={10} /> {customer.phone}</span>
                      {customer.email && <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-black tracking-widest"><Mail size={10} /> {customer.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-600">${customer.totalSpent}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{customer.totalVisits} {t('ครั้ง', 'Visits')}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1"><Calendar size={10} /> {t('ล่าสุด', 'Last Visit')}</div>
                  <div className="text-xs font-bold text-slate-600 mt-1">{new Date(customer.lastVisitDate).toLocaleDateString()}</div>
                </div>
                {customer.birthday && (
                  <div className="bg-rose-50 p-3 rounded-2xl">
                    <div className="text-[9px] uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1"><Gift size={10} /> {t('วันเกิด', 'Birthday')}</div>
                    <div className="text-xs font-bold text-rose-600 mt-1">{new Date(customer.birthday).toLocaleDateString('th-TH', { day: 'numeric', month: 'long' })}</div>
                  </div>
                )}
              </div>

              {/* Special Promotion for Inactive */}
              {selectedCategory === 'inactive' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
                      <UtensilsCrossed size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-orange-900">{t('โปรโมชั่นดึงกลับ', 'Re-engagement Promo')}</div>
                      <div className="text-[10px] text-orange-700">{t('นวดผ่อนคลายคู่เมนูอาหารสุขภาพ 🍊', 'Relaxing Massage + Healthy Meal 🍊')}</div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-[10px] font-bold hover:bg-orange-600 transition-all">
                    {t('ส่งคูปอง', 'Send Coupon')} <ArrowRight size={12} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <Users size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 italic">{t('ไม่พบข้อมูลลูกค้าในหมวดนี้ค่ะ 🍊', 'No customers found in this category. 🍊')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
