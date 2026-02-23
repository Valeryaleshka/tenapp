import { Button, Form, Modal, Table } from 'react-bootstrap';
import { type ChangeEvent, useEffect, useState } from 'react';
import { type Property, propertyService, type PropertyUpsertPayload } from '../services/properties/property.service.ts';
import { tenantService, type Tenant } from '../services/tenants/tenant.service.ts';

interface PropertyTableProps {
    refreshTrigger: number;
}

export function PropertyTable({ refreshTrigger }: PropertyTableProps) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [editForm, setEditForm] = useState<PropertyUpsertPayload>({
        name: '',
        type: '',
        address: '',
        price: 0,
        level: 1,
        tenantId: null,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [tenants, setTenants] = useState<Tenant[]>([]);

    useEffect(() => {
        void propertyService.getAll().then(setProperties);
        void tenantService.getAll().then(setTenants).catch((error) => {
            console.error('Failed to load tenants:', error);
        });
    }, [refreshTrigger]);

    const handleOpenEdit = (property: Property) => {
        setEditingProperty(property);
        setEditForm({
            name: property.name,
            type: property.type,
            address: property.address,
            price: property.price,
            level: property.level,
            tenantId: property.tenantId ?? null,
        });
    };

    const handleCloseEdit = () => {
        if (isSaving || isDeleting) {
            return;
        }

        setEditingProperty(null);
    };

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
        if (!editingProperty) {
            return;
        }

        try {
            setIsSaving(true);
            const updated = await propertyService.update(editingProperty.id, editForm);
            setProperties((prev) => prev.map((property) => (property.id === updated.id ? updated : property)));
            setEditingProperty(null);
        } catch (error) {
            console.error('Failed to update property:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!editingProperty) {
            return;
        }

        try {
            setIsDeleting(true);
            await propertyService.delete(editingProperty.id);
            setProperties((prevState) => prevState.filter((property) => property.id !== editingProperty.id));
            setEditingProperty(null);
        } catch (error) {
            console.error('Failed to delete property:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Level</th>
                        <th>Address</th>
                        <th>Price</th>
                        <th>Created At</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {properties.map((property) => (
                        <tr key={property.id} className={property.tenantId ? 'table-success' : ''}>
                            <td>{property.name}</td>
                            <td>{property.type}</td>
                            <td>{property.level}</td>
                            <td>{property.address}</td>
                            <td>{property.price.toLocaleString()}</td>
                            <td>{new Date(property.createdAt).toLocaleDateString()}</td>
                            <td>
                                <Button
                                    variant="primary"
                                    onClick={() => handleOpenEdit(property)}
                                >
                                    Edit
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={editingProperty !== null} onHide={handleCloseEdit} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Property</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Control
                                type="text"
                                name="type"
                                value={editForm.type}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={editForm.address}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="price"
                                min={0}
                                step="0.01"
                                value={editForm.price}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-1">
                            <Form.Label>Level</Form.Label>
                            <Form.Control
                                type="number"
                                name="level"
                                min={1}
                                max={100}
                                value={editForm.level}
                                onChange={handleEditChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-1 mt-3">
                            <Form.Label>Assign Tenant (Optional)</Form.Label>
                            <Form.Select
                                name="tenantId"
                                value={editForm.tenantId ?? ''}
                                onChange={handleEditChange}
                            >
                                <option value="">No tenant</option>
                                {tenants.map((tenant) => (
                                    <option key={tenant.id} value={tenant.id}>
                                        {tenant.firstName} {tenant.lastName}
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
