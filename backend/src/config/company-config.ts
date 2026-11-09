import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export type CompanyConnectionStatus = 'configured' | 'configuration_missing' | 'configuration_invalid'

interface CompanyDefinition {
  slug: string
  displayName: string
  shortName: string
  initials: string
  accent: string
  environmentPrefix: string
}

export interface CompanyConfig extends CompanyDefinition {
  rootUrl: string | null
  keyId: string | null
  apiKey: string | null
  status: CompanyConnectionStatus
  statusMessage: string
}

export interface PublicCompanyConfig {
  slug: string
  displayName: string
  shortName: string
  initials: string
  accent: string
  status: CompanyConnectionStatus
  statusMessage: string
}

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
dotenv.config({ path: resolve(backendRoot, '.env'), quiet: true })

const definitions: CompanyDefinition[] = [
  { slug: 'company-one', displayName: 'Company One', shortName: 'Company One', initials: 'C1', accent: '#3166f5', environmentPrefix: 'AUTOCOUNT_COMPANY_ONE' },
  { slug: 'company-two', displayName: 'Company Two', shortName: 'Company Two', initials: 'C2', accent: '#8a4df0', environmentPrefix: 'AUTOCOUNT_COMPANY_TWO' },
  { slug: 'company-three', displayName: 'Company Three', shortName: 'Company Three', initials: 'C3', accent: '#168766', environmentPrefix: 'AUTOCOUNT_COMPANY_THREE' },
]

function readValue(name: string) {
  const value = process.env[name]?.trim()
  return value ? value : null
}

function containsPlaceholder(value: string) {
  return value.includes('<') || value.includes('>') || value.toLowerCase().includes('replace-me')
}

function hasValidRootUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.pathname !== '/'
  } catch {
    return false
  }
}

function loadCompany(definition: CompanyDefinition): CompanyConfig {
  const rootUrl = readValue(`${definition.environmentPrefix}_ROOT_URL`)
  const keyId = readValue(`${definition.environmentPrefix}_KEY_ID`)
  const apiKey = readValue(`${definition.environmentPrefix}_API_KEY`)
  const values = [rootUrl, keyId, apiKey]
  const populatedCount = values.filter(Boolean).length

  if (populatedCount === 0) {
    return { ...definition, rootUrl, keyId, apiKey, status: 'configuration_missing', statusMessage: 'Add this company’s three AutoCount values to backend/.env.' }
  }

  const invalid = populatedCount !== values.length || !rootUrl || !hasValidRootUrl(rootUrl) || values.some((value) => value !== null && containsPlaceholder(value))
  if (invalid) {
    return { ...definition, rootUrl, keyId, apiKey, status: 'configuration_invalid', statusMessage: 'The root URL, Key ID, and API key must all be valid.' }
  }

  return { ...definition, rootUrl: rootUrl.replace(/\/$/, ''), keyId, apiKey, status: 'configured', statusMessage: 'The three required AutoCount values are present.' }
}

const companyConfigs = definitions.map(loadCompany)

export function listCompanyConfigs() {
  return companyConfigs
}

export function listPublicCompanies(): PublicCompanyConfig[] {
  return companyConfigs.map(({ slug, displayName, shortName, initials, accent, status, statusMessage }) => ({ slug, displayName, shortName, initials, accent, status, statusMessage }))
}

export function findCompanyConfig(slug: string) {
  return companyConfigs.find((company) => company.slug === slug)
}
