import { Suspense } from 'react'
import { Spinner } from 'react-bootstrap'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'
import {
  AboutPage,
  CountPage,
  ForgotPasswordPage,
  LoginPage,
  PropertyDetailPage,
  PropertiesPage,
  RegisterPage,
  ResetPasswordPage,
  SettingsPage,
  TenantDetailPage,
  TenantsPage,
} from './common/routes/lazy-pages.ts'
import { AppLayout } from './components/layout-components/layout/app-layout.tsx'
import { AuthLayout } from './components/layout-components/auth-layout/auth-layout.tsx'
import { useAuth } from './common/hooks/useAuth.ts'

function RouteLoadingFallback() {
  return (
    <div className="container py-5 d-flex justify-content-center align-items-center">
      <Spinner animation="border" variant="primary" role="status" aria-label="Loading page" />
    </div>
  )
}

function RequireAuth() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicOnly() {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />
}

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="container vh-100 d-flex justify-content-center align-items-center">
        <Spinner
          animation="border"
          variant="primary"
          role="status"
          aria-label="Loading application"
        />
      </div>
    )
  }

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />

        <Route element={<PublicOnly />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/count" element={<CountPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            <Route path="/tenants" element={<TenantsPage />} />
            <Route path="/tenants/:id" element={<TenantDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/properties' : '/login'} replace />}
        />
      </Routes>
    </Suspense>
  )
}

export default App
