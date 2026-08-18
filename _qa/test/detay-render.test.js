/* Faz 15 — DETAY EKRANLARI GERÇEK RENDER DENETİMİ
   `_qa/tarama.js` detay sayfalarını `?id=` olmadan gezer; kayıt bulunamadığı
   için alt koleksiyonlar hiç çizilmez. Bu dosya her detay ekranını GERÇEK bir
   kayıt id'siyle jsdom'da çalıştırır ve alt koleksiyonların çizildiğini,
   sayfa durumlarının birbirini ezmediğini doğrular.

   jsdom yoksa testler skip edilir — uydurma sonuç üretilmez. */
const { test, skip } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { KOK } = require('./yukleyici.js');

const JSDOMMod = require('../jsdom-yolu.js').yukle();
if (!JSDOMMod) { skip('jsdom bulunamadı — detay render testleri atlandı'); return; }
const { JSDOM } = JSDOMMod;

/* Detay ekranı → çekirdek veride var olan gerçek kayıt id'si. */
const KAYITLAR = {
  'musteri-detay.html': 'MST-001',
  'proje-detay.html': 'PRJ-2026-001',
  'lokasyon-detay.html': 'LOK-0101',
  'ekipman-detay.html': 'EKP-0001',
  'is-emri-detay.html': 'IE-2026-0011',
  'rapor-detay.html': 'RPR-2026-0001',
  'uygunsuzluk-detay.html': 'UYG-2026-001',
  'teklif-detay.html': 'TKL-2026-001'
};

/** Sayfayı jsdom'da çalıştırır; yakalanan hataları ve pencereyi döndürür. */
async function ac(dosya, arama) {
  const hata = [];
  const dom = await JSDOM.fromFile(path.join(KOK, dosya), {
    runScripts: 'outside-only', pretendToBeVisual: true,
    url: 'http://localhost/' + dosya + '?' + arama
  });
  const w = dom.window, doc = w.document;
  w.requestAnimationFrame = cb => setTimeout(cb, 0);
  if (!w.matchMedia) w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.HTMLCanvasElement.prototype.getContext = () => ({
    scale() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, clearRect() {},
    set lineWidth(v) {}, set lineCap(v) {}, set lineJoin(v) {}, set strokeStyle(v) {}
  });
  if (!w.Element.prototype.scrollIntoView) w.Element.prototype.scrollIntoView = function () {};
  w.console.error = (...a) => hata.push('console.error: ' + a.map(String).join(' '));
  for (const sc of doc.querySelectorAll('script')) {
    const src = sc.getAttribute('src');
    try {
      if (src && !/^https?:/.test(src)) w.eval(fs.readFileSync(path.join(KOK, src), 'utf8'));
      else if (!src && sc.textContent.trim()) w.eval(sc.textContent);
    } catch (e) { hata.push((src || 'satır içi script') + ' → ' + e.message); }
  }
  doc.dispatchEvent(new w.Event('DOMContentLoaded', { bubbles: true }));
  await new Promise(r => setTimeout(r, 120));
  return { w, doc, hata };
}

/* Sayfadaki gvList çağrılarının başlığını ayrıştırır (kaynak + önek).
   Sayfada başka `kaynak:` alanları da olabilir; yalnız gvList başlığı sayılır. */
