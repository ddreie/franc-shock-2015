import { useState } from 'react';
import { controlGroups, data } from '../data';
import { useReveal } from '../useReveal';

const W = 760, H = 380, M = { top: 24, right: 120, bottom: 36, left: 44 };
const SHOCK = 12; // Jan 2015
const DASH: Record<string, string> = {
  'Europe': '', 'Eurozone': '8 4', 'EU': '2 3', 'Direct neighbours': '10 3 2 3',
  'Germanic': '1 4', 'Non-EUR': '5 2', 'High Gdp': '12 4 4 4',
};

/** Station 02 (cf. Fig. 1–2 of the paper): Switzerland against every comparison group the paper uses. */
export default function PriceChart() {
  const [shown, setShown] = useState<Record<string, boolean>>(Object.fromEntries(controlGroups.map(g => [g.key, true])));
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [ref, inView] = useReveal<HTMLElement>();

  const hl = hoverGroup ?? 'Europe';
  const prices = data.prices;
  const n = prices.length;
  const ch = prices.map(p => p.Switzerland as number);
  const series = controlGroups.filter(g => shown[g.key]).map(g => ({ ...g, v: prices.map(p => p[g.key] as number) }));
  const lo = 98.5, hi = 103;
  const x = (i: number) => M.left + (i / (n - 1)) * (W - M.left - M.right);
  const y = (v: number) => M.top + (1 - (v - lo) / (hi - lo)) * (H - M.top - M.bottom);
  const path = (v: number[]) => v.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join('');
  const hlSeries = series.find(s => s.key === hl);
  const hlLabel = controlGroups.find(g => g.key === hl)!.label;

  const endGap = hlSeries ? ch[n - 1] - hlSeries.v[n - 1] : null;
  const gaps = series.map(s => s.v[n - 1] - ch[n - 1]);

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const box = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W, py = ((e.clientY - box.top) / box.height) * H;
    const i = Math.max(0, Math.min(n - 1, Math.round(((px - M.left) / (W - M.left - M.right)) * (n - 1))));
    setHover(i);
    // highlight the comparison line nearest to the pointer
    let best: string | null = null, bd = 14;
    for (const s of series) { const d = Math.abs(y(s.v[i]) - py); if (d < bd) { bd = d; best = s.key; } }
    setHoverGroup(best);
  }

  return (
    <figure ref={ref} className={`fig ${inView ? 'in' : ''}`}>
      <div className="fig-head">
        <span className="fig-title">Consumer prices, all items (January 2015 = 100)</span>
      </div>
      <div className="chips" role="group" aria-label="Comparison groups" style={{ marginBottom: 10 }}>
        <span className="chip fixed"><svg width="22" height="6"><line x1="0" x2="22" y1="3" y2="3" stroke="#d52b1e" strokeWidth="3" /></svg>Switzerland</span>
        {controlGroups.map(g => (
          <button key={g.key} className={`chip ${hl === g.key && shown[g.key] ? 'hl' : ''}`} aria-pressed={shown[g.key]}
            onClick={() => setShown(s => ({ ...s, [g.key]: !s[g.key] }))} title={g.label}
            onMouseEnter={() => setHoverGroup(g.key)} onMouseLeave={() => setHoverGroup(null)}>
            <svg width="22" height="6"><line x1="0" x2="22" y1="3" y2="3" stroke={hl === g.key ? '#2a5d9f' : '#85837b'} strokeWidth="2" strokeDasharray={DASH[g.key]} /></svg>
            {g.short}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Consumer prices in Switzerland and seven European comparison groups, 2014 to 2015">
        <rect x={x(SHOCK)} y={M.top} width={x(n - 1) - x(SHOCK)} height={H - M.top - M.bottom} className="post" />
        {[99, 100, 101, 102, 103].map(t => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className={t === 100 ? 'base' : 'grid'} />
            <text x={M.left - 8} y={y(t) + 4} className="tick" textAnchor="end">{t}</text>
          </g>
        ))}
        {prices.map((p, i) => (i % 6 === 0 || i === n - 1) && (
          <text key={i} x={x(i)} y={H - M.bottom + 20} className="tick" textAnchor="middle">{(p.month as string).replace(' 20', " '")}</text>
        ))}
        <line x1={x(SHOCK)} x2={x(SHOCK)} y1={M.top - 8} y2={H - M.bottom} className="shock" />
        <text x={x(SHOCK) + 6} y={M.top + 4} className="annot">franc floor removed</text>

        <g className="fade d1">
          {series.map(s => (
            <path key={s.key} d={path(s.v)} strokeDasharray={DASH[s.key] || undefined}
              className={`line grey ${s.key === hl ? 'hl' : hoverGroup ? 'dim' : ''}`} />
          ))}
        </g>
        <path d={path(ch)} pathLength={1} className="line ch draw" />
        {hlSeries && <text x={W - M.right + 10} y={y(hlSeries.v[n - 1]) + 4} className="endlabel" fill="#2a5d9f">{hlSeries.label.split(' (')[0]}</text>}
        <text x={W - M.right + 10} y={y(ch[n - 1]) + 4} className="endlabel" style={{ fill: '#d52b1e' }}>Switzerland</text>

        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={M.top} y2={H - M.bottom} className="cross" />
            {hlSeries && <circle cx={x(hover)} cy={y(hlSeries.v[hover])} r={4.5} className="dot" fill="#2a5d9f" />}
            <circle cx={x(hover)} cy={y(ch[hover])} r={4.5} className="dot" fill="#d52b1e" />
          </g>
        )}
        <rect x={M.left} y={M.top} width={W - M.left - M.right} height={H - M.top - M.bottom} fill="transparent"
          onMouseMove={onMove} onMouseLeave={() => { setHover(null); setHoverGroup(null); }} />
      </svg>

      {hover !== null && (
        <div className="tooltip" style={{ left: `${(x(hover) / W) * 100}%`, top: 120 }}>
          <strong>{prices[hover].month}</strong>
          <div><span className="sw" style={{ background: '#d52b1e' }} />Switzerland<b>{ch[hover].toFixed(2)}</b></div>
          {hlSeries && <div><span className="sw" style={{ background: '#2a5d9f' }} />{hlSeries.label.split(' (')[0]}<b>{hlSeries.v[hover].toFixed(2)}</b></div>}
        </div>
      )}

      <p className="readout">
        {series.length > 0 ? <>
          By December 2015, Swiss prices were <b>{Math.min(...gaps).toFixed(1)}</b> to <b>{Math.max(...gaps).toFixed(1)}</b> points below
          the {series.length} comparison group{series.length > 1 ? 's' : ''} shown
          {endGap !== null && <> ({hlLabel.split(' (')[0]}: <b>{Math.abs(endGap).toFixed(1)}</b>)</>}. Whatever the comparison, the break comes right after January 2015.
        </> : <>Switch on a comparison group to compare.</>}
      </p>
      <p className="caption">
        Harmonised index of consumer prices, all items. Hover over a line or a label to highlight a group; click a label to show or hide it.
        The comparison groups are those of the paper (Table 1 and Fig. 2); group averages computed by us, the GDP-weighted Europe line is the author’s aggregate. Source: Eurostat, via the replication package of Oktay (2022).
      </p>
    </figure>
  );
}
