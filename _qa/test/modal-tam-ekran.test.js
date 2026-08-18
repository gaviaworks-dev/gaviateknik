/* Faz 14 · Adım 4 — modal ≤480'de tam ekran (doküman §9).
   "480 px altında tam ekran; başlık ve kapat sabit; içerik kayar; arka plan
   kaymaz." gvScrollLock yeniden yazılmadı, mevcut hali kullanılıyor.

   İKİ KATMAN: yapı ve davranış jsdom'da GERÇEKTEN çalışıyor; tam ekran /
   sabit başlık YALNIZ CSS KURALI düzeyinde doğrulandı (jsdom layout
   hesaplamaz — gerçek render değildir). */
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

/* ================= CSS KURAL DÜZEYİ ================= */

test('CSS kuralı: masaüstünde sarmalayıcılar KUTU DEĞİL (görünüm değişmez)', () => {
  assert.match(css('components.css'),
    /\.gv-modal-head,\s*\.gv-modal-scroll\s*\{\s*display:\s*contents\s*\}/);
});

test('CSS kuralı: masaüstü modal ölçüleri DEĞİŞMEDİ', () => {
  const c = css('components.css');
  assert.match(c, /\.gv-modal\s*\{[^}]*width:\s*min\(460px,\s*100%\)/);
  assert.match(c, /\.gv-modal\s*\{[^}]*max-height:\s*88vh/);
  assert.match(c, /\.gv-modal\s*\{[^}]*padding:\s*26px/);
  assert.match(c, /\.gv-modal-close\s*\{\s*display:\s*none/);
});

test('CSS kuralı: ≤480 modal tam ekran', () => {
  const b = medyaBlogu(css('responsive.css'), 480);
  assert.match(b, /\.gv-modal\s*\{[^}]*width:\s*100%/);
  assert.match(b, /\.gv-modal\s*\{[^}]*height:\s*100dvh/);
  assert.match(b, /\.gv-modal\s*\{[^}]*border-radius:\s*0/);
  assert.match(b, /\.gv-modal-ov\s*\{[^}]*padding:\s*0/);
});

test('CSS kuralı: ≤480 başlık ve kapat sabit, yalnız içerik kayar', () => {
  const b = medyaBlogu(css('responsive.css'), 480);
  assert.match(b, /\.gv-modal\s*\{[^}]*overflow:\s*hidden/);
  assert.match(b, /\.gv-modal\s*\{[^}]*flex-direction:\s*column/);
  assert.match(b, /\.gv-modal-head\s*\{[^}]*flex:\s*none/);
  assert.match(b, /\.gv-modal-scroll\s*\{[^}]*overflow-y:\s*auto/);
  assert.match(b, /\.gv-modal-scroll\s*\{[^}]*min-height:\s*0/);
  assert.match(b, /\.gv-modal-acts\s*\{[^}]*flex:\s*none/);
  assert.match(b, /\.gv-modal-close\s*\{\s*display:\s*inline-flex\s*\}/);
});

test('CSS kuralı: arka plan kaymaz — gvScrollLock sınıfı overflow kapatır', () => {
  assert.match(css('gavia-ui.css'), /html\.gv-scroll-locked\s*\{\s*overflow:\s*hidden\s*\}/);
  assert.match(medyaBlogu(css('responsive.css'), 480),
    /\.gv-modal-scroll\s*\{[^}]*overscroll-behavior:\s*contain/);
});

/* ================= YAPI VE DAVRANIŞ (jsdom) ================= */

function kur() {
  const { JSDOM } = jsdomModul;
  const dom = new JSDOM('<!doctype html><html><body><button id="tetik">Aç</button></body></html>',
    { url: 'http://localhost/t.html', runScripts: 'outside-only' });
  const win = dom.window;
  win.requestAnimationFrame = cb => cb();
  win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  for (const d of ['kimlik.js', 'para-zaman.js', 'app.js']) {
    win.eval(fs.readFileSync(path.join(KOK, 'assets', 'js', d), 'utf8'));
  }
  return { win, doc: win.document };
}

test('modal üç bölgeli: başlık · kayan içerik · aksiyonlar', () => {
  const { win, doc } = kur();
  win.gvModal({ baslik: 'Test', ikon: 'fa-check', metin: 'Metin', govde: '<p id="g">Gövde</p>' });
  const m = doc.querySelector('.gv-modal');
  const cocuk = Array.from(m.children).map(e => e.className);
  assert.deepStrictEqual(cocuk, ['gv-modal-head', 'gv-modal-scroll', 'gv-modal-acts']);
  assert.ok(m.querySelector('.gv-modal-head .gv-modal-ico'));
  assert.ok(m.querySelector('.gv-modal-head h3#gvmBaslik'));
  assert.ok(m.querySelector('.gv-modal-head .gv-modal-close'));
  assert.ok(m.querySelector('.gv-modal-scroll > p'));
  assert.ok(m.querySelector('.gv-modal-scroll .gv-modal-body #g'));
});

test('kapat düğmesi erişilebilir adı taşır ve modalı kapatır', () => {
  const { win, doc } = kur();
  win.gvModal({ baslik: 'Test' });
  const kapat = doc.querySelector('.gv-modal-close');
  assert.strictEqual(kapat.getAttribute('aria-label'), 'Pencereyi kapat');
  assert.strictEqual(kapat.type, 'button');
  kapat.click();
  assert.ok(!doc.querySelector('.gv-modal-ov').classList.contains('open'));
  assert.ok(!doc.documentElement.classList.contains('gv-scroll-locked'));
});

test('modal açıkken arka plan kilitli; kapanınca çözülür', () => {
  const { win, doc } = kur();
  const m = win.gvModal({ baslik: 'Test' });
  assert.ok(doc.documentElement.classList.contains('gv-scroll-locked'));
  m.kapat(null);
  assert.ok(!doc.documentElement.classList.contains('gv-scroll-locked'));
});

test('ilk odak içerikten başlar, kapat düğmesine düşmez', () => {
  const { win, doc } = kur();
  win.gvModal({ baslik: 'Test', govde: '<input id="ilk">' });
  assert.strictEqual(doc.activeElement.id, 'ilk');
});

test('gövdesi olmayan modalda ilk odak aksiyon butonuna gider', () => {
  const { win, doc } = kur();
  win.gvModal({ baslik: 'Test' });
  assert.ok(doc.querySelector('.gv-modal-acts').contains(doc.activeElement));
});

test('Escape kapatır ve odak tetikleyiciye döner', async () => {
  const { win, doc } = kur();
  const tetik = doc.getElementById('tetik');
  tetik.focus();
  win.gvModal({ baslik: 'Test' });
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  /* odak iadesi kapanış animasyonundan sonra yapılır (240 ms) */
  await new Promise(r => setTimeout(r, 320));
  assert.strictEqual(doc.activeElement, tetik);
});

test('Tab tuzağı modal içinde döner ve kapat düğmesini de kapsar', () => {
  const { win, doc } = kur();
  win.gvModal({ baslik: 'Test', govde: '<input id="i1">' });
  const m = doc.querySelector('.gv-modal');
  const odak = m.querySelectorAll('button,input,select,textarea,a[href]');
  assert.ok(Array.from(odak).some(e => e.classList.contains('gv-modal-close')));
  odak[odak.length - 1].focus();
  const ev = new win.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  doc.dispatchEvent(ev);
  assert.ok(ev.defaultPrevented);
  assert.strictEqual(doc.activeElement, odak[0]);
});

test('gvConfirm not zorunluysa modal yapısı bozulmadan hata gösterir', () => {
  const { win, doc } = kur();
  win.gvConfirm({ baslik: 'Onay', notAlani: true, notZorunlu: true });
  const onay = doc.querySelector('.gv-modal-acts button:last-child');
  onay.click();
  assert.strictEqual(doc.getElementById('gvmNotErr').hidden, false);
  assert.ok(doc.querySelector('.gv-modal-ov'), 'modal kapanmış olmamalı');
  assert.deepStrictEqual(
    Array.from(doc.querySelector('.gv-modal').children).map(e => e.className),
    ['gv-modal-head', 'gv-modal-scroll', 'gv-modal-acts']);
});

test('gvResult da aynı üç bölgeli yapıyı kullanır', () => {
  const { win, doc } = kur();
  win.gvResult(true, { baslik: 'Bitti', metin: 'Tamam' });
  assert.deepStrictEqual(
    Array.from(doc.querySelector('.gv-modal').children).map(e => e.className),
    ['gv-modal-head', 'gv-modal-scroll', 'gv-modal-acts']);
});
