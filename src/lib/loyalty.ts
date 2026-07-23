import { Customer } from '../types';

/**
 * Loyalty program rules, shared by AuthContext, Profile page, and the
 * staff-facing CRM/dashboards. Kept in one place so the "1 point per $1,
 * 100 points = $10" logic never drifts between where points are earned
 * (checkout) and where they're spent (redemption).
 */

export const POINTS_PER_DOLLAR = 1;
export const POINTS_PER_REDEMPTION_UNIT = 100; // 100 points ...
export const REDEMPTION_UNIT_VALUE = 10; // ...= $10 off

export const TIER_THRESHOLDS: Record<Customer['memberTier'], number> = {
  General: 0,
  Silver: 500,
  Gold: 2000,
  VIP: 5000,
};

/** Points earned for a completed booking/sale of `amount` dollars. */
export function pointsForSpend(amount: number): number {
  return Math.max(0, Math.floor(amount * POINTS_PER_DOLLAR));
}

/** Membership tier implied by lifetime spend (auto-upgrade, no manual admin step). */
export function computeTier(totalSpent: number): Customer['memberTier'] {
  if (totalSpent >= TIER_THRESHOLDS.VIP) return 'VIP';
  if (totalSpent >= TIER_THRESHOLDS.Gold) return 'Gold';
  if (totalSpent >= TIER_THRESHOLDS.Silver) return 'Silver';
  return 'General';
}

/** Dollar value of a given points balance, at the redemption rate above. */
export function pointsToDollarValue(points: number): number {
  return Math.floor(points / POINTS_PER_REDEMPTION_UNIT) * REDEMPTION_UNIT_VALUE;
}

/** How many points are needed before the next redemption is available. */
export function pointsUntilNextRedemption(points: number): number {
  const remainder = points % POINTS_PER_REDEMPTION_UNIT;
  return remainder === 0 ? 0 : POINTS_PER_REDEMPTION_UNIT - remainder;
}

export function canRedeem(points: number): boolean {
  return points >= POINTS_PER_REDEMPTION_UNIT;
}

/** Generates a short human-readable redemption code staff can key into the POS. */
export function generateRedemptionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing 0/O/1/I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `R-${code}`;
}
