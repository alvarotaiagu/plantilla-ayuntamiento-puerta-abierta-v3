# Ayuntamiento de Segura de León: datos para la prueba de reskin

Todo se comprobó el **2 de octubre de 2026** con peticiones reales (curl con User-Agent de navegador, API de Commons con User-Agent identificable). Cada dato lleva su fuente. Lo que no se ha encontrado va como **[PENDIENTE]**; nada está inventado.

Aviso importante antes de diseñar: **el castillo no es templario, es santiaguista.** Lo construyó la Orden de Santiago en el siglo XIV (web municipal, página «Castillo Santiaguista»; Diputación; Turismo de Extremadura). No usar «templario» en ningún texto.

---

## 1. Escudo

### Archivos en esta carpeta

| Archivo | Qué es |
|---|---|
| `escudo.svg` | **El bueno.** SVG de Commons, el que usan la Wikipedia en español, la inglesa y Wikidata (Q1354528). 540×958. |
| `escudo-alt-sanchopanzaxxi.svg` | Otra versión SVG de Commons (SanchoPanzaXXI), con degradados y más detalle (1,1 MB). Solo como alternativa. |
| `bandera.svg` | Bandera municipal de Commons (mismo autor que `escudo.svg`). |
| `escudo-web-oficial.png` | Escudo con rótulo «Ayuntamiento de Segura de León» que usa la web actual (`/imagenes/EscudoAyto.png`, 300×300). Sirve para comparar: coincide en diseño con `escudo.svg`. |

