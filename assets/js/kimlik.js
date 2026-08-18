/* =====================================================================
   GAVIA — KİMLİK VE KOMUT KATMANI
   Doküman §8 "Kimlik, tekrar ve eşzamanlılık hazırlığı":
     · length + 1 veya Date.now son hanesiyle KALICI id üretilmez.
     · Mock fazında crypto.randomUUID kullanılır.
     · Her kaydetme denemesi requestId/idempotencyKey üretir.
     · Buton ilk gönderimde kilitlenir.
     · Aynı komut ikinci kez çağrılırsa yeni kayıt eklenmez; önceki
       sonuç kullanılır.

   Bu dosya HİÇBİR şeye bağlı değildir ve en başta yüklenir; demo-api.js
   ve sayfa scriptleri kimlik üretimini buradan alır.

   Global API: GV.uuid · GV.yeniKod · GV.istekKimligi · GV.komut
               GV.komutSifirla · GV.kilit · GV.kararliJson
   ===================================================================== */
(function () {
  'use strict';
  var kok = typeof window !== 'undefined' ? window : globalThis;
  var GV = kok.GV || (kok.GV = {});

  /* ---------------------------------------------------------------
     1) RASTGELELİK
     crypto.randomUUID birinci tercihtir. Yoksa getRandomValues ile
     RFC 4122 v4 elle kurulur. İkisi de yoksa (çok eski/kısıtlı ortam)
     tohumlu bir sayaç kullanılır — Date.now son hanesi DEĞİL, süreç
     ömrü boyunca çakışmayan bir dizi.
     --------------------------------------------------------------- */
  function kripto() {
    var c = kok.crypto || (typeof globalThis !== 'undefined' ? globalThis.crypto : null);
    return c && (c.randomUUID || c.getRandomValues) ? c : null;
  }

  var yedekSayac = 0;
  function yedekBaytlar(n) {
    /* Son çare: sayaç + Math.random karışımı. Kalıcı id burada da
       "listenin uzunluğu" gibi çarpışan bir kaynaktan gelmez. */
    var out = new Array(n);
    for (var i = 0; i < n; i++) {
      yedekSayac = (yedekSayac + 1) % 0xffffffff;
      out[i] = (Math.floor(Math.random() * 256) ^ (yedekSayac & 0xff)) & 0xff;
    }
    return out;
  }

  function baytlar(n) {
    var c = kripto();
    if (c && c.getRandomValues) {
      var b = new Uint8Array(n);
      c.getRandomValues(b);
      return Array.prototype.slice.call(b);
    }
    return yedekBaytlar(n);
  }

  /** RFC 4122 v4 UUID. @returns {string} */
  GV.uuid = function () {
    var c = kripto();
    if (c && c.randomUUID) {
      try { return c.randomUUID(); } catch (e) { /* güvensiz bağlam — aşağı düş */ }
    }
    var b = baytlar(16);
    b[6] = (b[6] & 0x0f) | 0x40;   /* sürüm 4 */
    b[8] = (b[8] & 0x3f) | 0x80;   /* varyant  */
    var h = b.map(function (x) { return (x + 0x100).toString(16).substring(1); });
    return h.slice(0, 4).join('') + '-' + h.slice(4, 6).join('') + '-'
         + h.slice(6, 8).join('') + '-' + h.slice(8, 10).join('') + '-'
         + h.slice(10, 16).join('');
  };

  /* Okunur kod alfabesi — 0/1/I/O yok (elle okunurken karışmasın). */
  var ALFABE = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

  /**
   * Kayıt kodu üretir: önek + '-' + rastgele blok.
   * Örn. GV.yeniKod('MST-Y') → 'MST-Y-4F7K2Q'
   * @param {string} onek  Kayıt öneki (sondaki '-' gereksizdir)
   * @param {number} [uzunluk=6]
   * @returns {string}
   */
  GV.yeniKod = function (onek, uzunluk) {
    var n = uzunluk == null ? 6 : Math.max(4, Math.min(12, uzunluk));
    var b = baytlar(n), s = '';
    for (var i = 0; i < n; i++) s += ALFABE.charAt(b[i] % ALFABE.length);
    var o = String(onek == null ? '' : onek).replace(/-+$/, '');
    return o ? o + '-' + s : s;
  };

  /**
   * Bir kaydetme denemesinin idempotency anahtarı.
   * Deneme başına BİR kez üretilir; aynı deneme tekrar gönderilirse
   * aynı anahtar taşınır ve komut katmanı yeni kayıt açmaz.
   * @returns {string}
   */
  GV.istekKimligi = function () { return 'req-' + GV.uuid(); };

  /* ---------------------------------------------------------------
     2) KARARLI JSON — içerik anahtarı için
     Anahtar sırasından bağımsız, aynı yük → aynı metin.
     --------------------------------------------------------------- */
  GV.kararliJson = function (v) {
    if (v === undefined) return 'undefined';
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(GV.kararliJson).join(',') + ']';
    var k = Object.keys(v).sort();
    return '{' + k.map(function (a) {
      return JSON.stringify(a) + ':' + GV.kararliJson(v[a]);
    }).join(',') + '}';
  };

  /* ---------------------------------------------------------------
     3) KOMUT KATMANI (idempotency)

     GV.komut(ad, yuk, calistir, secenek) → Promise

     · Aynı anahtarla uçuşta olan komut varsa AYNI promise döner
       (çift tıklama yeni kayıt açmaz).
     · Tamamlanmış komut, pencere içinde tekrar çağrılırsa `calistir`
       ÇALIŞTIRILMAZ; önceki sonuç döner.
     · secenek.istekId verilirse anahtar odur ve süresi dolmaz —
       "aynı deneme" sözleşmesi budur.
     · Verilmezse anahtar `ad + kararlıJSON(yük)` olur ve varsayılan
       8 sn'lik kısa pencerede korur; sonrasında kullanıcının bilinçli
       olarak aynı kaydı yeniden açması engellenmez.
     --------------------------------------------------------------- */
  var TEKRAR_PENCERESI = 8000;   /* ms — içerik anahtarlı koruma süresi */
  var defter = new Map();        /* anahtar → {promise, sonuc, bitti, zaman, istekId} */

  function simdi() {
    /* Yalnız süre ölçümü için — kimlik üretiminde saat KULLANILMAZ.
       Adım 6'da GV.saat (ClockService) devralır. */
    return GV.saat ? GV.saat.simdi() : Date.now();
  }

  function temizle() {
    var t = simdi();
    defter.forEach(function (kayit, anahtar) {
      if (kayit.bitti && !kayit.kalici && t - kayit.zaman > TEKRAR_PENCERESI) defter.delete(anahtar);
    });
  }

  /**
   * @param {string} ad         komut adı — 'CreateCustomer' gibi
   * @param {*} yuk             komut yükü (içerik anahtarı bundan türer)
   * @param {(istekId:string)=>*} calistir  asıl iş; Promise dönebilir
   * @param {{istekId?:string, pencere?:number, tekrarda?:Function}} [secenek]
   * @returns {Promise<*>}
   */
  GV.komut = function (ad, yuk, calistir, secenek) {
    secenek = secenek || {};
    temizle();
    var kalici = !!secenek.istekId;
    var istekId = secenek.istekId || GV.istekKimligi();
    var anahtar = kalici ? ('id:' + secenek.istekId) : (String(ad) + '|' + GV.kararliJson(yuk));
    var pencere = secenek.pencere == null ? TEKRAR_PENCERESI : secenek.pencere;

    var mevcut = defter.get(anahtar);
    if (mevcut) {
      var taze = mevcut.kalici || (simdi() - mevcut.zaman <= pencere);
      if (!mevcut.bitti || taze) {
        if (mevcut.bitti && secenek.tekrarda) secenek.tekrarda(mevcut.sonuc, mevcut.istekId);
        return mevcut.promise;
      }
      defter.delete(anahtar);
    }

    var kayit = { bitti: false, zaman: simdi(), istekId: istekId, kalici: kalici, sonuc: null };
    defter.set(anahtar, kayit);

    /* `calistir` SENKRON çağrılır: mevcut sayfalar `A.ekle(...)` sonrasında
       listeyi hemen okuyor. Komut katmanı yan etkiyi bir mikroteke ertelerse
       o sayfalar bozulurdu. Yalnız SONUÇ promise'e sarılır. */
    var ham;
    try { ham = calistir(istekId); }
    catch (hata) { defter.delete(anahtar); return Promise.reject(hata); }

    kayit.promise = Promise.resolve(ham)
      .then(function (sonuc) {
        kayit.bitti = true; kayit.zaman = simdi(); kayit.sonuc = sonuc;
        return sonuc;
      })
      .catch(function (hata) {
        /* Hatalı deneme tekrar denenebilmelidir — defterden düşer. */
        defter.delete(anahtar);
        throw hata;
      });
    return kayit.promise;
  };

  /** Test ve "Demo verisini sıfırla" için komut defterini boşaltır. */
  GV.komutSifirla = function () { defter.clear(); };

  /** Uçuşta ya da pencere içinde kayıtlı komut sayısı (tanı amaçlı). */
  GV.komutSayisi = function () { temizle(); return defter.size; };

  /* ---------------------------------------------------------------
     4) GÖNDERİM KİLİDİ
     Buton ilk tıklamada kilitlenir; metin "…" ile değişir, spinner
     ikonu görünür. coz() eski hâline döndürür.
     --------------------------------------------------------------- */
  GV.kilit = function (btn, metin) {
    if (!btn || btn.disabled) return { coz: function () {}, kilitliydi: !!(btn && btn.disabled) };
    var eskiHtml = btn.innerHTML;
    var acildi = false;
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>'
      + (GV.esc ? GV.esc(metin || 'Kaydediliyor…') : (metin || 'Kaydediliyor…'));
    return {
      kilitliydi: false,
      coz: function () {
        if (acildi) return;
        acildi = true;
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
        btn.innerHTML = eskiHtml;
      }
    };
  };

  /* Node tarafında birim test edilebilmesi için (tarayıcıda etkisiz). */
  if (typeof module !== 'undefined' && module.exports) module.exports = GV;
})();
