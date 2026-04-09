import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Check } from 'lucide-react';
import { Service, Therapist } from '../types';
import { therapists } from '../data/therapists';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

interface TherapistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (therapist?: Therapist) => void;
  service: Service | null;
  defaultGenderFilter?: 'All' | 'Male' | 'Female';
}

export default function TherapistModal({ isOpen, onClose, onSelect, service, defaultGenderFilter = 'All' }: TherapistModalProps) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = React.useState<string>('any');
  const [genderFilter, setGenderFilter] = React.useState<'All' | 'Male' | 'Female'>(defaultGenderFilter);

  React.useEffect(() => {
    setGenderFilter(defaultGenderFilter);
  }, [defaultGenderFilter, isOpen]);

  if (!service) return null;

  const filteredTherapists = therapists.filter(t => {
    // HICAPS Logic: Only HICAPS-enabled staff can be booked for Remedial sessions
    const isRemedial = service.category === 'REMEDIAL' || service.name.toLowerCase().includes('remedial');
    if (isRemedial && !t.isHicapsEnabled) return false;

    if (genderFilter === 'All') return true;
    return t.gender === genderFilter;
  });

  const handleConfirm = () => {
    const therapist = therapists.find(t => t.id === selectedId);
    onSelect(therapist);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-cream rounded-t-[2.5rem] sm:rounded-3xl overflow-hidden shadow-2xl border border-primary/10"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-charcoal">{t('เลือกพนักงาน', 'Select Therapist')}</h3>
                  <p className="text-xs text-accent/60 uppercase tracking-widest font-bold mt-1">
                    {t('สำหรับ', 'For')}: {t(service.name, service.englishName)}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X size={24} className="text-accent" />
                </button>
              </div>

              {/* Gender Filter */}
              <div className="flex gap-2 p-1 bg-white/50 rounded-2xl border border-primary/5">
                {[
                  { value: 'All', label: t('ทุกคน', 'Anyone') },
                  { value: 'Female', label: t('หญิง', 'Female') },
                  { value: 'Male', label: t('ชาย', 'Male') }
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setGenderFilter(f.value as any)}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      genderFilter === f.value 
                        ? "gold-gradient text-white shadow-md" 
                        : "text-accent/40 hover:text-accent/60"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto no-scrollbar pb-4">
                {/* Any Available Option */}
                <button
                  onClick={() => setSelectedId('any')}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
                    selectedId === 'any'
                      ? "bg-white border-primary shadow-md ring-1 ring-primary"
                      : "bg-white/50 border-primary/10 hover:border-primary/30"
                  )}
                >
                  <div className="w-14 h-14 rounded-full bg-accent/5 flex items-center justify-center text-primary border border-primary/10">
                    <User size={28} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-charcoal">{t('พนักงานท่านใดก็ได้', 'Any Available Therapist')}</p>
                    <p className="text-xs text-accent/60">{t('ดีที่สุดสำหรับความพร้อมทันที', 'Best for immediate availability')}</p>
                  </div>
                  {selectedId === 'any' && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </button>

                {/* Therapist List */}
                {filteredTherapists.map((therapist) => (
                  <button
                    key={therapist.id}
                    onClick={() => setSelectedId(therapist.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
                      selectedId === therapist.id
                        ? "bg-white border-primary shadow-md ring-1 ring-primary"
                        : "bg-white/50 border-primary/10 hover:border-primary/30"
                    )}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-primary/10">
                      <img src={therapist.imageUrl} alt={therapist.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-charcoal">{therapist.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {therapist.specialties.map((spec) => (
                          <span key={spec} className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-bold rounded-full uppercase tracking-tighter">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedId === therapist.id && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={handleConfirm}
                className="w-full py-4 gold-gradient text-white rounded-2xl font-bold shadow-xl hover:opacity-90 transition-opacity uppercase tracking-widest"
              >
                {t('ยืนยันการเลือก', 'Confirm Selection')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
