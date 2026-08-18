/* Faz 15 — DETAY EKRANI ALT KOLEKSİYONLARI (doküman §6 ikinci tablo)
   Bir detay sayfasında birden çok liste yaşar. Her biri kendi `onek`i ile
   URL yazar; DURMA ŞARTI: "alt koleksiyon pager'ları birbirinin URL
   state'ini eziyorsa dur". Bu dosya tam olarak onu kilitler.

   jsdom yoksa testler skip edilir — uydurma sonuç üretilmez. */
const { test, skip } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { KOK } = require('./yukleyici.js');

const jsdomYolu = require('../jsdom-yolu.js');
const JSDOMMod = jsdomYolu.yukle();

if (!JSDOMMod) {
  skip('jsdom bulunamadı — alt koleksiyon testleri atlandı');
  return;
}
const { JSDOM } = JSDOMMod;

const ISKELET = `<!doctype html><html lang="tr"><body>
  <div class="gc-body flush" id="tabloA"></div>
  <div class="gv-pager" id="pagerA" hidden></div>
  <div class="gc-body flush" id="tabloB"></div>
  <div class="gv-pager" id="pagerB" hidden></div>
</body></html>`;

const DOSYALAR = ['types.js', 'data-provider.js', 'components.js', 'filters.js', 'app.js', 'list-controller.js'];

