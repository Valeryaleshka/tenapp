import { useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../../../context/auth/services/authService.ts'

interface ForgotPasswordFormValues {
  email: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: '',
    },
  })

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async ({ email }) => {
    setError(null)
    setSuccess(null)

    try {
      await AuthService.forgotPassword(email.trim())
      setSuccess('If the email exists, reset instructions were sent.')
    } catch {
      setError('Failed to request password reset.')
    }
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h1 className="h5 mb-3">Reset Password</h1>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Form.Group className="mb-3" controlId="forgot-email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              id="forgot-email"
              type="email"
              isInvalid={Boolean(errors.email)}
              aria-invalid={Boolean(errors.email)}
              {...register('email', {
                required: 'Email is required.',
                pattern: {
                  value: emailPattern,
                  message: 'Enter a valid email address.',
                },
                onChange: () => {
                  setError(null)
                  setSuccess(null)
                },
              })}
              placeholder="Enter your email"
            />
            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" disabled={isSubmitting} className="w-100">
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </Button>
        </Form>

        <div className="mt-3 text-center">
          <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
            Back to login
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}
