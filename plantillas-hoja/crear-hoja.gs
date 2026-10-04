/* crear-hoja.gs — monta en un clic la hoja y los formularios para publicar en la web del Ayuntamiento
   (plantilla «Puerta abierta», v3c · guia). Ver PUBLICAR.md, «El camino corto».

   CÓMO SE USA (una sola vez, con la cuenta de Google DEL AYUNTAMIENTO, no con una personal):
     1. Abra https://script.google.com → «Nuevo proyecto».
     2. Borre lo que haya en el editor, pegue este archivo entero y guarde (icono del disquete).
     3. Arriba, en el desplegable de funciones, elija «crearHojaDeLaWeb» y pulse «Ejecutar».
     4. Google pide permiso («Revisar permisos» → la cuenta del Ayuntamiento → «Permitir»): el
        script crea archivos en su Drive (la hoja, los tres formularios y una carpeta).
        Si sale «Google no ha verificado esta aplicación», es normal: el script es suyo. Pulse
        «Configuración avanzada» → «Ir a … (no seguro)».
     5. Al terminar, abajo («Registro de ejecución») sale el bloque «hoja» para municipio.json, con
        el id de la hoja y las direcciones de los formularios. Lo mismo queda escrito en la pestaña
        «Léame» de la hoja. Páseselo a quien mantiene la web.
     6. Lo único que no se puede hacer desde un script: publicar las pestañas en la web. Siga los
        pasos de la pestaña «Léame» (o de PUBLICAR.md, paso 2 del camino corto).

   Qué crea:
     · la carpeta «Web del Ayuntamiento» en su Drive, con todo dentro;
     · la hoja «Web del Ayuntamiento», PRIVADA (solo la cuenta que ejecuta el script);
     · tres formularios: «Publicar un aviso en la web», «Publicar un acto en la agenda» y «Publicar una
       noticia en la web». Cada pregunta se llama EXACTAMENTE como la columna que lee la web
       (js/main.js las lee sin tildes ni mayúsculas: «Título corto» → titulo_corto);
     · en la hoja, una pestaña de respuestas por formulario («Respuestas avisos»…), con una columna
       «Estado» al final para retirar algo (oculto) sin borrarlo;
     · las pestañas que se publican («Avisos», «Agenda», «Noticias»): copian con QUERY solo las
       columnas que lee la web, sin la marca temporal ni ningún correo;
     · opcional (AVISAR_POR_CORREO): un correo a la cuenta del Ayuntamiento con cada cosa publicada.

   No se ha podido ejecutar en Google al escribirlo (no hay cuenta en el entorno de la plantilla): está
   escrito con la API documentada de Apps Script (SpreadsheetApp, FormApp, DriveApp, ScriptApp,
   MailApp) y verificar.mjs → v3cguia lo ejecuta contra una imitación de esa API. La primera vez que
   se use de verdad, compruebe la hoja con el paso 3 de PUBLICAR.md. */

/* ═══ lo que se puede cambiar antes de ejecutar ═══ */
var NOMBRE = 'Web del Ayuntamiento';
var TEMAS = ['Agua', 'Obras', 'Tráfico', 'Cultura', 'Deporte', 'Empleo', 'Salud', 'Seguridad', 'Otros'];
/* true: cada envío manda un correo a la cuenta del Ayuntamiento («Se ha publicado en la web: …»).
   Sirve para enterarse si alguien que no debe tiene el enlace de un formulario. Pide un permiso más */
var AVISAR_POR_CORREO = true;
/* true SOLO con Google Workspace (correo del Ayuntamiento en Google): los formularios piden iniciar
   sesión con una cuenta de su organización, así que solo publica su personal. Con una cuenta de
   Gmail no existe y se ignora */
var SOLO_CUENTAS_DE_LA_ORGANIZACION = false;

/* ═══ las preguntas: el título es el nombre de la columna que lee la web ═══
   (las mismas que plantillas-hoja/*.csv; no cambie los títulos ni el orden) */
