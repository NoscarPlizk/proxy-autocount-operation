import type { PortalCompanyDirectory } from '../types/company'

export async function getCompanyDirectory(signal?: AbortSignal): Promise<PortalCompanyDirectory> {
  const response = await fetch('/api/companies', { signal })
  if (!response.ok) throw new Error('The company service is not available.')
  return (await response.json()) as PortalCompanyDirectory
}
