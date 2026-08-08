import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function PWAInstallPrompt() {
  const { t } = useTranslation()
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSHelp, setShowIOSHelp] = useState(false)

  useEffect(() => {
    const isIOSDevice = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches

    if (isStandalone) return
    if (localStorage.getItem('sailtrim_pwa_dismissed') === 'true') return

    setIsIOS(isIOSDevice)

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    const timer = setTimeout(() => setShowPrompt(true), 30000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    if (!installEvent) {
      if (isIOS) {
        setShowIOSHelp(true)
      }
      return
    }

    await installEvent.prompt()
    const result = await installEvent.userChoice

    if (result.outcome === 'accepted') {
      setShowPrompt(false)
      setDismissed(true)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('sailtrim_pwa_dismissed', 'true')
  }

  const handleCloseIOSHelp = () => {
    setShowIOSHelp(false)
  }

  if (!showPrompt || dismissed || (!installEvent && !isIOS)) return null

  return (
    <>
      <div className="fixed bottom-20 right-4 z-40 animate-fade-in-up">
        <div className="bg-ocean-800/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 p-4 max-w-[280px]">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">📲</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold leading-snug">
                {t('pwa.installPrompt')}
              </p>
              <p className="text-ocean-300 text-xs mt-1 leading-snug">
                {t('pwa.installSubtitle')}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-ocean-500 hover:text-ocean-300 transition-colors shrink-0"
              aria-label={t('pwa.dismiss')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium py-2 px-3 rounded-xl transition-colors"
            >
              {t('pwa.install')}
            </button>
          </div>

          {isIOS && (
            <button
              onClick={() => setShowIOSHelp(true)}
              className="w-full mt-2 text-ocean-400 hover:text-ocean-300 text-xs transition-colors underline underline-offset-2"
            >
              {t('pwa.iosHelpLink')}
            </button>
          )}
        </div>
      </div>

      {showIOSHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-ocean-800 border border-ocean-600/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-3">
              {t('pwa.iosHelpTitle')}
            </h3>
            <ol className="text-ocean-200 text-sm space-y-2.5 list-decimal list-inside leading-relaxed">
              <li>{t('pwa.iosStep1')}</li>
              <li>{t('pwa.iosStep2')}</li>
              <li>{t('pwa.iosStep3')}</li>
            </ol>
            <button
              onClick={handleCloseIOSHelp}
              className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              {t('chat.ok')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
