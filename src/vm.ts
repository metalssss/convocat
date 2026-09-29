// Modelos de vista: convierten los datos de la temporada y el estado del usuario en lo
// que pinta cada pantalla. Son funciones puras de (contexto, entrada), fáciles de probar.

import { DIR, season, tableOf } from './data/league';
import type { Match, PlayerStat, TableMode, TableRow } from './data/league';
import { DOW, RES, between, dt, fmtLong, fmtShort, fromMin, initials, toMin } from './data/util';
import type { Res } from './data/util';

export type Attendance = 'si' | 'no' | 'duda';
export interface ScheduleChange { date: string; time: string; oldDate: string; oldTime: string }

export interface Ctx {
  today: string;
  warmup: number;
  mine: string[];
  att: Record<string, Attendance>;
  changes: Record<string, ScheduleChange>;
}

export const colorOf = (n: string): string => DIR.teams[n]?.color || '#3B3832';
export const matchById = (ctx: Ctx, id: string): Match | undefined => season(id.split(':')[0], ctx.today).byId[id];

/** Un partido con los cambios de horario de la FCF aplicados. */
export const eff = (ctx: Ctx, m: Match): Match => {
  const c = ctx.changes[m.id];
  return c ? { ...m, date: c.date, time: c.time } : m;
};
export const sortKey = (ctx: Ctx, m: Match): string => { const e = eff(ctx, m); return e.date + e.time; };

export const myMatches = (ctx: Ctx): Match[] => {
  const seen = new Set<string>(), out: Match[] = [];
  ctx.mine.forEach(n => {
    const e = DIR.teams[n];
    if (!e) return;
    season(e.gid, ctx.today).matches.forEach(m => {
      if ((m.home === n || m.away === n) && !seen.has(m.id)) { seen.add(m.id); out.push(m); }
    });
  });
  return out.sort((a, b) => sortKey(ctx, a).localeCompare(sortKey(ctx, b)));
};

const ATT_LABEL: Record<Attendance | 'none', [string, string, string]> = {
  si: ['Voy ✓', '#7FD39B', '#0E2A18'],
  no: ['No voy', '#D0402E', '#fff'],
  duda: ['En duda', '#F2C84B', '#151515'],
  none: ['¿Vas? Responde', '#fff', '#151515'],
};

export interface MatchView {
  id: string; gid: string; r: number; j: number; played: boolean; res: Res | null; resBg: string;
  home: string; away: string; hShort: string; aShort: string; hBg: string; aBg: string;
  score: string; time: string; date: string; color: string; teamName: string; teamShort: string;
  comp: string; side: string; opp: string; vsLabel: string; dow: string; dnum: number;
  dateShort: string; dateLong: string; inDays: string; callTime: string;
  venue: string; address: string; surface: string; mapUrl: string;
  changed: boolean; oldLabel: string; attLabel: string; attBg: string; attFg: string;
}

/**
 * Vista de un partido para una fila. `persp` es el equipo desde el que se mira; por defecto,
 * el equipo del usuario que lo juega (null si es neutral).
 */
export const mv = (ctx: Ctx, m0: Match, persp?: string | null): MatchView => {
  const m = eff(ctx, m0), c = ctx.changes[m.id], G = DIR.groups[m.gid];
  if (persp === undefined) persp = ctx.mine.includes(m.home) ? m.home : ctx.mine.includes(m.away) ? m.away : null;
  const isHome = persp === m.home, opp = persp ? (isHome ? m.away : m.home) : null;
  let res: Res | null = null;
  if (m.played && persp) {
    const f = isHome ? m.hg : m.ag, a = isHome ? m.ag : m.hg;
    res = f > a ? 'V' : f < a ? 'D' : 'E';
  }
  const days = between(ctx.today, m.date), A = ATT_LABEL[ctx.att[m.id] || 'none'];
  const d = dt(m.date);
  return {
    id: m.id, gid: m.gid, r: m.r, j: m.j, played: m.played, res, resBg: res ? RES[res] : '#3B3832',
    home: m.home, away: m.away, hShort: initials(m.home), aShort: initials(m.away), hBg: colorOf(m.home), aBg: colorOf(m.away),
    score: m.played ? m.hg + '–' + m.ag : '', time: m.time, date: m.date,
    color: persp ? colorOf(persp) : '#151515', teamName: persp || G.div, teamShort: persp ? initials(persp) : '',
    comp: G.div, side: persp ? (isHome ? 'Casa' : 'Fuera') : '', opp: opp || '',
    vsLabel: persp ? (isHome ? 'vs ' : '@ ') + opp : m.home + ' – ' + m.away,
    dow: DOW[d.getDay()], dnum: d.getDate(), dateShort: fmtShort(m.date), dateLong: fmtLong(m.date),
    inDays: days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : days > 0 ? 'En ' + days + ' días' : 'Jugado',
    callTime: fromMin(toMin(m.time) - ctx.warmup), venue: m.venue, address: m.addr, surface: m.surface,
    mapUrl: 'https://www.google.com/maps/search/' + encodeURIComponent(m.venue + ' ' + m.addr),
    changed: !!c, oldLabel: c ? (c.oldDate !== c.date ? fmtShort(c.oldDate) + ' ' : '') + c.oldTime : '',
    attLabel: A[0], attBg: A[1], attFg: A[2],
  };
};

