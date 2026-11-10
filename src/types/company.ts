export type CompanyConnectionStatus =
  | 'configured'
  | 'configuration_missing'
  | 'configuration_invalid'

export interface PortalCompany {
  slug: string
  displayName: string
  shortName: string
  initials: string
  status: CompanyConnectionStatus
  statusMessage: string
  accent: string
}

export interface PortalCompanyDirectory {
  companies: PortalCompany[]
  companyFileCount: number
  configuredCompanyCount: number
}
