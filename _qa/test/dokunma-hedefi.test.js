/* Faz 14 · Adım 5 — dokunma hedefleri (doküman §9).
   "Touch: etkileşim alanları en az 44 x 44 px; iki kritik buton arasında en
   az 8 px boşluk."

   UYARI — DOĞRULAMA SINIRI: gerçek 44×44 ölçüsü yalnız tarayıcı layout'unda
   ölçülebilir. Bu test CSS KURALI düzeyinde çalışır: (a) her küçük kontrolün
   ≤980 bloğunda 44'lük bir hedef tanımı var mı, (b) komşu hedefler çakışacak
   kadar yakın mı (kutu + boşluk aritmetiği), (c) masaüstü görünen ölçüler
   değişmemiş mi. Gerçek render doğrulaması tarayıcıda yapılmalıdır. */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { KOK } = require('./yukleyici.js');

const css = f => fs.readFileSync(path.join(KOK, 'assets', 'css', f), 'utf8');

function medyaBlogu(metin, px) {
  const i = metin.indexOf('@media (max-width: ' + px + 'px)');
  assert.ok(i >= 0, px + 'px bloğu yok');
  const bas = metin.indexOf('{', i);
  let d = 0, j = bas;
  for (; j < metin.length; j++) {
    if (metin[j] === '{') d++;
    else if (metin[j] === '}') { d--; if (!d) break; }
  }
  return metin.slice(bas + 1, j);
}

const BLOK_980 = medyaBlogu(css('responsive.css'), 980);
const TEMEL = css('components.css') + '\n' + css('gavia-ui.css');

/** Bir seçicinin bloğundaki bildirimleri döndürür (basit, yeterli ayrıştırıcı). */
function bildirimler(metin, secici) {
  const kacis = secici.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(^|[,}\\n])\\s*' + kacis + '\\s*(,[^{]*)?\\{([^}]*)\\}', 'g');
  let m, hepsi = '';
  while ((m = re.exec(metin))) hepsi += m[3] + ';';
  return hepsi;
}
function deger(metin, secici, ozellik) {
  const b = bildirimler(metin, secici);
  const m = b.match(new RegExp(ozellik + '\\s*:\\s*([^;]+)'));
  return m ? m[1].trim() : null;
}
function px(v) { const m = v && v.match(/(\d+(?:\.\d+)?)px/); return m ? Number(m[1]) : null; }

const MIN = 44;

/* ================= 44'lük hedef ================= */

/* Görünen ölçüsü 44'ün altında olan ikon butonlar — görünmez katmanla büyür */
const KATMANLI = ['.ia-btn', '.pg-btn', '.pg-num', '.gv-iconbtn', '.gv-burger',
                  '.gv-modal-close', '.gv-fpanel-close'];

test('ikon butonların hepsi ≤980\'de 44×44 görünmez katman alır', () => {
  for (const sec of KATMANLI) {
    const b = bildirimler(BLOK_980, sec + '::after');
    assert.ok(b, sec + '::after katmanı yok');
    assert.strictEqual(px(deger(BLOK_980, sec + '::after', 'min-width')), MIN, sec + ' min-width');
    assert.strictEqual(px(deger(BLOK_980, sec + '::after', 'min-height')), MIN, sec + ' min-height');
    assert.match(b, /position:\s*absolute/, sec + ' katman absolute değil');
    assert.match(b, /transform:\s*translate\(-50%,\s*-50%\)/, sec + ' katman ortalanmamış');
  }
});

test('katman uygulanan butonlar konumlandırma bağlamı taşır', () => {
  for (const sec of KATMANLI) {
    const yerinde = /position:\s*relative/.test(bildirimler(BLOK_980, sec))
      || /position:\s*relative/.test(bildirimler(TEMEL, sec));
    assert.ok(yerinde, sec + ' için position:relative yok — katman yanlış yere oturur');
  }
});

test('metin butonları ve sekmeler ≤980\'de en az 44 yüksekliğe çıkar', () => {
  for (const sec of ['.btn', '.btn-sm', '.chip', '.gv-tab', '.lh-toggle', '.gcol-chk', '.gc-link']) {
    const h = px(deger(BLOK_980, sec, 'min-height'));
    assert.ok(h != null && h >= MIN, sec + ' min-height ' + h);
  }
  assert.ok(px(deger(BLOK_980, '.pg-size select', 'height')) >= MIN, 'pg-size select');
});

