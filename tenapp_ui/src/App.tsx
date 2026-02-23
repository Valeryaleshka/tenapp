
import { Container, Spinner } from 'react-bootstrap';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import './App.css';
import { AppLayout } from './components/app-layout.tsx';
import { useAuth } from './context/auth-context.tsx';
import { ForgotPasswordPage } from './pages/login/forgot-password-page.tsx';
import { LoginPage } from './pages/login/login-page.tsx';
import { PropertyDetailPage } from './pages/properties/property-detail-page.tsx';
import { PropertiesPage } from './pages/properties/properties-page.tsx';
import { RegisterPage } from './pages/login/register-page.tsx';
import { ResetPasswordPage } from './pages/login/reset-password-page.tsx';
import { TenantDetailPage } from './pages/tenants/tenant-detail-page.tsx';
import { TenantsPage } from './pages/tenants/tenants-page.tsx';

function AuthLayout() {
    return (
        <Container className="vh-100 d-flex align-items-center justify-content-center">
            <div className="w-100" style={{ maxWidth: '420px' }}>
                <Outlet />
            </div>
        </Container>
    );
}

function RequireAuth() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnly() {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? <Outlet /> : <Navigate to="/properties" replace />;
}

function App() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Container className="vh-100 d-flex justify-content-center align-items-center">
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Navigate to={isAuthenticated ? '/properties' : '/login'} replace />} />

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
                </Route>
            </Route>

            <Route path="*" element={<Navigate to={isAuthenticated ? '/properties' : '/login'} replace />} />
        </Routes>
    );
}

export default App;
