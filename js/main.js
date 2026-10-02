/* main.js — lo que hace la web en el navegador. Sin dependencias.
   Todo es mejora progresiva: sin JavaScript la página se lee entera (lo vivo
   viene pintado por scripts/aplicar.mjs con la fecha en que se generó). */
(function () {
  'use strict';
  var html = document.documentElement;
  var D = {};
  try { D = JSON.parse(document.getElementById('datos-vivos').textContent); } catch (e) {}
  var SLUG = D.slug || 'ayto';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var normal = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  var guardar = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var leer = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };

  /* ═══ lo vivo: se vuelve a pintar con la hora real ═══ */
  function ahora() { return window.Vivo.ahoraEn(D.zona, new Date()); }
  function pintarVivo() {
    if (!window.Vivo || !D.horario) return;
    var a = ahora();
    $$('[data-vivo]').forEach(function (el) {
      var bloque = el.getAttribute('data-vivo');
      var op = {};
      if (el.hasAttribute('data-limite')) op.limite = Number(el.getAttribute('data-limite'));
      if (el.hasAttribute('data-clave')) op.clave = el.getAttribute('data-clave');
      var nuevo = window.Vivo.pintar(bloque, D, a, op);
      if (el.innerHTML !== nuevo) el.innerHTML = nuevo;
      if (bloque === 'franja') el.hidden = !nuevo;
      if (bloque === 'tablon') montarTablon(el);
    });
  }

  /* ═══ tablón con filtros: se cuentan filas VISIBLES (memoria «clase de estado
     choca con un bloque»: el estado va en hidden y aria-pressed, no en clases) ═══ */
  function montarTablon(caja) {
    var grupo = $('.filtros', caja);
    if (!grupo) return;
    grupo.hidden = false;
    var limite = Number(caja.getAttribute('data-limite')) || Infinity;
    var activo = caja.getAttribute('data-tema-actual') || '';
    function aplicar(tema) {
      caja.setAttribute('data-tema-actual', tema);
      $$('.filtro', grupo).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-tema') === tema)); });
      var filas = $$('.tablon__fila', caja), vistas = 0, total = 0;
      filas.forEach(function (f) {
        var casa = !tema || f.getAttribute('data-tema') === tema;
        if (casa) total++;
        f.hidden = !(casa && vistas < limite);
        if (!f.hidden) vistas++;
      });
      var cuenta = $('.tablon__cuenta', caja);
      if (cuenta) {
        cuenta.textContent = tema
          ? (vistas === total ? vistas + (vistas === 1 ? ' aviso' : ' avisos') + ' de «' + tema + '».' : 'Los ' + vistas + ' más recientes de «' + tema + '», de ' + total + '.')
          : (vistas === total ? total + ' avisos y anuncios.' : 'Los ' + vistas + ' más recientes de ' + total + '.');
      }
    }
    if (!grupo.__montado) {
      grupo.__montado = true;
      grupo.addEventListener('click', function (ev) {
        var b = ev.target.closest('.filtro');
        if (b) aplicar(b.getAttribute('data-tema'));
      });
    }
    var existe = !activo || $$('.filtro', grupo).some(function (b) { return b.getAttribute('data-tema') === activo; });
    aplicar(existe ? activo : '');
  }

  /* ═══ el tablón más fresco (lo refresca una tarea diaria en el servidor) ═══ */
  function conTiempo(url, opciones, ms) {
    var ctl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 7000);
    if (ctl) opciones.signal = ctl.signal;
    return fetch(url, opciones).finally(function () { clearTimeout(t); });
  }
  function refrescarTablon() {
    if (!D.tablon_json || location.protocol === 'file:') return;
    conTiempo(D.tablon_json, { cache: 'no-cache', credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (t) {
        if (!t || !t.entradas || !t.actualizado || (D.tablon.actualizado && t.actualizado <= D.tablon.actualizado)) return;
        D.tablon = { actualizado: t.actualizado, entradas: t.entradas };
        pintarVivo();
      })
      .catch(function (e) { if (window.console) console.warn('Tablón: se queda el que venía en la página', e && e.message); });
  }

  /* ═══ hoja de cálculo publicada (memoria «hoja de cálculo como CMS»):
     primero se ve el respaldo, luego se fusiona lo de la hoja. ═══ */
  function leerHoja(pestana) {
    var u = 'https://docs.google.com/spreadsheets/d/' + encodeURIComponent(D.hoja.id) + '/gviz/tq?tqx=out:json&sheet=' + encodeURIComponent(pestana);
    return conTiempo(u, { credentials: 'omit' }).then(function (r) { return r.text(); }).then(function (txt) {
      var j = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
      var cols = j.table.cols.map(function (c) { return normal(c.label || c.id).replace(/\s+/g, '_'); });
      return j.table.rows.map(function (fila) {
        var o = {};
        (fila.c || []).forEach(function (c, i) {
          var v = c ? c.v : null;
          var m = typeof v === 'string' && v.match(/^Date\((\d+),(\d+),(\d+)/);
          if (m) v = m[1] + '-' + String(Number(m[2]) + 1).padStart(2, '0') + '-' + String(m[3]).padStart(2, '0');
          if (v === 'TRUE' || v === 'sí' || v === 'si') v = true;
          if (v === 'FALSE' || v === 'no') v = false;
          o[cols[i]] = v;
        });
        if (o.estado && /oculto|borrador/i.test(o.estado)) o.oculto = true;
        if (!o.id && o.titulo && o.fecha) o.id = normal(o.fecha + '-' + o.titulo).replace(/[^a-z0-9]+/g, '-').slice(0, 60);
        return o;
      }).filter(function (o) { return o.titulo && o.fecha; });
    });
  }
  function fusionar(lista, nuevas) {
    var porId = {};
    lista.forEach(function (x, i) { porId[x.id] = i; });
    nuevas.forEach(function (n) { if (n.id in porId) lista[porId[n.id]] = Object.assign({}, lista[porId[n.id]], n); else lista.push(n); });
  }
  function cargarHoja() {
    if (!D.hoja || !D.hoja.id) return;
    var p = D.hoja.pestanas || {};
    var pares = [['avisos', p.avisos], ['agenda', p.agenda], ['noticias', p.noticias]].filter(function (x) { return x[1]; });
    pares.forEach(function (par) {
      leerHoja(par[1]).then(function (filas) { fusionar(D[par[0]], filas); pintarVivo(); })
        .catch(function (e) { if (window.console) console.warn('Hoja «' + par[1] + '»: se queda el respaldo', e && e.message); });
    });
  }

  /* ═══ menú móvil ═══ */
  var menu = $('#menu'), botonMenu = $('[data-boton-menu]');
  function cerrarMenu(devolverFoco) {
    if (!menu.classList.contains('esta-abierto')) return;
    menu.classList.remove('esta-abierto');
    html.classList.remove('menu-abierto');
    botonMenu.setAttribute('aria-expanded', 'false');
    if (devolverFoco) botonMenu.focus();
  }
  if (menu && botonMenu) {
    botonMenu.hidden = false;
    botonMenu.addEventListener('click', function () {
      var abrir = !menu.classList.contains('esta-abierto');
      if (!abrir) return cerrarMenu(true);
      menu.classList.add('esta-abierto');
      html.classList.add('menu-abierto');
      botonMenu.setAttribute('aria-expanded', 'true');
      var primero = $('.menu__enlace', menu);
      if (primero) primero.focus();
    });
    $('[data-cerrar-menu]', menu).addEventListener('click', function () { cerrarMenu(true); });
    document.addEventListener('keydown', function (ev) {
      if (!menu.classList.contains('esta-abierto')) return;
      if (ev.key === 'Escape') { ev.preventDefault(); cerrarMenu(true); return; }
      if (ev.key === 'Tab') {     /* el foco no se escapa por detrás del panel */
        var f = $$('a, button', menu).filter(function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        if (ev.shiftKey && document.activeElement === f[0]) { ev.preventDefault(); f[f.length - 1].focus(); }
        else if (!ev.shiftKey && document.activeElement === f[f.length - 1]) { ev.preventDefault(); f[0].focus(); }
      }
    });
    window.matchMedia('(min-width: 64em)').addEventListener('change', function (m) { if (m.matches) cerrarMenu(false); });
  }

  /* ═══ buscador de trámites ═══ */
  var VACIAS = ' de del la las el los un una unos unas mi mis me que para en y a al por con quiero hacer como pedir solicitar tramite tramites ';
  function cargarDatosTramites(listo) {
    if (window.TRAMITES) return listo();
    var s = document.createElement('script');
    s.src = 'js/tramites-datos.js' + (D.v_datos ? '?v=' + D.v_datos : '');
    s.onload = listo;
    s.onerror = function () { if (window.console) console.warn('No se pudo cargar la lista de trámites'); };
    document.head.appendChild(s);
  }
  function variantes(p) {
    var v = [p];
    var sin = (window.SINONIMOS || {});
    Object.keys(sin).forEach(function (k) { if (normal(k) === p) sin[k].forEach(function (x) { v.push(normal(x)); }); });
    if (p.length > 4 && /s$/.test(p)) v.push(p.slice(0, -1));
    if (p.length >= 7) v.push(p.slice(0, 5));      /* «empadronarme» → «empad», casa con «empadronamiento» */
    return v;
  }
  function buscar(q) {
    var palabras = normal(q).split(/[^a-z0-9ñ@]+/).filter(function (p) { return p.length > 1 && VACIAS.indexOf(' ' + p + ' ') < 0; });
    if (!palabras.length) return [];
    var res = (window.TRAMITES || []).map(function (t) {
      var oficial = normal(t.n), claro = normal((t.c || []).join(' | '));
      var tocadas = 0, puntos = 0;
      palabras.forEach(function (p) {
        var vs = variantes(p);
        var enClaro = vs.some(function (x) { return claro.indexOf(x) >= 0; });
        var enOficial = vs.some(function (x) { return oficial.indexOf(x) >= 0; });
        if (enClaro || enOficial) { tocadas++; puntos += 10 + (enClaro ? 4 : 0) + (oficial.indexOf(p) === 0 ? 1 : 0); }
      });
      return { t: t, tocadas: tocadas, puntos: puntos };
    }).filter(function (x) { return x.tocadas; });
    var max = res.reduce(function (m, x) { return Math.max(m, x.tocadas); }, 0);
    return res.filter(function (x) { return x.tocadas === max; })
      .sort(function (a, b) { return b.puntos - a.puntos || a.t.n.localeCompare(b.t.n, 'es'); })
      .slice(0, 10).map(function (x) { return x.t; });
  }
  function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function montarBuscador(caja) {
    var campo = $('[data-buscador-campo]', caja), lista = $('[data-buscador-resultados]', caja), cuenta = $('[data-buscador-cuenta]', caja);
    if (!campo) return;
    var espera;
    campo.addEventListener('input', function () {
      clearTimeout(espera);
      espera = setTimeout(function () {
        var q = campo.value.trim();
        if (!q) { lista.innerHTML = ''; cuenta.textContent = ''; return; }
        cargarDatosTramites(function () {
          var r = buscar(q);
          lista.innerHTML = r.map(function (t) {
            var claro = (t.c && t.c[0]) ? t.c[0].split(' · ')[0] : '';
            return '<li><a href="' + escHtml(t.h) + '"><span class="resultado__nombre">' + escHtml(claro || t.n) + '</span>' +
              (claro && normal(claro) !== normal(t.n) ? '<span class="resultado__oficial">' + escHtml(t.n) + '</span>' : '') +
              '<span class="sr">' + escHtml(t.s) + '</span><svg class="icono" aria-hidden="true"><use href="#i-salida"/></svg></a></li>';
          }).join('');
          cuenta.textContent = r.length ? (r.length === 1 ? '1 trámite encontrado.' : r.length + ' trámites encontrados.')
            : 'No hay ningún trámite con esas palabras. Pruebe con otras o mire la lista completa.';
        });
      }, 160);
    });
  }
  $$('[data-buscador-pagina], #buscador').forEach(montarBuscador);
  var dialogo = $('#buscador');
  $$('[data-abrir-buscador]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      if (!dialogo || typeof dialogo.showModal !== 'function') return;     /* sin <dialog>: va a la página */
      ev.preventDefault();
      cerrarMenu(false);
      cargarDatosTramites(function () {});
      dialogo.showModal();
      $('[data-buscador-campo]', dialogo).focus();
    });
  });
  if (dialogo) {
    dialogo.addEventListener('click', function (ev) { if (ev.target === dialogo) dialogo.close(); });
    /* en un campo de búsqueda, Chrome gasta el primer Esc en vaciarlo: aquí Esc cierra siempre */
    dialogo.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { ev.preventDefault(); dialogo.close(); } });
  }

  /* ═══ filtro de «Todos los trámites» ═══ */
  $$('[data-filtro-lista]').forEach(function (caja) {
    var lista = document.getElementById(caja.getAttribute('data-filtro-lista'));
    var campo = $('input', caja), cuenta = $('[data-filtro-cuenta]', caja);
    caja.hidden = false;
    campo.addEventListener('input', function () {
      var palabras = normal(campo.value).split(/\s+/).filter(Boolean), n = 0;
      $$('li', lista).forEach(function (li) {
        var t = li.getAttribute('data-texto');
        li.hidden = !palabras.every(function (p) { return t.indexOf(p) >= 0; });
        if (!li.hidden) n++;
      });
      cuenta.textContent = palabras.length ? (n === 1 ? 'Se ve 1 trámite.' : 'Se ven ' + n + ' trámites.') : '';
    });
  });

  /* ═══ contenedores que desbordan: focusables solo si desbordan (PLIEGO §5) ═══ */
  function revisarDesborde(el) {
    if (el.scrollWidth > el.clientWidth + 1) el.setAttribute('tabindex', '0'); else el.removeAttribute('tabindex');
  }
  $$('[data-desborda]').forEach(function (el) {
    revisarDesborde(el);
    if (window.ResizeObserver) new ResizeObserver(function () { revisarDesborde(el); }).observe(el);
  });

  /* ═══ mapa bajo clic ═══ */
  $$('[data-cargar-mapa]').forEach(function (b) {
    b.hidden = false;
    b.addEventListener('click', function () {
      var caja = b.closest('.mapa');
      var f = document.createElement('iframe');
      f.src = caja.getAttribute('data-mapa');
      f.title = caja.getAttribute('data-mapa-titulo') || 'Mapa';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      caja.innerHTML = '';
      caja.classList.add('con-mapa');
      caja.appendChild(f);
    });
  });

  /* ═══ aviso de cookies ═══ */
  var cookies = $('#cookies');
  var alAceptarCookies = [];
  function cookiesVisibles() { return cookies && !cookies.hidden; }
  if (cookies) {
    if (leer(SLUG + '-cookies') !== 'ok') cookies.hidden = false;
    $('[data-aceptar-cookies]', cookies).addEventListener('click', function () {
      guardar(SLUG + '-cookies', 'ok');
      cookies.hidden = true;
      alAceptarCookies.forEach(function (fn) { fn(); });
    });
  }

  /* [MANDO DE MAQUETA] inicio */
  /* Mando de la reunión: solo con ?revision; se aparta mientras está el aviso
     de cookies. Lo borra scripts/quitar_mandos.py. */
  var mando = $('#mando');
  if (mando && html.classList.contains('en-revision')) {
    mando.hidden = cookiesVisibles();
    alAceptarCookies.push(function () { mando.hidden = false; });
    var marcar = function () {
      $$('[data-densidad]', mando).forEach(function (b) { b.setAttribute('aria-pressed', String(html.classList.contains('densidad-' + b.getAttribute('data-densidad')))); });
      var p = html.getAttribute('data-paleta') || 'a';
      $$('[data-paleta]', mando).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-paleta') === p)); });
    };
    mando.addEventListener('click', function (ev) {
      var b = ev.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-densidad')) {
        var d = b.getAttribute('data-densidad');
        html.classList.remove('densidad-puerta', 'densidad-sobria');
        html.classList.add('densidad-' + d);
        guardar(SLUG + '-densidad', d);
      } else if (b.hasAttribute('data-paleta')) {
        var p = b.getAttribute('data-paleta');
        if (p === 'a') html.removeAttribute('data-paleta'); else html.setAttribute('data-paleta', p);
        guardar(SLUG + '-paleta', p);
      }
      marcar();
    });
    marcar();
  }
  /* [MANDO DE MAQUETA] fin */

  /* ═══ cortina: si js/cortina.js no la ha cogido (sin GSAP, o no llegó), fuera ═══ */
  window.addEventListener('load', function () {
    if (html.classList.contains('con-cortina') && !window.__cortinaViva) {
      clearTimeout(window.__cortinaSeguro);
      html.classList.remove('con-cortina');
    }
  });

  pintarVivo();
  refrescarTablon();
  cargarHoja();
  setInterval(pintarVivo, 60000);
})();
