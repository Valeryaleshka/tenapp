import { Alert, Table } from 'react-bootstrap'
import { LoadingWrapper } from '../../../common/components/loading-wrapper/loading-wrapper.tsx'
import { useTenantDailyStatsQuery } from '../services/tenant.queries.ts'

const formatDate = (value: string): string => new Date(value).toLocaleDateString()

export function TenantCreatedAtAccountTable() {
  const tenantDailyStatsQuery = useTenantDailyStatsQuery()
  const stats = tenantDailyStatsQuery.data ?? []

  return (
    <>
      {tenantDailyStatsQuery.isError && (
        <Alert variant="danger">Could not load tenant account counts. Please try again.</Alert>
      )}

      <LoadingWrapper isLoading={tenantDailyStatsQuery.isFetching}>
        <Table bordered hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Created At</th>
              <th>Accounts Created</th>
              <th>Accumulated Accounts</th>
            </tr>
          </thead>
          <tbody>
            {stats.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-muted">
                  No tenant account creation data found.
                </td>
              </tr>
            ) : (
              stats.map((stat) => (
                <tr key={stat.date}>
                  <td>{formatDate(stat.date)}</td>
                  <td>{stat.count}</td>
                  <td>{stat.accumulatedCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </LoadingWrapper>
    </>
  )
}
