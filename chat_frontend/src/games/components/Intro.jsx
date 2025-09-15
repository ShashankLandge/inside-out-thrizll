import React from 'react'

export default function Intro({ onStart, existingData, onReset }) {
  return (
    <div className="text-center py-8 animate-slide-in-left">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-love">Welcome — Play to Reveal Your Match Profile</h2>
      <p className="mt-4 text-dark/80 max-w-2xl mx-auto">Four quick interactive games (3–5 minutes total). We infer traits like risk-tolerance, attention, empathy, and humor preference from how you play — not from answers you type.</p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button 
          onClick={onStart} 
          className="game-btn px-8 py-3 flex items-center gap-2 animate-pulse-glow"
        >
          <span>Start — Balloon first</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
        <button 
          onClick={onReset} 
          className="game-btn-secondary px-6 py-3"
        >
          Reset saved data
        </button>
      </div>

      {existingData && (existingData.balloon || existingData.arrow || existingData.faces || existingData.meme) && (
        <div className="mt-6 text-sm bg-neutral/50 px-4 py-2 rounded-full text-dark/70 inline-block">Found previously saved run — results available after completion.</div>
      )}
    </div>
  )
}
