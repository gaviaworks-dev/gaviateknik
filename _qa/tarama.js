/* GAVIA — QA koşumu: her sayfayı jsdom'da çalıştırır, bulguları raporlar. */
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require('./jsdom-yolu.js').yukle() || (function(){
  console.error('jsdom bulunamadı — bkz. _qa/README.md'); process.exit(2);
})();
const KOK = require('path').resolve(__dirname, '..');

/* 'yakında' yalnız YER TUTUCU anlamında yasak; 'yakında doluyor / bitiyor' gibi
   meşru Türkçe zaman ifadeleri bulgu değildir. */
const YASAK = /\b(placeholder|lorem ipsum|TODO|FIXME|coming soon)\b|(çok\s+)?yakında(\s+(eklenecek|geliyor|hizmetinizde|aktif\s+olacak|yayında))?(?![\wçğıöşü])(?!\s+(dol|bit|sona|gerçekleş|başla|planlan|yapıl|kontrol|teslim|yenilen))/i;

function sayfalar() {
  return fs.readdirSync(KOK).filter(f => f.endsWith('.html')).sort();
}

async function kontrol(dosya, rol) {
  const bulgular = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => {
    const msg = (e.detail && e.detail.message) || e.message || '';
    /* rol koruması location.replace çağırıyor — jsdom gezinmeyi uygulamıyor, hata değil */
    if (/navigation to another Document|Not implemented: navigation/.test(msg)) { yonlendirmeIsareti = true; return; }
    bulgular.push({ tur: 'js-hata', mesaj: msg });
  });
  let yonlendirmeIsareti = false;
  vc.on('error', (...a) => bulgular.push({ tur: 'console-error', mesaj: a.map(String).join(' ') }));

  let dom;
  try {
    dom = await JSDOM.fromFile(path.join(KOK, dosya), {
      runScripts: 'outside-only',
      resources: undefined,
      url: 'http://localhost/' + dosya + (rol ? '?role=' + rol : ''),
      virtualConsole: vc,
      pretendToBeVisual: true
    });
  } catch (e) {
    return [{ tur: 'yuklenemedi', mesaj: e.message }];
  }

  const { window } = dom;
  // Harici CSS/JS resources:'usable' olmadan yüklenmez; yerel script'leri elle çalıştır.
  const doc = window.document;
  // matchMedia / getComputedStyle stub'ları
  if (!window.matchMedia) window.matchMedia = () => ({ matches: false, addEventListener(){}, removeEventListener(){} });
  window.requestAnimationFrame = cb => setTimeout(cb, 0);
  window.HTMLCanvasElement.prototype.getContext = function () {
    return { scale(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, clearRect(){}, set lineWidth(v){}, set lineCap(v){}, set lineJoin(v){}, set strokeStyle(v){} };
  };
  if (!window.Element.prototype.setPointerCapture) window.Element.prototype.setPointerCapture = function(){};
  let yonlendirme = null;
  try {
    Object.defineProperty(window.location, 'replace', { value: (u) => { yonlendirme = u; }, writable: true });
    Object.defineProperty(window.location, 'assign', { value: (u) => { yonlendirme = u; }, writable: true });
  } catch (e) {}
  if (!window.Element.prototype.scrollIntoView) window.Element.prototype.scrollIntoView = function(){};

  // yerel script dosyalarını sırayla değerlendir
  const scriptler = Array.from(doc.querySelectorAll('script'));
  for (const s of scriptler) {
    const src = s.getAttribute('src');
    try {
      if (src && !/^https?:/.test(src)) {
        const kod = fs.readFileSync(path.join(KOK, src), 'utf8');
        window.eval(kod);
      } else if (!src && s.textContent.trim()) {
        window.eval(s.textContent);
      }
    } catch (e) {
      bulgular.push({ tur: 'js-hata', mesaj: (src || 'satır içi script') + ' → ' + e.message });
    }
  }
  // DOMContentLoaded dinleyicilerini tetikle
  try { doc.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true })); } catch (e) {}
  await new Promise(r => setTimeout(r, 60));

  if (yonlendirme || yonlendirmeIsareti) {
    if (process.env.QA_YONLENDIRME) console.log('   ↪ ' + dosya + ' [' + rol + '] yetkisiz → yönlendirildi');
    return [];
  }
  const kabuksuz = doc.body.getAttribute('data-shell') === 'off';

  /* --- kabuk kontrolü --- */
  if (!kabuksuz) {
    if (!doc.querySelectorAll('.gv-rail-ico').length) bulgular.push({ tur: 'kabuk', mesaj: 'rail ikonları çizilmedi' });
    if (!doc.querySelectorAll('.gv-mlink').length) bulgular.push({ tur: 'kabuk', mesaj: 'modül menüsü çizilmedi' });
    if (!doc.querySelector('.gv-top .gv-me')) bulgular.push({ tur: 'kabuk', mesaj: 'üst bar çizilmedi' });
    if (!doc.querySelector('.gv-crumbs')) bulgular.push({ tur: 'kabuk', mesaj: 'breadcrumb çizilmedi' });
  }

  /* --- boş kart / boş bölge --- */
  doc.querySelectorAll('.gc-body, .kpi-grid').forEach(el => {
    const bos = !el.textContent.trim() && !el.querySelector('svg,canvas,img,input,textarea,select');
    if (bos) bulgular.push({ tur: 'bos-alan', mesaj: (el.className || '') + ' #' + (el.id || '—') + ' boş' });
  });

  /* --- yasaklı metin --- (script/style içeriği hariç: gerçek görünen metin) */
  const govdeKlon = doc.body.cloneNode(true);
  govdeKlon.querySelectorAll('script,style,template').forEach(e => e.remove());
  const metin = govdeKlon.textContent || '';
  const m = metin.match(YASAK);
  if (m) bulgular.push({ tur: 'yasak-metin', mesaj: '"' + m[0] + '" bulundu' });

  /* --- kırık iç link --- */
  const varolan = new Set(sayfalar());
  doc.querySelectorAll('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (!h || /^(https?:|mailto:|tel:|#)/.test(h)) return;
    const yol = h.split('?')[0].split('#')[0];
    if (!yol) return;
    if (yol.endsWith('.html') && !varolan.has(yol)) { if (!process.env.QA_LINK_ATLA) bulgular.push({ tur: 'kirik-link', mesaj: yol }); }
    if (!yol.endsWith('.html') && !fs.existsSync(path.join(KOK, yol))) bulgular.push({ tur: 'kirik-link', mesaj: yol });
  });

  /* --- a11y --- */
  doc.querySelectorAll('input,select,textarea').forEach(el => {
    if (el.type === 'hidden') return;
    const id = el.id;
    const etiketli = (id && Array.from(doc.querySelectorAll('label[for]')).some(l => l.getAttribute('for') === id))
      || el.closest('label')
      || el.getAttribute('aria-label')
      || el.getAttribute('aria-labelledby');
    if (!etiketli) bulgular.push({ tur: 'a11y-label', mesaj: el.tagName.toLowerCase() + (id ? '#' + id : '') + ' etiketsiz' });
  });
  doc.querySelectorAll('button,a').forEach(el => {
    const yazi = (el.textContent || '').trim();
    if (yazi) return;
    if (el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('data-tip')) return;
    if (el.querySelector('img[alt]')) return;
    bulgular.push({ tur: 'a11y-aria', mesaj: el.tagName.toLowerCase() + '.' + (el.className || '').split(' ')[0] + ' erişilebilir ad yok' });
  });
  doc.querySelectorAll('table').forEach(t => {
    if (t.querySelector('th') && !t.querySelector('th[scope]')) bulgular.push({ tur: 'a11y-tablo', mesaj: 'th[scope] eksik' });
  });

  /* --- mobil kart tablosu: data-lbl --- */
  doc.querySelectorAll('table.gtable-cards tbody tr').forEach((tr, i) => {
    if (i > 0) return;
    Array.from(tr.children).forEach((td, j) => {
      if (!td.hasAttribute('data-lbl')) bulgular.push({ tur: 'mobil-kart', mesaj: 'td[' + j + '] data-lbl yok' });
    });
  });

  /* --- sahte tarih --- */
  /* yalnız GERÇEK tarih biçimleri; açıklama metnindeki "1900 gibi sahte tarih" ifadesi eşleşmez */
  const sahteTarih = metin.match(/\b\d{1,2}\s(?:Oca|Şub|Mar|Nis|May|Haz|Tem|Ağu|Eyl|Eki|Kas|Ara)\w*\s(?:1900|1970)\b|\b(?:1900|1970)-\d{2}-\d{2}\b|\b\d{2}\.\d{2}\.(?:1900|1970)\b/);
  if (sahteTarih) bulgular.push({ tur: 'sahte-tarih', mesaj: sahteTarih[0] });

  /* --- para birimi biçimi --- */
  const kotuPara = metin.match(/\$\s?[\d.,]+|\bUSD\b|\bEUR\b|\b\d+\.\d{2}\s?TL\b/);
  if (kotuPara) bulgular.push({ tur: 'para-format', mesaj: kotuPara[0] });

  const sonuc = {
    dosya, rol: rol || '—',
    metinUzunluk: metin.trim().length,
    linkSayisi: doc.querySelectorAll('a[href]').length,
    bulgular
  };
  window.close();
  return sonuc;
}

