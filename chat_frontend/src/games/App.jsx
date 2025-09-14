import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import Intro from './components/Intro'
import BalloonGame from './components/BalloonGame'
import ArrowGame from './components/ArrowGame'
import FacesGame from './components/FacesGame'
import MemeCaptionGame from './components/MemeCaptionGame'
import Results from './components/Results'
import storage from './services/storage'

export default function App() {
  const [step, setStep] = useState(0) // 0 intro, 1..4 games, 5 results
  const [data, setData] = useState({ balloon: null, arrow: null, faces: null, meme: null })

  useEffect(() => {
    const saved = storage.load()
    if (saved) setData(saved)
  }, [])

  const handleComplete = (key, report) => {
    const updated = { ...data, [key]: report }
    setData(updated)
    storage.save(updated)
    setStep(s => s + 1)
  }

  const resetAll = () => {
    storage.clear()
    setData({ balloon: null, arrow: null, faces: null, meme: null })
    setStep(0)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6">
        <Header step={step} />
        <div className="mt-6">
          {step === 0 && <Intro onStart={() => setStep(1)} onReset={resetAll} existingData={data} />}
          {step === 1 && <BalloonGame onComplete={(r) => handleComplete('balloon', r)} />}
          {step === 2 && <ArrowGame onComplete={(r) => handleComplete('arrow', r)} />}
          {step === 3 && <FacesGame onComplete={(r) => handleComplete('faces', r)} />}
          {step === 4 && <MemeCaptionGame onComplete={(r) => handleComplete('meme', r)} />}
          {step === 5 && <Results data={data} onReset={resetAll} />}
        </div>
      </div>
    </div>
  )
}
