/* fuentes.mjs — baja las letras de marca.json → letra.google y las sirve la propia web.

     node scripts/fuentes.mjs

   Una web municipal no debería mandar la IP de cada vecino a Google para pintar
   una letra: los woff2 se guardan en fonts/ y css/fuentes.css los declara.
   Solo los alfabetos latin y latin-ext (castellano, catalán, gallego, euskera,
   portugués). Se vuelve a ejecutar si se cambia la pareja en marca.json. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const marca = JSON.parse(fs.readFileSync(path.join(RAIZ, 'marca/marca.json'), 'utf8'));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const r = await fetch('https://fonts.googleapis.com/css2?' + marca.letra.google + '&display=swap', { headers: { 'user-agent': UA } });
if (!r.ok) throw new Error('Google Fonts respondió ' + r.status);
const css = await r.text();
const bloques = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]+\})/g)];
const dir = path.join(RAIZ, 'fonts');
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
let salida = '/* GENERADO por scripts/fuentes.mjs desde marca/marca.json → letra.google. No editar. */\n';
let n = 0;
for (const [, subconjunto, cara] of bloques) {
  if (!['latin', 'latin-ext'].includes(subconjunto)) continue;
  const familia = cara.match(/font-family:\s*'([^']+)'/)[1];
  const estilo = cara.match(/font-style:\s*(\w+)/)[1];
  const peso = cara.match(/font-weight:\s*([\d ]+)/)[1].trim();
  const url = cara.match(/url\((https:[^)]+\.woff2)\)/)[1];
  const nombre = `${familia.toLowerCase().replace(/\s+/g, '-')}-${peso.replace(/\s+/g, '_')}${estilo === 'italic' ? 'i' : ''}-${subconjunto}.woff2`;
  const f = await fetch(url, { headers: { 'user-agent': UA } });
  fs.writeFileSync(path.join(dir, nombre), Buffer.from(await f.arrayBuffer()));
  salida += cara.replace(/url\([^)]+\)/, `url(../fonts/${nombre})`).replace(/\s+/g, ' ').replace('{ ', '{\n  ').replace(/; /g, ';\n  ').replace(' }', '\n}') + '\n';
  n++;
}
if (!n) throw new Error('No ha llegado ninguna cara latin: revisa marca.json → letra.google');
fs.writeFileSync(path.join(RAIZ, 'css/fuentes.css'), salida);
console.log(`✓ ${n} archivos en fonts/ y css/fuentes.css`);
