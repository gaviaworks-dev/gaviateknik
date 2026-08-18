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
    panel: { ikon: 'fa-gauge-high', ustBaslik: 'Genel Bakış', baslik: 'Ana Panel',
      aciklama: 'Günlük özet, aksiyonlar, onaylar ve bildirimler', izin: 'dashboard.view', menu: [
      { ikon: 'fa-gauge-high',        etiket: 'Ana Panel',        href: 'panel.html',            screen: 'panel' },
      { bolum: 'Gündem' },
      { ikon: 'fa-sun',               etiket: 'Günlük Özet',      href: 'gunluk-ozet.html',      screen: 'gunluk-ozet' },
      { ikon: 'fa-bolt',              etiket: 'Aksiyon Merkezi',  href: 'aksiyon-merkezi.html',  screen: 'aksiyon-merkezi', sayac: '9' },
      { ikon: 'fa-calendar-week',     etiket: 'Ajanda',           href: 'ajanda.html',           screen: 'ajanda' },
      { ikon: 'fa-stamp',             etiket: 'Bekleyen Onaylar', href: 'onaylar.html',          screen: 'onaylar', sayac: '6' },
      { ikon: 'fa-bell',              etiket: 'Bildirimler',      href: 'bildirimler.html',      screen: 'bildirimler', sayac: '5' }
    ] },

    musteri: { ikon: 'fa-building', ustBaslik: 'Ticari Ağ', baslik: 'Müşteri ve Projeler',
      aciklama: 'Müşteri, proje, lokasyon ve iletişim kişileri', izin: 'customers.view', menu: [
      { ikon: 'fa-building',          etiket: 'Müşteriler',       href: 'musteriler.html',       screen: 'musteriler' },
      { ikon: 'fa-diagram-project',   etiket: 'Projeler',         href: 'projeler.html',         screen: 'projeler' },
      { ikon: 'fa-location-dot',      etiket: 'Lokasyonlar',      href: 'lokasyonlar.html',      screen: 'lokasyonlar' },
      { ikon: 'fa-address-book',      etiket: 'İletişim Kişileri', href: 'iletisim-kisileri.html', screen: 'iletisim-kisileri' }
    ] },

    hizmet: { ikon: 'fa-list-check', ustBaslik: 'Kapsam', baslik: 'Hizmet ve Envanter',
      aciklama: 'Hizmet kataloğu, poz, fiyat, ekipman ve mutabakat', izin: 'catalog.view', menu: [
      { ikon: 'fa-list-check',        etiket: 'Hizmet Kataloğu',  href: 'hizmet-katalogu.html',  screen: 'hizmet-katalogu' },
      { ikon: 'fa-file-signature',    etiket: 'Sözleşme Pozları', href: 'sozlesme-pozlari.html', screen: 'sozlesme-pozlari' },
      { ikon: 'fa-tags',              etiket: 'Fiyat Listeleri',  href: 'fiyat-listeleri.html',  screen: 'fiyat-listeleri' },
      { bolum: 'Envanter' },
      { ikon: 'fa-clipboard-list',    etiket: 'Ön Envanter',      href: 'on-envanter.html',      screen: 'on-envanter' },
      { ikon: 'fa-gears',             etiket: 'Ekipmanlar',       href: 'ekipmanlar.html',       screen: 'ekipmanlar' },
      { ikon: 'fa-scale-balanced',    etiket: 'Envanter Mutabakatı', href: 'envanter-mutabakati.html', screen: 'envanter-mutabakati', sayac: '4' }
    ] },

    operasyon: { ikon: 'fa-helmet-safety', ustBaslik: 'Saha', baslik: 'Operasyon Yönetimi',
      aciklama: 'Planlama, operasyon takvimi, iş emri ve saha kontrolü', izin: 'operations.view', menu: [
      { ikon: 'fa-calendar-days',     etiket: 'Planlama',         href: 'planlama.html',         screen: 'planlama' },
      { ikon: 'fa-calendar-week',     etiket: 'Operasyon Takvimi', href: 'operasyon-takvimi.html', screen: 'operasyon-takvimi' },
      { ikon: 'fa-clipboard-check',   etiket: 'İş Emirleri',      href: 'is-emirleri.html',      screen: 'is-emirleri' },
      { bolum: 'Saha' },
      { ikon: 'fa-helmet-safety',     etiket: 'Saha Kontrolleri', href: 'saha-kontrol.html',     screen: 'saha-kontrol' },
      { ikon: 'fa-mobile-screen',     etiket: 'Mobil Kontrol Formu', href: 'saha-kontrol-formu.html', screen: 'saha-kontrol-formu' },
      { ikon: 'fa-box-open',          etiket: 'Eksik Ekipmanlar', href: 'eksik-ekipmanlar.html', screen: 'eksik-ekipmanlar', sayac: '8' },
      { ikon: 'fa-rotate-right',      etiket: 'Yeniden Kontroller', href: 'yeniden-kontroller.html', screen: 'yeniden-kontroller' }
    ] },

    teknik: { ikon: 'fa-file-lines', ustBaslik: 'Teknik', baslik: 'Rapor ve Uygunsuzluk',
      aciklama: 'Teknik rapor, onay, uygunsuzluk ve yeniden kontrol', izin: 'reports.view', menu: [
      { ikon: 'fa-file-lines',        etiket: 'Teknik Raporlar',  href: 'teknik-raporlar.html',  screen: 'teknik-raporlar' },
      { ikon: 'fa-stamp',             etiket: 'Rapor Onayları',   href: 'rapor-onaylari.html',   screen: 'rapor-onaylari', sayac: '2' },
      { ikon: 'fa-file-code',         etiket: 'Rapor Şablonları', href: 'rapor-sablonlari.html', screen: 'rapor-sablonlari' },
      { bolum: 'Uygunsuzluk' },
      { ikon: 'fa-circle-exclamation', etiket: 'Uygunsuzluklar',  href: 'uygunsuzluklar.html',   screen: 'uygunsuzluklar', sayac: '7' }
    ] },

    ticari: { ikon: 'fa-file-invoice-dollar', ustBaslik: 'Finans', baslik: 'Ticari Süreçler',
      aciklama: 'Teklif, sözleşme, hakediş, fatura ve tahsilat', izin: 'commerce.view', menu: [
      { ikon: 'fa-file-contract',     etiket: 'Teklifler',        href: 'teklifler.html',        screen: 'teklifler' },
      { ikon: 'fa-file-signature',    etiket: 'Sözleşmeler',      href: 'sozlesmeler.html',      screen: 'sozlesmeler' },
      { bolum: 'Hakediş ve Fatura' },
      { ikon: 'fa-calculator',        etiket: 'Hakedişler',       href: 'hakedisler.html',       screen: 'hakedisler' },
      { ikon: 'fa-layer-group',       etiket: 'Fatura Grupları',  href: 'fatura-gruplari.html',  screen: 'fatura-gruplari' },
      { ikon: 'fa-file-invoice-dollar', etiket: 'Faturalar',      href: 'faturalar.html',        screen: 'faturalar' },
      { ikon: 'fa-money-bill-transfer', etiket: 'Tahsilatlar',    href: 'tahsilatlar.html',      screen: 'tahsilatlar', sayac: '2' }
    ] },

    kaynak: { ikon: 'fa-users-gear', ustBaslik: 'Kaynak', baslik: 'Personel ve Taşeron',
      aciklama: 'Personel, yetkinlik, taşeron ve taşeron hakedişleri', izin: 'workforce.view', menu: [
      { ikon: 'fa-people-carry-box',  etiket: 'Taşeronlar',       href: 'taseronlar.html',       screen: 'taseronlar' },
      { ikon: 'fa-hand-holding-dollar', etiket: 'Taşeron Hakedişleri', href: 'taseron-hakedisleri.html', screen: 'taseron-hakedisleri' },
      { bolum: 'Personel' },
      { ikon: 'fa-users',             etiket: 'Personeller',      href: 'personeller.html',      screen: 'personeller' },
      { ikon: 'fa-certificate',       etiket: 'Yetkinlikler',     href: 'yetkinlikler.html',     screen: 'yetkinlikler' },
      { bolum: 'Ölçüm Cihazları' },
      { ikon: 'fa-ruler-combined',    etiket: 'Ölçüm Cihazları',  href: 'olcum-cihazlari.html',  screen: 'olcum-cihazlari' },
      { ikon: 'fa-vials',             etiket: 'Kalibrasyonlar',   href: 'kalibrasyonlar.html',   screen: 'kalibrasyonlar', sayac: '2' }
    ] },

    kalite: { ikon: 'fa-award', ustBaslik: 'Uyum', baslik: 'Kalite Yönetimi',
      aciklama: 'Kalite dokümanı, denetim, DÖF ve müşteri şikâyeti', izin: 'quality.view', menu: [
      { ikon: 'fa-folder-open',       etiket: 'Kalite Dokümanları', href: 'kalite-dokumanlari.html', screen: 'kalite-dokumanlari' },
      { ikon: 'fa-clipboard-user',    etiket: 'Denetimler',       href: 'denetimler.html',       screen: 'denetimler' },
      { ikon: 'fa-screwdriver-wrench', etiket: 'Düzeltici Faaliyetler', href: 'duzeltici-faaliyetler.html', screen: 'duzeltici-faaliyetler', sayac: '3' },
      { ikon: 'fa-comment-dots',      etiket: 'Müşteri Şikâyetleri', href: 'musteri-sikayetleri.html', screen: 'musteri-sikayetleri', sayac: '2' }
    ] },

    raporlama: { ikon: 'fa-chart-column', ustBaslik: 'Analiz', baslik: 'Raporlar',
      aciklama: 'Operasyonel, teknik, ticari ve kalite analizleri', izin: 'analytics.view', menu: [
      { ikon: 'fa-chart-column',      etiket: 'Rapor Merkezi',    href: 'raporlar.html',         screen: 'raporlar' }
    ] },

    portal: { ikon: 'fa-building-user', ustBaslik: 'Müşteri', baslik: 'Müşteri Portalı',
      aciklama: 'Müşterinin kendi lokasyon, rapor ve faturalarını gördüğü alan', izin: 'portal.view', menu: [
      { ikon: 'fa-house',             etiket: 'Genel Bakış',      href: 'musteri-portali.html',  screen: 'musteri-portali' },
      { ikon: 'fa-location-dot',      etiket: 'Lokasyonlarım',    href: 'portal-lokasyonlar.html', screen: 'portal-lokasyonlar' },
      { ikon: 'fa-file-lines',        etiket: 'Teknik Raporlar',  href: 'portal-raporlar.html',  screen: 'portal-raporlar' },
      { ikon: 'fa-file-invoice-dollar', etiket: 'Faturalar',      href: 'portal-faturalar.html', screen: 'portal-faturalar' }
    ] },

    sistem: { ikon: 'fa-sliders', ustBaslik: 'Yönetim', baslik: 'Sistem Ayarları',
      aciklama: 'Firma, roller, veri aktarımı ve işlem kayıtları', izin: 'system.view', menu: [
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

  /* ---- ROUTE KAYIT DEFTERİ ----
     Doküman §4: "Başlık, açıklama, ikon, route ve izin anahtarı routeRegistry
     içinde tanımlanır." Registry BOLUMLER'in YERİNE geçmez, ÜSTÜNE biner:
     BOLUMLER zaten etiket, ikon, href ve screen taşıyor; açıklama ve izin
     oraya eklendi, registry ondan türetiliyor. Rol matrisi ikinci kez
     tanımlanmaz — çelişme riski böylece ortadan kalkar.

     Her route tam olarak BİR ana modüle ve BİR alt menü kaydına bağlıdır. */
  var routeRegistry = RAIL_SIRASI.map(function (anahtar) {
    var B = BOLUMLER[anahtar];
    var kalemler = B.menu.filter(function (m) { return m.href; });
    return {
      key: anahtar,
      label: B.baslik,
      description: B.aciklama,
      icon: B.ikon,
      href: kalemler.length ? kalemler[0].href : null,
      permission: B.izin,
      screens: kalemler.map(function (m) {
        return { screen: m.screen, label: m.etiket, href: m.href, icon: m.ikon };
      })
    };
  });
  window.GV.routeRegistry = routeRegistry;

  /* Bir sayfa adından (href) route kaydını bulur. Tanımsız route null döner —
     çağıran ilk kaydı açmak yerine kontrollü ekran gösterir. */
  window.GV.route = function (href) {
    var ad = String(href || '').split('?')[0].split('/').pop();
    for (var i = 0; i < routeRegistry.length; i++) {
      var r = routeRegistry[i];
      for (var j = 0; j < r.screens.length; j++) {
        if (r.screens[j].href === ad) return { modul: r, ekran: r.screens[j] };
      }
    }
    return null;
  };

  /* giriş sayfası kabuğu çizmez; yalnız rol motorunu kullanır */
  if (document.body.getAttribute('data-shell') === 'off') return;

  /* ---- ERİŞİM KORUMASI ----
     Rolün yetkisi olmayan bölüm veya ekrana doğrudan URL ile girilirse
     kullanıcı kendi açılış sayfasına yönlendirilir (menü gizlemenin yanı sıra
     adres çubuğundan erişim de kapatılır). */
  (function erisimKontrolu() {
    var izinli = yetki.bolumler.indexOf(bolum) !== -1;
    var B0 = BOLUMLER[bolum];
    if (izinli && B0 && ekran) {
      var kalem = null;
      B0.menu.forEach(function (m) { if (m.screen === ekran) kalem = m; });
      /* menüde karşılığı olmayan alt ekranlar (detay/form) ana ekranı miraslar */
      if (kalem && !ekranGorunur(bolum, kalem)) izinli = false;
    }
    if (izinli) return;
    var hedef = yetki.acilis;
    if (!hedef) {
      var ilkBolum = yetki.bolumler[0];
      var BX = BOLUMLER[ilkBolum];
      var gorunen = BX ? BX.menu.filter(function (m) { return m.href && ekranGorunur(ilkBolum, m); }) : [];
      hedef = gorunen.length ? gorunen[0].href : 'index.html';
    }
    location.replace(rolluHref(hedef) + '&yetkisiz=' + encodeURIComponent(bolum + (ekran ? '/' + ekran : '')));
  })();

  /* ================= 1) RAIL ================= */
  /* Klavye kullanıcısı her sayfada 76px rail + 264px menü + topbar'ı tab'layarak
     geçmek zorunda kalmasın: içeriğe atla bağlantısı gövdenin ilk odaklanabilir
     öğesidir, yalnız odaklandığında görünür. */
  (function iceriyeAtla() {
    if (document.getElementById('gvSkip')) return;
    var ana = document.querySelector('.gv-main');
    if (!ana) return;
    if (!ana.id) ana.id = 'gvIcerik';
    var a = document.createElement('a');
    a.id = 'gvSkip'; a.className = 'gv-skip'; a.href = '#' + ana.id;
    a.textContent = 'İçeriğe atla';
    a.addEventListener('click', function () {
      ana.setAttribute('tabindex', '-1');
      ana.focus();
    });
    document.body.insertBefore(a, document.body.firstChild);
  })();

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
         + ' data-tip="' + B.baslik + '" data-tip-desc="' + (B.aciklama || '') + '"'
         + ' aria-label="' + B.baslik + '"' + (anahtar === bolum ? ' aria-current="page"' : '') + '>'
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
    /* Mobil çekmecede hover yoktur; modül adının yanında kısa açıklama
       gösterilir (doküman §4 "Mobil" maddesi). */
    var mh = '<div class="gv-menu-head"><span class="gmh-eyebrow">' + B.ustBaslik + '</span>'
           + '<span class="gmh-title">' + B.baslik + '</span>'
           + (B.aciklama ? '<span class="gmh-desc">' + B.aciklama + '</span>' : '')
           + '</div><nav class="gv-mnav" aria-label="' + B.baslik + ' menüsü">';
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
    /* Mobil arama katmanının kapat düğmesi — masaüstünde display:none. */
    +   '<button class="gv-search-close" id="gvSearchClose" type="button" aria-label="Aramayı kapat">'
    +     '<i class="fa-solid fa-xmark" aria-hidden="true"></i></button>'
    +   '<div class="gv-pop gv-searchpop" id="gvSearchPop" role="listbox" aria-label="Arama sonuçları"></div>'
    + '</div>'
    + '<div class="gv-top-tools">'
    /* Doküman §9: "Arama: mobilde ikonla açılan tam genişlik katman."
       Tetikleyici masaüstünde display:none, ≤640'ta görünür. */
    +   '<button class="gv-iconbtn gv-searchbtn" id="gvSearchOpen" type="button" data-tip="' + METIN.ara + '"'
    +     ' aria-label="' + METIN.ara + '" aria-expanded="false" aria-controls="gvSearchInput">'
    +     '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button>'
    +   '<button class="gv-iconbtn gv-langbtn" id="gvLang" data-tip="' + METIN.dil + '" aria-label="' + METIN.dil + '">TR</button>'
    +   '<a class="gv-iconbtn" href="' + rolluHref('bildirimler.html') + '" data-tip="' + METIN.bildirim + '" aria-label="' + METIN.bildirim + '">'
    +     '<i class="fa-regular fa-bell" aria-hidden="true"></i><span class="gb-cnt" id="gvBellCount" aria-live="polite" aria-atomic="true">5</span></a>'
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
  var cekmeceKap = document.getElementById('gvMenu');
  var oncekiOdak = null;

  function odaklanabilirler() {
    if (!cekmeceKap) return [];
    var hepsi = Array.prototype.slice.call(cekmeceKap.querySelectorAll(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    ));
    var gorunen = hepsi.filter(function (e) { return e.offsetParent !== null || e.getClientRects().length; });
    /* Düzen bilgisi olmayan ortamlarda (jsdom) görünürlük ölçülemez;
       o durumda tuzak boşa düşmesin diye tam listeye geri dönülür. */
    return gorunen.length ? gorunen : hepsi;
  }

  /* Tab tuzağı — çekmece açıkken odak dışarı çıkmaz (doküman §4). */
  function tuzak(e) {
    if (e.key === 'Escape') { e.preventDefault(); cekmece(false); return; }
    if (e.key !== 'Tab') return;
    var o = odaklanabilirler();
    if (!o.length) return;
    var ilk = o[0], son = o[o.length - 1];
    if (e.shiftKey && (document.activeElement === ilk || !cekmeceKap.contains(document.activeElement))) {
      e.preventDefault(); son.focus();
    } else if (!e.shiftKey && document.activeElement === son) {
      e.preventDefault(); ilk.focus();
    }
  }

  function cekmece(ac) {
    var acikti = document.body.classList.contains('nav-open');
    if (ac === acikti) return;
    document.body.classList.toggle('nav-open', ac);
    if (burger) burger.setAttribute('aria-expanded', ac ? 'true' : 'false');
    /* aria-hidden BİLİNÇLİ olarak konmuyor: aynı #gvMenu masaüstünde normal,
       görünür bir yan menü. Çekmece yalnız 980px altında bir moddur. */

    if (ac) {
      oncekiOdak = document.activeElement;
      if (window.gvScrollLock) gvScrollLock(true);
      document.addEventListener('keydown', tuzak, true);
      var o = odaklanabilirler();
      if (o.length) o[0].focus();
    } else {
      if (window.gvScrollLock) gvScrollLock(false);
      document.removeEventListener('keydown', tuzak, true);
      /* Menü kapandığında odak, drawer açma butonuna geri döner. */
      var geri = oncekiOdak && oncekiOdak !== document.body && document.contains(oncekiOdak)
        ? oncekiOdak : burger;
      if (geri && geri.focus) geri.focus();
      oncekiOdak = null;
    }
  }

  if (burger) burger.addEventListener('click', function () { cekmece(!document.body.classList.contains('nav-open')); });
  if (ortu) ortu.addEventListener('click', function () { cekmece(false); });
  /* Çekmece içinden bir bağlantıya gidilince kilit açık kalmasın. */
  if (cekmeceKap) cekmeceKap.addEventListener('click', function (e) {
    if (e.target.closest('a[href]') && document.body.classList.contains('nav-open')) cekmece(false);
  });

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
      if (e.key === 'Escape') {
        searchPop.classList.remove('open');
        searchInp.setAttribute('aria-expanded', 'false');
        if (document.body.classList.contains('gv-search-open')) aramaKatmani(false);
        else searchInp.blur();
      }
    });

    /* ---- mobil arama katmanı (doküman §9) ----
       ≤640'ta arama alanı üst barda yer kaplamaz; ikonla tam genişlik
       katman olarak açılır. Sonuç listesi katmanın genişliğinde kalır,
       viewport'tan taşmaz (responsive.css). */
    var aramaAc = document.getElementById('gvSearchOpen');
    var aramaKapat = document.getElementById('gvSearchClose');
    function aramaKatmani(ac) {
      document.body.classList.toggle('gv-search-open', !!ac);
      if (aramaAc) aramaAc.setAttribute('aria-expanded', ac ? 'true' : 'false');
      if (ac) { searchInp.focus(); }
      else {
        searchPop.classList.remove('open');
        searchInp.setAttribute('aria-expanded', 'false');
        if (aramaAc) aramaAc.focus();
      }
    }
    if (aramaAc) aramaAc.addEventListener('click', function () {
      aramaKatmani(!document.body.classList.contains('gv-search-open'));
    });
    if (aramaKapat) aramaKapat.addEventListener('click', function () { aramaKatmani(false); });
    /* Katman dışına dokunulunca kapanır; sonuç bağlantısına gidildiğinde
       sayfa değiştiği için ayrıca kapatmaya gerek yok. */
    document.addEventListener('click', function (e) {
      if (!document.body.classList.contains('gv-search-open')) return;
      if (e.target.closest('.gv-search') || e.target.closest('.gv-searchbtn')) return;
      aramaKatmani(false);
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
