# _qa — Faz 12 kalite koşum takımı

Bu dizin **yayınlanan siteye dahil değildir**; yalnız geliştirme sırasında çalışır.
Proje bilinçli olarak build adımsızdır, bu yüzden `node_modules` repoya girmez.

## Scriptler

| Dosya | Ne yapar |
|---|---|
| `durum.js` | **Tek gerçek ilerleme kaynağı.** Diskten okuyarak Faz 12 durumunu basar. |
| `tarama.js` | Her sayfayı jsdom'da çalıştırır; JS hatası, kırık link, a11y, yasak metin, format bulgularını raporlar. |
| `butunluk.js` | 73 sayfayı ayrıştırır: etiket dengesi, satır içi script sözdizimi, kırılmış JS string'i, çalışma hatası. |
| `rol-koruma.js` | Yasak rol/sayfa kombinasyonlarında erişim korumasının yönlendirme yaptığını doğrular. |
| `jsdom-yolu.js` | jsdom'u aday konumlardan çözer; bulamazsa çağıran dürüstçe "çalıştırılamadı" raporlar. |

## Kullanım

```
node _qa/durum.js            # tam rapor
node _qa/durum.js --hizli    # yalnız disk analizi
node _qa/tarama.js           # tüm sayfalar, sahip rolü
node _qa/tarama.js "" kalite # tek rol
node _qa/butunluk.js
```

## jsdom

`durum.js` jsdom'u şu sırayla arar: `_qa/node_modules`, `GV_JSDOM_YOLU` ortam
değişkeni, oturum scratchpad'i. Hiçbirinde yoksa taramalar **atlanır ve öyle
raporlanır** — uydurma sonuç üretilmez.

Kalıcı kurulum istenirse:

```
cd _qa && npm init -y && npm i --no-save jsdom
```

`_qa/node_modules/` gitignore'dadır.

## Birim testler

`_qa/test/*.test.js` → `node --test "_qa/test/*.test.js"` ile çalışır, npm bağımlılığı yoktur.
`durum.js` geçen/kalan sayısını buradan okur.
