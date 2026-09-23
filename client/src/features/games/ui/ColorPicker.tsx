import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '../../../lib/cn'
import { Disc } from '../../shared/ui/Disc'
import { SEATS, type Seat } from '../../shared/ui/seat'

type ColorPickerProps = {
  value: Seat
  onChange: (color: Seat) => void
  label: string
}

/** Pick a piece color from the seat palette. */
export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-3">
      {SEATS.map((seat) => {
        const selected = seat === value
        return (
          <motion.button
            key={seat}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={seat}
            onClick={() => onChange(seat)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'relative grid size-14 place-items-center rounded-2xl transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
              selected ? 'bg-white/10 ring-2 ring-white/60' : 'bg-white/4 ring-1 ring-white/8 hover:bg-white/8',
            )}
          >
            <Disc seat={seat} className="size-10" />
            {selected && (
              <motion.span
                layoutId={`${label}-check`}
                className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-white text-night-950 shadow"
              >
                <Check className="size-3.5" strokeWidth={3.5} />
              </motion.span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