### Crédito de `escudo.svg`
- **Ficha**: <https://commons.wikimedia.org/wiki/File:Escudo_Segura_de_Le%C3%B3n.svg>
- **Autor**: Mfarinias. «Diseño original de Antonio Alfaro de Prado».
- **Licencia**: **CC BY-SA 4.0** (<https://creativecommons.org/licenses/by-sa/4.0>). Subido el 2008-02-20.
- Fuente del dato: API de Commons (`prop=imageinfo&iiprop=url|extmetadata`).

Crédito de la alternativa: <https://commons.wikimedia.org/wiki/File:Escudo_de_Segura_de_Le%C3%B3n.svg>, autor SanchoPanzaXXI, CC BY-SA 4.0.

### Blasón
*«Partido. Primero, de gules, un castillo de su color natural. Segundo, de plata, una cruz de la Orden de Santiago resaltada de un león púrpura. Entado en punta, de sinople, una bellota de oro. Al timbre, la Corona Real de España.»* (descripción de la ficha de Commons).

- El escudo actual **se aprobó en 2008** y recuperó la cruz de Santiago, que no estaba en el escudo de 1954 (web municipal, «Datos generales»; también la ficha de Turismo de la Diputación).
- Referencia exacta en el DOE de la aprobación de 2008: **[PENDIENTE]**.

### Colores del SVG (`fill`), y qué esmalte es cada uno
Cada color se identificó sustituyéndolo en un render y viendo qué zona cambiaba.

| Hex | Esmalte / elemento | Dónde aparece |
|---|---|---|
| `#da251c` | **Gules** (rojo) | Campo del primer cuartel, cruz de Santiago, forro de la corona |
| `#ffffff` | **Plata** | Campo del segundo cuartel, perlas de la corona |
| `#c8b100` | **Oro** | Corona y bellota |
| `#369a38` | **Sinople** (verde) | Punta (entado) y esmeraldas de la corona |
| `#90546e` | **Púrpura** | León |
| `#ef9848` | «Color natural» del castillo (sillería) | Castillo |
| `#e77843` | Tejado del castillo | Castillo |
| `#70614e` | Peña (terrazado) | Base rocosa del castillo |
| `#005bbf` | **Azur** | Solo el orbe de la corona |
| `#000000` | Contornos, puertas y ventanas | Todo |

En la versión alternativa (SanchoPanzaXXI) los esmaltes son: gules `#ed1c24`, plata `#e3e4e5`, oro `#eac102`, púrpura `#800080`, sinople `#008f4c`, azur `#0071bc`.

**Colores de la web actual** (para contraste, no de marca): la plantilla de la Diputación carga el tema `estilos/default_marron.css`, con `#845E65` (malva amarronado) y `#F9EEDF` (crema).

### Bandera
*«Bandera rectangular en proporción 2:3. Blanca, con orla roja separada de los bordes por una distancia igual a su anchura. Cargada al centro con el escudo municipal en sus colores.»* (ficha de Commons: <https://commons.wikimedia.org/wiki/File:Bandera_de_Segura_de_Le%C3%B3n.svg>, autor Mfarinias, diseño original de Antonio Alfaro de Prado, CC BY-SA 4.0). Rojo de la orla: `#da251c`.

---

## 2. Sede electrónica

### Familia: **(a) Gestiona de esPublico**, no la de la Diputación

| Qué | URL | HTTP (2026-10-02) |
|---|---|---|
| Sede (base) | <https://seguradeleon.sedelectronica.es/> | 302 → `/info` → `/info.0` → 200 |
| Tablón de anuncios | <https://seguradeleon.sedelectronica.es/board> | 200 (última publicación: 02/10/2026, acta del Pleno ordinario del 30/09/2026) |
| Portal de transparencia | <https://seguradeleon.sedelectronica.es/transparency> | 200 (bloques: Institucional 456 docs, Normativa 73, Económica 116, **Patrimonio 0**, Contratación 760, Urbanismo 2, **Información y atención al ciudadano 0**) |
| Perfil del contratante (sede) | <https://seguradeleon.sedelectronica.es/contractor-profile-list> | 200 pero dice **«La página solicitada se encuentra deshabilitada»** |
| **Perfil del contratante (el que funciona)** | Plataforma de Contratación del Sector Público, «Alcaldía del Ayuntamiento de Segura de León»: <https://contrataciondelestado.es/wps/poc?uri=deeplink:perfilContratante&idBp=uJC17TpChbQQK2TEfXGy%2BA%3D%3D> | 200 |
| «Perfil de Contratante» del menú de la web | <https://seguradeleon.es/perfil.php> | **ROTO**: página de error de la Diputación |
| Instancia general (registro) | <https://seguradeleon.sedelectronica.es/catalog/t/5161fa8d-970e-4b48-a506-b2ac34ceafe5> | 200 |
| Registros presentados | <https://seguradeleon.sedelectronica.es/registro> | — (requiere identificarse) |
| Catálogo de trámites | <https://seguradeleon.sedelectronica.es/dossier> | 302 → `/dossier.N` (con sesión) |
| Titularidad y oficinas | <https://seguradeleon.sedelectronica.es/ownership> | 302 → `/ownership.N` → 200 |
| Factura electrónica | <https://seguradeleon.sedelectronica.es/e-invoice> | 302 → 200 |
| Canal de denuncias | <https://seguradeleon.sedelectronica.es/complaints-channel> | 302 → 200 |
| Validación de documentos | <https://seguradeleon.sedelectronica.es/document-validation> | — |

Notas:
- La web municipal enlaza esta sede en el menú y en un banner. Fuente: `ayuntamientos-sondeo-badajoz/datos-brutos/segura-de-leon.json` y la portada de <https://seguradeleon.es/>.
- **Los UUID de `/catalog/t/` son los mismos que en Ribera del Fresno** (instancia general, padrón, quejas…). Es el catálogo común de Gestiona, así que para el reskin basta con cambiar el subdominio.
- Los enlaces de la portada de la sede llevan `?x=…` cifrado por sesión y no sirven como enlace fijo. Los `/catalog/t/<uuid>` sí son estables.
- **No hay `ent_id` ni `opc_id`**, porque no usa la plataforma de la Diputación. Existe un resto: `sede.seguradeleon.es` resuelve (195.57.11.108). Por http redirige a `https://accede.dip-badajoz.es/portal/inicio.do`, que responde «Acceso Incorrecto: Debe acceder a través del enlace publicado en su entidad». Por https da error de certificado, porque el certificado es `*.dip-badajoz.es`. **No enlazarla.**
- Licitación: además del perfil en la Plataforma, la Diputación tiene un portal de licitación electrónica para municipios (<https://licitacionmunicipios.dip-badajoz.es/licitacion/>, 200), en el que aparece algún expediente de Segura. Falta comprobar si lo usa de forma habitual [PENDIENTE].

### Códigos (de la sede, `/ownership`)
- Titular: AYUNTAMIENTO DE SEGURA DE LEÓN, Plza. de España, 1, 06270 Segura de León (Badajoz).
- **DIR3**: `L01061247`. Oficina de registro: «Registro General del Ayuntamiento de Segura de León», código `O00009621`, tel. 924 703 011, fax 924 703 109.
- **NIF**: `P0612400B` (Plataforma de Contratación). La ficha de la Plataforma tiene una errata en el código postal: pone 06240.
- **Código INE**: `06124` (Turismo de la Diputación: «006124»; La Colmena Cultural usa `061240001`).

---

## 3. Datos básicos

| Dato | Valor | Fuente |
|---|---|---|
| Nombre oficial | Ayuntamiento de Segura de León (municipio: Segura de León) | sede, `/ownership` |
| Tipo de entidad | Villa | web, «Datos generales» |
| **Población** | **1.758 habitantes** (padrón a 1-1-2025: 879 hombres y 879 mujeres). Años anteriores: 1.792 en 2024 y 1.783 en 2023 | INE, tabla 2859, serie DPOP2281, consultada en directo en <https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/DPOP2281?nult=3>. Las cifras a 1-1-2026 aún no están publicadas. |
| Comarca | Tentudía | Diputación (ficha); web |
| Mancomunidad | Mancomunidad de Tentudía, con Bienvenida, Bodonal de la Sierra, Cabeza la Vaca, Calera de León, Fuente de Cantos, Fuentes de León, Monesterio, Montemolín, Pallares y Santa María de Nava | web, «Datos generales» |
| Partido judicial | Fregenal de la Sierra | web; Diputación |
| Gentilicio | **segureño, segureña** | web («Segureños/as»); Diputación («Segureño») |
| Superficie | 106,80 km² (la Diputación redondea a 106 km²) | web; Diputación |
| Altitud | 698 m (la Diputación da 700 m) | web; Diputación |
| Distancia a Badajoz | 114 km | Diputación |
| Dirección del Ayuntamiento | **Plaza de España, 1 · 06270 Segura de León (Badajoz)** | sede; web; Diputación |
| Teléfono | **924 703 011** (principal). Segundo número: 924 703 061 según la Diputación; la web lo publica cortado, «924 70 30 6» | web; Diputación |
| Fax | 924 703 109 | sede; web |
| Correo | **ayuntamiento@seguradeleon.es**. También: secretaria@seguradeleon.es (Diputación) y segura@dip-badajoz.es (web, «Datos generales», y Plataforma de Contratación) | web; Diputación |
| Coordenadas del Ayuntamiento | **38.12115, -6.53063** (OSM, edificio `way/552906363`, `amenity=townhall`). La Diputación da 38.121097, -6.53055, unos 7 m de diferencia | Overpass API; <https://turismoapps.dip-badajoz.es/servicio/ayuntamiento-de-segura-de-leon> |
| Coordenadas del castillo | 38.12253, -6.53186 (OSM `way/552906365`) | Overpass API |
| Horario de atención del Ayuntamiento | **[PENDIENTE]**: no aparece en la web ni en la sede | — |
| Alcaldía | **Isabel María Garduño Carmona (PSOE), alcaldesa-presidenta.** Corporación constituida el 17/06/2023: 6 concejales del PSOE y 3 del PP en la lista de la Diputación. La lista de concejales puede estar desactualizada [verificar] | Diputación, «Corporación»; la web tiene «Saludo de la Alcaldesa», pero la página está vacía |
| Redes | Facebook `aytoseguradeleon`; Instagram `ayuntamientoseguradeleon` y `turismo_segura_de_leon`; YouTube `UCRa7SUGe9DOYKIx1OsiSRMw` | web; Turismo de la Diputación |

> Ojo con **seguradeleon.com**: hoy redirige (301) a `onescreener.com/koitoto`, una página ajena. Sin embargo, la Diputación lo sigue dando como «otra web» y la página de horarios publica el correo `oficinaturismo@seguradeleon.com`. **No usar el .com.** También sirve como argumento de venta.

Fuentes de esta sección:
- Web, «Datos generales»: <https://seguradeleon.es/plantilla.php?enlace=infobasica>
- Diputación, ficha: <https://www.dip-badajoz.es/municipios/municipio_dinamico/inicio/index_inicio.php?codigo=137>
- Diputación, corporación: <https://www.dip-badajoz.es/municipios/municipio_dinamico/corporacion/index_corporacion.php?codigo=137>
- Sede, titularidad: <https://seguradeleon.sedelectronica.es/ownership>

---

## 4. Servicios municipales y de interés (publicados, con fuente)

La página «Teléfonos de Interés» de la web (`plantilla.php?enlace=telefonos`) **está vacía**, así que los teléfonos salen de fuentes oficiales externas.

| Servicio | Teléfono | Dirección | Otros | Fuente |
|---|---|---|---|---|
| **Biblioteca Pública Municipal «Maestro Don Jacinto»** | **924 703 525** | C/ Manuel Medina Gata, 2 · 06270 | De lunes a viernes, de 16:00 a 20:00. Del 1 de julio al 31 de agosto, de 10:00 a 14:00. Fundada en 1983 | Directorio de Bibliotecas del Ministerio de Cultura: <https://directoriobibliotecas.mcu.es/dimbe.cmd?apartado=buscador&accion=detalle_biblioteca&ps=2995> |
| **Guardia Civil, Puesto de Segura de León** | **924 703 130** | C/ Guardia Civil, 5 · 06270 | ba-pto-seguradeleon@guardiacivil.org | guardiacivil.es: <https://web.guardiacivil.es/es/colaboracion/atencionciudadano_1/directorio-de-telefonos-y-direcciones/PUESTO-DE-SEGURA-DE-LEON/> |
| **Consultorio de Atención Primaria (SES)** | **924 703 326** | C/ Iglesia, 7 · 06270 | — | Catálogo de centros del SES (junio de 2017): <https://saludextremadura.ses.es/filescms/web/uploaded_files/CustomContent/CATALOGO%20DE%20CENTROS%20Junio%202017.pdf>. Es oficial pero de 2017; masquemedicos.com publica el mismo teléfono |
| **Oficina de Turismo** (también hace las reservas del castillo) | **615 625 117** | C/ Castillo, 1 · 06270 | oficinadeturismo@seguradeleon.es. La misma página da también oficinaturismo@seguradeleon.com, que no es válido (ver el aviso sobre el .com) | Web: <https://seguradeleon.es/plantilla.php?enlace=Horarios> y <https://seguradeleon.es/plantilla.php?enlace=Direccion> |
| Policía Local | 649 562 513 (teléfono y WhatsApp) | Plaza de España, 1, planta 1.ª (Ayuntamiento) | policialocal@seguradeleon.es | Su página de Facebook. La descripción pública confirma la dirección y el prefijo «649…»; el número completo sale del extracto del buscador [verificar antes de publicar] |
| CEIP Nuestra Señora de Guadalupe | 924 022 416 | Llano de Santa María, s/n · 06270 | cp.ntrasradeguadalupe@edu.juntaex.es | Solo directorios de terceros (buscocolegio.com, todoeduca.com). Falta confirmarlo en Educarex [PENDIENTE] |

Otros servicios que existen pero sin teléfono propio publicado: Escuela Infantil «Colorines» (preinscripción en Secretaría), Escuela Municipal de Idiomas (remite al 924 703 011), Aula Municipal de Música, Punto Limpio (la página está vacía), Área de Autocaravanas, piscina municipal (está en OSM; su teléfono solo aparece en un directorio poco fiable, así que va como [PENDIENTE]) e IES Ildefonso Serrano (OSM).

**Recomendación para la maqueta:** biblioteca, Guardia Civil y consultorio. Las tres fichas tienen teléfono y dirección de fuente oficial.

---

## 5. Trámites con enlace real de la sede

Los cinco devuelven 200 y el `<h1>` de cada página coincide con el nombre del trámite (comprobado el 2026-10-02).

| Trámite | Enlace |
|---|---|
| **Instancia General** | <https://seguradeleon.sedelectronica.es/catalog/t/5161fa8d-970e-4b48-a506-b2ac34ceafe5> |
| Solicitud de certificado o volante de empadronamiento | <https://seguradeleon.sedelectronica.es/catalog/t/1c74bc66-8b69-4f3c-8183-d3591f0504ed> |
| Alta o renovación en el Padrón Municipal | <https://seguradeleon.sedelectronica.es/catalog/t/d120f65c-c936-4a95-bd50-e7ae970ca149> |
| Aviso de incidencia en la vía pública | <https://seguradeleon.sedelectronica.es/catalog/t/d643e8cf-0824-4617-a997-c523799b4a93> |
| Quejas y sugerencias | <https://seguradeleon.sedelectronica.es/catalog/t/ae05799c-df61-43d1-be43-31943561cea9> |

Más trámites del catálogo, con enlace fijo:
- Solicitud de licencia o autorización urbanística: `/catalog/t/15fabacb-83b1-47d1-b435-508245672051`
- Declaración responsable o comunicación urbanística: `/catalog/t/5d383e20-32a5-4fcf-8725-e51c51e83e6a`
- Domiciliación de tributos: `/catalog/t/a93cd417-195c-40c5-acf2-9a92b36c8809`
- Alta de agua: `/catalog/t/5697411e-7a60-4df6-9867-07258add24de`
- Inscripción en actividades y cursos: `/catalog/t/1086e3fa-b560-4deb-9c55-66bed39d82f4`
- Celebración de matrimonio civil: `/catalog/t/fe871c4e-f81e-4357-a5b8-94ef42a9da42`
- Solicitud de participación en procesos de selección: `/catalog/t/970c9466-4c31-4645-bebc-61e2d9f413ff`

La sede destaca tres en portada: Quejas y Sugerencias, Instancia General y Solicitud de participación en procesos de selección de personal.

---

## 6. Fiestas, identidad y fotos

### Fiestas principales

| Fiesta | Fecha | Nota | Fuente |
|---|---|---|---|
| **Las Capeas, en honor al Santísimo Cristo de la Reja** | Mediados de septiembre. **En 2026, del 11 al 16 de septiembre.** Pregón y proclamación de la Vaquera Mayor la noche del 10; actos centrales del Cristo el 14 | **Fiesta de Interés Turístico de Extremadura** y reconocida como Festejo Taurino Tradicional. Unas vaquillas cedidas por ganaderos locales se torean en la «corralá» de la Plaza de España, y está prohibido hacerles daño. Preside la Vaquera Mayor | Turismo de Extremadura: <https://www.turismoextremadura.com/es/explora/Las-Capeas-de-Segura-de-Leon-00001/>; Diputación, «Fiestas»; pueblosmagicos.es (10/09/2026). Año de la declaración: [PENDIENTE] |
| **San Roque, patrón del pueblo**, y Virgen de Agosto | 15 y 16 de agosto | — | Diputación, «Fiestas»: <https://www.dip-badajoz.es/municipios/municipio_dinamico/fiestas/index_fiestas.php?codigo=137> |
| Virgen de los Remedios y Cruces de Mayo | Mayo | La web tiene página «Cruces» | Diputación, «Fiestas» |
| Candelaria y San Blas | 2 de febrero (fecha que da la Diputación) | — | Diputación, «Fiestas» |

Otras fiestas según la Diputación: Semana Santa, Romería de San Isidro (15 de mayo), San Francisco (4 de octubre) y Todos los Santos (1 de noviembre).

### Rasgos de identidad
1. **Castillo santiaguista**, no templario. Lo levantó de nueva planta la Orden de Santiago en el siglo XIV. Alonso de Cárdenas, último maestre de la Orden, lo convirtió en su palacio cuando fue comendador mayor (1450-1474). La torre del Homenaje tiene 24 almenas. En 1973 lo compró la Diputación por un millón de pesetas, que lo cedió después al Ayuntamiento. Hoy se visita, con audioguía «8D». Fuente: <https://seguradeleon.es/plantilla.php?enlace=castillo>.
   - Horario: sábados de 10:30 a 14:30 y de 16:30 a 18:30 en invierno (de 18:00 a 20:00 en verano); domingos de 10:30 a 14:30. Entrada general 3 €, empadronados 1 €. Fuente: <https://seguradeleon.es/plantilla.php?enlace=Horarios>.
2. **Capital de la Encomienda Mayor de León** de la Orden de Santiago. La Orden concedió el fuero en 1274, y el municipio estuvo ligado a ella desde 1248 (web, «Datos generales»). De ahí la cruz de Santiago y el león del escudo.
3. **Las Capeas**: el mayor reclamo, con su propio Museo y Centro de Estudios de la Capea.
4. **«Pueblo Mágico de España»**: la web lo muestra en un banner. Es una red privada de promoción turística, no un reconocimiento oficial; conviene decirlo así.
5. **Lema oficial**: no se ha encontrado ninguno [PENDIENTE]. No inventar.

### Fotos de Commons (en esta carpeta, 1600 px de ancho)

| Archivo | Original | Autor | Licencia | Fecha |
|---|---|---|---|---|
| `castillo-commons.jpg` (1600×1071): el castillo sobre el caserío blanco, cielo limpio | <https://commons.wikimedia.org/wiki/File:Castillo_de_Segura_de_Le%C3%B3n_(15006188472).jpg> | Ana Rey, de Sevilla (Flickr) | **CC BY-SA 2.0** (<https://creativecommons.org/licenses/by-sa/2.0>) | 22-08-2014 |
| `pueblo-desde-castillo-commons.jpg` (1600×1071): tejados del pueblo vistos desde el castillo | <https://commons.wikimedia.org/wiki/File:Castillo_de_Segura_de_Le%C3%B3n_(16079590381).jpg> | Ana Rey, de Sevilla (Flickr) | **CC BY-SA 2.0** | 21-12-2014 |

Texto de crédito propuesto: «Foto: Ana Rey (Wikimedia Commons), CC BY-SA 2.0».

En la categoría de Commons «Castle of Segura de León» hay más fotos: unas 45 de Ana Rey (CC BY-SA 2.0), 5 de 19Tarrestnom65 (CC BY-SA 4.0) y el patio de Doalex (CC BY-SA 4.0). También hay una vista del cerro con el castillo de muffinn, «Segura de Leon castle at Badajoz (7044667445).jpg», con licencia **CC BY 2.0**, que no obliga a compartir igual.

---

## Pendientes
- Referencia en el DOE de la aprobación del escudo y la bandera (2008).
- Año de la declaración de las Capeas como Fiesta de Interés Turístico de Extremadura.
- Horario de atención al público del Ayuntamiento.
- Confirmar el teléfono completo de la Policía Local (649 562 513) y el del CEIP en una fuente oficial.
- Teléfono de la piscina municipal.
- Si el Ayuntamiento licita también por el portal de la Diputación (licitacionmunicipios.dip-badajoz.es).
- Lista de concejales actualizada; la de la Diputación es de la constitución de 2023.
