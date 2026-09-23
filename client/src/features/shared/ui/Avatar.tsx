import { cn } from '../../../lib/cn'
import { seatVars, type Seat } from './seat'

const SIZES = {
  sm: 'size-8 text-xs',
  md: 'size-11 text-base',
  lg: 'size-16 text-2xl',
} as const

type AvatarProps = {
  name: string
  seat: Seat
  size?: keyof typeof SIZES
  /** Glows in the seat color while it is this player's turn. */
  active?: boolean
}

export function Avatar({ name, seat, size = 'md', active }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <span
      title={name}
      style={seatVars(seat)}
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full font-display font-extrabold text-white',
        'bg-linear-to-b from-(--seat) to-(--seat-deep) ring-3 ring-night-900',
        'shadow-[inset_0_2px_0_rgb(255_255_255/0.35)] [text-shadow:0_1px_2px_rgb(0_0_0/0.35)]',
        active && 'animate-glow',
        SIZES[size],
      )}
    >
      {initials}
    </span>
  )
}
