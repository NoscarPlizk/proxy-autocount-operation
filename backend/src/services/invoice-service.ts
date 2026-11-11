import { findCompanyConfig } from '../config/company-config.js'
import { AutoCountClientError, getInvoiceListing } from '../integrations/autocount/autocount-client.js'
import type { InvoiceDateRange } from '../integrations/autocount/invoice-types.js'

export class InvoiceServiceError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'InvoiceServiceError'
  }
}

function mapAutoCountError(error: AutoCountClientError) {
  switch (error.code) {
    case 'authorization_failed':
      return new InvoiceServiceError('autocount_authorization_failed', 502, 'AutoCount rejected the configured read credentials or permission.')
    case 'rate_limited':
      return new InvoiceServiceError('autocount_rate_limited', 503, 'AutoCount is temporarily limiting requests. Try again later.')
    case 'request_timeout':
      return new InvoiceServiceError('autocount_timeout', 504, 'AutoCount did not respond within 15 seconds.')
    case 'result_limit_exceeded':
      return new InvoiceServiceError('invoice_result_limit_exceeded', 422, 'This date range contains more than 10,000 invoices. Choose a narrower range.')
    case 'response_invalid':
      return new InvoiceServiceError('autocount_response_invalid', 502, 'AutoCount returned an invoice response that the portal could not validate.')
    default:
      return new InvoiceServiceError('autocount_unavailable', 502, 'The invoice listing could not be retrieved from AutoCount.')
  }
}

export async function listCompanyInvoices(companySlug: string, range: InvoiceDateRange) {
  const company = findCompanyConfig(companySlug)
  if (!company) {
    throw new InvoiceServiceError('company_not_found', 404, 'The requested company is not configured in this portal.')
  }
  if (company.status !== 'configured') {
    throw new InvoiceServiceError('company_not_configured', 409, 'This company does not have a valid AutoCount configuration.')
  }

  try {
    return await getInvoiceListing(company, range)
  } catch (error) {
    if (error instanceof AutoCountClientError) throw mapAutoCountError(error)
    throw error
  }
}
