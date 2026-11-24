import { useMemo, useState } from 'react';
import { data, type Category } from '../data';

const groups = ['All', ...Array.from(new Set(data.categories.map(c => c.group)))];
const ALL_ITEMS = 0.12;

export default function CategoryChart() {
  const [group, setGroup] = useState('All');
  const [view, setView] = useState<'rank' | 'import'>('rank');
  const [sort, setSort] = useState<'pt' | 'name'>('pt');

  const cats = useMemo(() => {
    const c = data.categories.filter(c => c.passThrough !== null && (group === 'All' || c.group === group));
    return [...c].sort((a, b) => sort === 'pt' ? b.passThrough! - a.passThrough! : a.name.localeCompare(b.name));
  }, [group, sort]);

  const mean = cats.reduce((s, c) => s + c.passThrough!, 0) / cats.length;

  return (
    <figure className="viz">
      <div className="controls">
        <div className="seg" role="group" aria-label="Product group">
          {groups.map(g => (
            <button key={g} aria-pressed={group === g} onClick={() => setGroup(g)}>{g}</button>
          ))}
        </div>
        <div className="seg" role="group" aria-label="View">
          <button aria-pressed={view === 'rank'} onClick={() => setView('rank')}>Ranking</button>
          <button aria-pressed={view === 'import'} onClick={() => setView('import')}>Against import share</button>
        </div>
      </div>
      <p className="readout">
        <b>{cats.length}</b> product groups shown. Average pass-through: <b>{mean.toFixed(2)}</b>, i.e. a 10% stronger
        franc lowered their prices by about <b>{(mean * 10).toFixed(1)}%</b> within a year.
      </p>
      {view === 'rank' ? <Ranking cats={cats} sort={sort} setSort={setSort} /> : <Scatter cats={cats} />}
      <figcaption>
        One-year exchange-rate pass-through by product group, estimated with synthetic difference-in-differences:
        the share of the 10.07% appreciation that showed up as lower Swiss prices (1 = fully passed on, 0 = not at all).
        Values as reported by Oktay (2022); import shares from the Swiss Federal Statistical Office.
      </figcaption>
    </figure>
  );
}

function Ranking({ cats, sort, setSort }: { cats: Category[]; sort: string; setSort: (s: 'pt' | 'name') => void }) {
  const lo = Math.min(-0.35, ...cats.map(c => c.passThrough!)), hi = Math.max(0.85, ...cats.map(c => c.passThrough!));
  const pos = (v: number) => ((v - lo) / (hi - lo)) * 100;
  return (
    <>
      <div className="sortbar">
        Sort by
        <button className="link" aria-pressed={sort === 'pt'} onClick={() => setSort('pt')}>pass-through</button>
        <button className="link" aria-pressed={sort === 'name'} onClick={() => setSort('name')}>name</button>
      </div>
      <div className="bars" role="list">
        <div className="bars-axis" aria-hidden>
          <span style={{ left: `${pos(0)}%` }}>0</span>
          <span style={{ left: `${pos(ALL_ITEMS)}%` }} className="ref">All items 0.12</span>
          <span style={{ left: `${pos(0.5)}%` }}>0.5</span>
        </div>
        {cats.map(c => {
          const v = c.passThrough!;
          const a = pos(Math.min(0, v)), b = pos(Math.max(0, v));
          return (
            <div className="bar-row" role="listitem" key={c.name} title={`${c.name}: ${v.toFixed(2)}`}>
              <span className="bar-name">{c.name}</span>
              <span className="bar-track">
                <span className="zero" style={{ left: `${pos(0)}%` }} />
                <span className="refline" style={{ left: `${pos(ALL_ITEMS)}%` }} />
                <span className={`bar ${v < 0 ? 'neg' : ''}`} style={{ left: `${a}%`, width: `${Math.max(b - a, 0.4)}%` }} />
              </span>
              <span className="bar-val">{v.toFixed(2)}</span>
              <span className="bar-tip">
                <strong>{c.name}</strong><br />{c.group}<br />
                Pass-through <b>{v.toFixed(2)}</b>
                {c.importShare !== null && <><br />Import share <b>{Math.round(c.importShare * 100)}%</b></>}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Scatter({ cats }: { cats: Category[] }) {
  const pts = cats.filter(c => c.importShare !== null);
  const [hover, setHover] = useState<Category | null>(null);
  const W = 760, H = 380, M = { t: 16, r: 20, b: 46, l: 52 };
  const ylo = -0.4, yhi = 0.9;
  const x = (v: number) => M.l + v * (W - M.l - M.r);
  const y = (v: number) => M.t + (1 - (v - ylo) / (yhi - ylo)) * (H - M.t - M.b);

  // OLS of pass-through on import share (as in Table 3 of the paper, here on the signed values)
  const n = pts.length;
  const mx = pts.reduce((s, c) => s + c.importShare!, 0) / n, my = pts.reduce((s, c) => s + c.passThrough!, 0) / n;
  const sxx = pts.reduce((s, c) => s + (c.importShare! - mx) ** 2, 0);
  const b = sxx > 0 ? pts.reduce((s, c) => s + (c.importShare! - mx) * (c.passThrough! - my), 0) / sxx : 0;
  const a = my - b * mx;

  return (
    <div className="scatter">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Pass-through against import share by product group">
        {[-0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8].map(t => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} className={t === 0 ? 'base' : 'grid'} />
            <text x={M.l - 8} y={y(t) + 4} className="tick" textAnchor="end">{t.toFixed(1)}</text>
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <text key={t} x={x(t)} y={H - M.b + 20} className="tick" textAnchor="middle">{t * 100}%</text>
        ))}
        <text x={(W + M.l) / 2} y={H - 6} className="axis-title" textAnchor="middle">Share of the product that is imported</text>
        <text x={14} y={(H) / 2} className="axis-title" textAnchor="middle" transform={`rotate(-90 14 ${H / 2})`}>Pass-through</text>
        {n > 2 && <line x1={x(0)} x2={x(1)} y1={y(a)} y2={y(a + b)} className="fit" />}
        {pts.map(c => (
          <circle key={c.name} cx={x(c.importShare!)} cy={y(c.passThrough!)} r={hover === c ? 7 : 5.5}
            className="pt" onMouseEnter={() => setHover(c)} onMouseLeave={() => setHover(null)} />
        ))}
      </svg>
      {hover && (
        <div className="tooltip" style={{ left: `${(x(hover.importShare!) / W) * 100}%`, top: `${(y(hover.passThrough!) / H) * 100}%` }}>
          <strong>{hover.name}</strong>
          <div>Import share <b>{Math.round(hover.importShare! * 100)}%</b></div>
          <div>Pass-through <b>{hover.passThrough!.toFixed(2)}</b></div>
        </div>
      )}
      <p className="readout">
        Fitted line: moving from a purely domestic product (0%) to a fully imported one (100%) goes with a pass-through
        that is <b>{b.toFixed(2)}</b> higher ({n} product groups with import data). This is a correlation across products,
        not a causal effect of importing.
      </p>
    </div>
  );
}
