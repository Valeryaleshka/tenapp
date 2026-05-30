import { useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../common/hooks/useAuth.ts'
import type { LoginPayload } from '../../../context/auth/services/authService.ts'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<LoginPayload> = async (formData) => {
    setError(null)
    try {
      await login({
        password: formData.password,
        email: formData.email.trim(),
      })
      navigate('/properties', { replace: true })
    } catch {
      setError('Login failed. Please check your credentials.')
    }
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h1 className="h5 mb-3">Login</h1>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              id="email"
              type="text"
              isInvalid={Boolean(errors.email)}
              aria-invalid={Boolean(errors.email)}
              {...register('email', {
                required: 'Enter email.',
                pattern: {
                  value: emailPattern,
                  message: 'Enter a valid email address.',
                },
                onChange: () => setError(null),
              })}
              placeholder="Enter email"
            />
            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              id="password"
              type="password"
              isInvalid={Boolean(errors.password)}
              aria-invalid={Boolean(errors.password)}
              {...register('password', {
                validate: (value) => value.trim().length > 0 || 'Password is required.',
                onChange: () => setError(null),
              })}
              placeholder="Enter password"
            />
            <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" disabled={isSubmitting} className="w-100">
            {isSubmitting ? 'Signing in...' : 'Login'}
          </Button>
        </Form>

        <div className="mt-3 text-center">
          No account?{' '}
          <Button variant="link" className="p-0" onClick={() => navigate('/register')}>
            Register
          </Button>
        </div>
        <div className="mt-2 text-center">
          <Button variant="link" className="p-0" onClick={() => navigate('/forgot-password')}>
            Forgot password?
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}
