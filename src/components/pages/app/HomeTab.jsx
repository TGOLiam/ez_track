import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { CONFIG } from '@/config'

const HEARTBEAT_MSGS = {
  simula: {
    label: 'THE HEARTBEAT',
    time: 'Monday · 8:02 AM',
    text: 'Kumita ka ng <strong>₱6,020</strong> this week and gumastos ng <strong>₱1,200</strong>. Net: <strong>₱4,820</strong>. 5-day streak!',
    action: 'View Report',
  },
  sigla: {
    label: 'THE HEARTBEAT',
    time: 'Today · 8:02 AM',
    text: 'Supplies spending is <strong>18% higher</strong> than last week. Ikaw, pumpa-<strong>₱3,200</strong> na this month. Want to set a budget alert?',
    action: 'Check Budget',
  },
  unlad: {
    label: 'THE HEARTBEAT',
    time: 'Today · 8:02 AM',
    text: 'Your profit goal is at <strong>76%</strong>. If supplies cost continues to rise, you may fall <strong>₱3,200</strong> short this month.',
    action: 'View Forecast',
  },
}

const STATS = {
  simula: [
    { lbl: 'Cash Today', val: '₱2,340', cls: 'up', chg: '+₱340 today' },
    { lbl: 'This Week', val: '₱4,820', cls: 'up', chg: '+12% vs last week' },
    { lbl: 'Money In', val: '₱6,020', cls: 'up', chg: 'This week total' },
    { lbl: 'Money Out', val: '₱1,200', cls: 'dn', chg: 'This week total' },
  ],
  sigla: [
    { lbl: 'Cash Today', val: '₱2,340', cls: 'up', chg: '+₱340 today' },
    { lbl: 'This Month', val: '₱18,450', cls: 'up', chg: '+8% vs May' },
    { lbl: 'Best Day', val: 'Friday', cls: 'up', chg: '₱1,240 avg sales' },
    { lbl: 'Worst Day', val: 'Tuesday', cls: 'dn', chg: '₱580 avg sales' },
  ],
  unlad: [
    { lbl: 'Cash Position', val: '₱38,450', cls: 'up', chg: '+₱4,200 this month' },
    { lbl: 'Profit Goal', val: '76%', cls: '', chg: '₱38K of ₱50K target' },
    { lbl: 'Receivables', val: '₱4,200', cls: '', chg: '2 outstanding invoices' },
    { lbl: 'Tax Set-Aside', val: '₱1,150', cls: '', chg: 'Due Jul 25 (BIR)' },
  ],
}

