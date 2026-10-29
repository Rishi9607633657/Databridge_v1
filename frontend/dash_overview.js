/* DataBridge AI Overview widgets for the Dashboards tab (backend/dash_overview.py plans dashboards that use them):
   - rank      Top list: rank, building chip, name, bar, value and the change vs the previous period
   - catlist   Category list: an icon picked from the category's name, bar, value and share
   - globe     Global overview: region list, the Overview's 3D globe with the top locations as buildings
               (the React embed in /static/overview/embed/; a 2D map without WebGL) and summary numbers
   - insight tiles for the Insights widget
   Clicking a row, a region, a callout or a building calls ctx.choose(column, value): that sets the linked
   dashboard filter (or cross-filters the page), and clicking the same value again clears it.
   Loaded after dash_charts.js and geo3d.js, before dashboards.js. */
'use strict';

/* gradient start, end and the mark colour, the same values as the Overview app */
const DB_OV_HUE = {
  green: ['#3FDB95', '#0E9F6E', '#12B76A'], blue: ['#5B8CFF', '#2155F0', '#2F6BFF'], violet: ['#B98BFF', '#7C3AED', '#8B5CF6'],
  orange: ['#FFC145', '#F97316', '#F79009'], rose: ['#FF7D93', '#E11D48', '#F43F5E'], teal: ['#4FE0CB', '#0D9488', '#14B8A6'],
  amber: ['#FFD75E', '#F59E0B', '#F5B70B'], sky: ['#4CC7FA', '#0284C7', '#0EA5E9'], slate: ['#B8C2D1', '#7A8799', '#94A3B8'],
};
const DB_OV_RANK = ['violet', 'blue', 'sky', 'amber', 'orange'];
const DB_OV_CATS = ['blue', 'sky', 'orange', 'violet', 'rose', 'teal', 'green', 'amber'];
const DB_OV_ZONES = ['green', 'blue', 'violet', 'orange', 'rose', 'teal', 'amber', 'sky'];
const DB_OV_KINDS = { store: 'Store', hospital: 'Hospital', bank: 'Bank', factory: 'Factory', campus: 'Campus', office: 'Office' };

const dbOvSvg = (paths, size = 18, sw = 2) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

/* building chips for the top list (one per building kind of the 3D scene) */
const DB_OV_BLD = {
  store: '<path d="M3 9l1.6-5h14.8L21 9"/><path d="M3 9h18v1.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 13v8h14v-8M10 21v-5h4v5"/>',
  hospital: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 7v6M9 10h6M10 21v-3h4v3"/>',
  bank: '<path d="M3 10h18L12 4z"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18"/>',
  factory: '<path d="M3 21V10l5 3v-3l5 3v-3l5 3V4h3v17z"/><path d="M7 17h2M12 17h2M17 17h1"/>',
  campus: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/>',
  office: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M11 21v-3h2v3"/>',
};

