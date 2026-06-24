import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useApp } from '@/context/AppContext'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function AddGoalModal({ open: extOpen, onOpenChange: extOnChange, children }) {
  const { state, dispatch } = useApp()
  const [internalOpen, setInternalOpen] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [deadline, setDeadline] = useState('')

  const open = extOpen ?? internalOpen
  const setOpen = extOnChange ?? setInternalOpen

  function reset() { setName(''); setAmount(''); setDeadline('') }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Goal name is required'); return }
    const target = parseInt(amount)
    if (!target || target <= 0) { toast.error('Enter a valid target amount'); return }
    if (!deadline) { toast.error('Deadline is required'); return }
    const data = { profile_id: state.profileId, name: name.trim(), target_amt: target, deadline }
    const { id } = await api.post('/goals', data)
    dispatch({ type: 'ADD_GOAL', payload: { id, ...data } })
    toast.success('Goal set')
    setOpen(false)
    reset()
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent>
        <DrawerHeader><DrawerTitle>Set Financial Goal</DrawerTitle></DrawerHeader>
        <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Goal Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Save ₱50,000 by December" maxLength={150}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Target Amount (₱)</label>
            <input type="number" step="100" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="50000"
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Deadline</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors" />
          </div>
          <button type="submit"
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-[.98] transition-all">
            Set Goal
          </button>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
