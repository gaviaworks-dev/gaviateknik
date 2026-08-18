/* Adım 4 — ortak form standardı (doküman §11).
   Şema doğrulaması, ilk hataya odak, üstte hata özeti, submit kilidi,
   dirty state ve çıkış uyarısı.

   jsdom gerekir; yoksa test dürüstçe atlanır (uydurma sonuç üretilmez). */
const { test, skip } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { KOK } = require('./yukleyici.js');

const jsdomModul = require('../jsdom-yolu.js').yukle();

function kur(alanHtml, secenek) {
  const { JSDOM } = jsdomModul;
  const dom = new JSDOM(`<!doctype html><html><body>
    <form id="f" novalidate>
      ${alanHtml}
      <div class="form-foot">
        <span class="gf-hint" data-son-kayit></span>
        <button type="button" id="btnIptal" data-form-aksiyon="iptal">İptal</button>
        <button type="button" id="btnTaslak" data-form-aksiyon="taslak">Taslak</button>
        <button type="button" id="btnKaydet" data-form-aksiyon="kaydet">Kaydet</button>
      </div>
    </form></body></html>`, { url: 'http://localhost/test.html', runScripts: 'outside-only' });

  const win = dom.window;
  win.localStorage.clear();
  /* kimlik.js + form-controller.js'yi bu pencerede çalıştır */
  for (const d of ['kimlik.js', 'form-controller.js']) {
    const kod = fs.readFileSync(path.join(KOK, 'assets', 'js', d), 'utf8');
    win.eval(kod);
  }
  win.gvToast = () => {};
  win.gvConfirm = () => Promise.resolve({ onay: false });
  win.GV.esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  win.GV.n = v => String(v);
  win.GV.d = v => String(v);

  const fc = win.gvFormController(Object.assign({ form: '#f' }, secenek));
  return { win, doc: win.document, fc };
}

const ALANLAR = `
  <div class="gfield">
    <label for="a">Ünvan</label>
    <input type="text" id="a" name="unvan" required>
    <span class="gf-err"></span>
  </div>
  <div class="gfield">
    <label for="b">E-posta</label>
    <input type="email" id="b" name="eposta">
    <span class="gf-err"></span>
  </div>
  <div class="gfield">
    <label for="c">Başlangıç</label>
    <input type="date" id="c" name="baslangic">
    <span class="gf-err"></span>
  </div>
  <div class="gfield">
    <label for="d">Bitiş</label>
    <input type="date" id="d" name="bitis">
    <span class="gf-err"></span>
  </div>
  <div class="gfield">
    <label for="e">Tutar</label>
    <input type="number" id="e" name="tutar">
    <span class="gf-err"></span>
  </div>`;

const SEMA = {
  unvan: { etiket: 'Ünvan', zorunlu: true, enAz: 3 },
  eposta: { etiket: 'E-posta', tur: 'eposta' },
  baslangic: { etiket: 'Başlangıç', tur: 'tarih' },
  bitis: { etiket: 'Bitiş', tur: 'tarih', sonra: 'baslangic' },
  tutar: { etiket: 'Tutar', tur: 'sayi', enAz: 0, enCok: 1000 }
};

