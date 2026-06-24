import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CONFIG } from '@/config'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const t1 = setTimeout(() => {
      navigate('/login', { replace: true })
    }, CONFIG.SPLASH_DURATION_MS)
    return () => clearTimeout(t1)
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
      <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center mb-4">
        <img src="/assets/images/logo.jpg" alt="EzTrack" className="w-16 h-16 rounded-full object-cover" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight">EzTrack</h1>
      <p className="text-sm text-gray-400 mt-2 tracking-widest uppercase">Your Financial Companion Since Day 1</p>
      <div className="flex gap-2 mt-6">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse [animation-delay:0.2s]" />
        <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse [animation-delay:0.4s]" />
      </div>
    </div>
  )
}
