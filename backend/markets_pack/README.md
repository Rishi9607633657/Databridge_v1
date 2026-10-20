# DataBridge Markets pack

Indian stocks (NSE), mutual funds (AMFI) and forex, analysed every night, with five ready dashboards.

**Install:** sidebar › **Markets** › **Install Markets pack** (admins). It creates:

| What | Where |
|---|---|
| 7 notebooks | Workspace › Markets |
| Job **Markets — nightly refresh** | 23:40 IST, Monday–Friday |
| Job **Markets — live quotes** | every 5 min, 09:00–15:59 IST, paused until you add a broker key |
| 5 dashboards | Markets overview, Stock screener, Stock deep dive, Mutual funds & SIP, Forex |

The first run loads 3 years of history (Admin › Settings › Markets › *Years of history*). Downloads are paced
(one file per second by default), so the first run takes about an hour; later runs take minutes.

## Data sources

| Source | Files | Tables |
|---|---|---|
| NSE archives | `sec_bhavdata_full_DDMMYYYY.csv` (every security), `ind_close_all_DDMMYYYY.csv` (every index) | `market_raw.nse_equity_eod`, `market_raw.nse_indices` |
| niftyindices.com | `ind_nifty500list.csv` | `market_raw.nifty500` |
| AMFI | NAV history report (90 days per request), `NAVAll.txt` | `market_raw.amfi_nav` (growth options) |
| Frankfurter (ECB reference rates) | `/{start}..{end}?from=USD&to=INR` | `market_raw.fx_rates` |
| Your broker | Kite Connect `/quote`, Upstox `/v2/market-quote/quotes`, Dhan `/v2/marketfeed/quote` | `market_raw.live_quotes`, `market.live_latest` |

Analysis tables: `market.stock_prices`, `market.stock_scores`, `market.sector_returns`, `market.breadth`,
`market.index_prices`, `market.index_latest`, `market.fund_scores`, `market.fx_daily`, `market.fx_metrics`.

## Scores

Stocks (ranked against the NIFTY 500): trend 30% · momentum 30% · low risk 20% · liquidity 10% · delivery 10%.
Funds (ranked within their own category): SIP XIRR 3Y 40% · CAGR 3Y 20% · smaller falls 20% · lower volatility 20%.
Bands: Strong ≥ 75, Good 60–74, Neutral 40–59, Weak < 40.

Prices are adjusted for splits, bonuses and rights using NSE's own adjusted previous close on the ex-date.

## Rules to stay on the right side of the law

- **Not investment advice.** Every dashboard says so. Selling stock recommendations or research to clients in India
  requires SEBI registration (Research Analyst or Investment Adviser). Keep the product a screener unless you register.
- **Exchange data.** NSE end-of-day files are free to download and use inside your organisation. Redistributing NSE data
  to paying customers needs a data licence from NSE. Don't hammer the servers: keep the pause at 1 second or more.
- **Broker APIs** are for the account holder's own use under each broker's terms; never share the data or keys.
- **Mutual fund data** comes from AMFI's public NAV files; show the source and date.
