import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getAppSettings } from '../config';

export type AccessLevel = 'staff' | 'manager' | 'owner' | 'admin' | null;

interface PinContextType {
  accessLevel: AccessLevel;
  isAuthenticated: boolean;
  /** Tries to log in with a 4-digit PIN. Returns the resolved access level on success, or null if the PIN doesn't match anything. */
  login: (pin: string) => AccessLevel;
  logout: () => void;
  /** Call after PINs are changed in the admin/owner settings so any open session stays consistent. */
  refreshPins: () => void;
  showSessionWarning: boolean;
  resetTimer: () => void;
}

const SESSION_KEY = 'chapter99_pin_session';
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // auto-logout after 15 minutes of inactivity
const WARNING_BEFORE_MS = 60 * 1000; // show the "you're about to be logged out" modal 1 min before

const PinContext = createContext<PinContextType>({
  accessLevel: null,
  isAuthenticated: false,
  login: () => null,
  logout: () => {},
  refreshPins: () => {},
  showSessionWarning: false,
  resetTimer: () => {},
});

function readSession(): AccessLevel {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accessLevel: AccessLevel };
    return parsed.accessLevel ?? null;
  } catch {
    return null;
  }
}

export function PinProvider({ children }: { children: React.ReactNode }) {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(() => readSession());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!readSession());
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    warnTimerRef.current = null;
    logoutTimerRef.current = null;
  }, []);

  const logout = useCallback(() => {
    clearTimers();
    setAccessLevel(null);
    setIsAuthenticated(false);
    setShowSessionWarning(false);
    sessionStorage.removeItem(SESSION_KEY);
  }, [clearTimers]);

  const startTimers = useCallback(() => {
    clearTimers();
    setShowSessionWarning(false);
    warnTimerRef.current = setTimeout(() => {
      setShowSessionWarning(true);
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);
    logoutTimerRef.current = setTimeout(() => {
      logout();
    }, IDLE_TIMEOUT_MS);
  }, [clearTimers, logout]);

  const resetTimer = useCallback(() => {
    setShowSessionWarning(false);
    startTimers();
  }, [startTimers]);

  const login = useCallback((pin: string): AccessLevel => {
    const settings = getAppSettings();
    let level: AccessLevel = null;

    if (pin.length === 4) {
      if (pin === settings.masterPin) level = 'admin';
      else if (pin === settings.ownerPin) level = 'owner';
      else if (pin === settings.managerPin) level = 'manager';
      else if (pin === settings.staffPin) level = 'staff';
    }

    if (!level) return null;

    setAccessLevel(level);
    setIsAuthenticated(true);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ accessLevel: level, ts: Date.now() }));
    startTimers();
    return level;
  }, [startTimers]);

  // No-op placeholder kept for API compatibility: PINs are re-read from
  // getAppSettings() on every login() call, so there's nothing to refresh
  // besides giving callers (OwnerDashboard/MasterAdminDashboard) a stable
  // function to call right after saving new PINs.
  const refreshPins = useCallback(() => {}, []);

  // Keep the idle-logout timer alive while authenticated, and reset it on activity.
  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      return;
    }
    startTimers();

    const handleActivity = () => {
      // Don't silently reset once the warning is already showing - user must
      // explicitly click "Continue Session" (resetTimer) or "Logout Now".
      setShowSessionWarning((warning) => {
        if (!warning) startTimers();
        return warning;
      });
    };

    const events: (keyof WindowEventMap)[] = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, handleActivity));
    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <PinContext.Provider
      value={{ accessLevel, isAuthenticated, login, logout, refreshPins, showSessionWarning, resetTimer }}
    >
      {children}
    </PinContext.Provider>
  );
}

export function usePin() {
  return useContext(PinContext);
}
