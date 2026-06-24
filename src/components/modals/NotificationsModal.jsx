import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'

const NOTIFICATIONS = [
  { title: 'Heartbeat: Weekly Summary', sub: 'You earned ₱6,020 this week. Net: ₱4,820.', icon: 'clock', cls: 'blue' },
  { title: 'Low Stock Alert', sub: 'Canned Sardines is running low (8 left).', icon: 'alert', cls: 'amber' },
  { title: 'Transaction Logged', sub: '₱1,520 online order logged successfully.', icon: 'edit', cls: 'blue' },
]

function Icon({ name, cls }) {
  const paths = {
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    alert: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
    edit: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <path d={paths[name]} />
    </svg>
  )
}

export default function NotificationsModal({ children }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Notifications</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-0 divide-y divide-gray-100">
          {NOTIFICATIONS.map((n, i) => (
            <div key={i} className="flex gap-3 py-3">
              <div className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0 ${
                n.cls === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
              }`}>
                <Icon name={n.icon} cls={n.cls} />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{n.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{n.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
