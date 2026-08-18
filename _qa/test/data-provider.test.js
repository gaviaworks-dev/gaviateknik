const { test } = require('node:test');
const assert = require('node:assert');
const { ortam, kayitlar } = require('./yukleyici.js');

function kur(ekOrtam) {
  const w = ortam(['kimlik.js', 'para-zaman.js', 'types.js', 'data-provider.js'],
    Object.assign({ crypto: require('node:crypto').webcrypto }, ekOrtam || {}));
  return { w, DP: w.dataProvider, GV: w.GV };
}

/* ============ doküman §7 "doğrulanacak özel senaryolar" ============ */

test('59 kayıtta 20/sayfa: 3 sayfa, son sayfa 19 kayıt', async () => {
  const { DP } = kur();
  const veri = kayitlar(59, i => ({ ad: 'Kayıt ' + i }));
  DP.tanimla('t', { kaynak: () => veri });

  const s1 = await DP.list('t', { page: 1, pageSize: 20 });
  assert.strictEqual(s1.pagination.totalRecords, 59);
  assert.strictEqual(s1.pagination.totalPages, 3);
  assert.strictEqual(s1.data.length, 20);
  assert.strictEqual(s1.pagination.hasNextPage, true);
  assert.strictEqual(s1.pagination.hasPreviousPage, false);

  const s3 = await DP.list('t', { page: 3, pageSize: 20 });
  assert.strictEqual(s3.data.length, 19);
  assert.strictEqual(s3.pagination.hasNextPage, false);
  assert.strictEqual(s3.pagination.hasPreviousPage, true);
  assert.strictEqual(s3.pagination.nextCursor, undefined);
});

test('0 kayıt: toplam 0, sayfa sayısı 1, ileri/geri kapalı', async () => {
  const { DP } = kur();
  DP.tanimla('t', { kaynak: () => [] });
  const s = await DP.list('t', {});
  assert.strictEqual(s.data.length, 0);
  assert.strictEqual(s.pagination.totalRecords, 0);
  assert.strictEqual(s.pagination.totalPages, 1);
  assert.strictEqual(s.pagination.hasNextPage, false);
  assert.strictEqual(s.pagination.hasPreviousPage, false);
});

test('1 kayıt: aralık doğru, sonraki sayfa yok', async () => {
  const { DP } = kur();
  DP.tanimla('t', { kaynak: () => kayitlar(1) });
  const s = await DP.list('t', { pageSize: 20 });
  assert.strictEqual(s.pagination.totalRecords, 1);
  assert.strictEqual(s.pagination.totalPages, 1);
  assert.strictEqual(s.pagination.hasNextPage, false);
});

test('filtre sonucu 2 kayıt: eski 2. sayfa aktif kalmaz, 1. sayfaya kelepçelenir', async () => {
  const { DP } = kur();
  const veri = kayitlar(59, i => ({ durum: i < 2 ? 'acik' : 'kapali' }));
  DP.tanimla('t', { kaynak: () => veri, alanlar: [{ k: 'durum', tur: 'coklu' }] });
  const s = await DP.list('t', { page: 2, pageSize: 20, filters: { durum: ['acik'] } });
  assert.strictEqual(s.pagination.totalRecords, 2);
  assert.strictEqual(s.pagination.currentPage, 1);
  assert.strictEqual(s.data.length, 2);
});

test('geçersiz page 1..totalPages arasına kelepçelenir', async () => {
  const { DP } = kur();
  DP.tanimla('t', { kaynak: () => kayitlar(25) });
  assert.strictEqual((await DP.list('t', { page: 99, pageSize: 20 })).pagination.currentPage, 2);
  assert.strictEqual((await DP.list('t', { page: 0, pageSize: 20 })).pagination.currentPage, 1);
});

test('aynı sıralama değerine sahip kayıtlar sayfalar arasında tekrarlanmaz (id tie-breaker)', async () => {
  const { DP } = kur();
  /* 40 kaydın tamamı aynı öncelik değerine sahip — yalnız id ayırır */
  const veri = kayitlar(40, () => ({ oncelik: 'yuksek' }));
  DP.tanimla('t', { kaynak: () => veri });
  const s1 = await DP.list('t', { page: 1, pageSize: 10, sort: 'oncelik:desc' });
  const s2 = await DP.list('t', { page: 2, pageSize: 10, sort: 'oncelik:desc' });
  const idler = s1.data.concat(s2.data).map(k => k.id);
  assert.strictEqual(new Set(idler).size, 20);
  assert.strictEqual(s1.data[0].id, 'K-0001');
  assert.strictEqual(s2.data[0].id, 'K-0011');
});

