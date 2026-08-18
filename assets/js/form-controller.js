/* =====================================================================
   GAVIA — FORM DENETLEYİCİSİ (ortak form standardı)
   Doküman §11 "Ortak Form ve Etkileşim Standardı":
     Validation → şema tabanlı; submit öncesi TÜM alanlar; ilk hataya odak;
                  üstte hata özeti
     Submit     → ilk tıklamada kilit; spinner + metin; ikinci gönderim yok
     Taslak     → dirty state; çıkış uyarısı; belirgin son kaydetme zamanı
     Hata       → alan hatası yerinde; sistem hatası üstte; tekrar dene
     Yetki      → buton yalnız gizlenmez

   `gvForm` (forms.js) yerinde kalır: migrate EDİLMEMİŞ sayfaların davranışı
   bit düzeyinde aynı olsun diye ona dokunulmadı. Bu dosya onun yerine
   geçmez, üstüne biner ve şema + kilit + özet ekler.

   Global API: gvFormController
   ===================================================================== */
(function () {
  'use strict';
  var kok = typeof window !== 'undefined' ? window : globalThis;
  var GV = kok.GV || (kok.GV = {});
  function esc(s) { return GV.esc ? GV.esc(s) : String(s == null ? '' : s); }

  var EPOSTA = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  var TELEFON = /^[0-9 ()+\-]{7,}$/;

  /**
   * @typedef {Object} AlanKural
   * @property {string}  [etiket]   hata özetinde görünen ad (yoksa <label>)
   * @property {boolean} [zorunlu]
   * @property {'metin'|'eposta'|'telefon'|'sayi'|'tarih'|'secim'} [tur]
   * @property {number}  [enAz]     metinde karakter, sayıda değer, tarihte ISO
   * @property {number}  [enCok]
   * @property {RegExp}  [desen]
   * @property {string}  [mesaj]    desen ihlalinde gösterilecek metin
   * @property {string}  [sonra]    bu alan, adı verilen tarihten SONRA olmalı
   * @property {string}  [once]     bu alan, adı verilen tarihten ÖNCE olmalı
   * @property {(deger:string, veri:Object)=>string} [ozel] boş dize = geçerli
   */

  /**
   * @param {Object} secenek
   * @param {string|HTMLFormElement} secenek.form
   * @param {Object<string, AlanKural>} [secenek.sema]
   * @param {string} [secenek.ad]          komut adı — idempotency anahtarı
   * @param {string} [secenek.anahtar]     taslak anahtarı
   * @param {string} [secenek.iptalHref]
   * @param {(veri:Object, ctx:Object)=>*} secenek.gonder
   * @param {(veri:Object)=>string} [secenek.gonderOncesi] boş dize = devam
   */
  kok.gvFormController = function (secenek) {
    secenek = secenek || {};
    var form = typeof secenek.form === 'string' ? document.querySelector(secenek.form) : secenek.form;
    if (!form) return null;

    var sema = secenek.sema || {};
    var kirli = false;
    var gonderiliyor = false;
    var istekId = null;            /* deneme başına üretilir, başarıda sıfırlanır */
    var sonKayitZamani = null;
    var taslakAnahtar = 'gv_tk_taslak_' + (secenek.anahtar || location.pathname.split('/').pop());

    /* ---------------- hata özeti kabı ---------------- */
    var ozet = typeof secenek.ozetHedef === 'string'
      ? document.querySelector(secenek.ozetHedef)
      : secenek.ozetHedef;
    if (!ozet) {
      ozet = document.createElement('div');
      form.insertBefore(ozet, form.firstChild);
    }
    ozet.className = 'gv-note danger';
    ozet.id = ozet.id || (GV.yeniKod ? GV.yeniKod('fozet') : 'fozet');
    ozet.setAttribute('role', 'alert');
    ozet.setAttribute('tabindex', '-1');
    ozet.hidden = true;
    ozet.style.marginBottom = '16px';

    /* ---------------- alan yardımcıları ---------------- */
    function alanlar() {
      return Array.prototype.slice.call(form.querySelectorAll('input,select,textarea'))
        .filter(function (el) { return el.name && !el.disabled && el.type !== 'hidden'; });
    }
    function etiketi(el, ad) {
      if (sema[ad] && sema[ad].etiket) return sema[ad].etiket;
      var lb = el.id ? form.querySelector('label[for="' + el.id + '"]') : null;
      if (!lb) { var k = el.closest('.gfield'); lb = k ? k.querySelector('label') : null; }
      return lb ? lb.textContent.replace('*', '').trim() : ad;
    }
    function degerAl(el) {
      if (el.type === 'checkbox') return el.checked;
      return (el.value == null ? '' : String(el.value)).trim();
    }

    /* ---------------- doğrulama ---------------- */
    function kuralMesaji(el, ad, veri) {
      var k = sema[ad] || {};
      var v = degerAl(el);
      var bosMu = (v === '' || v === false);

      var zorunlu = k.zorunlu != null ? k.zorunlu : el.required;
      if (zorunlu && bosMu) return 'Bu alan zorunludur.';
      if (bosMu) return '';

      var tur = k.tur || (el.type === 'email' ? 'eposta' : el.type === 'number' ? 'sayi'
                        : el.type === 'date' ? 'tarih' : 'metin');

      if (tur === 'eposta' && !EPOSTA.test(v)) return 'Geçerli bir e-posta adresi girin.';
      if (tur === 'telefon' && !TELEFON.test(v)) return 'Geçerli bir telefon numarası girin.';

      if (tur === 'sayi') {
        var n = Number(v);
        if (isNaN(n)) return 'Sayısal bir değer girin.';
        var alt = k.enAz != null ? k.enAz : (el.min !== '' && el.min != null ? Number(el.min) : null);
        var ust = k.enCok != null ? k.enCok : (el.max !== '' && el.max != null ? Number(el.max) : null);
        if (alt != null && n < alt) return 'En az ' + (GV.n ? GV.n(alt) : alt) + ' olmalıdır.';
        if (ust != null && n > ust) return 'En çok ' + (GV.n ? GV.n(ust) : ust) + ' olabilir.';
      } else if (tur === 'tarih') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Geçerli bir tarih seçin.';
        if (k.enAz && v < k.enAz) return (GV.d ? GV.d(k.enAz) : k.enAz) + ' tarihinden önce olamaz.';
        if (k.enCok && v > k.enCok) return (GV.d ? GV.d(k.enCok) : k.enCok) + ' tarihinden sonra olamaz.';
        if (k.sonra && veri[k.sonra] && v <= veri[k.sonra]) {
          return etiketi(form.querySelector('[name="' + k.sonra + '"]') || el, k.sonra) + ' tarihinden sonra olmalıdır.';
        }
        if (k.once && veri[k.once] && v >= veri[k.once]) {
          return etiketi(form.querySelector('[name="' + k.once + '"]') || el, k.once) + ' tarihinden önce olmalıdır.';
        }
      } else {
        var az = k.enAz != null ? k.enAz : (el.minLength > 0 ? el.minLength : null);
        var cok = k.enCok != null ? k.enCok : (el.maxLength > 0 ? el.maxLength : null);
        if (az != null && v.length < az) return 'En az ' + az + ' karakter girin.';
        if (cok != null && v.length > cok) return 'En çok ' + cok + ' karakter girilebilir.';
      }

      if (k.desen && !k.desen.test(v)) return k.mesaj || 'Bu alanın biçimi geçerli değil.';
      if (k.ozel) return k.ozel(v, veri) || '';
      return '';
    }

    function alanIsaretle(el, mesaj) {
      var kap = el.closest('.gfield');
      kap && kap.classList.toggle('is-err', !!mesaj);
      var hataEl = kap ? kap.querySelector('.gf-err') : null;
      /* Modal formlarda hata yuvası çoğu zaman yazılmamıştır; alan hatası
         "yerinde" görünsün diye yuva burada açılır (doküman §11). */
      if (!hataEl && kap && mesaj) {
        hataEl = kap.ownerDocument.createElement('span');
        hataEl.className = 'gf-err';
        hataEl.setAttribute('role', 'alert');
        kap.appendChild(hataEl);
      }
      if (hataEl) {
        hataEl.id = hataEl.id || (el.id ? el.id + '-hata' : (GV.yeniKod ? GV.yeniKod('err') : 'err'));
        hataEl.innerHTML = mesaj
          ? '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>' + esc(mesaj) : '';
        hataEl.style.display = mesaj ? 'flex' : '';
        if (mesaj) el.setAttribute('aria-describedby', hataEl.id);
        else if (el.getAttribute('aria-describedby') === hataEl.id) el.removeAttribute('aria-describedby');
      }
      el.setAttribute('aria-invalid', mesaj ? 'true' : 'false');
    }

    /** Tek alanı doğrular; @returns {boolean} */
    function alanDogrula(el) {
      if (!el || !el.name) return true;
      var mesaj = kuralMesaji(el, el.name, veri());
      alanIsaretle(el, mesaj);
      return !mesaj;
    }

    function ozetBas(hatalar) {
      if (!hatalar.length) { ozet.hidden = true; ozet.innerHTML = ''; return; }
      ozet.hidden = false;
      ozet.innerHTML = '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>'
        + '<span><b>' + hatalar.length + ' alanda düzeltme gerekiyor.</b>'
        + '<ul style="margin:8px 0 0;padding-left:18px">'
        + hatalar.map(function (h) {
            return '<li><a href="#' + esc(h.el.id || '') + '" data-gvf-alan="' + esc(h.ad) + '">'
              + esc(h.etiket) + '</a> — ' + esc(h.mesaj) + '</li>';
          }).join('')
        + '</ul></span>';
      ozet.querySelectorAll('[data-gvf-alan]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var el = form.querySelector('[name="' + a.getAttribute('data-gvf-alan') + '"]');
          if (el) { el.focus(); el.scrollIntoView({ block: 'center' }); }
        });
      });
    }

    /**
     * Bütün alanları doğrular. Doküman §11: submit öncesi TÜM alanlar
     * denetlenir; ilk hataya odaklanılır; özet ÜSTTE gösterilir.
     * @returns {{gecerli:boolean, hatalar:Array}}
     */
    function dogrula(sessiz) {
      var v = veri();
      var hatalar = [];
      alanlar().forEach(function (el) {
        var mesaj = kuralMesaji(el, el.name, v);
        alanIsaretle(el, mesaj);
        if (mesaj) hatalar.push({ ad: el.name, el: el, etiket: etiketi(el, el.name), mesaj: mesaj });
      });
      if (!sessiz) {
        ozetBas(hatalar);
        if (hatalar.length) {
          var ilk = hatalar[0].el;
          ilk.focus();
          if (ilk.scrollIntoView) ilk.scrollIntoView({ block: 'center' });
        }
      }
      return { gecerli: !hatalar.length, hatalar: hatalar };
    }

    /** Şema dışı (form ötesi) hatayı üstte gösterir — sistem hatası da buraya. */
    function sistemHatasi(mesaj) {
      ozet.hidden = false;
      ozet.innerHTML = '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>'
        + '<span><b>İşlem tamamlanamadı.</b> ' + esc(mesaj) + ' Düzeltip yeniden deneyebilirsiniz.</span>';
      ozet.focus();
    }

    /* ---------------- veri ---------------- */
    function veri() {
      var o = {};
      form.querySelectorAll('[name]').forEach(function (el) {
        if (el.type === 'checkbox') o[el.name] = el.checked;
        else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; }
        else o[el.name] = el.value;
      });
      return o;
    }
    function doldur(o) {
      Object.keys(o || {}).forEach(function (k) {
        var el = form.querySelector('[name="' + k + '"]');
        if (!el) return;
        if (el.type === 'checkbox') el.checked = !!o[k];
        else el.value = o[k] == null ? '' : o[k];
      });
    }

    /* ---------------- kirlilik + çıkış uyarısı ---------------- */
    function sonKayitYaz() {
      var hedef = form.querySelector('[data-son-kayit]') || document.querySelector('[data-son-kayit]');
      if (!hedef) return;
      hedef.textContent = sonKayitZamani
        ? 'Son kaydetme: ' + sonKayitZamani
        : (kirli ? 'Kaydedilmemiş değişiklikler var.' : 'Henüz kaydedilmedi.');
    }
    function kirliYap() { if (!kirli) { kirli = true; sonKayitYaz(); } }

    form.addEventListener('input', function (e) {
      kirliYap();
      if (e.target.closest('.gfield.is-err')) alanDogrula(e.target);
    });
    form.addEventListener('change', function (e) { kirliYap(); if (e.target.name) alanDogrula(e.target); });
    form.addEventListener('blur', function (e) {
      if (e.target.matches && e.target.matches('input,select,textarea') && e.target.name) alanDogrula(e.target);
    }, true);

    kok.addEventListener('beforeunload', function (e) {
      if (kirli && !secenek.uyariKapali) { e.preventDefault(); e.returnValue = ''; }
    });

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href$=".html"], a[href*=".html?"]');
      if (!a || !kirli || secenek.uyariKapali || gonderiliyor) return;
      e.preventDefault();
      kok.gvConfirm({
        baslik: 'Kaydedilmemiş değişiklikler var',
        metin: 'Sayfadan ayrılırsanız girdiğiniz bilgiler kaybolur. Devam etmek istiyor musunuz?',
        ton: 'warn', onayEtiket: 'Kaydetmeden çık', onayIkon: 'fa-arrow-right-from-bracket'
      }).then(function (s) { if (s.onay) { kirli = false; location.href = a.href; } });
    });

    /* ---------------- taslak ---------------- */
    /* Saat ClockService'ten gelir; testte sabitlenebilir (doküman §8). */
    function saatMetni() { return GV.saat.saatMetni(); }
    function taslakKaydet() {
      try {
        localStorage.setItem(taslakAnahtar, JSON.stringify({ zaman: GV.saat.zamanDamgasi(), veri: veri() }));
        kirli = false;
        sonKayitZamani = saatMetni() + ' (taslak)';
        sonKayitYaz();
        if (kok.gvToast) kok.gvToast('Taslak kaydedildi. Bu tarayıcıda saklanır.', { ton: 'ok' });
        return true;
      } catch (e) {
        if (kok.gvToast) kok.gvToast('Taslak kaydedilemedi (tarayıcı depolaması kapalı).', { ton: 'danger' });
        return false;
      }
    }
    function taslakYukle() {
      try {
        var t = JSON.parse(localStorage.getItem(taslakAnahtar) || 'null');
        if (t && t.veri) { doldur(t.veri); return t; }
      } catch (e) {}
      return null;
    }
    function taslakSil() { try { localStorage.removeItem(taslakAnahtar); } catch (e) {} }

    /* ---------------- gönderim ---------------- */
    function iptalEt() {
      var href = secenek.iptalHref || 'panel.html';
      var git = function () { kirli = false; location.href = GV.href ? GV.href(href) : href; };
      if (!kirli) return git();
      kok.gvConfirm({
        baslik: 'Formdan çıkılsın mı?', metin: 'Kaydedilmemiş değişiklikler silinecek.',
        ton: 'warn', onayEtiket: 'Çık', onayIkon: 'fa-xmark'
      }).then(function (s) { if (s.onay) git(); });
    }

    function gonder(btn, aksiyon) {
      /* Doküman §11: ikinci gönderim YOK. Kilit hem butonda hem burada. */
      if (gonderiliyor) return;

      var d = dogrula();
      if (!d.gecerli) return;

      var v = veri();
      if (secenek.gonderOncesi) {
        var engel = secenek.gonderOncesi(v, aksiyon);
        if (engel) { sistemHatasi(engel); return; }
      }

      /* Aynı deneme yeniden gönderilirse yeni kayıt AÇILMAZ. */
      if (!istekId) istekId = GV.istekKimligi ? GV.istekKimligi() : String(Math.random());
      gonderiliyor = true;
      var kilit = GV.kilit ? GV.kilit(btn, secenek.kilitMetni || 'Kaydediliyor…') : { coz: function () {} };

      var yardim = {
        istekId: istekId,
        aksiyon: aksiyon,
        taslakSil: taslakSil,
        kirliSifirla: function () { kirli = false; sonKayitYaz(); },
        hata: sistemHatasi
      };

      var calistir = function () { return secenek.gonder(v, yardim); };
      var p = GV.komut
        ? GV.komut(secenek.ad || ('Form:' + taslakAnahtar), v, calistir, { istekId: istekId })
        : Promise.resolve().then(calistir);

      p.then(function (r) {
        gonderiliyor = false;
        kilit.coz();
        istekId = null;                 /* başarıdan sonra yeni deneme yeni kimlik alır */
        kirli = false;
        sonKayitZamani = saatMetni();
        sonKayitYaz();
        ozet.hidden = true;
        return r;
      }).catch(function (e) {
        gonderiliyor = false;
        kilit.coz();
        /* istekId KORUNUR: aynı deneme tekrar gönderilirse mükerrer kayıt olmaz. */
        sistemHatasi((e && e.message) || 'Beklenmeyen bir hata oluştu.');
      });
    }

    form.querySelectorAll('[data-form-aksiyon]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        var a = b.getAttribute('data-form-aksiyon');
        if (a === 'taslak') return taslakKaydet();
        if (a === 'iptal') return iptalEt();
        gonder(b, a);
      });
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    var mevcutTaslak = secenek.taslakYukle !== false ? taslakYukle() : null;
    if (mevcutTaslak && secenek.taslakBulundu) secenek.taslakBulundu(mevcutTaslak);
    sonKayitYaz();

    return {
      form: form,
      dogrula: dogrula,
      alanDogrula: alanDogrula,
      veri: veri,
      doldur: doldur,
      taslakKaydet: taslakKaydet,
      taslakSil: taslakSil,
      kirliMi: function () { return kirli; },
      kirliSifirla: function () { kirli = false; sonKayitYaz(); },
      gonderiliyorMu: function () { return gonderiliyor; },
      sistemHatasi: sistemHatasi,
      ozetKabi: ozet,
      sema: sema
    };
  };

  /* ===================================================================
     gvModalForm — MODAL İÇİ FORM STANDARDI

     Sayfa formlarıyla AYNI sözleşme: şema doğrulaması, submit öncesi tüm
     alanlar, ilk hataya odak, modalın en üstünde hata özeti, gönderim
     kilidi ve idempotency. Modal alanları `name` yerine `id` taşıdığı
     için şema anahtarı ALAN ID'sidir.

     gvModalForm({
       baslik, ikon, genislik, metin, govde,
       sema: { alanId: {…} },
       ad: 'CreateX',
       onayEtiket, onayIkon, onaySinif,
       acildi(kap), gonderOncesi(veri, kap) → '' | 'hata metni',
       gonder(veri, yardim) → Promise      // yardim: {istekId, kap, kapat}
     })
     =================================================================== */
  kok.gvModalForm = function (secenek) {
    secenek = secenek || {};
    var sema = secenek.sema || {};
    var ozetId = GV.yeniKod ? GV.yeniKod('mfozet') : 'mfozet';
    var istekId = null;
    var gonderiliyor = false;

    var govde = '<div class="gv-note danger" id="' + ozetId + '" role="alert" tabindex="-1" '
      + 'hidden style="margin-bottom:14px"></div>' + (secenek.govde || '');

    function alanEl(kap, ad) {
      return kap.querySelector('#' + ad) || kap.querySelector('[name="' + ad + '"]');
    }
    function etiketi(kap, ad) {
      if (sema[ad] && sema[ad].etiket) return sema[ad].etiket;
      var lb = kap.querySelector('label[for="' + ad + '"]');
      return lb ? lb.textContent.replace('*', '').trim() : ad;
    }
    function veriTopla(kap) {
      var o = {};
      Object.keys(sema).forEach(function (ad) {
        var el = alanEl(kap, ad);
        if (!el) return;
        o[ad] = el.type === 'checkbox' ? el.checked : String(el.value == null ? '' : el.value).trim();
      });
      return o;
    }

    function isaretle(kap, el, mesaj) {
      var alan = el.closest('.gfield');
      if (alan) {
        alan.classList.toggle('is-err', !!mesaj);
        var h = alan.querySelector('.gf-err');
        if (!h && mesaj) {
          h = kap.ownerDocument.createElement('span');
          h.className = 'gf-err';
          h.setAttribute('role', 'alert');
          alan.appendChild(h);
        }
        if (h) {
          h.id = h.id || (el.id ? el.id + '-hata' : ozetId + '-h');
          h.innerHTML = mesaj
            ? '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>' + esc(mesaj) : '';
          h.style.display = mesaj ? 'flex' : '';
          if (mesaj) el.setAttribute('aria-describedby', h.id);
        }
      }
      el.setAttribute('aria-invalid', mesaj ? 'true' : 'false');
    }

    /* Alan kuralları sayfa formuyla aynı motordan geçsin diye geçici bir
       denetleyici kurulur; kural mantığı ikinci kez yazılmaz. */
    function kuralUygula(kap, ad, veri) {
      var el = alanEl(kap, ad);
      if (!el) return '';
      var k = sema[ad] || {};
      var v = el.type === 'checkbox' ? el.checked : String(el.value == null ? '' : el.value).trim();
      var bos = (v === '' || v === false);
      if ((k.zorunlu != null ? k.zorunlu : el.required) && bos) return 'Bu alan zorunludur.';
      if (bos) return '';
      var tur = k.tur || (el.type === 'email' ? 'eposta' : el.type === 'number' ? 'sayi'
                        : el.type === 'date' ? 'tarih' : 'metin');
      if (tur === 'eposta' && !EPOSTA.test(v)) return 'Geçerli bir e-posta adresi girin.';
      if (tur === 'telefon' && !TELEFON.test(v)) return 'Geçerli bir telefon numarası girin.';
      if (tur === 'sayi') {
        var n = Number(v);
        if (isNaN(n)) return 'Sayısal bir değer girin.';
        var alt = k.enAz != null ? k.enAz : (el.min !== '' && el.min != null ? Number(el.min) : null);
        var ust = k.enCok != null ? k.enCok : (el.max !== '' && el.max != null ? Number(el.max) : null);
        if (alt != null && n < alt) return 'En az ' + (GV.n ? GV.n(alt) : alt) + ' olmalıdır.';
        if (ust != null && n > ust) return 'En çok ' + (GV.n ? GV.n(ust) : ust) + ' olabilir.';
      } else if (tur === 'tarih') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Geçerli bir tarih seçin.';
        if (k.enAz && v < k.enAz) return (GV.d ? GV.d(k.enAz) : k.enAz) + ' tarihinden önce olamaz.';
        if (k.enCok && v > k.enCok) return (GV.d ? GV.d(k.enCok) : k.enCok) + ' tarihinden sonra olamaz.';
        if (k.sonra && veri[k.sonra] && v <= veri[k.sonra]) {
          return etiketi(kap, k.sonra) + ' tarihinden sonra olmalıdır.';
        }
        if (k.once && veri[k.once] && v >= veri[k.once]) {
          return etiketi(kap, k.once) + ' tarihinden önce olmalıdır.';
        }
      } else {
        if (k.enAz != null && v.length < k.enAz) return 'En az ' + k.enAz + ' karakter girin.';
        if (k.enCok != null && v.length > k.enCok) return 'En çok ' + k.enCok + ' karakter girilebilir.';
      }
      if (k.desen && !k.desen.test(v)) return k.mesaj || 'Bu alanın biçimi geçerli değil.';
      if (k.ozel) return k.ozel(v, veri) || '';
      return '';
    }

    function ozetKabi(kap) { return kap.querySelector('#' + ozetId); }

    function ozetBas(kap, hatalar) {
      var o = ozetKabi(kap);
      if (!o) return;
      if (!hatalar.length) { o.hidden = true; o.innerHTML = ''; return; }
      o.hidden = false;
      o.innerHTML = '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>'
        + '<span><b>' + hatalar.length + ' alanda düzeltme gerekiyor.</b>'
        + '<ul style="margin:6px 0 0;padding-left:18px">'
        + hatalar.map(function (h) { return '<li>' + esc(h.etiket) + ' — ' + esc(h.mesaj) + '</li>'; }).join('')
        + '</ul></span>';
    }

    function sistemHatasi(kap, mesaj) {
      var o = ozetKabi(kap);
      if (!o) return;
      o.hidden = false;
      o.innerHTML = '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>'
        + '<span><b>İşlem tamamlanamadı.</b> ' + esc(mesaj) + ' Düzeltip yeniden deneyebilirsiniz.</span>';
      o.focus();
    }

    function dogrula(kap) {
      var veri = veriTopla(kap);
      var hatalar = [];
      Object.keys(sema).forEach(function (ad) {
        var el = alanEl(kap, ad);
        if (!el) return;
        var mesaj = kuralUygula(kap, ad, veri);
        isaretle(kap, el, mesaj);
        if (mesaj) hatalar.push({ ad: ad, el: el, etiket: etiketi(kap, ad), mesaj: mesaj });
      });
      ozetBas(kap, hatalar);
      if (hatalar.length) {
        hatalar[0].el.focus();
        if (hatalar[0].el.scrollIntoView) hatalar[0].el.scrollIntoView({ block: 'center' });
      }
      return { gecerli: !hatalar.length, hatalar: hatalar, veri: veri };
    }

    var butonlar = [{ etiket: secenek.iptalEtiket || 'Vazgeç', sinif: 'btn-ghost' }];
    (secenek.ekButonlar || []).forEach(function (b) { butonlar.push(b); });
    butonlar.push({
      etiket: secenek.onayEtiket || 'Kaydet',
      sinif: secenek.onaySinif || 'btn-acc',
      ikon: secenek.onayIkon || 'fa-check',
      kapat: false,
      tikla: function (kap, kapat) {
        if (gonderiliyor) return false;
        var d = dogrula(kap);
        if (!d.gecerli) return false;
        if (secenek.gonderOncesi) {
          var engel = secenek.gonderOncesi(d.veri, kap);
          if (engel) { sistemHatasi(kap, engel); return false; }
        }
        if (!istekId) istekId = GV.istekKimligi ? GV.istekKimligi() : String(Math.random());
        gonderiliyor = true;
        var btn = kap.querySelector('.gv-modal-acts button:last-child');
        var kilit = GV.kilit ? GV.kilit(btn, secenek.kilitMetni || 'Kaydediliyor…') : { coz: function () {} };
        var yardim = { istekId: istekId, kap: kap, kapat: kapat };
        var calistir = function () { return secenek.gonder(d.veri, yardim); };
        var p = GV.komut
          ? GV.komut(secenek.ad || ('ModalForm:' + (secenek.baslik || '')), d.veri, calistir, { istekId: istekId })
          : Promise.resolve().then(calistir);
        p.then(function () {
          gonderiliyor = false; kilit.coz(); istekId = null;
          if (secenek.kapanmasin !== true) kapat(true);
        }).catch(function (e) {
          gonderiliyor = false; kilit.coz();
          sistemHatasi(kap, (e && e.message) || 'Beklenmeyen bir hata oluştu.');
        });
        return false;
      }
    });

    return kok.gvModal({
      baslik: secenek.baslik, ikon: secenek.ikon, ton: secenek.ton,
      genislik: secenek.genislik, metin: secenek.metin,
      govde: govde,
      disKapat: secenek.disKapat,
      butonlar: butonlar,
      acildi: function (kap, kapat) {
        /* Alan düzeltildiğinde hata anında temizlensin. */
        Object.keys(sema).forEach(function (ad) {
          var el = alanEl(kap, ad);
          if (!el) return;
          var tazele = function () {
            if (!el.closest('.gfield') || !el.closest('.gfield').classList.contains('is-err')) return;
            isaretle(kap, el, kuralUygula(kap, ad, veriTopla(kap)));
          };
          el.addEventListener('input', tazele);
          el.addEventListener('change', tazele);
        });
        if (secenek.acildi) secenek.acildi(kap, kapat);
      },
      kapandi: secenek.kapandi
    });
  };

  /* Node tarafında birim test edilebilmesi için (tarayıcıda etkisiz). */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gvFormController: kok.gvFormController, gvModalForm: kok.gvModalForm };
  }
})();
