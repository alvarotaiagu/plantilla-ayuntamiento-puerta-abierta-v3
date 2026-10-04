/* termino.mjs — el mapa del término municipal para «El pueblo», desde OpenStreetMap, EN BUILD.

     node scripts/termino.mjs                          busca el término en OSM y escribe
                                                       marca/termino.svg + marca/termino.json
     node scripts/termino.mjs --relacion 344567        la relación del término, si el nombre no basta
     node scripts/termino.mjs --lugar "Oppidum de Hornachuelos=way/123"
                                                       fija el elemento de OSM de un lugar (repetible)
     node scripts/termino.mjs --guardar copia.json     guarda lo que ha devuelto Overpass
     node scripts/termino.mjs --desde copia.json       sin red: dibuja desde una copia guardada

   Lo que dibuja (todo de OSM, nada a mano):
     · el contorno del término: la relación boundary=administrative, admin_level=8, con el nombre
       del municipio (municipio.json → nombre);
     · el casco urbano: las áreas landuse=residential a menos de 2 km del nodo place=town/village
       del pueblo;
     · las carreteras (trunk, primary, secondary, tertiary) con su matrícula (ref);
     · las rutas que existan en OSM como relaciones route=hiking/foot/bicycle dentro del término;
     · los lugares de municipio.json → pueblo.lugares y pueblo.patrimonio que estén en OSM DENTRO
       del término (así son los de este pueblo y no los de otro con el mismo nombre). Se buscan por
       nombre: tienen que estar en el nombre de OSM todas las palabras del nuestro (o todas las del
       de OSM en el nuestro), sin contar «de», «la», «san»… Si dos lugares quieren el mismo
       elemento, o uno encaja con varios, se avisa y no se pone: se fija con --lugar.

   marca/termino.svg lleva solo la geometría (path, text, g, rect: sin colores; los pone
   css/base.css). Los puntos numerados, sus enlaces a la ficha de cada lugar, la leyenda y la escala
   los pinta aplicar.mjs desde marca/termino.json (posición en el lienzo de cada lugar, ids de OSM,
   fecha y atribución). Lo usado se reutiliza la próxima vez (relación y --lugar fijados).

   Ni una petición en la web: esto se ejecuta una vez al montarla. User-Agent del proyecto, sin
   datos de nadie. ODbL: la página lleva «© colaboradores de OpenStreetMap». */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { overpass, red, esc, simplificar, dDe, anillos, palabras, parecido, ATRIBUCION, ATRIBUCION_URL } from './lib/osm.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = n => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const todos = n => args.flatMap((a, i) => (a === n ? [args[i + 1]] : []));
const M = JSON.parse(fs.readFileSync(path.join(RAIZ, 'municipio.json'), 'utf8'));
const rutaMeta = path.join(RAIZ, 'marca/termino.json');
const previa = fs.existsSync(rutaMeta) ? JSON.parse(fs.readFileSync(rutaMeta, 'utf8')) : {};
const slugDe = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const VW = 600, MARGEN = 18;                     /* el lienzo: 600 de ancho; el alto sale del término */
const CARRETERA = /^(motorway|trunk|primary|secondary|tertiary)(_link)?$/;

/* los lugares a buscar: los de «Qué ver» y los del patrimonio, sin repetir */
const P = M.pueblo || {};
const buscados = [];
for (const l of [...(P.lugares || []), ...(P.patrimonio || [])]) if (l.nombre && !buscados.some(b => slugDe(b) === slugDe(l.nombre))) buscados.push(l.nombre);
/* fijados a mano: --lugar "Nombre=tipo/id" y los que ya trae termino.json */
const fijados = new Map((previa.lugares || []).filter(l => l.fijado).map(l => [l.nombre, l.osm]));
for (const s of todos('--lugar')) {
  const i = s.lastIndexOf('=');
  if (i < 0 || !/^(node|way|relation)\/\d+$/.test(s.slice(i + 1))) throw new Error('--lugar "Nombre=node/123"');
  fijados.set(s.slice(0, i).trim(), s.slice(i + 1));
}

