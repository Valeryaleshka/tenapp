import { useCallback, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { AddTenant } from './components/tenant-add.tsx';
import { TenantTable } from './components/tenant-table.tsx';

export function TenantsPage() {
    const [showAddTenantModal, setShowAddTenantModal] = useState(false);
    const [tenantRefreshTrigger, setTenantRefreshTrigger] = useState(0);

    const handleTenantAdded = useCallback(() => {
        setTenantRefreshTrigger((prev) => prev + 1);
    }, []);

    return (
        <Container className="py-4">
            <div className="page-toolbar d-flex justify-content-between align-items-center mb-4">
                <h1 className="h4 mb-0 page-title">Tenants</h1>
                <Button variant="primary" onClick={() => setShowAddTenantModal(true)}>
                    Add Tenant
                </Button>
            </div>

            <TenantTable refreshTrigger={tenantRefreshTrigger} />

            <AddTenant
                show={showAddTenantModal}
                onHide={() => setShowAddTenantModal(false)}
                onTenantAdded={handleTenantAdded}
            />
        </Container>
    );
}
