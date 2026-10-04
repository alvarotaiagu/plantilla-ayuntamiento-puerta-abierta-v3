# Informe de datos reales: Ribera del Fresno (Badajoz, INE 06113)

Revisión hecha el **4 de octubre de 2026**. Solo es un informe: no se ha cambiado ningún dato, plantilla ni archivo de la maqueta.

## Cómo se ha hecho (y qué límite tiene)

- **Desde este entorno no se pudo abrir ninguna página.** El proxy de red de la nube rechaza (HTTP 403) todas las webs: riberadelfresno.es, la sede electrónica, dip-badajoz.es, Wikipedia, Wikidata, el INE, Facebook, Instagram y la prensa. El intento se hizo el 04/10/2026. Para que la próxima revisión pueda abrir las páginas, hay que dar acceso a esos dominios en los ajustes de red del entorno (menú del entorno → Editar → Acceso de red).
- Lo único que funcionó fue el **buscador web**. Cada dato marcado COINCIDE o DIFIERE se apoya en el titular, la URL y el extracto que devuelve el buscador, y la fecha de la fuente sale de la propia URL o del titular. **No se ha leído la página entera.** Antes de enseñar la web, conviene abrir a mano las fuentes de los cambios marcados DIFIERE.
- Si un dato solo aparece en directorios de terceros, en una web municipal sin fecha o en fuentes anteriores a 2025, se marca **NO COMPROBADO** o se indica la duda en la columna de la fuente.
- Las rutas de los datos siguen el formato `archivo → clave` del JSON.

## Resumen

| Veredicto | Datos |
|---|---|
| **COINCIDE** | **44** |
| **DIFIERE** | **12** |
| **NO COMPROBADO** | **42** |
| **Total revisado** | **98** |

Cada fila de las tablas cuenta como un dato. Si una fila lleva dos veredictos, cuenta como DIFIERE cuando uno de los dos lo es y, si no, por el primero.

Nada de lo que la maqueta presenta como real ha resultado falso **en la corporación ni en los teléfonos**. Los fallos están en el **calendario de fiestas**: la fiesta mayor, la Muestra de Pitarra, el Festival Folklórico y FEAVIR. También hay un plazo de **Ejemplo** que no cuadra con el real (el del IAE) y una **noticia y un aviso ya caducados**.

---

## 1. Corporación municipal

