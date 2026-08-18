/* Faz 14 · Adım 7 — takvim ve grafik (doküman §9).
   "Takvim: aylık görünüm dar ekranda nokta/özet; ayrıntılar gün drawer'ında;
    metin 10 px altına inmez."
   "Grafik: yatay taşma yapmaz; veri tablosu veya metinsel özet alternatif
    olarak bulunur."

   İKİ KATMAN: üretilen HTML ve davranış jsdom'da GERÇEKTEN çalışır;
   taşma / görünürlük YALNIZ CSS KURALI düzeyinde doğrulanır. */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { KOK } = require('./yukleyici.js');

const jsdomModul = require('../jsdom-yolu.js').yukle();
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
const B980 = medyaBlogu(css('responsive.css'), 980);
const B640 = medyaBlogu(css('responsive.css'), 640);
const B480 = medyaBlogu(css('responsive.css'), 480);

/* ================= CSS KURAL DÜZEYİ ================= */

test('CSS kuralı: grafik SVG\'si kabını aşmaz', () => {
  const c = css('components.css');
  assert.match(c, /\.gv-chart-svg\s*\{[^}]*max-width:\s*100%/);
  assert.match(c, /\.gv-chart-svg\s*\{[^}]*height:\s*auto/);
  assert.match(c, /\.gv-chart-svg\s*\{[^}]*display:\s*block/);
});

test('CSS kuralı: veri tablosu masaüstünde görsel gizli, ≤980\'de görünür', () => {
  assert.match(css('components.css'), /\.gv-chart-data\s*\{[^}]*clip-path:\s*inset\(50%\)/);
  assert.match(B980, /\.gv-chart-data\s*\{[^}]*position:\s*static/);
  assert.match(B980, /\.gv-chart-data\s*\{[^}]*clip-path:\s*none/);
});

test('CSS kuralı: grafik veri tablosu dar ekranda yatay kaydırma gerektirmez', () => {
  /* liste tabloları 760px asgari genişlik taşır; grafik tablosu taşımaz */
  assert.match(css('components.css'), /\.gtable\s*\{[^}]*min-width:\s*760px/);
  assert.match(css('components.css'), /\.gv-chart-table\s*\{\s*min-width:\s*0\s*\}/);
});

test('CSS kuralı: takvim ızgarası taşmaz (7 × minmax(0,1fr))', () => {
  assert.match(css('components.css'),
    /\.cal-grid\s*\{[^}]*grid-template-columns:\s*repeat\(7,\s*minmax\(0,\s*1fr\)\)/);
  assert.ok(!/\.cal-grid\s*\{[^}]*min-width/.test(css('components.css')),
    'takvim ızgarasına asgari genişlik konmuş — dar ekranda taşar');
});

