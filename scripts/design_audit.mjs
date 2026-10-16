/**
 * FINDS Lab design audit — renders every page at several widths and checks the
 * rules written in README "디자인 원칙".
 *
 *   npm run build && npx vite preview --port 8899 --base /site/   (or any static server)
 *   node scripts/design_audit.mjs [baseUrl]        # default http://localhost:8899/site/
 *
 * Requires Playwright (`npm i -D playwright` or a global install).
 * Exit code 0 = all checks pass, 1 = violations found.
 */
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.argv[2] || 'http://localhost:8899/site/';
const ROUTES = ['/', '/about/introduction', '/about/research', '/about/honors', '/about/location',
  '/members/director', '/members/director/academic', '/members/director/activities',
  '/members/director/portfolio/profile', '/members/director/portfolio/academic', '/members/director/portfolio/activities',
  '/members/current', '/members/alumni', '/publications', '/projects',
  '/archives/news', '/archives/notice', '/archives/gallery', '/archives/playlist'];
const WIDTHS = [360, 390, 768, 1024, 1440];
// two member detail pages (first files in public/data/members) are checked as well
try {
  const dir = new URL('../public/data/members/', import.meta.url);
  fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'index.json').sort().slice(0, 2)
    .forEach((f) => ROUTES.push('/members/detail/' + f.replace(/\.json$/, '')));
} catch { /* members folder not found: skip detail pages */ }

// ── rules ────────────────────────────────────────────────────────────────
const PALETTE = {
  gold: ['#FFEB99', '#FFF3CC', '#FFF9E6', '#E8D688', '#D6C360', '#D6B14D', '#B8962D', '#9A7D1F'],
  red: ['#FFE4E9', '#FFBAC4', '#E8889C', '#C41E3A', '#AC0E0E'],
  coral: ['#D6A076'],
};
const LIGHT_TEXT = ['#D6B14D', '#D6C360', '#E8D688', '#B8962D', '#D6A076', '#E8889C', '#FFBAC4', '#FFEB99', '#FFF3CC', '#FFF9E6', '#FFE4E9'];
const SCALE = [10, 11, 13, 15, 17, 19, 21, 25, 29, 33, 40, 48, 60];
const MIN = { mobile: 10, tablet: 11, desktop: 11 };

const results = {};

