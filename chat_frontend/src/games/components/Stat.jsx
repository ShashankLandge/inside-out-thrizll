import React from 'react'
export default function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
