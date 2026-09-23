import { AtSign, Rocket, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../../../auth/context'
import { validatePassword, validateUsername } from '../../../auth/validation'
import { ApiError } from '../../../lib/api'
import { Avatar } from '../../shared/ui/Avatar'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { PasswordInput } from '../../shared/ui/PasswordInput'
import { colorFor } from '../../shared/ui/seat'
import { Toast } from '../../shared/ui/Toast'

type Field = 'username' | 'password' | 'confirm'

export function RegisterForm() {
  const { register } = useAuth()
  const [values, setValues] = useState<Record<Field, string>>({ username: '', password: '', confirm: '' })
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)
  const [takenUsername, setTakenUsername] = useState<string>()
  const [formError, setFormError] = useState<string>()

  const errors: Partial<Record<Field, string>> = {
    username:
      validateUsername(values.username) ??
      (takenUsername && values.username.toLowerCase() === takenUsername ? 'That username is taken' : undefined),
    password: validatePassword(values.password),
    confirm: !values.confirm
      ? 'Type your password again'
      : values.confirm !== values.password
        ? "Passwords don't match"
        : undefined,
  }

  // Errors appear once a field has been left, or on submit, never mid-typing.
  const shown = (field: Field) => (submitted || touched[field] ? errors[field] : undefined)

  const field = (name: Field) => ({
    name,
    value: values[name],
    onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [name]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
    error: shown(name),
  })

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setFormError(undefined)
    if (errors.username || errors.password || errors.confirm) return

    setPending(true)
    try {
      await register(values.username, values.password)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) setTakenUsername(values.username.toLowerCase())
      else setFormError(error instanceof ApiError ? error.message : 'Something went wrong. Try again.')
      setPending(false)
    }
  }

  const validName = !validateUsername(values.username)

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && <Toast tone="danger" title="Couldn't create your account">{formError}</Toast>}

      <Input
        {...field('username')}
        label="Username"
        icon={AtSign}
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus
        maxLength={20}
        placeholder="ada_lovelace"
        hint="3–20 letters, numbers or _. This is how friends invite you."
        trailing={validName && <Avatar name={values.username} seat={colorFor(values.username)} size="sm" />}
      />
      <PasswordInput
        {...field('password')}
        label="Password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        showStrength
      />
      <PasswordInput
        {...field('confirm')}
        label="Confirm password"
        icon={ShieldCheck}
        autoComplete="new-password"
        placeholder="Same again"
      />

      <Button type="submit" size="lg" variant="lime" icon={Rocket} loading={pending} className="mt-2 w-full">
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}
