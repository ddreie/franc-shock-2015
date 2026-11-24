import { useState } from 'react';
import { data } from '../data';

const W = 760, H = 340, M = { top: 20, right: 190, bottom: 36, left: 48 };
const GROUP_ORDER = ['Goods, high import share', 'Goods, low import share', 'Services (nothing imported)'];
const GROUP_CLASS: Record<string, string> = {
  'Goods, high import share': 'g1', 'Goods, low import share': 'g2', 'Services (nothing imported)': 'g3',
};

export default function SpeedChart() {
  const [view, setView] = useState<'groups' | 'all'>('groups');
  const [hover, setHover] = useState<number | null>(null);
  const s = data.speed;
  const n = s.months.length;

  const all = s.allItems;
  const groups = GROUP_ORDER.filter(g => s.groups[g]).map(g => ({ g, ...s.groups[g] }));
  const vals = view === 'all' ? all.flatMap(p => [p.pt - 1.96 * p.se, p.pt + 1.96 * p.se]) : groups.flatMap(x => x.values);
  const lo = Math.min(-0.1, Math.floor(Math.min(...vals) * 10) / 10), hi = Math.max(0.3, Math.ceil(Math.max(...vals) * 10) / 10);
  const x = (i: number) => M.left + (i / (n - 1)) * (W - M.left - M.right);
  const y = (v: number) => M.top + (1 - (v - lo) / (hi - lo)) * (H - M.top - M.bottom);
  const path = (v: number[]) => v.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join('');
  const ticks: number[] = []; for (let t = lo; t <= hi + 1e-9; t += 0.1) ticks.push(Math.round(t * 10) / 10);

  const early = (v: number[]) => (v[0] + v[1] + v[2]) / 3, late = (v: number[]) => (v[n - 3] + v[n - 2] + v[n - 1]) / 3;

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const box = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    setHover(Math.max(0, Math.min(n - 1, Math.round(((px - M.left) / (W - M.left - M.right)) * (n - 1)))));
  }

  // end labels, nudged apart
  const ends = (view === 'all' ? [{ label: 'All items', v: all[n - 1].pt, cls: 'ch' }]
    : groups.map(gr => ({ label: gr.g, v: gr.values[n - 1], cls: GROUP_CLASS[gr.g] }))).sort((a, b) => y(a.v) - y(b.v));
  let last = -Infinity; const ly = ends.map(e => { const p = Math.max(y(e.v), last + 16); last = p; return p; });

  return (
    <figure className="fig">
      <div className="fig-head">
        <span className="fig-title">How fast? Pass-through month by month</span>
        <div className="seg" role="group" aria-label="View">
          <button aria-pressed={view === 'groups'} onClick={() => setView('groups')}>By import share</button>
          <button aria-pressed={view === 'all'} onClick={() => setView('all')}>All items, with uncertainty</button>
        </div>
        {view === 'groups' && (
          <div className="legend">
            {groups.map(gr => <span key={gr.g}><i className={`key ${GROUP_CLASS[gr.g]}`} />{gr.g} ({gr.n})</span>)}
          </div>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Monthly pass-through after the 2015 appreciation">
        {ticks.map(t => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className={t === 0 ? 'base' : 'grid'} />
            <text x={M.left - 8} y={y(t) + 4} className="tick" textAnchor="end">{t.toFixed(1)}</text>
          </g>
        ))}
        {s.months.map((m, i) => (i % 2 === 0 ? <text key={m} x={x(i)} y={H - M.bottom + 20} className="tick" textAnchor="middle">{m.slice(0, 3)}</text> : null))}
        {view === 'all' ? (
          <>
            <path className="band" d={`${path(all.map(p => p.pt + 1.96 * p.se))}L${[...all].reverse().map((p, k) => `${x(n - 1 - k).toFixed(1)},${y(p.pt - 1.96 * p.se).toFixed(1)}`).join('L')}Z`} />
            <line x1={M.left} x2={W - M.right} y1={y(data.allItems.pt)} y2={y(data.allItems.pt)} className="shock" />
            <text x={M.left + 6} y={y(data.allItems.pt) - 6} className="annot">1-year average {data.allItems.pt.toFixed(2)}</text>
            <path d={path(all.map(p => p.pt))} className="line ch" />
          </>
        ) : groups.map(gr => <path key={gr.g} d={path(gr.values)} className={`line ${GROUP_CLASS[gr.g]}`} />)}
        {ends.map((e, k) => <text key={e.label} x={W - M.right + 10} y={ly[k] + 4} className="endlabel">{e.label.replace(' (nothing imported)', '')}</text>)}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={M.top} y2={H - M.bottom} className="cross" pointerEvents="none" />}
        <rect x={M.left} y={M.top} width={W - M.left - M.right} height={H - M.top - M.bottom} fill="transparent"
          onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
      </svg>
      {hover !== null && (
        <div className="tooltip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <strong>{s.months[hover]}</strong>
          {view === 'all'
            ? <div>All items <b>{all[hover].pt.toFixed(2)}</b> <span className="muted">± {(1.96 * all[hover].se).toFixed(2)}</span></div>
            : groups.map(gr => <div key={gr.g}><i className={`key ${GROUP_CLASS[gr.g]}`} />{gr.g} <b>{gr.values[hover].toFixed(2)}</b></div>)}
        </div>
      )}
      <p className="readout">
        {view === 'all'
          ? <>For the whole basket, pass-through was <b>{early(all.map(p => p.pt)).toFixed(2)}</b> in February–April and <b>{late(all.map(p => p.pt)).toFixed(2)}</b> in October–December 2015. The shaded band (95%) shows how uncertain a single month is.</>
          : <>February–April: {groups.map((gr, k) => <span key={gr.g}>{k ? ', ' : ''}{gr.g.toLowerCase()} <b>{early(gr.values).toFixed(2)}</b></span>)}.
            October–December: {groups.map((gr, k) => <span key={gr.g}>{k ? ', ' : ''}<b>{late(gr.values).toFixed(2)}</b></span>)}.
            Imported goods got cheaper right away; the rest caught up during the year, so by December the gap had closed.</>}
      </p>
      <p className="caption">
        Monthly pass-through after the shock (our extension): synthetic difference-in-differences effect in each month, using the weights of the
        main estimate, divided by the 10.07% appreciation. Groups: services (import share 0) and goods below/above the median import share among
        goods ({Math.round(s.medianImportShare * 100)}%). Import shares: Swiss Federal Statistical Office. Source: our replication.
      </p>
    </figure>
  );
}
