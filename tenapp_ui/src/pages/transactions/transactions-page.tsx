import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { AddTransaction } from './components/transaction-add.tsx'
import { TransactionTable } from './components/transaction-table.tsx'

export function TransactionsPage() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0 page-title">Transactions</h1>
        <Button type="button" onClick={() => setShowAddModal(true)}>
          Add Transaction
        </Button>
      </div>

      <TransactionTable />
      <AddTransaction show={showAddModal} onHide={() => setShowAddModal(false)} />
    </div>
  )
}
