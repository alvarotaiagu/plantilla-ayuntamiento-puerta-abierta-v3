/* incidencia.js — v3b · F9. «Avisar de un problema» sin servidor. Sin dependencias.
   Solo lo carga incidencia.html. Sin JavaScript, el formulario se envía tal cual como mailto
   (enctype text/plain) y el navegador valida los campos obligatorios.
     · Validación accesible: cada error va en un párrafo enlazado al campo con aria-describedby
       (ya puesto en la plantilla) y el campo lleva aria-invalid. Arriba, un resumen con un enlace
       a cada campo recibe el foco.
     · Si todo está bien, compone el correo (asunto y cuerpo, codificados para mailto: con
       encodeURIComponent, saltos de línea CRLF) y enseña «Su aviso está listo» con el enlace y
       el texto para copiar. Si la dirección mailto pasa de LARGO_MAX caracteres, lo avisa: hay
       programas de correo que cortan los enlaces largos.
     · «Usar mi ubicación» (Geolocation API, solo si existe): añade las coordenadas al texto de
       «¿Dónde?». Ni mapas ni peticiones a nadie.
   window.Incidencia.componer(datos) devuelve { asunto, cuerpo, href } (lo usa verificar.mjs). */
(function () {
  'use strict';
  var form = document.querySelector('[data-incidencia]');
  if (!form) return;
  var LARGO_MAX = 1800;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var correo = form.getAttribute('data-correo');
  var municipio = form.getAttribute('data-municipio');
  var resumen = $('[data-incidencia-errores]'), lista = $('[data-incidencia-errores-lista]');
  var listo = $('[data-incidencia-listo]');

  form.setAttribute('novalidate', '');
  var caja = $('[data-ubicacion]');
  if (caja && navigator.geolocation) caja.hidden = false;

  function limpio(s) { return String(s || '').replace(/\r\n?/g, '\n').trim(); }
  function componer(d) {
    var donde = limpio(d.donde).replace(/\s+/g, ' ');
    var corto = donde.length > 60 ? donde.slice(0, 57).replace(/\s+\S*$/, '') + '…' : donde;
    var asunto = 'Aviso de un problema: ' + d.categoria + (corto ? ' · ' + corto : '');
    var lineas = [
      'Aviso de un problema en la calle', '',
      'Qué pasa: ' + d.categoria,
      'Dónde: ' + limpio(d.donde), '',
      'Descripción:', limpio(d.descripcion), '',
      'Foto: ' + (d.foto ? 'la adjunto a este correo.' : 'no adjunto foto.')
    ];
    var datos = [['Nombre', d.nombre], ['Teléfono', d.telefono], ['Correo', d.correo]].filter(function (x) { return limpio(x[1]); });
    if (datos.length) { lineas.push('', 'Mis datos de contacto:'); datos.forEach(function (x) { lineas.push(x[0] + ': ' + limpio(x[1])); }); }
    lineas.push('', '--', 'Enviado desde «Avisar de un problema» de la web del Ayuntamiento de ' + municipio + '.');
    var cuerpo = lineas.join('\n').replace(/\n/g, '\r\n');
    var href = 'mailto:' + correo + '?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);
    return { asunto: asunto, cuerpo: cuerpo, href: href, largo: href.length > LARGO_MAX };
  }
  window.Incidencia = { componer: componer, LARGO_MAX: LARGO_MAX };

  function leer() {
    var cat = form.querySelector('input[name="categoria"]:checked');
    return { categoria: cat ? cat.value : '', donde: form.donde.value, descripcion: form.descripcion.value, foto: form.foto.checked,
      nombre: form.nombre.value, telefono: form.telefono.value, correo: form.correo.value };
  }

  /* cada regla: [nombre, elemento al que lleva el resumen, mensaje o null] */
  function validar(d) {
    var tel = limpio(d.telefono).replace(/[\s.\-()]/g, '');
    return [
      ['categoria', form.querySelector('input[name="categoria"]'), d.categoria ? null : 'Elija qué pasa: alumbrado, agua, limpieza…'],
      ['donde', form.donde, limpio(d.donde).length >= 3 ? null : 'Diga dónde está el problema: la calle y el número, o cómo llegar.'],
      ['descripcion', form.descripcion, limpio(d.descripcion).length >= 10 ? null : 'Cuente qué pasa, con al menos unas palabras (10 letras o más).'],
      ['telefono', form.telefono, !tel || /^\+?\d{9,15}$/.test(tel) ? null : 'El teléfono no parece correcto: escriba solo números, por ejemplo 600 123 456.'],
      ['correo', form.correo, !limpio(d.correo) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio(d.correo)) ? null : 'El correo no parece correcto: tiene que ser como nombre@ejemplo.es.']
    ];
  }

  function pintarErrores(reglas) {
    var malas = reglas.filter(function (r) { return r[2]; });
    reglas.forEach(function (r) {
      var p = form.querySelector('[data-error-de="' + r[0] + '"]');
      if (p) { p.textContent = r[2] || ''; p.hidden = !r[2]; }
      var campos = r[0] === 'categoria' ? [$('#campo-categoria')] : [r[1]];
      campos.forEach(function (c) { if (!c) return; if (r[2]) c.setAttribute('aria-invalid', 'true'); else c.removeAttribute('aria-invalid'); });
    });
    while (lista.firstChild) lista.removeChild(lista.firstChild);
    malas.forEach(function (r) {
      var li = document.createElement('li'), a = document.createElement('a');
      a.href = '#' + r[1].id;
      a.textContent = r[2];
      a.addEventListener('click', function (e) { e.preventDefault(); r[1].focus(); });
      li.appendChild(a); lista.appendChild(li);
    });
    resumen.hidden = !malas.length;
    return malas.length;
  }

  var ultimo = null;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = leer();
    if (pintarErrores(validar(d))) { resumen.focus(); return; }
    ultimo = componer(d);
    $('[data-incidencia-mailto]').href = ultimo.href;
    $('[data-incidencia-texto]').value = 'Para: ' + correo + '\nAsunto: ' + ultimo.asunto + '\n\n' + ultimo.cuerpo.replace(/\r\n/g, '\n');
    $('[data-aviso-largo]').hidden = !ultimo.largo;
    $('[data-recordar-foto]').hidden = !d.foto;
    $('[data-copiar-estado]').textContent = '';
    form.hidden = true;
    listo.hidden = false;
    listo.focus();
  });
  /* los errores se repintan solo al volver a pulsar «Preparar el correo»: quitarlos al salir de un
     campo movía la página bajo el dedo (el clic siguiente caía en otro sitio) */

  $('[data-incidencia-volver]').addEventListener('click', function () {
    listo.hidden = true; form.hidden = false;
    form.querySelector('input[name="categoria"]:checked, input[name="categoria"]').focus();
  });

  $('[data-copiar-texto]').addEventListener('click', function () {
    var t = $('[data-incidencia-texto]'), estado = $('[data-copiar-estado]');
    var hecho = function () { estado.textContent = 'Texto copiado. Péguelo en un correo nuevo.'; };
    var aMano = function () { t.focus(); t.select(); estado.textContent = 'Texto seleccionado: cópielo con Ctrl+C (o mantenga pulsado en el móvil).'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t.value).then(hecho, aMano);
    else aMano();
  });

  var boton = $('[data-usar-ubicacion]'), estadoUb = $('[data-ubicacion-estado]');
  if (boton) boton.addEventListener('click', function () {
    estadoUb.textContent = 'Buscando su ubicación…';
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude.toFixed(5), lon = pos.coords.longitude.toFixed(5);
      var txt = 'Coordenadas: ' + lat + ', ' + lon;
      var v = form.donde.value.replace(/\s*\(?Coordenadas: [-\d.]+, [-\d.]+\)?/, '').trim();
      form.donde.value = v ? v + ' (' + txt + ')' : txt;
      estadoUb.textContent = 'Añadidas al texto de «¿Dónde?»: ' + lat + ', ' + lon + '. Si puede, escriba también la calle.';
    }, function () {
      estadoUb.textContent = 'No se pudo saber su ubicación (quizá no dio permiso). Escriba la calle a mano.';
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  });
})();
