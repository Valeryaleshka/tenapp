import { type ChangeEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { tenantService, type Tenant } from '../../services/tenants/tenant.service.ts';

export function TenantDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
    });

    useEffect(() => {
        if (!id) {
            return;
        }

        const load = async () => {
            try {
                setIsLoading(true);
                const data = await tenantService.getById(id);
                setTenant(data);
                setEditForm({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                });
            } catch (error) {
                console.error('Failed to load tenant details:', error);
                setTenant(null);
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, [id]);

    const handleEditChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!id) {
            return;
        }

        try {
            setIsSaving(true);
            const updated = await tenantService.update(id, {
                firstName: editForm.firstName.trim(),
                lastName: editForm.lastName.trim(),
                phoneNumber: editForm.phoneNumber.trim(),
                email: editForm.email.trim(),
            });
            setTenant(updated);
            setShowEditModal(false);
        } catch (error) {
            console.error('Failed to update tenant:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id) {
            return;
        }

        try {
            setIsDeleting(true);
            await tenantService.delete(id);
            setTenant(null);
            setShowEditModal(false);
        } catch (error) {
            console.error('Failed to delete tenant:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="py-4">
                <div className="spinner-border text-primary" role="status" aria-label="Loading tenant details" />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="py-4">
                <div className="alert alert-warning">Tenant not found or has been deleted.</div>
                <Link to="/tenants" className="btn btn-secondary">Back to Tenants</Link>
            </div>
        );
    }

    return (
        <div className="py-4 container">
            <div className="page-toolbar d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4 mb-0 page-title">Tenant Details</h1>
                <div className="d-flex gap-2">
                    <Link to="/tenants" className="btn btn-secondary">Back</Link>
                    <button type="button" className="btn btn-primary" onClick={() => setShowEditModal(true)}>Edit</button>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <div><strong>First Name:</strong> {tenant.firstName}</div>
                    <div><strong>Last Name:</strong> {tenant.lastName}</div>
                    <div><strong>Phone Number:</strong> {tenant.phoneNumber}</div>
                    <div><strong>Email:</strong> {tenant.email}</div>
                    <div><strong>Created At:</strong> {new Date(tenant.createdAt).toLocaleDateString()}</div>
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
                                    <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowEditModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="mb-3">
                                            <label htmlFor="edit-tenant-firstName" className="form-label">First Name</label>
                                            <input id="edit-tenant-firstName" className="form-control" type="text" name="firstName" value={editForm.firstName} onChange={handleEditChange} />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="edit-tenant-lastName" className="form-label">Last Name</label>
                                            <input id="edit-tenant-lastName" className="form-control" type="text" name="lastName" value={editForm.lastName} onChange={handleEditChange} />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="edit-tenant-phoneNumber" className="form-label">Phone Number</label>
                                            <input id="edit-tenant-phoneNumber" className="form-control" type="text" name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange} />
                                        </div>
                                        <div>
                                            <label htmlFor="edit-tenant-email" className="form-label">Email</label>
                                            <input id="edit-tenant-email" className="form-control" type="email" name="email" value={editForm.email} onChange={handleEditChange} />
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer d-flex justify-content-between">
                                    <button type="button" className="btn btn-danger" onClick={() => void handleDelete()} disabled={isSaving || isDeleting}>
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <div className="d-flex gap-2">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)} disabled={isSaving || isDeleting}>
                                            Cancel
                                        </button>
                                        <button type="button" className="btn btn-primary" onClick={() => void handleSave()} disabled={isSaving || isDeleting}>
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={() => setShowEditModal(false)} />
                </>
            )}
        </div>
    );
}
