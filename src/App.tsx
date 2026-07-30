import './App.css'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import WindSelector from './components/WindSelector'
import ConditionsPanel from './components/ConditionsPanel'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-ocean-950 text-white">
      <Hero />
      <HowItWorks />
      <WindSelector />
      <ConditionsPanel />
      <Footer />
    </div>
  )
}

export default App
