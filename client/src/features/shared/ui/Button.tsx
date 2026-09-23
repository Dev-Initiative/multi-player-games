import { LoaderCircle, type LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { buttonStyles, type ButtonSize, type ButtonVariant } from './buttonStyles'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  /** Icon-only button; pass `aria-label`. */
  square?: boolean
  /** Shows a spinner in place of the icon and blocks clicks. */
  loading?: boolean
}

export function Button({
  variant,
  size,
  icon: Icon,
  square,
  loading,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, square, className })}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="animate-spin" strokeWidth={2.75} aria-hidden />
      ) : (
        Icon && <Icon strokeWidth={2.5} aria-hidden />
      )}
      {children}
    </button>
  )
}
