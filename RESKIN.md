# Reskin: pasar la plantilla a otro ayuntamiento

Receta para «hazle la maqueta a X». Todo el cambio consiste en tres pasos:
1. rellenar `municipio.json`;
2. soltar el escudo y las fotos;
3. ejecutar los scripts.

No se toca HTML, CSS ni JS a mano. Si hace falta, ya no es un reskin (ver «Cuándo deja de ser reskin», al final).

Tiempo orientativo: 1–2 horas con los datos a mano. Lo que más tarda es **reunir los datos con su fuente**, no aplicarlos.

Prueba real: `pruebas/segura-de-leon/` es Segura de León completo (otro escudo, otra sede, 3 servicios). `scripts/verificar.mjs` lo aplica sobre una copia y falla si queda cualquier resto del municipio original.

---

## 1. Duplicar la carpeta

```bash
cp -r plantilla-ayuntamiento-puerta-abierta-web <municipio>-ayuntamiento-web
cd <municipio>-ayuntamiento-web
rm -rf .git screenshots _scratch && git init
rm -f marca/perfil.* marca/plano.*    # el perfil y el plano son del pueblo de origen (ver §6 bis)
npm install                      # Playwright y axe-core, solo para los scripts
```

La prueba de reskin de `verificar.mjs` aplica sobre una copia el primer municipio de `pruebas/` **distinto del tuyo**. Si tu municipio es justo el de `pruebas/` (le pasa a Segura de León), pon allí el de la plantilla (`municipio.json`, `marca/`, `media/` y `contenido/` del original) para que la prueba siga teniendo otro pueblo con el que comparar.

## 2. Reunir los datos (con fuente)

Guárdalos en un `DATOS.md` como el de Ribera: un dato por fila y su fuente. Las reglas del prompt común se aplican igual:
- **Lo no confirmado no se inventa.** O no aparece, o lleva `"ejemplo": true` y sale con la etiqueta «Ejemplo».
- **La corporación**, de los BOP, nunca de la ficha de la Diputación (suele estar desfasada).
- **Los teléfonos**, con el formato `924 536 011`. `aplicar.mjs` se niega si no.
- **Corrige las erratas** de su web y apúntalas en el README.

Fuentes que funcionaron en Ribera y Segura:

| Dato | Dónde |
|---|---|
| Habitantes | INE, serie de padrón del municipio |
| Corporación | BOP de Badajoz (nombramientos y delegaciones) |
| Sede, DIR3 y NIF | `<sede>/ownership` |
| Trámites | catálogo de la sede (`/catalog/t/<uuid>`) |
| Teléfonos | su web, guardiacivil.es, educarex, el directorio de bibliotecas y el catálogo del SES |
| Fiestas | su web, la ficha de la Diputación y Turismo de Extremadura |
| Fotos | Wikimedia Commons, con autor y licencia |
| Código INE | INE (nomenclátor) o el DIR3 de la sede: `L01` + **INE** + dígito de control. Abre el enlace de AEMET y mira que sale tu pueblo |
| Farmacias y guardias | El Ayuntamiento o las propias farmacias (el calendario de guardias lo reparte el Colegio cada año); el buscador del Colegio provincial como `farmacias.oficial` |
| Plenos | Convocatorias en el tablón de la sede; las grabaciones, en su Facebook o YouTube |

## 3. `municipio.json`

