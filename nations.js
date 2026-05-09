/* nations.js — loads and renders nations from nations.md on GitHub */

const NATIONS_GITHUB_USER   = 'lucky4life2';
const NATIONS_GITHUB_REPO   = 'MCA2';
const NATIONS_GITHUB_BRANCH = 'main';
const NATIONS_RAW = `https://raw.githubusercontent.com/${NATIONS_GITHUB_USER}/${NATIONS_GITHUB_REPO}/${NATIONS_GITHUB_BRANCH}/nations.md`;

/* ── PARSER ─────────────────────────────────────────────────── */
function parseNations(raw) {
  raw = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const nations = [];
  const blocks  = raw.split(/\n(?=##\s)/);

  blocks.forEach(block => {
    block = block.trim();
    if (!block.startsWith('##')) return;

    const lines    = block.split('\n');
    const name     = lines[0].replace(/^##\s*/, '').trim();
    const nation   = { name, fields: [], body: '' };
    let bodyLines  = [];
    let inBody     = false;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!inBody) {
        const colon = line.indexOf(':');
        if (colon > 0 && !line.startsWith('-') && !line.startsWith('#')) {
          const key   = line.slice(0, colon).trim();
          const value = line.slice(colon + 1).trim();
          if (key === 'flag')        { nation.flag = value; continue; }
          if (key === 'leader')      { nation.leader = value; continue; }
          if (key === 'capital')     { nation.capital = value; continue; }
          if (key === 'government')  { nation.government = value; continue; }
          if (key === 'founded')     { nation.founded = value; continue; }
          if (key === 'population')  { nation.population = value; continue; }
          if (key === 'territory')   { nation.territory = value; continue; }
          if (key === 'status')      { nation.status = value; continue; }
          // Any other key: value pairs show as info fields
          nation.fields.push({ key, value });
        } else {
          inBody = true;
        }
      }
      if (inBody) bodyLines.push(line);
    }
    nation.body = bodyLines.join('\n').trim();
    nations.push(nation);
  });

  return nations;
}

/* ── MARKDOWN RENDERER (simple) ─────────────────────────────── */
function renderMd(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h3>$1</h3>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/\n{2,}/g,'</p><p>')
    .replace(/^(?!<[hul])/gm, '')
    .replace(/\n/g,' ')
    .replace(/^(.+)$/, '<p>$1</p>');
}

/* ── GRID RENDER ─────────────────────────────────────────────── */
function renderGrid(nations) {
  const grid = document.getElementById('nations-grid');
  if (!grid) return;

  if (nations.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;color:var(--mid);font-size:14px;">No nations found.</p>';
    return;
  }

  grid.innerHTML = nations.map((n, i) => {
    const flagHtml = n.flag
      ? `<img src="images/${n.flag}" alt="${n.name} flag">`
      : `<div style="width:100%;aspect-ratio:3/2;background:var(--surface);border-radius:4px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;"><span style="font-size:11px;color:var(--mid);">No flag</span></div>`;
    return `
      <div class="nation-flag-item" onclick="openNationDetail(${i})" style="cursor:pointer;" title="View ${n.name}">
        ${flagHtml}
        <div class="nation-name">${n.name}</div>
      </div>`;
  }).join('');
}

/* ── DETAIL VIEW ─────────────────────────────────────────────── */
let _nations = [];

function openNationDetail(i) {
  const n = _nations[i];
  if (!n) return;

  document.getElementById('nations-grid').closest('.section').style.display = 'none';
  const detail = document.getElementById('nation-detail-section');
  detail.style.display = '';

  document.getElementById('nation-detail-label').textContent = 'Nation Profile';
  document.getElementById('nation-detail-name').textContent  = n.name;

  const coreFields = [
    ['Leader',     n.leader],
    ['Capital',    n.capital],
    ['Government', n.government],
    ['Founded',    n.founded],
    ['Population', n.population],
    ['Territory',  n.territory],
    ['Status',     n.status],
  ].filter(([,v]) => v);

  const extraFields = n.fields || [];

  const flagHtml = n.flag
    ? `<img src="images/${n.flag}" alt="${n.name} flag" style="max-width:220px;border-radius:4px;border:1px solid var(--border);margin-bottom:1.5rem;display:block;">`
    : '';

  const tableRows = [...coreFields, ...extraFields.map(f => [f.key, f.value])]
    .map(([k, v]) => `<tr><td style="font-weight:600;padding:6px 16px 6px 0;color:var(--mid);font-size:13px;white-space:nowrap;">${k}</td><td style="padding:6px 0;font-size:14px;">${v}</td></tr>`)
    .join('');

  const tableHtml = tableRows
    ? `<table style="border-collapse:collapse;margin-bottom:1.5rem;">${tableRows}</table>`
    : '';

  const bodyHtml = n.body ? `<div class="article-body">${renderMd(n.body)}</div>` : '';

  document.getElementById('nation-detail-body').innerHTML = flagHtml + tableHtml + bodyHtml;
}

function closeNationDetail() {
  document.getElementById('nations-grid').closest('.section').style.display = '';
  document.getElementById('nation-detail-section').style.display = 'none';
}

/* ── INIT ───────────────────────────────────────────────────── */
(async function init() {
  const grid = document.getElementById('nations-grid');
  if (!grid) return;

  try {
    const res = await fetch(NATIONS_RAW + '?nocache=' + Date.now());
    if (!res.ok) throw new Error('fetch failed');
    const raw  = await res.text();
    _nations   = parseNations(raw);
    renderGrid(_nations);
  } catch(e) {
    grid.innerHTML = '<p style="grid-column:1/-1;color:var(--mid);font-size:14px;">Could not load nations. Check back soon.</p>';
  }
})();
