import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useApp } from '@/context/AppContext'
import { api } from '@/lib/api'
import { CONFIG } from '@/config'
import { toast } from 'sonner'

export default function AddItemModal({ open: extOpen, onOpenChange: extOnChange, children }) {
  const { state, dispatch } = useApp()
  const [internalOpen, setInternalOpen] = useState(false)
  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('pcs')
  const [threshold, setThreshold] = useState('')

  const open = extOpen ?? internalOpen
  const setOpen = extOnChange ?? setInternalOpen

  function reset() {
    setName('')
    setQty('')
    setUnit('pcs')
    setThreshold('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Item name is required'); return }
    const quantity = parseInt(qty) || 0
    const minThreshold = state.tier !== CONFIG.TIERS.SIMULA ? parseInt(threshold) || 0 : 0

    const item = {
      profile_id: state.profileId,
      name: name.trim(),
      qty: quantity,
      unit,
      min_threshold: minThreshold,
    }
    const { id } = await api.post('/inventory', item)
    dispatch({ type: 'ADD_INVENTORY_ITEM', payload: { id, ...item } })
    toast.success('Item added to inventory')
    setOpen(false)
    reset()
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {children ? <DrawerTrigger asChild>{children}</DrawerTrigger> : null}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Inventory Item</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Item Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cooking Oil" maxLength={100}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Quantity</label>
            <input type="number" inputMode="numeric" value={qty} onChange={e => setQty(e.target.value)} placeholder="0"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Unit</label>
            <select value={unit} onChange={e => setUnit(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors bg-white">
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="box">box</option>
              <option value="pack">pack</option>
              <option value="bottle">bottle</option>
              <option value="sachet">sachet</option>
              <option value="liter">liter</option>
            </select>
          </div>

          {state.tier !== CONFIG.TIERS.SIMULA && (
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Min Stock Threshold</label>
              <input type="number" inputMode="numeric" value={threshold} onChange={e => setThreshold(e.target.value)} placeholder="0"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors" />
            </div>
          )}

          <button type="submit"
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-[.98] transition-all">
            Add Item
          </button>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
