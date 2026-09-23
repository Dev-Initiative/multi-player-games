import { cn } from '../../../lib/cn'

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 font-semibold select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-8 w-14 rounded-full shadow-[inset_0_2px_4px_rgb(0_0_0/0.45)] transition-colors duration-200',
          'focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-300',
          checked ? 'bg-lime' : 'bg-night-700',
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 size-6 rounded-full bg-white shadow-[0_2px_0_rgb(0_0_0/0.25),inset_0_-2px_0_rgb(0_0_0/0.1)]',
            'transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            checked && 'translate-x-6',
          )}
        />
      </button>
      {label}
    </label>
  )
}
