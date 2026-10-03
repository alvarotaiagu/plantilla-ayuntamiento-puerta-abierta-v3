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
npm install                      # Playwright y axe-core, solo para los scripts
```

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
| `hoja` | no | `{id, pestanas}` de la hoja de Google publicada (ver README) |
| `legal` | sí | `titular`, `nif` y `dir3` |
| `escudo_credito` | sí | Autor, licencia y URL de la ficha de Commons |
| `corporacion` | no | `grupos` (sigla, nombre, color, trama `liso`/`rayas`/`puntos`/`cuadros`, gobierno) y `miembros` (nombre, grupo, cargo, delegación y `alcalde: true`). Sin `grupos` no sale el hemiciclo; con 13 concejales o menos, sale de una sola fila |
| `alcaldia.saluda` | no | Con `saluda_ejemplo: true` mientras no lo escriban ellos |
| `quien` | no | Tema, persona y cargo. Las de `portada: true` salen en la portada (4) |
| `servicios` | sí | Nombre, teléfono, dirección, horario, `tramos`, `nota` y `grupo`. El grupo ordena el listín. Sin teléfono (la recogida de basura, por ejemplo) sale solo con su detalle, y entonces lleva al menos `nota` u `horario` |
| `urgencias` | no | El 112 va el primero, en rojo |
| `listin_corto` | no | 4 nombres de `servicios` o `urgencias` para la portada |
| `tramites.atajos`, `temas`, `momentos` | sí | Cada trámite con `id` (Gestiona), `url` u `opc` (Diputación). `tipo: "pdf"`, `"doc"` (impreso en Word) o `"documento"` cambia el aviso «se abre la sede» |
| `tramites.todos` | sí | Todo el catálogo. `vigente: false` lo oculta sin borrarlo. Los impresos de su web van aquí con `url` y `tipo: "pdf"` o `"doc"`: salen con la etiqueta PDF o Word |
| `tramites.sinonimos` | no | Palabras del vecino que llevan al nombre oficial: `"boda": ["matrimonio"]` |
| `pueblo.*` | no | Entradilla, historia, lugares (con foto), visitas (ver abajo), placa, patrimonio, fiestas (`mes`, `fecha_fija: "MM-DD"` y `mayor`), gastronomía, personajes y rutas. Cada bloque vacío desaparece |
| `pueblo.visitas` | no | Lo que se visita por dentro (museo, casa natal, centro de interpretación): `nombre`, `texto`, `direccion`, `horario`, `precio`, `telefono`, `nota`, `url` y `url_texto`. Sale en «El pueblo → Para visitar». Cada dato solo aparece si está: **si el horario no está confirmado, no se pone**; se dice en `nota` cómo preguntarlo |
| `documentos` | no | Lo que su web tenía colgado y no es un trámite: ordenanzas, actas, decretos. Lista de `{grupo, nota, items: [{titulo, url, tipo: "pdf"\|"doc", fecha}]}`. Sale en «El Ayuntamiento → Normativa y documentos», un desplegable por grupo |
| `fotos.hero` | no | `archivo`, `alt` y `posicion` (CSS). Sin foto, el arco queda como hueco diseñado con el escudo apagado |

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

## 7. Contenido y tablón

- `contenido/avisos.json`, `agenda.json` y `noticias.json`: lo real de su Facebook o de su web, con fecha. Las fiestas con `fecha_fija` entran solas en la agenda.
- `contenido/tablon.json`:
  - con autorización: `node scripts/tablon.mjs`;
  - para la maqueta: guarda su `/board` una vez a mano y ejecuta `node scripts/tablon.mjs --desde copia.html`.
  - Después, rellena `titulo_claro` en cada anuncio.
  - Las sedes de Gestiona tienen `robots.txt` que prohíbe `/board` a los robots, así que **la lectura automática solo se activa con la autorización del Ayuntamiento** (`"tablon_autorizado": true`).
  - Algunas sedes (Zafra) tienen el certificado sin el intermedio y el `fetch` de Node falla. Apúntalo.

## 8. Aplicar y verificar

```bash
node scripts/aplicar.mjs                    # se niega si falta algo, si hay un [PENDIENTE] o si falla un contraste
node scripts/verificar.mjs --capturas       # todo, y mira screenshots/
node scripts/servir.mjs                     # http://127.0.0.1:4192/?revision
```

Mira las capturas, sobre todo estas:
- `primera-pantalla-375x667.png`: el panel «Hoy» tiene que asomar;
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

## Cuándo deja de ser reskin

Avisa antes, porque son horas y no minutos:
- Quieren otra estructura: sede propia, cita previa con agenda, área de usuario o blog.
- El municipio tiene **pedanías** con servicios propios.
- Necesitan otro idioma, aparte del castellano.
- El escudo solo existe en una foto mala: hay que redibujarlo (o pedirles el vectorial) antes de sacar colores.
