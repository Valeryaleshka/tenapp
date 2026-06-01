import { Link } from 'react-router-dom'
import './app-footer.css'


export function AppFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="app-footer border-top">
      <div className="container app-footer-inner">
        <div className="app-footer-brand">
          Tenapp {currentYear}
        </div>

        <nav className="app-footer-links" aria-label="Footer navigation">
          <Link to='/about'>About</Link>
        </nav>
      </div>
    </footer>
  )
}
