import { Outlet, ScrollRestoration } from 'react-router'
import { Cursor } from './Cursor'

/**
 * Wraps every route. ScrollRestoration sends new pages to the top, restores
 * the old position on back/forward, and scrolls to #hash targets.
 */
export function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
      <Cursor />
    </>
  )
}
