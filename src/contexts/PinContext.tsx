import React, { createContext, useContext, useState } from 'react';

interface PinContextType {
  accessLevel: 'staff' | 'manager' | 'owner' | 'admin';
  isAuthenticated: boolean;
}

const PinContext = createContext<PinContextType>({
  accessLevel: 'admin', // ค่าเริ่มต้นให้เป็น admin ไปก่อนตอนพัฒนา
  isAuthenticated: true,
});

export function PinProvider({ children }: { children: React.ReactNode }) {
  // จำลอง State ไว้ก่อน อนาคตค่อยมาต่อระบบ PIN จริง
  const [auth] = useState<PinContextType>({
    accessLevel: 'admin',
    isAuthenticated: true,
  });

  return <PinContext.Provider value={auth}>{children}</PinContext.Provider>;
}

export function usePin() {
  return useContext(PinContext);
}