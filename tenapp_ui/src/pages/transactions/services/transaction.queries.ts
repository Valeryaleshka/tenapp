import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { transactionService } from './transaction.service.ts'
import type { CreateTransactionPayload } from './transaction.interfaces.ts'

export const transactionQueryKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionQueryKeys.all, 'list'] as const,
  list: (page: number, pageSize: number) =>
    [...transactionQueryKeys.lists(), { page, pageSize }] as const,
  categories: () => [...transactionQueryKeys.all, 'categories'] as const,
}

export function useTransactionsQuery(page: number, pageSize: number) {
  return useQuery({
    queryKey: transactionQueryKeys.list(page, pageSize),
    queryFn: ({ signal }) => transactionService.getAll(page, pageSize, signal),
  })
}

export function useTransactionCategoriesQuery() {
  return useQuery({
    queryKey: transactionQueryKeys.categories(),
    queryFn: ({ signal }) => transactionService.getCategories(signal),
  })
}

export function useAddTransactionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => transactionService.add(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: transactionQueryKeys.lists() })
    },
  })
}
