/* Faz 14 — DEĞİŞMEZ KURAL: "Body yatay taşmaz; yalnız tablo kapsayıcısı
   kontrollü kayabilir."  Ayrıca "tablo-kart geçişinde seçim ve satır
   aksiyonu korunur."

   UYARI: gerçek taşma yalnız tarayıcı layout'unda ölçülebilir. Bu test
   taşmanın KAYNAKLARINI kural düzeyinde kapatır: dar ekranda etkili olan
   her asgari genişlik ya bir kaydırma kapsayıcısının içindedir ya da
   kırılımda sıfırlanır. */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { KOK } = require('./yukleyici.js');

const CSS_DIZIN = path.join(KOK, 'assets', 'css');
const oku = f => fs.readFileSync(path.join(CSS_DIZIN, f), 'utf8');
const SAYFALAR = fs.readdirSync(KOK).filter(f => f.endsWith('.html')).sort();

function medyaBlogu(metin, px) {
  const i = metin.indexOf('@media (max-width: ' + px + 'px)');
  if (i < 0) return '';
  const bas = metin.indexOf('{', i);
  let d = 0, j = bas;
  for (; j < metin.length; j++) {
    if (metin[j] === '{') d++;
    else if (metin[j] === '}') { d--; if (!d) break; }
  }
  return metin.slice(bas + 1, j);
}

/* ================= kaydırma kapsayıcısı ================= */

test('yatay kaydırma yalnız tanımlı kapsayıcılarda açıktır', () => {
  const c = oku('components.css') + '\n' + oku('gavia-ui.css') + '\n' + oku('responsive.css');
  const izinli = ['.gv-tscroll', '.gc-body.flush', '.gv-tabbar', '.gv-menu', '.chips',
                  '.lh-chiprow', '.gv-fpanel-body', '.gv-modal-scroll', '.gv-modal',
                  '.gv-searchpop', '.gv-pop', '.act-list', '.gcol-list', '.gv-filelist',
                  '.wz-steps'];
  const re = /([^{}]+)\{([^}]*overflow-x:\s*(auto|scroll)[^}]*)\}/g;
  let m;
  const kacak = [];
  while ((m = re.exec(c))) {
    const secici = m[1].split(/[\n,]/)
      .map(x => x.replace(/\/\*[\s\S]*?\*\//g, '').trim())
      .filter(x => x && !x.startsWith('/*') && !x.startsWith('*') && !x.endsWith('*/'));
    for (const sec of secici) {
      if (!izinli.some(i => sec.includes(i))) kacak.push(sec);
    }
  }
  assert.deepStrictEqual(kacak, []);
});

test('gövde yatay taşmayı kırpar — sayfa hiçbir kırılımda sağa kaymaz', () => {
  assert.match(oku('gavia-ui.css'), /\bbody\s*\{[^}]*overflow-x:\s*clip/);
});

test('tablo kapsayıcısı yatay kaydırmayı kendi üstünde tutar', () => {
  assert.match(oku('components.css'), /\.gv-tscroll\s*\{[^}]*overflow-x:\s*auto/);
});

/* ================= asgari genişlik denetimi ================= */

/* Dar ekranda 320 px'i aşabilecek her asgari genişlik ya kaydırma
   kapsayıcısı içindeki bir tabloya aittir ya da kırılımda sıfırlanır. */
test('320 px üstündeki her asgari genişlik ya kaydırılabilir ya sıfırlanır', () => {
  const dosyalar = ['components.css', 'gavia-ui.css'];
  const B640 = medyaBlogu(oku('responsive.css'), 640);
  const B980 = medyaBlogu(oku('responsive.css'), 980);
  /* kaydırma kapsayıcısı içinde yaşadığı için taşma üretmeyenler */
  const KAYDIRILABILIR = ['.gtable', '.rec-table', '.tl-grid', '.linerow-head'];
  const bulgular = [];
  for (const f of dosyalar) {
    const metin = oku(f);
    const re = /([^{}]+)\{([^}]*min-width:\s*(\d+)px[^}]*)\}/g;
    let m;
    while ((m = re.exec(metin))) {
      const px = Number(m[3]);
      if (px <= 320) continue;
      const secici = m[1].split(/[\n,]/).map(x => x.trim()).filter(Boolean).pop();
      if (KAYDIRILABILIR.some(k => secici.includes(k))) continue;
      /* kırılımda sıfırlanmış mı */
      const kacis = secici.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const sifir = new RegExp(kacis + '[^{]*\\{[^}]*min-width:\\s*0');
      if (sifir.test(B640) || sifir.test(B980)) continue;
      bulgular.push(`${f}: ${secici} → min-width ${px}px (dar ekranda taşar)`);
    }
  }
  assert.deepStrictEqual(bulgular, []);
});

