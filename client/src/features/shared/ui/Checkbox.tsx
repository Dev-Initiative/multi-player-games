import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../../lib/cn'

type CheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
}

export function Checkbox({ checked, onChange, children }: CheckboxProps) {
  return (
    <label className="group inline-flex cursor-pointer items-center gap-3 font-semibold select-none">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        aria-hidden
        className={cn(
          'grid size-6 shrink-0 place-items-center rounded-lg transition-colors',
          'peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-300',
          checked
            ? 'bg-lime text-night-950 shadow-[0_2px_0_var(--color-lime-deep),inset_0_1px_0_rgb(255_255_255/0.4)]'
            : 'bg-night-950 shadow-[inset_0_2px_3px_rgb(0_0_0/0.5)] ring-2 ring-white/10 group-hover:ring-white/20',
        )}
      >
        {checked && <Check className="size-4 animate-pop" strokeWidth={3.5} />}
      </span>
      {children}
    </label>
  )
}
