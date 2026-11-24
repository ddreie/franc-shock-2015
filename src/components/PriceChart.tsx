import { useMemo, useState } from 'react';
import { controlGroups, data } from '../data';

const W = 760, H = 360, M = { top: 24, right: 150, bottom: 40, left: 48 };
const SHOCK = 12; // index of Jan 2015 in the series (Jan 2014 = 0)

export default function PriceChart() {
  const [group, setGroup] = useState('Europe');
  const [hover, setHover] = useState<number | null>(null);
  const label = controlGroups.find(g => g.key === group)!.label;

  const ch = data.prices.map(p => p.Switzerland as number);
  const cg = data.prices.map(p => p[group] as number);

  const { x, y, ticks } = useMemo(() => {
    const all = [...ch, ...cg];
    const lo = Math.floor(Math.min(...all) - 0.3), hi = Math.ceil(Math.max(...all) + 0.3);
    const x = (i: number) => M.left + (i / (ch.length - 1)) * (W - M.left - M.right);
    const y = (v: number) => M.top + (1 - (v - lo) / (hi - lo)) * (H - M.top - M.bottom);
    const ticks: number[] = [];
    for (let t = lo; t <= hi; t += 1) ticks.push(t);
    return { x, y, ticks };
  }, [group]); // eslint-disable-line react-hooks/exhaustive-deps

  const path = (v: number[]) => v.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join('');
  const gapEnd = ch[ch.length - 1] - cg[cg.length - 1];
  const avgGap = ch.slice(SHOCK + 1).reduce((s, v, i) => s + v - cg[SHOCK + 1 + i], 0) / (ch.length - SHOCK - 1);

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const box = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const i = Math.round(((px - M.left) / (W - M.left - M.right)) * (ch.length - 1));
    setHover(Math.max(0, Math.min(ch.length - 1, i)));
  }

  const endLabels = [
    { text: 'Switzerland', v: ch[ch.length - 1], cls: 's1' },
    { text: 'Comparison', v: cg[cg.length - 1], cls: 's2' },
  ].sort((a, b) => b.v - a.v);
  const ly = [y(endLabels[0].v), Math.max(y(endLabels[1].v), y(endLabels[0].v) + 18)];

  return (
    <figure className="viz">
      <div className="controls">
        <label>
          Compare Switzerland with
          <select value={group} onChange={e => setGroup(e.target.value)}>
            {controlGroups.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
          </select>
        </label>
        <div className="legend">
          <span><i className="key s1" />Switzerland</span>
          <span><i className="key s2" />{label}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Consumer prices in Switzerland and ${label}, January 2014 to December 2015, January 2015 = 100`}>
        <rect x={x(SHOCK)} y={M.top} width={x(ch.length - 1) - x(SHOCK)} height={H - M.top - M.bottom} className="post" />
        {ticks.map(t => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className={t === 100 ? 'base' : 'grid'} />
            <text x={M.left - 8} y={y(t) + 4} className="tick" textAnchor="end">{t}</text>
          </g>
        ))}
        {data.prices.map((p, i) => (i % 3 === 0 ? (
          <text key={i} x={x(i)} y={H - M.bottom + 20} className="tick" textAnchor="middle">
            {(p.month as string).replace(' 20', " '")}
          </text>
        ) : null))}
        <line x1={x(SHOCK)} x2={x(SHOCK)} y1={M.top - 6} y2={H - M.bottom} className="shock" />
        <text x={x(SHOCK) + 6} y={M.top + 6} className="annot">15 Jan 2015: minimum exchange rate removed</text>

        <path d={path(cg)} className="line s2" />
        <path d={path(ch)} className="line s1" />
        {endLabels.map((l, k) => (
          <text key={l.text} x={W - M.right + 10} y={ly[k] + 4} className="endlabel">
            {l.text} {l.v.toFixed(1)}
          </text>
        ))}

        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={M.top} y2={H - M.bottom} className="cross" />
            <circle cx={x(hover)} cy={y(cg[hover])} r={4.5} className="dot s2" />
            <circle cx={x(hover)} cy={y(ch[hover])} r={4.5} className="dot s1" />
          </g>
        )}
        <rect x={M.left} y={M.top} width={W - M.left - M.right} height={H - M.top - M.bottom} fill="transparent"
          onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
      </svg>

      {hover !== null && (
        <div className="tooltip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <strong>{data.prices[hover].month}</strong>
          <div><i className="key s1" />Switzerland <b>{ch[hover].toFixed(2)}</b></div>
          <div><i className="key s2" />Comparison <b>{cg[hover].toFixed(2)}</b></div>
          <div className="muted">Gap {(ch[hover] - cg[hover]).toFixed(2)} points</div>
        </div>
      )}

      <p className="readout">
        Between February and December 2015, Swiss prices were on average <b>{Math.abs(avgGap).toFixed(1)} points
        {avgGap < 0 ? ' below' : ' above'}</b> the comparison group; by December the gap was <b>{gapEnd.toFixed(1)} points</b>.
        This raw gap is not yet the causal effect: it ignores that the two groups may have been on different paths before 2015.
      </p>
      <figcaption>
        Harmonised index of consumer prices (all items), January 2015 = 100. Shaded: after the shock.
        Comparison groups are those used in the paper. Source: Eurostat via Oktay (2022) replication package.
      </figcaption>
    </figure>
  );
}