interface Played { m: Match; f: number; a: number; h: boolean }
const resOf = (x: Played): Res => (x.f > x.a ? 'V' : x.f < x.a ? 'D' : 'E');

export const teamStats = (ctx: Ctx, name: string) => {
  const e = DIR.teams[name], S = season(e.gid, ctx.today), G = S.G;
  const ms = S.matches.filter(m => m.home === name || m.away === name).sort((a, b) => a.r - b.r);
  const pl: Played[] = ms.filter(m => m.played).map(m => {
    const h = m.home === name;
    return { m, f: h ? m.hg : m.ag, a: h ? m.ag : m.hg, h };
  });
  const idx = S.table.findIndex(r => r.name === name);
  return { e, S, G, ms, pl, pos: idx + 1, row: S.table[idx] };
};

export interface FormChip { r: Res; bg: string }
export const formOf = (ctx: Ctx, name: string, n = 5): FormChip[] =>
  teamStats(ctx, name).pl.slice(-n).map(x => ({ r: resOf(x), bg: RES[resOf(x)] }));

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) + '%' : '—');
const per = (a: number, b: number) => (b ? (a / b).toFixed(1) : '—');

export const streakOf = (rs: Res[]): string => {
  if (!rs.length) return 'Sin partidos';
  const last = rs[rs.length - 1];
  if (last === 'V') {
    let n = 0;
    for (let i = rs.length - 1; i >= 0 && rs[i] === last; i--) n++;
    return n > 1 ? n + ' victorias seguidas' : 'Viene de ganar';
  }
  let u = 0;
  for (let i = rs.length - 1; i >= 0 && rs[i] !== (last === 'D' ? 'V' : 'D'); i--) u++;
  return last === 'D'
    ? u + (u > 1 ? ' partidos sin ganar' : ' partido sin ganar')
    : u + (u > 1 ? ' partidos sin perder' : ' partido sin perder');
};

export const vmTeam = (ctx: Ctx, name: string) => {
  const { e, S, G, ms, pl, pos, row } = teamStats(ctx, name), pj = row.pj;
  const split = (['home', 'away'] as const).map(k => {
    const xs = pl.filter(x => x.h === (k === 'home'));
    const v = xs.filter(x => x.f > x.a).length, d = xs.filter(x => x.f < x.a).length, em = xs.length - v - d;
    return {
      k: k === 'home' ? 'En casa' : 'Fuera', pts: v * 3 + em, rec: v + 'V ' + em + 'E ' + d + 'D',
      goals: xs.reduce((a, x) => a + x.f, 0) + '–' + xs.reduce((a, x) => a + x.a, 0),
    };
  });
  const hist = S.history[name] || [], N = G.teams.length;
  const chartPts = hist.map((p, i) =>
    (hist.length === 1 ? 150 : (i / (hist.length - 1)) * 300).toFixed(1) + ',' + (6 + ((p - 1) / (N - 1)) * 78).toFixed(1)).join(' ');
  const step = G.mins / 6, bf = Array(6).fill(0) as number[], bc = Array(6).fill(0) as number[];
  pl.forEach(x => x.m.events.forEach(ev => {
    if (ev.type !== 'goal') return;
    const b = Math.min(5, Math.floor((ev.min - 1) / step));
    ((ev.side === 'h') === x.h ? bf : bc)[b]++;
  }));
  const mx = Math.max(1, ...bf, ...bc);
  const players: PlayerStat[] = Object.values(S.pstats[name]);
  return {
    name, short: initials(name), color: e.color, div: G.div, group: G.group, mod: G.mod, gid: e.gid,
    venue: e.venue, homeLabel: DOW[e.homeDay] + ' ' + e.homeTime, nTeams: N,
    head: [{ k: 'Pos', v: pos + 'º' }, { k: 'Pts', v: row.pts }, { k: 'GF', v: row.gf }, { k: 'GC', v: row.gc }],
    noData: pj === 0,
    tiles: [
      { k: 'Goles a favor por partido', v: per(row.gf, pj) },
      { k: 'Goles en contra por partido', v: per(row.gc, pj) },
      { k: 'Victorias', v: pct(row.v, pj) },
      { k: 'Porterías a cero', v: pl.filter(x => x.a === 0).length },
      { k: 'Partidos sin marcar', v: pl.filter(x => x.f === 0).length },
      { k: 'Partidos con 3+ goles', v: pct(pl.filter(x => x.f + x.a >= 3).length, pj) },
    ],
    streak: streakOf(pl.map(resOf)),
    form: pl.slice(-5).map(x => ({ id: x.m.id, bg: RES[resOf(x)], score: x.f + '–' + x.a, opp: initials(x.h ? x.m.away : x.m.home) })),
    split, hasChart: hist.length > 1, chartPts, chartNote: hist.length ? 'ahora ' + hist[hist.length - 1] + 'º' : '',
    buckets: bf.map((f, i) => ({ label: Math.round(i * step) + "'", fh: Math.round((f / mx) * 100) + '%', ch: Math.round((bc[i] / mx) * 100) + '%' })),
    scorers: players.filter(p => p.g > 0).sort((a, b) => b.g - a.g || a.pj - b.pj).slice(0, 4),
    roster: [...players].sort((a, b) => a.dorsal - b.dorsal),
    matches: ms.map(m => mv(ctx, m, name)),
    isMine: ctx.mine.includes(name),
  };
};