/* category icons, picked from the category's name */
const DB_OV_GLYPH = {
  shirt: '<path d="M20.4 6.6 16 4a4 4 0 0 1-8 0L3.6 6.6a1 1 0 0 0-.4 1.3l1.3 2.6a1 1 0 0 0 1.3.4L7 10.3V20a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-9.7l1.2.6a1 1 0 0 0 1.3-.4l1.3-2.6a1 1 0 0 0-.4-1.3z"/>',
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 20h20"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
  basket: '<path d="M5 10h14l-1.6 9a1.5 1.5 0 0 1-1.5 1.2H8.1a1.5 1.5 0 0 1-1.5-1.2z"/><path d="M8.5 10 11 4M15.5 10 13 4M3 10h18"/>',
  utensils: '<path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8a2 2 0 0 1-2 2M17 3c-2 0-3 2-3 5v5h3v8"/>',
  cup: '<path d="M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17M8 2.5V5M12 2.5V5"/>',
  sofa: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z"/><path d="M5 18v2M19 18v2"/>',
  sparkles: '<path d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4z"/><path d="M19 15l.7 1.9 1.8.6-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.6z"/>',
  shoe: '<path d="M3 16.5V9.2c0-.7.6-1.2 1.3-1.1L8 8.6l2.5 2.6 3.6.9 4.8 1.3A3 3 0 0 1 21 16.3v.2H3z"/><path d="M3 19.5h18"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  pill: '<path d="M10.5 20.5a5 5 0 0 1-7-7l10-10a5 5 0 0 1 7 7z"/><path d="M8.5 8.5l7 7"/>',
  heart: '<path d="M20.8 8.6a5 5 0 0 0-8.8-3.3 5 5 0 0 0-8.8 3.3c0 5.3 8.8 11.4 8.8 11.4s8.8-6.1 8.8-11.4z"/><path d="M3.5 12h4l2-3 3 6 2-3h6"/>',
  gem: '<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M12 21 9 9l3-6 3 6z"/>',
  car: '<path d="M5 17h14v-4.5l-1.7-4.3A2 2 0 0 0 15.4 7H8.6a2 2 0 0 0-1.9 1.2L5 12.5z"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/><path d="M5 12.5h14"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
};
const DB_OV_GLYPH_RULES = [
  [/footwear|shoe|sneaker|sandal|boot/i, 'shoe'], [/apparel|cloth|fashion|garment|wear|shirt|dress|textile/i, 'shirt'],
  [/mobile|phone|tablet/i, 'phone'], [/electronic|computer|laptop|gadget|appliance|\btv\b|audio|camera|tech/i, 'laptop'],
  [/grocer|supermarket|staple|fresh|vegetable|fruit|dairy|bakery|snack|meat|food/i, 'basket'],
  [/restaurant|dining|dine|meal|kitchen|cafe|menu|starter|main course|dessert/i, 'utensils'],
  [/beverage|drink|coffee|\btea\b|juice|wine|beer/i, 'cup'], [/home|living|furniture|decor|furnish|houseware/i, 'sofa'],
  [/beauty|cosmetic|personal|skin|makeup|fragrance|salon|\bspa\b|care/i, 'sparkles'], [/toy|kid|baby|child|game/i, 'smile'],
  [/book|station|education|course|school|learn/i, 'book'], [/sport|fitness|outdoor|\bgym\b/i, 'dumbbell'],
  [/pharma|medicine|drug|pill/i, 'pill'], [/health|medical|clinic|hospital|wellness/i, 'heart'],
  [/jewel|watch|accessor|\bgold\b|gem/i, 'gem'], [/auto|\bcar\b|vehicle|motor|bike/i, 'car'], [/service|repair|maintenance/i, 'wrench'],
];
const dbOvGlyph = (name) => DB_OV_GLYPH[(DB_OV_GLYPH_RULES.find(([rx]) => rx.test(String(name || ''))) || [])[1] || 'tag'];

/* insight tiles: tone, icon and colour from the finding's tag */
const DB_OV_INS = {
  up: '<path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  down: '<path d="M22 17l-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  pie: '<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
  wand: '<path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
};
function dbOvTone(it) {
  const t = String(it.tag || '').toLowerCase();
  if (/anomal|volatil/.test(t)) return ['warn', 'alert', 'amber'];
  if (/forecast/.test(t)) return ['info', 'wand', 'violet'];
  if (/target/.test(t)) return [it.good ? 'good' : 'bad', 'target', it.good ? 'green' : 'rose'];
  if (/share|gap|concentr|mix/.test(t)) return ['info', 'pie', 'sky'];
  if (/correl/.test(t)) return ['info', 'link', 'violet'];
  if (/driver/.test(t)) return [it.good ? 'good' : 'bad', 'zap', it.good ? 'teal' : 'orange'];
  if (/streak/.test(t)) return ['bad', 'alert', 'rose'];
  if (/best|peak|record/.test(t)) return ['good', 'star', 'green'];
  return it.good ? ['good', 'up', 'green'] : ['bad', 'down', 'rose'];
}

