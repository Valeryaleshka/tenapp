import { useState, type FormEvent } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth/auth.service.ts';

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
        <Card className="shadow-sm">
            <Card.Body>
                <Card.Title className="mb-3">Set New Password</Card.Title>
                {!token && <Alert variant="warning">Token was not found in the URL.</Alert>}
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

                    <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                            type="password"
                            required
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            placeholder="Enter new password"
                        />
                    </Form.Group>

                    <Button
                        type="submit"
                        disabled={isSubmitting || !token}
                        className="w-100"
                    >
                        {isSubmitting ? 'Resetting...' : 'Reset password'}
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
