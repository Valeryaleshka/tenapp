import { type ChangeEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  useDeleteTenantMutation,
  useTenantQuery,
  useUpdateTenantMutation,
} from '../../services/tenants/tenant.queries.ts'

export function TenantDetailPage() {
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

  if (tenantQuery.isLoading) {
    return (
      <div className="py-4">
        <div
          className="spinner-border text-primary"
          role="status"
          aria-label="Loading tenant details"
        />
      </div>
    )
  }

  if (tenantQuery.isError || !tenant) {
    return (
      <div className="py-4">
        <div className="alert alert-warning">Tenant not found or has been deleted.</div>
        <Link to="/tenants" className="btn btn-secondary">
          Back to Tenants
        </Link>
      </div>
    )
  }

  return (
    <div className="py-4 container">
      <div className="page-toolbar d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0 page-title">Tenant Details</h1>
        <div className="d-flex gap-2">
          <Link to="/tenants" className="btn btn-secondary">
            Back
          </Link>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              resetEditForm()
              setShowEditModal(true)
            }}
          >
            Edit
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
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
        </div>
      </div>

      {showEditModal && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Tenant</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => {
                      resetEditForm()
                      setError(null)
                      setShowEditModal(false)
                    }}
                  />
                </div>
                <div className="modal-body">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <form>
                    <div className="mb-3">
                      <label htmlFor="edit-tenant-firstName" className="form-label">
                        First Name
                      </label>
                      <input
                        id="edit-tenant-firstName"
                        className="form-control"
                        type="text"
                        name="firstName"
                        value={editForm.firstName}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="edit-tenant-lastName" className="form-label">
                        Last Name
                      </label>
                      <input
                        id="edit-tenant-lastName"
                        className="form-control"
                        type="text"
                        name="lastName"
                        value={editForm.lastName}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="edit-tenant-phoneNumber" className="form-label">
                        Phone Number
                      </label>
                      <input
                        id="edit-tenant-phoneNumber"
                        className="form-control"
                        type="text"
                        name="phoneNumber"
                        value={editForm.phoneNumber}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="edit-tenant-email" className="form-label">
                        Email
                      </label>
                      <input
                        id="edit-tenant-email"
                        className="form-control"
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                      />
                    </div>
                  </form>
                </div>
                <div className="modal-footer d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => void handleDelete()}
                    disabled={updateTenantMutation.isPending || deleteTenantMutation.isPending}
                  >
                    {deleteTenantMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        resetEditForm()
                        setError(null)
                        setShowEditModal(false)
                      }}
                      disabled={updateTenantMutation.isPending || deleteTenantMutation.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => void handleSave()}
                      disabled={updateTenantMutation.isPending || deleteTenantMutation.isPending}
                    >
                      {updateTenantMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            onClick={() => {
              resetEditForm()
              setError(null)
              setShowEditModal(false)
            }}
          />
        </>
      )}
    </div>
  )
}
