export interface PropertySelect {
  id: string
  name: string
}

export interface PropertySelectQuery {
  search?: string
  limit?: number
  selectedPropertyId?: string | null
}
