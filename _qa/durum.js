#!/usr/bin/env node
/* GAVIA Faz 12 — DURUM RAPORU
 *
 * Bu script Faz 12'nin TEK gerçek ilerleme kaynağıdır. Her tur başında
 * çalıştırılır ve çıktısına göre devam edilir. Hafızadan ilerleme raporlanmaz.
 *
 * Kullanım:
 *   node _qa/durum.js            → tam rapor (taramaları çalıştırır)
 *   node _qa/durum.js --hizli    → yalnız disk analizi, jsdom taramaları atlanır
 */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const KOK = path.resolve(__dirname, '..');
const QA = __dirname;
const HIZLI = process.argv.includes('--hizli');

const ORTAK = ['types.js', 'data-provider.js', 'list-controller.js', 'tooltip.js',
               'kimlik.js', 'para-zaman.js', 'durum-makinesi.js', 'form-controller.js', 'kpi.js',
               'dashboard.js', 'api-provider.js'];

/* _docs/REVIZYON.md §6 sayfalandırma matrisi — 41 route.
   Doküman 'hizmet-kataloğu.html' yazıyor (Türkçe ğ); diskteki doğru ad
   'hizmet-katalogu.html'. CLAUDE.md §2 Türkçe karakteri yasakladığı için
   doküman hatalı sayılır, dosya adı değişmez. */
const MATRIS = [
  'aksiyon-merkezi','bildirimler','denetimler','duzeltici-faaliyetler','ekipmanlar',
  'eksik-ekipmanlar','envanter-mutabakati','fatura-gruplari','faturalar','fiyat-listeleri',
  'hakedisler','hizmet-katalogu','iletisim-kisileri','is-emirleri','islem-kayitlari',
  'kalibrasyonlar','kalite-dokumanlari','lokasyonlar','musteri-sikayetleri','musteriler',
  'olcum-cihazlari','on-envanter','onaylar','personeller','portal-faturalar',
  'portal-lokasyonlar','portal-raporlar','projeler','rapor-onaylari','rapor-sablonlari',
  'saha-kontrol','sozlesme-pozlari','sozlesmeler','tahsilatlar','taseron-hakedisleri',
  'taseronlar','teklifler','teknik-raporlar','uygunsuzluklar','yeniden-kontroller',
  'yetkinlikler'
].map(x => x + '.html');

/* Alt koleksiyonları sayfalanacak 12 detay ekranı (doküman §6 ikinci tablo). */
const DETAY = [
  'musteri-detay','proje-detay','lokasyon-detay','ekipman-detay','is-emri-detay',
  'rapor-detay','uygunsuzluk-detay','teklif-detay','sozlesme-detay',
  'fatura-grubu-detay','taseron-detay','personel-detay','cihaz-detay'
].map(x => x + '.html');
const b = s => '\x1b[1m' + s + '\x1b[0m';
const yesil = s => '\x1b[32m' + s + '\x1b[0m';
const kirmizi = s => '\x1b[31m' + s + '\x1b[0m';
const sari = s => '\x1b[33m' + s + '\x1b[0m';

function sayfalar() {
  return fs.readdirSync(KOK).filter(f => f.endsWith('.html')).sort();
}
function oku(f) {
  try { return fs.readFileSync(path.join(KOK, f), 'utf8'); } catch (e) { return ''; }
}

