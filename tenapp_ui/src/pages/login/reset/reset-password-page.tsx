import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthService, type ResetPasswordPayload } from '../../../services/auth/authService.ts';

type ResetPasswordFormValues = Omit<ResetPasswordPayload, 'token'>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormValues>({
        defaultValues: {
            email: '',
            newPassword: '',
        },
    });

    const onSubmit: SubmitHandler<ResetPasswordFormValues> = async ({ email, newPassword }) => {
        setError(null);
        setSuccess(null);

        if (!token) {
            setError('Reset token is missing or invalid.');
            return;
        }

        try {
            await AuthService.resetPassword({
                email: email.trim(),
                token,
                newPassword,
            });
            setSuccess('Password reset successful. You can now sign in.');
        } catch {
            setError('Failed to reset password.');
        }
    };

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h1 className="h5 mb-3">Set New Password</h1>
                {!token && <div className="alert alert-warning">Token was not found in the URL.</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="mb-3">
                        <label htmlFor="resetEmail" className="form-label">Email</label>
                        <input
                            id="resetEmail"
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

                    <div className="mb-3">
                        <label htmlFor="newPassword" className="form-label">New Password</label>
                        <input
                            id="newPassword"
                            className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                            type="password"
                            aria-invalid={Boolean(errors.newPassword)}
                            {...register('newPassword', {
                                validate: (value) => value.trim().length > 0 || 'New password is required.',
                                onChange: () => {
                                    setError(null);
                                    setSuccess(null);
                                },
                            })}
                            placeholder="Enter new password"
                        />
                        {errors.newPassword && <div className="invalid-feedback d-block">{errors.newPassword.message}</div>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !token}
                        className="btn btn-primary w-100"
                    >
                        {isSubmitting ? 'Resetting...' : 'Reset password'}
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
