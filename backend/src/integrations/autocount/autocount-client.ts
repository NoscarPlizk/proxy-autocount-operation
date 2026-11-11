import type { CompanyConfig } from '../../config/company-config.js'
import type { AutoCountInvoice, AutoCountInvoiceListing, InvoiceDateRange } from './invoice-types.js'

const PAGE_SIZE = 100
const MAX_PAGES = 100
const REQUEST_TIMEOUT_MS = 15_000

type FetchImplementation = typeof fetch

export type AutoCountErrorCode =
  | 'authorization_failed'
  | 'rate_limited'
  | 'request_failed'
  | 'request_timeout'
  | 'response_invalid'
  | 'result_limit_exceeded'

export class AutoCountClientError extends Error {
  constructor(public readonly code: AutoCountErrorCode) {
    super(code)
    this.name = 'AutoCountClientError'
  }
}

interface AutoCountClientOptions {
  fetchImplementation?: FetchImplementation
  timeoutMs?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isInvoice(value: unknown): value is AutoCountInvoice {
  if (!isRecord(value) || !isRecord(value.master) || !Array.isArray(value.details)) return false
  const { master } = value
  return typeof master.docKey === 'number'
    && typeof master.docNo === 'string'
    && typeof master.docDate === 'string'
    && typeof master.debtorCode === 'string'
    && typeof master.debtorName === 'string'
    && typeof master.currencyCode === 'string'
    && typeof master.cancelled === 'boolean'
    && typeof master.finalTotal === 'number'
    && (typeof master.status === 'string' || master.status === null)
    && typeof master.outstandingAmount === 'number'
    && value.details.every(isRecord)
}

function parseInvoiceListing(value: unknown): AutoCountInvoiceListing {
  if (!isRecord(value)
    || !Array.isArray(value.data)
    || !value.data.every(isInvoice)
    || typeof value.totalCount !== 'number'
    || !Number.isInteger(value.totalCount)
    || value.totalCount < 0
    || value.data.length > value.totalCount) {
    throw new AutoCountClientError('response_invalid')
  }

  return { data: value.data, totalCount: value.totalCount }
}

function createInvoiceListingUrl(rootUrl: string, page: number, range: InvoiceDateRange) {
  const url = new URL(`${rootUrl.replace(/\/$/, '')}/invoice/listing`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('startDate', range.startDate)
  url.searchParams.set('endDate', range.endDate)
  return url
}

async function fetchInvoiceListingPage(
  company: CompanyConfig,
  range: InvoiceDateRange,
  page: number,
  options: Required<AutoCountClientOptions>,
) {
  if (!company.rootUrl || !company.keyId || !company.apiKey) {
    throw new AutoCountClientError('request_failed')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs)

  try {
    const response = await options.fetchImplementation(createInvoiceListingUrl(company.rootUrl, page, range), {
      method: 'GET',
      headers: {
        'API-Key': company.apiKey,
        'Key-ID': company.keyId,
      },
      signal: controller.signal,
    })

    if (response.status === 401 || response.status === 403) {
      throw new AutoCountClientError('authorization_failed')
    }
    if (response.status === 429) {
      throw new AutoCountClientError('rate_limited')
    }
    if (!response.ok) {
      throw new AutoCountClientError('request_failed')
    }

    let body: unknown
    try {
      body = await response.json()
    } catch {
      throw new AutoCountClientError('response_invalid')
    }
    return parseInvoiceListing(body)
  } catch (error) {
    if (error instanceof AutoCountClientError) throw error
    if (controller.signal.aborted) throw new AutoCountClientError('request_timeout')
    throw new AutoCountClientError('request_failed')
  } finally {
    clearTimeout(timeout)
  }
}

export async function getInvoiceListing(
  company: CompanyConfig,
  range: InvoiceDateRange,
  options: AutoCountClientOptions = {},
): Promise<AutoCountInvoiceListing> {
  const resolvedOptions: Required<AutoCountClientOptions> = {
    fetchImplementation: options.fetchImplementation ?? fetch,
    timeoutMs: options.timeoutMs ?? REQUEST_TIMEOUT_MS,
  }
  const firstPage = await fetchInvoiceListingPage(company, range, 1, resolvedOptions)
  if (firstPage.totalCount > PAGE_SIZE * MAX_PAGES) {
    throw new AutoCountClientError('result_limit_exceeded')
  }
  const invoices = [...firstPage.data]

  for (let page = 2; invoices.length < firstPage.totalCount && page <= MAX_PAGES; page += 1) {
    const nextPage = await fetchInvoiceListingPage(company, range, page, resolvedOptions)
    if (nextPage.totalCount !== firstPage.totalCount || nextPage.data.length === 0) {
      throw new AutoCountClientError('response_invalid')
    }
    invoices.push(...nextPage.data)
    if (invoices.length > firstPage.totalCount) {
      throw new AutoCountClientError('response_invalid')
    }
  }

  if (invoices.length < firstPage.totalCount) {
    throw new AutoCountClientError('result_limit_exceeded')
  }

  return { data: invoices.slice(0, firstPage.totalCount), totalCount: firstPage.totalCount }
}
