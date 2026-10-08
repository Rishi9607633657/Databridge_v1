/* DataBridge dashboard analytics — colour themes, date/timestamp handling, forecasting, anomalies,
   correlation and data-driven insights. Pure functions; loaded before dashboards.js. */
'use strict';

const DB_THEMES = {
  vivid: ['#0A5CFF', '#12B5CB', '#F59E0B', '#E11D74', '#22C55E', '#8B5CF6', '#F97316', '#0EA5A4', '#84CC16', '#EF4444'],
  ocean: ['#0B4F9C', '#0A84C6', '#12B5CB', '#35C9A5', '#7ED6DF', '#1E3A8A', '#0E7490', '#38BDF8', '#5EEAD4', '#2563EB'],
  sunset: ['#E11D48', '#F97316', '#F59E0B', '#EAB308', '#DB2777', '#9333EA', '#FB7185', '#FDBA74', '#C026D3', '#F43F5E'],
  forest: ['#166534', '#16A34A', '#65A30D', '#CA8A04', '#0F766E', '#4D7C0F', '#22C55E', '#A3E635', '#15803D', '#84CC16'],
  mono: ['#0A5CFF', '#3B7BFF', '#6C9BFF', '#9DBBFF', '#1F4FD1', '#5B8CFF', '#8FB0FF', '#2D65F0', '#7AA2FF', '#B7CCFF'],
};
const DB_GRAINS = { auto: 'Automatic', hour: 'Hour', day: 'Day', week: 'Week', month: 'Month', quarter: 'Quarter', year: 'Year' };

/* ---------- dates & timestamps ---------- */
function dbParseTime(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return v > 1e12 ? v : v > 1e9 ? v * 1000 : null;     // epoch ms / s
  const s = String(v).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?(Z|[+-]\d{2}:?\d{2})?$/.exec(s);
  if (!m) {
    if (/^\d{4}-\d{2}$/.test(s)) return Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, 1);
    return null;
  }
  if (m[7]) { const t = Date.parse(s.replace(' ', 'T')); return Number.isNaN(t) ? null : t; }
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
}
const dbDay = (ms) => new Date(ms).toISOString().slice(0, 10);
function dbBucket(ms, grain) {
  const d = new Date(ms);
  const y = d.getUTCFullYear(), mo = d.getUTCMonth();
  switch (grain) {
    case 'hour': return `${d.toISOString().slice(0, 13)}:00`;
    case 'week': { const dow = (d.getUTCDay() + 6) % 7; return dbDay(ms - dow * 86400000); }
    case 'month': return `${y}-${String(mo + 1).padStart(2, '0')}`;
    case 'quarter': return `${y}-Q${Math.floor(mo / 3) + 1}`;
    case 'year': return String(y);
    default: return dbDay(ms);
  }
}
function dbAutoGrain(minMs, maxMs) {
  const days = (maxMs - minMs) / 86400000;
  if (days <= 2) return 'hour';
  if (days <= 120) return 'day';
  if (days <= 540) return 'week';
  if (days <= 3650) return 'month';
  return 'year';
}
function dbNextLabels(last, grain, n) {
  const out = [];
  let ms = dbParseTime(last.replace(/-Q(\d)$/, (_, q) => `-${String((q - 1) * 3 + 1).padStart(2, '0')}`).replace(/:00$/, ':00:00'));
  if (ms == null && /^\d{4}$/.test(last)) ms = Date.UTC(+last, 0, 1);
  if (ms == null) { for (let i = 1; i <= n; i++) out.push(`+${i}`); return out; }
  for (let i = 1; i <= n; i++) {
    const d = new Date(ms);
    if (grain === 'hour') ms += 3600000;
    else if (grain === 'week') ms += 7 * 86400000;
    else if (grain === 'month') ms = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
    else if (grain === 'quarter') ms = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 3, 1);
    else if (grain === 'year') ms = Date.UTC(d.getUTCFullYear() + 1, 0, 1);
    else ms += 86400000;
    out.push(dbBucket(ms, grain));
  }
  return out;
}
/* replace a time column's values with bucket labels; returns {rows, grain} */
function dbBucketRows(cols, rows, col, grain) {
  const i = cols.indexOf(col);
  if (i < 0) return { rows, grain: null };
  let lo = Infinity, hi = -Infinity;
  const ms = rows.map((r) => { const t = dbParseTime(r[i]); if (t != null) { lo = Math.min(lo, t); hi = Math.max(hi, t); } return t; });
  if (lo === Infinity) return { rows, grain: null };
  const g = !grain || grain === 'auto' ? dbAutoGrain(lo, hi) : grain;
  return { rows: rows.map((r, k) => { if (ms[k] == null) return r; const c = r.slice(); c[i] = dbBucket(ms[k], g); return c; }), grain: g };
}

