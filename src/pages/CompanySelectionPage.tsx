import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ConnectionStatus } from '../components/ConnectionStatus'
import { BrandMark, Icon } from '../components/Icon'
import { useCompanies } from '../context/CompanyContext'

export function CompanySelectionPage() {
  const { companies, error, isLoading } = useCompanies()

  return (
    <div className="selection-page">
      <header className="selection-header">
        <div className="brand-lockup">
          <BrandMark />
          <div><span className="brand-name">Operations Portal</span><span className="brand-product">AutoCount Cloud Accounting</span></div>
        </div>
        <div className="selection-support"><Icon name="help" size={17} /><span>Need help?</span></div>
      </header>

      <main className="selection-main">
        <div className="selection-intro">
          <p className="kicker">Company workspace</p>
          <h1>Select a company</h1>
          <p>Choose the account book you want to work with. The selected company remains visible in the URL and throughout the portal.</p>
        </div>

        {isLoading && <div className="loading-panel">Loading company configuration…</div>}
        {error && <div className="selection-error">{error} Start the backend with <strong>npm run dev</strong> and try again.</div>}
        {!isLoading && !error && (
          <div className="company-grid">
            {companies.map((company) => (
              <article className="company-card" style={{ '--company-accent': company.accent } as CSSProperties} key={company.slug}>
                <div className="company-card-head"><span className="company-avatar">{company.initials}</span><ConnectionStatus status={company.status} /></div>
                <h2>{company.displayName}</h2>
                <p>{company.statusMessage}</p>
                <div className="company-meta"><Icon name="building" size={15} /><span>{company.shortName} workspace</span></div>
                <Link className="company-action" to={`/companies/${company.slug}`}>
                  <span>{company.status === 'configured' ? 'Open company' : 'Preview workspace'}</span><Icon name="arrow" size={17} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
