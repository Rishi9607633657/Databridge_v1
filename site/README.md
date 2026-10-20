# databridge-analytics.in — business website

One static page (`index.html` + `assets/`). No build step. Fonts are bundled (SIL Open Font License, see
`assets/fonts/LICENSES.txt`); the product screenshots (`assets/shots/*.webp`) are real DataBridge screens with made-up sample data.

Links on the page:
- **Sign in** → https://app.databridge-analytics.in/
- **Start free / Start a free 30-day pilot** → https://app.databridge-analytics.in/#signup (opens the sign-up form)
- **Book a demo / Talk to us** → mailto:hello@databridge-analytics.in

## Put it live on https://databridge-analytics.in (free, always on — even when your PC is off)
1. Cloudflare dashboard › **Workers & Pages** › **Create** › **Pages** › **Upload assets**.
2. Project name `databridge-site` › drag this `site` folder in › **Deploy**.
3. Project › **Custom domains** › **Set up a custom domain** › `databridge-analytics.in`, then again for `www.databridge-analytics.in`.
   If Cloudflare says a record already exists, delete the old `@` / `www` A or CNAME records (left over from GoDaddy) in DNS and retry.

Update later: Pages project › **Create deployment** › upload the folder again.
Or from a terminal with Node.js: `npx wrangler pages deploy site --project-name databridge-site`

## Make hello@databridge-analytics.in work (free)
Cloudflare › your domain › **Email** › **Email Routing** › enable › **Create address** `hello` → forward to your Gmail.

## Edit
- Prices: search for `Prices: edit` in `index.html`.
- Screenshots: replace the files in `assets/shots/` (same names, WebP, 1600 px wide; designs 1440 px).
- Share image: `assets/og.jpg` (1200 × 630).
