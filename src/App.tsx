import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import { TrimProvider } from './context/TrimContext'
import { useTrim } from './context/trim-context'
import { useWindSimulation } from './hooks/useWindSimulation'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import WindSelector from './components/WindSelector'
import ConditionsPanel from './components/ConditionsPanel'
import Dashboard from './components/Dashboard'
import SimulationPanel from './components/SimulationPanel'
import BoatProfilePanel from './components/BoatProfilePanel'
import ChatSection from './components/ChatSection'
import NMEAPanel from './components/NMEAPanel'
import Footer from './components/Footer'
import LanguageSwitcher from './components/LanguageSwitcher'
import SEO from './components/SEO'
import OfflineBanner from './components/OfflineBanner'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import SWUpdatePrompt from './components/SWUpdatePrompt'

function AppInner() {
  const { isRunning, wind, toggle } = useWindSimulation()
  const { t } = useTranslation()
  const { mode, setLiveWind } = useTrim()
  const online = useOnlineStatus()
  const lastPushRef = useRef('')
  const prevModeRef = useRef(mode)

  useEffect(() => {
    if (prevModeRef.current === 'demo' && mode !== 'demo') {
      setLiveWind(null)
      lastPushRef.current = ''
    }
    prevModeRef.current = mode
  }, [mode, setLiveWind])

  useEffect(() => {
    if (mode !== 'demo') return
    if (!isRunning) {
      setLiveWind(null)
      lastPushRef.current = ''
      return
    }
    const key = `${wind.direction}|${wind.speedKnots.toFixed(1)}`
    if (lastPushRef.current === key) return
    lastPushRef.current = key
    setLiveWind({
      direction: wind.direction,
      speedKnots: wind.speedKnots,
      force: wind.force,
    })
  }, [mode, isRunning, wind, setLiveWind])

  return (
    <div className="min-h-screen bg-ocean-950 text-white">
      <a
        href="#main"
        className="skip-link rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-ocean-950 shadow-lg"
      >
        {t('a11y.skip')}
      </a>
      <SEO />
      {!online && <OfflineBanner />}
      <main id="main" tabIndex={-1}>
        <Hero />
        <HowItWorks />
        <WindSelector />
        <ConditionsPanel />
        <Dashboard simulationRunning={isRunning} onToggleSimulation={toggle} />
        <BoatProfilePanel />
        <ChatSection />
        <SimulationPanel isRunning={isRunning} wind={wind} onToggle={toggle} />
        <NMEAPanel />
      </main>
      <LanguageSwitcher />
      <PWAInstallPrompt />
      <SWUpdatePrompt />
      <Footer />
    </div>
  )
}

function App() {
  return (
    <TrimProvider>
      <AppInner />
    </TrimProvider>
  )
}

export default App
