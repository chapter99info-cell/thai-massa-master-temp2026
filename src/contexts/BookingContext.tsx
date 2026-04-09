import React, { createContext, useContext, useState, useEffect } from 'react';
import { QueueItem, Bed } from '../types';

interface BookingContextType {
  bookings: any[];
  addBooking: (booking: any) => void;
  updateBedStatus: (bedId: string, status: 'Vacant' | 'Occupied' | 'Reserved' | 'In Use') => void;
  beds: Bed[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<any[]>(() => {
    const saved = localStorage.getItem('v4_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [beds, setBeds] = useState<Bed[]>(() => {
    const saved = localStorage.getItem('v4_beds');
    if (saved) return JSON.parse(saved);
    
    // Default beds if not in localStorage
    return [
      { id: 'b1', number: '1', type: 'Massage', status: 'Vacant' },
      { id: 'b2', number: '2', type: 'Massage', status: 'Vacant' },
      { id: 'b3', number: '3', type: 'Massage', status: 'Vacant' },
      { id: 'b4', number: '4', type: 'Massage', status: 'Vacant' },
      { id: 'b5', number: '5', type: 'Massage', status: 'Vacant' },
      { id: 'b6', number: '6', type: 'Facial', status: 'Vacant' },
      { id: 'b7', number: '7', type: 'Facial', status: 'Vacant' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('v4_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('v4_beds', JSON.stringify(beds));
  }, [beds]);

  const addBooking = (booking: any) => {
    setBookings(prev => [...prev, { ...booking, id: `book-${Date.now()}` }]);
    
    // If a bed is assigned, mark it as Reserved
    if (booking.bedId) {
      updateBedStatus(booking.bedId, 'Reserved');
    }
  };

  const updateBedStatus = (bedId: string, status: 'Vacant' | 'Occupied' | 'Reserved' | 'In Use') => {
    setBeds(prev => prev.map(b => b.id === bedId ? { ...b, status } : b));
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking, updateBedStatus, beds }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBookings must be used within a BookingProvider');
  return context;
}
