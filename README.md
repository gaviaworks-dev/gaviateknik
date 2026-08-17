# GAVIA — Periyodik Kontrol Yönetimi

Çok lokasyonlu periyodik kontrol operasyonlarını yöneten yönetim platformu arayüzü.
Statik HTML5 / CSS3 / Vanilla JavaScript — build adımı, framework ve sunucu gerektirmez.

**Canlı demo:** https://gaviaworks-dev.github.io/gaviateknik/

## Kapsam

Müşteri ve proje ağı · lokasyon ve ekipman envanteri · hizmet kataloğu ve sözleşme pozları ·
planlama ve saha operasyonu · mobil saha kontrol formu · teknik raporlama ve uygunsuzluk ·
teklif, sözleşme, hakediş, toplu/kısmi faturalama ve tahsilat · taşeron, personel ve
ölçüm cihazı yönetimi · kalite süreçleri · müşteri portalı · sistem ayarları ve veri aktarımı.

## Çalıştırma

Depoyu klonlayıp `index.html` dosyasını tarayıcıda açmak yeterlidir. İstenirse statik sunucu:

```bash
python3 -m http.server 8080
```

## Roller

Arayüz `?role=` parametresiyle rol değiştirir; menüler ve aksiyonlar role göre budanır.

`sahip` · `gm` · `operasyon` · `teknik` · `kalite` · `planlama` · `uzman` · `saha` ·
`satis` · `finans` · `taseron` · `musteri` · `sistem`

Örnek: `panel.html?role=operasyon`

## Veriler

Arayüzdeki bütün kayıtlar **tamamen kurgusaldır**. Gerçek kişi, telefon, e-posta veya
firma bilgisi içermez. Demo veri katmanı (`assets/js/demo-data.js`) API cephesinin
(`assets/js/demo-api.js`) arkasındadır; gerçek servise geçişte yalnız cephe değiştirilir.