test('CSS kuralı: ≤480 olaylar noktaya iner, gün katmanı devreye girer', () => {
  assert.match(B480, /\.cal-ev\s*\{[^}]*font-size:\s*0/);
  assert.match(B480, /\.cal-ev::after\s*\{\s*content:\s*"•"/);
  assert.match(B480, /\.cal-ev\s*\{[^}]*pointer-events:\s*none/);
  assert.match(B480, /\.cal-dayopen\s*\{[^}]*display:\s*block/);
  assert.match(B480, /\.cal-dayopen\s*\{[^}]*position:\s*absolute/);
  assert.match(B480, /\.cal-dayopen\s*\{[^}]*min-height:\s*44px/);
  assert.match(css('components.css'), /\.cal-dayopen\s*\{\s*display:\s*none/);
});

test('CSS kuralı: takvim metni 10 px altına inmiyor', () => {
  /* nokta modundaki font-size:0 metin DEĞİL işarettir; okunan metin bunlar */
  const boyut = (blok, sec) => {
    const m = blok.match(new RegExp(sec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}'));
    if (!m) return null;
    const f = m[1].match(/font-size:\s*(\d+(?:\.\d+)?)px/);
    return f ? Number(f[1]) : null;
  };
  for (const [blok, ad] of [[B640, '≤640'], [B480, '≤480']]) {
    for (const sec of ['.cal-daynum', '.cal-ev::after', '.cal-more', '.cal-dow']) {
      const v = boyut(blok, sec);
      if (v != null) assert.ok(v >= 10, `${ad} ${sec} → ${v}px (10 px altı)`);
    }
  }
  /* temel değerler de 10'un üstünde */
  assert.ok(boyut(css('components.css'), '.cal-daynum') >= 10);
  assert.ok(boyut(css('components.css'), '.cal-dow') >= 10);
  assert.ok(boyut(B640, '.cal-ev') >= 10, '≤640 olay metni 10 px altında');
});

/* ================= ÜRETİLEN HTML / DAVRANIŞ ================= */

function kur() {
  const { JSDOM } = jsdomModul;
  const dom = new JSDOM('<!doctype html><html><body><div id="c"></div><div id="t"></div></body></html>',
    { url: 'http://localhost/t.html', runScripts: 'outside-only' });
  const win = dom.window;
  win.requestAnimationFrame = cb => cb();
  win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  win.crypto = require('node:crypto').webcrypto;
  for (const d of ['kimlik.js', 'para-zaman.js', 'app.js', 'components.js']) {
    win.eval(fs.readFileSync(path.join(KOK, 'assets', 'js', d), 'utf8'));
  }
  return { win, doc: win.document };
}

const VERI = [
  { etiket: 'Ocak', deger: 12, ton: 'acc' },
  { etiket: 'Şubat', deger: 30, ton: 'warn' },
  { etiket: 'Mart', deger: 8, ton: 'danger' }
];

for (const [ad, fn] of [['gvBar', 'gvBar'], ['gvSpark', 'gvSpark'], ['gvDonut', 'gvDonut']]) {
  test(ad + ' veri tablosu alternatifi üretir', () => {
    const { win, doc } = kur();
    win[fn]('#c', VERI, { baslik: 'Aylık kontrol' });
    const kutu = doc.querySelector('#c .gv-chart-data');
    assert.ok(kutu, ad + ' veri tablosu basmadı');
    const satirlar = kutu.querySelectorAll('tbody tr');
    assert.strictEqual(satirlar.length, VERI.length);
    assert.ok(kutu.querySelector('caption'), 'tablo caption taşımıyor');
    assert.strictEqual(kutu.querySelectorAll('thead th[scope="col"]').length >= 2, true);
    assert.strictEqual(satirlar[0].querySelector('th[scope="row"]').textContent, 'Ocak');
    /* metinsel özet */
    assert.match(kutu.querySelector('.gv-chart-ozet').textContent,
      /3 kalem · en yüksek: Şubat \(30\)/);
  });

  test(ad + ' SVG\'si veri tablosuna bağlanır ve ölçeklenir', () => {
    const { win, doc } = kur();
    win[fn]('#c', VERI, { baslik: 'Aylık kontrol' });
    const svg = doc.querySelector('#c svg');
    assert.ok(svg.getAttribute('viewBox'), 'viewBox yok — ölçeklenmez');
    assert.ok(svg.classList.contains('gv-chart-svg'));
    assert.strictEqual(svg.getAttribute('role'), 'img');
    const id = svg.getAttribute('aria-describedby');
    assert.ok(id, 'aria-describedby yok');
    assert.ok(doc.getElementById(id), 'aria-describedby hedefi yok');
    assert.ok(doc.getElementById(id).classList.contains('gv-chart-data'));
  });

  test(ad + ' veri tablosunda odaklanabilir öğe YOK (hayalet sekme durağı olmaz)', () => {
    const { win, doc } = kur();
    win[fn]('#c', VERI, { baslik: 'Aylık kontrol' });
    const odak = doc.querySelectorAll('#c .gv-chart-data a,#c .gv-chart-data button,'
      + '#c .gv-chart-data input,#c .gv-chart-data [tabindex]');
    assert.strictEqual(odak.length, 0);
  });
}

test('boş veride grafik boş durum basar, sahte tablo üretmez', () => {
  const { win, doc } = kur();
  win.gvBar('#c', [], { baslik: 'Aylık kontrol' });
  assert.ok(!doc.querySelector('#c .gv-chart-data'));
  assert.ok(doc.querySelector('#c .gv-empty'), 'boş durum basılmadı');
});

/* ---- takvim ---- */

function takvimKur() {
  const { win, doc } = kur();
  win.demoApi = { bugun: () => '2026-08-17' };
  win.gvCalendar('#t', {
    bugun: '2026-08-17', yil: 2026, ay: 7,
    olaylar: {
      '2026-08-17': [
        { baslik: 'IE-1', ton: 'info', link: 'a.html', detay: 'birinci' },
        { baslik: 'IE-2', ton: 'warn', link: 'b.html', detay: 'ikinci' },
        { baslik: 'IE-3', ton: 'ok', link: 'c.html', detay: 'üçüncü' },
        { baslik: 'IE-4', ton: 'ok', link: 'd.html', detay: 'dördüncü' }
      ],
      '2026-08-19': [{ baslik: 'IE-9', ton: 'info', link: 'e.html', detay: 'tek' }]
    }
  });
  return { win, doc };
}

test('olayı olan her gün için gün katmanı düğmesi basılır', () => {
  const { doc } = takvimKur();
  const dugmeler = doc.querySelectorAll('.cal-dayopen');
  assert.strictEqual(dugmeler.length, 2, 'olaylı gün sayısı kadar katman yok');
  const d17 = doc.querySelector('.cal-dayopen[data-daha="2026-08-17"]');
  assert.ok(d17);
  assert.match(d17.getAttribute('aria-label'), /17 Ağustos 2026 — 4 kayıt/);
  assert.strictEqual(d17.tagName, 'BUTTON');
});

test('gün katmanı tıklanınca o günün TÜM kayıtları modalda listelenir', () => {
  const { doc } = takvimKur();
  doc.querySelector('.cal-dayopen[data-daha="2026-08-17"]').click();
  const modal = doc.querySelector('.gv-modal');
  assert.ok(modal, 'gün modalı açılmadı');
  assert.match(modal.querySelector('h3').textContent, /17 Ağustos 2026/);
  assert.strictEqual(modal.querySelectorAll('.act-list .act-row').length, 4);
});

test('tek kayıtlı günde de katman var — nokta modunda ayrıntı erişilebilir kalır', () => {
  const { doc } = takvimKur();
  doc.querySelector('.cal-dayopen[data-daha="2026-08-19"]').click();
  assert.strictEqual(doc.querySelectorAll('.gv-modal .act-list .act-row').length, 1);
});

test('"+N daha" artık klavyeyle açılabilen bir BUTON', () => {
  const { doc } = takvimKur();
  const daha = doc.querySelector('.cal-more');
  assert.ok(daha, '+N daha basılmadı');
  assert.strictEqual(daha.tagName, 'BUTTON');
  assert.strictEqual(daha.type, 'button');
  assert.ok(daha.getAttribute('aria-label'));
  daha.click();
  assert.strictEqual(doc.querySelectorAll('.gv-modal .act-list .act-row').length, 4);
});

test('takvim ızgarası grid rolleri ve gün hücreleri doğru', () => {
  const { doc } = takvimKur();
  const g = doc.querySelector('.cal-grid');
  assert.strictEqual(g.getAttribute('role'), 'grid');
  assert.ok(g.getAttribute('aria-label'));
  assert.strictEqual(doc.querySelectorAll('.cal-dow[role="columnheader"]').length, 7);
  assert.ok(doc.querySelectorAll('.cal-day[role="gridcell"]').length >= 28);
});
