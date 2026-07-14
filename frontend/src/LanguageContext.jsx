import { createContext, useContext, useState, useEffect } from 'react';
import en from './i18n/en.js';
import rw from './i18n/rw.js';

const translations = { en, rw };
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('cshub_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('cshub_lang', lang);
  }, [lang]);

  const t = (path) => {
    const keys = path.split('.');
    let val = translations[lang];
    for (const k of keys) {
      if (val && typeof val === 'object') val = val[k];
      else return path;
    }
    return val ?? path;
  };

  const toggleLang = () => setLang((p) => (p === 'en' ? 'rw' : 'en'));

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
