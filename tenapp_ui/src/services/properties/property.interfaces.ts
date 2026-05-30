
export interface Property {
    id: string;
    name: string;
    type: string;
    address: string;
    price: number;
    level: number;
    createdAt: string;
    startDate?: string | null;
    endDate?: string | null;
    tenantId?: string | null;
    tenantFullName?: string | null;
}

export interface PropertyUpsertPayload {
    name: string;
    type: string;
    address: string;
    price: number;
    level: number;
    tenantId?: string | null;
    startDate?: string | null;
    endDate?: string | null;
}

export interface PropertyDailyStats {
    date: string;
    activeLeaseCount: number;
    accumulatedStartedLeaseCount: number;
}

export interface PropertyDailyStatsQuery {
    startDate?: string;
    endDate?: string;
}

export interface PagedResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export type PropertySortField = 'name' | 'type' | 'level';