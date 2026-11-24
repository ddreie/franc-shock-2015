import { useMemo, useState } from 'react';
import { data, type Category } from '../data';

const groups = ['All', ...Array.from(new Set(data.categories.map(c => c.group)))];
const ALL_ITEMS = data.allItems.pt;
type View = 'rank' | 'import' | 'trade' | 'table';

/** Station 05, part 2 (cf. Tables 5–8, Fig. 5–6): pass-through for every product category. */
export default function CategoryChart() {
  const [group, setGroup] = useState('All');
  const [view, setView] = useState<View>('rank');
  const cats = useMemo(() => data.categories.filter(c => c.passThrough !== null && (group === 'All' || c.group === group)), [group]);
  const mean = cats.reduce((s, c) => s + c.passThrough!, 0) / cats.length;

  return (
    <figure className="fig">
      <div className="fig-head">
        <span className="fig-title">Pass-through by product category</span>
        <div className="seg" role="group" aria-label="View">
          <button aria-pressed={view === 'rank'} onClick={() => setView('rank')}>Ranking</button>
          <button aria-pressed={view === 'import'} onClick={() => setView('import')}>vs. import share</button>
          <button aria-pressed={view === 'trade'} onClick={() => setView('trade')}>vs. tradability</button>
          <button aria-pressed={view === 'table'} onClick={() => setView('table')}>Table</button>
        </div>
      </div>
      <div className="chips" role="group" aria-label="Product group" style={{ marginBottom: 6 }}>
        {groups.map(g => <button key={g} className="chip" aria-pressed={group === g} onClick={() => setGroup(g)}>{g}</button>)}
      </div>
      <p className="readout" style={{ marginBottom: 10 }}>
        <b>{cats.length}</b> categories. Average pass-through <b>{mean.toFixed(2)}</b>: a 10% stronger franc made them about
        <b> {(mean * 10).toFixed(1)}%</b> cheaper within a year.
      </p>
      {view === 'rank' && <Ranking cats={cats} />}
      {view === 'import' && <Scatter cats={cats} xKey="importShare" />}
      {view === 'trade' && <Scatter cats={cats} xKey="tradability" />}
      {view === 'table' && <CatTable cats={cats} />}
      <p className="caption">
        One-year pass-through from synthetic difference-in-differences, per category (our replication; the paper’s values in the tooltip and table).
        Import shares: Swiss Federal Statistical Office. Tradability: BLS index of Johnson (2017), as used in the paper, on a log scale.
        Cross-category lines are correlations, not causal effects.
      </p>
    </figure>
  );
}

