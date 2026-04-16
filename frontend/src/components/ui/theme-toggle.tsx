import { Moon, Sun } from 'lucide-react'

import { useI18n } from '../../shared/i18n/i18n-provider'
import { useTheme } from '../../theme/use-theme'

import { Button } from './button'

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const dark = theme === 'dark'

  if (compact) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="h-9 w-9 rounded-lg px-0"
        onClick={toggleTheme}
        aria-label={dark ? t('common.lightMode') : t('common.darkMode')}
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    )
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      className="w-full justify-center"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {dark ? t('common.lightMode') : t('common.darkMode')}
    </Button>
  )
}
