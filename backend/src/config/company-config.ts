import dotenv from 'dotenv'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export type CompanyConnectionStatus = 'configured' | 'configuration_missing' | 'configuration_invalid'

interface CompanyDefinition {
  slug: string
  displayName: string
  shortName: string
  initials: string
  accent: string
  configurationFile: string
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

export interface PublicCompanyDirectory {
  companies: PublicCompanyConfig[]
  companyFileCount: number
  configuredCompanyCount: number
}

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export const companyAccountsDirectory = resolve(backendRoot, 'company-accounts')

dotenv.config({ path: resolve(backendRoot, '.env'), quiet: true })

const accentPalette = ['#3166f5', '#8a4df0', '#168766', '#d06b28', '#c13f68', '#177e9c']

function readValue(parsedEnvironment: Record<string, string>, names: string[]) {
  for (const name of names) {
    const value = parsedEnvironment[name]?.trim()
    if (value) return value
  }
  return null
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

function createSlug(fileName: string, usedSlugs: Set<string>) {
  const stem = fileName.slice(0, -extname(fileName).length)
  const baseSlug = stem
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'company'

  let slug = baseSlug
  let suffix = 2
  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }
  usedSlugs.add(slug)
  return slug
}

function createDisplayName(fileName: string) {
  const stem = fileName.slice(0, -extname(fileName).length)
  const words = stem.split(/[^a-zA-Z0-9]+/).filter(Boolean)
  if (words.length === 0) return 'Company'
  return words.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ')
}

function createInitials(displayName: string) {
  const words = displayName.split(/\s+/).filter(Boolean)
  if (words.length > 1) return words.slice(0, 2).map((word) => word.charAt(0).toUpperCase()).join('')
  return displayName.slice(0, 2).toUpperCase()
}

function createAccent(slug: string) {
  const hash = [...slug].reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 0)
  return accentPalette[hash % accentPalette.length] ?? accentPalette[0]!
}

function loadCompany(directory: string, fileName: string, usedSlugs: Set<string>): CompanyConfig {
  const slug = createSlug(fileName, usedSlugs)
  const displayName = createDisplayName(fileName)
  const definition: CompanyDefinition = {
    slug,
    displayName,
    shortName: displayName,
    initials: createInitials(displayName),
    accent: createAccent(slug),
    configurationFile: fileName,
  }

  let parsedEnvironment: Record<string, string>
  try {
    parsedEnvironment = dotenv.parse(readFileSync(resolve(directory, fileName), 'utf8'))
  } catch {
    return {
      ...definition,
      rootUrl: null,
      keyId: null,
      apiKey: null,
      status: 'configuration_invalid',
      statusMessage: 'This company configuration file could not be read.',
    }
  }

  const rootUrl = readValue(parsedEnvironment, ['AUTOCOUNT_ROOT_URL', 'ROOT_URL'])
  const keyId = readValue(parsedEnvironment, ['AUTOCOUNT_KEY_ID', 'KEY_ID'])
  const apiKey = readValue(parsedEnvironment, ['AUTOCOUNT_API_KEY', 'API_KEY'])
  const values = [rootUrl, keyId, apiKey]
  const populatedCount = values.filter(Boolean).length

  if (populatedCount === 0) {
    return {
      ...definition,
      rootUrl,
      keyId,
      apiKey,
      status: 'configuration_missing',
      statusMessage: 'Add this company’s three AutoCount values to its environment file.',
    }
  }

  const invalid = populatedCount !== values.length
    || !rootUrl
    || !hasValidRootUrl(rootUrl)
    || values.some((value) => value !== null && containsPlaceholder(value))

  if (invalid) {
    return {
      ...definition,
      rootUrl,
      keyId,
      apiKey,
      status: 'configuration_invalid',
      statusMessage: 'The root URL, Key ID, and API key must all be present and valid.',
    }
  }

  return {
    ...definition,
    rootUrl: rootUrl.replace(/\/$/, ''),
    keyId,
    apiKey,
    status: 'configured',
    statusMessage: 'This company account is ready to open in the portal.',
  }
}

export function listCompanyConfigs(directory = companyAccountsDirectory) {
  if (!existsSync(directory)) return []

  const usedSlugs = new Set<string>()
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.env'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) => loadCompany(directory, fileName, usedSlugs))
}

export function listPublicCompanies(directory = companyAccountsDirectory): PublicCompanyDirectory {
  const companyConfigs = listCompanyConfigs(directory)
  const companies = companyConfigs.map(({ slug, displayName, shortName, initials, accent, status, statusMessage }) => ({
    slug,
    displayName,
    shortName,
    initials,
    accent,
    status,
    statusMessage,
  }))

  return {
    companies,
    companyFileCount: companies.length,
    configuredCompanyCount: companies.filter((company) => company.status === 'configured').length,
  }
}

export function findCompanyConfig(slug: string, directory = companyAccountsDirectory) {
  return listCompanyConfigs(directory).find((company) => company.slug === slug)
}
