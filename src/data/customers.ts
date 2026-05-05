import { Customer } from '../types';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Somchai Rakdee',
    phone: '0412345678',
    email: 'somchai@gmail.com',
    birthday: '1990-05-10', // Soon
    memberTier: 'VIP',
    totalVisits: 45,
    totalSpent: 4500,
    lastVisitDate: '2026-04-30T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Sarah Wilson',
    phone: '0422334455',
    email: 'sarah.w@hotmail.com',
    birthday: '1985-12-15',
    memberTier: 'Gold',
    totalVisits: 20,
    totalSpent: 2200,
    lastVisitDate: '2026-01-10T14:00:00Z', // Inactive (> 60 days)
  },
  {
    id: 'c3',
    name: 'David Miller',
    phone: '0433221100',
    email: 'david.m@yahoo.com',
    birthday: '1992-05-06', // Very Soon
    memberTier: 'Silver',
    totalVisits: 12,
    totalSpent: 1100,
    lastVisitDate: '2026-03-01T11:00:00Z', // Inactive (> 60 days)
  },
  {
    id: 'c4',
    name: 'Emma Stone',
    phone: '0455667788',
    memberTier: 'General',
    totalVisits: 1,
    totalSpent: 125,
    lastVisitDate: '2026-05-01T15:00:00Z', // New
  },
  {
    id: 'c5',
    name: 'Liam Neeson',
    phone: '0499887766',
    memberTier: 'VIP',
    totalVisits: 50,
    totalSpent: 7500,
    lastVisitDate: '2026-05-04T09:00:00Z',
  },
  {
    id: 'c6',
    name: 'John Doe',
    phone: '0400000001',
    memberTier: 'General',
    totalVisits: 2,
    totalSpent: 190,
    lastVisitDate: '2025-12-25T13:00:00Z', // Inactive
  }
];
