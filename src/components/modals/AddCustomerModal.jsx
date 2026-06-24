import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useApp } from '@/context/AppContext'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function AddCustomerModal({ open: extOpen, onOpenChange: extOnChange, children }) {
  const { state, dispatch } = useApp()
  const [internalOpen, setInternalOpen] = useState(false)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')

  const open = extOpen ?? internalOpen
  const setOpen = extOnChange ?? setInternalOpen

  function reset() { setName(''); setContact('') }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Customer name is required'); return }
    const data = { profile_id: state.profileId, name: name.trim(), contact: contact.trim() }
    const { id } = await api.post('/customers', data)
    dispatch({ type: 'ADD_CUSTOMER', payload: { id, ...data } })
    toast.success('Customer added')
    setOpen(false)
    reset()
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
      <DrawerContent>
        <DrawerHeader><DrawerTitle>Add Customer</DrawerTitle></DrawerHeader>
        <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Customer Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Reyes Canteen" maxLength={150}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Contact</label>
            <input type="text" value={contact} onChange={e => setContact(e.target.value)}
              placeholder="Phone or email" maxLength={200}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors" />
          </div>
          <button type="submit"
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-[.98] transition-all">
            Save Customer
          </button>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
