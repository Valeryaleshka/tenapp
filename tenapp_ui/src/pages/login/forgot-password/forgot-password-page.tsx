import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { AuthService } from '../../../services/auth/authService.ts';

interface ForgotPasswordFormValues {
    email: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormValues>({
        defaultValues: {
            email: '',
        },
    });

    const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async ({ email }) => {
        setError(null);
        setSuccess(null);

        try {
            await AuthService.forgotPassword(email.trim());
            setSuccess('If the email exists, reset instructions were sent.');
        } catch {
            setError('Failed to request password reset.');
        }
    };

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h1 className="h5 mb-3">Reset Password</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="mb-3">
                        <label htmlFor="forgot-email" className="form-label">Email</label>
                        <input
                            id="forgot-email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            type="email"
                            aria-invalid={Boolean(errors.email)}
                            {...register('email', {
                                required: 'Email is required.',
                                pattern: {
                                    value: emailPattern,
                                    message: 'Enter a valid email address.',
                                },
                                onChange: () => {
                                    setError(null);
                                    setSuccess(null);
                                },
                            })}
                            placeholder="Enter your email"
                        />
                        {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary w-100">
                        {isSubmitting ? 'Sending...' : 'Send reset link'}
                    </button>
                </form>

                <div className="mt-3 text-center">
                    <Link to="/login" className="btn btn-link p-0">
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
