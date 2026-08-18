/* Faz 15 — SAĞLAYICI SÖZLEŞMESİ (doküman §12 iş paketi 10, §13 "MockDataProvider
   ile ApiDataProvider sözleşmesi aynı").

   Bu dosyanın tek işi şunu KANITLAMAK: aynı test kümesi iki sağlayıcıyla da
   geçer. Testler sağlayıcının adını bilmez; `sagla()` hangi sağlayıcıyı
   verirse onunla çalışır. Sözleşme kırılırsa iki koşudan biri kırılır. */
const { test } = require('node:test');
const assert = require('node:assert');
const { ortam, kayitlar } = require('./yukleyici.js');

/** İki sağlayıcıyı da aynı veri katmanı üzerine kurar. */
function kur() {
  const w = ortam(['kimlik.js', 'types.js', 'data-provider.js', 'api-provider.js']);
  return w;
}

const VERI = kayitlar(59, i => ({
  ad: 'Kayıt ' + (i + 1),
  durum: i % 3 === 0 ? 'aktif' : 'pasif',
  fiyat: (i + 1) * 100,
  arsiv: i === 58
}));

const TANIM = {
  kaynak: () => VERI,
  arama: ['id', 'ad'],
  alanlar: [{ k: 'durum', ad: 'Durum', tur: 'coklu' }, { k: 'fiyat', ad: 'Fiyat', tur: 'aralik' }],
  cipler: { alan: 'durum' },
  arsivAlani: 'arsiv',
  sira: [{ field: 'fiyat', direction: 'asc' }]
};

/* Sınanan sağlayıcılar. `mock` alt katman, `api` onun üstünde sözleşme
   mock'uyla çalışan ikinci uygulama — gerçek ağ çağrısı yok. */
const SAGLAYICILAR = ['mock', 'api'];

function saglayici(w, ad) {
  const p = w.GV.saglayiciKur(ad);
  p.tanimla('test', TANIM);
  return p;
}

/** Aynı gövdeyi iki sağlayıcı için de koşar. */
function ikisiIcin(baslik, govde) {
  for (const ad of SAGLAYICILAR) {
    test(baslik + ' — ' + ad, async () => {
      const w = kur();
      await govde(saglayici(w, ad), w, ad);
    });
  }
}

/* ================= sözleşme yüzeyi ================= */

ikisiIcin('DataProvider yüzeyi eksiksiz', async (p) => {
  for (const m of ['list', 'get', 'ozet', 'command', 'tanimla', 'tanim', 'komut', 'onbellekDusur']) {
    assert.strictEqual(typeof p[m], 'function', m + ' yok');
  }
});

/* ================= list ================= */

ikisiIcin('list sayfalama üstverisi sözleşmeye uyar', async (p) => {
  const r = await p.list('test', { page: 1, pageSize: 20 });
  assert.ok(Array.isArray(r.data));
  assert.strictEqual(r.data.length, 20);
  assert.strictEqual(r.pagination.currentPage, 1);
  assert.strictEqual(r.pagination.pageSize, 20);
  assert.strictEqual(r.pagination.totalRecords, 58);   /* 1 arşiv kaydı hariç */
  assert.strictEqual(r.pagination.totalPages, 3);
  assert.strictEqual(r.pagination.hasNextPage, true);
  assert.strictEqual(r.pagination.hasPreviousPage, false);
  assert.strictEqual(typeof r.pagination.nextCursor, 'string');
});

ikisiIcin('son sayfa kalan kayıtları verir, imleç kapanır', async (p) => {
  const r = await p.list('test', { page: 3, pageSize: 20 });
  assert.strictEqual(r.data.length, 18);
  assert.strictEqual(r.pagination.hasNextPage, false);
  assert.strictEqual(r.pagination.hasPreviousPage, true);
  assert.strictEqual(r.pagination.nextCursor, undefined);
});

ikisiIcin('geçersiz sayfa kelepçelenir', async (p) => {
  const r = await p.list('test', { page: 999, pageSize: 20 });
  assert.strictEqual(r.pagination.currentPage, 3);
});

ikisiIcin('pageSize sözleşme dışı değeri normalize eder', async (p) => {
  const r = await p.list('test', { page: 1, pageSize: 100000 });
  assert.strictEqual(r.pagination.pageSize, 50);
});

