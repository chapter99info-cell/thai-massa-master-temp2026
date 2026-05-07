import React, { createContext, useContext, useState, useEffect } from 'react';
import { QueueItem, Bed } from '../types';

interface BookingContextType {
  bookings: any[];
  addBooking: (booking: any) => void;
  updateBedStatus: (bedId: string, status: 'Vacant' | 'Occupied' | 'Reserved' | 'In Use') => void;
  addBed: (type: 'Foot' | 'Body' | 'VIP') => void;
  removeBed: () => void;
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
      { id: 'b1', number: '1', type: 'Foot', status: 'Vacant' },
      { id: 'b2', number: '2', type: 'Foot', status: 'Vacant' },
      { id: 'b3', number: '3', type: 'Body', status: 'Vacant' },
      { id: 'b4', number: '4', type: 'Body', status: 'Vacant' },
      { id: 'b5', number: '5', type: 'Body', status: 'Vacant' },
      { id: 'b6', number: '6', type: 'VIP', status: 'Vacant' },
      { id: 'b7', number: '7', type: 'VIP', status: 'Vacant' },
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

  const addBed = (type: 'Foot' | 'Body' | 'VIP' = 'Body') => {
    setBeds(prev => {
      const nextNumber = prev.length > 0 
        ? Math.max(...prev.map(b => parseInt(b.number))) + 1 
        : 1;
      const newBed: Bed = {
        id: `b${Date.now()}`,
        number: nextNumber.toString(),
        type,
        status: 'Vacant'
      };
      return [...prev, newBed];
    });
  };

  const removeBed = () => {
    setBeds(prev => {
      if (prev.length === 0) return prev;
      // Only remove if vacant
      const lastBed = prev[prev.length - 1];
      if (lastBed.status !== 'Vacant') {
        alert('Cannot remove an occupied bed!');
        return prev;
      }
      return prev.slice(0, -1);
    });
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking, updateBedStatus, addBed, removeBed, beds }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBookings must be used within a BookingProvider');
  return context;
}
