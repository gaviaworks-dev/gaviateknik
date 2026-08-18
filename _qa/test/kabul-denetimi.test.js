/* Faz 15 — KABUL KONTROL LİSTESİ BOŞLUKLARI (doküman §13)
   Kontrol listesi maddelerinin çoğu Faz 12–14 test dosyalarında kapalı.
   Bu dosya yalnız KAPALI OLMAYAN maddeleri kapatır:
     · aktif konum tutarlılığı (rail · menü · breadcrumb aynı route)
     · geri/ileri ve yenileme aynı liste durumunu kuruyor
     · ekleme/silme sonrası sayfa numarası kelepçeleniyor
     · focus-visible hiçbir yerde kaldırılmamış
     · reduced-motion destekleniyor
     · boş / yükleniyor / hata durumları canlı bölge seviyesinde */
const { test, skip } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { KOK } = require('./yukleyici.js');

const JSDOMMod = require('../jsdom-yolu.js').yukle();
if (!JSDOMMod) { skip('jsdom bulunamadı — kabul denetimi testleri atlandı'); return; }
const { JSDOM } = JSDOMMod;

const CSS = f => fs.readFileSync(path.join(KOK, 'assets', 'css', f), 'utf8');

async function sayfa(dosya, arama) {
  const dom = await JSDOM.fromFile(path.join(KOK, dosya), {
    runScripts: 'outside-only', pretendToBeVisual: true,
    url: 'http://localhost/' + dosya + (arama ? '?' + arama : '')
  });
  const w = dom.window, doc = w.document;
  w.requestAnimationFrame = cb => setTimeout(cb, 0);
  if (!w.matchMedia) w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.HTMLCanvasElement.prototype.getContext = () => ({
    scale() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, clearRect() {},
    set lineWidth(v) {}, set lineCap(v) {}, set lineJoin(v) {}, set strokeStyle(v) {}
  });
  for (const sc of doc.querySelectorAll('script')) {
    const src = sc.getAttribute('src');
    try {
      if (src && !/^https?:/.test(src)) w.eval(fs.readFileSync(path.join(KOK, src), 'utf8'));
      else if (!src && sc.textContent.trim()) w.eval(sc.textContent);
    } catch (e) { if (!/Not implemented/.test(String(e))) throw e; }
  }
  await new Promise(r => setTimeout(r, 120));
  return { w, doc, kapat: () => w.close() };
}

/* ============ menü ve navigasyon: aktif konum ============ */

test('aktif ana modül, alt menü ve breadcrumb aynı konumu gösteriyor', async () => {
  for (const [dosya, sec, ekran] of [
    ['is-emirleri.html', 'operasyon', 'is-emirleri'],
    ['teknik-raporlar.html', 'teknik', 'teknik-raporlar'],
    ['faturalar.html', 'ticari', 'faturalar'],
    /* detay sayfası liste ekranının screen'ini MİRASLAR */
    ['is-emri-detay.html', 'operasyon', 'is-emirleri']
  ]) {
    const { w, doc, kapat } = await sayfa(dosya, 'role=sahip&id=IE-2026-0011');
    try {
      assert.strictEqual(doc.body.getAttribute('data-sec'), sec, dosya + ' data-sec');
      assert.strictEqual(doc.body.getAttribute('data-screen'), ekran, dosya + ' data-screen');

      const railAktif = [...doc.querySelectorAll('.gv-rail-ico.is-active')];
      assert.strictEqual(railAktif.length, 1, dosya + ': tek aktif rail kalemi olmalı');
      assert.strictEqual(railAktif[0].getAttribute('aria-current'), 'page', dosya + ': rail aria-current yok');

      const menuAktif = [...doc.querySelectorAll('.gv-mlink.is-active')];
      assert.strictEqual(menuAktif.length, 1, dosya + ': tek aktif menü kalemi olmalı');
      assert.strictEqual(menuAktif[0].getAttribute('aria-current'), 'page', dosya + ': aria-current yok');
      assert.ok((menuAktif[0].getAttribute('href') || '').indexOf(ekran + '.html') === 0,
        dosya + ': menü kalemi ekranla eşleşmiyor → ' + menuAktif[0].getAttribute('href'));
      /* rail'in işaretlediği modül gerçekten sayfanın modülü mü */
      const railHref = (railAktif[0].getAttribute('href') || '').split('?')[0];
      assert.strictEqual(w.GV.route(railHref).modul.key, sec, dosya + ': rail başka modülü işaretliyor');

      const kirinti = doc.querySelector('.gv-crumbs');
      assert.ok(kirinti && kirinti.textContent.trim().length, dosya + ': breadcrumb boş');
      assert.ok(kirinti.textContent.indexOf(menuAktif[0].textContent.trim()) !== -1,
        dosya + ': breadcrumb aktif menü kalemini göstermiyor');
    } finally { kapat(); }
  }
});

/* ============ sayfalandırma: yenileme ve geri/ileri ============ */

test('yenileme aynı liste durumunu kuruyor (durum tamamen URL\'de)', async () => {
  const a = await sayfa('hizmet-katalogu.html', 'role=sahip&page=2&pageSize=10&sort=ad:desc');
  const b = await sayfa('hizmet-katalogu.html', 'role=sahip&page=2&pageSize=10&sort=ad:desc');
  try {
    const satir = w => [...w.document.querySelectorAll('tbody tr')].map(t => t.getAttribute('data-id'));
    assert.deepStrictEqual(satir(b.w), satir(a.w));
    assert.ok(satir(a.w).length > 0, 'liste boş geldi');
    const sayac = w => (w.document.querySelector('.gv-pager .pg-count') || {}).textContent;
    assert.strictEqual(sayac(b.w), sayac(a.w));
  } finally { a.kapat(); b.kapat(); }
});

