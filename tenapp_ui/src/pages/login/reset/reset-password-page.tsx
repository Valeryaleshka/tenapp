import { useState } from 'react'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AuthService,
  type ResetPasswordPayload,
} from '../../../context/auth/services/authService.ts'

type ResetPasswordFormValues = Omit<ResetPasswordPayload, 'token'>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      email: '',
      newPassword: '',
    },
  })

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async ({ email, newPassword }) => {
    setError(null)
    setSuccess(null)

    if (!token) {
      setError('Reset token is missing or invalid.')
      return
    }

    try {
      await AuthService.resetPassword({
        email: email.trim(),
        token,
        newPassword,
      })
      setSuccess('Password reset successful. You can now sign in.')
    } catch {
      setError('Failed to reset password.')
    }
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h1 className="h5 mb-3">Set New Password</h1>
        {!token && <Alert variant="warning">Token was not found in the URL.</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Form.Group className="mb-3" controlId="resetEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              id="resetEmail"
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

          <Form.Group className="mb-3" controlId="newPassword">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              id="newPassword"
              type="password"
              isInvalid={Boolean(errors.newPassword)}
              aria-invalid={Boolean(errors.newPassword)}
              {...register('newPassword', {
                validate: (value) => value.trim().length > 0 || 'New password is required.',
                onChange: () => {
                  setError(null)
                  setSuccess(null)
                },
              })}
              placeholder="Enter new password"
            />
            <Form.Control.Feedback type="invalid">
              {errors.newPassword?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" disabled={isSubmitting || !token} className="w-100">
            {isSubmitting ? 'Resetting...' : 'Reset password'}
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
