import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppPagination } from '../../../components/app-pagination.tsx';
import { LoadingWrapper } from '../../../components/loading-wrapper.tsx';
import {
    type Property,
    type PropertySortField,
    propertyService,
} from '../../../services/properties/property.service.ts';
import {
    getNextSortDirection,
    getSortArrowClasses,
    type SortDirection,
} from '../../../services/sort/sort.service.ts';

export function PropertyTable() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [sortBy, setSortBy] = useState<PropertySortField>('name');
    const [sortDir, setSortDir] = useState<SortDirection>('asc');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        let isCancelled = false;

        void propertyService.getAll(page, 20, sortBy, sortDir, controller.signal).then((response) => {
            if (isCancelled) {
                return;
            }

            setProperties(response.items);
            setTotalPages(Math.max(1, response.totalPages));
            setTotalCount(response.totalCount);
        }).catch((error) => {
            if (!isCancelled) {
                console.error('Failed to load properties:', error);
            }
        }).finally(() => {
            if (!isCancelled) {
                setIsLoading(false);
            }
        });

        return () => {
            controller.abort();
            isCancelled = true;
        };
    }, [page, sortBy, sortDir]);

    const applySort = (field: PropertySortField) => {
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
                    aria-label="Sort properties by field"
                    value={sortBy}
                    onChange={(event) => {
                        setIsLoading(true);
                        setSortBy(event.target.value as PropertySortField);
                        setPage(1);
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
                <table className="table table-striped table-bordered table-hover align-middle">
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
                                        <span className={getSortArrowClasses(sortBy === 'name', sortDir, 'asc')}>^</span>
                                        <span className={`${getSortArrowClasses(sortBy === 'name', sortDir, 'desc')} app-sort-arrow-down`}>^</span>
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
                                        <span className={getSortArrowClasses(sortBy === 'type', sortDir, 'asc')}>^</span>
                                        <span className={`${getSortArrowClasses(sortBy === 'type', sortDir, 'desc')} app-sort-arrow-down`}>^</span>
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
                                        <span className={getSortArrowClasses(sortBy === 'level', sortDir, 'asc')}>^</span>
                                        <span className={`${getSortArrowClasses(sortBy === 'level', sortDir, 'desc')} app-sort-arrow-down`}>^</span>
                                    </span>
                                </button>
                            </th>
                            <th className="d-none d-md-table-cell">Price</th>
                            <th className="d-none d-md-table-cell">Created At</th>
                            <th className="table-action-col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {properties.map((property) => (
                            <tr key={property.id} className={property.tenantId ? 'table-info' : ''}>
                                <td>{property.name}</td>
                                <td>{property.address}</td>
                                <td className="d-none d-md-table-cell">{property.type}</td>
                                <td className="d-none d-md-table-cell">{property.level}</td>
                                <td className="d-none d-md-table-cell">{property.price.toLocaleString()}</td>
                                <td className="d-none d-md-table-cell">{new Date(property.createdAt).toLocaleDateString()}</td>
                                <td className="table-action-col">
                                    <Link to={`/properties/${property.id}`} className="btn btn-primary">
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
