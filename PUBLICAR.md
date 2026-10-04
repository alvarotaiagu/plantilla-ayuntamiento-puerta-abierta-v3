# Publicar desde el móvil: Formulario de Google → Hoja → web

Para que la secretaría (o quien el Ayuntamiento diga) publique **un aviso o un acto de la agenda desde el móvil**, sin entrar en ningún programa ni tocar la web. Se monta una vez (media hora) y después publicar es rellenar un formulario.

```
 Formulario «Publicar un aviso»  ─┐                         ┌─ pestaña «Avisos»  (publicada) ─┐
                                  ├─► hoja «Web del Ayto.» ─┤                                  ├─► la web la lee al cargar
 Formulario «Publicar un acto»   ─┘   (respuestas, privadas) └─ pestaña «Agenda»  (publicada) ─┘
```

La web ya sabe leer la hoja (README, «La hoja de cálculo»; `js/main.js → leerHoja`): primero pinta lo que trae la página y luego **fusiona** lo de la hoja. Si la hoja no contesta en 7 segundos, se queda lo de la página. Lo que se publica sale en la portada (panel «Hoy», tablón, «Lo que viene»), en la agenda y, si es un aviso urgente o programado con fecha de fin, en la franja de arriba de todas las páginas.

---

## 1. La hoja

1. En Google Drive (con la cuenta del Ayuntamiento, no con una personal): **Nuevo → Hojas de cálculo**. Llámela «Web del Ayuntamiento».
2. Compartir: **Restringido** (solo las personas añadidas). *No* la comparta como «Cualquier persona con el enlace»: las respuestas originales no tienen que ser públicas.

## 2. El formulario de avisos

1. En la hoja: **Herramientas → Crear un formulario**. Se abre un formulario vinculado y aparece una pestaña «Respuestas de formulario 1». Renómbrela a **«Respuestas avisos»** (doble clic en la pestaña).
2. Título del formulario: «Publicar un aviso en la web».
3. Preguntas. **El título de cada pregunta es el nombre de la columna** y la web lo lee sin tildes ni mayúsculas, con «_» por los espacios («Título corto» → `titulo_corto`). Escríbalos así:

| Pregunta (título exacto) | Tipo en el formulario | Obligatoria | Qué es |
|---|---|---|---|
| `Fecha` | Fecha | sí | El día del aviso (el de publicación) |
| `Título` | Respuesta corta | sí | Lo que se lee en la portada. Claro y corto: «Corte de agua en la calle Mayor de 9:00 a 13:00» |
| `Tema` | Desplegable: Agua, Obras, Tráfico, Cultura, Deporte, Empleo, Salud, Otros | no | Para los filtros del tablón |
| `Texto` | Párrafo | no | Los detalles |
| `Gravedad` | Opción múltiple: `informativo`, `programado`, `urgente` | no | **urgente** = franja roja (una avería, una alerta); **programado** = franja ámbar (un corte anunciado); **informativo** = sin franja. Vacía = informativo |
| `Caduca` | Fecha | no | Último día que se enseña en la franja. **Sin esta fecha, un aviso urgente o programado no sale en la franja** |
| `Título corto` | Respuesta corta, validación «Longitud máxima: 70» | no | Solo si el título pasa de 70 caracteres: es lo que sale en la franja del móvil |

4. Configuración del formulario: **no** recopilar direcciones de correo (la pestaña publicada no debe llevar datos de nadie). Mensaje de confirmación: «Publicado. Saldrá en la web en unos minutos».

*Captura descrita:* el formulario en el móvil tiene, de arriba abajo, un calendario para «Fecha», una línea para «Título», un desplegable «Tema», una caja grande «Texto», tres botones redondos «informativo / programado / urgente», otro calendario «Caduca» y una línea «Título corto». Abajo, el botón «Enviar».

## 3. El formulario de la agenda

Igual, desde la misma hoja (**Herramientas → Crear un formulario** otra vez). Renombre su pestaña a **«Respuestas agenda»**.

| Pregunta (título exacto) | Tipo | Obligatoria | Qué es |
|---|---|---|---|
| `Fecha` | Fecha | sí | El día del acto |
| `Hora` | Hora | no | Sin hora, el acto es de día entero |
| `Hora fin` | Hora | no | Para el calendario; sin ella, dura una hora |
| `Título` | Respuesta corta | sí | «Concierto de la banda municipal» |
| `Lugar` | Respuesta corta | no | «Plaza de España» |
| `Nota` | Párrafo | no | Entrada libre, cómo apuntarse… |
| `Tipo` | Desplegable: (vacío), `pleno` | no | Con «pleno» sale como «Próximo pleno» en la portada |
| `Convocatoria` | Respuesta corta (validación: URL) | no | Solo plenos: enlace a la convocatoria en la sede |
| `Grabación` | Respuesta corta (validación: URL) | no | Solo plenos: enlace al vídeo cuando ya se ha celebrado |

