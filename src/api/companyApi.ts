import type { PortalCompany } from '../types/company'

interface CompanyListResponse {
  companies: PortalCompany[]
}

export async function getCompanies(signal?: AbortSignal): Promise<PortalCompany[]> {
  const response = await fetch('/api/companies', { signal })
  if (!response.ok) throw new Error('The company service is not available.')
  const payload = (await response.json()) as CompanyListResponse
  return payload.companies
}
