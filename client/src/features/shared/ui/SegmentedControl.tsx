import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../lib/cn'

type Option<T extends string> = { value: T; label: string; icon?: LucideIcon; disabled?: boolean }

type SegmentedControlProps<T extends string> = {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  /** Stretch to the container, splitting the width evenly. */
  fill?: boolean
}

/** Pick one of a few options: game mode, seat count, filter. */
export function SegmentedControl<T extends string>({ options, value, onChange, label, fill }: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'gap-1 rounded-2xl bg-night-950/70 p-1 shadow-[inset_0_2px_4px_rgb(0_0_0/0.45)] ring-1 ring-white/6',
        fill ? 'flex w-full' : 'inline-flex',
      )}
    >
      {options.map(({ value: optionValue, label: optionLabel, icon: Icon, disabled }) => {
        const selected = optionValue === value
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(optionValue)}
            className={cn(
              'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 font-display text-sm font-bold transition-colors',
              'focus-visible:outline-2 focus-visible:outline-brand-300',
              'disabled:cursor-not-allowed disabled:opacity-35',
              fill && 'flex-1',
              selected
                ? 'press bg-night-600 text-white [--press-depth:3px] [--press-edge:var(--color-night-800)]'
                : 'text-night-300 enabled:hover:text-white',
            )}
          >
            {Icon && <Icon className="size-4" strokeWidth={2.5} aria-hidden />}
            {optionLabel}
          </button>
        )
      })}
    </div>
  )
}
