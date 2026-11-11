export interface InvoiceColumnDefinition {
  key: string
  label: string
  defaultVisible: boolean
}

const defaultMasterKeys = new Set([
  'docNo', 'docDate', 'debtorCode', 'debtorName', 'currencyCode', 'status', 'finalTotal', 'outstandingAmount', 'lastModified',
])

const defaultDetailKeys = new Set([
  'seq', 'productCode', 'description', 'qty', 'unit', 'unitPrice', 'discount', 'discountAmt', 'taxCode', 'tax', 'subTotal',
])

const masterKeys = [
  'docKey', 'docNo', 'docDate', 'taxDate', 'dueDate', 'debtorCode', 'debtorName', 'currencyCode', 'currencyRate',
  'email', 'emailCC', 'emailBCC', 'address', 'attention', 'phone1', 'fax1', 'deliverAddress', 'deliverContact',
  'deliverPhone1', 'deliverFax1', 'ref', 'description', 'note', 'remark1', 'remark2', 'remark3', 'remark4',
  'creditTerm', 'salesAgent', 'salesLocation', 'inclusiveTax', 'isRoundAdj', 'cancelled', 'totalExTax', 'taxableAmt',
  'localTaxableAmt', 'tax', 'localTax', 'exTax', 'localExTax', 'netTotal', 'localNetTotal', 'roundAdj', 'total',
  'finalTotal', 'paymentMethod', 'paymentAmt', 'paymentRef', 'toBankRate', 'createdTimeStamp', 'createdUserID',
  'lastModified', 'lastModifiedUserID', 'status', 'approverID', 'approvedTimeStamp', 'rejectReason', 'outstandingAmount',
]

const detailKeys = [
  'docKey', 'dtlKey', 'seq', 'productId', 'productCode', 'productVariantId', 'productVariant1Option',
  'productVariant2Option', 'accNo', 'description', 'furtherDescription', 'qty', 'unit', 'unitPrice', 'discount',
  'discountAmt', 'taxCode', 'taxRate', 'taxAdjustment', 'localTaxAdjustment', 'tariffCode', 'taxExportCountry',
  'taxPermitNo', 'localTotalCost', 'subTotalExTax', 'localSubTotalExTax', 'tax', 'localTax', 'subTotal',
  'localSubTotal', 'yourPONo', 'yourPODate', 'deptNo',
]

const labelOverrides: Record<string, string> = {
  accNo: 'Account No.',
  approvedTimeStamp: 'Approved timestamp',
  approverID: 'Approver ID',
  createdTimeStamp: 'Created timestamp',
  createdUserID: 'Created user ID',
  debtorCode: 'Customer code',
  debtorName: 'Customer name',
  deliverFax1: 'Delivery fax',
  deliverPhone1: 'Delivery phone',
  deptNo: 'Department No.',
  docKey: 'Document key',
  docNo: 'Invoice No.',
  dtlKey: 'Detail key',
  emailBCC: 'Email BCC',
  emailCC: 'Email CC',
  fax1: 'Fax',
  lastModifiedUserID: 'Last modified user ID',
  phone1: 'Phone',
  productId: 'Product ID',
  productVariantId: 'Product variant ID',
  yourPONo: 'Your PO No.',
  yourPODate: 'Your PO date',
}

function createLabel(key: string) {
  if (labelOverrides[key]) return labelOverrides[key]
  const words = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Za-z])(\d+)/g, '$1 $2')
  return `${words.charAt(0).toUpperCase()}${words.slice(1)}`
}

function createDefinitions(keys: string[], defaults: Set<string>) {
  return keys.map((key): InvoiceColumnDefinition => ({ key, label: createLabel(key), defaultVisible: defaults.has(key) }))
}

export const masterInvoiceColumns = createDefinitions(masterKeys, defaultMasterKeys)
export const detailInvoiceColumns = createDefinitions(detailKeys, defaultDetailKeys)

export const invoiceCurrencyFields = new Set([
  'totalExTax', 'taxableAmt', 'localTaxableAmt', 'tax', 'localTax', 'exTax', 'localExTax', 'netTotal',
  'localNetTotal', 'roundAdj', 'total', 'finalTotal', 'paymentAmt', 'outstandingAmount', 'unitPrice', 'discountAmt',
  'taxAdjustment', 'localTaxAdjustment', 'localTotalCost', 'subTotalExTax', 'localSubTotalExTax', 'subTotal', 'localSubTotal',
])

export const invoiceDateFields = new Set(['docDate', 'taxDate', 'dueDate', 'yourPODate'])
export const invoiceTimestampFields = new Set(['createdTimeStamp', 'lastModified', 'approvedTimeStamp'])