/* "outlet_name" -> Outlet / Outlets; "city" -> City / Cities */
function dbOvEntity(col) {
  const raw = String(col || 'location');
  const s = raw.replace(/(_?(id|code|no|key|name|number))$/i, '') || raw;
  const last = s.split(/[_\s]+/).filter(Boolean).pop() || s;
  let one = last.charAt(0).toUpperCase() + last.slice(1).toLowerCase();
  one = one.replace(/ies$/i, 'y').replace(/(ch|sh|x|ss)es$/i, '$1').replace(/([^su])s$/i, '$1');
  const many = /(s|x|z|ch|sh)$/i.test(one) ? `${one}es` : /[^aeiou]y$/i.test(one) ? `${one.slice(0, -1)}ies` : `${one}s`;
  return { one, many };
}
function dbOvKind(w) {
  if (w.kind && DB_OV_KINDS[w.kind]) return w.kind;
  const n = `${w.x || ''} ${w.title || ''}`.toLowerCase();
  return /hospital|clinic|pharma|health|patient|medical|lab/.test(n) ? 'hospital' : /bank|branch|atm|finance|loan/.test(n) ? 'bank'
    : /plant|factory|warehouse|mill|depot|manufactur|production/.test(n) ? 'factory' : /school|college|campus|universit|student/.test(n) ? 'campus'
    : /store|outlet|shop|restaurant|cafe|kitchen|retail|mart|showroom|franchise|sales/.test(n) ? 'store' : 'office';
}

/* value per label (aggregated the same way as every chart) */
function dbOvValues(cols, rows, w, x = w.x) {
  const a = dbAggregate(cols, rows, { x, y: [(w.y || [])[0]], agg: w.agg || 'sum' });
  const s = a.series[0];
  return new Map(a.labels.map((l, i) => [String(l), s ? s.data[i] : null]));
}
const dbOvMsg = (body, t) => body.append(el('p', { class: 'muted dash-msg' }, t));
const dbOvPct = (g) => `${Math.abs(g * 100).toFixed(Math.abs(g) < 0.1 ? 1 : 0)}%`;

/* ---------------- Top list ---------------- */
function dbOvRank(ctx, w, cols, rows, body) {
  const y = (w.y || [])[0];
  if (!w.x || !cols.includes(w.x) || !y || !cols.includes(y)) { dbOvMsg(body, 'Pick what to rank and the value to rank by.'); return; }
  const cur = dbOvValues(cols, rows, w);
  const prevRows = ctx.prevRows();
  const prev = prevRows && prevRows.length ? dbOvValues(cols, prevRows, w) : null;
  const all = [...cur.entries()].filter(([, v]) => dbIsNum(v)).sort((a, b) => b[1] - a[1]);
  if (!all.length) { dbOvMsg(body, 'No data in this period.'); return; }
  const n = Math.max(1, Math.min(50, Number(w.top) || 8));
  const list = all.slice(0, n);
  const max = Math.max(...list.map(([, v]) => Math.abs(v)), 1e-9);
  const sel = ctx.selected(w.x);
  const kind = dbOvKind(w);
  body.classList.add('ov-body');
  body.append(el('ol', { class: 'ov-list ov-rank' }, list.map(([name, v], i) => {
    const [c1, c2] = DB_OV_HUE[DB_OV_RANK[i % DB_OV_RANK.length]];
    const p = prev ? prev.get(name) : null;
    const g = dbIsNum(p) && p !== 0 ? (v - p) / Math.abs(p) : null;
    const tone = g == null || Math.abs(g) < 0.0005 ? 'flat' : (g > 0) !== !!w.lowerBetter ? 'good' : 'bad';
    return el('li', {}, el('button', { type: 'button', class: `ov-row${sel == null ? '' : sel === name ? ' on' : ' off'}`, 'aria-pressed': String(sel === name),
      title: `${name}: ${ctx.fmt(v)}${g == null ? '' : `, ${g >= 0 ? 'up' : 'down'} ${dbOvPct(g)} vs the previous period`}. ${sel === name ? 'Click to clear the filter' : 'Click to filter the dashboard'}`,
      onClick: () => ctx.choose(w.x, name) },
    el('span', { class: 'ov-no' }, `#${i + 1}`),
    el('span', { class: 'ov-chip', style: `--c:${c2}`, html: dbOvSvg(DB_OV_BLD[kind], 17) }),
    el('span', { class: 'ov-name' }, name),
    el('span', { class: 'ov-bar', 'aria-hidden': 'true' }, el('i', { style: `width:${Math.max(6, (Math.abs(v) / max) * 100).toFixed(1)}%;background:linear-gradient(90deg,${c1},${c2})` })),
    el('span', { class: 'ov-vd' }, el('span', { class: 'ov-val' }, ctx.fmt(v)),
      g == null ? null : el('span', { class: `ov-d ${tone}` }, `${g > 0.0005 ? '▲' : g < -0.0005 ? '▼' : ''} ${dbOvPct(g)}`))));
  })));
  if (all.length > n) body.append(el('p', { class: 'ov-foot' }, `Top ${n} of ${all.length}`));
}

