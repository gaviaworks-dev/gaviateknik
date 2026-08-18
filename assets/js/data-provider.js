/* =====================================================================
   GAVIA — VERİ SAĞLAYICI (MockDataProvider)
   demoApi'nin ÜSTÜNE oturur; demoApi silinmez, alt katman olarak kalır.
   Sözleşme: list(resource, query) · get(resource, id) · command(name, payload)
   Backend hazır olduğunda yalnız bu dosyanın gövdesi ApiDataProvider'a
   çevrilir; UI, route ve testler değişmez.
   Global API: window.dataProvider (takma ad: GV.saglayici)
   ===================================================================== */
(function () {
  'use strict';
  var kok = typeof window !== 'undefined' ? window : globalThis;
  var GV = kok.GV || (kok.GV = {});

  function api() { return kok.demoApi; }

  /* ---------------------------------------------------------------
     Kaynak kayıt defteri
     --------------------------------------------------------------- */
  /** @type {Record<string, KaynakTanim>} */
  var defter = {};

  /* Zengin okuyucular — her çağrıda türetme yaptıkları için memoize edilir. */
  var ZENGIN = {
    lokasyonlar: 'lokasyonlar',
    isEmirleri: 'isEmirleri',
    raporlar: 'raporlar',
    ekipmanlar: 'ekipmanlar'
  };

  /**
   * Kaynak tanımlar (ya da mevcut tanımı değiştirir).
   * @param {string} ad
   * @param {KaynakTanim} tanim
   */
  function tanimla(ad, tanim) {
    defter[ad] = Object.assign({}, defter[ad] || {}, tanim || {});
    onbellek = {};
    return defter[ad];
  }

  /** Verilen ada karşılık gelen tanımı üretir; kayıtlı değilse demoApi'ye düşer. */
  function tanimCoz(ad) {
    if (defter[ad]) return defter[ad];
    var A = api();
    if (!A) return { kaynak: function () { return []; } };
    if (ZENGIN[ad]) {
      return { kaynak: function () { return A[ZENGIN[ad]](); }, onbellek: true };
    }
    return { kaynak: function () { return A.liste(ad); } };
  }

  /* ---------------------------------------------------------------
     Kaynak önbelleği — anahtar: kaynak adı + veri sürüm damgası
     Yazma olduğunda damga değişir, önbellek kendiliğinden düşer.
     --------------------------------------------------------------- */
  var onbellek = {};
  var elleSurum = 0;

  function surumDamgasi() {
    var A = api();
    var ham = '';
    try { ham = localStorage.getItem('gv_tk_data') || ''; } catch (e) {}
    return ham.length + ':' + (A && A.degisiklikSayisi ? A.degisiklikSayisi() : 0) + ':' + elleSurum;
  }

  function kaynakOku(ad, tanim) {
    if (!tanim.onbellek) return tanim.kaynak() || [];
    var anahtar = ad + '@' + surumDamgasi();
    if (onbellek[ad] && onbellek[ad].anahtar === anahtar) return onbellek[ad].veri;
    var veri = tanim.kaynak() || [];
    onbellek[ad] = { anahtar: anahtar, veri: veri };
    return veri;
  }

  /** Önbelleği elle düşürür (yazma sonrası). */
  function onbellekDusur() { elleSurum++; onbellek = {}; }

  /* ---------------------------------------------------------------
     Süzme — gvFilter alan tanımlarıyla BİREBİR aynı anlamı taşır.
     Ayrılmış filtre anahtarları: __cip (hızlı durum çipi), __arsiv.
     --------------------------------------------------------------- */
  function kucuk(v) { return String(v).toLocaleLowerCase('tr-TR'); }

  function tekDeger(v) { return Array.isArray(v) ? v[0] : v; }

  function alanEsler(kayit, alan, deger) {
    if (alan.suz) return !!alan.suz(kayit, alan.tur === 'coklu' ? (Array.isArray(deger) ? deger : [deger]) : tekDeger(deger));
    if (alan.tur === 'coklu') {
      var liste = Array.isArray(deger) ? deger : [deger];
      return liste.map(String).indexOf(String(kayit[alan.k])) !== -1;
    }
    if (alan.tur === 'aralik') {
      var sayi = Number(kayit[alan.k]);
      if (deger.min !== '' && deger.min != null && sayi < Number(deger.min)) return false;
      if (deger.max !== '' && deger.max != null && sayi > Number(deger.max)) return false;
      return true;
    }
    if (alan.tur === 'tarih') {
      var t = kayit[alan.k];
      if (!t) return false;
      if (deger.bas && t < deger.bas) return false;
      if (deger.son && t > deger.son) return false;
      return true;
    }
    if (alan.tur === 'toggle') {
      var v = tekDeger(deger);
      if (v === 'evet' && !kayit[alan.k]) return false;
      if (v === 'hayir' && kayit[alan.k]) return false;
      return true;
    }
    return String(kayit[alan.k]) === String(tekDeger(deger));
  }

  /**
   * Tanım + sorgudan bir yüklem (predicate) üretir.
   * @param {KaynakTanim} tanim
   * @param {ListQuery} sorgu
   * @returns {(kayit:Object)=>boolean}
   */
  function yuklem(tanim, sorgu) {
    var alanlar = tanim.alanlar || [];
    var aramaAlanlari = tanim.arama || [];
    var q = kucuk(sorgu.q || '').trim();
    /* Doküman §7: q en az 2 karakterde çalışır. */
    if (q.length < (GV.ARAMA_ASGARI || 2)) q = '';
    var f = sorgu.filters || {};
    var cip = tekDeger(f.__cip);
    var arsiv = tekDeger(f.__arsiv) === 'evet';

    return function (k) {
      /* arşiv */
      if (!arsiv && tanim.arsivAlani && k[tanim.arsivAlani]) return false;

      /* serbest arama */
      if (q) {
        var bulundu = aramaAlanlari.some(function (alan) {
          var v = k[alan];
          return v != null && kucuk(v).indexOf(q) !== -1;
        });
        if (!bulundu) return false;
      }

      /* hızlı durum çipi */
      if (cip && cip !== 'tumu' && tanim.cipler) {
        if (tanim.cipler.suz) { if (!tanim.cipler.suz(k, cip)) return false; }
        else if (k[tanim.cipler.alan] !== cip) return false;
      }

      /* gelişmiş alanlar */
      for (var i = 0; i < alanlar.length; i++) {
        var a = alanlar[i], v = f[a.k];
        if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue;
        if (!alanEsler(k, a, v)) return false;
      }
      return true;
    };
  }

  /* ---------------------------------------------------------------
     Sıralama — kararlı; eşit değerlerde id ile ikinci sıralama.
     --------------------------------------------------------------- */
  function kiyas(x, y, kural) {
    var a = x[kural.field], b = y[kural.field];
    if (a == null && b == null) return 0;
    if (a == null) return 1;   /* boşlar yöne bakmaksızın sona */
    if (b == null) return -1;
    var s;
    if (typeof a === 'number' && typeof b === 'number') s = a - b;
    else if (typeof a === 'boolean' || typeof b === 'boolean') s = (a ? 1 : 0) - (b ? 1 : 0);
    else s = String(a).localeCompare(String(b), 'tr');
    return kural.direction === 'desc' ? -s : s;
  }

  /**
   * @param {Array<Object>} dizi
   * @param {SortRule[]} kurallar
   * @returns {Array<Object>} yeni dizi (kaynak dizi değiştirilmez)
   */
  function kararliSirala(dizi, kurallar) {
    var hepsi = (kurallar || []).slice();
    /* Hiç sıralama kuralı yoksa kaynak sırası korunur — koleksiyonun kendi
       sırası zaten deterministiktir ve sayfalama kararlıdır. Burada id'ye
       göre sıralamak, migrate edilen sayfaların görünen sırasını değiştirirdi. */
    if (!hepsi.length) return dizi.slice();
    /* id tie-breaker — aynı değerli kayıtlar sayfalar arasında tekrarlanmaz */
    if (!hepsi.some(function (k) { return k.field === 'id'; })) hepsi.push({ field: 'id', direction: 'asc' });
    /* index yedeği: localeCompare eşitliğinde bile giriş sırası korunur */
    return dizi.map(function (k, i) { return { k: k, i: i }; }).sort(function (a, b) {
      for (var n = 0; n < hepsi.length; n++) {
        var s = kiyas(a.k, b.k, hepsi[n]);
        if (s) return s;
      }
      return a.i - b.i;
    }).map(function (x) { return x.k; });
  }

  /* ---------------------------------------------------------------
     Rol kapsamı — TEK yerde uygulanır. ListQuery'ye kapsam filtresi konmaz.
     --------------------------------------------------------------- */
  function kapsamUygula(dizi, tanim) {
    if (!tanim.kapsam) return dizi;
    var A = api();
    if (!A || !A.rolKapsami) return dizi;
    var k = A.rolKapsami(GV.rol || 'sahip');
    if (k.tur === 'tam') return dizi;
    var alan = k.tur === 'musteri' ? 'musteriId' : 'taseronId';
    var deger = k.tur === 'musteri' ? k.musteriId : k.taseronId;
    /* tanim.kapsam bir fonksiyonsa kayıt→sahip eşlemesini o çözer */
    if (typeof tanim.kapsam === 'function') {
      return dizi.filter(function (x) { return tanim.kapsam(x, k); });
    }
    return dizi.filter(function (x) { return x[alan] === deger; });
  }

  /* ---------------------------------------------------------------
     Kopyalama — YALNIZ dönen sayfa klonlanır, koleksiyonun tamamı değil.
     --------------------------------------------------------------- */
  function sayfaKlonu(dilim) {
    return dilim.map(function (k) {
      try { return structuredClone(k); }
      catch (e) { return Object.assign({}, k); }
    });
  }

  /* Cursor sözleşmede, offset uygulamada (FAZ12-PLAN §7 karar 3).
     Sahte keyset sorgusu yapılmaz; imleç son satırın updatedAt|id ikilisinden
     deterministik üretilir, sayfalama offset ile çözülür. */
  function imlec(kayit) {
    if (!kayit) return undefined;
    var zaman = kayit.updatedAt || kayit.guncellemeTarihi || kayit.tarih || '';
    try { return btoa(unescape(encodeURIComponent(zaman + '|' + (kayit.id || '')))); }
    catch (e) { return zaman + '|' + (kayit.id || ''); }
  }

  /* ---------------------------------------------------------------
     DataProvider sözleşmesi
     --------------------------------------------------------------- */

  /**
   * @param {string} resource
   * @param {ListQuery} query
   * @returns {Promise<PagedResult>}
   */
  function list(resource, query) {
    var sorgu = GV.sorguNormalize(query);
    var tanim = tanimCoz(resource);

    var kaynak = kapsamUygula(kaynakOku(resource, tanim), tanim);
    var suzulmus = kaynak.filter(yuklem(tanim, sorgu));
    var sirali = kararliSirala(suzulmus, sorgu.sort.length ? sorgu.sort : (tanim.sira || []));

    var toplamKayit = sirali.length;
    var toplamSayfa = Math.max(1, Math.ceil(toplamKayit / sorgu.pageSize));
    var aktifSayfa = GV.kelepce(sorgu.page, 1, toplamSayfa);
    var bas = (aktifSayfa - 1) * sorgu.pageSize;
    var dilim = sirali.slice(bas, bas + sorgu.pageSize);

    var sonuc = {
      data: sayfaKlonu(dilim),
      pagination: {
        currentPage: aktifSayfa,
        pageSize: sorgu.pageSize,
        totalRecords: toplamKayit,
        totalPages: toplamSayfa,
        hasNextPage: aktifSayfa < toplamSayfa,
        hasPreviousPage: aktifSayfa > 1
      }
    };
    if (sonuc.pagination.hasNextPage) sonuc.pagination.nextCursor = imlec(dilim[dilim.length - 1]);
    return Promise.resolve(sonuc);
  }

  /**
   * Toplama sorgusu — listenin sayfası değil, süzülmüş kümenin TAMAMI üzerinden
   * hesap yapar (KPI, dağılım grafiği, toplam tutar). Gerçek backend'de ayrı bir
   * aggregate uç noktasına karşılık gelir; UI'ya dizi DEĞİL, hesabın sonucu döner.
   * @param {string} resource
   * @param {ListQuery} query
   * @param {(kayitlar:Array<Object>)=>*} hesap
   * @returns {Promise<*>}
   */
  function ozet(resource, query, hesap) {
    var sorgu = GV.sorguNormalize(query);
    var tanim = tanimCoz(resource);
    var kaynak = kapsamUygula(kaynakOku(resource, tanim), tanim);
    return Promise.resolve(hesap(kaynak.filter(yuklem(tanim, sorgu))));
  }

  /**
   * @param {string} resource
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  function get(resource, id) {
    if (!id) return Promise.resolve(null);
    var tanim = tanimCoz(resource);
    if (tanim.tekil) return Promise.resolve(tanim.tekil(id) || null);
    var A = api();
    if (!defter[resource] && A) {
      if (ZENGIN[resource]) {
        var tek = { lokasyonlar: 'lokasyon', isEmirleri: 'isEmri', raporlar: 'rapor', ekipmanlar: 'ekipman' }[resource];
        return Promise.resolve(A[tek](id) || null);
      }
      return Promise.resolve(A.kayit(resource, id) || null);
    }
    var bulunan = null;
    kaynakOku(resource, tanim).forEach(function (k) { if (k.id === id) bulunan = k; });
    return Promise.resolve(bulunan);
  }

  /* ---------- komutlar ---------- */
  /* Domain komut adları backend endpoint isimlerinden bağımsızdır. */
  var komutlar = {};

  /** Yeni domain komutu kaydeder. */
  function komut(ad, fn) { komutlar[ad] = fn; return fn; }

  /* Kimlik üretimi tek yerde: kimlik.js (crypto.randomUUID). */
  function istekKimligi() {
    return (kok.GV && kok.GV.istekKimligi) ? kok.GV.istekKimligi() : 'req-yok';
  }

  /* Çekirdek komutlar — demoApi yazma yollarına iner, önbelleği düşürür. */
  komut('kayitOlustur', function (p) { return api().ekle(p.resource, p.kayit); });
  komut('kayitGuncelle', function (p) { return api().guncelle(p.resource, p.id, p.yama); });
  komut('kayitSil', function (p) { return api().sil(p.resource, p.id); });
  /* Durum yazımının TEK kapısı durum makinesidir; komut katmanı da oradan
     geçer (doküman §8). Akış adı zorunludur — akışsız durum yazımı yok. */
  komut('durumGecisi', function (p) {
    var GV = kok.GV;
    if (!GV || !GV.gecisUygula) return Promise.reject(new Error('Durum makinesi yüklü değil.'));
    if (!p.akis) return Promise.reject(new Error('durumGecisi komutu akis alanı ister.'));
    return GV.gecisUygula(p.akis, p.resource, p.id, p.deger, {
      alan: p.alan, not: p.not, sessiz: p.sessiz !== false, ekYama: p.ekYama
    });
  });

  /**
   * @param {string} name
   * @param {*} payload
   * @returns {Promise<*>}
   */
  function command(name, payload) {
    var fn = komutlar[name];
    if (!fn) return Promise.reject(new Error('Tanımsız komut: ' + name));
    payload = Object.assign({ requestId: istekKimligi() }, payload || {});
    return Promise.resolve(fn(payload)).then(function (r) {
      onbellekDusur();
      return r;
    });
  }

  var saglayici = {
    list: list,
    get: get,
    ozet: ozet,
    command: command,
    /* mock katmanı uzantıları */
    tanimla: tanimla,
    tanim: function (ad) { return defter[ad] || null; },
    komut: komut,
    onbellekDusur: onbellekDusur,
    /* saf yardımcılar — birim testler doğrudan bunları çağırır */
    yuklem: yuklem,
    kararliSirala: kararliSirala
  };

  kok.dataProvider = saglayici;
  GV.saglayici = saglayici;

  if (typeof module !== 'undefined' && module.exports) module.exports = saglayici;
})();
