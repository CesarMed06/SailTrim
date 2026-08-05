import { useTranslation } from 'react-i18next'
import { switchLanguage, getCurrentLanguage } from '../i18n'

function SpainFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" className="rounded-sm shadow-sm" aria-hidden="true">
      <rect width="20" height="4.7" fill="#C60B1E" />
      <rect y="4.7" width="20" height="4.7" fill="#FFC400" />
      <rect y="9.3" width="20" height="4.7" fill="#C60B1E" />
    </svg>
  )
}

function UKFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" className="rounded-sm shadow-sm" aria-hidden="true">
      <rect width="20" height="14" fill="#012169" />
      <polygon points="0,0 8,7 0,14" fill="white" />
      <polygon points="20,0 12,7 20,14" fill="white" />
      <polygon points="0,0 20,7 20,0" fill="white" opacity="0" />
      <line x1="0" y1="0" x2="20" y2="14" stroke="white" strokeWidth="2.2" />
      <line x1="20" y1="0" x2="0" y2="14" stroke="white" strokeWidth="2.2" />
      <line x1="0" y1="7" x2="20" y2="7" stroke="#C8102E" strokeWidth="1.5" />
      <line x1="10" y1="0" x2="10" y2="14" stroke="#C8102E" strokeWidth="1.5" />
    </svg>
  )
}

function LanguageSwitcher() {
  const { t } = useTranslation()
  const current = getCurrentLanguage()

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-1 bg-ocean-950/80 backdrop-blur-sm border border-ocean-800/30 rounded-full p-0.5 shadow-lg">
      <button
        onClick={() => switchLanguage('es')}
        aria-label="Español"
        title={t('langSwitcher.label')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
          current === 'es'
            ? 'bg-wind-500/20 text-wind-300 shadow-sm'
            : 'text-sail-600 hover:text-sail-400'
        }`}
      >
        <SpainFlag />
        ES
      </button>
      <button
        onClick={() => switchLanguage('en')}
        aria-label="English"
        title={t('langSwitcher.label')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
          current === 'en'
            ? 'bg-wind-500/20 text-wind-300 shadow-sm'
            : 'text-sail-600 hover:text-sail-400'
        }`}
      >
        <UKFlag />
        EN
      </button>
    </div>
  )
}

export default LanguageSwitcher
