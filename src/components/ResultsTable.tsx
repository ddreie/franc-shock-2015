import { useState } from 'react';
import { data, mainResults } from '../data';

const stars = (est: number, se: number) => {
  const t = Math.abs(est / se);
  return t > 2.576 ? '***' : t > 1.96 ? '**' : t > 1.645 ? '*' : '';
};

export default function ResultsTable() {
  const [unit, setUnit] = useState<'effect' | 'pt'>('pt');
  const [showOurs, setShowOurs] = useState(true);
  const dS = data.exchangeRateChange;
  const fmt = (v: number) => unit === 'effect' ? `${v.toFixed(2)}%` : (v / 100 / dS).toFixed(2);
  const fmtSe = (v: number) => unit === 'effect' ? v.toFixed(2) : Math.abs(v / 100 / dS).toFixed(2);

  return (
    <figure className="viz">
      <div className="controls">
        <div className="seg" role="group" aria-label="Unit">
          <button aria-pressed={unit === 'pt'} onClick={() => setUnit('pt')}>Pass-through</button>
          <button aria-pressed={unit === 'effect'} onClick={() => setUnit('effect')}>Effect on price level</button>
        </div>
        <label className="check">
          <input type="checkbox" checked={showOurs} onChange={e => setShowOurs(e.target.checked)} />
          Show our replication
        </label>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Method</th><th>Switzerland is compared with</th><th className="num">Paper</th>
              {showOurs && <th className="num">Our replication</th>}
            </tr>
          </thead>
          <tbody>
            {mainResults.map(r => (
              <tr key={r.model}>
                <td><b>{r.model}</b>{showOurs && <div className="muted small">{r.note}</div>}</td>
                <td>{r.control}</td>
                <td className="num">{fmt(r.paper.est)}<sup>{stars(r.paper.est, r.paper.se)}</sup><div className="se">({fmtSe(r.paper.se)})</div></td>
                {showOurs && <td className="num">{fmt(r.ours.est)}<sup>{stars(r.ours.est, r.ours.se)}</sup><div className="se">({fmtSe(r.ours.se)})</div></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption>
        All-items consumer price index, Switzerland vs. comparison countries, January 2014 – December 2015.
        {unit === 'effect'
          ? ' Effect on the Swiss price level after the shock, in percent of the January 2015 level.'
          : ' Pass-through = price effect divided by the 10.07% change in the EUR/CHF rate.'}
        {' '}Standard errors in parentheses (simple DiD: autocorrelation-robust; synthetic DiD: placebo).
        * p&lt;0.1, ** p&lt;0.05, *** p&lt;0.01.
      </figcaption>
    </figure>
  );
}
