/* Adım 6 — para (kuruş integer) ve zaman (ClockService) çekirdeği.
   Doküman §8 "Para, tarih ve KPI kuralları". */
const { test } = require('node:test');
const assert = require('node:assert');
const { ortam } = require('./yukleyici.js');

function kur() {
  return ortam(['kimlik.js', 'para-zaman.js'], { crypto: require('node:crypto').webcrypto });
}

/* ---------------- kuruş aritmetiği ---------------- */

test('TL → kuruş çevrimi ikili gösterim artığını yutar', () => {
  const K = kur().GV.kurus;
  assert.strictEqual(K.al(1234.56), 123456);
  assert.strictEqual(K.al('1234,56'), 123456);
  assert.strictEqual(K.al(0.07), 7);
  assert.strictEqual(K.al(1.005), 101);      /* 1.005*100 = 100.49999… */
  assert.strictEqual(K.al(-12.34), -1234);
  assert.strictEqual(K.al(null), 0);
  assert.strictEqual(K.al('abc'), 0);
});

test('float yuvarlama zinciri kırılır: 0.1 + 0.2 tam çıkar', () => {
  const K = kur().GV.kurus;
  assert.notStrictEqual(0.1 + 0.2, 0.3);                  /* referans: float */
  assert.strictEqual(K.topla(K.al(0.1), K.al(0.2)), 30);
  assert.strictEqual(K.tl(K.topla(K.al(0.1), K.al(0.2))), 0.3);
});

test('yüz kalemlik toplamda kayıp olmaz', () => {
  const K = kur().GV.kurus;
  let float = 0, kurus = 0;
  for (let i = 0; i < 100; i++) { float += 0.07; kurus = K.topla(kurus, K.al(0.07)); }
  assert.strictEqual(K.tl(kurus), 7);
  assert.notStrictEqual(float, 7);                        /* float birikimi kayıyor */
});

test('carp ve oran tek yuvarlama yapar', () => {
  const K = kur().GV.kurus;
  assert.strictEqual(K.carp(K.al(1450), 3), 435000);
  assert.strictEqual(K.oran(K.al(109504), 0.20), 2190080);
  assert.strictEqual(K.tl(K.oran(K.al(109504), 0.20)), 21900.8);
  assert.strictEqual(K.oran(K.al(100), 1 / 3), 3333);     /* 33,33 ₺ */
});

test('cikar ve toplamDizi', () => {
  const K = kur().GV.kurus;
  assert.strictEqual(K.cikar(K.al(100), K.al(33.33)), 6667);
  assert.strictEqual(K.toplamDizi([K.al(1), K.al(2.5), K.al(0.25)]), 375);
});

/* ---------------- para birimi ---------------- */

test('tek para birimi tek toplamda birleşir', () => {
  const GV = kur().GV;
  const t = GV.paraToplam([{ tutar: 100 }, { tutar: 250.50 }], 'tutar');
  assert.strictEqual(t.karisikMi, false);
  assert.deepStrictEqual(t.birimler, ['TRY']);
  assert.strictEqual(t.tek().kurus, 35050);
  assert.strictEqual(t.tek().birim, 'TRY');
});

test('FARKLI PARA BİRİMLERİ TEK TOPLAMDA BİRLEŞMEZ', () => {
  const GV = kur().GV;
  const t = GV.paraToplam([
    { tutar: 1000, paraBirimi: 'TRY' },
    { tutar: 200, paraBirimi: 'EUR' },
    { tutar: 500, paraBirimi: 'TRY' }
  ], 'tutar');
  assert.strictEqual(t.karisikMi, true);
  assert.strictEqual(t.tek(), null, 'karışık toplam tek sayıya indirgenemez');
  assert.deepStrictEqual(Object.keys(t.kovalar).sort().join(','), 'EUR,TRY');
  assert.strictEqual(t.kovalar.TRY, 150000);
  assert.strictEqual(t.kovalar.EUR, 20000);
  assert.match(t.metin(0), /€/);
  assert.match(t.metin(0), /₺/);
  assert.match(t.metin(0), /\+/);
});

test('para birimi yazılmamış kayıt varsayılan TRY sayılır', () => {
  const GV = kur().GV;
  const t = GV.paraToplam([{ tutar: 10 }, { tutar: 5, paraBirimi: 'try' }], 'tutar');
  assert.strictEqual(t.karisikMi, false);
  assert.strictEqual(t.tek().kurus, 1500);
});

test('paraBicim TRY dışında birim kodunu gösterir', () => {
  const GV = kur().GV;
  assert.strictEqual(GV.paraBicim(123456, 'TRY'), '₺1.234,56');
  assert.strictEqual(GV.paraBicim(100000, 'TRY'), '₺1.000');
  assert.strictEqual(GV.paraBicim(-50000, 'TRY'), '-₺500');
  assert.strictEqual(GV.paraBicim(123400, 'CHF'), '1.234 CHF');
});

/* ---------------- ClockService ---------------- */

