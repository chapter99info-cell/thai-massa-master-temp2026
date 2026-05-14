import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext<any>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);

  return <BookingContext.Provider value={{ bookings, beds, addBooking: () => {}, updateBedStatus: () => {}, addBed: () => {}, removeBed: () => {} }}>{children}</BookingContext.Provider>;
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}