if (!jsdomModul) {
  test('form-controller testleri jsdom olmadan çalıştırılamadı', (t) => t.skip('jsdom yok — bkz. _qa/README.md'));
} else {

test('şema zorunlu alanı yakalar ve özet üstte listeler', () => {
  const { doc, fc } = kur(ALANLAR, { sema: SEMA, gonder: () => Promise.resolve() });
  const s = fc.dogrula();
  assert.strictEqual(s.gecerli, false);
  assert.strictEqual(s.hatalar.length, 1);
  assert.strictEqual(s.hatalar[0].ad, 'unvan');
  const ozet = fc.ozetKabi;
  assert.strictEqual(ozet.hidden, false);
  assert.strictEqual(ozet, doc.querySelector('#f').firstElementChild, 'özet formun EN ÜSTÜNDE');
  assert.match(ozet.textContent, /1 alanda düzeltme gerekiyor/);
  assert.match(ozet.textContent, /Ünvan/);
  assert.strictEqual(ozet.getAttribute('role'), 'alert');
});

test('ilk hataya odaklanır', () => {
  const { doc, fc } = kur(ALANLAR, { sema: SEMA, gonder: () => Promise.resolve() });
  doc.getElementById('b').value = 'geçersiz';
  fc.dogrula();
  assert.strictEqual(doc.activeElement.id, 'a', 'ilk hatalı alan odakta');
});

test('alan hatası yerinde gösterilir ve aria bağları kurulur', () => {
  const { doc, fc } = kur(ALANLAR, { sema: SEMA, gonder: () => Promise.resolve() });
  fc.dogrula();
  const el = doc.getElementById('a');
  assert.strictEqual(el.getAttribute('aria-invalid'), 'true');
  const hata = el.closest('.gfield').querySelector('.gf-err');
  assert.match(hata.textContent, /zorunludur/);
  assert.strictEqual(el.getAttribute('aria-describedby'), hata.id);
  assert.ok(el.closest('.gfield').classList.contains('is-err'));
});

test('düzelen alan temizlenir', () => {
  const { doc, fc } = kur(ALANLAR, { sema: SEMA, gonder: () => Promise.resolve() });
  fc.dogrula();
  doc.getElementById('a').value = 'Örnek A.Ş.';
  const s = fc.dogrula();
  assert.strictEqual(s.gecerli, true);
  assert.strictEqual(doc.getElementById('a').getAttribute('aria-invalid'), 'false');
  assert.strictEqual(fc.ozetKabi.hidden, true);
});

test('tür kuralları: e-posta, sayı aralığı, tarih sırası', () => {
  const { doc, fc } = kur(ALANLAR, { sema: SEMA, gonder: () => Promise.resolve() });
  doc.getElementById('a').value = 'Örnek';
  doc.getElementById('b').value = 'aa';
  doc.getElementById('e').value = '5000';
  doc.getElementById('c').value = '2026-05-01';
  doc.getElementById('d').value = '2026-04-01';
  const s = fc.dogrula();
  /* jsdom kendi realm'ında dizi üretir; deepStrictEqual referans kimliğine
     takılır — metne çevirip karşılaştırıyoruz. */
  const alanlar = s.hatalar.map(h => h.ad).sort().join(',');
  assert.strictEqual(alanlar, 'bitis,eposta,tutar');
  assert.match(s.hatalar.find(h => h.ad === 'bitis').mesaj, /sonra olmalıdır/);
  assert.match(s.hatalar.find(h => h.ad === 'tutar').mesaj, /En çok/);
});

test('enAz metinde karakter sayısıdır', () => {
  const { doc, fc } = kur(ALANLAR, { sema: SEMA, gonder: () => Promise.resolve() });
  doc.getElementById('a').value = 'AB';
  const s = fc.dogrula();
  assert.match(s.hatalar[0].mesaj, /En az 3 karakter/);
});

test('şema yoksa yerel HTML nitelikleri kullanılır', () => {
  const { fc } = kur(ALANLAR, { gonder: () => Promise.resolve() });
  const s = fc.dogrula();
  assert.strictEqual(s.gecerli, false);          /* required */
  assert.strictEqual(s.hatalar[0].ad, 'unvan');
});

/* ---------- submit kilidi ---------- */

test('ilk tıklamada kilit; ikinci gönderim YOK', async () => {
  let cagri = 0;
  let coz;
  const { doc, fc } = kur(ALANLAR, {
    sema: SEMA,
    gonder: () => { cagri++; return new Promise(r => { coz = r; }); }
  });
  doc.getElementById('a').value = 'Örnek A.Ş.';
  const btn = doc.getElementById('btnKaydet');
  btn.click();
  assert.strictEqual(cagri, 1);
  assert.strictEqual(btn.disabled, true, 'buton kilitli');
  assert.strictEqual(btn.getAttribute('aria-busy'), 'true');
  assert.strictEqual(fc.gonderiliyorMu(), true);
  btn.click(); btn.click();
  assert.strictEqual(cagri, 1, 'ikinci gönderim iş gövdesini tekrar çalıştırmaz');
  coz({ ok: true });
  await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(btn.disabled, false, 'başarıdan sonra kilit çözülür');
  assert.strictEqual(fc.gonderiliyorMu(), false);
});

test('geçersiz formda gönderim hiç başlamaz', () => {
  let cagri = 0;
  const { doc } = kur(ALANLAR, { sema: SEMA, gonder: () => { cagri++; return Promise.resolve(); } });
  doc.getElementById('btnKaydet').click();
  assert.strictEqual(cagri, 0);
});

test('aynı deneme aynı istekId ile gider; başarıdan sonra yeni kimlik alınır', async () => {
  const kimlikler = [];
  const { doc } = kur(ALANLAR, {
    sema: SEMA,
    gonder: (v, ctx) => { kimlikler.push(ctx.istekId); return Promise.resolve({ ok: true }); }
  });
  doc.getElementById('a').value = 'Örnek A.Ş.';
  doc.getElementById('btnKaydet').click();
  await new Promise(r => setTimeout(r, 0));
  doc.getElementById('a').value = 'Örnek 2 A.Ş.';
  doc.getElementById('btnKaydet').click();
  await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(kimlikler.length, 2);
  assert.notStrictEqual(kimlikler[0], kimlikler[1]);
});

test('gönderim hatası üstte sistem hatası olarak görünür, kilit çözülür', async () => {
  const { doc, fc } = kur(ALANLAR, {
    sema: SEMA,
    gonder: () => Promise.reject(new Error('Ağ hatası'))
  });
  doc.getElementById('a').value = 'Örnek A.Ş.';
  const btn = doc.getElementById('btnKaydet');
  btn.click();
  await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(btn.disabled, false);
  assert.strictEqual(fc.ozetKabi.hidden, false);
  assert.match(fc.ozetKabi.textContent, /Ağ hatası/);
  assert.match(fc.ozetKabi.textContent, /yeniden deneyebilirsiniz/);
});

test('gonderOncesi engeli üstte gösterilir, gövde çalışmaz', () => {
  let cagri = 0;
  const { doc, fc } = kur(ALANLAR, {
    sema: SEMA,
    gonderOncesi: () => 'Ekip atanmadan kaydedilemez.',
    gonder: () => { cagri++; return Promise.resolve(); }
  });
  doc.getElementById('a').value = 'Örnek A.Ş.';
  doc.getElementById('btnKaydet').click();
  assert.strictEqual(cagri, 0);
  assert.match(fc.ozetKabi.textContent, /Ekip atanmadan/);
});

/* ---------- dirty state ---------- */

test('dirty state girişle işaretlenir, kaydetmeyle temizlenir', async () => {
  const { doc, fc, win } = kur(ALANLAR, { sema: SEMA, gonder: () => Promise.resolve({ ok: true }) });
  assert.strictEqual(fc.kirliMi(), false);
  const el = doc.getElementById('a');
  el.value = 'Örnek A.Ş.';
  el.dispatchEvent(new win.Event('input', { bubbles: true }));
  assert.strictEqual(fc.kirliMi(), true);
  assert.match(doc.querySelector('[data-son-kayit]').textContent, /Kaydedilmemiş/);
  doc.getElementById('btnKaydet').click();
  await new Promise(r => setTimeout(r, 0));
  assert.strictEqual(fc.kirliMi(), false);
  assert.match(doc.querySelector('[data-son-kayit]').textContent, /Son kaydetme: \d\d:\d\d/);
});

test('taslak kaydetme dirty bayrağını düşürür ve depoya yazar', () => {
  const { doc, fc, win } = kur(ALANLAR, { sema: SEMA, anahtar: 'test-form', gonder: () => Promise.resolve() });
  doc.getElementById('a').value = 'Yarım';
  doc.getElementById('a').dispatchEvent(new win.Event('input', { bubbles: true }));
  doc.getElementById('btnTaslak').click();
  assert.strictEqual(fc.kirliMi(), false);
  const ham = win.localStorage.getItem('gv_tk_taslak_test-form');
  assert.ok(ham);
  assert.strictEqual(JSON.parse(ham).veri.unvan, 'Yarım');
  assert.match(doc.querySelector('[data-son-kayit]').textContent, /taslak/);
});

test('kirli formda sayfa içi bağlantı çıkış uyarısı ister', () => {
  let soruldu = false;
  const { doc, win } = kur(ALANLAR + '<a href="musteriler.html" id="cik">Listeye dön</a>',
    { sema: SEMA, gonder: () => Promise.resolve() });
  win.gvConfirm = () => { soruldu = true; return Promise.resolve({ onay: false }); };
  doc.getElementById('a').value = 'x';
  doc.getElementById('a').dispatchEvent(new win.Event('input', { bubbles: true }));
  doc.getElementById('cik').click();
  assert.strictEqual(soruldu, true);
});

test('temiz formda çıkış uyarısı sorulmaz', () => {
  let soruldu = false;
  const { doc, win } = kur(ALANLAR + '<a href="musteriler.html" id="cik">Listeye dön</a>',
    { sema: SEMA, gonder: () => Promise.resolve() });
  win.gvConfirm = () => { soruldu = true; return Promise.resolve({ onay: false }); };
  doc.getElementById('cik').click();
  assert.strictEqual(soruldu, false);
});

/* ---------- migrate edilen sayfalar ---------- */

const FORMLAR = ['musteri-form.html', 'is-emri-form.html', 'ekipman-form.html',
                 'lokasyon-form.html', 'proje-form.html', 'teklif-form.html'];

test('sayfa formlarının hepsi FormController kullanıyor', () => {
  for (const f of FORMLAR) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    assert.ok(s.includes('gvFormController('), f + ' FormController kullanmıyor');
    assert.ok(!/\bgvForm\(/.test(s), f + ' hâlâ eski gvForm çağırıyor');
    assert.ok(s.includes('assets/js/form-controller.js'), f + ' dosyayı yüklemiyor');
    assert.ok(s.includes('data-son-kayit'), f + ' son kaydetme göstergesi yok');
  }
});

test('şemadaki her alanın .gfield bloğunda hata yuvası var', () => {
  for (const f of FORMLAR) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    const blok = s.slice(s.indexOf('var SEMA = {'), s.indexOf('var form = gvFormController'));
    const adlar = [...blok.matchAll(/^\s{4}([A-Za-zğüşiöçİĞÜŞÖÇ]+)\s*:/gm)].map(m => m[1]);
    for (const ad of adlar) {
      const i = s.indexOf('name="' + ad + '"');
      const bas = s.lastIndexOf('<div class="gfield', i);
      const son = s.indexOf('<div class="gfield', i);
      const parca = s.slice(bas, son === -1 ? i + 800 : son);
      if (parca.includes('type="checkbox"')) continue;
      assert.ok(parca.includes('gf-err'), `${f}: ${ad} alanında .gf-err yuvası yok`);
    }
  }
});

