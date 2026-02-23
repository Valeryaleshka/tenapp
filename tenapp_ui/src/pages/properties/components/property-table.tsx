import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { type Property, propertyService } from '../../../services/properties/property.service.ts';

interface PropertyTableProps {
    refreshTrigger: number;
}

export function PropertyTable({ refreshTrigger }: PropertyTableProps) {
    const [properties, setProperties] = useState<Property[]>([]);

    useEffect(() => {
        void propertyService.getAll().then(setProperties).catch((error) => {
            console.error('Failed to load properties:', error);
        });
    }, [refreshTrigger]);

    return (
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
    );
}
