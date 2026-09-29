# App organizadora de competiciones FCF

_Started 2026-09-29 12:34 UTC_

---

## User

Diseña una app de movil para que yo pueda meter links de competiciones de fcf y esta aplicacion lo organice todo, una app que me ayude con la organizacion de los equipos en los que juego, con toda la informacion de los partidos

## Assistant

_[tool: list_files]_

_[tool: copy_starter_component]_

_[tool: grep]_

_[tool: read_file]_

_[tool: dc_write]_

_[tool: ready_for_verification]_

He creado **Convocat**, un prototipo de app móvil con el que puedes navegar y tocarlo todo:

- **Inicio:** tu próximo partido con la hora de convocatoria, el campo y los botones «Cómo llegar» y «¿Vas?». Si tienes dos partidos el mismo día, te sale un aviso. Debajo verás los próximos partidos y los últimos resultados.
- **Añadir competición (+):** pegas un enlace de fcf.cat (o pulsas «Pegar ejemplo»), la app muestra cómo lo lee, eliges tu equipo y ese equipo aparece en Inicio y en el Calendario.
- **Equipos:** tu posición, tus puntos y los últimos resultados. Dentro de cada equipo tienes la lista de partidos y la clasificación.
- **Partido:** fecha, hora, convocatoria, campo, dirección y superficie. Puedes marcar si vas y añadirlo a tu calendario.
- **Calendario:** un mes con puntos del color de cada equipo. Si tocas un día, ves solo los partidos de ese día.

Los datos son inventados: la app todavía no lee la FCF de verdad. Para eso hace falta programar la parte que extrae la información de fcf.cat. En los ajustes del diseño (Tweaks) puedes cambiar la pantalla inicial y los minutos de calentamiento, que sirven para calcular la hora de convocatoria.

## User

Añade la opción de que si el enlace no va bien, que se pueda añadir directamente el equipo buscandolo

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

Now the logic: validation that can fail, search state, and a shared add function.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

He añadido la opción de buscar el equipo por nombre cuando el enlace no va bien:

- **Pestañas en «Añadir competición»:** ahora puedes elegir entre «Pegar enlace» y «Buscar equipo».
- **Si el enlace falla:** aparece un aviso rojo con el botón «Buscar equipo →». Salta en dos casos: si el enlace no es de fcf.cat o si no es un enlace de calendario, competición, clasificación o resultados.
- **Búsqueda:** escribe al menos 2 letras. Da igual si pones acentos o no. Cada resultado muestra la competición, el grupo y la modalidad, y los equipos que ya tienes salen como «Ya añadido».
- **Al añadirlo:** el equipo se une a Inicio, Calendario y Equipos igual que si lo importaras con el enlace, con un color distinto para cada equipo nuevo.

Para probarlo, escribe «sants» o «veterans». La lista de equipos es de ejemplo (14 equipos inventados); en la app de verdad buscaría en todos los equipos inscritos en la FCF.

## User

Pero haz que se pueda buscar cualquier equipo que salga en la fcf, y además que sea una app que si hay algun cambio de horarios se actualice sola. Y además de estas cosas, añade estadisticas del equipo y de los otros, por ejemplo goles por partido y todo lo que se te ocurra. Añade todas las cosas que consideres también a parte de lo que te he dicho para que sea una app completa en la que puedas navegar por esta app y no haga falta entrar a la fcf para buscar información o estadisticas o cualquier cosa

## Assistant

_[tool: update_todos]_

_[tool: dc_write]_

_[tool: show_html]_

_[tool: ready_for_verification]_

_[tool: update_todos]_

He hecho una versión nueva, **Convocat App v2** (la v1 sigue guardada), para que casi nunca tengas que entrar en la FCF. Todavía no la he revisado en pantalla; hay una comprobación en marcha.

- **Buscar cualquier equipo:** nueva pestaña **Explorar** con unos 500 equipos y 33 grupos. Puedes buscar por club, pueblo o categoría y filtrar por Fútbol 11, Base, Femenino, Veteranos o Sala. Cualquier equipo se abre con todos sus datos y se puede añadir a *Mis equipos*.
- **Actualización sola:** a los pocos segundos de abrir la app llega un cambio de horario de la FCF. Sale un aviso, el partido queda marcado como «Nuevo horario» y se muestra la hora anterior. Con ↻ fuerzas otra sincronización. Hay una pantalla de avisos (campana) con ajustes de qué te notifica, y la opción de sincronizar con el calendario del móvil.
- **Estadísticas de tu equipo o de un rival:**
  - goles a favor y en contra por partido, % de victorias, porterías a cero, partidos sin marcar y partidos con 3 o más goles;
  - racha, forma de los últimos 5 y resultados en casa y fuera;
  - posición en cada jornada, goles por tramo de minutos, goleadores y plantilla.
- **Competición:** clasificación general, en casa y fuera (con zonas de ascenso y descenso), todas las jornadas con resultados, pichichi, datos destacados y medias de la liga.
- **Partido:** para los que faltan, una previa con la comparación de los dos equipos y la ida. Para los jugados, el acta con goles, tarjetas y árbitro.
- **Tus números:** tus partidos, goles y tarjetas. Apareces como «Tú» en las plantillas de tus equipos.

Todos los datos son inventados pero cuadran entre sí: los resultados cuadran con las clasificaciones y las actas. Para que sean datos reales de la FCF, habría que programar la parte que lee fcf.cat.

Ahora mismo (29 de septiembre) solo se han jugado 3 o 4 jornadas, así que hay pocas estadísticas. En los ajustes del diseño (Tweaks) puedes cambiar la fecha a **diciembre** o **marzo** para verlas con más partidos.

## User

añade los equipos del sant ignasi, que son los que busco

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: web_search]_

_[tool: web_fetch]_

_[tool: web_fetch]_

_[tool: web_search]_

_[tool: ready_for_verification]_

He añadido 11 equipos del CE Sant Ignasi a la v2, y la app ahora arranca con **CE Sant Ignasi** y **CE Sant Ignasi B** como tus equipos. El aviso de cambio de horario, la previa y «Tus números» ya salen con ellos.

- **Equipos:** el primer equipo está en Segona Catalana Grup 3 y el filial en Tercera Catalana Grup 10, según el perfil del club en X. Los otros nueve son de fútbol base: Juvenil A y B, Cadet A y B, Infantil A y B, Aleví A y B, y Benjamí A.
- **Campo:** todos juegan de local en el Camp de Futbol Col·legi Sant Ignasi, C/ del General Vives 28-40, Barcelona.
- **Club entero:** si buscas «sant ignasi» en Explorar, sale una tarjeta del club con todos sus equipos y el botón «Añadir todos a mis equipos».

Hay datos inventados. Los grupos del fútbol base son aproximados, porque no he encontrado los de la temporada 2026-27, y los rivales, resultados y jugadores son simulados. El club tiene 22 equipos federados esta temporada; si me dices cuáles te interesan y en qué grupo están, los ajusto a la realidad.

