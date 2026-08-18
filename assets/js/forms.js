/* =====================================================================
   GAVIA — FORM MOTORU
   Doğrulama · dinamik satırlar · ara toplam hesaplama · taslak kaydetme ·
   kaydedilmemiş değişiklik uyarısı · imza alanı.
   Global API: gvForm · gvLineRows · gvSignature
   ===================================================================== */
(function () {
  'use strict';
  var GV = window.GV || (window.GV = {});
  function esc(s) { return GV.esc ? GV.esc(s) : String(s == null ? '' : s); }

  /* ---------------------------------------------------------------
     gvForm — doğrulama + kirlilik takibi + taslak
     --------------------------------------------------------------- */
  window.gvForm = function (secenek) {
    var form = typeof secenek.form === 'string' ? document.querySelector(secenek.form) : secenek.form;
    if (!form) return null;
    var kirli = false;
    var taslakAnahtar = 'gv_tk_taslak_' + (secenek.anahtar || location.pathname.split('/').pop());

    /* ---- doğrulama ---- */
    function alanDogrula(el) {
      var kap = el.closest('.gfield');
      if (!kap) return true;
      var hataEl = kap.querySelector('.gf-err');
      var mesaj = '';
      var v = (el.value || '').trim();

      if (el.required && !v) mesaj = 'Bu alan zorunludur.';
      else if (v && el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) mesaj = 'Geçerli bir e-posta adresi girin.';
      else if (v && el.type === 'number') {
        var n = Number(v);
        if (isNaN(n)) mesaj = 'Sayısal bir değer girin.';
        else if (el.min !== '' && el.min != null && n < Number(el.min)) mesaj = 'En az ' + GV.n(el.min) + ' olmalıdır.';
        else if (el.max !== '' && el.max != null && n > Number(el.max)) mesaj = 'En çok ' + GV.n(el.max) + ' olabilir.';
      }
      else if (v && el.getAttribute('data-tel') != null && !/^[0-9 ()+-]{7,}$/.test(v)) mesaj = 'Geçerli bir telefon numarası girin.';
      else if (v && el.minLength > 0 && v.length < el.minLength) mesaj = 'En az ' + el.minLength + ' karakter girin.';

      if (!mesaj && el.getAttribute('data-dogrula') && secenek.ozelDogrula) {
        mesaj = secenek.ozelDogrula(el.getAttribute('data-dogrula'), v, form) || '';
      }

      kap.classList.toggle('is-err', !!mesaj);
      if (hataEl) {
        hataEl.innerHTML = mesaj ? '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>' + esc(mesaj) : '';
        hataEl.style.display = mesaj ? 'flex' : '';
      }
      el.setAttribute('aria-invalid', mesaj ? 'true' : 'false');
      return !mesaj;
    }

    function dogrula() {
      var alanlar = form.querySelectorAll('input,select,textarea');
      var gecerli = true, ilkHata = null;
      for (var i = 0; i < alanlar.length; i++) {
        if (alanlar[i].disabled || alanlar[i].type === 'hidden') continue;
        if (!alanDogrula(alanlar[i])) { gecerli = false; if (!ilkHata) ilkHata = alanlar[i]; }
      }
      if (!gecerli && ilkHata) {
        ilkHata.focus();
        ilkHata.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (window.gvToast) gvToast('Form eksik veya hatalı. İşaretli alanları düzeltin.', { ton: 'danger' });
      }
      return gecerli;
    }

    /* ---- veri toplama ---- */
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
        else el.value = o[k];
      });
    }

    /* ---- kirlilik + ayrılma uyarısı ---- */
    form.addEventListener('input', function (e) {
      kirli = true;
      if (e.target.closest('.gfield.is-err')) alanDogrula(e.target);
    });
    form.addEventListener('change', function () { kirli = true; });
    form.addEventListener('blur', function (e) {
      if (e.target.matches('input,select,textarea') && e.target.value) alanDogrula(e.target);
    }, true);

    window.addEventListener('beforeunload', function (e) {
      if (kirli && !secenek.uyariKapali) { e.preventDefault(); e.returnValue = ''; }
    });

    /* form içi bağlantılara tıklamada uyarı */
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href$=".html"], a[href*=".html?"]');
      if (!a || !kirli || secenek.uyariKapali) return;
      e.preventDefault();
      gvConfirm({
        baslik: 'Kaydedilmemiş değişiklikler var',
        metin: 'Sayfadan ayrılırsanız girdiğiniz bilgiler kaybolur. Devam etmek istiyor musunuz?',
        ton: 'warn',
        onayEtiket: 'Kaydetmeden çık',
        onayIkon: 'fa-arrow-right-from-bracket'
      }).then(function (s) {
        if (s.onay) { kirli = false; location.href = a.href; }
      });
    });

    /* ---- taslak ---- */
    function taslakKaydet() {
      try {
        localStorage.setItem(taslakAnahtar, JSON.stringify({ zaman: GV.saat.zamanDamgasi(), veri: veri() }));
        kirli = false;
        if (window.gvToast) gvToast('Taslak kaydedildi. Bu tarayıcıda saklanır.', { ton: 'ok' });
        return true;
      } catch (e) {
        if (window.gvToast) gvToast('Taslak kaydedilemedi (tarayıcı depolaması kapalı).', { ton: 'danger' });
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

    /* ---- düğme bağlama ---- */
    form.querySelectorAll('[data-form-aksiyon]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        var a = b.getAttribute('data-form-aksiyon');
        if (a === 'taslak') { taslakKaydet(); return; }
        if (a === 'iptal') {
          if (!kirli) { location.href = GV.href ? GV.href(secenek.iptalHref || 'panel.html') : (secenek.iptalHref || 'panel.html'); return; }
          gvConfirm({
            baslik: 'Formdan çıkılsın mı?',
            metin: 'Kaydedilmemiş değişiklikler silinecek.',
            ton: 'warn', onayEtiket: 'Çık', onayIkon: 'fa-xmark'
          }).then(function (s) {
            if (s.onay) { kirli = false; location.href = GV.href ? GV.href(secenek.iptalHref || 'panel.html') : (secenek.iptalHref || 'panel.html'); }
          });
          return;
        }
        if (!dogrula()) return;
        if (secenek.gonder) secenek.gonder(veri(), a, { taslakSil: taslakSil, kirliSifirla: function () { kirli = false; } });
      });
    });

    var mevcutTaslak = secenek.taslakYukle !== false ? taslakYukle() : null;
    if (mevcutTaslak && secenek.taslakBulundu) secenek.taslakBulundu(mevcutTaslak);

    return {
      dogrula: dogrula, veri: veri, doldur: doldur,
      taslakKaydet: taslakKaydet, taslakSil: taslakSil,
      kirliMi: function () { return kirli; },
      kirliSifirla: function () { kirli = false; },
      alanDogrula: alanDogrula
    };
  };

  /* ---------------------------------------------------------------
     gvLineRows — dinamik hizmet satırları + ara toplam
     Müşteri satış fiyatı ile taşeron maliyeti AYRI kolonlardır.
     --------------------------------------------------------------- */
  window.gvLineRows = function (secenek) {
    var kap = typeof secenek.hedef === 'string' ? document.querySelector(secenek.hedef) : secenek.hedef;
    if (!kap) return null;
    var satirlar = (secenek.baslangic || []).slice();
    var hizmetler = secenek.hizmetler || [];

    function hizmetSecenekleri(secili) {
      return '<option value="">Hizmet seçin…</option>' + hizmetler.map(function (h) {
        return '<option value="' + esc(h.id) + '"' + (h.id === secili ? ' selected' : '') + '>' + esc(h.poz + ' · ' + h.ad) + '</option>';
      }).join('');
    }

    function ciz() {
      var h = '<div class="linerow-wrap">'
        + '<div class="linerow-head" aria-hidden="true">'
        + '<span>Hizmet Pozisyonu</span><span>Miktar</span><span>Birim</span>'
        + '<span style="text-align:right">Satış Fiyatı</span><span style="text-align:right">Taşeron Maliyeti</span>'
        + '<span style="text-align:right">Tutar</span><span></span></div>';
      satirlar.forEach(function (s, i) {
        var hz = hizmetler.filter(function (x) { return x.id === s.hizmetId; })[0];
        h += '<div class="linerow" data-i="' + i + '">'
          + '<div class="lr-wide"><label class="gv-sr" for="lr_h_' + i + '">Hizmet pozisyonu ' + (i + 1) + '</label>'
          + '<select id="lr_h_' + i + '" data-alan="hizmetId">' + hizmetSecenekleri(s.hizmetId) + '</select></div>'
          + '<div><label class="gv-sr" for="lr_m_' + i + '">Miktar ' + (i + 1) + '</label>'
          + '<input id="lr_m_' + i + '" type="number" min="0" step="1" data-alan="miktar" value="' + esc(s.miktar || '') + '"></div>'
          + '<div><span style="font-size:12px;color:var(--muted);font-weight:600">' + esc(hz ? birimAdi(hz.birim) : '—') + '</span></div>'
          + '<div><label class="gv-sr" for="lr_s_' + i + '">Satış fiyatı ' + (i + 1) + '</label>'
          + '<input id="lr_s_' + i + '" type="number" min="0" step="1" data-alan="satis" value="' + esc(s.satis || '') + '"></div>'
          + '<div><label class="gv-sr" for="lr_t_' + i + '">Taşeron maliyeti ' + (i + 1) + '</label>'
          + '<input id="lr_t_' + i + '" type="number" min="0" step="1" data-alan="maliyet" value="' + esc(s.maliyet || '') + '"></div>'
          + '<div class="lr-calc">'
          + GV.paraBicim(GV.kurus.carp(GV.kurus.al(s.satis || 0), s.miktar || 0)) + '</div>'
          + '<div><button class="ia-btn danger" type="button" data-sil="' + i + '" aria-label="' + (i + 1) + '. satırı kaldır">'
          + '<i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></div></div>';
      });
      if (!satirlar.length) {
        h += '<div style="padding:26px;text-align:center;color:var(--muted);font-size:13px">'
          + 'Henüz hizmet satırı eklenmedi. “Satır Ekle” ile başlayın.</div>';
      }
      h += '<div class="linerow-foot"><button class="btn btn-sm btn-ghost" type="button" data-ekle>'
        + '<i class="fa-solid fa-plus" aria-hidden="true"></i>Satır Ekle</button></div></div>';
      kap.innerHTML = h;

      kap.querySelector('[data-ekle]').addEventListener('click', function () {
        satirlar.push({ hizmetId: '', miktar: 1, satis: 0, maliyet: 0 });
        ciz(); hesapla();
      });
      kap.querySelectorAll('[data-sil]').forEach(function (b) {
        b.addEventListener('click', function () {
          satirlar.splice(Number(b.getAttribute('data-sil')), 1);
          ciz(); hesapla();
        });
      });
      kap.querySelectorAll('.linerow [data-alan]').forEach(function (el) {
        el.addEventListener('input', function () { guncelle(el); });
        el.addEventListener('change', function () { guncelle(el); });
      });
    }

    function guncelle(el) {
      var i = Number(el.closest('.linerow').getAttribute('data-i'));
      var alan = el.getAttribute('data-alan');
      satirlar[i][alan] = alan === 'hizmetId' ? el.value : Number(el.value || 0);
      if (alan === 'hizmetId' && secenek.fiyatBul) {
        var f = secenek.fiyatBul(el.value);
        if (f) { satirlar[i].satis = f.satis; satirlar[i].maliyet = f.maliyet; }
        ciz();
      } else {
        var hucre = el.closest('.linerow').querySelector('.lr-calc');
        if (hucre) hucre.textContent = GV.paraBicim(
          GV.kurus.carp(GV.kurus.al(satirlar[i].satis || 0), satirlar[i].miktar || 0));
      }
      hesapla();
    }

    function birimAdi(b) {
      var m = { adet: 'adet', lokasyon: 'lokasyon', sistem: 'sistem', metrekare: 'm²', gun: 'gün', 'olcum-seti': 'ölçüm seti', dokuman: 'doküman' };
      return m[b] || b || '—';
    }

    /* Doküman §8: para hesabı KURUŞ tamsayısı üzerinden yapılır; KDV ve
       kâr tek yuvarlama ile üretilir, float zinciri oluşmaz. */
    function toplamlar() {
      var K = GV.kurus;
      var satisK = 0, maliyetK = 0;
      satirlar.forEach(function (s) {
        satisK = K.topla(satisK, K.carp(K.al(s.satis || 0), s.miktar || 0));
        maliyetK = K.topla(maliyetK, K.carp(K.al(s.maliyet || 0), s.miktar || 0));
      });
      var ekGiderK = K.al(secenek.ekGider ? secenek.ekGider() : 0);
      var kdvOran = secenek.kdvOran != null ? secenek.kdvOran : 0.20;
      var kdvK = K.oran(satisK, kdvOran);
      var karK = K.cikar(K.cikar(satisK, maliyetK), ekGiderK);
      return {
        satisKurus: satisK, maliyetKurus: maliyetK, kdvKurus: kdvK, karKurus: karK,
        paraBirimi: GV.PARA_VARSAYILAN,
        satis: K.tl(satisK), maliyet: K.tl(maliyetK), ekGider: K.tl(ekGiderK),
        kdv: K.tl(kdvK),
        genelToplam: K.tl(K.topla(satisK, kdvK)),
        kar: K.tl(karK),
        karOran: satisK ? karK / satisK : 0,
        satirSayisi: satirlar.length
      };
    }

    function hesapla() {
      var t = toplamlar();
      var ozet = document.querySelector(secenek.ozetHedef || '#gvLineSum');
      if (ozet) {
        ozet.innerHTML = '<div class="sum-list">'
          + '<div class="sum-row"><span>Satır sayısı</span><b>' + GV.n(t.satirSayisi) + '</b></div>'
          + '<div class="sum-row"><span>Müşteri satış tutarı</span><b>' + GV.tl(t.satis) + '</b></div>'
          + '<div class="sum-row cost"><span>Taşeron maliyeti</span><b>' + GV.tl(t.maliyet) + '</b></div>'
          + '<div class="sum-row cost"><span>Ek giderler</span><b>' + GV.tl(t.ekGider) + '</b></div>'
          + '<div class="sum-row profit"><span>Brüt kâr</span><b>' + GV.tl(t.kar) + ' · ' + GV.pct(t.karOran) + '</b></div>'
          + '<div class="sum-row"><span>KDV (%20)</span><b>' + GV.tl(t.kdv) + '</b></div>'
          + '<div class="sum-row total"><span>Genel toplam</span><b>' + GV.tl(t.genelToplam) + '</b></div>'
          + '</div>';
      }
      if (secenek.degisti) secenek.degisti(satirlar, t);
    }

    ciz(); hesapla();
    return { satirlar: function () { return satirlar; }, toplamlar: toplamlar, ciz: ciz, hesapla: hesapla };
  };

  /* ---------------------------------------------------------------
     gvSignature — dijital imza alanı (dokunmatik + fare)
     --------------------------------------------------------------- */
  window.gvSignature = function (hedef, secenek) {
    var kap = typeof hedef === 'string' ? document.querySelector(hedef) : hedef;
    if (!kap) return null;
    secenek = secenek || {};
    kap.innerHTML = '<div class="fw-sign"><canvas></canvas><span class="fw-sign-hint">'
      + esc(secenek.ipucu || 'İmzalamak için bu alana dokunun') + '</span></div>'
      + '<div style="display:flex;gap:8px;margin-top:10px">'
      + '<button class="btn btn-sm btn-ghost" type="button" data-temizle><i class="fa-solid fa-eraser" aria-hidden="true"></i>Temizle</button></div>';
    var alan = kap.querySelector('.fw-sign');
    var cv = kap.querySelector('canvas');
    var ipucu = kap.querySelector('.fw-sign-hint');
    var ctx = cv.getContext('2d');
    var ciziliyor = false, doluMu = false;

    function boyutla() {
      var r = alan.getBoundingClientRect();
      var oran = window.devicePixelRatio || 1;
      cv.width = r.width * oran; cv.height = r.height * oran;
      ctx.scale(oran, oran);
      ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#111528';
    }
    setTimeout(boyutla, 0);
    window.addEventListener('resize', function () { var v = doluMu; boyutla(); doluMu = v; });

    function konum(e) {
      var r = cv.getBoundingClientRect();
      return { x: (e.clientX || 0) - r.left, y: (e.clientY || 0) - r.top };
    }
    cv.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      ciziliyor = true; doluMu = true;
      if (ipucu) ipucu.style.display = 'none';
      var p = konum(e);
      ctx.beginPath(); ctx.moveTo(p.x, p.y);
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    });
    cv.addEventListener('pointermove', function (e) {
      if (!ciziliyor) return;
      e.preventDefault();
      var p = konum(e);
      ctx.lineTo(p.x, p.y); ctx.stroke();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
      cv.addEventListener(t, function () { if (ciziliyor && secenek.degisti) secenek.degisti(doluMu); ciziliyor = false; });
    });
    kap.querySelector('[data-temizle]').addEventListener('click', function () {
      ctx.clearRect(0, 0, cv.width, cv.height);
      doluMu = false;
      if (ipucu) ipucu.style.display = '';
      if (secenek.degisti) secenek.degisti(false);
    });

    return { doluMu: function () { return doluMu; } };
  };
})();
