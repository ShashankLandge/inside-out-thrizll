import { io } from 'socket.io-client'

const URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function createSocket(token){
  const s = io(URL, { autoConnect: false, auth: { token } })
  return s
}
