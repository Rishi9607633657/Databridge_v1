/* DataBridge dashboard themes — background, cards, header, KPI surfaces, chart palettes and fonts.
   One registry drives dashboards, the theme gallery, the colour customizer and presentations. Loaded before dashboards.js. */
'use strict';

/* surface = how cards are drawn: flat | elevated | outline | glass | liquid | neo | clay | brutal | neon | paper */
const DB_THEME_DEFS = [
  // ---- Classic
  { id: 'clean', name: 'Clean', group: 'Classic', surface: 'flat', headLight: true,
    v: { bg: '#F3F5F9', card: '#FFFFFF', line: '#E1E6EF', text: '#14213D', muted: '#5B6B86', grid: '#EEF1F6', head: '#FFFFFF', headText: '#14213D', accent: '#0A5CFF', radius: '14px' },
    p: ['#0A5CFF', '#12B5CB', '#F59E0B', '#E11D74', '#22C55E', '#8B5CF6', '#F97316', '#0EA5A4', '#84CC16', '#EF4444'] },
  { id: 'ocean', name: 'Ocean', group: 'Classic', surface: 'elevated',
    v: { bg: '#E7F0FA', card: '#FFFFFF', line: '#D6E2F0', text: '#13233F', muted: '#5B6B86', grid: '#E3EAF4', head: 'linear-gradient(100deg,#0B3C7D 0%,#0A62C9 55%,#12A7D6 100%)', headText: '#FFFFFF', accent: '#0A62C9', radius: '14px' },
    p: ['#0B4F9C', '#0A84C6', '#12B5CB', '#35C9A5', '#F59E0B', '#1E3A8A', '#E11D74', '#38BDF8', '#5EEAD4', '#2563EB'] },
  { id: 'midnight', name: 'Midnight', group: 'Classic', surface: 'flat', dark: true,
    v: { bg: '#0E1430', card: '#1A2150', line: '#2A3270', text: '#EEF1FF', muted: '#A4AEDB', grid: '#283068', head: 'linear-gradient(100deg,#0B1028 0%,#1B2460 100%)', headText: '#FFFFFF', accent: '#3DD9EB', radius: '14px' },
    p: ['#3DD9EB', '#7C83FD', '#F7B32B', '#FF6B9A', '#2EE59D', '#A78BFA', '#FB923C', '#38BDF8', '#C4F042', '#F87171'] },
  { id: 'aurora', name: 'Aurora', group: 'Classic', surface: 'elevated',
    v: { bg: '#F5F1FB', card: '#FFFFFF', line: '#E7DDF5', text: '#2A1846', muted: '#76678F', grid: '#EFE7F8', head: 'linear-gradient(100deg,#4A1C7C 0%,#8E3FC1 50%,#C8579D 100%)', headText: '#FFFFFF', accent: '#8E3FC1', radius: '14px' },
    p: ['#7B3FE4', '#C056D8', '#E879A6', '#5B6CF0', '#22B8CF', '#9D4EDD', '#F59E0B', '#14B8A6', '#6366F1', '#EC4899'] },
  { id: 'corporate', name: 'Corporate Navy', group: 'Classic', surface: 'elevated',
    v: { bg: '#F4F6FA', card: '#FFFFFF', line: '#DDE3EC', text: '#0B1F3A', muted: '#5D6B82', grid: '#EDF1F6', head: 'linear-gradient(90deg,#0B1F3A,#163A6B)', headText: '#FFFFFF', accent: '#1F5FBF', radius: '10px' },
    p: ['#163A6B', '#1F5FBF', '#3E8ED0', '#14A098', '#F2A541', '#C0504D', '#7F6BB3', '#5AA9E6', '#9BBB59', '#4BACC6'] },
  { id: 'material', name: 'Material You', group: 'Classic', surface: 'elevated',
    v: { bg: '#F7F2FA', card: '#FFFFFF', line: '#E7E0EC', text: '#1D1B20', muted: '#625B71', grid: '#EEE8F4', head: '#6750A4', headText: '#FFFFFF', accent: '#6750A4', radius: '20px' },
    p: ['#6750A4', '#7D5260', '#386A20', '#006A6A', '#B3261E', '#8B5000', '#4F378B', '#0061A4', '#984061', '#625B71'] },
  // ---- Glass & soft UI
  { id: 'glass', name: 'Glassmorphism', group: 'Glass & soft UI', surface: 'glass', dark: true,
    v: { bg: 'radial-gradient(at 12% 18%,#7F5AF0 0,transparent 42%),radial-gradient(at 88% 12%,#2CB67D 0,transparent 38%),radial-gradient(at 75% 88%,#FF8906 0,transparent 42%),radial-gradient(at 18% 90%,#E53170 0,transparent 40%),#16163A',
      card: 'rgba(255,255,255,.12)', line: 'rgba(255,255,255,.28)', text: '#FFFFFF', muted: 'rgba(255,255,255,.74)', grid: 'rgba(255,255,255,.14)', head: 'rgba(255,255,255,.06)', headText: '#FFFFFF', accent: '#A78BFA', radius: '20px', blur: '18px' },
    p: ['#A78BFA', '#34D399', '#FDBA74', '#F472B6', '#67E8F9', '#FDE047', '#818CF8', '#FB7185', '#5EEAD4', '#C4B5FD'] },
  { id: 'glass-light', name: 'Frosted Glass', group: 'Glass & soft UI', surface: 'glass', headLight: true,
    v: { bg: 'radial-gradient(at 10% 10%,#C7D2FE 0,transparent 45%),radial-gradient(at 90% 20%,#FBCFE8 0,transparent 40%),radial-gradient(at 60% 95%,#A7F3D0 0,transparent 45%),#F4F6FB',
      card: 'rgba(255,255,255,.55)', line: 'rgba(255,255,255,.75)', text: '#1E2235', muted: '#596079', grid: 'rgba(30,34,53,.08)', head: 'rgba(255,255,255,.4)', headText: '#1E2235', accent: '#6366F1', radius: '20px', blur: '16px' },
    p: ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#06B6D4', '#8B5CF6', '#F43F5E', '#84CC16', '#0EA5E9', '#A855F7'] },
  { id: 'liquid', name: 'Liquid Glass', group: 'Glass & soft UI', surface: 'liquid', dark: true,
    v: { bg: 'radial-gradient(60% 50% at 20% 20%,#00C2FF55 0,transparent 70%),radial-gradient(50% 50% at 85% 25%,#B14CFF66 0,transparent 70%),radial-gradient(60% 60% at 60% 90%,#FF7A3D55 0,transparent 70%),linear-gradient(160deg,#0A1630,#101C3E 50%,#0C1226)',
      card: 'rgba(255,255,255,.07)', line: 'rgba(255,255,255,.22)', text: '#F5F8FF', muted: 'rgba(235,242,255,.72)', grid: 'rgba(255,255,255,.10)', head: 'rgba(255,255,255,.05)', headText: '#FFFFFF', accent: '#5AD8FF', radius: '26px', blur: '26px' },
    p: ['#5AD8FF', '#C084FC', '#FF9F6E', '#4ADE80', '#F472B6', '#FDE68A', '#60A5FA', '#2DD4BF', '#FB7185', '#A5B4FC'] },
  { id: 'liquid-light', name: 'Liquid Glass Light', group: 'Glass & soft UI', surface: 'liquid', headLight: true,
    v: { bg: 'radial-gradient(60% 50% at 15% 15%,#9BE7FF 0,transparent 70%),radial-gradient(55% 50% at 85% 20%,#E3B8FF 0,transparent 70%),radial-gradient(60% 60% at 55% 95%,#FFD3B0 0,transparent 70%),#EEF3FA',
      card: 'rgba(255,255,255,.38)', line: 'rgba(255,255,255,.85)', text: '#14203A', muted: '#4D5A75', grid: 'rgba(20,32,58,.08)', head: 'rgba(255,255,255,.3)', headText: '#14203A', accent: '#2F80ED', radius: '26px', blur: '24px' },
    p: ['#2F80ED', '#9B51E0', '#F2994A', '#27AE60', '#EB5757', '#00B8D9', '#F2C94C', '#BB6BD9', '#56CCF2', '#6FCF97'] },
  { id: 'neo', name: 'Neumorphism', group: 'Glass & soft UI', surface: 'neo', headLight: true,
    v: { bg: '#E6E9EF', card: '#E6E9EF', line: 'transparent', text: '#2D3748', muted: '#718096', grid: '#D3D8E1', head: '#E6E9EF', headText: '#2D3748', accent: '#5B7CFA', radius: '22px', neoD: '#C2C8D3', neoL: '#FFFFFF' },
    p: ['#5B7CFA', '#4FD1C5', '#F6AD55', '#FC8181', '#9F7AEA', '#63B3ED', '#68D391', '#F687B3', '#ECC94B', '#A0AEC0'] },
  { id: 'neo-dark', name: 'Neumorphism Dark', group: 'Glass & soft UI', surface: 'neo', dark: true, headLight: true,
    v: { bg: '#2A2D34', card: '#2A2D34', line: 'transparent', text: '#E2E8F0', muted: '#A0AEC0', grid: '#373B44', head: '#2A2D34', headText: '#E2E8F0', accent: '#7F9CF5', radius: '22px', neoD: '#1E2025', neoL: '#363A43' },
    p: ['#7F9CF5', '#4FD1C5', '#F6AD55', '#FC8181', '#B794F4', '#63B3ED', '#68D391', '#F687B3', '#F6E05E', '#CBD5E0'] },
  { id: 'clay', name: 'Claymorphism', group: 'Glass & soft UI', surface: 'clay', headLight: true,
    v: { bg: '#EEE6FF', card: '#FFFFFF', line: 'transparent', text: '#3B2D5B', muted: '#8578A3', grid: '#F1EBFB', head: '#EEE6FF', headText: '#3B2D5B', accent: '#8B5CF6', radius: '28px' },
    p: ['#8B5CF6', '#F472B6', '#38BDF8', '#34D399', '#FBBF24', '#FB7185', '#A78BFA', '#2DD4BF', '#F59E0B', '#60A5FA'] },
  { id: 'clay-peach', name: 'Clay Peach', group: 'Glass & soft UI', surface: 'clay', headLight: true,
    v: { bg: '#FFE9DC', card: '#FFF8F2', line: 'transparent', text: '#4A2C2A', muted: '#93706B', grid: '#F8E6DB', head: '#FFE9DC', headText: '#4A2C2A', accent: '#FF7A59', radius: '28px' },
    p: ['#FF7A59', '#FFB547', '#5BC0BE', '#7B9E89', '#E56B6F', '#6D597A', '#F4A261', '#2A9D8F', '#E9C46A', '#B56576'] },
  // ---- Dark & bold
  { id: 'executive', name: 'Executive Gold', group: 'Dark & bold', surface: 'elevated', dark: true,
    v: { bg: '#0D0D0D', card: '#171717', line: '#2A2A2A', text: '#F5F5F5', muted: '#A3A3A3', grid: '#262626', head: 'linear-gradient(90deg,#0D0D0D,#221C0E)', headText: '#E8C468', accent: '#D4AF37', radius: '12px' },
    p: ['#D4AF37', '#F5D97B', '#B8860B', '#E8E8E8', '#8C7A4B', '#C0C0C0', '#FFE8A3', '#9C7C38', '#7A7A7A', '#F0C75E'] },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', group: 'Dark & bold', surface: 'neon', dark: true,
    v: { bg: 'radial-gradient(at 50% 0%,#2A0845 0,transparent 60%),#07000F', card: '#12001F', line: '#FF2BD6', text: '#F6E8FF', muted: '#B9A3D6', grid: '#2B0F45', head: 'linear-gradient(90deg,#1A0030,#2C0057)', headText: '#00F0FF', accent: '#00F0FF', radius: '10px', font: '"Rajdhani","IBM Plex Sans",sans-serif' },
    p: ['#00F0FF', '#FF2BD6', '#F9F871', '#7CFF6B', '#FF6B35', '#9D4EDD', '#00FFA3', '#FF3864', '#3A86FF', '#FFBE0B'] },
  { id: 'nord', name: 'Nord', group: 'Dark & bold', surface: 'flat', dark: true,
    v: { bg: '#2E3440', card: '#3B4252', line: '#434C5E', text: '#ECEFF4', muted: '#C4CAD6', grid: '#434C5E', head: '#3B4252', headText: '#ECEFF4', accent: '#88C0D0', radius: '12px' },
    p: ['#88C0D0', '#81A1C1', '#A3BE8C', '#EBCB8B', '#D08770', '#B48EAD', '#BF616A', '#8FBCBB', '#5E81AC', '#D8DEE9'] },
  { id: 'dracula', name: 'Dracula', group: 'Dark & bold', surface: 'flat', dark: true,
    v: { bg: '#21222C', card: '#2D2F3D', line: '#3C3F55', text: '#F8F8F2', muted: '#BFBFD6', grid: '#3A3C4E', head: '#282A36', headText: '#F8F8F2', accent: '#BD93F9', radius: '12px' },
    p: ['#BD93F9', '#FF79C6', '#8BE9FD', '#50FA7B', '#FFB86C', '#F1FA8C', '#FF5555', '#6272A4', '#A4FFFF', '#D6ACFF'] },
  { id: 'terminal', name: 'Terminal', group: 'Dark & bold', surface: 'outline', dark: true,
    v: { bg: '#050805', card: '#0A110A', line: '#1E3A1E', text: '#B6FFB0', muted: '#6FB86A', grid: '#142614', head: '#050805', headText: '#39FF14', accent: '#39FF14', radius: '4px', font: '"IBM Plex Mono",Consolas,monospace' },
    p: ['#39FF14', '#FFB000', '#00E5FF', '#FF5370', '#C3E88D', '#F78C6C', '#82AAFF', '#FFCB6B', '#89DDFF', '#C792EA'] },
  // ---- Light & creative
  { id: 'emerald', name: 'Emerald', group: 'Light & creative', surface: 'elevated',
    v: { bg: '#ECF5EF', card: '#FFFFFF', line: '#D5E8DC', text: '#123524', muted: '#557A65', grid: '#E3EFE7', head: 'linear-gradient(100deg,#064E3B,#047857 60%,#10B981)', headText: '#FFFFFF', accent: '#059669', radius: '14px' },
    p: ['#047857', '#10B981', '#84CC16', '#CA8A04', '#0EA5E9', '#F97316', '#14B8A6', '#65A30D', '#EAB308', '#0F766E'] },
  { id: 'sunset', name: 'Sunset', group: 'Light & creative', surface: 'elevated',
    v: { bg: '#FFF4EE', card: '#FFFFFF', line: '#FBE2D5', text: '#3D1F1A', muted: '#8C6158', grid: '#FCEBE2', head: 'linear-gradient(100deg,#E11D48,#F97316 60%,#F59E0B)', headText: '#FFFFFF', accent: '#F97316', radius: '16px' },
    p: ['#E11D48', '#F97316', '#F59E0B', '#DB2777', '#9333EA', '#14B8A6', '#FB7185', '#EAB308', '#C026D3', '#0EA5E9'] },
  { id: 'solarized', name: 'Solarized', group: 'Light & creative', surface: 'flat', headLight: true,
    v: { bg: '#FDF6E3', card: '#FFFBEF', line: '#EEE8D5', text: '#073642', muted: '#657B83', grid: '#F2ECDA', head: '#FDF6E3', headText: '#073642', accent: '#268BD2', radius: '10px' },
    p: ['#268BD2', '#2AA198', '#859900', '#B58900', '#CB4B16', '#DC322F', '#D33682', '#6C71C4', '#93A1A1', '#586E75'] },
  { id: 'candy', name: 'Pastel Candy', group: 'Light & creative', surface: 'elevated', headLight: true,
    v: { bg: '#FDF2F8', card: '#FFFFFF', line: '#FBE3F0', text: '#4A2340', muted: '#946A86', grid: '#FCEAF4', head: '#FDF2F8', headText: '#4A2340', accent: '#EC4899', radius: '22px' },
    p: ['#F472B6', '#A78BFA', '#60A5FA', '#34D399', '#FBBF24', '#FB923C', '#F87171', '#2DD4BF', '#C084FC', '#818CF8'] },
  { id: 'minimal', name: 'Monochrome', group: 'Light & creative', surface: 'outline', headLight: true,
    v: { bg: '#FFFFFF', card: '#FFFFFF', line: '#E4E4E7', text: '#111111', muted: '#6B6B6B', grid: '#F1F1F1', head: '#FFFFFF', headText: '#111111', accent: '#111111', radius: '8px' },
    p: ['#111111', '#2563EB', '#6B7280', '#9CA3AF', '#374151', '#60A5FA', '#D1D5DB', '#1F2937', '#93C5FD', '#4B5563'] },
  { id: 'paper', name: 'Newspaper', group: 'Light & creative', surface: 'paper', headLight: true,
    v: { bg: '#F4EFE4', card: '#FFFDF7', line: '#DDD3BF', text: '#1F1B16', muted: '#6E6252', grid: '#EDE5D3', head: '#F4EFE4', headText: '#1F1B16', accent: '#8B2E16', radius: '2px', font: 'Georgia,"Times New Roman",serif' },
    p: ['#8B2E16', '#1F3A5F', '#B8860B', '#2F5D50', '#6B4E71', '#A0522D', '#4A6FA5', '#7B8B3A', '#C2703D', '#3E3E3E'] },
  { id: 'brutal', name: 'Neo-brutalism', group: 'Light & creative', surface: 'brutal', headLight: true,
    v: { bg: '#FFF4D6', card: '#FFFFFF', line: '#111111', text: '#111111', muted: '#3F3F3F', grid: '#EFE6C8', head: '#FFF4D6', headText: '#111111', accent: '#FF5C5C', radius: '6px', font: '"Space Grotesk","IBM Plex Sans",sans-serif' },
    p: ['#FF5C5C', '#FFD23F', '#3BCEAC', '#5B5BFF', '#FF8FAB', '#0EAD69', '#EE4266', '#540D6E', '#F3A712', '#1B998B'] },
];
const DB_THEME_BY_ID = Object.fromEntries(DB_THEME_DEFS.map((t) => [t.id, t]));
let DB_USER_THEMES = [];          // saved custom themes (server), each {id, name, base, custom}
const DB_FONTS = [['', 'Theme default'], ['"IBM Plex Sans",sans-serif', 'IBM Plex Sans'], ['Inter,system-ui,sans-serif', 'Inter / System'], ['Georgia,serif', 'Georgia (serif)'],
  ['"Segoe UI",Roboto,sans-serif', 'Segoe UI / Roboto'], ['"IBM Plex Mono",monospace', 'Monospace'], ['"Trebuchet MS",sans-serif', 'Trebuchet']];
