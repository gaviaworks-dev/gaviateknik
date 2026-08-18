/* gvTooltip — doküman §4 "Tooltip davranış standardı" */
const { test, skip } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { KOK } = require('./yukleyici.js');

const JSDOMMod = require('../jsdom-yolu.js').yukle();
if (!JSDOMMod) { skip('jsdom bulunamadı — tooltip testleri atlandı'); return; }
const { JSDOM } = JSDOMMod;

const SAYFA = 'hizmet-katalogu.html';
const bekle = ms => new Promise(r => setTimeout(r, ms));

/* tooltip.js dinleyicilerini DOMContentLoaded'da bağlar (gerçek tarayıcıda
   script gövdede çalışır). jsdom'da bu olay asenkron tetiklenir; testler
   olayları göndermeden önce bir tur beklemeli. */
async function ac() {
  const dom = new JSDOM(fs.readFileSync(path.join(KOK, SAYFA), 'utf8'), {
    url: `https://x/${SAYFA}?role=sahip`, runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  /* jsdom'da matchMedia yok; hover:none SORGUSU false dönmeli (masaüstü) */
  w.matchMedia = w.matchMedia || (q => ({ matches: false, media: q, addListener() {}, removeListener() {} }));
  for (const sc of w.document.querySelectorAll('script')) {
    const src = sc.getAttribute('src');
    const kod = src ? fs.readFileSync(path.join(KOK, src), 'utf8') : sc.textContent;
    try { w.eval(kod); } catch (e) { if (!/navigation|Not implemented/.test(String(e))) throw e; }
  }
  await bekle(0);
  return w;
}
const ikon = w => w.document.querySelector('.gv-rail-ico');

test('rail ikonları başlık VE açıklama taşır', async () => {
  const w = await ac();
  const ikonlar = [...w.document.querySelectorAll('.gv-rail-ico')];
  assert.ok(ikonlar.length >= 5);
  for (const i of ikonlar) {
    assert.ok(i.getAttribute('data-tip'), 'data-tip yok');
    assert.ok(i.getAttribute('data-tip-desc'), i.getAttribute('data-tip') + ': açıklama yok');
  }
});

test('hover ipucunu ANINDA açmaz — 350 ms gecikme vardır', async () => {
  const w = await ac();
  const i = ikon(w);
  i.dispatchEvent(new w.MouseEvent('mouseover', { bubbles: true }));
  assert.strictEqual(w.gvTooltip.katman(), null, 'gecikmesiz açıldı');
  await bekle(420);
  assert.ok(w.gvTooltip.katman(), '350 ms sonra açılmadı');
});

test('açılan katman role="tooltip" taşır ve tetikleyici aria-describedby ile bağlanır', async () => {
  const w = await ac();
  const i = ikon(w);
  i.dispatchEvent(new w.FocusEvent('focusin', { bubbles: true }));
  const k = w.gvTooltip.katman();
  assert.ok(k);
  assert.strictEqual(k.getAttribute('role'), 'tooltip');
  assert.strictEqual(k.id, 'gvTip');
  assert.strictEqual(i.getAttribute('aria-describedby'), 'gvTip');
});

test('klavye odağında ipucu gecikmesiz açılır', async () => {
  const w = await ac();
  ikon(w).dispatchEvent(new w.FocusEvent('focusin', { bubbles: true }));
  assert.ok(w.gvTooltip.katman(), 'odakta açılmadı');
});

test('Escape ipucunu kapatır ve aria-describedby kalkar', async () => {
  const w = await ac();
  const i = ikon(w);
  i.dispatchEvent(new w.FocusEvent('focusin', { bubbles: true }));
  assert.ok(w.gvTooltip.katman());
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.strictEqual(w.gvTooltip.katman(), null);
  assert.strictEqual(i.getAttribute('aria-describedby'), null);
});

test('odak kaybında ipucu kapanır', async () => {
  const w = await ac();
  const i = ikon(w);
  i.dispatchEvent(new w.FocusEvent('focusin', { bubbles: true }));
  i.dispatchEvent(new w.FocusEvent('focusout', { bubbles: true }));
  assert.strictEqual(w.gvTooltip.katman(), null);
});

test('imleç ayrılınca 100 ms içinde kapanır', async () => {
  const w = await ac();
  const i = ikon(w);
  i.dispatchEvent(new w.FocusEvent('focusin', { bubbles: true }));
  assert.ok(w.gvTooltip.katman());
  i.dispatchEvent(new w.MouseEvent('mouseout', { bubbles: true }));
  await bekle(160);
  assert.strictEqual(w.gvTooltip.katman(), null);
});

test('ipucu başlığı ve açıklamayı birlikte basar', async () => {
  const w = await ac();
  const i = ikon(w);
  i.dispatchEvent(new w.FocusEvent('focusin', { bubbles: true }));
  const k = w.gvTooltip.katman();
  assert.strictEqual(k.querySelector('.gv-tip-t').textContent, i.getAttribute('data-tip'));
  assert.strictEqual(k.querySelector('.gv-tip-d').textContent, i.getAttribute('data-tip-desc'));
});

test('dokunmatik cihazda hover ipucu açmaz', async () => {
  const w = await ac();
  w.matchMedia = q => ({ matches: /hover: none/.test(q), media: q, addListener() {}, removeListener() {} });
  ikon(w).dispatchEvent(new w.MouseEvent('mouseover', { bubbles: true }));
  await bekle(420);
  assert.strictEqual(w.gvTooltip.katman(), null);
});

test('mobil karşılığı: menü başlığında modül açıklaması bulunur', async () => {
  const w = await ac();
  const d = w.document.querySelector('.gv-menu-head .gmh-desc');
  assert.ok(d, 'menü başlığında açıklama yok');
  assert.ok(d.textContent.length > 10);
});

test('eski CSS-only rail ipucu kuralı kaldırıldı', () => {
  const css = fs.readFileSync(path.join(KOK, 'assets/css/gavia-ui.css'), 'utf8');
  assert.ok(!/\.gv-rail \[data-tip\]::after/.test(css), 'sözde-öğe ipucu hâlâ duruyor');
  /* topbar ipucu bilinçli olarak korundu */
  assert.ok(/\.gv-top \[data-tip\]::after/.test(css), 'topbar ipucu kaybolmuş');
});

test('ipucu katmanı tıklamayı engellemez (pointer-events:none)', () => {
  const css = fs.readFileSync(path.join(KOK, 'assets/css/gavia-ui.css'), 'utf8');
  const blok = css.slice(css.indexOf('.gv-tip {'), css.indexOf('.gv-tip.is-on'));
  assert.match(blok, /pointer-events:\s*none/);
});

test('tooltip.js her kabuk sayfasında yüklü', () => {
  const sayfalar = fs.readdirSync(KOK).filter(f => f.endsWith('.html'));
  const eksik = sayfalar.filter(f => {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    return s.includes('assets/js/navigation.js') && !s.includes('assets/js/tooltip.js');
  });
  assert.deepStrictEqual(eksik, [], 'tooltip.js eksik: ' + eksik.join(', '));
});