// ── 0. static source scan ────────────────────────────────────────────────
const PAL_HEX = new Set(Object.values(PALETTE).flat().map((h) => h.toUpperCase()));
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(d + '/' + e.name) : /\.(tsx|ts|css)$/.test(e.name) ? [d + '/' + e.name] : []));
const SRC = new URL('../src', import.meta.url).pathname;
const isNeutral = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx - mn <= 24 || (b >= r && b >= g && mx - mn <= 60 && mx < 240); };
for (const f of walk(SRC)) {
  const rel = f.slice(SRC.length - 3); const txt = fs.readFileSync(f, 'utf8');
  for (const m of txt.matchAll(/#[0-9A-Fa-f]{6}\b/g)) { const h = m[0].toUpperCase(); if (!PAL_HEX.has(h) && !isNeutral(h)) { results['static-colour'] ??= new Map(); const k = rel + ' ' + h; if (!results['static-colour'].has(k)) results['static-colour'].set(k, { t: h, cls: rel, routes: new Set([rel]) }); } }
  for (const m of txt.matchAll(/\b(?:bg|text|border|from|via|to|fill|stroke|ring)-(red|pink|rose|amber|yellow|orange|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|lime)-\d{2,3}\b/g)) { if (/components\/atoms\/(alert|tag|snackbar|form|input|select|select2|danger)\//.test(rel)) continue; results['static-colour'] ??= new Map(); const k = rel + ' ' + m[0]; if (!results['static-colour'].has(k)) results['static-colour'].set(k, { t: m[0], cls: rel, routes: new Set([rel]) }); }
  // hover must stay in the element's own colour family: a neutral element never turns gold/red on hover
  // (stat cards are the exception: their identity colour is already shown at rest as a glow)
  const PAL_TOKEN = /^(?:group-)?hover:(bg|text|border)-(?:primary|\[#(?:D6B14D|D6C360|E8D688|B8962D|9A7D1F|FFF9E6|FFF3CC|FFEB99|AC0E0E|C41E3A|E8889C|FFBAC4|FFE4E9|D6A076)\])/i;
  for (const line of txt.split('\n')) {
    if (!line.includes('hover:') || line.includes('group relative bg-white border')) continue;
    for (const seg of line.match(/(["'`])[^"'`]*hover:[^"'`]*\1/g) || []) {
      const toks = seg.slice(1, -1).split(/\s+/);
      for (const t of toks) {
        const m = PAL_TOKEN.exec(t); if (!m) continue;
        const prop = m[1];
        const rest = toks.find((x) => new RegExp(`^${prop}-(primary|\\[#)`, 'i').test(x));
        if (!rest) { results['static-hover'] ??= new Map(); const k = rel + ' ' + t; if (!results['static-hover'].has(k)) results['static-hover'].set(k, { t, cls: rel, routes: new Set([rel]) }); }
      }
    }
  }
  for (const m of txt.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)) { const v = +m[1]; if (!SCALE.includes(v) && !/👤|size-10/.test(txt.slice(m.index - 120, m.index + 80))) { results['static-type'] ??= new Map(); const k = rel + ' ' + m[0]; if (!results['static-type'].has(k)) results['static-type'].set(k, { t: m[0], cls: rel, routes: new Set([rel]) }); } }
}
const add = (cat, key, info) => { results[cat] ??= new Map(); if (!results[cat].has(key)) results[cat].set(key, { ...info, routes: new Set() }); results[cat].get(key).routes.add(info.route); };

const browser = await chromium.launch();
for (const w of WIDTHS) {
  const bp = w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  for (const route of ROUTES) {
    await page.evaluate((r) => { history.pushState({}, '', r); window.dispatchEvent(new PopStateEvent('popstate')); window.scrollTo(0, 0); }, route);
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.querySelectorAll('button.fbar-section').forEach((b) => b.click()));
    await page.waitForTimeout(400);
    const found = await page.evaluate(({ PALETTE, LIGHT_TEXT, SCALE, MIN, bp }) => {
      const out = [];
      // colour normaliser (handles oklch/rgb/hex) via canvas
      const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
      const cache = new Map();
      const toRGBA = (c) => { if (cache.has(c)) return cache.get(c); const m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/.exec(c.trim()); if (m) { const v = [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]]; cache.set(c, v); return v; } cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = [...cx.getImageData(0, 0, 1, 1).data]; const a = d[3] / 255; const v = a ? [d[0], d[1], d[2], a] : [0, 0, 0, 0]; cache.set(c, v); return v; };
      const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
      const PAL = Object.entries(PALETTE).flatMap(([f, l]) => l.map((h) => ({ f, h, rgb: hex(h) })));
      const LT = LIGHT_TEXT.map(hex);
      const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      const classify = (rgba) => {
        if (!rgba || rgba[3] < 0.02) return 'none';
        const [r, g, b] = rgba; const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        const p = PAL.find((x) => dist(x.rgb, rgba) <= 8); if (p) return p.f;
        if (mx - mn <= 24 || (b >= r && b >= g && mx - mn <= 60 && mx < 240)) return 'neutral'; // greys incl. slate
        return 'off';
      };
      const L = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const cr = (a, b) => (Math.max(L(a), L(b)) + 0.05) / (Math.min(L(a), L(b)) + 0.05);
      const darkCtx = (el) => !!el.closest('.ink-keep, .bg-gray-900, .bg-gray-950, .bg-black, [class*="from-gray-900"], [class*="from-gray-800"], [class*="bg-black/"], [class*="bg-gray-900/"]');
      const effBg = (el) => { let e = el; while (e && e !== document.documentElement) { const s = getComputedStyle(e); if (s.backgroundImage !== 'none' && /url\(/.test(s.backgroundImage)) return null; if ([...e.children].some((k) => { const ks = getComputedStyle(k); return ks.position === 'absolute' && (/^(IMG|VIDEO|PICTURE)$/.test(k.tagName) || /url\(/.test(ks.backgroundImage)); })) return null; const c = toRGBA(s.backgroundColor); if (c[3] > 0.5) return c; e = e.parentElement; } return [255, 255, 255, 1]; };

      for (const el of document.querySelectorAll('body *')) {
        if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') continue;
        if (el.closest('img, video, iframe, [class*="youtube"]')) continue;
        const cs = getComputedStyle(el); const cls = (el.getAttribute('class') || '').replace(/\s+/g, ' ').slice(0, 70);
        const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
        const isSvg = el instanceof SVGElement;
        // 1) colours
        const props = [['color', text || isSvg], ['background-color', true], ['border-top-color', parseFloat(cs.borderTopWidth) > 0]];
        for (const [prop, applies] of props) {
          if (!applies) continue; const c = toRGBA(cs.getPropertyValue(prop));
          if (classify(c) === 'off') out.push({ cat: 'colour-off-palette', key: prop + ' rgb(' + c.slice(0, 3) + ')', cls, t: text.slice(0, 16) });
        }
        // 2) gradients: one family per gradient
        if (cs.backgroundImage.includes('gradient')) {
          const stops = (cs.backgroundImage.match(/(oklch|oklab|rgba?|hsla?)\([^)]*\)|#[0-9a-f]{3,8}\b/gi) || []).map(toRGBA).map(classify).filter((f) => f !== 'none' && f !== 'neutral');
          const fams = [...new Set(stops)];
          if (fams.includes('off') || fams.length > 1) out.push({ cat: 'gradient-mixed-family', key: fams.join('+') + ' ' + cls, cls, t: text.slice(0, 16) });
        }
        if (!text || isSvg) continue;
        const decorative = /^[\s·•|/—–›‹>-]+$/.test(text);
        // 3) type scale & minimum size
        const fs = Math.round(parseFloat(cs.fontSize) * 4) / 4;
        if (fs && !/^[\u{1F300}-\u{1FAFF}\s]+$/u.test(text) && !SCALE.includes(fs) && !el.closest('[class*="size-10"]')) out.push({ cat: 'type-off-scale', key: fs + 'px ' + cls, cls, t: text.slice(0, 16) });
        if (fs && fs < MIN[bp] && !el.closest('[class*="size-10"]') && el.tagName !== 'SUP') out.push({ cat: 'type-below-min', key: fs + 'px ' + cls, cls, t: text.slice(0, 16) });
        // 4) light palette colour used as text on a light surface (must be inked)
        const fg = toRGBA(cs.color); const bg = effBg(el);
        if (bg && !darkCtx(el) && LT.some((l) => dist(l, fg) <= 8) && L(bg) > 0.5) out.push({ cat: 'contrast-light-text', key: 'rgb(' + fg.slice(0, 3) + ') ' + cls, cls, t: text.slice(0, 16) });
        if (!decorative && bg && fg[3] > 0.5 && cs.backgroundClip !== 'text' && cs.webkitTextFillColor !== 'rgba(0, 0, 0, 0)') { const c = cr(fg.slice(0,3).map((v, i) => v * fg[3] + bg[i] * (1 - fg[3])), bg); if (c < 3 && !darkCtx(el)) out.push({ cat: 'contrast-below-3', key: c.toFixed(2) + ' ' + cls, cls, t: text.slice(0, 16) }); }
        // 5) layout: text leaving its card, mid-word breaks in short labels
        const rc = el.getBoundingClientRect();
        let a = el.parentElement; while (a && a !== document.body) { const s = getComputedStyle(a); if (parseFloat(s.borderTopLeftRadius) > 4 && (parseFloat(s.borderLeftWidth) > 0 || toRGBA(s.backgroundColor)[3] > 0)) break; a = a.parentElement; }
        if (a && a !== document.body) { const ar = a.getBoundingClientRect(); if (rc.right > ar.right + 1 || rc.left < ar.left - 1) out.push({ cat: 'layout-spill', key: cls, cls, t: text.slice(0, 16) }); }
        if (text.length <= 30 && !/\s/.test(text)) { for (const n of el.childNodes) { if (n.nodeType !== 3 || !n.textContent.trim()) continue; const r2 = document.createRange(); r2.selectNodeContents(n); const tops = new Set([...r2.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top))); if (tops.size > 1) out.push({ cat: 'layout-word-break', key: cls, cls, t: text.slice(0, 16) }); } }
      }
      if (document.documentElement.scrollWidth > window.innerWidth) out.push({ cat: 'layout-h-overflow', key: 'page', cls: '', t: '+' + (document.documentElement.scrollWidth - window.innerWidth) + 'px' });
      return out;
    }, { PALETTE, LIGHT_TEXT, SCALE, MIN, bp });
    for (const f of found) add(f.cat, w + ' ' + f.key, { ...f, w, route });
  }
  await page.close();
}
// 6) icons / manifest
const head = await (await browser.newPage()).goto(BASE).then((r) => r.text());
for (const need of ['favicon.ico', 'favicon-32x32.png', 'icon-192.png', 'apple-touch-icon.png', 'site.webmanifest']) {
  if (!head.includes(need)) add('icons', need, { route: 'index.html', t: 'not linked' });
  const res = await fetch(new URL(need, BASE)); if (!res.ok) add('icons', need + ' ' + res.status, { route: need, t: 'not served' });
}
await browser.close();

let total = 0;
const cats = ['static-colour', 'static-type', 'static-hover', 'colour-off-palette', 'gradient-mixed-family', 'type-off-scale', 'type-below-min', 'contrast-light-text', 'contrast-below-3', 'layout-spill', 'layout-word-break', 'layout-h-overflow', 'icons'];
for (const c of cats) {
  const m = results[c]; const n = m ? m.size : 0; total += n;
  console.log(`${n === 0 ? 'PASS' : 'FAIL'}  ${c.padEnd(24)} ${n}`);
  if (m) for (const v of [...m.values()].slice(0, 15)) console.log(`        ${v.w ?? ''} "${v.t ?? ''}" [${v.cls ?? ''}] ${v.key?.slice(0, 40) ?? ''} — ${[...v.routes].slice(0, 2).join(', ')}`);
}
console.log(total === 0 ? '\nALL CHECKS PASSED' : `\n${total} issue group(s)`);
process.exit(total === 0 ? 0 : 1);
