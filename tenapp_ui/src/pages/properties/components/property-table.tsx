import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LoadingWrapper } from '../../../common/components/loading-wrapper/loading-wrapper.tsx'

import {
  getNextSortDirection,
  getSortArrowClasses,
  type SortDirection,
} from '../../../services/sort/sort.service.ts'
import { AppPagination } from '../../../common/components/pagination/app-pagination.tsx'
import { usePropertiesQuery } from '../../../services/properties/property.queries.ts'
import type { PropertySortField } from '../../../services/properties/property.interfaces.ts'

export function PropertyTable() {
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
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name"
              value={searchField}
              onChange={(event) => {
                setSearchField(event.target.value)
              }}
            />
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center gap-2">
          <select
            className="form-select"
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
          </select>
          <select
            className="form-select"
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
          </select>
        </div>
      </div>

      {propertiesQuery.isError && (
        <div className="alert alert-danger">Could not load properties. Please try again.</div>
      )}

      <LoadingWrapper isLoading={propertiesQuery.isFetching}>
        <table className="table table-bordered table-hover align-middle">
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  className={`app-sort-header ${sortBy === 'name' ? 'active' : ''}`}
                  onClick={() => applySort('name')}
                >
                  <span>Name</span>
                  <span className="app-sort-arrows" aria-hidden>
                    <span className={getSortArrowClasses(sortBy === 'name', sortDir, 'asc')}>
                      ^
                    </span>
                    <span
                      className={`${getSortArrowClasses(sortBy === 'name', sortDir, 'desc')} app-sort-arrow-down`}
                    >
                      ^
                    </span>
                  </span>
                </button>
              </th>
              <th>Address</th>
              <th className="d-none d-md-table-cell">
                <button
                  type="button"
                  className={`app-sort-header ${sortBy === 'type' ? 'active' : ''}`}
                  onClick={() => applySort('type')}
                >
                  <span>Type</span>
                  <span className="app-sort-arrows" aria-hidden>
                    <span className={getSortArrowClasses(sortBy === 'type', sortDir, 'asc')}>
                      ^
                    </span>
                    <span
                      className={`${getSortArrowClasses(sortBy === 'type', sortDir, 'desc')} app-sort-arrow-down`}
                    >
                      ^
                    </span>
                  </span>
                </button>
              </th>
              <th className="d-none d-md-table-cell">
                <button
                  type="button"
                  className={`app-sort-header ${sortBy === 'level' ? 'active' : ''}`}
                  onClick={() => applySort('level')}
                >
                  <span>Level</span>
                  <span className="app-sort-arrows" aria-hidden>
                    <span className={getSortArrowClasses(sortBy === 'level', sortDir, 'asc')}>
                      ^
                    </span>
                    <span
                      className={`${getSortArrowClasses(sortBy === 'level', sortDir, 'desc')} app-sort-arrow-down`}
                    >
                      ^
                    </span>
                  </span>
                </button>
              </th>
              <th className="d-none d-md-table-cell">Price</th>
              <th className="d-none d-md-table-cell">Created At</th>
              <th className="table-action-col"></th>
            </tr>
          </thead>
          <tbody>
            {propertiesList.map((property) => {
              return (
                <tr key={property.id} className={property.tenantId ? 'table-info' : ''}>
                  <td>{property.name}</td>
                  <td>{property.address}</td>
                  <td className="d-none d-md-table-cell">{property.type}</td>
                  <td className="d-none d-md-table-cell">{property.level}</td>
                  <td className="d-none d-md-table-cell">{property.price.toLocaleString()}</td>
                  <td className="d-none d-md-table-cell">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </td>
                  <td className="table-action-col">
                    <Link to={`/properties/${property.id}`} className="btn btn-primary">
                      Details
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
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
