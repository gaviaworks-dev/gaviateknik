/* =====================================================================
   GAVIA — PANEL WIDGET KAYIT DEFTERİ (doküman §12 iş paketi 9)
   Ana panelin içeriği role göre SABİT yazılmaz: her kart bir widget
   kaydıdır, kaydın görünürlüğü rolün izin kapsamından türer.

   Sözleşme:
     • Kayıt defteri SAF VERİDİR — anahtar, başlık, kabın id'si ve
       görünürlüğü belirleyen ekran anahtarı. Çizim kodu burada değildir.
     • Görünürlük TEK kaynaktan gelir: `GV.ekranIzni(ekran)` → navigation.js
       `ROL_YETKI`. Rol matrisi burada ikinci kez tanımlanmaz.
     • Sayfa, çizim işlevini `GV.panelWidget(anahtar, ciz)` ile bağlar.
       Bağlanmamış widget çizilmez ama defterde kalır (eksik olduğu görünür).
     • Çizim işlevi `false` dönerse kart gizlenir: izin kapsamı süzdükten
       sonra içinde gösterilecek hiçbir kalem kalmayan kart boş durmaz.
     • Yeni widget TASARLANMAZ; bu defter panelde bugün var olan kartların
       kaydıdır.

   Global API: GV.PANEL_DEFTERI · GV.panelWidget · GV.panelWidgetleri
               GV.widgetGorunur · GV.paneliCiz · GV.panelKapsam
               GV.panelSonCizim (son çizimde ekranda kalanlar)
   ===================================================================== */
