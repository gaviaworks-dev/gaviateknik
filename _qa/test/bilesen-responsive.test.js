/* Faz 14 · Adım 6 — doküman §9 "Bileşen bazlı responsive kurallar":
   üst bar · arama · KPI · pager.

   İKİ KATMAN: arama katmanı davranışı jsdom'da GERÇEKTEN çalışır;
   yerleşim (tek kolon, tam genişlik, ikinci satır) YALNIZ CSS KURALI
   düzeyinde doğrulanır — jsdom layout hesaplamaz. */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { KOK } = require('./yukleyici.js');

const jsdomModul = require('../jsdom-yolu.js').yukle();
const css = f => fs.readFileSync(path.join(KOK, 'assets', 'css', f), 'utf8');

function medyaBlogu(metin, px) {
  const i = metin.indexOf('@media (max-width: ' + px + 'px)');
  assert.ok(i >= 0, px + 'px bloğu yok');
  const bas = metin.indexOf('{', i);
  let d = 0, j = bas;
  for (; j < metin.length; j++) {
    if (metin[j] === '{') d++;
    else if (metin[j] === '}') { d--; if (!d) break; }
  }
  return metin.slice(bas + 1, j);
}
const B640 = medyaBlogu(css('responsive.css'), 640);
const B480 = medyaBlogu(css('responsive.css'), 480);

/* ================= ÜST BAR ================= */

test('CSS kuralı: ≤640 dil butonu gizlenir, arama ikonu görünür', () => {
  assert.match(B640, /\.gv-top-tools \.gv-langbtn\s*\{\s*display:\s*none\s*\}/);
  assert.match(B640, /\.gv-searchbtn\s*\{\s*display:\s*inline-flex\s*\}/);
});

test('CSS kuralı: arama katmanı parçaları masaüstünde YOK', () => {
  assert.match(css('gavia-ui.css'),
    /\.gv-search-close,\s*\.gv-searchbtn\s*\{\s*display:\s*none\s*\}/);
});

/* ================= ARAMA ================= */

test('CSS kuralı: ≤640 arama tam genişlik katman olarak açılır', () => {
  assert.match(B640, /\.gv-search\s*\{[^}]*position:\s*absolute/);
  assert.match(B640, /\.gv-search\s*\{[^}]*left:\s*0/);
  assert.match(B640, /\.gv-search\s*\{[^}]*right:\s*0/);
  assert.match(B640, /\.gv-search\s*\{[^}]*display:\s*none/);
  assert.match(B640, /body\.gv-search-open \.gv-search\s*\{\s*display:\s*flex\s*\}/);
});

test('CSS kuralı: sonuç listesi viewport dışına taşmaz', () => {
  /* masaüstünde 320px asgari genişlik var; mobilde kaldırılır */
  assert.match(css('components.css'), /\.gv-searchpop\s*\{[^}]*min-width:\s*320px/);
  assert.match(B640, /\.gv-searchpop\s*\{[^}]*min-width:\s*0/);
  assert.match(B640, /\.gv-searchpop\s*\{[^}]*left:\s*12px[^}]*right:\s*12px/);
});

/* ================= KPI ================= */

test('CSS kuralı: ≤640 KPI tek kolon, metin kesilmez, link 44 hedefi', () => {
  assert.match(B640, /\.kpi-grid\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*\}/);
  assert.match(B640, /a\.kpi-card\s*\{[^}]*min-height:\s*44px/);
  assert.match(B640, /\.kpi-num,\s*\.kpi-lbl,\s*\.kpi-delta\s*\{[^}]*white-space:\s*normal/);
  assert.match(B640, /\.kpi-num,\s*\.kpi-lbl,\s*\.kpi-delta\s*\{[^}]*text-overflow:\s*clip/);
});

test('CSS kuralı: masaüstü KPI ızgarası DEĞİŞMEDİ', () => {
  assert.match(css('components.css'),
    /\.kpi-grid\s*\{[^}]*repeat\(auto-fit,\s*minmax\(212px,\s*1fr\)\)/);
});

/* ================= PAGER ================= */

test('CSS kuralı: ≤640 numaralar gizli, compact göstergesi açık', () => {
  assert.match(B640, /\.pg-num,\s*\.pg-gap\s*\{\s*display:\s*none\s*\}/);
  assert.match(B640, /\.pg-compact\s*\{\s*display:\s*inline-flex\s*\}/);
});

test('CSS kuralı: ≤480 kayıt aralığı ikinci satıra düşer', () => {
  assert.match(B480, /\.gv-pager\s*\{[^}]*flex-direction:\s*column/);
  assert.match(B480, /\.gv-pager \.pg-btns\s*\{[^}]*order:\s*1/);
  assert.match(B480, /\.gv-pager \.pg-count\s*\{[^}]*order:\s*2/);
});

/* ================= DAVRANIŞ (jsdom) ================= */

