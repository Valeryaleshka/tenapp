import { useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../common/hooks/useAuth.ts'
import type { AppHeaderProps } from './app-header.interfaces.ts'

export function AppHeader({ action, settingsInitial }: AppHeaderProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await logout()
      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="app-top-header d-flex align-items-center justify-content-between px-3 px-lg-4 py-3 border-bottom">
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary border-0 d-lg-none"
          onClick={() => action()}
          aria-label="Open menu"
        >
          &#9776;
        </button>
      </div>
      <div className="d-flex align-items-center gap-3">
        <Dropdown align="end">
          <Dropdown.Toggle
            as="button"
            className="app-account-button"
            id="account-menu-toggle"
            aria-label="Open account menu"
            title="Account menu"
          >
            {settingsInitial}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/settings">
              Settings
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
              as="button"
              className="text-danger"
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  )
}
