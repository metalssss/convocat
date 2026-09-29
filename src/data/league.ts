// Fuente de datos simulada de la FCF: el directorio de competiciones y equipos, y una
// simulación determinista de la temporada de cada grupo (calendario, resultados, actas
// y estadísticas de jugadores). Todo lo que muestran las pantallas pasa por `DIR` y
// `season()`, así que un lector real de fcf.cat solo tiene que devolver lo mismo.

import { FIXED, FIRST, FIRSTF, FSPREF, INJECT, KIND, LAST, PREF, REFS, SI_VENUE, SPECS, TOWNS } from './seed';
import type { Kind, KindKey, Section } from './seed';
import { STRIP, addDays, hash, norm, pois, rng, shuffle, slug } from './util';

export interface Group extends Kind {
  gid: string; div: string; gi: number; group: string; kind: KindKey; teams: string[]; url: string;
}

export interface Team {
  name: string; gid: string; town: string; color: string; str: number;
  homeDay: number; homeTime: string; venue: string; addr: string; surface: string;
}

export interface DirEntry { name: string; gid: string; club: string; key: string; section: Section }

export type EventType = 'goal' | 'yc' | 'rc';
export interface MatchEvent { min: number; side: 'h' | 'a'; type: EventType; player: string; me?: boolean }

export interface Match {
  id: string; gid: string; r: number; j: number; home: string; away: string;
  date: string; time: string; venue: string; addr: string; surface: string;
  played: boolean; hg: number; ag: number; ref?: string; events: MatchEvent[];
}

export type Pos = 'POR' | 'DEF' | 'MIG' | 'DAV';
export interface Player { name: string; pos: Pos; dorsal: number; me?: boolean }
export interface PlayerStat extends Player { pj: number; g: number; yc: number; rc: number }

export interface TableRow { name: string; pj: number; v: number; e: number; d: number; gf: number; gc: number; pts: number }
export type TableMode = 'all' | 'home' | 'away';

export interface Season {
  G: Group; matches: Match[]; byId: Record<string, Match>;
  pstats: Record<string, Record<number, PlayerStat>>;
  /** Posición de cada equipo tras cada jornada jugada. */
  history: Record<string, number[]>;
  lastPlayed: number; nRounds: number; curRound: number; table: TableRow[];
}

// Equipos con datos reales (el club del usuario y un par de rivales fijos).
type BaseInfo = Partial<Omit<Team, 'name' | 'gid' | 'town'>>;
const SI_BASE: Record<string, BaseInfo> = Object.fromEntries(
  Object.values(INJECT).map(n => [n, { ...SI_VENUE, color: n === 'CE Sant Ignasi B' ? '#C8342B' : '#1B2F6B' }]),
);
Object.assign(SI_BASE['CE Sant Ignasi'], { homeDay: 0, homeTime: '12:00', str: 1.3 });
Object.assign(SI_BASE['CE Sant Ignasi B'], { homeDay: 6, homeTime: '17:00', str: 1.15 });
const BASE: Record<string, BaseInfo> = {
  ...SI_BASE,
  'UE Poble Sec': { color: '#C8342B', homeDay: 0, homeTime: '11:00', venue: 'Camp Municipal Poble Sec', addr: 'Av. Francesc Ferrer i Guàrdia · Barcelona', str: 1.45 },
  'FS Gràcia': { color: '#2350C8', homeDay: 0, homeTime: '19:00', venue: 'Pavelló Municipal La Creueta', addr: 'C/ de Pere Pau · Barcelona', str: 1.05 },
};

/** Equipos en los que juega el usuario: aparece como «Tú» en sus plantillas. */
export const ME_TEAMS = ['CE Sant Ignasi', 'CE Sant Ignasi B'];
export const DEFAULT_MINE = ['CE Sant Ignasi', 'CE Sant Ignasi B'];

export const PAL = ['#C8342B', '#2350C8', '#1F8A4C', '#7A3FB0', '#D07A1A', '#127C86', '#9E2A5A', '#5B6B1F', '#3B3832', '#1E5E9E', '#B8412F', '#6A4B2E'];
export const SECTIONS: Section[] = ['Fútbol 11', 'Fútbol base', 'Femenino', 'Veteranos', 'Fútbol sala'];
export const SAMPLE_URL = 'https://www.fcf.cat/competicio/2627/futbol-7/lliga-veterans-f7/grup-1';

export const clubOf = (n: string): string =>
  n.replace(/\s+(Juvenil|Cadet|Infantil|Aleví|Benjamí|Veterans|Femení)(\s+[A-E])?$/, '').replace(/\s+[B-E]$/, '');

