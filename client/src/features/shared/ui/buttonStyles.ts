import { cn } from '../../../lib/cn'

const VARIANTS = {
  primary: 'bg-brand-500 text-white [--press-edge:var(--color-brand-700)] hover:brightness-110',
  secondary: 'bg-night-600 text-night-50 [--press-edge:var(--color-night-800)] hover:bg-night-500',
  tangerine: 'bg-tangerine text-night-950 [--press-edge:var(--color-tangerine-deep)] hover:brightness-105',
  sun: 'bg-sun text-night-950 [--press-edge:var(--color-sun-deep)] hover:brightness-105',
  sky: 'bg-sky text-night-950 [--press-edge:var(--color-sky-deep)] hover:brightness-105',
  lime: 'bg-lime text-night-950 [--press-edge:var(--color-lime-deep)] hover:brightness-105',
  ghost: 'text-night-200 hover:bg-white/8 hover:text-white',
} as const

const SIZES = {
  sm: 'h-9 gap-1.5 rounded-xl px-3.5 text-sm [--press-depth:3px] [&_svg]:size-4',
  md: 'h-12 gap-2 rounded-2xl px-5 text-base [--press-depth:4px] [&_svg]:size-5',
  lg: 'h-15 gap-2.5 rounded-[1.25rem] px-8 text-xl [--press-depth:6px] [&_svg]:size-6',
} as const

const SQUARE = { sm: 'w-9 px-0', md: 'w-12 px-0', lg: 'w-15 px-0' } as const

export type ButtonVariant = keyof typeof VARIANTS
export type ButtonSize = keyof typeof SIZES

type ButtonStyleOptions = {
  variant?: ButtonVariant
  size?: ButtonSize
  square?: boolean
  className?: string
}

/** Button classes, for elements that must look like a button (e.g. router links). */
export function buttonStyles({ variant = 'primary', size = 'md', square, className }: ButtonStyleOptions = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center font-display font-bold tracking-tight select-none',
    'focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-brand-300',
    'disabled:cursor-not-allowed disabled:opacity-45 disabled:saturate-50',
    variant === 'ghost' ? 'transition-colors' : 'press',
    VARIANTS[variant],
    SIZES[size],
    square && SQUARE[size],
    className,
  )
}
