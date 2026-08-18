const fs=require('fs'),path=require('path');
const {JSDOM}=require('./jsdom-yolu.js').yukle() || (function(){
  console.error('jsdom bulunamadı — bkz. _qa/README.md'); process.exit(2);
})();
const KOK = require('path').resolve(__dirname, '..');
const dosyalar=fs.readdirSync(KOK).filter(f=>f.endsWith('.html')).sort();
const VOID=new Set(['br','hr','img','input','meta','link','source','area','base','col','embed','param','track','wbr']);
let hata=0;

for(const f of dosyalar){
  const ham=fs.readFileSync(path.join(KOK,f),'utf8');
  const sorun=[];

  // --- 1) satır içi script'ler sözdizimi geçerli mi ---
  const dom0=new JSDOM(ham,{runScripts:'outside-only'});
  const scriptler=[...dom0.window.document.querySelectorAll('script')];
  scriptler.forEach((sc,i)=>{
    if(sc.getAttribute('src')) return;
    try{ new Function(sc.textContent); }
    catch(e){ sorun.push(`satır içi script #${i} sözdizimi: ${e.message}`); }
  });

  // --- 2) script/style dışındaki HTML'de etiket dengesi ---
  let govde=ham.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'')
               .replace(/<!--[\s\S]*?-->/g,'');
  const yigin=[];
  const re=/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)(\/?)>/g;
  let m;
  while((m=re.exec(govde))){
    const [,kapanis,ad,,kendi]=m;
    const t=ad.toLowerCase();
    if(VOID.has(t)||kendi==='/') continue;
    if(!kapanis) yigin.push(t);
    else{
      if(!yigin.length){ sorun.push(`fazladan kapanış </${t}>`); continue; }
      const son=yigin.pop();
      if(son!==t) sorun.push(`etiket eşleşmiyor: <${son}> ... </${t}>`);
    }
  }
  if(yigin.length) sorun.push(`kapanmamış: ${[...new Set(yigin)].join(', ')}`);

  // --- 3) JS string'i içinde kırılmış etiket (tırnak dengesizliği belirtisi) ---
  scriptler.forEach((sc,i)=>{
    if(sc.getAttribute('src')) return;
    const k=sc.textContent;
    // '<div ... </main>' gibi karışık kapanış: string içinde main/body/html kapanışı şüpheli
    for(const t of ['</main>','</body>','</html>']){
      if(k.includes(t)) sorun.push(`script #${i} içinde şüpheli ${t}`);
    }
  });

  // --- 4) sayfa gerçekten çalışıyor mu (kabuk + main dolu) ---
  try{
    const dom=new JSDOM(ham,{url:`https://x/${f}?role=sahip`,runScripts:'outside-only',pretendToBeVisual:true});
    const w=dom.window;
    let js=null;
    for(const sc of w.document.querySelectorAll('script')){
      const src=sc.getAttribute('src');
      const kod=src?fs.readFileSync(path.join(KOK,src),'utf8'):sc.textContent;
      try{ w.eval(kod); }catch(e){ if(!/navigation|Not implemented/.test(String(e))) js=js||String(e.message); }
    }
    if(js) sorun.push(`çalışma hatası: ${js}`);
    const ana=w.document.querySelector('.gv-main, main');
    if(ana && ana.textContent.trim().length<80) sorun.push(`main içeriği çok kısa (${ana.textContent.trim().length})`);
  }catch(e){ sorun.push(`yükleme hatası: ${e.message}`); }

  if(sorun.length){ hata++; console.log(`✗ ${f}`); sorun.forEach(x=>console.log(`    ${x}`)); }
}
console.log(`\n${dosyalar.length} sayfa ayrıştırıldı — ${hata?hata+' SAYFADA SORUN':'YAPISAL SORUN YOK'}`);
process.exit(hata?1:0);
