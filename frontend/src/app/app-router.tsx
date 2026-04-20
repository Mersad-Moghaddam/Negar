import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'

import { Card } from '../components/ui/card'
import AppLayout from '../layouts/AppLayout'
import { Protected } from '../utils/hooks'

const Landing = lazy(() => import('../pages/AuthPages').then((m) => ({ default: m.Landing })))
const Login = lazy(() => import('../pages/AuthPages').then((m) => ({ default: m.Login })))
const Register = lazy(() => import('../pages/AuthPages').then((m) => ({ default: m.Register })))
const Dashboard = lazy(() => import('../pages/AppPages').then((m) => ({ default: m.Dashboard })))
const Coach = lazy(() => import('../pages/AppPages').then((m) => ({ default: m.Coach })))
const Library = lazy(() => import('../pages/AppPages').then((m) => ({ default: m.Library })))
const Reading = lazy(() => import('../pages/AppPages').then((m) => ({ default: m.Reading })))
const Finished = lazy(() => import('../pages/AppPages').then((m) => ({ default: m.Finished })))
const Next = lazy(() => import('../pages/AppPages').then((m) => ({ default: m.Next })))
const Wishlist = lazy(() => import('../pages/AppPages').then((m) => ({ default: m.Wishlist })))
const BookDetails = lazy(() =>
  import('../pages/AppPages').then((m) => ({ default: m.BookDetails }))
)
const Profile = lazy(() => import('../pages/AppPages').then((m) => ({ default: m.Profile })))

const protectedRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/coach', element: <Coach /> },
  { path: '/library', element: <Library /> },
  { path: '/reading', element: <Reading /> },
  { path: '/finished', element: <Finished /> },
  { path: '/next', element: <Next /> },
  { path: '/wishlist', element: <Wishlist /> },
  { path: '/profile', element: <Profile /> }
] as const

function PageLoader() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <Card className="p-8 text-sm text-mutedForeground">Loading page…</Card>
    </div>
  )
}

function ProtectedAppShell({ children }: { children: ReactNode }) {
  return (
    <Protected>
      <AppLayout>{children}</AppLayout>
    </Protected>
  )
}

function BookDetailsRoute() {
  const { id = '' } = useParams()
  return <BookDetails id={id} />
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {protectedRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<ProtectedAppShell>{route.element}</ProtectedAppShell>}
          />
        ))}
        <Route
          path="/books/:id"
          element={
            <ProtectedAppShell>
              <BookDetailsRoute />
            </ProtectedAppShell>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
