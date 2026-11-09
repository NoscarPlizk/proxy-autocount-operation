import { Router } from 'express'
import { listPublicCompanies } from '../config/company-config.js'

export const companyRouter = Router()

companyRouter.get('/', (_request, response) => {
  response.json({ companies: listPublicCompanies() })
})

companyRouter.get('/:companySlug', (request, response) => {
  const company = listPublicCompanies().find(({ slug }) => slug === request.params.companySlug)
  if (!company) {
    response.status(404).json({ code: 'company_not_found', message: 'The requested company is not configured in this portal.' })
    return
  }

  response.json({ company })
})
