import type { ReactNode } from 'react'

/** A titled block of the styles guide. The title doubles as its #anchor. */
export function Section({ title, kicker, children }: { title: string; kicker: string; children: ReactNode }) {
  return (
    <section id={title.toLowerCase()} className="scroll-mt-24 space-y-6">
      <div>
        <div className="text-sm font-bold tracking-widest text-brand-400 uppercase">{kicker}</div>
        <h2 className="text-4xl font-extrabold">{title}</h2>
      </div>
      {children}
    </section>
  )
}

/** Small caps heading inside a section. */
export function Label({ children }: { children: ReactNode }) {
  return <div className="mb-3 text-xs font-bold tracking-widest text-night-400 uppercase">{children}</div>
}
