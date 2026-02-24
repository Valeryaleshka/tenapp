import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import {
    Form,
    Button,
    Modal,
} from 'react-bootstrap';
import { propertyService, type PropertyUpsertPayload } from '../../../services/properties/property.service.ts';
import { tenantService, type TenantSelect } from '../../../services/tenants/tenant.service.ts';

interface AddPropertyProps {
    show: boolean;
    onHide: () => void;
    onPropertyAdded: () => void;
}

export function AddProperty({ show, onHide, onPropertyAdded }: AddPropertyProps) {
    const initialFormData: PropertyUpsertPayload = {
        name: '',
        type: '',
        address: '',
        price: 0,
        level: 1,
        tenantId: null,
    };

    const [formData, setFormData] = useState<PropertyUpsertPayload>({
        ...initialFormData,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tenants, setTenants] = useState<TenantSelect[]>([]);

    useEffect(() => {
        if (!show) {
            return;
        }

        void tenantService.getForSelect().then(setTenants).catch((error) => {
            console.error('Failed to load tenants:', error);
        });
    }, [show]);

    const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === 'level' || name === 'price'
                    ? Number(value)
                    : name === 'tenantId'
                        ? (value || null)
                        : value,
        }));
    };

    const submitAdd = async () => {
        try {
            setIsSubmitting(true);
            await propertyService.add(formData);
            setFormData(initialFormData);
            onPropertyAdded();
            onHide();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setFormData(initialFormData);
        onHide();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await submitAdd();
    };

    return (
        <Modal show={show} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Property</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Property Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleTextChange}
                            placeholder="Enter property name"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Type</Form.Label>
                        <Form.Control
                            type="text"
                            name="type"
                            value={formData.type}
                            onChange={handleTextChange}
                            placeholder="Enter property type"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleTextChange}
                            placeholder="Enter property address"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleTextChange}
                            min={0}
                            step="0.01"
                        />
                    </Form.Group>
                    <Form.Group className="mb-0">
                        <Form.Label>Level</Form.Label>
                        <Form.Control
                            type="number"
                            name="level"
                            value={formData.level}
                            onChange={handleTextChange}
                            min={1}
                            max={100}
                        />
                    </Form.Group>
                    <Form.Group className="mb-0 mt-3">
                        <Form.Label>Assign Tenant (Optional)</Form.Label>
                        <div className="d-flex gap-2">
                            <Form.Select
                                name="tenantId"
                                value={formData.tenantId ?? ''}
                                onChange={handleTextChange}
                            >
                                <option value="">No tenant</option>
                                {tenants.map((tenant) => (
                                    <option key={tenant.id} value={tenant.id}>
                                        {tenant.name}
                                    </option>
                                ))}
                            </Form.Select>
                            <Button
                                variant="outline-secondary"
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, tenantId: null }))}
                                disabled={!formData.tenantId}
                            >
                                Clear
                            </Button>
                        </div>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={() => void submitAdd()} disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Property'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
