// Estado de la app: los equipos y respuestas del usuario (guardados en el dispositivo),
// la navegación entre pantallas, la sincronización con la FCF y los avisos temporales.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_MINE, DIR } from './data/league';
import type { TableMode } from './data/league';
import { addDays, dt, fmtShort, fromMin, iso, toMin } from './data/util';
import { myMatches, sortKey } from './vm';
import type { Attendance, Ctx, ScheduleChange } from './vm';

export type Screen = 'home' | 'notifs' | 'teams' | 'explore' | 'team' | 'comp' | 'match' | 'agenda' | 'add';
export type TeamTab = 'resumen' | 'partidos' | 'plantilla';
export type CompTab = 'tabla' | 'jornadas' | 'stats';
export type PrefKey = 'horario' | 'resultados' | 'recordatorio' | 'tabla';

export interface Notif { id: string; matchId: string; at: number; title: string; text: string }

/** Dónde está el usuario: se apila en el historial de «atrás» en cada `go`. */
export interface Nav {
  screen: Screen; teamName: string; matchId: string | null; gid: string | null;
  teamTab: TeamTab; compTab: CompTab; tableMode: TableMode; round: number | null;
  selDay: string | null; calOffset: number;
}

interface Persisted {
  mine: string[]; att: Record<string, Attendance>; changes: Record<string, ScheduleChange>;
  notifs: Notif[]; applied: number; prefs: Record<PrefKey, boolean>; calSync: boolean; readAt: number; lastSync: number;
}

export interface Config { today: string; warmup: number; autoSync: boolean; startScreen: Screen }

const SIM_DATES: Record<string, string> = { hoy: '2026-09-29', diciembre: '2026-12-15', marzo: '2027-03-16' };
const START_SCREENS: Screen[] = ['home', 'agenda', 'explore', 'teams', 'notifs'];

/**
 * Ajustes que en el diseño eran Tweaks, leídos de la dirección web:
 * ?fecha=diciembre|marzo|2027-01-20 · ?calentamiento=30 · ?sync=0 · ?pantalla=agenda
 */
export const readConfig = (search = location.search): Config => {
  const q = new URLSearchParams(search);
  const f = q.get('fecha') || '';
  const today = SIM_DATES[f] || (/^\d{4}-\d{2}-\d{2}$/.test(f) ? f : iso(new Date()));
  const w = Number(q.get('calentamiento'));
  const p = q.get('pantalla') as Screen;
  return {
    today,
    warmup: q.has('calentamiento') && Number.isFinite(w) ? Math.max(0, Math.min(120, w)) : 45,
    autoSync: q.get('sync') !== '0',
    startScreen: START_SCREENS.includes(p) ? p : 'home',
  };
};

const KEY = 'convocat:v1';
const DEFAULTS: Persisted = {
  mine: DEFAULT_MINE, att: {}, changes: {}, notifs: [], applied: 0,
  prefs: { horario: true, resultados: true, recordatorio: true, tabla: false }, calSync: false, readAt: 0, lastSync: Date.now() - 120000,
};
const load = (): Persisted => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const p = { ...DEFAULTS, ...JSON.parse(raw) } as Persisted;
    p.mine = p.mine.filter(n => DIR.teams[n]);
    return p;
  } catch { return DEFAULTS; }
};

export interface AddFlow { step: 'input' | 'loading' | 'pick'; url: string; error: string | null; loadN: number; pick: string | null; gid: string | null }
const ADD0: AddFlow = { step: 'input', url: '', error: null, loadN: 0, pick: null, gid: null };

const navFor = (screen: Screen): Nav => ({
  screen, teamName: DEFAULT_MINE[0], matchId: null, gid: null, teamTab: 'resumen', compTab: 'tabla',
  tableMode: 'all', round: null, selDay: null, calOffset: 0,
});

export interface Toast { msg: string; kind: 'ok' | 'warn'; key: number }

