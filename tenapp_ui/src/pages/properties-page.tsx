import { useCallback, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AddProperty } from '../components/property-add.tsx';
import { PropertyTable } from '../components/property-table.tsx';
import { useAuth } from '../context/auth-context.tsx';

export function PropertiesPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);

    const handlePropertyAdded = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4 mb-0">Properties</h1>
                <div className="d-flex align-items-center gap-3">
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>
                        Add Property
                    </Button>
                    <span>
                        Hello, {user?.firstName} {user?.secondName ?? user?.lastName ?? ''}
                    </span>
                    <Button variant="outline-danger" onClick={() => void handleLogout()}>
                        Logout
                    </Button>
                </div>
            </div>

            <PropertyTable refreshTrigger={refreshTrigger} />
            <AddProperty
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onPropertyAdded={handlePropertyAdded}
            />
        </Container>
    );
}
