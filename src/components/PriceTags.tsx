import { useState } from 'react';
import { data } from '../data';
import { useReveal } from '../useReveal';

const FEATURED = ['Solid fuels', 'Package holidays', 'Books', 'Purchase of vehicles', 'Actual rentals for housing'];

function Tag({ name, pick }: { name: string; pick?: React.ReactNode }) {
  const c = data.categories.find(c => c.name === name)!;
  const dS = data.exchangeRateChange;
  const pt = c.passThrough ?? 0;
  const now = 100 * (1 + pt * dS);
  const full = 100 * (1 + dS);
  return (
    <div className={`tag ${pick ? 'pick' : ''}`}>
      {pick ?? <div className="pname">{c.name}</div>}
      <div className="now"><small>CHF</small>{now.toFixed(2)}</div>
      <div className="row"><span>no shock</span><span>100.00</span></div>
      <div className="row"><span>full pass-through</span><s>{full.toFixed(2)}</s></div>
      <div className="meter" aria-hidden><i style={{ ['--s' as string]: Math.max(0, Math.min(1, pt)) }} /></div>
      <div className="ml">{pt < 0 ? 'got dearer instead' : `${Math.round(pt * 100)}% of the shock passed on`}</div>
    </div>
  );
}

/** Station 05, part 1: what CHF 100 worth of a product cost one year later, relative to no shock. */
export default function PriceTags() {
  const [ref, inView] = useReveal<HTMLDivElement>();
  const options = data.categories.filter(c => c.passThrough !== null && !FEATURED.includes(c.name)).map(c => c.name).sort();
  const [choice, setChoice] = useState('Coffee, tea, and cocoa');
  return (
    <div ref={ref} className={inView ? 'in' : ''}>
      <div className="tags">
        {FEATURED.map(n => <Tag key={n} name={n} />)}
        <Tag name={choice} pick={
          <div className="pname">
            <select value={choice} onChange={e => setChoice(e.target.value)} aria-label="Choose a product">
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>} />
      </div>
      <p className="caption">
        Price one year after the shock of a product that would have cost CHF 100 without it, implied by our estimated pass-through:
        CHF 100 × (1 + pass-through × −10.07%). “Full pass-through” is what it would have cost had prices fallen one-for-one with the euro.
        Estimates are relative to the synthetic comparison, not actual shelf prices.
      </p>
    </div>
  );
}
