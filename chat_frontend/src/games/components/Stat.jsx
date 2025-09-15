import React from 'react'
export default function Stat({ label, value, description }) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-dark">{label}</div>
        <div className="text-sm font-bold bg-neutral/50 px-3 py-1 rounded-full text-dark">{value}%</div>
      </div>
      {description && (
        <div className="text-xs text-dark/60">{description}</div>
      )}
      <div className="w-full bg-neutral/30 rounded-full h-2 overflow-hidden">
        <div 
          className="h-2 rounded-full bg-gradient-to-r from-primary to-accent" 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  )
}
