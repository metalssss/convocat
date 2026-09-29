# Convocat

Toda la FCF en tu móvil: tus equipos, cualquier rival, clasificaciones, actas y
estadísticas. Se sincroniza sola y avisa si cambia un horario.

Es una app web pensada para el móvil (PWA), hecha a partir del diseño de Claude
Design que está en `project/Convocat App v2.dc.html` (la conversación del diseño
está en `chats/`). Se instala en el móvil desde el navegador («Añadir a pantalla
de inicio») y, una vez cargada, funciona sin conexión.

## Cómo arrancarla

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # pruebas de los datos y de los modelos de vista
npm run build      # web estática en dist/, se puede subir a cualquier hosting estático
```

## Qué incluye

| Pantalla | Qué hace |
| --- | --- |
| Inicio | Próximo partido (hora de convocatoria, campo, «¿Vas?», cómo llegar), aviso de doble partido, «Tus números», próximos partidos y últimos resultados |
| Avisos | Cambios de horario, recordatorios y actas publicadas; ajustes de qué te avisa |
| Calendario | Mes con un punto por equipo, filtro por día, aviso de choques, exportar al calendario del móvil (.ics) |
| Explorar | Buscar entre unos 700 equipos y 47 grupos por club, pueblo o categoría, con filtros por modalidad; seguir un club entero de golpe |
| Equipo | Estadísticas (goles por partido, porterías a cero, racha, casa y fuera, posición por jornada, goles por tramo, goleadores), partidos y plantilla |
| Competición | Clasificación (general, casa y fuera), jornadas con resultados, estadísticas de la liga y pichichi |
| Partido | Acta o previa (comparación de los dos equipos), asistencia, campo y mapa, compartir |
| Añadir | Importar una competición desde un enlace de fcf.cat o, si falla, buscar el equipo |

Tus equipos, tus respuestas de asistencia, los cambios de horario y tus ajustes
se guardan en el propio dispositivo (`localStorage`).

## Datos

Los datos son **simulados**, igual que en el diseño: una temporada 2026‑27
generada siempre igual a partir de unas semillas (`src/data/seed.ts`), con los
11 equipos del CE Sant Ignasi metidos en sus grupos. Los resultados, las
clasificaciones, las actas y las estadísticas de los jugadores cuadran entre sí.

Todo lo que lee la app pasa por `src/data/league.ts` (`DIR`, `season()`,
`parseFcfUrl()`) y por la sincronización con la FCF de `src/store.tsx`. Para usar
datos reales hay que cambiar eso por algo que lea fcf.cat y devuelva los mismos
datos; las pantallas y los modelos de vista (`src/vm.ts`) no hay que tocarlos.

La sincronización simula dos cambios de horario en las primeras
sincronizaciones (el primero a los pocos segundos de abrir la app), para que se
vea cómo funciona el aviso de «Horario actualizado».

## Ajustes (los Tweaks del diseño)

Se cambian desde la dirección web:

- `?fecha=diciembre` / `marzo` / `2027-01-20`: hace como si hoy fuera esa fecha (por defecto, la fecha real), para ver estadísticas con más jornadas jugadas.
- `?calentamiento=30`: minutos antes del partido para calcular la hora de convocatoria (por defecto 45).
- `?sync=0`: no sincroniza automáticamente al abrir.
- `?pantalla=agenda`: pantalla de inicio (`home`, `agenda`, `explore`, `teams`, `notifs`).

## Estructura

```
src/
  data/util.ts      utilidades de fechas, texto y números aleatorios
  data/seed.ts      listas semilla (pueblos, nombres, ligas) del diseño
  data/league.ts    directorio, simulación de la temporada, clasificaciones, lectura de enlaces de fcf.cat
  vm.ts             modelos de vista de cada pantalla (funciones puras)
  store.tsx         estado, navegación e historial de «atrás», sincronización con la FCF, guardado
  calendar.ts       exportación a .ics
  screens/          un componente por pantalla
  components/ui.tsx piezas compartidas (escudo, interruptor, pestañas, barra inferior, avisos)
public/             manifest, service worker e iconos
project/, chats/    el diseño original de Claude Design
```
