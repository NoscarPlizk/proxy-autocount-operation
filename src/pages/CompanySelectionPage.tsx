import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ConnectionStatus } from '../components/ConnectionStatus'
import { BrandMark, Icon } from '../components/Icon'
import { useCompanies } from '../context/CompanyContext'

export function CompanySelectionPage() {
  const { companies, companyFileCount, configuredCompanyCount, error, isLoading } = useCompanies()

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
          <p className="selection-description">Choose the account book you want to work with. The selected company remains visible in the URL and throughout the portal.</p>
          {!isLoading && !error && (
            <p className="company-count">
              <strong>{configuredCompanyCount}</strong> {configuredCompanyCount === 1 ? 'company account' : 'company accounts'} available
              <span>{companyFileCount} {companyFileCount === 1 ? 'configuration file' : 'configuration files'} detected</span>
            </p>
          )}
        </div>

        {isLoading && <div className="loading-panel">Loading company configuration…</div>}
        {error && <div className="selection-error">{error} Start the backend with <strong>npm run dev</strong> and try again.</div>}
        {!isLoading && !error && (
          companies.length === 0
            ? <div className="empty-company-state"><Icon name="building" size={22} /><strong>No company accounts found</strong><p>Add a company `.env` file inside <code>backend/company-accounts</code>, then reload this page.</p></div>
            : <div className="company-grid">
              {companies.map((company) => (
                <article className="company-card" style={{ '--company-accent': company.accent } as CSSProperties} key={company.slug}>
                  <div className="company-card-head"><span className="company-avatar">{company.initials}</span><ConnectionStatus status={company.status} /></div>
                  <h2>{company.displayName}</h2>
                  <p>{company.statusMessage}</p>
                  <div className="company-meta"><Icon name="building" size={15} /><span>{company.shortName} workspace</span></div>
                  {company.status === 'configured'
                    ? <Link className="company-action" to={`/companies/${company.slug}`}><span>Open company</span><Icon name="arrow" size={17} /></Link>
                    : <span className="company-action company-action-disabled" aria-disabled="true">Complete configuration</span>}
                </article>
              ))}
            </div>
        )}
      </main>
    </div>
  )
}
