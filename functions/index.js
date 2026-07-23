const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

// Keep these numbers in sync with src/lib/loyalty.ts on the client -
// they're duplicated here (rather than shared) because this function
// runs in a separate Node project from the web app.
const POINTS_PER_DOLLAR = 1;
const TIER_THRESHOLDS = { VIP: 5000, Gold: 2000, Silver: 500, General: 0 };

function computeTier(totalSpent) {
  if (totalSpent >= TIER_THRESHOLDS.VIP) return 'VIP';
  if (totalSpent >= TIER_THRESHOLDS.Gold) return 'Gold';
  if (totalSpent >= TIER_THRESHOLDS.Silver) return 'Silver';
  return 'General';
}

/**
 * Called by the staff POS screen (ManagerDashboard.processPayment) right
 * after a payment is confirmed. The staff terminal is only gated by the
 * local PIN screen - it has no Firebase Auth session of its own, so it
 * can't be trusted to write points directly onto a customer's account
 * under firestore.rules (which only allow a user to write their own doc).
 *
 * This function runs with Admin SDK privileges (bypasses firestore.rules
 * entirely) and is the one place allowed to credit another person's
 * loyalty account, based on a booking that was actually just paid for.
 *
 * Matches the customer by phone first, then email, since phone is what's
 * most reliably collected at checkout in this app.
 */
exports.awardPointsForPayment = onCall(async (request) => {
  const { phone, email, amount } = request.data || {};

  if (typeof amount !== 'number' || amount <= 0) {
    throw new HttpsError('invalid-argument', 'amount must be a positive number');
  }
  if (!phone && !email) {
    return { awarded: false, reason: 'no-contact-info' };
  }

  const usersRef = db.collection('users');
  let snap = null;

  if (phone) {
    snap = await usersRef.where('phone', '==', phone).limit(1).get();
  }
  if ((!snap || snap.empty) && email) {
    snap = await usersRef.where('email', '==', email).limit(1).get();
  }
  if (!snap || snap.empty) {
    return { awarded: false, reason: 'no-matching-loyalty-account' };
  }

  const userDoc = snap.docs[0];
  const current = userDoc.data();
  const pointsEarned = Math.floor(amount * POINTS_PER_DOLLAR);
  const newTotalSpent = (current.totalSpent || 0) + amount;
  const newTier = computeTier(newTotalSpent);

  await userDoc.ref.update({
    points: FieldValue.increment(pointsEarned),
    totalSpent: newTotalSpent,
    totalVisits: FieldValue.increment(1),
    memberTier: newTier,
    lastVisitDate: new Date().toISOString(),
  });

  return { awarded: true, pointsEarned, newTier };
});