| Campo | Obligatorio | Notas |
|---|---|---|
| `slug` | sí | `a-z0-9-`. Se usa en las claves de localStorage |
| `nombre`, `nombre_corto` | sí | `nombre_corto` sale en «Hoy en …» y «El año en …» |
| `provincia`, `comarca`, `gentilicio`, `habitantes`, `lema` | no | El lema sale en cursiva bajo el nombre; si es `null`, no sale |
| `propuesta` | — | `true` en la maqueta: banda «no es la web oficial» y título de compartir «Propuesta de web». `false` al venderla |
| `indexar` | — | `false` hasta que sea la web oficial |
| `url` | — | La dirección publicada. Sirve para la og:image y la 404 bajo prefijo |
| `web_actual` | no | Su web de ahora; el aviso legal de la propuesta la cita |
| `contacto.*` | sí | Dirección, CP, teléfono y correo. `fax` y `mapa_consulta` son opcionales |
| `horario` | sí | `texto` y `tramos: [{dias:[1..7], de:"09:00", a:"14:00"}]` (1 es lunes). Sin tramos no se calcula «abierto ahora». Si no está confirmado, `"ejemplo": true` |
| `sede` | sí | Ver §4 |
| `tablon_autorizado` | — | `false` hasta que el Ayuntamiento autorice por escrito leer su tablón (ver §7) |
| `tablon_max` | no | Cuántos anuncios del tablón enseña la web (40 si no se dice). Hace falta en las sedes que guardan años de tablón (Diputación) |
| `hoja` | no | `{id, pestanas: {avisos, agenda, noticias, farmacias}}` de la hoja de Google publicada (ver README). `farmacias` es opcional: la pestaña de guardias |
| `legal` | sí | `titular`, `nif` y `dir3` |
| `escudo_credito` | sí | Autor, licencia y URL de la ficha de Commons |
| `corporacion` | no | `grupos` (sigla, nombre, color, trama `liso`/`rayas`/`puntos`/`cuadros`, gobierno) y `miembros` (nombre, grupo, cargo, delegación y `alcalde: true`). Sin `grupos` no sale el hemiciclo; con 13 concejales o menos, sale de una sola fila |
| `alcaldia.saluda` | no | Con `saluda_ejemplo: true` mientras no lo escriban ellos |
| `quien` | no | Tema, persona y cargo. Las de `portada: true` salen en la portada (4). En «El Ayuntamiento», cada fila se completa con la delegación oficial y el grupo del miembro de `corporacion` con el mismo nombre, y las delegaciones que no estén en `quien` se añaden al final (ya no hay sección «Concejalías» aparte): **el nombre tiene que escribirse igual en los dos sitios** |
| `servicios` | sí | Nombre, teléfono, dirección, horario, `tramos`, `nota` y `grupo`. El grupo ordena el listín. Sin teléfono (la recogida de basura, por ejemplo) sale solo con su detalle, y entonces lleva al menos `nota` u `horario` |
| `urgencias` | no | El 112 va el primero, en rojo |
| `listin_corto` | no | 4 nombres de `servicios` o `urgencias` para la portada |
| `tramites.atajos`, `temas`, `momentos` | sí | Cada trámite con `id` (Gestiona), `url` u `opc` (Diputación). `tipo: "pdf"`, `"doc"` (impreso en Word) o `"documento"` cambia el aviso «se abre la sede». Los atajos llevan `icono` (opcional): el nombre de un símbolo de `fuente/_iconos.html` sin el `i-` (`padron`, `recibo`, `obra`, `carrito`, `volante`, `incidencia`, `casa`, `familia`…); sin él, `documento`. `aplicar.mjs` se niega si el icono no existe |
| `horizonte_agenda_dias` | no | Cuántos días por delante enseña «Lo que viene» en la portada (60 si no se dice). Si no hay nada en ese plazo, lo dice y nombra lo siguiente de la agenda. Si hay uno o dos, se completa hasta tres con «Más adelante» (lo que la agenda ya tiene después del plazo). En la página «Agenda», el calendario del mes deja pasar como poco hasta ese mes (y hasta el del último acto anunciado) |
| `tramites.todos` | sí | Todo el catálogo. `vigente: false` lo oculta sin borrarlo. Los impresos de su web van aquí con `url` y `tipo: "pdf"` o `"doc"`: salen con la etiqueta PDF o Word |
| `tramites.sinonimos` | no | Palabras del vecino que llevan al nombre oficial: `"boda": ["matrimonio"]` |
| `pueblo.*` | no | Entradilla, historia, lugares (con foto), visitas (ver abajo), placa, patrimonio, fiestas (`mes`, `fecha_fija: "MM-DD"` y `mayor`), gastronomía, personajes y rutas. Cada bloque vacío desaparece |
| `cifras` | no | v3b · banda «{nombre_corto} en cifras» de la portada, entre «El año» y «Conocer»: `[{valor, unidad, etiqueta, fuente, fuente_url, anio}]`, de 4 a 5. `valor` es un número (sale a la española: 3.130, 185,6) o un texto (un año, «s. XIII»). **Cada cifra lleva su fuente**, que sale en pequeño debajo con su enlace y el año del dato; `aplicar.mjs` se niega sin `valor`, `etiqueta` o `fuente`. Fuentes buenas: INE (padrón), la ficha de la Diputación (superficie y altitud), el IGN. Si las fuentes no coinciden (las distancias de Ribera), no se pone. Sin el campo, la banda no sale |
| `pueblo.lugares` en la portada | — | La banda «Conocer …» de la portada enseña los 5 primeros lugares **con foto** (en el orden de `pueblo.lugares`), en arco y con su crédito; cada uno enlaza a su sitio en «El pueblo → Qué ver» (`pueblo.html#lugar-<nombre>`). Con menos de 3 lugares con foto, la banda no sale |
| `pueblo.portada_lugares` | no | Para elegir cuáles y en qué orden salen en «Conocer …»: lista de `nombre` de `pueblo.lugares` (con foto), 5 como mucho. El primero sale más grande: conviene la mejor foto. `aplicar.mjs` se niega si un nombre no es un lugar con foto |
| `pueblo.visitas` | no | Lo que se visita por dentro (museo, casa natal, centro de interpretación): `nombre`, `texto`, `direccion`, `horario`, `precio`, `telefono`, `nota`, `url` y `url_texto`. Sale en «El pueblo → Para visitar». Cada dato solo aparece si está: **si el horario no está confirmado, no se pone**; se dice en `nota` cómo preguntarlo |
| `documentos` | no | Lo que su web tenía colgado y no es un trámite: ordenanzas, actas, decretos. Lista de `{grupo, nota, items: [{titulo, url, tipo: "pdf"\|"doc", fecha}]}`. Sale en «El Ayuntamiento → Normativa y documentos», un desplegable por grupo |
| `pueblo.establecimientos` | no | Lo que su web tenía de bares, restaurantes, alojamientos o área de autocaravanas: `[{grupo, nota, items: [{nombre, direccion, telefono, nota}]}]`. Sale en «El pueblo → Dónde comer y dormir», con la forma del listín. Son negocios privados: **`pueblo.establecimientos_fuente` es obligatorio** («Datos de la web municipal, actualizados en 2022.») y sale debajo, con el aviso de que el Ayuntamiento no responde de ellos |
| `instalaciones` | no | Instalaciones municipales y alojamiento municipal: `[{grupo, items: [{nombre, texto, direccion, horario, precio, telefono, nota, url, url_texto}]}]`. Sale en «Teléfonos y servicios → Instalaciones municipales», un bloque de fichas por grupo (Deporte, Parques, Alojamiento municipal…). Cada dato solo aparece si está; con `url` va `url_texto`, que dice qué abre (por ejemplo, «Reservar en su sistema actual»). Lo privado (bares, casas rurales) va en `pueblo.establecimientos` |
| `canal_avisos` | no | Si el Ayuntamiento ya publica avisos en Bandomóvil, Telegram o WhatsApp: `{nombre, url, texto, pasos: ["Descargue…", "Busque…"], otros: [{nombre, url}]}`. Sale arriba de «Avisos» («Reciba los avisos en el móvil», con los `pasos` como «Cómo apuntarse»), al pie del panel «Hoy» de la portada, al lado del tablón de la portada (con los `pasos`), en el pie de todas las páginas y en «Contacto». Que lo sigan usando: la web no lo sustituye. **No se inventa**: sin canal confirmado, no se pone |
| `ine` | no | Código INE del municipio, **5 cifras** sin el dígito de control (`"06113"`). Es la **única** fuente del enlace «El tiempo» del panel «Hoy» (`aemet.es/…/municipios/<nombre>-id<ine>`; AEMET decide el pueblo por el número, no por el nombre). `aplicar.mjs` se niega si no casa con `legal.dir3` (L01 + INE + control): en otro reskin el INE estaba mal y AEMET enseñaba otro pueblo. Compruébalo abriendo el enlace |
| `farmacias` | no | Farmacia de guardia en el panel «Hoy»: `{lista: [{id, nombre, direccion, localidad, telefono}], cambio: "09:30", guardias: [{desde, hasta, farmacia}], rotacion: {inicio, dias, orden: [ids]}, oficial: {nombre, url}, ejemplo}`. Un día de guardia va de `cambio` (09:30 si no se dice) a la misma hora del día siguiente. Mandan las `guardias` por fechas (también desde la pestaña `Farmacias` de la hoja); si ninguna cubre el día, la `rotacion` (`inicio` es el primer día de la primera de `orden`; `dias`, 7 = semanal). `localidad` solo si la guardia cae en otro pueblo de la zona. `oficial` es el buscador del Colegio de Farmacéuticos (Badajoz: `https://cofbadajoz.com/farmacias-de-guardia/`): sin farmacia propia, la fila es solo ese enlace. Sin `lista` ni `oficial`, no sale |
| `plenos` | no | `[{fecha, hora, tipo, lugar, convocatoria, grabacion, ejemplo}]`. Entran en la agenda (chip «Pleno», con su .ics) y el próximo sale en «Más hoy» y al lado del tablón de la portada (con «Añadir a mi calendario»). Sin canal de avisos ni pleno próximo, el tablón ocupa todo el ancho. Mientras viene enlaza la `convocatoria`; cuando ya pasó, la `grabacion`. También vale una fila de la agenda con `"tipo": "pleno"` |
| `recogida` | no | `[{id, nombre, dias: [1..7], fechas: ["AAAA-MM-DD"], hora, como, telefono, tramite, tramite_texto, ejemplo}]` (enseres, poda, voluminosos). En «Más hoy» dice «toca hoy» o «la próxima, el …» y cómo pedirla. `tramite` es una URL o `{id}` del catálogo de la sede. Salen las 2 primeras |
| `fotos.hero` | no | `archivo`, `alt` y `posicion` (CSS). Sin foto, el arco queda como hueco diseñado con el escudo apagado |
| `fotos.hero_fotos` | no | Varias fotos para el arco de la portada, `[{archivo, alt, posicion}]`: en cada visita sale una al azar. Se elige en el `<head>` antes del primer pintado (con su precarga, su `srcset`, su `alt` y su encuadre), sin saltos de página. **La primera** es la que sale sin JavaScript y la de la imagen para compartir. Con `hero_fotos`, `hero` no hace falta; sin él, sale `hero` como siempre. Elige fotos que aguanten el arco en vertical (4:5 en escritorio) y en apaisado (5:3 en el móvil): el `posicion` horizontal decide qué queda dentro. Todas con crédito en `media/creditos.json` |
| `cabeceras` | no | Foto de la cabecera de una página interior, por id de página (`tramites`, `ayuntamiento`, `avisos`, `noticias`, `agenda`, `telefonos`, `pueblo`, `contacto`, `legal`, `noticia`): `{archivo, alt, posicion}`, o solo el nombre del archivo si la foto es decorativa (sin `alt`). Sale recortada en arco, con su crédito debajo. **`pueblo` la pinta grande**, como un hero: es la página turística, así que conviene darle la mejor foto. Las páginas sin foto llevan el arco de línea en la marca con su umbral de oro y, dentro, el **pictograma** de la página (calendario, teléfono, documento con sello, megáfono, periódico, edificio, sobre, balanza, candado, galleta, accesibilidad, pueblo), que se traza al llegar (la 404, nada: ya tiene su arco). El pictograma lo elige la plantilla (`PICTO_DE` en `aplicar.mjs`, dibujos en `fuente/_pictogramas.html`), no los datos: no hay que tocar nada. En la versión sobria, la foto es un rectángulo y no hay arco de línea. Si la foto de `pueblo` es la del primer lugar del carril, ese lugar pasa al final. Solo fotos de `media/` con crédito |
| `pueblo.patrimonio[].grupo` | no | Agrupa el patrimonio en columnas con título («Iglesia y ermitas», «Casas y palacios», «Arqueología y campo»…), en el orden en que aparecen. Sin grupos, sale la lista de siempre en dos columnas; lo que no lleve grupo entre otros que sí, va a «Otros» |

