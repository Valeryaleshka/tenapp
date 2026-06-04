export interface Transaction {
  id: string
  propertyId: string
  propertyName: string
  tenantId: string
  tenantFullName: string
  amount: number
  date: string
  categoryId: number
  categoryName: string
  createdAt: string
}

export interface Category {
  id: number
  name: string
}

export interface CreateTransactionPayload {
  propertyId: string
  tenantId: string
  amount: number
  date: string
  categoryId: number
}

export interface PagedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}
