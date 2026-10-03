/* Tablón de anuncios de la sede: leer, filtrar datos personales, poner tema.
   Lo usan scripts/tablon.mjs (que escribe contenido/tablon.json) y
   scripts/verificar.mjs (que prueba las exclusiones con entradas de prueba). */

const entidades = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ' };
const limpiar = s => String(s || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return entidades[e.toLowerCase()] ?? m;
  })
  .replace(/\s+/g, ' ').trim();

/* Gestiona (esPublico): tabla `AdvertisementBoardListPanel`, una fila por anuncio.
   El HTML trae un <a class="doc2"> que envuelve otro <a> (no es válido), así
   que se lee celda a celda por su clase, con expresiones, no con un DOM. */
export function parsearGestiona(html, base) {
  const ini = html.indexOf('AdvertisementBoardListPanel');
  if (ini < 0) throw new Error('No encuentro la tabla del tablón (¿ha cambiado el marcado de la sede?)');
  const tabla = html.slice(ini, html.indexOf('</table>', ini));
  const filas = tabla.split(/<tr[\s>]/).slice(1);
  const celda = (fila, clase) => {
    const m = fila.match(new RegExp('<td class="class_' + clase + '"[^>]*>([\\s\\S]*?)</td>'));
    return m ? m[1] : '';
  };
  const out = [];
  for (const f of filas) {
    const nombre = celda(f, 'name');
    if (!nombre) continue;
    const a = nombre.match(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g) || [];
    const enlace = a.map(x => x.match(/href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/)).find(m => m && /preview-document|\/board\//.test(m[1]));
    if (!enlace) continue;
    const fecha = limpiar(celda(f, 'dateFrom')).match(/(\d{2})\/(\d{2})\/(\d{4})/);
    out.push({
      titulo: limpiar(enlace[2]),
      descripcion: limpiar(celda(f, 'description')),
      expediente: limpiar(celda(f, 'folderCode')),
      procedimiento: limpiar(celda(f, 'folderName')),
      categoria: limpiar(celda(f, 'boardCategory')),
      fecha: fecha ? `${fecha[3]}-${fecha[2]}-${fecha[1]}` : null,
      url: new URL(enlace[1].replace(/&amp;/g, '&'), base).href
    });
  }
  return out;
}

/* Sede de la Diputación de Badajoz (Portal del Ciudadano, sede.X.es): el tablón va
   por subsecciones (Actas de JGL, Empleo Público, Anuncio General…), sin RSS ni
   JSON público (comprobado en Monesterio el 03/10/2026). Se lee de dos formas:
   - la vista antigua `/portal/tablonVirtual.do?subseccion=X&opc_id=175&pes_cod=9&ent_id=N`,
     que llega pintada desde el servidor: tabla `Lista2`, una fila `doc_<id>` por anuncio,
     título y enlace en la 1.ª celda, fecha en la 2.ª;
   - el JSON que pide por AJAX la vista nueva (`listaDocumentos`), para copias guardadas.
   Las dos dan el mismo enlace fijo al documento (`aDoc=F&documento=<id>&codVerif=<hash>`).
   La categoría es la subsección: «Empleo Público» activa las reglas de selección de personal. */
export function parsearDiputacion(html, base) {
  const migas = [...html.matchAll(/<a[^>]*class="migaPan"[^>]*>([\s\S]*?)<\/a>/g)].map(m => limpiar(m[1]));
  const categoria = migas.length ? migas[migas.length - 1] : '';
  const out = [];
  for (const f of html.split(/<tr\b/).slice(1)) {
    if (!/id=['"]doc_\d+['"]/.test(f)) continue;
    const a = f.match(/<a[^>]*href=['"]([^'"]*aDoc=F[^'"]*)['"][^>]*>([\s\S]*?)<\/a>/);
    if (!a) continue;
    const fecha = f.match(/<td>\s*(\d{2})\/(\d{2})\/(\d{4})/);
    out.push({
      titulo: limpiar(a[2]), descripcion: '', expediente: '', procedimiento: '', categoria,
      fecha: fecha ? `${fecha[3]}-${fecha[2]}-${fecha[1]}` : null,
      url: new URL(a[1].replace(/&amp;/g, '&'), base).href
    });
  }
  return out;
}
export function parsearDiputacionJSON(json, base, entId) {
  const padres = json.listaSeccionesPadres || [];
  const categoria = padres.length ? limpiar(padres[padres.length - 1].nombre) : '';
  return (json.listaDocumentos || []).map(d => {
    const f = String(d.docFpu || '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
    return {
      titulo: limpiar(d.docNom), descripcion: '', expediente: '', procedimiento: '', categoria,
      fecha: f ? `${f[3]}-${f[2]}-${f[1]}` : null,
      url: new URL(`/portal/tablonVirtual.do?aDoc=F&documento=${d.docId}&codVerif=${d.codVerif}&opc_id=175&pes_cod=9&ent_id=${entId}&idioma=1`, base).href
    };
  });
}
/* subsecciones que cuelgan de una página del tablón (para recorrerlo entero) */
export function subseccionesDiputacion(html) {
  return [...new Set([...html.matchAll(/tablonVirtual\.do\?subseccion=([A-Z0-9_]+)&(?:amp;)?opc_id=175/g)].map(m => m[1]))];
}

/* ── Datos personales: lo que NO se republica en la web ──
   El tablón oficial está obligado a publicarlo; la web municipal no, y
   copiarlo multiplica su difusión. Se excluye por patrón (título, descripción,
   procedimiento y categoría juntos). Ante la duda, fuera. */
const PATRONES_PERSONALES = [
  [/declaraci[oó]n\s+de\s+herederos|herederos\s+abintestato/i, 'declaración de herederos'],
  [/admitid[oa]s\s+y\s+excluid[oa]s|aspirantes\s+admitid|excluid[oa]s\s+provisional/i, 'lista de admitidos y excluidos'],
  [/preseleccionad|sondeo.*(listado|lista)|(listado|lista).*sondeo/i, 'lista de preseleccionados'],
  [/tribunal\s+calificador|acta\s+del?\s+tribunal|acta\s+de\s+selecci[oó]n|acta\s+de\s+(la\s+)?valoraci/i, 'acta de selección'],
  [/baremaci[oó]n|calificaciones|puntuaciones|resultados?\s+(del?\s+)?(examen|ejercicio|prueba)/i, 'resultados con nombres'],
  [/nombramiento|toma\s+de\s+posesi[oó]n\s+de\s+(funcionari|personal)/i, 'nombramiento de personas'],
  [/constituci[oó]n\s+(de\s+)?(la\s+)?bolsa|bolsa\s+de\s+(trabajo|empleo).*(lista|orden|resultado)/i, 'bolsa de trabajo con nombres'],
  [/candidatos\s+a\s+jurado|sorteo\s+de\s+jurados?/i, 'lista de jurados'],
  [/notificaci[oó]n|comparecencia|edicto\s+de\s+notificaci|abandono\s+de\s+veh[ií]culo|veh[ií]culo\s+abandonado|abandono\s+veh[ií]culo/i, 'notificación a una persona'],
  [/relaci[oó]n\s+nominal/i, 'relación nominal de personas'],
  /* una expropiación cita a los titulares por su nombre: la relación de afectados y la citación al
     levantamiento de actas previas (en Segura de León, el acceso al Monte de los Silos, 17/09/2026) */
  [/relaci[oó]n\s+de\s+(bienes\s+y\s+derechos\s+)?(afectad|propietari|titulares)|actas?\s+previas?\s+a\s+la\s+ocupaci[oó]n|expropiaci[oó]n/i, 'expropiación con titulares'],
  [/acta\s+(de\s+(la\s+)?)?mesa\s+(de\s+)?contrataci[oó]n/i, 'acta de mesa de contratación'],
  [/mesas?\s+electoral(es)?.*(lista|miembros|sorteo)|(lista(do)?|miembros|sorteo).*mesas?\s+electoral/i, 'miembros de mesas electorales'],
  [/\b\d{8}[A-HJ-NP-TV-Z]\b|\*{3}\d{3,4}\*{1,3}|\b[XYZ]\d{7}[A-Z]\b/i, 'contiene un DNI o NIE']
];
const ES_SELECCION = /selecci[oó]n(es)?\s+de\s+personal|provisi[oó]n(es)?\s+de\s+puestos|empleo\s+p[uú]blico/i;

export function motivoPersonal(e) {
  const texto = [e.titulo, e.descripcion, e.procedimiento, e.categoria].join(' · ');
  for (const [re, motivo] of PATRONES_PERSONALES) if (re.test(texto)) return motivo;
  /* un «acta» de un procedimiento de selección de personal lleva nombres casi siempre */
  if (/\bacta\b/i.test(e.titulo + ' ' + e.descripcion) && ES_SELECCION.test(texto)) return 'acta de selección';
  /* y una lista también, aunque el título no diga de qué: en Fuente de Cantos «08 ANUNCIO LISTA
     DEFINITIVA» y «Anuncio lista definitva» (sic) solo se reconocen por el procedimiento */
  if (/\b(lista(do)?s?|relaci[oó]n|candidat[oa]s)\b/i.test(e.titulo + ' ' + e.descripcion) && ES_SELECCION.test(texto)) return 'lista de un proceso de selección';
  /* el acta (o el borrador) de una sesión de Junta de Gobierno o de Pleno nombra a vecinos (licencias,
     reclamaciones, bajas). En Monesterio las publican «DISOCIADO» (sin nombres) salvo algunas: solo
     entran las que lo dicen */
  const sesion = /junta\s+de\s+gobierno|\bjgl\b|\bpleno\b|\bsesi[oó]n\b/i;
  if (/\b(acta|borrador)\b/i.test(e.titulo) && (sesion.test(e.titulo) || /^acta\s+de\s+(junta|pleno)/i.test(e.categoria || ''))
    && !/disociad/i.test(e.titulo + ' ' + e.descripcion)) return 'acta de sesión sin disociar';
  return null;
}

/* Tema para los filtros. Lo pone una persona en `tema` si no acierta. */
const TEMAS = [
  ['Pleno', /pleno|sesi[oó]n\s+(ordinaria|extraordinaria)|orden\s+del\s+d[ií]a|[oó]rganos\s+de\s+gobierno/i],
  ['Impuestos', /cobranza|\biae\b|\bibi\b|impuesto|tasa|padr[oó]n\s+fiscal|recaudaci|tribut/i],
  ['Empleo', /empleo|bolsa\s+de|plaza|puesto\s+de\s+trabajo|contrataci[oó]n\s+laboral/i],
  ['Ayudas', /ayuda|subvenci|beca|m[ií]nimos\s+vitales|natalidad/i],
  ['Obras', /obra|urban|instalaci[oó]n(es)?\s+el[eé]ctrica|licencia|proyecto|alumbrado|pavimentaci/i]
];
export function temaDe(e) {
  const texto = [e.titulo, e.descripcion, e.categoria, e.procedimiento].join(' · ');
  for (const [tema, re] of TEMAS) if (re.test(texto)) return tema;
  return 'Anuncios';
}

/* Conserva lo que puso una persona (titulo_claro, tema, oculto) al refrescar. */
export function fusionar(nuevas, previas) {
  const porUrl = new Map((previas || []).map(p => [p.url, p]));
  return nuevas.map(n => {
    const p = porUrl.get(n.url) || {};
    return {
      ...n,
      tema: p.tema_manual ? p.tema : temaDe(n),
      tema_manual: !!p.tema_manual,
      titulo_claro: p.titulo_claro || '',
      oculto: !!p.oculto
    };
  });
}

/* ── Pruebas sin red: títulos reales vistos en sedes de la zona ── */
export const CASOS_PRUEBA = [
  [{ titulo: 'ACTA DE DECLARACIÓN DE HEREDEROS DE NOMBRE APELLIDO APELLIDO' }, 'declaración de herederos'],
  [{ titulo: 'Edicto declaración de herederos abintestato' }, 'declaración de herederos'],
  [{ titulo: 'Lista provisional de aspirantes admitidos y excluidos' }, 'lista de admitidos y excluidos'],
  [{ titulo: 'Listado provisional de preseleccionados' }, 'lista de preseleccionados'],
  [{ titulo: 'Acta del Tribunal Calificador' }, 'acta de selección'],
  [{ titulo: 'ACTA MANTENEDDORES LIMPIADORES PSICINA 2024', categoria: 'Empleo Público', procedimiento: 'Selecciones de Personal y Provisiones de Puestos' }, 'acta de selección'],
  [{ titulo: 'Resultados de baremación' }, 'resultados con nombres'],
  [{ titulo: 'Nombramientos aspirantes' }, 'nombramiento de personas'],
  [{ titulo: 'Constitución Bolsa de Trabajo' }, 'bolsa de trabajo con nombres'],
  [{ titulo: 'Lista de candidatos a Jurado' }, 'lista de jurados'],
  [{ titulo: 'Anuncio notificación final del expediente' }, 'notificación a una persona'],
  [{ titulo: 'Relación de solicitantes', descripcion: 'Interesado con DNI 12345678Z' }, 'contiene un DNI o NIE'],
  [{ titulo: '08 ANUNCIO LISTA DEFINITIVA', descripcion: 'ANUNCIO LISTA DEFINITIVA DEL PROCESO DE ADMINISTRATIVO', procedimiento: 'Selecciones de Personal y Provisiones de Puestos', categoria: 'Anuncios' }, 'lista de un proceso de selección'],
  [{ titulo: 'Anuncio lista definitva', descripcion: 'Lista definitiva bolsa CONDUCTORES', procedimiento: 'Selecciones de Personal y Provisiones de Puestos', categoria: 'Anuncios' }, 'lista de un proceso de selección'],
  [{ titulo: 'Anuncio de la convocatoria', descripcion: 'CONVOCATORIA DE PLENO DE SEPTIEMBRE', procedimiento: 'Convocatoria de El Pleno', categoria: 'Anuncios' }, null],
  [{ titulo: 'Relación nominal provisional de candidatos para orientador y prospector para desarrollo local' }, 'relación nominal de personas'],
  [{ titulo: 'Relación nominal definitiva de los puestos de monitores de ludoteca', descripcion: 'Relación nominal definitiva de candidatos para los dos puestos de monitores' }, 'relación nominal de personas'],
  [{ titulo: 'Candidatos propuestos', procedimiento: 'Selecciones de Personal y Provisiones de Puestos' }, 'lista de un proceso de selección'],
  [{ titulo: '05. Acta mesa contratación casetas feria y fiestas 2026', categoria: 'Anuncio General' }, 'acta de mesa de contratación'],
  [{ titulo: '20251103 LISTADO MESAS ELECTORALES BOP 3 NOV 25', categoria: 'Anuncio General' }, 'miembros de mesas electorales'],
  [{ titulo: 'EDICTO ABANDONO VEHÍCULO VIA PUBLICA', categoria: 'Anuncio General' }, 'notificación a una persona'],
  [{ titulo: '01.09.25  - BORRADOR SESIÓN JGL', categoria: 'Acta de Junta de Gobierno Local' }, 'acta de sesión sin disociar'],
  [{ titulo: '2025 02 27  BORRADOR ACTA SESION', categoria: 'Acta de Pleno' }, 'acta de sesión sin disociar'],
  [{ titulo: '15.26. BORRADOR DISOCIADO SESIÓN JGL 17.08.26', categoria: 'Acta de Junta de Gobierno Local' }, null],
  [{ titulo: 'LISTA PROVISIONAL PERSONAL APOYO JAMON 082026', categoria: 'Empleo Público' }, 'lista de un proceso de selección'],
  [{ titulo: 'ACTA TRIBUNAL UN SOCORRISTA PISCINA 0726', categoria: 'Empleo Público' }, 'acta de selección'],
  [{ titulo: 'BASES UN SOCORRISTA ACUATICO PISCINA MUNICIPAL 2026', categoria: 'Empleo Público' }, null],
  [{ titulo: 'Convocatoria Pleno Ordinario 03.09.2026 - Tablón anuncios', categoria: 'Anuncio General' }, null],
  [{ titulo: 'Anuncio de licitación Casetas Feria y Fiestas 2026', categoria: 'Anuncio General' }, null],
  [{ titulo: 'CONVOCATORIA AYUDA NATALIDAD CORRECTA 2026' }, null],
  [{ titulo: 'ANUNCIO COBRANZA IAE 2026' }, null],
  [{ titulo: 'Anuncio celebración sesión Ordinaria Pleno 30 de septiembre de 2026' }, null],
  [{ titulo: 'Bases de la convocatoria de dos plazas de socorrista', categoria: 'Empleo Público' }, null],
  [{ titulo: 'RELACION DE AFECTADOS', descripcion: 'ANUNCIO DE CITACION AL LEVANTAMIENTO DE ACTAS PREVIAS A LA OCUPACION MEJORA ACCESO MONTE DE LOS SILOS' }, 'expropiación con titulares'],
  [{ titulo: 'ANUNCIO DE CITACION', descripcion: 'ANUNCIO DE CITACION AL LEVANTAMIENTO DE ACTAS PREVIAS A LA OCUPACION MEJORA ACCESO MONTE DE LOS SILOS' }, 'expropiación con titulares'],
  [{ titulo: 'Relación de bienes y derechos afectados por la obra' }, 'expropiación con titulares'],
  [{ titulo: 'B.O.P. nº. 91 - Anuncio 1752_2026 Bases reguladoras para ayudas mínimos vitales 2026' }, null]
];