var PREGUNTAS = {
  avisos: [
    { titulo: 'Fecha', tipo: 'fecha', obligatoria: true, ayuda: 'El día del aviso (normalmente, hoy).' },
    { titulo: 'Título', tipo: 'corta', obligatoria: true, ayuda: 'Qué pasa, dónde y cuándo, con día y hora. Por ejemplo: «Corte de agua en la calle Mayor el martes, de 9:00 a 13:00».' },
    { titulo: 'Tema', tipo: 'lista', opciones: TEMAS, ayuda: 'Para los filtros del tablón.' },
    { titulo: 'Texto', tipo: 'parrafo', ayuda: 'Los detalles, si hacen falta. Sin datos personales.' },
    { titulo: 'Gravedad', tipo: 'opcion', opciones: ['informativo', 'programado', 'urgente'],
      ayuda: 'urgente = franja roja arriba en todas las páginas (una avería, una alerta). programado = franja ámbar (un corte o una obra anunciados). informativo = solo tablón y «Hoy». Si no marca nada, informativo.' },
    { titulo: 'Caduca', tipo: 'fecha', ayuda: 'Último día que sale en la franja. Sin esta fecha, un aviso urgente o programado NO sale en la franja.' },
    { titulo: 'Título corto', tipo: 'corta', maximo: 70, ayuda: 'Solo si el título pasa de 70 letras: es lo que se lee en la franja del móvil.' }
  ],
  agenda: [
    { titulo: 'Fecha', tipo: 'fecha', obligatoria: true, ayuda: 'El día del acto.' },
    { titulo: 'Hora', tipo: 'hora', ayuda: 'Sin hora, el acto es de día entero.' },
    { titulo: 'Hora fin', tipo: 'hora', ayuda: 'Para el calendario del móvil. Sin ella, dura una hora.' },
    { titulo: 'Título', tipo: 'corta', obligatoria: true, ayuda: 'Por ejemplo: «Concierto de la banda municipal».' },
    { titulo: 'Lugar', tipo: 'corta', ayuda: 'Por ejemplo: «Plaza de España».' },
    { titulo: 'Nota', tipo: 'parrafo', ayuda: 'Entrada libre, cómo apuntarse…' },
    { titulo: 'Tipo', tipo: 'casilla', opciones: ['pleno'], ayuda: 'Márquelo solo si es un pleno: sale como «Próximo pleno» en la portada.' },
    { titulo: 'Convocatoria', tipo: 'url', ayuda: 'Solo plenos: el enlace a la convocatoria en la sede electrónica (https://…).' },
    { titulo: 'Grabación', tipo: 'url', ayuda: 'Solo plenos ya celebrados: el enlace al vídeo (https://…).' }
  ],
  noticias: [
    { titulo: 'Fecha', tipo: 'fecha', obligatoria: true, ayuda: 'El día de la noticia.' },
    { titulo: 'Título', tipo: 'corta', obligatoria: true, ayuda: 'Lo que ha pasado, en una línea.' },
    { titulo: 'Resumen', tipo: 'corta', maximo: 160, ayuda: 'Una frase que se lee debajo del título en la portada.' },
    { titulo: 'Texto', tipo: 'parrafo', ayuda: 'La noticia entera, un párrafo por línea. Sin datos personales; las fotos, a quien mantiene la web (con permiso de quien sale).' }
  ]
};
var FORMULARIOS = {
  avisos: { titulo: 'Publicar un aviso en la web', pestana: 'Avisos', respuestas: 'Respuestas avisos',
    descripcion: 'Lo que envíe sale en la web en unos minutos. Para retirarlo, escriba «oculto» en la columna Estado de su fila en la hoja.' },
  agenda: { titulo: 'Publicar un acto en la agenda', pestana: 'Agenda', respuestas: 'Respuestas agenda',
    descripcion: 'Sale en la agenda, en «Lo que viene» y en «Hoy». Para retirarlo, escriba «oculto» en la columna Estado de su fila en la hoja.' },
  noticias: { titulo: 'Publicar una noticia en la web', pestana: 'Noticias', respuestas: 'Respuestas noticias',
    descripcion: 'Sale en «Lo que pasó» de la portada y en Noticias. Para retirarla, escriba «oculto» en la columna Estado de su fila en la hoja.' }
};
var CONFIRMACION = 'Enviado. Saldrá en la web en unos minutos. Si ve una errata, pulse «Editar su respuesta».';

