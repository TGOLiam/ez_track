import { useApp } from '@/context/AppContext'
import { CONFIG } from '@/config'

export default function InventoryTab() {
  const { state } = useApp()
  const inv = state.inventory
  const tier = state.tier

  function status(item) {
    if (item.qty <= 0) return { label: 'Out of Stock', cls: 'bg-red-50 text-red-600' }
    if (item.min_threshold > 0 && item.qty <= item.min_threshold) return { label: 'Low Stock', cls: 'bg-amber-50 text-amber-600' }
    return { label: 'In Stock', cls: 'bg-green-50 text-green-600' }
  }

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">Stock Levels</div>
      {inv.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-400">No inventory items yet</p>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {inv.map(item => {
            const st = status(item)
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800">{item.name}</div>
                  <div className="text-xs text-gray-400">{item.qty} {item.unit}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
              </div>
            )
          })}
        </div>
      )}

      {tier === CONFIG.TIERS.SIMULA && (
        <div className="space-y-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-800">Low-stock alerts</div>
                <div className="text-xs text-gray-400">Sigla & above</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="w-5 h-5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-800">Minimum threshold</div>
                <div className="text-xs text-gray-400">Sigla & above</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
            </div>
          </div>
        </div>
      )}

      {tier === CONFIG.TIERS.SIGLA && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4">
          <div className="text-xs font-bold text-amber-800 mb-1">⚠️ 2 Items Need Restocking</div>
          <p className="text-xs text-amber-700">Canned Sardines (8 left, threshold 10) · Coffee 3in1 (3 left)</p>
        </div>
      )}

      {tier === CONFIG.TIERS.UNLAD && (
        <>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-4">
            <div className="text-xs font-bold text-blue-800 mb-1">🤖 AI Restock Reminder</div>
            <p className="text-xs text-blue-700">Canned Sardines predicted to stock out in 3 days. Order 24 pcs.</p>
          </div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">Monthly Stock Movement</div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
            {[
              { item: 'Cooking Oil', in: 24, out: 18 },
              { item: 'Noodles', in: 48, out: 36 },
              { item: 'Coffee 3in1', in: 6, out: 5 },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">{m.item}</span>
                <span className="text-gray-400">+{m.in} / -{m.out}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
