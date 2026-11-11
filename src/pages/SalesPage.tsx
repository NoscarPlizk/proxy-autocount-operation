import { useEffect, useState, type FormEvent } from 'react'
import { getSalesInvoices } from '../api/invoiceApi'
import { Icon } from '../components/Icon'
import type { PortalCompany } from '../types/company'
import type { InvoiceDateRange, SalesInvoiceListing } from '../types/invoice'
import { createCurrentMonthRange, formatInvoiceAmount, formatInvoiceDate, validateDateRange } from '../utils/invoiceFormatting'

const emptyListing: SalesInvoiceListing = { data: [], totalCount: 0 }

function InvoiceTable({ listing }: { listing: SalesInvoiceListing }) {
  if (listing.data.length === 0) {
    return (
      <div className="invoice-empty">
        <Icon name="document" size={22} />
        <strong>No sales invoices in this date range</strong>
        <p>Choose another start and end date, then fetch the listing again.</p>
      </div>
    )
  }

  return (
    <div className="invoice-table-wrap">
      <table className="invoice-table">
        <thead><tr><th scope="col">Invoice</th><th scope="col">Document date</th><th scope="col">Customer</th><th scope="col">Status</th><th scope="col" className="amount-cell">Total</th><th scope="col" className="amount-cell">Outstanding</th></tr></thead>
        <tbody>
          {listing.data.map(({ master }) => (
            <tr key={master.docKey}>
              <td><strong>{master.docNo}</strong>{master.cancelled && <span className="invoice-cancelled">Cancelled</span>}</td>
              <td>{formatInvoiceDate(master.docDate)}</td>
              <td><strong>{master.debtorName}</strong><small>{master.debtorCode}</small></td>
              <td><span className="invoice-status">{master.status || 'No status'}</span></td>
              <td className="amount-cell">{formatInvoiceAmount(master.finalTotal, master.currencyCode)}</td>
              <td className="amount-cell">{formatInvoiceAmount(master.outstandingAmount, master.currencyCode)}</td>
            </tr>
          ))}
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
          {!isLoading && !error && <span>{listing.totalCount} {listing.totalCount === 1 ? 'invoice' : 'invoices'}</span>}
        </div>
        {isLoading && <div className="invoice-state">Fetching sales invoices from AutoCount…</div>}
        {!isLoading && error && <div className="invoice-error" role="alert"><strong>Invoices could not be loaded.</strong><p>{error}</p></div>}
        {!isLoading && !error && <InvoiceTable listing={listing} />}
      </section>
    </main>
  )
}
