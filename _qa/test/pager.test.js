/* gvPager — yeni seçeneklerin TAMAMI varsayılan kapalı olmalı; bugün
   gvPager kullanan 36 sayfanın davranışı bit düzeyinde aynı kalmalı. */
const { test, skip } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { KOK } = require('./yukleyici.js');

const JSDOMMod = require('../jsdom-yolu.js').yukle();
if (!JSDOMMod) { skip('jsdom bulunamadı — gvPager testleri atlandı'); return; }
const { JSDOM } = JSDOMMod;

const DOSYALAR = ['types.js', 'components.js', 'app.js'];

function sayfa(arama) {
  const dom = new JSDOM('<!doctype html><body><div id="pager"></div></body>', {
    url: 'https://x/liste.html' + (arama || ''), runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  for (const d of DOSYALAR) w.eval(fs.readFileSync(path.join(KOK, 'assets', 'js', d), 'utf8'));
  return w;
}
const tik = (w, sec) => w.document.querySelector(sec).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));

/* ---------- geriye uyumluluk ---------- */

test('varsayılan boyut 15 kalır — mevcut sayfalar etkilenmez', () => {
  const w = sayfa();
  const p = w.gvPager({ hedef: '#pager' });
  assert.strictEqual(p.boyut(), 15);
  p.ayarla(40);
  assert.strictEqual(w.document.querySelectorAll('#pager .pg-num').length, 3);
});

test('boyut seçici varsayılan olarak basılmaz', () => {
  const w = sayfa();
  w.gvPager({ hedef: '#pager' }).ayarla(100);
  assert.strictEqual(w.document.querySelector('.pg-size'), null);
});

test('url seçeneği kapalıyken URL\'ye hiçbir şey yazılmaz', () => {
  const w = sayfa();
  const p = w.gvPager({ hedef: '#pager', boyut: 10 });
  p.ayarla(100);
  tik(w, '[data-git="sonraki"]');
  assert.strictEqual(w.location.search, '');
  assert.strictEqual(p.sayfa(), 2);
});

test('tek sayfalık listede pager gizlenir (eski davranış)', () => {
  const w = sayfa();
  w.gvPager({ hedef: '#pager', boyut: 20 }).ayarla(12);
  assert.strictEqual(w.document.getElementById('pager').hidden, true);
});

test('dilim() ve ayarla(t, true) eski imzasıyla çalışır', () => {
  const w = sayfa();
  const p = w.gvPager({ hedef: '#pager', boyut: 10 });
  p.ayarla(30);
  tik(w, '[data-git="3"]');
  assert.strictEqual(p.sayfa(), 3);
  assert.deepStrictEqual(p.dilim(Array.from({ length: 30 }, (_, i) => i)).slice(0, 2), [20, 21]);
  p.ayarla(30, true);
  assert.strictEqual(p.sayfa(), 1);
});

/* ---------- yeni seçenekler ---------- */

test('url:true sayfa numarasını pushState ile URL\'ye yazar', () => {
  const w = sayfa();
  const uz = w.history.length;
  const p = w.gvPager({ hedef: '#pager', boyut: 10, url: true });
  p.ayarla(100);
  tik(w, '[data-git="sonraki"]');
  assert.strictEqual(new w.URLSearchParams(w.location.search).get('page'), '2');
  assert.strictEqual(w.history.length, uz + 1);
});

test('url:true açılışta ?page değerini okur', () => {
  const w = sayfa('?page=4');
  const p = w.gvPager({ hedef: '#pager', boyut: 10, url: true });
  p.ayarla(100);
  assert.strictEqual(p.sayfa(), 4);
  assert.ok(w.document.querySelector('.pg-num.is-on').textContent === '4');
});

test('1. sayfaya dönünce page parametresi URL\'den silinir', () => {
  const w = sayfa('?page=2');
  const p = w.gvPager({ hedef: '#pager', boyut: 10, url: true });
  p.ayarla(100);
  tik(w, '[data-git="onceki"]');
  assert.strictEqual(new w.URLSearchParams(w.location.search).get('page'), null);
});

test('boyutSecici:true 10/20/50 seçeneklerini basar ve etiketlidir', () => {
  const w = sayfa();
  w.gvPager({ hedef: '#pager', boyut: 20, boyutSecici: true }).ayarla(100);
  const sel = w.document.querySelector('.pg-size select');
  assert.ok(sel, 'seçici basılmadı');
  assert.deepStrictEqual([...sel.options].map(o => Number(o.value)), [10, 20, 50]);
  assert.strictEqual(sel.value, '20');
  assert.ok(sel.getAttribute('aria-label'));
});

test('boyut değişince sayfa 1\'e döner ve degisti tetiklenir', () => {
  const w = sayfa();
  let cagri = null;
  const p = w.gvPager({
    hedef: '#pager', boyut: 20, boyutSecici: true,
    degisti: (s, b) => { cagri = [s, b]; }
  });
  p.ayarla(100);
  tik(w, '[data-git="sonraki"]');
  assert.strictEqual(p.sayfa(), 2);
  const sel = w.document.querySelector('.pg-size select');
  sel.value = '50';
  sel.dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.strictEqual(p.sayfa(), 1);
  assert.strictEqual(p.boyut(), 50);
  assert.deepStrictEqual(cagri, [1, 50]);
});

test('boyut seçici açıkken tek sayfalık listede pager gizlenmez', () => {
  const w = sayfa();
  w.gvPager({ hedef: '#pager', boyut: 20, boyutSecici: true }).ayarla(12);
  assert.strictEqual(w.document.getElementById('pager').hidden, false);
});

test('sikisik:true numara düğmelerini basmaz, n/m göstergesi kalır', () => {
  const w = sayfa();
  w.gvPager({ hedef: '#pager', boyut: 10, sikisik: true }).ayarla(100);
  assert.strictEqual(w.document.querySelectorAll('.pg-num').length, 0);
  assert.strictEqual(w.document.querySelector('.pg-compact').textContent, '1 / 10');
  assert.ok(w.document.querySelector('[data-git="sonraki"]'));
});

test('sayfaya() sayfa durumunu dışarıdan kurar (ListController sahipliği)', () => {
  const w = sayfa();
  const p = w.gvPager({ hedef: '#pager', boyut: 20 });
  p.sayfaya(3);
  p.ayarla(100);
  assert.strictEqual(p.sayfa(), 3);
  assert.strictEqual(w.document.querySelector('.pg-num.is-on').textContent, '3');
  p.sayfaya(1, 50);
  p.ayarla(100);
  assert.strictEqual(p.boyut(), 50);
  assert.strictEqual(w.document.querySelector('.pg-count').textContent, '1–50 / 100 kayıt');
});

test('sayfaya() geçersiz değeri 1\'e çeker', () => {
  const w = sayfa();
  const p = w.gvPager({ hedef: '#pager', boyut: 20 });
  p.sayfaya(0); p.ayarla(100);
  assert.strictEqual(p.sayfa(), 1);
  p.sayfaya('abc'); p.ayarla(100);
  assert.strictEqual(p.sayfa(), 1);
});

test('0 kayıtta "Kayıt yok" yazar, sayfa düğmesi görünmez', () => {
  const w = sayfa();
  w.gvPager({ hedef: '#pager', boyut: 20 }).ayarla(0);
  assert.strictEqual(w.document.querySelector('.pg-count').textContent, 'Kayıt yok');
  assert.strictEqual(w.document.getElementById('pager').hidden, true);
});
