import type { ReactNode } from 'react'

/** A keyboard key, for shortcut hints. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md bg-night-800 px-1.5 py-0.5 font-mono text-xs text-night-200 ring-1 ring-white/8">
      {children}
    </kbd>
  )
}