/* ---------- statistics & ML ---------- */
const dbMean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
function dbLinReg(ys) {
  const n = ys.length;
  if (n < 2) return { slope: 0, intercept: ys[0] || 0, r2: 0 };
  const mx = (n - 1) / 2, my = dbMean(ys);
  let sxy = 0, sxx = 0, syy = 0;
  ys.forEach((y, x) => { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; });
  const slope = sxx ? sxy / sxx : 0;
  return { slope, intercept: my - slope * mx, r2: syy ? (sxy * sxy) / (sxx * syy) : 0 };
}
function dbMovingAvg(ys, n) {
  return ys.map((_, i) => (i + 1 < n ? null : dbMean(ys.slice(i + 1 - n, i + 1))));
}
function dbHolt(ys, alpha, beta) {
  let l = ys[0], b = ys.length > 1 ? ys[1] - ys[0] : 0, sse = 0;
  const fit = [l];
  for (let t = 1; t < ys.length; t++) {
    const f = l + b;
    fit.push(f); sse += (ys[t] - f) ** 2;
    const nl = alpha * ys[t] + (1 - alpha) * (l + b);
    b = beta * (nl - l) + (1 - beta) * b; l = nl;
  }
  return { l, b, sse, fit };
}
function dbHoltWinters(ys, m, alpha, beta, gamma) {
  const s0 = dbMean(ys.slice(0, m)), s1 = dbMean(ys.slice(m, 2 * m));
  let l = s0, b = (s1 - s0) / m, sse = 0;
  const season = ys.slice(0, m).map((y) => y - s0);
  const fit = [];
  for (let t = 0; t < ys.length; t++) {
    const si = season[t % m];
    const f = l + b + si;
    if (t >= m) { sse += (ys[t] - f) ** 2; }
    fit.push(t >= m ? f : null);
    const nl = alpha * (ys[t] - si) + (1 - alpha) * (l + b);
    const nb = beta * (nl - l) + (1 - beta) * b;
    season[t % m] = gamma * (ys[t] - nl) + (1 - gamma) * si;
    l = nl; b = nb;
  }
  return { l, b, season, sse, fit, n: ys.length };
}
/* Forecast h steps: Holt-Winters (seasonal) when there is enough history, otherwise Holt linear trend. */
function dbForecast(ys, h, season = 0) {
  const clean = ys.map((v) => (Number.isFinite(v) ? v : 0));
  if (clean.length < 4 || h < 1) return null;
  for (const a of dbAnomalies(clean, 3.5, season)) {                       // fit on cleaned data: outliers -> local median
    const win = clean.slice(Math.max(0, a.i - 3), a.i + 4).filter((_, k, arr) => k !== Math.min(3, a.i)).sort((x, y) => x - y);
    if (win.length) clean[a.i] = win[Math.floor(win.length / 2)];
  }
  const grid = [0.1, 0.3, 0.5, 0.7, 0.9], bgrid = [0.05, 0.15, 0.3];
  let best = null;
  for (const a of grid) for (const b of bgrid) {
    const r = dbHolt(clean, a, b);
    if (!best || r.sse < best.sse) best = { ...r, kind: 'holt' };
  }
  const m = season > 1 ? season : 0;
  if (m && clean.length >= 2 * m + 2) {
    for (const a of [0.2, 0.4, 0.6]) for (const b of [0.05, 0.15]) for (const g of [0.1, 0.3, 0.5]) {
      const r = dbHoltWinters(clean, m, a, b, g);
      const scaled = (r.sse / Math.max(1, clean.length - m)) * (clean.length - 1);
      if (scaled < best.sse * 0.9) best = { ...r, sse: scaled, kind: 'hw' };
    }
  }
  const nfit = best.kind === 'hw' ? clean.length - m : clean.length - 1;
  const sd = Math.sqrt(best.sse / Math.max(1, nfit));
  const values = [], lower = [], upper = [];
  for (let k = 1; k <= h; k++) {
    let v = best.l + k * best.b;
    if (best.kind === 'hw') v += best.season[(best.n + k - 1) % m];
    const band = 1.28 * sd * Math.sqrt(k);                    // ~80% interval
    values.push(v); lower.push(v - band); upper.push(v + band);
  }
  return { values, lower, upper, clean, method: best.kind === 'hw' ? `Holt-Winters (season ${m})` : 'Holt linear trend', fit: best.fit };
}
/* robust anomalies: residuals from a moving median (minus the regular seasonal pattern), scored with median/MAD.
   Iterative: take the most extreme point, replace it with its expected value, re-score — so one spike can't
   distort its neighbours. */
