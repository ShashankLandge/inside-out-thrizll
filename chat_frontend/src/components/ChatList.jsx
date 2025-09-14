import React from 'react'
import { Link } from 'react-router-dom'

export default function ChatList({ rooms }){
  if (!rooms || rooms.length===0) return <div className="text-gray-500">No active chats yet.</div>
  return (
    <div className="space-y-2">
      {rooms.map(r => (
        <Link key={r.id} to={`/rooms/${r.id}`} className="block p-3 bg-white rounded border hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Chat with {r.members.filter(m=>m.user).map(m=>m.user.name).join(', ')}</div>
              <div className="text-sm text-gray-500">Tier: {r.tier}</div>
            </div>
            <div className="text-sm text-indigo-600">Open</div>
          </div>
        </Link>
      ))}
    </div>
  )
}
