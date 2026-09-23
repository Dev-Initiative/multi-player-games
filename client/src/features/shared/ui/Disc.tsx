import type { CSSProperties } from 'react'
import { cn } from '../../../lib/cn'
import { seatVars, type Seat } from './seat'

type DiscProps = {
  seat: Seat
  className?: string
  style?: CSSProperties
}

/** A glossy game piece: Connect 4 disc, Dots and Boxes marker, token. */
export function Disc({ seat, className, style }: DiscProps) {
  return (
    <span
      aria-hidden
      className={cn('block aspect-square rounded-full', className)}
      style={{
        ...seatVars(seat),
        background: [
          'radial-gradient(circle at 32% 26%, rgb(255 255 255 / 0.65) 0 10%, transparent 34%)',
          'radial-gradient(circle at 50% 50%, transparent 52%, rgb(0 0 0 / 0.14) 54%, transparent 60%)',
          'radial-gradient(circle at 50% 40%, var(--seat) 55%, var(--seat-deep) 100%)',
        ].join(','),
        boxShadow: 'inset 0 -3px 0 rgb(0 0 0 / 0.22), 0 2px 4px rgb(0 0 0 / 0.35)',
        ...style,
      }}
    />
  )
}