test('kart moduna geçen tablo asgari genişliğini bırakır', () => {
  const B640 = medyaBlogu(oku('responsive.css'), 640);
  assert.match(B640, /\.gtable-cards\s*\{[^}]*min-width:\s*0/);
  assert.match(B640, /\.gtable-cards\s*\{[^}]*display:\s*block/);
});

/* ================= seçim ve satır aksiyonu ================= */

test('kart modunda seçim hücresi ve satır aksiyonu GİZLENMEZ', () => {
  const B640 = medyaBlogu(oku('responsive.css'), 640);
  const B480 = medyaBlogu(oku('responsive.css'), 480);
  for (const blok of [B640, B480]) {
    for (const sec of ['.gv-bulk-td', '.gv-bulk-th', '.row-acts', '.ia-btn', '.row-chk']) {
      const kacis = sec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      /* Öğenin KENDİSİ gizlenmiş mi: seçiciden hemen sonra `{`, `,` ya da
         başka bir sınıf gelmeli — `.ia-btn span { display:none }` gibi
         TORUN kuralları buton etiketini kısaltır, butonu gizlemez. */
      const gizli = new RegExp(kacis + '(?![\\w-])[^{,]*?\\{[^}]*display:\\s*none');
      const eslesme = blok.match(gizli);
      const kendisi = eslesme && !/[\s>+~]/.test(
        eslesme[0].slice(sec.length, eslesme[0].indexOf('{')).replace(/^\s*/, ''));
      assert.ok(!kendisi, sec + ' dar ekranda gizlenmiş — seçim/aksiyon kaybolur');
    }
  }
  /* kart modunda seçim hücresi konumlandırılıyor (gizlenmiyor) */
  assert.match(B640, /\.gtable-cards \.gv-bulk-td\s*\{[^}]*justify-content/);
  assert.match(B640, /\.gtable-cards td \.row-acts\s*\{[^}]*justify-content/);
});

/* ================= sayfa içi genişlik kaçakları ================= */

test('sayfa içi stillerde dar ekranı aşan sabit genişlik yok', () => {
  /* `max-width` taşma üretmez (kısıt, dayatma değil) — kapsam dışı.
     Dar ekranı aşan `width` / `min-width` ise ya kaydırma kapsayıcısındaki
     bir tabloya ait olmalı ya da hiç olmamalı. */
  const KAYDIRILABILIR = ['.ry-mx'];    /* gv-tscroll içindeki geniş matris */
  const bulgular = [];
  for (const f of SAYFALAR) {
    const kaynak = fs.readFileSync(path.join(KOK, f), 'utf8');
    const stiller = [...kaynak.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
    if (!stiller) continue;
    const re = /([^{}]+)\{([^}]*(?:^|[;{\s])(?:min-)?width:\s*(\d{3,})px[^}]*)\}/gm;
    let m;
    while ((m = re.exec(stiller))) {
      if (/max-width:\s*\d{3,}px/.test(m[2]) && !/(?:^|[;{\s])(?:min-)?width:\s*\d{3,}px/.test(m[2])) continue;
      const px = Number(m[3]);
      if (px <= 320) continue;
      const secici = m[1].split(/[\n,]/).map(x => x.trim()).filter(x => x && !x.startsWith('/*')).pop() || '';
      if (KAYDIRILABILIR.some(k => secici.includes(k))) continue;
      bulgular.push(`${f}: ${secici} → ${px}px`);
    }
  }
  assert.deepStrictEqual(bulgular, []);
});

test('geniş sayfa içi tablo gerçekten kaydırma kapsayıcısında', () => {
  /* Yukarıda muaf tutulan geniş matrisin kapsayıcısı DOĞRULANIR — muafiyet
     körü körüne verilmez. */
  const kaynak = fs.readFileSync(path.join(KOK, 'roller-yetkiler.html'), 'utf8');
  assert.match(kaynak, /<div class="gv-tscroll"><table class="gtable ry-mx"/);
});

test('sayfa içi tablolar ya kart moduna girer ya kaydırma kapsayıcısındadır', () => {
  const bulgular = [];
  for (const f of SAYFALAR) {
    const kaynak = fs.readFileSync(path.join(KOK, f), 'utf8');
    const re = /<table\b([^>]*)>/g;
    let m;
    while ((m = re.exec(kaynak))) {
      const nitelik = m[1];
      if (/gtable-cards/.test(nitelik)) continue;
      if (!/class="[^"]*gtable/.test(nitelik)) continue;      /* yazdırma tabloları */
      /* aynı satırda ya da öncesinde gv-tscroll kapsayıcısı olmalı */
      const onces = kaynak.slice(Math.max(0, m.index - 400), m.index);
      if (/gv-tscroll/.test(onces)) continue;
      bulgular.push(`${f}: gtable ne kart modunda ne kaydırma kapsayıcısında`);
    }
  }
  assert.deepStrictEqual(bulgular, []);
});
