import { useMemo } from 'react';
import type { TableMode } from '../data/league';
import { useStore } from '../store';
import type { CompTab } from '../store';
import { vmComp } from '../vm';
import { Crest, Seg } from '../components/ui';

const GRID = '22px minmax(0,1fr) 22px 22px 22px 22px 30px 30px';
const MODES: [TableMode, string][] = [['all', 'General'], ['home', 'Casa'], ['away', 'Fuera']];
const navBtn = { width: 40, height: 40, borderRadius: 10, border: 'none', background: '#F3F1EA', cursor: 'pointer', font: '600 16px Archivo,sans-serif', color: '#151515' } as const;

export default function Comp() {
  const { ctx, nav, setNav, back, openTeam, openMatch } = useStore();
  const C = useMemo(() => (nav.gid ? vmComp(ctx, nav.gid, nav.tableMode, nav.round) : null), [ctx, nav.gid, nav.tableMode, nav.round]);
  if (!C) return null;

  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="hero col" style={{ background: '#151515', color: '#fff', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="pill on-dark" onClick={back}>← Atrás</button>
          <a href={C.url} target="_blank" rel="noreferrer" style={{ font: '500 12px Archivo,sans-serif', color: '#A39E92' }}>fcf.cat ↗</a>
        </div>
        <div className="col" style={{ gap: 4 }}>
          <div className="kicker" style={{ color: '#A39E92' }}>{C.mod} · {C.cat} · 2026‑27</div>
          <div className="h1">{C.div}</div>
          <div style={{ font: '600 15px Archivo,sans-serif', color: '#CFCABD' }}>{C.group} · {C.nTeams} equipos · jornada {C.curJ} de {C.nRounds}</div>
        </div>
      </div>

      <Seg<CompTab> items={[['tabla', 'Clasificación'], ['jornadas', 'Jornadas'], ['stats', 'Estadísticas']]} value={nav.compTab} onPick={k => setNav({ compTab: k })} />

      {nav.compTab === 'tabla' && (
        <>
          <div style={{ margin: '0 16px', display: 'flex', gap: 6 }}>
            {MODES.map(([k, label]) => (
              <button key={k} className="chip" aria-pressed={nav.tableMode === k} onClick={() => setNav({ tableMode: k })} style={{ height: 32, padding: '0 12px', borderRadius: 16, fontSize: 12 }}>{label}</button>
            ))}
          </div>
          <div className="card" style={{ margin: '0 16px', paddingBottom: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 4, padding: '10px 12px', font: '600 10px Archivo,sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8A857A' }}>
              <div>#</div><div>Equipo</div>
              {['PJ', 'V', 'E', 'D', 'DG', 'Pts'].map(h => <div key={h} style={{ textAlign: 'right' }}>{h}</div>)}
            </div>
            {C.rows.map(r => (
              <div key={r.name} className="hov" onClick={() => openTeam(r.name)} style={{ display: 'grid', gridTemplateColumns: GRID, gap: 4, padding: '9px 12px', background: r.mine ? r.color + '1F' : 'transparent', font: `${r.mine ? 700 : 500} 13px Archivo,sans-serif`, alignItems: 'center', boxShadow: `inset 3px 0 0 ${r.zone}` }}>
                <div style={{ font: "700 15px 'Barlow Condensed',sans-serif" }}>{r.pos}</div>
                <div className="minw0" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: r.color, flex: 'none' }} /><span className="ellip">{r.name}</span>
                </div>
                {[r.pj, r.v, r.e, r.d, r.dg].map((x, i) => <div key={i} style={{ textAlign: 'right', color: '#77736A' }}>{x}</div>)}
                <div className="num" style={{ textAlign: 'right', fontSize: 16 }}>{r.pts}</div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 14, padding: '10px 12px 4px', font: '500 11px Archivo,sans-serif', color: '#77736A' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 3, height: 12, background: '#1F8A4C' }} />Ascenso</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 3, height: 12, background: '#D0402E' }} />Descenso</span>
            </div>
          </div>
        </>
      )}

      {nav.compTab === 'jornadas' && (
        <>
          <div style={{ margin: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 14, padding: 6 }}>
            <button aria-label="Jornada anterior" style={navBtn} onClick={() => setNav({ round: Math.max(0, C.round - 1) })}>←</button>
            <div className="col" style={{ alignItems: 'center' }}>
              <div className="num" style={{ fontSize: 22, lineHeight: 1 }}>Jornada {C.roundJ}</div>
              <div style={{ font: '500 12px Archivo,sans-serif', color: '#77736A' }}>{C.roundDate}</div>
            </div>
            <button aria-label="Jornada siguiente" style={navBtn} onClick={() => setNav({ round: Math.min(C.nRounds - 1, C.round + 1) })}>→</button>
          </div>
          <div className="card" style={{ margin: '0 16px' }}>
            {C.roundMatches.map(m => (
              <div key={m.id} className="row hov" onClick={() => openMatch(m.id)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 58px minmax(0,1fr)', gap: 8, background: m.mine ? '#F2C84B26' : 'transparent' }}>
                <div className="ellip" style={{ textAlign: 'right', font: '600 13px Archivo,sans-serif' }}>{m.home}</div>
                <div className="num" style={{ textAlign: 'center', fontSize: 18, background: '#F3F1EA', borderRadius: 8, padding: '3px 0' }}>{m.played ? m.score : m.time}</div>
                <div className="ellip" style={{ font: '600 13px Archivo,sans-serif' }}>{m.away}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {nav.compTab === 'stats' && (
        <div className="col" style={{ gap: 14, padding: '0 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {C.avgs.map(s => (
              <div key={s.k} className="col" style={{ background: '#fff', borderRadius: 14, padding: 12, gap: 4 }}>
                <div className="num" style={{ fontSize: 28, lineHeight: 1 }}>{s.v}</div>
                <div style={{ font: '500 11px Archivo,sans-serif', color: '#77736A' }}>{s.k}</div>
              </div>
            ))}
          </div>
          {C.rankings.length > 0 && (
            <div className="card">
              <div className="t14b" style={{ padding: '14px 14px 6px' }}>Destacados</div>
              {C.rankings.map(k => (
                <div key={k.k} onClick={() => openTeam(k.team)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderTop: '1px solid #EFECE4', cursor: 'pointer' }}>
                  <Crest label={k.short} color={k.color} size={34} radius={10} font={14} />
                  <div className="col minw0" style={{ flex: 1, gap: 1 }}>
                    <div style={{ font: '500 11px Archivo,sans-serif', color: '#77736A' }}>{k.k}</div>
                    <div className="t14 ellip">{k.team}</div>
                  </div>
                  <div className="num" style={{ fontSize: 18 }}>{k.v}</div>
                </div>
              ))}
            </div>
          )}
          {C.pichichi.length > 0 && (
            <div className="card">
              <div className="t14b" style={{ padding: '14px 14px 6px' }}>Pichichi</div>
              {C.pichichi.map(p => (
                <div key={p.rank} onClick={() => openTeam(p.team)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderTop: '1px solid #EFECE4', cursor: 'pointer', background: p.me ? '#F2C84B33' : 'transparent' }}>
                  <div className="num" style={{ width: 20, fontSize: 16, color: '#8A857A' }}>{p.rank}</div>
                  <div className="col minw0" style={{ flex: 1, gap: 1 }}>
                    <div className="t14">{p.name}</div>
                    <div className="t12m" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: 2, background: p.color }} />{p.team}</div>
                  </div>
                  <div className="num" style={{ fontSize: 22 }}>{p.g}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
