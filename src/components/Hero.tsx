import { useReveal } from '../useReveal';
import { data } from '../data';

const W = 760, H = 300, M = { top: 26, right: 96, bottom: 34, left: 44 };
const FLOOR = 1.2;

/** Station 01: the EUR/CHF rate draws itself onto the 1.20 floor and breaks off in January 2015. */
export default function Hero() {
  const [ref, inView] = useReveal<HTMLDivElement>(0.1);
  const fx = data.fx;
  const n = fx.length;
  const lo = 1.0, hi = 1.25;
  const x = (i: number) => M.left + (i / (n - 1)) * (W - M.left - M.right);
  const y = (v: number) => M.top + (1 - (v - lo) / (hi - lo)) * (H - M.top - M.bottom);
  const path = fx.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.rate).toFixed(1)}`).join('');
  const jan15 = fx.findIndex(p => p.month === '2015-01');
  const a = data.allItems;

  return (
    <header className="hero wrap" id="shock">
      <p className="eyebrow">01 — The shock · <b>Franc Shock 2015</b>, a replication of Oktay (2022)</p>
      <div className="date">15.01.2015</div>
      <h1>The franc jumped overnight. <em>Swiss prices barely followed.</em></h1>
      <p className="lede">
        That morning the Swiss National Bank dropped its promise to keep one euro worth at least 1.20 francs.
        Everything bought in euros became cheaper at a stroke. How much of that reached Swiss shoppers?
      </p>

      <div ref={ref} className={`fig ${inView ? 'in' : ''}`} style={{ marginTop: 34 }}>
        <div className="fig-head"><span className="fig-title">Francs per euro, monthly average</span></div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="EUR/CHF exchange rate 2014 to 2015: flat just above 1.20, then a drop to around 1.05 after January 2015">
          {[1.0, 1.05, 1.1, 1.15, 1.2, 1.25].map(t => (
            <g key={t}>
              <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className="grid" />
              <text x={M.left - 8} y={y(t) + 4} className="tick" textAnchor="end">{t.toFixed(2)}</text>
            </g>
          ))}
          <line x1={M.left} x2={x(jan15)} y1={y(FLOOR)} y2={y(FLOOR)} className="floor" />
          <text x={M.left + 4} y={y(FLOOR) + 16} className="annot">minimum rate 1.20, defended since 2011</text>
          <line x1={x(jan15)} x2={x(jan15)} y1={M.top - 10} y2={H - M.bottom} className="shock" />
          <path d={path} pathLength={1} className="line ch draw" />
          <g className="fade d1">
            <text x={x(jan15) + 8} y={M.top - 2} className="annot red">floor removed</text>
            <circle cx={x(n - 1)} cy={y(fx[n - 1].rate)} r={4} fill="#d52b1e" />
            <text x={x(n - 1) + 10} y={y(fx[n - 1].rate) + 4} className="annot">{fx[n - 1].rate.toFixed(3)}</text>
            <text x={x(0)} y={y(fx[0].rate) - 10} className="annot muted">{fx[0].rate.toFixed(3)}</text>
          </g>
          {fx.map((p, i) => (p.month.endsWith('-01') || p.month.endsWith('-07')) && (
            <text key={p.month} x={x(i)} y={H - M.bottom + 20} className="tick" textAnchor="middle">
              {p.month.endsWith('-01') ? 'Jan' : 'Jul'} {p.month.slice(2, 4)}
            </text>
          ))}
        </svg>
        <div className="stats fade d2">
          <div className="stat"><div className="n">−10.1%</div><div className="l">change in the EUR/CHF rate, 14 Jan to 31 Dec 2015 (1.201 → 1.080)</div></div>
          <div className="stat"><div className="n red">{a.pt.toFixed(2)}</div><div className="l">pass-through: about 12% of the shock showed up in consumer prices within a year</div></div>
          <div className="stat"><div className="n">{data.summary['Categories reproduced to +-0.01 (synthetic DID)']}/85</div><div className="l">of the paper’s estimates we reproduced from the raw data</div></div>
        </div>
        <p className="caption">Monthly averages. Source: Swiss National Bank (data.snb.ch, cube devkum). The −10.07% used for the pass-through compares the rate on 14 January and 31 December 2015, as in the paper.</p>
      </div>
    </header>
  );
}
