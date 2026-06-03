import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Alert, Button, Form, Table } from 'react-bootstrap'
import { AppPagination } from '../../../common/components/pagination/app-pagination.tsx'
import { LoadingWrapper } from '../../../common/components/loading-wrapper/loading-wrapper.tsx'
import { SortableTableHeaderColumn } from '../../../common/components/sortable-table-header-column/SortableTableHeaderColumn.tsx'
import { type TenantSortField } from '../services/tenant.service.ts'
import {
  getNextSortDirection,
  type SortDirection,
} from '../../../common/services/sort/sort.service.ts'
import { useTenantsQuery } from '../services/tenant.queries.ts'
import './tenant-table.css'

export function TenantTable() {
  const navigate = useNavigate()
  const pageSize = 20
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<TenantSortField>('firstName')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')
  const tenantsQuery = useTenantsQuery(page, pageSize, sortBy, sortDir)
  const tenants = tenantsQuery.data?.items ?? []
  const totalPages = Math.max(1, tenantsQuery.data?.totalPages ?? 1)
  const totalCount = tenantsQuery.data?.totalCount ?? 0

  const applySort = (field: TenantSortField) => {
    const nextDirection = getNextSortDirection(sortBy, field, sortDir)
    setSortBy(field)
    setSortDir(nextDirection)
    setPage(1)
  }

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
  }

  return (
    <>
      <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
        <Form.Select
          aria-label="Sort tenants by field"
          value={sortBy}
          onChange={(event) => {
            setSortBy(event.target.value as TenantSortField)
            setPage(1)
          }}
          style={{ width: '200px' }}
        >
          <option value="firstName">Sort: First Name</option>
          <option value="lastName">Sort: Last Name</option>
        </Form.Select>
        <Form.Select
          aria-label="Sort tenants direction"
          value={sortDir}
          onChange={(event) => {
            setSortDir(event.target.value as SortDirection)
            setPage(1)
          }}
          style={{ width: '130px' }}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </Form.Select>
      </div>

      {tenantsQuery.isError && (
        <Alert variant="danger">Could not load tenants. Please try again.</Alert>
      )}

      <LoadingWrapper isLoading={tenantsQuery.isFetching}>
        <Table bordered hover className="align-middle">
          <thead>
            <tr>
              <th>
                <SortableTableHeaderColumn
                  activeField={sortBy}
                  direction={sortDir}
                  field="firstName"
                  label="First Name"
                  onSort={applySort}
                />
              </th>
              <th>
                <SortableTableHeaderColumn
                  activeField={sortBy}
                  direction={sortDir}
                  field="lastName"
                  label="Last Name"
                  onSort={applySort}
                />
              </th>
              <th className="tenant-status-cell">Status</th>
              <th>Phone</th>
              <th className="d-none d-md-table-cell">Email</th>
              <th className="d-none d-md-table-cell">Assigned Property</th>
              <th className="d-none d-md-table-cell">Created At</th>
              <th className="table-action-col"></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => {
              const isAssigned = tenant.assignedProperties.length > 0

              return (
                <tr key={tenant.id}>
                  <td>{tenant.firstName}</td>
                  <td>{tenant.lastName}</td>
                  <td className="tenant-status-cell">
                    <span
                      className={
                        isAssigned
                          ? 'tenant-status-dot tenant-status-dot-assigned'
                          : 'tenant-status-dot tenant-status-dot-unassigned'
                      }
                      title={isAssigned ? 'Assigned' : 'Unassigned'}
                      aria-label={isAssigned ? 'Assigned' : 'Unassigned'}
                    />
                  </td>
                  <td>{tenant.phoneNumber}</td>
                  <td className="d-none d-md-table-cell">{tenant.email}</td>
                  <td className="d-none d-md-table-cell">
                    {tenant.assignedProperties.join(', ') || 'Unassigned'}
                  </td>
                  <td className="d-none d-md-table-cell">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="table-action-col">
                    <Button onClick={() => navigate(`/tenants/${tenant.id}`)}>Details</Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </LoadingWrapper>

      <div className="d-flex justify-content-between align-items-center">
        <small className="text-muted">Total: {totalCount}</small>
        <AppPagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </>
  )
}