## 4. La sede: dos familias

```json
"sede": { "tipo": "gestiona", "base": "https://X.sedelectronica.es",
          "instancia_general": "<uuid>", "quejas": "<uuid>", "perfil_contratante": "<url opcional>" }
```
- **Gestiona** (esPublico). El tablón está en `/board`, la transparencia en `/transparency` y cada trámite en `/catalog/t/<uuid>`.
  - Los uuid del catálogo son **comunes** a los ayuntamientos de Gestiona. Los de Ribera valen para Segura: basta con cambiar el subdominio.
  - Comprueba cada uno con un GET.
  - Si su perfil del contratante está «deshabilitado» en la sede (le pasa a Segura), pon en `perfil_contratante` el de la Plataforma de Contratación.

```json
"sede": { "tipo": "diputacion", "base": "https://sede.X.es", "ent_id": 123,
          "opc": { "tablon": 1, "transparencia": 2, "perfil": 3 }, "instancia_general": "<opc o url>" }
```
- **Diputación de Badajoz**: las rutas son `/portal/noEstatica.do?opc_id=…&ent_id=N`. Los `opc_id` se sacan del menú de su sede. En los trámites, pon `opc` o una `url` completa.
  - Primer caso real: Monesterio (`ent_id` 54). El catálogo está en `/sede/catalogoTramites.do?ent_id=N&idioma=1&pes_cod=-1` y es corto (22 trámites).
  - Los de **registro de entrada** tienen ficha con enlace fijo: `/sede/fichaInformativa.do?asu_cod=…&asu_mod_cod=…&codVerif=<hash>&tra_cod=`. El `codVerif` es estable, no de sesión. Ponla en `url`.
  - Los del **padrón** no tienen ficha pública. Usa su `opc`: `noEstatica.do?opc_id=49` abre una página que pide identificarse y lo explica. Las rutas internas (`/sede/pmhnet/…`) devuelven una página vacía sin sesión.
  - El patrón de la verificación admite cualquier `/portal/*.do?…` o `/sede/*.do?…` de su `base`.
  - **No suele haber transparencia ni quejas** en la sede. Sin `sede.transparencia` ni `sede.opc.transparencia`, el enlace a transparencia no sale en ninguna página (franja de la sede, «Normativa y documentos» y aviso legal); lo mismo con el perfil del contratante. Sin `sede.quejas`, «Quejas» lleva a la instancia general. Pon en `sede.instancia_general` la `url` de la ficha del registro general.

