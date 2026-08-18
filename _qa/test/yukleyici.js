/* Tarayıcı için yazılmış assets/js dosyalarını Node birim testlerinde
   çalıştırmak için asgari bir global ortam kurar. jsdom gerektirmez —
   test edilen katmanlar (types, data-provider) DOM'a dokunmaz.

   vm.createContext KULLANILMAZ: ayrı realm, Object/Array prototiplerini
   ayırır ve assert.deepStrictEqual "same structure but not reference-equal"
   diye kalır. Bunun yerine dosya, window/globalThis/localStorage gölgelenmiş
   bir fonksiyon gövdesi olarak host realm'de çalıştırılır. */
const fs = require('fs');
const path = require('path');

const KOK = path.resolve(__dirname, '..', '..');

/**
 * @param {string[]} dosyalar assets/js altındaki dosya adları, yükleme sırasında
 * @param {Object} [ekOrtam] window üzerine eklenecek nesneler (örn. demoApi)
 * @returns {Object} sahte window nesnesi
 */
function ortam(dosyalar, ekOrtam) {
  const win = {};
  win.window = win;
  win.localStorage = bellekDepo();
  Object.assign(win, ekOrtam || {});

  for (const d of dosyalar) {
    const kod = fs.readFileSync(path.join(KOK, 'assets', 'js', d), 'utf8');
    /* globalThis parametre adı olarak gölgelenebilir — ayrılmış sözcük değildir. */
    const fn = new Function('window', 'globalThis', 'localStorage', 'module', 'exports',
      '//# sourceURL=' + d + '\n' + kod);
    fn(win, win, win.localStorage, undefined, undefined);
  }
  return win;
}

function bellekDepo() {
  const m = new Map();
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
    clear: () => m.clear()
  };
}

/** Kayıt üreteci — id sıralı, alanlar öngörülebilir. */
function kayitlar(n, uret) {
  return Array.from({ length: n }, (_, i) => {
    const k = { id: 'K-' + String(i + 1).padStart(4, '0') };
    return uret ? Object.assign(k, uret(i)) : k;
  });
}

module.exports = { ortam, bellekDepo, kayitlar, KOK };