const BASLIK = /gvList\(\{\s*kaynak:\s*'([^']+)',\s*onek:\s*'([^']+)'/g;
function listeler(dosya) {
  const s = fs.readFileSync(path.join(KOK, dosya), 'utf8');
  return { metin: s, kayitlar: [...s.matchAll(BASLIK)].map(m => ({ kaynak: m[1], onek: m[2] })) };
}

/* ================= statik sözleşme ================= */

test('her detay ekranında alt liste önekleri benzersiz', () => {
  const carpisan = [];
  for (const dosya of Object.keys(KAYITLAR)) {
    const { metin, kayitlar } = listeler(dosya);
    const onekler = kayitlar.map(k => k.onek);
    if (new Set(onekler).size !== onekler.length) carpisan.push(dosya + ' → ' + onekler.join(','));
    /* önek verilmeyen ikinci bir gvList aynı sayfada olamaz */
    const listeSayisi = (metin.match(/gvList\(\{/g) || []).length;
    if (listeSayisi > 1 && onekler.length !== listeSayisi) {
      carpisan.push(dosya + ' → ' + listeSayisi + ' liste, ' + onekler.length + ' önek');
    }
  }
  assert.deepStrictEqual(carpisan, []);
});

test('alt liste kaynak adları modül önekiyle ayrışır', () => {
  const kaynaklar = new Map();
  const cakisma = [];
  for (const dosya of Object.keys(KAYITLAR)) {
    for (const { kaynak } of listeler(dosya).kayitlar) {
      if (kaynaklar.has(kaynak) && kaynaklar.get(kaynak) !== dosya) cakisma.push(kaynak);
      kaynaklar.set(kaynak, dosya);
      assert.ok(kaynak.includes(':'), dosya + ' kaynak adı modül önekli olmalı: ' + kaynak);
    }
  }
  assert.deepStrictEqual(cakisma, []);
});

test('her alt listenin pager kabı sayfada tanımlı', () => {
  const eksik = [];
  for (const dosya of Object.keys(KAYITLAR)) {
    const s = fs.readFileSync(path.join(KOK, dosya), 'utf8');
    for (const m of s.matchAll(/pager:\s*\{\s*hedef:\s*'#([^']+)'/g)) {
      if (!s.includes('id="' + m[1] + '"')) eksik.push(dosya + ' → #' + m[1]);
    }
  }
  assert.deepStrictEqual(eksik, []);
});

/* ================= gerçek render ================= */

for (const [dosya, id] of Object.entries(KAYITLAR)) {
  test(dosya + ' gerçek kayıtla hatasız çiziliyor', async () => {
    const { doc, hata } = await ac(dosya, 'id=' + id + '&role=sahip');
    assert.deepStrictEqual(hata, []);
    /* kayıt bulunamadı ekranına düşmediğini doğrula */
    assert.strictEqual(doc.querySelector('.gv-notfound'), null);
    /* her alt liste ya tablo ya boş ekran bastı — hiçbiri boş kap kalmadı */
    const pagerler = [...doc.querySelectorAll('.gv-pager')];
    assert.ok(pagerler.length > 0, 'alt liste pager kabı yok');
    for (const pg of pagerler) {
      /* Sözleşme: pager kabının id'si liste kabının id'si + "Pg". */
      const kap = doc.getElementById(pg.id.replace(/Pg$/, ''));
      assert.ok(kap, pg.id + ' için liste kabı yok');
      const dolu = kap.querySelector('table') || kap.querySelector('.gv-empty')
        || kap.querySelector('.act-list') || kap.querySelector('.gv-chain')
        || kap.querySelector('.rd-versiyon');
      assert.ok(dolu, pg.id + ' listesi hiç çizilmedi');
    }
  });

  test(dosya + ' alt listeleri URL durumunu paylaşmıyor', async () => {
    const { w, doc } = await ac(dosya, 'id=' + id + '&role=sahip');
    /* görünür durumdaki her pager'da 2. sayfaya git; hiçbir anahtar öneksiz olmasın */
    const gorunur = [...doc.querySelectorAll('.gv-pager')].filter(p => !p.hidden);
    for (const pg of gorunur) {
      const dugme = pg.querySelector('[data-git="2"]');
      if (dugme) dugme.click();
    }
    await new Promise(r => setTimeout(r, 60));
    const u = new w.URLSearchParams(w.location.search);
    assert.strictEqual(u.get('page'), null, 'öneksiz page anahtarı yazıldı');
    assert.strictEqual(u.get('id'), id, 'route id kayboldu');
    /* her görünür pager kendi anahtarını yazdı */
    const yazilan = [...u.keys()].filter(k => k.endsWith('page'));
    assert.strictEqual(yazilan.length, gorunur.filter(p => p.querySelector('[data-git="2"]')).length);
  });
}
