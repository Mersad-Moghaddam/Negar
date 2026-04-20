import { PropsWithChildren } from 'react'
import { BrowserRouter } from 'react-router-dom'

import { I18nProvider } from '../shared/i18n/i18n-provider'
import { AppQueryProvider } from '../shared/query/query-provider'
import { ToastProvider } from '../shared/toast/toast-provider'
import { ThemeProvider } from '../theme/theme-provider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppQueryProvider>
          <ToastProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </ToastProvider>
        </AppQueryProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
