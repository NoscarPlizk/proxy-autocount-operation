import type { InvoiceDateRange, SalesInvoiceListing } from '../types/invoice'

interface ApiErrorBody {
  message?: string
}

export async function getSalesInvoices(
  companySlug: string,
  range: InvoiceDateRange,
  signal?: AbortSignal,
): Promise<SalesInvoiceListing> {
  const search = new URLSearchParams({ startDate: range.startDate, endDate: range.endDate })
  const response = await fetch(`/api/companies/${encodeURIComponent(companySlug)}/invoices?${search}`, { signal })
  if (!response.ok) {
    let body: ApiErrorBody = {}
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      // The backend normally returns JSON; use a safe fallback if an intermediary did not.
    }
    throw new Error(body.message || 'The sales invoice service is not available.')
  }
  return (await response.json()) as SalesInvoiceListing
}