/* ---------------- Category list ---------------- */
function dbOvCats(ctx, w, cols, rows, body) {
  const y = (w.y || [])[0];
  if (!w.x || !cols.includes(w.x) || !y || !cols.includes(y)) { dbOvMsg(body, 'Pick the categories and a value.'); return; }
  const all = [...dbOvValues(cols, rows, w).entries()].filter(([, v]) => dbIsNum(v)).sort((a, b) => b[1] - a[1]);
  if (!all.length) { dbOvMsg(body, 'No data in this period.'); return; }
  const n = Math.max(1, Math.min(50, Number(w.top) || 8));
  const avgLike = ['avg', 'min', 'max'].includes(w.agg);          // averages do not add up: no "Other" row, no shares
  const shown = all.length > n ? all.slice(0, avgLike ? n : n - 1) : all;
  const rest = avgLike ? [] : all.slice(shown.length);
  const total = all.reduce((t, [, v]) => t + Math.max(0, v), 0) || 1;
  const max = Math.max(...shown.map(([, v]) => Math.abs(v)), rest.reduce((t, [, v]) => t + v, 0), 1e-9);
  const sel = ctx.selected(w.x);
  const row = (name, v, i, other) => {
    const h = other ? DB_OV_HUE.slate : DB_OV_HUE[DB_OV_CATS[i % DB_OV_CATS.length]];
    const kids = [
      el('span', { class: 'ov-chip', style: `--c:${h[2]}`, html: dbOvSvg(other ? DB_OV_GLYPH.tag : dbOvGlyph(name), 17) }),
      el('span', { class: 'ov-name' }, name),
      el('span', { class: 'ov-bar', 'aria-hidden': 'true' }, el('i', { style: `width:${Math.max(5, (Math.abs(v) / max) * 100).toFixed(1)}%;background:linear-gradient(90deg,${h[0]},${h[1]})` })),
      el('span', { class: 'ov-val' }, ctx.fmt(v)),
      el('span', { class: 'ov-share' }, avgLike ? '' : `${((Math.max(0, v) / total) * 100).toFixed(0)}%`)];
    if (other) return el('li', {}, el('div', { class: 'ov-row ov-other', title: `${rest.length} more: ${rest.slice(0, 8).map(([k]) => k).join(', ')}${rest.length > 8 ? '…' : ''}` }, ...kids));
    return el('li', {}, el('button', { type: 'button', class: `ov-row${sel == null ? '' : sel === name ? ' on' : ' off'}`, 'aria-pressed': String(sel === name),
      title: `${name}: ${ctx.fmt(v)}. ${sel === name ? 'Click to clear the filter' : 'Click to filter the dashboard'}`, onClick: () => ctx.choose(w.x, name) }, ...kids));
  };
  body.classList.add('ov-body');
  body.append(el('ul', { class: 'ov-list ov-cats' }, shown.map(([k, v], i) => row(k, v, i, false)),
    rest.length ? row(`Other (${rest.length})`, rest.reduce((t, [, v]) => t + v, 0), 0, true) : null));
}

