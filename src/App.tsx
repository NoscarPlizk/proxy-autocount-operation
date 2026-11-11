import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { CompanyProvider } from './context/CompanyContext'
import { CompanyLayout } from './layouts/CompanyLayout'
import { CompanyDashboardPage } from './pages/CompanyDashboardPage'
import { CompanySelectionPage } from './pages/CompanySelectionPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SectorPage } from './pages/SectorPage'

function App() {
  return (
    <CompanyProvider>
      <Routes>
        <Route path="/" element={<CompanySelectionPage />} />
        <Route path="/companies/:companySlug" element={<CompanyLayout />}>
          <Route index element={<CompanyDashboardPage />} />
          <Route path=":sector" element={<SectorPage />} />
        </Route>
        <Route path="/companies" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </CompanyProvider>
  )
}

export default App