/* ── 1. los datos (Overpass o una copia) ── */
let datos;
if (arg('--desde')) datos = JSON.parse(fs.readFileSync(arg('--desde'), 'utf8'));
else {
  const nombre = M.nombre.replace(/"/g, '');
  const idRel = arg('--relacion') || (previa.relacion || '').replace(/^relation\//, '') || null;
  const sel = idRel ? `relation(id:${idRel})` : `relation["boundary"="administrative"]["admin_level"="8"]["name"="${nombre}"]`;
  const r1 = await overpass(`[out:json][timeout:120];${sel};out geom;`);
  const rels = r1.elements.filter(e => e.type === 'relation');
  if (!rels.length) throw new Error(`OSM no tiene el término «${M.nombre}» (admin_level=8). Búscalo en openstreetmap.org y pásalo con --relacion`);
  if (rels.length > 1) console.log(`! Hay ${rels.length} términos con ese nombre (${rels.map(r => r.id).join(', ')}); uso el primero. Si no es, --relacion`);
  const limite = rels[0];
  const area = 3600000000 + limite.id;
  const nombresRe = [...new Set(buscados.flatMap(palabras))].filter(w => w.length > 3).map(w => w.replace(/[^a-z0-9]/g, '')).join('|');
  await new Promise(r => setTimeout(r, 1000));
  const r2 = await overpass(`[out:json][timeout:180];area(${area})->.a;(` +
    `node(area.a)["place"~"^(town|village|city)$"]["name"="${nombre}"];` +
    `way(area.a)["highway"~"^(motorway|trunk|primary|secondary|tertiary)(_link)?$"];` +
    `relation(area.a)["route"~"^(hiking|foot|bicycle|mtb)$"];` +
    (nombresRe ? `nwr(area.a)["name"~"${nombresRe}",i];` : '') +
    `);out geom;`);
  const pueblo = r2.elements.find(e => e.type === 'node' && e.tags && e.tags.place);
  let casco = [];
  if (pueblo) {
    await new Promise(r => setTimeout(r, 1000));
    const r3 = await overpass(`[out:json][timeout:120];way(around:2000,${pueblo.lat},${pueblo.lon})["landuse"="residential"];out geom;`);
    casco = r3.elements;
  }
  for (const [nombreL, osm] of fijados) {
    if (r2.elements.some(e => e.type + '/' + e.id === osm)) continue;
    const [t, id] = osm.split('/');
    await new Promise(r => setTimeout(r, 1000));
    const rx = await overpass(`[out:json][timeout:60];${t}(id:${id});out center tags;`);
    if (!rx.elements.length) console.log(`! --lugar «${nombreL}»: OSM no tiene ${osm}`);
    r2.elements.push(...rx.elements);
  }
  datos = { limite, pueblo: pueblo || null, casco, elementos: r2.elements, fecha: new Date().toISOString().slice(0, 10) };
}
if (arg('--guardar')) fs.writeFileSync(arg('--guardar'), JSON.stringify(datos));

/* ── 2. proyección: uniforme (la misma escala en x y en y), centrada en el término ── */
const contorno = anillos(datos.limite);
if (!contorno.length) throw new Error('La relación ' + datos.limite.id + ' no trae un contorno cerrado');
const todosPts = contorno.flat();
const lat0 = (Math.min(...todosPts.map(p => p.lat)) + Math.max(...todosPts.map(p => p.lat))) / 2;
const kx = Math.cos(lat0 * Math.PI / 180) * 111320, ky = 110574;          /* metros por grado */
const mx = todosPts.map(p => p.lon * kx), my = todosPts.map(p => -p.lat * ky);
const [x0, x1, y0, y1] = [Math.min(...mx), Math.max(...mx), Math.min(...my), Math.max(...my)];
const escala = (VW - 2 * MARGEN) / (x1 - x0);                               /* unidades por metro */
const VH = Math.round((y1 - y0) * escala + 2 * MARGEN + 26);                /* abajo, sitio para la escala */
const proy = ({ lat, lon }) => [MARGEN + (lon * kx - x0) * escala, MARGEN + (-lat * ky - y0) * escala];
const centroDe = e => e.lat != null ? { lat: e.lat, lon: e.lon } : e.center ? e.center
  : e.geometry && e.geometry.length ? { lat: e.geometry.reduce((s, p) => s + p.lat, 0) / e.geometry.length, lon: e.geometry.reduce((s, p) => s + p.lon, 0) / e.geometry.length }
  : e.bounds ? { lat: (e.bounds.minlat + e.bounds.maxlat) / 2, lon: (e.bounds.minlon + e.bounds.maxlon) / 2 } : null;
/* ¿dentro del término? (par-impar sobre los anillos) */
function dentro({ lat, lon }) {
  let c = false;
  for (const a of contorno) for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
    const [pi, pj] = [a[i], a[j]];
    if ((pi.lat > lat) !== (pj.lat > lat) && lon < (pj.lon - pi.lon) * (lat - pi.lat) / (pj.lat - pi.lat) + pi.lon) c = !c;
  }
  return c;
}
/* recorte de una línea al lienzo (Liang-Barsky por segmento) */
function recortar(pts) {
  const out = []; let actual = null;
  for (let i = 0; i + 1 < pts.length; i++) {
    let [ax, ay] = pts[i], [bx, by] = pts[i + 1], t0 = 0, t1 = 1, fuera = false;
    const dx = bx - ax, dy = by - ay;
    for (const [p, q] of [[-dx, ax], [dx, VW - ax], [-dy, ay], [dy, VH - ay]]) {
      if (p === 0) { if (q < 0) fuera = true; continue; }
      const r = q / p;
      if (p < 0) { if (r > t1) fuera = true; else if (r > t0) t0 = r; } else { if (r < t0) fuera = true; else if (r < t1) t1 = r; }
    }
    if (fuera) { if (actual) out.push(actual); actual = null; continue; }
    const s = [[ax + t0 * dx, ay + t0 * dy], [ax + t1 * dx, ay + t1 * dy]];
    if (actual && Math.hypot(actual[actual.length - 1][0] - s[0][0], actual[actual.length - 1][1] - s[0][1]) < 0.01) actual.push(s[1]);
    else { if (actual) out.push(actual); actual = s; }
  }
  if (actual) out.push(actual);
  return out;
}

/* ── 3. capas ── */
const limiteD = dDe(contorno.map(a => simplificar(a.map(proy), 0.5)), true);
const cascoD = dDe((datos.casco || []).filter(w => w.geometry && w.geometry.length > 3).map(w => simplificar(w.geometry.filter(Boolean).map(proy), 0.4)), true);
const carreteras = [], refs = new Map();
for (const e of datos.elementos.filter(e => e.type === 'way' && e.tags && CARRETERA.test(e.tags.highway || '') && e.geometry)) {
  const lineas = recortar(e.geometry.filter(Boolean).map(proy)).map(l => simplificar(l, 0.5));
  carreteras.push(...lineas);
  const ref = (e.tags.ref || '').split(';')[0].trim();
  if (ref) for (const l of lineas) {
    const largo = l.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - l[i][0], p[1] - l[i][1]), 0);
    if (!refs.has(ref) || refs.get(ref).largo < largo) refs.set(ref, { largo, l });
  }
}
const rutas = datos.elementos.filter(e => e.type === 'relation' && e.tags && /^(hiking|foot|bicycle|mtb)$/.test(e.tags.route || ''));
const rutasD = rutas.map(r => ({ r, d: dDe((r.members || []).filter(m => m.type === 'way' && m.geometry).flatMap(m => recortar(m.geometry.filter(Boolean).map(proy))).map(l => simplificar(l, 0.5))) })).filter(x => x.d);

