import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { useAuth } from '../../common/hooks/useAuth.ts'
import './settings-page.css'

interface SettingsForm {
  firstName: string
  secondName: string
  email: string
  phoneNumber: string
}

interface SettingsFormErrors {
  firstName?: string
  secondName?: string
  email?: string
  phoneNumber?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const allowedLogoTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const maxLogoBytes = 2 * 1024 * 1024

export function SettingsPage() {
  const { user, updateAccount, uploadLogo } = useAuth()
  const [formData, setFormData] = useState<SettingsForm>({
    firstName: user?.firstName ?? '',
    secondName: user?.secondName ?? user?.lastName ?? '',
    email: user?.email ?? '',
    phoneNumber: user?.phoneNumber ?? '',
  })
  const [formErrors, setFormErrors] = useState<SettingsFormErrors>({})
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)

  useEffect(() => {
    setFormData({
      firstName: user?.firstName ?? '',
      secondName: user?.secondName ?? user?.lastName ?? '',
      email: user?.email ?? '',
      phoneNumber: user?.phoneNumber ?? '',
    })
  }, [user])

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl)
      }
    }
  }, [logoPreviewUrl])

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    setLogoError(null)

    if (!file) {
      return
    }

    if (!allowedLogoTypes.includes(file.type)) {
      setLogoFile(null)
      setLogoPreviewUrl(null)
      setLogoError('Logo must be a JPG, PNG, WebP, or GIF image.')
      return
    }

    if (file.size > maxLogoBytes) {
      setLogoFile(null)
      setLogoPreviewUrl(null)
      setLogoError('Logo must be 2 MB or less.')
      return
    }

    setLogoFile(file)
    setLogoPreviewUrl(URL.createObjectURL(file))
  }

  const validate = (values: SettingsForm): SettingsFormErrors => {
    const nextErrors: SettingsFormErrors = {}
    const firstName = values.firstName.trim()
    const secondName = values.secondName.trim()
    const email = values.email.trim()
    const phoneNumber = values.phoneNumber.trim()

    if (!firstName) {
      nextErrors.firstName = 'Enter first name.'
    } else if (firstName.length > 100) {
      nextErrors.firstName = 'First name must be 100 characters or less.'
    }

    if (!secondName) {
      nextErrors.secondName = 'Enter last name.'
    } else if (secondName.length > 100) {
      nextErrors.secondName = 'Last name must be 100 characters or less.'
    }

    if (!email) {
      nextErrors.email = 'Enter email.'
    } else if (!emailPattern.test(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (phoneNumber.length > 30) {
      nextErrors.phoneNumber = 'Phone number must be 30 characters or less.'
    }

    return nextErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const nextErrors = validate(formData)
    setFormErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const phoneNumber = formData.phoneNumber.trim()

    setIsSubmitting(true)
    try {
      await updateAccount({
        firstName: formData.firstName.trim(),
        secondName: formData.secondName.trim(),
        email: formData.email.trim(),
        phoneNumber: phoneNumber ? phoneNumber : null,
      })

      if (logoFile) {
        await uploadLogo(logoFile)
        setLogoFile(null)
        setLogoPreviewUrl(null)
      }

      setSuccess(logoFile ? 'Account settings and logo saved.' : 'Account settings saved.')
    } catch {
      setError('Could not save account settings. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0 page-title">Settings</h1>
      </div>

      <div className="settings-panel">
        <div className="settings-section">
          <h2 className="h5 mb-1">Account</h2>
          <p className="text-muted mb-4">Update your account details.</p>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <div className="settings-logo-section">
            <div className="settings-logo-preview" aria-label="Current account logo">
              {logoPreviewUrl || user?.logoUrl ? (
                <img
                  src={logoPreviewUrl ?? user?.logoUrl ?? ''}
                  alt="Account logo"
                  className="settings-logo-image"
                />
              ) : (
                <span>{(user?.firstName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}</span>
              )}
            </div>

            <div className="settings-logo-controls">
              <Form.Label htmlFor="settings-logo" className="fw-semibold">
                Logo
              </Form.Label>
              <Form.Control
                id="settings-logo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={isSubmitting}
                onChange={handleLogoChange}
              />
              <Form.Text muted>JPG, PNG, WebP, or GIF, up to 2 MB.</Form.Text>
              {logoError && (
                <Alert className="mt-3 mb-0" variant="danger">
                  {logoError}
                </Alert>
              )}
              {logoFile && !logoError && (
                <Alert className="mt-3 mb-0" variant="info">
                  Logo selected.
                </Alert>
              )}
            </div>
          </div>

          <Form onSubmit={handleSubmit} noValidate>
            <div className="settings-form-grid">
              <Form.Group className="mb-3" controlId="settings-first-name">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  id="settings-first-name"
                  type="text"
                  required
                  maxLength={100}
                  value={formData.firstName}
                  isInvalid={Boolean(formErrors.firstName)}
                  aria-invalid={Boolean(formErrors.firstName)}
                  onChange={(event) => {
                    setFormData((prev) => ({ ...prev, firstName: event.target.value }))
                    setFormErrors((prev) => ({ ...prev, firstName: undefined }))
                  }}
                  placeholder="Enter first name"
                />
                <Form.Control.Feedback type="invalid">{formErrors.firstName}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="settings-second-name">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  id="settings-second-name"
                  type="text"
                  required
                  maxLength={100}
                  value={formData.secondName}
                  isInvalid={Boolean(formErrors.secondName)}
                  aria-invalid={Boolean(formErrors.secondName)}
                  onChange={(event) => {
                    setFormData((prev) => ({ ...prev, secondName: event.target.value }))
                    setFormErrors((prev) => ({ ...prev, secondName: undefined }))
                  }}
                  placeholder="Enter last name"
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.secondName}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <Form.Group className="mb-3" controlId="settings-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                id="settings-email"
                type="email"
                required
                value={formData.email}
                isInvalid={Boolean(formErrors.email)}
                aria-invalid={Boolean(formErrors.email)}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, email: event.target.value }))
                  setFormErrors((prev) => ({ ...prev, email: undefined }))
                }}
                placeholder="Enter email"
              />
              <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="settings-phone">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                id="settings-phone"
                type="tel"
                maxLength={30}
                value={formData.phoneNumber}
                isInvalid={Boolean(formErrors.phoneNumber)}
                aria-invalid={Boolean(formErrors.phoneNumber)}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, phoneNumber: event.target.value }))
                  setFormErrors((prev) => ({ ...prev, phoneNumber: undefined }))
                }}
                placeholder="Add phone number"
              />
              <Form.Control.Feedback type="invalid">{formErrors.phoneNumber}</Form.Control.Feedback>
            </Form.Group>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}
