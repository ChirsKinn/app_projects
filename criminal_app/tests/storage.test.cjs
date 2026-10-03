const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

test('crime storage appends, retrieves by UUID, updates, and survives module reload', async () => {
  const data = new Map();
  const storage = { getItem: async key => data.get(key) ?? null, setItem: async (key, value) => data.set(key, value) };
  function load() {
    const source = fs.readFileSync('storage/crimeStorage.ts', 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
    const sandbox = { exports: {}, require: () => storage };
    vm.runInNewContext(compiled, sandbox);
    return sandbox.exports;
  }
  const api = load();
  assert.equal((await api.getCrimes()).length, 0);
  const draft = { id: 'uuid-1', title: 'Original', details: '', date: '2026-10-03T12:00:00.000Z', solved: false, imageUri: null };
  assert.equal((await api.getCrimes()).length, 0);
  await api.saveCrime(draft);
  await api.saveCrime({ ...draft, id: 'uuid-2' });
  const localEdit = await api.getCrime(draft.id);
  localEdit.title = 'Unsaved';
  assert.equal((await api.getCrime(draft.id)).title, 'Original');
  await api.saveCrime({ ...localEdit, solved: true, imageUri: 'file:///photo.jpg' });
  const restarted = load();
  assert.equal((await restarted.getCrimes()).length, 2);
  assert.equal((await restarted.getCrime(draft.id)).title, 'Unsaved');
  assert.equal((await restarted.getCrime(draft.id)).solved, true);
  assert.equal((await restarted.getCrime(draft.id)).imageUri, 'file:///photo.jpg');
  assert.equal(await restarted.getCrime('missing'), undefined);
});
