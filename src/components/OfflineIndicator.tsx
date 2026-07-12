import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  if (online) return null

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-gold/40 bg-surface px-4 py-2 text-sm text-gold shadow-lg"
    >
      <WifiOff size={16} />
      Офлайн — уроки и словарь доступны
    </div>
  )
}
