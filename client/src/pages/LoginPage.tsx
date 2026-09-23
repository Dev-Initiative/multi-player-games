import { Link, useLocation } from 'react-router'
import type { RedirectState } from '../auth/guards'
import { AuthLayout } from '../features/auth/ui/AuthLayout'
import { LoginForm } from '../features/auth/ui/LoginForm'

export function LoginPage() {
  const location = useLocation()
  const redirected = Boolean((location.state as RedirectState | null)?.from)

  return (
    <AuthLayout
      title="Welcome back"
      subtitle={redirected ? 'Log in to get back to your game.' : 'Your games are waiting for you.'}
      footer={
        <>
          New here?{' '}
          <Link to="/register" state={location.state} className="font-bold text-brand-300 hover:text-brand-200">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}
