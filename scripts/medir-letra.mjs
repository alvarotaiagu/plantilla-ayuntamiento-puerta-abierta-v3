/* medir-letra.mjs — mide la pareja tipográfica de marca.json con las letras de
   verdad (las de fonts/) y escribe marca/_letra.json, que usa aplicar.mjs.

     node scripts/medir-letra.mjs

   Dos medidas:
   1. Altura de x. El nombre del municipio (letra de titulares) va en la
      cabecera junto a «Sede electrónica» y encima del menú (letra de texto).
      Si las dos letras tienen alturas de x distintas, a igual tamaño una
      parece mayor que la otra y la cabecera «descuadra». Se calcula el factor
      de tamaño del nombre para que su altura de x sea EXACTAMENTE 1,25 veces
      la del menú: --ajuste-nombre.
   2. Tildes. En un titular de varias líneas, la tilde de la ñ de «Señora» o de
      una Á no puede tocar los rasgos descendentes (g, p, y) de la línea de
      arriba (memoria «condensada + tildes»). El interlineado mínimo es la
      suma de las dos alturas más un respiro: --interlineado-titulos. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cargarPlaywright } from './og.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const marca = JSON.parse(fs.readFileSync(path.join(RAIZ, 'marca/marca.json'), 'utf8'));
const RAZON_X = 1.25;
const RESPIRO = 0.04;

const { chromium } = await cargarPlaywright();
const nav = await chromium.launch();
try {
  const page = await nav.newPage();
  const tmp = path.join(RAIZ, 'css', '_medir.html');
  fs.writeFileSync(tmp, `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="fuentes.css"><body>
    <span style="font:700 20px '${marca.letra.titulares}'">Señora Á</span><span style="font:600 20px '${marca.letra.texto}'">x</span>`);
  await page.goto(pathToFileURL(tmp).href);
  const m = await page.evaluate(async ({ tit, tex }) => {
    await Promise.all([document.fonts.load(`700 100px '${tit}'`), document.fonts.load(`600 100px '${tit}'`), document.fonts.load(`600 100px '${tex}'`)]);
    const c = document.createElement('canvas').getContext('2d');
    const medir = (fuente, texto) => { c.font = fuente; const t = c.measureText(texto); return { asc: t.actualBoundingBoxAscent / 100, desc: t.actualBoundingBoxDescent / 100 }; };
    return {
      cargadas: document.fonts.check(`700 100px '${tit}'`) && document.fonts.check(`600 100px '${tex}'`),
      x_titulo: medir(`700 100px '${tit}'`, 'x').asc,
      x_texto: medir(`600 100px '${tex}'`, 'x').asc,
      tilde_n: medir(`700 100px '${tit}'`, 'ñ').asc,
      tilde_mayus: medir(`700 100px '${tit}'`, 'ÁÉÍÓÚÑ').asc,
      bajada: medir(`700 100px '${tit}'`, 'gjpqy').desc
    };
  }, { tit: marca.letra.titulares, tex: marca.letra.texto });
  fs.rmSync(tmp, { force: true });
  if (!m.cargadas) throw new Error('Las letras no han cargado: ejecuta antes node scripts/fuentes.mjs');

  const ajuste = +(RAZON_X * m.x_texto / m.x_titulo).toFixed(3);
  const minimo = m.tilde_n + m.bajada + RESPIRO;
  const interlineado = +Math.max(1.12, Math.ceil(minimo * 100) / 100).toFixed(2);
  const salida = {
    _leeme: 'GENERADO por scripts/medir-letra.mjs. Lo usa aplicar.mjs para --ajuste-nombre y --interlineado-titulos.',
    titulares: marca.letra.titulares, texto: marca.letra.texto,
    altura_x: { titulares: +m.x_titulo.toFixed(3), texto: +m.x_texto.toFixed(3) },
    razon_x_nombre_menu: RAZON_X,
    ajuste_nombre: ajuste,
    tilde_n: +m.tilde_n.toFixed(3), tilde_mayuscula: +m.tilde_mayus.toFixed(3), bajada: +m.bajada.toFixed(3),
    interlineado_titulos: interlineado,
    nota_mayusculas: m.tilde_mayus + m.bajada + RESPIRO > interlineado
      ? `Una mayúscula con tilde justo debajo de una g o una p necesitaría ${(m.tilde_mayus + m.bajada + RESPIRO).toFixed(2)}; con ${interlineado} solo se rozan si coinciden en la misma columna. Revísalo en las capturas.`
      : 'Las mayúsculas con tilde también caben.'
  };
  fs.writeFileSync(path.join(RAIZ, 'marca/_letra.json'), JSON.stringify(salida, null, 2) + '\n');
  console.log(`✓ marca/_letra.json: altura de x ${salida.altura_x.titulares} (${marca.letra.titulares}) y ${salida.altura_x.texto} (${marca.letra.texto});` +
    ` nombre ×${ajuste} del menú; interlineado de titulares ${interlineado} (ñ ${salida.tilde_n} + bajada ${salida.bajada} + ${RESPIRO})`);
} finally {
  await nav.close();
}
