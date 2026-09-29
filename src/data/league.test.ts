import { describe, expect, it } from 'vitest';
import { DIR, SAMPLE_URL, parseFcfUrl, season, tableOf } from './league';
import { initials } from './util';
import { myMatches, mv, streakOf, vmMatch, vmTeam } from '../vm';
import type { Ctx } from '../vm';
import { buildIcs } from '../calendar';

const ctx = (today: string, extra: Partial<Ctx> = {}): Ctx => ({ today, warmup: 45, mine: ['CE Sant Ignasi', 'CE Sant Ignasi B'], att: {}, changes: {}, ...extra });

describe('directory', () => {
  it('matches the design: ~500 teams in 47 groups, all Sant Ignasi teams present', () => {
    expect(Object.keys(DIR.groups)).toHaveLength(47);
    expect(DIR.list.length).toBeGreaterThan(450);
    expect(DIR.list.filter(t => t.club === 'CE Sant Ignasi')).toHaveLength(11);
    expect(DIR.teams['CE Sant Ignasi'].gid).toBe('segona-catalana-3');
    expect(DIR.teams['CE Sant Ignasi B'].gid).toBe('tercera-catalana-10');
  });

  it('has unique team names', () => {
    expect(new Set(DIR.list.map(t => t.name)).size).toBe(DIR.list.length);
  });

  it('builds crest initials', () => {
    expect(initials('CE Sant Ignasi B')).toBe('SI');
    expect(initials('UE Poble Sec')).toBe('PS');
  });
});

describe('season simulation', () => {
  it('is deterministic and every team plays every other twice', () => {
    const a = season('segona-catalana-3', '2026-12-15'), b = season('segona-catalana-3', '2026-12-15');
    expect(a).toBe(b);
    const n = a.G.teams.length;
    expect(a.matches).toHaveLength(n * (n - 1));
    const pairs = new Set(a.matches.map(m => m.home + '|' + m.away));
    expect(pairs.size).toBe(n * (n - 1));
  });

  it('keeps the standings consistent with the results and match reports', () => {
    const S = season('segona-catalana-3', '2027-03-16');
    const played = S.matches.filter(m => m.played);
    const totalGoals = played.reduce((a, m) => a + m.hg + m.ag, 0);
    expect(S.table.reduce((a, r) => a + r.gf, 0)).toBe(totalGoals);
    expect(S.table.reduce((a, r) => a + r.pj, 0)).toBe(played.length * 2);
    played.forEach(m => expect(m.events.filter(e => e.type === 'goal')).toHaveLength(m.hg + m.ag));
    const scorerGoals = Object.values(S.pstats).flatMap(t => Object.values(t)).reduce((a, p) => a + p.g, 0);
    expect(scorerGoals).toBe(totalGoals);
    const home = tableOf(S.G, S.matches, 'home'), away = tableOf(S.G, S.matches, 'away');
    expect(home.reduce((a, r) => a + r.pts, 0) + away.reduce((a, r) => a + r.pts, 0)).toBe(S.table.reduce((a, r) => a + r.pts, 0));
  });

  it('marks only matches before today as played', () => {
    const S = season('segona-catalana-3', '2026-09-29');
    S.matches.forEach(m => expect(m.played).toBe(m.date < '2026-09-29'));
  });
});

describe('fcf.cat links', () => {
  it('reads a competition link', () => {
    expect(parseFcfUrl(SAMPLE_URL)).toEqual({ gid: 'lliga-veterans-f7-1' });
    expect(parseFcfUrl('https://www.fcf.cat/competicio/2627/futbol-11/segona-catalana/grup-3')).toEqual({ gid: 'segona-catalana-3' });
  });
  it('explains bad links', () => {
    expect(parseFcfUrl('https://example.com')).toEqual({ error: 'Ese enlace no es de fcf.cat' });
    expect(parseFcfUrl('https://www.fcf.cat/noticies')).toEqual({ error: 'No hemos podido leer este enlace' });
  });
});

describe('view models', () => {
  it('applies schedule changes and computes the call time', () => {
    const c = ctx('2026-09-29');
    const next = myMatches(c).find(m => !m.played)!;
    const base = mv(c, next);
    expect(base.changed).toBe(false);
    const changed = mv(ctx('2026-09-29', { changes: { [next.id]: { date: next.date, time: '20:00', oldDate: next.date, oldTime: next.time } } }), next);
    expect(changed.time).toBe('20:00');
    expect(changed.callTime).toBe('19:15');
    expect(changed.oldLabel).toBe(next.time);
  });

  it('summarises streaks', () => {
    expect(streakOf([])).toBe('Sin partidos');
    expect(streakOf(['D', 'V', 'V', 'V'])).toBe('3 victorias seguidas');
    expect(streakOf(['V', 'E', 'D'])).toBe('2 partidos sin ganar');
    expect(streakOf(['D', 'V', 'E'])).toBe('2 partidos sin perder');
  });

  it('shows the user as «Tú» in their squads', () => {
    expect(vmTeam(ctx('2026-12-15'), 'CE Sant Ignasi').roster.some(p => p.me && p.name === 'Tú')).toBe(true);
  });

  it('only asks for attendance on the user\'s upcoming matches', () => {
    const c = ctx('2026-12-15');
    const up = myMatches(c).find(m => !m.played)!;
    expect(vmMatch(c, up.id)!.showAtt).toBe(true);
    expect(vmMatch(ctx('2026-12-15', { mine: [] }), up.id)!.showAtt).toBe(false);
  });
});

describe('calendar export', () => {
  it('writes one event per match', () => {
    const c = ctx('2026-09-29');
    const views = myMatches(c).filter(m => !m.played).slice(0, 3).map(m => mv(c, m));
    const ics = buildIcs(views);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3);
    expect(ics).toContain('LOCATION:Camp de Futbol Col·legi Sant Ignasi');
  });
});
