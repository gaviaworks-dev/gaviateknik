/* Adım 2 — durum makinesi çekirdeği (doküman §8).
   Yasak geçiş denemeleri, izin, zorunlu alan ve iş kuralı ön koşulu. */
const { test } = require('node:test');
const assert = require('node:assert');
const { ortam } = require('./yukleyici.js');

function kur() {
  const w = ortam(['kimlik.js', 'demo-data.js', 'demo-api.js', 'durum-makinesi.js'], {
    crypto: require('node:crypto').webcrypto,
    setTimeout
  });
  return w;
}

const w = kur();
const GV = w.GV;
const A = w.demoApi;

/* ---------- akış tanımları ---------- */

test('doküman §8 zincirlerinin hepsi bir akışa karşılık gelir', () => {
  const l = GV.akisListesi();
  for (const a of ['proje', 'operasyon', 'rapor', 'uygunsuzluk',
                   'teklif', 'sozlesme', 'hakedis', 'mutabakat',
                   'fatura', 'tahsilat', 'taseronOdeme']) {
    assert.ok(l.includes(a), 'eksik akış: ' + a);
  }
});

test('her akışın gecis tablosundaki hedefler yine o akışın durumlarıdır', () => {
  for (const ad of GV.akisListesi()) {
    const a = GV.akis(ad);
    const bilinen = new Set(GV.akisDurumlari(ad).map(d => d.k));
    for (const [kaynak, hedefler] of Object.entries(a.gecis)) {
      assert.ok(bilinen.has(kaynak), `${ad}: '${kaynak}' durum sözlüğünde yok`);
      for (const h of hedefler) {
        assert.ok(bilinen.has(h), `${ad}: '${kaynak}' → '${h}' hedefi sözlükte yok`);
      }
    }
  }
});

/* ---------- mevcut demo veri tutarlılığı ----------
   Durma şartı: "Bir durum geçişi mevcut demo veriyi tutarsız hale
   getiriyorsa dur." Bu test, her çekirdek kaydın bulunduğu durumun
   makinede TANIMLI olduğunu kilitler. */
test('çekirdek verideki her kaydın durumu makinede tanımlıdır', () => {
  const kapsam = [
    ['proje', 'projeler'], ['rapor', 'raporlar'], ['uygunsuzluk', 'uygunsuzluklar'],
    ['teklif', 'teklifler'], ['sozlesme', 'sozlesmeler'], ['hakedis', 'hakedisler'],
    ['mutabakat', 'mutabakat'], ['tahsilat', 'faturalar'], ['taseronOdeme', 'taseronHakedisleri'],
    ['faturaGrubu', 'faturaGruplari'], ['sahaKontrol', 'sahaKontroller'],
    ['yenidenKontrol', 'yenidenKontroller'], ['eksikEkipman', 'eksikEkipmanlar'],
    ['kaliteDokuman', 'kaliteDokumanlari'], ['denetim', 'denetimler'],
    ['dof', 'duzelticiFaaliyetler'], ['sikayet', 'musteriSikayetleri'],
    ['cihaz', 'olcumCihazlari'], ['ekipman', 'ekipmanlar'], ['personel', 'personeller'],
    ['musteri', 'musteriler'], ['hizmet', 'hizmetler'], ['fiyatListesi', 'fiyatListeleri'],
    ['raporSablonu', 'raporSablonlari'], ['veriAktarimi', 'veriAktarimlari']
  ];
  for (const [akis, kol] of kapsam) {
    const a = GV.akis(akis);
    for (const k of A.liste(kol)) {
      const d = k[a.alan];
      assert.ok(Object.prototype.hasOwnProperty.call(a.gecis, d),
        `${kol}/${k.id}: '${d}' durumu ${akis} akışında tanımlı değil`);
    }
  }
});

test('operasyon ve rapor akışları lokasyon ve iş emri kayıtlarını kapsar', () => {
  const op = GV.akis('operasyon'), rp = GV.akis('rapor');
  for (const l of A.liste('lokasyonlar')) {
    assert.ok(op.gecis[l.operasyonDurum], `${l.id}: ${l.operasyonDurum}`);
    assert.ok(rp.gecis[l.raporDurum], `${l.id}: ${l.raporDurum}`);
  }
  for (const ie of A.liste('isEmirleri')) {
    assert.ok(op.gecis[ie.operasyonDurum], `${ie.id}: ${ie.operasyonDurum}`);
    assert.ok(rp.gecis[ie.raporDurum], `${ie.id}: ${ie.raporDurum}`);
  }
  const ft = GV.akis('fatura');
  for (const l of A.liste('lokasyonlar')) {
    assert.ok(ft.gecis[l.faturaDurum], `${l.id}: ${l.faturaDurum}`);
  }
});