test('şemadaki her alan formda gerçekten var (migrate edilen sayfalar)', () => {
  for (const f of FORMLAR) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    const blok = s.slice(s.indexOf('var SEMA = {'), s.indexOf('var form = gvFormController'));
    const adlar = [...blok.matchAll(/^\s{4}([A-Za-zğüşiöçİĞÜŞÖÇ]+)\s*:/gm)].map(m => m[1]);
    assert.ok(adlar.length >= 5, f + ' şeması beklenenden küçük');
    for (const ad of adlar) {
      assert.ok(s.includes('name="' + ad + '"'), `${f}: şemadaki ${ad} alanı formda yok`);
    }
  }
});

/* ---------- modal formlar ---------- */

/* Her grup bittiğinde bu liste büyür; migrate edilen sayfa geri dönerse
   test kırılır. */
const MODAL_SAYFALAR = [
  'denetimler.html', 'musteri-sikayetleri.html', 'iletisim-kisileri.html',
  'kalite-dokumanlari.html', 'personel-detay.html', 'personeller.html',
  'portal-faturalar.html', 'portal-raporlar.html', 'portal-lokasyonlar.html',
  'musteri-portali.html', 'rapor-detay.html', 'sozlesmeler.html',
  'taseron-hakedisleri.html', 'yeniden-kontroller.html', 'cihaz-detay.html',
  'duzeltici-faaliyetler.html', 'eksik-ekipmanlar.html', 'fatura-gruplari.html'
];

