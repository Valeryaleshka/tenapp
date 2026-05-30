export type QueryParams = Record<string, string | number | boolean | null | undefined>

export interface ApiRequestOptions {
  params?: QueryParams
  signal?: AbortSignal
}

export interface ApiResponse<T> {
  data: T
}

export interface ApiRequestConfig extends ApiRequestOptions {
  body?: unknown
  method: 'DELETE' | 'GET' | 'POST' | 'PUT'
  retry?: boolean
}
