import type { CompanyConnectionStatus } from '../types/company'

const labels: Record<CompanyConnectionStatus, string> = {
  configured: 'Configured',
  configuration_missing: 'Setup needed',
  configuration_invalid: 'Check setup',
}

export function ConnectionStatus({ status }: { status: CompanyConnectionStatus }) {
  const className = status === 'configured'
    ? 'status-configured'
    : status === 'configuration_invalid' ? 'status-invalid' : 'status-missing'
  return <span className={`status-pill ${className}`}>{labels[status]}</span>
}
