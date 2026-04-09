import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'TH' | 'EN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (th: string, en?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('EN');

  const t = (th: string, en?: string) => {
    if (language === 'TH') return th;
    return en || th;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
