import { Navigate, useOutletContext, useParams } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { findSector } from '../data/sectors'
import type { PortalCompany } from '../types/company'

const sectorIcons: Record<string, IconName> = { sales: 'sales', purchase: 'purchase', accounting: 'ledger' }

export function SectorPage() {
  const { sector: sectorParam } = useParams()
  const { company } = useOutletContext<{ company: PortalCompany }>()
  const sector = findSector(sectorParam)
  if (!sector) return <Navigate to={`/companies/${company.slug}`} replace />

  return (
    <main className="page-wrap">
      <div className="page-header"><div>
        <p className="page-eyebrow"><Icon name={sectorIcons[sector.key]} size={14} /> {company.shortName}</p>
        <h1>{sector.title}</h1><p className="page-header-description">{sector.summary}</p>
      </div></div>

      {company.status !== 'configured' && (
        <div className="setup-callout"><Icon name="settings" size={20} /><div><strong>Live AutoCount actions are intentionally unavailable.</strong>{' '}This company’s three backend credentials have not passed local configuration validation.</div></div>
      )}

      <section className="module-panel">
        <div className="panel-header"><h2>{sector.title} modules</h2><span>Navigation sample</span></div>
        <div className="module-list">
          {sector.modules.map((module) => (
            <div className="module-item" key={module.title}><Icon name="document" size={18} /><div><strong>{module.title}</strong><small>{module.description}</small></div></div>
          ))}
        </div>
      </section>
    </main>
  )
}
