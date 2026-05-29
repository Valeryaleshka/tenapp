
import {NavLink, useNavigate} from "react-router-dom";
import {navigationLinks} from "./navigation-links.ts";
import {useAuth} from "../../../common/hooks/useAuth.ts";

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
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

            <div className="px-3 py-3 border-bottom d-none d-lg-flex">
                <div className="fw-semibold fs-5">Tenapp</div>
            </div>

            <nav className="d-flex flex-column gap-2 px-3 py-3">
                {navigationLinks.map((link) => {
                    return <NavLink key={link.path} to={link.path} className={navClassName} onClick={onNavigate}>
                        {link.label}
                    </NavLink>
                })}
            </nav>

            <div className="mt-auto p-3 border-top">
                <button type="button" className="btn btn-outline-danger w-100" onClick={() => void handleLogout()}>
                    Logout
                </button>
            </div>
        </div>
    );
}
