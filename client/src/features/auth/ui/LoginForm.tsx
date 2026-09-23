import { LogIn, User } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../../../auth/context'
import { ApiError } from '../../../lib/api'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { PasswordInput } from '../../shared/ui/PasswordInput'
import { Toast } from '../../shared/ui/Toast'

function messageFor(error: unknown) {
  if (error instanceof ApiError && error.status === 401) return 'Wrong username or password.'
  if (error instanceof ApiError) return error.message
  return 'Something went wrong. Try again.'
}

export function LoginForm() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string>()

  const errors = {
    username: username.trim() ? undefined : 'Enter your username',
    password: password ? undefined : 'Enter your password',
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setFormError(undefined)
    if (errors.username || errors.password) return

    setPending(true)
    try {
      // On success the GuestOnly guard sends the player on to where they were going.
      await login(username.trim(), password)
    } catch (error) {
      setFormError(messageFor(error))
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && <Toast tone="danger" title="Couldn't log in">{formError}</Toast>}

      <Input
        label="Username"
        icon={User}
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        autoFocus
        placeholder="ada_lovelace"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={submitted ? errors.username : undefined}
      />
      <PasswordInput
        label="Password"
        name="password"
        autoComplete="current-password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={submitted ? errors.password : undefined}
      />

      <Button type="submit" size="lg" icon={LogIn} loading={pending} className="mt-2 w-full">
        {pending ? 'Logging in…' : 'Log in'}
      </Button>
    </form>
  )
}
