/* vivo.js — lo que cambia solo: abierto o cerrado, el panel «Hoy», la franja
   urgente, el tablón, la línea de tiempo, el año y la agenda.

   El MISMO código pinta en dos sitios:
   - scripts/aplicar.mjs lo ejecuta en Node al generar la web, con la fecha del
     día: así la página se lee entera sin JavaScript;
   - js/main.js lo vuelve a ejecutar en el navegador con la hora real (y con lo
     que llegue de la hoja de cálculo o del tablón), porque una página generada
     el lunes no sabe que hoy es jueves.
   Solo funciones puras que devuelven HTML. Nada de DOM aquí. */
(function (raiz) {
  'use strict';

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MESES_C = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var EJEMPLO = '<span class="ejemplo">Ejemplo</span>';
  var SEDE = '<span class="sr">, se abre la sede electrónica</span>';
  function marcaEjemplo(x, clave) { return x && x.ejemplo ? ' data-dato-ejemplo="' + esc(clave) + '"' : ''; }

  /* La hora en el pueblo, no en el ordenador de quien mira. */
  function ahoraEn(zona, fecha) {
    var f = fecha || new Date();
    var partes = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: zona || 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short' })
      .formatToParts(f).forEach(function (p) { partes[p.type] = p.value; });
    var dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var h = Number(partes.hour) % 24;
    return { iso: partes.year + '-' + partes.month + '-' + partes.day, dia: dias[partes.weekday], min: h * 60 + Number(partes.minute), anio: Number(partes.year), mes: Number(partes.month) };
  }

  function partes(iso) { var p = iso.split('-').map(Number); return { a: p[0], m: p[1], d: p[2] }; }
  function diaSemana(iso) { var p = partes(iso); return new Date(Date.UTC(p.a, p.m - 1, p.d)).getUTCDay(); }
  function sumarDias(iso, n) {
    var p = partes(iso); var d = new Date(Date.UTC(p.a, p.m - 1, p.d + n));
    return d.toISOString().slice(0, 10);
  }
  function fechaLarga(iso, ahora) {
    var p = partes(iso);
    var t = DIAS[diaSemana(iso)] + ' ' + p.d + ' de ' + MESES[p.m - 1];
    if (ahora && p.a !== ahora.anio) t += ' de ' + p.a;
    return t;
  }
  function fechaCorta(iso) { var p = partes(iso); return p.d + ' ' + MESES_C[p.m - 1] + ' ' + p.a; }
  function cuando(iso, ahora) {
    if (iso === ahora.iso) return 'Hoy';
    if (iso === sumarDias(ahora.iso, 1)) return 'Mañana';
    if (iso === sumarDias(ahora.iso, -1)) return 'Ayer';
    var t = fechaLarga(iso, ahora);
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function hora(h) { return h ? String(h).replace(/^0(\d)/, '$1') : ''; }
  function aMin(h) { var p = h.split(':'); return Number(p[0]) * 60 + Number(p[1]); }

  /* ── abierto o cerrado, desde tramos {dias:[1..7] (1 = lunes), de, a} ── */
  function estado(tramos, ahora) {
    if (!tramos || !tramos.length) return null;
    var dia = ahora.dia === 0 ? 7 : ahora.dia;
    for (var i = 0; i < tramos.length; i++) {
      var t = tramos[i];
      if (t.dias.indexOf(dia) >= 0 && ahora.min >= aMin(t.de) && ahora.min < aMin(t.a)) {
        return { abierto: true, texto: 'Abierto ahora', detalle: 'cierra a las ' + hora(t.a) };
      }
    }
    for (var n = 0; n < 8; n++) {
      var dn = ((dia - 1 + n) % 7) + 1;
      var hoyTramos = tramos.filter(function (t) { return t.dias.indexOf(dn) >= 0 && (n > 0 || aMin(t.de) > ahora.min); })
        .sort(function (a, b) { return aMin(a.de) - aMin(b.de); });
      if (hoyTramos.length) {
        var cuandoAbre = n === 0 ? 'hoy' : n === 1 ? 'mañana' : 'el ' + DIAS[dn % 7];
        return { abierto: false, texto: 'Cerrado ahora', detalle: 'abre ' + cuandoAbre + ' a las ' + hora(hoyTramos[0].de) };
      }
    }
    return { abierto: false, texto: 'Cerrado ahora', detalle: '' };
  }
  function estadoHtml(tramos, ahora, clase) {
    var e = estado(tramos, ahora);
    if (!e) return '';
    return '<p class="' + (clase || 'estado') + ' ' + (e.abierto ? 'esta-abierto' : 'esta-cerrado') + '"><span class="estado__punto" aria-hidden="true"></span><b>' + e.texto + '</b>' + (e.detalle ? ' · ' + e.detalle : '') + '</p>';
  }

  /* ── colecciones ordenadas ── */
  function avisosVigentes(D, ahora) {
    return (D.avisos || []).filter(function (a) { return !a.oculto && (!a.caduca || a.caduca >= ahora.iso); })
      .sort(function (a, b) { return b.fecha.localeCompare(a.fecha); });
  }
  function urgentes(D, ahora) {
    return avisosVigentes(D, ahora).filter(function (a) { return a.urgente && a.caduca && a.caduca >= ahora.iso; });
  }
  function eventoPendiente(e, ahora) {
    if (e.fecha > ahora.iso) return true;
    if (e.fecha < ahora.iso) return false;
    return !e.hora || aMin(e.hora) >= ahora.min - 60;      /* lo de hoy sigue «próximo» hasta una hora después de empezar */
  }
  function agendaCompleta(D) {
    return (D.agenda || []).filter(function (e) { return !e.oculto; }).slice()
      .sort(function (a, b) { return (a.fecha + (a.hora || '')).localeCompare(b.fecha + (b.hora || '')); });
  }
  function proximos(D, ahora, n) {
    var lim = sumarDias(ahora.iso, 366);
    return agendaCompleta(D).filter(function (e) { return eventoPendiente(e, ahora) && e.fecha <= lim; }).slice(0, n || 99);
  }
  function pasados(D, ahora) {
    return agendaCompleta(D).filter(function (e) { return !eventoPendiente(e, ahora) && e.origen !== 'fiesta'; }).reverse();
  }
  function enlaceEvento(e, D) { return D.rutas.agenda + '#evento-' + e.id; }
  function enlaceAviso(a, D) { return D.rutas.avisos + '#aviso-' + a.id; }
  function enlaceNoticia(n, D) { return D.rutas.noticia.replace('{id}', n.id); }

  /* ── franja urgente (todas las páginas) ── */
  function franja(D, ahora) {
    var u = urgentes(D, ahora)[0];
    if (!u) return '';
    /* toda la franja es un solo enlace: en móvil cabe en dos líneas y el blanco es grande */
    return '<a class="franja-urgente__dentro contenedor" href="' + esc(enlaceAviso(u, D)) + '"' + marcaEjemplo(u, 'aviso:' + u.id) + '>' +
      '<svg class="icono" aria-hidden="true"><use href="#i-aviso"/></svg>' +
      '<span class="franja-urgente__texto"><b>Aviso:</b> ' + esc(u.titulo) + (u.ejemplo ? ' ' + EJEMPLO : '') +
      ' <span class="franja-urgente__ver">Ver el aviso</span></span></a>';
  }

  /* ── panel «Hoy en …» ── */
  function hoy(D, ahora) {
    var h = '<h2 class="hoy__titulo" id="hoy-titulo">Hoy en ' + esc(D.nombre_corto) + ' <span class="hoy__fecha">' + esc(fechaLarga(ahora.iso)) + '</span></h2><ul class="hoy__lista">';
    /* Ayuntamiento */
    var e = estado(D.horario.tramos, ahora);
    h += '<li class="hoy__fila"' + marcaEjemplo(D.horario, 'horario') + '><svg class="icono" aria-hidden="true"><use href="#i-reloj"/></svg><div>' +
      '<p class="hoy__etiqueta">Ayuntamiento</p>' +
      (e ? '<p class="hoy__estado ' + (e.abierto ? 'esta-abierto' : 'esta-cerrado') + '"><span class="estado__punto" aria-hidden="true"></span><b>' + e.texto + '</b>' + (e.detalle ? ' · ' + e.detalle : '') + '</p>' : '') +
      '<p class="hoy__nota">' + esc(D.horario.texto) + (D.horario.ejemplo ? ' ' + EJEMPLO : '') + '</p></div></li>';
    /* agenda: 1 en la versión cargada, 3 en la sobria (CSS oculta .hoy__mas) */
    var prox = proximos(D, ahora, 3);
    h += '<li class="hoy__fila"><svg class="icono" aria-hidden="true"><use href="#i-calendario"/></svg><div><p class="hoy__etiqueta">Lo próximo en la agenda</p>';
    if (!prox.length) h += '<p>No hay nada anunciado estos días.</p>';
    else {
      h += '<ul class="hoy__eventos">' + prox.map(function (ev, i) {
        return '<li class="hoy__evento' + (i ? ' hoy__mas' : '') + '"' + marcaEjemplo(ev, 'evento:' + ev.id) + '><a href="' + esc(enlaceEvento(ev, D)) + '">' + esc(ev.titulo) + '</a>' + (ev.ejemplo ? ' ' + EJEMPLO : '') +
          '<span class="hoy__cuando">' + esc(cuando(ev.fecha, ahora)) + (ev.hora ? ', ' + hora(ev.hora) : '') + (ev.lugar ? ' · ' + esc(ev.lugar) : '') + '</span></li>';
      }).join('') + '</ul>';
    }
    h += '</div></li>';
    /* último aviso: propio o del tablón */
    var ult = ultimos(D, ahora)[0];
    if (ult) {
      h += '<li class="hoy__fila"' + marcaEjemplo(ult, 'aviso:' + ult.id) + '><svg class="icono" aria-hidden="true"><use href="#i-aviso"/></svg><div><p class="hoy__etiqueta">Último aviso</p>' +
        '<p><a href="' + esc(ult.href) + '">' + esc(ult.titulo) + (ult.oficial ? SEDE : '') + '</a>' + (ult.ejemplo ? ' ' + EJEMPLO : '') +
        '<span class="hoy__cuando">' + esc(cuando(ult.fecha, ahora)) + (ult.oficial ? ' · Tablón oficial' : '') + '</span></p></div></li>';
    }
    /* solo en la sobria: el dato en vez del dibujo */
    h += '<li class="hoy__fila solo-sobria"><svg class="icono" aria-hidden="true"><use href="#i-sede"/></svg><div><p class="hoy__etiqueta">Sede electrónica</p>' +
      '<p><a href="' + esc(D.rutas.tramites) + '"><b>' + D.tramites_sede + ' trámites</b> en la sede, las 24 horas</a></p></div></li>';
    return h + '</ul>';
  }

  /* avisos propios + anuncios del tablón oficial, lo más nuevo primero */
  function ultimos(D, ahora) {
    var propios = avisosVigentes(D, ahora).map(function (a) {
      return { id: a.id, fecha: a.fecha, tema: a.tema, titulo: a.titulo, href: enlaceAviso(a, D), ejemplo: a.ejemplo, oficial: false };
    });
    var oficiales = ((D.tablon && D.tablon.entradas) || []).filter(function (t) { return !t.oculto; }).map(function (t, i) {
      return { id: 'tablon-' + i, fecha: t.fecha, tema: t.tema, titulo: t.titulo_claro || t.titulo, href: t.url, oficial: true };
    });
    return propios.concat(oficiales).sort(function (a, b) { return b.fecha.localeCompare(a.fecha) || (a.oficial - b.oficial); });
  }

  /* ── tablón con filtros ── */
  function tablon(D, ahora, op) {
    op = op || {};
    var filas = ultimos(D, ahora);
    if (!filas.length) return '<p class="tablon__cuenta">Ahora mismo no hay avisos publicados.</p>';
    var limite = op.limite || filas.length;
    var temas = [];
    filas.forEach(function (f) { if (temas.indexOf(f.tema) < 0) temas.push(f.tema); });
    temas.sort(function (a, b) { return a.localeCompare(b, 'es'); });
    var h = '<div class="filtros" role="group" aria-label="Filtrar por tema" hidden>' +
      '<button type="button" class="filtro" data-tema="" aria-pressed="true">Todos</button>' +
      temas.map(function (t) { return '<button type="button" class="filtro" data-tema="' + esc(t) + '" aria-pressed="false">' + esc(t) + '</button>'; }).join('') + '</div>';
    h += '<p class="tablon__cuenta" role="status" data-limite="' + limite + '">' + (filas.length > limite ? 'Los ' + limite + ' más recientes de ' + filas.length + '.' : filas.length + ' avisos y anuncios.') + '</p>';
    h += '<ul class="tablon__lista">' + filas.map(function (f, i) {
      return '<li class="tablon__fila" data-tema="' + esc(f.tema) + '"' + (i >= limite ? ' hidden' : '') + marcaEjemplo(f, 'aviso:' + f.id) + '>' +
        '<a class="tablon__enlace" href="' + esc(f.href) + '">' +
        '<span class="tablon__meta"><span class="chip">' + esc(f.tema) + '</span><time datetime="' + f.fecha + '">' + fechaCorta(f.fecha) + '</time>' +
        (f.oficial ? '<span class="tablon__origen">Tablón oficial</span>' : '<span class="tablon__origen">Ayuntamiento</span>') + '</span>' +
        '<span class="tablon__titulo">' + esc(f.titulo) + '</span>' + (f.oficial ? SEDE : '') +
        '<svg class="icono tablon__flecha" aria-hidden="true"><use href="#' + (f.oficial ? 'i-salida' : 'i-flecha') + '"/></svg></a>' +
        (f.ejemplo ? EJEMPLO : '') + '</li>';
    }).join('') + '</ul>';
    return h;
  }

  /* ── lo que viene y lo que pasó ── */
  function linea(D, ahora) {
    var vienen = proximos(D, ahora, 3).reverse();      /* lo más cercano, pegado a «Hoy» */
    var pasaron = (D.noticias || []).filter(function (n) { return !n.oculto && n.fecha <= ahora.iso; })
      .sort(function (a, b) { return b.fecha.localeCompare(a.fecha); }).slice(0, 3);
    var h = vienen.map(function (e) {
      return '<li class="linea__item linea__item--evento"' + marcaEjemplo(e, 'evento:' + e.id) + '>' +
        '<p class="linea__cuando"><time datetime="' + e.fecha + '">' + esc(cuando(e.fecha, ahora)) + (e.hora ? ', ' + hora(e.hora) : '') + '</time><span class="chip chip--agenda">Agenda</span>' + (e.ejemplo ? EJEMPLO : '') + '</p>' +
        '<div class="linea__tarjeta"><div><h3 class="linea__titulo"><a href="' + esc(enlaceEvento(e, D)) + '">' + esc(e.titulo) + '</a></h3>' +
        (e.lugar ? '<p class="linea__lugar">' + esc(e.lugar) + '</p>' : '') + '</div></div></li>';
    }).join('');
    h += '<li class="linea__hoy"><span class="linea__marca" aria-hidden="true"><svg class="linea__arquito" viewBox="0 0 20 24"><path d="M2 23V10a8 8 0 0 1 16 0v13"/></svg></span>' +
      '<span class="linea__hoy-texto"><b>Hoy</b>, ' + esc(fechaLarga(ahora.iso)) + '</span></li>';
    h += pasaron.map(function (n) {
      return '<li class="linea__item linea__item--noticia"' + marcaEjemplo(n, 'noticia:' + n.id) + '>' +
        '<p class="linea__cuando"><time datetime="' + n.fecha + '">' + esc(cuando(n.fecha, ahora)) + '</time><span class="chip chip--noticia">Noticia</span>' + (n.ejemplo ? EJEMPLO : '') + '</p>' +
        '<div class="linea__tarjeta">' + (n.imagen ? '<figure class="linea__foto arco-opcional"><img src="' + esc(D.rutas.media + n.imagen + '-800.jpg') + '" alt="' + esc(n.imagen_alt || '') + '" width="400" height="300" loading="lazy" decoding="async"></figure>' : '') +
        '<div><h3 class="linea__titulo"><a href="' + esc(enlaceNoticia(n, D)) + '">' + esc(n.titulo) + '</a></h3>' +
        (n.resumen ? '<p class="linea__lugar">' + esc(n.resumen) + '</p>' : '') + '</div></div></li>';
    }).join('');
    return h;
  }

  /* ── el año en fiestas ── */
  function anio(D, ahora) {
    return MESES.map(function (m, i) {
      var mes = i + 1;
      var fs = (D.fiestas || []).filter(function (f) { return f.mes === mes; });
      var actual = mes === ahora.mes;
      return '<li class="mes' + (fs.length ? ' con-fiesta' : '') + (actual ? ' es-mes-actual' : '') + '">' +
        '<p class="mes__nombre">' + m.charAt(0).toUpperCase() + m.slice(1) + (actual ? ' <span class="mes__ahora">Este mes</span>' : '') + '</p>' +
        (fs.length ? '<ul class="mes__fiestas">' + fs.map(function (f) {
          return '<li><b>' + esc(f.nombre) + '</b>' + (f.mayor ? ' <span class="chip chip--mayor">Fiesta mayor</span>' : '') + '<span>' + esc(f.cuando) + '</span></li>';
        }).join('') + '</ul>' : '<p class="mes__vacio">Sin fiestas señaladas</p>') + '</li>';
    }).join('');
  }

  /* ── página de agenda ── */
  function evento(e, D, ahora) {
    return '<li class="evento" id="evento-' + esc(e.id) + '"' + marcaEjemplo(e, 'evento:' + e.id) + '>' +
      '<p class="evento__fecha"><time datetime="' + e.fecha + '">' + esc(cuando(e.fecha, ahora)) + (e.hora ? ', ' + hora(e.hora) : '') + '</time>' +
      (e.origen === 'fiesta' ? '<span class="chip">Fiesta</span>' : '') + (e.ejemplo ? EJEMPLO : '') + '</p>' +
      '<h3 class="evento__titulo">' + esc(e.titulo) + '</h3>' +
      (e.lugar ? '<p class="evento__lugar">' + esc(e.lugar) + '</p>' : '') + (e.nota ? '<p class="evento__nota">' + esc(e.nota) + '</p>' : '') + '</li>';
  }
  function agenda(D, ahora) {
    var p = proximos(D, ahora);
    var ya = pasados(D, ahora).slice(0, 6);
    return '<h2 class="seccion__titulo" id="t-proximo">Lo que viene</h2>' +
      (p.length ? '<ol class="eventos">' + p.map(function (e) { return evento(e, D, ahora); }).join('') + '</ol>' : '<p>No hay nada anunciado.</p>') +
      (ya.length ? '<h2 class="seccion__titulo" id="t-pasado">Ya pasó</h2><ol class="eventos eventos--pasados">' + ya.map(function (e) { return evento(e, D, ahora); }).join('') + '</ol>' : '');
  }

  /* ── estado de un servicio (página de teléfonos) ── */
  function servicio(D, ahora, op) {
    var s = (D.servicios || {})[op.clave];
    return s ? estadoHtml(s, ahora, 'estado estado--servicio') : '';
  }

  var BLOQUES = { franja: franja, hoy: hoy, tablon: tablon, linea: linea, anio: anio, agenda: agenda, servicio: servicio };

  raiz.Vivo = {
    ahoraEn: ahoraEn, estado: estado, fechaLarga: fechaLarga, fechaCorta: fechaCorta,
    urgentes: urgentes, proximos: proximos, ultimos: ultimos,
    pintar: function (nombre, D, ahora, op) { return BLOQUES[nombre](D, ahora, op || {}); },
    bloques: Object.keys(BLOQUES)
  };
})(typeof window !== 'undefined' ? window : globalThis);