const DB_CHART_STYLE_DEF = { bars: 'rounded', lines: 'smooth', fill: 'gradient', grid: true, points: true };
const DB_SURFACE_CHART = { brutal: { bars: 'square', lines: 'straight', fill: 'solid' }, paper: { bars: 'square', fill: 'none' }, terminal: { lines: 'straight' }, outline: { fill: 'none' } };

/* resolve {theme def + base + custom overrides} for a dashboard definition (or a theme id) */
function dbResolveTheme(lookId, custom) {
  let def = DB_THEME_BY_ID[lookId];
  let extra = {};
  if (!def) {
    const u = DB_USER_THEMES.find((x) => x.id === lookId);
    if (u) { def = DB_THEME_BY_ID[u.base] || DB_THEME_BY_ID.clean; extra = u.custom || {}; }
  }
  def = def || DB_THEME_BY_ID.clean;
  const c = { ...extra, ...(custom || {}) };
  if (def.id === 'clean' && document.documentElement.dataset.theme === 'dark' && !Object.keys(c).length) {   // "Clean" follows the app's dark mode
    def = { ...def, dark: true, headLight: false,
      v: { bg: '#0B1220', card: '#111A2E', line: '#24314D', text: '#E6EBF5', muted: '#8F9BB6', grid: '#1E2A44', head: '#0F1830', headText: '#E6EBF5', accent: '#4C8DFF', radius: '14px' },
      p: ['#4C8DFF', '#22D3EE', '#F59E0B', '#F472B6', '#34D399', '#A78BFA', '#FB923C', '#2DD4BF', '#A3E635', '#F87171'] };
  }
  const v = { ...def.v };
  ['bg', 'card', 'text', 'muted', 'accent', 'head', 'headText', 'line', 'grid'].forEach((k) => { if (c[k]) v[k] = c[k]; });
  if (c.radius != null && c.radius !== '') v.radius = `${c.radius}px`;
  if (c.blur != null && c.blur !== '') v.blur = `${c.blur}px`;
  if (c.font) v.font = c.font;
  const p = Array.isArray(c.palette) && c.palette.filter(Boolean).length ? c.palette.map((x, i) => x || def.p[i % def.p.length]) : def.p;
  return { ...def, v, p, surface: c.surface || def.surface, dark: c.dark != null ? !!c.dark : !!def.dark, headLight: c.headLight != null ? !!c.headLight : !!def.headLight };
}