La verificación comprueba que **todos** los enlaces de la sede siguen el patrón de su tipo.

## 5. Escudo y colores

```bash
node scripts/escudo.mjs ruta/al/escudo.svg            # o .png
python scripts/marca-desde-escudo.py --solo-ver       # mira qué propone
python scripts/marca-desde-escudo.py                  # lo escribe en marca/marca.json
```

`marca-desde-escudo.py` clasifica los esmaltes por área y elige el principal. Quita de la cuenta la plata, el sable, lo «natural» y el oro (que va siempre a decoración).

Si gana el **gules**, la marca pasa al siguiente esmalte, porque el gules es el de las alertas y un aviso urgente no puede parecer un botón. Le pasó a Segura: su campo es rojo y la marca quedó en el sinople de la punta.

Para forzar otro esmalte y dejar escrito el motivo:
```bash
python scripts/marca-desde-escudo.py --principal sinople --motivo "El fresno es la pieza que da nombre al pueblo"
```

Reglas que no se negocian:
- **El escudo no cambia de color nunca**: ni con la paleta, ni en el pie, ni en el favicon.
- **El color del escudo no se toca.** `aplicar.mjs` lo oscurece en OKLCH (el mismo matiz) hasta AA y se niega a escribir si algo no llega. La tabla queda en `marca/_contraste.txt`.
- **El escudo no es el motivo del diseño.** El motivo es el arco, que vale para cualquier pueblo.

