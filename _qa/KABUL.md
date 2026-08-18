# GAVIA · KABUL KONTROL LİSTESİ SONUCU

Kaynak: `_docs/REVIZYON.md` §13 — 23 madde.
Değerlendirme tarihi: **2026-08-19** · branch `faz-15-kapanis`
Koşulan denetimler: `node _qa/tarama.js` (13 rol × 73 sayfa) ·
`node _qa/butunluk.js` (73 sayfa) · `node --test "_qa/test/*.test.js"` (461 test) ·
`node _qa/rol-koruma.js` (12 yasak kombinasyon).

Değer sözlüğü:
- **GEÇTİ** — otomatik denetimle kanıtlandı; kanıt sütununda test adı var.
- **KALDI** — kapsamda ama karşılanmadı.
- **DOĞRULANAMADI** — kural düzeyinde doğru, ama maddenin kendisi **gerçek
  tarayıcı yerleşimi (layout)** ister. jsdom kutu ölçmez; bu maddelerde
  "geçti" demek uydurma olurdu. Hepsi aşağıda ayrı başlıkta toplandı.

---

## 1. Menü ve navigasyon

| # | Madde | Sonuç | Kanıt |
|---|---|---|---|
| 1.1 | 10 ana menü ikonunun hover ve focus tooltipi var | **GEÇTİ** | `tooltip.test.js`: "rail ikonları başlık VE açıklama taşır" · "hover ipucunu ANINDA açmaz — 350 ms gecikme" · "klavye odağında ipucu gecikmesiz açılır" · "role=tooltip + aria-describedby". `navigation.test.js`: "açıklamalar doküman §4 tooltip sözlüğüyle birebir" (10 madde). |
| 1.2 | Aktif ana modül, alt menü ve sayfa aynı konumu gösteriyor | **GEÇTİ** | `kabul-denetimi.test.js`: "aktif ana modül, alt menü ve breadcrumb aynı konumu gösteriyor" — 4 sayfada tek aktif rail kalemi, tek aktif menü kalemi, `aria-current="page"`, breadcrumb aktif kalemi yazıyor. Detay sayfası liste ekranının `screen`'ini miraslıyor. |
| 1.3 | 980 px altında drawer; Escape, focus trap ve focus return çalışıyor | **GEÇTİ** | `navigation.test.js`: "çekmece açılınca gövde kaydırma kilitlenir ve odak içeri alınır" · "Escape çekmeceyi kapatır, kilidi açar, odağı butona iade eder" · "Tab tuzağı" (ileri/geri) · "kapalı çekmecede tuzak devrede değil". Kırılım eşiği `kirilim.test.js` ile tokena bağlı. Davranış kırılımdan bağımsız çalışır (test bunu ayrıca doğruluyor). |
| 1.4 | Yetkisiz route kontrollü ekrana gidiyor; yönlendirme döngüsü yok | **GEÇTİ** | `node _qa/rol-koruma.js` — 12 yasak kombinasyonun tamamında yönlendirme çalıştı. `node _qa/tarama.js` 13 rol × 73 sayfa = 949 kombinasyon, 0 bulgu; yönlendirme döngüsü olsaydı tarama takılırdı. `navigation.test.js`: "rol kısıtı registry'de görünür". |

## 2. Sayfalandırma

