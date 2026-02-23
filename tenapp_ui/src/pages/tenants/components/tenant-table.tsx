import { Pagination, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { tenantService, type Tenant } from '../../../services/tenants/tenant.service.ts';

interface TenantTableProps {
    refreshTrigger: number;
}

export function TenantTable({ refreshTrigger }: TenantTableProps) {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        setPage(1);
    }, [refreshTrigger]);

    useEffect(() => {
        void tenantService.getAll(page, 15).then((response) => {
            setTenants(response.items);
            setTotalPages(Math.max(1, response.totalPages));
            setTotalCount(response.totalCount);
        }).catch((error) => {
            console.error('Failed to load tenants:', error);
        });
    }, [page, refreshTrigger]);

    return (
        <>
            <Table striped bordered hover className="mt-4 align-middle">
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
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
            </Table>

            <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Total: {totalCount}</small>
                <Pagination className="mb-0">
                    <Pagination.Prev onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1} />
                    <Pagination.Item active>{page}</Pagination.Item>
                    <Pagination.Next onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page >= totalPages} />
                </Pagination>
            </div>
        </>
    );
}