function dbAnomalies(ys, thresh = 3.5, season = 0) {
  const n = ys.length;
  if (n < 7) return [];
  const w = Math.max(3, Math.min(7, Math.floor(n / 4)));
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); const k = Math.floor(s.length / 2); return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2; };
  const work = ys.slice();
  const found = [];
  const level = med(ys.map((v) => Math.abs(v))) || 1;
  for (let pass = 0; pass < 6; pass++) {
    const base = work.map((_, i) => med(work.slice(Math.max(0, i - w), Math.min(n, i + w + 1))));
    let res = work.map((y, i) => y - base[i]);
    let off = null;
    if (season > 1 && n >= 2 * season) {
      off = Array.from({ length: season }, (_, p) => med(res.filter((_, i) => i % season === p)));
      res = res.map((r, i) => r - off[i % season]);
    }
    const mres = med(res);
    const mad = Math.max(med(res.map((r) => Math.abs(r - mres))), 0.03 * level);   // noise floor
    let top = null;
    res.forEach((r, i) => { const z = (0.6745 * (r - mres)) / mad; if (!found.some((f) => f.i === i) && (!top || Math.abs(z) > Math.abs(top.z))) top = { i, z }; });
    if (!top || Math.abs(top.z) < thresh) break;
    const expected = base[top.i] + (off ? off[top.i % season] : 0);
    if (Math.abs(work[top.i] - expected) < 0.12 * Math.max(Math.abs(expected), 0.5 * level)) break;   // too small to matter
    found.push(top);
    work[top.i] = base[top.i] + (off ? off[top.i % season] : 0);
  }
  return found;
}
function dbPearson(a, b) {
  const pairs = a.map((x, i) => [x, b[i]]).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (pairs.length < 5) return null;
  const mx = dbMean(pairs.map((p) => p[0])), my = dbMean(pairs.map((p) => p[1]));
  let sxy = 0, sxx = 0, syy = 0;
  pairs.forEach(([x, y]) => { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; });
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null;
}
function dbSeasonFor(grain, n) {
  if (grain === 'day' && n >= 16) return 7;
  if (grain === 'hour' && n >= 50) return 24;
  if (grain === 'month' && n >= 26) return 12;
  if (grain === 'quarter' && n >= 10) return 4;
  return 0;
}

