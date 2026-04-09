import { Therapist } from '../types';

export const therapists: Therapist[] = [
  {
    id: 't1',
    name: 'Nok',
    imageUrl: 'https://picsum.photos/seed/therapist1/200/200',
    specialties: ['Traditional Thai', 'Deep Tissue'],
    gender: 'Female',
    providerNumber: 'PRV-12345-A',
    insuranceExpiry: '2026-12-31',
    dailyGuarantee: 120,
    commissionRate: 0.5,
    pin: '1111',
    isHicapsEnabled: true
  },
  {
    id: 't2',
    name: 'Mali',
    imageUrl: 'https://picsum.photos/seed/therapist2/200/200',
    specialties: ['Aromatherapy', 'FACIAL'],
    gender: 'Female',
    providerNumber: 'PRV-67890-B',
    insuranceExpiry: '2026-04-25',
    dailyGuarantee: 120,
    commissionRate: 0.5,
    pin: '2222',
    isHicapsEnabled: false
  },
  {
    id: 't3',
    name: 'Aree',
    imageUrl: 'https://picsum.photos/seed/therapist3/200/200',
    specialties: ['Traditional Thai', 'SPA_PACKAGES'],
    gender: 'Female',
    providerNumber: 'PRV-11223-C',
    insuranceExpiry: '2026-03-15',
    dailyGuarantee: 120,
    commissionRate: 0.5,
    pin: '3333',
    isHicapsEnabled: true
  },
  {
    id: 't4',
    name: 'Suda',
    imageUrl: 'https://picsum.photos/seed/therapist4/200/200',
    specialties: ['Deep Tissue', 'FACIAL'],
    gender: 'Female',
    providerNumber: 'PRV-44556-D',
    insuranceExpiry: '2027-01-20',
    dailyGuarantee: 120,
    commissionRate: 0.5,
    pin: '4444',
    isHicapsEnabled: true
  },
  {
    id: 't5',
    name: 'Keng',
    imageUrl: 'https://picsum.photos/seed/therapist5/200/200',
    specialties: ['Traditional Thai', 'Deep Tissue', 'Sports Massage'],
    gender: 'Male',
    providerNumber: 'PRV-99887-E',
    insuranceExpiry: '2026-11-10',
    dailyGuarantee: 130,
    commissionRate: 0.5,
    pin: '5555',
    isHicapsEnabled: true
  }
];