/* ---------- YASAK GEÇİŞLER ---------- */

test('yasak geçiş: taslak rapor teknik inceleme atlanarak onaylanamaz', () => {
  const r = { id: 'X', durum: 'taslak', onaylayanId: 'PRS-004', raporTarihi: '2026-08-01' };
  const s = GV.gecisDene('rapor', r, 'onaylandi', { rol: 'sahip' });
  assert.strictEqual(s.uygun, false);
  assert.strictEqual(s.kod, 'onceki-durum');
  assert.match(s.sebep, /doğrudan geçilemez/);
});

test('yasak geçiş: onaylı rapor taslağa döndürülemez (yeni revizyon gerekir)', () => {
  const r = { id: 'X', durum: 'onaylandi' };
  const s = GV.gecisDene('rapor', r, 'taslak', { rol: 'sahip' });
  assert.strictEqual(s.uygun, false);
  assert.strictEqual(s.kod, 'onceki-durum');
});

test('yasak geçiş: teslim edilmiş rapor yeniden incelemeye alınamaz', () => {
  const s = GV.gecisDene('rapor', { id: 'X', durum: 'teslim-edildi' }, 'teknik-incelemede', { rol: 'sahip' });
  assert.strictEqual(s.uygun, false);
});

test('yasak geçiş: bilgi bekleyen lokasyon doğrudan sahaya çıkamaz', () => {
  const l = { id: 'L', operasyonDurum: 'bilgi-bekleniyor', kontrolTarihi: '2026-09-01' };
  const s = GV.gecisDene('operasyon', l, 'sahada', { rol: 'sahip' });
  assert.strictEqual(s.uygun, false);
  assert.strictEqual(s.kod, 'onceki-durum');
});

test('yasak geçiş: arşivlenmiş proje yeniden aktife alınamaz', () => {
  const s = GV.gecisDene('proje', { id: 'P', durum: 'arsivlendi' }, 'aktif', { rol: 'sahip' });
  assert.strictEqual(s.uygun, false);
});

test('yasak geçiş: tam ödenmiş taşeron hakedişi kısmi ödemeye dönemez', () => {
  const s = GV.gecisDene('taseronOdeme', { id: 'TH', durum: 'tam-odendi' }, 'kismen-odendi', { rol: 'finans' });
  assert.strictEqual(s.uygun, false);
});

test('yasak geçiş: mutabakat beklemeden lokasyon fatura grubuna alınamaz', () => {
  const s = GV.gecisDene('fatura', { id: 'L', faturaDurum: 'mutabakat-bekleniyor' }, 'fatura-grubunda', { rol: 'finans' });
  assert.strictEqual(s.uygun, false);
  assert.strictEqual(s.kod, 'onceki-durum');
});

test('aynı duruma geçiş yasaktır ve ayrı kodla döner', () => {
  const s = GV.gecisDene('teklif', { id: 'T', durum: 'gonderildi' }, 'gonderildi', { rol: 'satis' });
  assert.strictEqual(s.uygun, false);
  assert.strictEqual(s.kod, 'ayni');
});

test('tanımsız hedef durum reddedilir', () => {
  const s = GV.gecisDene('teklif', { id: 'T', durum: 'gonderildi' }, 'uçtu-gitti', { rol: 'satis' });
  assert.strictEqual(s.uygun, false);
  assert.strictEqual(s.kod, 'bilinmeyen-durum');
});

test('tanımsız akış reddedilir', () => {
  const s = GV.gecisDene('boyle-bir-akis-yok', {}, 'x');
  assert.strictEqual(s.uygun, false);
  assert.strictEqual(s.kod, 'akis-yok');
});

/* ---------- İZİN ---------- */

test('izin: saha rolü raporu onaylayamaz, teknik onaylayabilir', () => {
  const r = { id: 'X', durum: 'teknik-incelemede', onaylayanId: 'PRS-004', raporTarihi: '2026-08-01' };
  assert.strictEqual(GV.gecisDene('rapor', r, 'onaylandi', { rol: 'saha' }).kod, 'izin');
  assert.strictEqual(GV.gecisDene('rapor', r, 'onaylandi', { rol: 'teknik' }).uygun, true);
});

