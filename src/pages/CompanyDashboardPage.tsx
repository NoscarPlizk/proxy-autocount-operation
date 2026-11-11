import type { CSSProperties } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { sectors } from '../data/sectors'
import type { PortalCompany } from '../types/company'

const sectorIcons: Record<string, IconName> = { sales: 'sales', purchase: 'purchase', accounting: 'ledger' }

export function CompanyDashboardPage() {
  const { company } = useOutletContext<{ company: PortalCompany }>()
  return (
    <main className="page-wrap">
      <div className="page-header"><div>
        <p className="page-eyebrow"><Icon name="home" size={14} /> Company overview</p>
        <h1>Welcome to {company.shortName}</h1>
        <p className="page-header-description">Select a sector to continue. Every nested page keeps this company in the route so backend operations can resolve the correct AutoCount configuration.</p>
      </div></div>

      {company.status !== 'configured' && (
        <div className="setup-callout"><Icon name="settings" size={20} /><div><strong>AutoCount connection not configured.</strong>{' '}Complete this company’s file in backend/company-accounts before enabling live operations.</div></div>
      )}

      <section className="sector-grid" aria-label="Accounting sectors">
        {sectors.map((sector) => (
          <article className="sector-card" key={sector.key} style={{ '--sector-color': sector.color } as CSSProperties}>
            <span className="sector-icon"><Icon name={sectorIcons[sector.key]} size={23} /></span>
            <h2>{sector.title}</h2><p>{sector.summary}</p>
            <Link className="sector-link" to={`/companies/${company.slug}/${sector.key}`}>Explore {sector.title}<Icon name="arrow" size={16} /></Link>
          </article>
        ))}
      </section>

      <section className="activity-panel">
        <div className="panel-header"><h2>Recent activity</h2><span>Company-specific activity will appear here</span></div>
        <div className="empty-state"><Icon name="document" size={21} /><strong>No portal activity yet</strong><p>This sample does not perform AutoCount reads or writes. Activity starts after authentication and endpoint workflows are added.</p></div>
      </section>
    </main>
  )
}
