import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useFocusTrap } from '../hooks/useFocusTrap'

interface ApiKeyGuideProps {
  open: boolean
  onClose: () => void
}

const STEP_ICONS = ['🔗', '👤', '➕', '📋', '⌨️']

function ApiKeyGuide({ open, onClose }: ApiKeyGuideProps) {
  const dialogRef = useFocusTrap<HTMLDivElement>(open)
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const steps = [1, 2, 3, 4, 5].map((i) => ({
    icon: STEP_ICONS[i - 1],
    title: t(`apiGuide.steps.${i - 1}.title`),
    text: t(`apiGuide.steps.${i - 1}.text`),
  }))

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
        aria-label={t('apiGuide.dialogLabel')}
        className="relative bg-ocean-900 border border-ocean-700/40 rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50 animate-fade-in"
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="text-wind-400 text-xs font-semibold tracking-widest uppercase">
              {t('apiGuide.badge')}
            </span>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white mt-1">
              {t('apiGuide.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={t('apiGuide.close')}
            className="text-sail-600 hover:text-sail-300 transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-sail-500 text-sm mb-6">
          {t('apiGuide.subtitle')}
        </p>

        <ol className="space-y-4">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-4 bg-ocean-950/50 border border-ocean-800/30 rounded-2xl p-4">
              <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-wind-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-wind-500/20">
                {i + 1}
              </div>
              <div>
                <p className="font-semibold text-white text-sm flex items-center gap-2">
                  <span className="text-lg">{step.icon}</span>
                  {step.title}
                </p>
                <p className="text-sail-500 text-sm mt-1 leading-relaxed">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-wind-500 to-cyan-500 hover:from-wind-400 hover:to-cyan-400 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-wind-500/25 hover:shadow-wind-500/40 active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          {t('apiGuide.openStudio')}
        </a>

        <a
          href="https://www.youtube.com/watch?v=vkX6XTxZBbk"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-300 font-semibold rounded-2xl transition-all duration-300 active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#011319" />
          </svg>
          {t('apiGuide.watchVideo')}
        </a>

        <p className="mt-5 text-center text-sail-700 text-xs leading-relaxed">
          {t('apiGuide.disclaimer')}
        </p>
      </div>
    </div>
  )
}

export default ApiKeyGuide