`marca/marca.json` también tiene:
- `letra`: la pareja tipográfica. Si la cambias, ejecuta `node scripts/fuentes.mjs` y `node scripts/medir-letra.mjs`;
- `giros_paleta`: cuántos grados giran las paletas B y C del mando;
- `densidad`: `"puerta"` o `"sobria"`.

## 6. Fotos

```bash
python scripts/fotos.py --lote media/_lote.json          # recorte + gradación común + 1600 y 800 px
```

- Una entrada por foto en `media/creditos.json`: `titulo`, `autor`, `licencia`, `url` y `nota`. **`aplicar.mjs` se niega a escribir si una foto no tiene crédito.**
- Las fotos de **su web** solo valen para la maqueta que se les enseña. Ponlo en la `nota`.
- Ni banco de imágenes ni IA. Si falta una foto, se deja el hueco diseñado y se apunta en el README.

## 6 bis. El pie: el perfil del pueblo y el plano

El pie abre con **el perfil del pueblo dibujado a línea** (de pie sobre la franja verde de la sede) y lleva, en su tercera columna, **un plano de las calles del Ayuntamiento**. Los dos son SVG propios que `aplicar.mjs` incrusta en cada página: ni una petición en tiempo de ejecución. Los dos son opcionales:

| Archivo | Si falta |
|---|---|
| `marca/perfil.svg` (lo dibuja `scripts/perfil.mjs` desde `marca/perfil.json`) | Sale el **perfil genérico** (`fuente/_perfil_generico.svg`): casas encaladas, tejados, chimeneas y una iglesia con espadaña de un solo vano. Vale para cualquier pueblo extremeño. **Nunca una arcada**: el concepto es una sola puerta |
| `marca/plano.svg` + `marca/plano.json` (los escribe `scripts/plano.mjs` desde OpenStreetMap) | El pie queda a dos columnas (el Ayuntamiento y los enlaces útiles), sin hueco |

