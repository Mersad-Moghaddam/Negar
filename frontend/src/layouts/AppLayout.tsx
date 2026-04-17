import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { DesktopSidebar } from './components/desktop-sidebar'
import { MobileDrawer } from './components/mobile-drawer'
import { MobileHeader } from './components/mobile-header'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpen(false)
      }
    }

    if (desktopQuery.matches) {
      setOpen(false)
    }

    desktopQuery.addEventListener('change', onDesktop)
    return () => desktopQuery.removeEventListener('change', onDesktop)
  }, [])

  return (
    <div className="app-shell">
      <div className="container mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-3 px-3 pb-4 pt-[4.9rem] sm:px-4 sm:pb-4 sm:pt-[5rem] lg:grid-cols-[268px_minmax(0,1fr)] lg:gap-5 lg:px-6 lg:py-5">
        <MobileDrawer open={open} onClose={() => setOpen(false)} />
        <DesktopSidebar />

        <main className="min-w-0 space-y-4 pb-6 page-enter lg:space-y-5 lg:pb-8">
          <MobileHeader onMenuClick={() => setOpen(true)} />
          {children}
        </main>
      </div>
    </div>
  )
}
