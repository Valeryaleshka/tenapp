import { useState, type FormEvent } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.tsx';

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

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!formData.login.trim() && !formData.email.trim()) {
            setError('Enter login or email.');
            return;
        }

        setIsSubmitting(true);

        try {
            await login({
                password: formData.password,
                login: formData.login.trim() || undefined,
                email: formData.email.trim() || undefined,
            });
            navigate('/properties', { replace: true });
        } catch {
            setError('Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="shadow-sm">
            <Card.Body>
                <Card.Title className="mb-3">Login</Card.Title>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Login</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.login}
                            onChange={(event) => setFormData((prev) => ({ ...prev, login: event.target.value }))}
                            placeholder="Enter login"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={formData.email}
                            onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                            placeholder="Enter email"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            required
                            value={formData.password}
                            onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                            placeholder="Enter password"
                        />
                    </Form.Group>

                    <Button type="submit" disabled={isSubmitting} className="w-100">
                        {isSubmitting ? 'Signing in...' : 'Login'}
                    </Button>
                </Form>

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
            </Card.Body>
        </Card>
    );
}
