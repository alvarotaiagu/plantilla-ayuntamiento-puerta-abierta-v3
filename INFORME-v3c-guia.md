# Informe · rama `v3c-guia` («guia»: la cara de «publicar» para el Ayuntamiento)

**Verificación completa: 162 de 162 comprobaciones en 1050 s (las 157 de la v3 y las 5 nuevas)** (`node scripts/verificar.mjs`, con el bloque nuevo `v3cGuia`).

---

## Qué hice en cada punto

### F18 · Montaje en un clic: `plantillas-hoja/crear-hoja.gs`
- Un Google Apps Script para pegar en script.google.com con la cuenta del Ayuntamiento y ejecutar una vez (`crearHojaDeLaWeb`). Crea:
  - la carpeta «Web del Ayuntamiento» en su Drive, con todo dentro;
  - la hoja «Web del Ayuntamiento», privada, con zona horaria de Madrid y configuración regional `es_ES`;
  - tres formularios: «Publicar un aviso en la web», «Publicar un acto en la agenda» y «Publicar una noticia en la web». Cada pregunta se titula como la columna que lee la web, en el orden de `plantillas-hoja/*.csv`. Las obligatorias son Fecha y Título. Gravedad es de opción única (informativo / programado / urgente); Tema, un desplegable (`TEMAS`, editable arriba); «Título corto» va con validación ≤ 70; Convocatoria y Grabación, con validación de URL; «Tipo», una casilla «pleno». Ninguno recoge correos. Todos permiten «Editar su respuesta» y llevan mensaje de confirmación;
  - una pestaña de respuestas por formulario («Respuestas avisos/agenda/noticias»), con «Estado» en la primera columna libre (lleva una nota que lo explica);
  - las pestañas que se publican («Avisos», «Agenda», «Noticias»), cada una con su `QUERY`. Las letras de las columnas se calculan de la cabecera real de las respuestas. Solo copia las columnas de la web más «Estado», nunca la A (marca temporal), y va protegida con aviso;
  - la pestaña «Léame»: el paso manual de publicar y el bloque `hoja` para `municipio.json`;
  - el mismo bloque en el registro de ejecución (`Logger.log`).
- Opciones arriba del todo:
  - `AVISAR_POR_CORREO` (de serie, `true`): un activador `onFormSubmit` manda un correo a la cuenta del Ayuntamiento con cada envío. Sirve para enterarse si un enlace se ha escapado;
  - `SOLO_CUENTAS_DE_LA_ORGANIZACION`: `setRequireLogin`, solo con Workspace; dentro de un try.
- **No se ha podido ejecutar en Google** (no hay cuenta en este entorno). Está escrito con la API documentada (SpreadsheetApp, FormApp, DriveApp, ScriptApp, MailApp). Se ha comprobado de tres formas:
  - `node --check` sobre una copia `.js` en `_scratch/`;
  - `vm.Script` en la prueba;
  - la prueba lo **ejecuta entero contra una imitación de esa API** (`imitarAppsScript()` en verificar.mjs) y mira qué haría: formularios, títulos, la QUERY de cada pestaña, el orden de las pestañas, el «Léame» y el bloque del registro.
- Lo que no se puede automatizar, dicho paso a paso en el «Léame», en PUBLICAR.md y en el comentario del script: **publicar en la web solo las tres pestañas**. Con Apps Script solo se puede publicar el documento entero (API de revisiones de Drive), y eso dejaría ver las respuestas.
- **`PUBLICAR.md`**: el principio está reescrito. El camino corto (el script) es ahora lo primero, en 5 pasos:
  1. ejecutarlo;
  2. publicar las pestañas a mano;
  3. comprobar con `gviz` que «Avisos» se lee y «Respuestas avisos» no;
  4. `municipio.json`;
  5. dárselo al Ayuntamiento.

  Debajo, «Lo que conviene saber» de este camino. El camino manual queda como alternativa, con sus secciones de antes. A esa parte se le añadió:
  - la sección «3 bis», el formulario de noticias;
  - la pestaña «Noticias» en el paso 4;
  - «Permitir editar después de enviar»;
  - `formularios` en el bloque de `municipio.json`;
  - la fila «Noticias» en la tabla de columnas.
