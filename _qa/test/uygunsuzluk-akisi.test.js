/* Faz 14 · Adım 1 — uygunsuzluk akışının doküman §8'deki ALTI aşamaya
   tamamlanması. Yasak sıçrama, zorunlu alan, izin ve iş kuralı ön koşulu. */
const { test } = require('node:test');
const assert = require('node:assert');
const { ortam } = require('./yukleyici.js');

const w = ortam(['kimlik.js', 'para-zaman.js', 'demo-data.js', 'demo-api.js', 'durum-makinesi.js'], {
  crypto: require('node:crypto').webcrypto,
  setTimeout
});
const GV = w.GV;
const A = w.demoApi;

const SIRA = ['acik', 'aksiyon-planlandi', 'uygulandi', 'kanit-yuklendi', 'dogrulandi', 'kapandi'];

/* ---------------- tanım ---------------- */

test('akış doküman §8\'deki altı aşamayı bu sırayla taşır', () => {
  assert.deepStrictEqual(GV.akisDurumlari('uygunsuzluk').map(d => d.k), SIRA);
});

test('"gecikti" saklanan bir aşama DEĞİLDİR', () => {
  assert.ok(!GV.akisDurumlari('uygunsuzluk').some(d => d.k === 'gecikti'));
  assert.ok(!Object.keys(GV.akis('uygunsuzluk').gecis).includes('gecikti'));
  assert.ok(!A.liste('uygunsuzluklar').some(u => u.durum === 'gecikti'),
    'çekirdek veride "gecikti" durumu kalmış');
});

test('her aşamanın ileri hedefi bir sonraki aşamadır; geri dönüş tanımlıdır', () => {
  const g = GV.akis('uygunsuzluk').gecis;
  for (let i = 0; i < SIRA.length - 1; i++) {
    assert.ok(g[SIRA[i]].includes(SIRA[i + 1]), `${SIRA[i]} → ${SIRA[i + 1]} yok`);
  }
  for (let i = 1; i < SIRA.length; i++) {
    const geriHedef = i === SIRA.length - 1 ? 'acik' : SIRA[i - 1];
    assert.ok(g[SIRA[i]].includes(geriHedef), `${SIRA[i]} için geri alma yok`);
  }
});

/* ---------------- demo veri yayılımı ---------------- */

test('demo veri altı aşamanın hepsine yayılmıştır, tek aşamada yığılmaz', () => {
  const l = A.liste('uygunsuzluklar');
  for (const k of SIRA) {
    assert.ok(l.some(u => u.durum === k), `hiçbir kayıt "${k}" aşamasında değil`);
  }
  const enBuyuk = Math.max(...SIRA.map(k => l.filter(u => u.durum === k).length));
  assert.ok(enBuyuk <= Math.ceil(l.length / 2),
    'kayıtların yarısından fazlası tek aşamada yığılmış');
});

test('aşamanın gerektirdiği alanlar çekirdek veride doludur', () => {
  for (const u of A.liste('uygunsuzluklar')) {
    const i = SIRA.indexOf(u.durum);
    assert.ok(i >= 0, u.id + ' tanımsız aşamada');
    if (i >= 1) assert.ok(u.aksiyonPlani && u.planTarihi, u.id + ': aksiyon planı eksik');
    if (i >= 2) assert.ok(u.uygulamaTarihi, u.id + ': uygulama tarihi eksik');
    if (i >= 3) assert.ok(Array.isArray(u.kanit) && u.kanit.length, u.id + ': kanıt eksik');
    if (i >= 4) assert.ok(u.dogrulayanId && u.dogrulamaTarihi, u.id + ': doğrulama eksik');
    if (i >= 5) assert.ok(u.kapanis, u.id + ': kapanış tarihi eksik');
  }
});

/* ---------------- yasak sıçramalar ---------------- */

function kayit(durum, ek) {
  return Object.assign({
    id: 'UYG-TEST', durum: durum, termin: '2026-12-31', sorumluTaraf: 'musteri',
    yenidenKontrol: 'gerekmiyor'
  }, ek || {});
}

test('açık kayıt doğrudan kapatılamaz', () => {
  const r = GV.gecisDene('uygunsuzluk', kayit('acik'), 'kapandi', { rol: 'sahip' });
  assert.strictEqual(r.uygun, false);
  assert.strictEqual(r.kod, 'onceki-durum');
});

test('aşama atlanamaz: açık → uygulandı reddedilir', () => {
  const r = GV.gecisDene('uygunsuzluk', kayit('acik'), 'uygulandi', { rol: 'sahip' });
  assert.strictEqual(r.kod, 'onceki-durum');
});

test('kanıt yüklenmeden doğrulama yapılamaz (iki katman: sıra + iş kuralı)', () => {
  const sira = GV.gecisDene('uygunsuzluk', kayit('uygulandi', { uygulamaTarihi: '2026-08-01' }),
    'dogrulandi', { rol: 'teknik' });
  assert.strictEqual(sira.kod, 'onceki-durum');

  const kural = GV.gecisDene('uygunsuzluk',
    kayit('kanit-yuklendi', { uygulamaTarihi: '2026-08-01', kanit: [] }),
    'dogrulandi', { rol: 'teknik', veri: { dogrulayanId: 'PRS-004', dogrulamaTarihi: '2026-08-10' } });
  assert.strictEqual(kural.uygun, false);
  assert.strictEqual(kural.kod, 'kural');
});

