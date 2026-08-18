const fs=require('fs'),path=require('path');
const {JSDOM}=require('./jsdom-yolu.js').yukle() || (function(){
  console.error('jsdom bulunamadı — bkz. _qa/README.md'); process.exit(2);
})();
const KOK = require('path').resolve(__dirname, '..');
// yasak kombinasyonlar: rol → görmemesi gereken iç panel sayfası
const test=[
 ['musteri','panel.html'],['musteri','faturalar.html'],['musteri','taseronlar.html'],
 ['musteri','hakedisler.html'],['musteri','islem-kayitlari.html'],['musteri','raporlar.html'],
 ['taseron','faturalar.html'],['taseron','musteriler.html'],['taseron','teklifler.html'],
 ['taseron','ayarlar.html'],['saha','ayarlar.html'],['saha','roller-yetkiler.html'],
];
let ihlal=0;
for(const [rol,sayfa] of test){
  const html=fs.readFileSync(path.join(KOK,sayfa),'utf8');
  const dom=new JSDOM(html,{url:`https://x/${sayfa}?role=${rol}`,runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;
  let yonlendi=false;
  const vc=w._virtualConsole||w.virtualConsole;
  dom.virtualConsole.on('jsdomError',e=>{ if(/Not implemented: navigation/.test(e.message)) yonlendi=true; });
  try{
    for(const sc of dom.window.document.querySelectorAll('script')){
      const src=sc.getAttribute('src');
      const kod=src?fs.readFileSync(path.join(KOK,src),'utf8'):sc.textContent;
      try{ w.eval(kod); }catch(e){ if(/navigation|Not implemented/.test(String(e))) yonlendi=true; }
    }
  }catch(e){}
  // yönlendirme olduysa koruma çalıştı; olmadıysa main dolu mu bak
  const main=w.document.querySelector('.gv-main');
  const dolu=main?main.textContent.trim().length:0;
  const ok=yonlendi;
  if(!ok) ihlal++;
  console.log((ok?'✓':'✗'), `${rol.padEnd(9)} → ${sayfa.padEnd(22)} ${ok?'yönlendirildi (koruma çalıştı)':'ERİŞTİ! main='+dolu+' krktr'}`);
}
console.log(ihlal? `\n✗ ${ihlal} YETKİSİZ ERİŞİM` : '\n✓ bütün yasak kombinasyonlarda koruma çalıştı');
process.exit(ihlal?1:0);
