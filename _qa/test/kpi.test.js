/* Adım 7 — KPI tutarlılığı (doküman §8).
   Dashboard ve liste aynı seçiciden; arşiv/kapsam dışı/silinmiş filtresi
   TANIMLI ve kaynak taramasıyla kilitli. */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { ortam, KOK } = require('./yukleyici.js');

function kur() {
  return ortam(['kimlik.js', 'para-zaman.js', 'demo-data.js', 'demo-api.js', 'kpi.js'],
    { crypto: require('node:crypto').webcrypto, setTimeout });
}

/* ---------------- kapsam filtresi ---------------- */

test('varsayılan kapsam: arşiv, kapsam dışı ve silinmiş HARİÇ', () => {
  const GV = kur().GV;
  const k = GV.kpiKapsam();
  assert.deepStrictEqual(k, { arsiv: false, kapsamDisi: false, silinmis: false });
  assert.strictEqual(GV.kpiKapsamMetni(), 'arşiv hariç · kapsam dışı hariç · silinmiş hariç');
});

test('kapsam metni filtre değişince değişir — kural görünürdür', () => {
  const GV = kur().GV;
  GV.kpiKapsamAyarla({ arsiv: true });
  assert.match(GV.kpiKapsamMetni(), /arşiv dahil/);
  GV.kpiKapsamAyarla({});
});

test('arşivli kayıt varsayılan kapsamda sayılmaz, dışlanan olarak raporlanır', async () => {
  const w = kur();
  const GV = w.GV, A = w.demoApi;
  const once = GV.kpi('aktifProje').sayi;
  const p = A.liste('projeler').filter(x => x.durum === 'aktif')[0];
  await A.guncelle('projeler', p.id, { durum: 'arsivlendi' });

  const sonra = GV.kpi('aktifProje');
  assert.strictEqual(sonra.sayi, once - 1);
  assert.strictEqual(sonra.dislanan.arsiv, 1, 'dışlanan arşiv sayısı raporlanmalı');

  /* Filtre AÇILINCA kayıt sayıma girer — ama 'aktif' koşulu artık tutmaz. */
  const dahil = GV.kpiKaynak('projeler', { arsiv: true });
  assert.strictEqual(dahil.kayitlar.length, A.liste('projeler').length);
  assert.strictEqual(dahil.dislanan.arsiv, 0);
});

test('kapsam dışı lokasyon KPI sayımına girmez', () => {
  const w = kur();
  const GV = w.GV, A = w.demoApi;
  const kapsamDisi = A.liste('lokasyonlar')
    .filter(l => ['kapsam-disi', 'iptal'].includes(l.operasyonDurum));
  assert.ok(kapsamDisi.length, 'çekirdek veride kapsam dışı lokasyon olmalı');

  const r = GV.kpiKaynak('lokasyonlar');
  assert.strictEqual(r.dislanan.kapsamDisi, kapsamDisi.length);
  assert.strictEqual(r.kayitlar.length, A.liste('lokasyonlar').length - kapsamDisi.length);

  const acik = GV.kpiKaynak('lokasyonlar', { kapsamDisi: true });
  assert.strictEqual(acik.kayitlar.length, A.liste('lokasyonlar').length);
});

test('silinmiş kayıt sayımdan düşer ve sayısı açıkça raporlanır', async () => {
  const w = kur();
  const GV = w.GV, A = w.demoApi;
  const once = GV.kpiKaynak('yetkinlikler');
  assert.strictEqual(once.dislanan.silinmis, 0);
  const y = A.liste('yetkinlikler')[0];
  await A.sil('yetkinlikler', y.id);
  const sonra = GV.kpiKaynak('yetkinlikler');
  assert.strictEqual(sonra.kayitlar.length, once.kayitlar.length - 1);
  assert.strictEqual(sonra.dislanan.silinmis, 1);
});

/* ---------------- tek kaynak ---------------- */

test('aynı seçici iki kez çağrıldığında aynı sayıyı verir', () => {
  const GV = kur().GV;
  for (const ad of GV.kpiListesi()) {
    assert.strictEqual(GV.kpi(ad).sayi, GV.kpi(ad).sayi, ad);
  }
});

