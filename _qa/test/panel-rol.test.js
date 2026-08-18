/* Faz 15 — ROL BAZLI PANEL (doküman §12 iş paketi 9)
   "13 rol snapshot testi". Panel içeriği rolün izin kapsamından türer;
   bu dosya 13 rolün panelini gerçekten çizer ve iki şeyi kilitler:

   1. ANLIK GÖRÜNTÜ — hangi widget'ın hangi rolde göründüğü sabittir.
      Beklenen liste burada YAZILIDIR; kod değişince test kırılır.
   2. ERİŞİM KORUMASIYLA TUTARLILIK — görünen hiçbir widget, rolün
      erişemediği bir ekrana bağlı olamaz. (DURMA ŞARTI: rol snapshot'ları
      mevcut erişim korumasıyla çelişirse dur.)

   jsdom yoksa testler skip edilir — uydurma sonuç üretilmez. */
const { test, skip } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { KOK } = require('./yukleyici.js');

const JSDOMMod = require('../jsdom-yolu.js').yukle();
if (!JSDOMMod) { skip('jsdom bulunamadı — panel rol testleri atlandı'); return; }
const { JSDOM } = JSDOMMod;

/* Beklenen anlık görüntü — izin kapsamı süzgecinden geçen widget'lar.
   `cizilen` ekranda gerçekten duranlardır: kapsam süzgecinden sonra içi
   boşalan kart (KPI şeridi, hızlı özet satırı) çizilmez. */
const ANLIK = {
  sahip: {
    izinli: ['hizliOzet','kpi','aksiyon','onay','proje','aylikPlan','saat','ajanda','yaklasan','teslim','not','sla','faturaGrubu','taseronOdeme','kalibrasyon','risk','saha'],
    cizilenEksik: []
  },
  gm: {
    izinli: ['hizliOzet','kpi','aksiyon','onay','proje','aylikPlan','saat','ajanda','yaklasan','teslim','not','sla','faturaGrubu','taseronOdeme','kalibrasyon','risk','saha'],
    cizilenEksik: []
  },
  operasyon: {
    izinli: ['hizliOzet','kpi','aksiyon','onay','proje','aylikPlan','saat','ajanda','yaklasan','teslim','not','sla','kalibrasyon','risk','saha'],
    cizilenEksik: []
  },
  teknik: {
    izinli: ['hizliOzet','kpi','aksiyon','onay','proje','aylikPlan','saat','ajanda','yaklasan','teslim','not','sla','kalibrasyon','risk','saha'],
    cizilenEksik: []
  },
  kalite: {
    izinli: ['hizliOzet','kpi','aksiyon','onay','saat','ajanda','teslim','not','sla','kalibrasyon'],
    cizilenEksik: []
  },
  planlama: {
    izinli: ['hizliOzet','kpi','aksiyon','onay','proje','aylikPlan','saat','ajanda','yaklasan','not','kalibrasyon','risk','saha'],
    cizilenEksik: []
  },
  uzman: {
    izinli: ['hizliOzet','kpi','saat','ajanda','teslim','not','sla','saha'],
    cizilenEksik: []
  },
  saha: {
    izinli: ['hizliOzet','kpi','saat','ajanda','not','saha'],
    cizilenEksik: []
  },
  satis: {
    /* satış rolünde hızlı özet satırının beş hedefi de kapalı → satır çizilmez */
    izinli: ['hizliOzet','kpi','aksiyon','onay','proje','saat','ajanda','not','risk'],
    cizilenEksik: ['hizliOzet']
  },
  finans: {
    izinli: ['hizliOzet','kpi','aksiyon','onay','proje','saat','ajanda','not','faturaGrubu','taseronOdeme','risk'],
    cizilenEksik: []
  },
  taseron: {
    izinli: ['hizliOzet','kpi','saat','ajanda','teslim','not','sla','taseronOdeme','saha'],
    cizilenEksik: []
  },
  /* müşteri rolü panele hiç giremez (yalnız portal); kabuk gerçek tarayıcıda
     portala yönlendirir, jsdom yönlendirmeyi uygulamadığı için panel boş kalır */
  musteri: { izinli: [], cizilenEksik: [] },
  sistem: {
    /* sistem rolünün panel ekranı açık ama operasyonel hiçbir hedefi yok */
    izinli: ['hizliOzet','kpi','saat','not'],
    cizilenEksik: ['hizliOzet','kpi']
  }
};

const ROLLER = Object.keys(ANLIK);

/** panel.html'i verilen rolle çalıştırır. */
async function panel(rol) {
  const hata = [];
  const dom = await JSDOM.fromFile(path.join(KOK, 'panel.html'), {
    runScripts: 'outside-only', pretendToBeVisual: true,
    url: 'http://localhost/panel.html?role=' + rol
  });
  const w = dom.window, doc = w.document;
  w.requestAnimationFrame = cb => setTimeout(cb, 0);
  if (!w.matchMedia) w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.HTMLCanvasElement.prototype.getContext = () => ({
    scale() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, clearRect() {},
    set lineWidth(v) {}, set lineCap(v) {}, set lineJoin(v) {}, set strokeStyle(v) {}
  });
  w.console.error = (...a) => hata.push('console.error: ' + a.join(' '));
  w.console.warn = (...a) => hata.push('console.warn: ' + a.join(' '));
  for (const sc of doc.querySelectorAll('script')) {
    const src = sc.getAttribute('src');
    try {
      if (src && !/^https?:/.test(src)) w.eval(fs.readFileSync(path.join(KOK, src), 'utf8'));
      else if (!src && sc.textContent.trim()) w.eval(sc.textContent);
    } catch (e) { hata.push((src || 'satır içi script') + ' → ' + e.message); }
  }
  await new Promise(r => setTimeout(r, 60));
  return { w, doc, hata, kapat: () => w.close() };
}

