import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth/auth.service.ts';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            await authService.forgotPassword(email.trim());
            setSuccess('If the email exists, reset instructions were sent.');
        } catch {
            setError('Failed to request password reset.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h1 className="h5 mb-3">Reset Password</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="forgot-email" className="form-label">Email</label>
                        <input
                            id="forgot-email"
                            className="form-control"
                            type="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Enter your email"
                        />
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
