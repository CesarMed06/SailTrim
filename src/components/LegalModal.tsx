import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusTrap } from '../hooks/useFocusTrap'

export type LegalDoc = 'privacy' | 'terms'

interface LegalModalProps {
  doc: LegalDoc | null
  onClose: () => void
}

interface LegalSection {
  title: string
  text: string
}

const GOOGLE_PRIVACY_URL = 'https://policies.google.com/privacy'
const REPO_URL = 'https://github.com/CesarMed06/SailTrim'

function LegalModal({ doc, onClose }: LegalModalProps) {
  const { t } = useTranslation()
  const dialogRef = useFocusTrap<HTMLDivElement>(doc !== null)

  useEffect(() => {
    if (!doc) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [doc, onClose])

  if (!doc) return null

  const sections = t(`legal.${doc}.sections`, { returnObjects: true }) as LegalSection[]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ocean-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        className="relative bg-ocean-900 border border-ocean-700/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl shadow-black/50 animate-fade-in"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="text-wind-400 text-xs font-semibold tracking-widest uppercase">
              SailTrim AI
            </span>
            <h3 id="legal-modal-title" className="font-display text-2xl font-bold text-white mt-1">
              {t(`legal.${doc}.title`)}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={t('legal.close')}
            className="text-sail-600 hover:text-sail-300 transition-colors p-1 shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-sail-500 text-sm leading-relaxed mb-5">{t(`legal.${doc}.intro`)}</p>

        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sail-200 text-sm font-semibold mb-1">{section.title}</h4>
              <p className="text-sail-500 text-sm leading-relaxed">{section.text}</p>
            </div>
          ))}
        </div>

        {doc === 'privacy' ? (
          <a
            href={GOOGLE_PRIVACY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-wind-400 hover:text-wind-300 transition-colors"
          >
            {t('legal.privacy.googleLink')} ↗
          </a>
        ) : (
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-sm text-wind-400 hover:text-wind-300 transition-colors"
          >
            {t('legal.terms.licenseLink')} ↗
          </a>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full px-5 py-2.5 bg-gradient-to-r from-wind-500 to-cyan-500 hover:from-wind-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-wind-500/20 active:scale-[0.98]"
        >
          {t('legal.close')}
        </button>
      </div>
    </div>
  )
}

export default LegalModal