function Ranking({ cats }: { cats: Category[] }) {
  const [sort, setSort] = useState<'pt' | 'name'>('pt');
  const sorted = [...cats].sort((a, b) => sort === 'pt' ? b.passThrough! - a.passThrough! : a.name.localeCompare(b.name));
  const lo = -0.35, hi = 0.85;
  const pos = (v: number) => ((v - lo) / (hi - lo)) * 100;
  return (
    <>
      <div className="sortbar">sort by
        <button className="link" aria-pressed={sort === 'pt'} onClick={() => setSort('pt')}>pass-through</button>
        <button className="link" aria-pressed={sort === 'name'} onClick={() => setSort('name')}>name</button>
      </div>
      <div className="bars" role="list">
        <div className="bars-axis" aria-hidden>
          <span style={{ left: `${pos(0)}%` }}>0</span>
          <span className="ref" style={{ left: `${pos(ALL_ITEMS)}%`, transform: 'translateX(-10%)' }}>all items {ALL_ITEMS.toFixed(2)}</span>
          <span style={{ left: `${pos(0.5)}%` }}>0.5</span>
        </div>
        {sorted.map(c => {
          const v = c.passThrough!, a = pos(Math.min(0, v)), b = pos(Math.max(0, v));
          return (
            <div className="bar-row" role="listitem" key={c.name}>
              <span className="bar-name">{c.name}</span>
              <span className="bar-track">
                <span className="zero" style={{ left: `${pos(0)}%` }} />
                <span className="refline" style={{ left: `${pos(ALL_ITEMS)}%` }} />
                <span className={`bar ${v < 0 ? 'neg' : ''}`} style={{ left: `${a}%`, width: `${Math.max(b - a, 0.4)}%` }} />
              </span>
              <span className="bar-val">{v.toFixed(2)}</span>
              <span className="bar-tip">
                <strong>{c.name}</strong><br />{c.group}<br />Ours <b>{v.toFixed(2)}</b>
                {c.paperPassThrough !== null && <> · paper <b>{c.paperPassThrough.toFixed(2)}</b></>}
                {c.importShare !== null && <><br />Import share {Math.round(c.importShare * 100)}%</>}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Scatter({ cats, xKey }: { cats: Category[]; xKey: 'importShare' | 'tradability' }) {
  const [hover, setHover] = useState<Category | null>(null);
  const isTrade = xKey === 'tradability';
  const tx = (v: number) => isTrade ? Math.log1p(v) : v;
  const xmax = isTrade ? Math.log1p(800) : 1;
  const pts = cats.filter(c => c[xKey] !== null);
  const W = 760, H = 380, M = { t: 16, r: 20, b: 46, l: 52 };
  const ylo = -0.4, yhi = 0.9;
  const x = (v: number) => M.l + (tx(v) / xmax) * (W - M.l - M.r);
  const y = (v: number) => M.t + (1 - (v - ylo) / (yhi - ylo)) * (H - M.t - M.b);
  const n = pts.length;
  const mx = pts.reduce((s, c) => s + tx(c[xKey]!), 0) / n, my = pts.reduce((s, c) => s + c.passThrough!, 0) / n;
  const sxx = pts.reduce((s, c) => s + (tx(c[xKey]!) - mx) ** 2, 0);
  const b = sxx > 0 ? pts.reduce((s, c) => s + (tx(c[xKey]!) - mx) * (c.passThrough! - my), 0) / sxx : 0;
  const a = my - b * mx;
  const xticks = isTrade ? [0, 1, 10, 100, 700] : [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Pass-through against ${isTrade ? 'tradability' : 'import share'} by category`}>
        {[-0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8].map(t => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} className={t === 0 ? 'base' : 'grid'} />
            <text x={M.l - 8} y={y(t) + 4} className="tick" textAnchor="end">{t.toFixed(1)}</text>
          </g>
        ))}
        {xticks.map(t => <text key={t} x={x(t)} y={H - M.b + 20} className="tick" textAnchor="middle">{isTrade ? t : `${t * 100}%`}</text>)}
        <text x={(W + M.l) / 2} y={H - 6} className="axis-title" textAnchor="middle">
          {isTrade ? 'How internationally traded the product is (log scale)' : 'Share of the product that is imported'}
        </text>
        <text x={14} y={H / 2} className="axis-title" textAnchor="middle" transform={`rotate(-90 14 ${H / 2})`}>Pass-through</text>
        {n > 2 && <line x1={M.l} x2={W - M.r} y1={y(a)} y2={y(a + b * xmax)} className="fit" />}
        {pts.map(c => (
          <circle key={c.name} cx={x(c[xKey]!)} cy={y(c.passThrough!)} r={hover === c ? 7 : 5}
            className="pt" onMouseEnter={() => setHover(c)} onMouseLeave={() => setHover(null)} />
        ))}
      </svg>
      {hover && (
        <div className="tooltip" style={{ left: `${(x(hover[xKey]!) / W) * 100}%`, top: `${(y(hover.passThrough!) / H) * 100 - 22}%` }}>
          <strong>{hover.name}</strong>
          {isTrade ? <>Tradability<b>{hover.tradability!.toFixed(1)}</b></> : <>Import share<b>{Math.round(hover.importShare! * 100)}%</b></>}
          <br />Pass-through<b>{hover.passThrough!.toFixed(2)}</b>
        </div>
      )}
      <p className="readout">
        {n} categories with data. The red line is the best straight-line fit: {isTrade
          ? (Math.abs(b) < 0.02
            ? <>it is almost flat (slope <b>{b.toFixed(3)}</b> per log point). On its own, how widely a product is traded says little about its pass-through; import shares do better.</>
            : <>the slope is <b>{b.toFixed(3)}</b> per log point of tradability.</>)
          : <>going from a purely domestic (0%) to a fully imported product (100%) goes with a pass-through that is <b>{b.toFixed(2)}</b> higher.</>}
      </p>
    </div>
  );
}

type SortKey = 'name' | 'group' | 'passThrough' | 'paperPassThrough' | 'importShare' | 'tradability';
function CatTable({ cats }: { cats: Category[] }) {
  const [key, setKey] = useState<SortKey>('passThrough');
  const [asc, setAsc] = useState(false);
  const sorted = [...cats].sort((a, b) => {
    const va = a[key], vb = b[key];
    if (va === null) return 1;
    if (vb === null) return -1;
    const r = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number);
    return asc ? r : -r;
  });
  const th = (k: SortKey, label: string, num = false) => (
    <th className={`sortable ${num ? 'num' : ''} ${key === k ? 'sorted' : ''}`}
      onClick={() => { if (key === k) setAsc(!asc); else { setKey(k); setAsc(k === 'name' || k === 'group'); } }}>
      {label}{key === k ? (asc ? ' ↑' : ' ↓') : ''}
    </th>
  );
  const f = (v: number | null, d = 2) => v === null ? '–' : v.toFixed(d).replace('-', '−');
  return (
    <div className="table-wrap cat-table">
      <table>
        <thead><tr>{th('name', 'Category')}{th('group', 'Group')}{th('passThrough', 'Ours', true)}{th('paperPassThrough', 'Paper', true)}{th('importShare', 'Imported', true)}{th('tradability', 'Tradability', true)}</tr></thead>
        <tbody>
          {sorted.map(c => (
            <tr key={c.name}>
              <td>{c.name}</td><td style={{ color: '#85837b' }}>{c.group}</td>
              <td className="num">{f(c.passThrough)}</td><td className="num" style={{ color: '#85837b' }}>{f(c.paperPassThrough)}</td>
              <td className="num">{c.importShare === null ? '–' : `${Math.round(c.importShare * 100)}%`}</td>
              <td className="num">{f(c.tradability, 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
