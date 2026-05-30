import { Outlet } from 'react-router-dom'
import './auth-layout.css'

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-card-wrap">
        <Outlet />
      </div>
    </div>
  )
}
