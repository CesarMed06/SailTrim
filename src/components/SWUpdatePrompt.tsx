import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function SWUpdatePrompt() {
  const { t } = useTranslation()
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handleUpdate = (registration: ServiceWorkerRegistration) => {
      const worker = registration.waiting
      if (worker) {
        setWaitingWorker(worker)
        setUpdateAvailable(true)
      }
    }

    navigator.serviceWorker.ready.then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            handleUpdate(reg)
          }
        })
      })
    })

    const handleControllerChange = () => {
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    let interval: ReturnType<typeof setInterval> | undefined
    navigator.serviceWorker.ready.then((reg) => {
      interval = setInterval(() => {
        reg.update().catch(() => {})
      }, 60 * 60 * 1000)
    })

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      if (interval) clearInterval(interval)
    }
  }, [])

  const handleUpdate = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }

  if (!updateAvailable) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-cyan-700/95 backdrop-blur-md border border-cyan-500/40 rounded-xl shadow-xl px-4 py-3 flex items-center gap-3">
        <span className="text-cyan-200 text-sm">{t('pwa.updateAvailable')}</span>
        <button
          onClick={handleUpdate}
          className="bg-white text-cyan-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-cyan-100 transition-colors"
        >
          {t('pwa.update')}
        </button>
      </div>
    </div>
  )
}
