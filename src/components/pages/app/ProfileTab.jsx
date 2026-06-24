import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { CONFIG } from '@/config'
import LanguageModal from '@/components/modals/LanguageModal'

export default function ProfileTab() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const user = state.user || { name: 'User', email: '', avatar: 'U' }
  const biz = state.business || { name: 'My Business', type: 'other', city: '' }
  const tier = state.tier
  const tierMeta = CONFIG.TIER_META[tier]
  const bizIcon = CONFIG.BIZ_ICONS[biz.type] || '💼'

  function handleLogout() {
    dispatch({ type: 'LOGOUT' })
    navigate('/login', { replace: true })
  }

  return (
    <div className="pb-6">
      <div className="bg-gradient-to-b from-blue-600 to-blue-800 px-6 pt-8 pb-6 text-white">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white mb-3"
          style={{ backgroundColor: tierMeta.color }}
        >
          {user.avatar}
        </div>
        <div className="text-lg font-extrabold">{user.name}</div>
        <div className="text-sm text-blue-200 mt-0.5">{bizIcon} {biz.name}{biz.city ? ` · ${biz.city}` : ''}</div>
        <div
          className="inline-block text-[11px] font-bold px-3 py-1 rounded-full mt-2"
          style={{ backgroundColor: tierMeta.color + '30', color: '#fff' }}
        >
          {tierMeta.label}
        </div>
      </div>

      <div className="px-4 -mt-3">
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" className="w-[17px] h-[17px]"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <span className="flex-1 text-sm font-semibold text-gray-800">Edit Profile</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" className="w-[17px] h-[17px]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </div>
            <span className="flex-1 text-sm font-semibold text-gray-800">Business Profiles</span>
            <span className="text-xs text-gray-400">{CONFIG.PROFILE_LIMITS[tier].current}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
          <LanguageModal>
            <button className="w-full flex items-center gap-3 p-4 text-left">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" className="w-[17px] h-[17px]"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
              </div>
              <span className="flex-1 text-sm font-semibold text-gray-800">Language</span>
              <span className="text-xs text-gray-400">Taglish</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </LanguageModal>
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" className="w-[17px] h-[17px]"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </div>
            <span className="flex-1 text-sm font-semibold text-gray-800">Telegram Connection</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 mt-3">
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" className="w-[17px] h-[17px]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-800">{tierMeta.label}</div>
              <div className="text-[11px] text-gray-400">Current plan · Active</div>
            </div>
            {tier !== CONFIG.TIERS.UNLAD && (
              <button onClick={() => navigate('/plans')} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">Upgrade</button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 mt-3">
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" className="w-[17px] h-[17px]"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            </div>
            <span className="flex-1 text-sm font-semibold text-gray-800">Help Center</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
          {(tier === CONFIG.TIERS.SIGLA || tier === CONFIG.TIERS.UNLAD) && (
            <div className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" className="w-[17px] h-[17px]"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              </div>
              <span className="flex-1 text-sm font-semibold text-gray-800">Email Support</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          )}
          {tier === CONFIG.TIERS.UNLAD && (
            <div className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" className="w-[17px] h-[17px]"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              </div>
              <span className="flex-1 text-sm font-semibold text-gray-800">Live Chat Support</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 mt-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" className="w-[17px] h-[17px]"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          </div>
          <span className="text-sm font-semibold text-red-600">Log Out</span>
        </button>
      </div>
    </div>
  )
}
