# GAVIA — Periyodik Kontrol Yönetimi · PROJE KURALLARI

Çok lokasyonlu periyodik kontrol operasyonlarını yöneten **statik** yönetim paneli.
HTML5 + CSS3 + Vanilla JS. Build adımı YOK, framework YOK, sunucu YOK.
GitHub Pages alt klasörde çalışır → **bütün yollar görelidir** (`assets/...`, `panel.html`).

Kaynak brief: `_docs/BRIEF.md` (gitignore'da, public repo'ya gitmez).
Faz durumu: `PROGRESS.md`.

---

## 1. Dosya yapısı

```
/                       kök — bütün sayfalar düz (alt klasör yok)
├── index.html          rol seçimli giriş kapısı (kabuk YOK)
├── panel.html …        modül sayfaları
└── assets/
    ├── css/  gavia-ui.css · components.css · responsive.css · print.css
    ├── js/   app.js · navigation.js · components.js · filters.js
    │         forms.js · demo-api.js · demo-data.js
    │         types.js · data-provider.js · list-controller.js · tooltip.js
    │         kimlik.js · para-zaman.js · durum-makinesi.js · form-controller.js
    │         kpi.js
    └── images/
```

**Yükleme sırası (değiştirme):**
CSS → `gavia-ui.css` → `components.css` → `responsive.css` → `print.css`
JS  → `kimlik.js` → `para-zaman.js` → `demo-data.js` → `demo-api.js` → `navigation.js` → `components.js` → `filters.js` → `forms.js` → `app.js`

`kimlik.js` ve `para-zaman.js` **en başta** yüklenir: hiçbir şeye bağlı
değildirler; `demo-api.js` kimlik üretimini, para aritmetiğini ve iş tarihini
onlardan alır.

Faz 12/13 ortak katmanı **app.js'den sonra** yüklenir (bu dosyalar yükleme anında
yalnız tanım yapar, hiçbir şeye dokunmaz), şu sırayla:
`durum-makinesi.js` → `form-controller.js` → `kpi.js` → `types.js` → `data-provider.js` → `list-controller.js` → `tooltip.js`

## 2. Dosya adlandırma

- Küçük harf, tire ayraç, Türkçe karakter YOK: `is-emri-detay.html`, `envanter-mutabakati.html`
- Modül üçlüsü: `<modul>.html` (liste) · `<modul>-detay.html` · `<modul>-form.html`
- Portal sayfaları `portal-` önekli.
- CSS sınıfları `gv-` (kabuk/çekirdek) veya bileşen kısaltması (`kpi-`, `gt-`, `pr-`) öneklidir.
- JS global API'ler `gv` önekli camelCase: `gvToast`, `gvConfirm`, `gvTable`.

## 3. Tasarım sistemi (özet)

Tam değişken bloğu `assets/css/gavia-ui.css` `:root` içinde — **dokümandan birebir**.

| Amaç | Değişken |
|---|---|
| Rail zemini | `--gv-deep` #020837 |
| Modül menüsü zemini | `--gv-night` #141533 |
| Aksiyon (açık zemin) | `--gv-action` #0E8C6D · hover `--gv-action-deep` |
| Accent (koyu zemin) | `--gv-mint` #3FD5AD |
| Çalışma zemini / kart | `--bg` #F4F6F9 / `--paper` #FFFFFF |
| Metin | `--ink` · `--ink-2` · `--muted` |
| Çizgi | `--line` #E4E7EE · `--line-2` |
| Durum | `--success` `--warning` `--danger` `--info` (+ `-tint`) |
| Ölçü | `--rail-width` 76px · `--menu-width` 264px · `--topbar-height` 64px |
| Kırılım | `--bp-xl` 1280 · `--bp-lg` 1100 · `--bp-md` 980 · `--bp-sm` 640 · `--bp-xs` 480 |

**Kırılım eşikleri tek yerde tanımlıdır** — `gavia-ui.css` `:root` içindeki
`--bp-*` bloğu. CSS `@media` koşulu `var()` kabul etmediği için literal yazılır,
ama her `@media` satırı hangi tokena bağlı olduğunu yorumla belirtir ve
`_qa/test/kirilim.test.js` kaçak eşiğe izin vermez. JS tarafı piksel yazmaz:
`GV.altinda('sm')` · `GV.bp('md')` · `GV.kirilimIzle('xs', cb)`.