| # | Madde | Sonuç | Kanıt |
|---|---|---|---|
| 2.1 | page, pageSize, q, sort ve filtre URL'de tutuluyor | **GEÇTİ** | `list-controller.test.js`: "URL page=3 ile açılış" · "URL pageSize=10 okunur" · "arama değişince q URL'e yazılır" · "sirala() sort URL'e yazar" · "aralık filtresi fr_ parametresiyle URL'e yazılır". Alt koleksiyonlarda önekli: `alt-koleksiyon.test.js`. |
| 2.2 | Arama/filtre/sort/pageSize değişince page 1 oluyor | **GEÇTİ** | `list-controller.test.js`: "arama değişince page=1 olur" · "sirala() page=1 yapar". `pager.test.js`: "boyut değişince sayfa 1'e döner". |
| 2.3 | Yenileme ve geri/ileri aynı liste stateini kuruyor | **GEÇTİ** | `kabul-denetimi.test.js`: "yenileme aynı liste durumunu kuruyor (durum tamamen URL'de)" — aynı adres iki kez açıldığında satır kimlikleri ve kayıt aralığı birebir aynı. "sayfa değişimi geçmişe girdi bırakır; önceki adres önceki sayfayı kurar". `list-controller.test.js`: "qYaz varsayılanı replaceState — geçmiş kirlenmez". |
| 2.4 | Son sayfa, silme, ekleme, 0/1 kayıt ve geçersiz page testleri geçiyor | **GEÇTİ** | `data-provider.test.js`: "59 kayıtta 20/sayfa: 3 sayfa, son sayfa 19 kayıt" · "0 kayıt" · "1 kayıt" · "geçersiz page kelepçelenir". `kabul-denetimi.test.js`: "ekleme ve silme sonrası sayfa numarası kelepçeleniyor". `alt-koleksiyon.test.js`: "geçersiz sayfa numarası kelepçelenir, komşu liste etkilenmez". |
| 2.5 | Kararlı sıralama id tie-breaker ile tekrar/atlama üretmiyor | **GEÇTİ** | `data-provider.test.js`: "aynı sıralama değerine sahip kayıtlar sayfalar arasında tekrarlanmaz (id tie-breaker)" · "sıralama kuralı varken id tie-breaker eklenir". `saglayici-sozlesmesi.test.js`: "sıralama kararlıdır; sayfalar arasında tekrar/atlama yok" (iki sağlayıcı için de). |

## 3. Algoritma

| # | Madde | Sonuç | Kanıt |
|---|---|---|---|
| 3.1 | Eksik id ilk kaydı açmıyor | **GEÇTİ** | `route-id.test.js`: "hiçbir detay sayfasında sabit kayıt numarasına düşülmüyor" · "14 detay sayfasının tamamı GV.kayitId kullanıyor" · "Kayıt seçilmedi / Kayıt bulunamadı" ekranları. |
| 3.2 | Kaydet butonu çift kayıt üretmiyor | **GEÇTİ** | `form-controller.test.js`: "ilk tıklamada kilit; ikinci gönderim YOK" · "aynı deneme aynı istekId ile gider". `kimlik.test.js`: "aynı komut ikinci kez çağrılırsa iş GÖVDESİ tekrar çalışmaz". Faz 15'te sağlayıcı katmanına da taşındı: `saglayici-sozlesmesi.test.js` "aynı requestId ile ikinci deneme yeni kayıt açmaz" (mock + api). |
| 3.3 | Durumlar yalnız transition fonksiyonuyla değişiyor | **GEÇTİ** | `dogrudan-durum.test.js`: 9 test — "hiçbir sayfa guncelle() ile durum alanı yazmıyor" · "durumDegistir yalnız durum-makinesi.js içinden çağrılır". `durum-makinesi.test.js`: yasak geçişler, izin, zorunlu alan, iş kuralı. |
| 3.4 | Para/tarih/KPI hesapları ortak servis veya selector kullanıyor | **GEÇTİ** | `para-zaman.test.js`: kuruş aritmetiği, karışık para birimi ayrışması, ClockService. `kpi.test.js`: "panel ve liste ekranı için tek seçici: sayılar birebir aynı" · "kullanılan her seçici adı gerçekten tanımlı". |
| 3.5 | MockDataProvider ile ApiDataProvider sözleşmesi aynı | **GEÇTİ** | `saglayici-sozlesmesi.test.js` — aynı test kümesi iki sağlayıcıyla da koşuyor (16 ortak madde × 2) + "iki sağlayıcı aynı sorguya aynı sayfayı verir" + gerçek sayfa denetimi: `is-emirleri`, `hizmet-katalogu`, `musteri-detay` iki sağlayıcıyla aynı satırları ve aynı kayıt aralığını basıyor + "ApiDataProvider gerçek ağ çağrısı içermez". |

