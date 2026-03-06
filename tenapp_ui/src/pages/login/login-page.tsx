import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.tsx';

interface LoginFormErrors {
    email?: string;
    password?: string;
}

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        login: '',
        email: '',
        password: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setFormErrors({});

        const trimmedLogin = formData.login.trim();
        const trimmedEmail = formData.email.trim();
        const nextErrors: LoginFormErrors = {};

        if (!trimmedLogin && !trimmedEmail) {
            setError('Enter login or email.');
            return;
        }

        if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            nextErrors.email = 'Enter a valid email address.';
        }

        if (!formData.password.trim()) {
            nextErrors.password = 'Password is required.';
        }

        if (Object.keys(nextErrors).length > 0) {
            setFormErrors(nextErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            await login({
                password: formData.password,
                login: trimmedLogin || undefined,
                email: trimmedEmail || undefined,
            });
            navigate('/properties', { replace: true });
        } catch {
            setError('Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    function callWithTimeout(promise: () => Promise<unknown>, maxTimeout: number): Promise<unknown> {
        const rejectPromise = () => new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Request timed out")), maxTimeout);
        })

        return Promise.race([promise(), rejectPromise()])

    }

    const slowTask = () => new Promise(resolve => setTimeout(() => resolve("Data loaded"), 2000));

    const fastTask = () => new Promise(resolve => setTimeout(() => resolve("Fast data"), 500));

    callWithTimeout(slowTask, 1000)
        .then(console.log)
        .catch(err => console.error("Error:", err)); // Output: Error: Request timed out

    callWithTimeout(fastTask, 1000)
        .then(console.log) // Output: Fast data
        .catch(err => console.error("Error:", err));

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h1 className="h5 mb-3">Login</h1>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                        <label htmlFor="login" className="form-label">Login</label>
                        <input
                            id="login"
                            className="form-control"
                            type="text"
                            value={formData.login}
                            onChange={(event) => {
                                setFormData((prev) => ({ ...prev, login: event.target.value }));
                                setError(null);
                            }}
                            placeholder="Enter login"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            id="email"
                            className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                            type="text"
                            aria-invalid={Boolean(formErrors.email)}
                            value={formData.email}
                            onChange={(event) => {
                                setFormData((prev) => ({ ...prev, email: event.target.value }));
                                setFormErrors((prev) => ({ ...prev, email: undefined }));
                                setError(null);
                            }}
                            placeholder="Enter email"
                        />
                        {formErrors.email && <div className="invalid-feedback d-block">{formErrors.email}</div>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            id="password"
                            className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                            type="password"
                            aria-invalid={Boolean(formErrors.password)}
                            value={formData.password}
                            onChange={(event) => {
                                setFormData((prev) => ({ ...prev, password: event.target.value }));
                                setFormErrors((prev) => ({ ...prev, password: undefined }));
                                setError(null);
                            }}
                            placeholder="Enter password"
                        />
                        {formErrors.password && <div className="invalid-feedback d-block">{formErrors.password}</div>}
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