/* ---------------- Globe overview ---------------- */
const DB_OV_GEO = new Map();                 // "city|state|country" -> {lat, lon, iso} | null
let DB_OV_EMBED = null;
function dbOvEmbed() {
  if (!DB_OV_EMBED) {
    DB_OV_EMBED = import('/static/overview/embed/overview-embed.js?v=1')
      .then(() => window.DBOverviewEmbed || Promise.reject(new Error('The 3D globe did not start.')))
      .catch((e) => { DB_OV_EMBED = null; throw e; });
  }
  return DB_OV_EMBED;
}
function dbOvIso(world, v) {
  if (!v || !world) return '';
  if (!world._iso) { world._iso = new Map(); for (const f of world.gj.features) { const p = f.properties || {}; if (p.name && p.iso2) world._iso.set(p.name, p.iso2); } }
  const n = world.index.get(dbNorm(v));
  return n ? world._iso.get(n) || '' : '';
}
/* a city in the bundled places list (sorted by population): [name, iso2, state, lat, lon, …, alt names] */
function dbOvCity(idx, name, hint, iso) {
  if (!idx || !name) return null;
  const k = dbNorm(name);
  let c = idx.get(k) || idx.get(DB_CITY_ALIAS[k] || '') || idx.get(k.replace(/\b(city|nagar|district)\b/g, '').trim());
  if (!c) return null;
  const h = dbNorm(hint);
  if (h) { const m = c.filter((r) => dbNorm(r[2]) === h || dbNorm(r[1]) === h); if (m.length) c = m; }
  if (iso) { const m = c.filter((r) => r[1] === iso); if (m.length) c = m; }
  return { lat: c[0][3], lon: c[0][4], iso: c[0][1] || '' };
}
function dbOvPlace(e, idx, world) {
  if (e.lat != null && e.lon != null && Math.abs(e.lat) <= 90 && Math.abs(e.lon) <= 180) return { lat: e.lat, lon: e.lon, iso: dbOvIso(world, e.country) };
  const key = `${e.city}|${e.state}|${e.country}|${e.city ? '' : e.name}`;
  if (DB_OV_GEO.has(key)) return DB_OV_GEO.get(key);
  const iso = dbOvIso(world, e.country);
  let out = e.city ? dbOvCity(idx, e.city, e.state || e.country, iso) : null;
  if (!out && !e.city && e.name) out = dbOvCity(idx, e.name, e.state || e.country, iso);      // the location may itself be a city
  if (!out && (e.country || iso)) {
    const n = world.index.get(dbNorm(e.country || iso));
    const c = n && world.centre[n];
    if (c) out = { lat: c[1], lon: c[0], iso: iso || dbOvIso(world, n) };
  }
  if (out && !out.iso) out.iso = iso;
  DB_OV_GEO.set(key, out);
  return out;
}
function dbOvMonths(a, b) {
  if (!a || !b) return null;
  return Math.max(1, (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + Number(b.slice(5, 7)) - Number(a.slice(5, 7)) + 1);
}
function dbOvGlobe(ctx, w, cols, rows, body) {
  const y = (w.y || [])[0];
  const at = (c) => (c ? cols.indexOf(c) : -1);
  const xi = at(w.x), yi = at(y);
  if (xi < 0 || yi < 0) { dbOvMsg(body, 'Pick the location column and a value in the widget settings.'); return; }
  const zi = at(w.zone), ci = at(w.city), si = at(w.state), ki = at(w.country), lai = at(w.lat), loi = at(w.lon);
  const words = dbOvEntity(w.x);
  const noun = (n) => `${n} ${(n === 1 ? words.one : words.many).toLowerCase()}`;
  const num = (v) => (v == null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));
  const str = (r, i) => (i >= 0 && r[i] != null && r[i] !== '' ? String(r[i]) : '');
  const vals = dbOvValues(cols, rows, w);
  const info = new Map();
  for (const r of rows) {
    const k = r[xi] == null ? '(blank)' : String(r[xi]);
    const e = info.get(k);
    if (!e) info.set(k, { name: k, zone: zi >= 0 ? str(r, zi) || '(blank)' : '', city: str(r, ci), state: str(r, si), country: str(r, ki), lat: lai >= 0 ? num(r[lai]) : null, lon: loi >= 0 ? num(r[loi]) : null });
    else if (e.lat == null && lai >= 0) { e.lat = num(r[lai]); e.lon = num(r[loi]); }
  }
  const locs = [...info.values()].map((e) => ({ ...e, value: vals.get(e.name) })).filter((e) => dbIsNum(e.value));
  if (!locs.length) { dbOvMsg(body, 'No data in this period.'); return; }
  const zval = zi >= 0 ? dbOvValues(cols, rows, w, w.zone) : null;
  const zmap = new Map();
  for (const e of locs) { if (zi < 0) break; const z = zmap.get(e.zone) || { id: e.zone, n: 0 }; z.n++; zmap.set(e.zone, z); }
  const zones = [...zmap.values()].map((z) => ({ ...z, value: zval.get(z.id) })).sort((a, b) => (b.value || 0) - (a.value || 0));
  zones.forEach((z, i) => { z.hue = DB_OV_ZONES[i % DB_OV_ZONES.length]; });
  const hueOf = new Map(zones.map((z) => [z.id, DB_OV_HUE[z.hue][2]]));
  const sel = zi >= 0 ? ctx.selected(w.zone) : null;
  // ---- layout: regions | stage, then the numbers
  body.classList.add('gb-body');
  const regionList = zones.length ? el('ul', { class: 'gb-regions', 'aria-label': `Regions (${dbHuman(w.zone)})` },
    zones.slice(0, 6).map((z) => el('li', {}, el('button', { type: 'button', class: `gb-region${sel == null ? '' : sel === z.id ? ' on' : ' off'}`, 'aria-pressed': String(sel === z.id),
      title: `${z.id}: ${noun(z.n)}, ${ctx.fmt(z.value)}. ${sel === z.id ? 'Click to clear the filter' : 'Click to filter the dashboard'}`, onClick: () => ctx.choose(w.zone, z.id) },
    el('span', { class: 'gb-ring', style: `border-color:${DB_OV_HUE[z.hue][2]}` }),
    el('span', {}, el('strong', {}, z.id), el('small', {}, noun(z.n)))))),
    zones.length > 6 ? el('li', { class: 'gb-more' }, `+${zones.length - 6} more in the ${dbHuman(w.zone).toLowerCase()} filter`) : null) : null;
  const stage = el('div', { class: 'gb-stage' });
  const countries = ki >= 0 ? new Set(locs.map((e) => e.country).filter(Boolean)).size : null;
  const cities = ci >= 0 ? new Set(locs.map((e) => e.city).filter(Boolean)).size : null;
  const span = ctx.dataSpan();
  const months = span ? dbOvMonths(span[0], span[1]) : null;
  const stat = (ico, n, label) => el('div', {}, el('dt', { html: dbOvSvg(ico, 18) }), el('dd', {}, el('strong', {}, n == null ? '—' : Number(n).toLocaleString('en-IN')), el('span', {}, label)));
  const stats = el('dl', { class: 'gb-stats' },
    stat('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>', locs.length, `Total ${words.many.toLowerCase()}`),
    stat('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>', countries, 'Countries'),
    stat(DB_OV_BLD.office, cities, 'Cities'),
    months != null ? stat('<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>', months, 'Months of data')
      : stat('<path d="M12 3l9 4.5-9 4.5-9-4.5z"/><path d="M3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5"/>', zones.length || null, 'Regions'));
  body.append(el('div', { class: `gb-grid${regionList ? '' : ' solo'}` }, regionList, stage), stats);
  // ---- the scene (kept between redraws, so filters do not restart the globe)
  const key = `globe:${w.id}`;
  let entry = ctx.claim(key);
  if (!entry) {
    entry = { reusable: true, holder: el('div', { class: 'gb-embed' }), handle: null, tok: 0,
      destroy() { this.dead = true; if (this.handle) { try { this.handle.unmount(); } catch { /* gone */ } this.handle = null; } } };
  }
  ctx.register(key, entry);
  stage.append(entry.holder);
  const tok = ++entry.tok;
  if (!entry.handle) stage.append(el('div', { class: 'gb-loading', role: 'status', 'aria-label': 'Loading the globe' }, el('span')));
  (async () => {
    let idx = null, world = null, E = null;
    try { [idx, world] = await Promise.all([dbPlaces(), dbGeoMap('world')]); E = await dbOvEmbed(); }
    catch (err) { if (!entry.dead && tok === entry.tok) { stage.querySelector('.gb-loading')?.remove(); stage.append(el('p', { class: 'muted dash-msg' }, `The globe could not load (${err.message}). Reload the page to try again.`)); } return; }
    if (entry.dead || tok !== entry.tok) return;
    const located = [];
    for (const e of locs) { const p = dbOvPlace(e, idx, world); if (p) located.push({ ...e, lat: p.lat, lon: p.lon, iso: p.iso || '' }); }
    // markers: one per city (size = how many locations it has)
    const pts = new Map();
    for (const e of located) {
      const k = `${e.lat.toFixed(2)},${e.lon.toFixed(2)}`;
      const p = pts.get(k) || { id: k, lat: e.lat, lon: e.lon, n: 0, value: 0, zone: e.zone, place: e.city || e.state || e.name };
      p.n++; p.value += e.value; pts.set(k, p);
    }
    const maxN = Math.max(1, ...[...pts.values()].map((p) => p.n));
    const markers = [...pts.values()].map((p) => ({ id: p.id, lat: p.lat, lon: p.lon, color: hueOf.get(p.zone) || DB_OV_HUE.blue[2],
      size: 0.011 + 0.012 * Math.sqrt(p.n / maxN), dim: sel != null && p.zone !== sel, label: `${p.place}: ${noun(p.n)}, ${ctx.fmt(p.value)}` }));
    // callouts: the biggest regions, at the middle of their locations
    const callouts = zones.slice(0, 6).map((z, i) => {
      const ls = located.filter((e) => e.zone === z.id);
      if (!ls.length) return null;
      const wt = (e) => Math.max(0, e.value) || 1;
      const tw = ls.reduce((t, e) => t + wt(e), 0);
      const isoCount = new Map();
      ls.forEach((e) => { if (e.iso) isoCount.set(e.iso, (isoCount.get(e.iso) || 0) + 1); });
      const flag = w.zone === w.country ? dbOvIso(world, z.id) || [...isoCount.keys()][0] || '' : [...isoCount.entries()].sort((a, b) => b[1] - a[1]).map((x) => x[0])[0] || '';
      return { id: `z${i}`, lat: ls.reduce((t, e) => t + e.lat * wt(e), 0) / tw, lon: ls.reduce((t, e) => t + e.lon * wt(e), 0) / tw, label: z.id, flag,
        line1: noun(z.n), line2: ctx.fmt(z.value), dim: sel != null && sel !== z.id, priority: sel === z.id ? -10 : i, onClick: () => ctx.choose(w.zone, z.id) };
    }).filter(Boolean);
    // buildings: the top locations, height = value
    const top = locs.slice().sort((a, b) => b.value - a.value).slice(0, 10);
    const maxV = Math.max(...top.map((e) => e.value), 1e-9);
    const buildings = top.map((e, i) => ({ id: e.name, name: e.name, rank: i + 1, height: 0.3 + (0.85 * Math.max(0, e.value)) / maxV,
      accent: DB_OV_HUE[DB_OV_RANK[i % DB_OV_RANK.length]][2], value: ctx.fmt(e.value), sub: `${words.one} · ${e.city || e.state || e.country || e.zone || ''}` }));
    const focus = (sel != null ? located.filter((e) => e.zone === sel) : located);
    const fw = focus.reduce((t, e) => t + (Math.max(0, e.value) || 1), 0);
    const focusLon = focus.length ? focus.reduce((t, e) => t + e.lon * (Math.max(0, e.value) || 1), 0) / fw : 62;
    const props = { markers, callouts, arcs: [], buildings, kind: dbOvKind(w), countries: [...new Set(located.map((e) => e.iso).filter(Boolean))],
      dark: ctx.dark, reducedMotion: ctx.reduced, autoRotate: w.autoRotate !== false && !ctx.reduced, showCity: ctx.wide && buildings.length > 0,
      focusLon, view: w.view === 'map' ? 'map' : 'globe', onSelect: (id) => ctx.choose(w.x, id) };
    stage.querySelector('.gb-loading')?.remove();
    if (!located.length) stage.append(el('p', { class: 'gb-note' }, `None of the ${words.many.toLowerCase()} could be placed on the map — add a city, country or latitude/longitude column in the widget settings.`));
    try {
      if (entry.handle) entry.handle.update(props); else entry.handle = E.mountGlobe(entry.holder, props);
    } catch (err) { stage.append(el('p', { class: 'muted dash-msg' }, `The globe could not start (${err.message}).`)); }
  })();
}

