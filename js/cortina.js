/* cortina.js — «la puerta que se abre». Solo en la portada, una vez por
   sesión, ≤ 1,2 s, nunca con movimiento reducido (lo decide el <head>).

   1. Sobre la cal en sombra se traza el contorno de un arco de medio punto en
      el color de la marca, de abajo arriba (las dos jambas a la vez hasta la
      clave), y el umbral de oro.                                    0,00–0,45 s
   2. El hueco del arco se abre desde su base: el muro es un trazado SVG con
      fill-rule evenodd (la pantalla entera menos un arco que crece hacia
      arriba). A través se ve la portada ya pintada.       0,42–0,92 s, expo.inOut
   3. El hueco viaja y crece hasta el arco de la foto del hero, medido con
      getBoundingClientRect: termina exactamente encima. El velo se va y el
      arco de la foto sigue ahí.                                       0,80–1,20 s
   Clic, tecla, rueda o toque la saltan. Sin GSAP se quita al momento.
   strokeDashoffset con pathLength=1 → autoRound:false (memoria «GSAP autoRound»). */
(function () {
  'use strict';
  var html = document.documentElement;
  if (!html.classList.contains('con-cortina')) return;
  window.__cortinaViva = true;
  var cortina = document.querySelector('.cortina');
  var EVENTOS = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
  var tl;

  function quitar() {
    clearTimeout(window.__cortinaSeguro);
    html.classList.remove('con-cortina');
    EVENTOS.forEach(function (e) { window.removeEventListener(e, saltar, true); });
  }
  function saltar() { if (tl) tl.progress(1); else quitar(); }
  EVENTOS.forEach(function (e) { window.addEventListener(e, saltar, { capture: true, passive: true }); });

  var destino = document.getElementById('arco-hero');
  if (!window.gsap || !cortina || !destino) { quitar(); return; }

  var muro = cortina.querySelector('.cortina__muro');
  var lados = cortina.querySelectorAll('.cortina__lado');
  var umbral = cortina.querySelector('.cortina__umbral');

  function arranca() {
    var W = window.innerWidth, H = window.innerHeight;
    var borde = parseFloat(getComputedStyle(destino).borderTopWidth) || 0;
    /* el trazo va sobre el centro del borde del arco del hero. Se vuelve a medir
       en cada fotograma del viaje: si las letras cargan mientras tanto, el
       titular cambia de alto y el arco se mueve unos píxeles */
    function medir() {
      var fin = destino.getBoundingClientRect();
      return { x: fin.left + borde / 2, y: fin.top + borde / 2, w: fin.width - borde, h: fin.height - borde / 2 };
    }
    var f = medir();
    var w0 = Math.min(W * 0.34, H * 0.3, 220);
    var h0 = w0 * f.h / f.w;
    var ini = { x: (W - w0) / 2, y: (H - h0) / 2, w: w0, h: h0 };
    var e = { abre: 0, viaje: 0, traza: 0 };

    var n = function (v) { return Math.round(v * 10) / 10; };
    function caja() {
      var t = e.viaje;
      if (t > 0) f = medir();
      return { x: ini.x + (f.x - ini.x) * t, y: ini.y + (f.y - ini.y) * t, w: ini.w + (f.w - ini.w) * t, h: ini.h + (f.h - ini.h) * t };
    }
    /* el hueco: la parte del arco que queda por debajo de la línea de corte */
    function hueco(c, abre) {
      var r = c.w / 2, cx = c.x + r, arr = c.y + r, base = c.y + c.h;
      var corte = base - c.h * abre;
      if (abre <= 0) return '';
      if (corte >= arr) return 'M' + n(c.x) + ' ' + n(base) + 'V' + n(corte) + 'H' + n(c.x + c.w) + 'V' + n(base) + 'Z';
      var dy = arr - Math.max(corte, c.y), hw = Math.sqrt(Math.max(0, r * r - dy * dy));
      return 'M' + n(c.x) + ' ' + n(base) + 'V' + n(arr) + 'A' + n(r) + ' ' + n(r) + ' 0 0 1 ' + n(cx - hw) + ' ' + n(Math.max(corte, c.y)) +
        'H' + n(cx + hw) + 'A' + n(r) + ' ' + n(r) + ' 0 0 1 ' + n(c.x + c.w) + ' ' + n(arr) + 'V' + n(base) + 'Z';
    }
    function pinta() {
      var c = caja(), r = c.w / 2, arr = c.y + r, base = c.y + c.h, cx = c.x + r;
      lados[0].setAttribute('d', 'M' + n(c.x) + ' ' + n(base) + 'V' + n(arr) + 'A' + n(r) + ' ' + n(r) + ' 0 0 1 ' + n(cx) + ' ' + n(c.y));
      lados[1].setAttribute('d', 'M' + n(c.x + c.w) + ' ' + n(base) + 'V' + n(arr) + 'A' + n(r) + ' ' + n(r) + ' 0 0 0 ' + n(cx) + ' ' + n(c.y));
      umbral.setAttribute('d', 'M' + n(c.x - c.w * 0.07) + ' ' + n(base + 3) + 'H' + n(c.x + c.w * 1.07));
      muro.setAttribute('d', 'M0 0H' + W + 'V' + H + 'H0Z' + hueco(c, e.abre));
    }
    pinta();
    cortina.classList.add('con-muro');     /* el muro ya está: fuera el velo provisional */

    tl = window.gsap.timeline({
      onUpdate: pinta,
      onComplete: function () {
        /* dónde terminó el hueco: lo comprueba scripts/verificar.mjs contra el arco del hero */
        var c = caja();
        window.__cortinaFinal = { x: c.x, base: c.y + c.h, r: c.w / 2, viaje: e.viaje };
        quitar();
      }
    });
    tl.to(lados, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.inOut', autoRound: false }, 0)
      .to(umbral, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out', autoRound: false }, 0.12)
      .to(e, { abre: 1, duration: 0.5, ease: 'expo.inOut' }, 0.42)
      .to(e, { viaje: 1, duration: 0.4, ease: 'expo.inOut' }, 0.8)
      .to(cortina, { opacity: 0, duration: 0.14, ease: 'power1.in' }, 1.06);
    window.__cortinaTl = tl;     /* para las pruebas (scripts/verificar.mjs) */
  }
  /* medir después del primer pintado, con la cabecera y la foto ya colocadas */
  window.requestAnimationFrame(function () { window.requestAnimationFrame(arranca); });
})();