| Dato en la maqueta (archivo → clave) | Dato encontrado | Fuente y fecha | Veredicto | Cambio sugerido |
|---|---|---|---|---|
| Alcalde: Miguel Ángel Araya Salguero, PP (`municipio.json → corporacion.miembros[0]`) | Sigue de alcalde; entrevista en marzo de 2026 | [La Gaceta Independiente, 20/03/2026](https://lagacetaindependiente.com/2026/03/20/miguel-angel-araya-nuestro-objetivo-es-que-ribera-del-fresno-sea-un-referente-en-bienestar-social-y-oportunidades/); [Infoprovincia, 17/06/2023](https://infoprovincia.net/2023/06/17/miguel-angel-araya-nuevo-alcalde-del-partido-popular-en-ribera-del-fresno-promete-trabajar-por-el-desarrollo-economico-y-social-de-la-localidad/). Consultado 04/10/2026 | COINCIDE | — |
| Gobierno de coalición PP + GIR + IU; 7 concejales en el gobierno (`corporacion.nota`, `grupos[].gobierno`) | «Siete concejales que […] forman parte del gobierno municipal» | La Gaceta Independiente, 20/03/2026 | COINCIDE | — |
| Tamara Ledesma Becerra (GIR), 1.ª teniente de alcalde, Cultura y Participación Ciudadana (`miembros[1]`) | En 2026 actúa como concejala de Cultura. La prensa no menciona el cargo de teniente | La Gaceta Independiente, 31/03/2026 y 03/04/2026 (extractos del buscador) | COINCIDE (área) / NO COMPROBADO (orden de tenientes) | — |
| Andrés Bermejo Fernández (IU), 2.º teniente de alcalde, Deporte, Juventud, Mujer e Igualdad (`miembros[2]`) | «Concejal de Deportes» en la noticia del campo de fútbol | [La Gaceta Independiente, 01/10/2026](https://lagacetaindependiente.com/2026/10/01/el-campo-de-futbol-de-ribera-del-fresno-afronta-un-nuevo-capitulo-de-espera-tras-tres-anos-de-tramitacion/); [Radio Interior](https://www.radiointerior.es/texto-diario/mostrar/6036238/campo-futbol-ribera-fresno-afronta-nuevo-capitulo-espera-tres-anos-tramitacion) | COINCIDE | — |
| Teresa Hernández Gordillo (PP), 3.ª teniente de alcalde, Festejos, Sanidad y Agricultura (`miembros[3]`) | Consta como concejala del PP. No aparece ninguna fuente de 2026 con su área ni con el orden de tenientes | ficha de la Diputación (desfasada); todoslosayuntamientos.es (de terceros) | NO COMPROBADO | — |
| Ángel Rebollo Silva (GIR), Urbanismo, Infraestructuras, Obras y Servicios (`miembros[4]`) | Concejal desde el 07/02/2025. Hay obras de 2026-2027 en su área | ayuntamiento.es; La Gaceta Independiente, 20/03/2026 | COINCIDE | — |
| María Teresa Rodríguez Rosa (IU): «Turismo, Patrimonio Cultural y Natural, Comercio y Promoción Industrial» (`miembros[5].delegacion`) | La prensa la llama concejala de «Turismo, Patrimonio Cultural y Natural, **Medio Ambiente**, Comercio y Promoción Industrial». Aparece como concejala de Medio Ambiente en la renaturalización del arroyo Valdemedel y en bienestar animal | [Grada, Ribera Tur 2025](https://www.grada.es/ribera-del-fresno-impulsa-la-insercion-laboral-femenina-con-el-ribera-tur-2025/blogueros/juanfra-llano/) (2025); [Extremadura7dias, renaturalización del Valdemedel](https://www.extremadura7dias.com/noticia/ribera-del-fresno-se-adentra-en-la-renaturalizacion-del-arroyo-valdemedel-con-una-ruta-guiada) (sin fecha en el extracto) | **DIFIERE** | `"delegacion": "Turismo, Patrimonio Cultural y Natural, Medio Ambiente, Comercio y Promoción Industrial"`. En `quien[5]`: `"tema": "Turismo, patrimonio, medio ambiente y comercio"` |
| Inmaculada Campillejo Carvajal (PP), Educación, Políticas Sociales y Universidad Popular (`miembros[6]`) | Consta como concejala del PP. No aparece ninguna fuente de 2026 con su área | resultados del buscador, 04/10/2026 | NO COMPROBADO | — |
| Noelia Contreras Campillejo (PSOE) (`miembros[7]`) | Concejala del grupo PSOE | [Onda Cero Sur, julio de 2025](https://ondacerosur.es/el-ayuntamiento-de-ribera-del-fresno-incorpora-dos-nuevos-concejales-y-aprueba-las-fiestas-locales-de-2026/) | COINCIDE | — |
| Antonio Domínguez Guerrero (PSOE) (`miembros[8]`) | No sale en ninguna fuente que el buscador devuelva | — | NO COMPROBADO | — |
| María del Rosario Campillejo Murillo (PSOE) (`miembros[9]`) | Tomó posesión como concejala del PSOE | Onda Cero Sur, julio de 2025 | COINCIDE | — |
| Manuel Chacón Valverde (PSOE), sustituye a Juan José Suárez Ortiz (`miembros[10]`) | Igual | Onda Cero Sur, julio de 2025 | COINCIDE | — |
| Jordi González Santiago ya no figura | Falleció el 30/12/2024 y no está en la maqueta | [Extremadura7dias](https://www.extremadura7dias.com/noticia/luto-en-ribera-del-fresno-muere-el-primer-teniente-de-alcalde) | COINCIDE | — |
| Secretaria-interventora (`corporacion.secretaria`) | No aparece en el buscador. Es una persona funcionaria, no un cargo electo | — | NO COMPROBADO | Valorar si hace falta dar su nombre en la web (no es un cargo electo) |

> Para un dato simbólico de la portada o de la página «El Ayuntamiento»: el 14/09/2026 el Pleno nombró al Santísimo Cristo de las Misericordias **«alcalde perpetuo»**, con carácter honorífico. Fuentes: [Infoprovincia, 13/09/2026](https://infoprovincia.net/2026/09/13/ribera-del-fresno-encomienda-al-santisimo-cristo-de-las-misericordias-el-baston-de-mando-municipal-como-alcalde-perpetuo/) y [La Gaceta Independiente, 14/09/2026](https://lagacetaindependiente.com/2026/09/14/ribera-del-fresno-entrega-el-baston-de-mando-al-santisimo-cristo-de-las-misericordias-y-lo-reconoce-como-alcalde-perpetuo/). No es un error de la maqueta: es una noticia que no recoge.

## 2. Horarios, teléfono, correo y direcciones del Ayuntamiento

| Dato en la maqueta (archivo → clave) | Dato encontrado | Fuente y fecha | Veredicto | Cambio sugerido |
|---|---|---|---|---|
| Horario «Lunes a viernes, de 9:00 a 14:00» (`municipio.json → horario`, `ejemplo: true`) | El mismo horario, pero solo en directorios de terceros (ayuntamiento.org, einforma). No hay fuente oficial | resultados del buscador, 04/10/2026 | NO COMPROBADO | Mantener `"ejemplo": true` hasta que lo confirme el Ayuntamiento |
| Teléfono 924 536 011 (`contacto.telefono`) | 924 536 011 | [web municipal, Teléfonos de interés](https://riberadelfresno.es/plantilla.php?enlace=telefonointeres) (indexada); einforma | COINCIDE | — |
| Fax 924 536 428 (`contacto.fax`) | 924 53 64 28 | ayuntamiento.org (de terceros) | COINCIDE | — |
| Correo ayuntamiento@riberadelfresno.es (`contacto.correo`, `incidencias.correo`) | El mismo | ayuntamiento.org (de terceros); web municipal | COINCIDE | — |
| Casa Consistorial en C/ Ayuntamiento, 1, 06225 (`contacto.direccion`, `contacto.cp`) | C/ Ayuntamiento, 1, 06225 | einforma; DIR3 [administracion.gob.es L01061134](https://administracion.gob.es/pagFront/espanaAdmon/directorioOrganigrama/fichaUnidadOrganica.htm?codigoUnidad=L01061134) (indexada, sin abrir) | COINCIDE | — |
| Dirección del registro: C/ Ayuntamiento, 1 (`legal.direccion_registro`) | Según DATOS.md, la sede pone «Calle Ayuntamiento 2» en la oficina de registro O00009642. No se ha podido abrir la sede | sede bloqueada (403) el 04/10/2026 | NO COMPROBADO | Preguntar al Ayuntamiento si es el n.º 1 o el 2 |

## 3. Listín de servicios

| Dato en la maqueta (`municipio.json → servicios[]` / `urgencias[]`) | Dato encontrado | Fuente y fecha | Veredicto | Cambio sugerido |
|---|---|---|---|---|
| Policía Local 654 338 096, C/ Hospital | 654 338 096 | [web municipal, Policía Local](https://riberadelfresno.es/plantilla.php?enlace=policialocal) (indexada, sin fecha) | COINCIDE | — |
| Guardia Civil 924 536 013, Avda. Cuartel s/n | 924 536 013, Avda. Cuartel s/n | [guardiacivil.es](https://web.guardiacivil.es/es/colaboracion/atencionciudadano_1/directorio-de-telefonos-y-direcciones/PUESTO-DE-RIBERA-DEL-FRESNO/) (oficial) y Páginas Amarillas | COINCIDE | — |
| Protección Civil 638 763 187 | No aparece en el buscador | — | NO COMPROBADO | — |
| Consultorio médico 924 536 551 | 924 536 551. Existe una ficha «Consultorio Médico – Ribera del Fresno» en la guía de accesibilidad de la Diputación | [dip-badajoz.es, guía de accesibilidad](https://www.dip-badajoz.es/accesibilidad/guia/sitio_4079.html) (sin abrir); Páginas Amarillas (de terceros) | COINCIDE | No poner la dirección «C/ Fresno de la Ribera» que dan los directorios: es dudosa |
| Guardería Rural 615 196 716 | No aparece | — | NO COMPROBADO | — |
| Centro de Día «La Ribera» 924 028 924, de 10:00 a 18:00 | No aparece | — | NO COMPROBADO | — |
| Hogar del Pensionista 924 536 819 | No aparece | — | NO COMPROBADO | — |
| Residencia «San Juan Macías» 924 537 280 | No aparece | — | NO COMPROBADO | — |
| Hogar de Nazaret «La Providencia» 924 536 278 | No aparece | — | NO COMPROBADO | — |
| CEIP Meléndez Valdés 924 028 770, C/ Escuelas s/n | 924 028 770, C/ Escuelas s/n (código de centro 06004155) | [cpmelendezvaldes.educarex.es](https://cpmelendezvaldes.educarex.es/index.php/informacion) (oficial) | COINCIDE | — |
| IESO Valdemedel 924 281 470, sin dirección | 924 281 470, C/ Virgilio Gutiérrez s/n | educateca y todoeduca (de terceros); la web del centro es iesovaldemedel.educarex.es | COINCIDE (teléfono) | Añadir `"direccion": "C/ Virgilio Gutiérrez, s/n"` en cuanto se confirme en educarex |
| Biblioteca «Virgilio Gutiérrez» 924 537 224, L-V de 9:30 a 14:00 | No aparece | — | NO COMPROBADO | — |
| Casa de la Cultura y Escuela de Música 924 537 224 | No aparece | — | NO COMPROBADO | — |
| Piscina municipal 924 536 804 | No aparece | — | NO COMPROBADO | — |
| Parroquia N.ª S.ª de Gracia 924 536 002, C/ Iglesia, 2 | No aparece | — | NO COMPROBADO | — |
| Farmacias en C/ Meléndez Valdés 7 y 37 (`farmacias.lista`, `ejemplo: true`) | Hay dos farmacias en esas direcciones; los directorios las nombran por su titular. La rotación de guardias es de ejemplo y no se ha encontrado la real | farmacias.name y empresite (de terceros) | COINCIDE (direcciones) / NO COMPROBADO (guardias) | Mantener `"ejemplo": true`. Pedir el cuadrante de guardias al Colegio de Farmacéuticos |
| Juzgado de Paz (no está en el listín) | Existe (directorio del Ministerio de Justicia, municipio 06113), pero sin teléfono publicado | [mjusticia.gob.es, buscador](https://www.mjusticia.gob.es/BUSCADIR/ServletControlador?apartado=buscadorMunicipioDesdeListado&municipio=06113&lang=es_es) (sin abrir) | NO COMPROBADO | Si el Ayuntamiento da un horario, añadirlo. Si no, dejarlo fuera |
| Emergencias 112 (`urgencias[0]`) | 112 | número europeo | COINCIDE | — |

## 4. Fiestas del año (`municipio.json → pueblo.fiestas[]`)

| Dato en la maqueta | Dato encontrado | Fuente y fecha | Veredicto | Cambio sugerido |
|---|---|---|---|---|
| Jueves de Compadres: «dos jueves antes del Miércoles de Ceniza», mes 2 | 2026: jueves 5 de febrero (Ceniza, 18/02). 2025: 20 de febrero (Ceniza, 05/03). Encaja con la regla. Se busca su declaración como Fiesta de Interés Turístico Regional | [Infoprovincia, 31/01/2026](https://infoprovincia.net/2026/01/31/ribera-del-fresno-prepara-la-gran-hoguera-de-los-compadres-2026-fuego-tradicion-y-sabor-de-invierno/); [La Gaceta Independiente, 30/01/2025](https://lagacetaindependiente.com/2025/01/30/ribera-del-fresno-celebrara-el-jueves-de-compadres-el-proximo-20-de-febrero/) | COINCIDE | — |
| Muestra de Vinos de Pitarra y Matanza: «Finales de febrero», mes 2 | 2026: **domingo 15 de marzo** (XX edición). 2024: 10 de marzo (XVIII) | [La Gaceta Independiente, 05/03/2026](https://lagacetaindependiente.com/2026/03/05/ribera-del-fresno-celebrara-el-15-de-marzo-la-xx-muestra-popular-de-vinos-de-pitarra-y-matanza-tradicional/); [La Gaceta Independiente, 21/02/2024](https://lagacetaindependiente.com/2024/02/21/ribera-celebra-la-xviii-pitanza-el-proximo-10-de-marzo/) | **DIFIERE** | `{"mes": 3, "nombre": "Muestra Popular de Vinos de Pitarra y Matanza Tradicional", "cuando": "Un domingo de marzo (en 2026, el 15)"}` |
| Carnaval y Semana Santa: «Fecha variable» | Fecha variable por definición | — | COINCIDE | — |
| San Isidro: 15 de mayo (`fecha_fija: "05-15"`) | Fiesta local de 2026, viernes 15 de mayo | Onda Cero Sur, julio de 2025 | COINCIDE | — |
| Festival Folklórico Internacional de la Baja Extremadura: «Tercer fin de semana de julio», mes 7 | 2026: XLII edición, **del 24 de julio al 6 de agosto**, con galas en el cine de verano «Pepe Masa». 2025: la XLI fue a finales de julio | [Grada, XLII Festival](https://www.grada.es/ribera-del-fresno-abre-al-mundo-las-puertas-de-su-tradicion-con-la-gala-del-xlii-festival-folklorico-internacional-de-la-baja-extremadura/blogueros/juanfra-llano/) (2026); [La Gaceta Independiente, 26/07/2025](https://lagacetaindependiente.com/2025/07/26/ribera-del-fresno-acoge-el-41-festival-folklorico-internacional-de-la-baja-extremadura/) | **DIFIERE** | `{"mes": 7, "nombre": "Festival Folklórico Internacional de la Baja Extremadura", "cuando": "Finales de julio y principios de agosto (en 2026, del 24 de julio al 6 de agosto)"}` |
| Festival de Teatro «Meléndez Valdés»: «En verano», mes 8 | Existe desde 2004. No aparecen las fechas de 2026 | Grada; Onda Cero Sur (sin fecha de 2026) | NO COMPROBADO | — |
| Jornadas Gastronómicas y Artesanales: «Primer fin de semana de agosto» | 2026: XXII edición, sábado 1 de agosto a las 21:30 en el cine de verano «Pepe Masa» | [Infoprovincia, 30/07/2026](https://infoprovincia.net/2026/07/30/ribera-del-fresno-volvera-a-saborear-sus-raices-con-la-xxii-edicion-de-las-jornadas-gastronomicas/) | COINCIDE | — |
| Fiestas del Emigrante: «15 de agosto» (`fecha_fija: "08-15"`) | Del 15 al 18 de agosto (la tormenta obligó a suspender parte del programa de 2026) | [Extremadura7dias, «Ribera del Fresno celebra sus Fiestas del Emigrante»](https://www.extremadura7dias.com/noticia/ribera-del-fresno-celebra-sus-fiestas-del-emigrante) (año sin confirmar en el extracto); Infoprovincia, 18/09/2026 | COINCIDE (empiezan el 15) | Opcional: `"cuando": "Del 15 al 18 de agosto"` |
| Día de Extremadura: 8 de septiembre | Fiesta autonómica, 8 de septiembre | calendario oficial | COINCIDE | — |
| **Fiesta mayor**: «Ferias y Fiestas del Cristo de la Misericordia», «Desde el 14 de septiembre, cuatro días» (`fecha_fija: "09-14"`, `mayor: true`) | 2026: **del 5 al 14 de septiembre**. Novena del 5 al 13; días grandes del viernes 11 al lunes 14; fuegos el 14. El 14 es fiesta local. La prensa y la hermandad escriben «Cristo de las **Misericordias**» | [La Gaceta Independiente, 05/09/2026](https://lagacetaindependiente.com/2026/09/05/ribera-del-fresno-celebra-sus-fiestas-patronales-del-cristo-de-las-misericordias-del-5-al-14-de-septiembre/); [Onda Cero Sur, 09/2026](https://ondacerosur.es/2026/09/ribera-del-fresno-celebra-sus-fiestas-patronales-del-cristo-de-las-misericordias-del-5-al-14-de-septiembre/) | **DIFIERE** | `{"mes": 9, "nombre": "Fiestas Patronales del Santísimo Cristo de las Misericordias", "cuando": "Novena desde el 5 de septiembre; días grandes del 11 al 14. El 14, fiesta local", "fecha_fija": "09-14", "mayor": true}` |
| Romería al Pozo de San Juan Macías: «El domingo después de las fiestas del Cristo» | 2026: sábado 19 (presentación de la nueva imagen) y domingo 20 de septiembre (II Camino del Peregrino y misa extremeña en el Pozo). Es el domingo siguiente al 14 | [Infoprovincia, 15/09/2026](https://infoprovincia.net/2026/09/15/ribera-del-fresno-prepara-su-romeria-del-pozo-con-una-nueva-imagen-de-san-juan-macias-peregrinacion-y-musica/); Infoprovincia, 19/09/2026 | COINCIDE | — |
| FEAVIR, Feria Avícola: «Segunda semana de noviembre», mes 11 | La VIII edición fue el 1 y 2 de noviembre de 2024, en la nave municipal de usos múltiples. No aparece ninguna edición de 2025 ni la fecha de 2026. Lo de la «segunda semana» solo lo dice la web municipal antigua | [Infoprovincia, 31/10/2024](https://infoprovincia.net/2024/10/31/ribera-del-fresno-celebra-la-viii-feria-avicola-con-una-exposicion-de-mas-de-90-razas-de-aves-entre-ellas-la-emblematica-gallina-azul-extremena-una-raza-autoctona-de-la-region/) | **DIFIERE** | `"cuando": "Principios de noviembre"`. Confirmar con el Ayuntamiento si en 2026 se celebra |

## 5. Cifras de la portada (`municipio.json → cifras[]`, `habitantes`, `altitud_m`)

| Dato en la maqueta | Dato encontrado | Fuente y fecha | Veredicto | Cambio sugerido |
|---|---|---|---|---|
| 3.130 habitantes, INE (padrón), 2025 | 3.130 a 1 de enero de 2025 (1.562 hombres y 1.568 mujeres). El padrón a 1/1/2026 todavía no está publicado | extracto del buscador basado en el INE (habitantes.org, en.wikipedia). No se pudo abrir el INE | COINCIDE | — |
| 185,6 km² de término, Diputación | 185,6 km² | en.wikipedia; Mancomunidad; ficha de la Diputación (indexada) | COINCIDE | — |
| 399 m de altitud, Diputación | 399 m | en.wikipedia; ficha de la Diputación (indexada) | COINCIDE | — |
| «1257», primera referencia escrita, Diputación | 1257, en la cesión de tierras al priorato de San Marcos de León | web municipal, Historia (indexada); Bernal Estévez, *La encomienda de Ribera a finales del medievo* (Dialnet) | COINCIDE | — |
| `cifras[].fuente_url` de la Diputación y del portal estadístico | No se pudieron abrir (403) | — | NO COMPROBADO | — |

## 6. Plazos de las ayudas de natalidad y del IAE (salen como Ejemplo)

| Dato en la maqueta | Dato encontrado | Fuente y fecha | Veredicto | Cambio sugerido |
|---|---|---|---|---|
| Ayudas a la natalidad 2026: `plazo_fin: "2026-10-31"`, `plazo_ejemplo: true` (`contenido/tablon.json → entradas[0]`) | **No se ha encontrado** la convocatoria municipal fuera de la sede, ni en el BOP ni en prensa. La sede (exp. 182/2026) no se pudo abrir | búsquedas del 04/10/2026; sede bloqueada (403) | NO COMPROBADO | Abrir el documento del tablón y copiar el plazo real. Hasta entonces, mantener `"plazo_ejemplo": true` |
| Noticia «Abierta la convocatoria 2026 de ayudas a la natalidad» (`contenido/noticias.json → ayudas-natalidad-2026`) | La entrada del tablón la recoge DATOS.md (copia del 02/10/2026). Hoy no se ha podido volver a comprobar | — | NO COMPROBADO | — |
| Cobro del IAE 2026: `plazo_inicio: "2026-09-01"`, `plazo_fin: "2026-11-02"`, `plazo_ejemplo: true` (`contenido/tablon.json → entradas[3]`) | El OAR de la Diputación, que cobra el IAE de toda la provincia salvo Badajoz capital, tiene abierto el periodo voluntario del IAE 2026 **del 15 de septiembre al 16 de noviembre de 2026**. En 2025 fue del 15 de septiembre al 18 de noviembre | [Diputación de Badajoz, agenda n.º 24832](https://www.dip-badajoz.es/agenda/index.php?id=3&agenda=24832) (titular «…IAE hasta el 16 de noviembre»; el año 2026 sale del extracto del buscador; página sin abrir); [OAR, noticia del periodo anterior](https://oar.dip-badajoz.es/noticias/abierto-el-periodo-voluntario-de-pago-del-impuesto-sobre-actividades-economicas-iae-desde-el-15-de-septiembre-hasta-el-18-de-noviembre) | **DIFIERE** | `"plazo_inicio": "2026-09-15", "plazo_fin": "2026-11-16"`. Quitar `"plazo_ejemplo": true` cuando se confirme en el anuncio 1101/2026 de la sede |

## 7. Noticias, avisos y agenda

| Dato en la maqueta | Dato encontrado | Fuente y fecha | Veredicto | Cambio sugerido |
|---|---|---|---|---|
| Noticia «Reunión informativa sobre la V Feria del Comercio», resumen «Hoy viernes, a las 20:30…» (`contenido/noticias.json → reunion-v-feria-comercio`) | La reunión fue el viernes 2/10/2026; hoy es 4/10. **«Hoy viernes» ya es falso.** No se ha podido ver la publicación de Facebook | Facebook bloqueado (403) | **DIFIERE** (caducada) | `"resumen": "Fue el viernes 2 de octubre en la Casa de la Cultura. La fecha de la feria se anunciará más adelante."` |
| Aviso «Reunión informativa sobre la V Feria del Comercio» sin `caduca` (`contenido/avisos.json → reunion-feria-comercio`) | El acto ya ha pasado y el aviso sigue publicado | — | **DIFIERE** (caducado) | Añadir `"caduca": "2026-10-02"` o quitar el aviso |
| Agenda «Reunión de la V Feria del Comercio», 2026-10-02 (`contenido/agenda.json`) | Ya ha pasado. Que siga o no en la agenda depende de la plantilla | — | COINCIDE (fecha) | — |
| Noticia de la cruz de 8 × 4 m en el Pozo de San Juan (`cruz-pozo-san-juan`) | No aparece en prensa. Sí aparece la nueva talla de San Juan Macías (19/09/2026) y el II Camino del Peregrino (20/09/2026) | Facebook bloqueado | NO COMPROBADO | — |
| Noticia del campo de césped artificial (`campo-cesped-artificial`) | Existe: «El campo de fútbol de Ribera del Fresno afronta un nuevo capítulo de espera…», 01/10/2026 | [La Gaceta Independiente, 01/10/2026](https://lagacetaindependiente.com/2026/10/01/el-campo-de-futbol-de-ribera-del-fresno-afronta-un-nuevo-capitulo-de-espera-tras-tres-anos-de-tramitacion/) | COINCIDE | — |
| Noticia de la grabación del pleno del 30/09 (`grabacion-pleno-30-septiembre`) | La convocatoria del pleno está en el tablón (copia del 02/10). El vídeo no se ha podido ver | Facebook bloqueado | NO COMPROBADO | — |
| Noticia «Anillo Norte», exp. 1526/2026 (`anillo-norte`) | Viene del tablón de la sede (copia del 02/10). No se ha podido volver a comprobar | sede bloqueada | NO COMPROBADO | — |
| Agenda «FEAVIR», 2026-11-12, `ejemplo: true` | Ver el bloque 4: la última edición encontrada fue el 1 y 2 de noviembre | Infoprovincia, 31/10/2024 | **DIFIERE** | `"lugar": "Principios de noviembre"`. Mantener `"ejemplo": true` |
| Agenda «Apertura del camino de peregrinación», 2026-12-15, `ejemplo: true` | Sin fecha oficial; el II Camino del Peregrino se recorrió el 20/09/2026 | Infoprovincia, 15/09/2026 | NO COMPROBADO | — |
| Avisos de ejemplo (corte de agua y bolsa de empleo) y pleno del 29/12, todos con `ejemplo: true` | Se ven como ejemplo y no se presentan como reales | — | COINCIDE | — |
| Datos personales en noticias, avisos y tablón | Solo se nombra a cargos públicos (Andrés Bermejo). En el tablón están excluidas la «declaración de herederos» y el «acta de selección» | revisión de `contenido/*.json` | COINCIDE | — |

## 8. Patrimonio, «Qué ver» y gastronomía (`municipio.json → pueblo`)

| Dato en la maqueta | Dato encontrado | Fuente y fecha | Veredicto | Cambio sugerido |
|---|---|---|---|---|
| Iglesia de N.ª S.ª de Gracia: siglos XIII-XIV, reedificada en 1745 y 1859, dos torres gemelas, púlpito de mármol de Estremoz (`patrimonio[0]`, `lugares[0]`) | Obra del siglo XIII, ampliada con los Reyes Católicos y reedificada en 1745 y 1859. Las torres gemelas, de estilo portugués, son únicas en la provincia; se rehicieron tras el terremoto de Lisboa de 1755. Púlpito de mármol de Estremoz | [turismoapps.dip-badajoz.es](https://turismoapps.dip-badajoz.es/node/3440); web municipal, Monumentos (indexada, sin fecha) | COINCIDE | Opcional: añadir «Las torres se rehicieron tras el terremoto de Lisboa de 1755» |
| Retablo barroco de Alonso Rodríguez Lucas en la iglesia (`patrimonio[0]`) | Una fuente lo sitúa en el retablo mayor de la iglesia (siglo XVII). Otra, en el antiguo convento de Jesús y María | turismoapps.dip-badajoz.es frente a la ficha de monumentos de la Diputación (extractos) | NO COMPROBADO | Confirmar en qué edificio está antes de publicarlo |
| Ermita del Cristo de la Misericordia: siglo XVIII, imagen atribuida a Pedro Roldán (`patrimonio[1]`) | Ermita del siglo XVIII, con atrio, arcada y torre. La imagen es sevillana, del XVII, de la escuela de Roldán, y la restauró Luis Peña en los años noventa. Hoy la advocación se escribe «de las Misericordias» | web municipal, Monumentos; [Infoprovincia, 06/03/2026](https://infoprovincia.net/2026/03/06/ribera-del-fresno-renueva-la-tradicion-de-pedir-tres-deseos-al-cristo-de-las-misericordias-cada-primer-viernes-de-marzo/) | COINCIDE (datos) / **DIFIERE** (nombre) | `"nombre": "Ermita del Cristo de las Misericordias"` (y lo mismo en `fiestas[]`) |
| Ermita del Cristo Viejo: «Del siglo XVI, hoy en ruinas, con cúpula y una torre de remate bulboso» (`patrimonio[3]`) | Siglo XVI, cúpula y torre bulbosa: coincide. Pero **desde el 31/12/2025 es de propiedad municipal**. Fue la primitiva ermita del Cristo de las Misericordias; tras la desamortización tuvo usos de vivienda, agrícolas, comerciales y de hostelería. Lo de «en ruinas» sale de fuentes viejas | [Infoprovincia, 09/01/2026](https://infoprovincia.net/2026/01/09/el-cristo-viejo-ya-es-de-titularidad-municipal-y-regresa-al-patrimonio-comun-de-ribera-del-fresno/); [La Gaceta Independiente, 02/01/2026](https://lagacetaindependiente.com/2026/01/02/el-cristo-viejo-ya-es-de-titularidad-municipal-y-regresa-al-patrimonio-comun-de-ribera-del-fresno/) | **DIFIERE** | `"detalle": "Del siglo XVI, con cúpula y una torre de remate bulboso. Fue la primera ermita del Cristo; desde el 31 de diciembre de 2025 es de propiedad municipal."` |
| Ermita de la Aurora: sillería de los Trece y piedras visigodas (`patrimonio[2]`) | No aparece fuera de la web municipal | — | NO COMPROBADO | — |
| Ermita de San Juan Macías, de 1985, en la casa natal (`patrimonio[4]`) | Construida en 1985 sobre la casa natal, junto a la Casa de la Cultura; arriba tiene un museo del santo | web municipal, Monumentos (indexada) | COINCIDE | — |
| Ermita de San Isidro, de 1998, a unos 4 km (`patrimonio[5]`) | De 1998, a 4 km | web municipal, Monumentos (indexada) | COINCIDE | — |
| Antiguo convento de Jesús y María, de clarisas, fundado en 1535 y hoy Ayuntamiento (`patrimonio[12]`, `historia[2]`) | Fundado en 1535 por Juan Núñez Ortiz; casa madre del de Barcarrota; hoy es el Ayuntamiento | [Diputación, Monumentos](https://www.dip-badajoz.es/municipios/municipio_dinamico/monumentos/index_monumentos.php?codigo=128) (indexada) | COINCIDE | — |
| Oppidum de Hornachuelos: unas 5 ha, «excavado entre 1986 y 1997», centro de interpretación (`patrimonio[13]`) | Unas 5 ha. Excavaciones de 1986 a 1997 y de 2002 a 2003; desde 2020, el **Proyecto Fornacis** (Ministerio de Ciencia) ha vuelto a excavar. Visitas guiadas en 2025 | [Conimbriga 58 (2019), UEx](https://dehesa.unex.es/handle/10662/12506); [proyectofornacis.com](https://www.proyectofornacis.com/en/home/); Infoprovincia, 16/07/2025 | **DIFIERE** (incompleto) | `"detalle": "Poblado fortificado prerromano de unas cinco hectáreas, probablemente la Fornacis de Ptolomeo. Se excavó en 1986-1997 y 2002-2003, y desde 2020 lo estudia el Proyecto Fornacis. Tiene centro de interpretación en la Casa de la Cultura."` |
| Historia: Fornacis de Ptolomeo, Edad del Cobre, siglos II a. C. – I d. C. (`historia[0]`) | La mayoría de los investigadores lo identifica con Fornacis; hay hornos de mineral | Conimbriga 58 (2019) | COINCIDE | — |
| Monumento a Meléndez Valdés: busto de bronce de 1985, de Luis Martínez Giraldo (`patrimonio[7]`, `placa.texto`) | No aparece | — | NO COMPROBADO | — |
| Casa de Vargas-Zúñiga, siglos XVII-XVIII, hoy Casa de la Cultura (`patrimonio[8]`) | Foto en Commons como «Palacio de los Vargas-Zúñiga». Las fechas no aparecen | — | NO COMPROBADO | — |
| Palacio de Quintanilla, Casa de Bazo, casas de los Olea y los Grajera, Pilar del Caño, pozos rojos y blancos, lavadero de lanas (`patrimonio[9-11, 15-17]`) | Solo constan en la web municipal y en Commons | — | NO COMPROBADO | — |
| Pozo de San Juan Macías: Valle Garzón, unos 4 km (`patrimonio[14]`) | Tiene explanada para la misa de la romería. La distancia no aparece | Infoprovincia, 15/09/2026 | NO COMPROBADO (distancia) | — |
| Juan Meléndez Valdés (1754-1817) (`personajes[0]`) | Nació en Ribera del Fresno en 1754 y murió en Montpellier en 1817 | conocimiento general; juanmelendezvaldes.es | COINCIDE | — |
| San Juan Macías (1585-1645), canonizado en 1975 (`personajes[1]`) | Coincide; en 2025 se celebró el 50.º aniversario de la canonización | [Región Digital](https://www.regiondigital.com/noticias/badajoz-y-provincia/417889-ribera-del-fresno-celebra-el-50-aniversario-de-la-canonizacion-de-san-juan-macias.html) | COINCIDE | — |
| Alonso García Bravo (h. 1490-1561), alarife que trazó la Ciudad de México (`personajes[2]`) | Ribera del Fresno, h. 1490 – México, 1561; trazó México (1522), Veracruz y Antequera | es.wikipedia (extracto); Infoprovincia, 15/08/2025 | COINCIDE | — |
| José María Chacón Pachón, siglo XIX, diputado en la I República (`personajes[3]`) | Diputado a Cortes, en las Constituyentes y en la Asamblea de la I República | web municipal (indexada) | COINCIDE | — |
| Gastronomía: platos, dulces y bebidas (`gastronomia`) | Sin contradicciones. Las Jornadas de 2026 montaron mesas temáticas (Pascua, Cristo, dulces tradicionales, Compadres, Navidad…). En la Muestra de Pitarra se sirven chorizo, morcilla, patatas con hueso y costillas en adobo | Infoprovincia, 30/07/2026; La Gaceta Independiente, 18/03/2026 | NO COMPROBADO (la lista no se ha cotejado plato a plato) | — |

## 9. Enlaces externos del repositorio

**No se ha podido comprobar ningún enlace**: el proxy de la nube devuelve 403 a todos los dominios (consultado el 04/10/2026). La tabla dice solo si el buscador tiene indexada la URL, lo que indica que existe pero no que responda hoy.

| Enlace (dónde está) | Indexado en el buscador | Veredicto | Cambio sugerido |
|---|---|---|---|
| Sede electrónica `https://riberadelfresno.sedelectronica.es` (`sede.base` y 14 enlaces en `municipio.json`, `tablon.json` y `noticias.json`) | Sí (`/info.0`) | NO COMPROBADO | — |
| Web actual `https://riberadelfresno.es` (14 enlaces: rutas, ordenanzas, bop.php…) | Sí (corporacionmunicipal, policialocal, telefonointeres, fiestas, monumentos, feavir, bop.php) | NO COMPROBADO | — |
| Anuncios del BOP en `dip-badajoz.es/bop/ventana_anuncio.php` (`transparencia.apartados.*`) | No se ha buscado cada anuncio | NO COMPROBADO | — |
| Facebook `AyuntamientodeRiberadelFresno` (8 enlaces) | Bloqueado. No se ha podido comprobar la biografía | NO COMPROBADO | — |
| Instagram `@aytoriberadelfresno` (`redes[1]`) | Bloqueado. No se ha podido comprobar que la biografía diga Ribera del Fresno | NO COMPROBADO | — |
| X `twitter.com/aytoribera`, YouTube `UC6OMGwPGD_SNkhk9ew5Bc-A` (`redes[2-3]`) | Bloqueado | NO COMPROBADO | — |
| Plataforma de Contratación (`sede.perfil_contratante`) | — | NO COMPROBADO | — |
| Farmacias de guardia `cofbadajoz.com/farmacias-de-guardia/` (`farmacias.oficial`) | — | NO COMPROBADO | — |
| Observatorio `portalestadistico.com` (`cifras[0].fuente_url`) | — | NO COMPROBADO | — |
| AEMET `ribera-del-fresno-id06113` (en `fuente/`) | — | NO COMPROBADO | — |

---

## Las 5 diferencias que más importan antes de enseñarle la web al alcalde

1. **Fiesta mayor mal fechada.** La maqueta dice «desde el 14 de septiembre, cuatro días». En 2026 fue del **5 al 14 de septiembre**: novena desde el 5 y días grandes del 11 al 14. La advocación que usa el pueblo es «Cristo de las **Misericordias**», al que el Pleno acaba de nombrar alcalde perpetuo. → `municipio.json → pueblo.fiestas[9]`
2. **Área de la concejala María Teresa Rodríguez Rosa incompleta.** Le falta **Medio Ambiente**, la delegación con la que sale en la prensa (renaturalización del arroyo Valdemedel, bienestar animal). → `corporacion.miembros[5].delegacion` y `quien[5]`
3. **Plazo del IAE de ejemplo que no cuadra con el real.** La maqueta pone del 1/9 al 2/11. El periodo voluntario del OAR para 2026 es del **15/9 al 16/11/2026**. Un alcalde lo detecta enseguida. → `contenido/tablon.json → entradas[3]`
4. **Noticia y aviso caducados.** La noticia de la V Feria del Comercio dice «Hoy viernes» de una reunión que fue el 2/10, y el aviso sigue publicado. → `contenido/noticias.json → reunion-v-feria-comercio` y `contenido/avisos.json → reunion-feria-comercio`
5. **El Cristo Viejo es municipal desde el 31/12/2025 y la maqueta lo da «en ruinas».** Es justo el tipo de logro que el equipo de gobierno querrá ver. Además, en el calendario la **Muestra de Pitarra** es en marzo, no en febrero, y el **Festival Folklórico** va de finales de julio a primeros de agosto. → `pueblo.patrimonio[3]` y `pueblo.fiestas[1]`, `pueblo.fiestas[4]`

**Pendiente de comprobar a mano** (desde aquí no se pudo): el plazo real de las ayudas a la natalidad (exp. 182/2026), el horario de atención, si el registro está en el n.º 1 o el 2 de la C/ Ayuntamiento, el orden actual de los tenientes de alcalde y que todos los enlaces respondan.
