import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { tenantService, type Tenant } from '../../../services/tenants/tenant.service.ts';

interface TenantTableProps {
    refreshTrigger: number;
}

export function TenantTable({ refreshTrigger }: TenantTableProps) {
    const [tenants, setTenants] = useState<Tenant[]>([]);

    useEffect(() => {
        void tenantService.getAll().then(setTenants).catch((error) => {
            console.error('Failed to load tenants:', error);
        });
    }, [refreshTrigger]);

    return (
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
    );
}
