import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { api } from '@/lib/api'
import { CONFIG } from '@/config'

const BIZ_TYPES = [
  { id: 'sari', icon: '🏪', label: 'Sari-Sari Store' },
  { id: 'food', icon: '🍱', label: 'Food & Eatery' },
  { id: 'online', icon: '📦', label: 'Online Shop' },
  { id: 'services', icon: '🔧', label: 'Services' },
  { id: 'retail', icon: '🛍️', label: 'Retail Store' },
  { id: 'other', icon: '💼', label: 'Other' },
]

export default function SetupStep1() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [bizName, setBizName] = useState(state.business?.name || '')
  const [bizType, setBizType] = useState(CONFIG.DEFAULT_BIZ_TYPE)
  const [city, setCity] = useState('')
  const [lang, setLang] = useState(CONFIG.DEFAULT_LANG)

  async function handleSubmit(e) {
    e.preventDefault()
    const name = bizName.trim() || CONFIG.DEFAULT_BIZ_NAME
    dispatch({ type: 'SET_BUSINESS', payload: { name, type: bizType, city: city.trim(), lang } })
    await api.put('/profile', { profileId: state.profileId, biz_name: name, biz_type: bizType, biz_city: city.trim(), lang })
    navigate('/setup/step-2')
  }

  return (
    <div className="flex flex-col h-full bg-white px-6 pt-6">
      <div className="mb-6">
        <div className="text-[11px] font-bold text-blue-600 mb-1">STEP 1 OF 2</div>
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Tell us about<br />your business</h1>
        <p className="text-sm text-gray-400 mt-1">This helps EzTrack personalize your experience</p>
        <div className="flex gap-2 mt-3">
          <div className="w-8 h-1.5 rounded-full bg-blue-600" />
          <div className="w-8 h-1.5 rounded-full bg-gray-200" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pb-4">
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Business Name</label>
          <input type="text" value={bizName} onChange={e => setBizName(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors"
            placeholder="My Business" />
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Business Type</label>
          <div className="grid grid-cols-3 gap-2">
            {BIZ_TYPES.map(bt => (
              <button key={bt.id} type="button" onClick={() => setBizType(bt.id)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-center transition-all ${bizType === bt.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                <span className="text-xl">{bt.icon}</span>
                <span className="text-[10px] text-gray-500 font-medium">{bt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">City</label>
          <input type="text" value={city} onChange={e => setCity(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors"
            placeholder="Quezon City" />
        </div>

        <div className="mb-6">
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Preferred Language</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setLang('taglish')}
              className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${lang === 'taglish' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}>
              🇵🇭 Taglish
            </button>
            <button type="button" onClick={() => setLang('english')}
              className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${lang === 'english' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}>
              🇺🇸 English Only
            </button>
          </div>
        </div>

        <button type="submit" className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-[.98] transition-all">
          Continue
        </button>
      </form>
    </div>
  )
}
