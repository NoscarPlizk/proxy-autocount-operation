import { Link } from 'react-router-dom'

export function NotFoundPage({ message = 'The page you requested does not exist.' }: { message?: string }) {
  return (
    <main className="not-found">
      <p className="kicker">Not found</p><h1>We could not open that page</h1><p>{message}</p>
      <div><Link className="primary-link" to="/">Return to company selection</Link></div>
    </main>
  )
}
