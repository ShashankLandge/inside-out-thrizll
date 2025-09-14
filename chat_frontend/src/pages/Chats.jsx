import React, { useEffect, useState } from 'react'
import api from '../services/api'
import ChatList from '../components/ChatList'
import { useAuth } from '../contexts/AuthContext'

export default function Chats(){
  const { socket } = useAuth()
  const [rooms, setRooms] = useState([])

  async function load(){ try { const rs = await api.getRooms(); setRooms(rs) } catch (e){ console.error(e) } }

  useEffect(()=>{ load() }, [])

  useEffect(()=>{
    if (!socket) return
    socket.on('room_created', load)
    socket.on('receive_message', load)
    return ()=>{ socket.off('room_created'); socket.off('receive_message') }
  }, [socket])

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Your Chats</h3>
      <ChatList rooms={rooms} />
    </div>
  )
}