## 4. Responsive

| # | Madde | Sonuç | Kanıt / not |
|---|---|---|---|
| 4.1 | 320, 375, 390, 480, 640, 768, 980, 1100, 1280, 1366 ve 1440 test edildi | **DOĞRULANAMADI** | Bkz. §6. Kırılım *sözleşmesi* kilitli (`kirilim.test.js`, 10 test), ama listelenen 11 genişlikte gerçek yerleşim ölçülmedi. |
| 4.2 | Body yatay taşma yapmıyor; tablo taşması kendi kapsayıcısında | **KURAL DÜZEYİNDE GEÇTİ · ölçüm DOĞRULANAMADI** | `yatay-tasma.test.js` 9 test: `body { overflow-x: clip }`, kaydırma yalnız izinli kapsayıcılarda, 320 px üstü her `min-width` ya kaydırılabilir ya kırılımda sıfırlanıyor. Gerçek taşma ölçümü layout ister. |
| 4.3 | Tablo-kart görünümünde etiket, seçim ve satır aksiyonu kaybolmuyor | **GEÇTİ** | `data-lbl.test.js` 4 test (73 sayfa taraması dahil) · `yatay-tasma.test.js`: "kart modunda seçim hücresi ve satır aksiyonu GİZLENMEZ". `gvTable` `data-lbl`'i kolon başlığından otomatik basıyor; `tarama.js` her sayfada denetliyor. |
| 4.4 | Modal, filtre, arama ve menü mobilde viewport içinde | **KURAL DÜZEYİNDE GEÇTİ · ölçüm DOĞRULANAMADI** | `modal-tam-ekran.test.js` (≤480 tam ekran, sabit başlık, kayan gövde) · `filtre-drawer.test.js` (≤640 tam genişlik, sticky başlık/aksiyon) · `bilesen-responsive.test.js` (arama katmanı, sonuç listesi taşmaz) · `navigation.test.js` (drawer). Hepsi CSS kuralı düzeyinde; "viewport içinde" iddiası ölçüm ister. |
| 4.5 | Etkileşim hedefleri en az 44 × 44 px | **KURAL DÜZEYİNDE GEÇTİ · ölçüm DOĞRULANAMADI** | `dokunma-hedefi.test.js` 9 test — kuralların ve aritmetiğin (yükseklik + dolgu + kenarlık) 44'ü karşıladığı doğrulandı, masaüstü ölçüleri değişmedi. Gerçek piksel ölçüsü tarayıcı ister. İki bilinçli istisna kayıtlı: `.gv-me` (36 px avatar) ve `.gv-search input` (40 px). |

## 5. Erişilebilirlik

