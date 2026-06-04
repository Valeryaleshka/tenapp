import { type ChangeEvent, useState } from 'react'
import { Alert, Button, Card, Container, Form, Modal, Spinner } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { type PropertyUpsertPayload } from './services/property.interfaces.ts'
import { getPropertyStatus } from './services/property-status.helpers.ts'
import {
  useDeletePropertyMutation,
  usePropertyQuery,
  useUpdatePropertyMutation,
} from './services/property.queries.ts'
import { TenantAssignmentSelect } from './components/tenant-assignment-select.tsx'
import './components/property-table.css'

export function PropertyDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const propertyQuery = usePropertyQuery(id)
  const updatePropertyMutation = useUpdatePropertyMutation(id)
  const deletePropertyMutation = useDeletePropertyMutation(id)
  const [isDeleted, setIsDeleted] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<PropertyUpsertPayload>({
    name: '',
    type: '',
    address: '',
    price: 0,
    level: 1,
    tenantId: null,
    startDate: null,
    endDate: null,
  })
  const property = isDeleted ? null : propertyQuery.data

  const resetEditForm = () => {
    if (!property) {
      return
    }

    setEditForm({
      name: property.name,
      type: property.type,
      address: property.address,
      price: property.price,
      level: property.level,
      startDate: property.startDate,
      endDate: property.endDate,
      tenantId: property.tenantId ?? null,
    })
  }

  const handleEditChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setEditForm((prev) => ({
      ...prev,
      [name]:
        name === 'price' || name === 'level'
          ? Number(value)
          : name === 'tenantId'
            ? value || null
            : value,
    }))
  }

  const handleSave = async () => {
    if (!id || !property) {
      return
    }

    setError(null)

    try {
      await updatePropertyMutation.mutateAsync(editForm)
      setShowEditModal(false)
    } catch {
      setError('Could not update property. Please try again.')
    }
  }

  const handleCloseEditModal = () => {
    resetEditForm()
    setError(null)
    setShowEditModal(false)
  }

  const handleDelete = async () => {
    if (!id) {
      return
    }

    setError(null)

    try {
      await deletePropertyMutation.mutateAsync()
      setIsDeleted(true)
      setShowEditModal(false)
    } catch {
      setError('Could not delete property. Please try again.')
    }
  }

  if (propertyQuery.isLoading) {
    return (
      <div className="py-4">
        <Spinner
          animation="border"
          variant="primary"
          role="status"
          aria-label="Loading property details"
        />
      </div>
    )
  }

  if (propertyQuery.isError || !property) {
    return (
      <div className="py-4">
        <Alert variant="warning">Property not found or has been deleted.</Alert>
        <Button variant="secondary" onClick={() => navigate('/properties')}>
          Back to Properties
        </Button>
      </div>
    )
  }

  const status = getPropertyStatus(property)

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0 page-title">Property Details</h1>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/properties')}>
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
            <strong>Name:</strong> {property.name}
          </div>
          <div>
            <strong>Status:</strong>{' '}
            <span className={status.className} title={status.label} aria-label={status.label} />
          </div>
          <div>
            <strong>Type:</strong> {property.type}
          </div>
          <div>
            <strong>Address:</strong> {property.address}
          </div>
          <div>
            <strong>Price:</strong> {property.price.toLocaleString()}
          </div>
          <div>
            <strong>Level:</strong> {property.level}
          </div>
          <div>
            <strong>Created At:</strong> {new Date(property.createdAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Tenant:</strong>{' '}
            {property.tenantId ? (
              <Link to={`/tenants/${property.tenantId}`}>
                {property.tenantFullName ?? property.tenantId}
              </Link>
            ) : (
              'Unassigned'
            )}
          </div>
          {property.startDate && (
            <div>
              <strong>Start Date:</strong> {new Date(property.startDate).toLocaleDateString()}
            </div>
          )}
          {property.endDate && (
            <div>
              <strong>End Date:</strong> {new Date(property.endDate).toLocaleDateString()}
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Property</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3" controlId="edit-property-name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                id="edit-property-name"
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="edit-property-type">
              <Form.Label>Type</Form.Label>
              <Form.Control
                id="edit-property-type"
                type="text"
                name="type"
                value={editForm.type}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="edit-property-address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                id="edit-property-address"
                type="text"
                name="address"
                value={editForm.address}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="edit-property-price">
              <Form.Label>Price</Form.Label>
              <Form.Control
                id="edit-property-price"
                type="number"
                name="price"
                min={0}
                step="0.01"
                value={editForm.price}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="edit-property-level">
              <Form.Label>Level</Form.Label>
              <Form.Control
                id="edit-property-level"
                type="number"
                name="level"
                min={1}
                max={100}
                value={editForm.level}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group className="mb-0" controlId="edit-start-date">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                id="edit-start-date"
                name="startDate"
                value={editForm.startDate ?? ''}
                onChange={handleEditChange}
              />
            </Form.Group>

            <Form.Group className="mb-0" controlId="edit-end-date">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                id="edit-end-date"
                name="endDate"
                value={editForm.endDate ?? ''}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group controlId="edit-property-tenantId">
              <Form.Label>Assign Tenant (Optional)</Form.Label>
              <div className="d-flex gap-2">
                <TenantAssignmentSelect
                  id="edit-property-tenantId"
                  value={editForm.tenantId ?? ''}
                  onChange={(tenantId) => setEditForm((prev) => ({ ...prev, tenantId }))}
                />
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button
            variant="danger"
            onClick={() => void handleDelete()}
            disabled={updatePropertyMutation.isPending || deletePropertyMutation.isPending}
          >
            {deletePropertyMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
          <div className="d-flex gap-2">
            <Button
              variant="secondary"
              onClick={handleCloseEditModal}
              disabled={updatePropertyMutation.isPending || deletePropertyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={updatePropertyMutation.isPending || deletePropertyMutation.isPending}
            >
              {updatePropertyMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
