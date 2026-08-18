# GAVIA — Periyodik Kontrol Yönetimi · İLERLEME TAKİBİ

> Bu dosya faz geçişlerinde tek doğruluk kaynağıdır. **Her faz başında oku, faz sonunda işaretle.**
> Kaynak doküman: `_docs/BRIEF.md` (repo dışı — .gitignore'da).
> Canlı: https://gaviaworks-dev.github.io/gaviateknik/

## Demo bağlam sabitleri
- **Bugün:** 17 Ağustos 2026, Pazartesi
- **Firma:** GAVIA Teknik Muayene ve Belgelendirme A.Ş.
- **Rol parametresi:** `?role=sahip|gm|operasyon|teknik|kalite|planlama|uzman|saha|satis|finans|taseron|musteri|sistem`

---

## FAZ 0 — Hazırlık
- [x] Kaynak doküman okundu, `_docs/BRIEF.md` olarak saklandı
- [x] `gh auth status` doğrulandı (gaviaworks-dev)
- [x] Referans repo (gaviacrm/v2) mimarisi analiz edildi
- [x] Proje klasörü + git init (main)
- [x] `.gitignore` (`_docs/`, `.DS_Store`)
- [x] `PROGRESS.md`
- [x] `CLAUDE.md`
- [x] Public repo + GitHub Pages yayında

## FAZ 1 — Altyapı
- [x] `assets/css/gavia-ui.css` (:root değişken bloğu birebir + kabuk)
- [x] `assets/css/components.css`
- [x] `assets/css/responsive.css` (1100/980/640/480)
- [x] `assets/css/print.css`
- [x] `assets/js/app.js` (boot, rol motoru, TR formatlayıcılar, store)
- [x] `assets/js/navigation.js` (rail + modül menüsü + topbar enjeksiyonu)
- [x] `assets/js/components.js`
- [x] `assets/js/filters.js`
- [x] `assets/js/forms.js`
- [x] `assets/js/demo-api.js` (gerçek API'ye ayrık geçiş katmanı)
- [x] `assets/js/demo-data.js`
- [x] localStorage: menü tercihi + demo kayıt kalıcılığı

## FAZ 2 — Ana Panel
- [x] index.html (rol seçimli giriş kapısı)
- [x] panel.html
- [x] gunluk-ozet.html
- [x] aksiyon-merkezi.html
- [x] ajanda.html
- [x] onaylar.html
- [x] bildirimler.html

## FAZ 3 — Müşteri ve Proje
- [x] musteriler / musteri-detay / musteri-form
- [x] projeler / proje-detay / proje-form
- [x] lokasyonlar / lokasyon-detay / lokasyon-form
- [x] iletisim-kisileri

## FAZ 4 — Hizmet ve Envanter
- [x] hizmet-katalogu / hizmet-detay
- [x] sozlesme-pozlari / fiyat-listeleri
- [x] on-envanter
- [x] ekipmanlar / ekipman-detay / ekipman-form
- [x] envanter-mutabakati (13 kolon + renkli fark)

## FAZ 5 — Operasyon ve Saha
- [x] planlama / operasyon-takvimi
- [x] is-emirleri / is-emri-detay / is-emri-form
- [x] saha-kontrol / saha-kontrol-formu (mobil öncelikli + çevrimdışı + senkron)
- [x] eksik-ekipmanlar / yeniden-kontroller

## FAZ 6 — Teknik Rapor ve Uygunsuzluk
- [x] teknik-raporlar / rapor-detay / rapor-onaylari / rapor-sablonlari
- [x] uygunsuzluklar / uygunsuzluk-detay
- [x] print.css yazdırma düzeni doğrulandı
- [x] Onaylı raporda "Düzenle" yok → "Yeni Revizyon Oluştur"

## FAZ 7 — Ticari
- [x] teklifler / teklif-detay / teklif-form
- [x] sozlesmeler / sozlesme-detay
- [x] hakedisler
- [x] fatura-gruplari / fatura-grubu-detay (parti, doluluk, kısmi, mükerrer engeli)
- [x] faturalar / tahsilatlar

## FAZ 8 — Kaynak Yönetimi ✅
- [x] taseronlar / taseron-detay / taseron-hakedisleri
- [x] personeller / personel-detay / yetkinlikler
- [x] olcum-cihazlari / cihaz-detay / kalibrasyonlar
- [x] Kalibrasyonu geçmiş cihaz kırmızı + atama disabled (`demoApi.cihazAtanabilir` tek kaynak; CHZ-012 geçmiş, CHZ-011 serviste → kilitli)
- [x] Yetkinliği olmayan personel atanamaz (`demoApi.personelAtanabilir`; belge süresi dolmuşsa da engel)
- [x] `components.js` gvTable seçim dinleyicisi sızıntısı giderildi (her çizimde yeniden bağlanıyordu)

## FAZ 9 — Kalite ve Portal ✅
- [x] kalite-dokumanlari (sürüm geçmişi, yayın onayı, geçerlilik takibi)
- [x] denetimler / duzeltici-faaliyetler / musteri-sikayetleri
- [x] musteri-portali / portal-lokasyonlar / portal-raporlar / portal-faturalar
- [x] Portal iç panelden sade: toplu işlem yok, kolon seçici yok, jargon yok
- [x] Portalda taşeron maliyeti / iç maliyet / kârlılık HİÇ okunmuyor (test edildi)
- [x] Portalda yalnız `teslim-edildi` / `imzalandi` rapor görünüyor; hazırlıktakiler yalnız sayı olarak
- [x] Kapsam `rolKapsami` / `kapsamaGoreLokasyonlar` ile sınırlı (başka müşteri kaydı sabit kodlu değil)
- [x] Süreli salt-okunur denetçi erişimi (PRT-005, bitiş 30.09.2026) yüzeye çıkarıldı
- [x] Veri düzeltmesi: denetim `bulguSayisi` = majör + minör (gözlem bulgu sayılmaz) — DNT-001/004 hizalandı
- [x] Sapma düzeltmesi: subagent'ın uydurduğu `.gc-linkbtn` → ortak `.btn-link`
- [x] İş kuralı düzeltmesi: müşterinin açtığı yeniden kontrol talebinde `ucretli` artık `null`
      ("Belirlenecek") — talep anında `false` yazmak müşteriye ücretsizlik taahhüdü üretiyordu
      (portal-raporlar, onaylar, raporlar birlikte hizalandı)

## FAZ 10 — Sistem ✅
- [x] raporlar (BRIEF'teki 14 göstergenin tamamı, 5 sekme, 10 alanlı filtre çubuğu)
- [x] ayarlar (firma, operasyon, bildirim kuralları, numaralandırma, veri ve gizlilik)
- [x] roller-yetkiler (13 rol × 11 bölüm matrisi, ekran yetkileri, erişim koruması notu)
- [x] islem-kayitlari (değiştirilemez denetim izi, önceki→yeni farkı, modül dağılımı)
- [x] veri-aktarimi (10 adımlı sihirbaz: dosya, eşleştirme, önizleme, doğrulama,
      mükerrer kararı, hatalı satır, özet+onay, çalıştırma, mutabakat, geri alınabilir kayıt)

### Faz 10'da ortak katmanda kapatılan gerçek hatalar
- [x] `gvBar` / `gvSpark` / `gvDonut` boş veride kabı eski grafikle bırakıyordu →
      filtre daraltılınca YANLIŞ veri görünüyordu; artık `gvBarList` gibi boş durum basıyor
- [x] `durumlar.rapor` sözlüğünde `arsiv` anahtarı yoktu → ham "arsiv" metni basılıyordu
      (5 durum akışının tamamı kullanılan değerlere karşı denetlendi, hepsi tam)
- [x] `kayitAt` modül adını normalize ediyor — denetim izinde koleksiyon anahtarı ile
      ekran adı karışık görünüyordu (`uygunsuzluklar` / `Uygunsuzluk`)
- [x] `demoApi.firma()` cephesi — ayarlarda kaydedilen künye artık rapor kapağına ve
      fatura başlığına da yansıyor
- [x] `demoApi.harita()` cephesi + `GV.ayar()` okuyucusu; sayfalarda **hiç** `window.DEMO`
      doğrudan erişimi kalmadı (CLAUDE.md §7 istisnasız)
- [x] Kalibrasyon uyarı eşiği artık Ayarlar'dan geliyor (3 sayfada 13 sabit değer bağlandı)

## FAZ 11 — QA ✅ TAMAMLANDI

Dört QA lensi subagent olarak başlatıldı; hepsi aylık harcama limitine takılıp düştü.
Diskte bıraktıkları kısmi çıktılar (`matrix.json` 949 satır, `findings.json` 1321 kayıt,
`scan2.txt`, responsive tarayıcı) hasat edildi, yanlış pozitifler elendi, gerçek bulgular
ana ajan tarafından düzeltildi.

- [x] Kırık link taraması — 0 bulgu (DOM'daki `<a>` + JS string'i içinde üretilen bağlantılar)
- [x] Mutlak yol (`/…`) taraması — 0 (GitHub Pages alt klasörde bozulmaz)
- [x] Konsol hatası — 949 sayfa×rol kombinasyonunda 0
- [x] Rol erişim koruması — 12 yasak kombinasyon test edildi, hepsinde yönlendirme çalıştı
- [x] Breakpoint 1100 / 980 / 640 / 480 — kaydırma sarmalayıcısı olmayan tablo yok
- [x] Print önizleme — `print.css` kapsamı doğrulandı
- [x] A11y: içeriğe atla, canlı bölge, main landmark, tablo adı, sekme bağı, başlık hiyerarşisi
- [x] Renk tek başına gösterge değil — 18 sayfada 41 ihlal kapatıldı
- [x] TR para / tarih / yüzde formatları — ham ISO tarih ve sonek `%` kalmadı
- [x] "Yakında" / "placeholder" / "TODO" / boş kart taraması — 0
- [x] **Yapı bütünlüğü**: 73 sayfa ayrıştırıcıdan geçti — dengeli etiket, geçerli satır içi
      script, kırılmış JS string'i yok, çalışma hatası yok, `main` içeriği dolu
- [x] CSS süslü parantez dengesi 4/4 dosyada tam; `node --check` 7/7 JS dosyasında temiz
- [x] Demo veri asgarileri: 13 sayım + 7 senaryo + kişisel veri sızıntısı taraması geçti
- [x] BRIEF'in 73 sayfasının tamamı üretildi, eksik yok

**Son durum:** 13 rol × 73 sayfa = 949 kombinasyon, **0 bulgu**.

---

## FAZ 12 — FRONTEND REVİZYONU ✅ 9/9 ADIM TAMAMLANDI

Kaynak: `_docs/REVIZYON.md` (bağlayıcı kapsam) · plan: `_docs/FAZ12-PLAN.md`
Adım defteri: `_qa/LEDGER.md` · ilerleme kaynağı: `node _qa/durum.js`
Branch: `faz-12-revizyon` (GitHub Pages `main` yayınlıyor, canlı etkilenmedi).

| # | Adım | Sonuç |
|---|---|---|
| 1 | `types.js` + `data-provider.js` | Tip sözleşmesi (JSDoc) ve MockDataProvider |
| 2 | `app.js` `qYaz` seçeneği + `list-controller.js` | URL sözleşmesi ve tek liste akışı |
| 3 | `components.js` `gvPager` seçenekleri | `url` · `boyutSecici` · `sikisik` · `sayfaya` — hepsi varsayılan kapalı |
| 4 | Pilot: `hizmet-katalogu` + `ekipmanlar` | 59 ve 310 kayıtlı iki uç senaryo |
| 5 | Yayılım (5 grup × ~8 sayfa) | Doküman matrisi **41/41** |
| 6 | `navigation.js` | `routeRegistry` + çekmece focus trap / kilit / Escape / odak iadesi |
| 7 | `tooltip.js` | Rail ipucu gerçek DOM düğümüne geçti, klavyeyle erişilebilir |
| 8 | Route id doğrulama | 14 detay sayfasında sabit kayda düşme kaldırıldı |
| 9 | `data-lbl` tamamlama | 21 sayfada 117 hücre etiketlendi |

**Kapanış ölçümleri**
- Doküman matrisi: **41/41** sayfa `ListController` yolunda, eski yolda **0**
- Ortak katman: `types.js` · `data-provider.js` · `list-controller.js` (41 sayfa) · `tooltip.js` (72 sayfa)
- Birim test: **125 geçti / 0 kaldı** (`node --test "_qa/test/*.test.js"`)
- Rol × sayfa taraması: **0 bulgu** (13 rol × 73 sayfa = 949 kombinasyon)
- Yapı bütünlüğü ayrıştırıcısı: **73 sayfa, yapısal sorun yok**

**Bu fazın dışında kalanlar (bilinçli)**
- Detay ekranlarının alt koleksiyonlarının sayfalanması (13 ekran) — koşu kapsamında değildi
- Durum makineleri (tek `transition` fonksiyonu) ve `crypto.randomUUID` kimlik üretimi
- Breakpoint tokenları ve düz `gtable` tablolarının kart moduna alınması (yerleşim kararı)
- `pr-tablo` / `rd-kriter` yazdırma ve ölçüm tabloları — kart moduna girmiyorlar

---

## Faz 13 — Algoritma düzeltmeleri ve form standardı

Kapsam: `_docs/REVIZYON.md` §8 (backend öncesi algoritma düzeltmeleri) ve
§11 (ortak form ve etkileşim standardı). Branch: `faz-13-algoritma`.

| # | Adım | Sonuç |
|---|---|---|
| 1 | `kimlik.js` | `crypto.randomUUID` kimlik üretimi + komut tekrar koruması (requestId) |
| 2 | `durum-makinesi.js` | 25 akış, tek `transition` fonksiyonu, yasak geçiş testleri |
| 3 | Doğrudan durum yazımlarının taşınması | 48 çağrı yeri (32 `guncelle` + 16 `durumDegistir`), 26 sayfa |
| 4 | `form-controller.js` | Şema tabanlı doğrulama, ilk hataya odak, üstte özet, submit kilidi, dirty state |
| 5 | Form yayılımı (6 grup) | 6 sayfa formu + **46 modal form** ortak sözleşmede |
| 6 | `para-zaman.js` | Kuruş tamsayı aritmetiği, para birimi ayrımı, ClockService |
| 7 | `kpi.js` | Panel ve liste tek seçiciden; arşiv/kapsam dışı/silinmiş filtresi tanımlı ve görünür |

**Kapanış ölçümleri**
- Faz 13 ortak katmanı: `kimlik.js` · `para-zaman.js` · `durum-makinesi.js` ·
  `form-controller.js` · `kpi.js` — **73/73 sayfa** yüklüyor
- Doğrudan durum yazımı: **0** (kaynak taraması testiyle kilitli)
- Kayıt yapan modal form: **46/46** `gvModalForm` sözleşmesinde
- Sayfa formu: **6/6** `gvFormController` sözleşmesinde
- `length + 1` / `Date.now()` tabanlı kalıcı kimlik: **0**
- Sayfa kodunda `new Date()`: **0** (hepsi ClockService'ten)
- Birim test: **238 geçti / 0 kaldı**
- Rol × sayfa taraması: **0 bulgu** (13 rol × 73 sayfa = 949 kombinasyon)
- Yapı bütünlüğü ayrıştırıcısı: **73 sayfa, yapısal sorun yok**

**Bu fazın dışında kalanlar (bilinçli)**
- Responsive standardizasyonu, breakpoint tokenları, filtre drawer, tam ekran
  modal, 44 px dokunma hedefleri — ayrı tur (CSS'e hiç dokunulmadı)
- Detay ekranlarının alt koleksiyonları (13 ekran), rol bazlı dashboard,
  `ApiDataProvider` iskeleti — sonraki fazlar
- Demo verisinin TL alanları kuruşa **göç ettirilmedi**; kuruş hesap
  sırasında kullanılır, veri modeli TL kalır

---

## Faz 14 — Responsive denetim ve revizyon şartları

Kapsam: `_docs/REVIZYON.md` §9 (responsive denetim) + §8 uygunsuzluk akışı
düzeltmesi. Branch: `faz-14-responsive`.

| # | Adım | Sonuç |
|---|---|---|
| 1 | Uygunsuzluk akışı | Doküman §8'in **altı aşaması** tamamlandı: `acik → aksiyon-planlandi → uygulandi → kanit-yuklendi → dogrulandi → kapandi`; demo veri altı aşamaya yayıldı |
| 2 | Kırılım tokenları | `--bp-xl/lg/md/sm/xs` (1280/1100/980/640/480) tek yerde; CSS bildirimleri **bit düzeyinde aynı** |
| 3 | Filtre drawer | ≤640 tam genişlik, uygula/temizle sabit, aktif filtre sayısı butonda, Escape/Tab tuzağı/odak iadesi |
| 4 | Modal | ≤480 tam ekran; başlık ve kapat sabit, yalnız içerik kayar, arka plan `gvScrollLock` ile kilitli |
| 5 | Dokunma hedefleri | ≤980'de 44×44 (görünmez katman), kritik butonlar arası ≥8 px (fiilen 14 px) |
| 6 | Üst bar · arama · KPI · pager | Mobilde ikonla açılan tam genişlik arama katmanı; KPI ≤640 tek kolon; pager kayıt aralığı canlı bölge ve ikinci satır |
| 7 | Takvim · grafik | Gün ayrıntı katmanı (nokta modunda erişim), `+N daha` buton oldu; üç SVG grafiğe veri tablosu + metinsel özet alternatifi |

**Kapanış ölçümleri**
- Birim test: **345 geçti / 0 kaldı** (22 dosya; Faz 14'te +107 test, 6 yeni dosya)
- Rol × sayfa taraması: **0 bulgu** (13 rol × 73 sayfa = 949 kombinasyon)
- Yapı bütünlüğü ayrıştırıcısı: **73 sayfa, yapısal sorun yok**
- Kırılım eşiği kaçağı: **0** (CSS, JS ve 73 sayfanın sayfa içi stilleri denetlendi)
- `body { overflow-x: clip }` — yatay kaydırma yalnız tanımlı kapsayıcılarda
- Masaüstü kilidi: `responsive.css` ve `gavia-ui.css` bildirimleri yorum
  soyutlandığında Faz 13 ile **birebir aynı**; modal sarmalayıcıları
  `display:contents` taşıyor

**Doğrulama sınırı (önemli)**
jsdom **layout hesaplamaz**. Faz 14'te davranış (drawer açma/kapama, odak
tuzağı, aşama geçişleri, gün katmanı modalı, grafik veri tablosu üretimi)
gerçekten çalıştırıldı; **yerleşim maddeleri yalnız CSS kuralı düzeyinde**
doğrulandı: tam genişlik, sticky başlık/aksiyon, 44×44 ölçüsü, tek kolon KPI,
pager ikinci satırı, gerçek yatay taşma. Bunlar tarayıcıda 320/375/390/480/
640/768/980 px'te gözle doğrulanmalıdır.

**Bu fazın dışında kalanlar (bilinçli)**
- Detay ekranlarının alt koleksiyonları (13 ekran), rol bazlı dashboard,
  `ApiDataProvider` iskeleti — sonraki faz
- Playwright görsel regresyon (VRT) — kurulum gerektiriyor, faz dışı
- Başlıksız halka grafiklerine sayfa çağrısından başlık geçirilmesi

---

## Faz 15 — Kapanış: alt koleksiyonlar, rol bazlı panel, sağlayıcı iskeleti

Kapsam: `_docs/REVIZYON.md` §6 (detay ekranı alt listeleri) · §12 iş paketi 9
ve 10 · §13 kabul kontrol listesi. Branch: `faz-15-kapanis`.
**Bu, şartnamenin son fazıdır.**

| # | Adım | Sonuç |
|---|---|---|
| 1 | ListController çoklu liste | `onek` (URL anahtar öneki) + `filtresiz` seçenekleri; aynı sayfadaki listeler birbirinin sayfa durumunu ezmiyor. Öneksiz 41 liste sayfası bit düzeyinde aynı |
| 2 | Alt koleksiyon grup A | `musteri-detay` · `proje-detay` · `lokasyon-detay` · `ekipman-detay` — 22 alt liste |
| 3 | Alt koleksiyon grup B | `is-emri-detay` · `rapor-detay` · `uygunsuzluk-detay` · `teklif-detay` — 15 alt liste |
| 4 | Alt koleksiyon grup C | `sozlesme-detay` · `fatura-grubu-detay` · `taseron-detay` · `personel-detay` · `cihaz-detay` — 20 alt liste. **13/13 detay ekranı tamam** |
| 5 | Rol bazlı panel | `assets/js/dashboard.js` — 17 widget kayıt defteri; görünürlük `ROL_YETKI`'den türüyor (`GV.ekranIzni`). KPI kartı ve hızlı bağlantı da kapsam süzgecinden geçiyor. 13 rol anlık görüntü testi |
| 6 | ApiDataProvider iskeleti | `assets/js/api-provider.js` — DataProvider sözleşmesinin ikinci uygulaması. **Gerçek ağ çağrısı yok**; taşıyıcı değiştirilecek tek yer. Sağlayıcı seçimi `?provider=api` / `GV.saglayiciKur` ile tek yerden |
| 7 | Kabul kontrol listesi | `_qa/KABUL.md` — 23 madde tek tek geçildi, kanıt sütunuyla |

**Kapanış ölçümleri**
- Detay alt koleksiyonu: **13/13 ekran**, 57 alt liste ListController yolunda
- Liste yolu: **41/41** matris sayfası + **13/13** detay ekranı
- Ortak katman: `types` · `data-provider` · `api-provider` · `list-controller`
  **54 sayfa**; `kimlik` · `para-zaman` · `durum-makinesi` · `form-controller` ·
  `kpi` **73/73 sayfa**; `dashboard.js` yalnız `panel.html` (tek panel ekranı)
- Birim test: **462 geçti / 0 kaldı** (27 dosya; Faz 15'te +117 test, 5 yeni dosya)
- Rol × sayfa taraması: **0 bulgu** (13 rol × 73 sayfa = 949 kombinasyon)
- Yapı bütünlüğü ayrıştırıcısı: **73 sayfa, yapısal sorun yok**
- Kabul kontrol listesi: **17 geçti · 0 kaldı · 6 doğrulanamadı**

**Faz içinde yakalanan protokol hatası**
Adım 5 ve 7 taramaları yalnız `sahip` rolüyle koşulmuştu; 13 rollük tarama
kapanışta çalışınca panelde 71 "boş alan" bulgusu çıktı (rolün göremediği
widget kabı bilerek gizleniyor, tarama bunu boş kart sanıyordu). `tarama.js`
düzeltildi, istisna ayrı testle kilitlendi. **Tarama bundan sonra 13 rolle
koşulur** — `node _qa/durum.js` bunu zaten yapıyor.

**Doğrulama sınırı (önemli)**
Kabul listesinin 6 maddesi gerçek tarayıcı yerleşimi ya da renk ölçümü ister
(11 genişlikte test, gerçek yatay taşma, viewport içinde kalma, 44×44 piksel
ölçüsü, kontrast oranı, ipucu konumu). Bunlar kural düzeyinde kilitli ama
**ölçülmedi**; `_qa/KABUL.md` §6'da nasıl kapanacaklarıyla birlikte listeli.
Playwright bu şartnamenin dışında bırakıldı.

**Bilinen kusur — `ApiDataProvider.ozet`**
İskelet `kume` isteğiyle süzülmüş kümenin tamamını taşıyıcıdan alıp hesabı
yerelde uyguluyor. Gerçek backend'de bu ayrı bir toplama uç noktası olmalı ve
kümeyi değil hesabın sonucunu döndürmeli. Kodda ve `_qa/LEDGER.md`'de işaretli.

**Bu fazın dışında kalanlar (bilinçli)**
- Gerçek backend, gerçek auth, dosya yükleme, Playwright kurulumu
- `roller-yetkiler` rol matrisinin kart moduna alınması (bugün `gv-tscroll`
  içinde kayıyor — Faz 14'ten devir)
- Başlıksız halka grafiklerine sayfa çağrısından başlık geçirilmesi
  (Faz 14'ten devir)
