import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Mail, Gift, Star, Copy, CheckCircle2, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn, formatCurrency } from '../lib/utils';
import {
  canRedeem,
  pointsToDollarValue,
  pointsUntilNextRedemption,
  POINTS_PER_REDEMPTION_UNIT,
} from '../lib/loyalty';

const TIER_COLORS: Record<string, string> = {
  General: 'bg-slate-100 text-slate-600 border-slate-200',
  Silver: 'bg-zinc-200 text-zinc-700 border-zinc-300',
  Gold: 'bg-amber-100 text-amber-700 border-amber-300',
  VIP: 'bg-gold/10 text-gold border-gold/30',
};

export default function Profile() {
  const { t } = useLanguage();
  const {
    profile,
    loading,
    loginWithGoogle,
    sendEmailLoginLink,
    completeEmailLinkSignInIfPresent,
    logout,
    redeemPoints,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // If the user arrived via the email sign-in link, finish the sign-in.
  useEffect(() => {
    completeEmailLinkSignInIfPresent().catch((err) => {
      console.error(err);
      setError(t('ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้วค่ะ', 'This sign-in link is invalid or has expired.'));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setError(t('เข้าสู่ระบบด้วย Google ไม่สำเร็จค่ะ ลองใหม่อีกครั้งนะคะ', 'Google sign-in failed. Please try again.'));
    }
  };

  const handleSendLink = async () => {
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('กรุณากรอกอีเมลให้ถูกต้องค่ะ', 'Please enter a valid email address.'));
      return;
    }
    try {
      await sendEmailLoginLink(email);
      setLinkSent(true);
    } catch (err) {
      console.error(err);
      setError(t('ส่งลิงก์ไม่สำเร็จค่ะ ลองใหม่อีกครั้งนะคะ', 'Could not send the sign-in link. Please try again.'));
    }
  };

  const handleRedeem = async () => {
    setRedeeming(true);
    try {
      const code = await redeemPoints();
      setRedeemedCode(code);
    } finally {
      setRedeeming(false);
    }
  };

  const handleCopy = () => {
    if (!redeemedCode) return;
    navigator.clipboard.writeText(redeemedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-ocean/40 font-black uppercase tracking-widest text-sm">
          {t('กำลังโหลด...', 'Loading...')}
        </div>
      </div>
    );
  }

  // ---------- Logged out: sign-in screen ----------
  if (!profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto text-gold">
              <UserIcon size={36} />
            </div>
            <h1 className="text-3xl font-serif font-black text-navy italic">
              {t('สมัครสมาชิก / เข้าสู่ระบบ', 'Member Sign In')}
            </h1>
            <p className="text-sm text-slate-500">
              {t(
                'สมัครฟรี รับแต้มสะสมทุกครั้งที่ใช้บริการ แลกเป็นส่วนลดได้เลย',
                'Free to join — earn points every visit and redeem them for discounts.'
              )}
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-5 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-700 flex items-center justify-center gap-3 hover:border-gold/50 hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <LogIn size={20} />
            {t('เข้าสู่ระบบด้วย Google', 'Continue with Google')}
          </button>

          <div className="flex items-center gap-4 text-slate-300 text-xs font-black uppercase tracking-widest">
            <div className="flex-1 h-px bg-slate-200" />
            {t('หรือ', 'or')}
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {linkSent ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-2">
              <CheckCircle2 className="mx-auto text-emerald-500" size={28} />
              <p className="text-sm text-emerald-700 font-bold">
                {t('ส่งลิงก์เข้าสู่ระบบไปที่อีเมลแล้วค่ะ', 'A sign-in link has been sent to your email.')}
              </p>
              <p className="text-xs text-emerald-600">{email}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-gold/50 transition-colors">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700"
                />
              </div>
              <button
                onClick={handleSendLink}
                className="w-full py-4 bg-navy text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-navy/90 transition-all active:scale-[0.98]"
              >
                {t('ส่งลิงก์เข้าสู่ระบบ', 'Send Sign-In Link')}
              </button>
            </div>
          )}

          {error && (
            <p className="text-center text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl py-3 px-4">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ---------- Logged in: member dashboard ----------
  const points = profile.points || 0;
  const tierClass = TIER_COLORS[profile.memberTier] || TIER_COLORS.General;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-black text-navy italic">{profile.name}</h1>
          <p className="text-sm text-slate-400">{profile.email}</p>
        </div>
        <button
          onClick={logout}
          className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
        >
          {t('ออกจากระบบ', 'Sign Out')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={cn('rounded-2xl border-2 p-5 space-y-1', tierClass)}>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
            {t('ระดับสมาชิก', 'Membership Tier')}
          </p>
          <p className="text-2xl font-serif font-black italic">{profile.memberTier}</p>
        </div>
        <div className="rounded-2xl border-2 border-gold/30 bg-gold/5 p-5 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-gold/70">
            {t('แต้มสะสม', 'Points Balance')}
          </p>
          <p className="text-2xl font-serif font-black italic text-gold">{points.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-navy">
          <Star size={18} className="text-gold" />
          <h2 className="font-bold">{t('สิทธิประโยชน์แต้มสะสม', 'Redeem Your Points')}</h2>
        </div>
        <p className="text-sm text-slate-500">
          {t(
            `ทุก ${POINTS_PER_REDEMPTION_UNIT} แต้ม แลกเป็นส่วนลด ${formatCurrency(pointsToDollarValue(POINTS_PER_REDEMPTION_UNIT))} ได้ที่หน้าเคาน์เตอร์`,
            `Every ${POINTS_PER_REDEMPTION_UNIT} points = ${formatCurrency(pointsToDollarValue(POINTS_PER_REDEMPTION_UNIT))} off at the counter.`
          )}
        </p>

        {redeemedCode ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600">
              {t('แสดงโค้ดนี้ที่เคาน์เตอร์', 'Show this code at the counter')}
            </p>
            <p className="text-3xl font-serif font-black text-emerald-700 tracking-[0.2em]">{redeemedCode}</p>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-800"
            >
              <Copy size={14} />
              {copied ? t('คัดลอกแล้ว', 'Copied!') : t('คัดลอกโค้ด', 'Copy code')}
            </button>
          </div>
        ) : canRedeem(points) ? (
          <button
            onClick={handleRedeem}
            disabled={redeeming}
            className="w-full py-4 gold-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              <Gift size={16} />
              {redeeming
                ? t('กำลังแลก...', 'Redeeming...')
                : t(
                    `แลก ${POINTS_PER_REDEMPTION_UNIT} แต้ม เป็นส่วนลด ${formatCurrency(pointsToDollarValue(POINTS_PER_REDEMPTION_UNIT))}`,
                    `Redeem ${POINTS_PER_REDEMPTION_UNIT} points for ${formatCurrency(pointsToDollarValue(POINTS_PER_REDEMPTION_UNIT))} off`
                  )}
            </span>
          </button>
        ) : (
          <p className="text-center text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl py-3">
            {t(
              `สะสมอีก ${pointsUntilNextRedemption(points)} แต้ม เพื่อแลกส่วนลดครั้งถัดไป`,
              `Earn ${pointsUntilNextRedemption(points)} more points to unlock your next redemption.`
            )}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-slate-50 rounded-2xl p-4">
          <p className="text-2xl font-black text-navy">{profile.totalVisits || 0}</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            {t('จำนวนครั้งที่ใช้บริการ', 'Total Visits')}
          </p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4">
          <p className="text-2xl font-black text-navy">{formatCurrency(profile.totalSpent || 0)}</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            {t('ยอดใช้จ่ายสะสม', 'Lifetime Spend')}
          </p>
        </div>
      </div>
    </div>
  );
}