/* ═══ la función que se ejecuta ═══ */
function crearHojaDeLaWeb() {
  var ss = SpreadsheetApp.create(NOMBRE);
  ss.setSpreadsheetLocale('es_ES');
  ss.setSpreadsheetTimeZone('Europe/Madrid');
  var leame = ss.getSheets()[0];
  leame.setName('Léame');

  var urls = {}, archivos = [ss.getId()];
  ['avisos', 'agenda', 'noticias'].forEach(function (clave) {
    var form = crearFormulario(clave);
    archivos.push(form.getId());
    var respuestas = vincular(ss, form, FORMULARIOS[clave].respuestas);
    var cabecera = escribirEstado(respuestas, clave);
    crearPestanaPublicable(ss, clave, cabecera);
    urls[clave] = form.getPublishedUrl();
    if (AVISAR_POR_CORREO) ScriptApp.newTrigger('avisarDeLoPublicado').forForm(form).onFormSubmit().create();
  });

  /* el orden de las pestañas: Léame, las tres que se publican y las tres de respuestas */
  ss = SpreadsheetApp.openById(ss.getId());
  ['Léame', 'Avisos', 'Agenda', 'Noticias', 'Respuestas avisos', 'Respuestas agenda', 'Respuestas noticias'].forEach(function (nombre, i) {
    var h = ss.getSheetByName(nombre);
    if (!h) return;
    ss.setActiveSheet(h);
    ss.moveActiveSheet(i + 1);
  });

  /* todo en una carpeta, para encontrarlo */
  var carpeta = DriveApp.createFolder(NOMBRE);
  archivos.forEach(function (id) { DriveApp.getFileById(id).moveTo(carpeta); });

  var bloque = {
    hoja: {
      id: ss.getId(),
      pestanas: { avisos: 'Avisos', agenda: 'Agenda', noticias: 'Noticias' },
      formularios: urls
    }
  };
  var json = JSON.stringify(bloque, null, 2);
  escribirLeame(ss.getSheetByName('Léame'), json, ss.getUrl());
  ss.setActiveSheet(ss.getSheetByName('Léame'));
  Logger.log('Hoja creada: ' + ss.getUrl());
  Logger.log('Para municipio.json (páseselo a quien mantiene la web):\n' + json);
  Logger.log('FALTA UN PASO A MANO: publicar en la web las pestañas Avisos, Agenda y Noticias (pestaña «Léame» de la hoja).');
  return bloque;
}

/* ═══ un formulario con sus preguntas ═══ */
function crearFormulario(clave) {
  var F = FORMULARIOS[clave];
  var form = FormApp.create(F.titulo);
  form.setDescription(F.descripcion);
  form.setConfirmationMessage(CONFIRMACION);
  /* ningún correo en las respuestas: la pestaña publicada no lleva datos de nadie (ya es lo de serie) */
  try { form.setCollectEmail(false); } catch (e) {}
  form.setAllowResponseEdits(true);       /* «Editar su respuesta» tras enviar: corregir una errata al momento */
  form.setShowLinkToRespondAgain(true);
  form.setProgressBar(false);
  if (SOLO_CUENTAS_DE_LA_ORGANIZACION) {
    try { form.setRequireLogin(true); } catch (e) { Logger.log('Iniciar sesión obligatorio: no disponible en esta cuenta (solo Google Workspace). Se sigue sin él.'); }
  }
  PREGUNTAS[clave].forEach(function (p) {
    var item;
    if (p.tipo === 'fecha') item = form.addDateItem().setIncludesYear(true);
    else if (p.tipo === 'hora') item = form.addTimeItem();
    else if (p.tipo === 'parrafo') item = form.addParagraphTextItem();
    else if (p.tipo === 'lista') item = form.addListItem().setChoiceValues(p.opciones);
    else if (p.tipo === 'opcion') item = form.addMultipleChoiceItem().setChoiceValues(p.opciones);
    else if (p.tipo === 'casilla') item = form.addCheckboxItem().setChoiceValues(p.opciones);
    else {
      item = form.addTextItem();
      if (p.maximo) item.setValidation(FormApp.createTextValidation().setHelpText('Como mucho ' + p.maximo + ' letras.').requireTextLengthLessThanOrEqualTo(p.maximo).build());
      if (p.tipo === 'url') item.setValidation(FormApp.createTextValidation().setHelpText('Pegue el enlace entero, empezando por https://').requireTextIsUrl().build());
    }
    item.setTitle(p.titulo).setHelpText(p.ayuda || '').setRequired(!!p.obligatoria);
  });
  return form;
}

/* ═══ el formulario manda sus respuestas a una pestaña nueva de la hoja: se busca y se renombra ═══ */
function vincular(ss, form, nombre) {
  var antes = SpreadsheetApp.openById(ss.getId()).getSheets().map(function (h) { return h.getSheetId(); });
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush();
  /* la hoja se vuelve a abrir: el objeto de antes no ve la pestaña nueva */
  var hojas = SpreadsheetApp.openById(ss.getId()).getSheets();
  var nueva = hojas.filter(function (h) { return antes.indexOf(h.getSheetId()) < 0; })[0];
  if (!nueva) {
    var id = form.getId();
    nueva = hojas.filter(function (h) { var u = h.getFormUrl(); return u && u.indexOf(id) >= 0; })[0];
  }
  if (!nueva) throw new Error('No encuentro la pestaña de respuestas de «' + form.getTitle() + '». Mire la hoja: si existe «Respuestas de formulario…», siga a mano con PUBLICAR.md.');
  nueva.setName(nombre);
  return nueva;
}

