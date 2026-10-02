/* escudo.mjs — prepara el escudo del municipio para la web.

     node scripts/escudo.mjs ruta/al/escudo.svg      (o .png)
     node scripts/escudo.mjs ruta/escudo.svg --dir pruebas/segura-de-leon/marca

   Deja en marca/ (o en --dir):
     escudo.svg | escudo-original.png   el original, intacto (de él salen los colores)
     escudo-480.png                     480 px de alto: hueco del retrato, og:image, análisis
     escudo-160.png                     160 px de alto: cabecera y pie (se ve a 56-72 px)
     favicon-64.png                     cuadrado, para el favicon

   Los escudos de Commons suelen ser SVG muy pesados (el de Ribera tiene 1.800
   trazos solo en la copa del fresno): en la web van como PNG, que pesa menos y
   se pinta igual. El escudo NUNCA cambia de color: ni con la paleta ni con nada. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cargarPlaywright } from './og.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const origen = args.find(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--dir');
if (!origen) { console.error('Uso: node scripts/escudo.mjs ruta/al/escudo.svg [--dir carpeta]'); process.exit(1); }
const dir = path.resolve(RAIZ, args.includes('--dir') ? args[args.indexOf('--dir') + 1] : 'marca');
fs.mkdirSync(dir, { recursive: true });

const ext = path.extname(origen).toLowerCase();
const copia = path.join(dir, ext === '.svg' ? 'escudo.svg' : 'escudo-original' + ext);
if (path.resolve(origen) !== copia) fs.copyFileSync(origen, copia);

const { chromium } = await cargarPlaywright();
const nav = await chromium.launch();
try {
  const page = await nav.newPage({ deviceScaleFactor: 1 });
  async function pintar(alto, salida, cuadrado = 0) {
    const html = `<!doctype html><html><body style="margin:0;background:transparent">
      <div id="c" style="display:inline-grid;place-items:center;${cuadrado ? `width:${cuadrado}px;height:${cuadrado}px` : ''}">
      <img id="e" src="${pathToFileURL(copia).href}" style="display:block;height:${alto}px;width:auto"></div></body></html>`;
    /* desde file:// y no con setContent: about:blank no puede cargar un file:// */
    const tmp = path.join(dir, '_escudo.html');
    fs.writeFileSync(tmp, html);
    await page.goto(pathToFileURL(tmp).href);
    fs.rmSync(tmp, { force: true });
    await page.waitForFunction(() => document.getElementById('e').complete && document.getElementById('e').naturalWidth > 0);
    await page.locator('#c').screenshot({ path: path.join(dir, salida), omitBackground: true });
  }
  await pintar(480, 'escudo-480.png');
  await pintar(160, 'escudo-160.png');
  await pintar(60, 'favicon-64.png', 64);
  const [w, h] = await page.evaluate(() => { const i = document.getElementById('e'); return [i.naturalWidth, i.naturalHeight]; });
  console.log(`✓ escudo en ${path.relative(RAIZ, dir).replace(/\\/g, '/')}/: original ${path.basename(copia)} (${w}×${h}), escudo-480.png, escudo-160.png, favicon-64.png`);
  console.log('  Siguiente paso: python scripts/marca-desde-escudo.py' + (args.includes('--dir') ? ' --dir ' + args[args.indexOf('--dir') + 1] : ''));
} finally {
  await nav.close();
}
