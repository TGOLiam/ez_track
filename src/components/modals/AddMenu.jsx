import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useApp } from '@/context/AppContext'
import { CONFIG } from '@/config'
import LogTransactionModal from '@/components/modals/LogTransactionModal'
import AddItemModal from '@/components/modals/AddItemModal'
import AddCustomerModal from '@/components/modals/AddCustomerModal'
import AddGoalModal from '@/components/modals/AddGoalModal'

const TYPES = [
  { key: 'transaction', label: 'Log Transaction', sub: 'Record income or expense', tier: ['simula', 'sigla', 'unlad'], color: 'green', icon: 'M12 20V10m0 10l-4-4m4 4l4-4m2-16H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2z' },
  { key: 'inventory', label: 'Inventory Item', sub: 'Add item with stock level', tier: ['simula', 'sigla', 'unlad'], color: 'blue', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { key: 'customer', label: 'Add Customer', sub: 'Save name and contact', tier: ['sigla', 'unlad'], color: 'amber', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM19 8v6m-3-3h6' },
  { key: 'goal', label: 'Set Goal', sub: 'Set target amount and deadline', tier: ['unlad'], color: 'indigo', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
]

const COLOR_MAP = {
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  indigo: 'bg-indigo-50 text-indigo-600',
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export default function AddMenu() {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const tier = useApp().state.tier

  function handleSelect(type) {
    setSelectedType(type)
    setOpen(false)
  }

  function handleClose(which) {
    if (selectedType === which) setSelectedType(null)
  }

  const visibleTypes = TYPES.filter(t => t.tier.includes(tier))

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button className="relative -top-3 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all ring-4 ring-white">
            <PlusIcon />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="px-4 pt-4 pb-2"><DrawerTitle>Add New</DrawerTitle></DrawerHeader>
          <div className="px-4 pb-6 space-y-2">
            {visibleTypes.map(t => (
              <button
                key={t.key}
                onClick={() => handleSelect(t.key)}
                className="w-full rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${COLOR_MAP[t.color]}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                      <path d={t.icon} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">{t.label}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{t.sub}</div>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      <LogTransactionModal
        open={selectedType === 'transaction'}
        onOpenChange={(v) => { if (!v) handleClose('transaction') }}
      />
      <AddItemModal
        open={selectedType === 'inventory'}
        onOpenChange={(v) => { if (!v) handleClose('inventory') }}
      />
      {tier !== CONFIG.TIERS.SIMULA && (
        <AddCustomerModal
          open={selectedType === 'customer'}
          onOpenChange={(v) => { if (!v) handleClose('customer') }}
        />
      )}
      {tier === CONFIG.TIERS.UNLAD && (
        <AddGoalModal
          open={selectedType === 'goal'}
          onOpenChange={(v) => { if (!v) handleClose('goal') }}
        />
      )}
    </>
  )
}
