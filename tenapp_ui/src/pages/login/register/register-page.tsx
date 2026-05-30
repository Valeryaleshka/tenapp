import { useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../common/hooks/useAuth.ts'
import type { RegisterPayload } from '../../../context/auth/services/authService.ts'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterPayload>({
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      secondName: '',
    },
  })

  const onSubmit: SubmitHandler<RegisterPayload> = async (formData) => {
    setError(null)

    try {
      await register({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        secondName: formData.secondName.trim(),
      })
      navigate('/properties', { replace: true })
    } catch {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h1 className="h5 mb-3">Register</h1>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Form.Group className="mb-3" controlId="firstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              id="firstName"
              type="text"
              isInvalid={Boolean(errors.firstName)}
              aria-invalid={Boolean(errors.firstName)}
              {...registerField('firstName', {
                validate: (value) => value.trim().length > 0 || 'First name is required.',
                onChange: () => setError(null),
              })}
              placeholder="Enter first name"
            />
            <Form.Control.Feedback type="invalid">
              {errors.firstName?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="secondName">
            <Form.Label>Second Name</Form.Label>
            <Form.Control
              id="secondName"
              type="text"
              isInvalid={Boolean(errors.secondName)}
              aria-invalid={Boolean(errors.secondName)}
              {...registerField('secondName', {
                validate: (value) => value.trim().length > 0 || 'Second name is required.',
                onChange: () => setError(null),
              })}
              placeholder="Enter second name"
            />
            <Form.Control.Feedback type="invalid">
              {errors.secondName?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="registerEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              id="registerEmail"
              type="email"
              isInvalid={Boolean(errors.email)}
              aria-invalid={Boolean(errors.email)}
              {...registerField('email', {
                required: 'Email is required.',
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

          <Form.Group className="mb-3" controlId="registerPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              id="registerPassword"
              type="password"
              isInvalid={Boolean(errors.password)}
              aria-invalid={Boolean(errors.password)}
              {...registerField('password', {
                validate: (value) => value.trim().length > 0 || 'Password is required.',
                onChange: () => setError(null),
              })}
              placeholder="Choose password"
            />
            <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" disabled={isSubmitting} className="w-100">
            {isSubmitting ? 'Creating account...' : 'Register'}
          </Button>
        </Form>

        <div className="mt-3 text-center">
          Already have an account?{' '}
          <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
            Login
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}
