import { cn } from '../../../lib/cn'
import { Disc } from './Disc'
import { SEATS } from './seat'

type LoaderProps = {
  label?: string
  size?: 'sm' | 'md'
}

/** Bouncing seat discs. Use for anything slower than a button press. */
export function Loader({ label = 'Loading', size = 'md' }: LoaderProps) {
  return (
    <div role="status" className="inline-flex flex-col items-center gap-3">
      <div className={cn('flex items-end', size === 'sm' ? 'gap-1' : 'gap-2')}>
        {SEATS.map((seat, i) => (
          <Disc
            key={seat}
            seat={seat}
            className={cn('animate-bounce', size === 'sm' ? 'size-3' : 'size-5')}
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
      <span className={size === 'sm' ? 'sr-only' : 'text-sm font-semibold text-night-300'}>{label}</span>
    </div>
  )
}