### El perfil de otro pueblo

Un vecino tiene que reconocer su pueblo: se dibuja **desde fotos reales** (las de `media/` o las que se tengan), no de memoria.

1. Elige el edificio que todo el mundo reconoce (la torre de la iglesia, el castillo, el silo) y, si hay, uno o dos más (otra torre, una fachada con frontón, la sierra del fondo).
2. Copia `marca/perfil.json` de Ribera como punto de partida y cambia las `piezas`. El lienzo mide **1600 × 180**: `x` de izquierda a derecha y `alto` desde el suelo. **Lo principal va en el centro**: en un móvil de 320 px solo se ve de x = 475 a x = 1125.
3. Mide sobre la foto: abre la foto con una regla (en Ribera, la foto de las torres recortada y ampliada ×3 con marcas cada 10 px) y pasa las medidas con **una sola escala** (Ribera: 0,66 unidades por píxel de la foto). Proporciones que importan: alto de la torre frente a su ancho, dónde está el campanario, cómo remata (cúpula, chapitel, espadaña), pináculos, óculos y vanos. La base de las torres puede quedar escondida detrás de las casas, como en la foto.
4. `node scripts/perfil.mjs` escribe `marca/perfil.svg` (cuenta los trazos). Míralo a 320, 1440 y 1920 px (`verificar.mjs --capturas` deja `screenshots/v3-perfil-*.png`). Repite hasta que se reconozca.

Las piezas (ver los comentarios de `scripts/perfil.mjs`):

| Pieza | Para qué |
|---|---|
| `casas` | Filas de casas con semilla fija: `desde`, `hasta`, `alto: [min, max]`, `capa`, `ventanas`, `chimeneas`, `tejados` |
| `torre` | Fuste, cornisa volada, vano en arco, `oculo` o `reloj`, `pinaculos` y `remate`: `cupula` (tambor, cúpula, linterna, cruz) o `chapitel` (apuntado) |
| `cupula` | Una cúpula suelta sobre una nave |
| `cuerpo` | La fachada entre dos torres: remate, `balaustrada`, líneas de cornisa, `oculos`, `ventanas`; con `muros: true`, con sus muros (la fachada de una iglesia de espadaña) |
| `cimborrio`, `nave` | Tejado ochavado con linterna; nave a un faldón o a un agua |
| `fronton` | Casa grande con frontón mixtilíneo, balcones, portada y escudo |
| `espadana` | El muro de las campanas, con **un** vano y su campana |
| `sierra`, `pajaros` | La sierra del fondo (línea fina) y algún pájaro |

Cada pieza lleva su `capa` (más alta, más cerca): lo de detrás no se dibuja por debajo de la silueta de lo de delante, así que no hace falta resolver los cruces a mano. Sin colores: el SVG solo lleva `<path>` (`aplicar.mjs` rechaza cualquier otra cosa) y el color lo ponen los tokens. Al aplicar, cada trazo recibe `pathLength="1"` para que el pie lo trace al asomar.

Si prefieres dibujarlo a mano (Inkscape), vale cualquier `marca/perfil.svg` con `viewBox="0 0 1600 180"`, solo `<path>` con `d` (y `class="lejos"` para lo del fondo), sin `fill`, `stroke` ni `style`, rectas rectas, pocas curvas y nada importante fuera de x ∈ [475, 1125].

### El plano

```bash
node scripts/plano.mjs                       # busca amenity=townhall en OSM dentro del término
node scripts/plano.mjs --osm way/566195233   # o el elemento exacto (mira en openstreetmap.org)
node scripts/plano.mjs --radio 170           # metros del Ayuntamiento al borde (Ribera: 170)
```

