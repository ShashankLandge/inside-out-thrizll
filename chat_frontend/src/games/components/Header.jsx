import React from 'react'

export default function Header({ step }) {
  const titles = ['Intro','Balloon','Arrow','Faces','Meme','Results']
  const pct = Math.round((step / (titles.length - 1)) * 100)
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">MatchPlay — Quick Personality Games</h1>
        <div className="text-sm text-gray-500">Minimal • Fast • Insightful</div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 text-xs text-gray-600">Progress: {pct}%</div>
      </div>
    </div>
  )
}