test('satır seçim kutusunun hedefi 44×44, görünen kutu 16px kalır', () => {
  assert.strictEqual(px(deger(BLOK_980, '.row-chk', 'width')), MIN);
  assert.strictEqual(px(deger(BLOK_980, '.row-chk', 'height')), MIN);
  /* görünen kutu ölçüsü DEĞİŞMEDİ */
  assert.strictEqual(px(deger(TEMEL, '.row-chk .chk-box', 'width')), 16);
  assert.ok(px(deger(BLOK_980, '.gv-bulk-th', 'width')) >= MIN,
    'seçim kolonu 44 hedefi taşıyacak kadar geniş değil');
});

test('aktif filtre çipinin kaldır düğmesi 44×44 olur', () => {
  assert.strictEqual(px(deger(BLOK_980, '.gv-achip .ac-x', 'width')), MIN);
  assert.strictEqual(px(deger(BLOK_980, '.gv-achip .ac-x', 'height')), MIN);
  assert.ok(px(deger(BLOK_980, '.gv-achip', 'min-height')) >= MIN);
});

/* ================= komşuluk / boşluk ================= */

/* Görünen kutu 44'ten küçükse, 44'lük hedefler çakışmasın diye
   boşluk >= 44 - görünenKutu olmalı. Ayrıca §9 mutlak alt sınırı 8px. */
const GRUPLAR = [
  { grup: '.row-acts',  oge: '.ia-btn', ogeEn: 30 },
  { grup: '.pg-btns',   oge: '.pg-btn', ogeEn: 32 }
];

test('komşu ikon butonların 44\'lük hedefleri çakışmıyor', () => {
  for (const g of GRUPLAR) {
    const bosluk = px(deger(BLOK_980, g.grup, 'gap'));
    assert.ok(bosluk != null, g.grup + ' için ≤980 boşluğu tanımlı değil');
    assert.ok(bosluk >= 8, g.grup + ' boşluğu §9 alt sınırının altında: ' + bosluk);
    assert.ok(g.ogeEn + bosluk >= MIN,
      `${g.grup}: ${g.ogeEn}px kutu + ${bosluk}px boşluk = ${g.ogeEn + bosluk}px merkez aralığı; `
      + `44'lük hedefler ${MIN - g.ogeEn - bosluk}px çakışır`);
  }
});

test('kritik buton grupları en az 8px boşluk taşır', () => {
  const gruplar = ['.lh-acts', '.rec-acts', '.gv-modal-acts', '.form-foot',
                   '.gv-bulk-bar .gvb-acts', '.gv-achips-acts', '.chips', '.gv-achips'];
  for (const g of gruplar) {
    const temel = px(deger(TEMEL, g, 'gap'));
    const mobil = px(deger(BLOK_980, g, 'gap'));
    const etkin = mobil != null ? mobil : temel;
    assert.ok(etkin != null, g + ' için gap tanımı bulunamadı');
    assert.ok(etkin >= 8, g + ' boşluğu 8px altında: ' + etkin);
  }
});

/* ================= masaüstü değişmedi ================= */

test('masaüstünde görünen ölçüler DEĞİŞMEDİ', () => {
  assert.strictEqual(px(deger(TEMEL, '.ia-btn', 'width')), 30);
  assert.strictEqual(px(deger(TEMEL, '.ia-btn', 'height')), 30);
  assert.strictEqual(px(deger(TEMEL, '.pg-btn, .pg-num', 'height')), 32);
  assert.strictEqual(px(deger(TEMEL, '.row-acts', 'gap')), 6);
  assert.strictEqual(px(deger(TEMEL, '.pg-btns', 'gap')), 5);
  assert.strictEqual(px(deger(TEMEL, '.gv-iconbtn', 'width')), 40);
  assert.strictEqual(px(deger(TEMEL, '.gv-burger', 'width')), 40);
  /* masaüstü .btn / .chip için min-height dayatılmadı */
  assert.strictEqual(deger(TEMEL, '.btn', 'min-height'), null);
  assert.strictEqual(deger(TEMEL, '.chip', 'min-height'), null);
});

test('44 kuralı yalnız ≤980 bloğunda; 1280/1100 blokları dokunmadı', () => {
  for (const bp of [1280, 1100]) {
    const b = medyaBlogu(css('responsive.css'), bp);
    assert.ok(!/44px/.test(b), bp + 'px bloğuna dokunma hedefi sızmış');
  }
});
