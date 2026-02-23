import { type ChangeEvent, useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Modal, Spinner } from 'react-bootstrap';
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
        return <div className="py-4"><Spinner animation="border" /></div>;
    }

    if (!property) {
        return (
            <div className="py-4">
                <Alert variant="warning">Property not found or has been deleted.</Alert>
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
                    <Button variant="primary" onClick={() => setShowEditModal(true)}>Edit</Button>
                </div>
            </div>

            <Card>
                <Card.Body>
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
                </Card.Body>
            </Card>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Property</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" name="name" value={editForm.name} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Control type="text" name="type" value={editForm.type} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control type="text" name="address" value={editForm.address} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control type="number" name="price" min={0} step="0.01" value={editForm.price} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Level</Form.Label>
                            <Form.Control type="number" name="level" min={1} max={100} value={editForm.level} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Assign Tenant (Optional)</Form.Label>
                            <Form.Select name="tenantId" value={editForm.tenantId ?? ''} onChange={handleEditChange}>
                                <option value="">No tenant</option>
                                {tenants.map((tenant) => (
                                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button variant="danger" onClick={() => void handleDelete()} disabled={isSaving || isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                    <div className="d-flex gap-2">
                        <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={isSaving || isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={() => void handleSave()} disabled={isSaving || isDeleting}>
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
