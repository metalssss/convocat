import { useMemo } from 'react';
import { DIR, SECTIONS } from '../data/league';
import type { Group } from '../data/league';
import { initials, norm } from '../data/util';
import { useStore } from '../store';
import { colorOf } from '../vm';
import { Crest, Dot } from '../components/ui';

const Mine = () => <div style={{ font: '700 10px Archivo,sans-serif', padding: '3px 6px', borderRadius: 6, background: '#151515', color: '#fff', flex: 'none' }}>MÍO</div>;

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#77736A" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);

export default function Explore() {
  const { p, explore, setExplore, openTeam, openComp, followMany } = useStore();
  const { query, chip } = explore;
  const q = norm(query.trim()), searching = q.length >= 2;
  const chipOk = (sec: string) => chip === 'Todos' || sec === chip;
  const groupsArr = useMemo(() => Object.values(DIR.groups), []);

  const words = q.split(/\s+/);
  const tr = searching ? DIR.list.filter(t => chipOk(t.section) && words.every(w => t.key.includes(w))) : [];
  const cr = searching ? groupsArr.filter(g => chipOk(g.section) && words.every(w => norm(g.div + ' ' + g.group + ' ' + g.cat).includes(w))).slice(0, 5) : [];

  // Un club con 3 o más equipos encontrados tiene una tarjeta para seguir todo el club de golpe.
  const byClub: Record<string, typeof tr> = {};
  tr.forEach(t => (byClub[t.club] = byClub[t.club] || []).push(t));
  const clubs = Object.entries(byClub).filter(([, ts]) => ts.length >= 3).slice(0, 2).map(([club]) => {
    const all = DIR.list.filter(t => t.club === club).map(t => t.name);
    return { club, all, allMine: all.every(n => p.mine.includes(n)) };
  });

  const compRow = (g: Group) => {
    const mineT = p.mine.find(n => DIR.teams[n]?.gid === g.gid);
    return (
      <div key={g.gid} className="row hov" onClick={() => openComp(g.gid)} style={{ justifyContent: 'space-between', gap: 10 }}>
        <div className="col" style={{ gap: 2 }}><div className="t14">{g.div} · {g.group}</div><div className="t12m">{g.teams.length} equipos · {g.mod} · {g.cat}</div></div>
        {mineT ? <Dot color={colorOf(mineT)} size={8} /> : searching && <div style={{ color: '#8A857A' }}>→</div>}
      </div>
    );
  };

  const sections = SECTIONS.filter(chipOk).map(sec => ({ title: sec as string, comps: groupsArr.filter(g => g.section === sec) }));
  if (chip === 'Todos') {
    const myG = [...new Set(p.mine.map(n => DIR.teams[n]?.gid).filter(Boolean))];
    if (myG.length) sections.unshift({ title: 'Tus competiciones', comps: myG.map(g => DIR.groups[g]) });
  }

  return (
    <div className="screen">
      <div className="col" style={{ gap: 4, padding: '0 4px' }}>
        <div className="h1">Explorar</div>
        <div style={{ font: '400 13px Archivo,sans-serif', color: '#77736A' }}>{DIR.list.length} equipos · {groupsArr.length} grupos de la FCF</div>
      </div>
      <div className="search">
        <SearchIcon />
        <input type="search" value={query} onChange={e => setExplore(x => ({ ...x, query: e.target.value }))} placeholder="Equipo, club, pueblo o categoría" enterKeyHint="search" autoComplete="off" />
        {searching && <button aria-label="Borrar" onClick={() => setExplore(x => ({ ...x, query: '' }))} style={{ border: 'none', background: '#E7E3D9', width: 24, height: 24, borderRadius: 12, cursor: 'pointer', font: '600 12px Archivo,sans-serif', color: '#151515', flex: 'none' }}>✕</button>}
      </div>
      <div className="hscroll">
        {['Todos', ...SECTIONS].map(c => <button key={c} className="chip" aria-pressed={chip === c} onClick={() => setExplore(x => ({ ...x, chip: c }))}>{c}</button>)}
      </div>

      {searching && (
        <>
          {!tr.length && !cr.length && <div className="empty">Nada coincide con «{query}».</div>}
          {clubs.map(({ club, all, allMine }) => (
            <div key={club} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
                <Crest label={initials(club)} color={colorOf(all[0])} size={48} radius={14} font={20} />
                <div className="col minw0" style={{ flex: 1, gap: 2 }}>
                  <div className="kicker">Club</div>
                  <div style={{ font: '700 17px Archivo,sans-serif' }}>{club}</div>
                  <div className="t12m">{all.length} equipos federados · temporada 2026‑27</div>
                </div>
              </div>
              <div style={{ padding: '0 14px 12px' }}>
                <button onClick={() => followMany(all, club)} style={{ width: '100%', height: 44, borderRadius: 12, border: 'none', background: allMine ? '#E7E3D9' : '#151515', color: allMine ? '#151515' : '#fff', font: '700 14px Archivo,sans-serif', cursor: 'pointer' }}>
                  {allMine ? 'Siguiendo todo el club ✓' : '+ Añadir todos a mis equipos'}
                </button>
              </div>
              {all.map(n => {
                const G = DIR.groups[DIR.teams[n].gid];
                return (
                  <div key={n} className="hov" onClick={() => openTeam(n)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 14px', borderTop: '1px solid #EFECE4' }}>
                    <div className="col minw0" style={{ gap: 1 }}><div className="t14">{n.replace(club, '').trim() || 'Primer equipo'}</div><div className="t12m">{G.div} · {G.group}</div></div>
                    {p.mine.includes(n) && <Mine />}
                  </div>
                );
              })}
            </div>
          ))}
          {cr.length > 0 && (
            <>
              <div className="kicker" style={{ padding: '0 4px' }}>Competiciones</div>
              <div className="card">{cr.map(compRow)}</div>
            </>
          )}
          {tr.length > 0 && (
            <>
              <div className="kicker" style={{ padding: '0 4px' }}>{tr.length > 30 ? 'Equipos · mostrando 30 de ' + tr.length : tr.length + (tr.length === 1 ? ' equipo' : ' equipos')}</div>
              <div className="card">
                {tr.slice(0, 30).map(t => {
                  const G = DIR.groups[t.gid];
                  return (
                    <div key={t.name} className="row hov" onClick={() => openTeam(t.name)} style={{ padding: '11px 14px' }}>
                      <Crest label={initials(t.name)} color={colorOf(t.name)} size={38} radius={11} font={15} />
                      <div className="col minw0" style={{ flex: 1, gap: 2 }}>
                        <div className="t14 ellip">{t.name}</div>
                        <div className="t12m ellip">{G.div} · {G.group} · {G.mod}</div>
                      </div>
                      {p.mine.includes(t.name) && <Mine />}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {!searching && sections.map(sec => (
        <div key={sec.title} className="col" style={{ gap: 8 }}>
          <div className="h2" style={{ padding: '0 4px', letterSpacing: 0 }}>{sec.title}</div>
          <div className="card">{sec.comps.map(compRow)}</div>
        </div>
      ))}
    </div>
  );
}