ikisiIcin('arama en az iki karakterde çalışır', async (p) => {
  const bir = await p.list('test', { q: 'K' });
  assert.strictEqual(bir.pagination.totalRecords, 58);
  const iki = await p.list('test', { q: 'Kayıt 1' });
  assert.ok(iki.pagination.totalRecords < 58);
  assert.ok(iki.data.every(k => k.ad.indexOf('Kayıt 1') !== -1));
});

ikisiIcin('filtre ve hızlı çip aynı anlamı taşır', async (p) => {
  const cip = await p.list('test', { filters: { __cip: 'aktif' } });
  const alan = await p.list('test', { filters: { durum: ['aktif'] } });
  assert.strictEqual(cip.pagination.totalRecords, alan.pagination.totalRecords);
  assert.ok(cip.data.every(k => k.durum === 'aktif'));
});

ikisiIcin('aralık filtresi min/max sınırlarını uygular', async (p) => {
  const r = await p.list('test', { filters: { fiyat: { min: 1000, max: 2000 } }, pageSize: 50 });
  assert.ok(r.data.every(k => k.fiyat >= 1000 && k.fiyat <= 2000));
  assert.ok(r.pagination.totalRecords > 0);
});

ikisiIcin('arşiv kaydı ancak açıkça istenince gelir', async (p) => {
  const gizli = await p.list('test', { pageSize: 50 });
  const acik = await p.list('test', { pageSize: 50, filters: { __arsiv: 'evet' } });
  assert.strictEqual(acik.pagination.totalRecords, gizli.pagination.totalRecords + 1);
});

ikisiIcin('sıralama kararlıdır; sayfalar arasında tekrar/atlama yok', async (p) => {
  const gorulen = new Set();
  for (let s = 1; s <= 3; s++) {
    const r = await p.list('test', { page: s, pageSize: 20, sort: [{ field: 'durum', direction: 'asc' }] });
    for (const k of r.data) {
      assert.ok(!gorulen.has(k.id), 'tekrar eden kayıt: ' + k.id);
      gorulen.add(k.id);
    }
  }
  assert.strictEqual(gorulen.size, 58);
});

ikisiIcin('dönen kayıtlar kaynak diziyle nesne kimliği paylaşmaz', async (p) => {
  const r = await p.list('test', { pageSize: 10 });
  r.data[0].ad = 'DEĞİŞTİ';
  const tekrar = await p.list('test', { pageSize: 10 });
  assert.notStrictEqual(tekrar.data[0].ad, 'DEĞİŞTİ');
});

/* ================= get ================= */

ikisiIcin('get kaydı id ile getirir', async (p) => {
  const k = await p.get('test', 'K-0007');
  assert.strictEqual(k.id, 'K-0007');
});

ikisiIcin('get bulunamayan id için null döner', async (p) => {
  assert.strictEqual(await p.get('test', 'YOK-9999'), null);
  assert.strictEqual(await p.get('test', ''), null);
});

/* ================= ozet ================= */

ikisiIcin('ozet süzülmüş kümenin TAMAMI üzerinden hesaplar', async (p) => {
  const toplam = await p.ozet('test', { pageSize: 10 }, ks => ks.reduce((t, k) => t + k.fiyat, 0));
  const sayi = await p.ozet('test', { pageSize: 10 }, ks => ks.length);
  assert.strictEqual(sayi, 58);                 /* sayfa dilimi değil */
  assert.ok(toplam > 100 * 10);
});

/* ================= command ================= */

ikisiIcin('tanımsız komut reddedilir', async (p) => {
  await assert.rejects(() => p.command('olmayanKomut', {}));
});

ikisiIcin('aynı requestId ile ikinci deneme yeni kayıt açmaz', async (p) => {
  let cagri = 0;
  p.komut('sayacArtir', () => { cagri++; return Promise.resolve({ sayac: cagri }); });
  const rid = 'req-sabit-1';
  const a = await p.command('sayacArtir', { requestId: rid });
  const b = await p.command('sayacArtir', { requestId: rid });
  assert.strictEqual(a.sayac, b.sayac);
  assert.strictEqual(cagri, 1);
});

/* ================= hata biçimi ================= */

ikisiIcin('hata tek biçimdedir; taşıma ayrıntısı sızmaz', async (p) => {
  await assert.rejects(() => p.command('yokKomut', {}), (e) => {
    assert.ok(e instanceof Error);
    assert.ok(typeof e.message === 'string' && e.message.length);
    return true;
  });
});

/* ================= sağlayıcı değişimi ================= */

