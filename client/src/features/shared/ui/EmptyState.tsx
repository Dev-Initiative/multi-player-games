import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  children?: ReactNode
  action?: ReactNode
}

/** No games yet, no invites, nothing found. */
export function EmptyState({ icon: Icon, title, children, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-white/10 px-6 py-12 text-center">
      <span className="mb-5 grid size-16 animate-float place-items-center rounded-2xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-400/30">
        <Icon className="size-8" strokeWidth={2.25} aria-hidden />
      </span>
      <h3 className="text-2xl font-extrabold">{title}</h3>
      {children && <p className="mt-2 max-w-sm text-night-300">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
