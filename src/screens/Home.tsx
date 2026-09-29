import { useMemo } from 'react';
import { DIR, ME_TEAMS, season } from '../data/league';
import { DOWL, MON, dt, gapTxt, toMin } from '../data/util';
import { useStore } from '../store';
import { myMatches, mv } from '../vm';
import type { Ctx, MatchView } from '../vm';
import { Crest, Dot, ResChip, Stat } from '../components/ui';

/** Los partidos del usuario, separados en próximos (el más cercano primero) y jugados (el más reciente primero). */
export const useMyMatchViews = () => {
  const { ctx } = useStore();
  return useMemo(() => {
    const mm = myMatches(ctx).map(m => mv(ctx, m));
    return { mm, future: mm.filter(m => !m.played), past: mm.filter(m => m.played).reverse() };
  }, [ctx]);
};

/** Primer día con dos partidos del usuario, con el margen entre ellos. */
export const findClash = (future: MatchView[]) => {
  const byDay: Record<string, MatchView[]> = {};
  future.forEach(m => (byDay[m.date] = byDay[m.date] || []).push(m));
  const day = Object.keys(byDay).sort().find(k => byDay[k].length > 1);
  if (!day) return null;
  const [a, b] = byDay[day];
  return { day, a, b, gap: gapTxt(Math.abs(toMin(b.time) - toMin(a.time))) };
};