/* ---------- data-driven insights for one chart (no calendar assumptions) ---------- */
function dbChartInsights({ title, labels, series, isTime, grain, fmt, lowerBetter }) {
  const out = [];
  const s0 = series[0];
  if (!s0) return out;
  const ys = s0.data.map((v) => (Number.isFinite(v) ? v : 0));
  const good = (up) => up !== !!lowerBetter;
  if (isTime && ys.length >= 5) {
    const { slope, r2 } = dbLinReg(ys);
    const mean = dbMean(ys) || 1;
    const total = (slope * (ys.length - 1)) / Math.abs(mean);
    if (r2 >= 0.35 && Math.abs(total) >= 0.05) {
      out.push({ tag: 'Trend', score: Math.min(1, Math.abs(total)) * (0.6 + r2 * 0.4), good: good(total > 0), title: `${title}: ${total > 0 ? 'rising' : 'falling'} trend`,
        text: `${s0.name} has ${total > 0 ? 'risen' : 'fallen'} steadily across the shown range (about ${total > 0 ? '+' : '−'}${Math.abs(total * 100).toFixed(0)}% from start to end, fit R² ${r2.toFixed(2)}).` });
    }
    const h = Math.max(1, Math.min(7, Math.floor(ys.length / 3)));
    const fc = dbForecast(ys, h, dbSeasonFor(grain, ys.length));
    if (fc) {
      const next = fc.values.reduce((a, v) => a + v, 0), last = fc.clean.slice(-h).reduce((a, v) => a + v, 0);   // like-for-like: outliers removed
      if (last) {
        const ch = (next - last) / Math.abs(last);
        if (Math.abs(ch) >= 0.03) out.push({ tag: 'Forecast', score: Math.min(0.9, Math.abs(ch) * 1.5), good: good(ch > 0), title: `${title}: forecast`,
          text: `Next ${h} ${grain || 'step'}${h > 1 ? 's' : ''} are expected to total about ${fmt(next)}, ${ch > 0 ? 'up' : 'down'} ${Math.abs(ch * 100).toFixed(1)}% on the last ${h} (${fc.method}).` });
      }
    }
    for (const a of dbAnomalies(ys, 3.5, dbSeasonFor(grain, ys.length)).sort((x, y) => Math.abs(y.z) - Math.abs(x.z)).slice(0, 2)) {
      out.push({ tag: 'Anomaly', score: Math.min(0.95, 0.45 + Math.abs(a.z) / 20), good: good(a.z > 0), anomaly: true, title: `Unusual ${a.z > 0 ? 'high' : 'low'}: ${labels[a.i]}`,
        text: `${s0.name} on ${labels[a.i]} was ${fmt(ys[a.i])}, far ${a.z > 0 ? 'above' : 'below'} its usual level around that time.` });
    }
    const cv = Math.sqrt(dbMean(ys.map((v) => (v - mean) ** 2))) / Math.abs(mean);
    if (cv > 0.6 && ys.length >= 8) out.push({ tag: 'Volatility', score: 0.3, good: false, title: `${title}: very uneven`, text: `${s0.name} swings a lot from one ${grain || 'step'} to the next (variation ${Math.round(cv * 100)}% of the average).` });
  } else if (!isTime && labels.length >= 2 && series.length === 1) {
    const total = ys.reduce((a, v) => a + Math.max(0, v), 0);
    if (total > 0) {
      const ranked = labels.map((l, i) => [l, ys[i]]).sort((a, b) => b[1] - a[1]);
      const share = ranked[0][1] / total;
      if (share >= 0.35 && labels.length >= 3) out.push({ tag: 'Share', score: Math.min(0.8, share), good: true, title: `${ranked[0][0]} leads ${title}`, text: `${ranked[0][0]} accounts for ${(share * 100).toFixed(0)}% of ${s0.name} — ${ranked.length > 1 ? `${(ranked[0][1] / Math.max(1e-9, ranked[1][1])).toFixed(1)}× the next (${ranked[1][0]})` : ''}.` });
      const bottom = ranked[ranked.length - 1];
      if (ranked.length >= 4 && bottom[1] > 0 && ranked[0][1] / bottom[1] >= 3) out.push({ tag: 'Gap', score: 0.35, good: false, title: `${bottom[0]} lags in ${title}`, text: `${bottom[0]} has the lowest ${s0.name} (${fmt(bottom[1])}), ${(ranked[0][1] / bottom[1]).toFixed(1)}× below ${ranked[0][0]}.` });
    }
  }
  if (series.length >= 2) {
    const r = dbPearson(series[0].data, series[1].data);
    if (r != null && (r >= 0.7 || r <= -0.6)) out.push({ tag: 'Correlation', score: Math.abs(r) * 0.7, good: true, title: `${series[0].name} & ${series[1].name}`,
      text: `${series[0].name} and ${series[1].name} ${r > 0 ? 'move together' : 'move in opposite directions'} in “${title}” (correlation ${r.toFixed(2)}).` });
  }
  return out;
}