export default function HomeTab() {
  const { state } = useApp()
  const navigate = useNavigate()
  const tier = state.tier
  const msgs = HEARTBEAT_MSGS[tier]
  const [showAllTx, setShowAllTx] = useState(false)

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="rounded-[20px] bg-gradient-to-br from-blue-600 to-blue-800 p-5 relative overflow-hidden text-white mb-4">
        <div className="absolute top-[-30px] right-[-30px] w-[130px] h-[130px] rounded-full bg-blue-400/18 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[-20px] w-[100px] h-[100px] rounded-full bg-blue-400/10 pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-[5px]">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-[.7px] uppercase opacity-70">{msgs.label}</span>
          </div>
          <span className="text-[11px] opacity-55">{msgs.time}</span>
        </div>
        <p className="text-sm leading-relaxed opacity-95 mb-4" dangerouslySetInnerHTML={{ __html: msgs.text }} />
        <div className="flex gap-2">
          <button onClick={() => navigate('/app/reports')} className="px-4 py-2 rounded-lg bg-white text-blue-700 text-xs font-bold hover:bg-white/80 transition-colors">{msgs.action}</button>
          <button onClick={() => navigate('/app/ai')} className="px-4 py-2 rounded-lg border border-white/30 text-white text-xs font-bold hover:bg-white/15 transition-colors">Ask AI</button>
        </div>
      </div>

      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">Overview</div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {STATS[tier].map((s, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{s.lbl}</div>
            <div className={`text-xl font-extrabold mt-1 ${s.cls === 'up' ? 'text-green-600' : s.cls === 'dn' ? 'text-red-600' : 'text-gray-900'}`}>
              {s.val}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">{s.chg}</div>
          </div>
        ))}
      </div>

      {tier !== 'unlad' && (
        <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 p-4 mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <div className="text-xs font-bold text-blue-800 mb-1">
              {tier === 'simula' ? 'Weekly Insight' : '2 Tips This Week'}
            </div>
            <div className="text-xs text-blue-700 leading-relaxed">
              {tier === 'simula'
                ? 'Supplies is your biggest expense at 41%. Bulk ordering could save 8-12%.'
                : '1️⃣ Buy supplies Thursday before weekend spike. 2️⃣ Stock up on best-sellers Friday.'}
            </div>
          </div>
        </div>
      )}

      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">Recent Transactions</div>
      <div className="space-y-2 mb-4">
        {state.transactions.slice(0, showAllTx ? (tier === CONFIG.TIERS.SIMULA ? CONFIG.TX_LIST_LIMIT_SIMULA : CONFIG.TX_LIST_LIMIT_OTHER) : 3).map(tx => (
          <div key={tx.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === 'inc' ? 'bg-blue-50' : 'bg-red-50'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke={tx.type === 'inc' ? '#2563EB' : '#DC2626'} strokeWidth="2.5" className="w-4 h-4">
                <polyline points={tx.type === 'inc' ? '23 6 13.5 15.5 8.5 10.5 1 18' : '23 18 13.5 8.5 8.5 13.5 1 6'} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 truncate">{tx.desc}</div>
              <div className="text-[11px] text-gray-400">{tx.date} · {tx.time}{tx.cat ? ` · ${tx.cat}` : ''}</div>
            </div>
            <div className={`text-sm font-bold ${tx.type === 'inc' ? 'text-green-600' : 'text-red-600'}`}>
              {tx.type === 'inc' ? '+' : '-'}{CONFIG.CURRENCY_SYMBOL}{tx.amt.toLocaleString()}
            </div>
          </div>
        ))}
        {state.transactions.length > 3 && (
          <button
            onClick={() => setShowAllTx(!showAllTx)}
            className="w-full text-xs text-blue-600 font-semibold py-2 hover:text-blue-700 transition-colors"
          >
            {showAllTx ? 'Show less' : `Show all (${state.transactions.length} transactions)`}
          </button>
        )}
      </div>

      <div className="text-[11px] text-gray-400 px-1 mb-4">
        {tier === CONFIG.TIERS.SIMULA
          ? 'Transaction limit: 150/month (67 used)'
          : 'Unlimited transactions'}
      </div>

      {tier === CONFIG.TIERS.SIMULA && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-xs text-gray-400 mb-2">Upgrade to Sigla for categories, monthly reports, invoices, and unlimited AI chat</p>
          <button onClick={() => navigate('/plans')} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">Upgrade Now</button>
        </div>
      )}

      {tier === CONFIG.TIERS.SIGLA && (
        <>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">Invoices</div>
          <div className="space-y-2 mb-4">
            {[
              { num: 'INV-0042', customer: 'Reyes Canteen', amt: 1800, status: 'Unpaid', cls: 'amber' },
              { num: 'INV-0041', customer: 'Sari Foods Supply', amt: 2400, status: 'Paid', cls: 'green' },
            ].map((inv, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-800">{inv.num}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-${inv.cls}-50 text-${inv.cls}-600`}>
                    {inv.status}
                  </span>
                </div>
                <div className="text-xs text-gray-400">{inv.customer}</div>
                <div className="text-sm font-bold text-gray-800 mt-1">₱{inv.amt.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {tier === CONFIG.TIERS.UNLAD && (
        <>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">Profit Goal</div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-gray-800">₱50,000 net by June 30</span>
              <span className="text-sm font-bold text-gray-800">76%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 mb-1">
              <div className="h-2 rounded-full bg-amber-400" style={{ width: '76%' }} />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>₱0</span>
              <span>₱38,000 reached</span>
              <span>₱50,000</span>
            </div>
          </div>

          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">BIR / Tax</div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" className="w-4 h-4">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-xs font-bold text-amber-800">BIR Quarterly Deadline in 12 days</span>
            </div>
            <p className="text-xs text-amber-700">Estimated 3% percentage tax: ₱1,150 due Jul 25</p>
          </div>

          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">Payroll This Cutoff</div>
          <div className="space-y-2 mb-4">
            {[
              { name: 'Juan dela Cruz', role: 'Staff', rate: 5850 },
              { name: 'Rosa Magsaysay', role: 'Staff', rate: 5200 },
            ].map((emp, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                  {emp.name.split(' ').map(s => s[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">{emp.name}</div>
                  <div className="text-[11px] text-gray-400">{emp.role}</div>
                </div>
                <div className="text-sm font-bold text-gray-800">₱{emp.rate.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
