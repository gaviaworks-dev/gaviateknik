/* Faz 14 · Adım 3 — filtre drawer (doküman §9).
   "640 px altında drawer; uygula/temizle sticky; aktif filtre sayısı
   butonda görünür." Ayrıca drawer için Escape / Tab tuzağı / odak iadesi.

   İKİ KATMAN: davranış jsdom'da GERÇEKTEN çalıştırılır; sticky/tam genişlik
   yalnız CSS KURALI düzeyinde doğrulanır (jsdom layout hesaplamaz — gerçek
   render değildir, raporda ayrıca belirtilir). */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { KOK } = require('./yukleyici.js');

const jsdomModul = require('../jsdom-yolu.js').yukle();

/* ================= CSS KURAL DÜZEYİ ================= */

function cssOku(f) { return fs.readFileSync(path.join(KOK, 'assets', 'css', f), 'utf8'); }

/** Bir @media bloğunun gövdesini döndürür. */
function medyaBlogu(css, kosul) {
  const i = css.indexOf('@media (max-width: ' + kosul + 'px)');
  assert.ok(i >= 0, kosul + 'px bloğu yok');
  const bas = css.indexOf('{', i);
  let derinlik = 0, j = bas;
  for (; j < css.length; j++) {
    if (css[j] === '{') derinlik++;
    else if (css[j] === '}') { derinlik--; if (!derinlik) break; }
  }
  return css.slice(bas + 1, j);
}

test('CSS kuralı: ≤640 drawer tam genişlik', () => {
  const b = medyaBlogu(cssOku('responsive.css'), 640);
  assert.match(b, /\.gv-fpanel\s*\{[^}]*width:\s*100%/);
  assert.match(b, /\.gv-fpanel\s*\{[^}]*max-height:\s*100dvh/);
});

test('CSS kuralı: ≤640 başlık ve uygula/temizle sticky, gövde kayar', () => {
  const b = medyaBlogu(cssOku('responsive.css'), 640);
  assert.match(b, /\.gv-fpanel-head\s*\{[^}]*position:\s*sticky[^}]*top:\s*0/);
  assert.match(b, /\.gv-fpanel-foot\s*\{[^}]*position:\s*sticky/);
  assert.match(b, /\.gv-fpanel-foot\s*\{[^}]*bottom:\s*0/);
  assert.match(cssOku('components.css'), /\.gv-fpanel-body\s*\{[^}]*overflow-y:\s*auto/);
});

test('CSS kuralı: masaüstünde panel genişliği DEĞİŞMEDİ', () => {
  assert.match(cssOku('components.css'), /\.gv-fpanel\s*\{[^}]*width:\s*min\(392px,\s*92vw\)/);
});

/* ================= DAVRANIŞ (jsdom) ================= */

function kur(genislikAltinda) {
  const { JSDOM } = jsdomModul;
  const dom = new JSDOM(`<!doctype html><html><body>
    <div class="gv-listhead">
      <div class="lh-row">
        <input type="search" id="gvSearch">
        <div class="lh-acts">
          <button class="btn btn-sm btn-ghost gv-fp-open" type="button" id="gvFilterBtn">
            Gelişmiş Filtre<span class="fp-count" id="gvFpCount" hidden>0</span></button>
        </div>
      </div>
      <div class="chips" id="gvChips"></div>
    </div>
    <div class="gv-achips-row" id="gvAchips" hidden></div>
    </body></html>`, { url: 'http://localhost/t.html', runScripts: 'outside-only' });

  const win = dom.window;
  win.matchMedia = q => ({
    matches: /max-width:\s*(640|480)px/.test(q) ? genislikAltinda : !genislikAltinda,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}
  });
  win.requestAnimationFrame = cb => cb();
  for (const d of ['kimlik.js', 'para-zaman.js', 'app.js', 'filters.js']) {
    win.eval(fs.readFileSync(path.join(KOK, 'assets', 'js', d), 'utf8'));
  }
  const veri = [
    { id: 'A', ad: 'Alfa', onem: 'kritik', tutar: 100 },
    { id: 'B', ad: 'Beta', onem: 'orta', tutar: 500 },
    { id: 'C', ad: 'Cem', onem: 'orta', tutar: 900 }
  ];
  let son = null;
  const f = win.gvFilter({
    veri: () => veri,
    arama: ['ad'],
    cipler: { alan: 'onem', secenekler: [{ k: 'kritik', ad: 'Kritik' }, { k: 'orta', ad: 'Orta' }] },
    alanlar: [
      { k: 'onem', ad: 'Önem', tur: 'coklu', secenekler: [{ deger: 'kritik', ad: 'Kritik' }, { deger: 'orta', ad: 'Orta' }] },
      { k: 'tutar', ad: 'Tutar', tur: 'aralik' }
    ],
    degisti: s => { son = s; }
  });
  return { win, doc: win.document, f, sonuc: () => son };
}

