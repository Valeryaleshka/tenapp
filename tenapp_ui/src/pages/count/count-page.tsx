import { Alert, Spinner } from 'react-bootstrap'
import { LuBuilding2, LuUsersRound } from 'react-icons/lu'
import { usePropertiesQuery } from '../properties/services/property.queries.ts'
import { useTenantsQuery } from '../tenants/services/tenant.queries.ts'
import './count-page.css'

const countPageSize = 1

export function CountPage() {
  const propertiesQuery = usePropertiesQuery(1, countPageSize, 'name', 'asc', '')
  const tenantsQuery = useTenantsQuery(1, countPageSize, 'firstName', 'asc')

  const isLoading = propertiesQuery.isLoading || tenantsQuery.isLoading
  const isRefreshing = propertiesQuery.isFetching || tenantsQuery.isFetching
  const hasError = propertiesQuery.isError || tenantsQuery.isError

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0 page-title">Counts</h1>
        {isRefreshing && !isLoading && (
          <Spinner animation="border" size="sm" variant="primary" aria-label="Refreshing counts" />
        )}
      </div>

      {hasError && (
        <Alert variant="danger" className="mb-3">
          Could not load counts. Please try again.
        </Alert>
      )}

      <section className="count-page-grid" aria-label="Residence and tenant totals">
        <article className="count-summary-card">
          <div className="count-summary-icon" aria-hidden>
            <LuBuilding2 />
          </div>
          <div>
            <h2 className="h6 text-muted mb-2">Total Residences</h2>
            <p className="count-summary-value mb-0">
              {isLoading ? 'Loading...' : (propertiesQuery.data?.totalCount ?? 0)}
            </p>
          </div>
        </article>

        <article className="count-summary-card">
          <div className="count-summary-icon" aria-hidden>
            <LuUsersRound />
          </div>
          <div>
            <h2 className="h6 text-muted mb-2">Total Tenants</h2>
            <p className="count-summary-value mb-0">
              {isLoading ? 'Loading...' : (tenantsQuery.data?.totalCount ?? 0)}
            </p>
          </div>
        </article>
      </section>
    </div>
  )
}
