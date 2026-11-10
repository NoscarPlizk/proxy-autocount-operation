import express from 'express'
import { listCompanyConfigs } from './config/company-config.js'
import { companyRouter } from './routes/company-routes.js'

const app = express()
const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST?.trim() || '127.0.0.1'

app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_request, response) => {
  const companies = listCompanyConfigs()
  response.json({
    status: 'ok',
    configuredCompanies: companies.filter((company) => company.status === 'configured').length,
    companyFiles: companies.length,
    totalCompanies: companies.length,
  })
})

app.use('/api/companies', companyRouter)
app.use((_request, response) => {
  response.status(404).json({ code: 'not_found', message: 'API route not found.' })
})

app.listen(port, host, () => {
  console.log(`Portal backend listening on http://${host}:${port}`)
})
