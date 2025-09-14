import React, { useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login(){
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  async function submit(e){
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const res = await api.login(form)
      login({ token: res.token, user: res.user })
      navigate('/users')
    } catch (e){
      setErr(e?.response?.data?.error || e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Welcome back</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border rounded" placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input className="w-full p-2 border rounded" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className="w-full bg-indigo-600 text-white p-2 rounded" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
      </form>
      <div className="mt-4 text-sm text-gray-600">No account? <a href="/signup" className="text-indigo-600">Sign up</a></div>
    </div>
  )
}
