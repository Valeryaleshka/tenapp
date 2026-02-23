import React, { useState } from 'react';
import {
    Form,
    Button,
    Modal,
} from 'react-bootstrap';
import { type Property, propertyService } from '../services/properties/property.service.ts';

interface AddPropertyProps {
    show: boolean;
    onHide: () => void;
    onPropertyAdded: () => void;
}

export function AddProperty({ show, onHide, onPropertyAdded }: AddPropertyProps) {
    const [formData, setFormData] = useState<Omit<Property, 'id' | 'createdAt'>>({
        name: '',
        type: '',
        address: '',
        price: 0,
        level: 1,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'level' || name === 'price' ? Number(value) : value,
        }));
    };

    const submitAdd = async () => {
        try {
            setIsSubmitting(true);
            await propertyService.add(formData);
            setFormData({ name: '', type: '', address: '', price: 0, level: 1 });
            onPropertyAdded();
            onHide();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitAdd();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
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
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={() => void submitAdd()} disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Property'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
