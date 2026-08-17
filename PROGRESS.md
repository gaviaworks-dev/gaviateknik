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
- [ ] Public repo + GitHub Pages yayında

## FAZ 1 — Altyapı
- [ ] `assets/css/gavia-ui.css` (:root değişken bloğu birebir + kabuk)
- [ ] `assets/css/components.css`
- [ ] `assets/css/responsive.css` (1100/980/640/480)
- [ ] `assets/css/print.css`
- [ ] `assets/js/app.js` (boot, rol motoru, TR formatlayıcılar, store)
- [ ] `assets/js/navigation.js` (rail + modül menüsü + topbar enjeksiyonu)
- [ ] `assets/js/components.js`
- [ ] `assets/js/filters.js`
- [ ] `assets/js/forms.js`
- [ ] `assets/js/demo-api.js` (gerçek API'ye ayrık geçiş katmanı)
- [ ] `assets/js/demo-data.js`
- [ ] localStorage: menü tercihi + demo kayıt kalıcılığı

## FAZ 2 — Ana Panel
- [ ] index.html (rol seçimli giriş kapısı)
- [ ] panel.html
- [ ] gunluk-ozet.html
- [ ] aksiyon-merkezi.html
- [ ] ajanda.html
- [ ] onaylar.html
- [ ] bildirimler.html

## FAZ 3 — Müşteri ve Proje
- [ ] musteriler / musteri-detay / musteri-form
- [ ] projeler / proje-detay / proje-form
- [ ] lokasyonlar / lokasyon-detay / lokasyon-form
- [ ] iletisim-kisileri

## FAZ 4 — Hizmet ve Envanter
- [ ] hizmet-katalogu / hizmet-detay
- [ ] sozlesme-pozlari / fiyat-listeleri
- [ ] on-envanter
- [ ] ekipmanlar / ekipman-detay / ekipman-form
- [ ] envanter-mutabakati (13 kolon + renkli fark)

## FAZ 5 — Operasyon ve Saha
- [ ] planlama / operasyon-takvimi
- [ ] is-emirleri / is-emri-detay / is-emri-form
- [ ] saha-kontrol / saha-kontrol-formu (mobil öncelikli + çevrimdışı + senkron)
- [ ] eksik-ekipmanlar / yeniden-kontroller

## FAZ 6 — Teknik Rapor ve Uygunsuzluk
- [ ] teknik-raporlar / rapor-detay / rapor-onaylari / rapor-sablonlari
- [ ] uygunsuzluklar / uygunsuzluk-detay
- [ ] print.css yazdırma düzeni doğrulandı
- [ ] Onaylı raporda "Düzenle" yok → "Yeni Revizyon Oluştur"

## FAZ 7 — Ticari
- [ ] teklifler / teklif-detay / teklif-form
- [ ] sozlesmeler / sozlesme-detay
- [ ] hakedisler
- [ ] fatura-gruplari / fatura-grubu-detay (parti, doluluk, kısmi, mükerrer engeli)
- [ ] faturalar / tahsilatlar

## FAZ 8 — Kaynak Yönetimi
- [ ] taseronlar / taseron-detay / taseron-hakedisleri
- [ ] personeller / personel-detay / yetkinlikler
- [ ] olcum-cihazlari / cihaz-detay / kalibrasyonlar
- [ ] Kalibrasyonu geçmiş cihaz kırmızı + atama disabled
- [ ] Yetkinliği olmayan personel atanamaz

## FAZ 9 — Kalite ve Portal
- [ ] kalite-dokumanlari / denetimler / duzeltici-faaliyetler / musteri-sikayetleri
- [ ] musteri-portali / portal-lokasyonlar / portal-raporlar / portal-faturalar

## FAZ 10 — Sistem
- [ ] raporlar / ayarlar / roller-yetkiler / islem-kayitlari
- [ ] veri-aktarimi (10 adımlı sihirbaz)

## FAZ 11 — QA
- [ ] Kırık link taraması (otomatik script) — 0 bulgu
- [ ] Konsol hatası — 0
- [ ] Yatay taşma — 0
- [ ] Breakpoint kontrolü 1100 / 980 / 640 / 480
- [ ] Print önizleme
- [ ] A11y: label, aria-label, görünür focus, renk tek başına değil
- [ ] TR para / tarih / yüzde formatları
- [ ] "Yakında" / "placeholder" / "TODO" / boş kart taraması — 0
