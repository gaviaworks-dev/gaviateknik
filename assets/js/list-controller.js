/* =====================================================================
   GAVIA — LİSTE DENETLEYİCİSİ (ListController)
   Liste sayfalarının tek akış yöneticisi: URL ↔ sorgu durumu,
   dataProvider.list çağrısı, sayfalama, boş/yükleniyor/hata ekranları.

   SÖZLEŞME: `await` YALNIZ bu dosyanın içinde kalır. Sayfa scripti hiçbir
   yerde `await`/`then` yazmaz; denetleyiciye seçenek ve geri çağrı verir.

   URL sözleşmesi (doküman §7):
     page · pageSize · sort=alan:yon · q · durum (hızlı çip) · f_<alan>
     fr_<alan> → aralık/tarih filtreleri (gvFilter bunları URL'ye yazmaz)
   Filtre, arama, sıralama ya da pageSize değişince page daima 1 olur.

   Global API: gvList
   ===================================================================== */
(function () {
  'use strict';
  var GV = window.GV || (window.GV = {});

  /* ---------------------------------------------------------------
     Aralık/tarih filtrelerinin URL kodlaması
     gvFilter yalnız düz ve çoklu alanları URL'ye yazar; aralık ve tarih
     nesneleri kaybolur. Denetleyici bunları AYRI bir önekle yazar,
     böylece gvFilter'ın kendi okuması hiç değişmez.
     --------------------------------------------------------------- */
  function nesneKodla(v) {
    var p = [];
    ['min', 'max', 'bas', 'son'].forEach(function (a) {
      if (v[a] != null && v[a] !== '') p.push(a + ':' + v[a]);
    });
    return p.length ? p.join('|') : null;
  }
  function nesneCoz(s) {
    var v = {};
    String(s).split('|').forEach(function (p) {
      var i = p.indexOf(':');
      if (i > 0) v[p.slice(0, i)] = p.slice(i + 1);
    });
    return Object.keys(v).length ? v : null;
  }

  /**
   * @param {Object} secenek
   * @param {string} secenek.kaynak       dataProvider kaynak adı
   * @param {()=>Array<Object>} secenek.veri  ham kayıtları döndürür
   * @param {string[]} [secenek.arama]
   * @param {Object} [secenek.cipler]
   * @param {Array<Object>} [secenek.alanlar]
   * @param {string} [secenek.arsivAlani]
   * @param {boolean|Function} [secenek.kapsam]
   * @param {Array<Object>} [secenek.sira] varsayılan sıralama
   * @param {Object} secenek.tablo        gvTable seçenekleri
   * @param {Object} [secenek.pager]      gvPager seçenekleri
   * @param {Object} [secenek.bosDurum]        gerçek boş liste ekranı
   * @param {Object} [secenek.filtreBosDurum]  filtre sonucu boş ekranı
   * @param {string} [secenek.hedef]  özel çizimde iskelet/meşgul kabı
   * @param {(sonuc:PagedResult, bos:Object)=>void} [secenek.ciz] özel çizim;
   *        ikinci parametre o anki sorguya uygun boş ekran tanımıdır
   *        (gerçek boş liste ile filtre sonucu boş ayrımı korunur)
   * @param {(kayitlar:Array<Object>)=>void} [secenek.ozet] süzülmüş kümenin
   *        TAMAMI üzerinden hesap (KPI, dağılım) — sayfa dilimi değil
   * @param {(sonuc:PagedResult)=>void} [secenek.degisti]  her sonuçtan sonra
   */
  window.gvList = function (secenek) {
    var DP = window.dataProvider;
    if (!DP) { console.error('gvList: dataProvider yüklenmemiş'); return null; }

    var alanlar = secenek.alanlar || [];
    var kaynakAd = secenek.kaynak;
    var pagerSecenek = secenek.pager || {};
    var tabloSecenek = secenek.tablo || {};

    /* ---- kaynağı sağlayıcıya kaydet ---- */
    DP.tanimla(kaynakAd, {
      kaynak: secenek.veri,
      arama: secenek.arama,
      alanlar: alanlar,
      cipler: secenek.cipler,
      arsivAlani: secenek.arsivAlani,
      kapsam: secenek.kapsam,
      sira: secenek.sira,
      onbellek: secenek.onbellek !== false
    });

    /* ---- durum ---- */
    var u0 = new URLSearchParams(location.search);
    var sayfa = GV.kelepce(u0.get('page') || 1, 1, 1e6);
    var boyut = GV.sorguNormalize({ pageSize: u0.get('pageSize') || pagerSecenek.boyut }).pageSize;
    var sira = GV.siraCoz(u0.get('sort'));
    var ilkYukleme = true;
    var sonSonuc = null;
    var filtre = null, hazir = false;

    /* URL'de taşınan aralık/tarih filtreleri — gvFilter kurulduktan sonra
       durumuna enjekte edilir. */
    var urlAralik = {};
    alanlar.forEach(function (a) {
      if (a.tur !== 'aralik' && a.tur !== 'tarih') return;
      var ham = u0.get('fr_' + a.k);
      if (!ham) return;
      var v = nesneCoz(ham);
      if (v) urlAralik[a.k] = v;
    });

    /* ---- hedefler ---- */
    function el(s) { return typeof s === 'string' ? document.querySelector(s) : s; }
    /* Özel çizim yapan sayfalarda tablo yoktur; iskelet ve meşgul işareti
       yine de bir kaba gerekir — secenek.hedef onu verir. */
    var tabloKap = el(tabloSecenek.hedef || secenek.hedef);
    var pagerKap = el(pagerSecenek.hedef);

    /* ---- sorgu kurulumu ---- */
    function sorguKur() {
      var d = filtre ? filtre.durum : { arama: '', cip: 'tumu', gelismis: {}, arsiv: false, sirala: null, siraYon: 'asc' };
      var f = {};
      Object.keys(d.gelismis || {}).forEach(function (k) { f[k] = d.gelismis[k]; });
      if (d.cip && d.cip !== 'tumu') f.__cip = d.cip;
      if (d.arsiv) f.__arsiv = 'evet';
      /* gvFilter'ın kendi sıralaması varsa denetleyicininkinin önüne geçer */
      var etkinSira = d.sirala ? [{ field: d.sirala, direction: d.siraYon || 'asc' }] : sira;
      return GV.sorguNormalize({
        page: sayfa, pageSize: boyut, q: d.arama, sort: etkinSira, filters: f
      });
    }

    /* ---- URL yazımı ---- */
    function urlYaz(sorgu, push) {
      var yama = {
        page: sorgu.page > 1 ? sorgu.page : null,
        pageSize: sorgu.pageSize !== GV.SAYFA_BOYUTU_VARSAYILAN ? sorgu.pageSize : null,
        sort: GV.siraYaz(sorgu.sort)
      };
      /* aralık/tarih filtreleri — gvFilter'ın yazmadıkları */
      alanlar.forEach(function (a) {
        if (a.tur !== 'aralik' && a.tur !== 'tarih') return;
        var v = sorgu.filters[a.k];
        yama['fr_' + a.k] = v && typeof v === 'object' && !Array.isArray(v) ? nesneKodla(v) : null;
      });
      GV.qCok(yama, { push: !!push });
    }

    /* ---- ekran durumları ---- */
    function yukleniyorGoster() {
      if (!tabloKap) return;
      if (ilkYukleme) {
        tabloKap.innerHTML = window.gvSkeleton ? gvSkeleton(Math.min(boyut, 8)) : '';
        if (pagerKap) pagerKap.hidden = true;
      } else {
        /* kısmi güncelleme: tablo korunur, yalnız meşgul işareti konur */
        tabloKap.setAttribute('aria-busy', 'true');
      }
    }

    function filtreAktifMi(sorgu) {
      if (sorgu.q) return true;
      return Object.keys(sorgu.filters).some(function (k) { return k !== '__arsiv'; });
    }

    function hataGoster(e) {
      if (!tabloKap) return;
      tabloKap.removeAttribute('aria-busy');
      tabloKap.innerHTML = window.gvError ? gvError({
        baslik: 'Liste yüklenemedi',
        metin: 'Kayıtlar alınırken bir sorun oluştu. Sayfayı yenileyip tekrar deneyin.'
          + (e && e.message ? ' (İstek kodu: ' + (e.requestId || '—') + ')' : '')
      }) : '';
      if (pagerKap) pagerKap.hidden = true;
    }

    /* Filtre sonucu boş ekranında "filtreleri temizle" aksiyonu — yeni kayıt
       CTA'sı ile karıştırılmaz. */
    function bosEkran(sorgu) {
      if (filtreAktifMi(sorgu)) {
        return Object.assign({
          ikon: 'fa-filter-circle-xmark',
          baslik: 'Filtrelere uyan kayıt yok',
          metin: 'Seçtiğiniz filtreleri gevşetip yeniden deneyin.',
          aksiyonlar: '<button class="btn btn-ghost" type="button" data-gv-filtre-temizle>'
            + '<i class="fa-solid fa-eraser" aria-hidden="true"></i>Filtreleri temizle</button>'
        }, secenek.filtreBosDurum || {});
      }
      return secenek.bosDurum || tabloSecenek.bosDurum || {
        ikon: 'fa-inbox', baslik: 'Henüz kayıt yok',
        metin: 'Bu modülde görüntülenecek kayıt bulunmuyor.'
      };
    }

    /* ---- tablo ---- */
    var tablo = null;
    if (tabloKap && tabloSecenek.hedef && window.gvTable) tablo = gvTable(tabloSecenek);

    /* ---- sayfalama ---- */
    var pager = null;
    if (pagerKap && window.gvPager) {
      pager = gvPager(Object.assign({}, pagerSecenek, {
        boyut: boyut,
        degisti: function (yeniSayfa, yeniBoyut) {
          var boyutDegisti = yeniBoyut !== boyut;
          boyut = yeniBoyut;
          sayfa = boyutDegisti ? 1 : yeniSayfa;   /* pageSize değişince page=1 */
          calistir({ push: true, odak: true });
          if (pagerSecenek.degisti) pagerSecenek.degisti(sayfa, boyut);
        }
      }));
    }

    /* ---- odak: sayfa değişiminde tablo başlığına ---- */
    function odakla() {
      if (!tabloKap) return;
      var hedef = tabloKap.querySelector('table');
      if (!hedef) return;
      if (!hedef.hasAttribute('tabindex')) hedef.setAttribute('tabindex', '-1');
      try { hedef.focus({ preventScroll: false }); } catch (e) { hedef.focus(); }
    }

    /* ---- ana akış — `await` YALNIZ burada ---- */
    async function calistir(ayar) {
      ayar = ayar || {};
      var sorgu = sorguKur();
      yukleniyorGoster();
      var sonuc;
      try {
        sonuc = await DP.list(kaynakAd, sorgu);
      } catch (e) {
        hataGoster(e);
        return;
      }
      /* sağlayıcı sayfayı kelepçelediyse durum ve URL düzeltilir
         (son sayfadaki son kayıt silinince bir önceki sayfaya düşülür) */
      sayfa = sonuc.pagination.currentPage;
      boyut = sonuc.pagination.pageSize;
      urlYaz(Object.assign({}, sorgu, { page: sayfa, pageSize: boyut }), ayar.push);

      sonSonuc = sonuc;
      if (tabloKap) tabloKap.removeAttribute('aria-busy');

      /* Süzülmüş kümenin tamamı üzerinden hesap (KPI, dağılım, toplam).
         Sayfa scripti burada da `await` yazmaz; hesabı biz çağırırız. */
      if (secenek.ozet) await DP.ozet(kaynakAd, sorgu, secenek.ozet);

      if (pager) {
        if (pager.sayfaya) pager.sayfaya(sayfa, boyut);
        pager.ayarla(sonuc.pagination.totalRecords);
      }

      if (secenek.ciz) secenek.ciz(sonuc, bosEkran(sorgu));
      else if (tablo) {
        tabloSecenek.bosDurum = bosEkran(sorgu);
        tablo.ciz(sonuc.data);
      }

      if (secenek.degisti) secenek.degisti(sonuc);
      if (ayar.odak) odakla();
      ilkYukleme = false;
      sonImza = imza();
    }

    /* ---- filtre (YALNIZ arayüz) ----
       gvFilter kendi süzme sonucunu üretmeye devam eder; ekrana giden veri
       ondan DEĞİL, dataProvider'dan gelir. Denetleyici gvFilter'ı yalnız
       durum kaynağı ve arayüz (çipler, çekmece, aktif filtre satırı) olarak
       kullanır — filters.js'e dokunulmaz. */
    filtre = gvFilter(Object.assign({}, secenek.filtre || {}, {
      veri: secenek.veri,
      arama: secenek.arama,
      cipler: secenek.cipler,
      alanlar: alanlar,
      arsivAlani: secenek.arsivAlani,
      degisti: function () {
        if (!hazir) return;
        sayfa = 1;                 /* filtre/arama/çip değişince page=1 */
        calistir({ odak: false });
      }
    }));

    /* URL'den gelen aralık/tarih filtrelerini gvFilter durumuna enjekte et */
    if (Object.keys(urlAralik).length) {
      Object.keys(urlAralik).forEach(function (k) { filtre.durum.gelismis[k] = urlAralik[k]; });
    }

    hazir = true;

    /* "Filtreleri temizle" — boş ekrandaki ve aktif çip satırındaki aksiyon.
       gvFilter.temizle() çip düğmelerinin görsel durumunu sıfırlamıyor;
       filters.js'e dokunmadan burada eşitlenir. */
    function filtreleriTemizle() {
      filtre.temizle();
      var cipKap = document.querySelector((secenek.filtre && secenek.filtre.cipHedef) || '#gvChips');
      if (cipKap) {
        cipKap.querySelectorAll('.chip[data-cip]').forEach(function (c) {
          var on = c.getAttribute('data-cip') === 'tumu';
          c.classList.toggle('is-on', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      }
      alanlar.forEach(function (a) {
        if (a.tur === 'aralik' || a.tur === 'tarih') GV.qYaz('fr_' + a.k, null);
      });
    }
    /* Aksiyon boş ekranın içindedir; dinleyici sayfa geneline değil o kabın
       üzerine bağlanır — aynı sayfada birden çok liste varsa çakışmaz. */
    if (tabloKap) {
      tabloKap.addEventListener('click', function (e) {
        if (e.target.closest('[data-gv-filtre-temizle]')) { e.preventDefault(); filtreleriTemizle(); }
      });
    }

    /* ---- geri / ileri: URL ekran durumunun tek paylaşılabilir kaynağıdır ----
       Sayfa değişimi dışındaki her yazım replaceState olduğu için geçmiş
       girdileri yalnız page/pageSize/sort taşır; imza değiştiyse tam durum
       URL'den yeniden kurulur. */
    var sonImza = null;
    function imza() {
      var u = new URLSearchParams(location.search);
      return [u.get('page') || '1', u.get('pageSize') || '', u.get('sort') || '',
              u.get('q') || '', u.get('durum') || ''].join('~');
    }
    window.addEventListener('popstate', function () {
      var yeni = imza();
      if (yeni === sonImza) return;
      location.reload();
    });

    /* ---- ilk koşu ---- */
    calistir({ odak: false });

    return {
      /** Listeyi yeniden çalıştırır. sifirla=true ise 1. sayfaya döner. */
      yenile: function (sifirla) {
        if (sifirla) sayfa = 1;
        if (window.dataProvider && window.dataProvider.onbellekDusur) window.dataProvider.onbellekDusur();
        return calistir({ odak: false });
      },
      /** Sıralamayı değiştirir; page daima 1 olur, id tie-breaker sağlayıcıda. */
      sirala: function (alan, yon) {
        sira = alan ? [{ field: alan, direction: yon === 'desc' ? 'desc' : 'asc' }] : [];
        if (filtre) { filtre.durum.sirala = null; }
        sayfa = 1;
        calistir({ odak: false });
      },
      /** Son PagedResult. */
      sonuc: function () { return sonSonuc; },
      /** Geçerli ListQuery. */
      sorgu: sorguKur,
      temizle: filtreleriTemizle,
      filtre: filtre,
      tablo: tablo,
      pager: pager
    };
  };
})();
