import { AppSettings } from '../types';

export interface SheetConfig {
  brand_logo_url: string;
  hero_video_url: string;
  hero_image_url: string;
  shop_description: string;
}

class GoogleSheetService {
  async fetchAppConfig(sheetId: string): Promise<Partial<AppSettings>> {
    if (!sheetId) return {};

    try {
      // Fetching from Google Sheets (Published as CSV is easiest to parse without API key)
      // Note: The sheet must be "Published to the web" as CSV
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=APP_CONFIG`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Sheet fetch failed');
      
      const csvText = await response.text();
      
      // Simple CSV parser for Key-Value pairs
      const rows = csvText.split('\n').map(row => {
        // Handle basic CSV splitting (doesn't handle commas inside quotes perfectly but works for simple URLs)
        return row.split(',').map(cell => cell.replace(/"/g, '').trim());
      });
      
      const config: Partial<AppSettings> = {};
      
      rows.forEach(row => {
        const key = row[0];
        const value = row[1];
        
        if (key === 'brand_logo_url') config.brandLogoUrl = value;
        if (key === 'hero_video_url') config.heroVideoUrl = value;
        if (key === 'hero_image_url') config.heroImageUrl = value;
        if (key === 'shop_description') config.shopDescription = value;
      });

      // If we got valid data, return it
      if (config.brandLogoUrl || config.heroVideoUrl || config.heroImageUrl) {
        return config;
      }
      
      throw new Error('No valid config found in sheet');
    } catch (error) {
      console.warn('Google Sheet fetch failed or returned empty, using fallback branding:', error);
      
      // Fallback to the provided Firebase URLs and assets
      return {
        brandLogoUrl: 'https://firebasestorage.googleapis.com/v0/b/thai-massage-master-temp-2026.firebasestorage.app/o/v4-master-assets%20(Root)%2Fbranding%2Ffavicon.png%2Ffavicon.png?alt=media&token=8e8b5a',
        heroVideoUrl: 'https://firebasestorage.googleapis.com/v0/b/thai-massage-master-temp-2026.firebasestorage.app/o/v4-master-assets%20(Root)%2Fbranding%2Ffavicon.png%2F%E0%B8%A7%E0%B8%B4%E0%B8%94%E0%B8%B5%E0%B9%82%E0%B8%AD%E0%B8%9E%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%A1%E0%B9%83%E0%B8%8A%E0%B9%89_%E0%B8%AD%E0%B8%B1%E0%B8%9B%E0%B9%80%E0%B8%94%E0%B8%95_Google_Sheets.mp4?alt=media&token=5802edcb-edb1-40b5-a714-e76be25ad227',
        heroImageUrl: 'https://images.unsplash.com/photo-1544161515-4ae6ce6db874?q=80&w=2070&auto=format&fit=crop',
        shopDescription: 'Premium Thai Massage & Wellness in Altona. Experience the art of healing with our expert therapists.'
      };
    }
  }
}

export const googleSheetService = new GoogleSheetService();
