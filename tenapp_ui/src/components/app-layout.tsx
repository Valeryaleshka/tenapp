import { useState } from 'react';
import { Button, Offcanvas } from 'react-bootstrap';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context.tsx';

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const navClassName = ({ isActive }: { isActive: boolean }) =>
        `app-menu-link ${isActive ? 'active' : ''}`;

    return (
        <div className="app-sidebar-content d-flex flex-column h-100">
            <div className="px-3 py-3 border-bottom">
                <div className="fw-semibold fs-5">Tenapp</div>
            </div>

            <nav className="d-flex flex-column gap-2 px-3 py-3">
                <NavLink to="/properties" className={navClassName} onClick={onNavigate}>
                    Property
                </NavLink>
                <NavLink to="/tenants" className={navClassName} onClick={onNavigate}>
                    Tenants
                </NavLink>
            </nav>

            <div className="mt-auto p-3 border-top">
                <Button variant="outline-danger" className="w-100" onClick={() => void handleLogout()}>
                    Logout
                </Button>
            </div>
        </div>
    );
}

export function AppLayout() {
    const { user } = useAuth();
    const [showDrawer, setShowDrawer] = useState(false);
    const displayName = `${user?.firstName ?? ''} ${user?.secondName ?? user?.lastName ?? ''}`.trim() || user?.login || 'User';

    return (
        <div className="app-shell d-flex">
            <aside className="app-sidebar d-none d-lg-flex">
                <SidebarContent />
            </aside>

            <div className="app-main flex-grow-1 d-flex flex-column">
                <header className="app-top-header d-flex align-items-center justify-content-between px-3 px-lg-4 py-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowDrawer(true)}
                            aria-label="Open menu"
                            className="d-lg-none"
                        >
                            &#9776;
                        </Button>
                        <div className="fw-semibold d-lg-none">Tenapp</div>
                    </div>
                    <div className="fw-medium app-greeting">Hello, {displayName}!</div>
                </header>

                <main className="app-content flex-grow-1">
                    <Outlet />
                </main>
            </div>

            <Offcanvas show={showDrawer} onHide={() => setShowDrawer(false)} placement="start" className="d-lg-none">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <SidebarContent onNavigate={() => setShowDrawer(false)} />
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
}
