/* Doküman §8 "Route ve kayıt seçimi" — detay route'unda id zorunludur. */
const { test, skip } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { KOK } = require('./yukleyici.js');

const JSDOMMod = require('../jsdom-yolu.js').yukle();
if (!JSDOMMod) { skip('jsdom bulunamadı — route testleri atlandı'); return; }
const { JSDOM } = JSDOMMod;

const DETAYLAR = fs.readdirSync(KOK).filter(f => f.endsWith('-detay.html')).sort();

function ac(dosya, sorgu) {
  const dom = new JSDOM(fs.readFileSync(path.join(KOK, dosya), 'utf8'), {
    url: `https://x/${dosya}?role=sahip${sorgu || ''}`,
    runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  const hata = [];
  for (const sc of w.document.querySelectorAll('script')) {
    const src = sc.getAttribute('src');
    const kod = src ? fs.readFileSync(path.join(KOK, src), 'utf8') : sc.textContent;
    try { w.eval(kod); } catch (e) { if (!/navigation|Not implemented/.test(String(e))) hata.push(String(e.message)); }
  }
  return { w, hata };
}
const baslik = w => (w.document.querySelector('.gv-notfound h2') || {}).textContent || null;

test('hiçbir detay sayfasında sabit kayıt numarasına düşülmüyor', () => {
  const kotu = DETAYLAR.filter(f => /GV\.q\('id'\)\s*\|\|/.test(fs.readFileSync(path.join(KOK, f), 'utf8')));
  assert.deepStrictEqual(kotu, [], 'sabit id düşüşü kalan sayfa: ' + kotu.join(', '));
});

test('14 detay sayfasının tamamı GV.kayitId kullanıyor', () => {
  assert.strictEqual(DETAYLAR.length, 14);
  for (const f of DETAYLAR) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    assert.match(s, /GV\.kayitId\(\{/, f + ': GV.kayitId yok');
  }
});

for (const f of DETAYLAR) {
  test(`${f}: id yokken "Kayıt seçilmedi", geçersiz idde "Kayıt bulunamadı"`, () => {
    const a = ac(f, '');
    assert.strictEqual(baslik(a.w), 'Kayıt seçilmedi', f + ' idsiz');
    assert.deepStrictEqual(a.hata, [], f + ' idsiz JS hatası');

    const b = ac(f, '&id=OLMAYAN-KAYIT-999');
    assert.strictEqual(baslik(b.w), 'Kayıt bulunamadı', f + ' geçersiz id');
    assert.deepStrictEqual(b.hata, [], f + ' geçersiz id JS hatası');
  });
}

test('"Kayıt seçilmedi" ekranı listeye dönüş ve geri aksiyonu sunar', () => {
  const { w } = ac('hizmet-detay.html', '');
  const liste = w.document.querySelector('.nf-acts a[href]');
  assert.ok(liste, 'listeye dön bağlantısı yok');
  assert.match(liste.getAttribute('href'), /hizmet-katalogu\.html/);
  assert.ok(w.document.querySelector('[data-gv-geri]'), 'geri dön aksiyonu yok');
});

test('"Kayıt bulunamadı" ekranı geri dön VE arama aksiyonu sunar', () => {
  const { w } = ac('hizmet-detay.html', '&id=YOK');
  assert.ok(w.document.querySelector('[data-gv-geri]'), 'geri dön yok');
  assert.ok(w.document.querySelector('[data-gv-ara]'), 'arama aksiyonu yok');
  assert.ok(w.document.querySelector('.nf-acts a[href]'), 'listeye dön yok');
});

test('kayıt bulunamadı metni kaydın varlığını ifşa etmez', () => {
  const { w } = ac('hizmet-detay.html', '&id=YOK');
  const p = w.document.querySelector('.gv-notfound p').textContent;
  /* Aynı metin hem olmayan hem yetkisiz kayıt için geçerli olmalı */
  assert.match(p, /sistemde yok veya erişim kapsamınızın dışında/);
});

test('geçerli id ile detay normal açılır — koruma yanlış tetiklenmiyor', () => {
  const { w, hata } = ac('hizmet-detay.html', '&id=HZM-KLD-001-D');
  assert.strictEqual(baslik(w), null, 'geçerli idde hata ekranı çıktı');
  assert.deepStrictEqual(hata, []);
  assert.ok(w.document.querySelector('main.gv-main').textContent.length > 200);
});

test('GV.kayitId id varsa onu döndürür, ekran basmaz', () => {
  const { w } = ac('hizmet-detay.html', '&id=HZM-KLD-001-D');
  assert.strictEqual(w.GV.kayitId({ listeHref: 'x.html' }), 'HZM-KLD-001-D');
  assert.strictEqual(baslik(w), null);
});
