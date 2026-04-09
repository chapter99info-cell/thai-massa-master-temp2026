export interface PartnerAd {
  id: string;
  englishName: string;
  englishDescription: string;
  imageUrl: string;
  mapUrl: string;
  phone: string;
  category: 'Restaurant' | 'Service' | 'Shopping';
}

export const partnerAds: PartnerAd[] = [
  {
    id: 'p1',
    englishName: 'Thai Garlic Restaurant',
    englishDescription: 'Authentic Thai cuisine just 2 minutes away. Show this screen for a 10% discount on your meal!',
    imageUrl: 'https://picsum.photos/seed/thai-food/800/600',
    mapUrl: 'https://maps.google.com',
    phone: '02 1234 5678',
    category: 'Restaurant'
  },
  {
    id: 'p2',
    englishName: 'Chapter99 Coffee & Bakery',
    englishDescription: 'The best artisan coffee in Sydney. Perfect for a post-massage treat.',
    imageUrl: 'https://picsum.photos/seed/coffee/800/600',
    mapUrl: 'https://maps.google.com',
    phone: '02 8765 4321',
    category: 'Restaurant'
  },
  {
    id: 'p3',
    englishName: 'Sydney Souvenirs & Gifts',
    englishDescription: 'Find the perfect gift for your loved ones. Wide range of local products.',
    imageUrl: 'https://picsum.photos/seed/gift/800/600',
    mapUrl: 'https://maps.google.com',
    phone: '02 1111 2222',
    category: 'Shopping'
  }
];
