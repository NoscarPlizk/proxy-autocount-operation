export interface AutoCountInvoiceMaster {
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

export interface AutoCountInvoice {
  master: AutoCountInvoiceMaster
  details: Array<Record<string, unknown>>
}

export interface AutoCountInvoiceListing {
  data: AutoCountInvoice[]
  totalCount: number
}

export interface InvoiceDateRange {
  startDate: string
  endDate: string
}