export interface StandingRow extends TableRow { pos: number; color: string; dg: string; mine: boolean; zone: string }
export interface Ranking { k: string; team: string; short: string; color: string; v: string | number }

export const vmComp = (ctx: Ctx, gid: string, tableMode: TableMode, roundSel: number | null) => {
  const S = season(gid, ctx.today), G = S.G, N = G.teams.length;
  const tbl = tableMode === 'all' ? S.table : tableOf(G, S.matches, tableMode);
  const rows: StandingRow[] = tbl.map((r, i) => {
    const dg = r.gf - r.gc;
    return {
      ...r, pos: i + 1, color: colorOf(r.name), dg: (dg > 0 ? '+' : '') + dg, mine: ctx.mine.includes(r.name),
      zone: i < 2 ? '#1F8A4C' : i >= N - 3 ? '#D0402E' : 'transparent',
    };
  });
  const round = roundSel ?? S.curRound;
  const rms = S.matches.filter(m => m.r === round);
  const played = S.matches.filter(m => m.played), np = played.length;
  const goals = played.reduce((a, m) => a + m.hg + m.ag, 0);
  const all: (PlayerStat & { team: string })[] = [];
  G.teams.forEach(n => Object.values(S.pstats[n]).forEach(p => all.push({ ...p, team: n })));
  const best = (f: (r: TableRow) => number, dir = 1) => [...S.table].sort((a, b) => dir * (f(b) - f(a)))[0];
  const hT = tableOf(G, S.matches, 'home'), aT = tableOf(G, S.matches, 'away');
  const cards = G.teams.map(n => ({ n, c: Object.values(S.pstats[n]).reduce((a, p) => a + p.yc + p.rc * 2, 0) })).sort((a, b) => b.c - a.c)[0];
  const rk = (k: string, n: string, v: string | number): Ranking => ({ k, team: n, short: initials(n), color: colorOf(n), v });
  const gf = best(r => r.gf), gc = best(r => r.gc, -1);
  const dates = rms.map(m => eff(ctx, m).date).sort();
  return {
    gid, div: G.div, group: G.group, mod: G.mod, cat: G.cat, url: G.url, nTeams: N, nRounds: S.nRounds, curJ: S.curRound + 1, rows,
    round, roundJ: round + 1,
    roundDate: dates.length ? fmtShort(dates[0]) + (dates[dates.length - 1] !== dates[0] ? ' – ' + fmtShort(dates[dates.length - 1]) : '') : '',
    roundMatches: rms.map(m => ({ ...mv(ctx, m, null), mine: ctx.mine.includes(m.home) || ctx.mine.includes(m.away) })),
    avgs: [
      { k: 'Goles por partido', v: np ? (goals / np).toFixed(2) : '—' },
      { k: 'Victorias locales', v: np ? Math.round((played.filter(m => m.hg > m.ag).length / np) * 100) + '%' : '—' },
      { k: 'Empates', v: np ? Math.round((played.filter(m => m.hg === m.ag).length / np) * 100) + '%' : '—' },
      { k: 'Partidos jugados', v: np + '/' + S.matches.length },
    ],
    rankings: np ? [
      rk('Ataque más goleador', gf.name, gf.gf + ' GF'), rk('Defensa menos goleada', gc.name, gc.gc + ' GC'),
      rk('Mejor local', hT[0].name, hT[0].pts + ' pts'), rk('Mejor visitante', aT[0].name, aT[0].pts + ' pts'),
      rk('Más tarjetas', cards.n, cards.c),
    ] : [],
    pichichi: all.filter(p => p.g > 0).sort((a, b) => b.g - a.g || a.pj - b.pj).slice(0, 10)
      .map((p, i) => ({ rank: i + 1, name: p.name, team: p.team, color: colorOf(p.team), g: p.g, me: !!p.me })),
  };
};