export const DIR = (() => {
  const groups: Record<string, Group> = {}, teams: Record<string, Team> = {}, list: DirEntry[] = [];
  const taken = new Set([...Object.values(FIXED).flat(), ...Object.values(INJECT)]);
  for (const [div, k, n, sufO] of SPECS) for (let gi = 1; gi <= n; gi++) {
    const K: Kind = { ...KIND[k], ...(sufO ? { suf: sufO } : {}) }, gid = slug(div) + '-' + gi, r = rng(hash(gid));
    let names = FIXED[div + '|' + gi];
    if (!names) {
      names = [];
      for (const t of shuffle(TOWNS, r)) {
        if (names.length >= K.size) break;
        const pre = K.futsal ? FSPREF[hash(t) % 3] : PREF[hash(t) % PREF.length];
        const base = pre + ' ' + t + K.suf;
        let nm = base, i = 0;
        while (taken.has(nm) && i < 4) nm = base + ' ' + 'BCDE'[i++];
        if (taken.has(nm)) continue;
        taken.add(nm); names.push(nm);
      }
      if (INJECT[gid]) names[Math.floor(r() * names.length)] = INJECT[gid];
    }
    const G: Group = {
      gid, div, gi, group: 'Grup ' + gi, kind: k, ...K, teams: names,
      url: 'https://www.fcf.cat/competicio/2627/' + slug(K.mod) + '/' + slug(div) + '/grup-' + gi,
    };
    groups[gid] = G;
    names.forEach(nm => {
      const town = nm.replace(STRIP, '$1').trim() || nm;
      const h = hash(nm), b = BASE[nm] || {};
      teams[nm] = {
        name: nm, gid, town, color: b.color || PAL[h % PAL.length],
        str: b.str || 0.65 + (hash(nm + 's') % 1000) / 1000 * 0.85,
        homeDay: b.homeDay ?? (K.friday ? 5 : h % 3 === 0 ? 6 : 0),
        homeTime: b.homeTime || K.times[hash(nm + 't') % K.times.length],
        venue: b.venue || (K.futsal ? 'Pavelló Municipal ' : 'Camp Municipal ') + town, addr: b.addr || town,
        surface: b.surface || (K.futsal ? (h % 3 ? 'Parquet' : 'Pista sintètica') : (h % 7 === 0 ? 'Césped natural' : 'Césped artificial')),
      };
      list.push({ name: nm, gid, club: clubOf(nm), key: norm(nm + ' ' + div + ' ' + K.cat + ' ' + K.mod + ' ' + town), section: K.section });
    });
  }
  return { groups, teams, list };
})();

/** Liga a doble vuelta (método del círculo); en la segunda vuelta se invierten casa y fuera. */
const roundRobin = (n: number): [number, number][][] => {
  const ids = [...Array(n).keys()], rounds: [number, number][][] = [];
  for (let r = 0; r < n - 1; r++) {
    const p: [number, number][] = [];
    for (let i = 0; i < n / 2; i++) {
      let a = ids[i], b = ids[n - 1 - i];
      if ((r + i) % 2) [a, b] = [b, a];
      p.push([a, b]);
    }
    rounds.push(p);
    ids.splice(1, 0, ids.pop()!);
  }
  return [...rounds, ...rounds.map(p => p.map(([a, b]) => [b, a] as [number, number]))];
};

const ROSTERS: Record<string, Player[]> = {};
export const roster = (name: string): Player[] => {
  if (ROSTERS[name]) return ROSTERS[name];
  const e = DIR.teams[name], G = DIR.groups[e.gid], r = rng(hash(name + 'r'));
  const pattern: Pos[] = G.mod === 'Futbol 11'
    ? ['POR', 'POR', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'MIG', 'MIG', 'MIG', 'MIG', 'MIG', 'MIG', 'DAV', 'DAV', 'DAV', 'DAV']
    : ['POR', 'POR', 'DEF', 'DEF', 'DEF', 'MIG', 'MIG', 'MIG', 'MIG', 'DAV', 'DAV', 'DAV'];
  const fn = G.cat === 'Femení' ? FIRSTF : FIRST;
  let num = 2;
  const ps: Player[] = pattern.map((pos, i) => ({
    name: fn[Math.floor(r() * fn.length)] + ' ' + LAST[Math.floor(r() * LAST.length)], pos,
    dorsal: pos === 'POR' ? (i === 0 ? 1 : 13) : (num === 13 ? ++num : num++),
  }));
  if (ME_TEAMS.includes(name)) {
    const i = ps.findIndex(p => p.pos === 'MIG');
    ps[i] = { name: 'Tú', pos: 'MIG', dorsal: 10, me: true };
    ps.forEach((p, j) => { if (j !== i && p.dorsal === 10) p.dorsal = 24; });
  }
  return (ROSTERS[name] = ps);
};

// Peso de cada posición a la hora de marcar goles.
const W: Record<Pos, number> = { POR: 0.02, DEF: 0.6, MIG: 1.6, DAV: 3.2 };

