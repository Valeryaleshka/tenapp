import {
  API_BASE_URL,
  REFRESH_ENDPOINTS,
  REFRESH_EXCLUDED_ENDPOINTS,
} from './api-client.constants.ts'
import type { QueryParams } from './api-client.interfaces.ts'

export const matchesEndpoint = (url: string, endpoints: readonly string[]): boolean => {
  return endpoints.some((endpoint) => url.includes(endpoint))
}

export const isRefreshEndpoint = (url: string): boolean => {
  return matchesEndpoint(url, REFRESH_ENDPOINTS)
}

export const isExcludedFromRefresh = (url: string): boolean => {
  return matchesEndpoint(url, REFRESH_EXCLUDED_ENDPOINTS)
}

export const buildUrl = (path: string, params?: QueryParams): string => {
  const searchParams = new URLSearchParams()

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`
}

export const parseResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return undefined
  }

  const text = await response.text()

  if (!text) {
    return undefined
  }

  const contentType = response.headers.get('content-type') ?? ''
  return contentType.includes('application/json') ? JSON.parse(text) : text
}