/* ── 4. los lugares: por nombre, dentro del término, sin ambigüedades ── */
const conNombre = datos.elementos.filter(e => e.tags && e.tags.name && !(e.tags.highway) && !(e.tags.route) && !(e.tags.boundary) && !(e.tags.place));
/* 2: todas nuestras palabras están en el nombre de OSM; 1: todas las de OSM (alguna que no sea
   genérica) están en el nuestro, y entonces solo vale si ningún otro lugar encaja igual
   («Ermita del Cristo» en OSM no se sabe si es la de la Misericordia o la Vieja) */
const GENERICAS = /^(ermita|iglesia|pozo|casa|casas|palacio|monumento|pilar|fuente|lavadero|convento|ruinas|antiguo|antigua|cerro|ruta)$/;
const encaja = (nuestro, e) => parecido(nuestro, e.tags.name) === 1 ? 2
  : parecido(e.tags.name, nuestro) === 1 && palabras(e.tags.name).some(w => !GENERICAS.test(w)) ? 1 : 0;
const lugares = [], avisos = [];
const reclamados = new Map();
for (const nombre of buscados) {
  let el = null, fijado = false;
  if (fijados.has(nombre)) {
    const osm = fijados.get(nombre);
    el = datos.elementos.find(e => e.type + '/' + e.id === osm) || null;
    fijado = true;
    if (!el) { avisos.push(`«${nombre}»: el elemento fijado ${osm} no está en los datos`); continue; }
  } else {
    const cands = conNombre.filter(e => encaja(nombre, e) === 2 || (encaja(nombre, e) === 1 && buscados.filter(b => encaja(b, e)).length === 1))
      .filter(e => { const c = centroDe(e); return c && dentro(c); });
    /* el mismo sitio puede estar como nodo y como área: si están a menos de 150 m, es uno */
    const unicos = [];
    for (const e of cands) {
      const c = centroDe(e);
      if (!unicos.some(u => { const d = centroDe(u); return Math.hypot((c.lat - d.lat) * ky, (c.lon - d.lon) * kx) < 150; })) unicos.push(e);
    }
    if (unicos.length > 1) { avisos.push(`«${nombre}» encaja con ${unicos.length} elementos (${unicos.map(e => e.type + '/' + e.id + ' «' + e.tags.name + '»').join(', ')}): fíjalo con --lugar`); continue; }
    el = unicos[0] || null;
  }
  if (!el) continue;
  const c = centroDe(el);
  if (!c) continue;
  if (!fijado && !dentro(c)) continue;
  const id = el.type + '/' + el.id;
  if (reclamados.has(id)) {
    avisos.push(`${id} «${(el.tags || {}).name}» lo quieren «${reclamados.get(id)}» y «${nombre}»: se queda el primero; fija el otro con --lugar`);
    continue;
  }
  reclamados.set(id, nombre);
  const [x, y] = proy(c);
  lugares.push({ nombre, osm: id, nombre_osm: (el.tags || {}).name || null, lat: Number(c.lat.toFixed(6)), lon: Number(c.lon.toFixed(6)), x: red(x), y: red(y), ...(fijado ? { fijado: true } : {}) });
}

