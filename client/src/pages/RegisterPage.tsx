import { Link, useLocation } from 'react-router'
import { AuthLayout } from '../features/auth/ui/AuthLayout'
import { RegisterForm } from '../features/auth/ui/RegisterForm'

export function RegisterPage() {
  const location = useLocation()

  return (
    <AuthLayout
      title="Join the table"
      subtitle="Pick a username your friends can find you by."
      footer={
        <>
          Already playing?{' '}
          <Link to="/login" state={location.state} className="font-bold text-brand-300 hover:text-brand-200">
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  )
}
