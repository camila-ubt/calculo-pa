import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function atualizarBloco(texto, release) {
  if (release.draft !== false || release.prerelease !== false ||
      !/^v?\d+\.\d+\.\d+$/.test(release.tag_name)) {
    throw new Error('A release deve ser uma versão estável publicada.');
  }
  const url = new URL(release.html_url);
  if (url.origin !== 'https://github.com' ||
      !url.pathname.startsWith('/camila-ubt/calculo-pa/releases/tag/')) {
    throw new Error('URL de release inválida.');
  }
  const bloco = /<!-- versao-estavel:inicio -->[\s\S]*?<!-- versao-estavel:fim -->/g;
  if ([...texto.matchAll(bloco)].length !== 1) {
    throw new Error('A página deve conter exatamente um bloco de versão estável.');
  }
  return texto.replace(bloco, () =>
    `<!-- versao-estavel:inicio -->\n**Última versão estável: [${release.tag_name}](${url.href})**\n<!-- versao-estavel:fim -->`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const repo = process.env.GITHUB_REPOSITORY || 'camila-ubt/calculo-pa';
  const release = JSON.parse(execFileSync('gh', ['api', `repos/${repo}/releases/latest`], { encoding: 'utf8' }));
  const diretorio = process.argv[2] || 'docs/wiki';
  // Validar todas as páginas antes de escrever qualquer uma delas.
  const paginas = ['Home.md', '_Footer.md'].map(nome => {
    const caminho = resolve(diretorio, nome);
    return [caminho, atualizarBloco(readFileSync(caminho, 'utf8'), release)];
  });
  for (const [caminho, texto] of paginas) writeFileSync(caminho, texto);
  console.log(`Wiki preparada para ${release.tag_name}.`);
}
