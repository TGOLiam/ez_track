import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useApp } from '@/context/AppContext'
import { api } from '@/lib/api'
import { CONFIG } from '@/config'
import { toast } from 'sonner'

export default function LogTransactionModal({ open: extOpen, onOpenChange: extOnChange, children }) {
  const { state, dispatch } = useApp()
  const [internalOpen, setInternalOpen] = useState(false)
  const [txType, setTxType] = useState(CONFIG.TX.INCOME)
  const [amt, setAmt] = useState('')
  const [desc, setDesc] = useState('')
  const [cat, setCat] = useState('')

  const open = extOpen ?? internalOpen
  const setOpen = extOnChange ?? setInternalOpen

  function reset() {
    setTxType(CONFIG.TX.INCOME)
    setAmt('')
    setDesc('')
    setCat('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const amount = parseFloat(amt)
    if (!amount || amount <= 0) { toast.error('Please enter a valid amount'); return }
    if (!desc.trim()) { toast.error('Please add a description'); return }

    const now = new Date()
    const tx = {
      profile_id: state.profileId,
      type: txType,
      desc: desc.trim(),
      amt: amount,
      date: now.toISOString().slice(0, 10),
      cat: state.tier !== CONFIG.TIERS.SIMULA ? cat || '' : '',
      time: now.toLocaleTimeString(CONFIG.LOCALE, { hour: 'numeric', minute: '2-digit' }),
    }
    const { id } = await api.post('/transactions', tx)
    dispatch({ type: 'ADD_TRANSACTION', payload: { id, ...tx } })
    toast.success('Transaction saved')
    setOpen(false)
    reset()
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {children ? <DrawerTrigger asChild>{children}</DrawerTrigger> : null}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Log Transaction</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setTxType(CONFIG.TX.INCOME)}
              className={`flex-1 py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${txType === CONFIG.TX.INCOME ? 'bg-blue-50 border-blue-500 text-blue-800' : 'border-gray-200 text-gray-600'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg>
              Money In
            </button>
            <button type="button" onClick={() => setTxType(CONFIG.TX.EXPENSE)}
              className={`flex-1 py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${txType === CONFIG.TX.EXPENSE ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-200 text-gray-600'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /></svg>
              Money Out
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Amount</label>
            <input type="number" step="0.01" inputMode="decimal" value={amt} onChange={e => setAmt(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Description</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Store sales" maxLength={200}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors" />
          </div>

          {state.tier !== CONFIG.TIERS.SIMULA && (
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Category</label>
              <select value={cat} onChange={e => setCat(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors bg-white">
                <option value="">Select category</option>
                <option value="Supplies">Supplies</option>
                <option value="Labor">Labor</option>
                <option value="Utilities">Utilities</option>
                <option value="Rent">Rent</option>
                <option value="Transportation">Transportation</option>
                <option value="Marketing">Marketing</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
          )}

          <button type="submit"
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-[.98] transition-all">
            Save Transaction
          </button>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
