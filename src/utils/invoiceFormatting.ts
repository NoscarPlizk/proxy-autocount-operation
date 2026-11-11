import type { InvoiceDateRange } from '../types/invoice'
import { invoiceCurrencyFields, invoiceDateFields, invoiceTimestampFields } from '../data/invoiceColumns'

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function createCurrentMonthRange(now = new Date()): InvoiceDateRange {
  return {
    startDate: toIsoDate(now.getFullYear(), now.getMonth() + 1, 1),
    endDate: toIsoDate(now.getFullYear(), now.getMonth() + 1, now.getDate()),
  }
}

export function validateDateRange(range: InvoiceDateRange) {
  if (!range.startDate || !range.endDate) return 'Choose both a start date and an end date.'
  if (range.startDate > range.endDate) return 'The start date must be on or before the end date.'

  const start = new Date(`${range.startDate}T00:00:00Z`)
  const end = new Date(`${range.endDate}T00:00:00Z`)
  const rangeInDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1
  if (rangeInDays > 366) return 'Choose a date range of 366 days or fewer.'
  return null
}

export function formatInvoiceDate(value: string) {
  const [date] = value.split('T')
  if (!date) return value
  const parsed = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('en-MY', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(parsed)
}

export function formatInvoiceAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function formatInvoiceValue(key: string, value: unknown, currency: string) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') {
    if (invoiceCurrencyFields.has(key)) return formatInvoiceAmount(value, currency)
    return new Intl.NumberFormat('en-MY', { maximumFractionDigits: 8 }).format(value)
  }
  if (typeof value === 'string' && invoiceDateFields.has(key)) return formatInvoiceDate(value)
  if (typeof value === 'string' && invoiceTimestampFields.has(key)) return value.replace('T', ' ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
