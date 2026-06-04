import { useState } from 'react'
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap'
import { PropertyAssignmentSelect } from '../../properties/components/property-assignment-select.tsx'
import { TenantAssignmentSelect } from '../../properties/components/tenant-assignment-select.tsx'
import {
  useAddTransactionMutation,
  useTransactionCategoriesQuery,
} from '../services/transaction.queries.ts'

interface AddTransactionProps {
  show: boolean
  onHide: () => void
}

interface TransactionFormState {
  propertyId: string | null
  tenantId: string | null
  amount: string
  date: string
  categoryId: string
}

const today = new Date().toISOString().slice(0, 10)

const initialFormState: TransactionFormState = {
  propertyId: null,
  tenantId: null,
  amount: '',
  date: today,
  categoryId: '1',
}

export function AddTransaction({ show, onHide }: AddTransactionProps) {
  const addTransactionMutation = useAddTransactionMutation()
  const categoriesQuery = useTransactionCategoriesQuery()
  const [formData, setFormData] = useState<TransactionFormState>(initialFormState)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    setFormData(initialFormState)
    setError(null)
    onHide()
  }

  const submitAdd = async () => {
    if (!formData.propertyId || !formData.tenantId || !formData.date || !formData.categoryId) {
      setError('Property, tenant, date and category are required.')
      return
    }

    const amount = Number(formData.amount)
    const categoryId = Number(formData.categoryId)
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(categoryId)) {
      setError('Amount must be greater than 0.')
      return
    }

    setError(null)

    try {
      await addTransactionMutation.mutateAsync({
        propertyId: formData.propertyId,
        tenantId: formData.tenantId,
        amount,
        date: new Date(`${formData.date}T00:00:00.000Z`).toISOString(),
        categoryId,
      })
      handleClose()
    } catch (error: unknown) {
      console.error('Failed to add transaction:', error)
      setError('Could not add transaction. Please try again.')
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add Transaction</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3" controlId="transaction-propertyId">
            <Form.Label>Property</Form.Label>
            <PropertyAssignmentSelect
              id="transaction-propertyId"
              value={formData.propertyId}
              onChange={(propertyId) => setFormData((prev) => ({ ...prev, propertyId }))}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="transaction-tenantId">
            <Form.Label>Tenant</Form.Label>
            <TenantAssignmentSelect
              id="transaction-tenantId"
              value={formData.tenantId}
              onChange={(tenantId) => setFormData((prev) => ({ ...prev, tenantId }))}
            />
          </Form.Group>

          <div className="row g-3">
            <div className="col-12 col-md-4">
              <Form.Group controlId="transaction-amount">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  id="transaction-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, amount: event.target.value }))
                  }
                  placeholder="0.00"
                />
              </Form.Group>
            </div>
            <div className="col-12 col-md-4">
              <Form.Group controlId="transaction-date">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  id="transaction-date"
                  type="date"
                  value={formData.date}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, date: event.target.value }))
                  }
                />
              </Form.Group>
            </div>
            <div className="col-12 col-md-4">
              <Form.Group controlId="transaction-categoryId">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  id="transaction-categoryId"
                  value={formData.categoryId}
                  disabled={categoriesQuery.isLoading}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, categoryId: event.target.value }))
                  }
                >
                  {categoriesQuery.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={addTransactionMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={() => void submitAdd()}
          disabled={addTransactionMutation.isPending || categoriesQuery.isLoading}
        >
          {addTransactionMutation.isPending ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Adding...
            </>
          ) : (
            'Add Transaction'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
