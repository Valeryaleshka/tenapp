import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {useAuth} from "../../../common/hooks/useAuth.ts";
import type {RegisterPayload} from "../../../services/auth/authService.ts";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const {
        register: registerField,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterPayload>({
        defaultValues: {
            email: '',
            password: '',
            firstName: '',
            secondName: '',
        },
    });

    const onSubmit: SubmitHandler<RegisterPayload> = async (formData) => {
        setError(null);

        try {
            await register({
                email: formData.email.trim(),
                password: formData.password,
                firstName: formData.firstName.trim(),
                secondName: formData.secondName.trim(),
            });
            navigate('/properties', { replace: true });
        } catch {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h1 className="h5 mb-3">Register</h1>
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="mb-3">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input
                            id="firstName"
                            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                            type="text"
                            aria-invalid={Boolean(errors.firstName)}
                            {...registerField('firstName', {
                                validate: (value) => value.trim().length > 0 || 'First name is required.',
                                onChange: () => setError(null),
                            })}
                            placeholder="Enter first name"
                        />
                        {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName.message}</div>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="secondName" className="form-label">Second Name</label>
                        <input
                            id="secondName"
                            className={`form-control ${errors.secondName ? 'is-invalid' : ''}`}
                            type="text"
                            aria-invalid={Boolean(errors.secondName)}
                            {...registerField('secondName', {
                                validate: (value) => value.trim().length > 0 || 'Second name is required.',
                                onChange: () => setError(null),
                            })}
                            placeholder="Enter second name"
                        />
                        {errors.secondName && <div className="invalid-feedback d-block">{errors.secondName.message}</div>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="registerEmail" className="form-label">Email</label>
                        <input
                            id="registerEmail"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            type="email"
                            aria-invalid={Boolean(errors.email)}
                            {...registerField('email', {
                                required: 'Email is required.',
                                pattern: {
                                    value: emailPattern,
                                    message: 'Enter a valid email address.',
                                },
                                onChange: () => setError(null),
                            })}
                            placeholder="Enter email"
                        />
                        {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="registerPassword" className="form-label">Password</label>
                        <input
                            id="registerPassword"
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            type="password"
                            aria-invalid={Boolean(errors.password)}
                            {...registerField('password', {
                                validate: (value) => value.trim().length > 0 || 'Password is required.',
                                onChange: () => setError(null),
                            })}
                            placeholder="Choose password"
                        />
                        {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary w-100">
                        {isSubmitting ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <div className="mt-3 text-center">
                    Already have an account?{' '}
                    <Link to="/login" className="btn btn-link p-0">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
