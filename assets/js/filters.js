/* =====================================================================
   GAVIA — FİLTRE MOTORU
   Arama · durum çipleri · gelişmiş filtre çekmecesi · aktif filtre çipleri ·
   kolon seçimi · arşiv görünürlüğü · sıralama.
   Global API: gvFilter (tek giriş noktası) · gvCols
   ===================================================================== */
(function () {
  'use strict';
  var GV = window.GV || (window.GV = {});
  function esc(s) { return GV.esc ? GV.esc(s) : String(s == null ? '' : s); }

  /* ---------------------------------------------------------------
     gvFilter — liste sayfalarının tek filtre yöneticisi
     secenek = {
       veri()      : kaynak diziyi döndürür
       arama       : ['ad','kod']            arama yapılacak alanlar
       cipler      : { alan:'operasyonDurum', secenekler:[{k,ad,ton,ikon}] }
       alanlar     : [{ k, ad, tur:'secim|coklu|aralik|tarih|toggle', secenekler:[{deger,ad}] }]
       degisti(sonuc)
     }
     --------------------------------------------------------------- */
  window.gvFilter = function (secenek) {
    var durum = { arama: '', cip: 'tumu', gelismis: {}, arsiv: false, sirala: null, siraYon: 'asc' };
    var alanlar = secenek.alanlar || [];

    /* ---- URL'den durum okuma (paylaşılabilir liste bağlantıları) ---- */
    (function urldenOku() {
      var u = new URLSearchParams(location.search);
      if (u.get('q')) durum.arama = u.get('q');
      if (u.get('durum')) durum.cip = u.get('durum');
      alanlar.forEach(function (a) {
        var v = u.get('f_' + a.k);
        if (v) durum.gelismis[a.k] = a.tur === 'coklu' ? v.split(',') : v;
      });
    })();

    function urlYaz() {
      if (!GV.qYaz) return;
      GV.qYaz('q', durum.arama || null);
      GV.qYaz('durum', durum.cip !== 'tumu' ? durum.cip : null);
      alanlar.forEach(function (a) {
        var v = durum.gelismis[a.k];
        GV.qYaz('f_' + a.k, v && v.length ? (Array.isArray(v) ? v.join(',') : v) : null);
      });
    }

    /* ---- süzme ---- */
    function suz() {
      var veri = secenek.veri() || [];
      var q = durum.arama.toLocaleLowerCase('tr-TR').trim();

      return veri.filter(function (k) {
        /* arşiv */
        if (!durum.arsiv && secenek.arsivAlani && k[secenek.arsivAlani]) return false;

        /* serbest arama */
        if (q) {
          var bulundu = (secenek.arama || []).some(function (alan) {
            var v = k[alan];
            return v != null && String(v).toLocaleLowerCase('tr-TR').indexOf(q) !== -1;
          });
          if (!bulundu) return false;
        }

        /* hızlı durum çipi */
        if (durum.cip !== 'tumu' && secenek.cipler) {
          if (secenek.cipler.suz) { if (!secenek.cipler.suz(k, durum.cip)) return false; }
          else if (k[secenek.cipler.alan] !== durum.cip) return false;
        }

        /* gelişmiş alanlar */
        for (var i = 0; i < alanlar.length; i++) {
          var a = alanlar[i], v = durum.gelismis[a.k];
          if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue;
          if (a.suz) { if (!a.suz(k, v)) return false; continue; }
          if (a.tur === 'coklu') { if (v.indexOf(String(k[a.k])) === -1) return false; }
          else if (a.tur === 'aralik') {
            var sayi = Number(k[a.k]);
            if (v.min !== '' && v.min != null && sayi < Number(v.min)) return false;
            if (v.max !== '' && v.max != null && sayi > Number(v.max)) return false;
          } else if (a.tur === 'tarih') {
            var t = k[a.k];
            if (!t) return false;
            if (v.bas && t < v.bas) return false;
            if (v.son && t > v.son) return false;
          } else if (a.tur === 'toggle') {
            if (v === 'evet' && !k[a.k]) return false;
            if (v === 'hayir' && k[a.k]) return false;
          } else {
            if (String(k[a.k]) !== String(v)) return false;
          }
        }
        return true;
      }).sort(function (x, y) {
        if (!durum.sirala) return 0;
        var a = x[durum.sirala], b = y[durum.sirala];
        if (a == null) return 1;
        if (b == null) return -1;
        var s = typeof a === 'number' ? a - b : String(a).localeCompare(String(b), 'tr');
        return durum.siraYon === 'desc' ? -s : s;
      });
    }

    /** Aktif gelişmiş filtre sayısı. Kaynak verilmezse yürürlükteki durum. */
    function aktifSayi(kaynak) {
      var g = kaynak || durum.gelismis;
      var n = 0;
      alanlar.forEach(function (a) {
        var v = g[a.k];
        if (v == null || v === '') return;
        if (Array.isArray(v)) { if (v.length) n++; return; }
        if (typeof v === 'object') {
          if ((v.min != null && v.min !== '') || (v.max != null && v.max !== '') || v.bas || v.son) n++;
          return;
        }
        n++;
      });
      return n;
    }

    /* ---- aktif filtre çipleri satırı ---- */
    function aktifCipleriCiz() {
      var kap = document.querySelector(secenek.aktifCipHedef || '#gvAchips');
      if (!kap) return;
      var cipler = [];
      alanlar.forEach(function (a) {
        var v = durum.gelismis[a.k];
        if (v == null || v === '' || (Array.isArray(v) && !v.length)) return;
        var metin;
        if (Array.isArray(v)) {
          metin = v.map(function (x) {
            var s = (a.secenekler || []).filter(function (o) { return String(o.deger) === String(x); })[0];
            return s ? s.ad : x;
          }).join(', ');
        } else if (typeof v === 'object') {
          if (v.bas || v.son) metin = (v.bas ? GV.d(v.bas) : '…') + ' – ' + (v.son ? GV.d(v.son) : '…');
          else metin = (v.min !== '' && v.min != null ? GV.n(v.min) : '…') + ' – ' + (v.max !== '' && v.max != null ? GV.n(v.max) : '…');
        } else {
          var s2 = (a.secenekler || []).filter(function (o) { return String(o.deger) === String(v); })[0];
          metin = s2 ? s2.ad : v;
        }
        cipler.push('<span class="gv-achip"><b>' + esc(a.ad) + ':</b> ' + esc(metin)
          + '<button class="ac-x" type="button" data-kaldir="' + esc(a.k) + '" aria-label="' + esc(a.ad) + ' filtresini kaldır">'
          + '<i class="fa-solid fa-xmark" aria-hidden="true"></i></button></span>');
      });
      if (durum.arama) {
        cipler.push('<span class="gv-achip"><b>Arama:</b> ' + esc(durum.arama)
          + '<button class="ac-x" type="button" data-kaldir="__arama" aria-label="Aramayı temizle"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></span>');
      }
      kap.hidden = !cipler.length;
      if (!cipler.length) return;
      kap.innerHTML = '<div class="gv-achips">' + cipler.join('') + '</div>'
        + '<div class="gv-achips-acts"><button class="btn btn-sm btn-ghost" type="button" id="gvAchipTemizle">'
        + '<i class="fa-solid fa-eraser" aria-hidden="true"></i>Tümünü temizle</button></div>';
      kap.querySelectorAll('[data-kaldir]').forEach(function (b) {
        b.addEventListener('click', function () {
          var k = b.getAttribute('data-kaldir');
          if (k === '__arama') { durum.arama = ''; var ai = document.querySelector(secenek.aramaHedef || '#gvSearch'); if (ai) ai.value = ''; }
          else delete durum.gelismis[k];
          uygula();
        });
      });
      var tmz = kap.querySelector('#gvAchipTemizle');
      if (tmz) tmz.addEventListener('click', function () { temizle(); });
    }

    /* ---- çekmece ---- */
    function cekmeceAc() {
      var alanHtml = alanlar.map(function (a) {
        var v = durum.gelismis[a.k];
        if (a.tur === 'coklu') {
          return '<div class="gfield"><label>' + esc(a.ad) + '</label><div class="chips" data-coklu="' + esc(a.k) + '">'
            + (a.secenekler || []).map(function (o) {
                var secili = Array.isArray(v) && v.indexOf(String(o.deger)) !== -1;
                return '<button type="button" class="chip' + (secili ? ' is-on' : '') + '" data-deger="' + esc(o.deger) + '" aria-pressed="' + (secili ? 'true' : 'false') + '">'
                  + (o.ikon ? '<i class="fa-solid ' + o.ikon + '" aria-hidden="true"></i>' : '') + esc(o.ad) + '</button>';
              }).join('')
            + '</div></div>';
        }
        if (a.tur === 'aralik') {
          var mn = v && v.min != null ? v.min : '', mx = v && v.max != null ? v.max : '';
          return '<div class="gfield"><label for="gvf_' + esc(a.k) + '_min">' + esc(a.ad) + '</label>'
            + '<div class="gv-fd-numrange" style="display:flex;align-items:center;gap:10px">'
            + '<input type="number" id="gvf_' + esc(a.k) + '_min" data-aralik="' + esc(a.k) + '" data-uc="min" value="' + esc(mn) + '" placeholder="En az" aria-label="' + esc(a.ad) + ' en az">'
            + '<span style="color:var(--muted);font-weight:700">–</span>'
            + '<input type="number" id="gvf_' + esc(a.k) + '_max" data-aralik="' + esc(a.k) + '" data-uc="max" value="' + esc(mx) + '" placeholder="En çok" aria-label="' + esc(a.ad) + ' en çok"></div></div>';
        }
        if (a.tur === 'tarih') {
          var bs = v && v.bas ? v.bas : '', sn = v && v.son ? v.son : '';
          return '<div class="gfield"><label for="gvf_' + esc(a.k) + '_bas">' + esc(a.ad) + '</label>'
            + '<div style="display:flex;align-items:center;gap:10px">'
            + '<input type="date" id="gvf_' + esc(a.k) + '_bas" data-tarih="' + esc(a.k) + '" data-uc="bas" value="' + esc(bs) + '" aria-label="' + esc(a.ad) + ' başlangıç">'
            + '<span style="color:var(--muted);font-weight:700">–</span>'
            + '<input type="date" id="gvf_' + esc(a.k) + '_son" data-tarih="' + esc(a.k) + '" data-uc="son" value="' + esc(sn) + '" aria-label="' + esc(a.ad) + ' bitiş"></div></div>';
        }
        return '<div class="gfield"><label for="gvf_' + esc(a.k) + '">' + esc(a.ad) + '</label>'
          + '<select id="gvf_' + esc(a.k) + '" data-secim="' + esc(a.k) + '">'
          + '<option value="">Tümü</option>'
          + (a.secenekler || []).map(function (o) {
              return '<option value="' + esc(o.deger) + '"' + (String(v) === String(o.deger) ? ' selected' : '') + '>' + esc(o.ad) + '</option>';
            }).join('')
          + '</select></div>';
      }).join('');

      /* Doküman §9: "Filtre: 640 px altında drawer; uygula/temizle sticky;
         aktif filtre sayısı butonda görünür." Panel masaüstünde de sağdan
         açılan bir çekmecedir — ≤640'ta tam genişliğe geçer (responsive.css),
         uygula/temizle çubuğu görünür alanda sabit kalır. */
      var mobil = GV.altinda ? GV.altinda('sm') : false;
      var aktif = aktifSayi();

      var ov = document.createElement('div');
      ov.className = 'gv-fpanel-ov';
      ov.innerHTML = '<div class="gv-fpanel" role="dialog" aria-modal="true" aria-labelledby="gvFpBaslik">'
        + '<div class="gv-fpanel-head"><h3 id="gvFpBaslik"><i class="fa-solid fa-filter" aria-hidden="true"></i>Gelişmiş Filtre'
        + '<span class="fp-count" id="gvFpPanelCount"' + (aktif ? '' : ' hidden') + '>' + aktif + '</span></h3>'
        + '<button class="gv-fpanel-close" type="button" aria-label="Filtre panelini kapat"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>'
        + '<div class="gv-fpanel-body">' + (alanHtml || '<p class="muted" style="font-size:13px">Bu liste için ek filtre tanımlı değil.</p>') + '</div>'
        + '<div class="gv-fpanel-foot"><button class="btn btn-ghost" type="button" data-temizle>'
        + '<i class="fa-solid fa-eraser" aria-hidden="true"></i>Temizle</button>'
        + '<button class="btn btn-acc" type="button" data-uygula><i class="fa-solid fa-check" aria-hidden="true"></i>Uygula'
        + '<span class="fp-count fp-count-inv" data-secili' + (aktif ? '' : ' hidden') + '>' + aktif + '</span></button></div></div>';
      document.body.appendChild(ov);
      var panel = ov.querySelector('.gv-fpanel');
      var gecici = JSON.parse(JSON.stringify(durum.gelismis));

      /* Panel açıkken seçim değiştikçe sayaç canlı güncellenir; kullanıcı
         "Uygula"ya basmadan kaç filtre biriktirdiğini görür. */
      function sayacGuncelle() {
        var n = aktifSayi(gecici);
        [panel.querySelector('#gvFpPanelCount'), panel.querySelector('[data-secili]')]
          .forEach(function (el) { if (el) { el.textContent = n; el.hidden = !n; } });
      }

      panel.querySelectorAll('[data-coklu] .chip').forEach(function (c) {
        c.addEventListener('click', function () {
          var k = c.closest('[data-coklu]').getAttribute('data-coklu');
          var d = c.getAttribute('data-deger');
          if (!Array.isArray(gecici[k])) gecici[k] = [];
          var i = gecici[k].indexOf(d);
          if (i === -1) gecici[k].push(d); else gecici[k].splice(i, 1);
          var acik = i === -1;
          c.classList.toggle('is-on', acik);
          c.setAttribute('aria-pressed', acik ? 'true' : 'false');
          sayacGuncelle();
        });
      });
      panel.querySelectorAll('[data-secim]').forEach(function (s) {
        s.addEventListener('change', function () {
          var k = s.getAttribute('data-secim');
          if (s.value) gecici[k] = s.value; else delete gecici[k];
          sayacGuncelle();
        });
      });
      panel.querySelectorAll('[data-aralik]').forEach(function (inp) {
        inp.addEventListener('input', function () {
          var k = inp.getAttribute('data-aralik'), uc = inp.getAttribute('data-uc');
          if (!gecici[k] || Array.isArray(gecici[k])) gecici[k] = { min: '', max: '' };
          gecici[k][uc] = inp.value;
          if (gecici[k].min === '' && gecici[k].max === '') delete gecici[k];
          sayacGuncelle();
        });
      });
      panel.querySelectorAll('[data-tarih]').forEach(function (inp) {
        inp.addEventListener('input', function () {
          var k = inp.getAttribute('data-tarih'), uc = inp.getAttribute('data-uc');
          if (!gecici[k] || Array.isArray(gecici[k])) gecici[k] = { bas: '', son: '' };
          gecici[k][uc] = inp.value;
          if (!gecici[k].bas && !gecici[k].son) delete gecici[k];
          sayacGuncelle();
        });
      });

      var odak = null;
      function kapat() {
        ov.classList.remove('open');
        if (window.gvScrollLock) gvScrollLock(false);
        setTimeout(function () { ov.remove(); }, 260);
        if (odak) odak.coz();
      }
      ov.querySelector('.gv-fpanel-close').addEventListener('click', kapat);
      ov.addEventListener('click', function (e) { if (e.target === ov) kapat(); });
      ov.querySelector('[data-temizle]').addEventListener('click', function () {
        gecici = {}; durum.gelismis = {}; kapat(); uygula();
      });
      ov.querySelector('[data-uygula]').addEventListener('click', function () {
        durum.gelismis = gecici; kapat(); uygula();
      });
      /* Escape + Tab tuzağı + odak iadesi ortak katmandan gelir
         (app.js `GV.odakKatmani`); ikinci bir kopya yazılmaz. */
      if (GV.odakKatmani) odak = GV.odakKatmani(panel, kapat);
      if (window.gvScrollLock) gvScrollLock(true);
      requestAnimationFrame(function () { ov.classList.add('open'); });
      return mobil;
    }

    function temizle() {
      durum.arama = ''; durum.cip = 'tumu'; durum.gelismis = {}; durum.arsiv = false;
      var ai = document.querySelector(secenek.aramaHedef || '#gvSearch');
      if (ai) ai.value = '';
      var ark = document.querySelector(secenek.arsivHedef || '#gvArsiv');
      if (ark) ark.checked = false;
      uygula();
    }

    function cipSayilariGuncelle() {
      if (!secenek.cipler) return;
      var kap = document.querySelector(secenek.cipHedef || '#gvChips');
      if (!kap) return;
      var veri = secenek.veri() || [];
      kap.querySelectorAll('.chip[data-cip]').forEach(function (c) {
        var k = c.getAttribute('data-cip');
        var n = k === 'tumu' ? veri.length : veri.filter(function (x) {
          return secenek.cipler.suz ? secenek.cipler.suz(x, k) : x[secenek.cipler.alan] === k;
        }).length;
        var s = c.querySelector('.ch-cnt');
        if (s) s.textContent = GV.n(n);
      });
    }

    function uygula() {
      var sonuc = suz();
      aktifCipleriCiz();
      cipSayilariGuncelle();
      /* Aktif filtre sayısı BUTONDA görünür (doküman §9) ve ekran
         okuyucuya da butonun adı üzerinden geçer. */
      var n = aktifSayi();
      var fc = document.querySelector('#gvFpCount');
      if (fc) { fc.textContent = n; fc.hidden = !n; }
      var fbtn = document.querySelector(secenek.cekmeceHedef || '#gvFilterBtn');
      if (fbtn) {
        fbtn.setAttribute('aria-label', 'Gelişmiş filtre' + (n ? ' — ' + n + ' aktif filtre' : ''));
        fbtn.classList.toggle('is-on', n > 0);
      }
      urlYaz();
      if (secenek.degisti) secenek.degisti(sonuc);
    }

    /* ---- bağlama ---- */
    function bagla() {
      var ai = document.querySelector(secenek.aramaHedef || '#gvSearch');
      if (ai) {
        ai.value = durum.arama;
        var z = null;
        ai.addEventListener('input', function () {
          clearTimeout(z);
          z = setTimeout(function () { durum.arama = ai.value; uygula(); }, 200);
        });
      }
      var cipKap = document.querySelector(secenek.cipHedef || '#gvChips');
      if (cipKap && secenek.cipler) {
        var hepsi = [{ k: 'tumu', ad: 'Tümü' }].concat(secenek.cipler.secenekler || []);
        cipKap.className = 'chips';
        cipKap.setAttribute('role', 'group');
        cipKap.setAttribute('aria-label', 'Durum filtresi');
        cipKap.innerHTML = hepsi.map(function (c) {
          return '<button type="button" class="chip' + (c.k === durum.cip ? ' is-on' : '') + '" data-cip="' + esc(c.k) + '"'
            + ' aria-pressed="' + (c.k === durum.cip ? 'true' : 'false') + '">'
            + (c.ikon ? '<i class="fa-solid ' + c.ikon + '" aria-hidden="true"></i>' : '')
            + esc(c.ad) + '<span class="ch-cnt">0</span></button>';
        }).join('');
        cipKap.addEventListener('click', function (e) {
          var b = e.target.closest('.chip[data-cip]');
          if (!b) return;
          durum.cip = b.getAttribute('data-cip');
          cipKap.querySelectorAll('.chip').forEach(function (c) {
            var on = c === b;
            c.classList.toggle('is-on', on);
            c.setAttribute('aria-pressed', on ? 'true' : 'false');
          });
          uygula();
        });
      }
      var fb = document.querySelector(secenek.cekmeceHedef || '#gvFilterBtn');
      if (fb) fb.addEventListener('click', cekmeceAc);
      var ark = document.querySelector(secenek.arsivHedef || '#gvArsiv');
      if (ark) ark.addEventListener('change', function () { durum.arsiv = ark.checked; uygula(); });
    }

    bagla();
    uygula();

    return {
      uygula: uygula, temizle: temizle, durum: durum,
      sirala: function (alan, yon) { durum.sirala = alan; durum.siraYon = yon || 'asc'; uygula(); },
      sonuc: suz
    };
  };

  /* ---------------------------------------------------------------
     gvCols — kolon seçimi (tercih localStorage'da kalıcı)
     --------------------------------------------------------------- */
  window.gvCols = function (secenek) {
    var tetik = document.querySelector(secenek.tetik || '#gvColsBtn');
    if (!tetik) return null;
    var anahtar = 'gv_tk_kolon_' + (secenek.anahtar || location.pathname.split('/').pop());
    var kolonlar = secenek.kolonlar;

    try {
      var kayitli = JSON.parse(localStorage.getItem(anahtar) || 'null');
      if (kayitli) kolonlar.forEach(function (c) { if (kayitli.indexOf(c.k) !== -1) c.gizli = false; else if (!c.kilitli) c.gizli = true; });
    } catch (e) {}

    var pop = document.createElement('div');
    pop.className = 'gv-pop gv-colpop';
    pop.id = 'gvColsPop';
    tetik.parentNode.style.position = 'relative';
    tetik.parentNode.appendChild(pop);

    function ciz() {
      pop.innerHTML = '<div class="gcol-list">' + kolonlar.map(function (c) {
        return '<label class="gcol-chk"><input type="checkbox" data-k="' + esc(c.k) + '"' + (c.gizli ? '' : ' checked')
          + (c.kilitli ? ' disabled' : '') + '><span>' + esc(c.ad) + (c.kilitli ? ' (sabit)' : '') + '</span></label>';
      }).join('') + '</div>'
      + '<div class="gcol-foot"><button class="btn btn-sm btn-ghost" type="button" data-varsayilan>Varsayılana dön</button></div>';
      pop.querySelectorAll('input[data-k]').forEach(function (i) {
        i.addEventListener('change', function () {
          var k = i.getAttribute('data-k');
          kolonlar.forEach(function (c) { if (c.k === k) c.gizli = !i.checked; });
          kaydet();
          if (secenek.degisti) secenek.degisti(kolonlar);
        });
      });
      pop.querySelector('[data-varsayilan]').addEventListener('click', function () {
        kolonlar.forEach(function (c) { c.gizli = !!c.varsayilanGizli; });
        try { localStorage.removeItem(anahtar); } catch (e) {}
        ciz();
        if (secenek.degisti) secenek.degisti(kolonlar);
      });
    }
    function kaydet() {
      try {
        localStorage.setItem(anahtar, JSON.stringify(kolonlar.filter(function (c) { return !c.gizli; }).map(function (c) { return c.k; })));
      } catch (e) {}
    }
    ciz();
    if (window.gvPop) gvPop(tetik, pop);
    return { kolonlar: kolonlar };
  };
})();
