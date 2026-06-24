import { Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { CONFIG } from '@/config'
import NotificationsModal from '@/components/modals/NotificationsModal'

function LogoIcon() {
  return (
    <img src="/assets/images/logo-removebg.png" alt="EzTrack" className="w-[60px] h-[60px] rounded-xl object-cover" />
  )
}

export default function TopBar() {
  const { state } = useApp()
  const tierMeta = CONFIG.TIER_META[state.tier]

  return (
    <div className="bg-blue-800 px-5 py-3.5 flex items-center justify-between shrink-0 shadow-md shadow-black/15">
      <div className="flex items-center gap-2.5">
        <div className="w-[60px] h-[60px] rounded-xl overflow-hidden shrink-0">
          <LogoIcon />
        </div>
        <div>
          <div className="text-lg font-extrabold text-white">EzTrack</div>
          <div className="inline-flex items-center gap-[5px] px-2.5 py-[3px] rounded-full bg-white/15 text-white/90 border border-white/20 text-[11px] font-bold mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tierMeta.color }} />
            {tierMeta.label}
          </div>
        </div>
      </div>
      <div className="flex gap-1.5">
        <NotificationsModal>
          <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/85 hover:bg-white/20 transition-colors relative cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span className="absolute top-[5px] right-[5px] w-2 h-2 rounded-full bg-red-400 border-[1.5px] border-blue-800" />
          </button>
        </NotificationsModal>
        <Link
          to="/app/profile"
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/85 hover:bg-white/20 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
