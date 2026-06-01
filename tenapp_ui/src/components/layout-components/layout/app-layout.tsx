import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from '../sidebar/sidebar.tsx'
import { AppHeader } from '../header/app-header.tsx'
import { AppFooter } from '../footer/app-footer.tsx'
import { Offcanvas } from 'react-bootstrap'
import { useAuth } from '../../../common/hooks/useAuth.ts'
import './app-layout.css'

export function AppLayout() {
  const { user } = useAuth()
  const [showDrawer, setShowDrawer] = useState(false)
  const settingsInitial = (
    user?.firstName?.trim().charAt(0) ||
    user?.email?.trim().charAt(0) ||
    'U'
  ).toUpperCase()

  return (
    <div className="app-shell d-flex">
      <div className="app-sidebar d-none d-lg-flex">
        <AppSidebar />
      </div>

      <div className="app-main flex-grow-1 d-flex flex-column">
        <AppHeader action={() => setShowDrawer(true)} settingsInitial={settingsInitial} />

        <main className="app-content flex-grow-1">
          <Outlet />
        </main>

        <AppFooter />
      </div>

      <Offcanvas show={showDrawer} onHide={() => setShowDrawer(false)}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <AppSidebar onNavigate={() => setShowDrawer(false)} />
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  )
}
