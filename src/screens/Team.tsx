import { useMemo } from 'react';
import { DIR } from '../data/league';
import { useStore } from '../store';
import type { TeamTab } from '../store';
import { vmTeam } from '../vm';
import { ResChip, Seg } from '../components/ui';

export default function Team() {
  const { ctx, nav, setNav, back, follow, openComp, openMatch } = useStore();
  const name = nav.teamName;
  const T = useMemo(() => (DIR.teams[name] ? vmTeam(ctx, name) : null), [ctx, name]);
  if (!T) return null;
  const tabBtn = { height: 36, padding: '0 14px', borderRadius: 18, border: 'none', font: '600 13px Archivo,sans-serif', cursor: 'pointer' } as const;

  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="hero col" style={{ background: T.color, color: '#fff', gap: 16, position: 'relative', overflow: 'hidden' }}>
        <div className="num" style={{ position: 'absolute', right: -20, bottom: -60, fontSize: 180, lineHeight: 1, color: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }}>{T.short}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <button onClick={back} style={{ ...tabBtn, background: 'rgba(255,255,255,0.18)', color: '#fff' }}>← Atrás</button>
          <button onClick={() => follow(name)} style={{ ...tabBtn, font: '700 13px Archivo,sans-serif', background: T.isMine ? 'rgba(255,255,255,0.18)' : '#fff', color: T.isMine ? '#fff' : '#151515' }}>
            {T.isMine ? 'En mis equipos ✓' : '+ Añadir a mis equipos'}
          </button>
        </div>
        <div className="col" style={{ gap: 6, position: 'relative' }}>
          <div onClick={() => openComp(T.gid)} style={{ font: '600 11px Archivo,sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85, cursor: 'pointer' }}>{T.div} · {T.group} →</div>
          <div className="num" style={{ fontSize: 40, lineHeight: 0.95, textTransform: 'uppercase' }}>{T.name}</div>
          <div style={{ font: '500 13px Archivo,sans-serif', opacity: 0.85 }}>{T.venue} · {T.homeLabel}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, position: 'relative' }}>
          {T.head.map(s => (
            <div key={s.k} className="col" style={{ background: 'rgba(0,0,0,0.16)', borderRadius: 12, padding: '8px 10px' }}>
              <div className="num" style={{ fontSize: 26, lineHeight: 1 }}>{s.v}</div>
              <div style={{ font: '600 10px Archivo,sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8 }}>{s.k}</div>
            </div>
          ))}
        </div>
      </div>

      <Seg<TeamTab> items={[['resumen', 'Resumen'], ['partidos', 'Partidos'], ['plantilla', 'Plantilla']]} value={nav.teamTab} onPick={k => setNav({ teamTab: k })} />

      {nav.teamTab === 'resumen' && (
        <div className="col" style={{ gap: 14, padding: '0 16px' }}>
          {T.noData && <div className="empty" style={{ padding: 20 }}>La liga aún no ha empezado. Las estadísticas aparecerán tras la primera jornada.</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {T.tiles.map(s => (
              <div key={s.k} className="col" style={{ background: '#fff', borderRadius: 14, padding: 12, gap: 4 }}>
                <div className="num" style={{ fontSize: 28, lineHeight: 1 }}>{s.v}</div>
                <div style={{ font: '500 11px/1.25 Archivo,sans-serif', color: '#77736A' }}>{s.k}</div>
              </div>
            ))}
          </div>
          <div className="card pad col" style={{ gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div className="t14b">Forma</div><div style={{ font: '500 12px Archivo,sans-serif', color: '#77736A' }}>{T.streak}</div></div>
            <div style={{ display: 'flex', gap: 6 }}>
              {T.form.map(f => (
                <div key={f.id} onClick={() => openMatch(f.id)} style={{ flex: 1, height: 44, borderRadius: 10, background: f.bg, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <div className="num" style={{ fontSize: 16, lineHeight: 1 }}>{f.score}</div>
                  <div style={{ font: '600 9px Archivo,sans-serif', opacity: 0.85 }}>{f.opp}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card pad" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {T.split.map(h => (
              <div key={h.k} className="col" style={{ gap: 6 }}>
                <div style={{ font: '600 11px Archivo,sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A857A' }}>{h.k}</div>
                <div className="num" style={{ fontSize: 30, lineHeight: 1 }}>{h.pts} <span style={{ font: '600 12px Archivo,sans-serif', color: '#77736A' }}>pts</span></div>
                <div style={{ font: '500 12px Archivo,sans-serif', color: '#3B3832' }}>{h.rec} · goles {h.goals}</div>
              </div>
            ))}
          </div>
          {T.hasChart && (
            <div className="card pad col" style={{ gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><div className="t14b">Posición por jornada</div><div style={{ font: '500 12px Archivo,sans-serif', color: '#77736A' }}>{T.chartNote}</div></div>
              <div style={{ display: 'flex', gap: 6 }}>
                <div className="col" style={{ justifyContent: 'space-between', font: '600 10px Archivo,sans-serif', color: '#8A857A', padding: '2px 0' }}><span>1º</span><span>{T.nTeams}º</span></div>
                <svg viewBox="0 0 300 90" preserveAspectRatio="none" style={{ flex: 1, height: 90, overflow: 'visible' }} role="img" aria-label={'Posición por jornada, ' + T.chartNote}>
                  <line x1="0" y1="6" x2="300" y2="6" stroke="#EFECE4" /><line x1="0" y1="45" x2="300" y2="45" stroke="#EFECE4" /><line x1="0" y1="84" x2="300" y2="84" stroke="#EFECE4" />
                  <polyline points={T.chartPts} fill="none" stroke={T.color} strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
            </div>
          )}
          <div className="card pad col" style={{ gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="t14b">Goles por tramo</div>
              <div style={{ display: 'flex', gap: 10, font: '500 11px Archivo,sans-serif', color: '#77736A' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: T.color }} />A favor</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#CFCABD' }} />En contra</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8, alignItems: 'end', height: 90 }}>
              {T.buckets.map(b => (
                <div key={b.label} style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: '100%', justifyContent: 'center' }}>
                  <div style={{ width: '40%', height: b.fh, minHeight: 2, background: T.color, borderRadius: '3px 3px 0 0' }} />
                  <div style={{ width: '40%', height: b.ch, minHeight: 2, background: '#CFCABD', borderRadius: '3px 3px 0 0' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
              {T.buckets.map(b => <div key={b.label} style={{ textAlign: 'center', font: '500 10px Archivo,sans-serif', color: '#8A857A' }}>{b.label}</div>)}
            </div>
          </div>
          <div className="card">
            <div className="t14b" style={{ padding: '14px 14px 6px' }}>Máximos goleadores</div>
            {T.scorers.length === 0 && <div style={{ padding: '10px 14px 14px', font: '500 13px Archivo,sans-serif', color: '#8A857A', borderTop: '1px solid #EFECE4' }}>Aún sin goles.</div>}
            {T.scorers.map(p => (
              <div key={p.dorsal} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderTop: '1px solid #EFECE4', background: p.me ? '#F2C84B33' : 'transparent' }}>
                <div className="num" style={{ width: 26, fontSize: 18, color: '#8A857A' }}>{p.dorsal}</div>
                <div className="t14" style={{ flex: 1 }}>{p.name}</div>
                <div style={{ font: '500 12px Archivo,sans-serif', color: '#77736A' }}>{p.pj} PJ</div>
                <div className="num" style={{ fontSize: 22, minWidth: 24, textAlign: 'right' }}>{p.g}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nav.teamTab === 'partidos' && (
        <div className="card" style={{ margin: '0 16px' }}>
          {T.matches.map(m => (
            <div key={m.id} className="row hov" onClick={() => openMatch(m.id)}>
              <div style={{ width: 30, font: "700 13px 'Barlow Condensed',sans-serif", color: '#8A857A', flex: 'none' }}>J{m.j}</div>
              <div className="col minw0" style={{ flex: 1, gap: 2 }}>
                <div className="t14 ellip">{m.vsLabel}</div>
                <div className="t12m">{m.dateShort} · {m.side}</div>
              </div>
              {m.played ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="num" style={{ fontSize: 20 }}>{m.score}</div>
                  {m.res && <ResChip r={m.res} bg={m.resBg} />}
                </div>
              ) : (
                <div style={{ font: "700 17px 'Barlow Condensed',sans-serif", padding: '3px 8px', borderRadius: 8, background: m.changed ? '#F2C84B' : '#F3F1EA' }}>{m.time}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {nav.teamTab === 'plantilla' && (
        <div className="card" style={{ margin: '0 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 34px 30px 30px 30px', gap: 6, padding: '10px 14px', font: '600 10px Archivo,sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A857A' }}>
            <div>#</div><div>Jugador</div><div>Pos</div><div style={{ textAlign: 'right' }}>PJ</div><div style={{ textAlign: 'right' }}>G</div><div style={{ textAlign: 'right' }}>TA</div>
          </div>
          {T.roster.map(p => (
            <div key={p.dorsal} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 34px 30px 30px 30px', gap: 6, padding: '10px 14px', borderTop: '1px solid #EFECE4', alignItems: 'center', background: p.me ? '#F2C84B33' : 'transparent', font: `${p.me ? 700 : 500} 14px Archivo,sans-serif` }}>
              <div className="num" style={{ fontSize: 16, color: '#8A857A' }}>{p.dorsal}</div>
              <div className="ellip">{p.name}</div>
              <div style={{ font: '600 11px Archivo,sans-serif', color: '#77736A' }}>{p.pos}</div>
              <div style={{ textAlign: 'right', color: '#77736A' }}>{p.pj}</div>
              <div className="num" style={{ textAlign: 'right', fontSize: 17 }}>{p.g}</div>
              <div style={{ textAlign: 'right', color: '#77736A' }}>{p.yc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
