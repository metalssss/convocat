import { DIR, SAMPLE_URL, parseFcfUrl } from '../data/league';
import { useStore } from '../store';

export default function Add() {
  const { add, setAdd, startImport, confirmImport, tab, back } = useStore();
  const IG = add.gid ? DIR.groups[add.gid] : null;

  const submit = () => {
    const url = add.url.trim() || SAMPLE_URL;
    const r = parseFcfUrl(url);
    if ('error' in r) setAdd(a => ({ ...a, url, error: r.error }));
    else startImport(r.gid, url);
  };

  const loadLines = IG ? ['Conectando con fcf.cat', IG.div + ' · ' + IG.group, IG.teams.length + ' equipos detectados', (IG.teams.length - 1) * 2 + ' jornadas, campos y horarios'].slice(0, add.loadN) : [];

  return (
    <div className="col" style={{ gap: 18, padding: '6px 16px 0' }}>
      <button className="pill" style={{ alignSelf: 'flex-start' }} onClick={back}>← Cancelar</button>
      <div className="col" style={{ gap: 6, padding: '0 4px' }}>
        <div className="h1">Añadir competición</div>
        <div style={{ font: '400 14px/1.45 Archivo,sans-serif', color: '#5E5A51' }}>Pega el enlace de calendario, clasificación o resultados de fcf.cat.</div>
      </div>

      {add.step === 'input' && (
        <form className="col" style={{ gap: 12 }} onSubmit={e => { e.preventDefault(); submit(); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '6px 6px 6px 14px', display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid #151515' }}>
            <input type="url" inputMode="url" autoComplete="off" value={add.url} onChange={e => setAdd(a => ({ ...a, url: e.target.value, error: null }))} placeholder="https://www.fcf.cat/competicio/…"
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', font: '500 16px Archivo,sans-serif', color: '#151515', height: 40 }} />
            <button type="button" onClick={() => setAdd(a => ({ ...a, url: SAMPLE_URL, error: null }))} style={{ height: 36, padding: '0 12px', borderRadius: 10, border: 'none', background: '#E7E3D9', font: '600 12px Archivo,sans-serif', color: '#151515', cursor: 'pointer', whiteSpace: 'nowrap' }}>Pegar ejemplo</button>
          </div>
          {add.error && (
            <div className="col" style={{ background: '#FBE9E5', borderRadius: 16, padding: 14, gap: 10 }}>
              <div className="col" style={{ gap: 2 }}>
                <div style={{ font: '700 14px Archivo,sans-serif', color: '#9E2A1C' }}>{add.error}</div>
                <div style={{ font: '400 13px/1.4 Archivo,sans-serif', color: '#5E3A33' }}>Busca tu equipo por nombre y lo añadimos igual.</div>
              </div>
              <button type="button" onClick={() => tab('explore')} style={{ height: 44, borderRadius: 12, border: 'none', background: '#151515', color: '#fff', font: '600 14px Archivo,sans-serif', cursor: 'pointer' }}>Buscar equipo →</button>
            </div>
          )}
          <button type="submit" className="btn hot">Importar</button>
          <button type="button" className="link" onClick={() => tab('explore')} style={{ color: '#5E5A51', padding: 6 }}>¿No tienes el enlace? Buscar equipo →</button>
        </form>
      )}

      {add.step === 'loading' && (
        <div className="col" style={{ background: '#151515', color: '#fff', borderRadius: 20, padding: 18, gap: 12 }}>
          <div style={{ font: '500 11px ui-monospace,Menlo,monospace', color: '#8A857A', wordBreak: 'break-all' }}>{add.url}</div>
          {loadLines.map(l => (
            <div key={l} style={{ display: 'flex', gap: 10, alignItems: 'center', font: '500 14px Archivo,sans-serif' }}><span style={{ color: '#7FD39B', fontWeight: 700 }}>✓</span>{l}</div>
          ))}
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: add.loadN * 25 + '%', background: '#F2C84B', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}

      {add.step === 'pick' && IG && (
        <div className="col" style={{ gap: 12 }}>
          <div className="col" style={{ background: '#151515', color: '#fff', borderRadius: 18, padding: '14px 16px', gap: 2 }}>
            <div style={{ font: '700 16px Archivo,sans-serif' }}>{IG.div} · {IG.group}</div>
            <div style={{ font: '400 13px Archivo,sans-serif', color: '#A39E92' }}>{IG.teams.length} equipos · {IG.mod} · {IG.cat}</div>
          </div>
          <div className="h2" style={{ padding: '0 4px', letterSpacing: 0 }}>¿Cuál es tu equipo?</div>
          <div className="card" role="radiogroup">
            {IG.teams.map(n => {
              const on = add.pick === n;
              return (
                <div key={n} role="radio" aria-checked={on} className="row" onClick={() => setAdd(a => ({ ...a, pick: n }))} style={{ justifyContent: 'space-between', padding: '13px 14px', background: on ? '#F3F1EA' : '#fff' }}>
                  <div className="t14">{n}</div>
                  <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${on ? '#151515' : '#CFCABD'}`, background: on ? '#151515' : 'transparent' }} />
                </div>
              );
            })}
          </div>
          <button className="btn" disabled={!add.pick} onClick={confirmImport} style={{ background: add.pick ? '#151515' : '#BDB7A9' }}>Añadir a mis equipos</button>
        </div>
      )}
    </div>
  );
}