test('pageSize=100000 sorgusu adapter içinde normalize edilir', async () => {
  const { DP } = kur();
  DP.tanimla('t', { kaynak: () => kayitlar(200) });
  const s = await DP.list('t', { pageSize: 100000 });
  assert.strictEqual(s.pagination.pageSize, 50);
  assert.strictEqual(s.data.length, 50);
});

/* ============ süzme anlamları — gvFilter ile birebir ============ */

test('serbest arama yalnız tanımlı alanlarda ve en az 2 karakterde çalışır', async () => {
  const { DP } = kur();
  const veri = [
    { id: 'A1', ad: 'Forklift', not: 'zzz' },
    { id: 'A2', ad: 'Vinç', not: 'forklift yedek' }
  ];
  DP.tanimla('t', { kaynak: () => veri, arama: ['ad'] });
  assert.strictEqual((await DP.list('t', { q: 'fork' })).pagination.totalRecords, 1);
  /* tek karakter arama çalışmaz — liste tam gelir */
  assert.strictEqual((await DP.list('t', { q: 'f' })).pagination.totalRecords, 2);
});

test('arama Türkçe büyük/küçük harfe duyarsızdır', async () => {
  const { DP } = kur();
  DP.tanimla('t', { kaynak: () => [{ id: 'A1', ad: 'İSTANBUL Deposu' }], arama: ['ad'] });
  assert.strictEqual((await DP.list('t', { q: 'istanbul' })).pagination.totalRecords, 1);
});

test('aralık, tarih, toggle ve çoklu alan türleri', async () => {
  const { DP } = kur();
  const veri = [
    { id: 'A1', fiyat: 100, tarih: '2026-01-10', acil: true, kat: 'k1' },
    { id: 'A2', fiyat: 500, tarih: '2026-06-10', acil: false, kat: 'k2' },
    { id: 'A3', fiyat: 900, tarih: '2026-12-10', acil: true, kat: 'k1' }
  ];
  const alanlar = [
    { k: 'fiyat', tur: 'aralik' }, { k: 'tarih', tur: 'tarih' },
    { k: 'acil', tur: 'toggle' }, { k: 'kat', tur: 'coklu' }
  ];
  DP.tanimla('t', { kaynak: () => veri, alanlar });

  assert.deepStrictEqual((await DP.list('t', { filters: { fiyat: { min: 200, max: '' } } })).data.map(x => x.id), ['A2', 'A3']);
  assert.deepStrictEqual((await DP.list('t', { filters: { tarih: { bas: '2026-05-01', son: '2026-07-01' } } })).data.map(x => x.id), ['A2']);
  assert.deepStrictEqual((await DP.list('t', { filters: { acil: 'evet' } })).data.map(x => x.id), ['A1', 'A3']);
  assert.deepStrictEqual((await DP.list('t', { filters: { acil: 'hayir' } })).data.map(x => x.id), ['A2']);
  assert.deepStrictEqual((await DP.list('t', { filters: { kat: ['k1', 'k2'] } })).data.map(x => x.id), ['A1', 'A2', 'A3']);
});

test('__cip hızlı durum çipi ve __arsiv ayrılmış anahtarları', async () => {
  const { DP } = kur();
  const veri = [
    { id: 'A1', durum: 'aktif', arsiv: false },
    { id: 'A2', durum: 'pasif', arsiv: false },
    { id: 'A3', durum: 'aktif', arsiv: true }
  ];
  DP.tanimla('t', { kaynak: () => veri, cipler: { alan: 'durum' }, arsivAlani: 'arsiv' });
  assert.deepStrictEqual((await DP.list('t', {})).data.map(x => x.id), ['A1', 'A2']);
  assert.deepStrictEqual((await DP.list('t', { filters: { __cip: 'aktif' } })).data.map(x => x.id), ['A1']);
  assert.deepStrictEqual((await DP.list('t', { filters: { __cip: 'tumu' } })).data.map(x => x.id), ['A1', 'A2']);
  assert.deepStrictEqual((await DP.list('t', { filters: { __arsiv: 'evet' } })).data.map(x => x.id), ['A1', 'A2', 'A3']);
});

