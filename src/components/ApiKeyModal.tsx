import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { clearApiKey, getApiKey, saveApiKey } from '../lib/gemini'
import { useFocusTrap } from '../hooks/useFocusTrap'

interface ApiKeyModalProps {
  open: boolean
  onClose: () => void
  onOpenGuide: () => void
}

function ApiKeyModal({ open, onClose, onOpenGuide }: ApiKeyModalProps) {
  const [key, setKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dialogRef = useFocusTrap<HTMLDivElement>(open, 'input')
  const { t } = useTranslation()

  useEffect(() => {
    if (open) {
      setKey(getApiKey())
      setSaved(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  if (!open) return null

  const handleSave = () => {
    if (!key.trim()) return
    saveApiKey(key)
    setSaved(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setSaved(false)
      onClose()
    }, 900)
  }

  const handleClear = () => {
    clearApiKey()
    setKey('')
  }

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
        aria-label={t('apiKeyModal.dialogLabel')}
        className="relative bg-ocean-900 border border-ocean-700/40 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black/50 animate-fade-in"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-wind-400 text-xs font-semibold tracking-widest uppercase">
              {t('apiKeyModal.badge')}
            </span>
            <h3 className="font-display text-2xl font-bold text-white mt-1">
              {t('apiKeyModal.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label={t('apiKeyModal.close')}
            className="text-sail-600 hover:text-sail-300 transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-sail-500 text-sm mb-4 leading-relaxed">
          {t('apiKeyModal.description')}
        </p>

        <button
          onClick={onOpenGuide}
          className="w-full mb-6 flex items-center justify-between gap-3 bg-wind-500/10 border border-wind-500/25 hover:bg-wind-500/20 rounded-xl px-4 py-3 text-left transition-all duration-300"
        >
          <span className="text-sm text-wind-300 font-medium">
            {t('apiKeyModal.noKeyBanner')}
          </span>
          <span className="text-wind-400 text-xs font-semibold shrink-0">{t('apiKeyModal.viewGuide')}</span>
        </button>

        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder={t('apiKeyModal.placeholder')}
            aria-label={t('apiKeyModal.inputLabel')}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-ocean-950/80 border border-ocean-800/50 rounded-xl px-4 py-3 pr-12 font-mono text-sm text-sail-200 placeholder:text-sail-700 focus:border-wind-500/50 focus:ring-1 focus:ring-wind-500/30 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            aria-label={showKey ? t('apiKeyModal.hide') : t('apiKeyModal.show')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-sail-600 hover:text-sail-300 transition-colors"
          >
            {showKey ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 mt-4">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!key.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-wind-500 to-cyan-500 hover:from-wind-400 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-wind-500/20 active:scale-[0.98]"
            >
              {saved ? t('apiKeyModal.saved') : t('apiKeyModal.save')}
            </button>
            {key && (
              <button
                onClick={handleClear}
                className="px-4 py-2.5 text-sail-600 hover:text-red-400 text-sm font-medium rounded-xl border border-ocean-800/40 hover:border-red-500/30 transition-all"
              >
                {t('apiKeyModal.delete')}
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onOpenGuide}
          className="mt-5 w-full flex items-center justify-center gap-2 text-sm text-wind-400 hover:text-wind-300 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          {t('apiKeyModal.fullGuide')}
        </button>
      </div>
    </div>
  )
}

export default ApiKeyModal
