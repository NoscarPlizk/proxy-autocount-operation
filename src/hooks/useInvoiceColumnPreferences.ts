import { useEffect, useMemo, useState } from 'react'
import { detailInvoiceColumns, masterInvoiceColumns, type InvoiceColumnDefinition } from '../data/invoiceColumns'

export type InvoiceColumnSection = 'master' | 'details'

export interface InvoiceColumnPreference {
  key: string
  visible: boolean
}

export interface ResolvedInvoiceColumnPreference extends InvoiceColumnPreference {
  definition: InvoiceColumnDefinition
}

interface InvoiceColumnPreferences {
  version: 1
  master: InvoiceColumnPreference[]
  details: InvoiceColumnPreference[]
}

const preferenceVersion = 1

function createDefaultSection(definitions: InvoiceColumnDefinition[]) {
  return definitions.map(({ key, defaultVisible }) => ({ key, visible: defaultVisible }))
}

function createDefaultPreferences(): InvoiceColumnPreferences {
  return {
    version: preferenceVersion,
    master: createDefaultSection(masterInvoiceColumns),
    details: createDefaultSection(detailInvoiceColumns),
  }
}

function reconcileSection(value: unknown, definitions: InvoiceColumnDefinition[]) {
  if (!Array.isArray(value)) return createDefaultSection(definitions)
  const definitionMap = new Map(definitions.map((definition) => [definition.key, definition]))
  const seenKeys = new Set<string>()
  const stored: InvoiceColumnPreference[] = []
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null) continue
    const candidate = entry as InvoiceColumnPreference
    if (typeof candidate.key !== 'string' || typeof candidate.visible !== 'boolean') continue
    if (!definitionMap.has(candidate.key) || seenKeys.has(candidate.key)) continue
    seenKeys.add(candidate.key)
    stored.push({ key: candidate.key, visible: candidate.visible })
  }
  const storedKeys = new Set(stored.map(({ key }) => key))
  const reconciled = [
    ...stored,
    ...definitions.filter(({ key }) => !storedKeys.has(key)).map(({ key, defaultVisible }) => ({ key, visible: defaultVisible })),
  ]
  if (!reconciled.some(({ visible }) => visible) && reconciled[0]) reconciled[0].visible = true
  return reconciled
}

function loadPreferences(storageKey: string): InvoiceColumnPreferences {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as Partial<InvoiceColumnPreferences> | null
    if (!parsed || parsed.version !== preferenceVersion) return createDefaultPreferences()
    return {
      version: preferenceVersion,
      master: reconcileSection(parsed.master, masterInvoiceColumns),
      details: reconcileSection(parsed.details, detailInvoiceColumns),
    }
  } catch {
    return createDefaultPreferences()
  }
}

function getDefinitions(section: InvoiceColumnSection) {
  return section === 'master' ? masterInvoiceColumns : detailInvoiceColumns
}

export function useInvoiceColumnPreferences(companySlug: string) {
  const storageKey = `autocount-portal:${companySlug}:invoice-table:v${preferenceVersion}`
  const [preferences, setPreferences] = useState<InvoiceColumnPreferences>(() => loadPreferences(storageKey))

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(preferences))
    } catch {
      // The layout still works for this session when browser storage is unavailable.
    }
  }, [preferences, storageKey])

  const definitionsBySection = useMemo(() => ({
    master: new Map(masterInvoiceColumns.map((definition) => [definition.key, definition])),
    details: new Map(detailInvoiceColumns.map((definition) => [definition.key, definition])),
  }), [])

  function updateSection(section: InvoiceColumnSection, update: (current: InvoiceColumnPreference[]) => InvoiceColumnPreference[]) {
    setPreferences((current) => ({ ...current, [section]: update(current[section]) }))
  }

  function toggleColumn(section: InvoiceColumnSection, key: string) {
    updateSection(section, (current) => {
      const selected = current.find((column) => column.key === key)
      if (selected?.visible && current.filter((column) => column.visible).length === 1) return current
      return current.map((column) => column.key === key ? { ...column, visible: !column.visible } : column)
    })
  }

  function moveColumn(section: InvoiceColumnSection, key: string, direction: -1 | 1) {
    updateSection(section, (current) => {
      const index = current.findIndex((column) => column.key === key)
      const target = index + direction
      if (index < 0 || target < 0 || target >= current.length) return current
      const reordered = [...current]
      const [column] = reordered.splice(index, 1)
      if (!column) return current
      reordered.splice(target, 0, column)
      return reordered
    })
  }

  function showAllColumns(section: InvoiceColumnSection) {
    updateSection(section, (current) => current.map((column) => ({ ...column, visible: true })))
  }

  function resetColumns(section: InvoiceColumnSection) {
    updateSection(section, () => createDefaultSection(getDefinitions(section)))
  }

  function resolveColumns(section: InvoiceColumnSection, visibleOnly: boolean): ResolvedInvoiceColumnPreference[] {
    const definitions = definitionsBySection[section]
    return preferences[section]
      .filter((column) => !visibleOnly || column.visible)
      .map((column) => ({ ...column, definition: definitions.get(column.key)! }))
  }

  return {
    masterColumns: resolveColumns('master', true),
    detailColumns: resolveColumns('details', true),
    masterPreferences: resolveColumns('master', false),
    detailPreferences: resolveColumns('details', false),
    moveColumn,
    resetColumns,
    showAllColumns,
    toggleColumn,
  }
}
