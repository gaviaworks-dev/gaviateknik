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
