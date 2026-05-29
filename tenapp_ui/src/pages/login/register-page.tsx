import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {useAuth} from "../../common/hooks/useAuth.ts";

export function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        secondName: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await register(formData);
            navigate('/properties', { replace: true });
        } catch {
            setError('Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h1 className="h5 mb-3">Register</h1>
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input
                            id="firstName"
                            className="form-control"
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(event) => setFormData((prev) => ({ ...prev, firstName: event.target.value }))}
                            placeholder="Enter first name"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="secondName" className="form-label">Second Name</label>
                        <input
                            id="secondName"
                            className="form-control"
                            type="text"
                            required
                            value={formData.secondName}
                            onChange={(event) => setFormData((prev) => ({ ...prev, secondName: event.target.value }))}
                            placeholder="Enter second name"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="registerEmail" className="form-label">Email</label>
                        <input
                            id="registerEmail"
                            className="form-control"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                            placeholder="Enter email"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="registerPassword" className="form-label">Password</label>
                        <input
                            id="registerPassword"
                            className="form-control"
                            type="password"
                            required
                            value={formData.password}
                            onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                            placeholder="Choose password"
                        />
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
