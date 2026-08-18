/* navigation.js — routeRegistry türetimi ve çekmece erişilebilirliği.
   Kabuk DOM'a bağlı olduğu için jsdom kullanılır. */
const { test, skip } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { KOK } = require('./yukleyici.js');

const JSDOMMod = require('../jsdom-yolu.js').yukle();
if (!JSDOMMod) { skip('jsdom bulunamadı — navigation testleri atlandı'); return; }
const { JSDOM } = JSDOMMod;

const SAYFA = 'hizmet-katalogu.html';

function ac(rol) {
  const dom = new JSDOM(fs.readFileSync(path.join(KOK, SAYFA), 'utf8'), {
    url: `https://x/${SAYFA}?role=${rol || 'sahip'}`,
    runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  for (const sc of w.document.querySelectorAll('script')) {
    const src = sc.getAttribute('src');
    const kod = src ? fs.readFileSync(path.join(KOK, src), 'utf8') : sc.textContent;
    try { w.eval(kod); } catch (e) { if (!/navigation|Not implemented/.test(String(e))) throw e; }
  }
  return w;
}

/* ---------- routeRegistry ---------- */

test('routeRegistry 11 modülü BOLUMLER\'den türetir', () => {
  const w = ac();
  const r = w.GV.routeRegistry;
  assert.strictEqual(r.length, 11);
  /* jsdom ayrı bir realm; dizi kimlikleri karşılaştırılamaz, metin üzerinden bakılır */
  assert.strictEqual(r.map(x => x.key).join(','), Object.keys(w.GV.BOLUMLER).join(','));
});

test('her modül başlık, açıklama, ikon, route ve izin anahtarı taşır', () => {
  const w = ac();
  for (const r of w.GV.routeRegistry) {
    assert.ok(r.label, r.key + ': label yok');
    assert.ok(r.description, r.key + ': description yok');
    assert.ok(r.icon, r.key + ': icon yok');
    assert.ok(r.href, r.key + ': href yok');
    assert.match(r.permission, /^[a-z]+\.[a-z]+$/, r.key + ': izin anahtarı biçimi');
  }
});

test('açıklamalar doküman §4 tooltip sözlüğüyle birebir', () => {
  const w = ac();
  const bekleme = {
    panel: 'Günlük özet, aksiyonlar, onaylar ve bildirimler',
    musteri: 'Müşteri, proje, lokasyon ve iletişim kişileri',
    hizmet: 'Hizmet kataloğu, poz, fiyat, ekipman ve mutabakat',
    operasyon: 'Planlama, operasyon takvimi, iş emri ve saha kontrolü',
    teknik: 'Teknik rapor, onay, uygunsuzluk ve yeniden kontrol',
    ticari: 'Teklif, sözleşme, hakediş, fatura ve tahsilat',
    kaynak: 'Personel, yetkinlik, taşeron ve taşeron hakedişleri',
    kalite: 'Kalite dokümanı, denetim, DÖF ve müşteri şikâyeti',
    raporlama: 'Operasyonel, teknik, ticari ve kalite analizleri',
    sistem: 'Firma, roller, veri aktarımı ve işlem kayıtları'
  };
  const bul = k => w.GV.routeRegistry.filter(r => r.key === k)[0];
  for (const k of Object.keys(bekleme)) assert.strictEqual(bul(k).description, bekleme[k], k);
});

test('doküman §4 başlangıç route\'ları tutuyor', () => {
  const w = ac();
  const bul = k => w.GV.routeRegistry.filter(r => r.key === k)[0];
  const bekleme = {
    panel: 'panel.html', musteri: 'musteriler.html', hizmet: 'hizmet-katalogu.html',
    operasyon: 'planlama.html', teknik: 'teknik-raporlar.html', ticari: 'teklifler.html',
    kaynak: 'taseronlar.html', kalite: 'kalite-dokumanlari.html',
    raporlama: 'raporlar.html', sistem: 'ayarlar.html'
  };
  for (const k of Object.keys(bekleme)) assert.strictEqual(bul(k).href, bekleme[k], k);
});

test('her route tam olarak bir ana modüle bağlıdır — çift kayıt yok', () => {
  const w = ac();
  const gorulen = new Map();
  for (const r of w.GV.routeRegistry) {
    for (const e of r.screens) {
      assert.ok(!gorulen.has(e.href), e.href + ' iki modülde: ' + gorulen.get(e.href) + ' / ' + r.key);
      gorulen.set(e.href, r.key);
    }
  }
});

test('GV.route sorgu parametresine rağmen modülü bulur', () => {
  const w = ac();
  assert.strictEqual(w.GV.route('hizmet-katalogu.html?page=3&q=x').modul.key, 'hizmet');
  assert.strictEqual(w.GV.route('ekipmanlar.html').ekran.screen, 'ekipmanlar');
});

test('tanımsız route ilk kaydı açmaz, null döner', () => {
  const w = ac();
  assert.strictEqual(w.GV.route('olmayan-sayfa.html'), null);
  assert.strictEqual(w.GV.route(''), null);
  assert.strictEqual(w.GV.route(null), null);
});

/* ---------- çekmece (drawer) ---------- */

function burgerAc(w) {
  const b = w.document.getElementById('gvBurger');
  b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  return b;
}

test('çekmece açılınca gövde kaydırma kilitlenir ve odak içeri alınır', () => {
  const w = ac();
  const b = burgerAc(w);
  assert.strictEqual(w.document.body.classList.contains('nav-open'), true);
  assert.strictEqual(b.getAttribute('aria-expanded'), 'true');
  assert.strictEqual(w.document.documentElement.classList.contains('gv-scroll-locked'), true);
  assert.ok(w.document.getElementById('gvMenu').contains(w.document.activeElement));
});

test('Escape çekmeceyi kapatır, kilidi açar, odağı butona iade eder', () => {
  const w = ac();
  const b = burgerAc(w);
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.strictEqual(w.document.body.classList.contains('nav-open'), false);
  assert.strictEqual(b.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(w.document.documentElement.classList.contains('gv-scroll-locked'), false);
  assert.strictEqual(w.document.activeElement, b);
});

test('örtüye tıklamak da kapatır ve kilidi bırakır', () => {
  const w = ac();
  burgerAc(w);
  w.document.getElementById('gvOverlay').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  assert.strictEqual(w.document.body.classList.contains('nav-open'), false);
  assert.strictEqual(w.document.documentElement.classList.contains('gv-scroll-locked'), false);
});

test('Tab tuzağı: son öğeden ileri Tab başa döner', () => {
  const w = ac();
  burgerAc(w);
  const menu = w.document.getElementById('gvMenu');
  const odak = [...menu.querySelectorAll('a[href],button:not([disabled])')];
  assert.ok(odak.length > 1);
  odak[odak.length - 1].focus();
  const e = new w.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  w.document.dispatchEvent(e);
  assert.strictEqual(e.defaultPrevented, true);
  assert.strictEqual(w.document.activeElement, odak[0]);
});

test('Tab tuzağı: ilk öğeden Shift+Tab sona döner', () => {
  const w = ac();
  burgerAc(w);
  const menu = w.document.getElementById('gvMenu');
  const odak = [...menu.querySelectorAll('a[href],button:not([disabled])')];
  odak[0].focus();
  const e = new w.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
  w.document.dispatchEvent(e);
  assert.strictEqual(e.defaultPrevented, true);
  assert.strictEqual(w.document.activeElement, odak[odak.length - 1]);
});

test('kapalı çekmecede Tab tuzağı devrede değildir', () => {
  const w = ac();
  const e = new w.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  w.document.dispatchEvent(e);
  assert.strictEqual(e.defaultPrevented, false);
});

test('#gvMenu masaüstünde aria-hidden almaz', () => {
  const w = ac();
  const menu = w.document.getElementById('gvMenu');
  assert.strictEqual(menu.getAttribute('aria-hidden'), null);
  burgerAc(w);
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.strictEqual(menu.getAttribute('aria-hidden'), null);
});

test('çekmece içindeki bağlantıya tıklanınca kilit bırakılır', () => {
  const w = ac();
  burgerAc(w);
  const bag = w.document.querySelector('#gvMenu a[href]');
  bag.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  assert.strictEqual(w.document.body.classList.contains('nav-open'), false);
  assert.strictEqual(w.document.documentElement.classList.contains('gv-scroll-locked'), false);
});

test('rol kısıtı registry\'yi değil yalnız çizimi etkiler — registry tam kalır', () => {
  const w = ac('musteri');
  assert.strictEqual(w.GV.routeRegistry.length, 11);
  assert.ok(w.GV.bolumGorunur('portal'));
  assert.strictEqual(w.GV.bolumGorunur('sistem'), false);
});
