import { type ChangeEvent, type FormEvent, useState } from 'react'
import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { type PropertyUpsertPayload } from '../services/property.interfaces.ts'
import { useAddPropertyMutation } from '../services/property.queries.ts'
import { TenantAssignmentSelect } from './tenant-assignment-select.tsx'

interface AddPropertyProps {
  show: boolean
  onHide: () => void
}

export function AddProperty({ show, onHide }: AddPropertyProps) {
  const initialFormData: PropertyUpsertPayload = {
    name: '',
    type: '',
    address: '',
    price: 0,
    level: 1,
    tenantId: null,
    startDate: '',
    endDate: '',
  }

  const [formData, setFormData] = useState<PropertyUpsertPayload>({
    ...initialFormData,
  })
  const addPropertyMutation = useAddPropertyMutation()
  const [error, setError] = useState<string | null>(null)

  const handleTextChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'level' || name === 'price'
          ? Number(value)
          : name === 'tenantId'
            ? value || null
            : value,
    }))
  }

  const submitAdd = async () => {
    setError(null)

    try {
      await addPropertyMutation.mutateAsync(formData)
      setFormData(initialFormData)
      onHide()
    } catch {
      setError('Could not add property. Please try again.')
    }
  }

  const handleCloseModal = () => {
    setFormData(initialFormData)
    setError(null)
    onHide()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await submitAdd()
  }

  return (
    <Modal show={show} onHide={handleCloseModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Property</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="property-name">
            <Form.Label>Property Name</Form.Label>
            <Form.Control
              id="property-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleTextChange}
              placeholder="Enter property name"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="property-type">
            <Form.Label>Type</Form.Label>
            <Form.Control
              id="property-type"
              type="text"
              name="type"
              value={formData.type}
              onChange={handleTextChange}
              placeholder="Enter property type"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="property-address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              id="property-address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleTextChange}
              placeholder="Enter property address"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="property-price">
            <Form.Label>Price</Form.Label>
            <Form.Control
              id="property-price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleTextChange}
              min={0}
              step="0.01"
            />
          </Form.Group>
          <Form.Group className="mb-0" controlId="property-level">
            <Form.Label>Level</Form.Label>
            <Form.Control
              id="property-level"
              type="number"
              name="level"
              value={formData.level}
              onChange={handleTextChange}
              min={1}
              max={100}
            />
          </Form.Group>
          <Form.Group className="mb-0" controlId="start-date">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              id="start-date"
              name="startDate"
              value={formData.startDate ?? ''}
              onChange={handleTextChange}
            />
          </Form.Group>

          <Form.Group className="mb-0" controlId="end-date">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              id="end-date"
              name="endDate"
              value={formData.endDate ?? ''}
              onChange={handleTextChange}
            />
          </Form.Group>
          <Form.Group className="mb-0 mt-3" controlId="property-tenantId">
            <Form.Label>Assign Tenant (Optional)</Form.Label>
            <div className="d-flex gap-2">
              <TenantAssignmentSelect
                id="property-tenantId"
                value={formData.tenantId ?? ''}
                onChange={(tenantId) => setFormData((prev) => ({ ...prev, tenantId }))}
              />
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleCloseModal}
          disabled={addPropertyMutation.isPending}
        >
          Cancel
        </Button>
        <Button onClick={() => void submitAdd()} disabled={addPropertyMutation.isPending}>
          {addPropertyMutation.isPending ? 'Adding...' : 'Add Property'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