test('sayfa değişimi geçmişe girdi bırakır; önceki adres önceki sayfayı kurar', async () => {
  const { w, doc, kapat } = await sayfa('hizmet-katalogu.html', 'role=sahip');
  try {
    const oncekiUzunluk = w.history.length;
    doc.querySelector('.gv-pager [data-git="2"]').click();
    await new Promise(r => setTimeout(r, 60));
    assert.strictEqual(new w.URLSearchParams(w.location.search).get('page'), '2');
    assert.ok(w.history.length > oncekiUzunluk, 'sayfa değişimi pushState yapmadı');
  } finally { kapat(); }

  /* geri gidilen adres yeniden yüklendiğinde 1. sayfa kurulur */
  const geri = await sayfa('hizmet-katalogu.html', 'role=sahip');
  try {
    const ilk = [...geri.doc.querySelectorAll('tbody tr')].map(t => t.getAttribute('data-id'));
    assert.ok(ilk.length > 0);
    assert.match(geri.doc.querySelector('.gv-pager .pg-count').textContent, /^1–/);
  } finally { geri.kapat(); }
});

test('ekleme ve silme sonrası sayfa numarası kelepçeleniyor', async () => {
  const { ortam, kayitlar } = require('./yukleyici.js');
  const w = ortam(['kimlik.js', 'types.js', 'data-provider.js']);
  const veri = kayitlar(21, i => ({ ad: 'K' + i }));
  w.dataProvider.tanimla('test', { kaynak: () => veri, onbellek: false });

  /* 21 kayıt / 10 → 3 sayfa; 3. sayfada tek kayıt var */
  let r = await w.dataProvider.list('test', { page: 3, pageSize: 10 });
  assert.strictEqual(r.data.length, 1);

  /* son kayıt silinince 3. sayfa kalmaz → 2. sayfaya düşülür */
  veri.pop();
  r = await w.dataProvider.list('test', { page: 3, pageSize: 10 });
  assert.strictEqual(r.pagination.currentPage, 2);
  assert.strictEqual(r.pagination.totalPages, 2);

  /* kayıt eklenince yeni sayfa açılır ve istenen sayfa geri gelir */
  veri.push({ id: 'K-9999', ad: 'yeni' });
  r = await w.dataProvider.list('test', { page: 3, pageSize: 10 });
  assert.strictEqual(r.pagination.currentPage, 3);
  assert.strictEqual(r.data[0].id, 'K-9999');
});

/* ============ erişilebilirlik ============ */

test('görünür odak hiçbir yerde kaldırılmamış', () => {
  const c = CSS('gavia-ui.css') + '\n' + CSS('components.css') + '\n' + CSS('responsive.css');
  /* `outline: none` yalnız kendi :focus-visible kuralı olan öğelerde olabilir */
  assert.match(CSS('gavia-ui.css'), /:focus-visible\s*\{[^}]*outline:\s*2px/);
  /* `:focus-visible { outline: none }` biçiminde bir iptal YOK */
  assert.strictEqual(/:focus-visible[^{]*\{[^}]*outline:\s*(none|0)\b/.test(c), false,
    'focus-visible çerçevesi bir yerde kaldırılmış');
  /* genel `* { outline: none }` gibi toptan iptal YOK */
  assert.strictEqual(/(^|[\s,])\*\s*\{[^}]*outline:\s*(none|0)\b/.test(c), false);
});

test('prefers-reduced-motion destekleniyor ve geçişleri gerçekten kapatıyor', () => {
  const r = CSS('responsive.css');
  const i = r.indexOf('@media (prefers-reduced-motion: reduce)');
  assert.ok(i > 0, 'reduced-motion bloğu yok');
  const blok = r.slice(i, r.indexOf('}\n}', i) + 3);
  assert.match(blok, /animation[^:]*:\s*[^;]*(none|0)/);
  assert.match(blok, /transition[^:]*:\s*[^;]*none/);
});

test('boş, yükleniyor ve hata durumları canlı bölge seviyesinde', () => {
  const c = fs.readFileSync(path.join(KOK, 'assets', 'js', 'components.js'), 'utf8');
  /* boş durum bilgilendirmedir → status/polite */
  assert.match(c, /class="gv-empty" role="status" aria-live="polite"/);
  /* hata kesintidir → alert */
  assert.match(c, /class="gv-error" role="alert"/);
  /* kayıt aralığı sayfa değiştikçe duyurulur */
  assert.match(c, /class="pg-count" role="status" aria-live="polite"/);
  /* yükleniyor: liste kabı meşgul işareti taşır */
  const lc = fs.readFileSync(path.join(KOK, 'assets', 'js', 'list-controller.js'), 'utf8');
  assert.strictEqual((lc.match(/setAttribute\('aria-busy', 'true'\)/g) || []).length, 2,
    'hem ilk yükleme hem kısmi güncelleme aria-busy koymalı');
  assert.match(lc, /removeAttribute\('aria-busy'\)/);
});

test('yükleniyor ve boş durum gerçek listede de duyurulur', async () => {
  const { doc, kapat } = await sayfa('hizmet-katalogu.html', 'role=sahip&q=boyleBirKayitYok');
  try {
    const bos = doc.querySelector('.gv-empty');
    assert.ok(bos, 'boş ekran basılmadı');
    assert.strictEqual(bos.getAttribute('role'), 'status');
    assert.strictEqual(bos.getAttribute('aria-live'), 'polite');
    /* çizim bitince meşgul işareti kalkar */
    assert.strictEqual(doc.querySelector('#hkTablo, .gc-body.flush[id]').hasAttribute('aria-busy'), false);
  } finally { kapat(); }
});