- `plantillas-hoja/noticias.csv`: la plantilla de la pestaña de noticias (Fecha, Título, Resumen, Texto, Estado).

### F19 · `publicar.html` «Publicar en la web»
- Página nueva desde `fuente/publicar.html`, con `css/publicar.css` y `js/publicar.js` (cargados solo ahí, por `estilos`/`scripts` de `PAGINAS`) y el pictograma nuevo `p-publicar` (un móvil con el formulario).
- **Siempre `noindex`**, también con `indexar: true`: `noindex: true` en su entrada de `PAGINAS`, y `_cabeza.html` lo pinta cuando no lo pinta ya `robots_no`. Fuera del menú. Enlace discreto en el pie de todas las páginas, «Personal del Ayuntamiento: publicar» (`.pie__personal`, en `pie__base`, con 44 px de zona táctil). Se genera también sin hoja y con `"propuesta": false`, porque la necesita la web oficial.
- Secciones:
  1. **Publicar desde el móvil**: los tres botones grandes, desde `hoja.formularios`. Sin URL, un hueco con borde de rayas y el texto «Se activa al montar la hoja (lo hace quien mantiene la web)»; no se inventa ningún enlace. Debajo, los tres pasos y el consejo de guardarla en la pantalla de inicio.
  2. **Pruébelo** (el simulador).
  3. **Qué sale dónde**: urgente, programado, informativo, acto y noticia, con dónde sale cada uno. Luego «Cuánto tarda en verse»:
     - en la web, unos minutos, en cuanto se recarga;
     - en el calendario, en el canal de avisos y en la lista de Noticias, en la próxima actualización, dos veces al día;
     - la web no publica en redes ni en apps de avisos.

     Cierra con «Así se ve»: muestras hechas con las piezas reales.
  4. **Corregir o retirar algo**: «Editar su respuesta»; la hoja; `oculto` en «Estado»; el cambio de título; qué hacer si no sale.
  5. **Un buen título**, con ejemplos «No / Sí».
  6. **Lo que no se publica aquí**:
     - lo oficial va al tablón de la sede (el texto cambia según `tablon_autorizado`);
     - nada de datos personales (RGPD);
     - las fotos, solo con permiso y por quien mantiene la web;
     - el periodo electoral (LOREG, art. 50).
  7. **Lo que se le pide a quien mantiene la web**, y lo que llega solo.
- **Muestras** (`js/publicar.js`): un aviso urgente, uno programado, uno informativo, un acto y una noticia, pintados con `Vivo.pintar` (franja, hoy, tablon, agenda, linea). Usan los datos de esta web y la fecha real; las fechas son relativas a hoy. Cada una lleva el rótulo «Muestra» y el texto dice que no están publicadas. Para que no estorben:
  - los enlaces y botones se vuelven `<span>`;
  - los títulos de las piezas pasan a `<p>`, así no rompen el orden de títulos;
  - se quitan los `id`.

  Sin JavaScript no salen; el texto ya lo explica.
- **Simulador «Pruébelo»**:
  - campos: título, gravedad (tarjetas de radio, las mismas de «Avisar de un problema»), fecha, «Caduca» y título corto;
  - pinta al momento la franja, la ficha «Último aviso» de «Hoy» y la fila del tablón reales, bajo el rótulo «Simulación: no se publica nada»;
  - dice por qué algo no sale en la franja (informativo, sin «Caduca», caducado) y avisa de un título de más de 70 sin título corto;
  - lo que no saldría no enseña ni su rótulo;
  - `role="status"`: el resumen para el lector de pantalla se dice 700 ms después de dejar de escribir, no letra a letra;
  - «Empezar de nuevo» (reset) vuelve a lo de serie: urgente, con fecha y «Caduca» de hoy;
  - el formulario no tiene `action` ni botón de enviar, y el `submit` se anula. Ni una petición de red.
