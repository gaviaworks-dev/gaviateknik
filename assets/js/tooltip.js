/* =====================================================================
   GAVIA — İPUCU (gvTooltip)
   Doküman §4 "Tooltip davranış standardı":
     · Hover 350 ms gecikmeyle açılır, imleç ayrılınca 100 ms içinde kapanır
     · Tab ile odaklanınca ANINDA açılır, Escape kapatır
     · İkonun sağında, viewport içinde kalacak şekilde konumlanır
     · Görünen katman role="tooltip" taşır; tetikleyici aria-describedby ile bağlanır
     · Tıklamayı engellemez ve odak alamaz
     · Dokunmatikte hover kullanılmaz

   Sözde-öğe (::after) bu şartları karşılayamaz: role taşıyamaz,
   aria-describedby hedefi olamaz ve :focus kuralı yoktur. Bu yüzden rail'de
   gerçek bir DOM düğümüne geçildi; topbar'ın CSS ipucu olduğu gibi kaldı.

   Global API: gvTooltip
   ===================================================================== */
(function () {
  'use strict';
  var GV = window.GV || (window.GV = {});

  var AC_GECIKME = 350;
  var KAPAT_GECIKME = 100;
  var KENAR = 8;          /* viewport payı */
  var KATMAN = null, zamanlayici = null, aktifTetik = null;

  function esc(s) { return GV.esc ? GV.esc(s) : String(s == null ? '' : s); }

  function katman() {
    if (KATMAN) return KATMAN;
    KATMAN = document.createElement('div');
    KATMAN.className = 'gv-tip';
    KATMAN.id = 'gvTip';
    KATMAN.setAttribute('role', 'tooltip');
    KATMAN.hidden = true;
    document.body.appendChild(KATMAN);
    return KATMAN;
  }

  /* Dokunmatik cihazda hover yoktur; ipucu açılmaz (doküman: mobilde
     ad ve açıklama çekmecede gösterilir). */
  function dokunmatik() {
    return window.matchMedia && window.matchMedia('(hover: none)').matches;
  }

  function konumla(tetik) {
    var k = katman();
    var r = tetik.getBoundingClientRect();
    k.style.left = '0px'; k.style.top = '0px';   /* ölçüm için sıfırla */
    var kr = k.getBoundingClientRect();

    /* İkonun sağı; sığmazsa soluna geçer, o da sığmazsa kenara yaslanır. */
    var x = r.right + 12;
    if (x + kr.width > window.innerWidth - KENAR) {
      x = r.left - 12 - kr.width;
      if (x < KENAR) x = Math.max(KENAR, window.innerWidth - KENAR - kr.width);
    }
    var y = r.top + r.height / 2 - kr.height / 2;
    y = Math.min(Math.max(KENAR, y), Math.max(KENAR, window.innerHeight - KENAR - kr.height));

    k.style.left = Math.round(x) + 'px';
    k.style.top = Math.round(y) + 'px';
  }

  function goster(tetik, aninda) {
    clearTimeout(zamanlayici);
    var baslik = tetik.getAttribute('data-tip');
    if (!baslik) return;
    var aciklama = tetik.getAttribute('data-tip-desc');

    function ac() {
      var k = katman();
      k.innerHTML = '<b class="gv-tip-t">' + esc(baslik) + '</b>'
        + (aciklama ? '<span class="gv-tip-d">' + esc(aciklama) + '</span>' : '');
      k.classList.toggle('has-desc', !!aciklama);
      k.hidden = false;
      konumla(tetik);
      requestAnimationFrame(function () { k.classList.add('is-on'); });
      tetik.setAttribute('aria-describedby', 'gvTip');
      aktifTetik = tetik;
    }
    if (aninda) ac();
    else zamanlayici = setTimeout(ac, AC_GECIKME);
  }

  function gizle(aninda) {
    clearTimeout(zamanlayici);
    if (!aktifTetik) return;
    var tetik = aktifTetik;
    aktifTetik = null;
    function kapat() {
      tetik.removeAttribute('aria-describedby');
      if (!aktifTetik && KATMAN) { KATMAN.classList.remove('is-on'); KATMAN.hidden = true; }
    }
    if (aninda) kapat();
    else zamanlayici = setTimeout(kapat, KAPAT_GECIKME);
  }

  /* Tek bir olay kümesi; ipucu taşıyan öğeler sonradan enjekte edilse de
     çalışsın diye dinleyiciler belgeye bağlanır. */
  function bagla(secici) {
    if (bagla.bagli) return;
    bagla.bagli = true;
    var SEC = secici || '.gv-rail [data-tip]';

    document.addEventListener('mouseover', function (e) {
      if (dokunmatik()) return;
      var t = e.target.closest(SEC);
      if (!t || t === aktifTetik) return;
      goster(t, false);
    });
    document.addEventListener('mouseout', function (e) {
      var t = e.target.closest(SEC);
      if (!t) return;
      if (e.relatedTarget && t.contains(e.relatedTarget)) return;
      gizle(false);
    });
    /* Klavye: odaklanınca gecikmesiz açılır. */
    document.addEventListener('focusin', function (e) {
      var t = e.target.closest(SEC);
      if (!t) { gizle(true); return; }
      goster(t, true);
    });
    document.addEventListener('focusout', function (e) {
      if (e.target.closest(SEC)) gizle(true);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && aktifTetik) gizle(true);
    });
    /* Tıklama ipucunu kapatır; ipucu tıklamayı engellemez (pointer-events:none). */
    document.addEventListener('click', function () { gizle(true); });
    window.addEventListener('scroll', function () { gizle(true); }, true);
    window.addEventListener('resize', function () { gizle(true); });
  }

  window.gvTooltip = {
    bagla: bagla,
    goster: goster,
    gizle: gizle,
    /** Test/erişim için: o an görünen ipucu düğümü ya da null. */
    katman: function () { return KATMAN && !KATMAN.hidden ? KATMAN : null; }
  };

  document.addEventListener('DOMContentLoaded', function () { bagla(); });
  /* navigation.js kabuğu DOMContentLoaded'da basıyor; script sonradan
     yüklenirse de bağlanabilsin. */
  if (document.readyState !== 'loading') bagla();
})();
