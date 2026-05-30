import { useContext } from 'react'
import { AuthContext } from '../../context/auth/auth-context.tsx'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
