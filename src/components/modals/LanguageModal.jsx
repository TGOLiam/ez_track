import { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { toast } from 'sonner'

export default function LanguageModal({ children }) {
  const [lang, setLang] = useState('taglish')

  function handleSelect(l) {
    setLang(l)
    toast.success('Language updated')
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Language / Wika</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-1">
          <button
            onClick={() => handleSelect('taglish')}
            className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-sm">🇵🇭</div>
            <span className="flex-1 text-sm font-semibold text-gray-800 text-left">Taglish</span>
            {lang === 'taglish' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" className="w-4 h-4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
          <button
            onClick={() => handleSelect('english')}
            className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-sm">🇺🇸</div>
            <span className="flex-1 text-sm font-semibold text-gray-800 text-left">English Only</span>
            {lang === 'english' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" className="w-4 h-4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
