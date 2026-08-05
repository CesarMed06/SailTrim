import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './es.json'
import en from './en.json'

const LANG_KEY = 'sailtrim-lang'

function getInitialLang(): string {
  try {
    const stored = localStorage.getItem(LANG_KEY)
    if (stored === 'en' || stored === 'es') return stored
  } catch {
    // localStorage not available
  }

  if (typeof navigator !== 'undefined') {
    const nav = navigator.language || (navigator as { userLanguage?: string }).userLanguage || ''
    if (nav.toLowerCase().startsWith('en')) return 'en'
    if (nav.toLowerCase().startsWith('es')) return 'es'
  }

  return 'es'
}

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  lng: getInitialLang(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
  returnObjects: true,
})

export function switchLanguage(lang: 'es' | 'en') {
  i18n.changeLanguage(lang)
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    // localStorage not available
  }
}

export function getCurrentLanguage(): 'es' | 'en' {
  return (i18n.language as 'es' | 'en') || 'es'
}

export default i18n