/* ---------- 1. ListController benimseme ---------- */
function gecmisMi(s) { return /gvList\(|ListController|listController/.test(s); }

function listeYolu() {
  const diskte = new Set(sayfalar());

  /* --- 1. HEDEF KAPSAM: doküman matrisi (41) --- */
  const mYeni = [], mEski = [], mYok = [];
  for (const f of MATRIS) {
    if (!diskte.has(f)) { mYok.push(f); continue; }
    (gecmisMi(oku(f)) ? mYeni : mEski).push(f);
  }

  /* --- 2. Detay ekranlarının alt koleksiyonları (12) --- */
  const dYeni = [], dEski = [];
  for (const f of DETAY) {
    if (!diskte.has(f)) continue;
    (gecmisMi(oku(f)) ? dYeni : dEski).push(f);
  }

  /* --- 3. HAM SAYIM: tablo basan her sayfa (kapsam dışı olanlar dahil) --- */
  const hYeni = [], hEski = [];
  for (const f of sayfalar()) {
    const s = oku(f);
    if (!/gvTable\(|<table/.test(s)) continue;
    (gecmisMi(s) ? hYeni : hEski).push(f);
  }
  /* matris ve detay dışında kalan tablo sayfaları — hedef değil, bilgi */
  const kapsamDisi = hEski.filter(f => !MATRIS.includes(f) && !DETAY.includes(f));

  /* gvTable ortak yolunu kullananlar — yayılımın asıl gövdesi */
  const gvTablo = sayfalar().filter(f => oku(f).includes('gvTable('));

  return { mYeni, mEski, mYok, dYeni, dEski, hYeni, hEski, kapsamDisi, gvTablo };
}

/* ---------- 2. Ortak dosyalar ---------- */
function ortakDosyalar() {
  return ORTAK.map(ad => {
    const p = path.join(KOK, 'assets/js', ad);
    const varMi = fs.existsSync(p);
    return {
      ad,
      var: varMi,
      satir: varMi ? fs.readFileSync(p, 'utf8').split('\n').length : 0,
      /* kaç sayfa yüklüyor */
      kullanan: varMi ? sayfalar().filter(f => oku(f).includes('assets/js/' + ad)).length : 0
    };
  });
}

/* ---------- 3. node --test ---------- */
function birimTestleri() {
  const testDizin = path.join(QA, 'test');
  if (!fs.existsSync(testDizin)) return { durum: 'yok', mesaj: '_qa/test/ dizini yok — birim test yazılmadı' };
  const dosyalar = fs.readdirSync(testDizin).filter(f => f.endsWith('.test.js'));
  if (!dosyalar.length) return { durum: 'yok', mesaj: '_qa/test/ boş' };
  try {
    /* Node 22+ dizin argümanını modül yolu sayıyor; test dosyaları glob ile verilir. */
    const r = cp.execSync(`node --test --test-reporter=tap "${path.join(testDizin, '*.test.js')}" 2>&1`, { encoding: 'utf8', cwd: KOK });
    const gec = (r.match(/^# pass (\d+)/m) || [])[1];
    const kal = (r.match(/^# fail (\d+)/m) || [])[1];
    return { durum: 'ok', gecti: +(gec || 0), kaldi: +(kal || 0), dosya: dosyalar.length };
  } catch (e) {
    const o = String(e.stdout || e.message);
    const gec = (o.match(/^# pass (\d+)/m) || [])[1];
    const kal = (o.match(/^# fail (\d+)/m) || [])[1];
    if (gec != null) return { durum: 'ok', gecti: +gec, kaldi: +(kal || 0), dosya: dosyalar.length };
    return { durum: 'hata', mesaj: o.split('\n')[0] };
  }
}

/* ---------- 4 & 5. jsdom taramaları ---------- */
function jsdomVar() {
  try { return !!require('./jsdom-yolu.js').coz(); } catch (e) { return false; }
}
function calistir(script, arg) {
  try {
    const r = cp.execSync(`node "${path.join(QA, script)}" ${arg || ''} 2>&1`,
      { encoding: 'utf8', cwd: KOK, maxBuffer: 64 * 1024 * 1024 });
    return { kod: 0, cikti: r };
  } catch (e) {
    return { kod: e.status == null ? -1 : e.status, cikti: String(e.stdout || e.message) };
  }
}
function rolTaramasi() {
  if (HIZLI) return { durum: 'atlandi' };
  if (!jsdomVar()) return { durum: 'jsdom-yok' };
  const roller = ['sahip','gm','operasyon','teknik','kalite','planlama','uzman',
                  'saha','satis','finans','taseron','musteri','sistem'];
  let toplam = 0; const bozuk = [];
  for (const r of roller) {
    const o = calistir('tarama.js', `"" ${r}`);
    const m = o.cikti.match(/TOPLAM (\d+) BULGU/);
    if (!m) { bozuk.push(r); continue; }
    toplam += +m[1];
  }
  return { durum: 'ok', rol: roller.length, sayfa: sayfalar().length, bulgu: toplam, bozuk };
}
function butunlukTaramasi() {
  if (HIZLI) return { durum: 'atlandi' };
  if (!jsdomVar()) return { durum: 'jsdom-yok' };
  const o = calistir('butunluk.js');
  const m = o.cikti.match(/(\d+) sayfa ayrıştırıldı — (.+)/);
  return m ? { durum: 'ok', sayfa: +m[1], sonuc: m[2].trim(), temiz: o.kod === 0 }
           : { durum: 'hata', mesaj: o.cikti.trim().split('\n').pop() };
}

/* ---------- LEDGER son satır ---------- */
function ledgerSon() {
  const p = path.join(QA, 'LEDGER.md');
  if (!fs.existsSync(p)) return null;
  const satirlar = fs.readFileSync(p, 'utf8').split('\n')
    .filter(l => l.trim().startsWith('|') && !/^\|\s*[-:]/.test(l.trim()) && !/Tarih\s*\|/.test(l));
  return satirlar.length ? satirlar[satirlar.length - 1].trim() : null;
}

/* ================= RAPOR ================= */
const dal = (() => { try { return cp.execSync('git branch --show-current', {cwd:KOK,encoding:'utf8'}).trim(); } catch(e){ return '?'; }})();
const son = (() => { try { return cp.execSync('git log --oneline -1', {cwd:KOK,encoding:'utf8'}).trim(); } catch(e){ return '?'; }})();
const kirli = (() => { try { return cp.execSync('git status --porcelain', {cwd:KOK,encoding:'utf8'}).trim().split('\n').filter(Boolean).length; } catch(e){ return -1; }})();

console.log(b('\n═══ GAVIA · FAZ 12 DURUM ═══'));
console.log(`branch: ${dal}   son commit: ${son}   çalışma ağacı: ${kirli === 0 ? yesil('temiz') : sari(kirli + ' değişiklik')}`);
if (HIZLI) console.log(sari('(--hizli: jsdom taramaları atlandı)'));

const L = listeYolu();
function dok(liste, girinti) {
  for (let i = 0; i < liste.length; i += 5) console.log(girinti + liste.slice(i, i + 5).join(' '));
}
console.log(b('\n1) Liste yolu benimseme'));
console.log(`   ${b('HEDEF')} — doküman matrisi (${MATRIS.length} route)`);
console.log(`     ListController: ${L.mYeni.length ? yesil(L.mYeni.length + '/' + MATRIS.length) : kirmizi('0/' + MATRIS.length)}`);
if (L.mYeni.length) dok(L.mYeni, '       ');
console.log(`     Eski yol:       ${L.mEski.length ? sari(L.mEski.length) : yesil(0)}`);
if (L.mEski.length) dok(L.mEski, '       ');
if (L.mYok.length) console.log(`     ${kirmizi('DİSKTE YOK')}: ${L.mYok.join(' ')}`);

console.log(`   ${b('HEDEF')} — detay alt koleksiyonları (${DETAY.length} ekran)`);
console.log(`     ListController: ${L.dYeni.length ? yesil(L.dYeni.length + '/' + DETAY.length) : kirmizi('0/' + DETAY.length)}` +
  (L.dYeni.length ? '  → ' + L.dYeni.join(' ') : ''));

console.log(`   ${b('HAM')} — tablo basan tüm sayfalar: ` +
  `${L.hYeni.length ? yesil(L.hYeni.length) : kirmizi(0)} yeni / ${sari(L.hEski.length)} eski` +
  `   (gvTable ortak yolu: ${L.gvTablo.length} sayfa)`);
console.log(`     kapsam dışı tablo sayfası: ${L.kapsamDisi.length}` +
  (L.kapsamDisi.length ? '  → ' + L.kapsamDisi.join(' ') : ''));

console.log(b('\n2) Ortak dosyalar'));
for (const o of ortakDosyalar()) {
  console.log(`   ${o.var ? yesil('✓') : kirmizi('✗')} assets/js/${o.ad.padEnd(20)}` +
    (o.var ? `${String(o.satir).padStart(5)} satır · ${o.kullanan} sayfa yüklüyor` : 'YOK'));
}

console.log(b('\n3) Birim testler (node --test)'));
const T = birimTestleri();
if (T.durum === 'ok') console.log(`   ${T.kaldi ? kirmizi('✗') : yesil('✓')} ${T.gecti} geçti, ${T.kaldi} kaldı (${T.dosya} dosya)`);
else console.log(`   ${sari('—')} ${T.mesaj}`);

console.log(b('\n4) Rol × sayfa taraması'));
const R = rolTaramasi();
if (R.durum === 'ok') {
  console.log(`   ${R.bulgu ? kirmizi('✗ ' + R.bulgu + ' bulgu') : yesil('✓ 0 bulgu')} ` +
    `(${R.rol} rol × ${R.sayfa} sayfa = ${R.rol * R.sayfa} kombinasyon)` +
    (R.bozuk.length ? kirmizi('  · çalışmayan rol: ' + R.bozuk.join(',')) : ''));
} else console.log(`   ${sari('—')} ${R.durum === 'jsdom-yok' ? 'jsdom bulunamadı, tarama yapılamadı' : 'atlandı (--hizli)'}`);

console.log(b('\n5) Yapı bütünlüğü ayrıştırıcısı'));
const Y = butunlukTaramasi();
if (Y.durum === 'ok') console.log(`   ${Y.temiz ? yesil('✓') : kirmizi('✗')} ${Y.sayfa} sayfa — ${Y.sonuc}`);
else if (Y.durum === 'hata') console.log(`   ${kirmizi('✗')} ${Y.mesaj}`);
else console.log(`   ${sari('—')} ${Y.durum === 'jsdom-yok' ? 'jsdom bulunamadı' : 'atlandı (--hizli)'}`);

console.log(b('\n6) LEDGER son kayıt'));
const LS = ledgerSon();
console.log('   ' + (LS || sari('kayıt yok — henüz adım tamamlanmadı')));
console.log('');
