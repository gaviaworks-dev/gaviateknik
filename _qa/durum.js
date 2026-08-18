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

const ORTAK = ['types.js', 'data-provider.js', 'list-controller.js', 'tooltip.js'];
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
function listeYolu() {
  const yeni = [], eski = [], listesiz = [];
  for (const f of sayfalar()) {
    const s = oku(f);
    const listeMi = /gvTable\(|gtable|<table/.test(s);
    if (/gvList\(|ListController|listController/.test(s)) yeni.push(f);
    else if (listeMi) eski.push(f);
    else listesiz.push(f);
  }
  return { yeni, eski, listesiz };
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
    const r = cp.execSync(`node --test "${testDizin}" 2>&1`, { encoding: 'utf8', cwd: KOK });
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
console.log(b('\n1) Liste yolu benimseme'));
console.log(`   ListController: ${L.yeni.length ? yesil(L.yeni.length) : kirmizi(0)} sayfa` +
  (L.yeni.length ? '  → ' + L.yeni.join(' ') : ''));
console.log(`   Eski yol:       ${L.eski.length ? sari(L.eski.length) : yesil(0)} sayfa`);
if (L.eski.length) {
  for (let i = 0; i < L.eski.length; i += 6) console.log('     ' + L.eski.slice(i, i + 6).join(' '));
}
console.log(`   Liste içermeyen: ${L.listesiz.length} sayfa`);

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
