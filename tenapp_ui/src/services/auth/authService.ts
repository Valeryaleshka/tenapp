import { ApiClient } from '../api/api-client.ts'
import { extractUser } from './auth.helpers.ts'
import type {
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateAccountPayload,
  User,
} from './auth.interfaces.ts'

export type {
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateAccountPayload,
  User,
} from './auth.interfaces.ts'

export const AuthService = {
  async register(payload: RegisterPayload): Promise<User | null> {
    const response = await ApiClient.post<unknown>('/auth/register', payload)
    return extractUser(response.data)
  },

  async login(payload: LoginPayload): Promise<User | null> {
    const response = await ApiClient.post<unknown>('/auth/login', payload)
    return extractUser(response.data)
  },

  async logout(): Promise<void> {
    await ApiClient.post('/auth/logout')
  },

  async refresh(): Promise<void> {
    await ApiClient.post('/auth/refresh')
  },

  async me(): Promise<User> {
    const response = await ApiClient.get<unknown>('/auth/me')
    const user = extractUser(response.data)

    if (!user) {
      throw new Error('Failed to load current user')
    }

    return user
  },

  async updateAccount(payload: UpdateAccountPayload): Promise<User> {
    const response = await ApiClient.put<unknown>('/auth/account', payload)
    const user = extractUser(response.data)

    if (!user) {
      throw new Error('Failed to update account')
    }

    return user
  },

  async forgotPassword(email: string): Promise<void> {
    await ApiClient.post('/auth/forgot-password', { email })
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await ApiClient.post('/auth/reset-password', payload)
  },
}
