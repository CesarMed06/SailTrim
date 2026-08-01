import './App.css'
import { useWindSimulation } from './hooks/useWindSimulation'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import WindSelector from './components/WindSelector'
import ConditionsPanel from './components/ConditionsPanel'
import SimulationPanel from './components/SimulationPanel'
import NMEAPanel from './components/NMEAPanel'
import Footer from './components/Footer'

function App() {
  const { isRunning, wind, toggle } = useWindSimulation()

  return (
    <div className="min-h-screen bg-ocean-950 text-white">
      <Hero />
      <HowItWorks />
      <WindSelector />
      <ConditionsPanel />
      <SimulationPanel isRunning={isRunning} wind={wind} onToggle={toggle} />
      <NMEAPanel />
      <Footer />
    </div>
  )
}

export default App
