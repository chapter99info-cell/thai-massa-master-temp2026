import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Bed, Booking } from '../types';
import { INITIAL_BEDS } from '../config';

const BEDS_COLLECTION = 'beds';
const BOOKINGS_COLLECTION = 'bookings';

interface BookingContextType {
  beds: Bed[];
  bookings: Booking[];
  loading: boolean;
  /** Creates a new booking (used by the customer checkout flow and staff walk-ins). Returns the new doc id. */
  addBooking: (data: Omit<Booking, 'id'>) => Promise<string>;
  updateBooking: (id: string, changes: Partial<Booking>) => Promise<void>;
  updateBedStatus: (bedId: string, status: Bed['status'], paymentStatus?: Bed['paymentStatus']) => Promise<void>;
  addBed: (type: Bed['type']) => Promise<void>;
  /** Removes a specific bed, or the last bed in the list if no id is given (matches existing "-" button behavior). */
  removeBed: (bedId?: string) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  // First-run seeding: a brand-new shop's Firestore has no beds yet, so
  // populate it once from the default floor plan in config.ts. Safe to
  // leave in production - it only acts when the collection is empty.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, BEDS_COLLECTION));
        if (snap.empty) {
          const batch = writeBatch(db);
          INITIAL_BEDS.forEach((bed) => {
            batch.set(doc(db, BEDS_COLLECTION, bed.id), bed);
          });
          await batch.commit();
        }
      } catch (err) {
        console.error('Failed to seed default beds', err);
      } finally {
        if (!cancelled) setSeeded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!seeded) return;

    const unsubBeds = onSnapshot(
      collection(db, BEDS_COLLECTION),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Bed[];
        list.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
        setBeds(list);
        setLoading(false);
      },
      (err) => {
        console.error('beds subscription error', err);
        setLoading(false);
      }
    );

    // Most recent 200 bookings is plenty for a live shift view; older
    // history belongs in reports, not this realtime feed.
    const bookingsQuery = query(collection(db, BOOKINGS_COLLECTION), orderBy('timestamp', 'desc'), limit(200));
    const unsubBookings = onSnapshot(
      bookingsQuery,
      (snap) => {
        setBookings(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Booking[]);
      },
      (err) => console.error('bookings subscription error', err)
    );

    return () => {
      unsubBeds();
      unsubBookings();
    };
  }, [seeded]);

  const addBooking = useCallback(async (data: Omit<Booking, 'id'>): Promise<string> => {
    const ref = await addDoc(collection(db, BOOKINGS_COLLECTION), {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    });
    return ref.id;
  }, []);

  const updateBooking = useCallback(async (id: string, changes: Partial<Booking>) => {
    await updateDoc(doc(db, BOOKINGS_COLLECTION, id), changes as Record<string, unknown>);
  }, []);

  const updateBedStatus = useCallback(
    async (bedId: string, status: Bed['status'], paymentStatus?: Bed['paymentStatus']) => {
      const changes: Partial<Bed> = { status };
      if (paymentStatus) changes.paymentStatus = paymentStatus;
      await updateDoc(doc(db, BEDS_COLLECTION, bedId), changes as Record<string, unknown>);
    },
    []
  );

  const addBed = useCallback(
    async (type: Bed['type']) => {
      const newId = `b${Date.now()}`;
      const newBed: Bed = { id: newId, number: String(beds.length + 1), type, status: 'Vacant' };
      await setDoc(doc(db, BEDS_COLLECTION, newId), newBed);
    },
    [beds]
  );

  const removeBed = useCallback(
    async (bedId?: string) => {
      const targetId = bedId || beds[beds.length - 1]?.id;
      if (!targetId) return;
      await deleteDoc(doc(db, BEDS_COLLECTION, targetId));
    },
    [beds]
  );

  return (
    <BookingContext.Provider
      value={{ beds, bookings, loading, addBooking, updateBooking, updateBedStatus, addBed, removeBed }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}
