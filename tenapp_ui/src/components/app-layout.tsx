import { useState } from 'react';
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
                <button type="button" className="btn btn-outline-danger w-100" onClick={() => void handleLogout()}>
                    Logout
                </button>
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
                        <button
                            type="button"
                            className="btn btn-outline-secondary d-lg-none"
                            onClick={() => setShowDrawer(true)}
                            aria-label="Open menu"
                        >
                            &#9776;
                        </button>
                        <div className="fw-semibold d-lg-none">Tenapp</div>
                    </div>
                    <div className="fw-semibold fs-5 app-greeting">Hello, {displayName}!</div>
                </header>

                <main className="app-content flex-grow-1">
                    <Outlet />
                </main>
            </div>

            <div
                className={`offcanvas offcanvas-start d-lg-none ${showDrawer ? 'show' : ''}`}
                tabIndex={-1}
                style={{ visibility: showDrawer ? 'visible' : 'hidden' }}
                aria-labelledby="mobile-menu-title"
                aria-hidden={!showDrawer}
            >
                <div className="offcanvas-header">
                    <h5 id="mobile-menu-title" className="offcanvas-title">Menu</h5>
                    <button type="button" className="btn-close" aria-label="Close menu" onClick={() => setShowDrawer(false)} />
                </div>
                <div className="offcanvas-body p-0">
                    <SidebarContent onNavigate={() => setShowDrawer(false)} />
                </div>
            </div>
            {showDrawer && <div className="offcanvas-backdrop fade show d-lg-none" onClick={() => setShowDrawer(false)} />}
        </div>
    );
}
