import { type ChangeEvent, type FormEvent, useState } from 'react'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { useAddTenantMutation } from '../services/tenant.queries.ts'

interface AddTenantProps {
  show: boolean
  onHide: () => void
}

interface TenantFormState {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
}

const initialFormState: TenantFormState = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
}

export function AddTenant({ show, onHide }: AddTenantProps) {
  const addTenantMutation = useAddTenantMutation()
  const [formData, setFormData] = useState<TenantFormState>(initialFormState)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleClose = () => {
    setFormData(initialFormState)
    setError(null)
    onHide()
  }

  const submitAdd = async () => {
    setError(null)

    try {
      await addTenantMutation.mutateAsync({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
      })
      setFormData(initialFormState)
      onHide()
    } catch {
      setError('Could not add tenant. Please try again.')
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    await submitAdd()
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Tenant</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="tenant-firstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              id="tenant-firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="tenant-lastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              id="tenant-lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="tenant-phoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              id="tenant-phoneNumber"
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="tenant-email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              id="tenant-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={addTenantMutation.isPending}>
          Cancel
        </Button>
        <Button onClick={() => void submitAdd()} disabled={addTenantMutation.isPending}>
          {addTenantMutation.isPending ? 'Adding...' : 'Add Tenant'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
