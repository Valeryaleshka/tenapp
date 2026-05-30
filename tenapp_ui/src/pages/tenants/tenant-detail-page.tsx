import { type ChangeEvent, useState } from 'react'
import { Alert, Button, Card, Container, Form, Modal, Spinner } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  useDeleteTenantMutation,
  useTenantQuery,
  useUpdateTenantMutation,
} from './services/tenant.queries.ts'

export function TenantDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const tenantQuery = useTenantQuery(id)
  const updateTenantMutation = useUpdateTenantMutation(id)
  const deleteTenantMutation = useDeleteTenantMutation(id)
  const [isDeleted, setIsDeleted] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
  })
  const tenant = isDeleted ? null : tenantQuery.data

  const resetEditForm = () => {
    if (!tenant) {
      return
    }

    setEditForm({
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      phoneNumber: tenant.phoneNumber,
      email: tenant.email,
    })
  }

  const handleEditChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!id) {
      return
    }

    setError(null)

    try {
      await updateTenantMutation.mutateAsync({
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        email: editForm.email.trim(),
      })
      setShowEditModal(false)
    } catch {
      setError('Could not update tenant. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!id) {
      return
    }

    setError(null)

    try {
      await deleteTenantMutation.mutateAsync()
      setIsDeleted(true)
      setShowEditModal(false)
    } catch {
      setError('Could not delete tenant. Please try again.')
    }
  }

  const handleCloseEditModal = () => {
    resetEditForm()
    setError(null)
    setShowEditModal(false)
  }

  if (tenantQuery.isLoading) {
    return (
      <div className="py-4">
        <Spinner
          animation="border"
          variant="primary"
          role="status"
          aria-label="Loading tenant details"
        />
      </div>
    )
  }

  if (tenantQuery.isError || !tenant) {
    return (
      <div className="py-4">
        <Alert variant="warning">Tenant not found or has been deleted.</Alert>
        <Button variant="secondary" onClick={() => navigate('/tenants')}>
          Back to Tenants
        </Button>
      </div>
    )
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0 page-title">Tenant Details</h1>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/tenants')}>
            Back
          </Button>
          <Button
            type="button"
            onClick={() => {
              resetEditForm()
              setShowEditModal(true)
            }}
          >
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <Card.Body>
          <div>
            <strong>First Name:</strong> {tenant.firstName}
          </div>
          <div>
            <strong>Last Name:</strong> {tenant.lastName}
          </div>
          <div>
            <strong>Phone Number:</strong> {tenant.phoneNumber}
          </div>
          <div>
            <strong>Email:</strong> {tenant.email}
          </div>
          <div>
            <strong>Created At:</strong> {new Date(tenant.createdAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Properties:</strong>{' '}
            {tenant.properties.length === 0
              ? 'Unassigned'
              : tenant.properties.map((property, index) => (
                  <span key={property.id}>
                    {index > 0 ? ', ' : ''}
                    <Link to={`/properties/${property.id}`}>
                      {property.name} - {property.address}
                    </Link>
                  </span>
                ))}
          </div>
        </Card.Body>
      </Card>

      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Tenant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3" controlId="edit-tenant-firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                id="edit-tenant-firstName"
                type="text"
                name="firstName"
                value={editForm.firstName}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="edit-tenant-lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                id="edit-tenant-lastName"
                type="text"
                name="lastName"
                value={editForm.lastName}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="edit-tenant-phoneNumber">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                id="edit-tenant-phoneNumber"
                type="text"
                name="phoneNumber"
                value={editForm.phoneNumber}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group controlId="edit-tenant-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                id="edit-tenant-email"
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button
            variant="danger"
            onClick={() => void handleDelete()}
            disabled={updateTenantMutation.isPending || deleteTenantMutation.isPending}
          >
            {deleteTenantMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              onClick={handleCloseEditModal}
              disabled={updateTenantMutation.isPending || deleteTenantMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={updateTenantMutation.isPending || deleteTenantMutation.isPending}
            >
              {updateTenantMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
