import React from 'react'

export default function Intro({ onStart, existingData, onReset }) {
  return (
    <div className="text-center py-8">
      <h2 className="text-xl font-medium">Welcome — Play to Reveal Your Match Profile</h2>
      <p className="mt-3 text-gray-600">Four quick interactive games (3–5 minutes total). We infer traits like risk-tolerance, attention, empathy, and humor preference from how you play — not from answers you type.</p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button onClick={onStart} className="px-6 py-2 rounded-full bg-indigo-600 text-white font-medium shadow">
          Start — Balloon first
        </button>
        <button onClick={onReset} className="px-4 py-2 rounded-full border text-gray-700">
          Reset saved data
        </button>
      </div>

      {existingData && (existingData.balloon || existingData.arrow || existingData.faces || existingData.meme) && (
        <div className="mt-4 text-sm text-gray-500">Found previously saved run — results available after completion.</div>
      )}
    </div>
  )
}
