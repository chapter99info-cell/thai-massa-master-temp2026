export const siteConfig = {
  // Store Identity
  storeName: 'Premium Thai Wellness',
  abn: '12 345 678 910',
  providerNumber: 'PR1234567A',
  address: 'Level 1, 123 Pitt St, Sydney NSW 2000',
  phone: '02 1234 5678',
  email: 'info@premiumthaiwellness.com.au',

  // Master Theme (Luxury Navy & Gold)
  theme: {
    primary: '#B8962E', // Gold
    secondary: '#0A192F', // Navy Dark
    accent: '#D4AF37', // Gold Light
    background: '#FBF9F6', // Off-white
    text: '#0A0E17', // Charcoal
    danger: '#BE123C' // Rose (Deep Red)
  },

  // Remote Database (Google Sheets)
  sheetIds: {
    master: 'YOUR_GOOGLE_SHEET_ID_HERE',
    appConfig: 'CONFIG_SHEET_TAB_NAME'
  },

  // Feature Flags
  features: {
    autoLogoutMinutes: 30,
    showGstInReceipt: true,
    gpFeePercent: 1.5,
    enableWakeLock: true
  }
};

export type SiteConfig = typeof siteConfig;
