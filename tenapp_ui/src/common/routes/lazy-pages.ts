import { lazy } from 'react'

export const AboutPage = lazy(() =>
  import('../../pages/about/about-page.tsx').then((module) => ({
    default: module.AboutPage,
  })),
)

export const ForgotPasswordPage = lazy(() =>
  import('../../pages/login/forgot-password/forgot-password-page.tsx').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
)

export const LoginPage = lazy(() =>
  import('../../pages/login/login/login-page.tsx').then((module) => ({
    default: module.LoginPage,
  })),
)

export const PropertyDetailPage = lazy(() =>
  import('../../pages/properties/property-detail-page.tsx').then((module) => ({
    default: module.PropertyDetailPage,
  })),
)

export const PropertiesPage = lazy(() =>
  import('../../pages/properties/properties-page.tsx').then((module) => ({
    default: module.PropertiesPage,
  })),
)

export const RegisterPage = lazy(() =>
  import('../../pages/login/register/register-page.tsx').then((module) => ({
    default: module.RegisterPage,
  })),
)

export const ResetPasswordPage = lazy(() =>
  import('../../pages/login/reset/reset-password-page.tsx').then((module) => ({
    default: module.ResetPasswordPage,
  })),
)

export const SettingsPage = lazy(() =>
  import('../../pages/settings/settings-page.tsx').then((module) => ({
    default: module.SettingsPage,
  })),
)

export const TenantDetailPage = lazy(() =>
  import('../../pages/tenants/tenant-detail-page.tsx').then((module) => ({
    default: module.TenantDetailPage,
  })),
)

export const TenantsCreatedAtAccountPage = lazy(() =>
  import('../../pages/tenants/tenants-created-at-account-page.tsx').then((module) => ({
    default: module.TenantsCreatedAtAccountPage,
  })),
)

export const TenantsPage = lazy(() =>
  import('../../pages/tenants/tenants-page.tsx').then((module) => ({
    default: module.TenantsPage,
  })),
)
