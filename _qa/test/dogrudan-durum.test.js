/* Adım 3 — doğrudan durum yazımı kalmadığını KİLİTLER.
   Doküman §8: "Her geçiş tek bir transition fonksiyonundan yapılır;
   sayfa scripti status alanını doğrudan değiştirmez."

   Bu test kaynak taramasıdır: yeni bir sayfa `guncelle(...{durum:...})`
   ya da `durumDegistir(...)` yazarsa burada kırılır. */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { KOK } = require('./yukleyici.js');

const DURUM_ALANI = /\b(durum|operasyonDurum|raporDurum|faturaDurum|tahsilatDurum|taseronOdemeDurum)\s*:/;

function sayfalar() {
  return fs.readdirSync(KOK).filter(f => f.endsWith('.html')).sort();
}

/** `A.guncelle(` çağrısını dengeli parantezle kesip döndürür. */
function cagrilar(kaynak, ad) {
  const out = [];
  const re = new RegExp('\\b' + ad + '\\(', 'g');
  let m;
  while ((m = re.exec(kaynak))) {
    let i = m.end !== undefined ? m.index + m[0].length : re.lastIndex;
    let derinlik = 1;
    while (i < kaynak.length && derinlik) {
      if (kaynak[i] === '(') derinlik++;
      else if (kaynak[i] === ')') derinlik--;
      i++;
    }
    out.push({ metin: kaynak.slice(m.index, i), satir: kaynak.slice(0, m.index).split('\n').length });
  }
  return out;
}

test('hiçbir sayfa guncelle() ile durum alanı yazmıyor', () => {
  const ihlal = [];
  for (const f of sayfalar()) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    for (const c of cagrilar(s, 'A\\.guncelle')) {
      if (DURUM_ALANI.test(c.metin)) ihlal.push(`${f}:${c.satir}`);
    }
  }
  assert.deepStrictEqual(ihlal, [], 'durum alanı GV.gecisUygula dışından yazılıyor');
});

test('hiçbir sayfa demoApi.durumDegistir çağırmıyor — tek kapı GV.gecisUygula', () => {
  const ihlal = [];
  for (const f of sayfalar()) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    const i = s.indexOf('durumDegistir(');
    if (i !== -1) ihlal.push(`${f}:${s.slice(0, i).split('\n').length}`);
  }
  assert.deepStrictEqual(ihlal, []);
});

test('durumDegistir yalnız durum-makinesi.js içinden çağrılır', () => {
  const js = fs.readdirSync(path.join(KOK, 'assets', 'js')).filter(f => f.endsWith('.js'));
  const cagiran = js.filter(f => {
    const s = fs.readFileSync(path.join(KOK, 'assets', 'js', f), 'utf8');
    return /\bA?\.?durumDegistir\(/.test(s.replace(/durumDegistir:\s*durumDegistir/, ''));
  });
  assert.deepStrictEqual(cagiran.sort(), ['demo-api.js', 'durum-makinesi.js']);
});

test('geçiş kullanan her sayfa durum-makinesi.js yüklüyor', () => {
  const eksik = [];
  for (const f of sayfalar()) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    if (/GV\.gecis(Uygula|Dene|Hedefleri|TopluUygula|Butonu)/.test(s)
        && !s.includes('assets/js/durum-makinesi.js')) eksik.push(f);
  }
  assert.deepStrictEqual(eksik, []);
});

test('geçiş çağrılarında akış adı gerçekten tanımlı', () => {
  const { ortam } = require('./yukleyici.js');
  const w = ortam(['kimlik.js', 'demo-data.js', 'demo-api.js', 'durum-makinesi.js'], {
    crypto: require('node:crypto').webcrypto, setTimeout
  });
  const tanimli = new Set(w.GV.akisListesi());
  const bilinmeyen = [];
  for (const f of sayfalar()) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    const re = /GV\.gecis(?:Uygula|Dene|Hedefleri|TopluUygula)\(\s*'([^']+)'/g;
    let m;
    while ((m = re.exec(s))) {
      if (!tanimli.has(m[1])) bilinmeyen.push(`${f}: ${m[1]}`);
    }
  }
  assert.deepStrictEqual(bilinmeyen, []);
});

test('geçiş çağrılarındaki koleksiyon adı gerçekten var', () => {
  const { ortam } = require('./yukleyici.js');
  const w = ortam(['kimlik.js', 'demo-data.js', 'demo-api.js', 'durum-makinesi.js'], {
    crypto: require('node:crypto').webcrypto, setTimeout
  });
  const yok = [];
  for (const f of sayfalar()) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    const re = /GV\.gecis(?:Uygula|TopluUygula)\(\s*'[^']+'\s*,\s*'([^']+)'/g;
    let m;
    while ((m = re.exec(s))) {
      if (!Array.isArray(w.DEMO[m[1]])) yok.push(`${f}: ${m[1]}`);
    }
  }
  assert.deepStrictEqual(yok, []);
});

test('geçişte kullanılan hedef durumlar akışta tanımlı (sabit metinli çağrılar)', () => {
  const { ortam } = require('./yukleyici.js');
  const w = ortam(['kimlik.js', 'demo-data.js', 'demo-api.js', 'durum-makinesi.js'], {
    crypto: require('node:crypto').webcrypto, setTimeout
  });
  const hatali = [];
  for (const f of sayfalar()) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    const re = /GV\.gecis(?:Uygula|TopluUygula)\(\s*'([^']+)'\s*,\s*'[^']+'\s*,\s*[^,]+,\s*'([^']+)'/g;
    let m;
    while ((m = re.exec(s))) {
      const bilinen = w.GV.akisDurumlari(m[1]).map(d => d.k);
      if (!bilinen.includes(m[2])) hatali.push(`${f}: ${m[1]} → ${m[2]}`);
    }
  }
  assert.deepStrictEqual(hatali, []);
});
