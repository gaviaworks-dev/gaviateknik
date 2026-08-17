/* =====================================================================
   GAVIA — NAVİGASYON MOTORU
   Sol ikon rail + açılır modül menüsü + üst bar TEK YERDEN enjekte edilir;
   sayfalarda HTML tekrarı yoktur.
   · Bölüm  : <body data-sec="...">      → BOLUMLER anahtarı
   · Ekran  : <body data-screen="...">   → menü kaleminin screen alanı
   · Rol    : ?role=... → localStorage(gv_tk_rol) → 'sahip'
   Yeni sayfa ekleme reçetesi: CLAUDE.md §6.
   ===================================================================== */
(function () {
  'use strict';

  var METIN = {
    marka: 'GAVIA',
    urun: 'Periyodik Kontrol Yönetimi',
    ara: 'Ara — müşteri, lokasyon, ekipman, iş emri, rapor, fatura…',
    bildirim: 'Bildirimler',
    dil: 'Dil seçimi',
    cikis: 'Çıkış / Rol Değiştir'
  };

  /* ---- BÖLÜMLER — rail sırası bu sırayla çizilir ---- */
  var BOLUMLER = {
    panel: { ikon: 'fa-gauge-high', ustBaslik: 'Genel Bakış', baslik: 'Ana Panel', menu: [
      { ikon: 'fa-gauge-high',        etiket: 'Ana Panel',        href: 'panel.html',            screen: 'panel' },
      { bolum: 'Gündem' },
      { ikon: 'fa-sun',               etiket: 'Günlük Özet',      href: 'gunluk-ozet.html',      screen: 'gunluk-ozet' },
      { ikon: 'fa-bolt',              etiket: 'Aksiyon Merkezi',  href: 'aksiyon-merkezi.html',  screen: 'aksiyon-merkezi', sayac: '9' },
      { ikon: 'fa-calendar-week',     etiket: 'Ajanda',           href: 'ajanda.html',           screen: 'ajanda' },
      { ikon: 'fa-stamp',             etiket: 'Bekleyen Onaylar', href: 'onaylar.html',          screen: 'onaylar', sayac: '6' },
      { ikon: 'fa-bell',              etiket: 'Bildirimler',      href: 'bildirimler.html',      screen: 'bildirimler', sayac: '5' }
    ] },

    musteri: { ikon: 'fa-building', ustBaslik: 'Ticari Ağ', baslik: 'Müşteri ve Projeler', menu: [
      { ikon: 'fa-building',          etiket: 'Müşteriler',       href: 'musteriler.html',       screen: 'musteriler' },
      { ikon: 'fa-diagram-project',   etiket: 'Projeler',         href: 'projeler.html',         screen: 'projeler' },
      { ikon: 'fa-location-dot',      etiket: 'Lokasyonlar',      href: 'lokasyonlar.html',      screen: 'lokasyonlar' },
      { ikon: 'fa-address-book',      etiket: 'İletişim Kişileri', href: 'iletisim-kisileri.html', screen: 'iletisim-kisileri' }
    ] },

    hizmet: { ikon: 'fa-list-check', ustBaslik: 'Kapsam', baslik: 'Hizmet ve Envanter', menu: [
      { ikon: 'fa-list-check',        etiket: 'Hizmet Kataloğu',  href: 'hizmet-katalogu.html',  screen: 'hizmet-katalogu' },
      { ikon: 'fa-file-signature',    etiket: 'Sözleşme Pozları', href: 'sozlesme-pozlari.html', screen: 'sozlesme-pozlari' },
      { ikon: 'fa-tags',              etiket: 'Fiyat Listeleri',  href: 'fiyat-listeleri.html',  screen: 'fiyat-listeleri' },
      { bolum: 'Envanter' },
      { ikon: 'fa-clipboard-list',    etiket: 'Ön Envanter',      href: 'on-envanter.html',      screen: 'on-envanter' },
      { ikon: 'fa-gears',             etiket: 'Ekipmanlar',       href: 'ekipmanlar.html',       screen: 'ekipmanlar' },
      { ikon: 'fa-scale-balanced',    etiket: 'Envanter Mutabakatı', href: 'envanter-mutabakati.html', screen: 'envanter-mutabakati', sayac: '4' }
    ] },

    operasyon: { ikon: 'fa-helmet-safety', ustBaslik: 'Saha', baslik: 'Operasyon Yönetimi', menu: [
      { ikon: 'fa-calendar-days',     etiket: 'Planlama',         href: 'planlama.html',         screen: 'planlama' },
      { ikon: 'fa-calendar-week',     etiket: 'Operasyon Takvimi', href: 'operasyon-takvimi.html', screen: 'operasyon-takvimi' },
      { ikon: 'fa-clipboard-check',   etiket: 'İş Emirleri',      href: 'is-emirleri.html',      screen: 'is-emirleri' },
      { bolum: 'Saha' },
      { ikon: 'fa-helmet-safety',     etiket: 'Saha Kontrolleri', href: 'saha-kontrol.html',     screen: 'saha-kontrol' },
      { ikon: 'fa-mobile-screen',     etiket: 'Mobil Kontrol Formu', href: 'saha-kontrol-formu.html', screen: 'saha-kontrol-formu' },
      { ikon: 'fa-box-open',          etiket: 'Eksik Ekipmanlar', href: 'eksik-ekipmanlar.html', screen: 'eksik-ekipmanlar', sayac: '8' },
      { ikon: 'fa-rotate-right',      etiket: 'Yeniden Kontroller', href: 'yeniden-kontroller.html', screen: 'yeniden-kontroller' }
    ] },

    teknik: { ikon: 'fa-file-lines', ustBaslik: 'Teknik', baslik: 'Rapor ve Uygunsuzluk', menu: [
      { ikon: 'fa-file-lines',        etiket: 'Teknik Raporlar',  href: 'teknik-raporlar.html',  screen: 'teknik-raporlar' },
      { ikon: 'fa-stamp',             etiket: 'Rapor Onayları',   href: 'rapor-onaylari.html',   screen: 'rapor-onaylari', sayac: '2' },
      { ikon: 'fa-file-code',         etiket: 'Rapor Şablonları', href: 'rapor-sablonlari.html', screen: 'rapor-sablonlari' },
      { bolum: 'Uygunsuzluk' },
      { ikon: 'fa-circle-exclamation', etiket: 'Uygunsuzluklar',  href: 'uygunsuzluklar.html',   screen: 'uygunsuzluklar', sayac: '7' }
    ] },

    ticari: { ikon: 'fa-file-invoice-dollar', ustBaslik: 'Finans', baslik: 'Ticari Süreçler', menu: [
      { ikon: 'fa-file-contract',     etiket: 'Teklifler',        href: 'teklifler.html',        screen: 'teklifler' },
      { ikon: 'fa-file-signature',    etiket: 'Sözleşmeler',      href: 'sozlesmeler.html',      screen: 'sozlesmeler' },
      { bolum: 'Hakediş ve Fatura' },
      { ikon: 'fa-calculator',        etiket: 'Hakedişler',       href: 'hakedisler.html',       screen: 'hakedisler' },
      { ikon: 'fa-layer-group',       etiket: 'Fatura Grupları',  href: 'fatura-gruplari.html',  screen: 'fatura-gruplari' },
      { ikon: 'fa-file-invoice-dollar', etiket: 'Faturalar',      href: 'faturalar.html',        screen: 'faturalar' },
      { ikon: 'fa-money-bill-transfer', etiket: 'Tahsilatlar',    href: 'tahsilatlar.html',      screen: 'tahsilatlar', sayac: '2' }
    ] },

    kaynak: { ikon: 'fa-users-gear', ustBaslik: 'Kaynak', baslik: 'Personel ve Taşeron', menu: [
      { ikon: 'fa-people-carry-box',  etiket: 'Taşeronlar',       href: 'taseronlar.html',       screen: 'taseronlar' },
      { ikon: 'fa-hand-holding-dollar', etiket: 'Taşeron Hakedişleri', href: 'taseron-hakedisleri.html', screen: 'taseron-hakedisleri' },
      { bolum: 'Personel' },
      { ikon: 'fa-users',             etiket: 'Personeller',      href: 'personeller.html',      screen: 'personeller' },
      { ikon: 'fa-certificate',       etiket: 'Yetkinlikler',     href: 'yetkinlikler.html',     screen: 'yetkinlikler' },
      { bolum: 'Ölçüm Cihazları' },
      { ikon: 'fa-ruler-combined',    etiket: 'Ölçüm Cihazları',  href: 'olcum-cihazlari.html',  screen: 'olcum-cihazlari' },
      { ikon: 'fa-vials',             etiket: 'Kalibrasyonlar',   href: 'kalibrasyonlar.html',   screen: 'kalibrasyonlar', sayac: '2' }
    ] },

    kalite: { ikon: 'fa-award', ustBaslik: 'Uyum', baslik: 'Kalite Yönetimi', menu: [
      { ikon: 'fa-folder-open',       etiket: 'Kalite Dokümanları', href: 'kalite-dokumanlari.html', screen: 'kalite-dokumanlari' },
      { ikon: 'fa-clipboard-user',    etiket: 'Denetimler',       href: 'denetimler.html',       screen: 'denetimler' },
      { ikon: 'fa-screwdriver-wrench', etiket: 'Düzeltici Faaliyetler', href: 'duzeltici-faaliyetler.html', screen: 'duzeltici-faaliyetler', sayac: '3' },
      { ikon: 'fa-comment-dots',      etiket: 'Müşteri Şikâyetleri', href: 'musteri-sikayetleri.html', screen: 'musteri-sikayetleri', sayac: '2' }
    ] },

    raporlama: { ikon: 'fa-chart-column', ustBaslik: 'Analiz', baslik: 'Raporlar', menu: [
      { ikon: 'fa-chart-column',      etiket: 'Rapor Merkezi',    href: 'raporlar.html',         screen: 'raporlar' }
    ] },

    portal: { ikon: 'fa-building-user', ustBaslik: 'Müşteri', baslik: 'Müşteri Portalı', menu: [
      { ikon: 'fa-house',             etiket: 'Genel Bakış',      href: 'musteri-portali.html',  screen: 'musteri-portali' },
      { ikon: 'fa-location-dot',      etiket: 'Lokasyonlarım',    href: 'portal-lokasyonlar.html', screen: 'portal-lokasyonlar' },
      { ikon: 'fa-file-lines',        etiket: 'Teknik Raporlar',  href: 'portal-raporlar.html',  screen: 'portal-raporlar' },
      { ikon: 'fa-file-invoice-dollar', etiket: 'Faturalar',      href: 'portal-faturalar.html', screen: 'portal-faturalar' }
    ] },

    sistem: { ikon: 'fa-sliders', ustBaslik: 'Yönetim', baslik: 'Sistem Ayarları', menu: [
      { ikon: 'fa-sliders',           etiket: 'Ayarlar',          href: 'ayarlar.html',          screen: 'ayarlar' },
      { ikon: 'fa-user-shield',       etiket: 'Roller ve Yetkiler', href: 'roller-yetkiler.html', screen: 'roller-yetkiler' },
      { ikon: 'fa-file-import',       etiket: 'Veri Aktarımı',    href: 'veri-aktarimi.html',    screen: 'veri-aktarimi' },
      { ikon: 'fa-clock-rotate-left', etiket: 'İşlem Kayıtları',  href: 'islem-kayitlari.html',  screen: 'islem-kayitlari' }
    ] }
  };

  var RAIL_SIRASI = ['panel', 'musteri', 'hizmet', 'operasyon', 'teknik', 'ticari', 'kaynak', 'kalite', 'raporlama', 'portal', 'sistem'];
  var TAM = ['panel', 'musteri', 'hizmet', 'operasyon', 'teknik', 'ticari', 'kaynak', 'kalite', 'raporlama'];

  /* ---- ROL YETKİ HARİTASI ----
     bolumler : rail'de görünen bölümler
     ekran    : bölüm bazlı ekran kısıtı (tanımlı değilse bölümün tamamı görünür) */
  var ROL_YETKI = {
    sahip:     { bolumler: TAM.concat(['sistem']) },
    gm:        { bolumler: TAM.concat(['sistem']) },
    operasyon: { bolumler: ['panel', 'musteri', 'hizmet', 'operasyon', 'teknik', 'kaynak', 'raporlama'],
                 ekran: { teknik: ['teknik-raporlar', 'uygunsuzluklar'], kaynak: ['taseronlar', 'personeller', 'olcum-cihazlari', 'kalibrasyonlar'] } },
    teknik:    { bolumler: ['panel', 'musteri', 'hizmet', 'operasyon', 'teknik', 'kalite', 'kaynak', 'raporlama'],
                 ekran: { musteri: ['lokasyonlar', 'projeler'], kaynak: ['personeller', 'yetkinlikler', 'olcum-cihazlari', 'kalibrasyonlar'],
                          kalite: ['kalite-dokumanlari', 'duzeltici-faaliyetler'] } },
    kalite:    { bolumler: ['panel', 'teknik', 'kalite', 'kaynak', 'raporlama'],
                 ekran: { teknik: ['teknik-raporlar', 'rapor-sablonlari', 'uygunsuzluklar'],
                          kaynak: ['personeller', 'yetkinlikler', 'olcum-cihazlari', 'kalibrasyonlar'] } },
    planlama:  { bolumler: ['panel', 'musteri', 'hizmet', 'operasyon', 'kaynak', 'raporlama'],
                 ekran: { musteri: ['lokasyonlar', 'projeler', 'iletisim-kisileri'],
                          hizmet: ['hizmet-katalogu', 'on-envanter', 'ekipmanlar'],
                          kaynak: ['taseronlar', 'personeller', 'olcum-cihazlari', 'kalibrasyonlar'] } },
    uzman:     { bolumler: ['panel', 'operasyon', 'teknik', 'hizmet'],
                 ekran: { panel: ['panel', 'gunluk-ozet', 'ajanda', 'bildirimler'],
                          operasyon: ['is-emirleri', 'saha-kontrol', 'saha-kontrol-formu', 'eksik-ekipmanlar', 'yeniden-kontroller'],
                          teknik: ['teknik-raporlar', 'rapor-sablonlari', 'uygunsuzluklar'],
                          hizmet: ['hizmet-katalogu', 'ekipmanlar', 'envanter-mutabakati'] } },
    saha:      { bolumler: ['panel', 'operasyon'],
                 ekran: { panel: ['panel', 'gunluk-ozet', 'ajanda', 'bildirimler'],
                          operasyon: ['is-emirleri', 'saha-kontrol', 'saha-kontrol-formu', 'eksik-ekipmanlar'] } },
    satis:     { bolumler: ['panel', 'musteri', 'hizmet', 'ticari', 'raporlama'],
                 ekran: { hizmet: ['hizmet-katalogu', 'fiyat-listeleri', 'sozlesme-pozlari'],
                          ticari: ['teklifler', 'sozlesmeler', 'faturalar', 'tahsilatlar'] } },
    finans:    { bolumler: ['panel', 'musteri', 'ticari', 'kaynak', 'raporlama'],
                 ekran: { musteri: ['musteriler', 'projeler'],
                          kaynak: ['taseronlar', 'taseron-hakedisleri'] } },
    taseron:   { bolumler: ['panel', 'operasyon', 'teknik', 'kaynak'],
                 ekran: { panel: ['panel', 'gunluk-ozet', 'ajanda', 'bildirimler'],
                          operasyon: ['is-emirleri', 'saha-kontrol', 'saha-kontrol-formu'],
                          teknik: ['teknik-raporlar'],
                          kaynak: ['taseron-hakedisleri'] } },
    musteri:   { bolumler: ['portal'], acilis: 'musteri-portali.html' },
    sistem:    { bolumler: ['panel', 'raporlama', 'sistem'],
                 ekran: { panel: ['panel', 'bildirimler'] } }
  };

  /* ---- rol çözümlemesi ---- */
  var sorgu = new URLSearchParams(location.search);
  var rol = sorgu.get('role');
  if (!rol) { try { rol = localStorage.getItem('gv_tk_rol'); } catch (e) {} }
  if (!rol || !ROL_YETKI[rol]) rol = 'sahip';
  try { localStorage.setItem('gv_tk_rol', rol); } catch (e) {}

  var yetki = ROL_YETKI[rol];
  var rolBilgi = null;
  (window.DEMO.roller || []).forEach(function (r) { if (r.id === rol) rolBilgi = r; });
  var personel = null;
  if (rolBilgi && rolBilgi.personelId) {
    (window.DEMO.personeller || []).forEach(function (p) { if (p.id === rolBilgi.personelId) personel = p; });
  }
  var kullanici = {
    ad: personel ? personel.ad : (rolBilgi && rolBilgi.taseronId ? 'Aydın Perçin' : 'Rüya Cansever'),
    rolAd: rolBilgi ? rolBilgi.ad : 'Firma Sahibi',
    ini: personel ? personel.ini : (rolBilgi && rolBilgi.taseronId ? 'AP' : 'RC')
  };

  var bolum = document.body.getAttribute('data-sec') || 'panel';
  var ekran = document.body.getAttribute('data-screen') || '';

  /* ---- global GV nesnesi ---- */
  window.GV = window.GV || {};
  window.GV.rol = rol;
  window.GV.rolBilgi = rolBilgi;
  window.GV.yetki = yetki;
  window.GV.kullanici = kullanici;
  window.GV.bolum = bolum;
  window.GV.ekran = ekran;
  window.GV.BOLUMLER = BOLUMLER;
  window.GV.ROL_YETKI = ROL_YETKI;

  /* rol parametresini bağlantılara taşır (rol seçimi sayfalar arası korunur) */
  function rolluHref(href) {
    if (!href || href.charAt(0) === '#' || /^https?:/.test(href)) return href;
    return href + (href.indexOf('?') === -1 ? '?' : '&') + 'role=' + rol;
  }
  window.GV.href = rolluHref;

  function ekranGorunur(bolumAnahtar, kalem) {
    if (!yetki.ekran || !yetki.ekran[bolumAnahtar]) return true;
    if (!kalem.screen) return true;
    return yetki.ekran[bolumAnahtar].indexOf(kalem.screen) !== -1;
  }
  window.GV.ekranGorunur = ekranGorunur;
  window.GV.bolumGorunur = function (b) { return yetki.bolumler.indexOf(b) !== -1; };

  /* giriş sayfası kabuğu çizmez; yalnız rol motorunu kullanır */
  if (document.body.getAttribute('data-shell') === 'off') return;

  /* ================= 1) RAIL ================= */
  var railEl = document.getElementById('gvRail');
  if (railEl) {
    var h = '<a class="gv-rail-logo" href="' + rolluHref('panel.html') + '" data-tip="' + METIN.marka + ' — ' + METIN.urun + '" aria-label="Ana panel">G</a>'
          + '<span class="gv-rail-div"></span><div class="gv-rail-nav">';
    RAIL_SIRASI.forEach(function (anahtar) {
      if (yetki.bolumler.indexOf(anahtar) === -1) return;
      var B = BOLUMLER[anahtar];
      var gorunen = B.menu.filter(function (m) { return m.href && ekranGorunur(anahtar, m); });
      if (!gorunen.length) return;
      h += '<a class="gv-rail-ico' + (anahtar === bolum ? ' is-active' : '') + '" href="' + rolluHref(gorunen[0].href) + '"'
         + ' data-tip="' + B.baslik + '" aria-label="' + B.baslik + '"' + (anahtar === bolum ? ' aria-current="page"' : '') + '>'
         + '<i class="fa-solid ' + B.ikon + '" aria-hidden="true"></i></a>';
    });
    h += '</div><div class="gv-rail-foot">'
       + '<a class="gv-sig" href="index.html" data-tip="Rol değiştir / çıkış" aria-label="Rol değiştir">GAVIA</a>'
       + '</div>';
    railEl.innerHTML = h;
  }

  /* ================= 2) MODÜL MENÜSÜ ================= */
  var B = BOLUMLER[bolum] || BOLUMLER.panel;
  var menuEl = document.getElementById('gvMenu');
  var aktifKalem = null;
  if (menuEl) {
    var mh = '<div class="gv-menu-head"><span class="gmh-eyebrow">' + B.ustBaslik + '</span>'
           + '<span class="gmh-title">' + B.baslik + '</span></div><nav class="gv-mnav" aria-label="' + B.baslik + ' menüsü">';
    var liste = B.menu.filter(function (m) { return m.bolum || ekranGorunur(bolum, m); });
    /* altı boşalan bölüm başlıklarını düşür */
    liste = liste.filter(function (m, i) { return !m.bolum || (liste[i + 1] && !liste[i + 1].bolum); });
    liste.forEach(function (m) {
      if (m.bolum) { mh += '<div class="gv-msec">' + m.bolum + '</div>'; return; }
      var aktif = ekran && m.screen === ekran;
      if (aktif) aktifKalem = m;
      mh += '<a class="gv-mlink' + (aktif ? ' is-active' : '') + '" href="' + rolluHref(m.href) + '"'
          + (aktif ? ' aria-current="page"' : '') + '>'
          + '<i class="fa-solid ' + m.ikon + '" aria-hidden="true"></i> ' + m.etiket
          + (m.sayac ? '<span class="ml-cnt">' + m.sayac + '</span>' : '') + '</a>';
    });
    mh += '</nav><div class="gv-menu-foot">'
        + '<a class="gv-mlink" href="index.html"><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> ' + METIN.cikis + '</a>'
        + '</div>';
    menuEl.innerHTML = mh;
  }

  /* ================= 3) ÜST BAR ================= */
  var topEl = document.getElementById('gvTop');
  if (topEl) {
    topEl.innerHTML =
      '<button class="gv-burger" id="gvBurger" aria-label="Menüyü aç" aria-expanded="false"><i class="fa-solid fa-bars" aria-hidden="true"></i></button>'
    + '<div class="gv-search" role="search">'
    +   '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>'
    +   '<label class="gv-sr" for="gvSearchInput">Genel arama</label>'
    +   '<input type="search" id="gvSearchInput" placeholder="' + METIN.ara + '" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="gvSearchPop">'
    +   '<div class="gv-pop gv-searchpop" id="gvSearchPop" role="listbox" aria-label="Arama sonuçları"></div>'
    + '</div>'
    + '<div class="gv-top-tools">'
    +   '<button class="gv-iconbtn gv-langbtn" id="gvLang" data-tip="' + METIN.dil + '" aria-label="' + METIN.dil + '">TR</button>'
    +   '<a class="gv-iconbtn" href="' + rolluHref('bildirimler.html') + '" data-tip="' + METIN.bildirim + '" aria-label="' + METIN.bildirim + '">'
    +     '<i class="fa-regular fa-bell" aria-hidden="true"></i><span class="gb-cnt" id="gvBellCount">5</span></a>'
    +   '<div style="position:relative">'
    +     '<button class="gv-me" id="gvMe" aria-haspopup="menu" aria-expanded="false">'
    +       '<span class="me-ava">' + kullanici.ini + '</span>'
    +       '<span class="me-id"><span class="me-name">' + kullanici.ad + '</span><span class="me-role">' + kullanici.rolAd + '</span></span>'
    +       '<i class="fa-solid fa-chevron-down me-caret" aria-hidden="true"></i>'
    +     '</button>'
    +     '<div class="gv-pop" id="gvMePop" role="menu">'
    +       '<div class="gp-head"><b>' + kullanici.ad + '</b><span>' + kullanici.rolAd + '</span></div>'
    +       '<a href="' + rolluHref('ayarlar.html') + '#profil" role="menuitem"><i class="fa-regular fa-user" aria-hidden="true"></i> Profil</a>'
    +       '<a href="' + rolluHref('ayarlar.html') + '" role="menuitem"><i class="fa-solid fa-sliders" aria-hidden="true"></i> Hesap Ayarları</a>'
    +       '<a href="' + rolluHref('bildirimler.html') + '" role="menuitem"><i class="fa-regular fa-bell" aria-hidden="true"></i> Bildirim Tercihleri</a>'
    +       '<div class="gp-div"></div>'
    +       '<a href="index.html" class="danger" role="menuitem"><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> ' + METIN.cikis + '</a>'
    +     '</div>'
    +   '</div>'
    + '</div>';
  }

  /* ================= 4) BREADCRUMB ================= */
  var ana = document.querySelector('main.gv-main');
  var crumbEl = null;
  if (ana && !ana.querySelector('.gv-crumbs')) {
    var gorunenler = B.menu.filter(function (m) { return m.href && ekranGorunur(bolum, m); });
    crumbEl = document.createElement('nav');
    crumbEl.className = 'gv-crumbs';
    crumbEl.setAttribute('aria-label', 'Sayfa yolu');
    var ch = gorunenler[0]
      ? '<a class="gvc-sec" href="' + rolluHref(gorunenler[0].href) + '">' + B.baslik + '</a>'
      : '<span class="gvc-sec">' + B.baslik + '</span>';
    if (aktifKalem) ch += '<i class="fa-solid fa-chevron-right gvc-sep" aria-hidden="true"></i><span class="gvc-mod">' + aktifKalem.etiket + '</span>';
    crumbEl.innerHTML = ch;
    ana.insertBefore(crumbEl, ana.firstChild);
  }

  /* kayıt segmenti — detay sayfaları çağırır: GV.crumb('IE-2026-0011') */
  window.GV.crumb = function (etiket) {
    if (!crumbEl) return;
    var eskiK = crumbEl.querySelector('.gvc-kayit'), eskiS = crumbEl.querySelector('.gvc-sep-kayit');
    if (eskiK) eskiK.remove();
    if (eskiS) eskiS.remove();
    if (!etiket) return;
    var modEl = crumbEl.querySelector('.gvc-mod');
    if (modEl && aktifKalem && aktifKalem.href && modEl.tagName !== 'A') {
      var a = document.createElement('a');
      a.className = 'gvc-mod'; a.href = rolluHref(aktifKalem.href); a.textContent = modEl.textContent;
      modEl.replaceWith(a);
    }
    var sep = document.createElement('i');
    sep.className = 'fa-solid fa-chevron-right gvc-sep gvc-sep-kayit';
    sep.setAttribute('aria-hidden', 'true');
    var k = document.createElement('span');
    k.className = 'gvc-kayit'; k.textContent = etiket;
    crumbEl.appendChild(sep); crumbEl.appendChild(k);
  };
  if (document.body.dataset.crumb) window.GV.crumb(document.body.dataset.crumb);

  /* ================= 5) ETKİLEŞİMLER ================= */
  /* mobil çekmece */
  var burger = document.getElementById('gvBurger'), ortu = document.getElementById('gvOverlay');
  function cekmece(ac) {
    document.body.classList.toggle('nav-open', ac);
    if (burger) burger.setAttribute('aria-expanded', ac ? 'true' : 'false');
  }
  if (burger) burger.addEventListener('click', function () { cekmece(!document.body.classList.contains('nav-open')); });
  if (ortu) ortu.addEventListener('click', function () { cekmece(false); });

  /* menü katlama — tercih localStorage'da kalıcı */
  var ayrac = document.getElementById('gvDivider');
  try { if (localStorage.getItem('gv_tk_menu') === 'kapali') document.body.classList.add('gv-collapsed'); } catch (e) {}
  if (ayrac) {
    var katli = function () { return document.body.classList.contains('gv-collapsed'); };
    var ayarla = function (k) {
      document.body.classList.toggle('gv-collapsed', k);
      try { localStorage.setItem('gv_tk_menu', k ? 'kapali' : 'acik'); } catch (e) {}
      ayrac.setAttribute('aria-label', k ? 'Menüyü genişlet' : 'Menüyü daralt');
    };
    ayarla(katli());
    var suruklu = false, baslangicX = 0, hareket = false;
    ayrac.addEventListener('pointerdown', function (e) {
      suruklu = true; hareket = false; baslangicX = e.clientX; ayrac.classList.add('is-drag');
      try { ayrac.setPointerCapture(e.pointerId); } catch (_) {}
    });
    ayrac.addEventListener('pointermove', function (e) {
      if (!suruklu) return;
      var dx = e.clientX - baslangicX;
      if (Math.abs(dx) > 5) hareket = true;
      if (dx < -26 && !katli()) ayarla(true);
      else if (dx > 26 && katli()) ayarla(false);
    });
    var bitir = function () {
      if (suruklu && !hareket) ayarla(!katli());
      suruklu = false; ayrac.classList.remove('is-drag');
    };
    ayrac.addEventListener('pointerup', bitir);
    ayrac.addEventListener('pointercancel', bitir);
    ayrac.setAttribute('tabindex', '0');
    ayrac.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ayarla(!katli()); }
    });
  }

  /* hesap menüsü */
  var meBtn = document.getElementById('gvMe'), mePop = document.getElementById('gvMePop');
  if (meBtn && mePop) {
    meBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var ac = !mePop.classList.contains('open');
      mePop.classList.toggle('open', ac);
      meBtn.setAttribute('aria-expanded', ac ? 'true' : 'false');
    });
    document.addEventListener('click', function () {
      mePop.classList.remove('open'); meBtn.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { mePop.classList.remove('open'); meBtn.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* dil düğmesi — çok dil desteği hazırlığı */
  var langBtn = document.getElementById('gvLang');
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      if (window.gvToast) window.gvToast('Arayüz dili Türkçe. Çok dil desteği veri katmanında hazır; ikinci dil paketi tanımlanmadı.', { ton: 'info' });
    });
  }

  /* okunmamış bildirim sayısı — role göre */
  var bell = document.getElementById('gvBellCount');
  if (bell && window.demoApi) {
    var okunmamis = window.demoApi.liste('bildirimler').filter(function (b) {
      return !b.okundu && (!b.hedefRoller || b.hedefRoller.indexOf(rol) !== -1);
    }).length;
    if (okunmamis) { bell.textContent = okunmamis; }
    else { bell.hidden = true; }
  }

  /* global arama */
  var searchInp = document.getElementById('gvSearchInput'), searchPop = document.getElementById('gvSearchPop');
  if (searchInp && searchPop && window.demoApi) {
    var zaman = null;
    function ciz(sonuc, q) {
      if (!q || q.length < 2) { searchPop.classList.remove('open'); searchInp.setAttribute('aria-expanded', 'false'); return; }
      if (!sonuc.length) {
        searchPop.innerHTML = '<div class="gs-group">Sonuç yok</div><div style="padding:6px 12px 12px;font-size:12.5px;color:var(--muted)">“' + q + '” için kayıt bulunamadı.</div>';
      } else {
        var grup = '', ic = '';
        sonuc.forEach(function (s) {
          if (s.grup !== grup) { grup = s.grup; ic += '<div class="gs-group">' + grup + '</div>'; }
          ic += '<a class="gs-item" href="' + rolluHref(s.link) + '" role="option">'
              + '<span class="gs-ico"><i class="fa-solid ' + s.ikon + '" aria-hidden="true"></i></span>'
              + '<span class="gs-txt"><b>' + s.baslik + '</b><span>' + s.altBaslik + '</span></span></a>';
        });
        searchPop.innerHTML = ic;
      }
      searchPop.classList.add('open');
      searchInp.setAttribute('aria-expanded', 'true');
    }
    searchInp.addEventListener('input', function () {
      clearTimeout(zaman);
      var q = searchInp.value;
      zaman = setTimeout(function () { ciz(window.demoApi.ara(q), q.trim()); }, 160);
    });
    searchInp.addEventListener('focus', function () { if (searchInp.value.trim().length >= 2) searchPop.classList.add('open'); });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.gv-search')) { searchPop.classList.remove('open'); searchInp.setAttribute('aria-expanded', 'false'); }
    });
    searchInp.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { searchPop.classList.remove('open'); searchInp.blur(); }
    });
  }

  /* sayfa içi bağlantılara rol parametresini ekle (göreli .html bağlantıları) */
  document.addEventListener('DOMContentLoaded', function () { rolBaglantilariniIsle(document); });
  window.GV.rolBaglantilariniIsle = rolBaglantilariniIsle;
  function rolBaglantilariniIsle(kok) {
    var baglantilar = kok.querySelectorAll('a[href$=".html"], a[href*=".html?"]');
    for (var i = 0; i < baglantilar.length; i++) {
      var a = baglantilar[i], href = a.getAttribute('href');
      if (!href || /^https?:/.test(href) || href.indexOf('role=') !== -1 || href.indexOf('index.html') === 0) continue;
      a.setAttribute('href', rolluHref(href));
    }
  }
  rolBaglantilariniIsle(document);
})();
