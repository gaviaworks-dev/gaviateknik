/* =====================================================================
   GAVIA — KPI SEÇİCİ KAYIT DEFTERİ
   Doküman §8 "Para, tarih ve KPI kuralları":
     · Dashboard KPI ve liste toplamlarının AYNI selector/query kaynağından
       üretilmesi zorunludur.
     · Silinmiş, arşivlenmiş ve kapsam dışı kayıtların KPI'ya dahil olup
       olmadığı TANIMLI BİR FİLTREDİR.

   Kullanım:
     GV.kpi('onayBekleyenRapor')          → { kayitlar, sayi, kapsam, dislanan }
     GV.kpiSay('onayBekleyenRapor')       → sayı
     GV.kpiPara('bekleyenTahsilat')       → GV.paraToplam sonucu
     GV.kpiKapsamMetni()                  → 'Arşiv hariç · kapsam dışı hariç'

   Panel ile liste ekranı aynı seçiciyi çağırır; iki yerde iki farklı
   sayı çıkması imkânsızdır.

   Global API: GV.kpi · GV.kpiSay · GV.kpiPara · GV.kpiTanim
               GV.kpiKaynak · GV.kpiKapsam · GV.kpiKapsamAyarla
               GV.kpiKapsamMetni · GV.kpiListesi
   ===================================================================== */
