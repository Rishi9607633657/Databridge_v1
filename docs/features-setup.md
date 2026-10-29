# Setting up the new DataBridge features

Most features work as soon as you update. Set these up once in Admin › Settings.

## Notifications (budgets, alerts, data quality)

Admin › Settings › Notifications:

- **E-mail.** Fill in the SMTP server, port, user, password and From address. For Microsoft 365 use `smtp.office365.com:587`; for Gmail use `smtp.gmail.com:587` with an app password.
- **Slack.** In Slack, go to Apps › Incoming Webhooks › Add to a channel, then paste the URL.
- **Teams.** In the channel, open Workflows › "Post to a channel when a webhook request is received", then paste the URL.

Each alert or budget can also send to its own e-mail list or webhook.

## Budgets and invoices

Compute › Budgets › New budget.

- **What it watches:** everything, one cluster, one user, or one company. The company is the Company field in Admin › Users.
- **Warning:** it notifies when spend reaches the warning % of the monthly amount.
- **At 100%:** it can notify only, or also stop the clusters in scope until next month. An admin can lift the stop.

Invoices are in Compute › Invoices, one per company or per user. Open one and use Print › Save as PDF. Your company name, address, GSTIN and tax % go in Admin › Settings › Invoices.

## SQL alerts

There are two ways to create one: Alerts › New alert, or the Alert button in the SQL editor.

1. Write one SELECT. The alert checks the first row of the result.
2. Choose the condition: a value crosses a threshold, the query returns rows or no rows, or a value changes.
3. Choose the schedule and who to tell.

Alerts run as their owner, so the owner's data permissions apply.

## Sign in with Microsoft / Google (SSO)

First set Admin › Settings › Server › Public URL, for example `https://analytics.example.com`.

**Microsoft Entra ID (Azure AD)**

1. In the Azure portal, go to Entra ID › App registrations › New registration.
2. Set the Redirect URI type to Web, with the value `https://analytics.example.com/api/auth/sso/microsoft/callback`.
3. Copy the Application (client) ID. Under Certificates & secrets, create a New client secret and copy it.
4. In DataBridge (Admin › Settings › Single sign-on), fill in:
   - the client ID and secret;
   - the tenant: your Directory (tenant) ID to allow only your company. `organizations` with a list of allowed tenant IDs lets several customers in.

**Google**

1. In Google Cloud, go to APIs & Services › Credentials › Create OAuth client ID › Web application.
2. Add the authorized redirect URI `https://analytics.example.com/api/auth/sso/google/callback`.
3. In DataBridge, fill in the client ID and secret, plus **Allowed e-mail domains** (for example `acme.com`).

**Okta / Keycloak / Auth0**

Use "Other provider": the issuer URL, client ID and secret. The redirect URI is `…/api/auth/sso/oidc/callback`.

**Who gets in**

- People are matched to existing users by e-mail.
- New people get an account with the default role, but only from allowed domains or tenants.
- "Company sign-in only" turns off passwords for everyone except admins.

## Power BI, Excel and Tableau

Governance › Connect BI tools shows the URL.

1. Create an access token: click your name (bottom left) › API tokens › New token.
2. **Power BI:** Get data › OData feed › `https://<DataBridge>/api/odata/`. Choose Basic: the user name is your DataBridge user, the password is the token.
3. **Excel:** Data › Get Data › From Other Sources › From OData Feed, with the same URL and sign-in.
4. **Your own SQL:** `https://<DataBridge>/api/bi/query?sql=SELECT…` returns CSV. In Power BI use Get data › Web with Basic sign-in.

Masks, row filters and grants apply to the person whose token is used.

## Governance

Governance › Permissions / Column masks / Row filters / Test as a user.

- **Masks** hide a column for everyone except the people you list. Options: hash, last 4 characters, e-mail domain only, `****`, NULL, or a custom SQL expression.
- **Row filters** limit rows per person. Example: `tenant = {company}`. You can use `{company}`, `{username}`, `{email}` and `{role}`.
- **Grants** are only enforced after you turn on Admin › Settings › Governance › Require table grants.

