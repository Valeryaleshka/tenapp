import { useState } from 'react'
import { Alert, Table } from 'react-bootstrap'
import { AppPagination } from '../../../common/components/pagination/app-pagination.tsx'
import { LoadingWrapper } from '../../../common/components/loading-wrapper/loading-wrapper.tsx'
import { useTransactionsQuery } from '../services/transaction.queries.ts'

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
})

export function TransactionTable() {
  const pageSize = 30
  const [currentPage, setCurrentPage] = useState(1)
  const transactionsQuery = useTransactionsQuery(currentPage, pageSize)
  const transactions = transactionsQuery.data?.items ?? []
  const totalCount = transactionsQuery.data?.totalCount ?? 0
  const totalPages = Math.max(1, transactionsQuery.data?.totalPages ?? 1)

  return (
    <>
      {transactionsQuery.isError && (
        <Alert variant="danger">Could not load transactions. Please try again.</Alert>
      )}

      <LoadingWrapper isLoading={transactionsQuery.isFetching}>
        <Table bordered hover className="align-middle">
          <thead>
            <tr>
              <th>Date</th>
              <th>Property</th>
              <th>Tenant</th>
              <th className="d-none d-md-table-cell">Category</th>
              <th className="text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.propertyName}</td>
                <td>{transaction.tenantFullName}</td>
                <td className="d-none d-md-table-cell">{transaction.categoryName}</td>
                <td className="text-end">{currencyFormatter.format(transaction.amount)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </LoadingWrapper>

      <div className="d-flex justify-content-between align-items-center">
        <small className="text-muted">Total: {totalCount}</small>
        {transactions.length > 0 && (
          <AppPagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </>
  )
}
