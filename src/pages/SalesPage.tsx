import { Fragment, useEffect, useState, type FormEvent } from 'react'
import { getSalesInvoices } from '../api/invoiceApi'
import { Icon } from '../components/Icon'
import { invoiceCurrencyFields } from '../data/invoiceColumns'
import {
  useInvoiceColumnPreferences,
  type InvoiceColumnSection,
  type ResolvedInvoiceColumnPreference,
} from '../hooks/useInvoiceColumnPreferences'
import type { PortalCompany } from '../types/company'
import type { InvoiceDateRange, SalesInvoiceListing } from '../types/invoice'
import { createCurrentMonthRange, formatInvoiceValue, validateDateRange } from '../utils/invoiceFormatting'

const emptyListing: SalesInvoiceListing = { data: [], totalCount: 0 }

interface ColumnSettingsProps {
  activeSection: InvoiceColumnSection
  columns: ResolvedInvoiceColumnPreference[]
  onClose: () => void
  onMove: (section: InvoiceColumnSection, key: string, direction: -1 | 1) => void
  onReset: (section: InvoiceColumnSection) => void
  onSectionChange: (section: InvoiceColumnSection) => void
  onShowAll: (section: InvoiceColumnSection) => void
  onToggle: (section: InvoiceColumnSection, key: string) => void
}

function ColumnSettings({ activeSection, columns, onClose, onMove, onReset, onSectionChange, onShowAll, onToggle }: ColumnSettingsProps) {
  const [search, setSearch] = useState('')
  const visibleCount = columns.filter(({ visible }) => visible).length
  const filteredColumns = columns.filter(({ key, definition }) => (
    `${definition.label} ${key}`.toLowerCase().includes(search.trim().toLowerCase())
  ))

  return (
    <div className="column-settings" aria-label="Invoice table column settings">
      <div className="column-settings-header">
        <div><strong>Column settings</strong><p>Visibility and order are saved automatically on this device for this company.</p></div>
        <button type="button" className="column-settings-close" onClick={onClose} aria-label="Close column settings">×</button>
      </div>
      <div className="column-settings-tabs" role="tablist" aria-label="Table type">
        <button type="button" role="tab" aria-selected={activeSection === 'master'} className={activeSection === 'master' ? 'active' : ''} onClick={() => onSectionChange('master')}>Invoice columns</button>
        <button type="button" role="tab" aria-selected={activeSection === 'details'} className={activeSection === 'details' ? 'active' : ''} onClick={() => onSectionChange('details')}>Line-item columns</button>
      </div>
      <div className="column-settings-toolbar">
        <label>Find a column<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search label or property" /></label>
        <div><button type="button" onClick={() => onShowAll(activeSection)}>Show all</button><button type="button" onClick={() => onReset(activeSection)}>Reset defaults</button></div>
      </div>
      <div className="column-settings-list">
        {filteredColumns.map(({ key, visible, definition }) => {
          const actualIndex = columns.findIndex((column) => column.key === key)
          return (
            <div className="column-setting-row" key={key}>
              <label><input type="checkbox" checked={visible} disabled={visible && visibleCount === 1} onChange={() => onToggle(activeSection, key)} /><span><strong>{definition.label}</strong><small>{key}</small></span></label>
              <div className="column-order-buttons">
                <button type="button" onClick={() => onMove(activeSection, key, -1)} disabled={actualIndex === 0} aria-label={`Move ${definition.label} left`}>↑</button>
                <button type="button" onClick={() => onMove(activeSection, key, 1)} disabled={actualIndex === columns.length - 1} aria-label={`Move ${definition.label} right`}>↓</button>
              </div>
              <span className="column-position" aria-label={`Position ${actualIndex + 1}`}>{actualIndex + 1}</span>
            </div>
          )
        })}
        {filteredColumns.length === 0 && <p className="column-settings-empty">No columns match this search.</p>}
      </div>
    </div>
  )
}

