/* ListController DOM'a dokunduğu için bu dosya jsdom kullanır.
   jsdom yoksa testler skip edilir — uydurma sonuç üretilmez. */
const { test, skip } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { KOK } = require('./yukleyici.js');

const jsdomYolu = require('../jsdom-yolu.js');
const JSDOMMod = jsdomYolu.yukle();

if (!JSDOMMod) {
  skip('jsdom bulunamadı — ListController testleri atlandı');
  return;
}
const { JSDOM } = JSDOMMod;

const ISKELET = `<!doctype html><html lang="tr"><body>
  <input id="gvSearch" type="search">
  <div id="gvChips"></div>
  <div id="gvAchips" hidden></div>
  <div id="tablo"></div>
  <div id="pager"></div>
</body></html>`;

const DOSYALAR = ['types.js', 'data-provider.js', 'components.js', 'filters.js', 'app.js', 'list-controller.js'];

/** @returns {{w:Window, veri:Array}} */
function sayfa(arama) {
  const dom = new JSDOM(ISKELET, {
    url: 'https://x/liste.html' + (arama || ''),
    runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  for (const d of DOSYALAR) {
    w.eval(fs.readFileSync(path.join(KOK, 'assets', 'js', d), 'utf8'));
  }
  return w;
}

function kayitlar(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: 'K-' + String(i + 1).padStart(4, '0'),
    ad: 'Kayıt ' + (i + 1),
    durum: i % 3 === 0 ? 'aktif' : 'pasif',
    fiyat: (i + 1) * 100
  }));
}

const KOLONLAR = [{ k: 'id', ad: 'Kod' }, { k: 'ad', ad: 'Ad' }, { k: 'durum', ad: 'Durum' }];

function kur(w, ek) {
  const veri = kayitlar(59);
  const lc = w.gvList(Object.assign({
    kaynak: 'test',
    veri: () => veri,
    arama: ['id', 'ad'],
    cipler: { alan: 'durum', secenekler: [{ k: 'aktif', ad: 'Aktif' }, { k: 'pasif', ad: 'Pasif' }] },
    alanlar: [{ k: 'fiyat', ad: 'Fiyat', tur: 'aralik' }],
    tablo: { hedef: '#tablo', kolonlar: KOLONLAR, satirId: k => k.id },
    pager: { hedef: '#pager', boyut: 20 }
  }, ek || {}));
  return { lc, veri };
}

/* Promise zincirinin çözülmesini bekler (list() Promise.resolve döner). */
const bekle = () => new Promise(r => setTimeout(r, 0));

test('ilk yükleme: 59 kayıt, 20/sayfa → ilk sayfada 20 satır', async () => {
  const w = sayfa();
  const { lc } = kur(w);
  await bekle();
  assert.strictEqual(lc.sonuc().pagination.totalRecords, 59);
  assert.strictEqual(lc.sonuc().pagination.totalPages, 3);
  assert.strictEqual(w.document.querySelectorAll('#tablo tbody tr').length, 20);
});

test('URL page=3 ile açılış son sayfayı (19 kayıt) getirir', async () => {
  const w = sayfa('?page=3');
  const { lc } = kur(w);
  await bekle();
  assert.strictEqual(lc.sonuc().pagination.currentPage, 3);
  assert.strictEqual(w.document.querySelectorAll('#tablo tbody tr').length, 19);
});

test('URL pageSize=10 okunur ve normalize edilir', async () => {
  const w = sayfa('?pageSize=10');
  const { lc } = kur(w);
  await bekle();
  assert.strictEqual(lc.sonuc().pagination.pageSize, 10);
  const w2 = sayfa('?pageSize=100000');
  const r2 = kur(w2);
  await bekle();
  assert.strictEqual(r2.lc.sonuc().pagination.pageSize, 50);
});

test('geçersiz page kelepçelenir ve URL düzeltilir', async () => {
  const w = sayfa('?page=99');
  const { lc } = kur(w);
  await bekle();
  assert.strictEqual(lc.sonuc().pagination.currentPage, 3);
  assert.strictEqual(new w.URLSearchParams(w.location.search).get('page'), '3');
});

test('page=1 URL\'ye yazılmaz (temiz bağlantı)', async () => {
  const w = sayfa('?page=2');
  const { lc } = kur(w);
  await bekle();
  lc.filtre.durum.arama = '';
  lc.yenile(true);
  await bekle();
  assert.strictEqual(new w.URLSearchParams(w.location.search).get('page'), null);
});

test('arama değişince page=1 olur ve q URL\'ye yazılır', async () => {
  const w = sayfa('?page=3');
  const { lc } = kur(w);
  await bekle();
  assert.strictEqual(lc.sonuc().pagination.currentPage, 3);

  lc.filtre.durum.arama = 'Kayıt 1';
  lc.filtre.uygula();
  await bekle();
  assert.strictEqual(lc.sonuc().pagination.currentPage, 1);
  assert.strictEqual(new w.URLSearchParams(w.location.search).get('q'), 'Kayıt 1');
});

test('hızlı durum çipi süzer; sonuç sağlayıcıdan gelir', async () => {
  const w = sayfa();
  const { lc } = kur(w);
  await bekle();
  lc.filtre.durum.cip = 'aktif';
  lc.filtre.uygula();
  await bekle();
  assert.strictEqual(lc.sonuc().pagination.totalRecords, 20);
  assert.ok(lc.sonuc().data.every(k => k.durum === 'aktif'));
});