/* rótulos de las carreteras: en el punto medio de su tramo más largo, sin chocar entre ellos */
const rotulos = [], cajas = [];
/* que no tapen los puntos de los lugares ni el pueblo */
for (const l of lugares) cajas.push({ x0: l.x - 18, x1: l.x + 18, y0: l.y - 18, y1: l.y + 18 });
if (datos.pueblo) { const [px, py] = proy(datos.pueblo); cajas.push({ x0: px - 22, x1: px + 22, y0: py - 22, y1: py + 22 }); }
for (const [ref, { l, largo }] of [...refs.entries()].sort((a, b) => b[1].largo - a[1].largo)) {
  if (largo < 60) continue;
  const total = largo; let acc = 0, punto = l[0];
  for (let i = 1; i < l.length; i++) {
    const s = Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1]);
    if (acc + s >= total / 2) { const f = (total / 2 - acc) / (s || 1); punto = [l[i - 1][0] + (l[i][0] - l[i - 1][0]) * f, l[i - 1][1] + (l[i][1] - l[i - 1][1]) * f]; break; }
    acc += s;
  }
  const w = ref.length * 6.6 + 8, h = 15;
  const c = { x0: punto[0] - w / 2, x1: punto[0] + w / 2, y0: punto[1] - h / 2, y1: punto[1] + h / 2 };
  if (c.x0 < 2 || c.x1 > VW - 2 || c.y0 < 2 || c.y1 > VH - 30) continue;
  if (cajas.some(o => !(c.x1 < o.x0 || c.x0 > o.x1 || c.y1 < o.y0 || c.y0 > o.y1))) continue;
  cajas.push(c); rotulos.push({ ref, x: punto[0], y: punto[1], w, h });
}

