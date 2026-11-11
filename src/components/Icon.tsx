import type { ReactNode } from 'react'

export type IconName =
  | 'arrow' | 'building' | 'dashboard' | 'document' | 'help' | 'home'
  | 'ledger' | 'purchase' | 'sales' | 'settings' | 'switch'

const paths: Record<IconName, ReactNode> = {
  arrow: <path d="m9 18 6-6-6-6m6 6H3" />,
  building: <path d="M3 21h18M6 21V5l6-3v19m6 0V9l-6-2M9 9h.01M9 13h.01M9 17h.01M15 13h.01M15 17h.01" />,
  dashboard: <path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-12h6V4h-6v4Z" />,
  document: <path d="M7 3h7l4 4v14H7V3Zm7 0v5h5M10 12h5m-5 4h5" />,
  help: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-3-13a3 3 0 1 1 4.8 2.4c-1 .75-1.8 1.2-1.8 2.6m0 4h.01" />,
  home: <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3V11Z" />,
  ledger: <path d="M5 4h14v16H5V4Zm4 0v16M12 8h4m-4 4h4m-4 4h4" />,
  purchase: <path d="M4 5h2l2 10h9l2-7H7m2 11h.01M17 19h.01" />,
  sales: <path d="M4 19V9m6 10V5m6 14v-7m4 7H2" />,
  settings: <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7.4-3.5a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.5 1a8 8 0 0 0-1.7-1L14.7 3h-4L10.3 6a8 8 0 0 0-1.7 1L6.1 6 4 9.4 6.1 11a7 7 0 0 0 0 2L4 14.6 6.1 18l2.5-1a8 8 0 0 0 1.7 1l.4 3h4l.4-3a8 8 0 0 0 1.7-1l2.5 1 2-3.4-2-1.6a7 7 0 0 0 .1-1Z" />,
  switch: <path d="M16 3h5v5m0-5-7 7M8 21H3v-5m0 5 7-7" />,
}

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <span className="icon" aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </svg>
    </span>
  )
}

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M5 17.5V10l7-5 7 5v7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 17.5v-4h7v4M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="m16.5 6.8 2-2 1.2 1.2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  )
}
