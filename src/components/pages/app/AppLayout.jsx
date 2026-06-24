import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { CONFIG } from '@/config'
import { api } from '@/lib/api'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout() {
  const { state, dispatch } = useApp()
  const [splashing, setSplashing] = useState(false)
  const [outletKey, setOutletKey] = useState(0)

  async function handleTryUnlad() {
    setSplashing(true)
    const fresh = await api.post('/login/3')
    dispatch({ type: 'LOGIN', payload: fresh })
    setOutletKey(k => k + 1)
    setSplashing(false)
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
        <Outlet key={outletKey} />
      </div>
      {state.tier !== CONFIG.TIERS.UNLAD && (
        <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100 shrink-0">
          <p className="text-[11px] text-amber-800 text-center">
            Want to see the full feature set?{' '}
            <button onClick={handleTryUnlad} className="font-semibold underline hover:text-amber-900">
              Try the Unlad demo
            </button>
            {' '}with Rosa Magsaysay.
          </p>
        </div>
      )}
      <BottomNav />
      {splashing && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white">
          <img src="/assets/images/logo.jpg" alt="EzTrack" className="w-20 h-20 rounded-full mb-4" />
          <h1 className="text-3xl font-extrabold">EzTrack</h1>
          <p className="text-sm text-gray-400 mt-2 tracking-widest uppercase">Your Financial Companion Since Day 1</p>
          <div className="flex gap-2 mt-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse [animation-delay:0.4s]" />
          </div>
        </div>
      )}
    </div>
  )
}