test('migrate edilen modal formlar gvModalForm kullanıyor', () => {
  for (const f of MODAL_SAYFALAR) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    assert.ok(s.includes('gvModalForm('), f + ' gvModalForm kullanmıyor');
    assert.ok(s.includes('assets/js/form-controller.js'), f + ' dosyayı yüklemiyor');
  }
});

test('gvModalForm çağrılarının hepsinde şema, komut adı ve gönder var', () => {
  for (const f of fs.readdirSync(KOK).filter(x => x.endsWith('.html'))) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    let i = s.indexOf('gvModalForm({');
    while (i !== -1) {
      let j = i + 'gvModalForm({'.length, d = 1;
      while (j < s.length && d) {
        if (s[j] === '{') d++;
        else if (s[j] === '}') d--;
        j++;
      }
      const blok = s.slice(i, j);
      const satir = s.slice(0, i).split('\n').length;
      assert.ok(/\bsema\s*:/.test(blok), f + ':' + satir + ' gvModalForm şemasız');
      assert.ok(/\bgonder\s*:/.test(blok), f + ':' + satir + " gvModalForm gönder'siz");
      assert.ok(/\bad\s*:/.test(blok), f + ':' + satir + ' gvModalForm komut adı yok');
      i = s.indexOf('gvModalForm({', j);
    }
  }
});

test('modal formlarda elle is-err yönetimi kalmadı', () => {
  const ihlal = [];
  for (const f of MODAL_SAYFALAR) {
    const s = fs.readFileSync(path.join(KOK, f), 'utf8');
    if (s.includes("classList.toggle('is-err'")) ihlal.push(f);
  }
  assert.deepStrictEqual(ihlal, []);
});

}
