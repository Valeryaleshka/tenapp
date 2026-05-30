import { useState } from 'react'
import { Button } from 'react-bootstrap'
import { AddProperty } from './components/property-add.tsx'
import { PropertyTable } from './components/property-table.tsx'

export function PropertiesPage() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0 page-title">Properties</h1>
        <Button type="button" onClick={() => setShowAddModal(true)}>
          Add Property
        </Button>
      </div>

      <PropertyTable />
      <AddProperty show={showAddModal} onHide={() => setShowAddModal(false)} />
    </div>
  )
}
