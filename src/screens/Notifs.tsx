import { useEffect, useState } from 'react';
import { useStore } from '../store';
import type { PrefKey } from '../store';
import { BackButton, Toggle } from '../components/ui';
import { useMyMatchViews } from './Home';

const PREF_DEFS: [PrefKey, string, string][] = [
  ['horario', 'Cambios de horario o campo', 'Al instante, en cuanto la FCF los publica'],
  ['resultados', 'Resultados y actas', 'Cuando se cierra el acta'],
  ['recordatorio', 'Recordatorio de convocatoria', '2 horas antes de la hora de llegada'],
  ['tabla', 'Movimientos en la clasificación', 'Si subís o bajáis de posición'],
];

const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  return m < 1 ? 'ahora' : m < 60 ? 'hace ' + m + ' min' : 'hace ' + Math.round(m / 60) + ' h';
};

export default function Notifs() {
  const { p, update, openMatch } = useStore();
  const { future, past } = useMyMatchViews();
  const [readAt] = useState(p.readAt);
  // Abrir la pantalla marca todo como leído; el resaltado se mantiene durante esta visita.
  useEffect(() => { update(() => ({ readAt: Date.now() })); }, [update]);

  const list = [
    ...p.notifs.map(n => ({ key: n.id, icon: '!', iconBg: '#F2C84B', iconFg: '#151515', title: n.title, text: n.text, when: ago(n.at), bg: n.at > readAt ? '#FFFBEA' : '#fff', id: n.matchId })),
    ...(future[0] ? [{ key: 'rem', icon: '⏱', iconBg: '#151515', iconFg: '#fff', title: 'Recordatorio', text: 'Convocatoria ' + future[0].callTime + ' · ' + future[0].vsLabel + ' (' + future[0].dateShort + ')', when: 'programado', bg: '#fff', id: future[0].id }] : []),
    ...past.slice(0, 4).map(m => ({ key: 'a' + m.id, icon: m.res || '', iconBg: m.resBg, iconFg: '#fff', title: 'Acta publicada', text: m.home + ' ' + m.score + ' ' + m.away, when: m.dateShort, bg: '#fff', id: m.id })),
  ];

  const toggle = (k: PrefKey) => {
    const on = !p.prefs[k];
    update(s => ({ prefs: { ...s.prefs, [k]: on } }));
    if (on && typeof Notification !== 'undefined' && Notification.permission === 'default') Notification.requestPermission();
  };

  return (
    <div className="col" style={{ gap: 16, padding: '6px 16px 0' }}>
      <BackButton style={{ alignSelf: 'flex-start' }} />
      <div className="h1" style={{ padding: '0 4px' }}>Avisos</div>
      {list.length === 0 ? <div className="empty">Sin avisos todavía.</div> : (
        <div className="card">
          {list.map(n => (
            <div key={n.key} className="row" onClick={() => openMatch(n.id)} style={{ alignItems: 'stretch', padding: 14, background: n.bg }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: n.iconBg, color: n.iconFg, display: 'flex', alignItems: 'center', justifyContent: 'center', font: "800 16px 'Barlow Condensed',sans-serif", flex: 'none' }}>{n.icon}</div>
              <div className="col minw0" style={{ flex: 1, gap: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div className="t14b">{n.title}</div>
                  <div style={{ font: '500 11px Archivo,sans-serif', color: '#8A857A', flex: 'none' }}>{n.when}</div>
                </div>
                <div style={{ font: '400 13px/1.4 Archivo,sans-serif', color: '#3B3832' }}>{n.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="h2" style={{ padding: '4px 4px 0', letterSpacing: 0 }}>Avisarme de</div>
      <div className="card">
        {PREF_DEFS.map(([k, label, sub]) => (
          <div key={k} className="row" onClick={() => toggle(k)} style={{ padding: '13px 14px' }}>
            <div className="col" style={{ flex: 1, gap: 2 }}><div className="t14">{label}</div><div className="t12m">{sub}</div></div>
            <Toggle on={p.prefs[k]} label={label} />
          </div>
        ))}
      </div>
    </div>
  );
}