test('bugun() demo verisinin iş tarihini kullanır — tarayıcı saatini değil', () => {
  const w = ortam(['kimlik.js', 'para-zaman.js', 'demo-data.js'],
    { crypto: require('node:crypto').webcrypto });
  assert.strictEqual(w.GV.saat.bugun(), w.DEMO.bugun);
});

test('zaman sabitlenebilir; gecikme hesabı sabit tarihe göre çalışır', () => {
  const GV = kur().GV;
  GV.saat.sabitle({ gun: '2026-08-18', epoch: Date.UTC(2026, 7, 18, 9, 30) });
  assert.strictEqual(GV.saat.bugun(), '2026-08-18');
  assert.strictEqual(GV.saat.gecikmeGun('2026-08-10'), 8);
  assert.strictEqual(GV.saat.gecikmisMi('2026-08-10'), true);
  assert.strictEqual(GV.saat.gecikmisMi('2026-09-10'), false);
  assert.strictEqual(GV.saat.gecikmeGun(null), null);
  assert.strictEqual(GV.saat.gecikmisMi(null), false, 'vade boşsa sahte gecikme üretilmez');
  GV.saat.cozul();
  assert.strictEqual(GV.saat.sabitMi(), false);
});

test('gunFarki boş tarihte null döner (sahte tarih üretilmez)', () => {
  const GV = kur().GV;
  assert.strictEqual(GV.saat.gunFarki('2026-01-01', '2026-01-31'), 30);
  assert.strictEqual(GV.saat.gunFarki(null, '2026-01-31'), null);
  assert.strictEqual(GV.saat.gunFarki('2026-01-01', ''), null);
});

test('zamanDamgasi ISO 8601 biçiminde ve sabitlenmiş saatten gelir', () => {
  const GV = kur().GV;
  const d = new Date(2026, 7, 18, 9, 5, 3);
  GV.saat.sabitle({ epoch: d.getTime() });
  assert.strictEqual(GV.saat.zamanDamgasi(), '2026-08-18T09:05:03');
  assert.strictEqual(GV.saat.saatMetni(), '09:05');
  assert.strictEqual(GV.saat.isoGun(d), '2026-08-18');
  GV.saat.cozul();
});

/* ---------------- demoApi tarafı ---------------- */

function apiKur() {
  return ortam(['kimlik.js', 'para-zaman.js', 'demo-data.js', 'demo-api.js'],
    { crypto: require('node:crypto').webcrypto, setTimeout });
}

test('demoApi.bugun ClockService üzerinden gelir ve sabitlenebilir', () => {
  const w = apiKur();
  assert.strictEqual(w.demoApi.bugun(), w.DEMO.bugun);
  w.GV.saat.sabitle({ gun: '2027-01-01' });
  assert.strictEqual(w.demoApi.bugun(), '2027-01-01');
  w.GV.saat.cozul();
});

test('birim satış fiyatı kuruş üzerinden hesaplanır ve TL karşılığı bozulmaz', () => {
  const w = apiKur();
  const A = w.demoApi;
  const hid = Object.keys(w.DEMO.hizmetFiyatlari)[0];
  const kurus = A.birimSatisFiyatiKurus(hid, 'FL-2026-STD');
  assert.strictEqual(typeof kurus, 'number');
  assert.strictEqual(Number.isInteger(kurus), true, 'kuruş TAM SAYI olmalı');
  assert.strictEqual(A.birimSatisFiyati(hid, 'FL-2026-STD'), w.GV.kurus.tl(kurus));
});

test('lokasyon fatura tutarı kuruş toplamıdır; TL karşılığı ondan türer', () => {
  const w = apiKur();
  const A = w.demoApi;
  const lok = A.liste('lokasyonlar')[0];
  const k = A.lokasyonFaturaTutariKurus(lok.id, lok.projeId);
  assert.strictEqual(Number.isInteger(k), true);
  assert.strictEqual(A.lokasyonFaturaTutari(lok.id, lok.projeId), w.GV.kurus.tl(k));
});

test('proje özeti gelir/maliyeti kuruş alanlarıyla birlikte döner', () => {
  const w = apiKur();
  const o = w.demoApi.projeOzet('PRJ-2026-001');
  assert.strictEqual(Number.isInteger(o.gelirKurus), true);
  assert.strictEqual(Number.isInteger(o.maliyetKurus), true);
  assert.strictEqual(o.gelir, w.GV.kurus.tl(o.gelirKurus));
  assert.strictEqual(o.paraBirimi, 'TRY');
  /* Kârlılık kuruş üzerinden; float birikimi yok. */
  assert.ok(o.karlilik > 0 && o.karlilik < 1);
});

test('denetim izi zaman damgası ClockService saatine bağlı', async () => {
  const w = apiKur();
  w.GV.saat.sabitle({ epoch: new Date(2026, 7, 18, 14, 22, 5).getTime() });
  await w.demoApi.guncelle('musteriler', 'MST-001', { web: 'ornek.test' });
  const log = w.demoApi.liste('islemKayitlari');
  assert.strictEqual(log[log.length - 1].zaman, '2026-08-18T14:22:05');
  w.GV.saat.cozul();
});
