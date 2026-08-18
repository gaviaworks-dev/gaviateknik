/* =====================================================================
   GAVIA — PARA VE ZAMAN ÇEKİRDEĞİ
   Doküman §8 "Para, tarih ve KPI kuralları":
     · Para hesapları Number ile yuvarlama zincirine bırakılmaz; kuruş
       bazlı integer kullanılır.
     · Para birimi kayıt seviyesinde tutulur; farklı para birimleri tek
       toplamda BİRLEŞTİRİLMEZ.
     · Tarihler veri modelinde ISO 8601; iş tarihlerinde Europe/Istanbul;
       ekranda tr-TR.
     · Gecikme hesapları tarayıcı saatine değil ClockService arayüzüne
       bağlanır; testte zaman sabitlenebilir.

   Bu dosya kimlik.js'den hemen sonra, hiçbir şeye bağlı olmadan yüklenir.

   Global API: GV.kurus · GV.para · GV.paraToplam · GV.PARA
               GV.saat (ClockService)
   ===================================================================== */
(function () {
  'use strict';
  var kok = typeof window !== 'undefined' ? window : globalThis;
  var GV = kok.GV || (kok.GV = {});

  /* ===================================================================
     1) KURUŞ ARİTMETİĞİ

     Tutarlar hesap sırasında TAM SAYI kuruş olarak taşınır; float
     yuvarlama zinciri oluşmaz. Veri modeli TL cinsinden sayı tuttuğu
     için giriş/çıkışta çevrim yapılır — çevrim tek yerdedir.
     =================================================================== */
  var K = {};

  /** TL (sayı ya da metin) → tam sayı kuruş. Geçersizse 0. */
  K.al = function (tl) {
    if (tl == null || tl === '') return 0;
    var n = typeof tl === 'number' ? tl : Number(String(tl).replace(',', '.'));
    if (!isFinite(n)) return 0;
    /* 1e-9 epsilon: 0.1+0.2 gibi ikili gösterim artıklarını yutar. */
    return Math.round(n * 100 + (n >= 0 ? 1e-9 : -1e-9));
  };

  /** Tam sayı kuruş → TL sayısı (gösterim/veri yazımı için). */
  K.tl = function (kurus) { return Math.round(Number(kurus) || 0) / 100; };

  /** Kuruş toplamı — argümanların hepsi kuruş olmalıdır. */
  K.topla = function () {
    var t = 0;
    for (var i = 0; i < arguments.length; i++) t += Math.round(Number(arguments[i]) || 0);
    return t;
  };
  K.cikar = function (a, b) { return Math.round(Number(a) || 0) - Math.round(Number(b) || 0); };

  /** Kuruş × adet (adet tam sayı ya da ondalıklı miktar olabilir). */
  K.carp = function (kurus, adet) {
    return Math.round((Math.round(Number(kurus) || 0)) * (Number(adet) || 0));
  };

  /** Kuruşun oranı — KDV, iskonto, kısmi ödeme. Yuvarlama TEK yerde. */
  K.oran = function (kurus, oran) {
    return Math.round((Math.round(Number(kurus) || 0)) * (Number(oran) || 0));
  };

  /** Kuruş dizisi toplamı. */
  K.toplamDizi = function (dizi) {
    return (dizi || []).reduce(function (t, x) { return t + (Math.round(Number(x) || 0)); }, 0);
  };

  GV.kurus = K;

  /* ===================================================================
     2) PARA BİRİMİ

     Para birimi KAYIT SEVİYESİNDE tutulur. Toplam alınırken birimler
     ayrı kovalarda birikir; tek sayıya indirgemek ancak tek birim varsa
     mümkündür.
     =================================================================== */
  GV.PARA_VARSAYILAN = 'TRY';
  var SIMGE = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' };

  /**
   * Para değeri sarmalayıcısı.
   * @param {number} tl        TL cinsinden tutar
   * @param {string} [birim]   ISO 4217 kodu (varsayılan TRY)
   */
  GV.para = function (tl, birim) {
    return { kurus: K.al(tl), birim: (birim || GV.PARA_VARSAYILAN).toUpperCase() };
  };

  /** Kuruş + birim → '₺1.234,56' (birim TRY değilse kod önekle gösterilir). */
  GV.paraBicim = function (kurus, birim, ondalik) {
    var b = (birim || GV.PARA_VARSAYILAN).toUpperCase();
    var v = K.tl(kurus);
    var basamak = ondalik == null ? (v % 1 === 0 ? 0 : 2) : ondalik;
    var metin = Math.abs(v).toLocaleString('tr-TR', {
      minimumFractionDigits: basamak, maximumFractionDigits: basamak
    });
    var isaret = v < 0 ? '-' : '';
    return SIMGE[b]
      ? isaret + SIMGE[b] + metin
      : isaret + metin + ' ' + b;
  };

  /**
   * Kayıt listesinin para birimine göre AYRIŞTIRILMIŞ toplamı.
   * Farklı para birimleri asla tek sayıda birleşmez.
   *
   * @param {Array<Object>} kayitlar
   * @param {string} tutarAlan             TL cinsinden alan adı
   * @param {string} [paraAlan='paraBirimi']
   * @returns {{kovalar:Object<string,number>, birimler:string[], karisikMi:boolean,
   *            tek:(function():{kurus:number,birim:string}|null), metin:function():string}}
   */
  GV.paraToplam = function (kayitlar, tutarAlan, paraAlan) {
    var alan = paraAlan || 'paraBirimi';
    var kovalar = {};
    (kayitlar || []).forEach(function (k) {
      var b = String(k[alan] || GV.PARA_VARSAYILAN).toUpperCase();
      kovalar[b] = (kovalar[b] || 0) + K.al(k[tutarAlan]);
    });
    var birimler = Object.keys(kovalar).sort();
    return {
      kovalar: kovalar,
      birimler: birimler,
      karisikMi: birimler.length > 1,
      /** Tek para birimi varsa {kurus, birim}; karışıksa null. */
      tek: function () {
        return birimler.length === 1 ? { kurus: kovalar[birimler[0]], birim: birimler[0] } : null;
      },
      /** Karışık toplamı da dürüstçe gösterir: '₺120.500 + €4.300'. */
      metin: function (ondalik) {
        if (!birimler.length) return GV.paraBicim(0, GV.PARA_VARSAYILAN, ondalik);
        return birimler.map(function (b) { return GV.paraBicim(kovalar[b], b, ondalik); }).join(' + ');
      }
    };
  };

  /* ===================================================================
     3) CLOCK SERVICE

     `simdi()`  → gerçek duvar saati (ms). Süre ölçümü, zaman damgası.
     `bugun()`  → İŞ TARİHİ (ISO). Demo veri sabit bir "bugün" taşır;
                  gecikme hesapları tarayıcı saatine değil buna bağlanır.
     Test `sabitle()` ile ikisini de dondurur.
     =================================================================== */
  var sabitEpoch = null;
  var sabitGun = null;

  function ikiHane(n) { return String(n).padStart(2, '0'); }

  var Saat = {
    /** Gerçek duvar saati (ms epoch). Testte sabitlenebilir. */
    simdi: function () { return sabitEpoch != null ? sabitEpoch : Date.now(); },

    /**
     * İş tarihi (ISO 8601, Europe/Istanbul). Demo verisinin sabit
     * tarihi varsa o esastır — gecikme hesapları makinenin saatine
     * göre kaymasın diye.
     */
    bugun: function () {
      if (sabitGun) return sabitGun;
      var D = kok.DEMO;
      if (D && D.bugun) return D.bugun;
      return Saat.isoGun(new Date(Saat.simdi()));
    },

    /** Date → 'YYYY-MM-DD' (yerel alanlar; ISO 8601 tarih kısmı). */
    isoGun: function (d) {
      return d.getFullYear() + '-' + ikiHane(d.getMonth() + 1) + '-' + ikiHane(d.getDate());
    },

    /** Denetim izi için 'YYYY-MM-DDTHH:MM:SS'. */
    zamanDamgasi: function () {
      var d = new Date(Saat.simdi());
      return Saat.isoGun(d) + 'T' + ikiHane(d.getHours()) + ':' + ikiHane(d.getMinutes())
        + ':' + ikiHane(d.getSeconds());
    },

    /** 'HH:MM' — form "son kaydetme" göstergesi gibi yerler için. */
    saatMetni: function () {
      var d = new Date(Saat.simdi());
      return ikiHane(d.getHours()) + ':' + ikiHane(d.getMinutes());
    },

    /** İki ISO tarih arasındaki gün farkı (b - a). Biri boşsa null. */
    gunFarki: function (a, b) {
      var d1 = Saat.tariheCevir(a), d2 = Saat.tariheCevir(b);
      if (!d1 || !d2) return null;
      return Math.round((d2 - d1) / 86400000);
    },

    /**
     * Vadeye göre GECİKME gün sayısı — pozitifse gecikmiştir.
     * Tarayıcı saatine değil iş tarihine bağlıdır (doküman §8).
     */
    gecikmeGun: function (vade) {
      var f = Saat.gunFarki(vade, Saat.bugun());
      return f == null ? null : f;
    },

    /** Gecikmiş mi? Vade boşsa false (sahte gecikme üretilmez). */
    gecikmisMi: function (vade) {
      var g = Saat.gecikmeGun(vade);
      return g != null && g > 0;
    },

    tariheCevir: function (s) {
      if (!s) return null;
      if (s instanceof Date) return isNaN(s.getTime()) ? null : s;
      var p = String(s).substring(0, 10).split('-');
      if (p.length !== 3) return null;
      var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
      return isNaN(d.getTime()) ? null : d;
    },

    /** Testte zamanı dondurur. `sabitle({epoch, gun})` */
    sabitle: function (secenek) {
      secenek = secenek || {};
      if (secenek.epoch != null) sabitEpoch = Number(secenek.epoch);
      if (secenek.gun != null) sabitGun = String(secenek.gun);
    },
    /** Gerçek saate döner. */
    cozul: function () { sabitEpoch = null; sabitGun = null; },
    sabitMi: function () { return sabitEpoch != null || sabitGun != null; }
  };

  GV.saat = Saat;

  /* Node tarafında birim test edilebilmesi için (tarayıcıda etkisiz). */
  if (typeof module !== 'undefined' && module.exports) module.exports = GV;
})();