| # | Madde | Sonuç | Kanıt / not |
|---|---|---|---|
| 5.1 | Tab sırası, focus-visible ve Escape davranışı doğru | **GEÇTİ** | Escape + Tab tuzağı + odak iadesi: `modal-tam-ekran.test.js`, `filtre-drawer.test.js`, `navigation.test.js`, `tooltip.test.js`. focus-visible: `kabul-denetimi.test.js` "görünür odak hiçbir yerde kaldırılmamış" — `:focus-visible { outline: none }` ve toptan `* { outline: none }` yok. |
| 5.2 | Tooltip, ikon ve tablo semantiği ekran okuyucuda anlamlı | **GEÇTİ** | `tarama.js` 949 kombinasyon: etiketsiz form alanı 0, erişilebilir adı olmayan ikon buton 0, `th[scope]` eksiği 0, `data-lbl` eksiği 0. `tooltip.test.js`: `role="tooltip"` + `aria-describedby`. `gvTable` her tabloya görsel gizli `<caption>` basıyor. |
| 5.3 | Hata, loading ve boş durumlar uygun live-region seviyesinde | **GEÇTİ** (Faz 15'te kapatıldı) | Faz 14 sonunda `gvEmpty`/`gvError` rol taşımıyordu. Faz 15 adım 7'de eklendi: boş durum `role="status" aria-live="polite"`, hata `role="alert"`, kayıt aralığı `role="status"`, liste kabı yüklenirken `aria-busy="true"` (ilk yükleme ve kısmi güncelleme). Kanıt: `kabul-denetimi.test.js` "boş, yükleniyor ve hata durumları canlı bölge seviyesinde" + "gerçek listede de duyurulur". |
| 5.4 | Kontrast ve reduced-motion kontrolleri geçiyor | **KISMEN — reduced-motion GEÇTİ, kontrast DOĞRULANAMADI** | reduced-motion: `kabul-denetimi.test.js` "prefers-reduced-motion destekleniyor ve geçişleri gerçekten kapatıyor" (blok gerçekten `animation: none` ve `transition: none` yazıyor). Kontrast: bkz. §6. |

---

## 6. Doğrulanamadı — gerçek render gerektiren maddeler

Bu maddeler **kod düzeyinde doğru kurgulanmıştır** ama iddianın kendisi ölçüm
ister. jsdom kutu modeli hesaplamaz, hesaplanmış renk üretmez; Playwright bu
fazın dışında bırakıldı (`_docs/FAZ12-PLAN.md` karar 5). Aşağıdakiler için
"geçti" yazmak uydurma sonuç olurdu.

| Madde | Neden ölçülemedi | Gerçek tarayıcıda nasıl kapanır |
|---|---|---|
| **4.1** 11 genişlikte test | jsdom yerleşim yapmaz; `matchMedia` sahtedir | 320/375/390/480/640/768/980/1100/1280/1366/1440 için ekran görüntüsü; her kırılımda rail/menü/drawer, KPI kolon sayısı, tablo-kart geçişi kontrolü |
| **4.2** gerçek yatay taşma | `scrollWidth`/`clientWidth` hesaplanmaz | Her kırılımda `document.documentElement.scrollWidth <= innerWidth` |
| **4.4** viewport içinde kalma | Kutu ölçüsü ve konum yok | Modal / filtre çekmecesi / arama katmanı / menü için `getBoundingClientRect()` viewport içinde mi |
| **4.5** 44 × 44 dokunma hedefi | Hesaplanmış yükseklik yok | Dokunmatik profilde bütün `button, a, input[type=checkbox]` için `getBoundingClientRect()` ≥ 44 |
| **5.4** kontrast oranı | `getComputedStyle` gerçek renk döndürmez (CSS değişkenleri çözülmez) | Metin/zemin çiftleri için WCAG AA (4.5:1, büyük metin 3:1) ölçümü — özellikle `--muted` üzerinde `--bg`, `.gtag` tonları, koyu zeminde `--on-dark-mut` |
| **1.1** ipucunun görsel konumu | Katman konumu hesaplanmaz | Rail ipucunun ekran dışına taşmadığı, menü/üst bar üstünde kaldığı (z-index yığını) |

**Bu altı madde dışındaki 17 maddenin tamamı GEÇTİ. KALDI durumunda madde yok.**

---

## 7. Notlar

- `4.2`, `4.4`, `4.5` maddeleri "kural düzeyinde geçti" olarak işaretlendi:
  kuralın kendisi testle kilitli, iddianın ölçümü açık. Bunlar §6'da da
  listelidir; ikisi birbirinin yerine geçmez.
- Kontrol listesi Faz 12–15 boyunca birikmiş testlerle kapatıldı; Faz 15'te
  yalnız 2.3, 1.2, 5.1 (focus-visible), 5.3 ve 5.4 (reduced-motion) için yeni
  denetim yazıldı (`_qa/test/kabul-denetimi.test.js`).
- Kapanmayan maddelerin tamamı ölçüm kaynaklıdır; hiçbiri kod eksiğinden
  değildir.
