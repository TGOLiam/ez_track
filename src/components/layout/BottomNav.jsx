import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import AddMenu from '@/components/modals/AddMenu'

const TABS = [
  { to: '/app/home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
  { to: '/app/reports', label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/app/ai', label: 'AI', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { to: '/app/inventory', label: 'Stock', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
]

export default function BottomNav() {
  return (
    <nav className="flex items-start border-t border-gray-200 bg-white h-[72px] pb-[env(safe-area-inset-bottom)]">
      {TABS.slice(0, 2).map(tab => (
        <NavLink key={tab.to} to={tab.to} end
          className={({ isActive }) =>
            cn('flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors pt-2',
              isActive ? 'text-blue-600' : 'text-gray-400')
          }
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
            <path d={tab.icon} />
          </svg>
          <span>{tab.label}</span>
        </NavLink>
      ))}

      <div className="flex-1 flex items-center justify-center">
        <AddMenu />
      </div>

      {TABS.slice(2).map(tab => (
        <NavLink key={tab.to} to={tab.to} end
          className={({ isActive }) =>
            cn('flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors pt-2',
              isActive ? 'text-blue-600' : 'text-gray-400')
          }
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
            <path d={tab.icon} />
          </svg>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
