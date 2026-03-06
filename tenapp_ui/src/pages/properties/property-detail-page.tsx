import { type ChangeEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { propertyService, type Property, type PropertyUpsertPayload } from '../../services/properties/property.service.ts';
import { tenantService, type TenantSelect } from '../../services/tenants/tenant.service.ts';

export function PropertyDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [property, setProperty] = useState<Property | null>(null);
    const [tenants, setTenants] = useState<TenantSelect[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editForm, setEditForm] = useState<PropertyUpsertPayload>({
        name: '',
        type: '',
        address: '',
        price: 0,
        level: 1,
        tenantId: null,
        startDate: null,
        endDate: null,
    });

    useEffect(() => {
        if (!id) {
            return;
        }

        const load = async () => {
            try {
                setIsLoading(true);
                const [propertyData, tenantsData] = await Promise.all([
                    propertyService.getById(id),
                    tenantService.getForSelect(),
                ]);
                setProperty(propertyData);
                setTenants(tenantsData);
                setEditForm({
                    name: propertyData.name,
                    type: propertyData.type,
                    address: propertyData.address,
                    price: propertyData.price,
                    level: propertyData.level,
                    startDate: propertyData.startDate,
                    endDate: propertyData.endDate,
                    tenantId: propertyData.tenantId ?? null,
                });
            } catch (error) {
                console.error('Failed to load property details:', error);
                setProperty(null);
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, [id]);

    const handleEditChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setEditForm((prev) => ({
            ...prev,
            [name]:
                name === 'price' || name === 'level'
                    ? Number(value)
                    : name === 'tenantId'
                        ? (value || null)
                        : value,
        }));
    };

    const handleSave = async () => {
        if (!id || !property) {
            return;
        }

        try {
            setIsSaving(true);
            const updated = await propertyService.update(id, editForm);
            setProperty(updated);
            setShowEditModal(false);
        } catch (error) {
            console.error('Failed to update property:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseEditModal = () => {
        if (property) {
            setEditForm({
                name: property.name,
                type: property.type,
                address: property.address,
                price: property.price,
                level: property.level,
                startDate: property.startDate,
                endDate: property.endDate,
                tenantId: property.tenantId ?? null,
            });
        }
        setShowEditModal(false);
    };

    const handleDelete = async () => {
        if (!id) {
            return;
        }

        try {
            setIsDeleting(true);
            await propertyService.delete(id);
            setProperty(null);
            setShowEditModal(false);
        } catch (error) {
            console.error('Failed to delete property:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="py-4">
                <div className="spinner-border text-primary" role="status" aria-label="Loading property details" />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="py-4">
                <div className="alert alert-warning">Property not found or has been deleted.</div>
                <Link to="/properties" className="btn btn-secondary">Back to Properties</Link>
            </div>
        );
    }

    return (
        <div className="py-4 container">
            <div className="page-toolbar d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4 mb-0 page-title">Property Details</h1>
                <div className="d-flex gap-2">
                    <Link to="/properties" className="btn btn-secondary">Back</Link>
                    <button type="button" className="btn btn-primary" onClick={() => setShowEditModal(true)}>Edit</button>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <div><strong>Name:</strong> {property.name}</div>
                    <div><strong>Type:</strong> {property.type}</div>
                    <div><strong>Address:</strong> {property.address}</div>
                    <div><strong>Price:</strong> {property.price.toLocaleString()}</div>
                    <div><strong>Level:</strong> {property.level}</div>
                    <div><strong>Created At:</strong> {new Date(property.createdAt).toLocaleDateString()}</div>
                    <div>
                        <strong>Tenant:</strong>{' '}
                        {property.tenantId ? (
                            <Link to={`/tenants/${property.tenantId}`}>{property.tenantFullName ?? property.tenantId}</Link>
                        ) : (
                            'Unassigned'
                        )}
                    </div>
                    {property.startDate && <div><strong>Start Date:</strong> {new Date(property.startDate).toLocaleDateString()}</div>}
                    {property.endDate && <div><strong>End Date:</strong> {new Date(property.endDate).toLocaleDateString()}</div>}
                </div>
            </div>

            {showEditModal && (
                <>
                    <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Property</h5>
                                    <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseEditModal} />
                                </div>
                                <div className="modal-body">
                                    <form>
                                        <div className="mb-3">
                                            <label htmlFor="edit-property-name" className="form-label">Name</label>
                                            <input id="edit-property-name" className="form-control" type="text" name="name" value={editForm.name} onChange={handleEditChange} />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="edit-property-type" className="form-label">Type</label>
                                            <input id="edit-property-type" className="form-control" type="text" name="type" value={editForm.type} onChange={handleEditChange} />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="edit-property-address" className="form-label">Address</label>
                                            <input id="edit-property-address" className="form-control" type="text" name="address" value={editForm.address} onChange={handleEditChange} />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="edit-property-price" className="form-label">Price</label>
                                            <input id="edit-property-price" className="form-control" type="number" name="price" min={0} step="0.01" value={editForm.price} onChange={handleEditChange} />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="edit-property-level" className="form-label">Level</label>
                                            <input id="edit-property-level" className="form-control" type="number" name="level" min={1} max={100} value={editForm.level} onChange={handleEditChange} />
                                        </div>
                                        <div className="mb-0">
                                            <label htmlFor="start-date" className="form-label">Start Date</label>
                                            <input
                                                type="date"
                                                id="start-date"
                                                className="form-control"
                                                name="startDate"
                                                value={editForm.startDate}
                                                onChange={handleEditChange}
                                            />
                                        </div>

                                        <div className="mb-0">
                                            <label htmlFor="end-dat" className="form-label">End Date</label>
                                            <input
                                                type="date"
                                                id="end-date"
                                                className="form-control"
                                                name="endDate"
                                                value={editForm.endDate}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="edit-property-tenantId" className="form-label">Assign Tenant (Optional)</label>
                                            <div className="d-flex gap-2">
                                                <select id="edit-property-tenantId" className="form-select" name="tenantId" value={editForm.tenantId ?? ''} onChange={handleEditChange}>
                                                    <option value="">No tenant</option>
                                                    {tenants.map((tenant) => (
                                                        <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => setEditForm((prev) => ({ ...prev, tenantId: null }))}
                                                    disabled={!editForm.tenantId}
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="modal-footer d-flex justify-content-between">
                                    <button type="button" className="btn btn-danger" onClick={() => void handleDelete()} disabled={isSaving || isDeleting}>
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <div className="d-flex gap-2">
                                        <button type="button" className="btn btn-secondary" onClick={handleCloseEditModal} disabled={isSaving || isDeleting}>
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
                    <div className="modal-backdrop fade show" onClick={handleCloseEditModal} />
                </>
            )}
        </div>
    );
}
