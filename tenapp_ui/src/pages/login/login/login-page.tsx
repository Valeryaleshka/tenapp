import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {useAuth} from "../../../common/hooks/useAuth.ts";
import type {LoginPayload} from "../../../services/auth/auth.service.ts";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginPayload>({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit: SubmitHandler<LoginPayload> = async (formData) => {
        setError(null);
        try {
            await login({
                password: formData.password,
                email: formData.email.trim(),
            });
            navigate('/properties', { replace: true });
        } catch {
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h1 className="h5 mb-3">Login</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            id="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            type="text"
                            aria-invalid={Boolean(errors.email)}
                            {...register('email', {
                                required: 'Enter email.',
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
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            id="password"
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            type="password"
                            aria-invalid={Boolean(errors.password)}
                            {...register('password', {
                                validate: (value) => value.trim().length > 0 || 'Password is required.',
                                onChange: () => setError(null),
                            })}
                            placeholder="Enter password"
                        />
                        {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary w-100">
                        {isSubmitting ? 'Signing in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-3 text-center">
                    No account?{' '}
                    <Link to="/register" className="btn btn-link p-0">
                        Register
                    </Link>
                </div>
                <div className="mt-2 text-center">
                    <Link to="/forgot-password" className="btn btn-link p-0">
                        Forgot password?
                    </Link>
                </div>
            </div>
        </div>
    );
}