test('özel suz fonksiyonu tanımlıysa alan türünün önüne geçer', async () => {
  const { DP } = kur();
  const veri = [{ id: 'A1', n: 3 }, { id: 'A2', n: 8 }];
  DP.tanimla('t', { kaynak: () => veri, alanlar: [{ k: 'n', tur: 'secim', suz: (k, v) => k.n > Number(v) }] });
  assert.deepStrictEqual((await DP.list('t', { filters: { n: '5' } })).data.map(x => x.id), ['A2']);
});

/* ============ sıralama ============ */

test('boş değerler yön ne olursa olsun sona düşer', async () => {
  const { DP } = kur();
  const veri = [{ id: 'A1', ad: 'B' }, { id: 'A2', ad: null }, { id: 'A3', ad: 'A' }];
  DP.tanimla('t', { kaynak: () => veri });
  assert.deepStrictEqual((await DP.list('t', { sort: 'ad:asc' })).data.map(x => x.id), ['A3', 'A1', 'A2']);
  assert.deepStrictEqual((await DP.list('t', { sort: 'ad:desc' })).data.map(x => x.id), ['A1', 'A3', 'A2']);
});

test('sayısal alanlar metin olarak değil sayı olarak sıralanır', async () => {
  const { DP } = kur();
  const veri = [{ id: 'A1', n: 9 }, { id: 'A2', n: 10 }, { id: 'A3', n: 100 }];
  DP.tanimla('t', { kaynak: () => veri });
  assert.deepStrictEqual((await DP.list('t', { sort: 'n:asc' })).data.map(x => x.n), [9, 10, 100]);
});

test('sorguda sıralama yoksa tanımın varsayılan sırası kullanılır', async () => {
  const { DP } = kur();
  const veri = [{ id: 'A1', n: 5 }, { id: 'A2', n: 1 }];
  DP.tanimla('t', { kaynak: () => veri, sira: [{ field: 'n', direction: 'asc' }] });
  assert.deepStrictEqual((await DP.list('t', {})).data.map(x => x.id), ['A2', 'A1']);
});

/* ============ klonlama, önbellek, kapsam ============ */

test('list yalnız dönen sayfayı klonlar; kaynak koleksiyon değişmez', async () => {
  const { DP } = kur();
  const veri = kayitlar(30, i => ({ ad: 'A' + i }));
  DP.tanimla('t', { kaynak: () => veri });
  const s = await DP.list('t', { pageSize: 10 });
  s.data[0].ad = 'DEĞİŞTİ';
  assert.strictEqual(veri[0].ad, 'A0');
  assert.notStrictEqual(s.data[0], veri[0]);
});

test('onbellek açık kaynak yeniden okunmaz, komut sonrası düşer', async () => {
  const { DP } = kur();
  let cagri = 0;
  DP.tanimla('t', { kaynak: () => { cagri++; return kayitlar(5); }, onbellek: true });
  await DP.list('t', {});
  await DP.list('t', { page: 1 });
  assert.strictEqual(cagri, 1);
  DP.onbellekDusur();
  await DP.list('t', {});
  assert.strictEqual(cagri, 2);
});

test('onbellek kapalıysa kaynak her çağrıda okunur', async () => {
  const { DP } = kur();
  let cagri = 0;
  DP.tanimla('t', { kaynak: () => { cagri++; return kayitlar(5); } });
  await DP.list('t', {});
  await DP.list('t', {});
  assert.strictEqual(cagri, 2);
});

test('rol kapsamı yalnız provider katmanında uygulanır, çifte süzme olmaz', async () => {
  const sahteApi = { rolKapsami: () => ({ tur: 'musteri', musteriId: 'MST-001' }), degisiklikSayisi: () => 0 };
  const { DP, w } = kur({ demoApi: sahteApi });
  w.GV.rol = 'musteri';
  const veri = [{ id: 'A1', musteriId: 'MST-001' }, { id: 'A2', musteriId: 'MST-002' }];
  DP.tanimla('t', { kaynak: () => veri, kapsam: true });
  assert.deepStrictEqual((await DP.list('t', {})).data.map(x => x.id), ['A1']);

  DP.tanimla('u', { kaynak: () => veri });
  assert.strictEqual((await DP.list('u', {})).pagination.totalRecords, 2);
});

