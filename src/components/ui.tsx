import type { CSSProperties, ReactNode } from 'react';
import { useStore } from '../store';
import type { Screen } from '../store';

export const Crest = ({ label, color, size, radius, font }: { label: string; color: string; size: number; radius: number; font: number }) => (
  <div className="crest" style={{ width: size, height: size, borderRadius: radius, background: color, fontSize: font }}>{label}</div>
);

export const Dot = ({ color, size = 7, radius }: { color: string; size?: number; radius?: number }) => (
  <span className="dot" style={{ width: size, height: size, background: color, borderRadius: radius ?? size / 2 }} />
);

export const ResChip = ({ r, bg, size = 22 }: { r: string; bg: string; size?: number }) => (
  <div className="res" style={{ background: bg, ...(size !== 22 ? { width: size, height: size, borderRadius: 5, fontSize: 11 } : {}) }}>{r}</div>
);

export const Toggle = ({ on, label }: { on: boolean; label?: string }) => (
  <div className="toggle" role="switch" aria-checked={on} aria-label={label}
    style={{ background: on ? '#1F8A4C' : '#CFCABD', justifyContent: on ? 'flex-end' : 'flex-start' }}>
    <span />
  </div>
);

export function Seg<K extends string>({ items, value, onPick }: { items: [K, string][]; value: K; onPick: (k: K) => void }) {
  return (
    <div className="seg" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map(([k, label]) => <button key={k} aria-pressed={value === k} onClick={() => onPick(k)}>{label}</button>)}
    </div>
  );
}

export const BackButton = ({ label = '← Atrás', dark, style }: { label?: string; dark?: 'light' | 'glass'; style?: CSSProperties }) => {
  const { back } = useStore();
  const bg = dark === 'glass' ? 'rgba(255,255,255,0.18)' : undefined;
  return <button className={'pill' + (dark === 'light' ? ' on-dark' : '')} style={{ ...(bg ? { background: bg, color: '#fff' } : {}), ...style }} onClick={back}>{label}</button>;
};

export const Stat = ({ v, k, size = 26 }: { v: ReactNode; k: string; size?: number }) => (
  <div className="col" style={{ alignItems: 'center', minWidth: 40 }}>
    <div className="num" style={{ fontSize: size, lineHeight: 1 }}>{v}</div>
    <div style={{ font: '600 10px Archivo,sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8A857A' }}>{k}</div>
  </div>
);

const TABS: { key: Screen; label: string; icon: ReactNode }[] = [
  { key: 'home', label: 'Inicio', icon: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /> },
  { key: 'agenda', label: 'Calendario', icon: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></> },
  { key: 'explore', label: 'Explorar', icon: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></> },
  { key: 'teams', label: 'Equipos', icon: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /> },
];

export const TabBar = () => {
  const { nav, tab } = useStore();
  const s = nav.screen;
  const active: Screen = s === 'agenda' ? 'agenda' : s === 'explore' || s === 'comp' ? 'explore' : s === 'teams' || s === 'team' ? 'teams' : 'home';
  return (
    <nav className="tabbar">
      {TABS.map(t => (
        <button key={t.key} onClick={() => tab(t.key)} style={{ color: active === t.key ? '#fff' : '#8A857A' }} aria-current={active === t.key ? 'page' : undefined}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
          {t.label}
        </button>
      ))}
    </nav>
  );
};

export const ToastView = () => {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="toast" key={toast.key} role="status">
      <span style={{ color: toast.kind === 'warn' ? '#F2C84B' : '#7FD39B' }}>{toast.kind === 'warn' ? '!' : '✓'}</span>{toast.msg}
    </div>
  );
};
