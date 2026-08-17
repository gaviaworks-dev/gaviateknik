/* =====================================================================
   GAVIA — DEMO API CEPHESİ
   Sayfalar veriye YALNIZ buradan erişir. Gerçek servise geçişte
   yalnız bu dosyanın gövdesi fetch çağrılarına çevrilir; sayfa kodu
   ve imzalar değişmez.
   · Bütün okuma fonksiyonları senkron döner (liste/detay çizimi için).
   · Yazma fonksiyonları Promise döner (ağ gecikmesi taklidi + kalıcılık).
   · Kullanıcı değişiklikleri localStorage katmanında saklanır (gv_tk_data).
   ===================================================================== */
window.demoApi = (function () {
  'use strict';

  var ANAHTAR = 'gv_tk_data';
  var D = window.DEMO;

  /* ---------- localStorage örtü katmanı ---------- */
  var ortu = { ekle: {}, guncelle: {}, sil: {} };
  try {
    var ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      var o = JSON.parse(ham);
      ortu.ekle = o.ekle || {}; ortu.guncelle = o.guncelle || {}; ortu.sil = o.sil || {};
    }
  } catch (e) { /* depolama kapalıysa demo salt-okunur çalışır */ }

  function ortuKaydet() {
    try { localStorage.setItem(ANAHTAR, JSON.stringify(ortu)); return true; }
    catch (e) { return false; }
  }

  /* koleksiyonu örtüyle birleştirir */
  function koleksiyon(ad) {
    var temel = D[ad] || [];
    var silinen = ortu.sil[ad] || [];
    var yamalar = ortu.guncelle[ad] || {};
    var sonuc = [];
    for (var i = 0; i < temel.length; i++) {
      var k = temel[i];
      if (silinen.indexOf(k.id) !== -1) continue;
      sonuc.push(yamalar[k.id] ? Object.assign({}, k, yamalar[k.id]) : k);
    }
    var eklenen = ortu.ekle[ad] || [];
    for (var j = 0; j < eklenen.length; j++) {
      if (silinen.indexOf(eklenen[j].id) === -1) {
        sonuc.push(yamalar[eklenen[j].id] ? Object.assign({}, eklenen[j], yamalar[eklenen[j].id]) : eklenen[j]);
      }
    }
    return sonuc;
  }

  function bul(ad, id) {
    var l = koleksiyon(ad);
    for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
    return null;
  }

  function gecikme(deger, ms) {
    return new Promise(function (coz) { setTimeout(function () { coz(deger); }, ms == null ? 260 : ms); });
  }

  /* ---------- tarih yardımcıları (periyot kuralı burada) ---------- */
  function tariheCevir(s) {
    if (!s) return null;
    var p = String(s).substring(0, 10).split('-');
    if (p.length !== 3) return null;
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return isNaN(d.getTime()) ? null : d;
  }
  function isoYaz(d) {
    if (!d) return null;
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  /* KURAL: sonraki kontrol tarihi rapor tarihi + 365 gün DEĞİLDİR.
     Periyot hizmet/ekipman bazında (periyotAy) tanımlıdır.
     Ana tarih yoksa sonraki tarih de BOŞ kalır — sahte tarih üretilmez. */
  function sonrakiKontrol(anaTarih, periyotAy) {
    var d = tariheCevir(anaTarih);
    if (!d || !periyotAy) return null;
    var y = new Date(d.getTime());
    y.setMonth(y.getMonth() + periyotAy);
    return isoYaz(y);
  }
  function gunFarki(a, b) {
    var d1 = tariheCevir(a), d2 = tariheCevir(b);
    if (!d1 || !d2) return null;
    return Math.round((d2 - d1) / 86400000);
  }
  function bugun() { return D.bugun; }

  /* ---------- durum sözlüğü ---------- */
  function durumBilgi(akis, anahtar) {
    var l = D.durumlar[akis] || [];
    for (var i = 0; i < l.length; i++) if (l[i].k === anahtar) return l[i];
    return { k: anahtar, ad: anahtar || '—', ton: 'off', ikon: 'fa-circle' };
  }

  /* ---------- birleşik (zenginleştirilmiş) okuyucular ---------- */
  function lokasyonZengin(l) {
    if (!l) return null;
    var m = bul('musteriler', l.musteriId), mk = bul('markalar', l.markaId), p = bul('projeler', l.projeId);
    return Object.assign({}, l, {
      musteriAd: m ? m.kisaAd : '—',
      musteriUnvan: m ? m.unvan : '—',
      markaAd: mk ? mk.ad : '—',
      projeAd: p ? p.ad : null,
      projeKod: p ? p.kod : null,
      taseronAd: l.taseronId ? (bul('taseronlar', l.taseronId) || {}).kisaAd : null
    });
  }

  function isEmriZengin(ie) {
    if (!ie) return null;
    var l = bul('lokasyonlar', ie.lokasyonId);
    var hizmetler = lokasyonHizmetleri(ie.lokasyonId);
    var toplamMiktar = 0;
    hizmetler.forEach(function (h) { toplamMiktar += h.planlananMiktar; });
    return Object.assign({}, ie, {
      lokasyonAd: l ? l.ad : '—',
      lokasyonKod: l ? l.kod : '—',
      il: l ? l.il : '—', bolge: l ? l.bolge : '—',
      musteriId: l ? l.musteriId : null,
      musteriAd: l ? (bul('musteriler', l.musteriId) || {}).kisaAd : '—',
      hizmetSayisi: hizmetler.length,
      tahminiMiktar: toplamMiktar,
      taseronAd: ie.taseronId ? (bul('taseronlar', ie.taseronId) || {}).kisaAd : null,
      ekipAdlari: (ie.ekipId || []).map(function (id) { return (bul('personeller', id) || {}).ad || id; })
    });
  }

  function raporZengin(r) {
    if (!r) return null;
    var l = bul('lokasyonlar', r.lokasyonId);
    var sla = null, slaDurum = 'yok';
    if (r.kontrolTarihi) {
      var hedef = tariheCevir(r.kontrolTarihi);
      if (hedef) {
        hedef.setDate(hedef.getDate() + (r.slaGun || 7));
        var hedefIso = isoYaz(hedef);
        var karsilastirma = r.teslimTarihi || bugun();
        sla = { hedef: hedefIso, kalanGun: gunFarki(karsilastirma, hedefIso) };
        slaDurum = sla.kalanGun < 0 ? 'asildi' : sla.kalanGun <= 2 ? 'yaklasti' : 'uygun';
        if (r.teslimTarihi) slaDurum = gunFarki(r.teslimTarihi, hedefIso) < 0 ? 'asildi' : 'uygun';
      }
    }
    return Object.assign({}, r, {
      lokasyonAd: l ? l.ad : '—',
      lokasyonKod: l ? l.kod : '—',
      musteriId: l ? l.musteriId : null,
      musteriAd: l ? (bul('musteriler', l.musteriId) || {}).kisaAd : '—',
      kategoriAd: (function () { var k = null; D.hizmetKategorileri.forEach(function (c) { if (c.id === r.kategoriId) k = c; }); return k ? k.ad : '—'; })(),
      personelAd: (bul('personeller', r.kontrolPersoneliId) || {}).ad || '—',
      onaylayanAd: r.onaylayanId ? (bul('personeller', r.onaylayanId) || {}).ad : null,
      sla: sla, slaDurum: slaDurum,
      duzenlenebilir: ['taslak', 'revizyon-istendi', 'teknik-incelemede'].indexOf(r.durum) !== -1
    });
  }

  function lokasyonHizmetleri(lokasyonId) {
    return koleksiyon('lokasyonHizmetleri').filter(function (h) { return h.lokasyonId === lokasyonId; })
      .map(function (h) {
        var s = bul('hizmetler', h.hizmetId) || {};
        return Object.assign({}, h, { hizmetAd: s.ad, poz: s.poz, birim: s.birim, periyotAy: s.periyotAy, kat: s.kat });
      });
  }

  function ekipmanZengin(e) {
    if (!e) return null;
    var l = bul('lokasyonlar', e.lokasyonId);
    return Object.assign({}, e, {
      lokasyonAd: l ? l.ad : '—',
      musteriAd: l ? (bul('musteriler', l.musteriId) || {}).kisaAd : '—',
      sonrakiKontrol: sonrakiKontrol(e.sonKontrol, e.periyotAy)   /* boşsa boş kalır */
    });
  }

  /* ---------- İŞ KURALLARI ---------- */

  /* Kalibrasyonu geçmiş cihaz iş emrine atanamaz. */
  function cihazAtanabilir(cihazId) {
    var c = bul('olcumCihazlari', cihazId);
    if (!c) return { uygun: false, sebep: 'Cihaz bulunamadı.' };
    if (c.durum === 'serviste') return { uygun: false, sebep: 'Cihaz serviste; atama yapılamaz.' };
    var kalan = gunFarki(bugun(), c.kalibrasyonBitis);
    if (kalan == null) return { uygun: false, sebep: 'Kalibrasyon bilgisi eksik.' };
    if (kalan < 0) return { uygun: false, sebep: 'Kalibrasyon geçerliliği ' + Math.abs(kalan) + ' gün önce doldu.', kalanGun: kalan };
    if (kalan <= 30) return { uygun: true, uyari: 'Kalibrasyon geçerliliği ' + kalan + ' gün içinde doluyor.', kalanGun: kalan };
    return { uygun: true, kalanGun: kalan };
  }

  /* Yetkinliği olmayan personel ilgili kontrole atanamaz. */
  function personelAtanabilir(personelId, yetkinlikId) {
    var p = bul('personeller', personelId);
    if (!p) return { uygun: false, sebep: 'Personel bulunamadı.' };
    if (p.durum === 'izinli') return { uygun: false, sebep: 'Personel izinli (' + (p.izinBitis || '—') + ' tarihine kadar).' };
    if (!yetkinlikId) return { uygun: true };
    if ((p.yetkinlikler || []).indexOf(yetkinlikId) === -1) {
      var y = bul('yetkinlikler', yetkinlikId);
      return { uygun: false, sebep: (y ? y.ad : yetkinlikId) + ' yetkinliği tanımlı değil.' };
    }
    var belge = null;
    koleksiyon('personelBelgeleri').forEach(function (b) {
      if (b.personelId === personelId && b.yetkinlikId === yetkinlikId) belge = b;
    });
    if (!belge) return { uygun: false, sebep: 'Yetkinlik belgesi kayıtlı değil.' };
    var kalan = gunFarki(bugun(), belge.bitis);
    if (kalan < 0) return { uygun: false, sebep: 'Yetkinlik belgesi ' + Math.abs(kalan) + ' gün önce geçerliliğini yitirdi.' };
    if (kalan <= 30) return { uygun: true, uyari: 'Yetkinlik belgesi ' + kalan + ' gün içinde doluyor.' };
    return { uygun: true };
  }

  /* Mutabakat onaylanmadan faturaya geçilemez. */
  function lokasyonFaturalanabilirMi(lokasyonId) {
    var lok = bul('lokasyonlar', lokasyonId);
    if (!lok) return { uygun: false, sebep: 'Lokasyon bulunamadı.' };
    var satirlar = mutabakatSatirlari(lokasyonId);
    if (!satirlar.length) return { uygun: false, sebep: 'Bu lokasyon için mutabakat kaydı yok.' };
    var bekleyen = satirlar.filter(function (m) { return m.durum !== 'onayli'; });
    if (bekleyen.length) {
      return { uygun: false, sebep: bekleyen.length + ' hizmet kaleminde müşteri mutabakatı tamamlanmadı.', bekleyen: bekleyen.length };
    }
    if (['onaylandi', 'imzalandi', 'teslim-edildi'].indexOf(lok.raporDurum) === -1) {
      return { uygun: false, sebep: 'Teknik rapor henüz onaylanmadı (' + durumBilgi('rapor', lok.raporDurum).ad + ').' };
    }
    var kalan = 0;
    satirlar.forEach(function (m) { kalan += m.kalan; });
    if (kalan <= 0) return { uygun: false, sebep: 'Faturalanabilir bakiye kalmadı.' };
    return { uygun: true, kalanMiktar: kalan };
  }

  /* Mükerrer faturalama engeli: faturalanan + bu fatura ≤ faturalanabilir. */
  function faturaMiktariGecerliMi(mutabakatId, miktar) {
    var m = bul('mutabakat', mutabakatId);
    if (!m) return { gecerli: false, sebep: 'Mutabakat satırı bulunamadı.' };
    if (miktar <= 0) return { gecerli: false, sebep: 'Miktar sıfırdan büyük olmalıdır.' };
    if (m.faturalanan + miktar > m.faturalanabilir) {
      return { gecerli: false, sebep: 'Mükerrer faturalama: kalan faturalanabilir miktar ' + m.kalan + '.', kalan: m.kalan };
    }
    return { gecerli: true, kalan: m.kalan - miktar };
  }

  /* Onaylı rapor düzenlenemez — yalnız yeni revizyon açılabilir. */
  function raporDuzenlenebilirMi(raporId) {
    var r = bul('raporlar', raporId);
    if (!r) return { uygun: false, sebep: 'Rapor bulunamadı.' };
    if (['onaylandi', 'imzalandi', 'teslim-edildi', 'arsiv'].indexOf(r.durum) !== -1) {
      return { uygun: false, sebep: 'Onaylanmış rapor düzenlenemez. Yeni revizyon oluşturun.', revizyonGerekir: true };
    }
    return { uygun: true };
  }

  /* Taşeron ödemesi müşteri tahsilatına bağlıysa kontrolü. */
  function taseronOdenebilirMi(hakedisId) {
    var h = bul('taseronHakedisleri', hakedisId);
    if (!h) return { uygun: false, sebep: 'Hakediş bulunamadı.' };
    var t = bul('taseronlar', h.taseronId);
    if (t && t.odemeKurali === 'musteri-tahsilati-sonrasi') {
      if (!h.musteriFaturaId) return { uygun: false, sebep: 'Müşteri faturası henüz kesilmedi.' };
      var f = bul('faturalar', h.musteriFaturaId);
      if (!f || f.tahsilatDurum === 'bekleniyor' || f.tahsilatDurum === 'vadesi-gecti') {
        return { uygun: false, sebep: 'Müşteri tahsilatı tamamlanmadı (sözleşme kuralı).' };
      }
      if (f.tahsilatDurum === 'kismen-tahsil') {
        var oran = f.toplam ? f.tahsilEdilen / f.toplam : 0;
        return { uygun: true, kismi: true, oran: oran, odenebilirTutar: Math.round(h.tutar * oran),
                 uyari: 'Müşteriden %' + Math.round(oran * 100) + ' tahsil edildi; hakedişin aynı oranı ödenebilir.' };
      }
    }
    return { uygun: true, odenebilirTutar: h.tutar };
  }

  /* Fatura grubu doluluk hesabı. */
  function faturaGrubuDoluluk(grupId) {
    var g = bul('faturaGruplari', grupId);
    if (!g) return null;
    var eklenen = g.lokasyonlar.length;
    var uygun = 0, eksikRapor = 0, mutabakatBekleyen = 0, toplamTutar = 0;
    g.lokasyonlar.forEach(function (lid) {
      var kontrol = lokasyonFaturalanabilirMi(lid);
      if (kontrol.uygun) { uygun++; toplamTutar += lokasyonFaturaTutari(lid, g.projeId); }
      else if (kontrol.sebep.indexOf('mutabakat') !== -1) mutabakatBekleyen++;
      else eksikRapor++;
    });
    return {
      grupId: grupId, hedef: g.hedefParti, eklenen: eklenen,
      doluluk: g.hedefParti ? Math.min(1, eklenen / g.hedefParti) : 0,
      faturayaUygun: uygun, eksikRapor: eksikRapor, mutabakatBekleyen: mutabakatBekleyen,
      toplamTutar: toplamTutar,
      hedefeUlasti: eklenen >= g.hedefParti
    };
  }

  function lokasyonFaturaTutari(lokasyonId, projeId) {
    var p = bul('projeler', projeId);
    var fl = p ? p.fiyatListesiId : 'FL-2026-STD';
    var t = 0;
    mutabakatSatirlari(lokasyonId).forEach(function (m) {
      t += birimSatisFiyati(m.hizmetId, fl) * m.kalan;
    });
    return t;
  }

  function birimSatisFiyati(hizmetId, fiyatListesiId) {
    var f = D.hizmetFiyatlari[hizmetId];
    if (!f) return 0;
    var k = D.listeKatsayilari[fiyatListesiId] != null ? D.listeKatsayilari[fiyatListesiId] : 1;
    return Math.round(f.satis * k);
  }
  function birimMaliyet(hizmetId) {
    var f = D.hizmetFiyatlari[hizmetId];
    return f ? f.maliyet : 0;
  }

  function mutabakatSatirlari(lokasyonId) {
    return koleksiyon('mutabakat').filter(function (m) { return m.lokasyonId === lokasyonId; })
      .map(function (m) {
        var s = bul('hizmetler', m.hizmetId) || {};
        return Object.assign({}, m, { hizmetAd: s.ad, poz: s.poz, birim: s.birim });
      });
  }

  /* proje ilerleme özeti */
  function projeOzet(projeId) {
    var loks = koleksiyon('lokasyonlar').filter(function (l) { return l.projeId === projeId; });
    var p = bul('projeler', projeId);
    var say = { toplam: loks.length, tamamlanan: 0, planlanan: 0, bilgiBekleyen: 0, raporlanan: 0, faturalanan: 0, kapsamDisi: 0 };
    var gelir = 0, maliyet = 0;
    loks.forEach(function (l) {
      if (l.operasyonDurum === 'kontrol-tamamlandi') say.tamamlanan++;
      if (['planlandi', 'sahada', 'tarih-onayi-bekleniyor'].indexOf(l.operasyonDurum) !== -1) say.planlanan++;
      if (['bilgi-bekleniyor', 'envanter-bekleniyor', 'iletisime-gecildi'].indexOf(l.operasyonDurum) !== -1) say.bilgiBekleyen++;
      if (['onaylandi', 'imzalandi', 'teslim-edildi'].indexOf(l.raporDurum) !== -1) say.raporlanan++;
      if (['kismen-faturalandi', 'tam-faturalandi'].indexOf(l.faturaDurum) !== -1) say.faturalanan++;
      if (['kapsam-disi', 'iptal'].indexOf(l.operasyonDurum) !== -1) say.kapsamDisi++;
      lokasyonHizmetleri(l.id).forEach(function (h) {
        gelir += birimSatisFiyati(h.hizmetId, p ? p.fiyatListesiId : null) * h.planlananMiktar;
        maliyet += birimMaliyet(h.hizmetId) * h.planlananMiktar;
      });
    });
    say.ilerleme = say.toplam ? (say.tamamlanan / Math.max(1, say.toplam - say.kapsamDisi)) : 0;
    say.gelir = gelir; say.maliyet = maliyet;
    say.karlilik = gelir ? (gelir - maliyet) / gelir : 0;
    return say;
  }

  /* rol kapsam süzgeci — müşteri/taşeron rolleri yalnız kendi kayıtlarını görür */
  function rolKapsami(rolId) {
    var r = null;
    D.roller.forEach(function (x) { if (x.id === rolId) r = x; });
    if (!r) return { tur: 'tam' };
    if (r.musteriId) return { tur: 'musteri', musteriId: r.musteriId };
    if (r.taseronId) return { tur: 'taseron', taseronId: r.taseronId };
    return { tur: 'tam' };
  }

  function kapsamaGoreLokasyonlar(rolId) {
    var k = rolKapsami(rolId);
    var l = koleksiyon('lokasyonlar');
    if (k.tur === 'musteri') return l.filter(function (x) { return x.musteriId === k.musteriId; });
    if (k.tur === 'taseron') return l.filter(function (x) { return x.taseronId === k.taseronId; });
    return l;
  }

  /* ---------- YAZMA İŞLEMLERİ (Promise) ---------- */
  function yeniId(ad, onek) {
    var l = koleksiyon(ad);
    var n = l.length + 1;
    var id;
    do { id = onek + String(n).padStart(4, '0'); n++; } while (bul(ad, id));
    return id;
  }

  function ekle(ad, kayit) {
    if (!ortu.ekle[ad]) ortu.ekle[ad] = [];
    if (!kayit.id) kayit.id = yeniId(ad, 'YENI-');
    ortu.ekle[ad].push(kayit);
    ortuKaydet();
    kayitAt('olusturma', ad, kayit.id, null, kayit.ad || kayit.baslik || kayit.id);
    return gecikme({ ok: true, kayit: kayit });
  }

  function guncelle(ad, id, yama) {
    if (!ortu.guncelle[ad]) ortu.guncelle[ad] = {};
    var onceki = bul(ad, id) || {};
    ortu.guncelle[ad][id] = Object.assign({}, ortu.guncelle[ad][id] || {}, yama);
    ortuKaydet();
    var alan = Object.keys(yama)[0];
    kayitAt('guncelleme', ad, id, onceki[alan], yama[alan]);
    return gecikme({ ok: true, kayit: bul(ad, id) });
  }

  function sil(ad, id) {
    if (!ortu.sil[ad]) ortu.sil[ad] = [];
    if (ortu.sil[ad].indexOf(id) === -1) ortu.sil[ad].push(id);
    ortuKaydet();
    kayitAt('silme', ad, id, id, null);
    return gecikme({ ok: true });
  }

  function durumDegistir(ad, id, alan, yeniDurum, aciklama) {
    var onceki = (bul(ad, id) || {})[alan];
    var yama = {}; yama[alan] = yeniDurum;
    if (!ortu.guncelle[ad]) ortu.guncelle[ad] = {};
    ortu.guncelle[ad][id] = Object.assign({}, ortu.guncelle[ad][id] || {}, yama);
    ortuKaydet();
    kayitAt('durum-degisikligi', ad, id, onceki, yeniDurum, aciklama);
    return gecikme({ ok: true, onceki: onceki, yeni: yeniDurum });
  }

  /* işlem kaydı (denetim izi) — kullanıcı işlemleri de loglanır */
  /* Denetim izinde modül adı tek biçimlidir. ekle/guncelle/sil koleksiyon
     anahtarı gönderir, sayfalar ekran adı gönderir; ikisi de burada Türkçe
     ekran adına çevrilir ki İşlem Kayıtları listesi karışık görünmesin. */
  var MODUL_ADI = {
    roller: 'Rol', personeller: 'Personel', yetkinlikler: 'Yetkinlik',
    personelBelgeleri: 'Personel Belgesi', musteriler: 'Müşteri', markalar: 'Marka',
    iletisimKisileri: 'İletişim Kişisi', iletisimGecmisi: 'İletişim Kaydı',
    hizmetKategorileri: 'Hizmet Kategorisi', hizmetler: 'Hizmet',
    fiyatListeleri: 'Fiyat Listesi', projeler: 'Proje', lokasyonlar: 'Lokasyon',
    envanterSablonlari: 'Envanter Şablonu', lokasyonHizmetleri: 'Lokasyon Hizmeti',
    ekipmanlar: 'Ekipman', mutabakat: 'Envanter Mutabakatı', isEmirleri: 'İş Emri',
    sahaKontroller: 'Saha Kontrol', raporSablonlari: 'Rapor Şablonu',
    raporlar: 'Teknik Rapor', uygunsuzluklar: 'Uygunsuzluk',
    yenidenKontroller: 'Yeniden Kontrol', eksikEkipmanlar: 'Eksik Ekipman',
    teklifler: 'Teklif', sozlesmeler: 'Sözleşme', faturaGruplari: 'Fatura Grubu',
    faturalar: 'Fatura', faturaSatirlari: 'Fatura Satırı', tahsilatlar: 'Tahsilat',
    hakedisler: 'Hakediş', taseronlar: 'Taşeron', taseronPersonelleri: 'Taşeron Personeli',
    taseronHakedisleri: 'Taşeron Hakedişi', olcumCihazlari: 'Ölçüm Cihazı',
    kalibrasyonlar: 'Kalibrasyon', kaliteDokumanlari: 'Kalite Dokümanı',
    denetimler: 'Denetim', duzelticiFaaliyetler: 'Düzeltici Faaliyet',
    musteriSikayetleri: 'Müşteri Şikâyeti', bildirimler: 'Bildirim',
    ajanda: 'Ajanda', veriAktarimlari: 'Veri Aktarımı', portalErisimleri: 'Portal Erişimi',
    belgeler: 'Belge'
  };

  function kayitAt(islem, modul, kayitId, onceki, yeni, aciklama) {
    if (!ortu.ekle.islemKayitlari) ortu.ekle.islemKayitlari = [];
    var aktif = (window.GV && window.GV.rol) || 'sahip';
    var rolAd = null;
    D.roller.forEach(function (r) { if (r.id === aktif) rolAd = r; });
    ortu.ekle.islemKayitlari.push({
      id: 'LOG-U' + String(ortu.ekle.islemKayitlari.length + 1).padStart(5, '0'),
      zaman: new Date().toISOString().substring(0, 19),
      kullaniciId: rolAd ? rolAd.personelId : null,
      rol: aktif, modul: MODUL_ADI[modul] || modul, kayit: kayitId, islem: islem,
      onceki: onceki == null ? null : String(onceki),
      yeni: yeni == null ? null : String(yeni),
      aciklama: aciklama || 'Demo arayüzünden yapıldı.',
      ip: 'demo'
    });
    ortuKaydet();
  }

  function sifirla() {
    ortu = { ekle: {}, guncelle: {}, sil: {} };
    try { localStorage.removeItem(ANAHTAR); } catch (e) {}
    return gecikme({ ok: true }, 120);
  }

  function degisiklikSayisi() {
    var n = 0;
    Object.keys(ortu.ekle).forEach(function (k) { if (k !== 'islemKayitlari') n += ortu.ekle[k].length; });
    Object.keys(ortu.guncelle).forEach(function (k) { n += Object.keys(ortu.guncelle[k]).length; });
    Object.keys(ortu.sil).forEach(function (k) { n += ortu.sil[k].length; });
    return n;
  }

  /* ---------- global arama ---------- */
  function ara(sorgu, limit) {
    var q = String(sorgu || '').toLocaleLowerCase('tr-TR').trim();
    if (q.length < 2) return [];
    var sonuc = [];
    function tara(ad, grup, ikon, alanlar, linkFn) {
      koleksiyon(ad).forEach(function (k) {
        for (var i = 0; i < alanlar.length; i++) {
          var v = k[alanlar[i]];
          if (v && String(v).toLocaleLowerCase('tr-TR').indexOf(q) !== -1) {
            sonuc.push({ grup: grup, ikon: ikon, baslik: k[alanlar[0]] || k.id, altBaslik: k.id, link: linkFn(k) });
            return;
          }
        }
      });
    }
    tara('musteriler', 'Müşteriler', 'fa-building', ['unvan', 'kisaAd', 'kod'], function (k) { return 'musteri-detay.html?id=' + k.id; });
    tara('projeler', 'Projeler', 'fa-diagram-project', ['ad', 'kod'], function (k) { return 'proje-detay.html?id=' + k.id; });
    tara('lokasyonlar', 'Lokasyonlar', 'fa-location-dot', ['ad', 'kod', 'musteriKod', 'il'], function (k) { return 'lokasyon-detay.html?id=' + k.id; });
    tara('ekipmanlar', 'Ekipmanlar', 'fa-gears', ['ad', 'kod', 'seri', 'qr'], function (k) { return 'ekipman-detay.html?id=' + k.id; });
    tara('isEmirleri', 'İş Emirleri', 'fa-clipboard-list', ['id'], function (k) { return 'is-emri-detay.html?id=' + k.id; });
    tara('raporlar', 'Teknik Raporlar', 'fa-file-lines', ['no', 'id'], function (k) { return 'rapor-detay.html?id=' + k.id; });
    tara('faturalar', 'Faturalar', 'fa-file-invoice-dollar', ['no', 'id'], function (k) { return 'faturalar.html?id=' + k.id; });
    tara('taseronlar', 'Taşeronlar', 'fa-people-carry-box', ['unvan', 'kisaAd', 'kod'], function (k) { return 'taseron-detay.html?id=' + k.id; });
    tara('personeller', 'Personeller', 'fa-user', ['ad', 'gorev'], function (k) { return 'personel-detay.html?id=' + k.id; });
    tara('olcumCihazlari', 'Ölçüm Cihazları', 'fa-ruler-combined', ['ad', 'kod', 'seri'], function (k) { return 'cihaz-detay.html?id=' + k.id; });
    return sonuc.slice(0, limit || 12);
  }

  /* ---------- dışa açılan cephe ---------- */

  /* Firma künyesi tek cepheden okunur. Ayarlar ekranında kaydedilen künye
     (gv_tk_firma) çekirdek veriyi örter; rapor kapağı ve fatura başlığı
     otomatik olarak güncel künyeyi kullanır. */
  function firma() {
    var ortu = {};
    try { ortu = JSON.parse(localStorage.getItem('gv_tk_firma') || '{}') || {}; } catch (e) {}
    return Object.assign({}, D.firma, ortu);
  }

  /* Anahtarlı sözlükler (dizi olmayan koleksiyonlar) da tek cepheden okunur:
     hizmetFiyatlari, listeKatsayilari, kontrolMaddeleri, lokasyonKapsamAyarlari.
     Sayfaların window.DEMO'ya doğrudan erişmesine gerek kalmaz. */
  function harita(ad) { return D[ad] || {}; }

  return {
    /* çekirdek */
    liste: koleksiyon,
    kayit: bul,
    bugun: bugun,
    firma: firma,
    harita: harita,
    veri: function (ad) { return koleksiyon(ad); },

    /* tarih ve periyot */
    sonrakiKontrol: sonrakiKontrol,
    gunFarki: gunFarki,
    tariheCevir: tariheCevir,
    isoYaz: isoYaz,

    /* sözlük */
    durum: durumBilgi,
    durumListesi: function (akis) { return D.durumlar[akis] || []; },

    /* zenginleştirilmiş okuyucular */
    lokasyonlar: function () { return koleksiyon('lokasyonlar').map(lokasyonZengin); },
    lokasyon: function (id) { return lokasyonZengin(bul('lokasyonlar', id)); },
    isEmirleri: function () { return koleksiyon('isEmirleri').map(isEmriZengin); },
    isEmri: function (id) { return isEmriZengin(bul('isEmirleri', id)); },
    raporlar: function () { return koleksiyon('raporlar').map(raporZengin); },
    rapor: function (id) { return raporZengin(bul('raporlar', id)); },
    ekipmanlar: function () { return koleksiyon('ekipmanlar').map(ekipmanZengin); },
    ekipman: function (id) { return ekipmanZengin(bul('ekipmanlar', id)); },
    lokasyonHizmetleri: lokasyonHizmetleri,
    mutabakatSatirlari: mutabakatSatirlari,

    /* iş kuralları */
    cihazAtanabilir: cihazAtanabilir,
    personelAtanabilir: personelAtanabilir,
    lokasyonFaturalanabilirMi: lokasyonFaturalanabilirMi,
    faturaMiktariGecerliMi: faturaMiktariGecerliMi,
    raporDuzenlenebilirMi: raporDuzenlenebilirMi,
    taseronOdenebilirMi: taseronOdenebilirMi,
    faturaGrubuDoluluk: faturaGrubuDoluluk,
    lokasyonFaturaTutari: lokasyonFaturaTutari,
    birimSatisFiyati: birimSatisFiyati,
    birimMaliyet: birimMaliyet,
    projeOzet: projeOzet,
    rolKapsami: rolKapsami,
    kapsamaGoreLokasyonlar: kapsamaGoreLokasyonlar,

    /* yazma */
    ekle: ekle,
    guncelle: guncelle,
    sil: sil,
    durumDegistir: durumDegistir,
    kayitAt: kayitAt,
    sifirla: sifirla,
    degisiklikSayisi: degisiklikSayisi,

    /* arama */
    ara: ara
  };
})();