export const tableOf = (G: Group, ms: Match[], mode: TableMode, upto?: number): TableRow[] => {
  const rows: Record<string, TableRow> = {};
  G.teams.forEach(n => (rows[n] = { name: n, pj: 0, v: 0, e: 0, d: 0, gf: 0, gc: 0, pts: 0 }));
  const add = (n: string, f: number, a: number) => {
    const x = rows[n]; x.pj++; x.gf += f; x.gc += a;
    if (f > a) { x.v++; x.pts += 3; } else if (f === a) { x.e++; x.pts++; } else x.d++;
  };
  ms.forEach(m => {
    if (!m.played || (upto != null && m.r > upto)) return;
    if (mode !== 'away') add(m.home, m.hg, m.ag);
    if (mode !== 'home') add(m.away, m.ag, m.hg);
  });
  return Object.values(rows).sort((a, b) =>
    b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf || a.name.localeCompare(b.name));
};

const SEASONS: Record<string, Season> = {};

/** La temporada del grupo `gid` vista el día `today`: los partidos anteriores ya se han jugado. */
export const season = (gid: string, today: string): Season => {
  const key = gid + today;
  if (SEASONS[key]) return SEASONS[key];
  const G = DIR.groups[gid], rounds = roundRobin(G.teams.length), matches: Match[] = [], byId: Record<string, Match> = {};
  const pstats: Season['pstats'] = {};
  G.teams.forEach(n => { pstats[n] = {}; roster(n).forEach(p => (pstats[n][p.dorsal] = { ...p, pj: 0, g: 0, yc: 0, rc: 0 })); });
  rounds.forEach((pairs, r) => {
    let base = addDays(G.start, 7 * r);
    if (base >= '2026-12-19') base = addDays(base, 21); // parón de Navidad
    pairs.forEach(([a, b], i) => {
      const H = DIR.teams[G.teams[a]], A = DIR.teams[G.teams[b]];
      const date = G.friday ? base : addDays(base, H.homeDay === 0 ? 1 : 0);
      const m: Match = {
        id: gid + ':' + r + ':' + i, gid, r, j: r + 1, home: H.name, away: A.name, date, time: H.homeTime,
        venue: H.venue, addr: H.addr, surface: H.surface, played: date < today, hg: 0, ag: 0, events: [],
      };
      if (m.played) {
        const x = rng(hash(m.id));
        m.hg = pois(x, G.lam * Math.pow(H.str / A.str, 0.8) * 1.12);
        m.ag = pois(x, G.lam * Math.pow(A.str / H.str, 0.8) * 0.9);
        m.ref = REFS[Math.floor(x() * REFS.length)];
        ([['h', H.name, m.hg], ['a', A.name, m.ag]] as const).forEach(([side, tn, goals]) => {
          const on = roster(tn).filter(p => (p.pos === 'POR' ? p.dorsal === 1 || x() < 0.1 : x() < 0.82));
          on.forEach(p => pstats[tn][p.dorsal].pj++);
          const tot = on.reduce((s, p) => s + W[p.pos], 0);
          for (let g = 0; g < goals; g++) {
            let t = x() * tot, p = on[0];
            for (const q of on) { t -= W[q.pos]; if (t <= 0) { p = q; break; } }
            pstats[tn][p.dorsal].g++;
            m.events.push({ min: 1 + Math.floor(x() * G.mins), side, type: 'goal', player: p.name, me: p.me });
          }
          const yc = pois(x, G.mins >= 70 ? 1.6 : 0.7);
          for (let c = 0; c < yc; c++) {
            const p = on[Math.floor(x() * on.length)];
            pstats[tn][p.dorsal].yc++;
            m.events.push({ min: 1 + Math.floor(x() * G.mins), side, type: 'yc', player: p.name, me: p.me });
          }
          if (x() < 0.05) {
            const p = on[Math.floor(x() * on.length)];
            pstats[tn][p.dorsal].rc++;
            m.events.push({ min: 1 + Math.floor(x() * G.mins), side, type: 'rc', player: p.name, me: p.me });
          }
        });
        m.events.sort((p, q) => p.min - q.min);
      }
      matches.push(m); byId[m.id] = m;
    });
  });
  const lastPlayed = matches.filter(m => m.played).reduce((a, m) => Math.max(a, m.r), -1);
  const history: Record<string, number[]> = {};
  G.teams.forEach(n => (history[n] = []));
  for (let r = 0; r <= lastPlayed; r++) tableOf(G, matches, 'all', r).forEach((row, i) => history[row.name].push(i + 1));
  const cur = matches.find(m => !m.played);
  return (SEASONS[key] = {
    G, matches, byId, pstats, history, lastPlayed, nRounds: rounds.length,
    curRound: cur ? cur.r : rounds.length - 1, table: tableOf(G, matches, 'all'),
  });
};

/** Convierte un enlace de competición de fcf.cat en un grupo, o explica por qué no se puede leer. */
export const parseFcfUrl = (url: string): { gid: string } | { error: string } => {
  if (!/fcf\.cat/i.test(url)) return { error: 'Ese enlace no es de fcf.cat' };
  const G = Object.values(DIR.groups).find(g => url.toLowerCase().includes(slug(g.div) + '/grup-' + g.gi));
  return G ? { gid: G.gid } : { error: 'No hemos podido leer este enlace' };
};