function DataCell({ column, record, currency }: { column: ResolvedInvoiceColumnPreference; record: Record<string, unknown>; currency: string }) {
  const value = formatInvoiceValue(column.key, record[column.key], currency)
  const className = invoiceCurrencyFields.has(column.key) ? 'amount-cell' : undefined
  return <td className={className}><span className="invoice-cell-value" title={value}>{value}</span></td>
}

function LineItemTable({ columns, currency, details }: {
  columns: ResolvedInvoiceColumnPreference[]
  currency: string
  details: Array<Record<string, unknown>>
}) {
  if (details.length === 0) return <div className="line-item-empty">This invoice has no line items.</div>

  return (
    <div className="line-item-section">
      <div className="line-item-heading"><strong>Price list details</strong><span>{details.length} {details.length === 1 ? 'item' : 'items'}</span></div>
      <div className="line-item-table-wrap">
        <table className="line-item-table">
          <thead><tr>{columns.map(({ key, definition }) => <th scope="col" className={invoiceCurrencyFields.has(key) ? 'amount-cell' : undefined} key={key}>{definition.label}</th>)}</tr></thead>
          <tbody>
            {details.map((detail, index) => (
              <tr key={typeof detail.dtlKey === 'number' || typeof detail.dtlKey === 'string' ? detail.dtlKey : index}>
                {columns.map((column) => <DataCell column={column} record={detail} currency={currency} key={column.key} />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InvoiceTable({ detailColumns, listing, masterColumns }: {
  detailColumns: ResolvedInvoiceColumnPreference[]
  listing: SalesInvoiceListing
  masterColumns: ResolvedInvoiceColumnPreference[]
}) {
  const [expandedInvoices, setExpandedInvoices] = useState<Set<number>>(() => new Set())

  if (listing.data.length === 0) {
    return (
      <div className="invoice-empty">
        <Icon name="document" size={22} />
        <strong>No sales invoices in this date range</strong>
        <p>Choose another start and end date, then fetch the listing again.</p>
      </div>
    )
  }

  function toggleInvoice(docKey: number) {
    setExpandedInvoices((current) => {
      const updated = new Set(current)
      if (updated.has(docKey)) updated.delete(docKey)
      else updated.add(docKey)
      return updated
    })
  }

  return (
    <div className="invoice-table-wrap">
      <table className="invoice-table">
        <thead><tr>{masterColumns.map(({ key, definition }) => <th scope="col" className={invoiceCurrencyFields.has(key) ? 'amount-cell' : undefined} key={key}>{definition.label}</th>)}<th scope="col" className="invoice-actions-column">Line items</th></tr></thead>
        <tbody>
          {listing.data.map(({ master, details }) => {
            const expanded = expandedInvoices.has(master.docKey)
            const detailsId = `invoice-details-${master.docKey}`
            return (
              <Fragment key={master.docKey}>
                <tr className={expanded ? 'invoice-master-row expanded' : 'invoice-master-row'}>
                  {masterColumns.map((column) => <DataCell column={column} record={master} currency={master.currencyCode} key={column.key} />)}
                  <td className="invoice-actions-column"><button type="button" className="line-item-toggle" aria-expanded={expanded} aria-controls={detailsId} onClick={() => toggleInvoice(master.docKey)}>{expanded ? 'Hide items' : `View items (${details.length})`}</button></td>
                </tr>
                {expanded && (
                  <tr className="invoice-detail-row" id={detailsId}>
                    <td colSpan={masterColumns.length + 1}><LineItemTable columns={detailColumns} currency={master.currencyCode} details={details} /></td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function SalesPage({ company }: { company: PortalCompany }) {
  const [draftRange, setDraftRange] = useState<InvoiceDateRange>(createCurrentMonthRange)
  const [activeRange, setActiveRange] = useState<InvoiceDateRange>(createCurrentMonthRange)
  const [requestVersion, setRequestVersion] = useState(0)
  const [listing, setListing] = useState<SalesInvoiceListing>(emptyListing)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [columnSection, setColumnSection] = useState<InvoiceColumnSection>('master')
  const columnPreferences = useInvoiceColumnPreferences(company.slug)

  useEffect(() => {
    const controller = new AbortController()
    getSalesInvoices(company.slug, activeRange, controller.signal)
      .then(setListing)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setListing(emptyListing)
        setError(requestError instanceof Error ? requestError.message : 'The sales invoice service is not available.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [activeRange, company.slug, requestVersion])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateDateRange(draftRange)
    setValidationMessage(validationError)
    if (validationError) return
    setIsLoading(true)
    setError(null)
    setActiveRange({ ...draftRange })
    setRequestVersion((version) => version + 1)
  }

  const activeColumnPreferences = columnSection === 'master'
    ? columnPreferences.masterPreferences
    : columnPreferences.detailPreferences

  return (
    <main className="page-wrap sales-page">
      <div className="page-header"><div>
        <p className="page-eyebrow"><Icon name="sales" size={14} /> {company.shortName}</p>
        <h1>Sales invoices</h1>
        <p className="page-header-description">Read invoice listings from AutoCount. This page provides retrieval only; it cannot create, edit, void, or delete invoices.</p>
      </div></div>

      <section className="invoice-filter-panel" aria-labelledby="invoice-filter-title">
        <div className="invoice-filter-copy">
          <h2 id="invoice-filter-title">Document date range</h2>
          <p>The current month loads automatically. Choose both dates to retrieve a different period, up to 366 days.</p>
        </div>
        <form className="invoice-filter-form" onSubmit={handleSubmit}>
          <label>Start date<input type="date" value={draftRange.startDate} max={draftRange.endDate} onChange={(event) => setDraftRange((range) => ({ ...range, startDate: event.target.value }))} disabled={isLoading} /></label>
          <label>End date<input type="date" value={draftRange.endDate} min={draftRange.startDate} onChange={(event) => setDraftRange((range) => ({ ...range, endDate: event.target.value }))} disabled={isLoading} /></label>
          <button type="submit" disabled={isLoading}>{isLoading ? 'Fetching…' : 'Fetch invoices'}</button>
        </form>
        {validationMessage && <p className="invoice-form-message" role="alert">{validationMessage}</p>}
      </section>

      <section className="invoice-panel" aria-live="polite" aria-busy={isLoading}>
        <div className="panel-header">
          <div><h2>Invoice listing</h2><small>{activeRange.startDate} to {activeRange.endDate}</small></div>
          <div className="invoice-panel-actions">
            {!isLoading && !error && <span>{listing.totalCount} {listing.totalCount === 1 ? 'invoice' : 'invoices'}</span>}
            <button type="button" aria-expanded={showColumnSettings} onClick={() => setShowColumnSettings((visible) => !visible)}>Columns</button>
          </div>
        </div>
        {showColumnSettings && (
          <ColumnSettings
            activeSection={columnSection}
            columns={activeColumnPreferences}
            onClose={() => setShowColumnSettings(false)}
            onMove={columnPreferences.moveColumn}
            onReset={columnPreferences.resetColumns}
            onSectionChange={setColumnSection}
            onShowAll={columnPreferences.showAllColumns}
            onToggle={columnPreferences.toggleColumn}
          />
        )}
        {isLoading && <div className="invoice-state">Fetching sales invoices from AutoCount…</div>}
        {!isLoading && error && <div className="invoice-error" role="alert"><strong>Invoices could not be loaded.</strong><p>{error}</p></div>}
        {!isLoading && !error && (
          <InvoiceTable
            key={`${activeRange.startDate}:${activeRange.endDate}:${requestVersion}`}
            detailColumns={columnPreferences.detailColumns}
            listing={listing}
            masterColumns={columnPreferences.masterColumns}
          />
        )}
      </section>
    </main>
  )
}
