export interface User {
  id: string
  email: string
  firstName: string
  secondName?: string
  lastName?: string
  login?: string
  phoneNumber?: string | null
  logoUrl?: string | null
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  firstName: string
  secondName: string
}

export interface ResetPasswordPayload {
  email: string
  token: string
  newPassword: string
}

export interface UpdateAccountPayload {
  firstName: string
  secondName: string
  email: string
  phoneNumber?: string | null
}
