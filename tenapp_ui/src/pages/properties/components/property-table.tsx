import { Form, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppPagination } from '../../../components/app-pagination.tsx';
import {
    type Property,
    type PropertySortField,
    propertyService,
    type SortDirection,
} from '../../../services/properties/property.service.ts';

interface PropertyTableProps {
    refreshTrigger: number;
}

export function PropertyTable({ refreshTrigger }: PropertyTableProps) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [sortBy, setSortBy] = useState<PropertySortField>('name');
    const [sortDir, setSortDir] = useState<SortDirection>('asc');

    useEffect(() => {
        setPage(1);
    }, [refreshTrigger]);

    useEffect(() => {
        void propertyService.getAll(page, 20, sortBy, sortDir).then((response) => {
            setProperties(response.items);
            setTotalPages(Math.max(1, response.totalPages));
            setTotalCount(response.totalCount);
        }).catch((error) => {
            console.error('Failed to load properties:', error);
        });
    }, [page, refreshTrigger, sortBy, sortDir]);

    return (
        <>
            <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
                <Form.Select
                    aria-label="Sort properties by field"
                    value={sortBy}
                    onChange={(event) => {
                        setSortBy(event.target.value as PropertySortField);
                        setPage(1);
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
                        setSortDir(event.target.value as SortDirection);
                        setPage(1);
                    }}
                    style={{ width: '130px' }}
                >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </Form.Select>
            </div>

            <Table striped bordered hover className="align-middle">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th className="d-none d-md-table-cell">Type</th>
                        <th className="d-none d-md-table-cell">Level</th>
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
            </Table>

            <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Total: {totalCount}</small>
                <AppPagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        </>
    );
}
