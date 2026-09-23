import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './context'

export type RedirectState = { from?: string }

/** Routes that need a player. Sends guests to /login and back afterwards. */
export function RequireAuth() {
  const { session } = useAuth()
  const location = useLocation()
  if (!session) {
    const state: RedirectState = { from: location.pathname + location.search }
    return <Navigate to="/login" replace state={state} />
  }
  return <Outlet />
}

/** Login and register. A player who is already signed in skips past them. */
export function GuestOnly() {
  const { session } = useAuth()
  const location = useLocation()
  if (session) {
    const from = (location.state as RedirectState | null)?.from
    return <Navigate to={from ?? '/'} replace />
  }
  return <Outlet />
}