test('tam kapsamlı rol hiçbir kaydı kaybetmez', async () => {
  const sahteApi = { rolKapsami: () => ({ tur: 'tam' }), degisiklikSayisi: () => 0 };
  const { DP } = kur({ demoApi: sahteApi });
  DP.tanimla('t', { kaynak: () => kayitlar(7), kapsam: true });
  assert.strictEqual((await DP.list('t', {})).pagination.totalRecords, 7);
});

/* ============ get / command ============ */

test('get kayıt bulur, eksik idde null döner', async () => {
  const { DP } = kur();
  DP.tanimla('t', { kaynak: () => kayitlar(3) });
  assert.strictEqual((await DP.get('t', 'K-0002')).id, 'K-0002');
  assert.strictEqual(await DP.get('t', 'YOK'), null);
  assert.strictEqual(await DP.get('t', ''), null);
  assert.strictEqual(await DP.get('t', null), null);
});

test('command tanımsız komutta reddeder', async () => {
  const { DP } = kur();
  await assert.rejects(() => DP.command('OlmayanKomut', {}), /Tanımsız komut/);
});

test('command her çağrıda requestId üretir ve önbelleği düşürür', async () => {
  const { DP } = kur();
  let gorulen = [];
  DP.komut('DemoKomut', p => { gorulen.push(p.requestId); return Promise.resolve({ ok: true }); });
  let cagri = 0;
  DP.tanimla('t', { kaynak: () => { cagri++; return kayitlar(2); }, onbellek: true });
  await DP.list('t', {});
  await DP.command('DemoKomut', { x: 1 });
  await DP.list('t', {});
  assert.strictEqual(cagri, 2);
  assert.strictEqual(gorulen.length, 1);
  assert.ok(gorulen[0] && gorulen[0].length > 8);
  await DP.command('DemoKomut', { x: 2 });
  assert.notStrictEqual(gorulen[0], gorulen[1]);
});

test('nextCursor yalnız sonraki sayfa varken üretilir ve deterministiktir', async () => {
  const { DP } = kur();
  DP.tanimla('t', { kaynak: () => kayitlar(30, i => ({ updatedAt: '2026-01-' + String(i + 1).padStart(2, '0') })) });
  const a = await DP.list('t', { pageSize: 10 });
  const b = await DP.list('t', { pageSize: 10 });
  assert.ok(a.pagination.nextCursor);
  assert.strictEqual(a.pagination.nextCursor, b.pagination.nextCursor);
});

test('hiç sıralama kuralı yoksa kaynak sırası korunur (id\'ye göre yeniden dizmez)', async () => {
  const { DP } = kur();
  const veri = [{ id: 'Z-9' }, { id: 'A-1' }, { id: 'M-5' }];
  DP.tanimla('t', { kaynak: () => veri });
  assert.deepStrictEqual((await DP.list('t', {})).data.map(x => x.id), ['Z-9', 'A-1', 'M-5']);
});

test('sıralama kuralı varken id tie-breaker eklenir', async () => {
  const { DP } = kur();
  const veri = [{ id: 'Z-9', g: 1 }, { id: 'A-1', g: 1 }, { id: 'M-5', g: 1 }];
  DP.tanimla('t', { kaynak: () => veri });
  assert.deepStrictEqual((await DP.list('t', { sort: 'g:asc' })).data.map(x => x.id), ['A-1', 'M-5', 'Z-9']);
});

test('ozet() süzülmüş kümenin tamamı üzerinden hesap yapar, diziyi UI\'ya vermez', async () => {
  const { DP } = kur();
  const veri = kayitlar(59, i => ({ tutar: 100, durum: i < 10 ? 'acik' : 'kapali' }));
  DP.tanimla('t', { kaynak: () => veri, alanlar: [{ k: 'durum', tur: 'coklu' }] });
  const toplam = await DP.ozet('t', { pageSize: 20, filters: { durum: ['acik'] } },
    d => d.reduce((t, k) => t + k.tutar, 0));
  assert.strictEqual(toplam, 1000);
});

test('ozet() sayfa numarasından etkilenmez', async () => {
  const { DP } = kur();
  DP.tanimla('t', { kaynak: () => kayitlar(59) });
  const a = await DP.ozet('t', { page: 1, pageSize: 20 }, d => d.length);
  const b = await DP.ozet('t', { page: 3, pageSize: 20 }, d => d.length);
  assert.strictEqual(a, 59);
  assert.strictEqual(b, 59);
});