- **El Ayuntamiento, por su elemento de OSM**, nunca por el pin de Facebook (memoria «ubicación real: nodo de OSM»). Si OSM tiene varios, el script avisa y usa el que se llama «Ayuntamiento…»; si no tiene ninguno, búscalo a mano y pásalo con `--osm`.
- Dibuja las calles (las principales más gruesas), las plazas, las iglesias, el edificio del Ayuntamiento en la marca y una escala de 100 m, y rotula hasta 3 calles (la de la dirección del Ayuntamiento primero, si cabe) sin que los rótulos choquen.
- Lo usado queda en `marca/plano.json`: elemento, centro, radio, fecha y calles rotuladas. El script lo reutiliza la próxima vez.
- **ODbL**: el pie dice siempre «Datos del plano: © colaboradores de OpenStreetMap» con enlace a su página de derechos. `aplicar.mjs` se niega si `plano.json` no trae la atribución.
- El User-Agent es el del proyecto, sin datos de nadie. Si Overpass está ocupado, prueba otros dos servidores. Con `--guardar copia.json` y `--desde copia.json` se redibuja sin red.
- Se ejecuta una vez al montar la web (o si cambian las calles). El plano enlaza a «Contacto», donde está el mapa de Google, que solo se carga si se pide.

### La hoja de teléfonos

`telefonos.html` tiene «Imprimir los teléfonos» (solo con JavaScript) y `css/imprimir.css` la deja en **una hoja A4**: escudo y «Teléfonos útiles de …», urgencias arriba y en grande, el resto en dos columnas, la fecha de los datos (`municipio.json → fecha_datos`), la de impresión y la web (`url`). `verificar.mjs` imprime el PDF y falla si pasa de una hoja: con un listín mucho más largo que el de Ribera (17 números), reduce los tamaños de `css/imprimir.css` o quita detalles del listín.

## 7. Contenido y tablón

- `contenido/avisos.json`, `agenda.json` y `noticias.json`: lo real de su Facebook o de su web, con fecha.
  - En `avisos.json`, `gravedad` (opcional): `"urgente"` (en rojo: una avería, una alerta), `"programado"` (en ámbar: un corte anunciado) o `"informativo"` (en ámbar; es el de por defecto). Un aviso urgente o programado con `caduca` sale en la franja de arriba de todas las páginas hasta ese día; lo urgente gana. `"urgente": true` (de antes) vale como `"gravedad": "urgente"`. La ficha «Último aviso» de la portada lleva su gravedad. En el móvil la franja va en dos líneas como mucho: si el título pasa de 70 caracteres, pon `titulo_corto` (`aplicar.mjs` avisa). Desde la hoja de cálculo valen las mismas columnas. Las fiestas con `fecha_fija` entran solas en la agenda, y los `plenos` también.
  - **Plazos** (v3b, opcional): un aviso de `avisos.json` o un anuncio de `tablon.json` puede llevar `plazo_fin` y/o `plazo_inicio` (`AAAA-MM-DD`). Sale un chip con la cuenta atrás, calculada con la fecha de Madrid en el navegador: «Abre mañana» / «Abre el …», «Quedan N días», «Último día» (el día de cierre entero) y, al día siguiente, «Plazo cerrado» (la fila baja al final del tablón). Con algún plazo abierto, la portada enseña «Plazos abiertos» bajo la tira «Hoy» (los que cierran antes, 4 como mucho); sin ninguno, no sale. **Pon solo la fecha que diga el anuncio**; si no consta, `"plazo_ejemplo": true` (sale «Ejemplo»). En `tablon.json` el plazo lo pone una persona y `scripts/tablon.mjs` lo conserva al refrescar (como `titulo_claro`). `aplicar.mjs` se niega si las fechas están mal escritas o el inicio va después del fin.
  - **«Nuevo»**: lo publicado hoy o ayer (las últimas 48 horas; la fecha no lleva hora) lleva en el tablón un punto de oro con la palabra «Nuevo». Lo urgente y lo programado llevan además una franja a la izquierda (roja o ámbar) y su chip. No hay que hacer nada.
  - En `agenda.json`, además de `id, fecha, hora, titulo, lugar, nota`: `hora_fin` (para el .ics; si no, dura una hora), `tipo: "pleno"`, `convocatoria` y `grabacion`.
  - **«Añadir a mi calendario»**: `aplicar.mjs` escribe un `ics/<id>.ics` por evento (RFC 5545: UID estable `<id>@<slug>.agenda`, Europe/Madrid con su VTIMEZONE, o día entero con `VALUE=DATE`) y borra los que sobran. `ics/` es **generado**: se publica con las páginas. Un evento que llega de la hoja no tiene archivo: el navegador lo genera al pulsar.