(async () => {
  const hedef = process.argv[2];
  const roller = (process.argv[3] || 'sahip').split(',');
  const liste = hedef ? [hedef] : sayfalar();
  let toplamBulgu = 0;
  const ozet = {};
  for (const d of liste) {
    for (const r of roller) {
      const s = await kontrol(d, r);
      const b = s.bulgular || s;
      if (b.length) {
        toplamBulgu += b.length;
        console.log('\n■ ' + d + ' [' + r + ']  (' + (s.metinUzunluk||0) + ' krktr, ' + (s.linkSayisi||0) + ' link)');
        const gruplu = {};
        b.forEach(x => { (gruplu[x.tur] = gruplu[x.tur] || []).push(x.mesaj); ozet[x.tur] = (ozet[x.tur]||0)+1; });
        Object.keys(gruplu).forEach(t => {
          const benzersiz = Array.from(new Set(gruplu[t]));
          console.log('   ' + t + ' (' + gruplu[t].length + '): ' + benzersiz.slice(0,6).join(' | ') + (benzersiz.length>6?' …':''));
        });
      } else {
        console.log('✓ ' + d + ' [' + r + ']  ' + (s.metinUzunluk||0) + ' krktr, ' + (s.linkSayisi||0) + ' link');
      }
    }
  }
  console.log('\n=== TOPLAM ' + toplamBulgu + ' BULGU ===');
  Object.keys(ozet).sort((a,b)=>ozet[b]-ozet[a]).forEach(t => console.log('  ' + t + ': ' + ozet[t]));
  process.exit(toplamBulgu ? 1 : 0);
})();
