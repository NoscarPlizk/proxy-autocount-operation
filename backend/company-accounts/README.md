# Company account configuration

Create one ignored `.env` file per AutoCount company account in this directory. Use a descriptive filename such as `acme-trading.env`; the filename becomes the company name and URL slug shown in the portal.

Each file must contain these three values:

```dotenv
AUTOCOUNT_ROOT_URL=https://accounting-api.autocountcloud.com/<account-book-id>
AUTOCOUNT_KEY_ID=<key-id>
AUTOCOUNT_API_KEY=<api-key>
```

Copy `company-name.env.example` as a starting point. A file appears on the company selection page after the page is reloaded. Portal access is enabled only when all three values are present, non-placeholder values and the root URL is HTTPS with an account-book path.

These files contain secrets. Never commit them, send them to the browser, or prefix their values with `VITE_`.
