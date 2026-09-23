import { useCallback, useMemo, useState, type ReactNode } from 'react'
import * as api from './api'
import { AuthContext, type AuthValue } from './context'

const STORAGE_KEY = 'session'

// Games last days, so the session survives a closed tab. Storage can be
// unavailable (private mode, blocked site data); then it lasts for the tab.
function loadSession(): api.Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as api.Session) : null
  } catch {
    return null
  }
}

function saveSession(session: api.Session | null) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Keep the in-memory session.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(loadSession)

  const start = useCallback((next: api.Session) => {
    saveSession(next)
    setSession(next)
  }, [])

  const login = useCallback(
    async (username: string, password: string) => start(await api.login({ username, password })),
    [start],
  )

  const register = useCallback(
    async (username: string, password: string) => start(await api.register({ username, password })),
    [start],
  )

  const logout = useCallback(() => {
    saveSession(null)
    setSession(null)
  }, [])

  const value = useMemo<AuthValue>(
    () => ({ session, player: session?.player ?? null, login, register, logout }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