/* ---------------- insight tiles ---------------- */
function dbOvInsights(ctx, w, list, body, { loading, onAsk, onPage }) {
  const L = w.layout || { w: 4, h: 4 };
  const cols = L.w >= 9 ? 3 : L.w >= 6 ? 2 : 1;
  const px = (L.h || 3) * DB_ROW_H + ((L.h || 3) - 1) * DB_GAP;
  const rowsFit = Math.max(1, Math.floor((px - 104) / (cols > 1 ? 118 : 96)));
  const per = Math.max(1, Math.min(cols * rowsFit, 9));
  const pages = Math.max(1, Math.ceil(list.length / per));
  const p = (((w._page || 0) % pages) + pages) % pages;
  const shown = list.slice(p * per, p * per + per);
  const tile = (it) => {
    const [tone, ico, hue] = dbOvTone(it);
    return el('article', { class: `it it-${tone}`, style: `--c:${DB_OV_HUE[hue][2]}` },
      el('span', { class: 'it-ico', html: dbOvSvg(DB_OV_INS[ico], 20) }),
      el('div', { class: 'it-txt' }, el('h4', {}, it.title), el('p', {}, it.text)));
  };
  body.classList.add('it-body');
  body.append(shown.length ? el('div', { class: `it-grid${rowsFit === 1 ? ' one' : ''}`, style: `--it-cols:${Math.min(cols, Math.max(1, shown.length))}`, 'aria-live': 'polite' }, shown.map(tile))
    : el('p', { class: 'muted dash-msg' }, loading ? 'Reading your numbers…' : 'No notable changes in this period. Try a longer period, or add charts over time.'),
  el('div', { class: 'it-foot' },
    el('span', { class: 'it-note' }, list.length ? `Rule-based, from your numbers · ${list.length} found` : ''),
    list.length > per ? el('button', { type: 'button', class: 'btn sm it-more', onClick: () => onPage(p + 1) }, el('span', { html: dbOvSvg(DB_OV_INS.wand, 15) }), `More insights ${p + 1}/${pages}`) : null,
    list.length ? el('button', { type: 'button', class: 'btn sm', onClick: onAsk }, 'Ask Dora') : null));
}
