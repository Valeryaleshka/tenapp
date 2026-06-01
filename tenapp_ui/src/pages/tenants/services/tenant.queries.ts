import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type SortDirection } from '../../../common/services/sort/sort.service.ts'
import {
  tenantService,
  type CreateTenantPayload,
  type TenantSortField,
} from './tenant.service.ts'

export const tenantQueryKeys = {
  all: ['tenants'] as const,
  lists: () => [...tenantQueryKeys.all, 'list'] as const,
  list: (page: number, pageSize: number, sortBy: TenantSortField, sortDir: SortDirection) =>
    [...tenantQueryKeys.lists(), { page, pageSize, sortBy, sortDir }] as const,
  details: () => [...tenantQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...tenantQueryKeys.details(), id] as const,
}

export function useTenantsQuery(
  page: number,
  pageSize: number,
  sortBy: TenantSortField,
  sortDir: SortDirection,
) {
  return useQuery({
    queryKey: tenantQueryKeys.list(page, pageSize, sortBy, sortDir),
    queryFn: ({ signal }) => tenantService.getAll(page, pageSize, sortBy, sortDir, signal),
  })
}

export function useTenantQuery(id: string | undefined) {
  return useQuery({
    queryKey: tenantQueryKeys.detail(id ?? ''),
    queryFn: ({ signal }) => tenantService.getById(id ?? '', signal),
    enabled: Boolean(id),
  })
}

export function useAddTenantMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTenantPayload) => tenantService.add(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantQueryKeys.lists() })
    },
  })
}

export function useUpdateTenantMutation(id: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTenantPayload) => {
      if (!id) {
        throw new Error('Tenant id is required.')
      }

      return tenantService.update(id, payload)
    },
    onSuccess: async () => {
      if (id) {
        await queryClient.invalidateQueries({ queryKey: tenantQueryKeys.detail(id) })
      }

      await queryClient.invalidateQueries({ queryKey: tenantQueryKeys.lists() })
    },
  })
}

export function useDeleteTenantMutation(id: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => {
      if (!id) {
        throw new Error('Tenant id is required.')
      }

      return tenantService.delete(id)
    },
    onSuccess: async () => {
      if (id) {
        queryClient.removeQueries({ queryKey: tenantQueryKeys.detail(id) })
      }

      await queryClient.invalidateQueries({ queryKey: tenantQueryKeys.lists() })
    },
  })
}