function dbThemeVars(t) {
  const v = t.v;
  const out = { '--d-bg': v.bg, '--d-card': v.card, '--d-line': v.line, '--d-text': v.text, '--d-muted': v.muted, '--d-grid': v.grid, '--gauge-bg': v.grid,
    '--d-head': v.head, '--d-head-text': v.headText, '--d-accent': v.accent, '--d-radius': v.radius || '14px', '--d-blur': v.blur || '16px',
    '--d-font': v.font || 'inherit', '--neo-d': v.neoD || 'rgba(0,0,0,.18)', '--neo-l': v.neoL || 'rgba(255,255,255,.9)' };
  t.p.forEach((c, i) => { out[`--d-p${i}`] = c; });
  // the dashboard is its own colour world: app tokens (inputs, buttons, chips, tables) follow the dashboard theme,
  // not the app's light/dark mode — so filters and labels stay readable in every combination
  const solidCard = /gradient|rgba|transparent/.test(v.card) ? (t.dark ? '#151B33' : '#FFFFFF') : v.card;
  Object.assign(out, { '--surface': solidCard, '--text': v.text, '--text-2': v.text, '--muted': v.muted, '--line': v.line, '--line-soft': v.line,
    '--line-strong': v.line, '--sunk': t.dark ? 'rgba(255,255,255,.07)' : 'rgba(15,23,42,.035)', '--chart-grid': v.grid,
    '--lagoon': v.accent || '#0A5CFF', '--lagoon-tint': t.dark ? 'rgba(255,255,255,.08)' : 'rgba(10,92,255,.08)', 'color-scheme': t.dark ? 'dark' : 'light' });
  return out;
}

