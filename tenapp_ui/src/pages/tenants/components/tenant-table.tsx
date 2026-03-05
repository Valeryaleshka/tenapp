import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppPagination } from '../../../components/app-pagination.tsx';
import { LoadingWrapper } from '../../../components/loading-wrapper.tsx';
import {
    tenantService,
    type Tenant,
    type TenantSortField,
} from '../../../services/tenants/tenant.service.ts';
import {
    getNextSortDirection,
    getSortArrowClasses,
    type SortDirection,
} from '../../../services/sort/sort.service.ts';

export function TenantTable() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [sortBy, setSortBy] = useState<TenantSortField>('firstName');
    const [sortDir, setSortDir] = useState<SortDirection>('asc');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isCancelled = false;

        void tenantService.getAll(page, 20, sortBy, sortDir).then((response) => {
            if (isCancelled) {
                return;
            }

            setTenants(response.items);
            setTotalPages(Math.max(1, response.totalPages));
            setTotalCount(response.totalCount);
        }).catch((error) => {
            if (!isCancelled) {
                console.error('Failed to load tenants:', error);
            }
        }).finally(() => {
            if (!isCancelled) {
                setIsLoading(false);
            }
        });

        return () => {
            isCancelled = true;
        };
    }, [page, sortBy, sortDir]);

    const applySort = (field: TenantSortField) => {
        const nextDirection = getNextSortDirection(sortBy, field, sortDir);
        setIsLoading(true);
        setSortBy(field);
        setSortDir(nextDirection);
        setPage(1);
    };

    const handlePageChange = (nextPage: number) => {
        setIsLoading(true);
        setPage(nextPage);
    };

    return (
        <>
            <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
                <select
                    className="form-select"
                    aria-label="Sort tenants by field"
                    value={sortBy}
                    onChange={(event) => {
                        setIsLoading(true);
                        setSortBy(event.target.value as TenantSortField);
                        setPage(1);
                    }}
                    style={{ width: '200px' }}
                >
                    <option value="firstName">Sort: First Name</option>
                    <option value="lastName">Sort: Last Name</option>
                </select>
                <select
                    className="form-select"
                    aria-label="Sort tenants direction"
                    value={sortDir}
                    onChange={(event) => {
                        setIsLoading(true);
                        setSortDir(event.target.value as SortDirection);
                        setPage(1);
                    }}
                    style={{ width: '130px' }}
                >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>

            <LoadingWrapper isLoading={isLoading}>
                <table className="table table-striped table-bordered table-hover mt-4 align-middle">
                    <thead>
                        <tr>
                            <th>
                                <button
                                    type="button"
                                    className={`app-sort-header ${sortBy === 'firstName' ? 'active' : ''}`}
                                    onClick={() => applySort('firstName')}
                                >
                                    <span>First Name</span>
                                    <span className="app-sort-arrows" aria-hidden>
                                        <span className={getSortArrowClasses(sortBy === 'firstName', sortDir, 'asc')}>^</span>
                                        <span className={`${getSortArrowClasses(sortBy === 'firstName', sortDir, 'desc')} app-sort-arrow-down`}>^</span>
                                    </span>
                                </button>
                            </th>
                            <th>
                                <button
                                    type="button"
                                    className={`app-sort-header ${sortBy === 'lastName' ? 'active' : ''}`}
                                    onClick={() => applySort('lastName')}
                                >
                                    <span>Last Name</span>
                                    <span className="app-sort-arrows" aria-hidden>
                                        <span className={getSortArrowClasses(sortBy === 'lastName', sortDir, 'asc')}>^</span>
                                        <span className={`${getSortArrowClasses(sortBy === 'lastName', sortDir, 'desc')} app-sort-arrow-down`}>^</span>
                                    </span>
                                </button>
                            </th>
                            <th>Phone</th>
                            <th className="d-none d-md-table-cell">Email</th>
                            <th className="d-none d-md-table-cell">Assigned Property</th>
                            <th className="d-none d-md-table-cell">Created At</th>
                            <th className="table-action-col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} className={tenant.assignedProperties.length > 0 ? 'table-info' : ''}>
                                <td>{tenant.firstName}</td>
                                <td>{tenant.lastName}</td>
                                <td>{tenant.phoneNumber}</td>
                                <td className="d-none d-md-table-cell">{tenant.email}</td>
                                <td className="d-none d-md-table-cell">{tenant.assignedProperties.join(', ') || 'Unassigned'}</td>
                                <td className="d-none d-md-table-cell">{new Date(tenant.createdAt).toLocaleDateString()}</td>
                                <td className="table-action-col">
                                    <Link to={`/tenants/${tenant.id}`} className="btn btn-primary">
                                        Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </LoadingWrapper>

            <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Total: {totalCount}</small>
                <AppPagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
        </>
    );
}