function sayfa(arama) {
  const dom = new JSDOM(ISKELET, {
    url: 'https://x/musteri-detay.html?id=MST-001' + (arama || ''),
    runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  for (const d of DOSYALAR) w.eval(fs.readFileSync(path.join(KOK, 'assets', 'js', d), 'utf8'));
  return w;
}

function kayitlar(n, onek) {
  return Array.from({ length: n }, (_, i) => ({
    id: onek + '-' + String(i + 1).padStart(4, '0'),
    ad: onek + ' ' + (i + 1)
  }));
}

const KOLONLAR = [{ k: 'id', ad: 'Kod' }, { k: 'ad', ad: 'Ad' }];

/** İki alt koleksiyonlu bir detay ekranı kurar. */
function detay(w, ekA, ekB) {
  const a = w.gvList(Object.assign({
    kaynak: 'detay:a', onek: 'a_', filtresiz: true, ad: 'A listesi',
    veri: () => kayitlar(25, 'A'),
    tablo: { hedef: '#tabloA', kolonlar: KOLONLAR, satirId: k => k.id },
    pager: { hedef: '#pagerA', boyut: 10 }
  }, ekA || {}));
  const b = w.gvList(Object.assign({
    kaynak: 'detay:b', onek: 'b_', filtresiz: true, ad: 'B listesi',
    veri: () => kayitlar(37, 'B'),
    tablo: { hedef: '#tabloB', kolonlar: KOLONLAR, satirId: k => k.id },
    pager: { hedef: '#pagerB', boyut: 10 }
  }, ekB || {}));
  return { a, b };
}

const bekle = () => new Promise(r => setTimeout(r, 0));

/* ================= önek yalıtımı ================= */

test('iki alt liste kendi URL anahtarlarını yazar; birbirini ezmez', async () => {
  const w = sayfa();
  const { a, b } = detay(w);
  await bekle();

  a.pager.sayfaya(3); a.sirala('ad', 'desc');
  await bekle();
  b.sirala('id', 'asc');
  await bekle();

  const u = new w.URLSearchParams(w.location.search);
  /* her iki listenin sıralaması da URL'de, ayrı anahtarlarda */
  assert.strictEqual(u.get('a_sort'), 'ad:desc');
  assert.strictEqual(u.get('b_sort'), 'id:asc');
  /* öneksiz anahtar hiç yazılmadı — tek bir küresel `sort` yok */
  assert.strictEqual(u.get('sort'), null);
  /* detay route'unun kendi parametresi korundu */
  assert.strictEqual(u.get('id'), 'MST-001');
});

test('bir listenin sayfası değişince diğerinin sayfası bozulmaz', async () => {
  const w = sayfa('&a_page=2&b_page=3');
  const { a, b } = detay(w);
  await bekle();

  assert.strictEqual(a.sonuc().pagination.currentPage, 2);
  assert.strictEqual(b.sonuc().pagination.currentPage, 3);

  /* A'nın pager'ından 1. sayfaya dön */
  w.document.querySelector('#pagerA [data-git="1"]').click();
  await bekle();

  const u = new w.URLSearchParams(w.location.search);
  assert.strictEqual(u.get('a_page'), null);       /* 1. sayfa URL'ye yazılmaz */
  assert.strictEqual(u.get('b_page'), '3');        /* B dokunulmadan kaldı */
  assert.strictEqual(b.sonuc().pagination.currentPage, 3);
});

test('her alt liste kendi sayfa dilimini çizer', async () => {
  const w = sayfa('&a_page=3');
  const { a, b } = detay(w);
  await bekle();

  const satirA = w.document.querySelectorAll('#tabloA tbody tr');
  const satirB = w.document.querySelectorAll('#tabloB tbody tr');
  assert.strictEqual(satirA.length, 5);            /* 25 kayıt, 3. sayfa → 5 */
  assert.strictEqual(satirB.length, 10);
  assert.match(satirA[0].textContent, /A 21/);
  assert.match(satirB[0].textContent, /B 1\b/);
  assert.strictEqual(a.sonuc().pagination.totalRecords, 25);
  assert.strictEqual(b.sonuc().pagination.totalRecords, 37);
});

test('geçersiz sayfa numarası kelepçelenir, komşu liste etkilenmez', async () => {
  const w = sayfa('&a_page=999&b_page=2');
  const { a, b } = detay(w);
  await bekle();
  assert.strictEqual(a.sonuc().pagination.currentPage, 3);   /* 25/10 → 3 sayfa */
  assert.strictEqual(b.sonuc().pagination.currentPage, 2);
  const u = new w.URLSearchParams(w.location.search);
  assert.strictEqual(u.get('a_page'), '3');
  assert.strictEqual(u.get('b_page'), '2');
});

test('alt listenin varsayılan boyutu URL\'ye pageSize yazmaz', async () => {
  const w = sayfa();
  detay(w);
  await bekle();
  const u = new w.URLSearchParams(w.location.search);
  assert.strictEqual(u.get('a_pageSize'), null);
  assert.strictEqual(u.get('b_pageSize'), null);
  assert.strictEqual(u.get('pageSize'), null);
});

/* ================= filtresiz mod ================= */

test('filtresiz alt liste gvFilter kurmaz; sayfada arama kutusu aramaz', async () => {
  const w = sayfa();
  const { a } = detay(w);
  await bekle();
  assert.strictEqual(a.filtre, null);
  /* gvFilter kurulmadığı için sayfa geneli `q` anahtarı hiç doğmaz */
  assert.strictEqual(new w.URLSearchParams(w.location.search).get('q'), null);
});

test('boş alt koleksiyon kendi boş ekranını basar', async () => {
  const w = sayfa();
  w.gvList({
    kaynak: 'detay:bos', onek: 'z_', filtresiz: true,
    veri: () => [],
    bosDurum: { ikon: 'fa-tags', baslik: 'Marka tanımlı değil', metin: 'Kayıt yok.' },
    tablo: { hedef: '#tabloA', kolonlar: KOLONLAR },
    pager: { hedef: '#pagerA', boyut: 10 }
  });
  await bekle();
  const k = w.document.querySelector('#tabloA');
  assert.match(k.innerHTML, /gv-empty/);
  assert.match(k.textContent, /Marka tanımlı değil/);
  assert.strictEqual(w.document.querySelector('#pagerA').hidden, true);
});

/* ================= öneksiz liste sözleşmesi ================= */

test('önek verilmeyen liste eski URL anahtarlarını kullanır', async () => {
  const w = sayfa();
  const lc = w.gvList({
    kaynak: 'detay:eski', filtresiz: true,
    veri: () => kayitlar(30, 'E'),
    tablo: { hedef: '#tabloB', kolonlar: KOLONLAR },
    pager: { hedef: '#pagerB', boyut: 20 }
  });
  await bekle();
  lc.pager.sayfaya(2);
  lc.sirala('ad', 'asc');
  await bekle();
  const u = new w.URLSearchParams(w.location.search);
  assert.strictEqual(u.get('sort'), 'ad:asc');
  assert.strictEqual(u.get('a_sort'), null);
});
