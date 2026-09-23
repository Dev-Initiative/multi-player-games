import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../../lib/cn'
import { Input, type InputProps } from './Input'
import { passwordStrength } from './passwordStrength'

type PasswordInputProps = Omit<InputProps, 'type' | 'trailing' | 'below'> & {
  /** Show a strength meter under the field (for choosing a new password). */
  showStrength?: boolean
}

const LEVELS = [
  { label: 'Too short', bar: 'bg-brand-500', text: 'text-brand-400' },
  { label: 'Weak', bar: 'bg-brand-500', text: 'text-brand-400' },
  { label: 'Okay', bar: 'bg-sun', text: 'text-sun' },
  { label: 'Strong', bar: 'bg-sky', text: 'text-sky' },
  { label: 'Unbeatable', bar: 'bg-lime', text: 'text-lime' },
]

export function PasswordInput({ showStrength, value, icon = Lock, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const password = String(value ?? '')
  const strength = passwordStrength(password)
  const level = LEVELS[strength]

  return (
    <Input
      {...props}
      icon={icon}
      value={value}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="-mr-1.5 grid size-9 shrink-0 place-items-center rounded-xl text-night-400 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-brand-300"
        >
          {visible ? <EyeOff className="size-5" strokeWidth={2.5} /> : <Eye className="size-5" strokeWidth={2.5} />}
        </button>
      }
      below={
        showStrength &&
        password.length > 0 && (
          <div className="flex items-center gap-3" aria-live="polite">
            <div className="grid flex-1 grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className={cn(
                    'h-1.5 rounded-full transition-colors duration-300',
                    strength >= step ? level.bar : 'bg-night-700',
                  )}
                />
              ))}
            </div>
            <span className={cn('w-20 text-right text-xs font-bold', level.text)}>{level.label}</span>
          </div>
        )
      }
    />
  )
}
