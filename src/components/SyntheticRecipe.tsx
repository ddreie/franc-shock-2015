import { useState } from 'react';
import { data } from '../data';
import { useReveal } from '../useReveal';

const W = 760, H = 330, M = { top: 20, right: 150, bottom: 64, left: 44 };
const T0 = 13; // Jan 2014 – Jan 2015 are pre-treatment
const SHORT: Record<string, string> = { 'Czech Republic': 'Czechia', 'United Kingdom': 'UK', 'North Macedonia': 'N. Maced.' };

/** Station 03 (cf. Fig. 4): how the synthetic Switzerland is mixed, and why it is a fairer comparison than a plain average. */
export default function SyntheticRecipe() {
  const [view, setView] = useState<'synthetic' | 'europe'>('synthetic');
  const [tip, setTip] = useState<string | null>(null);
  const [ref, inView] = useReveal<HTMLElement>();
  const s = data.synth;
  const ch = s.switzerland;
  const europe = data.prices.map(p => p.Europe as number);
  const comp = view === 'synthetic' ? s.synthetic : europe;
  const n = ch.length;

  const preFit = (v: number[]) => v.slice(0, T0).reduce((a, x, i) => a + Math.abs(x - ch[i]), 0) / T0;
  const fitSynth = preFit(s.synthetic), fitEurope = preFit(europe);

  const lo = 98.5, hi = 102.5;
  const x = (i: number) => M.left + (i / (n - 1)) * (W - M.left - M.right);
  const y = (v: number) => M.top + (1 - (v - lo) / (hi - lo)) * (H - M.top - M.bottom);
  const path = (v: number[]) => v.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join('');
  const lamBase = H - 8, lamMax = 22;
  const labels = data.prices.map(p => p.month as string);

  const top = s.weights.slice(0, 6);
  const rest = s.weights.length - top.length;
  const pct = (w: number) => `${(w * 100).toFixed(1)}%`;

  return (
    <figure ref={ref} className={`fig ${inView ? 'in' : ''}`}>
      <div className="fig-head"><span className="fig-title">The recipe</span></div>
      <p className="formula">
        <span className="lhs">Synthetic Switzerland</span> ={' '}
        {top.map((w, i) => <span key={w.country}>{i ? ' + ' : ''}<span className="w">{pct(w.weight)}</span> {w.country}</span>)}
        {' '}+ {rest} more countries
      </p>
      <div className="recipe" onMouseLeave={() => setTip(null)}>
        {s.weights.map(w => (
          <div key={w.country} style={{ flexGrow: inView ? w.weight : 0.0001 }} onMouseEnter={() => setTip(`${w.country}: ${pct(w.weight)}`)}>
            {w.weight > 0.055 && <span>{SHORT[w.country] ?? w.country}</span>}
          </div>
        ))}
      </div>
      <div className="recipe-tip">{tip ?? `${s.weights.length} countries, weights add up to 100%. Hover to see each one.`}</div>

      <div className="fig-head" style={{ marginTop: 26 }}>
        <span className="fig-title">Does the mix track Switzerland before the shock?</span>
        <div className="seg" role="group" aria-label="Comparison">
          <button aria-pressed={view === 'synthetic'} onClick={() => setView('synthetic')}>Synthetic Switzerland</button>
          <button aria-pressed={view === 'europe'} onClick={() => setView('europe')}>Plain European average</button>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Switzerland compared with its synthetic control or the European average, 2014 to 2015">
        <rect x={x(0)} y={M.top} width={x(T0 - 1) - x(0)} height={H - M.top - M.bottom} fill="#efede7" />
        <text x={x(0) + 6} y={M.top + 14} className="annot muted">before the shock: the mix is fitted here</text>
        {[99, 100, 101, 102].map(t => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} className={t === 100 ? 'base' : 'grid'} />
            <text x={M.left - 8} y={y(t) + 4} className="tick" textAnchor="end">{t}</text>
          </g>
        ))}
        {labels.map((m, i) => (i % 6 === 0 || i === n - 1) && (
          <text key={m} x={x(i)} y={H - M.bottom + 18} className="tick" textAnchor="middle">{m.replace(' 20', " '")}</text>
        ))}
        <line x1={x(T0 - 1)} x2={x(T0 - 1)} y1={M.top} y2={H - M.bottom} className="shock" />
        <path d={path(comp)} pathLength={1} className="line eu draw late" key={view} style={view === 'europe' ? { strokeDasharray: 'none', animation: 'none', strokeDashoffset: 0 } : undefined} />
        <path d={path(ch)} pathLength={1} className="line ch draw" />
        <text x={W - M.right + 10} y={y(comp[n - 1]) + 4} className="endlabel" style={{ fill: '#2a5d9f' }}>{view === 'synthetic' ? 'Synthetic' : 'Europe'}</text>
        <text x={W - M.right + 10} y={y(ch[n - 1]) + 4} className="endlabel" style={{ fill: '#d52b1e' }}>Switzerland</text>
        {/* time weights: which pre-shock months the comparison leans on */}
        {s.lambda.map((l, i) => l > 0 && (
          <g key={i}>
            <rect x={x(i) - 5} y={lamBase - l * lamMax} width={10} height={l * lamMax} fill="#141414" />
            <text x={x(i) + 9} y={lamBase - 2} className="tick">{Math.round(l * 100)}%</text>
          </g>
        ))}
        <text x={x(T0) + 6} y={lamBase - 2} className="annot muted">← months the estimate uses as “before”</text>
      </svg>
      <p className="readout">
        Before the shock, the synthetic Switzerland misses the real one by <b>{fitSynth.toFixed(2)}</b> points per month on average;
        the plain European average misses by <b>{fitEurope.toFixed(2)}</b>. After the shock, the gap between the red and the blue line is
        the effect of the strong franc.
      </p>
      <p className="caption">
        Synthetic difference-in-differences (Arkhangelsky et al., 2021) chooses country weights so that the mix moves in parallel with Switzerland
        before 2015, and month weights (black bars) that put weight on the pre-shock months most similar to the period after it. The ten most
        volatile countries are left out, as in the paper. Source: our replication.
      </p>
    </figure>
  );
}
