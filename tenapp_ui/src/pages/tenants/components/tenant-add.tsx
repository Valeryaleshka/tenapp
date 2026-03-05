import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { tenantService } from '../../../services/tenants/tenant.service.ts';

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
}

const initialFormState: TenantFormState = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
};

export function AddTenant({ show, onHide, onTenantAdded }: AddTenantProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<TenantFormState>(initialFormState);

    useEffect(() => {
        if (show) {
            setFormData(initialFormState);
        }
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

    if (!show) {
        return null;
    }

    return (
        <>
            <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Add Tenant</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={onHide} />
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="tenant-firstName" className="form-label">First Name</label>
                                    <input
                                        id="tenant-firstName"
                                        className="form-control"
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="tenant-lastName" className="form-label">Last Name</label>
                                    <input
                                        id="tenant-lastName"
                                        className="form-control"
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="tenant-phoneNumber" className="form-label">Phone Number</label>
                                    <input
                                        id="tenant-phoneNumber"
                                        className="form-control"
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="tenant-email" className="form-label">Email</label>
                                    <input
                                        id="tenant-email"
                                        className="form-control"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email"
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onHide} disabled={isSubmitting}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => void submitAdd()} disabled={isSubmitting}>
                                {isSubmitting ? 'Adding...' : 'Add Tenant'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" onClick={onHide} />
        </>
    );
}
