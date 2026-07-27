import './App.css'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-ocean-950 text-white">
      <Hero />
      <HowItWorks />
      <Footer />
    </div>
  )
}

export default App
