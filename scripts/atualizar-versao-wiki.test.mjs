import test from 'node:test';
import assert from 'node:assert/strict';
import { atualizarBloco } from './atualizar-versao-wiki.mjs';

const release = { tag_name: 'v1.2.0', html_url: 'https://github.com/camila-ubt/calculo-pa/releases/tag/v1.2.0', draft: false, prerelease: false };
const pagina = '# Wiki\n<!-- versao-estavel:inicio -->\nVersão anterior\n<!-- versao-estavel:fim -->\nHistórico v1.0.0\n';

test('atualiza a versão e preserva o histórico; repetir não muda a página', () => {
  const resultado = atualizarBloco(pagina, release);
  assert.ok(resultado.includes('[v1.2.0](https://github.com/camila-ubt/calculo-pa/releases/tag/v1.2.0)'));
  assert.ok(resultado.startsWith('# Wiki\n'));
  assert.ok(resultado.endsWith('Histórico v1.0.0\n'));
  assert.equal(atualizarBloco(resultado, release), resultado);
});

test('recusa rascunhos, prévias e URLs externas', () => {
  for (const alteracao of [{ draft: true }, { prerelease: true }, { tag_name: 'v2.0.0-beta.1' }, { html_url: 'https://example.com/release' }]) {
    assert.throws(() => atualizarBloco(pagina, { ...release, ...alteracao }));
  }
});

test('falha explicitamente quando os marcadores estão ausentes ou duplicados', () => {
  assert.throws(() => atualizarBloco('# Wiki', release));
  assert.throws(() => atualizarBloco(pagina + pagina, release));
});