export const myPlayerStats = (ctx: Ctx) => {
  const meP = ME_TEAMS.filter(n => ctx.mine.includes(n))
    .flatMap(n => Object.values(season(DIR.teams[n].gid, ctx.today).pstats[n]).filter(p => p.me));
  return {
    has: meP.length > 0,
    stats: [
      { k: 'PJ', v: meP.reduce((a, p) => a + p.pj, 0) },
      { k: 'Goles', v: meP.reduce((a, p) => a + p.g, 0) },
      { k: 'Tarjetas', v: meP.reduce((a, p) => a + p.yc + p.rc, 0) },
    ],
  };
};

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export default function Home() {
  const { ctx, p, syncing, sync, go, tab, openMatch } = useStore();
  const { future, past } = useMyMatchViews();
  const td = dt(ctx.today);
  const next = future[0];
  const clash = findClash(future);
  const me = useMemo(() => myPlayerStats(ctx), [ctx]);
  const unread = p.notifs.filter(n => n.at > p.readAt).length;
  const mins = Math.round((Date.now() - p.lastSync) / 60000);

  return (
    <div className="col" style={{ gap: 20 }}>
      <div style={{ padding: '6px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div className="col" style={{ gap: 4 }}>
          <div className="kicker">{DOWL[td.getDay()] + ' ' + td.getDate() + ' ' + MON[td.getMonth()]}</div>
          <div className="h1">Tu semana</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button aria-label="Avisos" onClick={() => go('notifs')} style={{ width: 44, height: 44, borderRadius: 22, border: 'none', background: '#E7E3D9', color: '#151515', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <BellIcon />
            {unread > 0 && <span style={{ position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, borderRadius: 8, background: '#C8342B', color: '#fff', font: '700 10px/16px Archivo,sans-serif', textAlign: 'center' }}>{unread}</span>}
          </button>
          <button aria-label="Añadir competición" className="btn hot" onClick={() => go('add')} style={{ width: 44, height: 44, borderRadius: 22, font: '400 26px/1 Archivo,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
      </div>

      <button onClick={() => sync(false)} style={{ margin: '-8px 20px 0', display: 'flex', alignItems: 'center', gap: 8, font: '500 12px Archivo,sans-serif', color: '#77736A', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }}>
        <Dot color={syncing ? '#F2C84B' : '#1F8A4C'} />
        <span>{syncing ? 'Sincronizando con fcf.cat…' : 'Sincronizado con fcf.cat · ' + (mins < 1 ? 'ahora' : 'hace ' + mins + ' min')}</span>
        <span style={{ display: 'inline-block', font: '700 14px Archivo,sans-serif', color: '#151515', animation: syncing ? 'spin 0.8s linear infinite' : 'none' }}>↻</span>
      </button>

      {next && (
        <div style={{ padding: '0 16px' }}>
          <div onClick={() => openMatch(next.id)} style={{ background: '#151515', color: '#fff', borderRadius: 22, padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', gap: 18, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: 80, border: '1px solid rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, font: '600 11px Archivo,sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#CFCABD' }}>
                <Dot color={next.color} size={8} />{next.teamName} · {next.comp}
              </div>
              <div style={{ font: "700 13px 'Barlow Condensed',sans-serif", letterSpacing: '0.06em', color: '#8A857A' }}>J{next.j}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, position: 'relative' }}>
              <div className="col" style={{ alignItems: 'center', gap: 8, textAlign: 'center' }}>
                <Crest label={next.hShort} color={next.hBg} size={52} radius={14} font={20} />
                <div style={{ font: '600 13px/1.2 Archivo,sans-serif' }}>{next.home}</div>
              </div>
              <div className="col" style={{ alignItems: 'center', gap: 2 }}>
                <div className="num" style={{ fontSize: 46, lineHeight: 1, letterSpacing: '-0.01em' }}>{next.time}</div>
                <div style={{ font: '600 11px Archivo,sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A857A' }}>{next.dateShort}</div>
              </div>
              <div className="col" style={{ alignItems: 'center', gap: 8, textAlign: 'center' }}>
                <Crest label={next.aShort} color={next.aBg} size={52} radius={14} font={20} />
                <div style={{ font: '600 13px/1.2 Archivo,sans-serif' }}>{next.away}</div>
              </div>
            </div>
            {next.changed && (
              <div style={{ position: 'relative', alignSelf: 'center', background: '#F2C84B', color: '#151515', borderRadius: 10, padding: '5px 10px', font: '700 12px Archivo,sans-serif' }}>Horario actualizado por la FCF · antes {next.oldLabel}</div>
            )}
            <div className="col" style={{ gap: 4, position: 'relative', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, font: '600 14px Archivo,sans-serif' }}><span>{next.venue}</span><span style={{ color: '#F2C84B', flex: 'none' }}>{next.inDays}</span></div>
              <div style={{ font: '400 13px Archivo,sans-serif', color: '#A39E92' }}>Convocatoria {next.callTime} · {next.surface}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
              <div style={{ flex: 1, height: 44, borderRadius: 12, background: next.attBg, color: next.attFg, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 14px Archivo,sans-serif' }}>{next.attLabel}</div>
              <a href={next.mapUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ flex: 1, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 14px Archivo,sans-serif' }}>Cómo llegar ↗</a>
            </div>
          </div>
        </div>
      )}

      {clash && (
        <div onClick={() => {
          const d = dt(clash.day);
          go('agenda', { selDay: clash.day, calOffset: (d.getFullYear() - td.getFullYear()) * 12 + d.getMonth() - td.getMonth() });
        }} style={{ margin: '0 16px', padding: '14px 16px', borderRadius: 16, background: '#F2C84B', display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}>
          <div className="num" style={{ fontSize: 26, lineHeight: 1 }}>!</div>
          <div className="col" style={{ gap: 2 }}>
            <div className="t14b">Doble partido el {clash.a.dateShort.toLowerCase()}</div>
            <div style={{ font: '400 13px/1.35 Archivo,sans-serif', color: '#3B3218' }}>
              {clash.a.teamName} a las {clash.a.time} y {clash.b.teamName} a las {clash.b.time}. {clash.gap} de margen.
            </div>
          </div>
        </div>
      )}

      {me.has && (
        <div onClick={() => go('team', { teamName: ME_TEAMS.find(n => ctx.mine.includes(n))!, teamTab: 'plantilla' })} style={{ margin: '0 16px', background: '#fff', borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
          <div className="col" style={{ gap: 2, flex: 1 }}>
            <div style={{ font: '700 15px Archivo,sans-serif' }}>Tus números</div>
            <div className="t12m">Temporada 2026‑27 · según actas</div>
          </div>
          {me.stats.map(s => <Stat key={s.k} v={s.v} k={s.k} />)}
        </div>
      )}

      <div className="col" style={{ gap: 10, padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 4px' }}>
          <div className="h2">Próximos</div>
          <button className="link" onClick={() => tab('agenda')}>Calendario →</button>
        </div>
        {future.length === 0 ? <div className="empty">No tienes partidos pendientes.</div> : (
          <div className="card">
            {future.slice(0, 4).map(m => (
              <div key={m.id} className="row hov" onClick={() => openMatch(m.id)}>
                <div className="col" style={{ width: 44, alignItems: 'center', flex: 'none' }}>
                  <div style={{ font: '600 10px Archivo,sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A857A' }}>{m.dow}</div>
                  <div className="num" style={{ fontSize: 24, lineHeight: 1 }}>{m.dnum}</div>
                </div>
                <div className="col minw0" style={{ flex: 1, gap: 3 }}>
                  <div className="t14 ellip">{m.vsLabel}</div>
                  <div className="t12m" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Dot color={m.color} />{m.teamName} · {m.side}</div>
                </div>
                <div className="col" style={{ alignItems: 'flex-end', gap: 2 }}>
                  <div style={{ font: "700 18px 'Barlow Condensed',sans-serif" }}>{m.time}</div>
                  {m.changed && <div className="badge-new">Nuevo horario</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="col" style={{ gap: 10, padding: '0 16px' }}>
          <div className="h2" style={{ padding: '0 4px' }}>Últimos resultados</div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', margin: '0 -16px', padding: '0 16px' }}>
            {past.slice(0, 6).map(m => (
              <div key={m.id} onClick={() => openMatch(m.id)} style={{ flex: 'none', width: 150, background: '#fff', borderRadius: 16, padding: 12, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ font: '600 11px Archivo,sans-serif', color: '#8A857A' }}>{m.dateShort}</div>
                  {m.res && <ResChip r={m.res} bg={m.resBg} />}
                </div>
                <div className="num" style={{ fontSize: 32, lineHeight: 1 }}>{m.score}</div>
                <div style={{ font: '500 12px/1.3 Archivo,sans-serif', color: '#3B3832' }}>{m.vsLabel}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: '400 11px Archivo,sans-serif', color: '#77736A' }}><Dot color={m.color} />{m.teamName}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