const MARK: Record<string, [string, string, string, string]> = {
  goal: ['10px', '10px', '5px', '#151515'], yc: ['8px', '11px', '2px', '#F2C84B'], rc: ['8px', '11px', '2px', '#D0402E'],
};

export const vmMatch = (ctx: Ctx, id: string) => {
  const m = matchById(ctx, id);
  if (!m) return null;
  const v = mv(ctx, m), S = season(m.gid, ctx.today), G = S.G;
  const posOf = (n: string) => S.table.findIndex(r => r.name === n) + 1;
  const rowOf = (n: string) => S.table.find(r => r.name === n)!;
  const H = rowOf(m.home), A = rowOf(m.away), N = G.teams.length;
  const involved = ctx.mine.includes(m.home) || ctx.mine.includes(m.away);
  const cmp = (k: string, hv: string | number, av: string | number, hn: number, an: number) =>
    ({ k, hv, av, hw: (hn + an ? Math.round((hn / (hn + an)) * 100) : 50) + '%' });
  const r = (a: number, b: number) => (b ? a / b : 0);
  const first = S.matches.find(x => x.home === m.away && x.away === m.home);
  const h2h = first && first.played && first.r < m.r ? 'Ida: ' + first.home + ' ' + first.hg + '–' + first.ag : '1ª vuelta';
  return {
    ...v,
    hPos: posOf(m.home) + 'º · ' + H.pts + ' pts', aPos: posOf(m.away) + 'º · ' + A.pts + ' pts',
    center: m.played ? v.score : v.time, centerSub: m.played ? 'Final · ' + v.dateShort : v.dateShort,
    showAtt: !m.played && involved, att: ctx.att[m.id], ref: m.ref || '', noEvents: m.played && !m.events.length,
    events: m.events.map(ev => {
      const tn = ev.side === 'h' ? m.home : m.away, k = MARK[ev.type];
      return { min: ev.min, player: ev.player + (ev.type === 'rc' ? ' (roja)' : ''), team: initials(tn), color: colorOf(tn), mw: k[0], mh: k[1], mr: k[2], mc: k[3], me: !!ev.me };
    }),
    hasPreview: !m.played && H.pj > 0, h2h,
    compare: [
      cmp('Posición', posOf(m.home) + 'º', posOf(m.away) + 'º', N + 1 - posOf(m.home), N + 1 - posOf(m.away)),
      cmp('Puntos', H.pts, A.pts, H.pts, A.pts),
      cmp('Goles a favor / partido', r(H.gf, H.pj).toFixed(1), r(A.gf, A.pj).toFixed(1), r(H.gf, H.pj), r(A.gf, A.pj)),
      cmp('Goles en contra / partido', r(H.gc, H.pj).toFixed(1), r(A.gc, A.pj).toFixed(1), r(A.gc, A.pj), r(H.gc, H.pj)),
      cmp('Victorias', Math.round(r(H.v, H.pj) * 100) + '%', Math.round(r(A.v, A.pj) * 100) + '%', r(H.v, H.pj), r(A.v, A.pj)),
    ],
    hForm: formOf(ctx, m.home), aForm: formOf(ctx, m.away),
    rows: [
      { k: 'Fecha', v: v.dateLong }, { k: 'Hora', v: v.time },
      ...(m.played || !involved ? [] : [{ k: 'Convocatoria', v: v.callTime + ' en el campo' }]),
      { k: 'Campo', v: v.venue }, { k: 'Dirección', v: v.address }, { k: 'Superficie', v: v.surface },
    ],
  };
};