/* ================= kayıt defteri ================= */

test('widget kayıt defteri saf veridir ve panelde karşılığı vardır', async () => {
  const { w, doc, kapat } = await panel('sahip');
  try {
    const defter = w.GV.PANEL_DEFTERI;
    assert.ok(defter.length >= 17, 'defter boş görünüyor');
    for (const wd of defter) {
      assert.ok(wd.k && wd.ad && wd.ekran, 'eksik alan: ' + JSON.stringify(wd));
      assert.ok(doc.querySelector('[data-widget="' + wd.k + '"]'), wd.k + ' için kap yok');
      assert.ok(w.GV.panelWidgetBagli(wd.k), wd.k + ' çizimi bağlanmamış');
    }
    /* anahtarlar benzersiz */
    const k = defter.map(x => x.k);
    assert.strictEqual(new Set(k).size, k.length);
  } finally { kapat(); }
});

test('panelde kayıt defterine girmemiş widget kabı yok', async () => {
  const { w, doc, kapat } = await panel('sahip');
  try {
    const defter = new Set(w.GV.PANEL_DEFTERI.map(x => x.k));
    const fazla = [...doc.querySelectorAll('[data-widget]')]
      .map(e => e.getAttribute('data-widget')).filter(k => !defter.has(k));
    assert.deepStrictEqual(fazla, []);
  } finally { kapat(); }
});

/* ================= 13 rol anlık görüntüsü ================= */

for (const rol of ROLLER) {
  test('anlık görüntü — ' + rol, async () => {
    const { w, doc, hata, kapat } = await panel(rol);
    try {
      assert.deepStrictEqual(hata, []);
      /* jsdom ayrı bir realm; dizi kimlikleri karşılaştırılamaz, metin üzerinden bakılır */
      assert.strictEqual([...w.GV.panelWidgetleri()].join(','), ANLIK[rol].izinli.join(','));
      const beklenenCizim = ANLIK[rol].izinli.filter(k => ANLIK[rol].cizilenEksik.indexOf(k) === -1);
      assert.strictEqual([...w.GV.panelSonCizim].join(','), beklenenCizim.join(','));
      /* ekranda gizli olmayan kap kümesi çizilenle birebir aynı */
      const acik = [...doc.querySelectorAll('[data-widget]')]
        .filter(e => !e.hidden).map(e => e.getAttribute('data-widget'));
      assert.strictEqual(acik.slice().sort().join(','), beklenenCizim.slice().sort().join(','));
    } finally { kapat(); }
  });

  test('erişim koruması tutarlı — ' + rol, async () => {
    const { w, kapat } = await panel(rol);
    try {
      /* Görünen her widget'ın bağlı olduğu ekran rol için AÇIK olmalı.
         Bu, panelin erişim korumasıyla çelişmediğinin doğrudan kanıtıdır. */
      const defter = w.GV.PANEL_DEFTERI;
      for (const k of w.GV.panelWidgetleri()) {
        const wd = [...defter].find(x => x.k === k);
        assert.strictEqual(w.GV.ekranIzni(wd.ekran), true, rol + ' → ' + k + ' kapalı ekrana bağlı');
      }
      /* Tersi de doğru: kapalı ekrana bağlı widget listede olmamalı. */
      const gorunen = [...w.GV.panelWidgetleri()];
      for (const wd of defter) {
        if (w.GV.ekranIzni(wd.ekran)) continue;
        assert.strictEqual(gorunen.indexOf(wd.k), -1, rol + ' → ' + wd.k + ' sızmış');
      }
    } finally { kapat(); }
  });
}

/* ================= kapsam süzgeci ================= */

test('KPI kartı ve hızlı bağlantı hedefi kapalı ekrana gitmez', async () => {
  for (const rol of ['operasyon', 'satis', 'finans', 'taseron', 'saha']) {
    const { w, doc, kapat } = await panel(rol);
    try {
      const hedefler = [...doc.querySelectorAll('#pnlKpi a, #pnlHizli a')]
        .map(a => (a.getAttribute('href') || '').split('?')[0]);
      for (const h of hedefler) {
        const r = w.GV.route(h);
        assert.ok(r, rol + ' → tanımsız route: ' + h);
        assert.strictEqual(w.GV.ekranIzni(r.ekran.screen), true, rol + ' → kapalı hedef: ' + h);
      }
    } finally { kapat(); }
  }
});

test('içi tamamen boşalan alt öbek başlığıyla birlikte gizlenir', async () => {
  const { doc, kapat } = await panel('saha');
  try {
    for (const obek of doc.querySelectorAll('.gv-botsec')) {
      const kartlar = [...obek.querySelectorAll('[data-widget]')];
      if (!kartlar.length) continue;
      const acik = kartlar.filter(k => !k.hidden).length;
      assert.strictEqual(obek.hidden, acik === 0, 'öbek gizliliği kart durumuyla uyuşmuyor');
    }
  } finally { kapat(); }
});