**Renk anlamı:** yeşil = tamamlandı/uygun/onaylı · sarı = bekleyen/yaklaşan · kırmızı = hata/gecikme/kritik · mavi = bilgi/normal.
**Renk tek başına durum göstergesi olamaz** — her rozet ikon + metin taşır.
Gövde metni 13–14px. Gradient/neon/dekoratif grafik YOK.

## 4. Bileşen sınıf isimleri

**Kabuk:** `.gv-app` `.gv-rail` `.gv-menu` `.gv-divider` `.gv-overlay` `.gv-top` `.gv-main` `.gv-crumbs` `.gv-page-head`
**Kart:** `.gv-card` `.gc-head` `.gc-title` `.gc-body` (`.flush`) `.gc-foot` `.gc-link`
**KPI:** `.kpi-grid` `.kpi-card` (`.warn/.danger/.info`) `.kpi-ico` `.kpi-num` `.kpi-lbl` `.kpi-delta`
**Durum:** `.gstat` (`.ok/.wait/.warn/.danger/.info/.off`) · etiket `.gtag`
**Tablo:** `.gtable` (`.gtable-cards` + `td[data-lbl]` → mobil kart) `.gcell` `.row-acts` `.ia-btn` `.gv-tscroll`
**Liste başlığı:** `.gv-listhead` `.lh-row` `.lh-search` `.lh-acts` `.chips` `.chip`
**Filtre:** `.gv-fpanel-ov` `.gv-fpanel` `.gv-achips-row` `.gv-achip` · kolon `.gv-colpop`
**Form:** `.gform` `.gfield` (`.full`) `.form-grid` `.form-foot` `.gf-hint` `.gf-err`
**Detay:** `.gd-grid` `.gv-side-stack` `.gv-tabbar` `.gv-botsec`
**Zincir/geçmiş:** `.gv-chain` `.chain-step` `.act-list` `.act-row`
**Modal/toast:** `.gv-modal-ov` `.gv-modal` `.gv-toast-wrap` `.gv-toast` `.gv-pop`
**Durum ekranları:** `.gv-empty` `.gv-skeleton` `.gv-error` `.gv-notfound`
**İlerleme:** `.gbar` `.gbar-track` `.gbar-fill` (`.warn/.danger`) `.gbar-val`
**Yazdırma:** `.pr-doc` `.pr-head` `.pr-body` `.pr-sign` · `.no-print` (yazdırmada gizlenir) · `.print-only`

## 5. Sayfa iskeleti

Her modül sayfası aynı gövdeyle başlar; **rail/menü/topbar HTML'i sayfaya yazılmaz**,
`navigation.js` enjekte eder.

```html
<body data-sec="operasyon" data-screen="is-emirleri">
<div class="gv-app">
  <aside class="gv-rail" id="gvRail"></aside>
  <nav class="gv-menu" id="gvMenu"></nav>
  <div class="gv-divider" id="gvDivider" role="separator" aria-label="Menüyü daralt/genişlet"><span class="gv-grip"></span></div>
  <div class="gv-overlay" id="gvOverlay"></div>
  <header class="gv-top" id="gvTop"></header>
  <main class="gv-main">
    <!-- breadcrumb navigation.js tarafından basılır -->
    <div class="gv-page-head">…</div>
    …içerik…
  </main>
</div>
<script src="assets/js/demo-data.js"></script> …
</body>
```

- `data-sec` → rail bölümü anahtarı (`navigation.js` `SECTIONS` içindeki key)
- `data-screen` → aktif menü kalemi (`screen` alanı); detay/form sayfaları liste ekranının screen'ini **miraslar**
- Kayıt kırıntısı: `GV.crumb('IE-2026-0031')` ya da `<body data-crumb="…">`

## 6. Yeni sayfa nasıl eklenir (reçete)

