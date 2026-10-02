/* og.mjs — Playwright para los scripts, y la imagen de 1200×630 para compartir.
   La imagen dice «Propuesta de web» mientras municipio.json tenga propuesta:true:
   en un grupo de WhatsApp no se puede confundir con la web oficial. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function cargarPlaywright() {
  const candidatos = [process.env.PLAYWRIGHT_MJS, 'playwright',
    'file:///C:/Users/alvar/Desktop/WEBS%20NEGOCIOS/alvarotaiagu.github.io/node_modules/playwright/index.mjs'].filter(Boolean);
  for (const c of candidatos) {
    try { return await import(c); } catch (e) { /* siguiente */ }
  }
  throw new Error('No encuentro Playwright: npm install (o define PLAYWRIGHT_MJS con la ruta a playwright/index.mjs)');
}

export async function generarOg(raiz, datos) {
  const { chromium } = await cargarPlaywright();
  const foto = datos.foto ? pathToFileURL(path.join(raiz, 'media', datos.foto + '.jpg')).href : null;
  const escudo = pathToFileURL(path.join(raiz, datos.escudo)).href;
  const css = pathToFileURL(path.join(raiz, 'css', 'marca.css')).href;
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<link rel="stylesheet" href="${datos.fuentes}"><link rel="stylesheet" href="${css}">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: var(--papel); color: var(--tinta); }
  .og { display: grid; grid-template-columns: 1fr 360px; gap: 64px; align-items: end; height: 630px; box-sizing: border-box; padding: 64px 80px 0; position: relative; }
  .og__escudo { height: 120px; width: auto; display: block; }
  .og__pre { margin: 36px 0 0; font: 600 26px/1.2 var(--f-texto); color: var(--marca); letter-spacing: .02em; }
  .og__nombre { margin: 8px 0 0; font: 700 84px/1.04 var(--f-titulo); max-width: 11ch; }
  .og__nota { margin: 28px 0 72px; font: 400 24px/1.4 var(--f-texto); color: var(--apagado); }
  .og__arco { width: 360px; height: 470px; border-radius: 9999px 9999px 0 0; overflow: hidden; border: 4px solid var(--marca); border-bottom: 0; box-sizing: border-box; background: var(--superficie-2); display: grid; place-items: center; }
  .og__arco img { width: 100%; height: 100%; object-fit: cover; object-position: ${datos.posicion || '50% 50%'}; }
  .og__arco .vacio { width: 40%; opacity: .25; }
  .og__umbral { position: absolute; left: 0; right: 0; bottom: 0; height: 12px; background: var(--oro); }
</style></head><body><div class="og">
  <div>
    <img class="og__escudo" src="${escudo}" alt="">
    <p class="og__pre">${datos.antetitulo}</p>
    <p class="og__nombre">${datos.nombre}</p>
    <p class="og__nota">${datos.nota}</p>
  </div>
  <div class="og__arco">${foto ? `<img src="${foto}" alt="">` : `<img class="vacio" src="${escudo}" alt="">`}</div>
  <div class="og__umbral"></div>
</div></body></html>`;
  const tmp = path.join(raiz, 'assets', '_og.html');
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, html);
  const nav = await chromium.launch();
  try {
    const p = await nav.newPage({ viewport: { width: 1200, height: 630 } });
    await p.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(raiz, 'assets', 'og.jpg'), type: 'jpeg', quality: 86 });
  } finally {
    await nav.close();
    fs.rmSync(tmp, { force: true });
  }
}
