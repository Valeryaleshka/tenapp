import { TenantCreatedAtAccountTable } from './components/tenant-created-at-account-table.tsx'

export function TenantsCreatedAtAccountPage() {
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0 page-title">Tenant Created Accounts</h1>
      </div>

      <TenantCreatedAtAccountTable />
    </div>
  )
}