/* ═══ «Estado» en la primera columna libre (oculto = no sale en la web) y la cabecera completa ═══ */
function escribirEstado(hoja, clave) {
  var esperadas = ['Marca temporal'].concat(PREGUNTAS[clave].map(function (p) { return p.titulo; }));
  var ultima = Math.max(hoja.getLastColumn(), esperadas.length);
  var leidas = hoja.getRange(1, 1, 1, ultima).getValues()[0].map(String);
  /* si Google aún no ha escrito la cabecera, se escribe (con los mismos títulos que pondría él) */
  if (!leidas.some(function (x) { return x; })) {
    hoja.getRange(1, 1, 1, esperadas.length).setValues([esperadas]);
    leidas = esperadas.slice();
  }
  var cabecera = leidas.filter(function (x) { return x; });
  hoja.getRange(1, cabecera.length + 1).setValue('Estado').setNote('Escriba «oculto» para quitar esta fila de la web sin borrarla. Vacía = publicada.');
  hoja.setFrozenRows(1);
  return cabecera.concat(['Estado']);
}

/* ═══ la pestaña que se publica: QUERY con las columnas de la web, sin la marca temporal ═══ */
function crearPestanaPublicable(ss, clave, cabecera) {
  var F = FORMULARIOS[clave];
  var cols = PREGUNTAS[clave].map(function (p) { return p.titulo; }).concat(['Estado']).map(function (t) {
    var i = cabecera.indexOf(t);
    if (i < 0) throw new Error('En «' + F.respuestas + '» no está la columna «' + t + '»');
    return letra(i + 1);
  });
  var titulo = letra(cabecera.indexOf('Título') + 1);
  var formula = "=QUERY('" + F.respuestas + "'!A:" + letra(cabecera.length) + ', "select ' + cols.join(', ') + ' where ' + titulo + ' is not null", 1)';
  var h = ss.insertSheet(F.pestana);
  h.getRange('A1').setFormula(formula);
  h.setFrozenRows(1);
  /* se rellena sola: un aviso antes de tocarla a mano */
  h.protect().setDescription('Se rellena sola desde «' + F.respuestas + '». Corrija allí.').setWarningOnly(true);
  return formula;
}
function letra(n) {
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

/* ═══ la pestaña «Léame»: el bloque para municipio.json y el paso que falta ═══ */
function escribirLeame(hoja, json, url) {
  var filas = [
    ['Web del Ayuntamiento: lo que hay aquí'],
    ['Las pestañas «Respuestas …» guardan lo que llega de los formularios. Corrija ahí. Para quitar algo de la web, escriba «oculto» en su columna Estado.'],
    ['Las pestañas «Avisos», «Agenda» y «Noticias» se rellenan solas (copian solo las columnas que lee la web): no las toque.'],
    [''],
    ['FALTA UN PASO, A MANO (un script no puede hacerlo):'],
    ['1. Menú Archivo → Compartir → Publicar en la web.'],
    ['2. En «Enlace», en el primer desplegable, quite «Documento completo» y marque SOLO «Avisos», «Agenda» y «Noticias».'],
    ['3. En el segundo desplegable deje «Página web». Despliegue «Contenido publicado y configuración» y marque «Volver a publicar automáticamente cuando se hagan cambios».'],
    ['4. Pulse «Publicar» y acepte. (No hace falta copiar el enlace que sale.)'],
    ['5. NO comparta la hoja con «Cualquier persona con el enlace»: debe seguir como «Restringido».'],
    [''],
    ['Para municipio.json (páselo a quien mantiene la web):'],
    [json],
    [''],
    ['Esta hoja: ' + url]
  ];
  hoja.getRange(1, 1, filas.length, 1).setValues(filas);
  hoja.getRange(1, 1).setFontWeight('bold').setFontSize(14);
  hoja.getRange(5, 1).setFontWeight('bold');
  hoja.getRange(12, 1).setFontWeight('bold');
  hoja.setColumnWidth(1, 900);
  hoja.getRange(1, 1, filas.length, 1).setWrap(true);
}

/* ═══ opcional: un correo a la cuenta del Ayuntamiento con cada envío ═══ */
function avisarDeLoPublicado(e) {
  var r = e.response, form = e.source;
  var lineas = r.getItemResponses().map(function (x) { return x.getItem().getTitle() + ': ' + x.getResponse(); });
  var titulo = r.getItemResponses().filter(function (x) { return x.getItem().getTitle() === 'Título'; }).map(function (x) { return x.getResponse(); })[0] || '';
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), 'Publicado en la web: ' + titulo,
    'Ha llegado por «' + form.getTitle() + '» y sale en la web en unos minutos:\n\n' + lineas.join('\n') +
    '\n\nSi no debía publicarse, escriba «oculto» en la columna Estado de su fila en la hoja «' + NOMBRE + '».');
}