test('izin: müşteri rolü hiçbir ticari geçişi yapamaz', () => {
  const t = { id: 'T', durum: 'gonderildi' };
  assert.strictEqual(GV.gecisDene('teklif', t, 'kazanildi', { rol: 'musteri' }).kod, 'izin');
});

test('izin tanımlı değilse bütün roller geçebilir', () => {
  const e = { id: 'E', durum: 'aktif' };
  assert.strictEqual(GV.gecisDene('ekipman', e, 'bakimda', { rol: 'saha' }).uygun, true);
});

/* ---------- ZORUNLU ALAN ---------- */

test('zorunlu alan: kontrol tarihi olmadan planlandı olmaz', () => {
  const s = GV.gecisDene('operasyon', { id: 'L', operasyonDurum: 'tarih-onayi-bekleniyor' }, 'planlandi', { rol: 'sahip' });
  assert.strictEqual(s.uygun, false);
  assert.strictEqual(s.kod, 'zorunlu-alan');
  assert.deepStrictEqual(s.eksik, ['kontrolTarihi']);
});

test('zorunlu alan ctx.veri üzerinden karşılanabilir', () => {
  const s = GV.gecisDene('operasyon', { id: 'L', operasyonDurum: 'tarih-onayi-bekleniyor' },
    'planlandi', { rol: 'sahip', veri: { kontrolTarihi: '2026-09-01' } });
  assert.strictEqual(s.uygun, true);
});

test('zorunlu alan: onaylayan bilgisi olmadan rapor onaylanmaz', () => {
  const s = GV.gecisDene('rapor', { id: 'X', durum: 'teknik-incelemede', raporTarihi: '2026-08-01' },
    'onaylandi', { rol: 'teknik' });
  assert.strictEqual(s.kod, 'zorunlu-alan');
  assert.deepStrictEqual(s.eksik, ['onaylayanId']);
});

test('boş dizi dolu sayılmaz', () => {
  const s = GV.gecisDene('proje', { id: 'P', durum: 'planlama', musteriId: '', baslangic: '2026-01-01', bitis: '2026-12-31' },
    'aktif', { rol: 'sahip' });
  assert.strictEqual(s.kod, 'zorunlu-alan');
});

/* ---------- İŞ KURALI ÖN KOŞULU ---------- */

test('iş kuralı: mutabakatı tamamlanmayan lokasyon fatura grubuna alınamaz', () => {
  /* LOK-0104 mutabakat bekliyor; faturaya-hazir'a elle taşıyıp deniyoruz. */
  const l = Object.assign({}, A.kayit('lokasyonlar', 'LOK-0104'), { faturaDurum: 'faturaya-hazir' });
  const s = GV.gecisDene('fatura', l, 'fatura-grubunda', { rol: 'finans' });
  assert.strictEqual(s.uygun, false);
  assert.strictEqual(s.kod, 'kural');
});

test('iş kuralı: mutabakatı ve raporu tamam olan lokasyon fatura grubuna alınabilir', () => {
  const uygun = A.liste('lokasyonlar').map(l => ({ l, k: A.lokasyonFaturalanabilirMi(l.id) }))
    .filter(x => x.k.uygun)[0];
  assert.ok(uygun, 'faturalanabilir en az bir lokasyon olmalı');
  const l = Object.assign({}, uygun.l, { faturaDurum: 'faturaya-hazir' });
  assert.strictEqual(GV.gecisDene('fatura', l, 'fatura-grubunda', { rol: 'finans' }).uygun, true);
});

test('iş kuralı: yeniden kontrol gerekiyorsa uygunsuzluk kapanmaz', () => {
  const acik = A.liste('yenidenKontroller').filter(y => y.durum !== 'tamamlandi')[0];
  assert.ok(acik, 'tamamlanmamış yeniden kontrol olmalı');
  const u = { id: acik.uygunsuzlukId, durum: 'acik', kapanis: '2026-08-18', yenidenKontrol: 'gerekli' };
  const s = GV.gecisDene('uygunsuzluk', u, 'kapandi', { rol: 'kalite' });
  assert.strictEqual(s.uygun, false);
  assert.strictEqual(s.kod, 'kural');
});

test('iş kuralı: yeniden kontrol gerekmiyorsa uygunsuzluk kapanır', () => {
  const u = { id: 'UYG-YOK', durum: 'acik', kapanis: '2026-08-18', yenidenKontrol: 'gerekmiyor' };
  assert.strictEqual(GV.gecisDene('uygunsuzluk', u, 'kapandi', { rol: 'kalite' }).uygun, true);
});