1. **Menü kaydı** — `assets/js/navigation.js` → `SECTIONS.<bolum>.menu` dizisine kalem ekle:
   `{ic:'fa-file-lines', lbl:'Teknik Raporlar', href:'teknik-raporlar.html', screen:'teknik-raporlar'}`
2. **Rol görünürlüğü** — `ROLES.<rol>.secs` bölümü içeriyor mu? Ekran kısıtı gerekiyorsa `ROLES.<rol>.scr.<bolum>` dizisine `screen` değerini ekle. Kısıt tanımlı değilse bölümün tamamı görünür.
3. **Dosyayı oluştur** — mevcut en yakın sayfayı kopyala (liste için `is-emirleri.html`, detay için `is-emri-detay.html`, form için `is-emri-form.html`), `<title>`, `data-sec`, `data-screen`, `.gv-page-head` ve içeriği değiştir.
4. **Veri** — `demo-data.js` içine kaydı ekle; sayfa veriyi **yalnız** `demoApi.*` üzerinden okur (doğrudan `DEMO` nesnesine dokunma).
5. **Bağlantılar** — listeden detaya `?id=` ile git; detay `demoApi.get*(id)` bulamazsa `gvNotFound()` çağır.
6. **QA** — `node _qa/link-check.js` (kırık link), 1100/980/640/480 kontrolü, konsol temiz olmalı.

## 7. Veri katmanı sözleşmesi