test('filtre butonu drawer açar; drawer dialog rolü ve aria-modal taşır', () => {
  const { doc } = kur(true);
  doc.getElementById('gvFilterBtn').click();
  const panel = doc.querySelector('.gv-fpanel');
  assert.ok(panel, 'drawer açılmadı');
  assert.strictEqual(panel.getAttribute('role'), 'dialog');
  assert.strictEqual(panel.getAttribute('aria-modal'), 'true');
  assert.ok(doc.getElementById('gvFpBaslik'), 'başlık bağı yok');
});

test('drawer açılınca gövde kaydırma kilidi devreye girer, kapanınca çözülür', () => {
  const { doc } = kur(true);
  doc.getElementById('gvFilterBtn').click();
  assert.ok(doc.documentElement.classList.contains('gv-scroll-locked'));
  doc.querySelector('.gv-fpanel-close').click();
  assert.ok(!doc.documentElement.classList.contains('gv-scroll-locked'));
});

test('drawer Escape ile kapanır ve odak tetikleyiciye döner', () => {
  const { win, doc } = kur(true);
  const tetik = doc.getElementById('gvFilterBtn');
  tetik.focus();
  tetik.click();
  assert.ok(doc.querySelector('.gv-fpanel'));
  /* ilk odak drawer içindedir */
  assert.ok(doc.querySelector('.gv-fpanel').contains(doc.activeElement),
    'ilk odak drawer içinde değil');
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.strictEqual(doc.activeElement, tetik, 'odak tetikleyiciye iade edilmedi');
});

test('Tab tuzağı drawer içinde döner', () => {
  const { win, doc } = kur(true);
  doc.getElementById('gvFilterBtn').click();
  const panel = doc.querySelector('.gv-fpanel');
  const odaklanabilir = panel.querySelectorAll('button,input,select,textarea,a[href]');
  const son = odaklanabilir[odaklanabilir.length - 1];
  son.focus();
  const ev = new win.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  doc.dispatchEvent(ev);
  assert.ok(ev.defaultPrevented, 'son öğede Tab yakalanmadı');
  assert.strictEqual(doc.activeElement, odaklanabilir[0]);
});

test('uygula ve temizle drawer içinde her zaman erişilebilir (foot butonları)', () => {
  const { doc } = kur(true);
  doc.getElementById('gvFilterBtn').click();
  const foot = doc.querySelector('.gv-fpanel-foot');
  assert.ok(foot.querySelector('[data-uygula]'), 'Uygula yok');
  assert.ok(foot.querySelector('[data-temizle]'), 'Temizle yok');
});

test('aktif filtre sayısı butonda görünür ve ada yazılır', () => {
  const { doc } = kur(true);
  const btn = doc.getElementById('gvFilterBtn');
  const sayac = doc.getElementById('gvFpCount');
  assert.strictEqual(sayac.hidden, true, 'filtre yokken sayaç görünüyor');

  btn.click();
  const panel = doc.querySelector('.gv-fpanel');
  panel.querySelector('[data-coklu="onem"] .chip[data-deger="orta"]').click();
  /* panel içi sayaç canlı güncellenir */
  assert.strictEqual(panel.querySelector('#gvFpPanelCount').textContent, '1');
  panel.querySelector('[data-uygula]').click();

  assert.strictEqual(sayac.hidden, false);
  assert.strictEqual(sayac.textContent, '1');
  assert.match(btn.getAttribute('aria-label'), /1 aktif filtre/);
  assert.ok(btn.classList.contains('is-on'));
});

test('iki filtre uygulanınca sayaç 2 olur; temizlenince sıfırlanır', () => {
  const { doc } = kur(true);
  const btn = doc.getElementById('gvFilterBtn');
  btn.click();
  let panel = doc.querySelector('.gv-fpanel');
  panel.querySelector('[data-coklu="onem"] .chip[data-deger="orta"]').click();
  const min = panel.querySelector('[data-aralik="tutar"][data-uc="min"]');
  min.value = '400';
  min.dispatchEvent(new doc.defaultView.Event('input', { bubbles: true }));
  assert.strictEqual(panel.querySelector('#gvFpPanelCount').textContent, '2');
  panel.querySelector('[data-uygula]').click();
  assert.strictEqual(doc.getElementById('gvFpCount').textContent, '2');

  btn.click();
  panel = doc.querySelector('.gv-fpanel');
  panel.querySelector('[data-temizle]').click();
  assert.strictEqual(doc.getElementById('gvFpCount').hidden, true);
  assert.ok(!btn.classList.contains('is-on'));
});

test('drawer masaüstünde de aynı sözleşmeyle açılır (davranış kırılıma bağlı değil)', () => {
  const { doc } = kur(false);
  doc.getElementById('gvFilterBtn').click();
  const panel = doc.querySelector('.gv-fpanel');
  assert.ok(panel);
  assert.ok(panel.querySelector('[data-uygula]'));
});

test('filtre uygulaması sonucu gerçekten süzer', () => {
  const { doc, sonuc } = kur(true);
  doc.getElementById('gvFilterBtn').click();
  const panel = doc.querySelector('.gv-fpanel');
  panel.querySelector('[data-coklu="onem"] .chip[data-deger="kritik"]').click();
  panel.querySelector('[data-uygula]').click();
  assert.deepStrictEqual(sonuc().map(x => x.id), ['A']);
});