/* ---------- HEDEF LİSTESİ ---------- */

test('gecisHedefleri uygun olmayanları da sebebiyle döndürür — buton gizlenmez', () => {
  const r = { id: 'X', durum: 'teknik-incelemede' };   /* onaylayanId yok */
  const h = GV.gecisHedefleri('rapor', r, { rol: 'teknik' });
  const onay = h.filter(x => x.k === 'onaylandi')[0];
  assert.ok(onay, 'onaylandi hedefi listelenmeli');
  assert.strictEqual(onay.uygun, false);
  assert.match(onay.sebep, /Zorunlu alan/);
  assert.strictEqual(onay.etiket, 'Onayla');
});

test('gecisHedefleri terminal durumda boş döner', () => {
  assert.deepStrictEqual(GV.gecisHedefleri('rapor', { id: 'X', durum: 'arsiv' }), []);
});

/* ---------- UYGULAMA ---------- */

test('gecisUygula tek yazma noktasıdır ve durumu değiştirir', async () => {
  const t = A.liste('teklifler').filter(x => x.durum === 'hazirlaniyor')[0];
  assert.ok(t);
  const r = await GV.gecisUygula('teklif', 'teklifler', t.id, 'gonderildi', { rol: 'satis', not: 'test' });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(A.kayit('teklifler', t.id).durum, 'gonderildi');
});

test('gecisUygula yasak geçişte yazmaz ve sebep döner', async () => {
  const t = A.liste('teklifler').filter(x => x.durum === 'kazanildi')[0];
  const onceki = t.durum;
  const r = await GV.gecisUygula('teklif', 'teklifler', t.id, 'kaybedildi', { rol: 'satis', sessiz: true });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.kod, 'onceki-durum');
  assert.strictEqual(A.kayit('teklifler', t.id).durum, onceki);
});

test('gecisUygula olmayan kayıtta ok:false döner, patlamaz', async () => {
  const r = await GV.gecisUygula('teklif', 'teklifler', 'YOK-999', 'gonderildi', { sessiz: true });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.kod, 'kayit-yok');
});

test('gecisUygula ek yamayı aynı komutun parçası olarak yazar', async () => {
  const d = A.liste('denetimler').filter(x => x.durum === 'acik')[0];
  assert.ok(d);
  const r = await GV.gecisUygula('denetim', 'denetimler', d.id, 'kapandi',
    { rol: 'kalite', sessiz: true, ekYama: { kapanisNotu: 'Bulgular giderildi.' } });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(A.kayit('denetimler', d.id).durum, 'kapandi');
  assert.strictEqual(A.kayit('denetimler', d.id).kapanisNotu, 'Bulgular giderildi.');
});

test('geçiş denetim izi bırakır', async () => {
  const oncekiLog = A.liste('islemKayitlari').length;
  const e = A.liste('ekipmanlar').filter(x => x.durum === 'aktif')[0];
  await GV.gecisUygula('ekipman', 'ekipmanlar', e.id, 'bakimda', { rol: 'sahip', sessiz: true });
  const log = A.liste('islemKayitlari');
  assert.ok(log.length > oncekiLog);
  const son = log[log.length - 1];
  assert.strictEqual(son.islem, 'durum-degisikligi');
  assert.strictEqual(son.yeni, 'bakimda');
});

/* ---------- BUTON ---------- */

test('gecisButonu disabled sebebini görünür kılar', () => {
  const kap = { id: '', hidden: true, className: '', innerHTML: '' };
  const btn = {
    disabled: false, _a: {},
    setAttribute(k, v) { this._a[k] = v; },
    removeAttribute(k) { delete this._a[k]; },
    set title(v) { this._t = v; }, get title() { return this._t; }
  };
  GV.gecisButonu(btn, { uygun: false, sebep: 'Zorunlu alan eksik: onaylayanId.' }, kap);
  assert.strictEqual(btn.disabled, true);
  assert.strictEqual(btn._a['aria-disabled'], 'true');
  assert.match(btn.title, /onaylayanId/);
  assert.strictEqual(kap.hidden, false);
  assert.match(kap.innerHTML, /onaylayanId/);
  assert.strictEqual(btn._a['aria-describedby'], kap.id);

  GV.gecisButonu(btn, { uygun: true }, kap);
  assert.strictEqual(btn.disabled, false);
  assert.strictEqual(kap.hidden, true);
  assert.strictEqual(btn._a['aria-describedby'], undefined);
});
