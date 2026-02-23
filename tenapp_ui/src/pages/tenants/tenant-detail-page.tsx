import { type ChangeEvent, useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Modal, Spinner } from 'react-bootstrap';
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
        return <div className="py-4"><Spinner animation="border" /></div>;
    }

    if (!tenant) {
        return (
            <div className="py-4">
                <Alert variant="warning">Tenant not found or has been deleted.</Alert>
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
                    <Button variant="primary" onClick={() => setShowEditModal(true)}>Edit</Button>
                </div>
            </div>

            <Card>
                <Card.Body>
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
                </Card.Body>
            </Card>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Tenant</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control type="text" name="firstName" value={editForm.firstName} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control type="text" name="lastName" value={editForm.lastName} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control type="text" name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" name="email" value={editForm.email} onChange={handleEditChange} />
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
