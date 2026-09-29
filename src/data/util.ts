// Utilidades de fechas, texto y aleatoriedad compartidas por los datos y las pantallas.
// Las fechas son cadenas ISO ('2026-09-29') y las horas cadenas 'HH:MM',
// tal como las publica la FCF.

export const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const DOWL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
export const MONL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export type Res = 'V' | 'E' | 'D';
export const RES: Record<Res, string> = { V: '#1F8A4C', E: '#B5AFA2', D: '#D0402E' };

/** FNV-1a: semilla estable a partir de un texto, para que la temporada simulada sea idéntica en cada carga. */
export const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

/** Generador pseudoaleatorio mulberry32. */
export const rng = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Muestra de una distribución de Poisson (Knuth). */
export const pois = (r: () => number, l: number): number => {
  const L = Math.exp(-l);
  let k = 0, p = 1;
  do { k++; p *= r(); } while (p > L);
  return k - 1;
};

export const dt = (s: string): Date => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const iso = (d: Date): string =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
export const addDays = (s: string, n: number): string => { const d = dt(s); d.setDate(d.getDate() + n); return iso(d); };
export const between = (a: string, b: string): number => Math.round((dt(b).getTime() - dt(a).getTime()) / 864e5);
export const toMin = (t: string): number => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const fromMin = (n: number): string =>
  String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');

/** Pasa a minúsculas y quita los acentos, para buscar sin importar los acentos. */
export const norm = (x: string): string => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const slug = (x: string): string => norm(x).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const fmtShort = (s: string): string => { const d = dt(s); return DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()]; };
export const fmtLong = (s: string): string => { const d = dt(s); return DOWL[d.getDay()] + ', ' + d.getDate() + ' de ' + MON[d.getMonth()]; };

export const STRIP = /(^|\s)(CE|CF|UE|UD|FC|AE|CD|EF|UFB|FS|CFS|PB|UA|Juvenil|Cadet|Infantil|Aleví|Benjamí|Veterans|Femení|[A-E])(?=\s|$)/g;

/** Iniciales del escudo: "CE Sant Ignasi B" → "SI". */
export const initials = (n: string): string => {
  const w = n.replace(STRIP, '$1').replace(/'/g, ' ').trim().split(/\s+/)
    .filter(x => x.length > 1 && !/^(de|del|la|les|el|i|l)$/i.test(x));
  if (!w.length) return n.slice(0, 2).toUpperCase();
  return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase();
};

export const shuffle = <T,>(arr: T[], r: () => number): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

export const gapTxt = (g: number): string => Math.floor(g / 60) + 'h' + (g % 60 ? ' ' + (g % 60) + 'min' : '');