/* ── 5. la escala: una barra redonda de en torno a un cuarto del ancho ── */
const objetivo = (VW / 4) / escala;
const metros = [500, 1000, 2000, 2500, 5000, 10000, 20000].reduce((m, v) => Math.abs(v - objetivo) < Math.abs(m - objetivo) ? v : m);
const largoEscala = metros * escala;

/* ── 6. el SVG (solo geometría y rótulos; sin colores) ── */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" data-termino="${esc(slugDe(M.nombre))}">
<rect class="termino-fondo" width="${VW}" height="${VH}"/>
<path class="termino-area" d="${limiteD}"/>
${cascoD ? `<path class="termino-casco" d="${cascoD}"/>` : ''}
${rutasD.map(x => `<path class="termino-ruta" d="${x.d}"/>`).join('\n')}
${carreteras.length ? `<path class="termino-carretera" d="${dDe(carreteras)}"/>` : ''}
<path class="termino-limite" d="${limiteD}"/>
${rotulos.map(r => `<g class="termino-ref"><rect x="${red(r.x - r.w / 2)}" y="${red(r.y - r.h / 2)}" width="${red(r.w)}" height="${r.h}" rx="3"/><text x="${red(r.x)}" y="${red(r.y)}" text-anchor="middle" dy=".35em">${esc(r.ref)}</text></g>`).join('\n')}
<path class="termino-escala" d="M${MARGEN} ${VH - 12}h${red(largoEscala)}M${MARGEN} ${VH - 16}v8M${red(MARGEN + largoEscala)} ${VH - 16}v8"/>
<text class="termino-escala-texto" x="${red(MARGEN + largoEscala + 6)}" y="${VH - 12}" dy=".35em">${metros >= 1000 ? String(metros / 1000).replace('.', ',') + ' km' : metros + ' m'}</text>
</svg>
`.replace(/\n{2,}/g, '\n');
fs.writeFileSync(path.join(RAIZ, 'marca/termino.svg'), svg);

const meta = {
  _leeme: 'Lo genera scripts/termino.mjs (no editar a mano salvo «fijado» en lugares, que el script respeta). aplicar.mjs pinta con esto el mapa del término en «El pueblo»: sin este archivo o sin marca/termino.svg, la sección no sale.',
  fuente: 'OpenStreetMap, por la API de Overpass', licencia: 'ODbL 1.0', atribucion: ATRIBUCION, atribucion_url: ATRIBUCION_URL,
  ...(datos._muestra ? { muestra: datos._muestra } : {}),
  nombre_osm: (datos.limite.tags || {}).name || null, relacion: 'relation/' + datos.limite.id,
  pueblo_osm: datos.pueblo ? 'node/' + datos.pueblo.id : null,
  casco_osm: (datos.casco || []).map(w => 'way/' + w.id),
  carreteras: [...refs.keys()].sort(), carreteras_osm: datos.elementos.filter(e => e.type === 'way' && e.tags && CARRETERA.test(e.tags.highway || '')).map(e => 'way/' + e.id),
  rutas: rutasD.map(x => ({ nombre: x.r.tags.name || x.r.tags.ref || 'Ruta sin nombre', osm: 'relation/' + x.r.id })),
  viewBox: `0 0 ${VW} ${VH}`, metros_por_unidad: Number((1 / escala).toFixed(3)), escala_m: metros,
  fecha: datos.fecha, lugares
};
fs.writeFileSync(rutaMeta, JSON.stringify(meta, null, 2) + '\n');
console.log(`✓ marca/termino.svg (${(svg.length / 1024).toFixed(1)} kB): relation/${datos.limite.id} «${meta.nombre_osm}», ${carreteras.length} tramos de carretera (${meta.carreteras.join(', ') || 'sin matrícula'}), ${rutasD.length} rutas, casco: ${meta.casco_osm.length} áreas` +
  `\n  lugares en OSM (${lugares.length} de ${buscados.length}): ${lugares.map(l => l.nombre + ' → ' + l.osm).join(' · ') || 'ninguno'}`);
if (avisos.length) console.log('! ' + avisos.join('\n! '));
