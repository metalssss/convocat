import { useStore } from '../store';
import { eff, formOf, teamStats } from '../vm';
import { fmtShort, initials } from '../data/util';
import { Crest, ResChip } from '../components/ui';

export default function Teams() {
  const { ctx, p, openTeam, tab, go } = useStore();
  const cards = p.mine.map(n => {
    const { e, G, pos, row, ms } = teamStats(ctx, n);
    const nx = ms.map(m => eff(ctx, m)).filter(m => !m.played).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
    return { name: n, color: e.color, G, pos, pts: row.pts, form: formOf(ctx, n, 5), nextLabel: nx ? 'Próximo: ' + fmtShort(nx.date) + ' · ' + nx.time : 'Sin partidos' };
  });

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 4px' }}>
        <div className="h1">Mis equipos</div>
        <div style={{ font: '600 13px Archivo,sans-serif', color: '#77736A' }}>{p.mine.length + (p.mine.length === 1 ? ' equipo' : ' equipos')}</div>
      </div>
      {cards.map(t => (
        <div key={t.name} onClick={() => openTeam(t.name)} className="team-card" style={{ background: '#fff', borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, cursor: 'pointer' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Crest label={initials(t.name)} color={t.color} size={48} radius={14} font={20} />
            <div className="col minw0" style={{ flex: 1, gap: 2 }}>
              <div style={{ font: '700 16px Archivo,sans-serif' }}>{t.name}</div>
              <div className="t12m">{t.G.div} · {t.G.group} · {t.G.mod}</div>
            </div>
            <div className="col" style={{ alignItems: 'flex-end' }}>
              <div className="num" style={{ fontSize: 34, lineHeight: 0.9 }}>{t.pos}º</div>
              <div style={{ font: '600 11px Archivo,sans-serif', color: '#8A857A' }}>{t.pts} pts</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #EFECE4', paddingTop: 12, gap: 8 }}>
            <div style={{ display: 'flex', gap: 4 }}>{t.form.map((f, i) => <ResChip key={i} r={f.r} bg={f.bg} />)}</div>
            <div style={{ font: '500 12px Archivo,sans-serif', color: '#3B3832', textAlign: 'right' }}>{t.nextLabel}</div>
          </div>
        </div>
      ))}
      {cards.length === 0 && <div className="empty">Aún no sigues ningún equipo.</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button className="dashed" onClick={() => tab('explore')}>
          <div className="t14b">Buscar equipo</div><div style={{ font: '400 12px Archivo,sans-serif' }}>Cualquier equipo de la FCF</div>
        </button>
        <button className="dashed" onClick={() => go('add')}>
          <div className="t14b">Pegar enlace</div><div style={{ font: '400 12px Archivo,sans-serif' }}>Desde fcf.cat</div>
        </button>
      </div>
    </div>
  );
}
