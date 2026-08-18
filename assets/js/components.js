/* =====================================================================
   GAVIA — BİLEŞEN DAVRANIŞLARI
   Sekme · sayfalama · tablo çizici · KPI · onay zinciri · durum ekranları ·
   grafik (SVG) · toplu işlem · dosya yükleme · takvim.
   Global API: gvTabs · gvPager · gvTable · gvChain · gvBulk · gvDrop ·
               gvBar · gvDonut · gvSpark · gvEmpty · gvSkeleton · gvError
   ===================================================================== */
(function () {
  'use strict';
  var GV = window.GV || (window.GV = {});
  function esc(s) { return GV.esc ? GV.esc(s) : String(s == null ? '' : s); }

  /* ================= SEKMELER ================= */
  window.gvTabs = function (kapSecici) {
    var kap = typeof kapSecici === 'string' ? document.querySelector(kapSecici) : kapSecici;
    if (!kap) return null;
    var sekmeler = Array.prototype.slice.call(kap.querySelectorAll('[role="tab"]'));
    if (!sekmeler.length) return null;

    function ac(id, urlYaz) {
      sekmeler.forEach(function (s) {
        var kendi = s.getAttribute('aria-controls') === id;
        s.setAttribute('aria-selected', kendi ? 'true' : 'false');
        s.setAttribute('tabindex', kendi ? '0' : '-1');
        var panel = document.getElementById(s.getAttribute('aria-controls'));
        if (panel) panel.hidden = !kendi;
      });
      if (urlYaz !== false && GV.qYaz) GV.qYaz('sekme', id);
      if (window.gvTabs.degisti) window.gvTabs.degisti(id);
    }

    sekmeler.forEach(function (s) {
      s.addEventListener('click', function () { ac(s.getAttribute('aria-controls')); });
      s.addEventListener('keydown', function (e) {
        var i = sekmeler.indexOf(s), y = -1;
        if (e.key === 'ArrowRight') y = (i + 1) % sekmeler.length;
        else if (e.key === 'ArrowLeft') y = (i - 1 + sekmeler.length) % sekmeler.length;
        else if (e.key === 'Home') y = 0;
        else if (e.key === 'End') y = sekmeler.length - 1;
        if (y >= 0) { e.preventDefault(); sekmeler[y].focus(); ac(sekmeler[y].getAttribute('aria-controls')); }
      });
    });

    var baslangic = (GV.q && GV.q('sekme')) || null;
    var gecerli = baslangic && sekmeler.some(function (s) { return s.getAttribute('aria-controls') === baslangic; });
    ac(gecerli ? baslangic : sekmeler[0].getAttribute('aria-controls'), false);
    return { ac: ac };
  };

  /* ================= SAYFALAMA =================
     Yeni seçeneklerin TAMAMI varsayılan olarak KAPALIDIR; bugün gvPager
     kullanan sayfaların davranışı bit düzeyinde aynı kalır.
       boyut        : sayfa başına kayıt (varsayılan 15 — DEĞİŞTİRİLMEDİ)
       url          : true → sayfa numarasını ?page ile URL'ye yazar/okur
       boyutSecici  : true → 10/20/50 seçici gösterir
       boyutlar     : seçici için özel liste
       sikisik      : true → numara düğmeleri yerine yalnız "n / m" göstergesi
     Yeni yöntem: sayfaya(n, boyut) — sayfa durumunu dışarıdan kurar
     (ListController sayfa durumunun sahibidir, pager onun görünümüdür).
     ============================================================== */
  window.gvPager = function (secenek) {
    var kap = typeof secenek.hedef === 'string' ? document.querySelector(secenek.hedef) : secenek.hedef;
    if (!kap) return null;
    var boyutlar = secenek.boyutlar || (GV.SAYFA_BOYUTLARI || [10, 20, 50]);
    var boyut = secenek.boyut || 15;
    var sayfa = 1, toplam = 0;

    /* url:true — sayfa numarası paylaşılabilir olsun isteyen sayfalar için.
       ListController kendi URL yazımını yaptığı için bu seçeneği açmaz. */
    if (secenek.url) {
      var ilk = Number(GV.q ? GV.q('page') : null);
      if (isFinite(ilk) && ilk > 0) sayfa = Math.trunc(ilk);
      var ilkBoyut = Number(GV.q ? GV.q('pageSize') : null);
      if (secenek.boyutSecici && boyutlar.indexOf(ilkBoyut) !== -1) boyut = ilkBoyut;
    }

    function urlYaz(push) {
      if (!secenek.url || !GV.qCok) return;
      GV.qCok({
        page: sayfa > 1 ? sayfa : null,
        pageSize: secenek.boyutSecici && boyut !== (secenek.boyut || 15) ? boyut : null
      }, { push: !!push });
    }

    function sayfaSayisi() { return Math.max(1, Math.ceil(toplam / boyut)); }

    function boyutSeciciHtml() {
      if (!secenek.boyutSecici) return '';
      return '<label class="pg-size"><span class="gv-sr">Sayfa başına kayıt</span>'
        + '<select data-boyut aria-label="Sayfa başına kayıt sayısı">'
        + boyutlar.map(function (b) {
            return '<option value="' + b + '"' + (b === boyut ? ' selected' : '') + '>' + b + ' / sayfa</option>';
          }).join('')
        + '</select></label>';
    }

    function ciz() {
      var adet = sayfaSayisi();
      if (sayfa > adet) sayfa = adet;
      var bas = toplam ? (sayfa - 1) * boyut + 1 : 0;
      var son = Math.min(toplam, sayfa * boyut);
      /* Kayıt aralığı canlı bölgedir: mobilde ikinci satıra düşer ve sayfa
         değiştikçe ekran okuyucuya duyurulur (doküman §9 + §13). */
      var h = '<div class="pg-count" role="status" aria-live="polite" aria-atomic="true">'
            + (toplam ? (GV.n(bas) + '–' + GV.n(son) + ' / ' + GV.n(toplam) + ' kayıt') : 'Kayıt yok') + '</div>'
            + '<div class="pg-btns">' + boyutSeciciHtml()
            + '<button class="pg-btn" data-git="onceki"' + (sayfa <= 1 ? ' disabled' : '') + ' aria-label="Önceki sayfa"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>'
            + '<span class="pg-compact">' + sayfa + ' / ' + adet + '</span>';
      if (!secenek.sikisik) {
        var numaralar = [];
        for (var i = 1; i <= adet; i++) {
          if (i === 1 || i === adet || Math.abs(i - sayfa) <= 1) numaralar.push(i);
          else if (numaralar[numaralar.length - 1] !== '…') numaralar.push('…');
        }
        numaralar.forEach(function (n) {
          h += n === '…' ? '<span class="pg-gap">…</span>'
            : '<button class="pg-num' + (n === sayfa ? ' is-on' : '') + '" data-git="' + n + '"'
              + (n === sayfa ? ' aria-current="page"' : '') + ' aria-label="' + n + '. sayfa">' + n + '</button>';
        });
      }
      h += '<button class="pg-btn" data-git="sonraki"' + (sayfa >= adet ? ' disabled' : '') + ' aria-label="Sonraki sayfa"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button></div>';
      kap.innerHTML = h;
      /* Tek sayfalık listede pager gizlenir; boyut seçici açıksa görünür kalır
         ki kullanıcı 10'a düşürüp sayfalamayı geri getirebilsin. */
      kap.hidden = toplam <= boyut && sayfa === 1 && !secenek.boyutSecici;
    }

    kap.addEventListener('click', function (e) {
      var b = e.target.closest('[data-git]');
      if (!b || b.disabled) return;
      var v = b.getAttribute('data-git');
      var adet = sayfaSayisi();
      if (v === 'onceki') sayfa = Math.max(1, sayfa - 1);
      else if (v === 'sonraki') sayfa = Math.min(adet, sayfa + 1);
      else sayfa = Number(v);
      ciz();
      urlYaz(true);
      if (secenek.degisti) secenek.degisti(sayfa, boyut);
    });

    kap.addEventListener('change', function (e) {
      var s = e.target.closest('[data-boyut]');
      if (!s) return;
      boyut = Number(s.value);
      sayfa = 1;                       /* pageSize değişince page daima 1 */
      ciz();
      urlYaz(false);
      if (secenek.degisti) secenek.degisti(sayfa, boyut);
    });

    return {
      ayarla: function (t, sayfayiSifirla) {
        toplam = t;
        if (sayfayiSifirla) sayfa = 1;
        ciz();
      },
      /* Sayfa durumunu dışarıdan kurar — çizim ayarla() ile yapılır. */
      sayfaya: function (n, yeniBoyut) {
        if (yeniBoyut) boyut = yeniBoyut;
        sayfa = Math.max(1, Math.trunc(Number(n) || 1));
      },
      dilim: function (dizi) { return dizi.slice((sayfa - 1) * boyut, sayfa * boyut); },
      sayfa: function () { return sayfa; },
      boyut: function () { return boyut; }
    };
  };

  /* ================= TABLO ÇİZİCİ ================= */
  /* kolonlar: [{ k:'ad', ad:'Başlık', sinif:'num', gizli:false, ciz:fn(kayit) }] */
  window.gvTable = function (secenek) {
    var kap = typeof secenek.hedef === 'string' ? document.querySelector(secenek.hedef) : secenek.hedef;
    if (!kap) return null;
    var kolonlar = secenek.kolonlar || [];

    function basliklar() {
      var h = '<tr>';
      if (secenek.secim) h += '<th class="gv-bulk-th" scope="col"><span class="row-chk"><input type="checkbox" id="gvChkAll" aria-label="Tümünü seç"><span class="chk-box"><i class="fa-solid fa-check" aria-hidden="true"></i></span></span></th>';
      kolonlar.forEach(function (c) {
        if (c.gizli) return;
        h += '<th scope="col"' + (c.sinif ? ' class="' + c.sinif + '"' : '') + '>' + esc(c.ad) + '</th>';
      });
      return h + '</tr>';
    }

    function satirlar(veri) {
      if (!veri.length) return '';
      var h = '';
      veri.forEach(function (k) {
        h += '<tr' + (secenek.satirId ? ' data-id="' + esc(secenek.satirId(k)) + '"' : '') + '>';
        if (secenek.secim) {
          h += '<td class="gv-bulk-td" data-lbl=""><span class="row-chk"><input type="checkbox" class="gv-row-chk" value="'
             + esc(secenek.satirId ? secenek.satirId(k) : '') + '" aria-label="Satırı seç"><span class="chk-box"><i class="fa-solid fa-check" aria-hidden="true"></i></span></span></td>';
        }
        kolonlar.forEach(function (c) {
          if (c.gizli) return;
          var icerik = c.ciz ? c.ciz(k) : esc(k[c.k] == null || k[c.k] === '' ? GV.bos : k[c.k]);
          h += '<td data-lbl="' + esc(c.ad) + '"' + (c.sinif ? ' class="' + c.sinif + '"' : '') + '>' + icerik + '</td>';
        });
        h += '</tr>';
      });
      return h;
    }

    function basligiTazele() {
      var hepsi = kap.querySelector('#gvChkAll');
      if (!hepsi) return;
      var tumu = kap.querySelectorAll('.gv-row-chk');
      var sec = kap.querySelectorAll('.gv-row-chk:checked');
      hepsi.checked = sec.length === tumu.length && tumu.length > 0;
      hepsi.indeterminate = sec.length > 0 && sec.length < tumu.length;
    }

    function ciz(veri) {
      if (!veri.length) {
        kap.innerHTML = '';
        if (secenek.bosDurum) kap.innerHTML = window.gvEmpty(secenek.bosDurum);
        return;
      }
      /* Ekran okuyucu tabloyu adıyla duyurabilsin: caption görsel olarak gizli,
         sayfa başlığından ya da secenek.ad'dan türer. */
      var tabloAd = secenek.ad || (document.querySelector('.ph-title, .gv-page-head h1, h1')
        || {}).textContent || 'Kayıt listesi';
      kap.innerHTML = '<table class="gtable gtable-cards' + (secenek.sinif ? ' ' + secenek.sinif : '') + '">'
        + '<caption class="gv-sr">' + esc(String(tabloAd).trim()) + ' — ' + veri.length + ' kayıt</caption>'
        + '<thead>' + basliklar() + '</thead><tbody>' + satirlar(veri) + '</tbody>'
        + (secenek.altToplam ? '<tfoot>' + secenek.altToplam(veri) + '</tfoot>' : '')
        + '</table>';
      if (GV.rolBaglantilariniIsle) GV.rolBaglantilariniIsle(kap);
      /* Seçim olayları kap üzerinde bir kez bağlanır; ciz() her çağrıldığında
         yeniden bağlanırsa dinleyiciler birikir ve secimDegisti N kez tetiklenir. */
      if (!kap.dataset.gvSecimBagli) {
        kap.dataset.gvSecimBagli = '1';
        kap.addEventListener('change', function (e) {
          var t = e.target;
          if (t.id === 'gvChkAll') {
            kap.querySelectorAll('.gv-row-chk').forEach(function (c) { c.checked = t.checked; });
            if (secenek.secimDegisti) secenek.secimDegisti(secililer());
            return;
          }
          if (!t.classList.contains('gv-row-chk')) return;
          basligiTazele();
          if (secenek.secimDegisti) secenek.secimDegisti(secililer());
        });
      }
      basligiTazele();
      if (secenek.satirTikla) {
        kap.querySelectorAll('tbody tr').forEach(function (tr) {
          tr.style.cursor = 'pointer';
          tr.addEventListener('click', function (e) {
            if (e.target.closest('a,button,input,.row-chk')) return;
            secenek.satirTikla(tr.getAttribute('data-id'), e);
          });
        });
      }
    }

    function secililer() {
      return Array.prototype.slice.call(kap.querySelectorAll('.gv-row-chk:checked')).map(function (c) { return c.value; });
    }

    return { ciz: ciz, secililer: secililer, kolonlar: kolonlar };
  };

  /* ================= DURUM EKRANLARI ================= */
  /* Boş ve hata ekranları canlı bölgedir: liste süzülünce ekran okuyucu
     "kayıt yok" bilgisini duyar (doküman §13 erişilebilirlik). Boş durum
     bilgilendirmedir → status/polite; hata kesintidir → alert. */
  window.gvEmpty = function (s) {
    s = s || {};
    return '<div class="gv-empty" role="status" aria-live="polite">'
      + '<div class="ge-ico"><i class="fa-solid ' + (s.ikon || 'fa-inbox') + '" aria-hidden="true"></i></div>'
      + '<h4>' + esc(s.baslik || 'Kayıt bulunamadı') + '</h4>'
      + '<p>' + esc(s.metin || 'Seçtiğiniz filtrelere uyan kayıt yok. Filtreleri gevşetip yeniden deneyin.') + '</p>'
      + (s.aksiyonlar ? '<div class="ge-acts">' + s.aksiyonlar + '</div>' : '')
      + '</div>';
  };
  window.gvSkeleton = function (satir) {
    var h = '<div class="gv-skel">';
    for (var i = 0; i < (satir || 5); i++) {
      h += '<div class="skel-row"><div class="skel-avatar"></div><div class="skel-col">'
         + '<div class="skel-line w40"></div><div class="skel-line w60"></div></div>'
         + '<div class="skel-line w80" style="max-width:90px"></div></div>';
    }
    return h + '</div>';
  };
  window.gvError = function (s) {
    s = s || {};
    return '<div class="gv-error" role="alert">'
      + '<div class="ge-ico"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i></div>'
      + '<h4>' + esc(s.baslik || 'Veri yüklenemedi') + '</h4>'
      + '<p>' + esc(s.metin || 'Kayıtlar alınırken bir sorun oluştu. Bağlantınızı kontrol edip yeniden deneyin.') + '</p>'
      + '<div class="ge-acts"><button class="btn btn-ghost" type="button" onclick="location.reload()">'
      + '<i class="fa-solid fa-rotate-right" aria-hidden="true"></i>Yeniden dene</button></div></div>';
  };

  /* ================= ONAY / DURUM ZİNCİRİ ================= */
  /* adimlar: [{ ton:'ok', ikon, baslik, altBaslik, aksiyon, tarih, not, notTon, simdi }] */
  window.gvChain = function (hedef, adimlar) {
    var kap = typeof hedef === 'string' ? document.querySelector(hedef) : hedef;
    if (!kap) return;
    var h = '<ol class="gv-chain">';
    adimlar.forEach(function (a) {
      h += '<li class="chain-step ' + (a.ton || 'idle') + (a.simdi ? ' is-now' : '') + '">'
        + '<span class="cs-node"><i class="fa-solid ' + (a.ikon || 'fa-circle') + '" aria-hidden="true"></i></span>'
        + '<div class="cs-body"><div class="cs-top">'
        + '<div class="cs-who"><b>' + esc(a.baslik) + '</b><span>' + esc(a.altBaslik || '') + '</span></div>'
        + '<div class="cs-when"><span class="cs-act">' + esc(a.aksiyon || '') + '</span>'
        + '<span class="cs-date">' + (a.tarih ? esc(GV.dSaat ? GV.dSaat(a.tarih) : a.tarih) : GV.bos) + '</span></div>'
        + '</div>'
        + (a.not ? '<div class="cs-note ' + (a.notTon || '') + '">' + esc(a.not) + '</div>' : '')
        + '</div></li>';
    });
    kap.innerHTML = h + '</ol>';
  };

  /* yatay adım göstergesi */
  window.gvFlow = function (adimlar, aktifAnahtar) {
    var bulundu = false;
    var h = '<div class="flow-steps">';
    adimlar.forEach(function (a, i) {
      var sinif = bulundu ? '' : (a.k === aktifAnahtar ? 'now' : 'done');
      if (a.k === aktifAnahtar) bulundu = true;
      if (a.ton === 'danger' && a.k === aktifAnahtar) sinif = 'fail';
      if (i) h += '<i class="fa-solid fa-chevron-right flow-sep" aria-hidden="true"></i>';
      h += '<span class="flow-step ' + sinif + '"><i class="fa-solid ' + (a.ikon || 'fa-circle') + '" aria-hidden="true"></i>' + esc(a.ad) + '</span>';
    });
    return h + '</div>';
  };

  /* ================= TOPLU İŞLEM ÇUBUĞU ================= */
  window.gvBulk = function (secenek) {
    var kap = typeof secenek.hedef === 'string' ? document.querySelector(secenek.hedef) : secenek.hedef;
    if (!kap) return null;
    kap.className = 'gv-bulk-bar is-sticky';
    kap.hidden = true;
    function ciz(secililer) {
      if (!secililer.length) { kap.hidden = true; return; }
      kap.hidden = false;
      var h = '<span class="gvb-count">' + GV.n(secililer.length) + ' kayıt seçildi</span><div class="gvb-acts">';
      (secenek.aksiyonlar || []).forEach(function (a, i) {
        h += '<button class="btn btn-sm ' + (a.sinif || 'btn-ghost') + '" type="button" data-i="' + i + '">'
          + '<i class="fa-solid ' + (a.ikon || 'fa-bolt') + '" aria-hidden="true"></i>' + esc(a.etiket) + '</button>';
      });
      h += '<button class="btn btn-sm btn-ghost" type="button" data-temizle><i class="fa-solid fa-xmark" aria-hidden="true"></i>Seçimi bırak</button></div>';
      kap.innerHTML = h;
      kap.querySelectorAll('[data-i]').forEach(function (b) {
        b.addEventListener('click', function () {
          var a = secenek.aksiyonlar[Number(b.getAttribute('data-i'))];
          if (a && a.tikla) a.tikla(secililer);
        });
      });
      var t = kap.querySelector('[data-temizle]');
      if (t) t.addEventListener('click', function () {
        document.querySelectorAll('.gv-row-chk, #gvChkAll').forEach(function (c) { c.checked = false; c.indeterminate = false; });
        ciz([]);
      });
    }
    return { ciz: ciz };
  };

  /* ================= SVG GRAFİKLER ================= */
  var TON = {
    acc: '#0E8C6D', ok: '#2E9E6B', warn: '#A97908', danger: '#D14343',
    info: '#3B6FD4', mor: '#6D28D9', gri: '#CDD2DE', turuncu: '#C2410C'
  };
  GV.grafikTon = TON;
  function svgEsc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* Sütun grafiği — veri: [{ etiket, deger, ton }] */
  /* Grafik kabı boş veriyle çağrıldığında ESKİ grafiği ekranda bırakmak,
     filtre daraltıldığında yanlış veri göstermek demektir. Üç SVG grafiği de
     gvBarList ile aynı davranışı gösterir: kabı temizler ve boş durum basar. */
  function grafikBos(kap, secenek) {
    kap.innerHTML = window.gvEmpty((secenek && secenek.bosDurum) || {
      ikon: 'fa-chart-simple', baslik: 'Gösterilecek veri yok',
      metin: 'Seçili filtrede bu göstergeye ait kayıt bulunmuyor.'
    });
  }

  /**
   * Grafiğin METİN ALTERNATİFİ (doküman §9: "Grafik: yatay taşma yapmaz;
   * veri tablosu veya metinsel özet alternatif olarak bulunur").
   *
   * Tablo HER ZAMAN basılır: masaüstünde görsel olarak gizlidir (ekran
   * okuyucu okur, görünüm bit düzeyinde değişmez), ≤980'de görünür hale
   * gelir (responsive.css). Odaklanabilir öğe içermez — masaüstünde
   * hayalet sekme durağı oluşmaz.
   *
   * @param {Array<{etiket:string, deger:number, ton?:string, gosterim?:string}>} veri
   * @param {{baslik?:string, birim?:string, tabloId?:string}} secenek
   * @returns {string} HTML
   */
  function grafikVeriTablosu(veri, secenek) {
    secenek = secenek || {};
    var id = secenek.tabloId || (GV.yeniKod ? GV.yeniKod('gvcd') : 'gvcd');
    var toplam = veri.reduce(function (t, d) { return t + (Number(d.deger) || 0); }, 0);
    var enBuyuk = veri.reduce(function (a, d) { return (Number(d.deger) || 0) > (Number(a.deger) || 0) ? d : a; }, veri[0]);
    var birim = secenek.birim ? ' ' + secenek.birim : '';
    function gosterim(d) {
      if (d.gosterim) return d.gosterim;
      return secenek.birim === '%' ? GV.pct((Number(d.deger) || 0) / 100, true, 1)
        : GV.n(d.deger) + birim;
    }
    var ozet = veri.length + ' kalem · en yüksek: ' + esc(enBuyuk.etiket) + ' (' + gosterim(enBuyuk) + ')'
      + (secenek.birim === '%' ? '' : ' · toplam: ' + GV.n(toplam) + birim);
    var h = '<div class="gv-chart-data" id="' + id + '">'
      + '<p class="gv-chart-ozet">' + esc(secenek.baslik || 'Grafik') + ' — ' + ozet + '</p>'
      + '<div class="gv-tscroll"><table class="gtable gv-chart-table">'
      + '<caption class="gv-sr">' + esc(secenek.baslik || 'Grafik') + ' veri tablosu</caption>'
      + '<thead><tr><th scope="col">Kalem</th><th scope="col">Değer</th>'
      + (secenek.birim === '%' ? '' : '<th scope="col">Pay</th>') + '</tr></thead><tbody>';
    veri.forEach(function (d) {
      h += '<tr><th scope="row">' + esc(d.etiket) + '</th><td>' + gosterim(d) + '</td>'
        + (secenek.birim === '%' ? ''
           : '<td>' + (toplam ? GV.pct((Number(d.deger) || 0) / toplam) : GV.bos) + '</td>') + '</tr>';
    });
    return h + '</tbody></table></div></div>';
  }
  GV.grafikVeriTablosu = grafikVeriTablosu;

  window.gvBar = function (hedef, veri, secenek) {
    var kap = typeof hedef === 'string' ? document.querySelector(hedef) : hedef;
    if (!kap) return;
    secenek = secenek || {};
    if (!veri || !veri.length) { grafikBos(kap, secenek); return; }
    var G = 720, Y = secenek.yukseklik || 220, solPay = 44, altPay = 34, ustPay = 12;
    var enBuyuk = Math.max.apply(null, veri.map(function (d) { return d.deger; })) || 1;
    var cizimG = G - solPay - 12, cizimY = Y - altPay - ustPay;
    var adim = cizimG / veri.length, kalinlik = Math.min(46, adim * 0.62);
    var tabloId = GV.yeniKod ? GV.yeniKod('gvcd') : 'gvcd';
    var h = '<svg class="gv-chart-svg" viewBox="0 0 ' + G + ' ' + Y + '" role="img" aria-label="'
          + svgEsc(secenek.baslik || 'Sütun grafiği') + '" aria-describedby="' + tabloId + '">';
    for (var i = 0; i <= 4; i++) {
      var y = ustPay + cizimY * (i / 4);
      var v = Math.round(enBuyuk * (1 - i / 4));
      h += '<line x1="' + solPay + '" y1="' + y + '" x2="' + G + '" y2="' + y + '" stroke="#E4E7EE" stroke-width="1"/>'
        + '<text x="' + (solPay - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="10.5" fill="#69708A">' + GV.n(v) + '</text>';
    }
    veri.forEach(function (d, i2) {
      var yuk = Math.max(2, (d.deger / enBuyuk) * cizimY);
      var x = solPay + adim * i2 + (adim - kalinlik) / 2;
      var y2 = ustPay + cizimY - yuk;
      h += '<rect x="' + x + '" y="' + y2 + '" width="' + kalinlik + '" height="' + yuk + '" rx="4" fill="' + (TON[d.ton] || TON.acc) + '">'
        + '<title>' + svgEsc(d.etiket) + ': '
        + (secenek.birim === '%' ? GV.pct(d.deger / 100, true, 1)
           : GV.n(d.deger) + (secenek.birim ? ' ' + secenek.birim : '')) + '</title></rect>'
        + '<text x="' + (x + kalinlik / 2) + '" y="' + (y2 - 5) + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="#111528">' + GV.n(d.deger) + '</text>'
        + '<text x="' + (x + kalinlik / 2) + '" y="' + (Y - 10) + '" text-anchor="middle" font-size="10.5" fill="#69708A">' + svgEsc(d.etiket) + '</text>';
    });
    kap.innerHTML = h + '</svg>'
      + grafikVeriTablosu(veri, { baslik: secenek.baslik || 'Sütun grafiği', birim: secenek.birim, tabloId: tabloId });
  };

  /* Halka grafiği */
  window.gvDonut = function (hedef, veri, secenek) {
    var kap = typeof hedef === 'string' ? document.querySelector(hedef) : hedef;
    if (!kap) return;
    secenek = secenek || {};
    if (!veri || !veri.length) { grafikBos(kap, secenek); return; }
    var toplam = veri.reduce(function (t, d) { return t + d.deger; }, 0) || 1;
    var B = 200, m = B / 2, r = 74, kalinlik = 26, cevre = 2 * Math.PI * r, ofset = 0;
    var tabloId = GV.yeniKod ? GV.yeniKod('gvcd') : 'gvcd';
    var h = '<svg class="gv-chart-svg" viewBox="0 0 ' + B + ' ' + B + '" role="img" aria-label="'
          + svgEsc(secenek.baslik || 'Halka grafiği') + '" aria-describedby="' + tabloId + '"'
          + ' style="max-width:220px;margin:0 auto">';
    h += '<circle cx="' + m + '" cy="' + m + '" r="' + r + '" fill="none" stroke="#EEF0F5" stroke-width="' + kalinlik + '"/>';
    veri.forEach(function (d) {
      var pay = (d.deger / toplam) * cevre;
      h += '<circle cx="' + m + '" cy="' + m + '" r="' + r + '" fill="none" stroke="' + (TON[d.ton] || TON.acc) + '"'
        + ' stroke-width="' + kalinlik + '" stroke-dasharray="' + pay + ' ' + (cevre - pay) + '"'
        + ' stroke-dashoffset="' + (-ofset) + '" transform="rotate(-90 ' + m + ' ' + m + ')">'
        + '<title>' + svgEsc(d.etiket) + ': ' + GV.n(d.deger) + ' (' + GV.pct(d.deger / toplam) + ')</title></circle>';
      ofset += pay;
    });
    h += '<text x="' + m + '" y="' + (m - 2) + '" text-anchor="middle" font-size="26" font-weight="800" fill="#111528">' + GV.n(secenek.merkez != null ? secenek.merkez : toplam) + '</text>'
      + '<text x="' + m + '" y="' + (m + 17) + '" text-anchor="middle" font-size="11" fill="#69708A">' + svgEsc(secenek.merkezEtiket || 'toplam') + '</text></svg>';
    if (secenek.aciklama !== false) {
      h += '<div class="chart-legend">';
      veri.forEach(function (d) {
        h += '<span><i style="background:' + (TON[d.ton] || TON.acc) + '"></i>' + svgEsc(d.etiket) + ' · <b>' + GV.n(d.deger) + '</b></span>';
      });
      h += '</div>';
    }
    kap.innerHTML = h
      + grafikVeriTablosu(veri, {
          baslik: secenek.baslik || secenek.merkezEtiket || 'Halka grafiği', tabloId: tabloId });
  };

  /* Çizgi / alan grafiği */
  window.gvSpark = function (hedef, veri, secenek) {
    var kap = typeof hedef === 'string' ? document.querySelector(hedef) : hedef;
    if (!kap) return;
    secenek = secenek || {};
    if (!veri || !veri.length) { grafikBos(kap, secenek); return; }
    var G = 720, Y = secenek.yukseklik || 200, solPay = 44, altPay = 28, ustPay = 12;
    var enBuyuk = Math.max.apply(null, veri.map(function (d) { return d.deger; })) || 1;
    var cizimG = G - solPay - 12, cizimY = Y - altPay - ustPay;
    var adim = veri.length > 1 ? cizimG / (veri.length - 1) : 0;
    var noktalar = veri.map(function (d, i) {
      return [solPay + adim * i, ustPay + cizimY - (d.deger / enBuyuk) * cizimY];
    });
    var cizgi = noktalar.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var alan = cizgi + ' L' + noktalar[noktalar.length - 1][0].toFixed(1) + ' ' + (ustPay + cizimY) + ' L' + solPay + ' ' + (ustPay + cizimY) + ' Z';
    var renk = TON[secenek.ton] || TON.acc;
    var tabloId = GV.yeniKod ? GV.yeniKod('gvcd') : 'gvcd';
    var h = '<svg class="gv-chart-svg" viewBox="0 0 ' + G + ' ' + Y + '" role="img" aria-label="'
          + svgEsc(secenek.baslik || 'Çizgi grafiği') + '" aria-describedby="' + tabloId + '">';
    for (var i = 0; i <= 3; i++) {
      var y = ustPay + cizimY * (i / 3);
      h += '<line x1="' + solPay + '" y1="' + y + '" x2="' + G + '" y2="' + y + '" stroke="#E4E7EE" stroke-width="1"/>'
        + '<text x="' + (solPay - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="10.5" fill="#69708A">' + GV.n(Math.round(enBuyuk * (1 - i / 3))) + '</text>';
    }
    h += '<path d="' + alan + '" fill="' + renk + '" opacity=".10"/>'
      + '<path d="' + cizgi + '" fill="none" stroke="' + renk + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    veri.forEach(function (d, i2) {
      h += '<circle cx="' + noktalar[i2][0].toFixed(1) + '" cy="' + noktalar[i2][1].toFixed(1) + '" r="3.5" fill="#fff" stroke="' + renk + '" stroke-width="2">'
        + '<title>' + svgEsc(d.etiket) + ': ' + GV.n(d.deger) + '</title></circle>'
        + '<text x="' + noktalar[i2][0].toFixed(1) + '" y="' + (Y - 8) + '" text-anchor="middle" font-size="10.5" fill="#69708A">' + svgEsc(d.etiket) + '</text>';
    });
    kap.innerHTML = h + '</svg>'
      + grafikVeriTablosu(veri, { baslik: secenek.baslik || 'Çizgi grafiği', birim: secenek.birim, tabloId: tabloId });
  };

  /* Yatay çubuk listesi (kategori dağılımı) — etiket ve değeri metin olarak
     zaten yazar; ayrı veri tablosu alternatifine ihtiyacı yoktur. */
  window.gvBarList = function (hedef, veri) {
    var kap = typeof hedef === 'string' ? document.querySelector(hedef) : hedef;
    if (!kap) return;
    if (!veri || !veri.length) { kap.innerHTML = window.gvEmpty({ ikon: 'fa-chart-simple', baslik: 'Gösterilecek veri yok', metin: 'Seçili dönemde kayıt bulunmuyor.' }); return; }
    var enBuyuk = Math.max.apply(null, veri.map(function (d) { return d.deger; })) || 1;
    var h = '';
    veri.forEach(function (d) {
      h += '<div style="padding:11px 0;border-bottom:1px solid var(--line)">'
        + '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:7px">'
        + '<b style="font-size:13px;font-weight:700;color:var(--ink)">' + esc(d.etiket) + '</b>'
        + '<span style="font-size:12.5px;font-weight:700;color:var(--ink-2);font-variant-numeric:tabular-nums">' + (d.gosterim || GV.n(d.deger)) + '</span></div>'
        + '<div class="gbar"><div class="gbar-track"><div class="gbar-fill' + (d.ton ? ' ' + d.ton : '') + '" style="width:' + ((d.deger / enBuyuk) * 100).toFixed(1) + '%"></div></div></div>'
        + '</div>';
    });
    kap.innerHTML = h;
  };

  /* ================= DOSYA YÜKLEME ================= */
  window.gvDrop = function (hedef, secenek) {
    var kap = typeof hedef === 'string' ? document.querySelector(hedef) : hedef;
    if (!kap) return;
    secenek = secenek || {};
    var id = 'gvDrop' + Math.floor(performance.now() * 1000 % 100000);
    kap.innerHTML =
      '<label class="gv-drop" for="' + id + '">'
      + '<i class="fa-solid ' + (secenek.ikon || 'fa-cloud-arrow-up') + '" aria-hidden="true"></i>'
      + '<b>' + esc(secenek.baslik || 'Dosya seçin veya sürükleyin') + '</b>'
      + '<span>' + esc(secenek.metin || 'PDF, JPG, PNG veya XLSX · en fazla 20 MB') + '</span>'
      + '<input type="file" id="' + id + '" multiple hidden></label>'
      + '<div class="gv-filelist" id="' + id + 'L"></div>';
    var girdi = kap.querySelector('#' + id);
    var liste = kap.querySelector('#' + id + 'L');
    var alan = kap.querySelector('.gv-drop');
    var dosyalar = (secenek.mevcut || []).slice();

    function cizListe() {
      liste.innerHTML = dosyalar.map(function (f, i) {
        var uzanti = (f.ad || '').split('.').pop().toLowerCase();
        var ikon = uzanti === 'pdf' ? 'fa-file-pdf' : (uzanti === 'xlsx' || uzanti === 'csv') ? 'fa-file-excel'
                 : (['jpg', 'jpeg', 'png', 'webp'].indexOf(uzanti) !== -1) ? 'fa-file-image' : 'fa-file';
        return '<div class="gv-fileitem"><span class="fi-ico"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i></span>'
          + '<span class="fi-info"><b>' + esc(f.ad) + '</b><span>' + esc(f.boyut || '') + '</span></span>'
          + '<button class="ia-btn danger" type="button" data-sil="' + i + '" aria-label="' + esc(f.ad) + ' dosyasını kaldır">'
          + '<i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></div>';
      }).join('');
      liste.querySelectorAll('[data-sil]').forEach(function (b) {
        b.addEventListener('click', function () {
          dosyalar.splice(Number(b.getAttribute('data-sil')), 1);
          cizListe();
          if (secenek.degisti) secenek.degisti(dosyalar);
        });
      });
    }

    function ekle(fl) {
      Array.prototype.slice.call(fl).forEach(function (f) {
        dosyalar.push({ ad: f.name, boyut: (f.size / 1024).toFixed(0) + ' KB · yeni yüklendi' });
      });
      cizListe();
      if (window.gvToast) gvToast(fl.length + ' dosya eklendi (demo — sunucuya gönderilmez).', { ton: 'ok' });
      if (secenek.degisti) secenek.degisti(dosyalar);
    }

    girdi.addEventListener('change', function () { if (girdi.files.length) ekle(girdi.files); girdi.value = ''; });
    ['dragenter', 'dragover'].forEach(function (t) {
      alan.addEventListener(t, function (e) { e.preventDefault(); alan.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (t) {
      alan.addEventListener(t, function (e) { e.preventDefault(); alan.classList.remove('is-over'); });
    });
    alan.addEventListener('drop', function (e) { if (e.dataTransfer.files.length) ekle(e.dataTransfer.files); });
    cizListe();
    return { dosyalar: function () { return dosyalar; } };
  };

  /* ================= TAKVİM ================= */
  /* olaylar: { '2026-08-17': [{ baslik, ton, link }] } */
  window.gvCalendar = function (hedef, secenek) {
    var kap = typeof hedef === 'string' ? document.querySelector(hedef) : hedef;
    if (!kap) return null;
    secenek = secenek || {};
    var bugun = secenek.bugun || (window.demoApi && window.demoApi.bugun()) || '2026-08-17';
    var b = bugun.split('-');
    var yil = secenek.yil || Number(b[0]), ay = secenek.ay != null ? secenek.ay : Number(b[1]) - 1;

    function ciz() {
      var ilk = new Date(yil, ay, 1);
      var baslangic = (ilk.getDay() + 6) % 7;                 /* pazartesi = 0 */
      var gunSayisi = new Date(yil, ay + 1, 0).getDate();
      var oncekiGun = new Date(yil, ay, 0).getDate();
      var h = '<div class="cal-grid" role="grid" aria-label="' + GV.ay[ay] + ' ' + yil + ' takvimi">';
      ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].forEach(function (g) { h += '<div class="cal-dow" role="columnheader">' + g + '</div>'; });
      var hucre = 0, toplam = Math.ceil((baslangic + gunSayisi) / 7) * 7;
      for (var i = 0; i < toplam; i++) {
        var disarida = i < baslangic || i >= baslangic + gunSayisi;
        var gunNo, tarihIso;
        if (i < baslangic) { gunNo = oncekiGun - baslangic + i + 1; tarihIso = null; }
        else if (i >= baslangic + gunSayisi) { gunNo = i - baslangic - gunSayisi + 1; tarihIso = null; }
        else {
          gunNo = i - baslangic + 1;
          tarihIso = yil + '-' + String(ay + 1).padStart(2, '0') + '-' + String(gunNo).padStart(2, '0');
        }
        var olaylar = tarihIso && secenek.olaylar ? (secenek.olaylar[tarihIso] || []) : [];
        h += '<div class="cal-day' + (disarida ? ' is-out' : '') + (tarihIso === bugun ? ' is-today' : '') + '" role="gridcell"'
           + (tarihIso ? ' data-tarih="' + tarihIso + '"' : '') + '>'
           + '<span class="cal-daynum">' + gunNo + '</span>';
        olaylar.slice(0, 3).forEach(function (o) {
          h += '<a class="cal-ev ' + (o.ton || 'info') + '" href="' + (o.link || '#') + '" title="' + esc(o.baslik) + '">' + esc(o.baslik) + '</a>';
        });
        /* `+N daha` klavyeyle de açılabilsin diye BUTON (görsel dil aynı). */
        if (olaylar.length > 3) {
          h += '<button class="cal-more" type="button" data-daha="' + tarihIso + '"'
             + ' aria-label="' + GV.dUzun(tarihIso) + ' — ' + olaylar.length + ' kaydın tamamını gör">+'
             + (olaylar.length - 3) + ' daha</button>';
        }
        /* Dar ekranda olaylar noktaya iner; ayrıntı GÜN KATMANINDA açılır
           (doküman §9). Katman masaüstünde display:none — görünüm değişmez. */
        if (olaylar.length) {
          h += '<button class="cal-dayopen" type="button" data-daha="' + tarihIso + '"'
             + ' aria-label="' + GV.dUzun(tarihIso) + ' — ' + olaylar.length + ' kayıt"></button>';
        }
        h += '</div>';
        hucre++;
      }
      kap.innerHTML = h + '</div>';
      if (GV.rolBaglantilariniIsle) GV.rolBaglantilariniIsle(kap);
      kap.querySelectorAll('[data-daha]').forEach(function (el) {
        el.addEventListener('click', function () {
          var t = el.getAttribute('data-daha');
          var gunun = secenek.olaylar[t] || [];
          var liste = gunun.map(function (o) {
            return '<a class="act-row" href="' + (o.link || '#') + '" style="padding:11px 0">'
              + '<span class="act-ico ' + (o.ton || 'info') + '"><i class="fa-solid fa-calendar-day" aria-hidden="true"></i></span>'
              + '<span class="act-info"><b>' + esc(o.baslik) + '</b><span>' + esc(o.detay || '') + '</span></span></a>';
          }).join('');
          gvModal({
            baslik: GV.dUzun(t), ikon: 'fa-calendar-day',
            metin: gunun.length + ' kayıt',
            govde: '<div class="act-list">' + liste + '</div>',
            butonlar: [{ etiket: 'Kapat', sinif: 'btn-ghost' }]
          });
        });
      });
      if (secenek.basligaYaz) {
        var bs = document.querySelector(secenek.basligaYaz);
        if (bs) bs.textContent = GV.ay[ay] + ' ' + yil;
      }
    }

    ciz();
    return {
      ciz: ciz,
      ileri: function () { ay++; if (ay > 11) { ay = 0; yil++; } ciz(); },
      geri: function () { ay--; if (ay < 0) { ay = 11; yil--; } ciz(); },
      bugune: function () { yil = Number(b[0]); ay = Number(b[1]) - 1; ciz(); },
      donem: function () { return { yil: yil, ay: ay }; }
    };
  };

  /* ================= AÇILIR MENÜ (popover) ================= */
  window.gvPop = function (tetikSecici, popSecici) {
    var t = typeof tetikSecici === 'string' ? document.querySelector(tetikSecici) : tetikSecici;
    var p = typeof popSecici === 'string' ? document.querySelector(popSecici) : popSecici;
    if (!t || !p) return null;
    function ayarla(ac) {
      p.classList.toggle('open', ac);
      t.setAttribute('aria-expanded', ac ? 'true' : 'false');
    }
    t.setAttribute('aria-haspopup', 'true');
    t.setAttribute('aria-expanded', 'false');
    t.addEventListener('click', function (e) { e.stopPropagation(); ayarla(!p.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (!p.contains(e.target)) ayarla(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ayarla(false); });
    return { ac: function () { ayarla(true); }, kapat: function () { ayarla(false); } };
  };

  /* ================= KPI ÇİZİCİ ================= */
  /* kartlar: [{ ikon, sayi, etiket, ton, delta:{yon,metin}, link }] */
  window.gvKpi = function (hedef, kartlar) {
    var kap = typeof hedef === 'string' ? document.querySelector(hedef) : hedef;
    if (!kap) return;
    kap.className = 'kpi-grid';
    kap.innerHTML = kartlar.map(function (k) {
      var ic = '<div class="kpi-ico"><i class="fa-solid ' + (k.ikon || 'fa-chart-simple') + '" aria-hidden="true"></i></div>'
        + '<div><div class="kpi-num">' + (k.sayi != null ? k.sayi : GV.bos) + '</div>'
        + '<div class="kpi-lbl">' + esc(k.etiket) + '</div>'
        + (k.delta ? '<div class="kpi-delta ' + (k.delta.yon || 'flat') + '">'
            + '<i class="fa-solid ' + (k.delta.yon === 'up' ? 'fa-arrow-trend-up' : k.delta.yon === 'down' ? 'fa-arrow-trend-down' : 'fa-minus') + '" aria-hidden="true"></i>'
            + esc(k.delta.metin) + '</div>' : '')
        + '</div>';
      return k.link
        ? '<a class="kpi-card ' + (k.ton || '') + '" href="' + k.link + '">' + ic + '</a>'
        : '<div class="kpi-card ' + (k.ton || '') + '">' + ic + '</div>';
    }).join('');
    if (GV.rolBaglantilariniIsle) GV.rolBaglantilariniIsle(kap);
  };

  /* ================= İLERLEME ÇUBUĞU ================= */
  GV.bar = function (oran, secenek) {
    secenek = secenek || {};
    var y = Math.max(0, Math.min(1, oran || 0));
    var ton = secenek.ton || (y >= 0.85 ? 'ok' : y >= 0.5 ? '' : y >= 0.25 ? 'warn' : 'danger');
    return '<div class="gbar' + (secenek.buyuk ? ' gbar-lg' : '') + '">'
      + '<div class="gbar-track"><div class="gbar-fill ' + ton + '" style="width:' + (y * 100).toFixed(1) + '%"></div></div>'
      + '<span class="gbar-val">' + (secenek.etiket || GV.pct(y, true, 0)) + '</span></div>';
  };
})();