/* apply to any root element (.dash, .story, a gallery preview) */
function dbApplyThemeTo(root, t, extraClass = '') {
  if (!root) return;
  const vars = dbThemeVars(t);
  Object.entries(vars).forEach(([k, val]) => root.style.setProperty(k, val));
  root.dataset.theme = t.id;
  const keep = [...root.classList].filter((c) => !/^(look-|surf-|theme-dark$|head-light$|themed$)/.test(c));
  root.className = [...keep, 'themed', `look-${t.id}`, `surf-${t.surface}`, t.dark ? 'theme-dark' : '', t.headLight ? 'head-light' : '', extraClass].filter(Boolean).join(' ');
}

async function dbLoadUserThemes() {
  try { DB_USER_THEMES = await api('/api/dashboard-themes'); } catch { DB_USER_THEMES = []; }
  return DB_USER_THEMES;
}

/* ---- gallery: visual theme picker ---- */
function dbThemeCard(t, selected, onPick, label) {
  const prev = el('div', { class: 'thp-prev' },
    el('div', { class: 'thp-head' }, el('i'), el('i'), el('i')),
    el('div', { class: 'thp-row' }, el('div', { class: 'thp-card dash-w' }, el('b', {}, '₹2.4M'), el('span', {}, 'Sales')), el('div', { class: 'thp-card dash-w' }, el('b', {}, '18%'), el('span', {}, 'Growth'))),
    el('div', { class: 'thp-card dash-w thp-chart' }, t.p.slice(0, 6).map((c, i) => el('i', { style: { background: c, height: `${[60, 85, 45, 95, 70, 55][i]}%` } }))));
  const node = el('button', { type: 'button', class: `thp ${selected ? 'on' : ''}`, title: t.name, onClick: () => onPick(t) }, prev, el('span', { class: 'thp-name' }, label || t.name));
  dbApplyThemeTo(prev, t);
  return node;
}

