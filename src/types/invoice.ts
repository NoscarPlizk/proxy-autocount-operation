export interface SalesInvoiceMaster {
  docKey: number
  docNo: string
  docDate: string
  debtorCode: string
  debtorName: string
  currencyCode: string
  cancelled: boolean
  finalTotal: number
  status: string | null
  outstandingAmount: number
  [field: string]: unknown
}

export interface SalesInvoice {
  master: SalesInvoiceMaster
  details: Array<Record<string, unknown>>
}

export interface SalesInvoiceListing {
  data: SalesInvoice[]
  totalCount: number
}

export interface InvoiceDateRange {
  startDate: string
  endDate: string
}