## 4. Las pestañas que se publican

Las respuestas tienen la «Marca temporal» y lo que se haya escrito tal cual. Se publica **otra** pestaña que copia solo las columnas que lee la web:

1. Pestaña nueva **«Avisos»**. En la celda A1:
   ```
   =QUERY('Respuestas avisos'!A:Z; "select B, C, D, E, F, G, H, I where C is not null"; 1)
   ```
   (B…H son Fecha, Título, Tema, Texto, Gravedad, Caduca y Título corto, en el orden del formulario; I es «Estado», ver abajo. Si cambia el orden de las preguntas, cambie las letras.)
2. Pestaña nueva **«Agenda»**, igual con `'Respuestas agenda'!A:Z` y sus columnas.
3. **Estado (para retirar algo sin borrarlo):** en cada pestaña de respuestas, escriba a mano «Estado» en la primera celda libre de la fila 1. Para quitar un aviso de la web, ponga `oculto` en su fila; para guardarlo sin publicar, `borrador`.
4. **Archivo → Compartir → Publicar en la web** → en «Enlace», elija **solo** las pestañas «Avisos» y «Agenda» (no «Documento entero») → Publicar. Marque «Volver a publicar automáticamente cuando se hagan cambios».
5. Copie el identificador de la hoja: es lo que hay entre `/d/` y `/edit` en la dirección (`https://docs.google.com/spreadsheets/d/`**`1AbC…xyz`**`/edit`).

*Captura descrita:* el diálogo «Publicar en la web» tiene dos desplegables: el de la izquierda dice «Avisos, Agenda» (marcadas con una casilla) y el de la derecha «Página web»; debajo, el botón verde «Publicar» y la casilla «Volver a publicar automáticamente».

## 5. Decírselo a la web

En `municipio.json`:

```json
"hoja": { "id": "1AbC…xyz", "pestanas": { "avisos": "Avisos", "agenda": "Agenda" } }
```

y `node scripts/aplicar.mjs`. Ya está: la web lee la hoja cada vez que alguien la abre.

**Compruebe que las respuestas no se ven:** abra en una ventana privada `https://docs.google.com/spreadsheets/d/<id>/gviz/tq?sheet=Respuestas%20avisos`. Tiene que dar error o pedir acceso. Si devuelve datos, la hoja está compartida de más (paso 1.2).

## 6. Antes de dar por buena la hoja (y cuando algo no salga)

Descargue cada pestaña publicada: **Archivo → Descargar → Valores separados por comas (.csv)**, y:

```bash
node scripts/comprobar-hoja.mjs Avisos.csv
node scripts/comprobar-hoja.mjs Agenda.csv
```

Dice qué fila está mal y por qué (con el número de fila de la hoja): una fecha que no existe, un aviso sin título, una gravedad mal escrita, un aviso que caduca antes de empezar, dos filas iguales (la web enseñaría solo una), una hora mal escrita, un enlace que no empieza por `https://`… Sale con error (código 1) si hay algo que la web no enseñaría o enseñaría mal, y con avisos si solo hay cosas que conviene mirar (un urgente sin fecha de fin, un título largo sin «Título corto»).

Plantillas de ejemplo, con las columnas exactas: [`plantillas-hoja/avisos.csv`](plantillas-hoja/avisos.csv) y [`plantillas-hoja/agenda.csv`](plantillas-hoja/agenda.csv). Se pueden importar en una hoja (**Archivo → Importar**) para ver cómo queda.

### Las columnas que lee la web

| Pestaña | Obligatorias | Opcionales |
|---|---|---|
| Avisos | `fecha`, `titulo` | `id`, `tema`, `texto`, `gravedad` (urgente / programado / informativo), `caduca`, `titulo_corto`, `urgente` (de antes: sí/no), `enlace`, `estado` (oculto / borrador) |
| Agenda | `fecha`, `titulo` | `id`, `hora`, `hora_fin`, `lugar`, `nota`, `tipo` (pleno), `convocatoria`, `grabacion`, `estado` |

Sin `id`, la web se lo inventa con la fecha y el título: si se corrige el título de un aviso ya publicado, es otro aviso (el viejo desaparece de la hoja, así que también de la web). La «Marca temporal» del formulario no se lee.

## Lo que hay que saber

- **Tarda unos minutos.** Google vuelve a publicar la hoja cada pocos minutos; la web la lee al abrirse.
- **Quien tiene el formulario, publica.** El enlace del formulario es como una llave: solo a quien deba publicar. Si se escapa, se hace una copia del formulario y se borra el viejo.
- **La hoja manda sobre lo que viene en la página** cuando un aviso tiene el mismo `id`.
- Lo publicado desde la hoja **no** entra en `feed.xml` ni en `agenda.ics` hasta que se vuelve a montar la web (`node scripts/aplicar.mjs`), porque esos archivos se escriben al montarla. Ver INFORME-v3b-servicio.md.
