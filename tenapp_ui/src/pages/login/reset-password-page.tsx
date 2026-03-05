import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth/auth.service.ts';

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!token) {
            setError('Reset token is missing or invalid.');
            return;
        }

        setIsSubmitting(true);

        try {
            await authService.resetPassword({
                email: email.trim(),
                token,
                newPassword,
            });
            setSuccess('Password reset successful. You can now sign in.');
        } catch {
            setError('Failed to reset password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h1 className="h5 mb-3">Set New Password</h1>
                {!token && <div className="alert alert-warning">Token was not found in the URL.</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="resetEmail" className="form-label">Email</label>
                        <input
                            id="resetEmail"
                            className="form-control"
                            type="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="newPassword" className="form-label">New Password</label>
                        <input
                            id="newPassword"
                            className="form-control"
                            type="password"
                            required
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="Enter new password"
                        />
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
