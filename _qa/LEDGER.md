# GAVIA · Faz 12 — ADIM DEFTERİ

> Her adım sonunda **tek satır** eklenir. Bu defter ile `_qa/durum.js` çıktısı
> birbirini doğrular; ikisi çelişirse `durum.js` esastır (defter elle yazılır,
> durum.js diskten okur).
>
> Tarama sütunu: `rol×sayfa bulgu / bütünlük sonucu`.
> Commit sütunu boşsa adım commit'lenmemiştir — yarım adımdır.

| Tarih | Adım | Dosyalar | Tarama | Commit | Bilinen kusur |
|---|---|---|---|---|---|
| 2026-08-18 | 1 | assets/js/types.js · assets/js/data-provider.js · _qa/test/*(3) · _qa/durum.js · CLAUDE.md | 0 bulgu / YAPISAL SORUN YOK · 33 test geçti | d9d51b6 | Tek karakterlik aramada gvFilter çipi görünür ama sonuç süzülmez (doküman §7 q≥2 kuralı) — kozmetik, migrate edilen sayfalarda geçerli |
| 2026-08-18 | 2 | assets/js/app.js · assets/js/list-controller.js · _qa/test/list-controller.test.js | 0 bulgu / YAPISAL SORUN YOK · 52 test geçti | 5b44e0f | gvPager henüz `sayfaya()` setter'ı taşımıyor; URL'den gelen page değeri sağlayıcıda doğru ama pager düğmesi 1'de duruyor — adım 3 kapatacak |
| 2026-08-18 | 3 | assets/js/components.js (gvPager) · assets/css/components.css | 0 bulgu / YAPISAL SORUN YOK · 67 test geçti | c983520 | — |
| 2026-08-18 | 4 | hizmet-katalogu.html · ekipmanlar.html · assets/js/data-provider.js | 0 bulgu / YAPISAL SORUN YOK · 69 test geçti | 08a8e2e | — |
| 2026-08-18 | 5a | is-emirleri · denetimler · duzeltici-faaliyetler · eksik-ekipmanlar · faturalar · hakedisler · iletisim-kisileri · islem-kayitlari · assets/js/data-provider.js (ozet) | 0 bulgu / YAPISAL SORUN YOK · 71 test geçti · 8/8 sayfa toplam kayıt aynı | 5ebceb9 | pageSize 15/12 olan sayfalar 20'ye taşındı — satır yoğunluğu bilinçli değişti |
| 2026-08-18 | 5b | kalibrasyonlar · kalite-dokumanlari · lokasyonlar · musteri-sikayetleri · musteriler · olcum-cihazlari · on-envanter · personeller | 0 bulgu / YAPISAL SORUN YOK · 71 test geçti · 8/8 sayfa toplam kayıt aynı | 2a02952 | — |
| 2026-08-18 | 5c | portal-faturalar · portal-lokasyonlar · portal-raporlar · projeler · saha-kontrol · sozlesme-pozlari · sozlesmeler · tahsilatlar | 0 bulgu / YAPISAL SORUN YOK · 71 test geçti · 8/8 aynı (portal sayfaları müşteri rolüyle de doğrulandı) | 4cbe6fd | — |
| 2026-08-18 | 5d | taseron-hakedisleri · teklifler · teknik-raporlar · uygunsuzluklar · yeniden-kontroller · rapor-sablonlari · taseronlar · yetkinlikler | 0 bulgu / YAPISAL SORUN YOK · 71 test geçti · 8/8 satır sayısı aynı | 0ffb4da | rapor-sablonlari/taseronlar/yetkinlikler'e yeni pager kabı eklendi — daha önce sayfalama yoktu |
| 2026-08-18 | 5e | aksiyon-merkezi · bildirimler · onaylar · rapor-onaylari · envanter-mutabakati · fatura-gruplari · fiyat-listeleri · assets/js/list-controller.js | 0 bulgu / YAPISAL SORUN YOK · 71 test geçti · matris 41/41 | 71e1365 | fatura-gruplari ve fiyat-listeleri'ne yeni pager eklendi; envanter-mutabakati'nda gvFilter birikme kusuru kapandı |
| 2026-08-18 | 6 | assets/js/navigation.js · _qa/test/navigation.test.js | 0 bulgu / YAPISAL SORUN YOK · 87 test geçti | fb30d13 | — |
| 2026-08-18 | 7 | assets/js/tooltip.js · assets/css/gavia-ui.css · assets/js/navigation.js · 72 sayfa (script etiketi) · _qa/test/tooltip.test.js | 0 bulgu / YAPISAL SORUN YOK · 100 test geçti | 5207cff | — |
| 2026-08-18 | 8 | assets/js/app.js · 14 detay sayfası · _qa/test/route-id.test.js | 0 bulgu / YAPISAL SORUN YOK · 121 test geçti | 789869e | — |
| 2026-08-18 | 9 | 21 sayfa (117 data-lbl) · _qa/test/data-lbl.test.js | 0 bulgu / YAPISAL SORUN YOK · 125 test geçti | 9176426 | rapor-detay `rd-kriter` ve faturalar/rapor-detay `pr-tablo` tabloları kapsam dışı bırakıldı (kart moduna girmiyorlar); düz `gtable` tabloları `gtable-cards`'a alınmadı — yerleşim kararı |

---

## Faz 12 kapanış notları

Aşağıdakiler kusur değil, **bilinçli karardır**. Bir sonraki turda "eksik"
sanılıp geri alınmasın diye gerekçeleriyle birlikte kayda geçirildi.

### Bilinçli sapmalar

**1. pageSize 15/12 → 20 (satır yoğunluğu değişti)**
Doküman §7 `pageSize` için yalnız 10/20/50'ye izin veriyor. Migrate edilen
sayfaların çoğu 15, portal sayfaları 12 kullanıyordu. `GV.sorguNormalize`
bunları "en yakın izinli değer" kuralıyla **10'a** indirirdi; sayfa yoğunluğu
düşmesin diye dokümanın varsayılanı olan **20**'ye taşındılar. Zaten 10/20/50
olan sayfalar (`kalibrasyonlar`, `islem-kayitlari`, `olcum-cihazlari`,
`sozlesme-pozlari`, `onaylar`, `rapor-onaylari`) kendi değerlerini korudu.
`gvPager`'ın kendi varsayılanı **15 olarak bırakıldı** — migrate edilmemiş
kullanımlar bit düzeyinde aynı kalsın diye.

**2. Tek karakterlik aramada çip / sonuç uyuşmazlığı**
Doküman §7 "q en az 2 karakterde çalışır" diyor; kural `data-provider.js`
içinde tek yerde uygulanıyor. Kullanıcı tek karakter yazdığında sonuç
süzülmez ama `gvFilter` "Arama: x" aktif filtre çipini gösterir. Çipi
bastıran kod `filters.js` içinde ve o dosyaya **bilinçli olarak
dokunulmadı** (migrate edilmemiş sayfaların davranışı değişmesin).
Kozmetik ve geçicidir — ikinci karakterde kendiliğinden düzelir.

### Kapsam dışı bırakılanlar

**3. `pr-tablo` ve `rd-kriter` tablolarında data-lbl tamamlanmadı**
`pr-tablo` yalnız `.pr-doc` içinde, **kâğıt çıktısı** için basılır;
`rd-kriter` sayfa yerel bir ölçüm tablosudur ve `.gv-tscroll` ile yatay
kayar. İkisi de `.gtable-cards` değildir, yani mobil kart moduna hiç
girmezler — `data-lbl` orada hiçbir şey yapmaz. Kalan 57 etiketsiz hücrenin
tamamı bu iki sınıftadır (`faturalar.html`, `rapor-detay.html`).
`_qa/test/data-lbl.test.js` bu ayrımı test olarak kilitliyor.

Aynı adımda düz `gtable` tablolarına `gtable-cards` **eklenmedi**: bu bir
yerleşim kararıdır, adımın kapsamı "data-lbl tamamlama" idi. Tablolar artık
etiketli, kart moduna geçirilmeye hazır.

**4. Detay ekranlarının alt koleksiyonları sayfalanmadı (13 ekran)**
`durum.js` bunu `ListController: 0/13` diye **kırmızı** gösterir; bu bir
gerileme değil, hiç başlanmamış bir iştir. Doküman §6 ikinci tablosundaki
13 ekran (`musteri-detay`, `proje-detay`, `lokasyon-detay`, `ekipman-detay`,
`is-emri-detay`, `rapor-detay`, `uygunsuzluk-detay`, `teklif-detay`,
`sozlesme-detay`, `fatura-grubu-detay`, `taseron-detay`, `personel-detay`,
`cihaz-detay`) bu koşunun kapsamında değildi — koşu, doküman matrisindeki
41 liste route'unu hedefliyordu ve o hedef 41/41 kapandı.

### Sonraki fazlara devreden açık başlıklar
- Durum makineleri: tek `transition` fonksiyonu (bugün 26 yerde `guncelle()`
  ile durum alanı doğrudan yazılıyor)
- Kimlik üretimi: `length + 1` / `Date.now()` yerine `crypto.randomUUID`
- Breakpoint tokenları (bugün 8 `@media` ham piksel kullanıyor)


---

# GAVIA · Faz 13 — ADIM DEFTERİ

Kapsam: `_docs/REVIZYON.md` §8 (algoritma düzeltmeleri) ve §11 (form standardı).
Branch: `faz-13-algoritma`.

| Tarih | Adım | Dosyalar | Tarama | Commit | Bilinen kusur |
|---|---|---|---|---|---|
| 2026-08-18 | 1 | assets/js/kimlik.js (yeni) · assets/js/demo-api.js · 73 sayfa (script etiketi) · 34 sayfa (kimlik ifadesi) · _qa/test/kimlik.test.js · _qa/durum.js · CLAUDE.md | 0 bulgu / YAPISAL SORUN YOK · 141 test geçti | 6f3aad9 | `ayarlar.html` numaralandırma ekranındaki `length + 1` bilinçli bırakıldı — kalıcı id değil, "sonraki numara" önizlemesi. Tekrar penceresi 8 sn: aynı içerikli kayıt bu süre içinde ikinci kez açılmaz. |
| 2026-08-18 | 2 | assets/js/durum-makinesi.js (yeni, 25 akış) · assets/js/demo-data.js (proje akışı) · 73 sayfa (script etiketi) · _qa/test/durum-makinesi.test.js · _qa/durum.js · CLAUDE.md | 0 bulgu / YAPISAL SORUN YOK · 174 test geçti | d9fe854 | Doküman §8'in beş zinciri uçtan uca SÜREÇ anlatımıdır; kod bunları CLAUDE.md §8 gereği koleksiyon bazında ayrı alanlarda tutar (eşleme dosya başlığında). Uygunsuzluğun ara aşamaları (aksiyon planlandı/uygulandı/kanıt yüklendi) `duzelticiFaaliyetler` kayıtlarında yaşıyor, kendi alanında değil. |
| 2026-08-18 | 3 | 26 sayfa (48 çağrı yeri) · assets/js/durum-makinesi.js (toplu geçiş + koleksiyon bazlı zorunlu alan) · assets/js/data-provider.js · assets/js/kimlik.js (kod 8 hane) · _qa/test/dogrudan-durum.test.js | 0 bulgu / YAPISAL SORUN YOK · 181 test geçti | ecc66c5 | FAZ12-PLAN 26 diyordu; gerçek sayı **32 doğrudan yazım + 16 durumDegistir = 48**. `ayarlar.html` numaralandırma önizlemesi hâlâ kapsam dışı. Projeye eklenen `sahada` lokasyonun operasyon durumu korunuyor (sessiz geçiş reddi, sayısı bildiriliyor). |
| 2026-08-18 | 4 | assets/js/form-controller.js (yeni) · musteri-form.html · is-emri-form.html · 73 sayfa (script etiketi) · _qa/test/form-controller.test.js · _qa/durum.js · CLAUDE.md | 0 bulgu / YAPISAL SORUN YOK · 199 test geçti | 34e1c6f | `gvForm` silinmedi — migrate edilmemiş 4 form (ekipman, lokasyon, proje, teklif) bit düzeyinde aynı kalsın diye. FormController testleri jsdom ister; jsdom yoksa atlanır. |
| 2026-08-18 | 5-g1 | ekipman-form · lokasyon-form · proje-form · teklif-form (+28 `.gf-err` yuvası) | 0 bulgu / YAPISAL SORUN YOK · 200 test geçti | 2bffa2b | `gvForm` (forms.js) artık hiçbir sayfa tarafından çağrılmıyor; dosya modal formlar için duruyor. |
| 2026-08-18 | 5-g2 | assets/js/form-controller.js (gvModalForm) · denetimler · musteri-sikayetleri · iletisim-kisileri · kalite-dokumanlari · personel-detay · personeller (14 modal form) · 6 sayfa formunda durumAyikla | 0 bulgu / YAPISAL SORUN YOK · 205 test geçti | 59ed6b8 | Adım 3'ün kaçırdığı 2 doğrudan durum yazımı (değişken yama) burada kapandı; kaynak tarama testi artık bu kalıbı da yakalıyor. |
| 2026-08-18 | 5-g3 | portal-faturalar · portal-raporlar · portal-lokasyonlar · musteri-portali · rapor-detay · sozlesmeler (10 modal form) | 0 bulgu / YAPISAL SORUN YOK · 205 test geçti | 802fec3 | — |
| 2026-08-18 | 5-g4 | taseron-hakedisleri · yeniden-kontroller · cihaz-detay · duzeltici-faaliyetler · eksik-ekipmanlar · fatura-gruplari (8 modal form) | 0 bulgu / YAPISAL SORUN YOK · 205 test geçti | 8a2060e | — |
| 2026-08-18 | 5-g5 | fiyat-listeleri · hakedisler · hizmet-katalogu · is-emri-detay · kalibrasyonlar · olcum-cihazlari (6 modal form) | 0 bulgu / YAPISAL SORUN YOK · 205 test geçti | 20b7af9 | hakedisler modalinde "hakedise alinabilecek lokasyon yok" kurali artik alan seviyesinde (mutabakat on kosulu demoApi cagrisi). |
| 2026-08-18 | 5-g6 | on-envanter · planlama · rapor-sablonlari · tahsilatlar · taseronlar · uygunsuzluk-detay · yetkinlikler · saha-kontrol-formu (8 modal form) | 0 bulgu / YAPISAL SORUN YOK · 205 test geçti | da89dd4 | **Kayıt yapan modal form kalmadı: 32 sayfa, 46 modal formun tamamı gvModalForm sözleşmesinde.** |
| 2026-08-18 | 6 | assets/js/para-zaman.js (yeni) · demo-api.js · forms.js · form-controller.js · fatura-gruplari · faturalar · hakedisler · taseronlar · musteriler · onaylar · raporlar · panel · 73 sayfa (script) · _qa/test/para-zaman.test.js · CLAUDE.md | 0 bulgu / YAPISAL SORUN YOK · 223 test geçti | 2cd0aa1 | Demo veri TL cinsinden kalmaya devam ediyor; kuruş **hesap sırasında** kullanılıyor (veri göçü yapılmadı). Kayıtlarda `paraBirimi` yoksa TRY sayılır; yeni faturalar alanı taşıyor. |
| 2026-08-18 | 7 | assets/js/kpi.js (yeni) · assets/js/demo-api.js · panel · rapor-onaylari · projeler · uygunsuzluklar · taseron-hakedisleri · faturalar · olcum-cihazlari · 73 sayfa (script) · _qa/test/kpi.test.js · _qa/durum.js · CLAUDE.md | 0 bulgu / YAPISAL SORUN YOK · 238 test geçti | e979636 | Ortak seçici 7 ekranda kullanıldı; kalan liste KPI'ları kendi yerel filtrelerini koruyor (panelde karşılığı olmayan metrikler). Kapsam filtresi localStorage'da kalıcı (`gv_tk_kpi_kapsam`). |


---

# GAVIA · Faz 14 — ADIM DEFTERİ

Kapsam: `_docs/REVIZYON.md` §9 (responsive denetim ve revizyon şartları)
+ §8 uygunsuzluk akışı düzeltmesi. Branch: `faz-14-responsive`.

| Tarih | Adım | Dosyalar | Tarama | Commit | Bilinen kusur |
|---|---|---|---|---|---|
| 2026-08-18 | 1 | assets/js/durum-makinesi.js (uygunsuzluk akışı + `GV.akisRozet`) · assets/js/demo-data.js (11 kayıt, 6 yeni alan) · assets/js/kpi.js · uygunsuzluk-detay · uygunsuzluklar · lokasyon-detay · rapor-detay · ekipman-detay · portal-raporlar · gunluk-ozet · musteri-portali · _qa/test/uygunsuzluk-akisi.test.js (yeni) · _qa/test/durum-makinesi.test.js · CLAUDE.md | 0 bulgu / YAPISAL SORUN YOK · 253 test geçti | 49dc5c5 | `gecikti` artık saklanan aşama değil; localStorage overlay'inde eski `gecikti` değeri kalmış bir kayıt varsa aşama rozetinde "—" görünür (çekirdek veride yok, `demoApi.sifirla()` temizler). Portal ekranı müşteriye iç aşama adlarını sadeleştirerek gösterir. |
| 2026-08-18 | 2 | assets/css/gavia-ui.css (`--bp-*` token bloğu) · assets/css/responsive.css (token yorumları) · assets/js/app.js (`GV.kirilim/bp/altinda/kirilimIzle`) · 13 sayfa (sayfa içi @media işareti) · _qa/test/kirilim.test.js (yeni) · CLAUDE.md | 0 bulgu / YAPISAL SORUN YOK · 263 test geçti | 7ca5550 | CSS `@media` koşulu `var()` kabul etmediği için literal kalmak zorunda; "token" sözleşmesi yorum + test ile kilitlendi, dilin izin verdiği tek yol bu. Sayfaya özgü bileşenlerin kendi `@media` bloğu global sayfaya taşınmadı (kapsam dışı), yalnız token değeri ve işareti zorunlu kıldı. |
| 2026-08-18 | 3 | assets/js/app.js (`GV.tabTuzak`, `GV.odakKatmani`) · assets/js/filters.js (drawer odak katmanı + canlı sayaç + buton adı) · assets/css/responsive.css (≤640 drawer bloğu) · assets/css/components.css (`.fp-count-inv`) · _qa/test/filtre-drawer.test.js (yeni) | 0 bulgu / YAPISAL SORUN YOK · 275 test geçti | 0cb96c2 | Tam genişlik + sticky YALNIZ CSS kuralı düzeyinde doğrulandı (jsdom layout hesaplamıyor); gerçek tarayıcıda 375/390 px kontrolü gerekiyor. `100dvh` desteklemeyen çok eski tarayıcıda `height:100dvh` yok sayılır, panel `inset:0` ile yine ekranı kaplar. |
| 2026-08-18 | 4 | assets/js/app.js (gvModal üç bölge + kapat düğmesi + ilk odak) · assets/css/components.css (`display:contents` sarmalayıcı, `.gv-modal-close`) · assets/css/responsive.css (≤480 tam ekran bloğu) · _qa/test/modal-tam-ekran.test.js (yeni) | 0 bulgu / YAPISAL SORUN YOK · 289 test geçti | 8e750d6 | Masaüstü görünümü `display:contents` ile korunuyor; bu özelliği desteklemeyen çok eski tarayıcıda sarmalayıcılar blok olur ve modal içi boşluklar bir miktar değişir (Chrome 65+/FF 63+/Safari 11.1+ sorunsuz). Odak iadesi kapanış animasyonundan sonra (240 ms) yapılıyor — mevcut davranış korundu. Tam ekran/sabit başlık yalnız CSS kuralı düzeyinde doğrulandı. |
| 2026-08-18 | 5 | assets/css/responsive.css (≤980 dokunma hedefleri bloğu) · _qa/test/dokunma-hedefi.test.js (yeni) | 0 bulgu / YAPISAL SORUN YOK · 298 test geçti | 67e39cd | 44×44 GERÇEK ölçüsü tarayıcı layout'u ister; test kural + aritmetik düzeyinde doğruluyor. Kaldırılan tek istisna yok ama `.gv-me` (avatar 36px) ve `.gv-search input` (40px) büyütülmedi: ikisi de üst barda tek başına duruyor, komşusuyla arası 10px ve tıklama alanı çevre dolgusuyla 44'ü aşıyor — gerçek ölçüm tarayıcıda doğrulanmalı. `.row-chk` 44'e çıkınca seçim kolonu 38→52px genişledi; bu ≤980'de tablo kolon dağılımını bir miktar değiştirir (masaüstünde değişmez). |
| 2026-08-18 | 6 | assets/js/navigation.js (arama tetikleyici + katman davranışı) · assets/js/components.js (pager canlı bölge) · assets/css/gavia-ui.css (katman parçaları masaüstünde gizli) · assets/css/responsive.css (üst bar / arama / KPI / pager blokları) · _qa/test/bilesen-responsive.test.js (yeni) | 0 bulgu / YAPISAL SORUN YOK · 315 test geçti | bec6b1a | Arama katmanı `body.gv-search-open` ile açılıyor; katman açıkken üst bardaki burger görünmez olur (katman üstünü kaplar) — kasıtlı, kapatınca geri döner. KPI ≤640 tek kolona indi: bu 640–980 arasında ikili kalan düzeni 640 altında değiştirir, masaüstünü etkilemez. Yerleşim maddeleri yalnız CSS kuralı düzeyinde doğrulandı. |
| 2026-08-18 | 7 | assets/js/components.js (`GV.grafikVeriTablosu`, gvBar/gvSpark/gvDonut, gvCalendar gün katmanı + `.cal-more` buton) · assets/css/components.css (`.gv-chart-svg`, `.gv-chart-data`, `.cal-dayopen`, `.cal-more` sıfırlama) · assets/css/responsive.css (≤980 grafik tablosu · ≤480 takvim gün katmanı) · _qa/test/takvim-grafik.test.js (yeni) | 0 bulgu / YAPISAL SORUN YOK · 336 test geçti | d1fcc9b | Veri tablosu masaüstünde görsel olarak gizli tutuldu: "masaüstü bit düzeyinde aynı kalır" kuralı ile "grafik alternatifi bulunsun" şartı ancak böyle birlikte sağlanıyor (ekran okuyucu her kırılımda okur). `gvBarList` etiket+değeri metin olarak zaten yazdığı için ayrı tablo almadı. Başlık verilmeyen halka grafikleri özeti `merkezEtiket`ten türetiyor; hiçbiri yoksa "Halka grafiği" yazıyor — sayfa çağrılarına başlık eklenmesi sonraki turun işi. |
| 2026-08-18 | 8 (denetim) | _qa/test/yatay-tasma.test.js (yeni) · PROGRESS.md | 0 bulgu / YAPISAL SORUN YOK · 345 test geçti | 35d0eb3 · d… | Denetim testi kural düzeyinde çalışır. `body { overflow-x: clip }` Faz 11'den beri var; test artık bunu kilitliyor. `roller-yetkiler` rol matrisi (min-width 1080px) bilinçli olarak `gv-tscroll` içinde kayıyor — kart moduna alınması sonraki turun işi. |

### Faz 14 kapanışı
- Tamamlanan adım: **7/7** (+1 denetim turu)
- Birim test: 238 → **345** (+107, 6 yeni dosya)
- Rol × sayfa: 0 bulgu · yapı bütünlüğü: 73 sayfa sorunsuz
- Masaüstü bildirimleri Faz 13 ile birebir aynı (yorum soyutlanarak doğrulandı)
- **Yalnız kural düzeyinde doğrulanan maddeler:** tam genişlik drawer, sticky
  başlık/aksiyon çubuğu, tam ekran modal, 44×44 dokunma ölçüsü, tek kolon KPI,
  pager ikinci satırı, gerçek yatay taşma, takvim nokta modu

