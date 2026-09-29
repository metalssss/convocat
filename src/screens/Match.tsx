import { useMemo } from 'react';
import { useStore } from '../store';
import { vmMatch } from '../vm';
import type { Attendance } from '../vm';
import { Crest, ResChip } from '../components/ui';

const ATT_OPTS: [Attendance, string, string][] = [['si', 'Voy', '#1F8A4C'], ['duda', 'En duda', '#C99A17'], ['no', 'No voy', '#D0402E']];

export default function Match() {
  const { ctx, nav, back, openComp, openTeam, setAtt, flash } = useStore();
  const M = useMemo(() => (nav.matchId ? vmMatch(ctx, nav.matchId) : null), [ctx, nav.matchId]);
  if (!M) return null;

  const share = async () => {
    const text = `${M.home} – ${M.away}${M.played ? ' ' + M.score : ''}\n${M.dateLong} · ${M.time}\n${M.venue}, ${M.address}\n${M.mapUrl}`;
    if (navigator.share) {
      try { await navigator.share({ title: M.home + ' – ' + M.away, text }); return; } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        // Si el navegador no deja compartir, copiamos el texto.
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      flash('Enlace del partido copiado para el grupo del equipo');
    } catch {
      flash('No se ha podido compartir', 'warn');
    }
  };

  const side = (open: () => void, short: string, bg: string, name: string, pos: string) => (
    <div onClick={open} className="col" style={{ alignItems: 'center', gap: 8, textAlign: 'center', cursor: 'pointer' }}>
      <Crest label={short} color={bg} size={60} radius={16} font={24} />
      <div style={{ font: '600 14px/1.2 Archivo,sans-serif' }}>{name}</div>
      <div style={{ font: '500 11px Archivo,sans-serif', color: '#8A857A' }}>{pos}</div>
    </div>
  );

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="hero col" style={{ background: '#151515', color: '#fff', gap: 18, paddingBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="pill on-dark" onClick={back}>← Atrás</button>
          <div onClick={() => openComp(M.gid)} style={{ font: '600 11px Archivo,sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#CFCABD', cursor: 'pointer' }}>{M.comp} · J{M.j} →</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8 }}>
          {side(() => openTeam(M.home), M.hShort, M.hBg, M.home, M.hPos)}
          <div className="col" style={{ alignItems: 'center', gap: 2 }}>
            <div className="num" style={{ fontSize: 54, lineHeight: 1 }}>{M.center}</div>
            <div style={{ font: '600 11px Archivo,sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8A857A' }}>{M.centerSub}</div>
          </div>
          {side(() => openTeam(M.away), M.aShort, M.aBg, M.away, M.aPos)}
        </div>
        {M.changed && <div style={{ alignSelf: 'center', background: '#F2C84B', color: '#151515', borderRadius: 10, padding: '6px 12px', font: '700 12px Archivo,sans-serif' }}>Horario actualizado por la FCF · antes {M.oldLabel}</div>}
      </div>

      {M.showAtt && (
        <div className="card pad col" style={{ margin: '0 16px', gap: 10 }}>
          <div style={{ font: '700 13px Archivo,sans-serif' }}>¿Vas a este partido?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
            {ATT_OPTS.map(([k, label, c]) => {
              const on = M.att === k;
              return <button key={k} aria-pressed={on} onClick={() => setAtt(M.id, k)} style={{ height: 44, borderRadius: 12, border: `1px solid ${on ? c : '#DDD8CC'}`, background: on ? c : '#fff', color: on ? '#fff' : '#151515', font: '600 14px Archivo,sans-serif', cursor: 'pointer' }}>{label}</button>;
            })}
          </div>
        </div>
      )}

      {M.played && (
        <div className="card" style={{ margin: '0 16px' }}>
          <div style={{ padding: '14px 14px 6px', display: 'flex', justifyContent: 'space-between' }}>
            <div className="t14b">Acta del partido</div>
            <div style={{ font: '500 12px Archivo,sans-serif', color: '#77736A' }}>Árbitro: {M.ref}</div>
          </div>
          {M.noEvents && <div style={{ padding: '10px 14px 14px', font: '500 13px Archivo,sans-serif', color: '#8A857A' }}>Sin goles ni tarjetas.</div>}
          {M.events.map((e, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 16px minmax(0,1fr) auto', gap: 8, alignItems: 'center', padding: '9px 14px', borderTop: '1px solid #EFECE4' }}>
              <div style={{ font: "700 15px 'Barlow Condensed',sans-serif", color: '#77736A' }}>{e.min}'</div>
              <div style={{ width: e.mw, height: e.mh, borderRadius: e.mr, background: e.mc }} />
              <div className="ellip" style={{ font: `${e.me ? 700 : 500} 14px Archivo,sans-serif` }}>{e.player}</div>
              <div style={{ font: "700 11px 'Barlow Condensed',sans-serif", color: '#fff', background: e.color, padding: '2px 6px', borderRadius: 5 }}>{e.team}</div>
            </div>
          ))}
        </div>
      )}

      {M.hasPreview && (
        <div className="card pad col" style={{ margin: '0 16px', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="t14b">Previa</div>
            <div style={{ font: '500 12px Archivo,sans-serif', color: '#77736A' }}>{M.h2h}</div>
          </div>
          {M.compare.map(c => (
            <div key={c.k} className="col" style={{ gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: '600 13px Archivo,sans-serif' }}>
                <span>{c.hv}</span><span style={{ font: '500 12px Archivo,sans-serif', color: '#77736A' }}>{c.k}</span><span>{c.av}</span>
              </div>
              <div style={{ display: 'flex', gap: 3, height: 6 }}>
                <div style={{ width: c.hw, background: M.hBg, borderRadius: 3 }} />
                <div style={{ flex: 1, background: M.aBg, borderRadius: 3 }} />
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
            <div style={{ display: 'flex', gap: 3 }}>{M.hForm.map((f, i) => <ResChip key={i} r={f.r} bg={f.bg} size={18} />)}</div>
            <div style={{ font: '500 11px Archivo,sans-serif', color: '#8A857A' }}>Últimos 5</div>
            <div style={{ display: 'flex', gap: 3 }}>{M.aForm.map((f, i) => <ResChip key={i} r={f.r} bg={f.bg} size={18} />)}</div>
          </div>
        </div>
      )}

      <div className="card" style={{ margin: '0 16px' }}>
        {M.rows.map(r => (
          <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '13px 14px', borderBottom: '1px solid #EFECE4' }}>
            <div style={{ font: '500 13px Archivo,sans-serif', color: '#77736A', flex: 'none' }}>{r.k}</div>
            <div className="t14" style={{ textAlign: 'right' }}>{r.v}</div>
          </div>
        ))}
        <iframe
          title={'Mapa · ' + M.venue}
          src={'https://maps.google.com/maps?output=embed&z=15&q=' + encodeURIComponent(M.venue + ' ' + M.address)}
          loading="lazy"
          style={{ display: 'block', width: '100%', height: 110, border: 0, background: 'repeating-linear-gradient(135deg,#EFECE4 0 10px,#F7F5EF 10px 20px)' }}
        />
      </div>

      <div style={{ margin: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <a href={M.mapUrl} target="_blank" rel="noreferrer" style={{ height: 48, borderRadius: 14, background: '#151515', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 14px Archivo,sans-serif' }}>Cómo llegar ↗</a>
        <button onClick={share} style={{ height: 48, borderRadius: 14, border: '1px solid #CFCABD', background: 'transparent', font: '600 14px Archivo,sans-serif', color: '#151515', cursor: 'pointer' }}>Compartir</button>
      </div>
    </div>
  );
}
