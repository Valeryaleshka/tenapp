
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import './App.css';
import { AppLayout } from './components/layout-components/layout/app-layout.tsx';
import { ForgotPasswordPage } from './pages/login/forgot-password/forgot-password-page.tsx';
import { LoginPage } from './pages/login/login/login-page.tsx';
import { PropertyDetailPage } from './pages/properties/property-detail-page.tsx';
import { PropertiesPage } from './pages/properties/properties-page.tsx';
import { RegisterPage } from './pages/login/register/register-page.tsx';
import { ResetPasswordPage } from './pages/login/reset/reset-password-page.tsx';
import { SettingsPage } from './pages/settings/settings-page.tsx';
import { TenantDetailPage } from './pages/tenants/tenant-detail-page.tsx';
import { TenantsPage } from './pages/tenants/tenants-page.tsx';
import {useAuth} from "./common/hooks/useAuth.ts";

function AuthLayout() {
    return (
        <div className="auth-layout">
            <div className="auth-card-wrap">
                <Outlet />
            </div>
        </div>
    );
}

function RequireAuth() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnly() {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

function App() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="container vh-100 d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary" role="status" aria-label="Loading application" />
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />

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
                    <Route path="/properties" element={<PropertiesPage />} />
                    <Route path="/properties/:id" element={<PropertyDetailPage />} />
                    <Route path="/tenants" element={<TenantsPage />} />
                    <Route path="/tenants/:id" element={<TenantDetailPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to={isAuthenticated ? '/properties' : '/login'} replace />} />
        </Routes>
    );
}

export default App;
