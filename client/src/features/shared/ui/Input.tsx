import { CircleAlert, type LucideIcon } from 'lucide-react'
import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../../lib/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon?: LucideIcon
  hint?: ReactNode
  error?: string
  /** Content inside the field, after the input (e.g. a show-password button). */
  trailing?: ReactNode
  /** Content under the field, above the hint (e.g. a strength meter). */
  below?: ReactNode
}

export function Input({ label, icon: Icon, hint, error, trailing, below, className, id, ...props }: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const messageId = `${inputId}-message`
  const message = error ?? hint

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={inputId} className="block text-sm font-bold text-night-100">
        {label}
      </label>
      <div
        className={cn(
          'flex h-13 items-center gap-3 rounded-2xl bg-night-950/70 px-4 ring-2 transition-[box-shadow,background-color]',
          'shadow-[inset_0_2px_4px_rgb(0_0_0/0.45)] focus-within:bg-night-950',
          error ? 'ring-brand-500/80' : 'ring-white/8 hover:ring-white/15 focus-within:ring-brand-400!',
        )}
      >
        {Icon && (
          <Icon
            aria-hidden
            strokeWidth={2.5}
            className={cn('size-5 shrink-0', error ? 'text-brand-400' : 'text-night-400')}
          />
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className="h-full min-w-0 flex-1 bg-transparent font-semibold text-white outline-none placeholder:font-normal placeholder:text-night-500"
          {...props}
        />
        {trailing}
      </div>
      {below}
      {message && (
        <p
          id={messageId}
          className={cn(
            'flex items-center gap-1.5 text-sm',
            error ? 'animate-pop font-semibold text-brand-400' : 'text-night-400',
          )}
        >
          {error && <CircleAlert className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />}
          {message}
        </p>
      )}
    </div>
  )
}