test('filtre sonucu boşsa "filtreleri temizle" aksiyonlu ekran çıkar', async () => {
  const w = sayfa();
  const { lc } = kur(w);
  await bekle();
  lc.filtre.durum.arama = 'hicbirseyeuymaz';
  lc.filtre.uygula();
  await bekle();
  assert.strictEqual(lc.sonuc().pagination.totalRecords, 0);
  assert.ok(w.document.querySelector('[data-gv-filtre-temizle]'), 'temizle butonu yok');
});

test('gerçek boş listede filtre aksiyonu değil modül boş ekranı gösterilir', async () => {
  const w = sayfa();
  w.gvList({
    kaynak: 'bos', veri: () => [], arama: ['ad'],
    tablo: { hedef: '#tablo', kolonlar: KOLONLAR },
    pager: { hedef: '#pager', boyut: 20 },
    bosDurum: { baslik: 'Henüz hizmet yok', metin: 'İlk kaydı oluşturun.' }
  });
  await bekle();
  assert.strictEqual(w.document.querySelector('[data-gv-filtre-temizle]'), null);
  assert.ok(w.document.querySelector('#tablo').textContent.includes('Henüz hizmet yok'));
});

test('aralık filtresi fr_ parametresiyle URL\'ye yazılır ve geri okunur', async () => {
  const w = sayfa();
  const { lc } = kur(w);
  await bekle();
  lc.filtre.durum.gelismis.fiyat = { min: 5000, max: '' };
  lc.filtre.uygula();
  await bekle();
  assert.strictEqual(new w.URLSearchParams(w.location.search).get('fr_fiyat'), 'min:5000');
  assert.strictEqual(lc.sonuc().pagination.totalRecords, 10);

  const w2 = sayfa('?fr_fiyat=min:5000');
  const r2 = kur(w2);
  await bekle();
  assert.strictEqual(r2.lc.sonuc().pagination.totalRecords, 10);
});

test('sirala() page=1 yapar ve sort URL\'ye yazılır', async () => {
  const w = sayfa('?page=2');
  const { lc } = kur(w);
  await bekle();
  lc.sirala('ad', 'desc');
  await bekle();
  assert.strictEqual(lc.sonuc().pagination.currentPage, 1);
  assert.strictEqual(new w.URLSearchParams(w.location.search).get('sort'), 'ad:desc');
});

test('temizle() bütün filtreleri ve çip görselini sıfırlar', async () => {
  const w = sayfa();
  const { lc } = kur(w);
  await bekle();
  lc.filtre.durum.cip = 'aktif';
  lc.filtre.durum.arama = 'Kayıt';
  lc.filtre.uygula();
  await bekle();
  lc.temizle();
  await bekle();
  assert.strictEqual(lc.sonuc().pagination.totalRecords, 59);
  const acik = [...w.document.querySelectorAll('#gvChips .chip')].filter(c => c.classList.contains('is-on'));
  assert.strictEqual(acik.length, 1);
  assert.strictEqual(acik[0].getAttribute('data-cip'), 'tumu');
});

test('ilk yüklemede iskelet basılır, sonuç gelince tabloya döner', async () => {
  const w = sayfa();
  kur(w);
  assert.ok(w.document.querySelector('#tablo .gv-skel'), 'iskelet basılmadı');
  await bekle();
  assert.strictEqual(w.document.querySelector('#tablo .gv-skel'), null);
  assert.ok(w.document.querySelector('#tablo table'));
});

test('sayfa scriptine await sızmaz — gvList senkron döner', () => {
  const w = sayfa();
  const { lc } = kur(w);
  assert.strictEqual(typeof lc.yenile, 'function');
  assert.ok(!(lc instanceof w.Promise));
});

/* ---- GV.qYaz / GV.qCok URL yazım sözleşmesi ---- */

test('qYaz varsayılanı replaceState — geçmiş kirlenmez', () => {
  const w = sayfa();
  const uz = w.history.length;
  w.GV.qYaz('q', 'forklift');
  w.GV.qYaz('durum', 'aktif');
  assert.strictEqual(w.history.length, uz);
  assert.strictEqual(new w.URLSearchParams(w.location.search).get('q'), 'forklift');
});

test('qYaz push seçeneği yalnız açıkça istendiğinde pushState yapar', () => {
  const w = sayfa();
  const uz = w.history.length;
  w.GV.qYaz('page', '2', { push: true });
  assert.strictEqual(w.history.length, uz + 1);
});

test('qCok birden çok parametreyi tek geçmiş girdisiyle yazar', () => {
  const w = sayfa();
  const uz = w.history.length;
  w.GV.qCok({ page: 4, pageSize: 50, sort: 'ad:desc' }, { push: true });
  assert.strictEqual(w.history.length, uz + 1);
  const u = new w.URLSearchParams(w.location.search);
  assert.strictEqual(u.get('page'), '4');
  assert.strictEqual(u.get('pageSize'), '50');
  assert.strictEqual(u.get('sort'), 'ad:desc');
});

test('qCok null/boş değerleri parametreyi siler', () => {
  const w = sayfa('?page=4&sort=ad:desc');
  w.GV.qCok({ page: null, sort: '' });
  const u = new w.URLSearchParams(w.location.search);
  assert.strictEqual(u.get('page'), null);
  assert.strictEqual(u.get('sort'), null);
});

test('URL değişmiyorsa yeni geçmiş girdisi açılmaz', () => {
  const w = sayfa('?page=2');
  const uz = w.history.length;
  w.GV.qYaz('page', '2', { push: true });
  assert.strictEqual(w.history.length, uz);
});