const useStoreValue = (config: Config) => {
  const [p, setP] = useState<Persisted>(load);
  const [nav, setNav] = useState<Nav>(() => navFor(config.startScreen));
  const [stack, setStack] = useState<Nav[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [add, setAdd] = useState<AddFlow>(ADD0);
  const [explore, setExplore] = useState({ query: '', chip: 'Todos' });
  const [, setTick] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pRef = useRef(p);
  pRef.current = p;

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* almacenamiento lleno o bloqueado */ } }, [p]);
  // Refresca las etiquetas relativas («hace 3 min»).
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 20000); return () => clearInterval(t); }, []);

  const ctx: Ctx = useMemo(() => ({ today: config.today, warmup: config.warmup, mine: p.mine, att: p.att, changes: p.changes }),
    [config.today, config.warmup, p.mine, p.att, p.changes]);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  const toastTimer = useRef<number>(undefined);
  const flash = useCallback((msg: string, kind: Toast['kind'] = 'ok') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, kind, key: Date.now() });
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const scrollTop = () => requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; });

  // Navegación. Cada `go` añade también una entrada al historial del navegador para que
  // el gesto de «atrás» del móvil vuelva a la pantalla anterior en vez de salir de la app.
  const navRef = useRef(nav), stackRef = useRef(stack);
  navRef.current = nav; stackRef.current = stack;
  const go = useCallback((screen: Screen, extra: Partial<Nav> = {}) => {
    setStack(s => [...s, navRef.current]);
    setNav(n => ({ ...n, screen, ...extra }));
    history.pushState({ convocat: true }, '');
    scrollTop();
  }, []);
  const popNav = useCallback(() => {
    const st = stackRef.current;
    setStack(st.slice(0, -1));
    setNav(st[st.length - 1] || navFor('home'));
    setAdd(a => ({ ...a, step: 'input' }));
    scrollTop();
  }, []);
  const back = useCallback(() => { if (stackRef.current.length && history.state?.convocat) history.back(); else popNav(); }, [popNav]);
  useEffect(() => {
    const onPop = () => { if (stackRef.current.length) popNav(); };
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, [popNav]);
  const tab = useCallback((screen: Screen) => {
    setStack([]);
    setNav(n => ({ ...n, screen, selDay: null }));
    setAdd(a => ({ ...a, step: 'input', error: null }));
    scrollTop();
  }, []);
  const setNavPart = useCallback((x: Partial<Nav>) => setNav(n => ({ ...n, ...x })), []);

  const openTeam = useCallback((n: string) => go('team', { teamName: n, teamTab: 'resumen' }), [go]);
  const openComp = useCallback((gid: string) => go('comp', { gid, compTab: 'tabla', tableMode: 'all', round: null }), [go]);
  const openMatch = useCallback((id: string) => go('match', { matchId: id }), [go]);

  const update = useCallback((f: (p: Persisted) => Partial<Persisted>) => setP(s => ({ ...s, ...f(s) })), []);

  const follow = useCallback((n: string) => {
    const had = pRef.current.mine.includes(n);
    update(s => ({ mine: had ? s.mine.filter(x => x !== n) : [...s.mine, n] }));
    flash(had ? n + ' quitado de tus equipos' : n + ' añadido a tus equipos');
  }, [update, flash]);

  const followMany = useCallback((names: string[], club: string) => {
    const allMine = names.every(n => pRef.current.mine.includes(n));
    update(s => ({ mine: allMine ? s.mine.filter(n => !names.includes(n)) : [...s.mine, ...names.filter(n => !s.mine.includes(n))] }));
    flash(allMine ? club + ' quitado de tus equipos' : names.length + ' equipos de ' + club + ' añadidos');
  }, [update, flash]);

  const setAtt = useCallback((id: string, a: Attendance) => update(s => ({ att: { ...s.att, [id]: a } })), [update]);

  // Sincronización con la FCF. La fuente simulada publica dos cambios de horario en las
  // primeras sincronizaciones, para que se vea funcionar todo el flujo de «horario actualizado».
  const syncTimer = useRef<number>(undefined);
  const syncingRef = useRef(false);
  const sync = useCallback((auto: boolean) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    syncTimer.current = window.setTimeout(() => {
      syncingRef.current = false;
      setSyncing(false);
      const s = pRef.current, c = ctxRef.current;
      const pend = myMatches(c).filter(m => !m.played && !s.changes[m.id]).sort((a, b) => sortKey(c, a).localeCompare(sortKey(c, b)));
      let ev: { m: (typeof pend)[number]; date: string; time: string } | null = null;
      if (s.applied === 0 && pend[0]) {
        const m = pend[0];
        ev = { m, date: m.date, time: fromMin(Math.min(toMin(m.time) + 90, 21 * 60)) };
      } else if (s.applied === 1) {
        const m = pend.find(x => x.home === s.mine[1] || x.away === s.mine[1]) || pend[1];
        if (m) { const d = dt(m.date).getDay(); ev = { m, date: addDays(m.date, d === 6 ? 1 : d === 0 ? -1 : 1), time: '12:00' }; }
      }
      if (!ev) {
        update(() => ({ lastSync: Date.now() }));
        if (!auto) flash('Todo al día. Sin cambios en la FCF.');
        return;
      }
      const { m } = ev;
      const oldLabel = (ev.date !== m.date ? fmtShort(m.date) + ' ' : '') + m.time;
      const newLabel = (ev.date !== m.date ? fmtShort(ev.date) + ' ' : '') + ev.time;
      const text = m.home + ' – ' + m.away + ': ' + oldLabel + ' → ' + newLabel;
      update(st => ({
        lastSync: Date.now(), applied: st.applied + 1,
        changes: { ...st.changes, [m.id]: { date: ev.date, time: ev.time, oldDate: m.date, oldTime: m.time } },
        notifs: [{ id: 'n' + Date.now(), matchId: m.id, at: Date.now(), title: 'Cambio de horario', text }, ...st.notifs],
      }));
      flash('La FCF ha cambiado el horario: ' + m.home + ' – ' + m.away + ' pasa a ' + newLabel, 'warn');
      if (s.prefs.horario) systemNotify('Cambio de horario', text);
    }, 1400);
  }, [update, flash]);

  useEffect(() => {
    if (!config.autoSync) return;
    const t = setTimeout(() => sync(true), 4500);
    return () => { clearTimeout(t); clearTimeout(syncTimer.current); syncingRef.current = false; };
  }, [config.autoSync, sync]);

  // Importar desde un enlace de fcf.cat: una breve animación de «lectura» y después eliges tu equipo.
  const loadTimer = useRef<number>(undefined);
  const startImport = useCallback((gid: string, url: string) => {
    setAdd({ ...ADD0, url, step: 'loading', gid });
    clearInterval(loadTimer.current);
    let n = 0;
    loadTimer.current = window.setInterval(() => {
      n++;
      if (n > 4) { clearInterval(loadTimer.current); setAdd(a => ({ ...a, step: 'pick' })); return; }
      setAdd(a => ({ ...a, loadN: n }));
    }, 600);
  }, []);
  useEffect(() => () => clearInterval(loadTimer.current), []);

  const confirmImport = useCallback(() => {
    const n = add.pick;
    if (!n) return;
    update(s => ({ mine: s.mine.includes(n) ? s.mine : [...s.mine, n] }));
    setAdd(ADD0);
    setStack([]);
    setNav(navFor('home'));
    scrollTop();
    flash(n + ' añadido · calendario completo importado');
  }, [add.pick, update, flash]);

  return {
    config, ctx, p, update, nav, setNav: setNavPart, stack, toast, syncing, add, setAdd, explore, setExplore, scrollRef,
    go, back, tab, openTeam, openComp, openMatch, follow, followMany, setAtt, sync, flash, startImport, confirmImport,
  };
};

export type Store = ReturnType<typeof useStoreValue>;
const StoreCtx = createContext<Store | null>(null);

export const StoreProvider = ({ config, children }: { config: Config; children: ReactNode }) => {
  const store = useStoreValue(config);
  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
};

export const useStore = (): Store => {
  const s = useContext(StoreCtx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
};

/** Muestra una notificación del sistema si el usuario las ha permitido. */
export const systemNotify = (title: string, body: string) => {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  navigator.serviceWorker?.getRegistration().then(reg => {
    if (reg) reg.showNotification(title, { body, icon: './icon-192.png', badge: './icon-192.png' });
    else new Notification(title, { body });
  }).catch(() => { /* las notificaciones son opcionales: si fallan, no pasa nada */ });
};
