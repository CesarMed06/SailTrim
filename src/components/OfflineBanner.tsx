import { useTranslation } from 'react-i18next'

export default function OfflineBanner() {
  const { t } = useTranslation()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-900/95 border-b border-amber-700/60 px-4 py-2.5 text-center animate-pulse backdrop-blur-sm">
      <span className="text-amber-200 text-sm font-medium">
        ⚠️ {t('pwa.offlineBanner')}
      </span>
    </div>
  )
}