function kur() {
  const { JSDOM } = jsdomModul;
  const dom = new JSDOM(`<!doctype html><html><body data-sec="operasyon" data-screen="is-emirleri">
    <div class="gv-app">
      <aside class="gv-rail" id="gvRail"></aside>
      <nav class="gv-menu" id="gvMenu"></nav>
      <div class="gv-overlay" id="gvOverlay"></div>
      <header class="gv-top" id="gvTop"></header>
      <main class="gv-main"><h1>Test</h1></main>
    </div></body></html>`, { url: 'http://localhost/is-emirleri.html', runScripts: 'outside-only' });
  const win = dom.window;
  win.requestAnimationFrame = cb => cb();
  win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  for (const d of ['kimlik.js', 'para-zaman.js', 'demo-data.js', 'demo-api.js', 'navigation.js']) {
    win.eval(fs.readFileSync(path.join(KOK, 'assets', 'js', d), 'utf8'));
  }
  return { win, doc: win.document };
}

test('üst barda arama tetikleyicisi ve kapat düğmesi basılır', () => {
  const { doc } = kur();
  const ac = doc.getElementById('gvSearchOpen');
  const kapat = doc.getElementById('gvSearchClose');
  assert.ok(ac, 'arama tetikleyicisi yok');
  assert.ok(kapat, 'arama kapat düğmesi yok');
  assert.strictEqual(ac.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(ac.getAttribute('aria-controls'), 'gvSearchInput');
  assert.ok(ac.getAttribute('aria-label'), 'ikon butonda aria-label yok');
  assert.ok(kapat.getAttribute('aria-label'));
});

test('arama katmanı açılır, odak girdiye gider, aria-expanded güncellenir', () => {
  const { doc } = kur();
  const ac = doc.getElementById('gvSearchOpen');
  ac.click();
  assert.ok(doc.body.classList.contains('gv-search-open'));
  assert.strictEqual(ac.getAttribute('aria-expanded'), 'true');
  assert.strictEqual(doc.activeElement.id, 'gvSearchInput');
});

test('katman Escape ile kapanır ve odak tetikleyiciye döner', () => {
  const { win, doc } = kur();
  const ac = doc.getElementById('gvSearchOpen');
  ac.click();
  doc.getElementById('gvSearchInput')
     .dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.ok(!doc.body.classList.contains('gv-search-open'));
  assert.strictEqual(ac.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(doc.activeElement, ac);
});

test('kapat düğmesi katmanı kapatır', () => {
  const { doc } = kur();
  doc.getElementById('gvSearchOpen').click();
  doc.getElementById('gvSearchClose').click();
  assert.ok(!doc.body.classList.contains('gv-search-open'));
});

test('katman dışına tıklayınca kapanır', () => {
  const { doc } = kur();
  doc.getElementById('gvSearchOpen').click();
  doc.querySelector('main.gv-main h1').click();
  assert.ok(!doc.body.classList.contains('gv-search-open'));
});

test('arama sonucu listesi katman içinde basılır ve rol bilgisi taşır', () => {
  const { doc } = kur();
  doc.getElementById('gvSearchOpen').click();
  const inp = doc.getElementById('gvSearchInput');
  const pop = doc.getElementById('gvSearchPop');
  assert.ok(inp.closest('.gv-search').contains(pop), 'sonuç listesi katmanın dışında');
  assert.strictEqual(pop.getAttribute('role'), 'listbox');
  assert.ok(pop.getAttribute('aria-label'));
});

/* ---- pager canlı bölgesi ---- */

function pagerKur() {
  const { JSDOM } = jsdomModul;
  const dom = new JSDOM('<!doctype html><html><body><div id="p"></div></body></html>',
    { url: 'http://localhost/t.html', runScripts: 'outside-only' });
  const win = dom.window;
  win.requestAnimationFrame = cb => cb();
  win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  for (const d of ['kimlik.js', 'para-zaman.js', 'app.js', 'components.js']) {
    win.eval(fs.readFileSync(path.join(KOK, 'assets', 'js', d), 'utf8'));
  }
  return win;
}

test('pager kayıt aralığı canlı bölgedir', () => {
  const win = pagerKur();
  const p = win.gvPager({ hedef: '#p', boyut: 20, degisti() {} });
  p.ayarla(59, 1);
  const c = win.document.querySelector('.pg-count');
  assert.strictEqual(c.getAttribute('role'), 'status');
  assert.strictEqual(c.getAttribute('aria-live'), 'polite');
  assert.strictEqual(c.getAttribute('aria-atomic'), 'true');
  assert.match(c.textContent, /1–20 \/ 59 kayıt/);
});

test('pager mobil göstergesi ve önceki/sonraki her zaman basılır', () => {
  const win = pagerKur();
  const p = win.gvPager({ hedef: '#p', boyut: 20, degisti() {} });
  p.ayarla(59, 1);
  const doc = win.document;
  assert.ok(doc.querySelector('.pg-compact'), 'compact gösterge yok');
  assert.strictEqual(doc.querySelector('.pg-compact').textContent, '1 / 3');
  assert.ok(doc.querySelector('[data-git="onceki"]'));
  assert.ok(doc.querySelector('[data-git="sonraki"]'));
  assert.ok(doc.querySelector('[data-git="onceki"]').disabled, 'ilk sayfada önceki açık');
});

test('sayfa değişince canlı bölge metni güncellenir', () => {
  const win = pagerKur();
  const p = win.gvPager({ hedef: '#p', boyut: 20, degisti() {} });
  p.ayarla(59, 1);
  win.document.querySelector('[data-git="sonraki"]').click();
  assert.match(win.document.querySelector('.pg-count').textContent, /21–40 \/ 59 kayıt/);
  assert.strictEqual(win.document.querySelector('.pg-compact').textContent, '2 / 3');
});
