import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

// Errors use the brand red; seats are never red, so red always means "stop".
const TONES: Record<'success' | 'warning' | 'danger' | 'info', [color: string, LucideIcon]> = {
  success: ['var(--color-lime)', CircleCheck],
  warning: ['var(--color-sun)', TriangleAlert],
  danger: ['var(--color-brand-400)', CircleAlert],
  info: ['var(--color-sky)', Info],
}

type ToastProps = {
  tone: keyof typeof TONES
  title: string
  children?: ReactNode
  action?: ReactNode
}

export function Toast({ tone, title, children, action }: ToastProps) {
  const [color, Icon] = TONES[tone]
  return (
    <div
      role="status"
      style={{ '--seat': color } as CSSProperties}
      className="panel flex animate-pop items-center gap-3.5 rounded-2xl p-3 pr-4"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--seat)/15 text-(--seat) ring-1 ring-(--seat)/30">
        <Icon className="size-5" strokeWidth={2.5} aria-hidden />
      </span>
      <div className="min-w-0 flex-1 leading-snug">
        <div className="font-bold">{title}</div>
        {children && <div className="text-sm text-night-300">{children}</div>}
      </div>
      {action}
    </div>
  )
}