(function () {
  'use strict';
  var kok = typeof window !== 'undefined' ? window : globalThis;
  var GV = kok.GV || (kok.GV = {});
  function api() { return kok.demoApi || null; }

  /* ---------------------------------------------------------------
     1) KAPSAM FİLTRESİ — açık, tek yerde, görünür

     arsiv      : arşivlenmiş/pasif kayıtlar KPI'ya girsin mi
     kapsamDisi : kapsam dışı / iptal edilmiş kayıtlar girsin mi
     silinmis   : silinmiş kayıtlar girsin mi
                  (demoApi.liste() silinmişleri zaten döndürmez; bu bayrak
                   yalnız "dahil edilebilir mi" sorusunu açıkça yanıtlar
                   ve dışlanan sayısı raporlanır)
     --------------------------------------------------------------- */
  var VARSAYILAN = { arsiv: false, kapsamDisi: false, silinmis: false };
  var ANAHTAR = 'gv_tk_kpi_kapsam';
  var kapsam = Object.assign({}, VARSAYILAN);
  try {
    var kayitli = JSON.parse(kok.localStorage.getItem(ANAHTAR) || 'null');
    if (kayitli) kapsam = Object.assign({}, VARSAYILAN, kayitli);
  } catch (e) { /* depolama kapalıysa varsayılan kapsam */ }

  GV.KPI_KAPSAM_VARSAYILAN = VARSAYILAN;
  GV.kpiKapsam = function () { return Object.assign({}, kapsam); };
  GV.kpiKapsamAyarla = function (yeni, kalici) {
    kapsam = Object.assign({}, VARSAYILAN, yeni || {});
    if (kalici !== false) {
      try { kok.localStorage.setItem(ANAHTAR, JSON.stringify(kapsam)); } catch (e) {}
    }
    return GV.kpiKapsam();
  };
  GV.kpiKapsamMetni = function (k) {
    k = k || kapsam;
    var p = [];
    p.push(k.arsiv ? 'arşiv dahil' : 'arşiv hariç');
    p.push(k.kapsamDisi ? 'kapsam dışı dahil' : 'kapsam dışı hariç');
    p.push(k.silinmis ? 'silinmiş dahil' : 'silinmiş hariç');
    return p.join(' · ');
  };

  /* Koleksiyon bazlı "arşivli mi" yüklemleri — tek tanım noktası. */
  var ARSIVLI = {
    musteriler:        function (k) { return k.arsiv === true || k.durum === 'pasif'; },
    projeler:          function (k) { return k.durum === 'arsivlendi'; },
    raporlar:          function (k) { return k.durum === 'arsiv'; },
    raporSablonlari:   function (k) { return k.durum === 'arsiv'; },
    fiyatListeleri:    function (k) { return k.durum === 'arsiv'; },
    hizmetler:         function (k) { return k.durum === 'pasif'; },
    personeller:       function (k) { return k.durum === 'pasif'; },
    ekipmanlar:        function (k) { return k.durum === 'kullanim-disi'; },
    kaliteDokumanlari: function (k) { return k.durum === 'yururlukten-kalkti'; },
    veriAktarimlari:   function (k) { return k.durum === 'geri-alindi'; },
    sozlesmeler:       function (k) { return k.durum === 'sona-erdi'; }
  };

  /* Kapsam dışı / iptal yüklemleri. */
  var KAPSAM_DISI = {
    lokasyonlar: function (k) { return ['kapsam-disi', 'iptal'].indexOf(k.operasyonDurum) !== -1; },
    isEmirleri:  function (k) { return ['kapsam-disi', 'iptal'].indexOf(k.operasyonDurum) !== -1; },
    teklifler:   function (k) { return k.durum === 'kaybedildi'; }
  };

  GV.kpiArsivliMi = function (koleksiyon, k) {
    var f = ARSIVLI[koleksiyon];
    return f ? !!f(k) : false;
  };
  GV.kpiKapsamDisiMi = function (koleksiyon, k) {
    var f = KAPSAM_DISI[koleksiyon];
    return f ? !!f(k) : false;
  };

  /**
   * KPI'ların TEK veri kaynağı. Zengin okuyucusu olan koleksiyonlar
   * zenginleştirilmiş hâlleriyle döner (liste ekranlarıyla aynı veri).
   * @param {string} koleksiyon
   * @param {Object} [k] kapsam filtresi (verilmezse genel kapsam)
   * @returns {{kayitlar:Array, dislanan:{arsiv:number, kapsamDisi:number, silinmis:number}}}
   */
  GV.kpiKaynak = function (koleksiyon, k) {
    k = Object.assign({}, kapsam, k || {});
    var A = api();
    if (!A) return { kayitlar: [], dislanan: { arsiv: 0, kapsamDisi: 0, silinmis: 0 } };

    var ZENGIN = { lokasyonlar: 'lokasyonlar', isEmirleri: 'isEmirleri',
                   raporlar: 'raporlar', ekipmanlar: 'ekipmanlar' };
    var ham = ZENGIN[koleksiyon] ? A[ZENGIN[koleksiyon]]() : A.liste(koleksiyon);

    var dislanan = { arsiv: 0, kapsamDisi: 0, silinmis: 0 };
    /* Silinmiş kayıtlar demoApi katmanında zaten düşmüştür; sayısı
       raporlansın ki filtre "tanımlı" olsun (doküman §8). */
    if (typeof A.silinmisSayisi === 'function') dislanan.silinmis = A.silinmisSayisi(koleksiyon);

    var kayitlar = ham.filter(function (x) {
      if (!k.arsiv && GV.kpiArsivliMi(koleksiyon, x)) { dislanan.arsiv++; return false; }
      if (!k.kapsamDisi && GV.kpiKapsamDisiMi(koleksiyon, x)) { dislanan.kapsamDisi++; return false; }
      return true;
    });
    return { kayitlar: kayitlar, dislanan: dislanan, kapsam: k };
  };

  /* ---------------------------------------------------------------
     2) ADLANDIRILMIŞ SEÇİCİLER
     Panel ve liste ekranı AYNI adı çağırır.
     --------------------------------------------------------------- */
  var SECICILER = {};

  /**
   * @param {string} ad
   * @param {{koleksiyon:string, aciklama:string, kosul?:Function, paraAlani?:string}} tanim
   */
  GV.kpiTanim = function (ad, tanim) { SECICILER[ad] = tanim; return tanim; };
  GV.kpiListesi = function () { return Object.keys(SECICILER); };

  /**
   * Seçiciyi çalıştırır.
   * @returns {{ad:string, kayitlar:Array, sayi:number, kapsam:Object,
   *            dislanan:Object, aciklama:string, paraAlani?:string}}
   */
  GV.kpi = function (ad, k) {
    var t = SECICILER[ad];
    if (!t) throw new Error('Tanımsız KPI seçicisi: ' + ad);
    var kaynak = GV.kpiKaynak(t.koleksiyon, k);
    var kayitlar = t.kosul ? kaynak.kayitlar.filter(t.kosul) : kaynak.kayitlar;
    return {
      ad: ad, kayitlar: kayitlar, sayi: kayitlar.length,
      kapsam: kaynak.kapsam, dislanan: kaynak.dislanan,
      aciklama: t.aciklama, paraAlani: t.paraAlani, koleksiyon: t.koleksiyon
    };
  };

  GV.kpiSay = function (ad, k) { return GV.kpi(ad, k).sayi; };

  /** Para KPI'sı — para birimi kovalarına ayrışır, tek sayıda birleşmez. */
  GV.kpiPara = function (ad, k) {
    var r = GV.kpi(ad, k);
    var alan = r.paraAlani;
    if (!alan) throw new Error(ad + ' seçicisi para alanı tanımlamıyor.');
    return GV.paraToplam(r.kayitlar, alan);
  };

  /* ---------------------------------------------------------------
     3) ÇEKİRDEK SEÇİCİLER — panel ve liste ekranları bunları paylaşır
     --------------------------------------------------------------- */
  GV.kpiTanim('aktifProje', {
    koleksiyon: 'projeler', aciklama: 'Aktif proje / kampanya',
    kosul: function (p) { return p.durum === 'aktif'; }
  });

  GV.kpiTanim('projeKapsamindakiLokasyon', {
    koleksiyon: 'lokasyonlar', aciklama: 'Proje kapsamındaki lokasyon',
    kosul: function (l) { return !!l.projeId; }
  });

  GV.kpiTanim('onayBekleyenRapor', {
    koleksiyon: 'raporlar', aciklama: 'Teknik onay bekleyen rapor',
    kosul: function (r) { return r.durum === 'teknik-incelemede'; }
  });

  GV.kpiTanim('faturayaHazirLokasyon', {
    koleksiyon: 'lokasyonlar', aciklama: 'Faturaya hazır lokasyon',
    kosul: function (l) {
      var A = api();
      return !!(A && A.lokasyonFaturalanabilirMi(l.id).uygun);
    }
  });

  GV.kpiTanim('acikFatura', {
    koleksiyon: 'faturalar', aciklama: 'Bekleyen tahsilat', paraAlani: 'kalan',
    kosul: function (f) { return (f.kalan || 0) > 0; }
  });

  GV.kpiTanim('vadesiGecmisFatura', {
    koleksiyon: 'faturalar', aciklama: 'Vadesi geçmiş fatura', paraAlani: 'kalan',
    kosul: function (f) { return f.tahsilatDurum === 'vadesi-gecti'; }
  });

  GV.kpiTanim('odemeyeUygunHakedis', {
    koleksiyon: 'taseronHakedisleri', aciklama: 'Ödemeye uygun taşeron hakedişi',
    paraAlani: 'tutar',
    kosul: function (h) { return h.durum === 'odemeye-uygun' || h.durum === 'kismen-odendi'; }
  });

  GV.kpiTanim('kalibrasyonUyarisi', {
    koleksiyon: 'olcumCihazlari', aciklama: 'Kalibrasyon uyarısı',
    kosul: function (c) {
      var esik = GV.ayar ? GV.ayar('kalibrasyonEsik') : 30;
      var g = GV.saat.gunFarki(GV.saat.bugun(), c.kalibrasyonBitis);
      return g != null && g <= esik;
    }
  });

  GV.kpiTanim('gecikmisUygunsuzluk', {
    koleksiyon: 'uygunsuzluklar', aciklama: 'Gecikmiş uygunsuzluk',
    kosul: function (u) {
      /* "Gecikti" saklanan aşama değil, terminden türeyen işarettir. */
      if (u.durum === 'kapandi') return false;
      return GV.saat.gecikmisMi(u.termin);
    }
  });

  GV.kpiTanim('acikUygunsuzluk', {
    koleksiyon: 'uygunsuzluklar', aciklama: 'Açık uygunsuzluk',
    kosul: function (u) { return u.durum !== 'kapandi'; }
  });

  GV.kpiTanim('bugunSahadaIsEmri', {
    koleksiyon: 'isEmirleri', aciklama: 'Bugün sahada olan iş emri',
    kosul: function (i) { return i.tarih === GV.saat.bugun(); }
  });

  /* ---------------------------------------------------------------
     4) KAPSAM NOTU — filtre kullanıcıya GÖRÜNÜR olur

     Doküman §8 "…dahil olup olmadığı tanımlı bir filtredir": kural
     yalnız kodda kalmaz; KPI şeridinin altında yazılı durur ve
     buradan değiştirilebilir.
     --------------------------------------------------------------- */
  GV.kpiKapsamNotu = function (hedef, secenek) {
    secenek = secenek || {};
    var el = typeof hedef === 'string' ? document.querySelector(hedef) : hedef;
    if (!el) return;
    var d = secenek.dislanan || {};
    var toplamDis = (d.arsiv || 0) + (d.kapsamDisi || 0) + (d.silinmis || 0);
    el.className = 'gv-note';
    el.innerHTML = '<i class="fa-solid fa-filter" aria-hidden="true"></i>'
      + '<span><b>KPI kapsamı:</b> ' + GV.esc(GV.kpiKapsamMetni()) + '.'
      + (toplamDis
          ? ' Bu ekranda ' + [
              d.arsiv ? d.arsiv + ' arşivli' : null,
              d.kapsamDisi ? d.kapsamDisi + ' kapsam dışı' : null,
              d.silinmis ? d.silinmis + ' silinmiş' : null
            ].filter(Boolean).join(', ') + ' kayıt sayıma girmedi.'
          : '')
      + ' <button type="button" class="chip" data-kpi-arsiv style="margin-left:6px">'
      + (kapsam.arsiv ? 'Arşivi hariç tut' : 'Arşivi dahil et') + '</button></span>';
    var btn = el.querySelector('[data-kpi-arsiv]');
    if (btn) {
      btn.addEventListener('click', function () {
        GV.kpiKapsamAyarla(Object.assign(GV.kpiKapsam(), { arsiv: !kapsam.arsiv }));
        location.reload();
      });
    }
  };

  /* Node tarafında birim test edilebilmesi için (tarayıcıda etkisiz). */
  if (typeof module !== 'undefined' && module.exports) module.exports = GV;
})();
