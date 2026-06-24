import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { api } from '@/lib/api'
import ProfileCard from '@/components/shared/ProfileCard'

export default function LoginPage() {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])

  useEffect(() => {
    api.get('/profiles').then(setProfiles).catch(() => {})
  }, [])

  async function handleLogin(profileId) {
    const state = await api.post('/login/' + profileId)
    dispatch({ type: 'LOGIN', payload: state })
    navigate('/app/home', { replace: true })
  }

  return (
    <div className="flex flex-col h-full px-6 pt-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
            <path d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
            <path d="M8 9l2 2 2-2" />
          </svg>
        </div>
        <span className="font-bold text-gray-800">EzTrack</span>
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
        Welcome back,<br />Negosyante! <span className="not-italic">👋</span>
      </h1>
      <p className="text-sm text-gray-400 mt-1 mb-6">Choose your demo account</p>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {profiles.map(p => (
          <ProfileCard key={p.id} profile={p} onSelect={handleLogin} />
        ))}
      </div>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <Link
        to="/register"
        className="w-full py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold text-sm text-center hover:bg-gray-50 transition-colors"
      >
        Create New Account
      </Link>

      <p className="text-[11px] text-gray-400 text-center mt-4 mb-6 leading-relaxed">
        By continuing, you agree to our{' '}
        <span className="text-blue-600 font-semibold">Terms</span> and{' '}
        <span className="text-blue-600 font-semibold">Privacy Policy</span>
      </p>
    </div>
  )
}