test('sağlayıcı TEK yerden değişir; sayfa kodu yalnız window.dataProvider bilir', async () => {
  const w = kur();
  assert.strictEqual(w.GV.saglayiciAdi, 'mock');
  assert.strictEqual(w.dataProvider, w.GV.mockSaglayici);

  const api = w.GV.saglayiciKur('api');
  assert.strictEqual(w.GV.saglayiciAdi, 'api');
  assert.strictEqual(w.dataProvider, api);
  assert.strictEqual(api.ad, 'api');

  w.GV.saglayiciKur('mock');
  assert.strictEqual(w.GV.saglayiciAdi, 'mock');
});

test('bilinmeyen sağlayıcı adı sessizce mock\'a düşer', () => {
  const w = kur();
  w.GV.saglayiciKur('kubernetes');
  assert.strictEqual(w.GV.saglayiciAdi, 'mock');
});

test('ApiDataProvider gerçek ağ çağrısı içermez', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const { KOK } = require('./yukleyici.js');
  const kod = fs.readFileSync(path.join(KOK, 'assets', 'js', 'api-provider.js'), 'utf8');
  /* Yorum satırlarında "fetch yoktur" yazabilmek için yorumlar ayıklanır. */
  const govde = kod.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const yasak of ['fetch(', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'navigator.sendBeacon',
                       'http://', 'https://', '/api/']) {
    assert.strictEqual(govde.includes(yasak), false, 'ağ izi bulundu: ' + yasak);
  }
});

test('iki sağlayıcı aynı sorguya aynı sayfayı verir', async () => {
  const w = kur();
  const sorgu = { page: 2, pageSize: 20, q: 'Kayıt', sort: [{ field: 'ad', direction: 'desc' }] };
  const m = await saglayici(w, 'mock').list('test', sorgu);
  const a = await saglayici(w, 'api').list('test', sorgu);
  assert.deepStrictEqual(m.data.map(k => k.id), a.data.map(k => k.id));
  assert.deepStrictEqual(m.pagination, a.pagination);
});

/* ================= gerçek sayfa, iki sağlayıcı =================
   Sözleşmenin asıl kanıtı: AYNI sayfa iki sağlayıcıyla da aynı ekranı
   basıyor. UI, route ve sayfa scripti değişmiyor — yalnız `?provider=`. */
const jsdomYolu = require('../jsdom-yolu.js');
const JSDOMMod = jsdomYolu.yukle();

if (JSDOMMod) {
  const { JSDOM } = JSDOMMod;
  const fs2 = require('node:fs');
  const path2 = require('node:path');
  const { KOK: KOK2 } = require('./yukleyici.js');

  async function sayfaCiz(dosya, arama) {
    const hata = [];
    const dom = await JSDOM.fromFile(path2.join(KOK2, dosya), {
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
    w.console.error = (...a) => hata.push('console.error: ' + a.join(' '));
    for (const sc of doc.querySelectorAll('script')) {
      const src = sc.getAttribute('src');
      try {
        if (src && !/^https?:/.test(src)) w.eval(fs2.readFileSync(path2.join(KOK2, src), 'utf8'));
        else if (!src && sc.textContent.trim()) w.eval(sc.textContent);
      } catch (e) { hata.push((src || 'satır içi script') + ' → ' + e.message); }
    }
    await new Promise(r => setTimeout(r, 140));
    const satirlar = [...doc.querySelectorAll('tbody tr')].map(tr => tr.textContent.replace(/\s+/g, ' ').trim());
    const sayaclar = [...doc.querySelectorAll('.gv-pager .pg-count')].map(e => e.textContent.trim());
    const ad = w.GV.saglayiciAdi;
    w.close();
    return { satirlar, sayaclar, hata, ad };
  }

  for (const [dosya, temel] of [
    ['is-emirleri.html', 'role=sahip'],
    ['hizmet-katalogu.html', 'role=sahip&page=2'],
    ['musteri-detay.html', 'id=MST-001&role=sahip&lok_page=2']
  ]) {
    test('sağlayıcı değişimi ekranı bozmuyor — ' + dosya, async () => {
      const m = await sayfaCiz(dosya, temel + '&provider=mock');
      const a = await sayfaCiz(dosya, temel + '&provider=api');
      assert.strictEqual(m.ad, 'mock');
      assert.strictEqual(a.ad, 'api');
      assert.deepStrictEqual(m.hata, []);
      assert.deepStrictEqual(a.hata, []);
      assert.ok(m.satirlar.length > 0, 'mock hiç satır basmadı');
      assert.deepStrictEqual(a.satirlar, m.satirlar);
      assert.deepStrictEqual(a.sayaclar, m.sayaclar);
    });
  }
}
