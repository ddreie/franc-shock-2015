import { useState } from 'react';
import { data } from '../data';

const stars = (est: number, se: number) => {
  const t = Math.abs(est / se);
  return t > 2.576 ? '***' : t > 1.96 ? '**' : t > 1.645 ? '*' : '';
};

/** Station 04: the main estimates, paper vs. our replication, as price effect or pass-through. */
export default function ResultsTable() {
  const [unit, setUnit] = useState<'pt' | 'effect'>('pt');
  const a = data.allItems;
  const dS = data.exchangeRateChange;
  const fmt = (v: number) => (unit === 'effect' ? `${v.toFixed(2)}%` : (v / 100 / dS).toFixed(2)).replace('-', '−');
  const fmtSe = (v: number) => (unit === 'effect' ? v : Math.abs(v / 100 / dS)).toFixed(2);
  const cell = (e?: { est: number; se: number }) => e
    ? <>{fmt(e.est)}<sup>{stars(e.est, e.se)}</sup><div className="se">({fmtSe(e.se)})</div></>
    : <span className="se">–</span>;

  const rows = [
    { model: 'Simple difference-in-differences', control: 'Average of 33 European countries, as described in the paper',
      paper: { est: -1.64, se: 0.26 }, ours: { est: a.didEurope33, se: a.didEurope33Se }, flag: true,
      note: 'The published number does not come from this comparison group (see next row).' },
    { model: 'Simple difference-in-differences', control: 'Average of 10 high-income countries, what the author’s code actually uses',
      ours: { est: a.didHighgdp, se: a.didHighgdpSe }, flag: true,
      note: 'Reproduces the published −1.64 exactly.' },
    { model: 'Synthetic difference-in-differences', control: 'Synthetic Switzerland (station 03)',
      paper: { est: -1.23, se: 0.48 }, ours: { est: a.sdid, se: a.sdidSe }, main: true,
      note: 'The paper’s main result. Identical.' },
  ];

  return (
    <figure className="fig">
      <div className="fig-head">
        <span className="fig-title">All-items consumer prices, February–December 2015</span>
        <div className="seg" role="group" aria-label="Unit">
          <button aria-pressed={unit === 'pt'} onClick={() => setUnit('pt')}>Pass-through</button>
          <button aria-pressed={unit === 'effect'} onClick={() => setUnit('effect')}>Effect on prices</button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Method</th><th>Switzerland is compared with</th><th className="num">Paper</th><th className="num">Our replication</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={r.flag ? 'flag' : ''}>
                <td style={{ paddingLeft: 8 }}><b>{r.model}</b>{r.main && <div className="small" style={{ color: '#d52b1e' }}>main result</div>}</td>
                <td>{r.control}<div className="small">{r.note}</div></td>
                <td className="num big">{cell(r.paper)}</td>
                <td className="num big">{cell(r.ours)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="caption">
        {unit === 'effect'
          ? 'Average effect on the Swiss price level after the shock, in % of the January 2015 level. '
          : 'Pass-through = price effect ÷ the −10.07% change in the EUR/CHF rate (1 = fully passed on). '}
        Standard errors in parentheses: simple DiD autocorrelation-robust (HAC), synthetic DiD placebo-based. * p&lt;0.1, ** p&lt;0.05, *** p&lt;0.01.
        Paper: Oktay (2022), Tables 4–5. Our replication: analysis/master.R in the repository.
      </p>
    </figure>
  );
}
