import { useCallback, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { AddProperty } from '../components/property-add.tsx';
import { PropertyTable } from '../components/property-table.tsx';

export function PropertiesPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);

    const handlePropertyAdded = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1);
    }, []);

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4 mb-0">Properties</h1>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Add Property
                </Button>
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
