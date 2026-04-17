import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { ThemeToggle } from '../../components/ThemeToggle'
import { useI18n } from '../../shared/i18n/i18n-provider'
import { LanguageToggle } from '../../widgets/language-toggle/language-toggle'
import { navigationLinks } from '../navigation-config'

import { BrandBlock } from './brand-block'

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useI18n()
  const location = useLocation()
  const active = navigationLinks.find((item) => location.pathname.startsWith(item.to))

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/80 bg-card/95 px-3 pb-3 pt-[max(0.6rem,env(safe-area-inset-top))] shadow-sm backdrop-blur lg:hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground"
            onClick={onMenuClick}
            aria-label={t('nav.workspace')}
          >
            <Menu className="h-5 w-5" />
          </button>
          <BrandBlock compact />
          <ThemeToggle compact />
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-mutedForeground">
            {active ? t(active.labelKey) : t('nav.dashboard')}
          </p>
          <div className="w-[118px] shrink-0">
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
