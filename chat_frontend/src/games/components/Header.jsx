import React from 'react'

export default function Header({ step }) {
  const titles = ['Intro','Balloon','Arrow','Faces','Meme','Results']
  const pct = Math.round((step / (titles.length - 1)) * 100)
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-love">MatchPlay — Quick Personality Games</h1>
        <div className="text-sm bg-neutral/50 px-4 py-1 rounded-full text-dark/70 inline-flex">Minimal • Fast • Insightful</div>
      </div>
      <div className="mt-6">
        <div className="w-full bg-neutral/30 rounded-full h-3 shadow-inner">
          <div className="h-3 rounded-full bg-gradient-to-r from-primary to-accent shadow-sm" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex justify-between">
          <div className="text-xs font-medium text-dark/70">Progress: {pct}%</div>
          <div className="text-xs font-medium text-dark/70">{titles[step]}</div>
        </div>
      </div>
    </div>
  )
}
