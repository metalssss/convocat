import { MONL, dt, fmtShort, gapTxt, iso, toMin } from '../data/util';
import { useStore } from '../store';
import type { MatchView } from '../vm';
import { Toggle } from '../components/ui';
import { downloadIcs } from '../calendar';
import { useMyMatchViews } from './Home';

const monthBtn = { width: 32, height: 32, borderRadius: 16, border: 'none', background: '#E7E3D9', cursor: 'pointer', color: '#151515' } as const;

export default function Agenda() {
  const { ctx, p, update, nav, setNav, openMatch, flash } = useStore();
  const { mm, future } = useMyMatchViews();
  const td = dt(ctx.today);
  const mBase = new Date(td.getFullYear(), td.getMonth() + nav.calOffset, 1);
  const startOff = (mBase.getDay() + 6) % 7, daysIn = new Date(mBase.getFullYear(), mBase.getMonth() + 1, 0).getDate();
  const nCells = Math.ceil((startOff + daysIn) / 7) * 7;
  const cells = Array.from({ length: nCells }, (_, i) => {
    const d = new Date(mBase); d.setDate(1 - startOff + i);
    const k = iso(d);
    return { k, d: d.getDate(), dots: mm.filter(m => m.date === k).map(m => m.color), sel: nav.selDay === k, out: d.getMonth() !== mBase.getMonth(), today: k === ctx.today };
  });

  const src = nav.selDay ? mm.filter(m => m.date === nav.selDay) : future.slice(0, 12);
  const groups: { date: string; label: string; items: MatchView[]; clash: string }[] = [];
  src.forEach(m => {
    let g = groups.find(x => x.date === m.date);
    if (!g) { g = { date: m.date, label: m.dateLong, items: [], clash: '' }; groups.push(g); }
    g.items.push(m);
  });
  groups.forEach(g => {
    const pend = g.items.filter(i => !i.played);
    if (pend.length > 1) g.clash = 'Choque · ' + gapTxt(Math.abs(toMin(pend[1].time) - toMin(pend[0].time))) + ' de margen';
  });

  const toggleCalSync = () => {
    const on = !p.calSync;
    update(() => ({ calSync: on }));
    if (on) {
      downloadIcs(future);
      flash('Calendario conectado · ' + future.length + ' partidos añadidos');
    }
  };

  return (
    <div className="col" style={{ gap: 16, padding: '6px 16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 4px' }}>
        <div className="h1">Calendario</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button aria-label="Mes anterior" style={monthBtn} onClick={() => setNav({ calOffset: nav.calOffset - 1, selDay: null })}>‹</button>
          <div style={{ font: '600 13px Archivo,sans-serif', minWidth: 74, textAlign: 'center' }}>{MONL[mBase.getMonth()] + ' ' + String(mBase.getFullYear()).slice(2)}</div>
          <button aria-label="Mes siguiente" style={monthBtn} onClick={() => setNav({ calOffset: nav.calOffset + 1, selDay: null })}>›</button>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 20, padding: '12px 10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', font: '600 10px Archivo,sans-serif', letterSpacing: '0.08em', color: '#8A857A', textAlign: 'center', paddingBottom: 6 }}>
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', rowGap: 4 }}>
          {cells.map(c => (
            <div key={c.k} onClick={() => setNav({ selDay: c.sel ? null : c.k })} style={{ height: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer' }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.sel ? '#151515' : 'transparent', color: c.sel ? '#fff' : c.out ? '#C9C3B6' : '#151515', boxShadow: c.today && !c.sel ? 'inset 0 0 0 1.5px #151515' : 'none', font: "700 16px 'Barlow Condensed',sans-serif" }}>{c.d}</div>
              <div style={{ display: 'flex', gap: 2, height: 5 }}>
                {c.dots.map((col, i) => <span key={i} style={{ width: 5, height: 5, borderRadius: 3, background: col }} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div onClick={toggleCalSync} style={{ background: '#fff', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
        <div className="col" style={{ flex: 1, gap: 2 }}>
          <div className="t14">Sincronizar con el calendario del móvil</div>
          <div className="t12m">Los cambios de la FCF se reflejan también allí</div>
        </div>
        <Toggle on={p.calSync} label="Sincronizar con el calendario del móvil" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 4px' }}>
        <div className="h2">{nav.selDay ? fmtShort(nav.selDay) : 'Próximos partidos'}</div>
        {nav.selDay && <button className="link" onClick={() => setNav({ selDay: null })}>Ver todo</button>}
      </div>
      {groups.length === 0 && <div className="empty" style={{ padding: 24 }}>Día libre. Sin partidos.</div>}
      {groups.map(g => (
        <div key={g.date} className="col" style={{ gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' }}>
            <div style={{ font: '600 12px Archivo,sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5E5A51' }}>{g.label}</div>
            {g.clash && <div style={{ font: '700 11px Archivo,sans-serif', padding: '3px 8px', borderRadius: 10, background: '#F2C84B' }}>{g.clash}</div>}
          </div>
          <div className="card">
            {g.items.map(m => (
              <div key={m.id} className="row hov" onClick={() => openMatch(m.id)}>
                <div className="col" style={{ alignItems: 'center', width: 52, flex: 'none' }}>
                  <div className="num" style={{ fontSize: 20, lineHeight: 1 }}>{m.played ? m.score : m.time}</div>
                  <div style={{ font: '500 10px Archivo,sans-serif', color: '#8A857A' }}>{m.played ? 'final' : 'conv. ' + m.callTime}</div>
                </div>
                <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: m.color }} />
                <div className="col minw0" style={{ flex: 1, gap: 2 }}>
                  <div className="t14 ellip">{m.vsLabel}</div>
                  <div className="t12m ellip">{m.venue}</div>
                </div>
                {m.changed && <div className="badge-new">Cambio</div>}
                <div style={{ font: "700 12px 'Barlow Condensed',sans-serif", color: '#fff', background: m.color, padding: '3px 6px', borderRadius: 6 }}>{m.teamShort}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
