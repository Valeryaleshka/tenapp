import type { User } from './auth.interfaces.ts'

export const extractUser = (data: unknown): User | null => {
  if (typeof data !== 'object' || data === null) {
    return null
  }

  if ('user' in data) {
    return (data as { user: User }).user
  }

  return data as User
}
