import { useState } from 'react'
import { AddTenant } from './components/tenant-add.tsx'
import { TenantTable } from './components/tenant-table.tsx'

export function TenantsPage() {
  const [showAddTenantModal, setShowAddTenantModal] = useState(false)

  return (
    <div className="container py-4">
      <div className="page-toolbar d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0 page-title">Tenants</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddTenantModal(true)}
        >
          Add Tenant
        </button>
      </div>

      <TenantTable />

      <AddTenant show={showAddTenantModal} onHide={() => setShowAddTenantModal(false)} />
    </div>
  )
}
