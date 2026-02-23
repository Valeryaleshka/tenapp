import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { propertyService, type Property } from '../services/properties/property.service.ts';
import { tenantService } from '../services/tenants/tenant.service.ts';

interface AddTenantProps {
    show: boolean;
    onHide: () => void;
    onTenantAdded: () => void;
}

interface TenantFormState {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    propertyId: string;
}

const initialFormState: TenantFormState = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    propertyId: '',
};

export function AddTenant({ show, onHide, onTenantAdded }: AddTenantProps) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoadingProperties, setIsLoadingProperties] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<TenantFormState>(initialFormState);

    useEffect(() => {
        if (!show) {
            return;
        }

        const loadProperties = async () => {
            try {
                setIsLoadingProperties(true);
                const propertyList = await propertyService.getAll();
                setProperties(propertyList);
            } catch (error) {
                console.error('Failed to load properties for tenant assignment:', error);
            } finally {
                setIsLoadingProperties(false);
            }
        };

        void loadProperties();
    }, [show]);

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const submitAdd = async () => {
        try {
            setIsSubmitting(true);
            await tenantService.add({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                email: formData.email.trim(),
                propertyId: formData.propertyId || null,
            });
            setFormData(initialFormState);
            onTenantAdded();
            onHide();
        } catch (error) {
            console.error('Failed to create tenant:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        await submitAdd();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Tenant</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter first name"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Enter last name"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                        />
                    </Form.Group>
                    <Form.Group className="mb-0">
                        <Form.Label>Assign Property</Form.Label>
                        <Form.Select
                            name="propertyId"
                            value={formData.propertyId}
                            onChange={handleChange}
                            disabled={isLoadingProperties}
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
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={() => void submitAdd()} disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Tenant'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