What the rules cover and don't cover:

- They apply to the SQL editor, dashboards, Catalog samples, Ask data, alerts and the BI endpoint.
- Python code in notebooks is not filtered. Give people who must see only masked data the Viewer role.
- Admins always see everything.

The audit log (Admin › Audit log › Data access) shows who read which tables.

## Lineage and impact analysis

Lineage is recorded automatically when notebooks, jobs and SQL read or write tables. This covers `spark.sql`, `%sql`, `saveAsTable`, `insertInto`, `writeTo` and Delta `merge`.

To use it, open Catalog › table › Lineage. Pick a column in "Impact analysis" to see which notebooks, jobs, dashboards and alerts mention it before you rename or drop it.

## Data quality

Add rules in Catalog › table › Quality: not empty, unique, between, one of a list, pattern, row count, freshness, a condition, or custom SQL. Then:

- run them on a schedule, with notifications, or
- run them from a notebook or job: `dbutils.quality.check("sales.orders")`. The task fails when a "Fail" rule fails.

## Run a job when files arrive

Edit the job and switch on "Run when new files arrive". The folder can be:

- a local, network or mounted path;
- `abfss://…` (ADLS Gen2), using ADLS_ACCOUNT / ADLS_KEY or managed identity;
- `s3://…` (S3 or OCI), using S3_ACCESS_KEY / S3_SECRET_KEY / S3_ENDPOINT;
- a Data Hub SFTP / folder connection.

The job receives `dbutils.widgets.get("trigger_files")`.

## Cluster libraries and startup code

Compute › Clusters › edit › Libraries and startup code:

- **PyPI packages** are installed once into a shared folder, so Kubernetes executors see them too.
- **Maven packages** are downloaded when Spark starts.
- **Startup code** runs in every notebook and job on that cluster.

Maven packages need the current `config/spark_init.py`. Admin › System health warns you if yours is older. The fix is to copy `config/spark_init.latest.py` over it, keeping any changes of your own.

## Machine learning (MLflow)

Every notebook and job logs to MLflow automatically. Runs go to an experiment named after the notebook.

Machine learning › Models › Serve starts a REST endpoint:

```
curl -X POST https://<DataBridge>/api/ml/serving/<name>/invocations \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"inputs": [[1, 2, 3]]}'
```

The full MLflow UI is at `/mlflow/`, for signed-in users only.

## Ask data

Ask data uses the AI model set in Admin › Settings › Dora (AI). Ollama works locally; Groq, Gemini and OpenRouter have free tiers.

Answers come only from tables the person may read. The SQL is always shown. Table and column comments in the Catalog make answers better.

## Maps, globe and 3D digital twin

Add a widget, then pick one of these types:

- **Map (2D):** areas coloured by value, cities as pulsing bubbles, or animated arcs (set "Flows to").
- **3D map:** areas raised by value.
- **3D globe:** the Earth, with countries coloured by value, pillars on places, and arcs for flows.
- **3D digital twin:** a building (X = floor, zones = rooms or areas) or a campus (one building per site).

**Where things go**

- The X axis is the location. It can be an area name (country, state, ISO code), a city or town name, or latitude and longitude columns (set these in Map settings).
- Value = size or height. "Colour by" adds a second measure.
- For cities with the same name in two places (for example Aurangabad in Maharashtra and in Bihar), add the state column in "State or country column".

**Built-in maps**

- World, drawn with India's official boundary.
- India: states and UTs.
- USA: states.

**Your own maps.** Admins can use Manage maps in the widget editor to upload GeoJSON: city wards, delivery zones, districts or a floor plan. Convert Shapefile or KML to GeoJSON at mapshaper.org first.

The 3D widgets need WebGL, which current Chrome and Edge have.
