import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Alert, Button, Form, InputGroup, Table } from 'react-bootstrap'
import { LoadingWrapper } from '../../../common/components/loading-wrapper/loading-wrapper.tsx'
import { SortableTableHeaderColumn } from '../../../common/components/sortable-table-header-column/SortableTableHeaderColumn.tsx'

import {
  getNextSortDirection,
  type SortDirection,
} from '../../../common/services/sort/sort.service.ts'
import { AppPagination } from '../../../common/components/pagination/app-pagination.tsx'
import { usePropertiesQuery } from '../services/property.queries.ts'
import type { PropertySortField } from '../services/property.interfaces.ts'
import { getPropertyStatus } from '../services/property-status.helpers.ts'
import './property-table.css'

export function PropertyTable() {
  const navigate = useNavigate()
  const pageSize = 30

  const [currentPage, setCurrentPage] = useState(1)

  const [sortBy, setSortBy] = useState<PropertySortField>('name')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')

  const [searchField, setSearchField] = useState('')
  const [debouncedSearchField, setDebouncedSearchField] = useState('')
  const propertiesQuery = usePropertiesQuery(
    currentPage,
    pageSize,
    sortBy,
    sortDir,
    debouncedSearchField,
  )
  const propertiesList = propertiesQuery.data?.items ?? []
  const totalCount = propertiesQuery.data?.totalCount ?? 0
  const totalPages = Math.max(1, propertiesQuery.data?.totalPages ?? 1)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchField(searchField.trim())
      setCurrentPage(1)
    }, 500)

    return () => {
      clearTimeout(timeout)
    }
  }, [searchField])

  const applySort = (field: PropertySortField) => {
    const nextDirection = getNextSortDirection(sortBy, field, sortDir)
    setSortBy(field)
    setSortDir(nextDirection)
    setCurrentPage(1)
  }

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 mb-3">
        <div>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by name"
              value={searchField}
              onChange={(event) => {
                setSearchField(event.target.value)
              }}
            />
          </InputGroup>
        </div>
        <div className="d-flex justify-content-between align-items-center gap-2">
          <Form.Select
            aria-label="Sort properties by field"
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value as PropertySortField)
              setCurrentPage(1)
            }}
            style={{ width: '170px' }}
          >
            <option value="name">Sort: Name</option>
            <option value="type">Sort: Type</option>
            <option value="level">Sort: Level</option>
          </Form.Select>
          <Form.Select
            aria-label="Sort properties direction"
            value={sortDir}
            onChange={(event) => {
              setSortDir(event.target.value as SortDirection)
              setCurrentPage(1)
            }}
            style={{ width: '130px' }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Form.Select>
        </div>
      </div>

      {propertiesQuery.isError && (
        <Alert variant="danger">Could not load properties. Please try again.</Alert>
      )}

      <LoadingWrapper isLoading={propertiesQuery.isFetching}>
        <Table bordered hover className="align-middle">
          <thead>
            <tr>
              <th className="property-status-cell">Status</th>
              <th>
                <SortableTableHeaderColumn
                  activeField={sortBy}
                  direction={sortDir}
                  field="name"
                  label="Name"
                  onSort={applySort}
                />
              </th>
              <th>Address</th>
              <th className="d-none d-md-table-cell">
                <SortableTableHeaderColumn
                  activeField={sortBy}
                  direction={sortDir}
                  field="type"
                  label="Type"
                  onSort={applySort}
                />
              </th>
              <th className="d-none d-md-table-cell">
                <SortableTableHeaderColumn
                  activeField={sortBy}
                  direction={sortDir}
                  field="level"
                  label="Level"
                  onSort={applySort}
                />
              </th>
              <th className="d-none d-md-table-cell">Price</th>
              <th className="d-none d-md-table-cell">Created At</th>
              <th className="table-action-col"></th>
            </tr>
          </thead>
          <tbody>
            {propertiesList.map((property) => {
              const status = getPropertyStatus(property)

              return (
                <tr key={property.id}>
                  <td className="property-status-cell">
                    <span
                      className={status.className}
                      title={status.label}
                      aria-label={status.label}
                    />
                  </td>
                  <td>{property.name}</td>
                  <td>{property.address}</td>
                  <td className="d-none d-md-table-cell">{property.type}</td>
                  <td className="d-none d-md-table-cell">{property.level}</td>
                  <td className="d-none d-md-table-cell">{property.price.toLocaleString()}</td>
                  <td className="d-none d-md-table-cell">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </td>
                  <td className="table-action-col">
                    <Button onClick={() => navigate(`/properties/${property.id}`)}>Details</Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </LoadingWrapper>

      <div className="d-flex justify-content-between align-items-center">
        <small className="text-muted">Total: {totalCount}</small>
        {propertiesList.length && (
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
