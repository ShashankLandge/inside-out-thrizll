import React, { useEffect, useRef, useState } from 'react'
import { randomInt, now } from '../utils/helpers'

export default function BalloonGame({ onComplete }) {
  const ROUNDS = 6
  const [round, setRound] = useState(0)
  const [pumps, setPumps] = useState(0)
  const [threshold, setThreshold] = useState(randomInt(3,12))
  const [popped, setPopped] = useState(false)
  const eventsRef = useRef([])

  useEffect(() => {
    setThreshold(randomInt(3,12))
    setPumps(0)
    setPopped(false)
  }, [round])

  const pump = () => {
    if (popped) return
    const newP = pumps + 1
    setPumps(newP)
    if (newP > threshold) {
      // popped
      setPopped(true)
      eventsRef.current.push({ round, pumps: newP, popped: true, cashed: false, timestamp: now() })
      // after short delay, go to next round automatically
      setTimeout(() => nextRound(), 800)
    }
  }

  const cashOut = () => {
    if (popped) return
    eventsRef.current.push({ round, pumps, popped: false, cashed: true, timestamp: now() })
    // small delay and next round
    setTimeout(() => nextRound(), 400)
  }

  const nextRound = () => {
    if (round + 1 >= ROUNDS) {
      const ev = eventsRef.current
      const cashed = ev.filter(e => e.cashed).map(e => e.pumps)
      const poppedCount = ev.filter(e => e.popped).length
      const avgCashed = cashed.length ? cashed.reduce((a,b)=>a+b,0)/cashed.length : 0
      onComplete({ events: ev, rounds: ROUNDS, avgCashedPumps: avgCashed, poppedCount })
      return
    }
    setRound(r => r + 1)
    setPumps(0)
    setPopped(false)
    setThreshold(randomInt(3,12))
  }

  // layout: reserve space for balloon area so it cannot overlap controls
  const size = 1 + pumps * 0.06
  const hue = 200 - Math.min(120, pumps * 10)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div className="p-6 border rounded-xl animate-slide-in-left">
        <h3 className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Balloon — Risk & Reward</h3>
        <p className="text-sm text-dark/80 mt-2">Tap <span className="font-semibold">Pump</span> to inflate. Cash out before it pops to keep the reward.</p>

        <div className="mt-8 flex flex-col items-center gap-4">
          {/* balloon visual area with fixed height to avoid overlap */}
          <div className="relative h-56 w-full flex items-center justify-center overflow-hidden">
            <div
              className="rounded-full shadow-xl flex items-center justify-center transition-transform duration-300 animate-float"
              style={{ width: `${120 * size}px`, height: `${140 * size}px`, background: `hsl(${hue} 80% 60%)`, maxWidth: '220px', maxHeight: '240px' }}>
              <div className="text-3xl select-none">🎈</div>
            </div>
            {popped && (
              <div className="absolute text-5xl -translate-y-6 select-none animate-pop">💥</div>
            )}
          </div>

          <div className="flex gap-4 mt-2">
            <button onClick={pump} className="game-btn flex items-center gap-2" disabled={popped}>
              <span>Pump</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
            <button onClick={cashOut} className="game-btn-secondary flex items-center gap-2" disabled={popped}>
              <span>Cash out</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>

          <div className="text-sm bg-neutral/50 px-4 py-2 rounded-full text-dark/80">Round {round + 1} of {ROUNDS} • Pumps: {pumps} {popped ? "(popped)" : ""}</div>
        </div>
      </div>

      <div className="p-6 border rounded-xl">
        <h4 className="text-md font-medium">Why we measure this</h4>
        <ul className="mt-3 text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>More pumps before cash-out → higher risk tolerance / reward sensitivity.</li>
          <li>More pops / fewer cashouts → impulsivity or risk-seeking behaviour.</li>
          <li>We use these metrics later to help match complementary risk profiles.</li>
        </ul>

        <div className="mt-6">
          <h5 className="text-sm font-semibold">Live events</h5>
          <div className="mt-2 text-xs text-gray-500">Events are tracked per round and saved locally when you finish all rounds.</div>
        </div>
      </div>
    </div>
  )
}
