import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { listPublicCompanies } from '../src/config/company-config.js'

function createTestDirectory() {
  return mkdtempSync(join(tmpdir(), 'autocount-company-config-'))
}

test('returns an empty directory when no company environment files exist', () => {
  const result = listPublicCompanies(createTestDirectory())

  assert.deepEqual(result, {
    companies: [],
    companyFileCount: 0,
    configuredCompanyCount: 0,
  })
})

test('discovers one company per env file and never serializes credentials', () => {
  const directory = createTestDirectory()
  writeFileSync(join(directory, 'company-one.env'), [
    'AUTOCOUNT_ROOT_URL=https://example.invalid/account-book-one',
    'AUTOCOUNT_KEY_ID=local-key-id',
    'AUTOCOUNT_API_KEY=local-api-key',
  ].join('\n'))
  writeFileSync(join(directory, 'company-two.env'), 'AUTOCOUNT_ROOT_URL=<replace-me>\n')
  writeFileSync(join(directory, 'notes.txt'), 'not a company configuration')

  const result = listPublicCompanies(directory)
  const serialized = JSON.stringify(result)

  assert.equal(result.companyFileCount, 2)
  assert.equal(result.configuredCompanyCount, 1)
  assert.equal(result.companies[0]?.slug, 'company-one')
  assert.equal(result.companies[0]?.displayName, 'Company One')
  assert.equal(result.companies[0]?.status, 'configured')
  assert.equal(result.companies[1]?.status, 'configuration_invalid')
  assert.equal(serialized.includes('local-key-id'), false)
  assert.equal(serialized.includes('local-api-key'), false)
  assert.equal(serialized.includes('example.invalid'), false)
})

test('rescans the directory so a newly added env file becomes available', () => {
  const directory = createTestDirectory()
  assert.equal(listPublicCompanies(directory).companyFileCount, 0)

  writeFileSync(join(directory, 'new-company.env'), [
    'ROOT_URL=https://example.invalid/new-account-book',
    'KEY_ID=local-key-id',
    'API_KEY=local-api-key',
  ].join('\n'))

  const result = listPublicCompanies(directory)
  assert.equal(result.companyFileCount, 1)
  assert.equal(result.configuredCompanyCount, 1)
  assert.equal(result.companies[0]?.slug, 'new-company')
})
