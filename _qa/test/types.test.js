const { test } = require('node:test');
const assert = require('node:assert');
const { ortam } = require('./yukleyici.js');

const w = ortam(['types.js']);
const GV = w.GV;

test('sorguVarsayilan doküman varsayılanlarını verir (sayfa 1, boyut 20)', () => {
  const s = GV.sorguVarsayilan();
  assert.strictEqual(s.page, 1);
  assert.strictEqual(s.pageSize, 20);
  assert.deepStrictEqual(s.sort, []);
  assert.deepStrictEqual(s.filters, {});
});

test('pageSize yalnız 10/20/50 olabilir', () => {
  assert.deepStrictEqual(GV.SAYFA_BOYUTLARI, [10, 20, 50]);
  assert.strictEqual(GV.sorguNormalize({ pageSize: 10 }).pageSize, 10);
  assert.strictEqual(GV.sorguNormalize({ pageSize: 50 }).pageSize, 50);
});

test('pageSize=100000 normalize edilir; adapter maksimumu aşmaz', () => {
  assert.strictEqual(GV.sorguNormalize({ pageSize: 100000 }).pageSize, 50);
  assert.strictEqual(GV.sorguNormalize({ pageSize: 15 }).pageSize, 10);
  assert.strictEqual(GV.sorguNormalize({ pageSize: 'abc' }).pageSize, 20);
  assert.strictEqual(GV.sorguNormalize({ pageSize: -5 }).pageSize, 20);
  assert.strictEqual(GV.sorguNormalize({ pageSize: 0 }).pageSize, 20);
});

test('page en az 1 olur', () => {
  assert.strictEqual(GV.sorguNormalize({ page: 0 }).page, 1);
  assert.strictEqual(GV.sorguNormalize({ page: -9 }).page, 1);
  assert.strictEqual(GV.sorguNormalize({ page: '4' }).page, 4);
  assert.strictEqual(GV.sorguNormalize({ page: 2.9 }).page, 2);
});

test('sort metinden ve diziden çözülür, çift yönlü yazılır', () => {
  assert.deepStrictEqual(GV.siraCoz('updatedAt:desc,ad:asc'), [
    { field: 'updatedAt', direction: 'desc' },
    { field: 'ad', direction: 'asc' }
  ]);
  assert.deepStrictEqual(GV.siraCoz('ad'), [{ field: 'ad', direction: 'asc' }]);
  assert.deepStrictEqual(GV.siraCoz(''), []);
  assert.strictEqual(GV.siraYaz([{ field: 'ad', direction: 'desc' }]), 'ad:desc');
  assert.strictEqual(GV.siraYaz([]), null);
  assert.strictEqual(GV.sorguNormalize({ sort: 'tarih:desc' }).sort[0].field, 'tarih');
});

test('bilinmeyen sıralama yönü asc kabul edilir', () => {
  assert.strictEqual(GV.siraCoz('ad:YUKARI')[0].direction, 'asc');
});

test('filters: boş değerler düşer, skaler değer diziye çevrilir, aralık korunur', () => {
  const s = GV.sorguNormalize({
    filters: { kat: 'A', bos: '', yok: null, cok: ['x', 'y'], bosDizi: [], fiyat: { min: 10, max: '' }, bosAralik: { min: '', max: '' } }
  });
  assert.deepStrictEqual(s.filters, { kat: ['A'], cok: ['x', 'y'], fiyat: { min: 10, max: '' } });
});

test('q kırpılır', () => {
  assert.strictEqual(GV.sorguNormalize({ q: '  forklift ' }).q, 'forklift');
  assert.strictEqual(GV.sorguNormalize({}).q, '');
});

test('kelepce alt/üst sınıra çeker', () => {
  assert.strictEqual(GV.kelepce(9, 1, 5), 5);
  assert.strictEqual(GV.kelepce(0, 1, 5), 1);
  assert.strictEqual(GV.kelepce('x', 1, 5), 1);
});
