export type SectorKey = 'sales' | 'purchase' | 'accounting'

export interface SectorDefinition {
  key: SectorKey
  title: string
  summary: string
  color: string
  modules: Array<{ title: string; description: string }>
}

export const sectors: SectorDefinition[] = [
  {
    key: 'sales', title: 'Sales', color: '#3166f5',
    summary: 'Manage customers, quotations, invoices, and credit notes.',
    modules: [
      { title: 'Customers', description: 'Debtor records and customer profiles' },
      { title: 'Quotations', description: 'Prepare and review quotations' },
      { title: 'Sales invoices', description: 'Invoice listing and operations' },
      { title: 'Credit notes', description: 'Sales adjustments and references' },
    ],
  },
  {
    key: 'purchase', title: 'Purchase', color: '#8a4df0',
    summary: 'Work with suppliers, purchase orders, invoices, and returns.',
    modules: [
      { title: 'Suppliers', description: 'Creditor records and supplier profiles' },
      { title: 'Purchase orders', description: 'Purchase order preparation' },
      { title: 'Purchase invoices', description: 'Supplier invoice operations' },
      { title: 'Purchase returns', description: 'Returns and related adjustments' },
    ],
  },
  {
    key: 'accounting', title: 'Accounting', color: '#168766',
    summary: 'Access journals, cash book entries, accounts, and knock-offs.',
    modules: [
      { title: 'Chart of accounts', description: 'Account listing and lookup' },
      { title: 'Journal entries', description: 'General journal operations' },
      { title: 'Cash book', description: 'Payment and receipt vouchers' },
      { title: 'Knock-off entries', description: 'Outstanding transaction allocation' },
    ],
  },
]

export function findSector(value: string | undefined) {
  return sectors.find((sector) => sector.key === value)
}
