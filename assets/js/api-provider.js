/* =====================================================================
   GAVIA — API VERİ SAĞLAYICI İSKELETİ (doküman §12 iş paketi 10)

   Bu dosya DataProvider sözleşmesini uygulayan İKİNCİ sağlayıcıdır.
   NE YAPAR: isteği alan adlarıyla tanımlar, zarfı çözer, hatayı tek biçime
   indirger, aynı komutun ikinci denemesini `requestId` ile ayırt eder.
   NE YAPMAZ: **ağa çıkmaz.** `fetch`, `XMLHttpRequest`, WebSocket yoktur;
   uydurma bir uç nokta adresi, HTTP yöntemi ya da kimlik doğrulama şeması
   tanımlamaz. Backend sözleşmesi yazılmadan bunlara karar vermek, olmayan
   bir sunucuyu varmış gibi göstermek olurdu.

   Taşıyıcı (`tasiyici`) tek değiştirilecek yerdir: bugün sözleşme mock'u,
   backend hazır olduğunda gerçek istemci. UI, route, ListController,
   FormController ve testler değişmez — `_qa/test/saglayici-sozlesmesi.test.js`
   aynı test kümesini İKİ sağlayıcıya da uygular.

   İstek tanımı (taşımadan bağımsız):
     { islem:'tanim'|'liste'|'kume'|'kayit'|'komut', kaynak, sorgu, id, ad, yuk, requestId }
   Yanıt zarfı:
     { ok:true, veri:* }  |  { ok:false, hata:{ kod, mesaj, alan? } }

   Global API: GV.ApiDataProvider · GV.sozlesmeMocku · GV.saglayiciKur
               GV.saglayiciAdi
   ===================================================================== */
