/* =====================================================================
   GAVIA — UYGULAMA ÇEKİRDEĞİ
   Türkçe biçimlendiriciler · toast · onay modalı · sonuç modalı ·
   kopyala · yazdır · URL durumu · sayfa açılış kancaları.
   Global API: GV.tl / GV.n / GV.d / GV.pct · gvToast · gvConfirm · gvModal
   ===================================================================== */
(function () {
  'use strict';

  window.GV = window.GV || {};

  /* ================= TÜRKÇE BİÇİMLENDİRME ================= */
  var AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  var AYLAR_KISA = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  var GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  var BOS = '—';

  function tarihNesnesi(v) {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    var s = String(v);
    var p = s.substring(0, 10).split('-');
    if (p.length !== 3) return null;
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  /* Para — ₺1.234.567,50 (boşsa —) */
  GV.tl = function (v, ondalik) {
    if (v == null || v === '' || isNaN(Number(v))) return BOS;
    var basamak = ondalik == null ? (Number(v) % 1 === 0 ? 0 : 2) : ondalik;
    return '₺' + Number(v).toLocaleString('tr-TR', { minimumFractionDigits: basamak, maximumFractionDigits: basamak });
  };
  /* Kısa para — ₺1,2 mn / ₺284 b */
  GV.tlKisa = function (v) {
    if (v == null || isNaN(Number(v))) return BOS;
    var n = Number(v);
    if (Math.abs(n) >= 1000000) return '₺' + (n / 1000000).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' mn';
    if (Math.abs(n) >= 1000) return '₺' + (n / 1000).toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' b';
    return GV.tl(n);
  };
  /* Sayı — 1.234 */
  GV.n = function (v, ondalik) {
    if (v == null || v === '' || isNaN(Number(v))) return BOS;
    return Number(v).toLocaleString('tr-TR', {
      minimumFractionDigits: ondalik || 0,
      maximumFractionDigits: ondalik == null ? 2 : ondalik
    });
  };
  /* Yüzde — %63,5 (0–1 arası oran veya doğrudan yüzde) */
  GV.pct = function (v, oranMi, basamak) {
    if (v == null || isNaN(Number(v))) return BOS;
    var n = Number(v);
    if (oranMi !== false) n = n * 100;
    return '%' + n.toLocaleString('tr-TR', { minimumFractionDigits: basamak || 0, maximumFractionDigits: basamak == null ? 1 : basamak });
  };
  /* Tarih — 17 Ağu 2026 (boşsa — · sahte tarih üretilmez) */
  GV.d = function (v) {
    var d = tarihNesnesi(v);
    if (!d) return BOS;
    return d.getDate() + ' ' + AYLAR_KISA[d.getMonth()] + ' ' + d.getFullYear();
  };
  /* Uzun tarih — 17 Ağustos 2026 */
  GV.dUzun = function (v) {
    var d = tarihNesnesi(v);
    if (!d) return BOS;
    return d.getDate() + ' ' + AYLAR[d.getMonth()] + ' ' + d.getFullYear();
  };
  /* Tam tarih — 17 Ağustos 2026, Pazartesi */
  GV.dTam = function (v) {
    var d = tarihNesnesi(v);
    if (!d) return BOS;
    return GV.dUzun(d) + ', ' + GUNLER[d.getDay()];
  };
  /* Tarih + saat — 17 Ağu 2026 · 09:04 */
  GV.dSaat = function (v) {
    if (!v) return BOS;
    var d = tarihNesnesi(v);
    if (!d) return BOS;
    var s = String(v);
    var saat = s.length >= 16 ? s.substring(11, 16) : null;
    return GV.d(d) + (saat ? ' · ' + saat : '');
  };
  /* Göreli zaman — 3 gün önce */
  GV.gorece = function (v, referans) {
    var d = tarihNesnesi(v), r = tarihNesnesi(referans || (window.demoApi && window.demoApi.bugun()));
    if (!d || !r) return BOS;
    var g = Math.round((r - d) / 86400000);
    if (g === 0) return 'bugün';
    if (g === 1) return 'dün';
    if (g === -1) return 'yarın';
    if (g > 0) return g + ' gün önce';
    return Math.abs(g) + ' gün sonra';
  };
  GV.gun = function (a, b) {
    var d1 = tarihNesnesi(a), d2 = tarihNesnesi(b);
    if (!d1 || !d2) return null;
    return Math.round((d2 - d1) / 86400000);
  };
  GV.ay = AYLAR; GV.ayKisa = AYLAR_KISA; GV.haftaGun = GUNLER; GV.bos = BOS;

  /* Sistem ayarları tek okuyucudan gelir (Ayarlar > Operasyon Ayarları).
     Ayarlar ekranı gv_tk_ayar anahtarına yazar; SLA, parti büyüklüğü, ödeme
     vadesi ve uyarı eşikleri buradan okunur ki ayar ekranı işlevsiz kalmasın. */
  var AYAR_VARSAYILAN = {
    slaGun: 7,          /* rapor teslim süresi */
    partiBuyuklugu: 6,  /* fatura grubu parti büyüklüğü */
    odemeVadesi: 30,    /* gün */
    kalibrasyonEsik: 30,/* gün — cihaz kalibrasyon uyarısı */
    belgeEsik: 60,      /* gün — personel belge uyarısı */
    sozlesmeEsik: 90    /* gün — sözleşme yenileme uyarısı */
  };
  GV.ayar = function (anahtar, varsayilan) {
    var kayitli = {};
    try { kayitli = JSON.parse(localStorage.getItem('gv_tk_ayar') || '{}') || {}; } catch (e) {}
    var v = kayitli[anahtar];
    if (v == null || v === '' || isNaN(Number(v))) {
      v = varsayilan != null ? varsayilan : AYAR_VARSAYILAN[anahtar];
    }
    return Number(v);
  };
  GV.ayarVarsayilan = AYAR_VARSAYILAN;

  /* HTML kaçışı — demo veriden gelen metinler için */
  GV.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /* Durum rozeti üretici — renk TEK BAŞINA gösterge değildir: ikon + metin zorunlu */
  GV.rozet = function (akis, anahtar) {
    if (!window.demoApi) return '';
    var d = window.demoApi.durum(akis, anahtar);
    return '<span class="gstat ' + d.ton + '"><i class="fa-solid ' + d.ikon + '" aria-hidden="true"></i>' + GV.esc(d.ad) + '</span>';
  };
  GV.rozetOzel = function (ton, ikon, metin) {
    return '<span class="gstat ' + ton + '"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i>' + GV.esc(metin) + '</span>';
  };

  /* URL parametreleri
     Varsayılan yazım biçimi replaceState'tir — filtre/arama yazımı tarayıcı
     geçmişini kirletmesin. pushState YALNIZ açık seçenekle istenir
     (secenek.push === true), pratikte sayfa değişiminde. */
  GV.q = function (ad) { return new URLSearchParams(location.search).get(ad); };

  function urlUygula(u, secenek) {
    var yeni = u.toString();
    if (yeni === location.href) return;
    if (secenek && secenek.push) history.pushState(null, '', yeni);
    else history.replaceState(null, '', yeni);
  }

  GV.qYaz = function (ad, deger, secenek) {
    var u = new URL(location.href);
    if (deger == null || deger === '') u.searchParams.delete(ad);
    else u.searchParams.set(ad, deger);
    urlUygula(u, secenek);
  };

  /* Toplu yazım — birden çok parametre TEK geçmiş girdisiyle güncellenir.
     Tek tek qYaz çağırmak sayfa değişiminde N ayrı pushState üretirdi. */
  GV.qCok = function (nesne, secenek) {
    var u = new URL(location.href);
    Object.keys(nesne || {}).forEach(function (ad) {
      var deger = nesne[ad];
      if (deger == null || deger === '') u.searchParams.delete(ad);
      else u.searchParams.set(ad, deger);
    });
    urlUygula(u, secenek);
  };

  /* ================= KIRILIM TOKENLARI =================
     Eşiğin TEK TANIMI `gavia-ui.css` `:root` içindeki `--bp-*` bloğudur.
     Buradaki sayılar CSS yüklenmemişse (yazdırma önizlemesi, jsdom) devreye
     giren yedektir; `_qa/test/kirilim.test.js` ikisinin ayrışmasına izin
     vermez. Sayfa kodu piksel yazmaz — `GV.altinda('sm')` kullanır. */
  var BP_YEDEK = { xl: 1280, lg: 1100, md: 980, sm: 640, xs: 480 };
  var bpOnbellek = null;

  function bpOku() {
    if (bpOnbellek) return bpOnbellek;
    var c = {};
    var stil = null;
    try {
      stil = window.getComputedStyle ? window.getComputedStyle(document.documentElement) : null;
    } catch (e) { stil = null; }
    Object.keys(BP_YEDEK).forEach(function (k) {
      var v = stil ? parseFloat(stil.getPropertyValue('--bp-' + k)) : NaN;
      c[k] = isNaN(v) || v <= 0 ? BP_YEDEK[k] : v;
    });
    bpOnbellek = c;
    return c;
  }

  /** Kırılım eşikleri (px) — CSS tokenlarından okunur. */
  GV.kirilim = function () { return bpOku(); };

  /** Kırılım eşiği (px). @param {'xl'|'lg'|'md'|'sm'|'xs'} ad */
  GV.bp = function (ad) { return bpOku()[ad]; };

  /** Viewport bu kırılımın ALTINDA mı (CSS `max-width` ile aynı sınır). */
  GV.altinda = function (ad) {
    var e = bpOku()[ad];
    if (e == null) return false;
    if (window.matchMedia) return window.matchMedia('(max-width: ' + e + 'px)').matches;
    return (window.innerWidth || 0) <= e;
  };

  /**
   * Kırılım değişimini izler. `cb(altinda)` hemen bir kez, sonra her
   * geçişte çağrılır. Dinleyiciyi kaldıran fonksiyon döner.
   */
  GV.kirilimIzle = function (ad, cb) {
    var e = bpOku()[ad];
    if (!window.matchMedia) { cb(GV.altinda(ad)); return function () {}; }
    var mq = window.matchMedia('(max-width: ' + e + 'px)');
    function el() { cb(mq.matches); }
    el();
    if (mq.addEventListener) mq.addEventListener('change', el);
    else if (mq.addListener) mq.addListener(el);
    return function () {
      if (mq.removeEventListener) mq.removeEventListener('change', el);
      else if (mq.removeListener) mq.removeListener(el);
    };
  };

  /* ================= TOAST ================= */
  var toastKap = null;
  function toastKapsayici() {
    if (!toastKap) {
      toastKap = document.createElement('div');
      toastKap.className = 'gv-toast-wrap';
      toastKap.setAttribute('role', 'status');
      toastKap.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastKap);
    }
    return toastKap;
  }
  window.gvToast = function (mesaj, secenek) {
    secenek = secenek || {};
    var ikonlar = { ok: 'fa-circle-check', danger: 'fa-circle-exclamation', warn: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    var ton = secenek.ton || 'ok';
    var el = document.createElement('div');
    el.className = 'gv-toast ' + ton;
    el.innerHTML = '<i class="fa-solid ' + (secenek.ikon || ikonlar[ton] || ikonlar.ok) + '" aria-hidden="true"></i><span>' + GV.esc(mesaj) + '</span>';
    toastKapsayici().appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 300);
    }, secenek.sure || 3600);
  };

  /* ================= GÖVDE KAYDIRMA KİLİDİ ================= */
  var kilitSayaci = 0;
  window.gvScrollLock = function (ac) {
    kilitSayaci = Math.max(0, kilitSayaci + (ac ? 1 : -1));
    document.documentElement.classList.toggle('gv-scroll-locked', kilitSayaci > 0);
  };

  /* Tab tuzağı — modal, drawer ve filtre çekmecesi AYNI tuzağı kullanır
     (doküman §13 erişilebilirlik: "modal, drawer ve dropdown focus
     trap/return uygular"). İkinci bir kopya yazılmaz. */
  function tabTuzak(e, kap) {
    if (e.key !== 'Tab') return;
    var odaklanabilir = kap.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
    if (!odaklanabilir.length) return;
    var ilk = odaklanabilir[0], son = odaklanabilir[odaklanabilir.length - 1];
    if (e.shiftKey && document.activeElement === ilk) { e.preventDefault(); son.focus(); }
    else if (!e.shiftKey && document.activeElement === son) { e.preventDefault(); ilk.focus(); }
  }

  GV.tabTuzak = tabTuzak;

  /**
   * Katman (modal/drawer) için ortak odak yönetimi: ilk odak, Tab tuzağı,
   * Escape ve kapanışta odak iadesi. `kapat` çağıran tarafta kalır.
   * @param {Element} kap odak tuzağının uygulanacağı kapsayıcı
   * @param {Function} kapat Escape'te çağrılacak kapatıcı
   * @returns {{coz:Function}} dinleyiciyi kaldırıp odağı iade eden nesne
   */
  GV.odakKatmani = function (kap, kapat) {
    var oncekiOdak = document.activeElement;
    function tus(e) {
      if (e.key === 'Escape') { e.preventDefault(); kapat(); return; }
      tabTuzak(e, kap);
    }
    document.addEventListener('keydown', tus);
    requestAnimationFrame(function () {
      var odak = kap.querySelector('input:not([type="hidden"]),textarea,select,button,a[href],[tabindex]:not([tabindex="-1"])');
      if (odak && odak.focus) odak.focus();
    });
    return {
      coz: function () {
        document.removeEventListener('keydown', tus);
        if (oncekiOdak && oncekiOdak.focus) oncekiOdak.focus();
      }
    };
  };

  /* ================= GENEL MODAL ================= */
  window.gvModal = function (secenek) {
    secenek = secenek || {};
    var ov = document.createElement('div');
    ov.className = 'gv-modal-ov';
    ov.innerHTML =
      '<div class="gv-modal ' + (secenek.ton || '') + ' ' + (secenek.genislik || '') + '" role="dialog" aria-modal="true" aria-labelledby="gvmBaslik">'
      + (secenek.ikon ? '<div class="gv-modal-ico"><i class="fa-solid ' + secenek.ikon + '" aria-hidden="true"></i></div>' : '')
      + '<h3 id="gvmBaslik">' + GV.esc(secenek.baslik || 'Bilgi') + '</h3>'
      + (secenek.metin ? '<p>' + secenek.metin + '</p>' : '')
      + (secenek.govde ? '<div class="gv-modal-body">' + secenek.govde + '</div>' : '')
      + '<div class="gv-modal-acts"></div></div>';
    document.body.appendChild(ov);
    var kap = ov.querySelector('.gv-modal');
    var aksiyonlar = ov.querySelector('.gv-modal-acts');
    var oncekiOdak = document.activeElement;

    function kapat(sonuc) {
      ov.classList.remove('open');
      gvScrollLock(false);
      document.removeEventListener('keydown', tus);
      setTimeout(function () { ov.remove(); if (oncekiOdak && oncekiOdak.focus) oncekiOdak.focus(); }, 240);
      if (secenek.kapandi) secenek.kapandi(sonuc);
    }
    function tus(e) {
      if (e.key === 'Escape') { e.preventDefault(); kapat(null); }
      tabTuzak(e, kap);
    }

    (secenek.butonlar || [{ etiket: 'Tamam', sinif: 'btn-acc', kapat: true }]).forEach(function (b) {
      var btn = document.createElement('button');
      btn.className = 'btn ' + (b.sinif || 'btn-ghost');
      btn.type = 'button';
      btn.innerHTML = (b.ikon ? '<i class="fa-solid ' + b.ikon + '" aria-hidden="true"></i>' : '') + GV.esc(b.etiket);
      btn.addEventListener('click', function () {
        var devam = true;
        if (b.tikla) devam = b.tikla(kap, kapat);
        if (b.kapat !== false && devam !== false) kapat(b.deger != null ? b.deger : b.etiket);
      });
      aksiyonlar.appendChild(btn);
    });

    ov.addEventListener('click', function (e) { if (e.target === ov && secenek.disKapat !== false) kapat(null); });
    document.addEventListener('keydown', tus);
    gvScrollLock(true);
    requestAnimationFrame(function () {
      ov.classList.add('open');
      var odak = kap.querySelector('input,textarea,select,button');
      if (odak) odak.focus();
    });
    if (secenek.acildi) secenek.acildi(kap, kapat);
    return { kapat: kapat, kap: kap };
  };

  /* ================= ONAY MODALI (kritik işlemler) ================= */
  window.gvConfirm = function (secenek) {
    return new Promise(function (coz) {
      var notGerekli = secenek.notZorunlu;
      var govde = secenek.notAlani
        ? '<label class="gv-sr" for="gvmNot">Açıklama</label>'
          + '<textarea id="gvmNot" placeholder="' + GV.esc(secenek.notYer || 'Açıklama yazın…') + '"></textarea>'
          + '<div class="gv-m-err" id="gvmNotErr" hidden><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> Açıklama zorunludur.</div>'
        : '';
      gvModal({
        baslik: secenek.baslik || 'Onaylıyor musunuz?',
        metin: secenek.metin || '',
        govde: govde,
        ton: secenek.ton || 'warn',
        ikon: secenek.ikon || (secenek.ton === 'danger' ? 'fa-triangle-exclamation' : 'fa-circle-question'),
        butonlar: [
          { etiket: secenek.iptalEtiket || 'Vazgeç', sinif: 'btn-ghost', deger: null },
          {
            etiket: secenek.onayEtiket || 'Onayla',
            sinif: secenek.ton === 'danger' ? 'btn-danger' : 'btn-acc',
            ikon: secenek.onayIkon || 'fa-check',
            tikla: function (kap) {
              if (notGerekli) {
                var t = kap.querySelector('#gvmNot');
                if (!t.value.trim()) {
                  t.classList.add('is-err');
                  kap.querySelector('#gvmNotErr').hidden = false;
                  t.focus();
                  return false;
                }
              }
              var t2 = kap.querySelector('#gvmNot');
              coz({ onay: true, not: t2 ? t2.value.trim() : null });
              return true;
            }
          }
        ],
        kapandi: function (s) { if (s === null) coz({ onay: false, not: null }); }
      });
    });
  };

  /* ================= SONUÇ MODALI ================= */
  window.gvResult = function (basarili, secenek) {
    secenek = secenek || {};
    return gvModal({
      baslik: secenek.baslik || (basarili ? 'İşlem tamamlandı' : 'İşlem yapılamadı'),
      metin: secenek.metin || '',
      ton: basarili ? '' : 'danger',
      ikon: basarili ? 'fa-circle-check' : 'fa-circle-exclamation',
      butonlar: secenek.butonlar || [{ etiket: 'Kapat', sinif: 'btn-ghost' }]
    });
  };

  /* ================= ROUTE KAYIT SEÇİMİ =================
     Doküman §8 "Route ve kayıt seçimi":
       · Detay route'unda id ZORUNLUDUR; eksik id'de ilk kayıt kullanılmaz.
       · Eksik id  → "Kayıt seçilmedi" ekranı (listeye dönüş aksiyonuyla).
       · Geçersiz id → "Kayıt bulunamadı"; geri dön ve arama aksiyonu.
       · Yetkisiz id → kaydın varlığını ifşa etmeyen aynı ekran.
     Sayfa: `var id = GV.kayitId({...}); if (!id) return;` */

  /* Ana bölgeyi boşaltıp (kırıntıyı koruyarak) tek bir durum kartı basar. */
  function anaBolgeyeBas(html) {
    var ana = document.querySelector('main.gv-main');
    if (!ana) return null;
    var kirintilar = ana.querySelector('.gv-crumbs');
    ana.innerHTML = '';
    if (kirintilar) ana.appendChild(kirintilar);
    var d = document.createElement('div');
    d.className = 'gv-card gv-notfound';
    d.innerHTML = html;
    ana.appendChild(d);
    return d;
  }

  function listeBaglantisi(secenek) {
    var href = secenek.listeHref || 'panel.html';
    return GV.href ? GV.href(href) : href;
  }

  window.gvKayitSecilmedi = function (secenek) {
    secenek = secenek || {};
    anaBolgeyeBas(
      '<div class="nf-ico"><i class="fa-solid fa-hand-pointer" aria-hidden="true"></i></div>'
    + '<h2>Kayıt seçilmedi</h2>'
    + '<p>Bu ekran tek bir kaydın ayrıntısını gösterir. Adres satırında kayıt '
    + 'numarası yok. Listeden bir kayıt seçerek devam edin.</p>'
    + '<div class="nf-acts">'
    +   '<a class="btn btn-acc" href="' + listeBaglantisi(secenek) + '">'
    +     '<i class="fa-solid fa-list" aria-hidden="true"></i>' + GV.esc(secenek.listeEtiket || 'Listeye dön') + '</a>'
    +   '<button class="btn btn-ghost" type="button" data-gv-geri>'
    +     '<i class="fa-solid fa-arrow-left" aria-hidden="true"></i>Geri dön</button>'
    + '</div>');
  };

  /**
   * Detay sayfasının kayıt numarasını verir. Eksikse "Kayıt seçilmedi"
   * ekranını basar ve null döner — ASLA ilk kayda düşmez.
   * @returns {string|null}
   */
  GV.kayitId = function (secenek) {
    var id = GV.q('id');
    if (id) return id;
    window.gvKayitSecilmedi(secenek);
    return null;
  };

  /* ================= KAYIT BULUNAMADI ================= */
  window.gvNotFound = function (secenek) {
    secenek = secenek || {};
    /* Metin, kaydın var olup olmadığını İFŞA ETMEZ: yetkisiz erişim ile
       gerçekten olmayan kayıt aynı ekranı görür (doküman §8). */
    anaBolgeyeBas(
      '<div class="nf-ico"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></div>'
    + '<h2>Kayıt bulunamadı</h2>'
    + '<p>' + (secenek.kod ? '<span class="nf-code">' + GV.esc(secenek.kod) + '</span> kodlu kayıt ' : 'Aradığınız kayıt ')
    + 'sistemde yok veya erişim kapsamınızın dışında. Bağlantı eski olabilir.</p>'
    + '<div class="nf-acts">'
    +   '<a class="btn btn-acc" href="' + listeBaglantisi(secenek) + '">'
    +     '<i class="fa-solid fa-list" aria-hidden="true"></i>' + GV.esc(secenek.listeEtiket || 'Listeye dön') + '</a>'
    +   '<button class="btn btn-ghost" type="button" data-gv-ara>'
    +     '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>Aramada dene</button>'
    +   '<button class="btn btn-ghost" type="button" data-gv-geri>'
    +     '<i class="fa-solid fa-arrow-left" aria-hidden="true"></i>Geri dön</button>'
    + '</div>');
  };

  /* Durum kartlarındaki geri / arama aksiyonları */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-gv-geri]')) {
      e.preventDefault();
      if (history.length > 1) history.back(); else location.href = GV.href ? GV.href('panel.html') : 'panel.html';
      return;
    }
    if (e.target.closest('[data-gv-ara]')) {
      e.preventDefault();
      var ara = document.getElementById('gvSearchInput');
      if (ara) { ara.focus(); ara.select(); }
      else location.href = GV.href ? GV.href('panel.html') : 'panel.html';
    }
  });

  /* ================= YAZDIRMA ================= */
  GV.yazdir = function () { window.print(); };

  /* ================= PANOYA KOPYALA ================= */
  GV.kopyala = function (metin, basariMesaji) {
    function yedek() {
      var t = document.createElement('textarea');
      t.value = metin; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (e) {}
      t.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(metin).catch(yedek);
    } else { yedek(); }
    gvToast(basariMesaji || 'Panoya kopyalandı.', { ton: 'ok' });
  };

  /* ================= DIŞA AKTARIM (demo) ================= */
  GV.disaAktar = function (secenek) {
    secenek = secenek || {};
    gvModal({
      baslik: 'Dışa Aktar',
      metin: GV.esc(secenek.kayitSayisi != null ? secenek.kayitSayisi + ' kayıt dışa aktarılacak.' : 'Görünen kayıtlar dışa aktarılacak.')
        + ' Biçim seçin:',
      ikon: 'fa-file-export',
      govde: '<div class="chips" id="gvxBicim">'
        + '<button type="button" class="chip is-on" data-b="xlsx"><i class="fa-solid fa-file-excel" aria-hidden="true"></i> Excel (.xlsx)</button>'
        + '<button type="button" class="chip" data-b="csv"><i class="fa-solid fa-file-csv" aria-hidden="true"></i> CSV</button>'
        + '<button type="button" class="chip" data-b="pdf"><i class="fa-solid fa-file-pdf" aria-hidden="true"></i> PDF</button>'
        + '</div>'
        + '<div class="gv-note" style="margin-top:14px"><i class="fa-solid fa-circle-info" aria-hidden="true"></i>'
        + '<span>Demo arayüzünde dosya üretilmez; gerçek kurulumda seçilen biçimde indirme başlatılır.</span></div>',
      acildi: function (kap) {
        kap.querySelectorAll('#gvxBicim .chip').forEach(function (c) {
          c.addEventListener('click', function () {
            kap.querySelectorAll('#gvxBicim .chip').forEach(function (x) { x.classList.remove('is-on'); });
            c.classList.add('is-on');
          });
        });
      },
      butonlar: [
        { etiket: 'Vazgeç', sinif: 'btn-ghost' },
        { etiket: 'Dışa Aktar', sinif: 'btn-acc', ikon: 'fa-download', tikla: function (kap) {
            var s = kap.querySelector('#gvxBicim .chip.is-on');
            var b = s ? s.getAttribute('data-b') : 'xlsx';
            gvToast((secenek.dosyaAdi || 'kayitlar') + '.' + b + ' hazırlandı (demo).', { ton: 'ok' });
            if (window.demoApi) window.demoApi.kayitAt('disa-aktarim', secenek.modul || 'Liste', secenek.dosyaAdi || 'kayitlar', null, b);
          } }
      ]
    });
  };

  /* ================= SAYFA AÇILIŞ ================= */
  document.addEventListener('DOMContentLoaded', function () {
    /* kenar kaydırma ipucu */
    document.querySelectorAll('.gc-body.flush, .gv-tabbar').forEach(function (el) {
      function guncelle() {
        var sol = el.scrollLeft > 4;
        var sag = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
        el.classList.toggle('scroll-l', sol);
        el.classList.toggle('scroll-r', sag);
      }
      el.addEventListener('scroll', guncelle, { passive: true });
      window.addEventListener('resize', guncelle);
      guncelle();
    });

    /* demo aksiyonları — hiçbir buton işlevsiz kalmaz */
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-demo]');
      if (!el) return;
      e.preventDefault();
      gvToast(el.getAttribute('data-demo'), { ton: el.getAttribute('data-demo-ton') || 'info' });
    });

    /* yazdır düğmeleri */
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-yazdir]')) { e.preventDefault(); GV.yazdir(); }
    });

    /* kopyala düğmeleri */
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-kopyala]');
      if (!el) return;
      e.preventDefault();
      GV.kopyala(el.getAttribute('data-kopyala'));
    });
  });
})();