/* ---------------- zorunlu alan ---------------- */

test('aksiyon planı ve termin girilmeden plan aşamasına geçilemez', () => {
  const r = GV.gecisDene('uygunsuzluk', kayit('acik'), 'aksiyon-planlandi', { rol: 'teknik' });
  assert.strictEqual(r.kod, 'zorunlu-alan');
  assert.ok(r.eksik.includes('aksiyonPlani'));

  const ok = GV.gecisDene('uygunsuzluk', kayit('acik'), 'aksiyon-planlandi',
    { rol: 'teknik', veri: { aksiyonPlani: 'Dikme değişecek' } });
  assert.strictEqual(ok.uygun, true);
});

test('doğrulayan ve doğrulama tarihi olmadan doğrulanamaz', () => {
  const k = kayit('kanit-yuklendi', { kanit: ['Test tutanağı'] });
  const r = GV.gecisDene('uygunsuzluk', k, 'dogrulandi', { rol: 'teknik' });
  assert.strictEqual(r.kod, 'zorunlu-alan');
  assert.deepStrictEqual(r.eksik, ['dogrulayanId', 'dogrulamaTarihi']);
});

test('kapanış tarihi olmadan kapatılamaz', () => {
  const k = kayit('dogrulandi', { kanit: ['x'], dogrulayanId: 'PRS-004', dogrulamaTarihi: '2026-08-10' });
  const r = GV.gecisDene('uygunsuzluk', k, 'kapandi', { rol: 'kalite' });
  assert.strictEqual(r.kod, 'zorunlu-alan');
});

/* ---------------- izin ---------------- */

test('saha rolü uygulama yapabilir ama doğrulama yapamaz', () => {
  const uyg = GV.gecisDene('uygunsuzluk',
    kayit('aksiyon-planlandi', { aksiyonPlani: 'p', planTarihi: '2026-08-01' }),
    'uygulandi', { rol: 'saha', veri: { uygulamaTarihi: '2026-08-05' } });
  assert.strictEqual(uyg.uygun, true);

  const dog = GV.gecisDene('uygunsuzluk',
    kayit('kanit-yuklendi', { kanit: ['x'] }), 'dogrulandi',
    { rol: 'saha', veri: { dogrulayanId: 'PRS-004', dogrulamaTarihi: '2026-08-10' } });
  assert.strictEqual(dog.kod, 'izin');
});

/* ---------------- iş kuralı ön koşulu ---------------- */

test('yeniden kontrol tamamlanmadan kapatılamaz', () => {
  /* UYG-2026-005 · yenidenKontrol "gerekli", YKN-2026-002 açık */
  const u = Object.assign({}, A.kayit('uygunsuzluklar', 'UYG-2026-005'), {
    durum: 'dogrulandi', kanit: ['x'], dogrulayanId: 'PRS-004',
    dogrulamaTarihi: '2026-08-16', kapanis: '2026-08-18'
  });
  const r = GV.gecisDene('uygunsuzluk', u, 'kapandi', { rol: 'kalite' });
  assert.strictEqual(r.uygun, false);
  assert.strictEqual(r.kod, 'kural');
  assert.match(r.sebep, /Yeniden kontrol/);
});

/* ---------------- uçtan uca ---------------- */

test('açık kayıt altı aşamayı sırayla geçer ve her adım yazılır', async () => {
  const id = 'UYG-2026-011';           /* açık, yeniden kontrol gerekmiyor */
  const adimlar = [
    ['aksiyon-planlandi', { aksiyonPlani: 'Keçe değişecek', planTarihi: '2026-08-18' }, 'kalite'],
    ['uygulandi',         { uygulamaTarihi: '2026-08-18' }, 'saha'],
    ['kanit-yuklendi',    { kanit: ['Keçe değişim formu'] }, 'saha'],
    ['dogrulandi',        { dogrulayanId: 'PRS-004', dogrulamaTarihi: '2026-08-18' }, 'teknik'],
    ['kapandi',           { kapanis: '2026-08-18' }, 'kalite']
  ];
  for (const [hedef, yama, rol] of adimlar) {
    const g = await GV.gecisUygula('uygunsuzluk', 'uygunsuzluklar', id, hedef,
      { rol, sessiz: true, ekYama: yama });
    assert.strictEqual(g.ok, true, hedef + ' geçemedi: ' + g.sebep);
    assert.strictEqual(A.kayit('uygunsuzluklar', id).durum, hedef);
  }
  assert.strictEqual(A.kayit('uygunsuzluklar', id).kapanis, '2026-08-18');
});

test('kapanan kayıt yeniden açılabilir, ara aşamaya sıçrayamaz', async () => {
  const id = 'UYG-2026-011';
  const yasak = await GV.gecisUygula('uygunsuzluk', 'uygunsuzluklar', id, 'uygulandi',
    { rol: 'sahip', sessiz: true });
  assert.strictEqual(yasak.ok, false);
  assert.strictEqual(yasak.kod, 'onceki-durum');

  const g = await GV.gecisUygula('uygunsuzluk', 'uygunsuzluklar', id, 'acik',
    { rol: 'kalite', sessiz: true, ekYama: { kapanis: null } });
  assert.strictEqual(g.ok, true);
  assert.strictEqual(A.kayit('uygunsuzluklar', id).durum, 'acik');
});
