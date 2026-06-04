import { ApiClient } from '../../../common/services/api/api-client.ts'
import type {
  Category,
  CreateTransactionPayload,
  PagedResponse,
  Transaction,
} from './transaction.interfaces.ts'

export const transactionService = {
  getAll: async (
    page = 1,
    pageSize = 30,
    signal?: AbortSignal,
  ): Promise<PagedResponse<Transaction>> => {
    const response = await ApiClient.get<PagedResponse<Transaction>>('/transactions', {
      signal,
      params: { page, pageSize },
    })
    return response.data
  },

  getCategories: async (signal?: AbortSignal): Promise<Category[]> => {
    const response = await ApiClient.get<Category[]>('/transactions/categories', { signal })
    return response.data
  },

  add: async (payload: CreateTransactionPayload): Promise<Transaction> => {
    const response = await ApiClient.post<Transaction>('/transactions', payload)
    return response.data
  },
}
