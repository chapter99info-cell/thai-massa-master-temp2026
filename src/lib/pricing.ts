import { Service } from '../types';

/**
 * Selects the correct price based on Sydney time rules:
 * - Weekend (Sat/Sun): Weekend Price
 * - Early Bird (Mon-Fri, before 12 PM): Early Bird Price
 * - Standard (Mon-Fri, after 12 PM): Standard Price
 */
export function getCurrentPrice(item: Service): { price: number; label: string } {
  // Get current time in Sydney
  const now = new Date();
  const sydneyTime = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    hour: 'numeric',
    hour12: false,
    weekday: 'long'
  }).formatToParts(now);

  const hour = parseInt(sydneyTime.find(p => p.type === 'hour')?.value || '0');
  const day = sydneyTime.find(p => p.type === 'weekday')?.value || '';

  const isWeekend = day === 'Saturday' || day === 'Sunday';
  const isEarlyBird = !isWeekend && hour < 12;

  if (isWeekend) {
    return { price: item.weekendPrice, label: 'Weekend Rate' };
  }
  
  if (isEarlyBird) {
    return { price: item.earlyBirdPrice, label: 'Early Bird' };
  }

  return { price: item.standardPrice, label: 'Standard Rate' };
}
