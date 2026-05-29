import { Link } from 'react-router-dom';
import type {AppHeaderProps} from "./app-header.interfaces.ts";

export function AppHeader({ action, settingsInitial}: AppHeaderProps) {
    return    <header className="app-top-header d-flex align-items-center justify-content-between px-3 px-lg-4 py-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
            <button
                type="button"
                className="btn btn-outline-secondary d-lg-none"
                onClick={() => action()}
                aria-label="Open menu"
            >
                &#9776;
            </button>
            <div className="fw-semibold d-lg-none">Tenapp</div>
        </div>
        <div className="d-flex align-items-center gap-3">
            <Link to="/settings" className="app-account-button" aria-label="Account settings" title="Account settings">
                {settingsInitial}
            </Link>
        </div>
    </header>
}
