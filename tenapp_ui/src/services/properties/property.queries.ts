import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type SortDirection } from '../sort/sort.service.ts'
import { propertyService } from './property.service.ts'
import type { PropertySortField, PropertyUpsertPayload } from './property.interfaces.ts'

export const propertyQueryKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyQueryKeys.all, 'list'] as const,
  list: (
    page: number,
    pageSize: number,
    sortBy: PropertySortField,
    sortDir: SortDirection,
    search: string,
  ) => [...propertyQueryKeys.lists(), { page, pageSize, sortBy, sortDir, search }] as const,
  details: () => [...propertyQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyQueryKeys.details(), id] as const,
}

export function usePropertiesQuery(
  page: number,
  pageSize: number,
  sortBy: PropertySortField,
  sortDir: SortDirection,
  search: string,
) {
  return useQuery({
    queryKey: propertyQueryKeys.list(page, pageSize, sortBy, sortDir, search),
    queryFn: ({ signal }) =>
      propertyService.getAll(page, pageSize, sortBy, sortDir, search, signal),
  })
}

export function usePropertyQuery(id: string | undefined) {
  return useQuery({
    queryKey: propertyQueryKeys.detail(id ?? ''),
    queryFn: ({ signal }) => propertyService.getById(id ?? '', signal),
    enabled: Boolean(id),
  })
}

export function useAddPropertyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PropertyUpsertPayload) => propertyService.add(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: propertyQueryKeys.lists() })
    },
  })
}

export function useUpdatePropertyMutation(id: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PropertyUpsertPayload) => {
      if (!id) {
        throw new Error('Property id is required.')
      }

      return propertyService.update(id, payload)
    },
    onSuccess: async () => {
      if (id) {
        await queryClient.invalidateQueries({ queryKey: propertyQueryKeys.detail(id) })
      }

      await queryClient.invalidateQueries({ queryKey: propertyQueryKeys.lists() })
    },
  })
}

export function useDeletePropertyMutation(id: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => {
      if (!id) {
        throw new Error('Property id is required.')
      }

      return propertyService.delete(id)
    },
    onSuccess: async () => {
      if (id) {
        queryClient.removeQueries({ queryKey: propertyQueryKeys.detail(id) })
      }

      await queryClient.invalidateQueries({ queryKey: propertyQueryKeys.lists() })
    },
  })
}
