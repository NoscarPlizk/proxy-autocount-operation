import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCompanies } from '../api/companyApi'
import type { PortalCompany } from '../types/company'

interface CompanyContextValue {
  companies: PortalCompany[]
  isLoading: boolean
  error: string | null
  findCompany: (slug: string | undefined) => PortalCompany | undefined
}

const CompanyContext = createContext<CompanyContextValue | null>(null)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<PortalCompany[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getCompanies(controller.signal)
      .then((result) => {
        setCompanies(result)
        setError(null)
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return
        setError(requestError instanceof Error ? requestError.message : 'The company service is not available.')
      })
      .finally(() => setIsLoading(false))
    return () => controller.abort()
  }, [])

  const value = useMemo<CompanyContextValue>(() => ({
    companies,
    isLoading,
    error,
    findCompany: (slug) => companies.find((company) => company.slug === slug),
  }), [companies, error, isLoading])

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
}

// The provider and its colocated hook intentionally share this private context.
// eslint-disable-next-line react-refresh/only-export-components
export function useCompanies() {
  const context = useContext(CompanyContext)
  if (!context) throw new Error('useCompanies must be used inside CompanyProvider.')
  return context
}
