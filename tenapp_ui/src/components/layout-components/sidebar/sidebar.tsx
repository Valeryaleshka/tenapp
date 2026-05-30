import { NavLink } from 'react-router-dom'
import { navigationLinks } from './navigation-links.ts'

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navClassName = ({ isActive }: { isActive: boolean }) =>
    `app-menu-link ${isActive ? 'active' : ''}`

  return (
    <div className="app-sidebar-content d-flex flex-column h-100">
      <div className="d-none d-md-flex px-3 align-items-center" style={{ height: '75px' }}>
        <div className="fw-semibold fs-5 d-none d-xl-flex">Tenapp</div>
      </div>

      <nav className="d-flex flex-column gap-2 px-3 py-3">
        {navigationLinks.map((link) => {
          const Icon = link.icon

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={navClassName}
              onClick={onNavigate}
              aria-label={link.label}
              title={link.label}
            >
              <Icon className="app-menu-icon" aria-hidden />
              <span className="app-menu-label">{link.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
