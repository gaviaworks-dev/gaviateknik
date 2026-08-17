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
