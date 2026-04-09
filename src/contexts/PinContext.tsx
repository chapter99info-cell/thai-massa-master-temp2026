import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { getAppSettings } from '../config';

type AccessLevel = 'staff' | 'manager' | 'owner' | 'admin' | null;

interface PinContextType {
  accessLevel: AccessLevel;
  login: (pin: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  refreshPins: () => void;
}

const PinContext = createContext<PinContextType | undefined>(undefined);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function PinProvider({ children }: { children: React.ReactNode }) {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [pins, setPins] = useState(getAppSettings());

  const refreshPins = useCallback(() => {
    setPins(getAppSettings());
  }, []);

  const login = (pin: string): boolean => {
    if (pin === pins.staffPin) {
      setAccessLevel('staff');
      setLastActivity(Date.now());
      return true;
    }
    if (pin === pins.managerPin) {
      setAccessLevel('manager');
      setLastActivity(Date.now());
      return true;
    }
    if (pin === pins.ownerPin) {
      setAccessLevel('owner');
      setLastActivity(Date.now());
      return true;
    }
    if (pin === pins.masterPin) {
      setAccessLevel('admin');
      setLastActivity(Date.now());
      return true;
    }
    return false;
  };

  const logout = useCallback(() => {
    setAccessLevel(null);
  }, []);

  // Idle timeout logic
  useEffect(() => {
    if (!accessLevel) return;

    const handleActivity = () => setLastActivity(Date.now());
    
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT) {
        logout();
      }
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearInterval(interval);
    };
  }, [accessLevel, lastActivity, logout]);

  return (
    <PinContext.Provider value={{ 
      accessLevel, 
      login, 
      logout, 
      isAuthenticated: !!accessLevel,
      refreshPins
    }}>
      {children}
    </PinContext.Provider>
  );
}

export function usePin() {
  const context = useContext(PinContext);
  if (!context) throw new Error('usePin must be used within a PinProvider');
  return context;
}