(function () {
  'use strict';
  var kok = typeof window !== 'undefined' ? window : globalThis;
  var GV = kok.GV || (kok.GV = {});

  /** Ağ üzerinden geçmiş gibi: paylaşılan nesne kimliği taşınmaz. */
  function telKopyasi(v) {
    if (v == null || typeof v !== 'object') return v;
    try { return structuredClone(v); }
    catch (e) { return JSON.parse(JSON.stringify(v)); }
  }

  /* ---------------------------------------------------------------
     Hata tek biçime indirgenir. UI `e.kod` ve `e.mesaj` dışında bir şey
     bilmez; taşıma katmanının ayrıntısı (durum kodu, gövde biçimi) sızmaz.
     --------------------------------------------------------------- */
  function SaglayiciHatasi(hata, istek) {
    var e = new Error((hata && hata.mesaj) || 'İstek tamamlanamadı.');
    e.name = 'SaglayiciHatasi';
    e.kod = (hata && hata.kod) || 'bilinmeyen';
    e.alan = hata && hata.alan;
    e.requestId = istek && istek.requestId;
    return e;
  }

  /* ---------------------------------------------------------------
     SÖZLEŞME MOCK'U
     Gerçek çağrı yapmaz; isteği MockDataProvider'a çevirir ve yanıtı
     zarflar. Amacı sağlayıcıyı çalıştırmak değil, SÖZLEŞMEYİ sınamaktır:
     zarf biçimi, hata biçimi ve tel kopyası burada zorunlu kılınır.
     --------------------------------------------------------------- */
  function sozlesmeMocku(istek) {
    var alt = kok.dataProvider && kok.dataProvider.__mock ? kok.dataProvider.__mock : GV.mockSaglayici;
    if (!alt) return Promise.resolve({ ok: false, hata: { kod: 'saglayici-yok', mesaj: 'Mock veri katmanı yüklü değil.' } });

    function sar(sozu) {
      return Promise.resolve(sozu).then(
        function (veri) { return { ok: true, veri: telKopyasi(veri) }; },
        function (e) { return { ok: false, hata: { kod: 'islem-basarisiz', mesaj: e && e.message ? e.message : 'İşlem tamamlanamadı.' } }; }
      );
    }

    switch (istek.islem) {
      case 'tanim':
        /* Gerçek backend'de kaynak tanımı sunucu yapılandırmasıdır; iskelette
           alt katmana yazılır ki sorgu anlamı iki sağlayıcıda AYNI olsun. */
        alt.tanimla(istek.kaynak, istek.tanim);
        return Promise.resolve({ ok: true, veri: null });
      case 'liste':
        return sar(alt.list(istek.kaynak, istek.sorgu));
      case 'kayit':
        return sar(alt.get(istek.kaynak, istek.id));
      case 'kume':
        /* Süzülmüş kümenin TAMAMI. Gerçek backend'de bu ayrı bir toplama
           uç noktasıdır ve kümeyi değil hesabın sonucunu döndürmelidir;
           bütün kümeyi tele vermek sayfalamayı anlamsız kılar. İskelet bunu
           BİLİNEN KUSUR olarak taşır (bkz. _qa/LEDGER.md faz 15 adım 6). */
        return sar(alt.ozet(istek.kaynak, istek.sorgu, function (k) { return k; }));
      case 'komut':
        return sar(alt.command(istek.ad, Object.assign({ requestId: istek.requestId }, istek.yuk)));
      default:
        return Promise.resolve({ ok: false, hata: { kod: 'tanimsiz-islem', mesaj: 'Tanımsız işlem: ' + istek.islem } });
    }
  }
  GV.sozlesmeMocku = sozlesmeMocku;

  /* ---------------------------------------------------------------
     ApiDataProvider
     --------------------------------------------------------------- */
  /**
   * @param {Object} [secenek]
   * @param {(istek:Object)=>Promise<{ok:boolean,veri?:*,hata?:Object}>} [secenek.tasiyici]
   *        Değiştirilecek TEK yer. Varsayılan: sözleşme mock'u.
   * @returns {DataProvider}
   */
  GV.ApiDataProvider = function (secenek) {
    secenek = secenek || {};
    var tasiyici = secenek.tasiyici || sozlesmeMocku;

    /* Yerel tanım aynası — ListController `tanim(ad)` ile geri okur. */
    var defter = {};
    /* Aynı requestId ile ikinci kez gelen komut yeni kayıt açmaz; ilk
       denemenin sonucu döner (doküman §8 idempotency hazırlığı). */
    var komutIzi = {};

    function gonder(istek) {
      return Promise.resolve(tasiyici(istek)).then(function (zarf) {
        if (!zarf || typeof zarf.ok !== 'boolean') {
          throw SaglayiciHatasi({ kod: 'gecersiz-zarf', mesaj: 'Sağlayıcı yanıtı sözleşmeye uymuyor.' }, istek);
        }
        if (!zarf.ok) throw SaglayiciHatasi(zarf.hata, istek);
        return zarf.veri;
      });
    }

    function kimlik() {
      return (GV.istekKimligi ? GV.istekKimligi() : 'req-' + defterSayaci++);
    }
    var defterSayaci = 1;

    var saglayici = {
      /** @type {(resource:string, query:ListQuery)=>Promise<PagedResult>} */
      list: function (resource, query) {
        return gonder({ islem: 'liste', kaynak: resource, sorgu: GV.sorguNormalize(query), requestId: kimlik() });
      },

      /** @type {(resource:string, id:string)=>Promise<Object|null>} */
      get: function (resource, id) {
        if (!id) return Promise.resolve(null);
        return gonder({ islem: 'kayit', kaynak: resource, id: id, requestId: kimlik() })
          .then(function (v) { return v == null ? null : v; });
      },

      /** Süzülmüş kümenin tamamı üzerinden hesap. */
      ozet: function (resource, query, hesap) {
        return gonder({ islem: 'kume', kaynak: resource, sorgu: GV.sorguNormalize(query), requestId: kimlik() })
          .then(function (kayitlar) { return hesap(kayitlar || []); });
      },

      /** @type {(name:string, payload:*)=>Promise<*>} */
      command: function (name, payload) {
        payload = payload || {};
        var rid = payload.requestId || kimlik();
        if (komutIzi[rid]) return komutIzi[rid];
        var soz = gonder({ islem: 'komut', ad: name, yuk: payload, requestId: rid });
        komutIzi[rid] = soz;
        return soz;
      },

      /* ---- ListController'ın kullandığı kayıt defteri yüzeyi ----
         Sözleşmenin parçasıdır: liste sayfaları kaynağı çalışma anında
         tanımlar. Gerçek backend'de bu tanım sunucuda durur ve çağrı
         etkisiz hale gelir; imza değişmez. */
      tanimla: function (ad, tanim) {
        defter[ad] = Object.assign({}, defter[ad] || {}, tanim || {});
        tasiyici({ islem: 'tanim', kaynak: ad, tanim: defter[ad] });
        return defter[ad];
      },
      tanim: function (ad) { return defter[ad] || null; },
      komut: function (ad, fn) {
        /* Domain komutları sunucu tarafında yaşar; istemci yalnız adını bilir.
           Alt katmana kaydı sözleşme mock'u üzerinden geçer. */
        var alt = kok.dataProvider && kok.dataProvider.__mock ? kok.dataProvider.__mock : GV.mockSaglayici;
        if (alt && alt.komut) return alt.komut(ad, fn);
        return fn;
      },
      onbellekDusur: function () {
        var alt = GV.mockSaglayici;
        if (alt && alt.onbellekDusur) alt.onbellekDusur();
      },
      /** Sağlayıcı adı — hata mesajı ve denetim için. */
      ad: 'api'
    };
    return saglayici;
  };

  /* ---------------------------------------------------------------
     SAĞLAYICI SEÇİMİ — TEK YER
     Sayfa kodu `window.dataProvider` dışında hiçbir şey bilmez; hangi
     sağlayıcının bağlı olduğu yalnız buradan belirlenir.
     Kaynak sırası: ?provider= → localStorage → varsayılan 'mock'.
     --------------------------------------------------------------- */
  var mockSaglayici = kok.dataProvider || null;
  if (mockSaglayici) { mockSaglayici.ad = mockSaglayici.ad || 'mock'; GV.mockSaglayici = mockSaglayici; }

  var YAPICI = {
    mock: function () { return GV.mockSaglayici; },
    api: function () {
      var p = GV.ApiDataProvider();
      p.__mock = GV.mockSaglayici;   /* sözleşme mock'unun arka katmanı */
      return p;
    }
  };

  /**
   * Etkin sağlayıcıyı kurar. Dönüş: kurulan sağlayıcı.
   * @param {'mock'|'api'} [ad]
   */
  GV.saglayiciKur = function (ad) {
    if (!ad || !YAPICI[ad]) ad = 'mock';
    var p = YAPICI[ad]();
    if (!p) return null;
    kok.dataProvider = p;
    GV.saglayici = p;
    GV.saglayiciAdi = ad;
    return p;
  };

  function secilen() {
    var q = null;
    try { q = new URLSearchParams(kok.location.search).get('provider'); } catch (e) {}
    if (q && YAPICI[q]) {
      /* Rol seçiminde olduğu gibi seçim sayfalar arasında korunur. */
      try { kok.localStorage.setItem('gv_tk_saglayici', q); } catch (e) {}
      return q;
    }
    try {
      var d = kok.localStorage.getItem('gv_tk_saglayici');
      if (d && YAPICI[d]) return d;
    } catch (e) {}
    return 'mock';
  }

  if (mockSaglayici) GV.saglayiciKur(secilen());

  if (typeof module !== 'undefined' && module.exports) module.exports = GV;
})();
