import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { AddTenant } from './components/tenant-add.tsx'
import { TenantTable } from './components/tenant-table.tsx'

export function TenantsPage() {
  const [showAddTenantModal, setShowAddTenantModal] = useState(false)

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0 page-title">Tenants</h1>
        <Button type="button" onClick={() => setShowAddTenantModal(true)}>
          Add Tenant
        </Button>
      </div>

      <TenantTable />

      <AddTenant show={showAddTenantModal} onHide={() => setShowAddTenantModal(false)} />
    </div>
  )
}