- `demo-data.js` → saf veri (`window.DEMO`). İş kuralı YOK.
- `demo-api.js` → `window.demoApi`. **Tek erişim noktası.** Promise döner (gerçek API'ye geçişte
  yalnız bu dosyanın gövdesi `fetch`'e çevrilir). localStorage overlay'i burada uygulanır
  (`gv_tk_data` anahtarı) — kullanıcı eklediği/düzenlediği kayıtlar sayfa yenilense de kalır.
- **Sayfa kodu `window.DEMO`'yu ASLA doğrudan okumaz — istisnasız.** Her koleksiyon türü için cephe var:

| Ne okunuyor | Cephe |
|---|---|
| Dizi koleksiyon (`lokasyonlar`, `raporlar`, …) | `demoApi.liste(ad)` · tek kayıt `demoApi.kayit(ad, id)` |
| Anahtarlı sözlük (`hizmetFiyatlari`, `kontrolMaddeleri`, `listeKatsayilari`, `lokasyonKapsamAyarlari`) | `demoApi.harita(ad)` |
| Firma künyesi | `demoApi.firma()` — Ayarlar'da kaydedilen künye (`gv_tk_firma`) çekirdek veriyi örter, rapor kapağı ve fatura başlığı otomatik güncellenir |
| Sistem ayarı (SLA, parti büyüklüğü, vade, uyarı eşikleri) | `GV.ayar(anahtar[, varsayilan])` — `gv_tk_ayar`'dan okur, yoksa varsayılana düşer |

  Eşik değerleri sayfaya sabit yazılmaz: kalibrasyon uyarısı `GV.ayar('kalibrasyonEsik')`,
  personel belgesi `GV.ayar('belgeEsik')`, sözleşme yenileme `GV.ayar('sozlesmeEsik')`.
- Denetim izi `demoApi.kayitAt(...)` ile yazılır; modül adı orada tek biçime çevrilir
  (koleksiyon anahtarı verilse de ekran adı kaydedilir).
- **Kimlik üretimi `GV.yeniKod(onek)`'tir** (`kimlik.js` · `crypto.randomUUID`).
  `liste.length + 1` ya da `Date.now()` son hanesiyle kalıcı id üretilmez —
  iki sekme aynı anda kayıt açtığında çakışır.
- `demoApi.ekle/guncelle/sil/durumDegistir` **komut katmanından** geçer
  (`GV.komut`): her deneme bir `requestId` taşır, aynı komut ikinci kez
  çağrılırsa yeni kayıt açılmaz, önceki sonuç döner. Kayıtlar `rowVersion`
  alanı taşır (ileride If-Match).

## 8. Zorunlu iş kuralları (ihlal edilemez)

- **Periyot:** sonraki kontrol tarihi `rapor tarihi + 365` diye SABİTLENMEZ. Periyot hizmet/ekipman
  bazında `periyotAy` alanından gelir. **Ana tarih boşsa sonraki tarih de boş** — sahte 1900 tarihi üretilmez.
- **Durumlar 5 ayrı akıştır** ve tek metin alanında birleştirilmez:
  `operasyonDurum` · `raporDurum` · `faturaDurum` · `tahsilatDurum` · `taseronOdemeDurum`.
- **Fiyat ayrımı:** müşteri satış fiyatı (`satisFiyat`) ile taşeron maliyeti (`taseronMaliyet`) ayrı alanlardır, hiçbir ekranda birbirinin yerine kullanılmaz.
- **Mutabakat:** onaylanmadan faturaya geçilemez → uyarı modalı.
- **Mükerrer fatura engeli:** `faturalanan + buFatura ≤ faturalanabilir`.
- **Onaylı rapor** düzenlenemez → yalnız "Yeni Revizyon Oluştur".
- **Durum yalnız `GV.gecisUygula(...)` ile değişir** (`durum-makinesi.js`).
  Sayfa scripti `guncelle()` ile durum alanı yazmaz. Geçiş; önceki durum,
  izin, zorunlu alan ve iş kuralı ön koşulundan geçer. Geçiş yapılamıyorsa
  buton gizlenmez — `GV.gecisButonu` ile disabled sebebi gösterilir.
- **Uygunsuzluk altı aşamalıdır** ve aşama atlanamaz: `acik` → `aksiyon-planlandi`
  → `uygulandi` → `kanit-yuklendi` → `dogrulandi` → `kapandi`. "Gecikti" bir aşama
  DEĞİLDİR; terminden türer (`GV.saat.gecikmisMi(termin)`) ve kayıtta saklanmaz.
  Aşama rozeti tek yerden basılır: `GV.akisRozet('uygunsuzluk', durum)`.
- **Kalibrasyonu geçmiş cihaz** iş emrine atanamaz (buton `disabled` + kırmızı uyarı).
- **Yetkinliği olmayan personel** ilgili kontrole atanamaz.
- Ana lokasyon rehberi ≠ projedeki lokasyon ≠ tamamlanan ≠ faturalanan (4 ayrı bilgi).

### Para ve zaman (Faz 13)

- **Para hesabı kuruş tamsayısı üzerinden yapılır** (`GV.kurus`): `al` (TL→kuruş),
  `topla/cikar/carp/oran`, `tl` (kuruş→TL). Float yuvarlama zinciri kurulmaz.
- **Para birimi kayıt seviyesindedir; farklı birimler tek toplamda birleşmez.**
  Çok kayıtlı toplam `GV.paraToplam(kayitlar, 'tutar')` ile alınır; sonuç
  `karisikMi` ise tek sayıya indirgenmez, `metin()` ayrışık gösterir.
- **KPI'lar adlandırılmış seçicilerden gelir** (`kpi.js`): panel ve liste
  ekranı `GV.kpi('onayBekleyenRapor')` gibi AYNI seçiciyi çağırır; iki yerde
  iki farklı sayı çıkamaz. Arşiv / kapsam dışı / silinmiş kayıtların sayıma
  girip girmediği `GV.kpiKapsam()` filtresidir ve ekranda `GV.kpiKapsamNotu`
  ile yazılı durur.
- **İş tarihi ve gecikme `GV.saat` (ClockService) üzerinden okunur** —
  `bugun()`, `gecikmeGun(vade)`, `zamanDamgasi()`. Sayfa kodu `new Date()`
  ya da `Date.now()` çağırmaz; testte `GV.saat.sabitle({gun, epoch})`.

## 9. Türkçe format kuralları

`app.js` içindeki yardımcılar kullanılır, elle formatlama yapılmaz:
- Para: `GV.tl(1234567.5)` → `₺1.234.567,50`
- Sayı: `GV.n(1234)` → `1.234`
- Tarih: `GV.d('2026-08-17')` → `17 Ağu 2026` · uzun: `GV.dLong(...)` → `17 Ağustos 2026`
- Yüzde: `GV.pct(0.635)` → `%63,5`
- **Boş tarih → `—`** (asla uydurma tarih)

## 10. Erişilebilirlik zorunlulukları

- Her form alanının `<label for>` bağı vardır.
- İkon-only butonlarda `aria-label` zorunlu.
- Görünür focus (`:focus-visible`) hiçbir yerde kaldırılmaz.
- Tablo `<th scope="col">`, sekmeler `role="tab"` + `aria-selected`.
- Modal açıkken arka plan kilitli (`gvScrollLock`), Esc kapatır, Tab tuzağı vardır.
- `prefers-reduced-motion` desteklenir.
- Her sayfada **"İçeriğe atla"** bağlantısı vardır — `navigation.js` kabuğu enjekte ederken
  gövdenin ilk odaklanabilir öğesi olarak basar (`.gv-skip`), sayfaya elle yazılmaz.
- Canlı güncellenen sayaçlar `aria-live="polite"` taşır (bildirim zili).
- `gvTable` her tabloya görsel olarak gizli `<caption>` basar; elle yazılan tablolarda
  `<caption class="gv-sr">` veya `aria-label` gerekir.
- `role="tab"` düğmesi `aria-controls` ile panelini gösterir; panel `role="tabpanel"` +
  `aria-labelledby` taşır.
- Başlık hiyerarşisi atlamasız: sayfa `h1` → kart başlıkları `h2 class="gc-title"` →
  liste kalemi başlıkları `h3`. Kart başlığı asla `h3`/`h4` değildir.
- **Renk tek başına gösterge olamaz** kuralı durum tonu taşıyan HER rozeti kapsar:
  `.gstat` zaten ikon taşır; `.gtag` nötr etikettir ama `ok/warn/danger/info` tonu
  aldığı anda ikon taşımak ZORUNDADIR.

## 11. Yasaklar

- "Yakında", "placeholder", "TODO", boş kart, işlevsiz buton **yok**.
  Backend gereken her aksiyon en az bir modal / toast / localStorage güncellemesi yapar.
- Kare görsel gerekiyorsa `<img>` değil `div + background-image + cover + center`.
- Görsel ölçülerinde CSS render genişliği esas alınır (2x retina çarpımı yapılmaz).
- Gerçek kişi adı, telefon, e-posta, firma unvanı kullanılmaz — hepsi kurgusaldır.
- Tek dev HTML dosyası üretilmez.

---

## 12. Faz 12 otonom protokolü

Faz 12 (`_docs/REVIZYON.md` kapsamı) otonom koşuyla yürütülür. Üç kural ihlal edilemez:

1. **Her tur başında `node _qa/durum.js` çalıştır ve çıktısına göre devam et.**
   İlerleme hafızadan raporlanmaz. Hangi sayfanın `ListController`'a geçtiği, hangi
   ortak dosyanın var olduğu, testlerin ve taramaların son sonucu yalnız bu script'ten
   okunur. `durum.js` ile `_qa/LEDGER.md` çelişirse **`durum.js` esastır** — defter elle
   yazılır, script diskten okur.

2. **Her adımdan önce git tag at: `faz12-adim-N-oncesi`.**
   Adım bozulursa `git reset --hard faz12-adim-N-oncesi` ile tek komutta dönülür.
   Tag atılmadan adıma başlanmaz.

3. **Her adım sonrası sırayla: tarama → ayrıştırıcı → commit → LEDGER satırı.**
   `node _qa/durum.js` temiz değilse commit atılmaz; önce bulgu kapatılır.
   Commit'ten sonra `_qa/LEDGER.md`'ye tek satır eklenir (tarih, adım no, dosyalar,
   tarama sonucu, commit hash, varsa bilinen kusur). Commit'siz satır yazılmaz;
   commit sütunu boş satır **yarım adım** demektir ve bir sonraki tur onu kapatır.

**Faz 12 kapsam sınırı:** yeni ekran eklenmez, görsel kimlik değişmez, backend/API
yazılmaz, sahte endpoint üretilmez. Değişiklik ortak bileşen ve davranış düzeyindedir.