- `contenido/tablon.json`:
  - con autorización: `node scripts/tablon.mjs`;
  - para la maqueta: guarda su `/board` una vez a mano y ejecuta `node scripts/tablon.mjs --desde copia.html`.
  - Después, rellena `titulo_claro` en cada anuncio.
  - Las sedes de Gestiona tienen `robots.txt` que prohíbe `/board` a los robots, así que **la lectura automática solo se activa con la autorización del Ayuntamiento** (`"tablon_autorizado": true`).
  - Algunas sedes (Zafra) tienen el certificado sin el intermedio y el `fetch` de Node falla. Apúntalo.
  - **Sede de la Diputación:** el tablón va por subsecciones y no tiene RSS ni JSON público.
    - El lector usa la vista antigua, `/portal/tablonVirtual.do?subseccion=<COD>&opc_id=175&pes_cod=9&ent_id=N`, que llega pintada desde el servidor, y la recorre subsección a subsección (una página por segundo).
    - Para la maqueta, `--desde` admite una carpeta con las copias: HTML de la vista antigua o el JSON de la nueva (`POST /sede/tablonElectronico.do`).
    - Guarda **todo desde 2018**. La web enseña los `tablon_max` más recientes (40 por defecto, en `municipio.json`) y cuenta las exclusiones de ese periodo.
    - La categoría es la subsección. En «Empleo Público» caen las listas y las actas de selección, y las actas de Junta de Gobierno o de Pleno que no digan «disociado» se quedan fuera.

## 8. Aplicar y verificar

```bash
node scripts/aplicar.mjs                    # se niega si falta algo, si hay un [PENDIENTE] o si falla un contraste
node scripts/verificar.mjs --capturas       # todo, y mira screenshots/
node scripts/servir.mjs                     # http://127.0.0.1:4192/?revision
```

Mira las capturas, sobre todo estas:
- `primera-pantalla-375x667.png`: el buscador de trámites y «Hacer un trámite» se ven sin bajar (lo mide también la verificación);
- la portada en las dos densidades;
- el listín;
- el pie.

## 9. Antes de entregar

1. En la reunión, con `?revision`, eligen versión y color.
2. Fija lo elegido:
   - `"densidad": "sobria"` en `marca/marca.json` si es la sobria;
   - `node scripts/aplicar.mjs --fijar-paleta b` (o `c`) si es otro color.
3. Quita el mando: `python scripts/quitar_mandos.py --comprobar` y después `python scripts/quitar_mandos.py`.
4. Pon `"propuesta": false` y `"indexar": true` en `municipio.json` **solo** cuando sea la web oficial en su dominio.
5. Ejecuta `node scripts/aplicar.mjs` y `node scripts/verificar.mjs`.

---

## Qué NO se cambia en un reskin

- La estructura de páginas y secciones.
- El arco, la cortina y la densidad.
- La accesibilidad, el aviso de cookies, el mapa bajo clic, el menú y la 404.
- Los textos fijos («¿Qué necesita hacer?», «Lo que viene y lo que pasó»…).
- Lo que sale solo de los datos: el índice A–Z de «Todos los trámites» (las letras sin trámites, apagadas), el índice «En esta página» de las páginas con 4 o más secciones (`SIN_INDICE` en `aplicar.mjs` dice cuáles no lo llevan), el calendario del mes de la agenda y la fecha en arco de las noticias sin foto.

## Cuándo deja de ser reskin

Avisa antes, porque son horas y no minutos:
- Quieren otra estructura: sede propia, cita previa con agenda, área de usuario o blog.
- El municipio tiene **pedanías** con servicios propios.
- Necesitan otro idioma, aparte del castellano.
- El escudo solo existe en una foto mala: hay que redibujarlo (o pedirles el vectorial) antes de sacar colores.
