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
