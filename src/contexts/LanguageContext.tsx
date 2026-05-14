import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext<any>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('EN');
  const t = (th: string, en?: string) => language === 'TH' ? th : (en || th);

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
