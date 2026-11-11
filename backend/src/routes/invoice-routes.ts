import { Router } from 'express'
import type { InvoiceDateRange } from '../integrations/autocount/invoice-types.js'
import { InvoiceServiceError, listCompanyInvoices } from '../services/invoice-service.js'

export const invoiceRouter = Router()

const datePattern = /^\d{4}-\d{2}-\d{2}$/
const maxRangeInDays = 366

function parseIsoDate(value: unknown) {
  if (typeof value !== 'string' || !datePattern.test(value)) return null
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date
}

export function validateInvoiceDateRange(startValue: unknown, endValue: unknown): InvoiceDateRange | null {
  const start = parseIsoDate(startValue)
  const end = parseIsoDate(endValue)
  if (!start || !end || start > end) return null
  const rangeInDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1
  if (rangeInDays > maxRangeInDays) return null
  return { startDate: startValue as string, endDate: endValue as string }
}

invoiceRouter.get('/:companySlug/invoices', async (request, response) => {
  const range = validateInvoiceDateRange(request.query.startDate, request.query.endDate)
  if (!range) {
    response.status(400).json({
      code: 'invalid_date_range',
      message: 'Provide valid startDate and endDate values in YYYY-MM-DD format, with start on or before end and no more than 366 days apart.',
    })
    return
  }

  try {
    response.json(await listCompanyInvoices(request.params.companySlug, range))
  } catch (error) {
    if (error instanceof InvoiceServiceError) {
      response.status(error.status).json({ code: error.code, message: error.message })
      return
    }
    response.status(500).json({ code: 'internal_error', message: 'The invoice listing could not be retrieved.' })
  }
})
