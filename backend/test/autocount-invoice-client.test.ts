import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import type { CompanyConfig } from '../src/config/company-config.js'
import { AutoCountClientError, getInvoiceListing } from '../src/integrations/autocount/autocount-client.js'
import type { AutoCountInvoiceListing } from '../src/integrations/autocount/invoice-types.js'
import { validateInvoiceDateRange } from '../src/routes/invoice-routes.js'

const fixture = JSON.parse(readFileSync(resolve('data_fetch_example/get_invoice_listing_DataExp.json'), 'utf8')) as AutoCountInvoiceListing
const range = { startDate: '2023-03-01', endDate: '2023-03-31' }

const company: CompanyConfig = {
  slug: 'fixture-company',
  displayName: 'Fixture Company',
  shortName: 'Fixture Company',
  initials: 'FC',
  accent: '#3166f5',
  configurationFile: 'fixture-company.env',
  rootUrl: 'https://example.invalid/account-book-one',
  keyId: 'fixture-key-id',
  apiKey: 'fixture-api-key',
  status: 'configured',
  statusMessage: 'Configured for a local test.',
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

test('constructs a GET invoice listing request with date filters and mandatory headers', async () => {
  let requestedUrl = ''
  let requestOptions: RequestInit | undefined
  const fetchImplementation: typeof fetch = async (input, options) => {
    requestedUrl = String(input)
    requestOptions = options
    return response(fixture)
  }

  const result = await getInvoiceListing(company, range, { fetchImplementation })
  const url = new URL(requestedUrl)
  const headers = new Headers(requestOptions?.headers)

  assert.equal(requestOptions?.method, 'GET')
  assert.equal(url.origin, 'https://example.invalid')
  assert.equal(url.pathname, '/account-book-one/invoice/listing')
  assert.equal(url.searchParams.get('page'), '1')
  assert.equal(url.searchParams.get('startDate'), range.startDate)
  assert.equal(url.searchParams.get('endDate'), range.endDate)
  assert.equal(headers.get('API-Key'), company.apiKey)
  assert.equal(headers.get('Key-ID'), company.keyId)
  assert.deepEqual(result, fixture)
})

test('retrieves subsequent pages until the documented total count is reached', async () => {
  const sample = fixture.data[0]!
  const invoices = Array.from({ length: 101 }, (_, index) => ({
    ...sample,
    master: { ...sample.master, docKey: index + 1, docNo: `I-${String(index + 1).padStart(6, '0')}` },
  }))
  const requestedPages: string[] = []
  const fetchImplementation: typeof fetch = async (input) => {
    const page = new URL(String(input)).searchParams.get('page') ?? ''
    requestedPages.push(page)
    return response({ data: page === '1' ? invoices.slice(0, 100) : invoices.slice(100), totalCount: 101 })
  }

  const result = await getInvoiceListing(company, range, { fetchImplementation })

  assert.deepEqual(requestedPages, ['1', '2'])
  assert.equal(result.data.length, 101)
  assert.equal(result.totalCount, 101)
})

test('normalizes authorization, timeout, and malformed response failures', async () => {
  const unauthorizedFetch: typeof fetch = async () => response({ statusCode: 401, message: 'secret vendor detail' }, 401)
  await assert.rejects(
    getInvoiceListing(company, range, { fetchImplementation: unauthorizedFetch }),
    (error: unknown) => error instanceof AutoCountClientError && error.code === 'authorization_failed' && !error.message.includes('secret'),
  )

  const malformedFetch: typeof fetch = async () => response({ data: 'not-an-array', totalCount: 1 })
  await assert.rejects(
    getInvoiceListing(company, range, { fetchImplementation: malformedFetch }),
    (error: unknown) => error instanceof AutoCountClientError && error.code === 'response_invalid',
  )

  const timeoutFetch: typeof fetch = async (_input, options) => new Promise((_resolve, reject) => {
    options?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
  })
  await assert.rejects(
    getInvoiceListing(company, range, { fetchImplementation: timeoutFetch, timeoutMs: 5 }),
    (error: unknown) => error instanceof AutoCountClientError && error.code === 'request_timeout',
  )
})

test('requires a valid, ordered invoice date range no longer than 366 days', () => {
  assert.deepEqual(validateInvoiceDateRange('2026-01-01', '2026-12-31'), { startDate: '2026-01-01', endDate: '2026-12-31' })
  assert.equal(validateInvoiceDateRange('2026-11-12', '2026-11-11'), null)
  assert.equal(validateInvoiceDateRange('2026-02-30', '2026-03-01'), null)
  assert.equal(validateInvoiceDateRange('2025-01-01', '2026-01-02'), null)
  assert.equal(validateInvoiceDateRange(undefined, '2026-01-01'), null)
})
