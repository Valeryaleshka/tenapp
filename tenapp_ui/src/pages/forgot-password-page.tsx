import { useState, type FormEvent } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth/auth.service.ts';

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
        <Card className="shadow-sm">
            <Card.Body>
                <Card.Title className="mb-3">Reset Password</Card.Title>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Enter your email"
                        />
                    </Form.Group>

                    <Button type="submit" disabled={isSubmitting} className="w-100">
                        {isSubmitting ? 'Sending...' : 'Send reset link'}
                    </Button>
                </Form>

                <div className="mt-3 text-center">
                    <Link to="/login" className="btn btn-link p-0">
                        Back to login
                    </Link>
                </div>
            </Card.Body>
        </Card>
    );
}
