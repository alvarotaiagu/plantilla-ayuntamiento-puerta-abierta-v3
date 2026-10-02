/* tablon.mjs — trae el tablón de anuncios de la sede y escribe contenido/tablon.json.

     node scripts/tablon.mjs                    lee la sede (si está autorizado)
     node scripts/tablon.mjs --desde f.html     lee una copia guardada del tablón
     node scripts/tablon.mjs --probar           pruebas sin red (patrones y copia)
     node scripts/tablon.mjs --url <url>        otra dirección (lo usan las pruebas)

   Qué hace:
   - Gestiona no tiene RSS ni JSON ni CORS (comprobado el 02/10/2026): se lee el
     HTML de /board, que viene pintado desde el servidor. Son los 10 últimos;
     el resto se consulta en la sede. Las sedes de la Diputación aún no tienen
     lector: se queda el tablon.json que haya.
   - Excluye lo que lleva datos personales (lib/tablon.mjs → motivoPersonal).
   - Conserva lo que haya puesto una persona: titulo_claro, tema, oculto.
   - Fallo silencioso: si la sede no responde o cambia el marcado, NO toca el
     tablon.json que hay y sale con código 0. La web sigue con lo último bueno.

   robots.txt: la sede de Ribera prohíbe a los robots todo salvo /info. Por eso
   la lectura automática solo se hace con `"tablon_autorizado": true` en
   municipio.json, que se pone cuando el Ayuntamiento (titular de la sede) lo
   autoriza por escrito. Mientras tanto, se trabaja con --desde. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsearGestiona, motivoPersonal, fusionar, CASOS_PRUEBA } from './lib/tablon.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = n => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const destino = path.resolve(RAIZ, arg('--salida') || 'contenido/tablon.json');
const municipio = JSON.parse(fs.readFileSync(path.resolve(RAIZ, arg('--municipio') || 'municipio.json'), 'utf8'));
const sede = municipio.sede;

function leerPrevio() {
  try { return JSON.parse(fs.readFileSync(destino, 'utf8')); } catch (e) { return { entradas: [], excluidas: 0 }; }
}

function procesar(crudas, origen) {
  const previo = leerPrevio();
  const excluidas = [];
  const validas = [];
  for (const e of crudas) {
    const m = motivoPersonal(e);
    if (m) excluidas.push({ fecha: e.fecha, motivo: m }); else validas.push(e);
  }
  const entradas = fusionar(validas, previo.entradas);
  return {
    _leeme: 'GENERADO por scripts/tablon.mjs. Se puede editar a mano titulo_claro (título en lenguaje claro), tema (+ "tema_manual": true) y oculto. Lo demás se pisa al refrescar.',
    fuente: origen,
    actualizado: new Date().toISOString(),
    excluidas: excluidas.length,
    motivos_exclusion: [...new Set(excluidas.map(x => x.motivo))],
    entradas
  };
}

function escribir(datos) {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, JSON.stringify(datos, null, 2) + '\n');
  console.log(`✓ ${path.relative(RAIZ, destino)}: ${datos.entradas.length} anuncios, ${datos.excluidas} fuera por datos personales`);
}

async function robotsPermite(base, ruta) {
  try {
    const r = await fetch(new URL('/robots.txt', base), { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return true;
    const lineas = (await r.text()).split(/\r?\n/).map(l => l.replace(/#.*/, '').trim());
    let aplica = false; const reglas = [];
    for (const l of lineas) {
      const [k, ...v] = l.split(':'); const val = v.join(':').trim();
      if (/^user-agent$/i.test(k)) aplica = val === '*';
      else if (aplica && /^(dis)?allow$/i.test(k) && val) reglas.push([/^allow$/i.test(k), val]);
    }
    const casa = reglas.filter(([, p]) => new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')).test(ruta))
      .sort((a, b) => b[1].length - a[1].length);
    return casa.length ? casa[0][0] : true;
  } catch (e) { return true; }
}

function decodificar(buf) {
  const utf = new TextDecoder('utf-8', { fatal: false }).decode(buf);
  return utf;
}

async function deLaSede() {
  if (sede.tipo !== 'gestiona') {
    console.log('· Sede de tipo «' + sede.tipo + '»: todavía no hay lector automático. Se queda el tablon.json actual.');
    return;
  }
  const url = arg('--url') || sede.base.replace(/\/$/, '') + '/board';
  if (!arg('--url')) {
    if (!municipio.tablon_autorizado) {
      console.log('· Lectura automática sin autorizar («tablon_autorizado» en municipio.json). Se queda el tablon.json actual.');
      return;
    }
    if (!(await robotsPermite(sede.base, '/board'))) console.log('· robots.txt no lo permite, pero el Ayuntamiento lo ha autorizado: se lee con identificación.');
  }
  try {
    const r = await fetch(url, {
      headers: { 'user-agent': 'WebMunicipal-Tablon/1.0 (lectura autorizada por el Ayuntamiento; una vez al día)', 'accept-language': 'es' },
      signal: AbortSignal.timeout(15000)
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const html = decodificar(new Uint8Array(await r.arrayBuffer()));
    const crudas = parsearGestiona(html, url);
    if (!crudas.length) throw new Error('el tablón vino vacío');
    escribir(procesar(crudas, url));
  } catch (e) {
    console.log('· La sede no responde o ha cambiado (' + e.message + '). Se queda el tablon.json actual.');
  }
}

function probar() {
  let fallos = 0;
  for (const [entrada, esperado] of CASOS_PRUEBA) {
    const m = motivoPersonal({ descripcion: '', procedimiento: '', categoria: '', ...entrada });
    const ok = esperado === null ? m === null : m !== null;
    if (!ok) { fallos++; console.log('✗ «' + entrada.titulo + '» → ' + m + ' (esperado: ' + esperado + ')'); }
  }
  const copia = path.join(RAIZ, 'pruebas/tablon/board-ribera.html');
  const crudas = parsearGestiona(fs.readFileSync(copia, 'utf8'), 'https://riberadelfresno.sedelectronica.es/board');
  const fuera = crudas.filter(e => motivoPersonal(e));
  if (crudas.length !== 10 || fuera.length !== 2) { fallos++; console.log(`✗ copia de Ribera: ${crudas.length} filas, ${fuera.length} fuera (esperado 10 y 2)`); }
  if (crudas.some(e => !e.fecha || !/preview-document/.test(e.url))) { fallos++; console.log('✗ copia de Ribera: filas sin fecha o sin enlace'); }
  console.log(fallos ? `✗ ${fallos} pruebas del tablón fallan` : `✓ tablón: ${CASOS_PRUEBA.length} patrones y la copia de la sede (10 filas, 2 fuera)`);
  process.exitCode = fallos ? 1 : 0;
}

if (args.includes('--probar')) probar();
else if (arg('--desde')) {
  const f = path.resolve(arg('--desde'));
  escribir(procesar(parsearGestiona(fs.readFileSync(f, 'utf8'), sede.base.replace(/\/$/, '') + '/board'), sede.base.replace(/\/$/, '') + '/board (copia del ' + (arg('--fecha') || 'día') + ')'));
} else await deLaSede();
