/* Adım 1 — kimlik üretimi ve tekrar koruması (doküman §8). */
const { test } = require('node:test');
const assert = require('node:assert');
const { ortam } = require('./yukleyici.js');

function kur(kriptoVar) {
  return ortam(['kimlik.js'], kriptoVar ? { crypto: require('node:crypto').webcrypto } : {});
}

test('uuid RFC 4122 v4 biçiminde ve tekrarsızdır', () => {
  const GV = kur(true).GV;
  const u = GV.uuid();
  assert.match(u, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  const küme = new Set(Array.from({ length: 5000 }, () => GV.uuid()));
  assert.strictEqual(küme.size, 5000);
});

test('crypto.randomUUID yoksa getRandomValues yedeği yine v4 üretir', () => {
  const webcrypto = require('node:crypto').webcrypto;
  const kısıtlı = { getRandomValues: b => webcrypto.getRandomValues(b) };
  const GV = ortam(['kimlik.js'], { crypto: kısıtlı }).GV;
  assert.match(GV.uuid(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('crypto hiç yoksa bile kimlik üretilir ve çakışmaz', () => {
  const GV = kur(false).GV;
  const küme = new Set(Array.from({ length: 5000 }, () => GV.yeniKod('X')));
  assert.strictEqual(küme.size, 5000);
});

test('yeniKod önek + okunur blok verir; 0/1/I/O harfleri kullanılmaz', () => {
  const GV = kur(true).GV;
  const k = GV.yeniKod('MST-Y');
  assert.match(k, /^MST-Y-[2-9A-HJ-NP-Z]{6}$/);
  assert.strictEqual(GV.yeniKod('TKL-2026-').split('-').length, 3);   /* sondaki tire yutulur */
  assert.match(GV.yeniKod('KLB', 8), /^KLB-[2-9A-HJ-NP-Z]{8}$/);
});

test('yeniKod liste uzunluğundan ya da saatten türemez — 2000 üretim tekrarsız', () => {
  const GV = kur(true).GV;
  const küme = new Set(Array.from({ length: 2000 }, () => GV.yeniKod('LOK-Y')));
  assert.strictEqual(küme.size, 2000);
});

test('istekKimligi her denemede farklıdır', () => {
  const GV = kur(true).GV;
  assert.notStrictEqual(GV.istekKimligi(), GV.istekKimligi());
  assert.match(GV.istekKimligi(), /^req-/);
});

test('kararliJson anahtar sırasından bağımsızdır', () => {
  const GV = kur(true).GV;
  assert.strictEqual(GV.kararliJson({ a: 1, b: [2, { d: 4, c: 3 }] }),
                     GV.kararliJson({ b: [2, { c: 3, d: 4 }] , a: 1 }));
  assert.notStrictEqual(GV.kararliJson({ a: 1 }), GV.kararliJson({ a: 2 }));
});

/* ---------- tekrar koruması ---------- */

test('aynı komut ikinci kez çağrılırsa iş GÖVDESİ tekrar çalışmaz', async () => {
  const GV = kur(true).GV;
  let sayac = 0;
  const calistir = () => { sayac++; return { kayit: 'K-1' }; };
  const a = GV.komut('Ekle:musteriler', { unvan: 'A' }, calistir);
  const b = GV.komut('Ekle:musteriler', { unvan: 'A' }, calistir);
  assert.strictEqual(await a, await b);
  assert.strictEqual(sayac, 1);
});

test('farklı yük farklı komuttur — gövde yeniden çalışır', async () => {
  const GV = kur(true).GV;
  let sayac = 0;
  const calistir = () => { sayac++; return sayac; };
  await GV.komut('Ekle:musteriler', { unvan: 'A' }, calistir);
  await GV.komut('Ekle:musteriler', { unvan: 'B' }, calistir);
  assert.strictEqual(sayac, 2);
});

test('istekId verilirse anahtar odur; aynı deneme tekrar gönderilse de tek kayıt', async () => {
  const GV = kur(true).GV;
  let sayac = 0;
  const id = GV.istekKimligi();
  const calistir = () => { sayac++; return sayac; };
  await GV.komut('CreateCustomer', { unvan: 'A' }, calistir, { istekId: id });
  await GV.komut('CreateCustomer', { unvan: 'DEĞİŞTİ' }, calistir, { istekId: id });
  assert.strictEqual(sayac, 1);
});

test('gövde SENKRON çalışır — mevcut sayfalar ekleme sonrası listeyi hemen okuyor', () => {
  const GV = kur(true).GV;
  let calisti = false;
  GV.komut('Ekle:x', { a: 1 }, () => { calisti = true; return 1; });
  assert.strictEqual(calisti, true);
});

test('hata veren komut defterden düşer; yeniden denenebilir', async () => {
  const GV = kur(true).GV;
  let sayac = 0;
  const patla = () => { sayac++; throw new Error('ağ'); };
  await assert.rejects(() => GV.komut('Ekle:x', { a: 1 }, patla));
  await assert.rejects(() => GV.komut('Ekle:x', { a: 1 }, patla));
  assert.strictEqual(sayac, 2);
});

test('pencere dolduğunda aynı içerik yeniden kayıt açabilir', async () => {
  const w = kur(true);
  const GV = w.GV;
  let t = 1000;
  GV.saat = { simdi: () => t };
  let sayac = 0;
  const calistir = () => { sayac++; return sayac; };
  await GV.komut('Ekle:x', { a: 1 }, calistir);
  t += 100;
  await GV.komut('Ekle:x', { a: 1 }, calistir);
  assert.strictEqual(sayac, 1, 'pencere içinde tekrar açılmaz');
  t += 20000;
  await GV.komut('Ekle:x', { a: 1 }, calistir);
  assert.strictEqual(sayac, 2, 'pencere dışında bilinçli tekrar serbesttir');
});

test('komutSifirla defteri boşaltır', async () => {
  const GV = kur(true).GV;
  let sayac = 0;
  const calistir = () => { sayac++; return sayac; };
  await GV.komut('Ekle:x', { a: 1 }, calistir);
  GV.komutSifirla();
  assert.strictEqual(GV.komutSayisi(), 0);
  await GV.komut('Ekle:x', { a: 1 }, calistir);
  assert.strictEqual(sayac, 2);
});

/* ---------- gönderim kilidi ---------- */

test('kilit butonu ilk gönderimde kilitler, coz eski hâline döndürür', () => {
  const GV = kur(true).GV;
  const btn = {
    disabled: false, innerHTML: '<i></i>Kaydet', _a: {},
    setAttribute(k, v) { this._a[k] = v; },
    removeAttribute(k) { delete this._a[k]; }
  };
  const k = GV.kilit(btn, 'Kaydediliyor…');
  assert.strictEqual(btn.disabled, true);
  assert.strictEqual(btn._a['aria-busy'], 'true');
  assert.match(btn.innerHTML, /fa-spin/);
  k.coz();
  assert.strictEqual(btn.disabled, false);
  assert.strictEqual(btn.innerHTML, '<i></i>Kaydet');
  assert.strictEqual(btn._a['aria-busy'], undefined);
});

test('zaten kilitli butonda ikinci kilit isteği yoksayılır', () => {
  const GV = kur(true).GV;
  const btn = { disabled: true, innerHTML: 'x', setAttribute() {}, removeAttribute() {} };
  const k = GV.kilit(btn);
  assert.strictEqual(k.kilitliydi, true);
  assert.strictEqual(btn.innerHTML, 'x');
});
