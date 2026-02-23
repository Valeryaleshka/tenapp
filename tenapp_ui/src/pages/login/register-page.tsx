import { useState, type FormEvent } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context.tsx';

export function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        login: '',
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
        <Card className="shadow-sm">
            <Card.Body>
                <Card.Title className="mb-3">Register</Card.Title>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(event) => setFormData((prev) => ({ ...prev, firstName: event.target.value }))}
                            placeholder="Enter first name"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Second Name</Form.Label>
                        <Form.Control
                            type="text"
                            required
                            value={formData.secondName}
                            onChange={(event) => setFormData((prev) => ({ ...prev, secondName: event.target.value }))}
                            placeholder="Enter second name"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Login</Form.Label>
                        <Form.Control
                            type="text"
                            required
                            value={formData.login}
                            onChange={(event) => setFormData((prev) => ({ ...prev, login: event.target.value }))}
                            placeholder="Choose login"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            required
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
                            placeholder="Choose password"
                        />
                    </Form.Group>

                    <Button type="submit" disabled={isSubmitting} className="w-100">
                        {isSubmitting ? 'Creating account...' : 'Register'}
                    </Button>
                </Form>

                <div className="mt-3 text-center">
                    Already have an account?{' '}
                    <Link to="/login" className="btn btn-link p-0">
                        Login
                    </Link>
                </div>
            </Card.Body>
        </Card>
    );
}
