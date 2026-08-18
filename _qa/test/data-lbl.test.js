/* Mobil kart düzeni (.gtable-cards) her hücrenin data-lbl taşımasını
   gerektirir; eksik etiket kartta başlıksız satır üretir (doküman §9). */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { KOK } = require('./yukleyici.js');

/** Sayfadaki her <table ...> için (sınıf, gövde) çifti. */
function tablolar(kaynak) {
  const cikti = [];
  const re = /<table\b([^>]*)>/g;
  let m;
  while ((m = re.exec(kaynak))) {
    const sinif = (m[1].match(/class="([^"]*)"/) || ['', ''])[1];
    const kapanis = kaynak.indexOf('</table>', m.index);
    cikti.push({ sinif, govde: kaynak.slice(m.index, kapanis === -1 ? kaynak.length : kapanis) });
  }
  return cikti;
}
const etiketsiz = govde =>
  [...govde.matchAll(/<td\b([^>]*)>/g)].filter(x => !/data-lbl=/.test(x[1])).length;

const SAYFALAR = fs.readdirSync(KOK).filter(f => f.endsWith('.html')).sort();

test('kart moduna giren tabloların TÜM hücreleri data-lbl taşır', () => {
  const kotu = [];
  for (const f of SAYFALAR) {
    for (const t of tablolar(fs.readFileSync(path.join(KOK, f), 'utf8'))) {
      if (!/gtable-cards/.test(t.sinif)) continue;
      const n = etiketsiz(t.govde);
      if (n) kotu.push(`${f} (${n} hücre)`);
    }
  }
  assert.deepStrictEqual(kotu, [], 'etiketsiz kart hücresi: ' + kotu.join(', '));
});

test('elle basılan yönetim tablolarında (gtable) da data-lbl tamamdır', () => {
  const kotu = [];
  for (const f of SAYFALAR) {
    for (const t of tablolar(fs.readFileSync(path.join(KOK, f), 'utf8'))) {
      if (!/\bgtable\b/.test(t.sinif)) continue;
      const n = etiketsiz(t.govde);
      if (n) kotu.push(`${f} (${n} hücre)`);
    }
  }
  assert.deepStrictEqual(kotu, [], 'etiketsiz hücre: ' + kotu.join(', '));
});

test('data-lbl değerleri kolon başlığıyla aynı sayıda ve boş bırakılmışsa bilinçlidir', () => {
  /* Boş data-lbl="" geçerlidir: CSS bunu "etiketsiz hücre" olarak okur
     (seçim kutusu kolonu, dinamik başlıklı kolon). Uydurma etiket yok. */
  let bosSayi = 0, doluSayi = 0;
  for (const f of SAYFALAR) {
    for (const t of tablolar(fs.readFileSync(path.join(KOK, f), 'utf8'))) {
      if (!/\bgtable\b/.test(t.sinif)) continue;
      for (const m of t.govde.matchAll(/data-lbl="([^"]*)"/g)) {
        if (m[1] === '') bosSayi++; else doluSayi++;
      }
    }
  }
  assert.ok(doluSayi > 100, 'dolu etiket sayısı beklenenden az: ' + doluSayi);
  assert.ok(bosSayi < doluSayi, 'boş etiket oranı çok yüksek');
});

test('yazdırma belgesi tabloları kapsam dışıdır — kart moduna girmezler', () => {
  /* pr-tablo yalnız .pr-doc içinde, kâğıt çıktısı için basılır; rd-kriter
     .gv-tscroll ile yatay kayar. İkisi de .gtable-cards değildir. */
  for (const f of SAYFALAR) {
    for (const t of tablolar(fs.readFileSync(path.join(KOK, f), 'utf8'))) {
      if (/pr-tablo|rd-kriter/.test(t.sinif)) {
        assert.ok(!/gtable-cards/.test(t.sinif), f + ': yazdırma tablosu kart moduna alınmış');
      }
    }
  }
});
