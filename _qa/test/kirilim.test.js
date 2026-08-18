/* Faz 14 · Adım 2 — kırılım tokenları TEK KAYNAK.
   CSS `@media` koşulu var() kabul etmediği için literal yazılır; bu test
   literallerin token bloğundan ayrışmasına izin vermez. */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { KOK } = require('./yukleyici.js');

const CSS_DIZIN = path.join(KOK, 'assets', 'css');
const cssDosyalari = fs.readdirSync(CSS_DIZIN).filter(f => f.endsWith('.css'));

function oku(f) { return fs.readFileSync(path.join(CSS_DIZIN, f), 'utf8'); }

/* ---- token bloğu ---- */
function tokenlar() {
  const s = oku('gavia-ui.css');
  const o = {};
  const re = /--bp-(xl|lg|md|sm|xs)\s*:\s*(\d+)px/g;
  let m;
  while ((m = re.exec(s))) o[m[1]] = Number(m[2]);
  return o;
}

const BP = tokenlar();

test('beş kırılım tokenı gavia-ui.css içinde tanımlıdır', () => {
  assert.deepStrictEqual(Object.keys(BP).sort(), ['lg', 'md', 'sm', 'xl', 'xs']);
});

test('kırılım DEĞERLERİ bu fazda değişmez (doküman §9 sözleşmesi)', () => {
  assert.deepStrictEqual(BP, { xl: 1280, lg: 1100, md: 980, sm: 640, xs: 480 });
});

test('token yalnız TEK dosyada tanımlanır', () => {
  for (const f of cssDosyalari) {
    if (f === 'gavia-ui.css') continue;
    assert.ok(!/--bp-(xl|lg|md|sm|xs)\s*:/.test(oku(f)),
      f + ' kırılım tokenını ikinci kez tanımlıyor');
  }
});

/* ---- CSS @media literalleri ---- */
function genislikKosullari() {
  const bulunan = [];
  for (const f of cssDosyalari) {
    const s = oku(f);
    const re = /@media[^{]*?\((max|min)-width:\s*(\d+)px\)/g;
    let m;
    while ((m = re.exec(s))) {
      bulunan.push({ dosya: f, yon: m[1], px: Number(m[2]),
                     satir: s.slice(0, m.index).split('\n').length });
    }
  }
  return bulunan;
}

test('her @media genişlik eşiği bir tokena karşılık gelir', () => {
  const degerler = Object.values(BP);
  for (const k of genislikKosullari()) {
    const beklenen = k.yon === 'max' ? k.px : k.px - 1;   /* min-width tokenın 1 üstü */
    assert.ok(degerler.includes(beklenen),
      `${k.dosya}:${k.satir} — (${k.yon}-width: ${k.px}px) tokenda yok`);
  }
});

test('@media satırı hangi tokena bağlı olduğunu yazar', () => {
  const adlar = Object.keys(BP);
  for (const f of cssDosyalari) {
    const satirlar = oku(f).split('\n');
    satirlar.forEach((satir, i) => {
      if (!/@media[^{]*?(max|min)-width:/.test(satir)) return;
      assert.ok(adlar.some(a => satir.includes('--bp-' + a)),
        `${f}:${i + 1} — @media satırı token adı taşımıyor: ${satir.trim()}`);
    });
  }
});

test('kullanılan token seti dokümandaki beş kırılımın tamamını kapsar', () => {
  const kullanilan = new Set(genislikKosullari()
    .map(k => (k.yon === 'max' ? k.px : k.px - 1)));
  for (const [ad, px] of Object.entries(BP)) {
    assert.ok(kullanilan.has(px), `--bp-${ad} (${px}px) hiçbir @media tarafından kullanılmıyor`);
  }
});

/* ---- JS yedeği ---- */
test('app.js yedek eşikleri CSS tokenlarıyla aynıdır', () => {
  const js = fs.readFileSync(path.join(KOK, 'assets', 'js', 'app.js'), 'utf8');
  const m = js.match(/var BP_YEDEK = \{([^}]+)\}/);
  assert.ok(m, 'app.js içinde BP_YEDEK bulunamadı');
  const yedek = {};
  for (const p of m[1].split(',')) {
    const [a, v] = p.split(':').map(x => x.trim());
    if (a) yedek[a] = Number(v);
  }
  assert.deepStrictEqual(yedek, BP);
});

test('sayfa kodu kırılım eşiğini elle yazmaz', () => {
  const jsDizin = path.join(KOK, 'assets', 'js');
  const degerler = Object.values(BP);
  for (const f of fs.readdirSync(jsDizin).filter(x => x.endsWith('.js'))) {
    if (f === 'app.js') continue;               /* tek yedek burada */
    const s = fs.readFileSync(path.join(jsDizin, f), 'utf8');
    const re = /matchMedia\s*\(\s*['"`]\(([^)]*)\)/g;
    let m;
    while ((m = re.exec(s))) {
      const px = m[1].match(/(\d+)px/);
      if (!px) continue;
      assert.fail(`${f}: matchMedia içinde elle eşik (${px[1]}px) — GV.altinda kullan`);
    }
    for (const d of degerler) {
      assert.ok(!new RegExp('innerWidth\\s*[<>]=?\\s*' + d).test(s),
        `${f}: innerWidth karşılaştırmasında elle eşik (${d})`);
    }
  }
});

/* ---- HTML sayfaları ----
   Sayfaya özgü bileşenin kendi @media bloğu olabilir (o CSS global sayfaya
   taşınmaz), ama eşiği tokenlardan biri OLMAK ZORUNDA ve satır hangi tokena
   bağlı olduğunu yazmak zorunda. Böylece 73 sayfada kaçak eşik doğamaz. */
test('sayfa içi @media yalnız tanımlı tokenları kullanır ve tokenı yazar', () => {
  const degerler = Object.values(BP);
  const adlar = Object.keys(BP);
  const bulgular = [];
  for (const f of fs.readdirSync(KOK).filter(x => x.endsWith('.html'))) {
    const satirlar = fs.readFileSync(path.join(KOK, f), 'utf8').split('\n');
    satirlar.forEach((satir, i) => {
      const m = satir.match(/@media[^{]*?\((max|min)-width:\s*(\d+)px\)/);
      if (!m) return;
      const beklenen = m[1] === 'max' ? Number(m[2]) : Number(m[2]) - 1;
      if (!degerler.includes(beklenen)) {
        bulgular.push(`${f}:${i + 1} — kaçak eşik ${m[2]}px`);
      } else if (!adlar.some(a => satir.includes('--bp-' + a))) {
        bulgular.push(`${f}:${i + 1} — token adı yazılmamış`);
      }
    });
  }
  assert.deepStrictEqual(bulgular, []);
});

test('sayfa içi script matchMedia ile elle eşik yazmaz', () => {
  const bulgular = [];
  for (const f of fs.readdirSync(KOK).filter(x => x.endsWith('.html'))) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    const re = /matchMedia\s*\(\s*['"`][^'"`]*?(\d+)px/g;
    let m;
    while ((m = re.exec(s))) bulgular.push(`${f}: matchMedia ${m[1]}px — GV.altinda kullan`);
  }
  assert.deepStrictEqual(bulgular, []);
});
