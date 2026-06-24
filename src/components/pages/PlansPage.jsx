import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { CONFIG } from '@/config'
import PlanCard from '@/components/shared/PlanCard'

export default function PlansPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [billing, setBilling] = useState('monthly')

  function handleSelect(planId) {
    dispatch({ type: 'SET_TIER', payload: planId })
    navigate('/setup/step-1')
  }

  return (
    <div className="flex flex-col h-full px-6 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Choose your plan</h1>
        <p className="text-sm text-gray-400 mt-1">Start free. Upgrade as you grow. Cancel anytime.</p>
      </div>

      <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-5 self-start">
        <button
          onClick={() => setBilling('monthly')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${billing === 'monthly' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling('annual')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${billing === 'annual' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
        >
          Annual
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {CONFIG.PLANS.map(plan => (
          <PlanCard key={plan.id} plan={plan} billing={billing} onSelect={handleSelect} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 py-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        No credit card needed for Simula · Cancel anytime
      </div>
    </div>
  )
}