(function () {
  'use strict';
  var kok = typeof window !== 'undefined' ? window : globalThis;
  var GV = kok.GV || (kok.GV = {});

  /**
   * Panel widget kaydı.
   * @typedef {Object} PanelWidget
   * @property {string} k       benzersiz anahtar
   * @property {string} ad      kart başlığı (denetim ve test çıktısında görünür)
   * @property {string} ekran   görünürlüğü belirleyen route ekran anahtarı
   * @property {string} kap     `data-widget` değeri taşıyan kabın anahtarı
   * @property {string} [bolum] görsel öbek: 'ust' | 'yan' | 'surec' | 'risk'
   */

  /* Panelde bugün var olan kartların kaydı — sıra ekrandaki sırayla aynıdır. */
  /** @type {PanelWidget[]} */
  var DEFTER = [
    { k: 'hizliOzet',    ad: 'Hızlı özet satırı',        ekran: 'panel',              bolum: 'ust' },
    { k: 'kpi',          ad: 'KPI kartları',             ekran: 'panel',              bolum: 'ust' },
    { k: 'aksiyon',      ad: 'Bugün aksiyon gerektirenler', ekran: 'aksiyon-merkezi', bolum: 'ana' },
    { k: 'onay',         ad: 'Bekleyen onaylar',         ekran: 'onaylar',            bolum: 'ana' },
    { k: 'proje',        ad: 'Proje ilerleme durumu',    ekran: 'projeler',           bolum: 'ana' },
    { k: 'aylikPlan',    ad: 'Aylık lokasyon planı',     ekran: 'planlama',           bolum: 'ana' },
    { k: 'saat',         ad: 'Saat kartı',               ekran: 'panel',              bolum: 'yan' },
    { k: 'ajanda',       ad: 'Bugünün ajandası',         ekran: 'ajanda',             bolum: 'yan' },
    { k: 'yaklasan',     ad: 'Yaklaşan kontroller',      ekran: 'planlama',           bolum: 'yan' },
    { k: 'teslim',       ad: 'Rapor teslim takvimi',     ekran: 'teknik-raporlar',    bolum: 'yan' },
    { k: 'not',          ad: 'Kısa not',                 ekran: 'panel',              bolum: 'yan' },
    { k: 'sla',          ad: 'Rapor SLA durumu',         ekran: 'teknik-raporlar',    bolum: 'surec' },
    { k: 'faturaGrubu',  ad: 'Fatura grubu doluluğu',    ekran: 'fatura-gruplari',    bolum: 'surec' },
    { k: 'taseronOdeme', ad: 'Taşeron ödeme durumu',     ekran: 'taseron-hakedisleri', bolum: 'surec' },
    { k: 'kalibrasyon',  ad: 'Yaklaşan kalibrasyonlar',  ekran: 'kalibrasyonlar',     bolum: 'risk' },
    { k: 'risk',         ad: 'Proje riskleri',           ekran: 'projeler',           bolum: 'risk' },
    { k: 'saha',         ad: 'Son saha bildirimleri',    ekran: 'saha-kontrol',       bolum: 'risk' }
  ];
  GV.PANEL_DEFTERI = DEFTER;

  /* ---- çizim işlevleri: sayfa bağlar ---- */
  var cizimler = {};

  /**
   * Bir widget'ın çizim işlevini bağlar.
   * @param {string} anahtar
   * @param {(baglam:Object, kap:Element)=>void} ciz
   */
  GV.panelWidget = function (anahtar, ciz) {
    cizimler[anahtar] = ciz;
    return ciz;
  };

  /** Kayıtlı mı — testler ve denetim için. */
  GV.panelWidgetBagli = function (anahtar) { return !!cizimler[anahtar]; };

  /**
   * Widget bu role görünür mü. Karar TEK yerden: rolün ekran izni.
   * @param {PanelWidget|string} w
   */
  GV.widgetGorunur = function (w) {
    var tanim = typeof w === 'string' ? bul(w) : w;
    if (!tanim) return false;
    if (typeof GV.ekranIzni !== 'function') return true;   /* kabuk yoksa kısıt yok */
    return GV.ekranIzni(tanim.ekran);
  };

  function bul(anahtar) {
    for (var i = 0; i < DEFTER.length; i++) if (DEFTER[i].k === anahtar) return DEFTER[i];
    return null;
  }

  /**
   * Bu rolün panelinde görünen widget anahtarları — defterdeki sırayla.
   * 13 rol anlık görüntüsü bu işlevden alınır.
   * @returns {string[]}
   */
  GV.panelWidgetleri = function () {
    return DEFTER.filter(GV.widgetGorunur).map(function (w) { return w.k; });
  };

  /**
   * Bir kart/kalem listesini rolün izin kapsamına göre süzer.
   * KPI kartları ve hızlı özet bağlantıları bunu kullanır: hedef ekranı
   * kapalı olan kalem panelde GÖSTERİLMEZ (tıklanınca yönlendirilirdi).
   * @param {Array<{ekran?:string}>} liste
   */
  GV.panelKapsam = function (liste) {
    if (typeof GV.ekranIzni !== 'function') return (liste || []).slice();
    return (liste || []).filter(function (x) { return !x.ekran || GV.ekranIzni(x.ekran); });
  };

  /**
   * Paneli çizer: görünür widget'ların çizim işlevini çağırır, görünmeyenlerin
   * kabını gizler. İçindeki bütün kartları gizlenen öbek (`.gv-botsec`) de
   * gizlenir — boş başlık bırakılmaz.
   * @param {Object} baglam sayfanın hazırladığı veri
   */
  GV.paneliCiz = function (baglam) {
    var eksik = [];
    var cizilen = [];
    DEFTER.forEach(function (w) {
      var kap = document.querySelector('[data-widget="' + w.k + '"]');
      var gorunur = GV.widgetGorunur(w);
      if (kap) kap.hidden = !gorunur;
      if (!gorunur) return;
      if (!cizimler[w.k]) { eksik.push(w.k); return; }
      /* çizim `false` dönerse: kapsam süzgecinden sonra kalem kalmadı */
      if (cizimler[w.k](baglam, kap) === false) { if (kap) kap.hidden = true; return; }
      cizilen.push(w.k);
    });
    /* içi tamamen boşalan öbek başlığı ekranda kalmaz */
    Array.prototype.forEach.call(document.querySelectorAll('.gv-botsec'), function (obek) {
      var kartlar = obek.querySelectorAll('[data-widget]');
      if (!kartlar.length) return;
      var acik = Array.prototype.filter.call(kartlar, function (k) { return !k.hidden; });
      obek.hidden = acik.length === 0;
    });
    if (eksik.length && kok.console) {
      console.warn('Panel widget çizimi bağlanmamış: ' + eksik.join(', '));
    }
    /* Ekranda gerçekten duran widget'lar — 13 rol anlık görüntüsü budur. */
    GV.panelSonCizim = cizilen;
    return { cizilen: cizilen, eksik: eksik };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = GV;
})();