- **Impresa** (`css/imprimir.css`, bloque `v3c · guia`): una hoja A4 a dos columnas a 8,4 pt. Lleva el escudo y el nombre, los pasos, dónde están los formularios (`<url>/publicar.html`, solo en papel), qué sale dónde, cuánto tarda, corregir, el buen título, lo que no se publica, lo que se pide, la fecha de impresión (la de `identidad.js`) y la nota de propuesta. Fuera los botones, el simulador, las muestras, el índice y el enlace del pie.
- Las URLs de los formularios **solo van a `publicar.html`**: se quitan de `D.hoja` (los datos vivos de todas las páginas). `aplicar.mjs` se niega con una URL sin `https://`, avisa si no parece de Google o si hay formularios sin `hoja.id`, y da error con una clave que no sea avisos/agenda/noticias.

### F20 · `RESPUESTA-CLIENTE.md`
- La respuesta corta, de usted y sin tecnicismos, para WhatsApp o correo. Debajo, la versión larga:
  - lo que hacen solos (avisos con sus tres clases, actos, noticias, corregir, retirar, cuánto tarda, cómo se monta);
  - lo que llega solo (abierto ahora, farmacia, fiestas, fechas y el tablón, este «con su autorización por escrito»);
  - lo que se le pide a Álvaro;
  - lo que no va por ahí;
  - quién puede publicar (el enlace es una llave, el correo de cada envío, Workspace).
- Al final, dos casillas para antes de mandarlo (que la actualización diaria esté encendida en ese pueblo y que el simulador abra) y lo que **no** conviene prometer: redes o Bandomóvil, fotos por formulario, el tablón sin autorización.

### F21 · `propuesta.html`
- «Publicar es rellenar un formulario» va ahora en 3 pasos (`<ol class="propuesta-pasos">`) y enlaza a `publicar.html#t-pruebelo` («Pruébelo: escriba un aviso y vea cómo quedaría»). Se queda la lista de lo que cubre el mantenimiento.

---

## Campos nuevos

| Campo | Qué |
|---|---|
| `municipio.json → hoja.formularios` | Opcional: `{avisos, agenda, noticias}`, las URLs (https) de los Formularios de Google. En Ribera, los tres a `null`. Documentado en RESKIN.md §3 y en «7 bis → Publicar en la web» |
| `PAGINAS[].noindex` (aplicar.mjs) | `true`: esa página lleva `noindex` aunque `indexar` sea `true` (la usa `publicar.html`) |

## Archivos

| Archivo | Qué |
|---|---|
| `plantillas-hoja/crear-hoja.gs`, `plantillas-hoja/noticias.csv` | F18 |
| `fuente/publicar.html`, `css/publicar.css`, `js/publicar.js` | F19 |
| `fuente/_pictogramas.html` | `p-publicar` (al final, marcado) |
| `fuente/_cabeza.html` | `{{^robots_no}}{{#pagina.noindex}}…` (una línea) |
| `fuente/_abajo.html` | `.pie__personal` tras la nav legal |
| `css/base.css` | `.pie__personal` (2 reglas, junto a `.pie__propuesta`) |
| `css/imprimir.css` | bloque `v3c · guia` al final |
| `css/propuesta.css`, `fuente/propuesta.html` | F21 |
| `scripts/aplicar.mjs` | bloque `v3c · guia` tras los datos vivos; entrada en `PAGINAS` (tras `suscribirse`); `PICTO_DE['publicar.html']` en línea propia; `publicar` en `comun` |
| `PUBLICAR.md`, `README.md`, `RESKIN.md`, `RESPUESTA-CLIENTE.md`, este informe | Documentación |
| **Generado** (no subido): `publicar.html` | Sale al regenerar |

