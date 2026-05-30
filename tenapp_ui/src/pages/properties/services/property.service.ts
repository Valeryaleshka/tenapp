import { ApiClient } from '../../../common/services/api/api-client.ts'
import { type SortDirection } from '../../../common/services/sort/sort.service.ts'
import type {
  PagedResponse,
  Property,
  PropertyDailyStats,
  PropertyDailyStatsQuery,
  PropertySortField,
  PropertyUpsertPayload,
} from './property.interfaces.ts'

export const propertyService = {
  getAll: async (
    page = 1,
    pageSize = 20,
    sortBy: PropertySortField = 'name',
    sortDir: SortDirection = 'asc',
    search = '',
    signal?: AbortSignal,
  ): Promise<PagedResponse<Property>> => {
    const response = await ApiClient.get<PagedResponse<Property>>('/properties', {
      signal,
      params: { page, pageSize, sortBy, sortDir, search: search || undefined },
    })
    return response.data
  },

  getById: async (id: string, signal?: AbortSignal): Promise<Property> => {
    const response = await ApiClient.get<Property>(`/properties/${id}`, { signal })
    return response.data
  },

  add: async (property: PropertyUpsertPayload): Promise<Property> => {
    const response = await ApiClient.post<Property>('/properties', property)
    return response.data
  },

  getDailyStats: async (
    query: PropertyDailyStatsQuery = {},
    signal?: AbortSignal,
  ): Promise<PropertyDailyStats[]> => {
    const response = await ApiClient.get<PropertyDailyStats[]>('/properties/daily-stats', {
      signal,
      params: {
        startDate: query.startDate || undefined,
        endDate: query.endDate || undefined,
      },
    })
    return response.data
  },

  update: async (id: string, property: PropertyUpsertPayload): Promise<Property> => {
    const response = await ApiClient.put<Property>(`/properties/${id}`, property)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await ApiClient.delete(`/properties/${id}`)
  },
}
