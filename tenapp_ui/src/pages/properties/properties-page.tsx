import { useCallback, useState } from 'react';
import { AddProperty } from './components/property-add.tsx';
import { PropertyTable } from './components/property-table.tsx';

export function PropertiesPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);

    const handlePropertyAdded = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1);
    }, []);

    return (
        <div className="container py-4">
            <div className="page-toolbar d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4 mb-0 page-title">Properties</h1>
                <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    Add Property
                </button>
            </div>

            <PropertyTable key={refreshTrigger} />
            <AddProperty
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onPropertyAdded={handlePropertyAdded}
            />
        </div>
    );
}
