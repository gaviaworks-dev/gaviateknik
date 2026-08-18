/* jsdom repoya kurulu değildir (proje bilinçli olarak node_modules'suzdur).
   Aday konumlardan ilkini çözer; bulamazsa null döner ve çağıran dürüstçe
   "çalıştırılamadı" raporlar — asla varsayılan/uydurma sonuç üretmez. */
const fs = require('fs'), path = require('path');

const ADAYLAR = [
  path.join(__dirname, 'node_modules'),
  process.env.GV_JSDOM_YOLU || '',
  ...(function () {
    /* oturum scratchpad'i: /private/tmp/claude-*/
    var kok = '/private/tmp';
    var cikti = [];
    try {
      for (const a of fs.readdirSync(kok)) {
        if (!a.startsWith('claude-')) continue;
        const p1 = path.join(kok, a);
        for (const b of fs.readdirSync(p1)) {
          const p2 = path.join(p1, b);
          if (!fs.statSync(p2).isDirectory()) continue;
          for (const c of fs.readdirSync(p2)) {
            const nm = path.join(p2, c, 'scratchpad', 'node_modules');
            if (fs.existsSync(path.join(nm, 'jsdom'))) cikti.push(nm);
          }
        }
      }
    } catch (e) {}
    return cikti;
  })()
].filter(Boolean);

function coz() {
  for (const dizin of ADAYLAR) {
    if (fs.existsSync(path.join(dizin, 'jsdom'))) {
      if (!module.paths.includes(dizin)) module.paths.unshift(dizin);
      return dizin;
    }
  }
  return null;
}

module.exports = {
  coz: coz,
  yukle: function () {
    const dizin = coz();
    if (!dizin) return null;
    try { return require(path.join(dizin, 'jsdom')); } catch (e) { return null; }
  }
};
