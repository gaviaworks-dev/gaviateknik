/* =====================================================================
   GAVIA — DURUM MAKİNESİ ÇEKİRDEĞİ
   Doküman §8 "Temel durum makineleri" ve "Durum makinesi kuralları":
     · Her geçiş TEK bir transition fonksiyonundan yapılır; sayfa scripti
       durum alanını doğrudan değiştirmez.
     · Geçiş için izin, zorunlu alan, önceki durum ve tarih koşulu kontrol
       edilir.
     · Geçiş olmayan buton gizlenmekle yetinmez; disabled nedeni açıklanır.
     · Geri alma yalnız tanımlı geçişlerle yapılır ve denetim izi bırakır.
     · KPI, liste rozetleri ve detay başlığı aynı durum enumunu kullanır.

   ---------------------------------------------------------------------
   DOKÜMAN ZİNCİRİ ↔ KOD MODELİ

   Doküman §8'deki beş zincir uçtan uca SÜREÇ anlatımıdır; kod bunları
   CLAUDE.md §8'in "durumlar 5 ayrı akıştır, tek metin alanında
   birleştirilmez" kuralı gereği koleksiyon bazında ayrı alanlarda tutar.
   Eşleme:

     Doküman "İş Emri"  = operasyon akışı (operasyonDurum)
                        + rapor akışı (raporDurum)
                        + fatura akışı (faturaDurum)
     Doküman "Rapor"    = rapor akışı
     Doküman "Ticari"   = teklif → sozlesme → hakedis → mutabakat
                        → fatura → tahsilat → taseronOdeme
     Doküman "Proje"    = proje akışı
     Doküman "Uygunsuzluk" = uygunsuzluk akışı; ara aşamalar (aksiyon
       planlandı / uygulandı / kanıt yüklendi) ayrı `duzelticiFaaliyetler`
       kayıtlarında yaşar, uygunsuzluğun kendi alanında değil.

   Global API: GV.akis · GV.akisListesi · GV.gecisDene · GV.gecisHedefleri
               GV.gecisUygula · GV.gecisButonu
   ===================================================================== */
