/* =====================================================================
   GAVIA — TİP SÖZLEŞMESİ VE SORGU NORMALİZASYONU
   Projede build adımı yoktur; tipler JSDoc @typedef olarak tanımlanır.
   Editör denetimi sağlar, çalışma zamanında sıfır maliyetlidir.
   Çalışma zamanı karşılığı: GV.sorguNormalize / GV.sorguVarsayilan.
   Global API: GV.SAYFA_BOYUTLARI · GV.sorguVarsayilan · GV.sorguNormalize
               GV.siraCoz · GV.siraYaz · GV.kelepce
   ===================================================================== */
(function () {
  'use strict';
  var kok = typeof window !== 'undefined' ? window : globalThis;
  var GV = kok.GV || (kok.GV = {});

  /**
   * Sayfa başına kayıt sayısı. Doküman §7: yalnız 10, 20, 50.
   * Frontend 100'den büyük değer üretmez.
   * @typedef {10|20|50} PageSize
   */
  GV.SAYFA_BOYUTLARI = [10, 20, 50];
  GV.SAYFA_BOYUTU_VARSAYILAN = 20;
  GV.ARAMA_ASGARI = 2;      /* q en az 2 karakterde çalışır */
  GV.ARAMA_GECIKME = 300;   /* 300 ms debounce */

  /**
   * Tek sıralama kalemi.
   * @typedef {Object} SortRule
   * @property {string} field
   * @property {'asc'|'desc'} direction
   */

  /**
   * Filtre değeri. Sözleşme `string[]` der; mock katmanı gvFilter alan
   * türlerini karşılamak için aralık ve tarih nesnelerini de kabul eder.
   * @typedef {string[]|{min?:string|number,max?:string|number}|{bas?:string,son?:string}} FilterValue
   */

  /**
   * Liste sorgusu — UI ve API tarafında 1 tabanlı sayfa numarası.
   * `filters` içinde iki ayrılmış anahtar vardır:
   *   `__cip`   → hızlı durum çipi (gvFilter cipler)
   *   `__arsiv` → arşiv kayıtları dahil mi
   * @typedef {Object} ListQuery
   * @property {number} page
   * @property {PageSize} pageSize
   * @property {string} [q]
   * @property {SortRule[]} sort
   * @property {Record<string, FilterValue>} filters
   * @property {string} [cursor]
   */

  /**
   * Sayfalama üstverisi.
   * @typedef {Object} Pagination
   * @property {number} currentPage
   * @property {number} pageSize
   * @property {number} totalRecords
   * @property {number} totalPages
   * @property {boolean} hasNextPage
   * @property {boolean} hasPreviousPage
   * @property {string} [nextCursor]
   */

  /**
   * Sayfalanmış sonuç.
   * @typedef {Object} PagedResult
   * @property {Array<Object>} data
   * @property {Pagination} pagination
   */

  /**
   * Veri sağlayıcı sözleşmesi. MockDataProvider bugün, ApiDataProvider
   * backend hazır olduğunda. UI, route ve testler değişmez.
   * @typedef {Object} DataProvider
   * @property {(resource:string, query:ListQuery)=>Promise<PagedResult>} list
   * @property {(resource:string, id:string)=>Promise<Object|null>} get
   * @property {(name:string, payload:*)=>Promise<*>} command
   */

  /**
   * Kaynak tanımı — MockDataProvider kayıt defterine yazılır.
   * @typedef {Object} KaynakTanim
   * @property {()=>Array<Object>} kaynak      ham kayıtları döndürür
   * @property {string[]} [arama]              serbest aramada taranan alanlar
   * @property {Array<Object>} [alanlar]       gvFilter gelişmiş alan tanımları
   * @property {Object} [cipler]               gvFilter hızlı durum çipi tanımı
   * @property {string} [arsivAlani]           doluysa kayıt arşivlidir
   * @property {SortRule[]} [sira]             varsayılan sıralama
   * @property {boolean} [onbellek]            kaynak() sonucu memoize edilsin mi
   */

  /* ---------- yardımcılar ---------- */

  /** Sayıyı alt/üst sınır arasına kelepçeler. */
  GV.kelepce = function (n, alt, ust) {
    n = Number(n);
    if (!isFinite(n)) return alt;
    return Math.min(ust, Math.max(alt, Math.trunc(n)));
  };

  /** 'updatedAt:desc,ad:asc' → SortRule[] */
  GV.siraCoz = function (metin) {
    if (!metin) return [];
    return String(metin).split(',').map(function (p) {
      var x = p.split(':');
      var alan = String(x[0] || '').trim();
      if (!alan) return null;
      return { field: alan, direction: String(x[1] || 'asc').trim().toLowerCase() === 'desc' ? 'desc' : 'asc' };
    }).filter(Boolean);
  };

  /** SortRule[] → 'updatedAt:desc,ad:asc' (boşsa null) */
  GV.siraYaz = function (sira) {
    if (!sira || !sira.length) return null;
    return sira.map(function (s) { return s.field + ':' + (s.direction === 'desc' ? 'desc' : 'asc'); }).join(',');
  };

  /** @returns {ListQuery} */
  GV.sorguVarsayilan = function () {
    return { page: 1, pageSize: GV.SAYFA_BOYUTU_VARSAYILAN, q: '', sort: [], filters: {} };
  };

  /**
   * Ham girdiyi geçerli bir ListQuery'ye çevirir.
   * pageSize=100000 gibi değerler normalize edilir; UI ve adapter maksimumu aşmaz.
   * @param {Object} [ham]
   * @returns {ListQuery}
   */
  GV.sorguNormalize = function (ham) {
    ham = ham || {};
    /* pageSize: izinli değilse en yakın izinli boyuta indirgenir;
       sayı bile değilse varsayılana düşer. UI ve adapter 50'yi aşmaz. */
    var istenen = Number(ham.pageSize);
    var boyut;
    if (GV.SAYFA_BOYUTLARI.indexOf(istenen) !== -1) boyut = istenen;
    else if (isFinite(istenen) && istenen > 0) {
      boyut = GV.SAYFA_BOYUTLARI.reduce(function (en, b) {
        return Math.abs(b - istenen) < Math.abs(en - istenen) ? b : en;
      }, GV.SAYFA_BOYUTLARI[0]);
    } else boyut = GV.SAYFA_BOYUTU_VARSAYILAN;

    var sira = Array.isArray(ham.sort) ? ham.sort : GV.siraCoz(ham.sort);
    sira = sira.filter(function (s) { return s && s.field; })
      .map(function (s) { return { field: String(s.field), direction: s.direction === 'desc' ? 'desc' : 'asc' }; });

    var filtreler = {};
    var kaynak = ham.filters || {};
    Object.keys(kaynak).forEach(function (k) {
      var v = kaynak[k];
      if (v == null || v === '') return;
      if (Array.isArray(v)) { if (v.length) filtreler[k] = v.map(String); return; }
      if (typeof v === 'object') {
        var dolu = ['min', 'max', 'bas', 'son'].some(function (a) { return v[a] != null && v[a] !== ''; });
        if (dolu) filtreler[k] = v;
        return;
      }
      filtreler[k] = [String(v)];
    });

    var q = ham.q == null ? '' : String(ham.q).trim();

    return {
      page: GV.kelepce(ham.page == null ? 1 : ham.page, 1, 1e6),
      pageSize: boyut,
      q: q,
      sort: sira,
      filters: filtreler,
      cursor: ham.cursor ? String(ham.cursor) : undefined
    };
  };

  /* Node tarafında birim test edilebilmesi için (tarayıcıda etkisiz). */
  if (typeof module !== 'undefined' && module.exports) module.exports = GV;
})();