## Pruebas

**Nuevas**, en `v3cGuia()` (registrada como `['v3cguia', v3cGuia]`), 5 comprobaciones:
1. publicar.html:
   - `noindex`, fuera del menú y con el enlace del pie en las 27 páginas;
   - sin `formularios`, ningún `<a class="publicar-boton">` y los tres huecos con «Se activa al montar la hoja…»;
   - **en una copia** con `hoja.id`, las tres URLs e `indexar: true`: los botones van a esas URLs, publicar.html sigue con `noindex` (y la portada ya no lo lleva), y las URLs no aparecen en ninguna otra página;
   - con una URL `http://`, `aplicar.mjs` se niega.
2. Muestras y simulador (390 px):
   - las muestras: 2 franjas, 2 fichas de «Hoy», 1 fila de tablón, 1 acto y 1 noticia, sin enlaces, botones, `id` ni `h3`–`h6`;
   - simulador con el teclado: un título urgente pinta la franja `es-urgente` con fondo `--alerta` y ese título, más la ficha de «Hoy» y el tablón;
   - el `role="status"` dice el título, «franja roja» y «no se publica nada»;
   - Tab lleva a la gravedad marcada, con foco visible; ↓ pasa a programado (ámbar, «franja ámbar»);
   - sin «Caduca», no hay franja y sale la nota; informativo, no hay franja, sale la nota y sigue en «Hoy»;
   - el reset vuelve a lo de serie e Intro no navega;
   - **0 peticiones de red** desde que se carga hasta el final; sin errores en la consola;
   - sin JS, ni simulador ni muestras, y sale el aviso;
   - axe 0 en tres estados.
3. Impresión: con `emulateMedia print`, ni botones, ni inputs, ni el formulario, ni el simulador, ni las muestras, ni el índice, ni las cookies, ni el enlace del pie. Se ven las 6 secciones de texto, el «Los formularios están en…» y «Impreso el…». El PDF A4 tiene **1 hoja**.
4. crear-hoja.gs:
   - compila;
   - ejecutado contra la imitación de la API, crea los 3 formularios;
   - las preguntas, normalizadas como `js/main.js`, son iguales a la cabecera de `plantillas-hoja/<tipo>.csv` y están en las columnas que lee la web (avisos y agenda: `COLUMNAS` de `comprobar-hoja.mjs`; noticias: fecha, título, resumen, texto);
   - obligatorias, solo fecha y título; `setCollectEmail(false)`; destino, la hoja;
   - cada QUERY sale de su pestaña de respuestas y elige, por letra, exactamente las preguntas más «Estado», sin la A, filtrando por la columna «Título»;
   - el bloque `hoja` lleva el id, las pestañas de `municipio.json` y las 3 URLs https, también en el registro;
   - el «Léame» lleva el id y el paso de publicar;
   - el orden de las pestañas.
5. La propuesta: 3 pasos y el enlace a `publicar.html#t-pruebelo`.

**Cambiadas:** ninguna. publicar.html entra sola en las generales (axe en las 6 combinaciones, desborde, estructura, «Ejemplo», banda, noindex, medida…). Para la medida de 75 caracteres, en publicar.html los párrafos van a `32.5em` (con las negritas, uno daba 76).

## Lo que no se pudo y por qué

- **Ejecutar crear-hoja.gs en Google**: no hay cuenta. Se ha probado con la imitación (qué llama y en qué orden), pero la imitación la he escrito yo con los nombres de la API documentada: no prueba que Google se comporte así. Lo más delicado, por si falla la primera vez:
  1. que `setDestination` cree la pestaña de respuestas con la cabecera ya escrita. Si no, el script la escribe él con los mismos títulos. Si la pestaña tarda, el error dice que se siga a mano con PUBLICAR.md;
  2. `setFormula` con comas (Apps Script usa la sintaxis en inglés aunque la hoja esté en español);
  3. `setCollectEmail`, marcado como antiguo en la API; va en un try y de todas formas es lo de serie.
