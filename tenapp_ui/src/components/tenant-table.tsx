import { type ChangeEvent, useEffect, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { propertyService, type Property } from '../services/properties/property.service.ts';
import { tenantService, type Tenant } from '../services/tenants/tenant.service.ts';

interface TenantTableProps {
    refreshTrigger: number;
}

export function TenantTable({ refreshTrigger }: TenantTableProps) {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        propertyId: '',
    });

    useEffect(() => {
        void tenantService.getAll().then(setTenants).catch((error) => {
            console.error('Failed to load tenants:', error);
        });
        void propertyService.getAll().then(setProperties).catch((error) => {
            console.error('Failed to load properties for tenant edit:', error);
        });
    }, [refreshTrigger]);

    const handleOpenEdit = (tenant: Tenant) => {
        setEditingTenant(tenant);
        setEditForm({
            firstName: tenant.firstName,
            lastName: tenant.lastName,
            phoneNumber: tenant.phoneNumber,
            email: tenant.email,
            propertyId: tenant.propertyId ?? '',
        });
    };

    const handleCloseEdit = () => {
        if (isSaving || isDeleting) {
            return;
        }

        setEditingTenant(null);
    };

    const handleEditChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!editingTenant) {
            return;
        }

        try {
            setIsSaving(true);
            const updated = await tenantService.update(editingTenant.id, {
                firstName: editForm.firstName.trim(),
                lastName: editForm.lastName.trim(),
                phoneNumber: editForm.phoneNumber.trim(),
                email: editForm.email.trim(),
                propertyId: editForm.propertyId || null,
            });
            setTenants((prev) => prev.map((tenant) => (tenant.id === updated.id ? updated : tenant)));
            setEditingTenant(null);
        } catch (error) {
            console.error('Failed to update tenant:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!editingTenant) {
            return;
        }

        try {
            setIsDeleting(true);
            await tenantService.delete(editingTenant.id);
            setTenants((prev) => prev.filter((tenant) => tenant.id !== editingTenant.id));
            setEditingTenant(null);
        } catch (error) {
            console.error('Failed to delete tenant:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Table striped bordered hover className="mt-4">
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Assigned Property</th>
                        <th>Created At</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {tenants.map((tenant) => (
                        <tr key={tenant.id}>
                            <td>{tenant.firstName}</td>
                            <td>{tenant.lastName}</td>
                            <td>{tenant.phoneNumber}</td>
                            <td>{tenant.email}</td>
                            <td>{tenant.assignedProperty ?? 'Unassigned'}</td>
                            <td>{new Date(tenant.createdAt).toLocaleDateString()}</td>
                            <td>
                                <Button variant="primary" onClick={() => handleOpenEdit(tenant)}>
                                    Edit
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={editingTenant !== null} onHide={handleCloseEdit} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Tenant</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="firstName"
                                value={editForm.firstName}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="lastName"
                                value={editForm.lastName}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="phoneNumber"
                                value={editForm.phoneNumber}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={editForm.email}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-1">
                            <Form.Label>Assign Property</Form.Label>
                            <Form.Select
                                name="propertyId"
                                value={editForm.propertyId}
                                onChange={handleEditChange}
                            >
                                <option value="">No property</option>
                                {properties.map((property) => (
                                    <option key={property.id} value={property.id}>
                                        {property.name} ({property.address})
                                    </option>
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
                        <Button variant="secondary" onClick={handleCloseEdit} disabled={isSaving || isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={() => void handleSave()} disabled={isSaving || isDeleting}>
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}
