import { NavLink, Outlet, useLocation, useParams } from 'react-router-dom'
import { ConnectionStatus } from '../components/ConnectionStatus'
import { BrandMark, Icon, type IconName } from '../components/Icon'
import { useCompanies } from '../context/CompanyContext'
import { sectors } from '../data/sectors'
import { NotFoundPage } from '../pages/NotFoundPage'

const navIcons: Record<string, IconName> = { sales: 'sales', purchase: 'purchase', accounting: 'ledger' }

export function CompanyLayout() {
  const { companySlug } = useParams()
  const location = useLocation()
  const { findCompany, isLoading } = useCompanies()
  const company = findCompany(companySlug)

  if (isLoading) return <div className="not-found"><p>Loading company…</p></div>
  if (!company || !companySlug) return <NotFoundPage message="This company is not in the portal configuration." />

  const pathSection = location.pathname.split('/').filter(Boolean).at(-1)
  const currentSection = sectors.find((sector) => sector.key === pathSection)?.title ?? 'Overview'

  return (
    <div className="portal-shell">
      <aside className="sidebar">
        <div className="brand-lockup"><BrandMark /><div><span className="brand-name">Operations</span><span className="brand-product">AutoCount Portal</span></div></div>
        <div className="sidebar-company"><span className="company-avatar">{company.initials}</span><div><strong>{company.displayName}</strong><small>Active company</small></div></div>
        <nav className="sidebar-nav" aria-label="Company navigation">
          <p className="nav-label">Workspace</p>
          <NavLink className="nav-link" end to={`/companies/${companySlug}`}><Icon name="dashboard" size={18} /><span>Overview</span></NavLink>
          {sectors.map((sector) => (
            <NavLink className="nav-link" key={sector.key} to={`/companies/${companySlug}/${sector.key}`}>
              <Icon name={navIcons[sector.key]} size={18} /><span>{sector.title}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer"><NavLink className="nav-link" to="/"><Icon name="switch" size={18} /><span>Switch company</span></NavLink></div>
      </aside>

      <div className="portal-content">
        <header className="topbar">
          <div className="breadcrumb">{company.shortName} &nbsp;/&nbsp; <strong>{currentSection}</strong></div>
          <div className="topbar-actions"><ConnectionStatus status={company.status} /><span className="topbar-icon"><Icon name="settings" size={17} /></span><span className="user-chip">AD</span></div>
        </header>
        <Outlet context={{ company }} />
      </div>
    </div>
  )
}