function dbThemeGallery(current, onPick) {
  const groups = [...new Set(DB_THEME_DEFS.map((t) => t.group))];
  const box = el('div', { class: 'thp-gallery' });
  const draw = (cur) => {
    box.replaceChildren(
      ...(DB_USER_THEMES.length ? [el('div', { class: 'thp-group' }, 'My themes'), el('div', { class: 'thp-grid' },
        DB_USER_THEMES.map((u) => dbThemeCard({ ...dbResolveTheme(u.id), id: u.id }, cur === u.id, (t) => { draw(t.id); onPick(u.id); }, u.name)))] : []),
      ...groups.flatMap((g) => [el('div', { class: 'thp-group' }, g), el('div', { class: 'thp-grid' },
        DB_THEME_DEFS.filter((t) => t.group === g).map((t) => dbThemeCard(t, cur === t.id, (x) => { draw(x.id); onPick(x.id); })))]));
  };
  draw(current);
  return box;
}

/* ---- customizer (colours, palette, radius, blur, font, surface) ---- */
function dbThemeCustomizer(D, onChange, onSaveAs) {
  const t = dbResolveTheme(D.look || 'clean', D.custom);
  const c = D.custom || (D.custom = {});
  const box = el('div', { class: 'thc' });
  const hex2 = (n) => Math.max(0, Math.min(255, Math.round(Number(n)))).toString(16).padStart(2, '0');
  const solid = (v) => {                       // any CSS colour/gradient -> #rrggbb for the picker
    const s = String(v || '');
    let m = s.match(/#([0-9a-f]{6})\b/i); if (m && !/gradient/.test(s)) return `#${m[1]}`;
    m = s.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i); if (m) return `#${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}`;
    m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i); if (m) return `#${hex2(m[1])}${hex2(m[2])}${hex2(m[3])}`;
    const all = s.match(/#[0-9a-f]{6}\b/gi); return all ? all[all.length - 1] : '#888888';   // gradient: its base colour
  };
  const alphaOf = (v) => { const m = String(v || '').match(/rgba\([^)]*,\s*([\d.]+)\s*\)/i); return m ? Number(m[1]) : null; };
  const colorRow = (key, label) => {
    const orig = t.v[key];
    const inp = el('input', { type: 'color', value: solid(c[key] || orig), 'aria-label': label });
    const sw = el('span', { class: 'thc-sw', style: { background: c[key] || orig } });
    inp.addEventListener('input', () => {
      const a = alphaOf(orig);                   // glass cards keep their transparency
      c[key] = a != null && a < 1 && ['card', 'head', 'line'].includes(key)
        ? `rgba(${parseInt(inp.value.slice(1, 3), 16)},${parseInt(inp.value.slice(3, 5), 16)},${parseInt(inp.value.slice(5, 7), 16)},${a})` : inp.value;
      sw.style.background = c[key]; onChange();
    });
    return el('label', { class: 'thc-c' }, inp, sw, el('span', {}, label), c[key] ? el('button', { type: 'button', class: 'linkish', title: 'Use theme colour', onClick: () => { delete c[key]; onChange(true); } }, '↺') : null);
  };
  const pal = el('div', { class: 'thc-pal' }, t.p.map((col, i) => {
    const inp = el('input', { type: 'color', value: solid(col), 'aria-label': `Chart colour ${i + 1}` });
    inp.addEventListener('input', () => { c.palette = (c.palette && c.palette.length ? c.palette : [...t.p]).slice(); c.palette[i] = inp.value; onChange(); });
    return inp;
  }));
  const range = (key, label, min, max, def) => {
    const cur = c[key] != null && c[key] !== '' ? Number(c[key]) : def;
    const out = el('span', { class: 'muted small' }, `${cur}px`);
    const r = el('input', { type: 'range', min, max, value: cur, 'aria-label': label });
    r.addEventListener('input', () => { c[key] = Number(r.value); out.textContent = `${r.value}px`; onChange(); });
    return el('label', { class: 'thc-r' }, el('span', {}, label), r, out);
  };
  const font = el('select', { class: 'field' }, DB_FONTS.map(([v, l]) => el('option', { value: v, selected: (c.font || '') === v }, l)));
  font.addEventListener('change', () => { if (font.value) c.font = font.value; else delete c.font; onChange(); });
  const surf = el('select', { class: 'field' }, [['', 'Theme default'], ['flat', 'Flat'], ['elevated', 'Elevated (shadow)'], ['outline', 'Outline'], ['glass', 'Glass (frosted)'], ['liquid', 'Liquid glass'],
    ['neo', 'Neumorphic (soft)'], ['clay', 'Clay (puffy)'], ['brutal', 'Neo-brutal'], ['neon', 'Neon glow'], ['paper', 'Paper']].map(([v, l]) => el('option', { value: v, selected: (c.surface || '') === v }, l)));
  surf.addEventListener('change', () => { if (surf.value) c.surface = surf.value; else delete c.surface; onChange(true); });
  box.append(
    el('div', { class: 'thc-grid' }, colorRow('bg', 'Background'), colorRow('card', 'Cards'), colorRow('text', 'Text'), colorRow('muted', 'Labels'),
      colorRow('accent', 'Accent'), colorRow('head', 'Title bar'), colorRow('headText', 'Title text'), colorRow('grid', 'Grid lines')),
    el('div', { class: 'pl-hint' }, 'Chart colours (in order)'), pal,
    range('radius', 'Corner radius', 0, 36, parseInt(t.v.radius, 10) || 14),
    ['glass', 'liquid'].includes(t.surface) ? range('blur', 'Glass blur', 0, 40, parseInt(t.v.blur, 10) || 16) : null,
    el('label', { class: 'lbl' }, 'Card style', surf), el('label', { class: 'lbl' }, 'Font', font),
    el('div', { class: 'row', style: { gap: '6px', flexWrap: 'wrap' } },
      btn('Reset to theme', () => { D.custom = {}; onChange(true); }, { cls: 'sm', ic: 'refresh' }),
      onSaveAs ? btn('Save as my theme', onSaveAs, { cls: 'sm', ic: 'save' }) : null));
  return box;
}

function dbChartStyle(D, t) {
  return { ...DB_CHART_STYLE_DEF, ...(DB_SURFACE_CHART[t ? t.surface : ''] || {}), ...(DB_SURFACE_CHART[t ? t.id : ''] || {}), ...(D.chartStyle || {}) };
}