test('panel ve liste ekranı için tek seçici: sayılar birebir aynı', () => {
  const w = kur();
  const GV = w.GV, A = w.demoApi;
  /* Liste ekranının kendi ham filtresi ile seçicinin sonucu örtüşmeli. */
  const listeOnay = A.raporlar().filter(r => r.durum === 'teknik-incelemede' && r.durum !== 'arsiv');
  assert.strictEqual(GV.kpiSay('onayBekleyenRapor'), listeOnay.length);

  const listeAktifProje = A.liste('projeler').filter(p => p.durum === 'aktif');
  assert.strictEqual(GV.kpiSay('aktifProje'), listeAktifProje.length);
});

test('para KPI’sı birim kovalarına ayrışır, tek sayıya zorlanmaz', () => {
  const GV = kur().GV;
  const p = GV.kpiPara('acikFatura');
  assert.ok(p.birimler.length >= 1);
  assert.strictEqual(p.karisikMi, false);
  assert.strictEqual(typeof p.tek().kurus, 'number');
  assert.match(p.metin(0), /₺/);
});

test('para alanı tanımsız seçicide kpiPara açıkça hata verir', () => {
  const GV = kur().GV;
  assert.throws(() => GV.kpiPara('aktifProje'), /para alanı/);
});

test('tanımsız seçici sessizce 0 dönmez, hata verir', () => {
  const GV = kur().GV;
  assert.throws(() => GV.kpi('boyle-bir-kpi-yok'), /Tanımsız KPI/);
});

test('gecikme seçicisi ClockService’e bağlı — zaman sabitlenince değişir', () => {
  const w = kur();
  const GV = w.GV;
  GV.saat.sabitle({ gun: '2020-01-01' });
  const eski = GV.kpiSay('gecikmisUygunsuzluk');
  GV.saat.sabitle({ gun: '2030-01-01' });
  const yeni = GV.kpiSay('gecikmisUygunsuzluk');
  assert.ok(yeni >= eski, 'ileri tarihte gecikmiş sayısı azalmamalı');
  assert.ok(yeni > eski, 'zaman ilerleyince yeni gecikmeler oluşmalı');
  GV.saat.cozul();
});

/* ---------------- kaynak taraması ---------------- */

test('panel ve eşleşen liste ekranı ORTAK seçiciyi çağırıyor', () => {
  const eslesme = {
    'panel.html': ['onayBekleyenRapor', 'faturayaHazirLokasyon', 'aktifProje',
                   'kalibrasyonUyarisi', 'acikFatura', 'odemeyeUygunHakedis',
                   'gecikmisUygunsuzluk', 'projeKapsamindakiLokasyon'],
    'rapor-onaylari.html': ['onayBekleyenRapor'],
    'projeler.html': ['aktifProje'],
    'uygunsuzluklar.html': ['acikUygunsuzluk', 'gecikmisUygunsuzluk'],
    'taseron-hakedisleri.html': ['odemeyeUygunHakedis'],
    'faturalar.html': ['acikFatura'],
    'olcum-cihazlari.html': ['kalibrasyonUyarisi']
  };
  for (const [dosya, adlar] of Object.entries(eslesme)) {
    const s = fs.readFileSync(path.join(KOK, dosya), 'utf8');
    for (const ad of adlar) {
      assert.ok(s.includes("'" + ad + "'"), `${dosya}: ${ad} seçicisi kullanılmıyor`);
    }
  }
});

test('KPI kapsamı kullanan ekranlar filtreyi kullanıcıya yazıyor', () => {
  for (const f of ['panel.html', 'rapor-onaylari.html', 'projeler.html',
                   'uygunsuzluklar.html', 'taseron-hakedisleri.html',
                   'faturalar.html', 'olcum-cihazlari.html']) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    assert.ok(s.includes('GV.kpiKapsamNotu('), f + ' kapsam notunu basmıyor');
  }
});

test('kpi.js her sayfada yüklü', () => {
  const eksik = fs.readdirSync(KOK).filter(f => f.endsWith('.html'))
    .filter(f => !fs.readFileSync(path.join(KOK, f), 'utf8').includes('assets/js/kpi.js'));
  assert.deepStrictEqual(eksik, []);
});

test('kullanılan her seçici adı gerçekten tanımlı', () => {
  const GV = kur().GV;
  const tanimli = new Set(GV.kpiListesi());
  const bilinmeyen = [];
  for (const f of fs.readdirSync(KOK).filter(x => x.endsWith('.html'))) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    const re = /GV\.kpi(?:Say|Para)?\(\s*'([^']+)'/g;
    let m;
    while ((m = re.exec(s))) if (!tanimli.has(m[1])) bilinmeyen.push(`${f}: ${m[1]}`);
  }
  assert.deepStrictEqual(bilinmeyen, []);
});