(function () {
  'use strict';
  var kok = typeof window !== 'undefined' ? window : globalThis;
  var GV = kok.GV || (kok.GV = {});

  function api() { return kok.demoApi || null; }
  function esc(s) { return GV.esc ? GV.esc(s) : String(s == null ? '' : s); }

  /* ---------------------------------------------------------------
     Yardımcı ön koşullar — iş kuralı KOPYALANMAZ, demoApi'den çağrılır.
     --------------------------------------------------------------- */
  function kural(fn, arg) {
    var A = api();
    if (!A || typeof A[fn] !== 'function') return { uygun: true };
    var r = A[fn](arg);
    if (r == null) return { uygun: true };
    if (typeof r === 'boolean') return { uygun: r };
    if (r.uygun === false) return { uygun: false, sebep: r.sebep };
    if (r.gecerli === false) return { uygun: false, sebep: r.sebep };
    return { uygun: true, uyari: r.uyari };
  }

  /** Uygunsuzluk kapanışı: yeniden kontrol gerekiyorsa tamamlanmış olmalı. */
  function yenidenKontrolTamamMi(u) {
    var A = api();
    if (!A || !u || u.yenidenKontrol !== 'gerekli') return { uygun: true };
    var acik = A.liste('yenidenKontroller').filter(function (y) {
      return y.uygunsuzlukId === u.id && y.durum !== 'tamamlandi';
    });
    if (acik.length) {
      return { uygun: false, sebep: 'Yeniden kontrol tamamlanmadan uygunsuzluk kapatılamaz.' };
    }
    return { uygun: true };
  }

  /* ---------------------------------------------------------------
     AKIŞ TANIMLARI

     alan      : kaydın durum alanı
     sozluk    : DEMO.durumlar içindeki anahtar (rozet bilgisi oradan gelir)
     durumlar  : sözlük yoksa yerinde tanım [{k, ad, ton, ikon}]
     gecis     : {mevcutDurum: [izinli hedefler]}
     izin      : {hedef: [rol]} — tanımsızsa bütün roller
     zorunlu   : {hedef: [alan]} — kayıtta ya da ctx.veri içinde dolu olmalı
     zorunluKol: {koleksiyon: {hedef: [alan]}} — aynı akış başka bir
                 koleksiyonda başka alan adları kullanıyorsa (örn. rapor
                 akışı `lokasyonlar.raporDurum` üzerinde çalışırken)
     onKosul   : {hedef: fn(kayit, ctx) → {uygun, sebep}}; ctx.koleksiyon ile
                 hangi koleksiyon üstünde çalışıldığı bilinir
     etiket    : {hedef: 'Buton metni'}
     --------------------------------------------------------------- */
  var YONETIM = ['sahip', 'gm'];

  var AKISLAR = {

    /* ---- PROJE — doküman: Taslak → Onay Bekliyor → Aktif → Askıda
                            → Tamamlandı → Arşivlendi ---- */
    proje: {
      ad: 'Proje', koleksiyon: 'projeler', alan: 'durum', sozluk: 'proje',
      gecis: {
        'planlama':    ['onay-bekliyor', 'aktif'],
        'onay-bekliyor': ['aktif', 'planlama'],
        'aktif':       ['askida', 'tamamlandi'],
        'askida':      ['aktif', 'tamamlandi'],
        'tamamlandi':  ['arsivlendi', 'aktif'],
        'arsivlendi':  []
      },
      izin: {
        'aktif': YONETIM.concat(['operasyon', 'planlama']),
        'askida': YONETIM.concat(['operasyon']),
        'tamamlandi': YONETIM.concat(['operasyon']),
        'arsivlendi': YONETIM
      },
      zorunlu: {
        'aktif': ['musteriId', 'baslangic', 'bitis'],
        'tamamlandi': ['baslangic', 'bitis']
      },
      etiket: {
        'onay-bekliyor': 'Onaya gönder', 'aktif': 'Aktife al', 'askida': 'Askıya al',
        'tamamlandi': 'Tamamlandı işaretle', 'arsivlendi': 'Arşivle', 'planlama': 'Planlamaya döndür'
      }
    },

    /* ---- OPERASYON — lokasyonlar.operasyonDurum · isEmirleri.operasyonDurum
            doküman "İş Emri" zincirinin saha ayağı ---- */
    operasyon: {
      ad: 'Operasyon', alan: 'operasyonDurum', sozluk: 'operasyon',
      gecis: {
        'bilgi-bekleniyor':      ['iletisime-gecildi', 'envanter-bekleniyor', 'kapsam-disi', 'iptal'],
        'envanter-bekleniyor':   ['iletisime-gecildi', 'tarih-onayi-bekleniyor', 'kapsam-disi', 'iptal'],
        'iletisime-gecildi':     ['tarih-onayi-bekleniyor', 'envanter-bekleniyor', 'bilgi-bekleniyor', 'kapsam-disi', 'iptal'],
        'tarih-onayi-bekleniyor':['planlandi', 'tadilatta', 'tasiniyor', 'iletisime-gecildi', 'kapsam-disi', 'iptal'],
        'planlandi':             ['sahada', 'tarih-onayi-bekleniyor', 'tadilatta', 'tasiniyor', 'iletisime-gecildi', 'iptal'],
        'tadilatta':             ['tarih-onayi-bekleniyor', 'planlandi', 'iletisime-gecildi', 'kapsam-disi', 'iptal'],
        'tasiniyor':             ['tarih-onayi-bekleniyor', 'planlandi', 'iletisime-gecildi', 'kapsam-disi', 'iptal'],
        /* Sahadaki kayıt yeni döneme SESSİZCE alınmaz — önce ziyaret kapanır. */
        'sahada':                ['kontrol-tamamlandi', 'yeniden-ziyaret', 'planlandi'],
        /* 'iletisime-gecildi': periyodik kontrol yıllık tekrarlanır; kaydın
           yeni bir kontrol dönemine/projeye alınması döngüyü baştan başlatır. */
        'kontrol-tamamlandi':    ['yeniden-ziyaret', 'iletisime-gecildi'],
        'yeniden-ziyaret':       ['planlandi', 'sahada', 'kontrol-tamamlandi', 'iletisime-gecildi'],
        'kapsam-disi':           ['bilgi-bekleniyor', 'iletisime-gecildi'],
        'iptal':                 ['bilgi-bekleniyor', 'iletisime-gecildi']
      },
      izin: {
        'kontrol-tamamlandi': YONETIM.concat(['operasyon', 'teknik', 'uzman', 'saha', 'taseron']),
        'kapsam-disi': YONETIM.concat(['operasyon', 'planlama']),
        'iptal': YONETIM.concat(['operasyon', 'planlama'])
      },
      zorunlu: {
        'planlandi': ['kontrolTarihi'],
        'sahada': ['kontrolTarihi'],
        'kontrol-tamamlandi': ['kontrolTarihi']
      },
      /* İş emrinde kontrol tarihi `tarih` alanında tutulur. */
      zorunluKol: {
        isEmirleri: { 'planlandi': ['tarih'], 'sahada': ['tarih'], 'kontrol-tamamlandi': ['tarih'] }
      },
      etiket: {
        'planlandi': 'Planlandı', 'sahada': 'Sahaya çık', 'kontrol-tamamlandi': 'Kontrolü tamamla',
        'yeniden-ziyaret': 'Yeniden ziyaret gerekli', 'kapsam-disi': 'Kapsam dışı bırak', 'iptal': 'İptal et'
      }
    },

    /* ---- RAPOR — raporlar.durum · lokasyonlar.raporDurum ---- */
    rapor: {
      ad: 'Rapor', koleksiyon: 'raporlar', alan: 'durum', sozluk: 'rapor',
      gecis: {
        'baslatilmadi':          ['taslak', 'taserondan-bekleniyor'],
        'taslak':                ['teknik-incelemede', 'arsiv'],
        'taserondan-bekleniyor': ['taslak', 'teknik-incelemede'],
        'teknik-incelemede':     ['onaylandi', 'revizyon-istendi'],
        'revizyon-istendi':      ['taslak', 'teknik-incelemede'],
        'onaylandi':             ['imzalandi', 'teslim-edildi', 'arsiv'],
        'imzalandi':             ['teslim-edildi', 'arsiv'],
        'teslim-edildi':         ['arsiv'],
        'arsiv':                 []
      },
      izin: {
        'onaylandi': YONETIM.concat(['teknik', 'kalite']),
        'revizyon-istendi': YONETIM.concat(['teknik', 'kalite', 'operasyon']),
        'imzalandi': YONETIM.concat(['teknik']),
        'teslim-edildi': YONETIM.concat(['teknik', 'operasyon', 'kalite']),
        'arsiv': YONETIM.concat(['teknik', 'kalite'])
      },
      zorunlu: {
        'teknik-incelemede': ['kontrolTarihi'],
        'onaylandi': ['onaylayanId', 'raporTarihi'],
        'teslim-edildi': ['teslimTarihi']
      },
      /* Aynı akış lokasyon ve iş emri kaydında `raporDurum` alanını sürer;
         oradaki tarih alanlarının adı farklıdır. */
      zorunluKol: {
        lokasyonlar: { 'onaylandi': ['raporTarihi'], 'teslim-edildi': ['raporTeslimTarihi'], 'teknik-incelemede': ['kontrolTarihi'] },
        isEmirleri:  { 'onaylandi': [], 'teslim-edildi': [], 'teknik-incelemede': [] }
      },
      onKosul: {
        /* Onaylı rapor düzenlenemez — kural demoApi'de, burada yalnız çağrılır.
           Kural rapor kaydına aittir; lokasyon/iş emri aynasında çalışmaz. */
        'taslak': function (k, ctx) {
          if (ctx && ctx.koleksiyon && ctx.koleksiyon !== 'raporlar') return { uygun: true };
          return k && k.id ? kural('raporDuzenlenebilirMi', k.id) : { uygun: true };
        }
      },
      etiket: {
        'teknik-incelemede': 'Teknik incelemeye gönder', 'onaylandi': 'Onayla',
        'revizyon-istendi': 'Revizyon iste', 'imzalandi': 'İmzala',
        'teslim-edildi': 'Müşteriye teslim et', 'arsiv': 'Arşive al'
      }
    },

    /* ---- UYGUNSUZLUK ---- */
    uygunsuzluk: {
      ad: 'Uygunsuzluk', koleksiyon: 'uygunsuzluklar', alan: 'durum',
      durumlar: [
        { k: 'acik',    ad: 'Açık',    ton: 'danger', ikon: 'fa-circle-exclamation' },
        { k: 'gecikti', ad: 'Gecikti', ton: 'danger', ikon: 'fa-clock' },
        { k: 'kapandi', ad: 'Kapandı', ton: 'ok',     ikon: 'fa-circle-check' }
      ],
      gecis: {
        'acik':    ['gecikti', 'kapandi'],
        'gecikti': ['acik', 'kapandi'],
        'kapandi': ['acik']
      },
      izin: {
        'kapandi': YONETIM.concat(['teknik', 'kalite', 'operasyon']),
        'acik': YONETIM.concat(['teknik', 'kalite', 'operasyon'])
      },
      zorunlu: { 'kapandi': ['kapanis'] },
      onKosul: { 'kapandi': function (k) { return yenidenKontrolTamamMi(k); } },
      etiket: { 'kapandi': 'Uygunsuzluğu kapat', 'acik': 'Yeniden aç' }
    },

    /* ---- TİCARİ ZİNCİR: TEKLİF ---- */
    teklif: {
      ad: 'Teklif', koleksiyon: 'teklifler', alan: 'durum',
      durumlar: [
        { k: 'hazirlaniyor', ad: 'Hazırlanıyor', ton: 'info',   ikon: 'fa-pen-ruler' },
        { k: 'gonderildi',   ad: 'Gönderildi',   ton: 'warn',   ikon: 'fa-paper-plane' },
        { k: 'kazanildi',    ad: 'Kazanıldı',    ton: 'ok',     ikon: 'fa-trophy' },
        { k: 'kaybedildi',   ad: 'Kaybedildi',   ton: 'danger', ikon: 'fa-circle-xmark' }
      ],
      gecis: {
        'hazirlaniyor': ['gonderildi'],
        'gonderildi':   ['kazanildi', 'kaybedildi', 'hazirlaniyor'],
        'kazanildi':    ['gonderildi'],
        'kaybedildi':   ['gonderildi']
      },
      izin: {
        'gonderildi': YONETIM.concat(['satis']),
        'kazanildi':  YONETIM.concat(['satis']),
        'kaybedildi': YONETIM.concat(['satis'])
      },
      zorunlu: { 'gonderildi': ['musteriId', 'gecerlilik'] },
      etiket: { 'gonderildi': 'Müşteriye gönder', 'kazanildi': 'Kazanıldı', 'kaybedildi': 'Kaybedildi', 'hazirlaniyor': 'Revizyona al' }
    },

    /* ---- TİCARİ ZİNCİR: SÖZLEŞME ---- */
    sozlesme: {
      ad: 'Sözleşme', koleksiyon: 'sozlesmeler', alan: 'durum',
      durumlar: [
        { k: 'yururlukte', ad: 'Yürürlükte', ton: 'ok',  ikon: 'fa-file-signature' },
        { k: 'sona-erdi',  ad: 'Sona Erdi',  ton: 'off', ikon: 'fa-file-circle-xmark' }
      ],
      gecis: { 'yururlukte': ['sona-erdi'], 'sona-erdi': [] },
      izin: { 'sona-erdi': YONETIM.concat(['satis', 'finans']) },
      zorunlu: { 'sona-erdi': ['baslangic', 'bitis'] },
      etiket: { 'sona-erdi': 'Sözleşmeyi sonlandır' }
    },

    /* ---- TİCARİ ZİNCİR: HAKEDİŞ ---- */
    hakedis: {
      ad: 'Hakediş', koleksiyon: 'hakedisler', alan: 'durum',
      durumlar: [
        { k: 'hazirlaniyor',  ad: 'Hazırlanıyor',  ton: 'off',  ikon: 'fa-file-pen' },
        { k: 'onay-bekliyor', ad: 'Onay Bekliyor', ton: 'warn', ikon: 'fa-hourglass-half' },
        { k: 'faturalandi',   ad: 'Faturalandı',   ton: 'ok',   ikon: 'fa-file-invoice-dollar' }
      ],
      gecis: {
        'hazirlaniyor':  ['onay-bekliyor'],
        'onay-bekliyor': ['faturalandi', 'hazirlaniyor'],
        'faturalandi':   []
      },
      izin: { 'faturalandi': YONETIM.concat(['finans']), 'onay-bekliyor': YONETIM.concat(['finans', 'operasyon']) },
      etiket: { 'onay-bekliyor': 'Onaya gönder', 'faturalandi': 'Faturalandı işaretle' }
    },

    /* ---- TİCARİ ZİNCİR: MUTABAKAT ---- */
    mutabakat: {
      ad: 'Mutabakat', koleksiyon: 'mutabakat', alan: 'durum',
      durumlar: [
        { k: 'bekliyor', ad: 'Bekliyor', ton: 'warn',   ikon: 'fa-hourglass-half' },
        { k: 'itirazli', ad: 'İtirazlı', ton: 'danger', ikon: 'fa-triangle-exclamation' },
        { k: 'onayli',   ad: 'Onaylı',   ton: 'ok',     ikon: 'fa-circle-check' }
      ],
      gecis: { 'bekliyor': ['onayli', 'itirazli'], 'itirazli': ['bekliyor', 'onayli'], 'onayli': ['itirazli'] },
      izin: { 'onayli': YONETIM.concat(['operasyon', 'finans', 'planlama']) },
      etiket: { 'onayli': 'Mutabakatı onayla', 'itirazli': 'İtiraz kaydet', 'bekliyor': 'Beklemeye al' }
    },

    /* ---- TİCARİ ZİNCİR: FATURA (lokasyonlar.faturaDurum) ---- */
    fatura: {
      ad: 'Faturalama', alan: 'faturaDurum', sozluk: 'fatura',
      gecis: {
        'faturaya-uygun-degil': ['mutabakat-bekleniyor'],
        'mutabakat-bekleniyor': ['faturaya-hazir', 'faturaya-uygun-degil'],
        'faturaya-hazir':       ['fatura-grubunda', 'mutabakat-bekleniyor'],
        'fatura-grubunda':      ['kismen-faturalandi', 'tam-faturalandi', 'faturaya-hazir'],
        'kismen-faturalandi':   ['tam-faturalandi'],
        'tam-faturalandi':      []
      },
      izin: {
        'fatura-grubunda': YONETIM.concat(['finans', 'satis']),
        'kismen-faturalandi': YONETIM.concat(['finans']),
        'tam-faturalandi': YONETIM.concat(['finans'])
      },
      onKosul: {
        /* Mutabakat onaylanmadan faturaya geçilemez — kural demoApi'de. */
        'fatura-grubunda': function (k) { return kural('lokasyonFaturalanabilirMi', k && k.id); }
      },
      etiket: { 'fatura-grubunda': 'Fatura grubuna al', 'faturaya-hazir': 'Faturaya hazır' }
    },

    /* ---- TİCARİ ZİNCİR: TAHSİLAT (faturalar.tahsilatDurum) ---- */
    tahsilat: {
      ad: 'Tahsilat', koleksiyon: 'faturalar', alan: 'tahsilatDurum', sozluk: 'tahsilat',
      gecis: {
        'bekleniyor':    ['kismen-tahsil', 'tam-tahsil', 'vadesi-gecti'],
        'vadesi-gecti':  ['kismen-tahsil', 'tam-tahsil'],
        'kismen-tahsil': ['tam-tahsil', 'vadesi-gecti'],
        'tam-tahsil':    []
      },
      izin: { 'kismen-tahsil': YONETIM.concat(['finans']), 'tam-tahsil': YONETIM.concat(['finans']) },
      etiket: { 'kismen-tahsil': 'Kısmi tahsilat işle', 'tam-tahsil': 'Tahsilatı tamamla' }
    },

    /* ---- TİCARİ ZİNCİR: TAŞERON ÖDEMESİ ---- */
    taseronOdeme: {
      ad: 'Taşeron Ödemesi', koleksiyon: 'taseronHakedisleri', alan: 'durum', sozluk: 'taseronOdeme',
      gecis: {
        'hakedis-hazirlaniyor':        ['taseron-faturasi-bekleniyor'],
        'taseron-faturasi-bekleniyor': ['musteri-tahsilati-bekleniyor', 'odemeye-uygun'],
        'musteri-tahsilati-bekleniyor':['odemeye-uygun'],
        'odemeye-uygun':               ['kismen-odendi', 'tam-odendi'],
        'kismen-odendi':               ['tam-odendi'],
        'tam-odendi':                  []
      },
      izin: {
        'odemeye-uygun': YONETIM.concat(['finans']),
        'kismen-odendi': YONETIM.concat(['finans']),
        'tam-odendi': YONETIM.concat(['finans'])
      },
      onKosul: {
        /* Ödeme kuralı (müşteri tahsilatı sonrası) demoApi'de tanımlı. */
        'kismen-odendi': function (k) { return kural('taseronOdenebilirMi', k && k.id); },
        'tam-odendi':    function (k) { return kural('taseronOdenebilirMi', k && k.id); }
      },
      etiket: { 'odemeye-uygun': 'Ödemeye uygun', 'kismen-odendi': 'Kısmi ödeme', 'tam-odendi': 'Ödemeyi tamamla' }
    },

    /* ---- FATURA GRUBU ---- */
    faturaGrubu: {
      ad: 'Fatura Grubu', koleksiyon: 'faturaGruplari', alan: 'durum',
      durumlar: [
        { k: 'doluyor',            ad: 'Doluyor',            ton: 'info', ikon: 'fa-layer-group' },
        { k: 'hedefe-ulasti',      ad: 'Hedefe Ulaştı',      ton: 'warn', ikon: 'fa-bullseye' },
        { k: 'kismen-faturalandi', ad: 'Kısmen Faturalandı', ton: 'warn', ikon: 'fa-circle-half-stroke' },
        { k: 'tam-faturalandi',    ad: 'Tam Faturalandı',    ton: 'ok',   ikon: 'fa-file-invoice-dollar' }
      ],
      gecis: {
        'doluyor':            ['hedefe-ulasti', 'kismen-faturalandi'],
        'hedefe-ulasti':      ['kismen-faturalandi', 'tam-faturalandi', 'doluyor'],
        'kismen-faturalandi': ['tam-faturalandi'],
        'tam-faturalandi':    []
      },
      izin: { 'kismen-faturalandi': YONETIM.concat(['finans']), 'tam-faturalandi': YONETIM.concat(['finans']) },
      etiket: { 'hedefe-ulasti': 'Hedefe ulaştı', 'tam-faturalandi': 'Grubu kapat' }
    },

    /* ---- SAHA KONTROL ---- */
    sahaKontrol: {
      ad: 'Saha Kontrolü', koleksiyon: 'sahaKontroller', alan: 'durum',
      durumlar: [
        { k: 'devam-ediyor',      ad: 'Devam Ediyor',      ton: 'info', ikon: 'fa-person-walking' },
        { k: 'eksik-tamamlandi',  ad: 'Eksik Tamamlandı',  ton: 'warn', ikon: 'fa-circle-half-stroke' },
        { k: 'tamamlandi',        ad: 'Tamamlandı',        ton: 'ok',   ikon: 'fa-circle-check' }
      ],
      gecis: {
        'devam-ediyor':     ['tamamlandi', 'eksik-tamamlandi'],
        'eksik-tamamlandi': ['tamamlandi', 'devam-ediyor'],
        'tamamlandi':       []
      },
      zorunlu: { 'tamamlandi': ['baslangic'] },
      etiket: { 'tamamlandi': 'Kontrolü tamamla', 'eksik-tamamlandi': 'Eksikle tamamla' }
    },

    /* ---- YENİDEN KONTROL ---- */
    yenidenKontrol: {
      ad: 'Yeniden Kontrol', koleksiyon: 'yenidenKontroller', alan: 'durum',
      durumlar: [
        { k: 'talep-edildi', ad: 'Talep Edildi', ton: 'warn', ikon: 'fa-hand' },
        { k: 'planlandi',    ad: 'Planlandı',    ton: 'info', ikon: 'fa-calendar-days' },
        { k: 'tamamlandi',   ad: 'Tamamlandı',   ton: 'ok',   ikon: 'fa-circle-check' }
      ],
      gecis: { 'talep-edildi': ['planlandi'], 'planlandi': ['tamamlandi', 'talep-edildi'], 'tamamlandi': [] },
      zorunlu: { 'planlandi': ['planTarihi'] },
      izin: { 'tamamlandi': YONETIM.concat(['operasyon', 'teknik', 'uzman', 'planlama']) },
      etiket: { 'planlandi': 'Planla', 'tamamlandi': 'Tamamlandı işaretle' }
    },

    /* ---- EKSİK EKİPMAN ---- */
    eksikEkipman: {
      ad: 'Eksik Ekipman', koleksiyon: 'eksikEkipmanlar', alan: 'durum',
      durumlar: [
        { k: 'musteri-bildirildi',      ad: 'Müşteriye Bildirildi',   ton: 'info', ikon: 'fa-paper-plane' },
        { k: 'mutabakatta',             ad: 'Mutabakatta',            ton: 'warn', ikon: 'fa-scale-balanced' },
        { k: 'yeniden-kontrol-bekliyor',ad: 'Yeniden Kontrol Bekliyor', ton: 'warn', ikon: 'fa-rotate-right' },
        { k: 'musteri-onayladi',        ad: 'Müşteri Onayladı',       ton: 'ok',   ikon: 'fa-circle-check' }
      ],
      gecis: {
        'musteri-bildirildi':       ['mutabakatta', 'yeniden-kontrol-bekliyor'],
        'mutabakatta':              ['musteri-onayladi', 'yeniden-kontrol-bekliyor'],
        'yeniden-kontrol-bekliyor': ['mutabakatta', 'musteri-onayladi'],
        'musteri-onayladi':         []
      },
      etiket: { 'musteri-bildirildi': 'Müşteriye bildir', 'mutabakatta': 'Mutabakata al', 'musteri-onayladi': 'Müşteri onayladı' }
    },

    /* ---- KALİTE: DOKÜMAN ---- */
    kaliteDokuman: {
      ad: 'Kalite Dokümanı', koleksiyon: 'kaliteDokumanlari', alan: 'durum',
      durumlar: [
        { k: 'onayda',              ad: 'Onayda',              ton: 'warn', ikon: 'fa-hourglass-half' },
        { k: 'yayinda',             ad: 'Yayında',             ton: 'ok',   ikon: 'fa-circle-check' },
        { k: 'yururlukten-kalkti',  ad: 'Yürürlükten Kalktı',  ton: 'off',  ikon: 'fa-box-archive' }
      ],
      gecis: { 'onayda': ['yayinda'], 'yayinda': ['yururlukten-kalkti', 'onayda'], 'yururlukten-kalkti': ['onayda'] },
      izin: { 'yayinda': YONETIM.concat(['kalite']), 'yururlukten-kalkti': YONETIM.concat(['kalite']) },
      zorunlu: { 'yayinda': ['onaylayanId', 'yayin'] },
      etiket: { 'yayinda': 'Yayına al', 'yururlukten-kalkti': 'Yürürlükten kaldır', 'onayda': 'Onaya gönder' }
    },

    /* ---- KALİTE: DENETİM ---- */
    denetim: {
      ad: 'Denetim', koleksiyon: 'denetimler', alan: 'durum',
      durumlar: [
        { k: 'planlandi', ad: 'Planlandı', ton: 'info',   ikon: 'fa-calendar-days' },
        { k: 'acik',      ad: 'Açık',      ton: 'warn',   ikon: 'fa-folder-open' },
        { k: 'kapandi',   ad: 'Kapandı',   ton: 'ok',     ikon: 'fa-circle-check' }
      ],
      gecis: { 'planlandi': ['acik'], 'acik': ['kapandi', 'planlandi'], 'kapandi': ['acik'] },
      izin: { 'kapandi': YONETIM.concat(['kalite']) },
      etiket: { 'acik': 'Denetimi başlat', 'kapandi': 'Denetimi kapat', 'planlandi': 'Planlamaya al' }
    },

    /* ---- KALİTE: DÜZELTİCİ FAALİYET ---- */
    dof: {
      ad: 'Düzeltici Faaliyet', koleksiyon: 'duzelticiFaaliyetler', alan: 'durum',
      durumlar: [
        { k: 'acik',    ad: 'Açık',    ton: 'warn', ikon: 'fa-screwdriver-wrench' },
        { k: 'kapandi', ad: 'Kapandı', ton: 'ok',   ikon: 'fa-circle-check' }
      ],
      gecis: { 'acik': ['kapandi'], 'kapandi': ['acik'] },
      izin: { 'kapandi': YONETIM.concat(['kalite', 'teknik']) },
      zorunlu: { 'kapandi': ['faaliyet', 'kapanis'] },
      etiket: { 'kapandi': 'Faaliyeti kapat', 'acik': 'Yeniden aç' }
    },

    /* ---- KALİTE: MÜŞTERİ ŞİKÂYETİ ---- */
    sikayet: {
      ad: 'Müşteri Şikâyeti', koleksiyon: 'musteriSikayetleri', alan: 'durum',
      durumlar: [
        { k: 'acik',              ad: 'Açık',              ton: 'danger', ikon: 'fa-circle-exclamation' },
        { k: 'degerlendiriliyor', ad: 'Değerlendiriliyor',  ton: 'warn',   ikon: 'fa-magnifying-glass' },
        { k: 'kapandi',           ad: 'Kapandı',            ton: 'ok',     ikon: 'fa-circle-check' }
      ],
      gecis: { 'acik': ['degerlendiriliyor', 'kapandi'], 'degerlendiriliyor': ['kapandi', 'acik'], 'kapandi': ['acik'] },
      izin: { 'kapandi': YONETIM.concat(['kalite', 'operasyon']) },
      zorunlu: { 'kapandi': ['cozum', 'kapanis'] },
      etiket: { 'degerlendiriliyor': 'Değerlendirmeye al', 'kapandi': 'Şikâyeti kapat', 'acik': 'Yeniden aç' }
    },

    /* ---- KAYNAK: ÖLÇÜM CİHAZI ---- */
    cihaz: {
      ad: 'Ölçüm Cihazı', koleksiyon: 'olcumCihazlari', alan: 'durum',
      durumlar: [
        { k: 'kullanimda',          ad: 'Kullanımda',          ton: 'ok',     ikon: 'fa-circle-check' },
        { k: 'serviste',            ad: 'Serviste',            ton: 'warn',   ikon: 'fa-screwdriver-wrench' },
        { k: 'kalibrasyon-gecmis',  ad: 'Kalibrasyonu Geçmiş', ton: 'danger', ikon: 'fa-triangle-exclamation' }
      ],
      gecis: {
        'kullanimda':         ['serviste', 'kalibrasyon-gecmis'],
        'serviste':           ['kullanimda'],
        'kalibrasyon-gecmis': ['serviste']
      },
      izin: { 'kullanimda': YONETIM.concat(['teknik', 'kalite', 'operasyon']) },
      etiket: { 'serviste': 'Kalibrasyona gönder', 'kullanimda': 'Kullanıma al' }
    },

    /* ---- KAYNAK: EKİPMAN ---- */
    ekipman: {
      ad: 'Ekipman', koleksiyon: 'ekipmanlar', alan: 'durum',
      durumlar: [
        { k: 'aktif',         ad: 'Aktif',         ton: 'ok',   ikon: 'fa-circle-check' },
        { k: 'bakimda',       ad: 'Bakımda',       ton: 'warn', ikon: 'fa-screwdriver-wrench' },
        { k: 'kullanim-disi', ad: 'Kullanım Dışı', ton: 'off',  ikon: 'fa-ban' }
      ],
      gecis: {
        'aktif':         ['bakimda', 'kullanim-disi'],
        'bakimda':       ['aktif', 'kullanim-disi'],
        'kullanim-disi': ['aktif', 'bakimda']
      },
      etiket: { 'aktif': 'Aktife al', 'bakimda': 'Bakıma al', 'kullanim-disi': 'Kullanım dışı bırak' }
    },

    /* ---- KAYNAK: PERSONEL ---- */
    personel: {
      ad: 'Personel', koleksiyon: 'personeller', alan: 'durum',
      durumlar: [
        { k: 'aktif',  ad: 'Aktif',  ton: 'ok',   ikon: 'fa-circle-check' },
        { k: 'izinli', ad: 'İzinli', ton: 'warn', ikon: 'fa-umbrella-beach' },
        { k: 'pasif',  ad: 'Pasif',  ton: 'off',  ikon: 'fa-user-slash' }
      ],
      gecis: { 'aktif': ['izinli', 'pasif'], 'izinli': ['aktif'], 'pasif': ['aktif'] },
      izin: { 'pasif': YONETIM },
      etiket: { 'izinli': 'İzne çıkar', 'aktif': 'Aktife al', 'pasif': 'Pasife al' }
    },

    /* ---- MÜŞTERİ ---- */
    musteri: {
      ad: 'Müşteri', koleksiyon: 'musteriler', alan: 'durum',
      durumlar: [
        { k: 'aday',  ad: 'Aday',  ton: 'info', ikon: 'fa-user-plus' },
        { k: 'aktif', ad: 'Aktif', ton: 'ok',   ikon: 'fa-circle-check' },
        { k: 'pasif', ad: 'Pasif', ton: 'off',  ikon: 'fa-box-archive' }
      ],
      gecis: { 'aday': ['aktif', 'pasif'], 'aktif': ['pasif'], 'pasif': ['aktif'] },
      izin: { 'pasif': YONETIM.concat(['satis', 'finans']), 'aktif': YONETIM.concat(['satis']) },
      etiket: { 'aktif': 'Aktife al', 'pasif': 'Arşive al (pasif)' }
    },

    /* ---- HİZMET KATALOĞU ---- */
    hizmet: {
      ad: 'Hizmet', koleksiyon: 'hizmetler', alan: 'durum',
      durumlar: [
        { k: 'aktif', ad: 'Aktif', ton: 'ok',  ikon: 'fa-circle-check' },
        { k: 'pasif', ad: 'Pasif', ton: 'off', ikon: 'fa-circle-minus' }
      ],
      gecis: { 'aktif': ['pasif'], 'pasif': ['aktif'] },
      izin: { 'pasif': YONETIM.concat(['operasyon', 'planlama', 'satis']) },
      etiket: { 'pasif': 'Pasife al', 'aktif': 'Aktife al' }
    },

    /* ---- FİYAT LİSTESİ ---- */
    fiyatListesi: {
      ad: 'Fiyat Listesi', koleksiyon: 'fiyatListeleri', alan: 'durum',
      durumlar: [
        { k: 'aktif', ad: 'Aktif', ton: 'ok',  ikon: 'fa-circle-check' },
        { k: 'arsiv', ad: 'Arşiv', ton: 'off', ikon: 'fa-box-archive' }
      ],
      gecis: { 'aktif': ['arsiv'], 'arsiv': ['aktif'] },
      izin: { 'arsiv': YONETIM.concat(['satis', 'finans']) },
      etiket: { 'arsiv': 'Arşive al', 'aktif': 'Aktife al' }
    },

    /* ---- RAPOR ŞABLONU ---- */
    raporSablonu: {
      ad: 'Rapor Şablonu', koleksiyon: 'raporSablonlari', alan: 'durum',
      durumlar: [
        { k: 'taslak',  ad: 'Taslak',  ton: 'info', ikon: 'fa-pen-ruler' },
        { k: 'yayinda', ad: 'Yayında', ton: 'ok',   ikon: 'fa-circle-check' },
        { k: 'arsiv',   ad: 'Arşiv',   ton: 'off',  ikon: 'fa-box-archive' }
      ],
      gecis: { 'taslak': ['yayinda'], 'yayinda': ['arsiv', 'taslak'], 'arsiv': ['taslak'] },
      izin: { 'yayinda': YONETIM.concat(['teknik', 'kalite']) },
      zorunlu: { 'yayinda': ['onaylayanId'] },
      etiket: { 'yayinda': 'Yayına al', 'arsiv': 'Arşive al', 'taslak': 'Taslağa döndür' }
    },

    /* ---- VERİ AKTARIMI ---- */
    veriAktarimi: {
      ad: 'Veri Aktarımı', koleksiyon: 'veriAktarimlari', alan: 'durum',
      durumlar: [
        { k: 'onay-bekliyor', ad: 'Onay Bekliyor', ton: 'warn', ikon: 'fa-hourglass-half' },
        { k: 'kismen',        ad: 'Kısmen',        ton: 'warn', ikon: 'fa-circle-half-stroke' },
        { k: 'tamamlandi',    ad: 'Tamamlandı',    ton: 'ok',   ikon: 'fa-circle-check' },
        { k: 'geri-alindi',   ad: 'Geri Alındı',   ton: 'off',  ikon: 'fa-rotate-left' }
      ],
      gecis: {
        'onay-bekliyor': ['tamamlandi', 'kismen', 'geri-alindi'],
        'kismen':        ['tamamlandi', 'geri-alindi'],
        'tamamlandi':    ['geri-alindi'],
        'geri-alindi':   []
      },
      izin: { 'geri-alindi': YONETIM.concat(['sistem']) },
      etiket: { 'geri-alindi': 'Aktarımı geri al', 'tamamlandi': 'Tamamlandı işaretle' }
    }
  };

  /* ---------------------------------------------------------------
     Sorgulama
     --------------------------------------------------------------- */
  GV.akisListesi = function () { return Object.keys(AKISLAR); };
  GV.akis = function (ad) { return AKISLAR[ad] || null; };

  /** Akışın durum sözlüğü — rozet için {k, ad, ton, ikon}. */
  GV.akisDurumlari = function (ad) {
    var a = AKISLAR[ad];
    if (!a) return [];
    if (a.durumlar) return a.durumlar;
    var A = api();
    return (A && a.sozluk) ? A.durumListesi(a.sozluk) : [];
  };

  GV.akisDurum = function (ad, k) {
    var l = GV.akisDurumlari(ad);
    for (var i = 0; i < l.length; i++) if (l[i].k === k) return l[i];
    return { k: k, ad: k || '—', ton: 'off', ikon: 'fa-circle' };
  };

  function alanDolu(kayit, ctx, alan) {
    var v = (ctx && ctx.veri && ctx.veri[alan] !== undefined) ? ctx.veri[alan] : (kayit ? kayit[alan] : undefined);
    if (v == null || v === '') return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  }

  function rolAdi(rol) {
    var A = api();
    if (!A) return rol;
    var r = A.liste('roller').filter(function (x) { return x.id === rol; })[0];
    return r ? r.ad : rol;
  }

  /**
   * Bir geçişin uygun olup olmadığını söyler. Yan etkisi YOKTUR.
   * @param {string} akisAd
   * @param {Object} kayit    mevcut kayıt
   * @param {string} hedef    hedef durum anahtarı
   * @param {{rol?:string, veri?:Object, alan?:string}} [ctx]
   * @returns {{uygun:boolean, sebep?:string, kod?:string, uyari?:string}}
   */
  GV.gecisDene = function (akisAd, kayit, hedef, ctx) {
    ctx = ctx || {};
    var a = AKISLAR[akisAd];
    if (!a) return { uygun: false, kod: 'akis-yok', sebep: 'Tanımsız durum akışı: ' + akisAd };

    var alan = ctx.alan || a.alan;
    var mevcut = kayit ? kayit[alan] : null;

    /* hedef bu akışın durumu mu */
    var bilinen = GV.akisDurumlari(akisAd).map(function (d) { return d.k; });
    var tanimli = Object.keys(a.gecis);
    if (bilinen.indexOf(hedef) === -1 && tanimli.indexOf(hedef) === -1) {
      return { uygun: false, kod: 'bilinmeyen-durum', sebep: '"' + hedef + '" bu akışta tanımlı bir durum değil.' };
    }

    if (mevcut === hedef) {
      return { uygun: false, kod: 'ayni', sebep: 'Kayıt zaten bu durumda.' };
    }

    /* önceki durum koşulu */
    var izinliler = a.gecis[mevcut];
    if (!izinliler) {
      return { uygun: false, kod: 'bilinmeyen-mevcut',
               sebep: 'Kaydın mevcut durumu (' + (mevcut || '—') + ') bu akışta tanımlı değil.' };
    }
    if (izinliler.indexOf(hedef) === -1) {
      return { uygun: false, kod: 'onceki-durum',
               sebep: GV.akisDurum(akisAd, mevcut).ad + ' durumundan '
                    + GV.akisDurum(akisAd, hedef).ad + ' durumuna doğrudan geçilemez.' };
    }

    /* izin */
    var rol = ctx.rol || GV.rol || 'sahip';
    var izinli = a.izin && a.izin[hedef];
    if (izinli && izinli.indexOf(rol) === -1) {
      return { uygun: false, kod: 'izin',
               sebep: rolAdi(rol) + ' rolü bu geçişi yapamaz (' + GV.akisDurum(akisAd, hedef).ad + ').' };
    }

    /* zorunlu alanlar — koleksiyona özel liste varsa o kazanır */
    var kol = ctx.koleksiyon || a.koleksiyon;
    var kolZorunlu = kol && a.zorunluKol && a.zorunluKol[kol];
    var zorunlu = (kolZorunlu && kolZorunlu[hedef]) || (a.zorunlu && a.zorunlu[hedef]) || [];
    var eksik = zorunlu.filter(function (x) { return !alanDolu(kayit, ctx, x); });
    if (eksik.length) {
      return { uygun: false, kod: 'zorunlu-alan',
               sebep: 'Zorunlu alan eksik: ' + eksik.join(', ') + '.', eksik: eksik };
    }

    /* iş kuralı ön koşulu — kural demoApi'de, burada yalnız çağrılır */
    var on = a.onKosul && a.onKosul[hedef];
    if (on) {
      var r = on(kayit, ctx) || { uygun: true };
      if (!r.uygun) return { uygun: false, kod: 'kural', sebep: r.sebep || 'İş kuralı bu geçişe izin vermiyor.' };
      if (r.uyari) return { uygun: true, uyari: r.uyari };
    }

    return { uygun: true };
  };

  /**
   * Kaydın bulunduğu durumdan gidilebilecek bütün hedefler — uygun
   * olmayanlar da SEBEBİYLE birlikte döner (buton gizlenmez, disabled
   * nedeni gösterilir).
   * @returns {Array<{k:string, ad:string, ton:string, ikon:string, etiket:string, uygun:boolean, sebep?:string, kod?:string}>}
   */
  GV.gecisHedefleri = function (akisAd, kayit, ctx) {
    var a = AKISLAR[akisAd];
    if (!a) return [];
    ctx = ctx || {};
    var alan = ctx.alan || a.alan;
    var mevcut = kayit ? kayit[alan] : null;
    var hedefler = a.gecis[mevcut] || [];
    return hedefler.map(function (h) {
      var d = GV.akisDurum(akisAd, h);
      var s = GV.gecisDene(akisAd, kayit, h, ctx);
      return {
        k: h, ad: d.ad, ton: d.ton, ikon: d.ikon,
        etiket: (a.etiket && a.etiket[h]) || d.ad,
        uygun: s.uygun, sebep: s.sebep, kod: s.kod, uyari: s.uyari
      };
    });
  };

  /**
   * Geçişi uygular. Tek yazma noktası: demoApi.durumDegistir.
   * ASLA reddetmez — `{ok:false, sebep}` ile döner ki çağıran kod
   * catch zinciri kurmak zorunda kalmasın.
   * @param {string} akisAd
   * @param {string} koleksiyon
   * @param {string} id
   * @param {string} hedef
   * @param {{not?:string, rol?:string, veri?:Object, alan?:string, sessiz?:boolean, ekYama?:Object}} [ctx]
   * @returns {Promise<{ok:boolean, sebep?:string, kod?:string, onceki?:string, yeni?:string}>}
   */
  GV.gecisUygula = function (akisAd, koleksiyon, id, hedef, ctx) {
    ctx = ctx || {};
    var A = api();
    var a = AKISLAR[akisAd];
    if (!A || !a) {
      return Promise.resolve({ ok: false, kod: 'akis-yok', sebep: 'Durum akışı tanımlı değil.' });
    }
    var kol = koleksiyon || a.koleksiyon;
    var alan = ctx.alan || a.alan;
    ctx = Object.assign({}, ctx, { koleksiyon: kol });
    var kayit = A.kayit(kol, id);
    if (!kayit) {
      return Promise.resolve({ ok: false, kod: 'kayit-yok', sebep: 'Kayıt bulunamadı.' });
    }

    /* Geçişle BİRLİKTE yazılan alanlar (onaylayanId, kapanis, teslimTarihi…)
       zorunlu alan kontrolünde de sayılır — ayrıca ctx.veri yazmaya gerek yok. */
    if (!ctx.veri && ctx.ekYama) ctx = Object.assign({}, ctx, { veri: ctx.ekYama });

    var s = GV.gecisDene(akisAd, kayit, hedef, ctx);
    if (!s.uygun) {
      if (!ctx.sessiz && kok.gvToast) kok.gvToast(s.sebep, { ton: 'danger' });
      return Promise.resolve({ ok: false, kod: s.kod, sebep: s.sebep });
    }

    var not = ctx.not || (a.etiket && a.etiket[hedef]) || null;
    return A.durumDegistir(kol, id, alan, hedef, not).then(function (r) {
      /* Geçişe bağlı ek alanlar (onaylayanId, kapanis, teslimTarihi…)
         AYNI komutun parçasıdır; ayrı bir "durum yazımı" değildir. */
      if (ctx.ekYama && Object.keys(ctx.ekYama).length) {
        return A.guncelle(kol, id, ctx.ekYama).then(function () { return r; });
      }
      return r;
    }).then(function (r) {
      return { ok: true, onceki: r.onceki, yeni: r.yeni, uyari: s.uyari, istekId: r.istekId };
    });
  };

  /**
   * Toplu geçiş — her kayıt TEK TEK denenir. Kural nedeniyle geçemeyenler
   * sessizce yutulmaz; sebebiyle birlikte döner.
   * @returns {Promise<{toplam:number, basarili:number, engel:Array<{id:string, sebep:string, kod:string}>}>}
   */
  GV.gecisTopluUygula = function (akisAd, koleksiyon, idler, hedef, ctx) {
    var c = Object.assign({ sessiz: true }, ctx || {});
    return Promise.all((idler || []).map(function (id) {
      return GV.gecisUygula(akisAd, koleksiyon, id, hedef, c).then(function (g) {
        return { id: id, ok: g.ok, sebep: g.sebep, kod: g.kod };
      });
    })).then(function (l) {
      return {
        toplam: l.length,
        basarili: l.filter(function (x) { return x.ok; }).length,
        engel: l.filter(function (x) { return !x.ok; })
      };
    });
  };

  /**
   * Toplu geçiş sonucunu tek bildirimde toplar. Hiçbiri geçmediyse sonuç
   * modalı, kısmi geçtiyse uyarı tonlu toast basar.
   * @returns {boolean} en az bir kayıt geçtiyse true
   */
  GV.gecisTopluBildir = function (r, secenek) {
    secenek = secenek || {};
    if (!r.basarili) {
      var sebep = r.engel.length ? r.engel[0].sebep : 'Geçiş kuralları izin vermedi.';
      if (kok.gvResult) {
        kok.gvResult(false, {
          baslik: secenek.basarisizBaslik || 'İşlem yapılamadı',
          metin: esc(sebep) + (r.engel.length > 1 ? ' (' + r.engel.length + ' kayıt engellendi.)' : '')
        });
      } else if (kok.gvToast) { kok.gvToast(sebep, { ton: 'danger' }); }
      return false;
    }
    var m = secenek.metin ? secenek.metin(r.basarili) : (r.basarili + ' kayıt güncellendi.');
    if (r.engel.length) {
      m += ' ' + r.engel.length + ' kayıt atlandı: ' + r.engel[0].sebep;
    }
    if (kok.gvToast) kok.gvToast(m, { ton: r.engel.length ? 'warn' : 'ok' });
    return true;
  };

  /**
   * Butonu geçişin uygunluğuna göre ayarlar. Doküman §8: "Geçiş olmayan
   * buton gizlenmekle yetinmez; disabled nedeni açıklanır."
   * Sebep hem `title`/`aria-describedby` ile hem de (varsa) `sebepKabi`
   * içinde görünür metin olarak yazılır.
   */
  GV.gecisButonu = function (btn, sonuc, sebepKabi) {
    if (!btn) return;
    var uygun = !!(sonuc && sonuc.uygun);
    btn.disabled = !uygun;
    btn.setAttribute('aria-disabled', uygun ? 'false' : 'true');
    if (uygun) {
      btn.removeAttribute('title');
      btn.removeAttribute('aria-describedby');
      if (sebepKabi) { sebepKabi.innerHTML = ''; sebepKabi.hidden = true; }
      return;
    }
    var metin = (sonuc && sonuc.sebep) || 'Bu geçiş şu anda yapılamaz.';
    btn.title = metin;
    if (sebepKabi) {
      var kimlik = sebepKabi.id || ('gvSebep-' + (GV.yeniKod ? GV.yeniKod('S') : 'S'));
      sebepKabi.id = kimlik;
      sebepKabi.hidden = false;
      sebepKabi.className = 'gv-note danger';
      sebepKabi.innerHTML = '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i><span>'
        + esc(metin) + '</span>';
      btn.setAttribute('aria-describedby', kimlik);
    }
  };

  /* Node tarafında birim test edilebilmesi için (tarayıcıda etkisiz). */
  if (typeof module !== 'undefined' && module.exports) module.exports = GV;
})();
