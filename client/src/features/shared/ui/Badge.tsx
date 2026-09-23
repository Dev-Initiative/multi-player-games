import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../../lib/cn'

const TONES = {
  neutral: 'bg-white/8 text-night-200 ring-white/10',
  brand: 'bg-brand-500/20 text-brand-300 ring-brand-500/50',
  tangerine: 'bg-tangerine/15 text-tangerine ring-tangerine/40',
  sun: 'bg-sun/15 text-sun ring-sun/40',
  sky: 'bg-sky/15 text-sky ring-sky/40',
  lime: 'bg-lime/15 text-lime ring-lime/40',
  gold: 'bg-gold/15 text-gold ring-gold/40',
} as const

type BadgeProps = {
  tone?: keyof typeof TONES
  icon?: LucideIcon
  /** Pulsing dot, for live states like "your turn". */
  live?: boolean
  children: ReactNode
}

export function Badge({ tone = 'neutral', icon: Icon, live, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide uppercase ring-1 ring-inset',
        TONES[tone],
      )}
    >
      {live && (
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-current" />
        </span>
      )}
      {Icon && <Icon className="size-3.5" strokeWidth={2.75} aria-hidden />}
      {children}
    </span>
  )
}
