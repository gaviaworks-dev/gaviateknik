/* =====================================================================
   GAVIA — DEMO VERİ KAYNAĞI
   Saf veridir; iş kuralı içermez (kurallar demo-api.js ve sayfalarda).
   Sayfalar bu nesneye DOĞRUDAN erişmez — yalnız demoApi üzerinden okur.
   Bütün kayıtlar tamamen kurgusaldır: gerçek firma, kişi, telefon veya
   e-posta bilgisi içermez. Bağlam tarihi: 17 Ağustos 2026, Pazartesi.
   ===================================================================== */
window.DEMO = (function () {
  'use strict';

  var BUGUN = '2026-08-17';

  /* ---------------------------------------------------------------
     FİRMA
     --------------------------------------------------------------- */
  var firma = {
    unvan: 'GAVIA Teknik Muayene ve Belgelendirme A.Ş.',
    kisaAd: 'GAVIA Teknik',
    urun: 'GAVIA — Periyodik Kontrol Yönetimi',
    akredite: 'TS EN ISO/IEC 17020 — A Tipi Muayene Kuruluşu (demo)',
    adres: 'Teknopark Bulvarı No: 12/4, Ataşehir / İstanbul (kurgusal)',
    telefon: '0 (850) 000 00 00 (kurgusal)',
    eposta: 'demo@ornek.test',
    web: 'ornek.test'
  };

  /* ---------------------------------------------------------------
     ROLLER — 13 kullanıcı rolü (dokümandaki sırayla)
     --------------------------------------------------------------- */
  var roller = [
    { id: 'sahip',     ad: 'Firma Sahibi',              personelId: 'PRS-001', ikon: 'fa-crown',            aciklama: 'Bütün modüllere ve finansal göstergelere tam erişim.' },
    { id: 'gm',        ad: 'Genel Müdür',               personelId: 'PRS-002', ikon: 'fa-user-tie',         aciklama: 'Operasyon, ticari ve kalite süreçlerinin tamamını yönetir.' },
    { id: 'operasyon', ad: 'Operasyon Yöneticisi',      personelId: 'PRS-003', ikon: 'fa-diagram-project',  aciklama: 'Planlama, iş emri, saha ve mutabakat süreçlerini yürütür.' },
    { id: 'teknik',    ad: 'Teknik Yönetici',           personelId: 'PRS-004', ikon: 'fa-clipboard-check',  aciklama: 'Teknik rapor inceleme, onay ve revizyon yetkisine sahiptir.' },
    { id: 'kalite',    ad: 'Kalite Yöneticisi',         personelId: 'PRS-005', ikon: 'fa-award',            aciklama: 'Kalite dokümanları, denetim ve düzeltici faaliyetleri yönetir.' },
    { id: 'planlama',  ad: 'Planlama Sorumlusu',        personelId: 'PRS-006', ikon: 'fa-calendar-days',    aciklama: 'Lokasyon takvimi, ekip ve cihaz atamalarını yapar.' },
    { id: 'uzman',     ad: 'Periyodik Kontrol Uzmanı',  personelId: 'PRS-007', ikon: 'fa-user-gear',        aciklama: 'Saha kontrolü yapar, teknik raporu hazırlar.' },
    { id: 'saha',      ad: 'Saha Personeli',            personelId: 'PRS-010', ikon: 'fa-helmet-safety',    aciklama: 'Mobil saha kontrol formunu doldurur, ölçüm ve fotoğraf kaydeder.' },
    { id: 'satis',     ad: 'Satış Personeli',           personelId: 'PRS-013', ikon: 'fa-handshake',        aciklama: 'Müşteri, teklif ve sözleşme süreçlerini yürütür.' },
    { id: 'finans',    ad: 'Finans ve Muhasebe',        personelId: 'PRS-012', ikon: 'fa-file-invoice-dollar', aciklama: 'Hakediş, fatura, tahsilat ve taşeron ödemelerini takip eder.' },
    { id: 'taseron',   ad: 'Taşeron Yetkilisi',         personelId: null,      ikon: 'fa-people-carry-box', aciklama: 'Yalnız kendi iş emirleri, raporları ve hakedişlerini görür.', taseronId: 'TSR-001' },
    { id: 'musteri',   ad: 'Müşteri Yetkilisi',         personelId: null,      ikon: 'fa-building-user',    aciklama: 'Müşteri portalı üzerinden kendi lokasyon ve raporlarına erişir.', musteriId: 'MST-001' },
    { id: 'sistem',    ad: 'Sistem Yöneticisi',         personelId: 'PRS-014', ikon: 'fa-shield-halved',    aciklama: 'Kullanıcı, rol, veri aktarımı ve işlem kayıtlarını yönetir.' }
  ];

  /* ---------------------------------------------------------------
     PERSONEL — 14 kayıt (doküman asgarisi 12)
     --------------------------------------------------------------- */
  var personeller = [
    { id: 'PRS-001', ad: 'Kemal Yağmur',      gorev: 'Firma Sahibi',             birim: 'Yönetim',    ini: 'KY', durum: 'aktif',  ise: '2014-02-03', yetkinlikler: [], isYuku: 0,  telefon: '0 (5XX) 000 00 01', eposta: 'kemal.yagmur@ornek.test' },
    { id: 'PRS-002', ad: 'Nuray Beyazıt',     gorev: 'Genel Müdür',              birim: 'Yönetim',    ini: 'NB', durum: 'aktif',  ise: '2016-06-13', yetkinlikler: [], isYuku: 0,  telefon: '0 (5XX) 000 00 02', eposta: 'nuray.beyazit@ornek.test' },
    { id: 'PRS-003', ad: 'Serkan Doğanay',    gorev: 'Operasyon Yöneticisi',     birim: 'Operasyon',  ini: 'SD', durum: 'aktif',  ise: '2018-09-10', yetkinlikler: ['YTK-01'], isYuku: 4, telefon: '0 (5XX) 000 00 03', eposta: 'serkan.doganay@ornek.test' },
    { id: 'PRS-004', ad: 'Elif Karaçay',      gorev: 'Teknik Yönetici',          birim: 'Teknik',     ini: 'EK', durum: 'aktif',  ise: '2017-03-20', yetkinlikler: ['YTK-01', 'YTK-02', 'YTK-03', 'YTK-04'], isYuku: 6, telefon: '0 (5XX) 000 00 04', eposta: 'elif.karacay@ornek.test' },
    { id: 'PRS-005', ad: 'Bora Yıldırgan',    gorev: 'Kalite Yöneticisi',        birim: 'Kalite',     ini: 'BY', durum: 'aktif',  ise: '2019-01-07', yetkinlikler: ['YTK-08'], isYuku: 2, telefon: '0 (5XX) 000 00 05', eposta: 'bora.yildirgan@ornek.test' },
    { id: 'PRS-006', ad: 'Pelin Üstündağ',    gorev: 'Planlama Sorumlusu',       birim: 'Operasyon',  ini: 'PÜ', durum: 'aktif',  ise: '2020-05-18', yetkinlikler: [], isYuku: 3, telefon: '0 (5XX) 000 00 06', eposta: 'pelin.ustundag@ornek.test' },
    { id: 'PRS-007', ad: 'Cem Aksular',       gorev: 'Periyodik Kontrol Uzmanı', birim: 'Teknik',     ini: 'CA', durum: 'aktif',  ise: '2019-11-04', yetkinlikler: ['YTK-01', 'YTK-06'], isYuku: 9, telefon: '0 (5XX) 000 00 07', eposta: 'cem.aksular@ornek.test' },
    { id: 'PRS-008', ad: 'Deniz Erkut',       gorev: 'Periyodik Kontrol Uzmanı', birim: 'Teknik',     ini: 'DE', durum: 'aktif',  ise: '2021-02-15', yetkinlikler: ['YTK-02', 'YTK-05'], isYuku: 11, telefon: '0 (5XX) 000 00 08', eposta: 'deniz.erkut@ornek.test' },
    { id: 'PRS-009', ad: 'Tuna Şahinkaya',    gorev: 'Periyodik Kontrol Uzmanı', birim: 'Teknik',     ini: 'TŞ', durum: 'aktif',  ise: '2020-08-24', yetkinlikler: ['YTK-03', 'YTK-07'], isYuku: 7, telefon: '0 (5XX) 000 00 09', eposta: 'tuna.sahinkaya@ornek.test' },
    { id: 'PRS-010', ad: 'Melis Toprakçı',    gorev: 'Saha Personeli',           birim: 'Operasyon',  ini: 'MT', durum: 'aktif',  ise: '2022-04-11', yetkinlikler: ['YTK-06'], isYuku: 8, telefon: '0 (5XX) 000 00 10', eposta: 'melis.topakci@ornek.test' },
    { id: 'PRS-011', ad: 'Onur Bakırcı',      gorev: 'Saha Personeli',           birim: 'Operasyon',  ini: 'OB', durum: 'aktif',  ise: '2023-01-30', yetkinlikler: ['YTK-06'], isYuku: 6, telefon: '0 (5XX) 000 00 11', eposta: 'onur.bakirci@ornek.test' },
    { id: 'PRS-012', ad: 'Sinem Alagöz',      gorev: 'Finans ve Muhasebe',       birim: 'Finans',     ini: 'SA', durum: 'aktif',  ise: '2018-12-03', yetkinlikler: [], isYuku: 0, telefon: '0 (5XX) 000 00 12', eposta: 'sinem.alagoz@ornek.test' },
    { id: 'PRS-013', ad: 'Hakan Süzer',       gorev: 'Satış Personeli',          birim: 'Satış',      ini: 'HS', durum: 'aktif',  ise: '2021-07-19', yetkinlikler: [], isYuku: 0, telefon: '0 (5XX) 000 00 13', eposta: 'hakan.suzer@ornek.test' },
    { id: 'PRS-014', ad: 'Aysel Denizhan',    gorev: 'Sistem Yöneticisi',        birim: 'Bilgi Sistemleri', ini: 'AD', durum: 'aktif', ise: '2022-10-05', yetkinlikler: [], isYuku: 0, telefon: '0 (5XX) 000 00 14', eposta: 'aysel.denizhan@ornek.test' },
    { id: 'PRS-015', ad: 'Kerem Ovacık',      gorev: 'Periyodik Kontrol Uzmanı', birim: 'Teknik',     ini: 'KO', durum: 'izinli', ise: '2023-06-01', yetkinlikler: ['YTK-04'], isYuku: 0, telefon: '0 (5XX) 000 00 15', eposta: 'kerem.ovacik@ornek.test', izinBitis: '2026-08-28' }
  ];

  /* ---------------------------------------------------------------
     YETKİNLİKLER — personel–hizmet kategorisi yetki eşlemesi
     --------------------------------------------------------------- */
  var yetkinlikler = [
    { id: 'YTK-01', ad: 'Kaldırma ve İletme Ekipmanları Muayenesi',  kategori: 'KAT-01', belgeTuru: 'Muayene Personeli Sertifikası', gecerlilikAy: 36 },
    { id: 'YTK-02', ad: 'Elektrik Tesisatı ve Topraklama Ölçümü',    kategori: 'KAT-04', belgeTuru: 'Elektrik Muayene Yetki Belgesi', gecerlilikAy: 24 },
    { id: 'YTK-03', ad: 'Basınçlı Kap ve Tesisat Muayenesi',         kategori: 'KAT-03', belgeTuru: 'Basınçlı Ekipman Muayene Sertifikası', gecerlilikAy: 36 },
    { id: 'YTK-04', ad: 'Makine ve Üretim Ekipmanları Muayenesi',    kategori: 'KAT-02', belgeTuru: 'Makine Muayene Sertifikası', gecerlilikAy: 36 },
    { id: 'YTK-05', ad: 'Yangın ve Mekanik Sistemler Kontrolü',      kategori: 'KAT-05', belgeTuru: 'Yangın Sistemleri Kontrol Belgesi', gecerlilikAy: 24 },
    { id: 'YTK-06', ad: 'Raf Sistemleri ve Acil Aydınlatma Kontrolü', kategori: 'KAT-06', belgeTuru: 'Raf Sistemleri Muayene Belgesi', gecerlilikAy: 24 },
    { id: 'YTK-07', ad: 'İş Hijyeni ve Ortam Ölçümleri',             kategori: 'KAT-07', belgeTuru: 'İş Hijyeni Ölçüm Uzmanı Belgesi', gecerlilikAy: 24 },
    { id: 'YTK-08', ad: 'Patlamadan Korunma Dokümanı Hazırlama',     kategori: 'KAT-08', belgeTuru: 'PKD Hazırlama Yetki Belgesi', gecerlilikAy: 36 }
  ];

  /* personel belge geçerlilikleri — süresi yaklaşan örnek dâhil */
  var personelBelgeleri = [
    { id: 'PBG-001', personelId: 'PRS-007', yetkinlikId: 'YTK-01', belgeNo: 'SRT-2024-1187', baslangic: '2024-03-12', bitis: '2027-03-12' },
    { id: 'PBG-002', personelId: 'PRS-007', yetkinlikId: 'YTK-06', belgeNo: 'SRT-2024-1421', baslangic: '2024-09-02', bitis: '2026-09-02' },
    { id: 'PBG-003', personelId: 'PRS-008', yetkinlikId: 'YTK-02', belgeNo: 'SRT-2025-0233', baslangic: '2025-01-20', bitis: '2027-01-20' },
    { id: 'PBG-004', personelId: 'PRS-008', yetkinlikId: 'YTK-05', belgeNo: 'SRT-2024-0918', baslangic: '2024-08-30', bitis: '2026-08-30' },
    { id: 'PBG-005', personelId: 'PRS-009', yetkinlikId: 'YTK-03', belgeNo: 'SRT-2023-0774', baslangic: '2023-11-15', bitis: '2026-11-15' },
    { id: 'PBG-006', personelId: 'PRS-009', yetkinlikId: 'YTK-07', belgeNo: 'SRT-2025-0512', baslangic: '2025-04-08', bitis: '2027-04-08' },
    { id: 'PBG-007', personelId: 'PRS-010', yetkinlikId: 'YTK-06', belgeNo: 'SRT-2024-1650', baslangic: '2024-10-14', bitis: '2026-10-14' },
    { id: 'PBG-008', personelId: 'PRS-011', yetkinlikId: 'YTK-06', belgeNo: 'SRT-2025-0801', baslangic: '2025-06-05', bitis: '2027-06-05' },
    { id: 'PBG-009', personelId: 'PRS-004', yetkinlikId: 'YTK-01', belgeNo: 'SRT-2023-0091', baslangic: '2023-02-01', bitis: '2026-08-24' },
    { id: 'PBG-010', personelId: 'PRS-004', yetkinlikId: 'YTK-02', belgeNo: 'SRT-2024-0455', baslangic: '2024-05-19', bitis: '2026-05-19' },
    { id: 'PBG-011', personelId: 'PRS-004', yetkinlikId: 'YTK-03', belgeNo: 'SRT-2024-0456', baslangic: '2024-05-19', bitis: '2027-05-19' },
    { id: 'PBG-012', personelId: 'PRS-004', yetkinlikId: 'YTK-04', belgeNo: 'SRT-2025-0110', baslangic: '2025-02-11', bitis: '2028-02-11' },
    { id: 'PBG-013', personelId: 'PRS-005', yetkinlikId: 'YTK-08', belgeNo: 'SRT-2024-1302', baslangic: '2024-07-22', bitis: '2027-07-22' },
    { id: 'PBG-014', personelId: 'PRS-003', yetkinlikId: 'YTK-01', belgeNo: 'SRT-2025-0640', baslangic: '2025-05-06', bitis: '2028-05-06' },
    { id: 'PBG-015', personelId: 'PRS-015', yetkinlikId: 'YTK-04', belgeNo: 'SRT-2025-0977', baslangic: '2025-08-18', bitis: '2028-08-18' }
  ];

  /* ---------------------------------------------------------------
     MÜŞTERİLER (3 kurumsal) ve MARKALAR (4)
     --------------------------------------------------------------- */
  var musteriler = [
    {
      id: 'MST-001', kod: 'MST-001', unvan: 'Beyaz Zambak Perakende A.Ş.', kisaAd: 'Beyaz Zambak',
      sektor: 'Perakende — zincir market', vergiDairesi: 'Ataşehir (kurgusal)', vergiNo: '0000000001',
      adres: 'Örnek Mahallesi, Deneme Caddesi No: 1, Ataşehir / İstanbul (kurgusal)',
      telefon: '0 (216) 000 00 01', eposta: 'kurumsal@zambak.test', web: 'zambak.test',
      musteriTemsilcisi: 'PRS-013', durum: 'aktif', kayitTarihi: '2022-11-08',
      odemeVadesi: 45, cariBakiye: 223800, cariDurum: 'vadesi-gecmis-var', segment: 'Anahtar Müşteri'
    },
    {
      id: 'MST-002', kod: 'MST-002', unvan: 'Anadolu Lojistik Depoculuk A.Ş.', kisaAd: 'Anadolu Lojistik',
      sektor: 'Lojistik — depo ve antrepo işletmeciliği', vergiDairesi: 'Gebze (kurgusal)', vergiNo: '0000000002',
      adres: 'Sanayi Bölgesi 4. Cadde No: 22, Gebze / Kocaeli (kurgusal)',
      telefon: '0 (262) 000 00 02', eposta: 'satinalma@anadolulojistik.test', web: 'anadolulojistik.test',
      musteriTemsilcisi: 'PRS-013', durum: 'aktif', kayitTarihi: '2023-05-16',
      odemeVadesi: 60, cariBakiye: 221049, cariDurum: 'temiz', segment: 'Kurumsal'
    },
    {
      id: 'MST-003', kod: 'MST-003', unvan: 'Efe Gıda Üretim ve Sanayi A.Ş.', kisaAd: 'Efe Gıda',
      sektor: 'Gıda üretimi — fabrika', vergiDairesi: 'Turgutlu (kurgusal)', vergiNo: '0000000003',
      adres: 'Organize Sanayi Bölgesi 7. Sokak No: 5, Turgutlu / Manisa (kurgusal)',
      telefon: '0 (236) 000 00 03', eposta: 'teknik@efegida.test', web: 'efegida.test',
      musteriTemsilcisi: 'PRS-013', durum: 'aktif', kayitTarihi: '2024-02-27',
      odemeVadesi: 30, cariBakiye: 115680, cariDurum: 'bekleyen-var', segment: 'Kurumsal'
    },
    {
      id: 'MST-004', kod: 'MST-004', unvan: 'Kuzey Yıldızı Akaryakıt Dağıtım Ltd. Şti.', kisaAd: 'Kuzey Yıldızı',
      sektor: 'Akaryakıt istasyon zinciri', vergiDairesi: 'Atakum (kurgusal)', vergiNo: '0000000004',
      adres: 'Sahil Yolu No: 140, Atakum / Samsun (kurgusal)',
      telefon: '0 (362) 000 00 04', eposta: 'info@kuzeyyildizi.test', web: 'kuzeyyildizi.test',
      musteriTemsilcisi: 'PRS-013', durum: 'aday', kayitTarihi: '2026-07-30',
      odemeVadesi: 30, cariBakiye: 0, cariDurum: 'temiz', segment: 'Aday Müşteri'
    }
  ];

  var markalar = [
    { id: 'MRK-A', musteriId: 'MST-001', ad: 'Zambak Market',   tur: 'Zincir market',            lokasyonSayisi: 12, renk: '#3B6FD4' },
    { id: 'MRK-B', musteriId: 'MST-001', ad: 'Zambak Ekspres',  tur: 'Küçük format market',      lokasyonSayisi: 2,  renk: '#0E8C6D' },
    { id: 'MRK-C', musteriId: 'MST-002', ad: 'AnadoluDepo',     tur: 'Depo ve antrepo',          lokasyonSayisi: 6,  renk: '#A97908' },
    { id: 'MRK-D', musteriId: 'MST-003', ad: 'Efe Gıda',        tur: 'Üretim tesisi ve depo',    lokasyonSayisi: 4,  renk: '#D14343' }
  ];

  /* ---------------------------------------------------------------
     İLETİŞİM KİŞİLERİ — lokasyon başına birden fazla rol
     --------------------------------------------------------------- */
  var iletisimRolleri = [
    'Bölge Yöneticisi', 'Lojistik Müdürü', 'Teknik Yetkili',
    'Lokasyon Müdürü', 'Finans Yetkilisi', 'Rapor Teslim Yetkilisi'
  ];

  var iletisimKisileri = [
    { id: 'KSI-001', musteriId: 'MST-001', lokasyonId: null,       ad: 'Rüya Cansever',   unvan: 'Teknik İşler Direktörü', iletisimRolu: 'Teknik Yetkili',        telefon: '0 (216) 000 01 01', eposta: 'ruya.cansever@zambak.test',  birincil: true },
    { id: 'KSI-002', musteriId: 'MST-001', lokasyonId: null,       ad: 'Tarık Belen',     unvan: 'Satın Alma Müdürü',      iletisimRolu: 'Finans Yetkilisi',      telefon: '0 (216) 000 01 02', eposta: 'tarik.belen@zambak.test',    birincil: false },
    { id: 'KSI-003', musteriId: 'MST-001', lokasyonId: null,       ad: 'Neval Aksüt',     unvan: 'Marmara Bölge Yöneticisi', iletisimRolu: 'Bölge Yöneticisi',    telefon: '0 (216) 000 01 03', eposta: 'neval.aksut@zambak.test',    birincil: false },
    { id: 'KSI-004', musteriId: 'MST-001', lokasyonId: null,       ad: 'İlker Sunay',     unvan: 'Ege Bölge Yöneticisi',    iletisimRolu: 'Bölge Yöneticisi',      telefon: '0 (232) 000 01 04', eposta: 'ilker.sunay@zambak.test',    birincil: false },
    { id: 'KSI-005', musteriId: 'MST-001', lokasyonId: 'LOK-0101', ad: 'Gülsen Ardıç',    unvan: 'Şube Müdürü',            iletisimRolu: 'Lokasyon Müdürü',       telefon: '0 (216) 000 01 05', eposta: 'gulsen.ardic@zambak.test',   birincil: true },
    { id: 'KSI-006', musteriId: 'MST-001', lokasyonId: 'LOK-0102', ad: 'Fikret Umay',     unvan: 'Şube Müdürü',            iletisimRolu: 'Lokasyon Müdürü',       telefon: '0 (216) 000 01 06', eposta: 'fikret.umay@zambak.test',    birincil: true },
    { id: 'KSI-007', musteriId: 'MST-001', lokasyonId: 'LOK-0103', ad: 'Sevil Kayacan',   unvan: 'Şube Müdürü',            iletisimRolu: 'Lokasyon Müdürü',       telefon: '0 (232) 000 01 07', eposta: 'sevil.kayacan@zambak.test',  birincil: true },
    { id: 'KSI-008', musteriId: 'MST-001', lokasyonId: 'LOK-0112', ad: 'Barış Tuncel',    unvan: 'Depo Operasyon Şefi',    iletisimRolu: 'Lojistik Müdürü',       telefon: '0 (262) 000 01 08', eposta: 'baris.tuncel@zambak.test',   birincil: true },
    { id: 'KSI-009', musteriId: 'MST-001', lokasyonId: null,       ad: 'Şule Ergene',     unvan: 'Kalite ve Uyum Uzmanı',  iletisimRolu: 'Rapor Teslim Yetkilisi', telefon: '0 (216) 000 01 09', eposta: 'sule.ergene@zambak.test',   birincil: false },
    { id: 'KSI-010', musteriId: 'MST-002', lokasyonId: null,       ad: 'Volkan Işıklı',   unvan: 'Teknik Müdür',           iletisimRolu: 'Teknik Yetkili',        telefon: '0 (262) 000 02 01', eposta: 'volkan.isikli@anadolulojistik.test', birincil: true },
    { id: 'KSI-011', musteriId: 'MST-002', lokasyonId: null,       ad: 'Derya Uçarsu',    unvan: 'Mali İşler Sorumlusu',   iletisimRolu: 'Finans Yetkilisi',      telefon: '0 (262) 000 02 02', eposta: 'derya.ucarsu@anadolulojistik.test', birincil: false },
    { id: 'KSI-012', musteriId: 'MST-002', lokasyonId: 'LOK-0201', ad: 'Emrah Söylemez',  unvan: 'Antrepo Müdürü',         iletisimRolu: 'Lokasyon Müdürü',       telefon: '0 (262) 000 02 03', eposta: 'emrah.soylemez@anadolulojistik.test', birincil: true },
    { id: 'KSI-013', musteriId: 'MST-002', lokasyonId: 'LOK-0202', ad: 'Nazlı Görkem',    unvan: 'Dağıtım Merkezi Müdürü', iletisimRolu: 'Lojistik Müdürü',       telefon: '0 (212) 000 02 04', eposta: 'nazli.gorkem@anadolulojistik.test', birincil: true },
    { id: 'KSI-014', musteriId: 'MST-002', lokasyonId: 'LOK-0205', ad: 'Ozan Kırımlı',    unvan: 'Liman Operasyon Şefi',   iletisimRolu: 'Lokasyon Müdürü',       telefon: '0 (324) 000 02 05', eposta: 'ozan.kirimli@anadolulojistik.test', birincil: true },
    { id: 'KSI-015', musteriId: 'MST-003', lokasyonId: null,       ad: 'Handan Erbatur',  unvan: 'Fabrika Teknik Müdürü',  iletisimRolu: 'Teknik Yetkili',        telefon: '0 (236) 000 03 01', eposta: 'handan.erbatur@efegida.test', birincil: true },
    { id: 'KSI-016', musteriId: 'MST-003', lokasyonId: null,       ad: 'Yiğit Somuncu',   unvan: 'İSG Uzmanı',             iletisimRolu: 'Rapor Teslim Yetkilisi', telefon: '0 (236) 000 03 02', eposta: 'yigit.somuncu@efegida.test', birincil: false },
    { id: 'KSI-017', musteriId: 'MST-003', lokasyonId: 'LOK-0301', ad: 'Berna Uluçay',    unvan: 'Üretim Müdürü',          iletisimRolu: 'Lokasyon Müdürü',       telefon: '0 (236) 000 03 03', eposta: 'berna.ulucay@efegida.test',  birincil: true },
    { id: 'KSI-018', musteriId: 'MST-003', lokasyonId: 'LOK-0302', ad: 'Uğur Pekmez',     unvan: 'Tesis Sorumlusu',        iletisimRolu: 'Lokasyon Müdürü',       telefon: '0 (266) 000 03 04', eposta: 'ugur.pekmez@efegida.test',   birincil: true },
    { id: 'KSI-019', musteriId: 'MST-003', lokasyonId: null,       ad: 'Cansu Aydemir',   unvan: 'Muhasebe Şefi',          iletisimRolu: 'Finans Yetkilisi',      telefon: '0 (236) 000 03 05', eposta: 'cansu.aydemir@efegida.test', birincil: false },
    { id: 'KSI-020', musteriId: 'MST-004', lokasyonId: null,       ad: 'Metin Çorlulu',   unvan: 'Operasyon Direktörü',    iletisimRolu: 'Teknik Yetkili',        telefon: '0 (362) 000 04 01', eposta: 'metin.corlulu@kuzeyyildizi.test', birincil: true }
  ];

  /* ---------------------------------------------------------------
     HİZMET KATALOĞU — 10 kategori, 52 pozisyon
     Aynı isimli farklı teknik içerikli hizmetler ayrı pozisyon kodu alır
     (örn. HZM-KLD-001-D dizel / HZM-KLD-001-A akülü forklift).
     --------------------------------------------------------------- */
  var hizmetKategorileri = [
    { id: 'KAT-01', ad: 'Kaldırma ve İletme Ekipmanları', ikon: 'fa-truck-ramp-box', renk: '#3B6FD4' },
    { id: 'KAT-02', ad: 'Makine ve Üretim Ekipmanları',   ikon: 'fa-gears',          renk: '#0E8C6D' },
    { id: 'KAT-03', ad: 'Basınçlı Kap ve Tesisatlar',     ikon: 'fa-gauge-high',     renk: '#A97908' },
    { id: 'KAT-04', ad: 'Elektrik ve Enerji Sistemleri',  ikon: 'fa-bolt',           renk: '#D14343' },
    { id: 'KAT-05', ad: 'Yangın ve Mekanik Sistemler',    ikon: 'fa-fire-extinguisher', renk: '#C2410C' },
    { id: 'KAT-06', ad: 'Raf Sistemleri',                 ikon: 'fa-pallet',         renk: '#6D28D9' },
    { id: 'KAT-07', ad: 'İş Hijyeni ve Ortam Ölçümleri',  ikon: 'fa-wind',           renk: '#0891B2' },
    { id: 'KAT-08', ad: 'Patlamadan Korunma Dokümanları', ikon: 'fa-file-shield',    renk: '#7C2D12' },
    { id: 'KAT-09', ad: 'Acil Aydınlatma Sistemleri',     ikon: 'fa-lightbulb',      renk: '#B45309' },
    { id: 'KAT-10', ad: 'Diğer Teknik Hizmetler',         ikon: 'fa-screwdriver-wrench', renk: '#475569' }
  ];

  /* birim: adet · lokasyon · sistem · metrekare · gün · olcum-seti · dokuman */
  var hizmetler = [
    { id: 'HZM-KLD-001-D', poz: 'PZ.01.01', ad: 'Forklift Periyodik Kontrolü (Dizel)',        kat: 'KAT-01', birim: 'adet',     periyotAy: 12, formId: 'FRM-KLD-01', sablonId: 'SBL-KLD-01', yetkinlik: 'YTK-01', sure: 40,  durum: 'aktif' },
    { id: 'HZM-KLD-001-A', poz: 'PZ.01.02', ad: 'Forklift Periyodik Kontrolü (Akülü)',        kat: 'KAT-01', birim: 'adet',     periyotAy: 12, formId: 'FRM-KLD-01', sablonId: 'SBL-KLD-01', yetkinlik: 'YTK-01', sure: 35,  durum: 'aktif' },
    { id: 'HZM-KLD-002',   poz: 'PZ.01.03', ad: 'Akülü Transpalet Periyodik Kontrolü',        kat: 'KAT-01', birim: 'adet',     periyotAy: 12, formId: 'FRM-KLD-02', sablonId: 'SBL-KLD-01', yetkinlik: 'YTK-01', sure: 25,  durum: 'aktif' },
    { id: 'HZM-KLD-003',   poz: 'PZ.01.04', ad: 'Manuel Transpalet Periyodik Kontrolü',       kat: 'KAT-01', birim: 'adet',     periyotAy: 12, formId: 'FRM-KLD-02', sablonId: 'SBL-KLD-01', yetkinlik: 'YTK-01', sure: 15,  durum: 'aktif' },
    { id: 'HZM-KLD-004',   poz: 'PZ.01.05', ad: 'Caraskal / Zincirli Vinç Kontrolü',          kat: 'KAT-01', birim: 'adet',     periyotAy: 12, formId: 'FRM-KLD-03', sablonId: 'SBL-KLD-01', yetkinlik: 'YTK-01', sure: 30,  durum: 'aktif' },
    { id: 'HZM-KLD-005',   poz: 'PZ.01.06', ad: 'Yük Asansörü Periyodik Kontrolü',            kat: 'KAT-01', birim: 'adet',     periyotAy: 12, formId: 'FRM-KLD-04', sablonId: 'SBL-KLD-02', yetkinlik: 'YTK-01', sure: 60,  durum: 'aktif' },
    { id: 'HZM-KLD-006',   poz: 'PZ.01.07', ad: 'Hidrolik Yükleme Rampası Kontrolü',          kat: 'KAT-01', birim: 'adet',     periyotAy: 12, formId: 'FRM-KLD-05', sablonId: 'SBL-KLD-01', yetkinlik: 'YTK-01', sure: 30,  durum: 'aktif' },
    { id: 'HZM-KLD-007',   poz: 'PZ.01.08', ad: 'Personel Asansörü Periyodik Kontrolü',       kat: 'KAT-01', birim: 'adet',     periyotAy: 12, formId: 'FRM-KLD-04', sablonId: 'SBL-KLD-02', yetkinlik: 'YTK-01', sure: 75,  durum: 'aktif' },
    { id: 'HZM-KLD-008',   poz: 'PZ.01.09', ad: 'Sepetli Çalışma Platformu Kontrolü',         kat: 'KAT-01', birim: 'adet',     periyotAy: 12, formId: 'FRM-KLD-03', sablonId: 'SBL-KLD-01', yetkinlik: 'YTK-01', sure: 45,  durum: 'aktif' },
    { id: 'HZM-KLD-009',   poz: 'PZ.01.10', ad: 'Kule Vinç Periyodik Kontrolü',               kat: 'KAT-01', birim: 'adet',     periyotAy: 12, formId: 'FRM-KLD-03', sablonId: 'SBL-KLD-01', yetkinlik: 'YTK-01', sure: 120, durum: 'pasif' },

    { id: 'HZM-MKN-001',   poz: 'PZ.02.01', ad: 'Dolum Makinesi Periyodik Kontrolü',          kat: 'KAT-02', birim: 'adet',     periyotAy: 12, formId: 'FRM-MKN-01', sablonId: 'SBL-MKN-01', yetkinlik: 'YTK-04', sure: 50,  durum: 'aktif' },
    { id: 'HZM-MKN-002',   poz: 'PZ.02.02', ad: 'Konveyör Bant Sistemi Kontrolü',             kat: 'KAT-02', birim: 'sistem',   periyotAy: 12, formId: 'FRM-MKN-02', sablonId: 'SBL-MKN-01', yetkinlik: 'YTK-04', sure: 90,  durum: 'aktif' },
    { id: 'HZM-MKN-003',   poz: 'PZ.02.03', ad: 'Paketleme Makinesi Kontrolü',                kat: 'KAT-02', birim: 'adet',     periyotAy: 12, formId: 'FRM-MKN-01', sablonId: 'SBL-MKN-01', yetkinlik: 'YTK-04', sure: 45,  durum: 'aktif' },
    { id: 'HZM-MKN-004',   poz: 'PZ.02.04', ad: 'Hidrolik Pres Periyodik Kontrolü',           kat: 'KAT-02', birim: 'adet',     periyotAy: 6,  formId: 'FRM-MKN-03', sablonId: 'SBL-MKN-01', yetkinlik: 'YTK-04', sure: 60,  durum: 'aktif' },
    { id: 'HZM-MKN-005',   poz: 'PZ.02.05', ad: 'Endüstriyel Karıştırıcı Kontrolü',           kat: 'KAT-02', birim: 'adet',     periyotAy: 12, formId: 'FRM-MKN-01', sablonId: 'SBL-MKN-01', yetkinlik: 'YTK-04', sure: 40,  durum: 'aktif' },

    { id: 'HZM-BSK-001',   poz: 'PZ.03.01', ad: 'Kompresör Hava Tankı Periyodik Kontrolü',    kat: 'KAT-03', birim: 'adet',     periyotAy: 12, formId: 'FRM-BSK-01', sablonId: 'SBL-BSK-01', yetkinlik: 'YTK-03', sure: 45,  durum: 'aktif' },
    { id: 'HZM-BSK-002',   poz: 'PZ.03.02', ad: 'Vidalı Kompresör Periyodik Kontrolü',        kat: 'KAT-03', birim: 'adet',     periyotAy: 12, formId: 'FRM-BSK-02', sablonId: 'SBL-BSK-01', yetkinlik: 'YTK-03', sure: 40,  durum: 'aktif' },
    { id: 'HZM-BSK-003',   poz: 'PZ.03.03', ad: 'Hidrofor Genleşme Tankı Kontrolü',           kat: 'KAT-03', birim: 'adet',     periyotAy: 12, formId: 'FRM-BSK-01', sablonId: 'SBL-BSK-01', yetkinlik: 'YTK-03', sure: 30,  durum: 'aktif' },
    { id: 'HZM-BSK-004',   poz: 'PZ.03.04', ad: 'Buhar Kazanı Periyodik Kontrolü',            kat: 'KAT-03', birim: 'adet',     periyotAy: 12, formId: 'FRM-BSK-03', sablonId: 'SBL-BSK-02', yetkinlik: 'YTK-03', sure: 120, durum: 'aktif' },
    { id: 'HZM-BSK-005',   poz: 'PZ.03.05', ad: 'Sıcak Su Kazanı Periyodik Kontrolü',         kat: 'KAT-03', birim: 'adet',     periyotAy: 12, formId: 'FRM-BSK-03', sablonId: 'SBL-BSK-02', yetkinlik: 'YTK-03', sure: 70,  durum: 'aktif' },
    { id: 'HZM-BSK-006',   poz: 'PZ.03.06', ad: 'Basınçlı Boru Hattı Kontrolü',               kat: 'KAT-03', birim: 'sistem',   periyotAy: 24, formId: 'FRM-BSK-04', sablonId: 'SBL-BSK-01', yetkinlik: 'YTK-03', sure: 100, durum: 'aktif' },
    { id: 'HZM-BSK-007',   poz: 'PZ.03.07', ad: 'LPG Tankı Periyodik Kontrolü',               kat: 'KAT-03', birim: 'adet',     periyotAy: 12, formId: 'FRM-BSK-05', sablonId: 'SBL-BSK-02', yetkinlik: 'YTK-03', sure: 80,  durum: 'aktif' },
    { id: 'HZM-BSK-008',   poz: 'PZ.03.08', ad: 'Emniyet Ventili Kalibrasyon Kontrolü',       kat: 'KAT-03', birim: 'adet',     periyotAy: 12, formId: 'FRM-BSK-06', sablonId: 'SBL-BSK-01', yetkinlik: 'YTK-03', sure: 20,  durum: 'aktif' },

    { id: 'HZM-ELK-001',   poz: 'PZ.04.01', ad: 'Topraklama Tesisatı Periyodik Ölçümü',       kat: 'KAT-04', birim: 'sistem',   periyotAy: 12, formId: 'FRM-ELK-01', sablonId: 'SBL-ELK-01', yetkinlik: 'YTK-02', sure: 60,  durum: 'aktif' },
    { id: 'HZM-ELK-002',   poz: 'PZ.04.02', ad: 'Paratoner Tesisatı Ölçümü',                  kat: 'KAT-04', birim: 'adet',     periyotAy: 12, formId: 'FRM-ELK-02', sablonId: 'SBL-ELK-01', yetkinlik: 'YTK-02', sure: 45,  durum: 'aktif' },
    { id: 'HZM-ELK-003',   poz: 'PZ.04.03', ad: 'Elektrik İç Tesisat Uygunluk Kontrolü',      kat: 'KAT-04', birim: 'sistem',   periyotAy: 12, formId: 'FRM-ELK-03', sablonId: 'SBL-ELK-02', yetkinlik: 'YTK-02', sure: 120, durum: 'aktif' },
    { id: 'HZM-ELK-004',   poz: 'PZ.04.04', ad: 'Kaçak Akım Rölesi Fonksiyon Testi',          kat: 'KAT-04', birim: 'adet',     periyotAy: 12, formId: 'FRM-ELK-04', sablonId: 'SBL-ELK-01', yetkinlik: 'YTK-02', sure: 10,  durum: 'aktif' },
    { id: 'HZM-ELK-005',   poz: 'PZ.04.05', ad: 'Jeneratör Periyodik Kontrolü',               kat: 'KAT-04', birim: 'adet',     periyotAy: 12, formId: 'FRM-ELK-05', sablonId: 'SBL-ELK-02', yetkinlik: 'YTK-02', sure: 55,  durum: 'aktif' },
    { id: 'HZM-ELK-006',   poz: 'PZ.04.06', ad: 'Kompanzasyon Panosu Kontrolü',               kat: 'KAT-04', birim: 'adet',     periyotAy: 12, formId: 'FRM-ELK-06', sablonId: 'SBL-ELK-01', yetkinlik: 'YTK-02', sure: 35,  durum: 'aktif' },
    { id: 'HZM-ELK-007',   poz: 'PZ.04.07', ad: 'Termal Kamera ile Pano Taraması',            kat: 'KAT-04', birim: 'sistem',   periyotAy: 12, formId: 'FRM-ELK-07', sablonId: 'SBL-ELK-02', yetkinlik: 'YTK-02', sure: 75,  durum: 'aktif' },
    { id: 'HZM-ELK-008',   poz: 'PZ.04.08', ad: 'Dağıtım Trafosu Periyodik Kontrolü',         kat: 'KAT-04', birim: 'adet',     periyotAy: 12, formId: 'FRM-ELK-08', sablonId: 'SBL-ELK-02', yetkinlik: 'YTK-02', sure: 90,  durum: 'aktif' },
    { id: 'HZM-ELK-009',   poz: 'PZ.04.09', ad: 'UPS ve Kesintisiz Güç Sistemi Kontrolü',     kat: 'KAT-04', birim: 'adet',     periyotAy: 12, formId: 'FRM-ELK-09', sablonId: 'SBL-ELK-01', yetkinlik: 'YTK-02', sure: 40,  durum: 'aktif' },

    { id: 'HZM-YNG-001',   poz: 'PZ.05.01', ad: 'Yangın Algılama ve Alarm Sistemi Kontrolü',  kat: 'KAT-05', birim: 'sistem',   periyotAy: 12, formId: 'FRM-YNG-01', sablonId: 'SBL-YNG-01', yetkinlik: 'YTK-05', sure: 90,  durum: 'aktif' },
    { id: 'HZM-YNG-002',   poz: 'PZ.05.02', ad: 'Yangın Pompası Periyodik Kontrolü',          kat: 'KAT-05', birim: 'adet',     periyotAy: 12, formId: 'FRM-YNG-02', sablonId: 'SBL-YNG-01', yetkinlik: 'YTK-05', sure: 55,  durum: 'aktif' },
    { id: 'HZM-YNG-003',   poz: 'PZ.05.03', ad: 'Yangın Dolabı ve Hidrant Kontrolü',          kat: 'KAT-05', birim: 'adet',     periyotAy: 12, formId: 'FRM-YNG-03', sablonId: 'SBL-YNG-01', yetkinlik: 'YTK-05', sure: 12,  durum: 'aktif' },
    { id: 'HZM-YNG-004',   poz: 'PZ.05.04', ad: 'Sprinkler Sistemi Periyodik Kontrolü',       kat: 'KAT-05', birim: 'sistem',   periyotAy: 12, formId: 'FRM-YNG-04', sablonId: 'SBL-YNG-01', yetkinlik: 'YTK-05', sure: 100, durum: 'aktif' },
    { id: 'HZM-YNG-005',   poz: 'PZ.05.05', ad: 'Duman Tahliye ve Jet Fan Sistemi Kontrolü',  kat: 'KAT-05', birim: 'sistem',   periyotAy: 12, formId: 'FRM-YNG-05', sablonId: 'SBL-YNG-02', yetkinlik: 'YTK-05', sure: 80,  durum: 'aktif' },
    { id: 'HZM-YNG-006',   poz: 'PZ.05.06', ad: 'Havalandırma ve İklimlendirme Kontrolü',     kat: 'KAT-05', birim: 'sistem',   periyotAy: 12, formId: 'FRM-YNG-06', sablonId: 'SBL-YNG-02', yetkinlik: 'YTK-05', sure: 70,  durum: 'aktif' },
    { id: 'HZM-YNG-007',   poz: 'PZ.05.07', ad: 'Gazlı Söndürme Sistemi Kontrolü',            kat: 'KAT-05', birim: 'sistem',   periyotAy: 12, formId: 'FRM-YNG-07', sablonId: 'SBL-YNG-01', yetkinlik: 'YTK-05', sure: 60,  durum: 'aktif' },

    { id: 'HZM-RAF-001',   poz: 'PZ.06.01', ad: 'Ağır Yük Raf Sistemi Periyodik Kontrolü',    kat: 'KAT-06', birim: 'metrekare', periyotAy: 12, formId: 'FRM-RAF-01', sablonId: 'SBL-RAF-01', yetkinlik: 'YTK-06', sure: 90, durum: 'aktif' },
    { id: 'HZM-RAF-002',   poz: 'PZ.06.02', ad: 'Konsol Raf Sistemi Kontrolü',                kat: 'KAT-06', birim: 'adet',     periyotAy: 12, formId: 'FRM-RAF-02', sablonId: 'SBL-RAF-01', yetkinlik: 'YTK-06', sure: 25,  durum: 'aktif' },
    { id: 'HZM-RAF-003',   poz: 'PZ.06.03', ad: 'Mezzanin Platform Kontrolü',                 kat: 'KAT-06', birim: 'metrekare', periyotAy: 12, formId: 'FRM-RAF-03', sablonId: 'SBL-RAF-01', yetkinlik: 'YTK-06', sure: 60, durum: 'aktif' },
    { id: 'HZM-RAF-004',   poz: 'PZ.06.04', ad: 'Market Gondol Raf Kontrolü',                 kat: 'KAT-06', birim: 'metrekare', periyotAy: 12, formId: 'FRM-RAF-01', sablonId: 'SBL-RAF-01', yetkinlik: 'YTK-06', sure: 40, durum: 'aktif' },

    { id: 'HZM-HJY-001',   poz: 'PZ.07.01', ad: 'Gürültü Maruziyeti Ölçümü',                  kat: 'KAT-07', birim: 'olcum-seti', periyotAy: 24, formId: 'FRM-HJY-01', sablonId: 'SBL-HJY-01', yetkinlik: 'YTK-07', sure: 120, durum: 'aktif' },
    { id: 'HZM-HJY-002',   poz: 'PZ.07.02', ad: 'Toz Maruziyeti Ölçümü',                      kat: 'KAT-07', birim: 'olcum-seti', periyotAy: 24, formId: 'FRM-HJY-02', sablonId: 'SBL-HJY-01', yetkinlik: 'YTK-07', sure: 150, durum: 'aktif' },
    { id: 'HZM-HJY-003',   poz: 'PZ.07.03', ad: 'Aydınlatma Şiddeti Ölçümü',                  kat: 'KAT-07', birim: 'olcum-seti', periyotAy: 24, formId: 'FRM-HJY-03', sablonId: 'SBL-HJY-01', yetkinlik: 'YTK-07', sure: 80,  durum: 'aktif' },
    { id: 'HZM-HJY-004',   poz: 'PZ.07.04', ad: 'Termal Konfor Ölçümü',                       kat: 'KAT-07', birim: 'olcum-seti', periyotAy: 24, formId: 'FRM-HJY-04', sablonId: 'SBL-HJY-01', yetkinlik: 'YTK-07', sure: 90,  durum: 'aktif' },
    { id: 'HZM-HJY-005',   poz: 'PZ.07.05', ad: 'Kimyasal Maruziyet (VOC) Ölçümü',            kat: 'KAT-07', birim: 'olcum-seti', periyotAy: 24, formId: 'FRM-HJY-05', sablonId: 'SBL-HJY-01', yetkinlik: 'YTK-07', sure: 160, durum: 'aktif' },

    { id: 'HZM-PKD-001',   poz: 'PZ.08.01', ad: 'Patlamadan Korunma Dokümanı Hazırlama',      kat: 'KAT-08', birim: 'dokuman',  periyotAy: 36, formId: 'FRM-PKD-01', sablonId: 'SBL-PKD-01', yetkinlik: 'YTK-08', sure: 480, durum: 'aktif' },
    { id: 'HZM-PKD-002',   poz: 'PZ.08.02', ad: 'Patlamadan Korunma Dokümanı Revizyonu',      kat: 'KAT-08', birim: 'dokuman',  periyotAy: 12, formId: 'FRM-PKD-02', sablonId: 'SBL-PKD-01', yetkinlik: 'YTK-08', sure: 180, durum: 'aktif' },

    { id: 'HZM-ACL-001',   poz: 'PZ.09.01', ad: 'Acil Aydınlatma Armatürü Kontrolü',          kat: 'KAT-09', birim: 'adet',     periyotAy: 12, formId: 'FRM-ACL-01', sablonId: 'SBL-ACL-01', yetkinlik: 'YTK-06', sure: 5,   durum: 'aktif' },
    { id: 'HZM-ACL-002',   poz: 'PZ.09.02', ad: 'Acil Yönlendirme Armatürü Kontrolü',         kat: 'KAT-09', birim: 'adet',     periyotAy: 12, formId: 'FRM-ACL-01', sablonId: 'SBL-ACL-01', yetkinlik: 'YTK-06', sure: 4,   durum: 'aktif' },
    { id: 'HZM-ACL-003',   poz: 'PZ.09.03', ad: 'Merkezi Batarya Sistemi Kontrolü',           kat: 'KAT-09', birim: 'sistem',   periyotAy: 12, formId: 'FRM-ACL-02', sablonId: 'SBL-ACL-01', yetkinlik: 'YTK-06', sure: 45,  durum: 'aktif' },

    { id: 'HZM-DGR-001',   poz: 'PZ.10.01', ad: 'Şartlandırılmış Su Analizi',                 kat: 'KAT-10', birim: 'olcum-seti', periyotAy: 12, formId: 'FRM-DGR-01', sablonId: 'SBL-DGR-01', yetkinlik: 'YTK-07', sure: 45, durum: 'aktif' },
    { id: 'HZM-DGR-002',   poz: 'PZ.10.02', ad: 'Endüstriyel Soğutma Sistemi Kontrolü',       kat: 'KAT-10', birim: 'adet',     periyotAy: 12, formId: 'FRM-DGR-02', sablonId: 'SBL-DGR-01', yetkinlik: 'YTK-04', sure: 50,  durum: 'aktif' },
    { id: 'HZM-DGR-003',   poz: 'PZ.10.03', ad: 'Otomatik Kapı ve Bariyer Kontrolü',          kat: 'KAT-10', birim: 'adet',     periyotAy: 12, formId: 'FRM-DGR-03', sablonId: 'SBL-DGR-01', yetkinlik: 'YTK-04', sure: 20,  durum: 'aktif' },
    { id: 'HZM-DGR-004',   poz: 'PZ.10.04', ad: 'Yürüyen Merdiven ve Bant Kontrolü',          kat: 'KAT-10', birim: 'adet',     periyotAy: 12, formId: 'FRM-DGR-04', sablonId: 'SBL-DGR-01', yetkinlik: 'YTK-01', sure: 65,  durum: 'aktif' },
    { id: 'HZM-DGR-005',   poz: 'PZ.10.05', ad: 'Enerji Verimliliği Etüdü',                   kat: 'KAT-10', birim: 'lokasyon', periyotAy: 48, formId: 'FRM-DGR-05', sablonId: 'SBL-DGR-02', yetkinlik: 'YTK-02', sure: 360, durum: 'aktif' },
    { id: 'HZM-DGR-006',   poz: 'PZ.10.06', ad: 'Saha Keşif ve Envanter Çıkarma (Gün)',       kat: 'KAT-10', birim: 'gun',      periyotAy: 0,  formId: 'FRM-DGR-06', sablonId: null,         yetkinlik: null,    sure: 480, durum: 'aktif' }
  ];

  /* ---------------------------------------------------------------
     FİYAT LİSTELERİ — müşteri satışı ve taşeron maliyeti AYRI
     --------------------------------------------------------------- */
  var fiyatListeleri = [
    { id: 'FL-2026-STD', ad: '2026 Standart Satış Fiyat Listesi', tur: 'satis',   versiyon: 'v3',   gecerli: '2026-01-01', bitis: '2026-12-31', paraBirimi: 'TRY', durum: 'aktif',  aciklama: 'Liste fiyatı; sözleşmesiz ve tekil işlerde uygulanır.' },
    { id: 'FL-2026-ZMB', ad: 'Beyaz Zambak Sözleşme Fiyat Listesi', tur: 'satis',  versiyon: 'v2',   gecerli: '2026-01-01', bitis: '2026-12-31', paraBirimi: 'TRY', durum: 'aktif',  musteriId: 'MST-001', aciklama: 'SZL-2026-001 sözleşmesine bağlı; standart listeden %12 iskontolu.' },
    { id: 'FL-2026-ANL', ad: 'Anadolu Lojistik Fiyat Listesi',     tur: 'satis',   versiyon: 'v1',   gecerli: '2026-03-01', bitis: '2027-02-28', paraBirimi: 'TRY', durum: 'aktif',  musteriId: 'MST-002', aciklama: 'SZL-2026-002 sözleşmesine bağlı; depo hizmetlerinde hacim indirimi.' },
    { id: 'FL-2026-EFE', ad: 'Efe Gıda Fabrika Fiyat Listesi',     tur: 'satis',   versiyon: 'v1',   gecerli: '2026-04-01', bitis: '2027-03-31', paraBirimi: 'TRY', durum: 'aktif',  musteriId: 'MST-003', aciklama: 'SZL-2026-003 sözleşmesine bağlı; üretim ekipmanı ağırlıklı.' },
    { id: 'FL-2025-STD', ad: '2025 Standart Satış Fiyat Listesi',  tur: 'satis',   versiyon: 'v2',   gecerli: '2025-01-01', bitis: '2025-12-31', paraBirimi: 'TRY', durum: 'arsiv',  aciklama: 'Geçmiş dönem; yalnız 2025 hakedişlerinin doğrulanmasında kullanılır.' },
    { id: 'FL-TSR-BATI', ad: 'Batı Teknik Taşeron Maliyet Listesi', tur: 'maliyet', versiyon: 'v2',  gecerli: '2026-01-01', bitis: '2026-12-31', paraBirimi: 'TRY', durum: 'aktif',  taseronId: 'TSR-001', aciklama: 'Taşeron alış fiyatı; müşteriye YANSITILMAZ.' },
    { id: 'FL-TSR-KUZY', ad: 'Kuzey Kontrol Taşeron Maliyet Listesi', tur: 'maliyet', versiyon: 'v1', gecerli: '2026-02-01', bitis: '2026-12-31', paraBirimi: 'TRY', durum: 'aktif', taseronId: 'TSR-002', aciklama: 'Karadeniz bölgesi; ulaşım maliyeti taşerona aittir.' },
    { id: 'FL-TSR-ANDL', ad: 'Anadolu Muayene Taşeron Maliyet Listesi', tur: 'maliyet', versiyon: 'v1', gecerli: '2026-01-15', bitis: '2026-12-31', paraBirimi: 'TRY', durum: 'aktif', taseronId: 'TSR-003', aciklama: 'İç Anadolu bölgesi; konaklama GAVIA Teknik tarafından karşılanır.' },
    { id: 'FL-TSR-MRMR', ad: 'Marmara Test Taşeron Maliyet Listesi', tur: 'maliyet', versiyon: 'v3', gecerli: '2026-01-01', bitis: '2026-12-31', paraBirimi: 'TRY', durum: 'aktif', taseronId: 'TSR-004', aciklama: 'Marmara bölgesi; en yüksek hacimli taşeron.' }
  ];

  /* birim satış fiyatı (FL-2026-STD) ve taşeron maliyeti (ortalama) — hizmet bazlı */
  var hizmetFiyatlari = {
    'HZM-KLD-001-D': { satis: 1450, maliyet: 620 }, 'HZM-KLD-001-A': { satis: 1350, maliyet: 580 },
    'HZM-KLD-002':   { satis: 950,  maliyet: 410 }, 'HZM-KLD-003':   { satis: 620,  maliyet: 260 },
    'HZM-KLD-004':   { satis: 1150, maliyet: 490 }, 'HZM-KLD-005':   { satis: 2650, maliyet: 1180 },
    'HZM-KLD-006':   { satis: 1280, maliyet: 540 }, 'HZM-KLD-007':   { satis: 3200, maliyet: 1420 },
    'HZM-KLD-008':   { satis: 2100, maliyet: 930 }, 'HZM-KLD-009':   { satis: 5400, maliyet: 2450 },
    'HZM-MKN-001':   { satis: 1850, maliyet: 810 }, 'HZM-MKN-002':   { satis: 3400, maliyet: 1520 },
    'HZM-MKN-003':   { satis: 1650, maliyet: 720 }, 'HZM-MKN-004':   { satis: 2250, maliyet: 990 },
    'HZM-MKN-005':   { satis: 1580, maliyet: 690 },
    'HZM-BSK-001':   { satis: 1750, maliyet: 760 }, 'HZM-BSK-002':   { satis: 1550, maliyet: 670 },
    'HZM-BSK-003':   { satis: 1150, maliyet: 490 }, 'HZM-BSK-004':   { satis: 4800, maliyet: 2180 },
    'HZM-BSK-005':   { satis: 2750, maliyet: 1230 }, 'HZM-BSK-006':  { satis: 3900, maliyet: 1740 },
    'HZM-BSK-007':   { satis: 3300, maliyet: 1480 }, 'HZM-BSK-008':  { satis: 780,  maliyet: 320 },
    'HZM-ELK-001':   { satis: 2350, maliyet: 1020 }, 'HZM-ELK-002':  { satis: 1850, maliyet: 800 },
    'HZM-ELK-003':   { satis: 4200, maliyet: 1880 }, 'HZM-ELK-004':  { satis: 420,  maliyet: 170 },
    'HZM-ELK-005':   { satis: 2450, maliyet: 1080 }, 'HZM-ELK-006':  { satis: 1650, maliyet: 710 },
    'HZM-ELK-007':   { satis: 3100, maliyet: 1380 }, 'HZM-ELK-008':  { satis: 4600, maliyet: 2080 },
    'HZM-ELK-009':   { satis: 1750, maliyet: 760 },
    'HZM-YNG-001':   { satis: 3600, maliyet: 1610 }, 'HZM-YNG-002':  { satis: 2150, maliyet: 940 },
    'HZM-YNG-003':   { satis: 380,  maliyet: 150 }, 'HZM-YNG-004':   { satis: 4100, maliyet: 1840 },
    'HZM-YNG-005':   { satis: 3250, maliyet: 1450 }, 'HZM-YNG-006':  { satis: 2850, maliyet: 1260 },
    'HZM-YNG-007':   { satis: 2450, maliyet: 1080 },
    'HZM-RAF-001':   { satis: 42,   maliyet: 17 },  'HZM-RAF-002':   { satis: 890,  maliyet: 380 },
    'HZM-RAF-003':   { satis: 58,   maliyet: 24 },  'HZM-RAF-004':   { satis: 28,   maliyet: 11 },
    'HZM-HJY-001':   { satis: 5200, maliyet: 2340 }, 'HZM-HJY-002':  { satis: 6400, maliyet: 2880 },
    'HZM-HJY-003':   { satis: 3800, maliyet: 1700 }, 'HZM-HJY-004':  { satis: 4200, maliyet: 1880 },
    'HZM-HJY-005':   { satis: 7800, maliyet: 3520 },
    'HZM-PKD-001':   { satis: 28500, maliyet: 12800 }, 'HZM-PKD-002': { satis: 11500, maliyet: 5100 },
    'HZM-ACL-001':   { satis: 95,   maliyet: 38 },  'HZM-ACL-002':   { satis: 85,   maliyet: 34 },
    'HZM-ACL-003':   { satis: 2250, maliyet: 990 },
    'HZM-DGR-001':   { satis: 2850, maliyet: 1270 }, 'HZM-DGR-002':  { satis: 2150, maliyet: 940 },
    'HZM-DGR-003':   { satis: 780,  maliyet: 320 }, 'HZM-DGR-004':   { satis: 3450, maliyet: 1540 },
    'HZM-DGR-005':   { satis: 34500, maliyet: 15600 }, 'HZM-DGR-006': { satis: 8500, maliyet: 3800 }
  };

  /* ---------------------------------------------------------------
     DURUM SÖZLÜKLERİ — 5 AYRI AKIŞ (tek metin alanında birleştirilmez)
     --------------------------------------------------------------- */
  var durumlar = {
    /* Proje akışı — doküman §8: Taslak → Onay Bekliyor → Aktif → Askıda
       → Tamamlandı → Arşivlendi. Çekirdek veride yalnız planlama/aktif/
       tamamlandi kullanılıyor; kalan üçü durum makinesinin tanımlı
       geçişleriyle üretilir. */
    proje: [
      { k: 'planlama',      ad: 'Planlama',      ton: 'warn', ikon: 'fa-drafting-compass' },
      { k: 'onay-bekliyor', ad: 'Onay Bekliyor', ton: 'warn', ikon: 'fa-hourglass-half' },
      { k: 'aktif',         ad: 'Aktif',         ton: 'ok',   ikon: 'fa-play' },
      { k: 'askida',        ad: 'Askıda',        ton: 'warn', ikon: 'fa-circle-pause' },
      { k: 'tamamlandi',    ad: 'Tamamlandı',    ton: 'info', ikon: 'fa-flag-checkered' },
      { k: 'arsivlendi',    ad: 'Arşivlendi',    ton: 'off',  ikon: 'fa-box-archive' }
    ],
    operasyon: [
      { k: 'bilgi-bekleniyor',        ad: 'Bilgi Bekleniyor',        ton: 'warn',   ikon: 'fa-circle-question' },
      { k: 'envanter-bekleniyor',     ad: 'Envanter Bekleniyor',     ton: 'warn',   ikon: 'fa-clipboard-list' },
      { k: 'iletisime-gecildi',       ad: 'İletişime Geçildi',       ton: 'info',   ikon: 'fa-phone' },
      { k: 'tarih-onayi-bekleniyor',  ad: 'Tarih Onayı Bekleniyor',  ton: 'warn',   ikon: 'fa-calendar-check' },
      { k: 'planlandi',               ad: 'Planlandı',               ton: 'info',   ikon: 'fa-calendar-days' },
      { k: 'tadilatta',               ad: 'Tadilatta',               ton: 'warn',   ikon: 'fa-trowel-bricks' },
      { k: 'tasiniyor',               ad: 'Taşınıyor',               ton: 'warn',   ikon: 'fa-truck-moving' },
      { k: 'sahada',                  ad: 'Sahada',                  ton: 'info',   ikon: 'fa-person-walking' },
      { k: 'kontrol-tamamlandi',      ad: 'Kontrol Tamamlandı',      ton: 'ok',     ikon: 'fa-circle-check' },
      { k: 'yeniden-ziyaret',         ad: 'Yeniden Ziyaret Gerekli', ton: 'danger', ikon: 'fa-rotate-right' },
      { k: 'kapsam-disi',             ad: 'Kapsam Dışı',             ton: 'off',    ikon: 'fa-ban' },
      { k: 'iptal',                   ad: 'İptal',                   ton: 'off',    ikon: 'fa-xmark' }
    ],
    rapor: [
      { k: 'baslatilmadi',            ad: 'Başlatılmadı',            ton: 'off',    ikon: 'fa-circle-minus' },
      { k: 'taslak',                  ad: 'Taslak',                  ton: 'info',   ikon: 'fa-pen-ruler' },
      { k: 'taserondan-bekleniyor',   ad: 'Taşerondan Bekleniyor',   ton: 'warn',   ikon: 'fa-people-carry-box' },
      { k: 'teknik-incelemede',       ad: 'Teknik İncelemede',       ton: 'warn',   ikon: 'fa-magnifying-glass-chart' },
      { k: 'revizyon-istendi',        ad: 'Revizyon İstendi',        ton: 'danger', ikon: 'fa-rotate-left' },
      { k: 'onaylandi',               ad: 'Onaylandı',               ton: 'ok',     ikon: 'fa-circle-check' },
      { k: 'imzalandi',               ad: 'İmzalandı',               ton: 'ok',     ikon: 'fa-signature' },
      { k: 'teslim-edildi',           ad: 'Teslim Edildi',           ton: 'ok',     ikon: 'fa-paper-plane' },
      { k: 'arsiv',                   ad: 'Arşiv (eski revizyon)',   ton: 'off',    ikon: 'fa-box-archive' }
    ],
    fatura: [
      { k: 'faturaya-uygun-degil',    ad: 'Faturaya Uygun Değil',    ton: 'off',    ikon: 'fa-circle-minus' },
      { k: 'mutabakat-bekleniyor',    ad: 'Mutabakat Bekleniyor',    ton: 'warn',   ikon: 'fa-scale-balanced' },
      { k: 'faturaya-hazir',          ad: 'Faturaya Hazır',          ton: 'info',   ikon: 'fa-file-circle-check' },
      { k: 'fatura-grubunda',         ad: 'Fatura Grubunda',         ton: 'info',   ikon: 'fa-layer-group' },
      { k: 'kismen-faturalandi',      ad: 'Kısmen Faturalandı',      ton: 'warn',   ikon: 'fa-circle-half-stroke' },
      { k: 'tam-faturalandi',         ad: 'Tam Faturalandı',         ton: 'ok',     ikon: 'fa-file-invoice-dollar' }
    ],
    tahsilat: [
      { k: 'bekleniyor',              ad: 'Bekleniyor',              ton: 'info',   ikon: 'fa-hourglass-half' },
      { k: 'kismen-tahsil',           ad: 'Kısmen Tahsil Edildi',    ton: 'warn',   ikon: 'fa-circle-half-stroke' },
      { k: 'tam-tahsil',              ad: 'Tam Tahsil Edildi',       ton: 'ok',     ikon: 'fa-circle-check' },
      { k: 'vadesi-gecti',            ad: 'Vadesi Geçti',            ton: 'danger', ikon: 'fa-triangle-exclamation' }
    ],
    taseronOdeme: [
      { k: 'hakedis-hazirlaniyor',    ad: 'Hakediş Hazırlanıyor',    ton: 'off',    ikon: 'fa-file-pen' },
      { k: 'taseron-faturasi-bekleniyor', ad: 'Taşeron Faturası Bekleniyor', ton: 'warn', ikon: 'fa-file-import' },
      { k: 'musteri-tahsilati-bekleniyor', ad: 'Müşteri Tahsilatı Bekleniyor', ton: 'warn', ikon: 'fa-hourglass-half' },
      { k: 'odemeye-uygun',           ad: 'Ödemeye Uygun',           ton: 'info',   ikon: 'fa-circle-check' },
      { k: 'kismen-odendi',           ad: 'Kısmen Ödendi',           ton: 'warn',   ikon: 'fa-circle-half-stroke' },
      { k: 'tam-odendi',              ad: 'Tam Ödendi',              ton: 'ok',     ikon: 'fa-money-bill-transfer' }
    ]
  };

  /* ---------------------------------------------------------------
     PROJELER / KONTROL KAMPANYALARI
     --------------------------------------------------------------- */
  var projeler = [
    { id: 'PRJ-2026-001', kod: 'PRJ-2026-001', ad: 'Zambak Market 2026 Yıllık Periyodik Kontrol Kampanyası',
      musteriId: 'MST-001', markaId: 'MRK-A', yil: 2026, baslangic: '2026-02-01', bitis: '2026-12-31',
      yoneticiId: 'PRS-003', sozlesmeId: 'SZL-2026-001', fiyatListesiId: 'FL-2026-ZMB',
      partiBuyuklugu: 6, raporSlaGun: 7, durum: 'aktif',
      aciklama: 'Zambak Market zincirinin 12 lokasyonunda yıllık yasal periyodik kontroller; yangın, elektrik, kaldırma ve raf sistemleri kapsamda.' },
    { id: 'PRJ-2026-002', kod: 'PRJ-2026-002', ad: 'AnadoluDepo Depo ve Antrepo Kontrolleri 2026',
      musteriId: 'MST-002', markaId: 'MRK-C', yil: 2026, baslangic: '2026-03-15', bitis: '2027-03-14',
      yoneticiId: 'PRS-003', sozlesmeId: 'SZL-2026-002', fiyatListesiId: 'FL-2026-ANL',
      partiBuyuklugu: 3, raporSlaGun: 10, durum: 'aktif',
      aciklama: 'Altı depo ve antrepoda raf sistemi, kaldırma ekipmanı, yangın ve elektrik kontrolleri.' },
    { id: 'PRJ-2026-003', kod: 'PRJ-2026-003', ad: 'Efe Gıda Fabrika Periyodik Kontrol 2026',
      musteriId: 'MST-003', markaId: 'MRK-D', yil: 2026, baslangic: '2026-04-01', bitis: '2027-03-31',
      yoneticiId: 'PRS-004', sozlesmeId: 'SZL-2026-003', fiyatListesiId: 'FL-2026-EFE',
      partiBuyuklugu: 2, raporSlaGun: 5, durum: 'aktif',
      aciklama: 'Üç üretim tesisi ve bir mamul deposunda basınçlı kap, makine, ortam ölçümü ve PKD çalışmaları.' },
    { id: 'PRJ-2025-004', kod: 'PRJ-2025-004', ad: 'Zambak Market 2025 Yıllık Kontrol Kampanyası',
      musteriId: 'MST-001', markaId: 'MRK-A', yil: 2025, baslangic: '2025-02-10', bitis: '2025-12-20',
      yoneticiId: 'PRS-003', sozlesmeId: 'SZL-2025-001', fiyatListesiId: 'FL-2025-STD',
      partiBuyuklugu: 6, raporSlaGun: 7, durum: 'tamamlandi',
      aciklama: 'Önceki dönem kampanyası; 12 lokasyon tamamlandı ve faturalandı. Karşılaştırma verisi için saklanır.' },
    { id: 'PRJ-2026-005', kod: 'PRJ-2026-005', ad: 'Zambak Ekspres Yeni Açılış Kontrolleri',
      musteriId: 'MST-001', markaId: 'MRK-B', yil: 2026, baslangic: '2026-09-01', bitis: '2026-12-31',
      yoneticiId: 'PRS-006', sozlesmeId: null, fiyatListesiId: 'FL-2026-ZMB',
      partiBuyuklugu: 5, raporSlaGun: 7, durum: 'planlama',
      aciklama: 'Küçük format yeni şubelerin açılış öncesi ilk kontrolleri. Sözleşme eki imza aşamasında.' }
  ];

  /* ---------------------------------------------------------------
     LOKASYONLAR — 27 kayıt (ana rehber ≠ proje kapsamı)
     projeId null olan kayıtlar ana rehberde vardır ama hiçbir projeye dâhil değildir.
     sonrakiKontrol: ana tarih yoksa null bırakılır (sahte tarih üretilmez).
     --------------------------------------------------------------- */
  var lokasyonlar = [
    { id: 'LOK-0101', kod: 'LOK-0101', musteriKod: 'ZM-034', musteriId: 'MST-001', markaId: 'MRK-A', projeId: 'PRJ-2026-001', ad: 'Zambak Market Kartal Şubesi',        il: 'İstanbul', ilce: 'Kartal',      bolge: 'Marmara',     m2: 1850, tur: 'Market', taseronId: 'TSR-004', ekipId: ['PRS-007','PRS-010'], operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'teslim-edildi',      faturaDurum: 'tam-faturalandi',    kontrolTarihi: '2026-03-10', raporTarihi: '2026-03-13', raporTeslimTarihi: '2026-03-17', sonrakiKontrol: '2027-03-10', yetkiliId: 'KSI-005', adres: 'Örnek Mah. 1. Cad. No: 34, Kartal / İstanbul (kurgusal)' },
    { id: 'LOK-0102', kod: 'LOK-0102', musteriKod: 'ZM-041', musteriId: 'MST-001', markaId: 'MRK-A', projeId: 'PRJ-2026-001', ad: 'Zambak Market Ümraniye Şubesi',      il: 'İstanbul', ilce: 'Ümraniye',    bolge: 'Marmara',     m2: 2100, tur: 'Market', taseronId: 'TSR-004', ekipId: ['PRS-007','PRS-010'], operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'teslim-edildi',      faturaDurum: 'tam-faturalandi',    kontrolTarihi: '2026-03-12', raporTarihi: '2026-03-16', raporTeslimTarihi: '2026-03-19', sonrakiKontrol: '2027-03-12', yetkiliId: 'KSI-006', adres: 'Örnek Mah. 7. Sok. No: 41, Ümraniye / İstanbul (kurgusal)' },
    { id: 'LOK-0103', kod: 'LOK-0103', musteriKod: 'ZM-058', musteriId: 'MST-001', markaId: 'MRK-A', projeId: 'PRJ-2026-001', ad: 'Zambak Market Bornova Şubesi',       il: 'İzmir',    ilce: 'Bornova',     bolge: 'Ege',         m2: 1620, tur: 'Market', taseronId: 'TSR-001', ekipId: ['PRS-008'],           operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'onaylandi',          faturaDurum: 'faturaya-hazir',     kontrolTarihi: '2026-08-11', raporTarihi: '2026-08-13', raporTeslimTarihi: null,        sonrakiKontrol: '2027-08-11', yetkiliId: 'KSI-007', adres: 'Örnek Mah. 12. Cad. No: 58, Bornova / İzmir (kurgusal)' },
    { id: 'LOK-0104', kod: 'LOK-0104', musteriKod: 'ZM-063', musteriId: 'MST-001', markaId: 'MRK-A', projeId: 'PRJ-2026-001', ad: 'Zambak Market Karşıyaka Şubesi',     il: 'İzmir',    ilce: 'Karşıyaka',   bolge: 'Ege',         m2: 1480, tur: 'Market', taseronId: 'TSR-001', ekipId: ['PRS-008'],           operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'teknik-incelemede',  faturaDurum: 'mutabakat-bekleniyor', kontrolTarihi: '2026-08-06', raporTarihi: '2026-08-11', raporTeslimTarihi: null,      sonrakiKontrol: '2027-08-06', yetkiliId: null,      adres: 'Örnek Mah. 3. Sok. No: 63, Karşıyaka / İzmir (kurgusal)' },
    { id: 'LOK-0105', kod: 'LOK-0105', musteriKod: 'ZM-077', musteriId: 'MST-001', markaId: 'MRK-A', projeId: 'PRJ-2026-001', ad: 'Zambak Market Çankaya Şubesi',       il: 'Ankara',   ilce: 'Çankaya',     bolge: 'İç Anadolu',  m2: 1750, tur: 'Market', taseronId: 'TSR-003', ekipId: ['PRS-009','PRS-011'], operasyonDurum: 'planlandi',          raporDurum: 'baslatilmadi',       faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: '2026-08-24', raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: null,      adres: 'Örnek Mah. 21. Cad. No: 77, Çankaya / Ankara (kurgusal)' },
    { id: 'LOK-0106', kod: 'LOK-0106', musteriKod: 'ZM-081', musteriId: 'MST-001', markaId: 'MRK-A', projeId: 'PRJ-2026-001', ad: 'Zambak Market Keçiören Şubesi',      il: 'Ankara',   ilce: 'Keçiören',    bolge: 'İç Anadolu',  m2: 1390, tur: 'Market', taseronId: 'TSR-003', ekipId: [],                    operasyonDurum: 'tarih-onayi-bekleniyor', raporDurum: 'baslatilmadi',   faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: null,       raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: null,      adres: 'Örnek Mah. 9. Sok. No: 81, Keçiören / Ankara (kurgusal)' },
    { id: 'LOK-0107', kod: 'LOK-0107', musteriKod: 'ZM-095', musteriId: 'MST-001', markaId: 'MRK-A', projeId: 'PRJ-2026-001', ad: 'Zambak Market Muratpaşa Şubesi',     il: 'Antalya',  ilce: 'Muratpaşa',   bolge: 'Akdeniz',     m2: 1580, tur: 'Market', taseronId: 'TSR-001', ekipId: [],                    operasyonDurum: 'tadilatta',          raporDurum: 'baslatilmadi',       faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: null,       raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: null,      adres: 'Örnek Mah. 5. Cad. No: 95, Muratpaşa / Antalya (kurgusal)', not: 'Şube 14 Eylül 2026 tarihine kadar tadilatta; kontrol ertelendi.' },
    { id: 'LOK-0108', kod: 'LOK-0108', musteriKod: 'ZM-102', musteriId: 'MST-001', markaId: 'MRK-A', projeId: 'PRJ-2026-001', ad: 'Zambak Market Nilüfer Şubesi',       il: 'Bursa',    ilce: 'Nilüfer',     bolge: 'Marmara',     m2: 1920, tur: 'Market', taseronId: 'TSR-004', ekipId: ['PRS-007','PRS-011'], operasyonDurum: 'sahada',             raporDurum: 'baslatilmadi',       faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: '2026-08-17', raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: null,      adres: 'Örnek Mah. 18. Cad. No: 102, Nilüfer / Bursa (kurgusal)' },
    { id: 'LOK-0109', kod: 'LOK-0109', musteriKod: 'ZM-110', musteriId: 'MST-001', markaId: 'MRK-A', projeId: 'PRJ-2026-001', ad: 'Zambak Market Atakum Şubesi',        il: 'Samsun',   ilce: 'Atakum',      bolge: 'Karadeniz',   m2: 1240, tur: 'Market', taseronId: 'TSR-002', ekipId: [],                    operasyonDurum: 'bilgi-bekleniyor',   raporDurum: 'baslatilmadi',       faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: null,       raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: null,      adres: 'Örnek Mah. 2. Sok. No: 110, Atakum / Samsun (kurgusal)', not: 'Lokasyon yetkilisi ve ekipman envanteri müşteriden 3 kez talep edildi, yanıt bekleniyor.' },
    { id: 'LOK-0110', kod: 'LOK-0110', musteriKod: 'ZM-118', musteriId: 'MST-001', markaId: 'MRK-A', projeId: 'PRJ-2026-001', ad: 'Zambak Market Selçuklu Şubesi',      il: 'Konya',    ilce: 'Selçuklu',    bolge: 'İç Anadolu',  m2: 1660, tur: 'Market', taseronId: 'TSR-003', ekipId: ['PRS-009'],           operasyonDurum: 'planlandi',          raporDurum: 'baslatilmadi',       faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: '2026-08-19', raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: null,      adres: 'Örnek Mah. 30. Cad. No: 118, Selçuklu / Konya (kurgusal)' },
    { id: 'LOK-0111', kod: 'LOK-0111', musteriKod: 'ZM-121', musteriId: 'MST-001', markaId: 'MRK-A', projeId: 'PRJ-2026-001', ad: 'Zambak Market Seyhan Şubesi',        il: 'Adana',    ilce: 'Seyhan',      bolge: 'Akdeniz',     m2: 1430, tur: 'Market', taseronId: 'TSR-001', ekipId: ['PRS-008'],           operasyonDurum: 'yeniden-ziyaret',    raporDurum: 'revizyon-istendi',   faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: '2026-07-14', raporTarihi: '2026-07-20', raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: null,      adres: 'Örnek Mah. 6. Sok. No: 121, Seyhan / Adana (kurgusal)', not: 'Jeneratör ve yangın pompası kontrol sırasında devre dışıydı; yeniden ziyaret planlanacak.' },
    { id: 'LOK-0112', kod: 'LOK-0112', musteriKod: 'ZM-129', musteriId: 'MST-001', markaId: 'MRK-A', projeId: 'PRJ-2026-001', ad: 'Zambak Market Gebze Merkez Deposu',  il: 'Kocaeli',  ilce: 'Gebze',       bolge: 'Marmara',     m2: 8400, tur: 'Depo',   taseronId: 'TSR-004', ekipId: ['PRS-007','PRS-010','PRS-011'], operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'revizyon-istendi', faturaDurum: 'mutabakat-bekleniyor', kontrolTarihi: '2026-07-28', raporTarihi: '2026-08-03', raporTeslimTarihi: null,     sonrakiKontrol: '2027-07-28', yetkiliId: 'KSI-008', adres: 'Sanayi Mah. 11. Cad. No: 129, Gebze / Kocaeli (kurgusal)' },

    { id: 'LOK-0113', kod: 'LOK-0113', musteriKod: 'ZE-006', musteriId: 'MST-001', markaId: 'MRK-B', projeId: 'PRJ-2026-005', ad: 'Zambak Ekspres Beşiktaş',            il: 'İstanbul', ilce: 'Beşiktaş',    bolge: 'Marmara',     m2: 320,  tur: 'Market', taseronId: null,      ekipId: [],                    operasyonDurum: 'bilgi-bekleniyor',   raporDurum: 'baslatilmadi',       faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: null,       raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: null,      adres: 'Örnek Mah. 4. Sok. No: 6, Beşiktaş / İstanbul (kurgusal)' },
    { id: 'LOK-0114', kod: 'LOK-0114', musteriKod: 'ZE-011', musteriId: 'MST-001', markaId: 'MRK-B', projeId: 'PRJ-2026-005', ad: 'Zambak Ekspres Alsancak',            il: 'İzmir',    ilce: 'Konak',       bolge: 'Ege',         m2: 280,  tur: 'Market', taseronId: null,      ekipId: [],                    operasyonDurum: 'iptal',              raporDurum: 'baslatilmadi',       faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: null,       raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: null,      adres: 'Örnek Mah. 8. Sok. No: 11, Konak / İzmir (kurgusal)', not: 'Kira sözleşmesi feshedildiği için açılıştan vazgeçildi; kapsamdan çıkarıldı.' },
    { id: 'LOK-0115', kod: 'LOK-0115', musteriKod: 'ZM-133', musteriId: 'MST-001', markaId: 'MRK-A', projeId: 'PRJ-2026-001', ad: 'Zambak Market Bodrum Sezonluk Şube', il: 'Muğla',    ilce: 'Bodrum',      bolge: 'Ege',         m2: 640,  tur: 'Market', taseronId: 'TSR-001', ekipId: [],                    operasyonDurum: 'kapsam-disi',        raporDurum: 'baslatilmadi',       faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: null,       raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: null,      adres: 'Örnek Mah. 1. Sok. No: 133, Bodrum / Muğla (kurgusal)', not: 'Sezonluk şube; kasım–mart arası kapalı olduğu için bu dönem kapsam dışı bırakıldı.' },

    { id: 'LOK-0201', kod: 'LOK-0201', musteriKod: 'AD-01', musteriId: 'MST-002', markaId: 'MRK-C', projeId: 'PRJ-2026-002', ad: 'AnadoluDepo Gebze Antrepo',           il: 'Kocaeli',  ilce: 'Gebze',       bolge: 'Marmara',     m2: 14500, tur: 'Antrepo', taseronId: 'TSR-004', ekipId: ['PRS-007','PRS-010'], operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'teslim-edildi',    faturaDurum: 'kismen-faturalandi', kontrolTarihi: '2026-04-21', raporTarihi: '2026-04-28', raporTeslimTarihi: '2026-05-04', sonrakiKontrol: '2027-04-21', yetkiliId: 'KSI-012', adres: 'Serbest Bölge 3. Cad. No: 1, Gebze / Kocaeli (kurgusal)' },
    { id: 'LOK-0202', kod: 'LOK-0202', musteriKod: 'AD-02', musteriId: 'MST-002', markaId: 'MRK-C', projeId: 'PRJ-2026-002', ad: 'AnadoluDepo Esenyurt Dağıtım Merkezi', il: 'İstanbul', ilce: 'Esenyurt',   bolge: 'Marmara',     m2: 9800,  tur: 'Depo',    taseronId: 'TSR-004', ekipId: ['PRS-007'],           operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'imzalandi',        faturaDurum: 'faturaya-hazir',     kontrolTarihi: '2026-08-10', raporTarihi: '2026-08-14', raporTeslimTarihi: null,        sonrakiKontrol: '2027-08-10', yetkiliId: 'KSI-013', adres: 'Sanayi Mah. 24. Sok. No: 2, Esenyurt / İstanbul (kurgusal)' },
    { id: 'LOK-0203', kod: 'LOK-0203', musteriKod: 'AD-03', musteriId: 'MST-002', markaId: 'MRK-C', projeId: 'PRJ-2026-002', ad: 'AnadoluDepo Kemalpaşa Deposu',        il: 'İzmir',    ilce: 'Kemalpaşa',   bolge: 'Ege',         m2: 7200,  tur: 'Depo',    taseronId: 'TSR-001', ekipId: ['PRS-008','PRS-011'], operasyonDurum: 'planlandi',          raporDurum: 'baslatilmadi',     faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: '2026-08-20', raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: null,      adres: 'OSB 5. Cad. No: 3, Kemalpaşa / İzmir (kurgusal)' },
    { id: 'LOK-0204', kod: 'LOK-0204', musteriKod: 'AD-04', musteriId: 'MST-002', markaId: 'MRK-C', projeId: 'PRJ-2026-002', ad: 'AnadoluDepo Sincan Lojistik Üssü',    il: 'Ankara',   ilce: 'Sincan',      bolge: 'İç Anadolu',  m2: 11200, tur: 'Depo',    taseronId: 'TSR-003', ekipId: [],                    operasyonDurum: 'envanter-bekleniyor', raporDurum: 'baslatilmadi',    faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: null,       raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: null,      adres: 'Lojistik OSB 2. Cad. No: 4, Sincan / Ankara (kurgusal)', not: 'Raf sistemi metrekaresi ve forklift adedi müşteriden bekleniyor; ön envanter şablonu uygulandı.' },
    { id: 'LOK-0205', kod: 'LOK-0205', musteriKod: 'AD-05', musteriId: 'MST-002', markaId: 'MRK-C', projeId: 'PRJ-2026-002', ad: 'AnadoluDepo Mersin Liman Antrepo',    il: 'Mersin',   ilce: 'Akdeniz',     bolge: 'Akdeniz',     m2: 16800, tur: 'Antrepo', taseronId: 'TSR-001', ekipId: ['PRS-009','PRS-010'], operasyonDurum: 'planlandi',          raporDurum: 'baslatilmadi',     faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: '2026-08-18', raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: 'KSI-014', adres: 'Liman Sahası A Blok, Akdeniz / Mersin (kurgusal)' },
    { id: 'LOK-0206', kod: 'LOK-0206', musteriKod: 'AD-06', musteriId: 'MST-002', markaId: 'MRK-C', projeId: 'PRJ-2026-002', ad: 'AnadoluDepo Samsun Soğuk Hava Deposu', il: 'Samsun',  ilce: 'Tekkeköy',    bolge: 'Karadeniz',   m2: 5400,  tur: 'Soğuk hava deposu', taseronId: 'TSR-002', ekipId: [],          operasyonDurum: 'tasiniyor',          raporDurum: 'baslatilmadi',     faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: null,       raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: null,      adres: 'OSB 1. Cad. No: 6, Tekkeköy / Samsun (kurgusal)', not: 'Depo faaliyeti yeni adrese taşınıyor; adres ve envanter güncellemesi sonrası planlanacak.' },

    { id: 'LOK-0301', kod: 'LOK-0301', musteriKod: 'EG-F1', musteriId: 'MST-003', markaId: 'MRK-D', projeId: 'PRJ-2026-003', ad: 'Efe Gıda Manisa Üretim Tesisi',       il: 'Manisa',   ilce: 'Turgutlu',    bolge: 'Ege',         m2: 21500, tur: 'Fabrika', taseronId: 'TSR-001', ekipId: ['PRS-004','PRS-009'], operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'teknik-incelemede', faturaDurum: 'mutabakat-bekleniyor', kontrolTarihi: '2026-08-04', raporTarihi: '2026-08-10', raporTeslimTarihi: null,       sonrakiKontrol: '2027-08-04', yetkiliId: 'KSI-017', adres: 'OSB 7. Sok. No: 5, Turgutlu / Manisa (kurgusal)' },
    { id: 'LOK-0302', kod: 'LOK-0302', musteriKod: 'EG-F2', musteriId: 'MST-003', markaId: 'MRK-D', projeId: 'PRJ-2026-003', ad: 'Efe Gıda Balıkesir Süt Ürünleri Fabrikası', il: 'Balıkesir', ilce: 'Merkez', bolge: 'Marmara',   m2: 13400, tur: 'Fabrika', taseronId: 'TSR-004', ekipId: ['PRS-009'],           operasyonDurum: 'planlandi',          raporDurum: 'baslatilmadi',     faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: '2026-08-26', raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: 'KSI-018', adres: 'OSB 3. Cad. No: 8, Merkez / Balıkesir (kurgusal)' },
    { id: 'LOK-0303', kod: 'LOK-0303', musteriKod: 'EG-F3', musteriId: 'MST-003', markaId: 'MRK-D', projeId: 'PRJ-2026-003', ad: 'Efe Gıda Çorlu Konserve Fabrikası',   il: 'Tekirdağ', ilce: 'Çorlu',       bolge: 'Marmara',     m2: 9600,  tur: 'Fabrika', taseronId: 'TSR-004', ekipId: [],                    operasyonDurum: 'iletisime-gecildi',  raporDurum: 'baslatilmadi',     faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: null,       raporTarihi: null,       raporTeslimTarihi: null,        sonrakiKontrol: null,        yetkiliId: null,      adres: 'OSB 9. Sok. No: 12, Çorlu / Tekirdağ (kurgusal)' },
    { id: 'LOK-0304', kod: 'LOK-0304', musteriKod: 'EG-D1', musteriId: 'MST-003', markaId: 'MRK-D', projeId: 'PRJ-2026-003', ad: 'Efe Gıda Manisa Mamul Deposu',        il: 'Manisa',   ilce: 'Turgutlu',    bolge: 'Ege',         m2: 6800,  tur: 'Depo',    taseronId: 'TSR-001', ekipId: ['PRS-008'],           operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'onaylandi',        faturaDurum: 'faturaya-hazir',     kontrolTarihi: '2026-08-12', raporTarihi: '2026-08-14', raporTeslimTarihi: null,        sonrakiKontrol: '2027-08-12', yetkiliId: null,      adres: 'OSB 7. Sok. No: 5/B, Turgutlu / Manisa (kurgusal)' },

    { id: 'LOK-0116', kod: 'LOK-0116', musteriKod: 'ZM-140', musteriId: 'MST-001', markaId: 'MRK-A', projeId: null, ad: 'Zambak Market Pendik Şubesi',        il: 'İstanbul', ilce: 'Pendik',      bolge: 'Marmara',     m2: 1520, tur: 'Market', taseronId: null, ekipId: [], operasyonDurum: 'bilgi-bekleniyor', raporDurum: 'baslatilmadi', faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: null, raporTarihi: null, raporTeslimTarihi: null, sonrakiKontrol: null, yetkiliId: null, adres: 'Örnek Mah. 15. Sok. No: 140, Pendik / İstanbul (kurgusal)', not: 'Ana lokasyon rehberinde kayıtlı; henüz hiçbir kontrol projesine dâhil edilmedi.' },
    { id: 'LOK-0117', kod: 'LOK-0117', musteriKod: 'AD-07', musteriId: 'MST-002', markaId: 'MRK-C', projeId: null, ad: 'AnadoluDepo Eskişehir Aktarma Merkezi', il: 'Eskişehir', ilce: 'Odunpazarı', bolge: 'İç Anadolu', m2: 4200, tur: 'Depo',   taseronId: null, ekipId: [], operasyonDurum: 'bilgi-bekleniyor', raporDurum: 'baslatilmadi', faturaDurum: 'faturaya-uygun-degil', kontrolTarihi: null, raporTarihi: null, raporTeslimTarihi: null, sonrakiKontrol: null, yetkiliId: null, adres: 'OSB 4. Cad. No: 7, Odunpazarı / Eskişehir (kurgusal)', not: 'Yeni açılan aktarma merkezi; 2027 kampanyasına dâhil edilmesi değerlendiriliyor.' }
  ];

  /* ---------------------------------------------------------------
     TAŞERONLAR — 4 firma
     --------------------------------------------------------------- */
  var taseronlar = [
    { id: 'TSR-001', kod: 'TSR-001', unvan: 'Batı Teknik Muayene Ltd. Şti.',      kisaAd: 'Batı Teknik',    bolgeler: ['Ege', 'Akdeniz'],           kapsam: ['KAT-01','KAT-03','KAT-04','KAT-05','KAT-06'], yetkili: 'Ergün Salman',   telefon: '0 (232) 000 10 01', eposta: 'ergun.salman@batiteknik.test', durum: 'aktif',   fiyatListesiId: 'FL-TSR-BATI', odemeKurali: 'musteri-tahsilati-sonrasi', masrafSahibi: 'taseron', performans: 92, sozlesmeBitis: '2026-12-31', personelSayisi: 9,  cihazSayisi: 7 },
    { id: 'TSR-002', kod: 'TSR-002', unvan: 'Kuzey Kontrol Mühendislik Ltd. Şti.', kisaAd: 'Kuzey Kontrol', bolgeler: ['Karadeniz'],                 kapsam: ['KAT-01','KAT-04','KAT-05','KAT-09'],          yetkili: 'Sibel Karadeniz', telefon: '0 (362) 000 10 02', eposta: 'sibel.karadeniz@kuzeykontrol.test', durum: 'aktif', fiyatListesiId: 'FL-TSR-KUZY', odemeKurali: 'musteri-tahsilati-sonrasi', masrafSahibi: 'taseron', performans: 78, sozlesmeBitis: '2026-12-31', personelSayisi: 4,  cihazSayisi: 3 },
    { id: 'TSR-003', kod: 'TSR-003', unvan: 'Anadolu Muayene ve Test A.Ş.',        kisaAd: 'Anadolu Muayene', bolgeler: ['İç Anadolu'],              kapsam: ['KAT-01','KAT-02','KAT-03','KAT-04','KAT-05','KAT-06','KAT-09'], yetkili: 'Yavuz Ergüder', telefon: '0 (312) 000 10 03', eposta: 'yavuz.erguder@anadolumuayene.test', durum: 'aktif', fiyatListesiId: 'FL-TSR-ANDL', odemeKurali: 'fatura-vadesinde', masrafSahibi: 'gavia', performans: 88, sozlesmeBitis: '2027-01-31', personelSayisi: 12, cihazSayisi: 11 },
    { id: 'TSR-004', kod: 'TSR-004', unvan: 'Marmara Test Hizmetleri Ltd. Şti.',   kisaAd: 'Marmara Test',  bolgeler: ['Marmara'],                   kapsam: ['KAT-01','KAT-02','KAT-03','KAT-04','KAT-05','KAT-06','KAT-07','KAT-09','KAT-10'], yetkili: 'Aydın Perçin', telefon: '0 (216) 000 10 04', eposta: 'aydin.percin@marmaratest.test', durum: 'aktif', fiyatListesiId: 'FL-TSR-MRMR', odemeKurali: 'musteri-tahsilati-sonrasi', masrafSahibi: 'paylasimli', performans: 95, sozlesmeBitis: '2026-12-31', personelSayisi: 16, cihazSayisi: 14 }
  ];

  var taseronPersonelleri = [
    { id: 'TPR-001', taseronId: 'TSR-001', ad: 'Kaan Özdilek',    gorev: 'Muayene Personeli', yetkinlikler: ['YTK-01','YTK-06'], belgeBitis: '2027-02-14' },
    { id: 'TPR-002', taseronId: 'TSR-001', ad: 'Serap Yalçınkaya', gorev: 'Muayene Personeli', yetkinlikler: ['YTK-02'],          belgeBitis: '2026-09-30' },
    { id: 'TPR-003', taseronId: 'TSR-002', ad: 'Ufuk Demirtaş',   gorev: 'Muayene Personeli', yetkinlikler: ['YTK-04','YTK-05'], belgeBitis: '2027-05-08' },
    { id: 'TPR-004', taseronId: 'TSR-003', ad: 'Gonca Işıkçı',    gorev: 'Kıdemli Muayene Personeli', yetkinlikler: ['YTK-01','YTK-03','YTK-04'], belgeBitis: '2028-01-22' },
    { id: 'TPR-005', taseronId: 'TSR-003', ad: 'Mert Sağlamer',   gorev: 'Muayene Personeli', yetkinlikler: ['YTK-02','YTK-06'], belgeBitis: '2027-11-03' },
    { id: 'TPR-006', taseronId: 'TSR-004', ad: 'Ceyda Muratlı',   gorev: 'Teknik Sorumlu',    yetkinlikler: ['YTK-01','YTK-02','YTK-05'], belgeBitis: '2028-04-17' },
    { id: 'TPR-007', taseronId: 'TSR-004', ad: 'Bülent Akkuş',    gorev: 'Muayene Personeli', yetkinlikler: ['YTK-03','YTK-07'], belgeBitis: '2027-08-29' },
    { id: 'TPR-008', taseronId: 'TSR-004', ad: 'Zeliha Onbaşı',   gorev: 'Muayene Personeli', yetkinlikler: ['YTK-06','YTK-04'], belgeBitis: '2026-10-11' }
  ];

  /* ---------------------------------------------------------------
     ÖLÇÜM CİHAZLARI ve KALİBRASYONLAR — 12 cihaz
     Kalibrasyonu geçmiş cihaz iş emrine atanamaz (demo-api kuralı).
     --------------------------------------------------------------- */
  var olcumCihazlari = [
    { id: 'CHZ-001', kod: 'CHZ-001', ad: 'Topraklama Direnci Ölçer',       marka: 'Voltek',   model: 'TE-410',  seri: 'VT-410-00187', kapsam: ['KAT-04'],          zimmet: 'PRS-008', kalibrasyonTarihi: '2026-03-12', kalibrasyonBitis: '2027-03-12', kurulus: 'Ulusal Kalibrasyon Lab. (kurgusal)', durum: 'kullanimda' },
    { id: 'CHZ-002', kod: 'CHZ-002', ad: 'İzolasyon Test Cihazı',          marka: 'Voltek',   model: 'IR-2500', seri: 'VT-2500-00042', kapsam: ['KAT-04'],         zimmet: 'PRS-008', kalibrasyonTarihi: '2026-01-28', kalibrasyonBitis: '2027-01-28', kurulus: 'Ulusal Kalibrasyon Lab. (kurgusal)', durum: 'kullanimda' },
    { id: 'CHZ-003', kod: 'CHZ-003', ad: 'Termal Kamera',                  marka: 'Termax',   model: 'TC-320',  seri: 'TX-320-01104', kapsam: ['KAT-04','KAT-02'], zimmet: 'PRS-004', kalibrasyonTarihi: '2025-11-05', kalibrasyonBitis: '2026-11-05', kurulus: 'Ege Metroloji Merkezi (kurgusal)', durum: 'kullanimda' },
    { id: 'CHZ-004', kod: 'CHZ-004', ad: 'Ultrasonik Kalınlık Ölçer',      marka: 'Sonik',    model: 'UT-90',   seri: 'SN-90-00318',  kapsam: ['KAT-03'],          zimmet: 'PRS-009', kalibrasyonTarihi: '2026-02-19', kalibrasyonBitis: '2027-02-19', kurulus: 'Ege Metroloji Merkezi (kurgusal)', durum: 'kullanimda' },
    { id: 'CHZ-005', kod: 'CHZ-005', ad: 'Manometre Kalibratörü',          marka: 'Presslab', model: 'PC-60',   seri: 'PL-60-00073',  kapsam: ['KAT-03'],          zimmet: 'PRS-009', kalibrasyonTarihi: '2026-05-30', kalibrasyonBitis: '2027-05-30', kurulus: 'Ulusal Kalibrasyon Lab. (kurgusal)', durum: 'kullanimda' },
    { id: 'CHZ-006', kod: 'CHZ-006', ad: 'Yük Test Kiti (Su Torbası 5 t)', marka: 'Kalibra',  model: 'LT-5000', seri: 'KB-5000-00021', kapsam: ['KAT-01'],         zimmet: 'PRS-007', kalibrasyonTarihi: '2025-09-08', kalibrasyonBitis: '2026-09-08', kurulus: 'Marmara Test Metroloji (kurgusal)', durum: 'kullanimda' },
    { id: 'CHZ-007', kod: 'CHZ-007', ad: 'Dijital Dinamometre',            marka: 'Kalibra',  model: 'DN-100',  seri: 'KB-100-00456', kapsam: ['KAT-01'],          zimmet: 'PRS-007', kalibrasyonTarihi: '2026-04-16', kalibrasyonBitis: '2027-04-16', kurulus: 'Marmara Test Metroloji (kurgusal)', durum: 'kullanimda' },
    { id: 'CHZ-008', kod: 'CHZ-008', ad: 'Lüksmetre',                      marka: 'Meterex',  model: 'LX-220',  seri: 'MX-220-00891', kapsam: ['KAT-07','KAT-09'], zimmet: 'PRS-010', kalibrasyonTarihi: '2026-06-11', kalibrasyonBitis: '2027-06-11', kurulus: 'Ulusal Kalibrasyon Lab. (kurgusal)', durum: 'kullanimda' },
    { id: 'CHZ-009', kod: 'CHZ-009', ad: 'Ortam Ölçüm Seti (Gaz Dedektörü)', marka: 'Meterex', model: 'GA-500', seri: 'MX-500-00234', kapsam: ['KAT-07','KAT-08'], zimmet: 'PRS-009', kalibrasyonTarihi: '2026-07-02', kalibrasyonBitis: '2027-07-02', kurulus: 'Ege Metroloji Merkezi (kurgusal)', durum: 'kullanimda' },
    { id: 'CHZ-010', kod: 'CHZ-010', ad: 'Ses Seviyesi Ölçer',             marka: 'Meterex',  model: 'SL-130',  seri: 'MX-130-00567', kapsam: ['KAT-07'],          zimmet: 'PRS-009', kalibrasyonTarihi: '2025-12-15', kalibrasyonBitis: '2026-09-15', kurulus: 'Ulusal Kalibrasyon Lab. (kurgusal)', durum: 'kullanimda' },
    { id: 'CHZ-011', kod: 'CHZ-011', ad: 'Toz Ölçüm Pompası',              marka: 'Meterex',  model: 'DP-70',   seri: 'MX-70-00129',  kapsam: ['KAT-07'],          zimmet: 'PRS-009', kalibrasyonTarihi: '2026-03-27', kalibrasyonBitis: '2027-03-27', kurulus: 'Ege Metroloji Merkezi (kurgusal)', durum: 'serviste' },
    { id: 'CHZ-012', kod: 'CHZ-012', ad: 'Kaçak Akım Rölesi Test Cihazı',  marka: 'Voltek',   model: 'RC-15',   seri: 'VT-15-00602',  kapsam: ['KAT-04'],          zimmet: 'PRS-011', kalibrasyonTarihi: '2025-06-20', kalibrasyonBitis: '2026-06-20', kurulus: 'Ulusal Kalibrasyon Lab. (kurgusal)', durum: 'kalibrasyon-gecmis' }
  ];

  var kalibrasyonlar = [
    { id: 'KLB-001', cihazId: 'CHZ-001', tarih: '2026-03-12', bitis: '2027-03-12', kurulus: 'Ulusal Kalibrasyon Lab. (kurgusal)', sertifikaNo: 'KAL-2026-00841', sonuc: 'uygun',  maliyet: 1850, aciklama: 'Yıllık periyodik kalibrasyon; sapma tolerans içinde.' },
    { id: 'KLB-002', cihazId: 'CHZ-002', tarih: '2026-01-28', bitis: '2027-01-28', kurulus: 'Ulusal Kalibrasyon Lab. (kurgusal)', sertifikaNo: 'KAL-2026-00219', sonuc: 'uygun',  maliyet: 2100, aciklama: 'Yıllık periyodik kalibrasyon.' },
    { id: 'KLB-003', cihazId: 'CHZ-003', tarih: '2025-11-05', bitis: '2026-11-05', kurulus: 'Ege Metroloji Merkezi (kurgusal)',   sertifikaNo: 'KAL-2025-03318', sonuc: 'uygun',  maliyet: 4200, aciklama: 'Sıcaklık referans noktalarında doğrulama yapıldı.' },
    { id: 'KLB-004', cihazId: 'CHZ-004', tarih: '2026-02-19', bitis: '2027-02-19', kurulus: 'Ege Metroloji Merkezi (kurgusal)',   sertifikaNo: 'KAL-2026-00507', sonuc: 'uygun',  maliyet: 1600, aciklama: 'Prob değişimi sonrası yeniden kalibre edildi.' },
    { id: 'KLB-005', cihazId: 'CHZ-005', tarih: '2026-05-30', bitis: '2027-05-30', kurulus: 'Ulusal Kalibrasyon Lab. (kurgusal)', sertifikaNo: 'KAL-2026-01744', sonuc: 'uygun',  maliyet: 2450, aciklama: 'Yıllık periyodik kalibrasyon.' },
    { id: 'KLB-006', cihazId: 'CHZ-006', tarih: '2025-09-08', bitis: '2026-09-08', kurulus: 'Marmara Test Metroloji (kurgusal)',  sertifikaNo: 'KAL-2025-02690', sonuc: 'uygun',  maliyet: 5800, aciklama: 'Su torbası hacim doğrulaması yapıldı. Yenileme 22 gün içinde gerekiyor.' },
    { id: 'KLB-007', cihazId: 'CHZ-007', tarih: '2026-04-16', bitis: '2027-04-16', kurulus: 'Marmara Test Metroloji (kurgusal)',  sertifikaNo: 'KAL-2026-01203', sonuc: 'uygun',  maliyet: 1950, aciklama: 'Yıllık periyodik kalibrasyon.' },
    { id: 'KLB-008', cihazId: 'CHZ-008', tarih: '2026-06-11', bitis: '2027-06-11', kurulus: 'Ulusal Kalibrasyon Lab. (kurgusal)', sertifikaNo: 'KAL-2026-01988', sonuc: 'uygun',  maliyet: 1250, aciklama: 'Yıllık periyodik kalibrasyon.' },
    { id: 'KLB-009', cihazId: 'CHZ-009', tarih: '2026-07-02', bitis: '2027-07-02', kurulus: 'Ege Metroloji Merkezi (kurgusal)',   sertifikaNo: 'KAL-2026-02240', sonuc: 'uygun',  maliyet: 3300, aciklama: 'Gaz sensörleri yenilendi, çoklu nokta doğrulaması yapıldı.' },
    { id: 'KLB-010', cihazId: 'CHZ-010', tarih: '2025-12-15', bitis: '2026-09-15', kurulus: 'Ulusal Kalibrasyon Lab. (kurgusal)', sertifikaNo: 'KAL-2025-03901', sonuc: 'sartli', maliyet: 2750, aciklama: 'Yüksek frekans bandında sapma; geçerlilik 9 aya kısaltıldı.' },
    { id: 'KLB-011', cihazId: 'CHZ-011', tarih: '2026-03-27', bitis: '2027-03-27', kurulus: 'Ege Metroloji Merkezi (kurgusal)',   sertifikaNo: 'KAL-2026-00963', sonuc: 'uygun',  maliyet: 2200, aciklama: 'Cihaz hâlen serviste; debi ayar arızası giderilmeyi bekliyor.' },
    { id: 'KLB-012', cihazId: 'CHZ-012', tarih: '2025-06-20', bitis: '2026-06-20', kurulus: 'Ulusal Kalibrasyon Lab. (kurgusal)', sertifikaNo: 'KAL-2025-01652', sonuc: 'uygun',  maliyet: 1400, aciklama: 'Geçerlilik süresi 20 Haziran 2026 tarihinde doldu; cihaz kullanım dışı.' },
    { id: 'KLB-013', cihazId: 'CHZ-001', tarih: '2025-03-10', bitis: '2026-03-10', kurulus: 'Ulusal Kalibrasyon Lab. (kurgusal)', sertifikaNo: 'KAL-2025-00776', sonuc: 'uygun',  maliyet: 1700, aciklama: 'Önceki dönem kalibrasyonu (arşiv).' },
    { id: 'KLB-014', cihazId: 'CHZ-006', tarih: '2024-09-04', bitis: '2025-09-04', kurulus: 'Marmara Test Metroloji (kurgusal)',  sertifikaNo: 'KAL-2024-02411', sonuc: 'uygun',  maliyet: 5200, aciklama: 'Önceki dönem kalibrasyonu (arşiv).' }
  ];

  /* ---------------------------------------------------------------
     LOKASYON HİZMET KAPSAMI ve ÖN ENVANTER
     Şablon + lokasyon bazlı miktar; şablon uygulaması "ön envanter"
     kaynağı olarak işaretlenir (kaynak: 'sablon' | 'musteri' | 'kesif').
     --------------------------------------------------------------- */
  var envanterSablonlari = [
    { id: 'SBL-ENV-MARKET',  ad: 'Zincir Market Standart Şablonu', tur: 'Market',
      aciklama: 'Zambak Market 1.400–2.100 m² şubeleri için Kartal ve Bornova keşiflerinden türetilmiştir.',
      kaynakLokasyonlar: ['LOK-0101', 'LOK-0103'], olusturma: '2026-02-14', olusturanId: 'PRS-003',
      kalemler: [
        { hizmetId: 'HZM-YNG-001', miktar: 1 },   { hizmetId: 'HZM-YNG-003', miktar: 6 },
        { hizmetId: 'HZM-YNG-006', miktar: 1 },   { hizmetId: 'HZM-ELK-001', miktar: 1 },
        { hizmetId: 'HZM-ELK-003', miktar: 1 },   { hizmetId: 'HZM-ELK-004', miktar: 9 },
        { hizmetId: 'HZM-ELK-006', miktar: 1 },   { hizmetId: 'HZM-ACL-001', miktar: 26 },
        { hizmetId: 'HZM-ACL-002', miktar: 15 },  { hizmetId: 'HZM-RAF-004', miktar: 760 },
        { hizmetId: 'HZM-KLD-002', miktar: 2 },   { hizmetId: 'HZM-KLD-003', miktar: 3 },
        { hizmetId: 'HZM-DGR-003', miktar: 2 },   { hizmetId: 'HZM-DGR-002', miktar: 4 }
      ] },
    { id: 'SBL-ENV-DEPO', ad: 'Depo ve Dağıtım Merkezi Şablonu', tur: 'Depo',
      aciklama: 'AnadoluDepo Gebze ve Esenyurt keşiflerinden türetilmiştir; metrekare bazlı kalemler alan ile ölçeklenir.',
      kaynakLokasyonlar: ['LOK-0201', 'LOK-0202'], olusturma: '2026-03-20', olusturanId: 'PRS-003',
      kalemler: [
        { hizmetId: 'HZM-RAF-001', miktar: 5800 }, { hizmetId: 'HZM-RAF-003', miktar: 420 },
        { hizmetId: 'HZM-KLD-001-A', miktar: 4 },  { hizmetId: 'HZM-KLD-002', miktar: 6 },
        { hizmetId: 'HZM-KLD-006', miktar: 6 },    { hizmetId: 'HZM-KLD-004', miktar: 2 },
        { hizmetId: 'HZM-YNG-001', miktar: 1 },    { hizmetId: 'HZM-YNG-002', miktar: 1 },
        { hizmetId: 'HZM-YNG-003', miktar: 14 },   { hizmetId: 'HZM-YNG-004', miktar: 1 },
        { hizmetId: 'HZM-ELK-001', miktar: 1 },    { hizmetId: 'HZM-ELK-003', miktar: 1 },
        { hizmetId: 'HZM-ELK-004', miktar: 16 },   { hizmetId: 'HZM-ELK-005', miktar: 1 },
        { hizmetId: 'HZM-ELK-006', miktar: 2 },    { hizmetId: 'HZM-ELK-007', miktar: 1 },
        { hizmetId: 'HZM-ACL-001', miktar: 48 },   { hizmetId: 'HZM-ACL-002', miktar: 30 },
        { hizmetId: 'HZM-ACL-003', miktar: 1 },    { hizmetId: 'HZM-BSK-001', miktar: 2 },
        { hizmetId: 'HZM-BSK-002', miktar: 2 }
      ] },
    { id: 'SBL-ENV-FABRIKA', ad: 'Üretim Tesisi Şablonu', tur: 'Fabrika',
      aciklama: 'Efe Gıda Manisa tesisinin tam keşfinden türetilmiştir; basınçlı kap, makine ve ortam ölçümleri içerir.',
      kaynakLokasyonlar: ['LOK-0301'], olusturma: '2026-04-08', olusturanId: 'PRS-004',
      kalemler: [
        { hizmetId: 'HZM-BSK-001', miktar: 4 },   { hizmetId: 'HZM-BSK-002', miktar: 3 },
        { hizmetId: 'HZM-BSK-004', miktar: 2 },   { hizmetId: 'HZM-BSK-005', miktar: 1 },
        { hizmetId: 'HZM-BSK-006', miktar: 1 },   { hizmetId: 'HZM-BSK-008', miktar: 12 },
        { hizmetId: 'HZM-MKN-001', miktar: 6 },   { hizmetId: 'HZM-MKN-002', miktar: 3 },
        { hizmetId: 'HZM-MKN-003', miktar: 5 },   { hizmetId: 'HZM-MKN-004', miktar: 2 },
        { hizmetId: 'HZM-MKN-005', miktar: 4 },   { hizmetId: 'HZM-KLD-001-D', miktar: 3 },
        { hizmetId: 'HZM-KLD-002', miktar: 5 },   { hizmetId: 'HZM-KLD-004', miktar: 4 },
        { hizmetId: 'HZM-KLD-005', miktar: 2 },   { hizmetId: 'HZM-YNG-001', miktar: 1 },
        { hizmetId: 'HZM-YNG-002', miktar: 2 },   { hizmetId: 'HZM-YNG-003', miktar: 22 },
        { hizmetId: 'HZM-YNG-004', miktar: 1 },   { hizmetId: 'HZM-YNG-005', miktar: 1 },
        { hizmetId: 'HZM-ELK-001', miktar: 1 },   { hizmetId: 'HZM-ELK-002', miktar: 3 },
        { hizmetId: 'HZM-ELK-003', miktar: 1 },   { hizmetId: 'HZM-ELK-004', miktar: 24 },
        { hizmetId: 'HZM-ELK-005', miktar: 2 },   { hizmetId: 'HZM-ELK-006', miktar: 3 },
        { hizmetId: 'HZM-ELK-007', miktar: 1 },   { hizmetId: 'HZM-ELK-008', miktar: 2 },
        { hizmetId: 'HZM-ACL-001', miktar: 84 },  { hizmetId: 'HZM-ACL-002', miktar: 46 },
        { hizmetId: 'HZM-ACL-003', miktar: 1 },   { hizmetId: 'HZM-HJY-001', miktar: 1 },
        { hizmetId: 'HZM-HJY-002', miktar: 1 },   { hizmetId: 'HZM-HJY-003', miktar: 1 },
        { hizmetId: 'HZM-HJY-004', miktar: 1 },   { hizmetId: 'HZM-PKD-002', miktar: 1 },
        { hizmetId: 'HZM-RAF-001', miktar: 1800 },{ hizmetId: 'HZM-DGR-001', miktar: 1 },
        { hizmetId: 'HZM-DGR-002', miktar: 6 }
      ] }
  ];

  /* lokasyon → şablon eşleşmesi ve alan katsayısı (metrekare bazlı kalemler ölçeklenir) */
  var lokasyonKapsamAyarlari = {
    'LOK-0101': { sablon: 'SBL-ENV-MARKET',  kaynak: 'kesif',    olcek: 1.00, ekstra: [] },
    'LOK-0102': { sablon: 'SBL-ENV-MARKET',  kaynak: 'musteri',  olcek: 1.13, ekstra: [{ hizmetId: 'HZM-KLD-005', miktar: 1 }] },
    'LOK-0103': { sablon: 'SBL-ENV-MARKET',  kaynak: 'kesif',    olcek: 0.88, ekstra: [] },
    'LOK-0104': { sablon: 'SBL-ENV-MARKET',  kaynak: 'sablon',   olcek: 0.80, ekstra: [] },
    'LOK-0105': { sablon: 'SBL-ENV-MARKET',  kaynak: 'sablon',   olcek: 0.95, ekstra: [] },
    'LOK-0106': { sablon: 'SBL-ENV-MARKET',  kaynak: 'sablon',   olcek: 0.75, ekstra: [] },
    'LOK-0107': { sablon: 'SBL-ENV-MARKET',  kaynak: 'sablon',   olcek: 0.85, ekstra: [] },
    'LOK-0108': { sablon: 'SBL-ENV-MARKET',  kaynak: 'musteri',  olcek: 1.04, ekstra: [{ hizmetId: 'HZM-DGR-004', miktar: 2 }] },
    'LOK-0109': { sablon: 'SBL-ENV-MARKET',  kaynak: 'sablon',   olcek: 0.67, ekstra: [] },
    'LOK-0110': { sablon: 'SBL-ENV-MARKET',  kaynak: 'sablon',   olcek: 0.90, ekstra: [] },
    'LOK-0111': { sablon: 'SBL-ENV-MARKET',  kaynak: 'musteri',  olcek: 0.77, ekstra: [{ hizmetId: 'HZM-ELK-005', miktar: 1 }, { hizmetId: 'HZM-YNG-002', miktar: 1 }] },
    'LOK-0112': { sablon: 'SBL-ENV-DEPO',    kaynak: 'kesif',    olcek: 1.45, ekstra: [{ hizmetId: 'HZM-KLD-001-D', miktar: 2 }] },
    'LOK-0113': { sablon: 'SBL-ENV-MARKET',  kaynak: 'sablon',   olcek: 0.22, ekstra: [] },
    'LOK-0201': { sablon: 'SBL-ENV-DEPO',    kaynak: 'kesif',    olcek: 2.50, ekstra: [{ hizmetId: 'HZM-KLD-001-D', miktar: 4 }, { hizmetId: 'HZM-DGR-003', miktar: 6 }] },
    'LOK-0202': { sablon: 'SBL-ENV-DEPO',    kaynak: 'kesif',    olcek: 1.69, ekstra: [{ hizmetId: 'HZM-DGR-003', miktar: 4 }] },
    'LOK-0203': { sablon: 'SBL-ENV-DEPO',    kaynak: 'sablon',   olcek: 1.24, ekstra: [] },
    'LOK-0204': { sablon: 'SBL-ENV-DEPO',    kaynak: 'sablon',   olcek: 1.93, ekstra: [] },
    'LOK-0205': { sablon: 'SBL-ENV-DEPO',    kaynak: 'musteri',  olcek: 2.90, ekstra: [{ hizmetId: 'HZM-KLD-001-D', miktar: 6 }, { hizmetId: 'HZM-BSK-006', miktar: 1 }] },
    'LOK-0206': { sablon: 'SBL-ENV-DEPO',    kaynak: 'sablon',   olcek: 0.93, ekstra: [{ hizmetId: 'HZM-DGR-002', miktar: 8 }] },
    'LOK-0301': { sablon: 'SBL-ENV-FABRIKA', kaynak: 'kesif',    olcek: 1.00, ekstra: [] },
    'LOK-0302': { sablon: 'SBL-ENV-FABRIKA', kaynak: 'musteri',  olcek: 0.62, ekstra: [{ hizmetId: 'HZM-DGR-001', miktar: 1 }] },
    'LOK-0303': { sablon: 'SBL-ENV-FABRIKA', kaynak: 'sablon',   olcek: 0.45, ekstra: [] },
    'LOK-0304': { sablon: 'SBL-ENV-DEPO',    kaynak: 'kesif',    olcek: 1.17, ekstra: [] }
  };

  /* ---------------------------------------------------------------
     ENVANTER ÜRETİMİ — deterministik (sabit tohum; her yüklemede aynı)
     Şablon + ölçek + ekstra kalemler → lokasyon hizmet kapsamı satırları.
     --------------------------------------------------------------- */
  function tohum(s) {                       /* dizeden sabit sayı — rastgelelik yok */
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h;
  }
  function sapma(anahtar, aralik) {         /* -aralik..+aralik arası deterministik sapma */
    return (tohum(anahtar) % (aralik * 2 + 1)) - aralik;
  }
  function hizmetBul(id) {
    for (var i = 0; i < hizmetler.length; i++) if (hizmetler[i].id === id) return hizmetler[i];
    return null;
  }

  var lokasyonHizmetleri = [];              /* ön envanter / planlanan miktar satırları */
  (function uretEnvanter() {
    var sira = 1;
    Object.keys(lokasyonKapsamAyarlari).forEach(function (lokId) {
      var ayar = lokasyonKapsamAyarlari[lokId];
      var sablon = null;
      for (var s = 0; s < envanterSablonlari.length; s++) if (envanterSablonlari[s].id === ayar.sablon) sablon = envanterSablonlari[s];
      if (!sablon) return;
      var kalemler = sablon.kalemler.concat(ayar.ekstra || []);
      kalemler.forEach(function (k) {
        var h = hizmetBul(k.hizmetId);
        if (!h) return;
        var olcekli = k.miktar * ayar.olcek;
        var m;
        if (h.birim === 'metrekare') m = Math.round(olcekli / 10) * 10;
        else if (h.birim === 'sistem' || h.birim === 'dokuman' || h.birim === 'lokasyon' || h.birim === 'olcum-seti') m = Math.max(1, Math.round(olcekli));
        else m = Math.max(1, Math.round(olcekli) + sapma(lokId + k.hizmetId, olcekli > 20 ? 3 : 1));
        lokasyonHizmetleri.push({
          id: 'LHZ-' + String(sira++).padStart(4, '0'),
          lokasyonId: lokId, hizmetId: h.id,
          onEnvanterMiktar: m,
          planlananMiktar: m,
          kaynak: ayar.kaynak,
          sablonId: ayar.kaynak === 'sablon' ? sablon.id : null
        });
      });
    });
  })();

  /* ---------------------------------------------------------------
     TEKİL EKİPMAN KARTLARI — QR/barkod, seri no, kapasite, periyot
     Yalnız takip gerektiren 'adet' birimli ağır ekipmanlar kart açar.
     --------------------------------------------------------------- */
  var ekipmanMarkalari = {
    'HZM-KLD-001-D': [['Fortek', 'FD-30', '3.000 kg'], ['Lifmak', 'LD-25', '2.500 kg']],
    'HZM-KLD-001-A': [['Fortek', 'FA-18', '1.800 kg'], ['Lifmak', 'LA-20', '2.000 kg']],
    'HZM-KLD-002':   [['Palex', 'PT-20E', '2.000 kg'], ['Lifmak', 'TR-15E', '1.500 kg']],
    'HZM-KLD-004':   [['Zincirsan', 'CR-2T', '2.000 kg'], ['Kaldıraç', 'KC-1T', '1.000 kg']],
    'HZM-KLD-005':   [['Asansa', 'YA-1000', '1.000 kg'], ['Vertika', 'VY-1500', '1.500 kg']],
    'HZM-KLD-006':   [['Rampex', 'RD-60', '6.000 kg'], ['Dokmar', 'DL-60', '6.000 kg']],
    'HZM-BSK-001':   [['Presslab', 'HT-500', '500 L / 10 bar'], ['Tankor', 'TK-1000', '1.000 L / 11 bar']],
    'HZM-BSK-002':   [['Airtek', 'VS-30', '30 kW'], ['Kompresan', 'KV-22', '22 kW']],
    'HZM-BSK-004':   [['Kazanel', 'BK-2000', '2 ton/saat'], ['Termosan', 'TB-1500', '1,5 ton/saat']],
    'HZM-ELK-005':   [['Enerjen', 'JN-250', '250 kVA'], ['Gücsan', 'GS-400', '400 kVA']],
    'HZM-MKN-001':   [['Dolumsan', 'DS-8', '8 nozul'], ['Fillpro', 'FP-12', '12 nozul']],
    'HZM-MKN-003':   [['Paketsan', 'PS-40', '40 paket/dk'], ['Wrapmak', 'WM-25', '25 paket/dk']],
    'HZM-MKN-004':   [['Presan', 'HP-160', '160 ton'], ['Hidropres', 'HD-100', '100 ton']],
    'HZM-YNG-002':   [['Firepump', 'FP-90', '90 m³/saat'], ['Yangınsan', 'YP-120', '120 m³/saat']]
  };

  var ekipmanlar = [];
  (function uretEkipmanlar() {
    var sira = 1;
    lokasyonHizmetleri.forEach(function (lh) {
      var marka = ekipmanMarkalari[lh.hizmetId];
      if (!marka) return;                                 /* kart açılmayan hizmet */
      var lok = null;
      for (var i = 0; i < lokasyonlar.length; i++) if (lokasyonlar[i].id === lh.lokasyonId) lok = lokasyonlar[i];
      if (!lok) return;
      var h = hizmetBul(lh.hizmetId);
      var adet = Math.min(lh.planlananMiktar, 4);          /* kart sayısı sınırlı tutulur */
      for (var n = 1; n <= adet; n++) {
        var t = tohum(lh.id + n);
        var mm = marka[t % marka.length];
        var yil = 2013 + (t % 12);
        var durumHavuzu = ['aktif', 'aktif', 'aktif', 'aktif', 'bakimda', 'kullanim-disi'];
        ekipmanlar.push({
          id: 'EKP-' + String(sira).padStart(4, '0'),
          kod: 'EKP-' + String(sira).padStart(4, '0'),
          qr: 'GVT-' + lok.kod.replace('LOK-', '') + '-' + String(sira).padStart(4, '0'),
          ad: h.ad.replace(' Periyodik Kontrolü', '').replace(' Kontrolü', '').replace(' Fonksiyon Testi', ''),
          hizmetId: h.id, kategoriId: h.kat,
          marka: mm[0], model: mm[1], kapasite: mm[2],
          seri: mm[0].substring(0, 2).toUpperCase() + '-' + yil + '-' + String(1000 + (t % 8999)),
          uretimYili: yil,
          lokasyonId: lok.id, musteriId: lok.musteriId,
          durum: durumHavuzu[t % durumHavuzu.length],
          sonKontrol: lok.kontrolTarihi,
          periyotAy: h.periyotAy,
          sonrakiKontrol: null                              /* demo-api hesaplar: sonKontrol yoksa boş kalır */
        });
        sira++;
      }
    });
  })();

  /* ---------------------------------------------------------------
     MİKTAR MUTABAKATI — 13 kolon
     sahadaBulunan = planlanan + ilaveTespit − eksik
     kontrolEdilen = sahadaBulunan − gösterilmeyen
     faturalanabilir = min(kontrolEdilen, müşteriOnaylı)
     kalan = faturalanabilir − faturalanan
     --------------------------------------------------------------- */
  var mutabakatDurumlari = {
    'LOK-0101': 'onayli', 'LOK-0102': 'onayli', 'LOK-0103': 'onayli',
    'LOK-0104': 'bekliyor', 'LOK-0112': 'itirazli',
    'LOK-0201': 'onayli', 'LOK-0202': 'onayli',
    'LOK-0301': 'bekliyor', 'LOK-0304': 'onayli'
  };
  var faturalananOran = { 'LOK-0101': 1, 'LOK-0102': 1, 'LOK-0201': 0.55 };  /* LOK-0201 kısmi faturalama örneği */

  var mutabakat = [];
  (function uretMutabakat() {
    var sira = 1;
    lokasyonHizmetleri.forEach(function (lh) {
      var lok = null;
      for (var i = 0; i < lokasyonlar.length; i++) if (lokasyonlar[i].id === lh.lokasyonId) lok = lokasyonlar[i];
      if (!lok || lok.operasyonDurum !== 'kontrol-tamamlandi') return;
      var mDurum = mutabakatDurumlari[lok.id] || 'bekliyor';
      var pl = lh.planlananMiktar;
      var t = tohum(lh.id + 'mtb');
      var buyuk = pl > 20;
      var eksik = (t % 7 === 0) ? Math.max(1, Math.round(pl * (buyuk ? 0.04 : 0.2))) : 0;
      var ilave = (t % 5 === 0) ? Math.max(1, Math.round(pl * (buyuk ? 0.03 : 0.15))) : 0;
      var gosterilmeyen = (t % 11 === 0) ? Math.max(1, Math.round(pl * 0.05)) : 0;
      var musteriBildirimi = Math.max(0, pl - (t % 3 === 0 ? Math.round(pl * 0.08) : 0));
      var kesif = lh.kaynak === 'kesif' ? pl : null;
      var sahada = pl + ilave - eksik;
      var kontrolEdilen = sahada - gosterilmeyen;
      var onayli = mDurum === 'onayli' ? kontrolEdilen
                 : mDurum === 'itirazli' ? Math.max(0, kontrolEdilen - ilave)
                 : 0;
      var faturalanabilir = mDurum === 'bekliyor' ? 0 : Math.min(kontrolEdilen, onayli);
      var oran = faturalananOran[lok.id] || 0;
      var faturalanan = Math.round(faturalanabilir * oran);
      mutabakat.push({
        id: 'MTB-' + String(sira++).padStart(4, '0'),
        lokasyonId: lok.id, projeId: lok.projeId, hizmetId: lh.hizmetId,
        musteriBildirimi: musteriBildirimi,
        kesif: kesif,
        planlanan: pl,
        sahadaBulunan: sahada,
        kontrolEdilen: kontrolEdilen,
        gosterilmeyen: gosterilmeyen,
        eksik: eksik,
        ilaveTespit: ilave,
        musteriOnayli: onayli,
        faturalanabilir: faturalanabilir,
        faturalanan: faturalanan,
        kalan: faturalanabilir - faturalanan,
        durum: mDurum
      });
    });
  })();

  /* ---------------------------------------------------------------
     İŞ EMİRLERİ — 16 kayıt
     --------------------------------------------------------------- */
  var isEmirleri = [
    { id: 'IE-2026-0001', lokasyonId: 'LOK-0101', projeId: 'PRJ-2026-001', tarih: '2026-03-10', saat: '09:00', bitis: '2026-03-10', taseronId: 'TSR-004', ekipId: ['PRS-007','PRS-010'], cihazlar: ['CHZ-001','CHZ-007'], operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'teslim-edildi', musteriTarihOnayi: true,  hazirlikTamam: true,  raporId: 'RPR-2026-0001', not: 'Kontrol planlandığı gibi tamamlandı; 2 küçük uygunsuzluk kaydedildi.' },
    { id: 'IE-2026-0002', lokasyonId: 'LOK-0102', projeId: 'PRJ-2026-001', tarih: '2026-03-12', saat: '09:30', bitis: '2026-03-12', taseronId: 'TSR-004', ekipId: ['PRS-007','PRS-010'], cihazlar: ['CHZ-001','CHZ-007'], operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'teslim-edildi', musteriTarihOnayi: true,  hazirlikTamam: true,  raporId: 'RPR-2026-0002', not: 'Yük asansörü ilave tespit olarak kapsama alındı.' },
    { id: 'IE-2026-0003', lokasyonId: 'LOK-0103', projeId: 'PRJ-2026-001', tarih: '2026-08-11', saat: '08:30', bitis: '2026-08-11', taseronId: 'TSR-001', ekipId: ['PRS-008'],           cihazlar: ['CHZ-002','CHZ-008'], operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'onaylandi',     musteriTarihOnayi: true,  hazirlikTamam: true,  raporId: 'RPR-2026-0003', not: 'Rapor teknik onaydan geçti, müşteri teslimi bekleniyor.' },
    { id: 'IE-2026-0004', lokasyonId: 'LOK-0104', projeId: 'PRJ-2026-001', tarih: '2026-08-06', saat: '10:00', bitis: '2026-08-06', taseronId: 'TSR-001', ekipId: ['PRS-008'],           cihazlar: ['CHZ-002','CHZ-008'], operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'teknik-incelemede', musteriTarihOnayi: true, hazirlikTamam: true, raporId: 'RPR-2026-0004', not: 'Mutabakat müşteri onayında; 3 kalemde miktar farkı var.' },
    { id: 'IE-2026-0005', lokasyonId: 'LOK-0111', projeId: 'PRJ-2026-001', tarih: '2026-07-14', saat: '09:00', bitis: '2026-07-14', taseronId: 'TSR-001', ekipId: ['PRS-008'],           cihazlar: ['CHZ-002'],          operasyonDurum: 'yeniden-ziyaret',    raporDurum: 'revizyon-istendi', musteriTarihOnayi: true, hazirlikTamam: false, raporId: 'RPR-2026-0005', not: 'Jeneratör ve yangın pompası enerjisiz olduğu için test edilemedi.' },
    { id: 'IE-2026-0006', lokasyonId: 'LOK-0112', projeId: 'PRJ-2026-001', tarih: '2026-07-28', saat: '08:00', bitis: '2026-07-29', taseronId: 'TSR-004', ekipId: ['PRS-007','PRS-010','PRS-011'], cihazlar: ['CHZ-001','CHZ-003','CHZ-006','CHZ-007'], operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'revizyon-istendi', musteriTarihOnayi: true, hazirlikTamam: true, raporId: 'RPR-2026-0006', not: 'İki günlük kontrol; raf sistemi metrekaresinde ciddi fark tespit edildi.' },
    { id: 'IE-2026-0007', lokasyonId: 'LOK-0201', projeId: 'PRJ-2026-002', tarih: '2026-04-21', saat: '08:30', bitis: '2026-04-22', taseronId: 'TSR-004', ekipId: ['PRS-007','PRS-010'], cihazlar: ['CHZ-001','CHZ-006','CHZ-007'], operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'teslim-edildi', musteriTarihOnayi: true, hazirlikTamam: true, raporId: 'RPR-2026-0007', not: 'Antrepo kontrolü tamamlandı; kısmi faturalama uygulanıyor.' },
    { id: 'IE-2026-0008', lokasyonId: 'LOK-0202', projeId: 'PRJ-2026-002', tarih: '2026-08-10', saat: '09:00', bitis: '2026-08-10', taseronId: 'TSR-004', ekipId: ['PRS-007'],           cihazlar: ['CHZ-001','CHZ-007'], operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'imzalandi',     musteriTarihOnayi: true,  hazirlikTamam: true,  raporId: 'RPR-2026-0008', not: 'Rapor imzalandı; müşteri teslim planı hazırlanıyor.' },
    { id: 'IE-2026-0009', lokasyonId: 'LOK-0301', projeId: 'PRJ-2026-003', tarih: '2026-08-04', saat: '08:00', bitis: '2026-08-05', taseronId: 'TSR-001', ekipId: ['PRS-004','PRS-009'], cihazlar: ['CHZ-004','CHZ-005','CHZ-009','CHZ-010'], operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'teknik-incelemede', musteriTarihOnayi: true, hazirlikTamam: true, raporId: 'RPR-2026-0009', not: 'Fabrika kontrolü; buhar kazanı ve ortam ölçümleri dâhil.' },
    { id: 'IE-2026-0010', lokasyonId: 'LOK-0304', projeId: 'PRJ-2026-003', tarih: '2026-08-12', saat: '09:00', bitis: '2026-08-12', taseronId: 'TSR-001', ekipId: ['PRS-008'],           cihazlar: ['CHZ-002','CHZ-008'], operasyonDurum: 'kontrol-tamamlandi', raporDurum: 'onaylandi',     musteriTarihOnayi: true,  hazirlikTamam: true,  raporId: 'RPR-2026-0010', not: 'Mamul deposu kontrolü sorunsuz tamamlandı.' },
    { id: 'IE-2026-0011', lokasyonId: 'LOK-0108', projeId: 'PRJ-2026-001', tarih: '2026-08-17', saat: '09:00', bitis: null,         taseronId: 'TSR-004', ekipId: ['PRS-007','PRS-011'], cihazlar: ['CHZ-001','CHZ-007'], operasyonDurum: 'sahada',             raporDurum: 'baslatilmadi',  musteriTarihOnayi: true,  hazirlikTamam: true,  raporId: null,            not: 'Ekip bugün sahada; saha kontrol formu doldurulma aşamasında.' },
    { id: 'IE-2026-0012', lokasyonId: 'LOK-0205', projeId: 'PRJ-2026-002', tarih: '2026-08-18', saat: '08:00', bitis: null,         taseronId: 'TSR-001', ekipId: ['PRS-009','PRS-010'], cihazlar: ['CHZ-004','CHZ-007'], operasyonDurum: 'planlandi',          raporDurum: 'baslatilmadi',  musteriTarihOnayi: true,  hazirlikTamam: true,  raporId: null,            not: 'Liman sahası giriş izni alındı; İSG belgeleri iletildi.' },
    { id: 'IE-2026-0013', lokasyonId: 'LOK-0110', projeId: 'PRJ-2026-001', tarih: '2026-08-19', saat: '09:30', bitis: null,         taseronId: 'TSR-003', ekipId: ['PRS-009'],           cihazlar: ['CHZ-001'],          operasyonDurum: 'planlandi',          raporDurum: 'baslatilmadi',  musteriTarihOnayi: true,  hazirlikTamam: false, raporId: null,            not: 'Hazırlık kontrol listesinde 2 madde açık: operatör hazırlığı ve pano anahtarı.' },
    { id: 'IE-2026-0014', lokasyonId: 'LOK-0203', projeId: 'PRJ-2026-002', tarih: '2026-08-20', saat: '08:30', bitis: null,         taseronId: 'TSR-001', ekipId: ['PRS-008','PRS-011'], cihazlar: ['CHZ-002','CHZ-008'], operasyonDurum: 'planlandi',          raporDurum: 'baslatilmadi',  musteriTarihOnayi: true,  hazirlikTamam: true,  raporId: null,            not: 'Depo kontrolü planlandı.' },
    { id: 'IE-2026-0015', lokasyonId: 'LOK-0105', projeId: 'PRJ-2026-001', tarih: '2026-08-24', saat: '09:00', bitis: null,         taseronId: 'TSR-003', ekipId: ['PRS-009','PRS-011'], cihazlar: ['CHZ-001'],          operasyonDurum: 'planlandi',          raporDurum: 'baslatilmadi',  musteriTarihOnayi: false, hazirlikTamam: false, raporId: null,            not: 'Müşteri tarih onayı bekleniyor; onay gelmezse plan güncellenecek.' },
    { id: 'IE-2026-0016', lokasyonId: 'LOK-0302', projeId: 'PRJ-2026-003', tarih: '2026-08-26', saat: '08:00', bitis: null,         taseronId: 'TSR-004', ekipId: ['PRS-009'],           cihazlar: ['CHZ-004','CHZ-005'], operasyonDurum: 'planlandi',          raporDurum: 'baslatilmadi',  musteriTarihOnayi: true,  hazirlikTamam: true,  raporId: null,            not: 'Süt ürünleri fabrikası; üretim durdurma penceresi 08:00–14:00 arası.' }
  ];

  /* saha öncesi hazırlık kontrol listesi (iş emri detayında) */
  var hazirlikMaddeleri = [
    { k: 'tarih-saat',    ad: 'Kontrol tarihi ve saati müşteriye bildirildi' },
    { k: 'ekipman-liste', ad: 'Kontrol edilecek ekipman listesi paylaşıldı' },
    { k: 'calisir',       ad: 'Ekipmanların çalışır ve erişilebilir olması sağlandı' },
    { k: 'operator',      ad: 'Operatörlerin kontrol saatinde hazır bulunması teyit edildi' },
    { k: 'dokuman',       ad: 'Teknik dokümanlar (proje, imalat belgesi) temin edildi' },
    { k: 'giris',         ad: 'Saha giriş şartları ve izinleri tamamlandı' },
    { k: 'isg',           ad: 'İş güvenliği gereklilikleri (KKD, İSG eğitimi) karşılandı' }
  ];

  /* ---------------------------------------------------------------
     RAPOR ŞABLONLARI ve KONTROL FORMLARI
     --------------------------------------------------------------- */
  var raporSablonlari = [
    { id: 'SBL-KLD-01', ad: 'Kaldırma ve İletme Ekipmanı Muayene Raporu',   kategoriId: 'KAT-01', versiyon: 'v4', yayin: '2026-01-15', hazirlayanId: 'PRS-004', onaylayanId: 'PRS-005', bolumSayisi: 9,  durum: 'yayinda' },
    { id: 'SBL-KLD-02', ad: 'Asansör Periyodik Muayene Raporu',             kategoriId: 'KAT-01', versiyon: 'v3', yayin: '2025-11-02', hazirlayanId: 'PRS-004', onaylayanId: 'PRS-005', bolumSayisi: 11, durum: 'yayinda' },
    { id: 'SBL-MKN-01', ad: 'Makine ve Üretim Ekipmanı Muayene Raporu',     kategoriId: 'KAT-02', versiyon: 'v2', yayin: '2026-02-20', hazirlayanId: 'PRS-004', onaylayanId: 'PRS-005', bolumSayisi: 8,  durum: 'yayinda' },
    { id: 'SBL-BSK-01', ad: 'Basınçlı Kap Muayene Raporu',                  kategoriId: 'KAT-03', versiyon: 'v5', yayin: '2026-01-08', hazirlayanId: 'PRS-009', onaylayanId: 'PRS-004', bolumSayisi: 10, durum: 'yayinda' },
    { id: 'SBL-BSK-02', ad: 'Kazan ve Basınçlı Tesisat Muayene Raporu',     kategoriId: 'KAT-03', versiyon: 'v3', yayin: '2025-12-11', hazirlayanId: 'PRS-009', onaylayanId: 'PRS-004', bolumSayisi: 12, durum: 'yayinda' },
    { id: 'SBL-ELK-01', ad: 'Elektrik Ölçüm Raporu',                        kategoriId: 'KAT-04', versiyon: 'v6', yayin: '2026-03-01', hazirlayanId: 'PRS-008', onaylayanId: 'PRS-004', bolumSayisi: 9,  durum: 'yayinda' },
    { id: 'SBL-ELK-02', ad: 'Elektrik Tesisat Uygunluk Raporu',             kategoriId: 'KAT-04', versiyon: 'v4', yayin: '2026-03-01', hazirlayanId: 'PRS-008', onaylayanId: 'PRS-004', bolumSayisi: 13, durum: 'yayinda' },
    { id: 'SBL-YNG-01', ad: 'Yangın Sistemleri Kontrol Raporu',             kategoriId: 'KAT-05', versiyon: 'v3', yayin: '2026-02-05', hazirlayanId: 'PRS-008', onaylayanId: 'PRS-005', bolumSayisi: 10, durum: 'yayinda' },
    { id: 'SBL-YNG-02', ad: 'Mekanik Tesisat Kontrol Raporu',               kategoriId: 'KAT-05', versiyon: 'v2', yayin: '2025-10-19', hazirlayanId: 'PRS-008', onaylayanId: 'PRS-005', bolumSayisi: 8,  durum: 'yayinda' },
    { id: 'SBL-RAF-01', ad: 'Raf Sistemi Muayene Raporu',                   kategoriId: 'KAT-06', versiyon: 'v2', yayin: '2026-01-22', hazirlayanId: 'PRS-007', onaylayanId: 'PRS-004', bolumSayisi: 7,  durum: 'yayinda' },
    { id: 'SBL-HJY-01', ad: 'İş Hijyeni Ölçüm Raporu',                      kategoriId: 'KAT-07', versiyon: 'v4', yayin: '2026-04-10', hazirlayanId: 'PRS-009', onaylayanId: 'PRS-005', bolumSayisi: 14, durum: 'yayinda' },
    { id: 'SBL-PKD-01', ad: 'Patlamadan Korunma Dokümanı Şablonu',          kategoriId: 'KAT-08', versiyon: 'v2', yayin: '2025-09-30', hazirlayanId: 'PRS-005', onaylayanId: 'PRS-002', bolumSayisi: 18, durum: 'yayinda' },
    { id: 'SBL-ACL-01', ad: 'Acil Aydınlatma Kontrol Raporu',               kategoriId: 'KAT-09', versiyon: 'v2', yayin: '2026-01-30', hazirlayanId: 'PRS-010', onaylayanId: 'PRS-004', bolumSayisi: 6,  durum: 'yayinda' },
    { id: 'SBL-DGR-01', ad: 'Genel Teknik Kontrol Raporu',                  kategoriId: 'KAT-10', versiyon: 'v3', yayin: '2026-02-12', hazirlayanId: 'PRS-004', onaylayanId: 'PRS-005', bolumSayisi: 8,  durum: 'yayinda' },
    { id: 'SBL-DGR-02', ad: 'Enerji Verimliliği Etüt Raporu',               kategoriId: 'KAT-10', versiyon: 'v1', yayin: '2026-05-04', hazirlayanId: 'PRS-008', onaylayanId: 'PRS-002', bolumSayisi: 16, durum: 'taslak' }
  ];

  /* saha kontrol formu madde havuzu — hizmet kategorisine göre */
  var kontrolMaddeleri = {
    'KAT-01': [
      { k: 'K01', ad: 'Kaldırma zinciri / halat aşınma ve deformasyon kontrolü', olcum: null },
      { k: 'K02', ad: 'Kanca ve emniyet mandalı durumu',                          olcum: null },
      { k: 'K03', ad: 'Fren sistemi fonksiyon testi',                             olcum: null },
      { k: 'K04', ad: 'Aşırı yük sınırlayıcı (limit switch) çalışması',           olcum: null },
      { k: 'K05', ad: 'Acil stop butonu fonksiyon testi',                         olcum: null },
      { k: 'K06', ad: 'Hidrolik devrede kaçak kontrolü',                          olcum: null },
      { k: 'K07', ad: 'Yük testi — beyan edilen kapasitenin %110\'u',             olcum: { ad: 'Uygulanan yük', birim: 'kg' } },
      { k: 'K08', ad: 'Uyarı ve kapasite etiketlerinin okunabilirliği',           olcum: null },
      { k: 'K09', ad: 'Operatör kabin görüş ve koruma donanımı',                  olcum: null },
      { k: 'K10', ad: 'Lastik / tekerlek durumu ve stabilite',                    olcum: null }
    ],
    'KAT-03': [
      { k: 'B01', ad: 'Gövde ve kaynak dikişlerinde görsel muayene',              olcum: null },
      { k: 'B02', ad: 'Et kalınlığı ultrasonik ölçümü',                           olcum: { ad: 'Ölçülen kalınlık', birim: 'mm' } },
      { k: 'B03', ad: 'Emniyet ventili açma basıncı testi',                       olcum: { ad: 'Açma basıncı', birim: 'bar' } },
      { k: 'B04', ad: 'Manometre kalibrasyon geçerliliği',                        olcum: null },
      { k: 'B05', ad: 'Otomatik tahliye (kondens) sistemi çalışması',             olcum: null },
      { k: 'B06', ad: 'Hidrostatik test basıncı',                                 olcum: { ad: 'Test basıncı', birim: 'bar' } },
      { k: 'B07', ad: 'Etiket ve imalat belgesi uygunluğu',                       olcum: null },
      { k: 'B08', ad: 'Topraklama bağlantısı',                                    olcum: { ad: 'Direnç', birim: 'Ω' } }
    ],
    'KAT-04': [
      { k: 'E01', ad: 'Koruma iletkeni süreklilik ölçümü',                        olcum: { ad: 'Süreklilik direnci', birim: 'Ω' } },
      { k: 'E02', ad: 'Topraklama direnci ölçümü',                                olcum: { ad: 'Topraklama direnci', birim: 'Ω' } },
      { k: 'E03', ad: 'Yalıtım direnci ölçümü',                                   olcum: { ad: 'Yalıtım direnci', birim: 'MΩ' } },
      { k: 'E04', ad: 'Kaçak akım rölesi açma akımı testi',                       olcum: { ad: 'Açma akımı', birim: 'mA' } },
      { k: 'E05', ad: 'Kaçak akım rölesi açma süresi testi',                      olcum: { ad: 'Açma süresi', birim: 'ms' } },
      { k: 'E06', ad: 'Pano içi termal tarama (sıcak nokta)',                     olcum: { ad: 'En yüksek sıcaklık', birim: '°C' } },
      { k: 'E07', ad: 'Pano etiketleme ve şema uygunluğu',                        olcum: null },
      { k: 'E08', ad: 'Kompanzasyon güç katsayısı',                               olcum: { ad: 'cos φ', birim: '' } }
    ],
    'KAT-05': [
      { k: 'Y01', ad: 'Algılama dedektörlerinin fonksiyon testi',                 olcum: null },
      { k: 'Y02', ad: 'Alarm siren ses seviyesi',                                 olcum: { ad: 'Ses seviyesi', birim: 'dB' } },
      { k: 'Y03', ad: 'Yangın pompası otomatik devreye girme testi',              olcum: null },
      { k: 'Y04', ad: 'Hidrant ve dolap hat basıncı',                             olcum: { ad: 'Hat basıncı', birim: 'bar' } },
      { k: 'Y05', ad: 'Sprinkler başlıklarında engel ve boya kontrolü',           olcum: null },
      { k: 'Y06', ad: 'Duman tahliye fanı devreye girme testi',                   olcum: null },
      { k: 'Y07', ad: 'Yedek güç (akü) süresi',                                   olcum: { ad: 'Yedekleme süresi', birim: 'dk' } }
    ],
    'KAT-06': [
      { k: 'R01', ad: 'Dikme ve traversde deformasyon kontrolü',                  olcum: null },
      { k: 'R02', ad: 'Dikme şakulden sapma ölçümü',                              olcum: { ad: 'Sapma', birim: 'mm' } },
      { k: 'R03', ad: 'Taban plakası ve dübel bağlantıları',                      olcum: null },
      { k: 'R04', ad: 'Emniyet pimi ve kilit mekanizmaları',                      olcum: null },
      { k: 'R05', ad: 'Yük kapasitesi levhalarının varlığı',                      olcum: null },
      { k: 'R06', ad: 'Çarpma koruma bariyerleri',                                olcum: null }
    ],
    'KAT-09': [
      { k: 'A01', ad: 'Armatür şarj ve devreye girme testi',                      olcum: null },
      { k: 'A02', ad: 'Kaçış yolu aydınlatma seviyesi',                           olcum: { ad: 'Aydınlık düzeyi', birim: 'lx' } },
      { k: 'A03', ad: 'Batarya otonomi süresi',                                   olcum: { ad: 'Otonomi', birim: 'dk' } },
      { k: 'A04', ad: 'Yönlendirme piktogramlarının görünürlüğü',                 olcum: null }
    ]
  };

  /* ---------------------------------------------------------------
     TEKNİK RAPORLAR — 13 kayıt (revizyon örneği dâhil)
     --------------------------------------------------------------- */
  var raporlar = [
    { id: 'RPR-2026-0001', no: 'GVT-2026-0001', isEmriId: 'IE-2026-0001', lokasyonId: 'LOK-0101', projeId: 'PRJ-2026-001', sablonId: 'SBL-YNG-01', kategoriId: 'KAT-05', kontrolTarihi: '2026-03-10', raporTarihi: '2026-03-13', teslimTarihi: '2026-03-17', kontrolPersoneliId: 'PRS-007', onaylayanId: 'PRS-004', durum: 'teslim-edildi', versiyon: 1, slaGun: 7, sonuc: 'uygun',        uygunsuzlukSayisi: 2, ekipmanSayisi: 41, revizyonKaynagi: null },
    { id: 'RPR-2026-0002', no: 'GVT-2026-0002', isEmriId: 'IE-2026-0002', lokasyonId: 'LOK-0102', projeId: 'PRJ-2026-001', sablonId: 'SBL-ELK-01', kategoriId: 'KAT-04', kontrolTarihi: '2026-03-12', raporTarihi: '2026-03-16', teslimTarihi: '2026-03-19', kontrolPersoneliId: 'PRS-007', onaylayanId: 'PRS-004', durum: 'teslim-edildi', versiyon: 1, slaGun: 7, sonuc: 'uygun',        uygunsuzlukSayisi: 1, ekipmanSayisi: 47, revizyonKaynagi: null },
    { id: 'RPR-2026-0003', no: 'GVT-2026-0003', isEmriId: 'IE-2026-0003', lokasyonId: 'LOK-0103', projeId: 'PRJ-2026-001', sablonId: 'SBL-ELK-01', kategoriId: 'KAT-04', kontrolTarihi: '2026-08-11', raporTarihi: '2026-08-13', teslimTarihi: null,        kontrolPersoneliId: 'PRS-008', onaylayanId: 'PRS-004', durum: 'onaylandi',    versiyon: 1, slaGun: 7, sonuc: 'uygun',        uygunsuzlukSayisi: 1, ekipmanSayisi: 38, revizyonKaynagi: null },
    { id: 'RPR-2026-0004', no: 'GVT-2026-0004', isEmriId: 'IE-2026-0004', lokasyonId: 'LOK-0104', projeId: 'PRJ-2026-001', sablonId: 'SBL-RAF-01', kategoriId: 'KAT-06', kontrolTarihi: '2026-08-06', raporTarihi: '2026-08-11', teslimTarihi: null,        kontrolPersoneliId: 'PRS-008', onaylayanId: null,      durum: 'teknik-incelemede', versiyon: 1, slaGun: 7, sonuc: 'sartli-uygun', uygunsuzlukSayisi: 3, ekipmanSayisi: 34, revizyonKaynagi: null },
    { id: 'RPR-2026-0005', no: 'GVT-2026-0005', isEmriId: 'IE-2026-0005', lokasyonId: 'LOK-0111', projeId: 'PRJ-2026-001', sablonId: 'SBL-YNG-01', kategoriId: 'KAT-05', kontrolTarihi: '2026-07-14', raporTarihi: '2026-07-20', teslimTarihi: null,        kontrolPersoneliId: 'PRS-008', onaylayanId: null,      durum: 'revizyon-istendi', versiyon: 1, slaGun: 7, sonuc: 'uygun-degil',  uygunsuzlukSayisi: 4, ekipmanSayisi: 29, revizyonKaynagi: null, revizyonNotu: 'Jeneratör ve yangın pompası test edilemediği için rapor eksik. Yeniden ziyaret sonrası revizyon açılacak.' },
    { id: 'RPR-2026-0006', no: 'GVT-2026-0006', isEmriId: 'IE-2026-0006', lokasyonId: 'LOK-0112', projeId: 'PRJ-2026-001', sablonId: 'SBL-RAF-01', kategoriId: 'KAT-06', kontrolTarihi: '2026-07-28', raporTarihi: '2026-08-03', teslimTarihi: null,        kontrolPersoneliId: 'PRS-007', onaylayanId: null,      durum: 'revizyon-istendi', versiyon: 1, slaGun: 7, sonuc: 'sartli-uygun', uygunsuzlukSayisi: 5, ekipmanSayisi: 96, revizyonKaynagi: null, revizyonNotu: 'Raf sistemi ölçüm krokisi eksik; ilave tespit edilen 380 m² için ayrı kroki isteniyor.' },
    { id: 'RPR-2026-0007', no: 'GVT-2026-0007', isEmriId: 'IE-2026-0007', lokasyonId: 'LOK-0201', projeId: 'PRJ-2026-002', sablonId: 'SBL-RAF-01', kategoriId: 'KAT-06', kontrolTarihi: '2026-04-21', raporTarihi: '2026-04-28', teslimTarihi: '2026-05-04', kontrolPersoneliId: 'PRS-007', onaylayanId: 'PRS-004', durum: 'teslim-edildi', versiyon: 2, slaGun: 10, sonuc: 'uygun',       uygunsuzlukSayisi: 2, ekipmanSayisi: 118, revizyonKaynagi: 'RPR-2026-0007-R0' },
    { id: 'RPR-2026-0008', no: 'GVT-2026-0008', isEmriId: 'IE-2026-0008', lokasyonId: 'LOK-0202', projeId: 'PRJ-2026-002', sablonId: 'SBL-KLD-01', kategoriId: 'KAT-01', kontrolTarihi: '2026-08-10', raporTarihi: '2026-08-14', teslimTarihi: null,        kontrolPersoneliId: 'PRS-007', onaylayanId: 'PRS-004', durum: 'imzalandi',    versiyon: 1, slaGun: 10, sonuc: 'uygun',       uygunsuzlukSayisi: 1, ekipmanSayisi: 84, revizyonKaynagi: null },
    { id: 'RPR-2026-0009', no: 'GVT-2026-0009', isEmriId: 'IE-2026-0009', lokasyonId: 'LOK-0301', projeId: 'PRJ-2026-003', sablonId: 'SBL-BSK-02', kategoriId: 'KAT-03', kontrolTarihi: '2026-08-04', raporTarihi: '2026-08-10', teslimTarihi: null,        kontrolPersoneliId: 'PRS-009', onaylayanId: null,      durum: 'teknik-incelemede', versiyon: 1, slaGun: 5, sonuc: 'sartli-uygun', uygunsuzlukSayisi: 6, ekipmanSayisi: 214, revizyonKaynagi: null },
    { id: 'RPR-2026-0010', no: 'GVT-2026-0010', isEmriId: 'IE-2026-0010', lokasyonId: 'LOK-0304', projeId: 'PRJ-2026-003', sablonId: 'SBL-KLD-01', kategoriId: 'KAT-01', kontrolTarihi: '2026-08-12', raporTarihi: '2026-08-14', teslimTarihi: null,        kontrolPersoneliId: 'PRS-008', onaylayanId: 'PRS-004', durum: 'onaylandi',    versiyon: 1, slaGun: 5, sonuc: 'uygun',        uygunsuzlukSayisi: 0, ekipmanSayisi: 62, revizyonKaynagi: null },
    { id: 'RPR-2026-0007-R0', no: 'GVT-2026-0007', isEmriId: 'IE-2026-0007', lokasyonId: 'LOK-0201', projeId: 'PRJ-2026-002', sablonId: 'SBL-RAF-01', kategoriId: 'KAT-06', kontrolTarihi: '2026-04-21', raporTarihi: '2026-04-26', teslimTarihi: null, kontrolPersoneliId: 'PRS-007', onaylayanId: 'PRS-004', durum: 'arsiv',    versiyon: 1, slaGun: 10, sonuc: 'sartli-uygun', uygunsuzlukSayisi: 3, ekipmanSayisi: 118, revizyonKaynagi: null, revizyonNotu: 'Mezzanin platform ölçüsü düzeltildiği için v2 revizyonu açıldı.' },
    { id: 'RPR-2025-0088', no: 'GVT-2025-0088', isEmriId: null,          lokasyonId: 'LOK-0101', projeId: 'PRJ-2025-004', sablonId: 'SBL-YNG-01', kategoriId: 'KAT-05', kontrolTarihi: '2025-03-04', raporTarihi: '2025-03-07', teslimTarihi: '2025-03-11', kontrolPersoneliId: 'PRS-007', onaylayanId: 'PRS-004', durum: 'teslim-edildi', versiyon: 1, slaGun: 7, sonuc: 'uygun',        uygunsuzlukSayisi: 3, ekipmanSayisi: 39, revizyonKaynagi: null },
    { id: 'RPR-2025-0091', no: 'GVT-2025-0091', isEmriId: null,          lokasyonId: 'LOK-0102', projeId: 'PRJ-2025-004', sablonId: 'SBL-ELK-01', kategoriId: 'KAT-04', kontrolTarihi: '2025-03-06', raporTarihi: '2025-03-10', teslimTarihi: '2025-03-13', kontrolPersoneliId: 'PRS-007', onaylayanId: 'PRS-004', durum: 'teslim-edildi', versiyon: 1, slaGun: 7, sonuc: 'uygun',        uygunsuzlukSayisi: 2, ekipmanSayisi: 44, revizyonKaynagi: null }
  ];

  /* ---------------------------------------------------------------
     UYGUNSUZLUKLAR — 11 kayıt · doküman §8 altı aşaması boyunca yayılı
     (açık · aksiyon planlandı · uygulandı · kanıt yüklendi · doğrulandı · kapandı)
     --------------------------------------------------------------- */
  var uygunsuzluklar = [
    { id: 'UYG-2026-001', raporId: 'RPR-2026-0001', lokasyonId: 'LOK-0101', ekipmanId: null,       hizmetId: 'HZM-YNG-003', onem: 'orta',    tespit: '2026-03-10', baslik: 'Yangın dolabı hortumunda çatlak',                aciklama: 'Kat 1 doğu koridorundaki yangın dolabında hortum yüzeyinde 8 cm uzunluğunda çatlak tespit edildi; basınç altında sızdırma riski var.', oneri: 'Hortum komple değiştirilmeli ve basınç testi tekrarlanmalıdır.', sorumluTaraf: 'musteri', sorumluKisi: 'KSI-005', termin: '2026-04-10', durum: 'kapandi',           kapanis: '2026-04-02', yenidenKontrol: 'gerekmiyor', musteriBildirimi: '2026-03-17', aksiyonPlani: 'Hortum komple değiştirilecek, sonrasında 12 bar basınç testi uygulanacak.', planTarihi: '2026-03-18', uygulamaTarihi: '2026-03-27', kanit: ['Değişim irsaliyesi', 'Basınç testi tutanağı', 'Montaj fotoğrafı'], dogrulayanId: 'PRS-007', dogrulamaTarihi: '2026-04-01' },
    { id: 'UYG-2026-002', raporId: 'RPR-2026-0001', lokasyonId: 'LOK-0101', ekipmanId: null,       hizmetId: 'HZM-ACL-001', onem: 'dusuk',   tespit: '2026-03-10', baslik: 'Üç acil aydınlatma armatüründe batarya zayıf',   aciklama: 'Depo çıkışındaki 3 armatürde otonomi süresi 60 dakikanın altında (ölçülen 34–41 dk).', oneri: 'Bataryalar değiştirilmeli, sonrasında otonomi testi tekrar edilmelidir.', sorumluTaraf: 'musteri', sorumluKisi: 'KSI-005', termin: '2026-04-10', durum: 'kapandi',           kapanis: '2026-03-28', yenidenKontrol: 'gerekmiyor', musteriBildirimi: '2026-03-17', aksiyonPlani: 'Üç armatürün bataryası değiştirilecek, otonomi testi tekrarlanacak.', planTarihi: '2026-03-18', uygulamaTarihi: '2026-03-24', kanit: ['Batarya değişim formu', 'Otonomi test kaydı'], dogrulayanId: 'PRS-007', dogrulamaTarihi: '2026-03-27' },
    { id: 'UYG-2026-003', raporId: 'RPR-2026-0002', lokasyonId: 'LOK-0102', ekipmanId: null,       hizmetId: 'HZM-ELK-004', onem: 'yuksek',  tespit: '2026-03-12', baslik: 'Kaçak akım rölesi açma süresi limit üstü',      aciklama: 'Soğuk oda panosundaki 30 mA rölede ölçülen açma süresi 412 ms; sınır değer 300 ms.', oneri: 'Röle değiştirilmeli ve değişim sonrası test tekrarlanmalıdır.', sorumluTaraf: 'musteri', sorumluKisi: 'KSI-006', termin: '2026-04-01', durum: 'kapandi',           kapanis: '2026-03-25', yenidenKontrol: 'tamamlandi', musteriBildirimi: '2026-03-19', aksiyonPlani: 'Kaçak akım rölesi yenisiyle değiştirilecek, açma süresi yeniden ölçülecek.', planTarihi: '2026-03-20', uygulamaTarihi: '2026-03-23', kanit: ['Röle fatura kopyası', 'YKN-2026-005 ölçüm kaydı'], dogrulayanId: 'PRS-008', dogrulamaTarihi: '2026-03-25' },
    { id: 'UYG-2026-004', raporId: 'RPR-2026-0003', lokasyonId: 'LOK-0103', ekipmanId: null,       hizmetId: 'HZM-ELK-001', onem: 'orta',    tespit: '2026-08-11', baslik: 'Topraklama direnci sınır değere yakın',         aciklama: 'Ana pano topraklama direnci 9,4 Ω ölçüldü; sınır 10 Ω. Kuru sezonda sınırın üstüne çıkma riski var.', oneri: 'Ek topraklama elektrodu tesis edilmeli, ölçüm 3 ay içinde tekrarlanmalıdır.', sorumluTaraf: 'musteri', sorumluKisi: 'KSI-007', termin: '2026-11-11', durum: 'acik',              kapanis: null, yenidenKontrol: 'planlandi',  musteriBildirimi: '2026-08-14', aksiyonPlani: null, planTarihi: null, uygulamaTarihi: null, kanit: [], dogrulayanId: null, dogrulamaTarihi: null },
    { id: 'UYG-2026-005', raporId: 'RPR-2026-0004', lokasyonId: 'LOK-0104', ekipmanId: null,       hizmetId: 'HZM-RAF-004', onem: 'yuksek',  tespit: '2026-08-06', baslik: 'Gondol raf dikmesinde çarpma deformasyonu',     aciklama: '4 numaralı koridorda iki dikmede forklift çarpması kaynaklı 14 mm ve 19 mm sapma ölçüldü; kabul sınırı 5 mm.', oneri: 'Deforme dikmeler değiştirilmeli, koridor girişine çarpma bariyeri eklenmelidir.', sorumluTaraf: 'musteri', sorumluKisi: null, termin: '2026-09-06', durum: 'aksiyon-planlandi', kapanis: null, yenidenKontrol: 'gerekli',    musteriBildirimi: '2026-08-12', aksiyonPlani: 'İki deforme dikme sökülüp yenisiyle değiştirilecek, koridor girişine çarpma bariyeri monte edilecek.', planTarihi: '2026-08-13', uygulamaTarihi: null, kanit: [], dogrulayanId: null, dogrulamaTarihi: null },
    { id: 'UYG-2026-006', raporId: 'RPR-2026-0004', lokasyonId: 'LOK-0104', ekipmanId: null,       hizmetId: 'HZM-RAF-004', onem: 'dusuk',   tespit: '2026-08-06', baslik: 'Yük kapasitesi levhaları eksik',                aciklama: '6 raf sırasında kapasite bilgi levhası bulunmuyor.', oneri: 'Kapasite levhaları raf üreticisinin verilerine göre hazırlanıp asılmalıdır.', sorumluTaraf: 'musteri', sorumluKisi: null, termin: '2026-09-06', durum: 'uygulandi',         kapanis: null, yenidenKontrol: 'gerekmiyor', musteriBildirimi: '2026-08-12', aksiyonPlani: 'Altı raf sırası için kapasite levhaları üretici verisine göre bastırılıp asılacak.', planTarihi: '2026-08-10', uygulamaTarihi: '2026-08-15', kanit: [], dogrulayanId: null, dogrulamaTarihi: null },
    { id: 'UYG-2026-007', raporId: 'RPR-2026-0005', lokasyonId: 'LOK-0111', ekipmanId: null,       hizmetId: 'HZM-YNG-002', onem: 'kritik',  tespit: '2026-07-14', baslik: 'Yangın pompası otomatik devreye girmiyor',      aciklama: 'Basınç düşümü simülasyonunda jokey pompa devreye girdi, ana pompa devreye girmedi. Sistem yangın anında yetersiz kalacaktır.', oneri: 'Pompa kumanda panosu ve basınç şalteri kontrol edilmeli, arıza giderilip test tekrarlanmalıdır.', sorumluTaraf: 'musteri', sorumluKisi: null, termin: '2026-07-28', durum: 'aksiyon-planlandi', kapanis: null, yenidenKontrol: 'gerekli',    musteriBildirimi: '2026-07-20', aksiyonPlani: 'Pompa kumanda panosu ve basınç şalteri servis tarafından incelenecek, arıza giderilip sistem testi tekrarlanacak.', planTarihi: '2026-07-21', uygulamaTarihi: null, kanit: [], dogrulayanId: null, dogrulamaTarihi: null },
    { id: 'UYG-2026-008', raporId: 'RPR-2026-0006', lokasyonId: 'LOK-0112', ekipmanId: null,       hizmetId: 'HZM-RAF-001', onem: 'yuksek',  tespit: '2026-07-28', baslik: 'Raf taban plakalarında dübel eksikliği',        aciklama: 'B ve C bloklarında toplam 23 dikmede taban plakası dübeli eksik veya gevşek.', oneri: 'Eksik dübeller tamamlanmalı, tork değerleri kayıt altına alınmalıdır.', sorumluTaraf: 'musteri', sorumluKisi: 'KSI-008', termin: '2026-08-28', durum: 'kanit-yuklendi',    kapanis: null, yenidenKontrol: 'gerekli',    musteriBildirimi: '2026-08-04', aksiyonPlani: '23 dikmede eksik dübeller tamamlanacak, tork değerleri kayıt altına alınacak.', planTarihi: '2026-08-05', uygulamaTarihi: '2026-08-12', kanit: ['Tork kayıt formu', 'Dübel montaj fotoğrafları'], dogrulayanId: null, dogrulamaTarihi: null },
    { id: 'UYG-2026-009', raporId: 'RPR-2026-0009', lokasyonId: 'LOK-0301', ekipmanId: null,       hizmetId: 'HZM-BSK-004', onem: 'kritik',  tespit: '2026-08-04', baslik: 'Buhar kazanı emniyet ventili açma basıncı yüksek', aciklama: '2 numaralı kazanın emniyet ventili 12,8 bar\'da açtı; ayar değeri 11 bar. Aşırı basınç koruması yetersiz.', oneri: 'Emniyet ventili sökülüp kalibre edilmeli veya değiştirilmelidir. İşlem tamamlanana kadar kazan devre dışı bırakılmalıdır.', sorumluTaraf: 'musteri', sorumluKisi: 'KSI-015', termin: '2026-08-18', durum: 'acik',              kapanis: null, yenidenKontrol: 'gerekli',    musteriBildirimi: '2026-08-10', aksiyonPlani: null, planTarihi: null, uygulamaTarihi: null, kanit: [], dogrulayanId: null, dogrulamaTarihi: null },
    { id: 'UYG-2026-010', raporId: 'RPR-2026-0009', lokasyonId: 'LOK-0301', ekipmanId: null,       hizmetId: 'HZM-ELK-007', onem: 'orta',    tespit: '2026-08-04', baslik: 'Dolum hattı panosunda sıcak nokta',             aciklama: 'Termal taramada R fazı klemensinde 78 °C ölçüldü; komşu fazlarla arasındaki fark 31 °C.', oneri: 'Klemens sıkma torkları kontrol edilmeli, gerekirse klemens yenilenmelidir.', sorumluTaraf: 'musteri', sorumluKisi: 'KSI-015', termin: '2026-09-04', durum: 'dogrulandi',        kapanis: null, yenidenKontrol: 'planlandi',  musteriBildirimi: '2026-08-10', aksiyonPlani: 'Klemens sıkma torkları kontrol edilip klemens yenilenecek, termal tarama tekrarlanacak.', planTarihi: '2026-08-06', uygulamaTarihi: '2026-08-12', kanit: ['Termal tarama raporu', 'Klemens değişim formu'], dogrulayanId: 'PRS-009', dogrulamaTarihi: '2026-08-16' },
    { id: 'UYG-2026-011', raporId: 'RPR-2026-0008', lokasyonId: 'LOK-0202', ekipmanId: null,       hizmetId: 'HZM-KLD-006', onem: 'orta',    tespit: '2026-08-10', baslik: 'Hidrolik rampada yağ sızıntısı',                aciklama: '3 numaralı rampanın hidrolik silindirinde damlama seviyesinde sızıntı gözlendi.', oneri: 'Silindir keçesi değiştirilmeli, sızıntı takibi yapılmalıdır.', sorumluTaraf: 'musteri', sorumluKisi: 'KSI-013', termin: '2026-09-10', durum: 'acik',              kapanis: null,  yenidenKontrol: 'gerekmiyor', musteriBildirimi: '2026-08-14', aksiyonPlani: null, planTarihi: null, uygulamaTarihi: null, kanit: [], dogrulayanId: null, dogrulamaTarihi: null }
  ];

  /* yeniden kontrol talepleri */
  var yenidenKontroller = [
    { id: 'YKN-2026-001', uygunsuzlukId: 'UYG-2026-007', lokasyonId: 'LOK-0111', talepTarihi: '2026-07-22', talepEden: 'GAVIA Teknik', planTarihi: '2026-08-25', durum: 'planlandi',  ucretli: false, aciklama: 'Yangın pompası arızası giderildikten sonra sistem testi tekrarlanacak.' },
    { id: 'YKN-2026-002', uygunsuzlukId: 'UYG-2026-005', lokasyonId: 'LOK-0104', talepTarihi: '2026-08-12', talepEden: 'Müşteri',      planTarihi: null,         durum: 'talep-edildi', ucretli: true,  aciklama: 'Raf dikmeleri değiştirildikten sonra kısmi kontrol talep edildi; ücretli yeniden kontrol kapsamında.' },
    { id: 'YKN-2026-003', uygunsuzlukId: 'UYG-2026-008', lokasyonId: 'LOK-0112', talepTarihi: '2026-08-06', talepEden: 'GAVIA Teknik', planTarihi: '2026-09-02', durum: 'planlandi',  ucretli: false, aciklama: 'Dübel tamamlama sonrası bağlantı torkları doğrulanacak.' },
    { id: 'YKN-2026-004', uygunsuzlukId: 'UYG-2026-009', lokasyonId: 'LOK-0301', talepTarihi: '2026-08-11', talepEden: 'Müşteri',      planTarihi: '2026-08-27', durum: 'planlandi',  ucretli: false, aciklama: 'Emniyet ventili kalibrasyonu sonrası kazan yeniden test edilecek.' },
    { id: 'YKN-2026-005', uygunsuzlukId: 'UYG-2026-003', lokasyonId: 'LOK-0102', talepTarihi: '2026-03-20', talepEden: 'GAVIA Teknik', planTarihi: '2026-03-27', durum: 'tamamlandi', ucretli: false, aciklama: 'Röle değişimi doğrulandı; açma süresi 187 ms ölçüldü.' }
  ];

  /* eksik / gösterilmeyen ekipman kayıtları */
  var eksikEkipmanlar = [
    { id: 'EKS-001', lokasyonId: 'LOK-0104', hizmetId: 'HZM-KLD-002', tur: 'gosterilmeyen', miktar: 1, tespit: '2026-08-06', aciklama: 'Akülü transpalet kontrol saatinde başka şubeye ödünç verilmişti.',        durum: 'musteri-bildirildi' },
    { id: 'EKS-002', lokasyonId: 'LOK-0104', hizmetId: 'HZM-ACL-001', tur: 'eksik',         miktar: 4, tespit: '2026-08-06', aciklama: 'Ön envanterde 21 armatür bildirildi, sahada 17 adet bulundu.',             durum: 'mutabakatta' },
    { id: 'EKS-003', lokasyonId: 'LOK-0112', hizmetId: 'HZM-RAF-001', tur: 'ilave',         miktar: 380, birim: 'metrekare', tespit: '2026-07-28', aciklama: 'C blokta ön envanterde olmayan 380 m² raf alanı tespit edildi.', durum: 'mutabakatta' },
    { id: 'EKS-004', lokasyonId: 'LOK-0112', hizmetId: 'HZM-KLD-001-A', tur: 'eksik',       miktar: 2, tespit: '2026-07-28', aciklama: 'İki akülü forklift bakım nedeniyle sahada değildi.',                       durum: 'yeniden-kontrol-bekliyor' },
    { id: 'EKS-005', lokasyonId: 'LOK-0111', hizmetId: 'HZM-ELK-005', tur: 'gosterilmeyen', miktar: 1, tespit: '2026-07-14', aciklama: 'Jeneratör enerjisiz olduğu için test edilemedi.',                          durum: 'yeniden-kontrol-bekliyor' },
    { id: 'EKS-006', lokasyonId: 'LOK-0111', hizmetId: 'HZM-YNG-002', tur: 'gosterilmeyen', miktar: 1, tespit: '2026-07-14', aciklama: 'Yangın pompası panosu kilitliydi, yetkili bulunamadı.',                    durum: 'yeniden-kontrol-bekliyor' },
    { id: 'EKS-007', lokasyonId: 'LOK-0301', hizmetId: 'HZM-MKN-004', tur: 'ilave',         miktar: 1, tespit: '2026-08-04', aciklama: 'Yeni kurulan hidrolik pres ön envanterde yoktu.',                          durum: 'musteri-onayladi' },
    { id: 'EKS-008', lokasyonId: 'LOK-0201', hizmetId: 'HZM-KLD-006', tur: 'eksik',         miktar: 2, tespit: '2026-04-21', aciklama: 'İki hidrolik rampa devre dışı bırakılmış ve sökülmüştü.',                  durum: 'musteri-onayladi' }
  ];

  /* ---------------------------------------------------------------
     TEKLİF ve SÖZLEŞMELER
     Müşteri satış fiyatı ile taşeron maliyeti AYRI alanlarda tutulur.
     --------------------------------------------------------------- */
  var teklifler = [
    { id: 'TKL-2026-001', no: 'TKL-2026-001', musteriId: 'MST-001', projeId: 'PRJ-2026-001', konu: 'Zambak Market 2026 Yıllık Periyodik Kontrol Hizmeti', lokasyonSayisi: 12, hizmetSayisi: 14, tarih: '2025-12-08', gecerlilik: '2026-01-31', hazirlayanId: 'PRS-013', durum: 'kazanildi',  toplamSatis: 948200, toplamMaliyet: 441800, ekGider: 62000, revizyon: 2, notlar: 'Standart listeden %12 iskonto uygulandı; 6 lokasyonda bir toplu fatura koşulu eklendi.' },
    { id: 'TKL-2026-002', no: 'TKL-2026-002', musteriId: 'MST-002', projeId: 'PRJ-2026-002', konu: 'AnadoluDepo Depo ve Antrepo Periyodik Kontrolleri',  lokasyonSayisi: 6,  hizmetSayisi: 21, tarih: '2026-02-19', gecerlilik: '2026-03-31', hazirlayanId: 'PRS-013', durum: 'kazanildi',  toplamSatis: 3550700, toplamMaliyet: 1614400, ekGider: 48000, revizyon: 1, notlar: 'Raf sistemi metrekare bazlı fiyatlandırıldı; hacim indirimi uygulandı.' },
    { id: 'TKL-2026-003', no: 'TKL-2026-003', musteriId: 'MST-003', projeId: 'PRJ-2026-003', konu: 'Efe Gıda Fabrika Periyodik Kontrol ve Ortam Ölçümleri', lokasyonSayisi: 4, hizmetSayisi: 39, tarih: '2026-03-04', gecerlilik: '2026-04-15', hazirlayanId: 'PRS-013', durum: 'kazanildi',  toplamSatis: 1018800, toplamMaliyet: 466000, ekGider: 74000, revizyon: 3, notlar: 'PKD revizyonu ve iş hijyeni ölçümleri kapsama alındı; konaklama GAVIA Teknik\'e ait.' },
    { id: 'TKL-2026-004', no: 'TKL-2026-004', musteriId: 'MST-001', projeId: 'PRJ-2026-005', konu: 'Zambak Ekspres Yeni Açılış Kontrolleri (5 Şube)',      lokasyonSayisi: 5,  hizmetSayisi: 11, tarih: '2026-07-22', gecerlilik: '2026-09-15', hazirlayanId: 'PRS-013', durum: 'gonderildi', toplamSatis: 62800,   toplamMaliyet: 30500,  ekGider: 9500,  revizyon: 1, notlar: 'Küçük format şubeler; mevcut çerçeve sözleşmeye ek olarak sunuldu.' },
    { id: 'TKL-2026-005', no: 'TKL-2026-005', musteriId: 'MST-004', projeId: null,           konu: 'Kuzey Yıldızı Akaryakıt İstasyonları Ön Teklif',      lokasyonSayisi: 18, hizmetSayisi: 9,  tarih: '2026-08-05', gecerlilik: '2026-09-30', hazirlayanId: 'PRS-013', durum: 'hazirlaniyor', toplamSatis: 742000, toplamMaliyet: 331000, ekGider: 46000, revizyon: 0, notlar: 'Aday müşteri; LPG tankı ve elektrik ölçümleri ağırlıklı. Keşif gerekiyor.' },
    { id: 'TKL-2026-006', no: 'TKL-2026-006', musteriId: 'MST-002', projeId: null,           konu: 'AnadoluDepo Eskişehir Aktarma Merkezi Ek Teklifi',    lokasyonSayisi: 1,  hizmetSayisi: 18, tarih: '2026-06-11', gecerlilik: '2026-07-11', hazirlayanId: 'PRS-013', durum: 'kaybedildi', toplamSatis: 214300,  toplamMaliyet: 94700,  ekGider: 7200,  revizyon: 1, notlar: 'Müşteri 2027 bütçesine erteledi; 2027 kampanyasında yeniden değerlendirilecek.' }
  ];

  var sozlesmeler = [
    { id: 'SZL-2026-001', no: 'SZL-2026-001', musteriId: 'MST-001', teklifId: 'TKL-2026-001', ad: 'Zambak Market 2026 Periyodik Kontrol Çerçeve Sözleşmesi', baslangic: '2026-02-01', bitis: '2026-12-31', kapsam: 'Yangın, elektrik, kaldırma-iletme, raf sistemi ve acil aydınlatma kontrolleri', fiyatListesiId: 'FL-2026-ZMB', partiBuyuklugu: 6, odemeVadesi: 45, taseronOdemeKurali: 'musteri-tahsilati-sonrasi', masrafSahibi: 'gavia', raporSlaGun: 7, yenileme: 'otomatik-degil', durum: 'yururlukte', bedel: 948200, notlar: 'Toplu faturalama: her 6 lokasyonda bir fatura (madde 7.2). Sözleşme 30 ve 50 lokasyonluk partileri de destekleyecek şekilde parametriktir.' },
    { id: 'SZL-2026-002', no: 'SZL-2026-002', musteriId: 'MST-002', teklifId: 'TKL-2026-002', ad: 'AnadoluDepo 2026–2027 Periyodik Kontrol Sözleşmesi',      baslangic: '2026-03-15', bitis: '2027-03-14', kapsam: 'Raf sistemi, kaldırma ekipmanı, yangın, elektrik ve acil aydınlatma kontrolleri', fiyatListesiId: 'FL-2026-ANL', partiBuyuklugu: 3, odemeVadesi: 60, taseronOdemeKurali: 'musteri-tahsilati-sonrasi', masrafSahibi: 'musteri', raporSlaGun: 10, yenileme: 'otomatik', durum: 'yururlukte', bedel: 3550700, notlar: 'Ulaşım ve konaklama masrafları müşteriye aittir (madde 9.4). Kısmi faturalama serbesttir.' },
    { id: 'SZL-2026-003', no: 'SZL-2026-003', musteriId: 'MST-003', teklifId: 'TKL-2026-003', ad: 'Efe Gıda 2026–2027 Periyodik Kontrol ve Ölçüm Sözleşmesi', baslangic: '2026-04-01', bitis: '2027-03-31', kapsam: 'Basınçlı kap, makine, elektrik, yangın, ortam ölçümleri ve PKD revizyonu', fiyatListesiId: 'FL-2026-EFE', partiBuyuklugu: 2, odemeVadesi: 30, taseronOdemeKurali: 'fatura-vadesinde', masrafSahibi: 'gavia', raporSlaGun: 5, yenileme: 'otomatik-degil', durum: 'yururlukte', bedel: 1018800, notlar: 'Rapor teslim süresi 5 iş günü; aşımda gecikme bedeli uygulanır (madde 6.3).' },
    { id: 'SZL-2025-001', no: 'SZL-2025-001', musteriId: 'MST-001', teklifId: null,           ad: 'Zambak Market 2025 Periyodik Kontrol Sözleşmesi',        baslangic: '2025-02-10', bitis: '2025-12-31', kapsam: '2025 dönemi yıllık kontroller', fiyatListesiId: 'FL-2025-STD', partiBuyuklugu: 6, odemeVadesi: 45, taseronOdemeKurali: 'musteri-tahsilati-sonrasi', masrafSahibi: 'gavia', raporSlaGun: 7, yenileme: 'yenilendi', durum: 'sona-erdi', bedel: 831400, notlar: 'SZL-2026-001 ile yenilendi.' }
  ];

  /* ---------------------------------------------------------------
     FATURA GRUPLARI — parti bazlı toplu faturalama
     --------------------------------------------------------------- */
  var faturaGruplari = [
    { id: 'FGR-2026-001', no: 'FGR-2026-001', projeId: 'PRJ-2026-001', musteriId: 'MST-001', ad: 'Zambak Market — 1. Parti', hedefParti: 6, lokasyonlar: ['LOK-0101','LOK-0102','LOK-0103','LOK-0104','LOK-0111','LOK-0112'], acilis: '2026-03-02', durum: 'kismen-faturalandi', faturaIds: ['FTR-2026-0031'], not: 'İki lokasyon faturalandı; 0104 ve 0112 mutabakat, 0111 rapor revizyonu bekliyor.' },
    { id: 'FGR-2026-002', no: 'FGR-2026-002', projeId: 'PRJ-2026-002', musteriId: 'MST-002', ad: 'AnadoluDepo — 1. Parti',   hedefParti: 3, lokasyonlar: ['LOK-0201','LOK-0202'],                                                   acilis: '2026-04-25', durum: 'kismen-faturalandi', faturaIds: ['FTR-2026-0044'], not: 'Gebze antreposu kısmi faturalandı (%55). Parti hedefine 1 lokasyon kaldı.' },
    { id: 'FGR-2026-003', no: 'FGR-2026-003', projeId: 'PRJ-2026-003', musteriId: 'MST-003', ad: 'Efe Gıda — 1. Parti',      hedefParti: 2, lokasyonlar: ['LOK-0301','LOK-0304'],                                                   acilis: '2026-07-12', durum: 'hedefe-ulasti',      faturaIds: [],                not: 'Parti doldu ancak Manisa tesisinin mutabakatı onaylanmadan fatura kesilemez.' },
    { id: 'FGR-2026-004', no: 'FGR-2026-004', projeId: 'PRJ-2026-001', musteriId: 'MST-001', ad: 'Zambak Market — 2. Parti', hedefParti: 6, lokasyonlar: ['LOK-0105'],                                                             acilis: '2026-08-10', durum: 'doluyor',            faturaIds: [],                not: 'Ağustos–Ekim kontrolleri bu partide toplanacak.' }
  ];

  /* ---------------------------------------------------------------
     FATURA ve TAHSİLATLAR
     Fatura satırları mutabakat kayıtlarından türetilir (mükerrer engeli).
     --------------------------------------------------------------- */
  var faturaTanimlari = [
    { id: 'FTR-2026-0031', no: 'GVT-A-2026-000031', grupId: 'FGR-2026-001', musteriId: 'MST-001', projeId: 'PRJ-2026-001', lokasyonlar: ['LOK-0101','LOK-0102'], tarih: '2026-03-25', vade: '2026-05-09', kdvOran: 0.20, durum: 'kesildi',  tahsilatDurum: 'tam-tahsil',    aciklama: 'Zambak Market 1. parti — Kartal ve Ümraniye şubeleri.' },
    { id: 'FTR-2026-0044', no: 'GVT-A-2026-000044', grupId: 'FGR-2026-002', musteriId: 'MST-002', projeId: 'PRJ-2026-002', lokasyonlar: ['LOK-0201'],            tarih: '2026-05-12', vade: '2026-07-11', kdvOran: 0.20, durum: 'kesildi',  tahsilatDurum: 'kismen-tahsil', aciklama: 'AnadoluDepo Gebze antrepo — kısmi faturalama (mutabakat edilen miktarın %55\'i).' }
  ];

  /* mutabakattan bağımsız (geçmiş dönem / gecikmiş) faturalar */
  var digerFaturalar = [
    { id: 'FTR-2026-0058', no: 'GVT-A-2026-000058', grupId: null, musteriId: 'MST-001', projeId: 'PRJ-2026-001', lokasyonlar: [], tarih: '2026-06-05', vade: '2026-07-20', araToplam: 186500, kdv: 37300, toplam: 223800, tahsilEdilen: 0,      kalan: 223800, kdvOran: 0.20, durum: 'kesildi', tahsilatDurum: 'vadesi-gecti', aciklama: 'Yeniden kontrol ve ilave keşif hizmet bedeli.' },
    { id: 'FTR-2026-0067', no: 'GVT-A-2026-000067', grupId: null, musteriId: 'MST-003', projeId: 'PRJ-2026-003', lokasyonlar: [], tarih: '2026-07-28', vade: '2026-08-27', araToplam: 96400,  kdv: 19280, toplam: 115680, tahsilEdilen: 0,      kalan: 115680, kdvOran: 0.20, durum: 'kesildi', tahsilatDurum: 'bekleniyor',   aciklama: 'PKD revizyon çalışması avans faturası.' },
    { id: 'FTR-2025-0187', no: 'GVT-A-2025-000187', grupId: null, musteriId: 'MST-001', projeId: 'PRJ-2025-004', lokasyonlar: [], tarih: '2025-12-22', vade: '2026-02-05', araToplam: 612000, kdv: 122400, toplam: 734400, tahsilEdilen: 734400, kalan: 0,      kdvOran: 0.20, durum: 'kesildi', tahsilatDurum: 'tam-tahsil',   aciklama: '2025 kampanyası kapanış faturası.' }
  ];

  var tahsilatlar = [
    { id: 'THS-2026-001', faturaId: 'FTR-2026-0031', musteriId: 'MST-001', tarih: '2026-05-06', tutar: null, yontem: 'havale', aciklama: 'Vade tarihinden 3 gün önce tam tahsilat.', tam: true },
    { id: 'THS-2026-002', faturaId: 'FTR-2026-0044', musteriId: 'MST-002', tarih: '2026-07-09', tutar: null, oran: 0.60, yontem: 'havale', aciklama: 'Faturanın %60\'ı tahsil edildi; kalan bakiye için mutabakat sürüyor.', tam: false },
    { id: 'THS-2025-118', faturaId: 'FTR-2025-0187', musteriId: 'MST-001', tarih: '2026-02-03', tutar: 734400, yontem: 'havale', aciklama: '2025 kapanış faturası tam tahsil edildi.', tam: true }
  ];

  /* ---------------------------------------------------------------
     HAKEDİŞLER (müşteri) ve TAŞERON HAKEDİŞLERİ
     --------------------------------------------------------------- */
  var hakedisler = [
    { id: 'HKD-2026-001', no: 'HKD-2026-001', projeId: 'PRJ-2026-001', musteriId: 'MST-001', donem: '2026-03', lokasyonSayisi: 2, hazirlayanId: 'PRS-012', onaylayanId: 'PRS-003', tarih: '2026-03-22', durum: 'faturalandi', faturaId: 'FTR-2026-0031', not: 'Mart ayı Kartal ve Ümraniye kontrolleri.' },
    { id: 'HKD-2026-002', no: 'HKD-2026-002', projeId: 'PRJ-2026-002', musteriId: 'MST-002', donem: '2026-04', lokasyonSayisi: 1, hazirlayanId: 'PRS-012', onaylayanId: 'PRS-003', tarih: '2026-05-08', durum: 'faturalandi', faturaId: 'FTR-2026-0044', not: 'Gebze antrepo kısmi hakediş.' },
    { id: 'HKD-2026-003', no: 'HKD-2026-003', projeId: 'PRJ-2026-001', musteriId: 'MST-001', donem: '2026-08', lokasyonSayisi: 1, hazirlayanId: 'PRS-012', onaylayanId: null,      tarih: '2026-08-14', durum: 'onay-bekliyor', faturaId: null, not: 'Bornova şubesi; rapor onaylandı, mutabakat tamam.' },
    { id: 'HKD-2026-004', no: 'HKD-2026-004', projeId: 'PRJ-2026-003', musteriId: 'MST-003', donem: '2026-08', lokasyonSayisi: 1, hazirlayanId: 'PRS-012', onaylayanId: null,      tarih: '2026-08-15', durum: 'hazirlaniyor',  faturaId: null, not: 'Manisa mamul deposu; fatura grubu hedefi bekleniyor.' }
  ];

  var taseronHakedisleri = [
    { id: 'TH-2026-001', no: 'TH-2026-001', taseronId: 'TSR-004', projeId: 'PRJ-2026-001', donem: '2026-03', lokasyonlar: ['LOK-0101','LOK-0102'], isEmirleri: ['IE-2026-0001','IE-2026-0002'], tutar: 53388,  tarih: '2026-03-28', durum: 'tam-odendi',                 odemeTarihi: '2026-05-12', musteriFaturaId: 'FTR-2026-0031', not: 'Müşteri tahsilatı 6 Mayıs\'ta tamamlandı, ödeme 12 Mayıs\'ta yapıldı.' },
    { id: 'TH-2026-002', no: 'TH-2026-002', taseronId: 'TSR-004', projeId: 'PRJ-2026-002', donem: '2026-04', lokasyonlar: ['LOK-0201'],            isEmirleri: ['IE-2026-0007'],                tutar: 203083, tarih: '2026-05-06', durum: 'kismen-odendi',              odemeTarihi: '2026-07-15', musteriFaturaId: 'FTR-2026-0044', not: 'Müşteriden %60 tahsil edildiği için hakedişin %60\'ı ödendi (sözleşme madde 11.2).' },
    { id: 'TH-2026-003', no: 'TH-2026-003', taseronId: 'TSR-001', projeId: 'PRJ-2026-001', donem: '2026-08', lokasyonlar: ['LOK-0103'],            isEmirleri: ['IE-2026-0003'],                tutar: 22940,  tarih: '2026-08-14', durum: 'musteri-tahsilati-bekleniyor', odemeTarihi: null,        musteriFaturaId: null,            not: 'Rapor onaylandı, müşteri faturası henüz kesilmedi.' },
    { id: 'TH-2026-004', no: 'TH-2026-004', taseronId: 'TSR-004', projeId: 'PRJ-2026-002', donem: '2026-08', lokasyonlar: ['LOK-0202'],            isEmirleri: ['IE-2026-0008'],                tutar: 243582, tarih: '2026-08-15', durum: 'taseron-faturasi-bekleniyor', odemeTarihi: null,        musteriFaturaId: null,            not: 'Hakediş onaylandı; taşeron faturası bekleniyor.' },
    { id: 'TH-2026-005', no: 'TH-2026-005', taseronId: 'TSR-001', projeId: 'PRJ-2026-003', donem: '2026-08', lokasyonlar: ['LOK-0301'],            isEmirleri: ['IE-2026-0009'],                tutar: 130834, tarih: '2026-08-12', durum: 'hakedis-hazirlaniyor',        odemeTarihi: null,        musteriFaturaId: null,            not: 'Rapor teknik incelemede; hakediş rapor onayından sonra kesinleşecek.' },
    { id: 'TH-2026-006', no: 'TH-2026-006', taseronId: 'TSR-003', projeId: 'PRJ-2026-001', donem: '2026-08', lokasyonlar: [],                      isEmirleri: ['IE-2026-0013','IE-2026-0015'], tutar: 0,      tarih: '2026-08-14', durum: 'hakedis-hazirlaniyor',        odemeTarihi: null,        musteriFaturaId: null,            not: 'Ağustos kontrolleri henüz gerçekleşmedi; hakediş kontroller tamamlandıkça oluşacak.' },
    { id: 'TH-2026-007', no: 'TH-2026-007', taseronId: 'TSR-001', projeId: 'PRJ-2026-003', donem: '2026-08', lokasyonlar: ['LOK-0304'],            isEmirleri: ['IE-2026-0010'],                tutar: 162274, tarih: '2026-08-15', durum: 'odemeye-uygun',               odemeTarihi: null,        musteriFaturaId: null,            not: 'Rapor onaylandı ve taşeron faturası alındı; ödeme onayı bekleniyor.' }
  ];

  /* ---------------------------------------------------------------
     KALİTE YÖNETİMİ
     --------------------------------------------------------------- */
  var kaliteDokumanlari = [
    { id: 'KLT-P-001', kod: 'P-01', ad: 'Muayene Süreci Prosedürü',                 tur: 'Prosedür',      versiyon: 'v6', yayin: '2026-01-05', hazirlayanId: 'PRS-005', onaylayanId: 'PRS-002', gecerlilik: '2028-01-05', modul: ['Operasyon','Teknik'],       durum: 'yayinda',   sayfa: 14 },
    { id: 'KLT-P-002', kod: 'P-02', ad: 'Tarafsızlık ve Gizlilik Prosedürü',         tur: 'Prosedür',      versiyon: 'v4', yayin: '2025-09-18', hazirlayanId: 'PRS-005', onaylayanId: 'PRS-002', gecerlilik: '2027-09-18', modul: ['Kalite'],                   durum: 'yayinda',   sayfa: 8 },
    { id: 'KLT-P-003', kod: 'P-03', ad: 'Şikâyet ve İtiraz Değerlendirme Prosedürü', tur: 'Prosedür',     versiyon: 'v3', yayin: '2025-11-27', hazirlayanId: 'PRS-005', onaylayanId: 'PRS-002', gecerlilik: '2027-11-27', modul: ['Kalite','Satış'],           durum: 'yayinda',   sayfa: 6 },
    { id: 'KLT-P-004', kod: 'P-04', ad: 'Taşeron Değerlendirme ve Kontrol Prosedürü', tur: 'Prosedür',    versiyon: 'v2', yayin: '2026-02-10', hazirlayanId: 'PRS-005', onaylayanId: 'PRS-003', gecerlilik: '2028-02-10', modul: ['Taşeron'],                  durum: 'yayinda',   sayfa: 11 },
    { id: 'KLT-T-001', kod: 'T-01', ad: 'Kaldırma Ekipmanı Muayene Talimatı',        tur: 'Talimat',       versiyon: 'v5', yayin: '2026-01-15', hazirlayanId: 'PRS-004', onaylayanId: 'PRS-005', gecerlilik: '2028-01-15', modul: ['Teknik'],                   durum: 'yayinda',   sayfa: 22 },
    { id: 'KLT-T-002', kod: 'T-02', ad: 'Elektrik Ölçüm Talimatı',                   tur: 'Talimat',       versiyon: 'v4', yayin: '2026-03-01', hazirlayanId: 'PRS-008', onaylayanId: 'PRS-004', gecerlilik: '2028-03-01', modul: ['Teknik'],                   durum: 'yayinda',   sayfa: 18 },
    { id: 'KLT-T-003', kod: 'T-03', ad: 'Ölçüm Cihazı Kalibrasyon Takip Talimatı',   tur: 'Talimat',       versiyon: 'v3', yayin: '2025-12-04', hazirlayanId: 'PRS-005', onaylayanId: 'PRS-004', gecerlilik: '2027-12-04', modul: ['Teknik','Kalite'],          durum: 'yayinda',   sayfa: 9 },
    { id: 'KLT-T-004', kod: 'T-04', ad: 'Saha İş Güvenliği Talimatı',                tur: 'Talimat',       versiyon: 'v6', yayin: '2026-04-22', hazirlayanId: 'PRS-005', onaylayanId: 'PRS-003', gecerlilik: '2028-04-22', modul: ['Operasyon'],                durum: 'yayinda',   sayfa: 12 },
    { id: 'KLT-F-001', kod: 'F-01', ad: 'Saha Kontrol Formu Şablonu',                tur: 'Form',          versiyon: 'v7', yayin: '2026-05-14', hazirlayanId: 'PRS-004', onaylayanId: 'PRS-005', gecerlilik: '2028-05-14', modul: ['Operasyon','Teknik'],       durum: 'yayinda',   sayfa: 4 },
    { id: 'KLT-F-002', kod: 'F-02', ad: 'Uygunsuzluk Bildirim Formu',                tur: 'Form',          versiyon: 'v3', yayin: '2025-10-08', hazirlayanId: 'PRS-005', onaylayanId: 'PRS-004', gecerlilik: '2027-10-08', modul: ['Teknik','Kalite'],          durum: 'yayinda',   sayfa: 2 },
    { id: 'KLT-F-003', kod: 'F-03', ad: 'Müşteri Memnuniyet Anketi',                 tur: 'Form',          versiyon: 'v2', yayin: '2026-06-01', hazirlayanId: 'PRS-005', onaylayanId: 'PRS-002', gecerlilik: '2028-06-01', modul: ['Kalite','Satış'],           durum: 'yayinda',   sayfa: 3 },
    { id: 'KLT-F-004', kod: 'F-04', ad: 'İç Denetim Kontrol Listesi',                tur: 'Form',          versiyon: 'v4', yayin: '2026-07-09', hazirlayanId: 'PRS-005', onaylayanId: 'PRS-002', gecerlilik: '2028-07-09', modul: ['Kalite'],                   durum: 'yayinda',   sayfa: 7 },
    { id: 'KLT-K-001', kod: 'K-01', ad: 'Kalite El Kitabı',                          tur: 'El Kitabı',     versiyon: 'v8', yayin: '2026-01-02', hazirlayanId: 'PRS-005', onaylayanId: 'PRS-001', gecerlilik: '2029-01-02', modul: ['Kalite'],                   durum: 'yayinda',   sayfa: 48 },
    { id: 'KLT-P-005', kod: 'P-05', ad: 'Uzaktan Muayene ve Dijital Kanıt Prosedürü', tur: 'Prosedür',     versiyon: 'v1', yayin: null,        hazirlayanId: 'PRS-005', onaylayanId: null,      gecerlilik: null,        modul: ['Kalite','Teknik'],          durum: 'onayda',    sayfa: 10 },
    { id: 'KLT-T-005', kod: 'T-05', ad: 'Ortam Ölçümü Numune Alma Talimatı',         tur: 'Talimat',       versiyon: 'v2', yayin: '2024-06-14', hazirlayanId: 'PRS-009', onaylayanId: 'PRS-005', gecerlilik: '2026-06-14', modul: ['Teknik'],                   durum: 'yururlukten-kalkti', sayfa: 15 }
  ];

  var denetimler = [
    { id: 'DNT-2026-001', tur: 'İç Denetim',    kapsam: 'Muayene süreci ve saha uygulamaları', tarih: '2026-03-18', denetciId: 'PRS-005', denetlenenBirim: 'Operasyon', bulguSayisi: 3, majorSayisi: 0, minorSayisi: 3, gozlem: 1, durum: 'kapandi',  rapor: 'DNT-2026-001-RPR' },
    { id: 'DNT-2026-002', tur: 'İç Denetim',    kapsam: 'Ölçüm cihazı kalibrasyon takibi',     tarih: '2026-06-24', denetciId: 'PRS-005', denetlenenBirim: 'Teknik',    bulguSayisi: 3, majorSayisi: 1, minorSayisi: 2, gozlem: 0, durum: 'acik',     rapor: 'DNT-2026-002-RPR' },
    { id: 'DNT-2026-003', tur: 'Dış Denetim',   kapsam: 'Akreditasyon gözetim denetimi',        tarih: '2026-05-12', denetciId: null,      denetlenenBirim: 'Tüm süreçler', bulguSayisi: 2, majorSayisi: 0, minorSayisi: 2, gozlem: 3, durum: 'kapandi', rapor: 'DNT-2026-003-RPR' },
    { id: 'DNT-2026-004', tur: 'Taşeron Denetimi', kapsam: 'Batı Teknik saha uygulamaları',     tarih: '2026-07-30', denetciId: 'PRS-005', denetlenenBirim: 'TSR-001',   bulguSayisi: 4, majorSayisi: 1, minorSayisi: 3, gozlem: 1, durum: 'acik',     rapor: 'DNT-2026-004-RPR' },
    { id: 'DNT-2026-005', tur: 'İç Denetim',    kapsam: 'Rapor onay ve teslim süreci',          tarih: '2026-09-15', denetciId: 'PRS-005', denetlenenBirim: 'Teknik',    bulguSayisi: 0, majorSayisi: 0, minorSayisi: 0, gozlem: 0, durum: 'planlandi', rapor: null }
  ];

  var duzelticiFaaliyetler = [
    { id: 'DOF-2026-001', kaynak: 'İç Denetim',       kaynakId: 'DNT-2026-001', baslik: 'Saha fotoğraflarında zaman damgası eksikliği',      aciklama: 'Üç raporda saha fotoğraflarının çekim tarihi doğrulanamadı.', kokNeden: 'Mobil formda fotoğraf üst verisi kaydedilmiyordu.', faaliyet: 'Saha kontrol formuna otomatik zaman damgası eklendi; personel bilgilendirildi.', sorumluId: 'PRS-014', acilis: '2026-03-20', termin: '2026-04-20', kapanis: '2026-04-15', durum: 'kapandi',  etkinlik: 'etkin' },
    { id: 'DOF-2026-002', kaynak: 'İç Denetim',       kaynakId: 'DNT-2026-002', baslik: 'Kalibrasyonu geçmiş cihazın sahada bulunması',       aciklama: 'CHZ-012 kodlu cihazın kalibrasyon süresi dolmasına rağmen araç envanterinde kaldığı tespit edildi.', kokNeden: 'Kalibrasyon uyarı eşiği yalnız 30 gün öncesinde tetikleniyordu; süre dolduğunda engelleme yoktu.', faaliyet: 'Sistemde kalibrasyonu geçmiş cihazın iş emrine atanması engellendi; cihaz kullanım dışı bırakıldı.', sorumluId: 'PRS-004', acilis: '2026-06-26', termin: '2026-08-26', kapanis: null, durum: 'acik',     etkinlik: null },
    { id: 'DOF-2026-003', kaynak: 'Müşteri Şikâyeti', kaynakId: 'SKY-2026-002', baslik: 'Rapor teslim süresinin aşılması',                    aciklama: 'Efe Gıda 5 iş günü SLA süresinin aşıldığını bildirdi.', kokNeden: 'Teknik inceleme kuyruğunda önceliklendirme yapılmıyordu.', faaliyet: 'SLA süresi yaklaşan raporlar için otomatik uyarı ve öncelik sırası tanımlandı.', sorumluId: 'PRS-004', acilis: '2026-07-06', termin: '2026-08-31', kapanis: null, durum: 'acik',     etkinlik: null },
    { id: 'DOF-2026-004', kaynak: 'Taşeron Denetimi', kaynakId: 'DNT-2026-004', baslik: 'Taşeron personel belge geçerliliği takip edilmiyor', aciklama: 'Batı Teknik personeli Serap Yalçınkaya\'nın belgesinin 30 Eylül 2026\'da dolacağı sistemde izlenmiyordu.', kokNeden: 'Taşeron personel belgeleri yalnız sözleşme ekinde tutuluyordu.', faaliyet: 'Taşeron personel belgeleri sisteme taşındı; geçerlilik uyarısı 60 gün önceden üretilecek.', sorumluId: 'PRS-005', acilis: '2026-08-01', termin: '2026-09-30', kapanis: null, durum: 'acik',     etkinlik: null },
    { id: 'DOF-2026-005', kaynak: 'Dış Denetim',      kaynakId: 'DNT-2026-003', baslik: 'Muayene personeli tarafsızlık beyanları güncel değil', aciklama: 'İki personelin yıllık tarafsızlık beyanı 2025 tarihliydi.', kokNeden: 'Beyan yenileme hatırlatması manuel takip ediliyordu.', faaliyet: 'Beyanlar yenilendi; yıllık hatırlatma sistem görevi olarak tanımlandı.', sorumluId: 'PRS-005', acilis: '2026-05-16', termin: '2026-06-30', kapanis: '2026-06-11', durum: 'kapandi', etkinlik: 'etkin' }
  ];

  var musteriSikayetleri = [
    { id: 'SKY-2026-001', musteriId: 'MST-001', lokasyonId: 'LOK-0111', tarih: '2026-07-24', kanal: 'E-posta',   konu: 'Yeniden kontrol için ek ücret talebi',      aciklama: 'Müşteri, ekipmanların gösterilememesinin kendi sorumluluğunda olmadığını belirterek ücretsiz yeniden kontrol talep etti.', atananId: 'PRS-003', durum: 'degerlendiriliyor', cozum: null, kapanis: null, dofId: null,           memnuniyet: null },
    { id: 'SKY-2026-002', musteriId: 'MST-003', lokasyonId: 'LOK-0301', tarih: '2026-07-02', kanal: 'Telefon',   konu: 'Rapor teslim süresi aşıldı',               aciklama: 'Sözleşmedeki 5 iş günlük teslim süresinin aşıldığı bildirildi.', atananId: 'PRS-004', durum: 'kapandi',           cozum: 'SLA takibi ve öncelik sırası devreye alındı; müşteriye yazılı geri bildirim yapıldı.', kapanis: '2026-07-18', dofId: 'DOF-2026-003', memnuniyet: 4 },
    { id: 'SKY-2026-003', musteriId: 'MST-002', lokasyonId: 'LOK-0201', tarih: '2026-05-19', kanal: 'Portal',    konu: 'Fatura tutarı mutabakatla uyuşmuyor',      aciklama: 'Kısmi faturada gösterilen miktarın mutabakat tablosuyla eşleşmediği düşünülüyordu.', atananId: 'PRS-012', durum: 'kapandi',           cozum: 'Kısmi faturalama mantığı müşteriye açıklandı; fatura grubu detayı portalda paylaşıldı.', kapanis: '2026-05-27', dofId: null,          memnuniyet: 5 },
    { id: 'SKY-2026-004', musteriId: 'MST-001', lokasyonId: 'LOK-0104', tarih: '2026-08-13', kanal: 'Portal',    konu: 'Uygunsuzluk önem derecesine itiraz',       aciklama: 'Raf dikmesindeki deformasyonun "yüksek" değil "orta" seviye olduğu iddia edildi.', atananId: 'PRS-004', durum: 'acik',              cozum: null, kapanis: null, dofId: null,           memnuniyet: null }
  ];

  /* ---------------------------------------------------------------
     BİLDİRİMLER · AJANDA · İŞLEM KAYITLARI
     --------------------------------------------------------------- */
  var bildirimTurleri = [
    { k: 'kontrol-yaklasiyor',   ad: 'Kontrol tarihi yaklaşıyor',        ikon: 'fa-calendar-day',       ton: 'info',   kanallar: ['uygulama','eposta'] },
    { k: 'tarih-onayi',          ad: 'Tarih onayı bekleniyor',           ikon: 'fa-calendar-check',     ton: 'warn',   kanallar: ['uygulama','eposta','sms'] },
    { k: 'is-emri',              ad: 'İş emri oluşturuldu veya değişti', ikon: 'fa-clipboard-list',     ton: 'info',   kanallar: ['uygulama'] },
    { k: 'kontrol-gecikti',      ad: 'Kontrol gecikti',                  ikon: 'fa-triangle-exclamation', ton: 'danger', kanallar: ['uygulama','eposta'] },
    { k: 'rapor-onay',           ad: 'Rapor teknik onay bekliyor',       ikon: 'fa-stamp',              ton: 'warn',   kanallar: ['uygulama'] },
    { k: 'rapor-sla',            ad: 'Rapor SLA süresi yaklaşıyor',      ikon: 'fa-hourglass-half',     ton: 'warn',   kanallar: ['uygulama','eposta'] },
    { k: 'rapor-teslim',         ad: 'Rapor müşteriye teslim edildi',    ikon: 'fa-paper-plane',        ton: 'ok',     kanallar: ['uygulama','eposta'] },
    { k: 'uygunsuzluk',          ad: 'Uygunsuzluk tespit edildi',        ikon: 'fa-circle-exclamation', ton: 'danger', kanallar: ['uygulama','eposta'] },
    { k: 'yeniden-kontrol',      ad: 'Yeniden kontrol zamanı geldi',     ikon: 'fa-rotate-right',       ton: 'warn',   kanallar: ['uygulama','eposta'] },
    { k: 'fatura-grubu-doldu',   ad: 'Fatura grubu hedefe ulaştı',       ikon: 'fa-layer-group',        ton: 'info',   kanallar: ['uygulama','eposta'] },
    { k: 'fatura-vadesi',        ad: 'Fatura vadesi yaklaştı veya geçti', ikon: 'fa-file-invoice-dollar', ton: 'danger', kanallar: ['uygulama','eposta'] },
    { k: 'tahsilat',             ad: 'Müşteri tahsilatı tamamlandı',     ikon: 'fa-money-bill-transfer', ton: 'ok',    kanallar: ['uygulama'] },
    { k: 'taseron-odeme',        ad: 'Taşeron ödemeye uygun hale geldi', ikon: 'fa-handshake-angle',    ton: 'info',   kanallar: ['uygulama','eposta'] },
    { k: 'belge-suresi',         ad: 'Kalibrasyon veya belge süresi doluyor', ikon: 'fa-certificate',   ton: 'warn',   kanallar: ['uygulama','eposta'] }
  ];

  var bildirimler = [
    { id: 'BLD-001', tur: 'kontrol-gecikti',    baslik: 'Yangın pompası uygunsuzluğu terminini aştı',        detay: 'LOK-0111 Seyhan şubesi — UYG-2026-007 kritik uygunsuzluğun termini 28 Temmuz 2026 idi.', zaman: '2026-08-17T08:12:00', okundu: false, hedefRoller: ['sahip','gm','operasyon','teknik'], link: 'uygunsuzluk-detay.html?id=UYG-2026-007' },
    { id: 'BLD-002', tur: 'rapor-sla',          baslik: 'Rapor SLA süresi aşıldı',                           detay: 'RPR-2026-0009 Efe Gıda Manisa — 5 günlük teslim süresi 9 Ağustos\'ta doldu, rapor hâlâ teknik incelemede.',           zaman: '2026-08-17T07:45:00', okundu: false, hedefRoller: ['teknik','operasyon','gm'],       link: 'rapor-detay.html?id=RPR-2026-0009' },
    { id: 'BLD-003', tur: 'belge-suresi',       baslik: 'Kalibrasyon süresi 22 gün içinde doluyor',          detay: 'CHZ-006 Yük Test Kiti — kalibrasyon geçerliliği 8 Eylül 2026 tarihinde sona eriyor.',    zaman: '2026-08-17T07:30:00', okundu: false, hedefRoller: ['teknik','kalite','operasyon'],   link: 'cihaz-detay.html?id=CHZ-006' },
    { id: 'BLD-004', tur: 'tarih-onayi',        baslik: 'Müşteri tarih onayı bekleniyor',                    detay: 'IE-2026-0015 Zambak Çankaya — 24 Ağustos planı için müşteri onayı alınamadı.',           zaman: '2026-08-16T16:20:00', okundu: false, hedefRoller: ['planlama','operasyon','satis'],  link: 'is-emri-detay.html?id=IE-2026-0015' },
    { id: 'BLD-005', tur: 'fatura-grubu-doldu', baslik: 'Fatura grubu hedefe ulaştı',                        detay: 'FGR-2026-003 Efe Gıda 1. Parti — 2/2 lokasyon eklendi, mutabakat onayı bekleniyor.',     zaman: '2026-08-14T11:05:00', okundu: true,  hedefRoller: ['finans','gm','sahip'],           link: 'fatura-grubu-detay.html?id=FGR-2026-003' },
    { id: 'BLD-006', tur: 'fatura-vadesi',      baslik: 'Fatura vadesi geçti',                               detay: 'FTR-2026-0058 Beyaz Zambak — 20 Temmuz vadesi 28 gün geçti, ₺223.800 tahsil edilmedi.',  zaman: '2026-08-14T09:00:00', okundu: true,  hedefRoller: ['finans','sahip','gm'],           link: 'faturalar.html?id=FTR-2026-0058' },
    { id: 'BLD-007', tur: 'taseron-odeme',      baslik: 'Taşeron hakedişi ödemeye uygun',                    detay: 'TH-2026-007 Batı Teknik — ₺162.274 tutarındaki hakediş ödeme onayı bekliyor.',            zaman: '2026-08-13T15:40:00', okundu: true,  hedefRoller: ['finans','sahip'],                link: 'taseron-hakedisleri.html?id=TH-2026-007' },
    { id: 'BLD-008', tur: 'uygunsuzluk',        baslik: 'Kritik uygunsuzluk tespit edildi',                  detay: 'UYG-2026-009 Efe Gıda Manisa — buhar kazanı emniyet ventili açma basıncı yüksek.',       zaman: '2026-08-10T14:15:00', okundu: true,  hedefRoller: ['teknik','kalite','operasyon','gm'], link: 'uygunsuzluk-detay.html?id=UYG-2026-009' },
    { id: 'BLD-009', tur: 'kontrol-yaklasiyor', baslik: 'Yarın 1 lokasyonda kontrol var',                    detay: 'IE-2026-0012 AnadoluDepo Mersin Liman Antrepo — 18 Ağustos 08:00.',                      zaman: '2026-08-17T06:00:00', okundu: false, hedefRoller: ['operasyon','planlama','saha','uzman'], link: 'is-emri-detay.html?id=IE-2026-0012' },
    { id: 'BLD-010', tur: 'rapor-onay',         baslik: '2 rapor teknik onay bekliyor',                      detay: 'RPR-2026-0004 ve RPR-2026-0009 teknik incelemede.',                                       zaman: '2026-08-12T10:30:00', okundu: true,  hedefRoller: ['teknik','gm'],                   link: 'rapor-onaylari.html' },
    { id: 'BLD-011', tur: 'belge-suresi',       baslik: 'Personel belgesi 7 gün içinde doluyor',             detay: 'Elif Karaçay — Kaldırma ve İletme Ekipmanları Muayenesi belgesi 24 Ağustos 2026\'da sona eriyor.', zaman: '2026-08-17T07:31:00', okundu: false, hedefRoller: ['kalite','teknik','sistem'], link: 'personel-detay.html?id=PRS-004' },
    { id: 'BLD-012', tur: 'tahsilat',           baslik: 'Müşteri tahsilatı tamamlandı',                      detay: 'FTR-2026-0031 Beyaz Zambak — tam tahsilat gerçekleşti, taşeron hakedişi ödemeye uygun hale geldi.', zaman: '2026-05-06T13:22:00', okundu: true, hedefRoller: ['finans','sahip','gm'],      link: 'tahsilatlar.html?id=THS-2026-001' }
  ];

  var ajanda = [
    { id: 'AJD-001', tarih: '2026-08-17', saat: '09:00', bitis: '17:00', tur: 'saha-kontrol', baslik: 'Zambak Nilüfer — saha kontrolü',            detay: 'IE-2026-0011 · Cem Aksular, Onur Bakırcı', link: 'is-emri-detay.html?id=IE-2026-0011', ton: 'info' },
    { id: 'AJD-002', tarih: '2026-08-17', saat: '11:00', bitis: '11:45', tur: 'toplanti',     baslik: 'Efe Gıda haftalık ilerleme toplantısı',     detay: 'Rapor SLA ve mutabakat gündemi',           link: 'proje-detay.html?id=PRJ-2026-003',  ton: 'off' },
    { id: 'AJD-003', tarih: '2026-08-17', saat: '15:00', bitis: '15:30', tur: 'onay',         baslik: 'RPR-2026-0009 teknik onay — SLA aşıldı',    detay: 'Teslim süresi 8 gün aşıldı',                        link: 'rapor-detay.html?id=RPR-2026-0009', ton: 'danger' },
    { id: 'AJD-004', tarih: '2026-08-18', saat: '08:00', bitis: '18:00', tur: 'saha-kontrol', baslik: 'AnadoluDepo Mersin Liman — saha kontrolü',  detay: 'IE-2026-0012 · Tuna Şahinkaya, Melis Toprakçı', link: 'is-emri-detay.html?id=IE-2026-0012', ton: 'info' },
    { id: 'AJD-005', tarih: '2026-08-19', saat: '09:30', bitis: '16:00', tur: 'saha-kontrol', baslik: 'Zambak Selçuklu — saha kontrolü',           detay: 'IE-2026-0013 · Tuna Şahinkaya',            link: 'is-emri-detay.html?id=IE-2026-0013', ton: 'warn' },
    { id: 'AJD-006', tarih: '2026-08-20', saat: '08:30', bitis: '17:00', tur: 'saha-kontrol', baslik: 'AnadoluDepo Kemalpaşa — saha kontrolü',     detay: 'IE-2026-0014 · Deniz Erkut, Onur Bakırcı', link: 'is-emri-detay.html?id=IE-2026-0014', ton: 'info' },
    { id: 'AJD-007', tarih: '2026-08-24', saat: '09:00', bitis: '16:00', tur: 'saha-kontrol', baslik: 'Zambak Çankaya — saha kontrolü',            detay: 'IE-2026-0015 · tarih onayı bekleniyor',    link: 'is-emri-detay.html?id=IE-2026-0015', ton: 'warn' },
    { id: 'AJD-008', tarih: '2026-08-25', saat: '10:00', bitis: '14:00', tur: 'yeniden-kontrol', baslik: 'Zambak Seyhan — yeniden kontrol',        detay: 'YKN-2026-001 · yangın pompası testi',      link: 'yeniden-kontroller.html?id=YKN-2026-001', ton: 'danger' },
    { id: 'AJD-009', tarih: '2026-08-26', saat: '08:00', bitis: '14:00', tur: 'saha-kontrol', baslik: 'Efe Gıda Balıkesir — saha kontrolü',        detay: 'IE-2026-0016 · Tuna Şahinkaya',            link: 'is-emri-detay.html?id=IE-2026-0016', ton: 'info' },
    { id: 'AJD-010', tarih: '2026-08-27', saat: '11:00', bitis: '15:00', tur: 'yeniden-kontrol', baslik: 'Efe Gıda Manisa — kazan yeniden testi',  detay: 'YKN-2026-004 · emniyet ventili',           link: 'yeniden-kontroller.html?id=YKN-2026-004', ton: 'warn' },
    { id: 'AJD-011', tarih: '2026-08-31', saat: '14:00', bitis: '15:00', tur: 'termin',       baslik: 'DOF-2026-003 termin tarihi',                detay: 'Rapor SLA düzeltici faaliyeti',            link: 'duzeltici-faaliyetler.html?id=DOF-2026-003', ton: 'warn' },
    { id: 'AJD-012', tarih: '2026-09-02', saat: '09:00', bitis: '13:00', tur: 'yeniden-kontrol', baslik: 'Zambak Gebze Depo — dübel doğrulaması',  detay: 'YKN-2026-003',                             link: 'yeniden-kontroller.html?id=YKN-2026-003', ton: 'info' },
    { id: 'AJD-013', tarih: '2026-09-08', saat: '10:00', bitis: '11:00', tur: 'kalibrasyon',  baslik: 'CHZ-006 kalibrasyon geçerlilik sonu',       detay: 'Yük test kiti — yenileme randevusu alınmalı', link: 'cihaz-detay.html?id=CHZ-006',        ton: 'danger' },
    { id: 'AJD-014', tarih: '2026-09-15', saat: '09:00', bitis: '17:00', tur: 'denetim',      baslik: 'İç denetim — rapor onay süreci',            detay: 'DNT-2026-005 · Bora Yıldırgan',            link: 'denetimler.html?id=DNT-2026-005',   ton: 'off' }
  ];

  var islemKayitlari = [
    { id: 'LOG-00001', zaman: '2026-08-17T08:42:11', kullaniciId: 'PRS-003', rol: 'operasyon', modul: 'İş Emri',    kayit: 'IE-2026-0011', islem: 'durum-degisikligi', onceki: 'Planlandı',            yeni: 'Sahada',                aciklama: 'Ekip lokasyona ulaştı, kontrol başlatıldı.', ip: '10.0.0.14' },
    { id: 'LOG-00002', zaman: '2026-08-17T08:12:03', kullaniciId: null,      rol: 'sistem',    modul: 'Bildirim',   kayit: 'UYG-2026-007', islem: 'bildirim-uretildi', onceki: null,                   yeni: 'Termin aşımı',          aciklama: 'Kritik uygunsuzluk termini aşıldı, otomatik uyarı üretildi.', ip: null },
    { id: 'LOG-00003', zaman: '2026-08-16T17:05:47', kullaniciId: 'PRS-006', rol: 'planlama',  modul: 'Planlama',   kayit: 'IE-2026-0015', islem: 'guncelleme',        onceki: '2026-08-21',           yeni: '2026-08-24',            aciklama: 'Müşteri talebiyle kontrol tarihi ötelendi.', ip: '10.0.0.22' },
    { id: 'LOG-00004', zaman: '2026-08-14T11:05:20', kullaniciId: null,      rol: 'sistem',    modul: 'Fatura',     kayit: 'FGR-2026-003', islem: 'durum-degisikligi', onceki: 'Doluyor',              yeni: 'Hedefe Ulaştı',         aciklama: 'Parti hedefine ulaşıldı (2/2).', ip: null },
    { id: 'LOG-00005', zaman: '2026-08-13T15:38:02', kullaniciId: 'PRS-012', rol: 'finans',    modul: 'Taşeron Hakedişi', kayit: 'TH-2026-007', islem: 'durum-degisikligi', onceki: 'Taşeron Faturası Bekleniyor', yeni: 'Ödemeye Uygun', aciklama: 'Taşeron faturası sisteme yüklendi.', ip: '10.0.0.31' },
    { id: 'LOG-00006', zaman: '2026-08-12T10:22:55', kullaniciId: 'PRS-008', rol: 'uzman',     modul: 'Teknik Rapor', kayit: 'RPR-2026-0004', islem: 'olusturma',       onceki: null,                   yeni: 'Teknik İncelemede',     aciklama: 'Rapor teknik incelemeye gönderildi.', ip: '10.0.0.18' },
    { id: 'LOG-00007', zaman: '2026-08-11T09:14:30', kullaniciId: 'PRS-004', rol: 'teknik',    modul: 'Teknik Rapor', kayit: 'RPR-2026-0006', islem: 'revizyon-istendi', onceki: 'Teknik İncelemede',   yeni: 'Revizyon İstendi',      aciklama: 'Raf ölçüm krokisi eksik olduğu için revizyon istendi.', ip: '10.0.0.11' },
    { id: 'LOG-00008', zaman: '2026-08-10T14:15:09', kullaniciId: 'PRS-009', rol: 'uzman',     modul: 'Uygunsuzluk', kayit: 'UYG-2026-009', islem: 'olusturma',        onceki: null,                   yeni: 'Açık',                  aciklama: 'Kritik uygunsuzluk kaydedildi ve müşteriye bildirildi.', ip: '10.0.0.19' },
    { id: 'LOG-00009', zaman: '2026-08-06T16:48:12', kullaniciId: 'PRS-008', rol: 'uzman',     modul: 'Saha Kontrol', kayit: 'IE-2026-0004', islem: 'tamamlandi',      onceki: 'Sahada',               yeni: 'Kontrol Tamamlandı',    aciklama: 'Saha kontrol formu imzalandı ve senkronize edildi.', ip: '10.0.0.18' },
    { id: 'LOG-00010', zaman: '2026-07-15T10:03:41', kullaniciId: 'PRS-012', rol: 'finans',    modul: 'Tahsilat',    kayit: 'THS-2026-002', islem: 'olusturma',        onceki: null,                   yeni: 'Kısmen Tahsil Edildi',  aciklama: 'Fatura tutarının %60\'ı tahsil edildi.', ip: '10.0.0.31' },
    { id: 'LOG-00011', zaman: '2026-06-26T09:12:18', kullaniciId: 'PRS-005', rol: 'kalite',    modul: 'Denetim',     kayit: 'DNT-2026-002', islem: 'olusturma',        onceki: null,                   yeni: 'Açık',                  aciklama: 'İç denetim raporu yayımlandı, 1 major bulgu.', ip: '10.0.0.27' },
    { id: 'LOG-00012', zaman: '2026-05-06T13:22:04', kullaniciId: 'PRS-012', rol: 'finans',    modul: 'Tahsilat',    kayit: 'THS-2026-001', islem: 'olusturma',        onceki: null,                   yeni: 'Tam Tahsil Edildi',     aciklama: 'FTR-2026-0031 tam tahsil edildi.', ip: '10.0.0.31' }
  ];

  /* ---------------------------------------------------------------
     VERİ AKTARIMI GEÇMİŞİ — 10 adımlı sihirbaz kayıtları
     --------------------------------------------------------------- */
  var veriAktarimlari = [
    { id: 'IMP-2026-001', tarih: '2026-02-12', kullaniciId: 'PRS-014', tur: 'Lokasyon', dosya: 'zambak-sube-listesi.xlsx',      satir: 14, basarili: 12, hatali: 1, mukerrer: 1, durum: 'tamamlandi', geriAlinabilir: false, aciklama: 'Zambak Market şube listesi; 1 satırda il bilgisi eksikti, 1 mükerrer kayıt birleştirildi.' },
    { id: 'IMP-2026-002', tarih: '2026-03-18', kullaniciId: 'PRS-014', tur: 'Ön Envanter', dosya: 'zambak-envanter-mart.xlsx',   satir: 168, basarili: 168, hatali: 0, mukerrer: 0, durum: 'tamamlandi', geriAlinabilir: false, aciklama: 'Şablon dışı bildirilen ekipman miktarları aktarıldı.' },
    { id: 'IMP-2026-003', tarih: '2026-04-02', kullaniciId: 'PRS-014', tur: 'Lokasyon', dosya: 'anadolu-depo-lokasyon.xlsx',     satir: 7,  basarili: 6,  hatali: 0, mukerrer: 1, durum: 'tamamlandi', geriAlinabilir: false, aciklama: 'Eskişehir aktarma merkezi benzer isim uyarısı verdi, kullanıcı ayrı kayıt olarak onayladı.' },
    { id: 'IMP-2026-004', tarih: '2026-06-30', kullaniciId: 'PRS-014', tur: 'İletişim Kişisi', dosya: 'efe-gida-yetkililer.csv',  satir: 9,  basarili: 5,  hatali: 4, mukerrer: 0, durum: 'kismen',     geriAlinabilir: true,  aciklama: '4 satırda iletişim rolü eşleşmedi; hatalı satırlar indirildi ve düzeltiliyor.' },
    { id: 'IMP-2026-005', tarih: '2026-08-14', kullaniciId: 'PRS-014', tur: 'Ön Envanter', dosya: 'mersin-antrepo-envanter.xlsx', satir: 41, basarili: 0,  hatali: 0, mukerrer: 0, durum: 'onay-bekliyor', geriAlinabilir: true, aciklama: 'Kolon eşleştirme tamamlandı, kullanıcı onayı bekleniyor.' }
  ];

  var aktarimAdimlari = [
    { n: 1,  k: 'dosya',      ad: 'Dosya Yükleme',            aciklama: 'Excel veya CSV dosyasını seçin.' },
    { n: 2,  k: 'kolon',      ad: 'Kolon Eşleştirme',         aciklama: 'Dosya kolonlarını sistem alanlarıyla eşleştirin.' },
    { n: 3,  k: 'onizleme',   ad: 'Ön İzleme',                aciklama: 'İlk satırların nasıl aktarılacağını görün.' },
    { n: 4,  k: 'dogrulama',  ad: 'Veri Doğrulama',           aciklama: 'Zorunlu alan, tip ve format kontrolleri.' },
    { n: 5,  k: 'mukerrer',   ad: 'Mükerrer Kayıt Kontrolü',  aciklama: 'Benzer isimli kayıtlar için eşleşme önerileri.' },
    { n: 6,  k: 'hatali',     ad: 'Hatalı Satırlar',          aciklama: 'Aktarılamayan satırları inceleyin ve indirin.' },
    { n: 7,  k: 'onay',       ad: 'Kullanıcı Onayı',          aciklama: 'Aktarılacak kayıt özetini onaylayın.' },
    { n: 8,  k: 'aktarim',    ad: 'İçe Aktarma',              aciklama: 'Kayıtlar sisteme yazılır.' },
    { n: 9,  k: 'mutabakat',  ad: 'Mutabakat Raporu',         aciklama: 'Aktarım öncesi ve sonrası karşılaştırma.' },
    { n: 10, k: 'kayit',      ad: 'Aktarım Kaydı',            aciklama: 'Geri alınabilir aktarım kaydı oluşturulur.' }
  ];

  /* portal salt-okunur erişim tanımları */
  var portalErisimleri = [
    { id: 'PRT-001', musteriId: 'MST-001', kisiId: 'KSI-001', kapsamMarka: ['MRK-A','MRK-B'], kapsamBolge: 'tümü',    rol: 'Müşteri Yetkilisi', durum: 'aktif', sonGiris: '2026-08-16T14:22:00', suresiz: true,  bitis: null },
    { id: 'PRT-002', musteriId: 'MST-001', kisiId: 'KSI-003', kapsamMarka: ['MRK-A'],         kapsamBolge: 'Marmara', rol: 'Bölge Yöneticisi',  durum: 'aktif', sonGiris: '2026-08-12T09:41:00', suresiz: true,  bitis: null },
    { id: 'PRT-003', musteriId: 'MST-002', kisiId: 'KSI-010', kapsamMarka: ['MRK-C'],         kapsamBolge: 'tümü',    rol: 'Müşteri Yetkilisi', durum: 'aktif', sonGiris: '2026-08-15T11:07:00', suresiz: true,  bitis: null },
    { id: 'PRT-004', musteriId: 'MST-003', kisiId: 'KSI-015', kapsamMarka: ['MRK-D'],         kapsamBolge: 'tümü',    rol: 'Müşteri Yetkilisi', durum: 'aktif', sonGiris: '2026-08-17T08:03:00', suresiz: true,  bitis: null },
    { id: 'PRT-005', musteriId: 'MST-001', kisiId: null,      kapsamMarka: ['MRK-A'],         kapsamBolge: 'tümü',    rol: 'Denetçi (salt okunur)', durum: 'aktif', sonGiris: null,             suresiz: false, bitis: '2026-09-30', not: 'Bağımsız denetim firması için süreli rapor erişimi.' }
  ];

  /* ---------------------------------------------------------------
     FİYAT LİSTESİ İSKONTO KATSAYILARI ve FATURA SATIRI ÜRETİMİ
     Fatura satırları mutabakattan türetilir — mükerrer faturalama
     ancak faturalanan ≤ faturalanabilir koşuluyla mümkündür.
     --------------------------------------------------------------- */
  var listeKatsayilari = { 'FL-2026-STD': 1.00, 'FL-2026-ZMB': 0.88, 'FL-2026-ANL': 0.90, 'FL-2026-EFE': 0.92, 'FL-2025-STD': 0.94 };

  function birimSatisFiyati(hizmetId, fiyatListesiId) {
    var f = hizmetFiyatlari[hizmetId];
    if (!f) return 0;
    var k = listeKatsayilari[fiyatListesiId] != null ? listeKatsayilari[fiyatListesiId] : 1;
    return Math.round(f.satis * k);
  }
  function birimMaliyet(hizmetId) {
    var f = hizmetFiyatlari[hizmetId];
    return f ? f.maliyet : 0;
  }

  var faturaSatirlari = [];
  var faturalar = [];
  (function uretFaturalar() {
    var sira = 1;
    faturaTanimlari.forEach(function (ft) {
      var prj = null;
      for (var i = 0; i < projeler.length; i++) if (projeler[i].id === ft.projeId) prj = projeler[i];
      var fl = prj ? prj.fiyatListesiId : 'FL-2026-STD';
      var ara = 0;
      mutabakat.forEach(function (m) {
        if (ft.lokasyonlar.indexOf(m.lokasyonId) === -1) return;
        if (!m.faturalanan) return;
        var bf = birimSatisFiyati(m.hizmetId, fl);
        var tutar = bf * m.faturalanan;
        ara += tutar;
        faturaSatirlari.push({
          id: 'FST-' + String(sira++).padStart(4, '0'),
          faturaId: ft.id, lokasyonId: m.lokasyonId, hizmetId: m.hizmetId,
          faturalanabilir: m.faturalanabilir,
          oncekiFaturalanan: 0,
          buFaturaMiktar: m.faturalanan,
          kalanMiktar: m.kalan,
          birimFiyat: bf,
          tutar: tutar,
          birimMaliyet: birimMaliyet(m.hizmetId)
        });
      });
      var kdv = Math.round(ara * ft.kdvOran);
      faturalar.push({
        id: ft.id, no: ft.no, grupId: ft.grupId, musteriId: ft.musteriId, projeId: ft.projeId,
        lokasyonlar: ft.lokasyonlar, tarih: ft.tarih, vade: ft.vade, kdvOran: ft.kdvOran,
        araToplam: ara, kdv: kdv, toplam: ara + kdv,
        tahsilEdilen: ft.tahsilatDurum === 'tam-tahsil' ? ara + kdv
                    : ft.tahsilatDurum === 'kismen-tahsil' ? Math.round((ara + kdv) * 0.6) : 0,
        kalan: ft.tahsilatDurum === 'tam-tahsil' ? 0
             : ft.tahsilatDurum === 'kismen-tahsil' ? (ara + kdv) - Math.round((ara + kdv) * 0.6) : ara + kdv,
        durum: ft.durum, tahsilatDurum: ft.tahsilatDurum, aciklama: ft.aciklama
      });
    });
    digerFaturalar.forEach(function (f) { faturalar.push(f); });
    /* tahsilat tutarlarını faturadan tamamla */
    tahsilatlar.forEach(function (t) {
      if (t.tutar != null) return;
      var f = null;
      for (var i = 0; i < faturalar.length; i++) if (faturalar[i].id === t.faturaId) f = faturalar[i];
      t.tutar = f ? (t.oran ? Math.round(f.toplam * t.oran) : f.toplam) : 0;
    });
  })();

  /* ---------------------------------------------------------------
     SAHA KONTROL OTURUMLARI — taslak / çevrimdışı / senkron örnekleri
     --------------------------------------------------------------- */
  var sahaKontroller = [
    { id: 'SKT-2026-0011', isEmriId: 'IE-2026-0011', lokasyonId: 'LOK-0108', personelId: 'PRS-007', baslangic: '2026-08-17T09:04:00', bitis: null,                 durum: 'devam-ediyor', senkron: 'bekliyor',   cevrimdisi: true,  tamamlanan: 23, toplam: 58, fotograf: 14, uygunsuzluk: 1, imza: false, not: 'Depo alanında bağlantı yok; kayıtlar cihazda tutuluyor.' },
    { id: 'SKT-2026-0004', isEmriId: 'IE-2026-0004', lokasyonId: 'LOK-0104', personelId: 'PRS-008', baslangic: '2026-08-06T10:12:00', bitis: '2026-08-06T16:44:00', durum: 'tamamlandi',  senkron: 'tamamlandi', cevrimdisi: false, tamamlanan: 47, toplam: 47, fotograf: 31, uygunsuzluk: 3, imza: true,  not: 'Müşteri yetkilisi Gülsen Ardıç adına şube sorumlusu imzaladı.' },
    { id: 'SKT-2026-0009', isEmriId: 'IE-2026-0009', lokasyonId: 'LOK-0301', personelId: 'PRS-009', baslangic: '2026-08-04T08:06:00', bitis: '2026-08-05T17:20:00', durum: 'tamamlandi',  senkron: 'tamamlandi', cevrimdisi: false, tamamlanan: 186, toplam: 186, fotograf: 92, uygunsuzluk: 6, imza: true,  not: 'İki günlük kontrol; ortam ölçüm numuneleri laboratuvara gönderildi.' },
    { id: 'SKT-2026-0006', isEmriId: 'IE-2026-0006', lokasyonId: 'LOK-0112', personelId: 'PRS-007', baslangic: '2026-07-28T08:15:00', bitis: '2026-07-29T15:50:00', durum: 'tamamlandi',  senkron: 'tamamlandi', cevrimdisi: true,  tamamlanan: 118, toplam: 118, fotograf: 67, uygunsuzluk: 5, imza: true,  not: 'İlk gün çevrimdışı çalışıldı, akşam ofiste senkronize edildi.' },
    { id: 'SKT-2026-0005', isEmriId: 'IE-2026-0005', lokasyonId: 'LOK-0111', personelId: 'PRS-008', baslangic: '2026-07-14T09:08:00', bitis: '2026-07-14T14:02:00', durum: 'eksik-tamamlandi', senkron: 'tamamlandi', cevrimdisi: false, tamamlanan: 26, toplam: 34, fotograf: 19, uygunsuzluk: 4, imza: true, not: 'Jeneratör ve yangın pompası gösterilemedi; eksik ekipman kaydı açıldı.' }
  ];

  /* ---------------------------------------------------------------
     BELGELER — kayıtlara bağlı dosya listeleri (demo üst verisi)
     --------------------------------------------------------------- */
  var belgeler = [
    { id: 'BLG-001', kayitTuru: 'musteri',  kayitId: 'MST-001', ad: 'Cari sözleşme eki — fiyat listesi',      tur: 'pdf',  boyutKb: 412,  yukleyen: 'PRS-013', tarih: '2026-01-28' },
    { id: 'BLG-002', kayitTuru: 'musteri',  kayitId: 'MST-001', ad: 'Vergi levhası (kurgusal)',                tur: 'pdf',  boyutKb: 188,  yukleyen: 'PRS-012', tarih: '2026-01-05' },
    { id: 'BLG-003', kayitTuru: 'lokasyon', kayitId: 'LOK-0101', ad: 'Şube yerleşim planı',                    tur: 'pdf',  boyutKb: 1240, yukleyen: 'PRS-003', tarih: '2026-02-20' },
    { id: 'BLG-004', kayitTuru: 'lokasyon', kayitId: 'LOK-0112', ad: 'Raf sistemi imalat belgesi',             tur: 'pdf',  boyutKb: 2680, yukleyen: 'PRS-007', tarih: '2026-07-28' },
    { id: 'BLG-005', kayitTuru: 'rapor',    kayitId: 'RPR-2026-0001', ad: 'Saha fotoğraf arşivi',              tur: 'zip',  boyutKb: 18400, yukleyen: 'PRS-007', tarih: '2026-03-11' },
    { id: 'BLG-006', kayitTuru: 'rapor',    kayitId: 'RPR-2026-0009', ad: 'Ortam ölçümü laboratuvar sonucu',   tur: 'pdf',  boyutKb: 964,  yukleyen: 'PRS-009', tarih: '2026-08-09' },
    { id: 'BLG-007', kayitTuru: 'cihaz',    kayitId: 'CHZ-001', ad: 'Kalibrasyon sertifikası KAL-2026-00841',  tur: 'pdf',  boyutKb: 322,  yukleyen: 'PRS-008', tarih: '2026-03-14' },
    { id: 'BLG-008', kayitTuru: 'cihaz',    kayitId: 'CHZ-012', ad: 'Kalibrasyon sertifikası KAL-2025-01652',  tur: 'pdf',  boyutKb: 298,  yukleyen: 'PRS-011', tarih: '2025-06-24' },
    { id: 'BLG-009', kayitTuru: 'taseron',  kayitId: 'TSR-001', ad: 'Taşeron hizmet sözleşmesi',               tur: 'pdf',  boyutKb: 756,  yukleyen: 'PRS-003', tarih: '2026-01-08' },
    { id: 'BLG-010', kayitTuru: 'taseron',  kayitId: 'TSR-001', ad: 'Personel yetkinlik belgeleri',            tur: 'pdf',  boyutKb: 1420, yukleyen: 'PRS-005', tarih: '2026-01-08' },
    { id: 'BLG-011', kayitTuru: 'personel', kayitId: 'PRS-004', ad: 'Muayene personeli sertifikaları',         tur: 'pdf',  boyutKb: 890,  yukleyen: 'PRS-005', tarih: '2025-02-04' },
    { id: 'BLG-012', kayitTuru: 'sozlesme', kayitId: 'SZL-2026-001', ad: 'İmzalı sözleşme nüshası',            tur: 'pdf',  boyutKb: 1980, yukleyen: 'PRS-013', tarih: '2026-02-01' },
    { id: 'BLG-013', kayitTuru: 'proje',    kayitId: 'PRJ-2026-001', ad: 'Lokasyon listesi (aktarım kaynağı)', tur: 'xlsx', boyutKb: 64,   yukleyen: 'PRS-014', tarih: '2026-02-12' },
    { id: 'BLG-014', kayitTuru: 'uygunsuzluk', kayitId: 'UYG-2026-009', ad: 'Emniyet ventili ölçüm kaydı',     tur: 'pdf',  boyutKb: 240,  yukleyen: 'PRS-009', tarih: '2026-08-04' }
  ];

  var iletisimGecmisi = [
    { id: 'ILT-001', musteriId: 'MST-001', lokasyonId: 'LOK-0105', kisiId: 'KSI-003', tur: 'telefon',     tarih: '2026-08-16T15:40:00', kullaniciId: 'PRS-006', konu: 'Çankaya şubesi kontrol tarihi',        ozet: '24 Ağustos önerildi; bölge yöneticisi şube müdürüyle teyitleşip dönüş yapacak.' },
    { id: 'ILT-002', musteriId: 'MST-001', lokasyonId: 'LOK-0109', kisiId: 'KSI-003', tur: 'eposta',      tarih: '2026-08-10T09:12:00', kullaniciId: 'PRS-006', konu: 'Atakum şubesi envanter talebi (3. hatırlatma)', ozet: 'Ekipman listesi ve lokasyon yetkilisi bilgisi tekrar istendi.' },
    { id: 'ILT-003', musteriId: 'MST-003', lokasyonId: 'LOK-0301', kisiId: 'KSI-015', tur: 'uygunsuzluk-bildirimi', tarih: '2026-08-10T14:20:00', kullaniciId: 'PRS-009', konu: 'Kritik uygunsuzluk bildirimi', ozet: 'Buhar kazanı emniyet ventili bulgusu yazılı olarak iletildi; kazanın devre dışı bırakılması istendi.' },
    { id: 'ILT-004', musteriId: 'MST-002', lokasyonId: 'LOK-0201', kisiId: 'KSI-010', tur: 'rapor-gonderimi', tarih: '2026-05-04T11:05:00', kullaniciId: 'PRS-004', konu: 'GVT-2026-0007 rapor teslimi',       ozet: 'Rapor v2 revizyonu portal üzerinden teslim edildi.' },
    { id: 'ILT-005', musteriId: 'MST-002', lokasyonId: null,       kisiId: 'KSI-011', tur: 'fatura-bildirimi', tarih: '2026-05-12T16:30:00', kullaniciId: 'PRS-012', konu: 'FTR-2026-0044 kısmi fatura',       ozet: 'Kısmi faturalama gerekçesi ve kalan miktar açıklandı.' },
    { id: 'ILT-006', musteriId: 'MST-001', lokasyonId: 'LOK-0107', kisiId: 'KSI-003', tur: 'toplanti',    tarih: '2026-06-18T10:00:00', kullaniciId: 'PRS-003', konu: 'Muratpaşa tadilat takvimi',            ozet: 'Tadilatın 14 Eylül\'de biteceği bildirildi; kontrol Ekim ayına planlanacak.' },
    { id: 'ILT-007', musteriId: 'MST-001', lokasyonId: null,       kisiId: 'KSI-001', tur: 'tarih-onayi', tarih: '2026-08-03T13:15:00', kullaniciId: 'PRS-006', konu: 'Ağustos kontrol takvimi onayı',        ozet: 'Nilüfer ve Selçuklu şubeleri için tarihler onaylandı.' },
    { id: 'ILT-008', musteriId: 'MST-002', lokasyonId: 'LOK-0206', kisiId: 'KSI-010', tur: 'hatirlatma',  tarih: '2026-08-05T09:45:00', kullaniciId: 'PRS-006', konu: 'Samsun deposu taşınma durumu',         ozet: 'Yeni adres ve envanter bilgisi taşınma tamamlanınca iletilecek.' }
  ];

  /* ---------------------------------------------------------------
     DIŞA AÇILAN NESNE
     --------------------------------------------------------------- */
  return {
    bugun: BUGUN,
    firma: firma,
    roller: roller,
    personeller: personeller,
    yetkinlikler: yetkinlikler,
    personelBelgeleri: personelBelgeleri,
    musteriler: musteriler,
    markalar: markalar,
    iletisimRolleri: iletisimRolleri,
    iletisimKisileri: iletisimKisileri,
    iletisimGecmisi: iletisimGecmisi,
    hizmetKategorileri: hizmetKategorileri,
    hizmetler: hizmetler,
    hizmetFiyatlari: hizmetFiyatlari,
    fiyatListeleri: fiyatListeleri,
    listeKatsayilari: listeKatsayilari,
    durumlar: durumlar,
    projeler: projeler,
    lokasyonlar: lokasyonlar,
    envanterSablonlari: envanterSablonlari,
    lokasyonKapsamAyarlari: lokasyonKapsamAyarlari,
    lokasyonHizmetleri: lokasyonHizmetleri,
    ekipmanlar: ekipmanlar,
    mutabakat: mutabakat,
    isEmirleri: isEmirleri,
    hazirlikMaddeleri: hazirlikMaddeleri,
    kontrolMaddeleri: kontrolMaddeleri,
    sahaKontroller: sahaKontroller,
    raporSablonlari: raporSablonlari,
    raporlar: raporlar,
    uygunsuzluklar: uygunsuzluklar,
    yenidenKontroller: yenidenKontroller,
    eksikEkipmanlar: eksikEkipmanlar,
    teklifler: teklifler,
    sozlesmeler: sozlesmeler,
    faturaGruplari: faturaGruplari,
    faturalar: faturalar,
    faturaSatirlari: faturaSatirlari,
    tahsilatlar: tahsilatlar,
    hakedisler: hakedisler,
    taseronlar: taseronlar,
    taseronPersonelleri: taseronPersonelleri,
    taseronHakedisleri: taseronHakedisleri,
    olcumCihazlari: olcumCihazlari,
    kalibrasyonlar: kalibrasyonlar,
    kaliteDokumanlari: kaliteDokumanlari,
    denetimler: denetimler,
    duzelticiFaaliyetler: duzelticiFaaliyetler,
    musteriSikayetleri: musteriSikayetleri,
    bildirimTurleri: bildirimTurleri,
    bildirimler: bildirimler,
    ajanda: ajanda,
    islemKayitlari: islemKayitlari,
    veriAktarimlari: veriAktarimlari,
    aktarimAdimlari: aktarimAdimlari,
    portalErisimleri: portalErisimleri,
    belgeler: belgeler
  };
})();