- **Publicar las pestañas desde el script**: no hay API para publicar pestañas sueltas. Va paso a paso.
- **QR en la hoja impresa** para abrir los formularios: haría falta un generador de QR en la web (o una petición a terceros). En papel se escribe la dirección de `publicar.html`.

## Posibles choques al unir

- **`automatico`**:
  - `PUBLICAR.md`: reescribí el principio hasta «## 1. La hoja» y añadí la «3 bis», la pestaña Noticias, `formularios` y la fila «Noticias» de la tabla de columnas. **No toqué** «Lo que hay que saber» (la viñeta de que la hoja no entra en `feed.xml`): esa es suya.
  - `fuente/_abajo.html`: los dos añadimos una línea en `pie__base` (yo `.pie__personal` tras la nav legal; él `.pie__actualizada` tras los créditos). Son líneas distintas y contiguas.
  - En noticias, el formulario usa «Resumen» y «Texto» (un párrafo por línea), que es lo que lee su `sanearHoja`. La ayuda de la pregunta lo dice.
  - `comprobar-hoja.mjs` no conoce noticias (una exportación de noticias se lee como «avisos» y avisa de «resumen»). No lo toqué: si él lo amplía, la prueba F18 ya mira las columnas de noticias por su cuenta.
- **`aplicar.mjs`**: mi bloque va tras `gruposListin.forEach(...)` y reasigna `D.hoja` sin `formularios` (`{ ...D.hoja, formularios: undefined }`). Si «automatico» cambia cómo se construye `D.hoja` o lo usa en Node, hay que conservar ese quitar las URLs. La entrada de `PAGINAS` va tras `suscribirse`; `publicar` va en `comun` tras `servicio`. La prueba de la copia pasa `--sin-hoja` a `aplicar.mjs`, que en mi rama se ignora y en la suya evita salir a Google.
- **`transparencia`** y **`alta`**: posibles choques en `css/base.css` (mis 3 líneas junto a `.pie__propuesta`), en `_abajo.html` si tocan el pie y en `PAGINAS`/`PICTO_DE` si añaden páginas.
- **`verificar.mjs`**: un bloque antes de «orden» (con dos funciones de ayuda, `axeEn` e `imitarAppsScript`, de nombre propio) y una línea en la lista.

## Dudas para Álvaro

1. **La página es pública.** No sale en buscadores ni en el menú, pero quien la abra ve los botones y puede publicar. El script deja de serie el correo de cada envío a la cuenta del Ayuntamiento, y con Workspace se puede exigir iniciar sesión. Si un ayuntamiento no lo quiere a la vista, la alternativa es dejar `hoja.formularios` vacío y darles los enlaces solo en papel o en un marcador del móvil. ¿Lo dejamos así?
2. **Lo enviado se puede leer** en la pestaña publicada, también lo que quede en `borrador` (la página y PUBLICAR lo dicen: «nada que no pueda ser público»). No filtré `borrador`/`oculto` en la QUERY: así la web y la tarea diaria ven el `oculto` y quitan al momento lo que ya estaba montado.
3. El aviso del **periodo electoral** cita la LOREG, art. 50, sin más detalle. Si prefiere no entrar en eso en la guía, es una viñeta.
4. Los temas del formulario de avisos (Agua, Obras, Tráfico, Cultura, Deporte, Empleo, Salud, Seguridad, Otros) son los de PUBLICAR más «Seguridad», que usaba la plantilla CSV. Se cambian arriba del script.
5. La hoja impresa sale a 8,4 pt para caber en una A4. Si se queda pequeña, se puede quitar «Un buen título» del papel o imprimirla a dos caras.
