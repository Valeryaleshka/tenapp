import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
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

    if (!show) {
        return null;
    }

    return (
        <>
            <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Add Property</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseModal} />
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="property-name" className="form-label">Property Name</label>
                                    <input
                                        id="property-name"
                                        className="form-control"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleTextChange}
                                        placeholder="Enter property name"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="property-type" className="form-label">Type</label>
                                    <input
                                        id="property-type"
                                        className="form-control"
                                        type="text"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleTextChange}
                                        placeholder="Enter property type"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="property-address" className="form-label">Address</label>
                                    <input
                                        id="property-address"
                                        className="form-control"
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleTextChange}
                                        placeholder="Enter property address"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="property-price" className="form-label">Price</label>
                                    <input
                                        id="property-price"
                                        className="form-control"
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleTextChange}
                                        min={0}
                                        step="0.01"
                                    />
                                </div>
                                <div className="mb-0">
                                    <label htmlFor="property-level" className="form-label">Level</label>
                                    <input
                                        id="property-level"
                                        className="form-control"
                                        type="number"
                                        name="level"
                                        value={formData.level}
                                        onChange={handleTextChange}
                                        min={1}
                                        max={100}
                                    />
                                </div>
                                <div className="mb-0 mt-3">
                                    <label htmlFor="property-tenantId" className="form-label">Assign Tenant (Optional)</label>
                                    <div className="d-flex gap-2">
                                        <select
                                            id="property-tenantId"
                                            className="form-select"
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
                                        </select>
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, tenantId: null }))}
                                            disabled={!formData.tenantId}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={isSubmitting}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => void submitAdd()} disabled={isSubmitting}>
                                {isSubmitting ? 'Adding...' : 'Add Property'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" onClick={handleCloseModal} />
        </>
    );
}
