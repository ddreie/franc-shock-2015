import Rail from './components/Rail';
import Hero from './components/Hero';
import PriceChart from './components/PriceChart';
import SyntheticRecipe from './components/SyntheticRecipe';
import ResultsTable from './components/ResultsTable';
import PriceTags from './components/PriceTags';
import CategoryChart from './components/CategoryChart';
import SpeedChart from './components/SpeedChart';
import Questions from './components/Questions';
import { data } from './data';
import { useReveal } from './useReveal';

function Kicker({ no, children }: { no: string; children: string }) {
  return <div className="kicker">{no} — {children}</div>;
}

function Check() {
  const [ref, inView] = useReveal<HTMLDivElement>();
  const s = data.summary;
  const rob = data.robustness;
  const pre = rob.find(r => r.spec.startsWith('Volatility'))!;
  const jan = rob.find(r => r.spec.startsWith('January'))!;
  return (
    <div ref={ref} className={`check fade ${inView ? 'in' : ''}`}>
      <div className="seal">
        <div className="n">{s['Categories reproduced +-0.01 (synthetic DID)']}<small>/85</small></div>
        <p>estimates of the paper reproduced to the second decimal, starting from the raw Eurostat data, in R.</p>
        <span className="stamp">checked 11/2026</span>
      </div>
      <ol>
        <li><b>The main result holds.</b> Pass-through <span className="mono">{data.allItems.pt.toFixed(2)}</span>, same as the paper; average over
          all categories <span className="mono">{s['Mean pass-through, 85 categories'].toFixed(2)}</span>, range <span className="mono">{s['Min pass-through'].toFixed(2)}</span> to <span className="mono">{s['Max pass-through'].toFixed(2)}</span>.</li>
        <li><b>The simple comparison uses a different group than the text says.</b> The author’s code overwrites the data with a
          10-country high-income average before running it. With the 33-country average described in the paper, pass-through is
          <span className="mono"> {(data.allItems.didEurope33 / 100 / data.exchangeRateChange).toFixed(2)}</span> instead of <span className="mono">0.16</span>, close to the main result.</li>
        <li><b>The countries left out are chosen with data from after the shock.</b> Choosing the ten most volatile countries with
          pre-2015 data only gives <span className="mono">{pre.pt.toFixed(2)}</span>: the conclusion survives.</li>
        <li><b>Small slips.</b> One row of the published tables (audio-visual equipment repair) repeats the row above it; and the
          treatment starts in February 2015 in the code, January in the text. Counting January as treated gives <span className="mono">{jan.pt.toFixed(2)}</span>.</li>
      </ol>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Rail />
      <Hero />

      <section className="wrap" aria-labelledby="summary-h">
        <div className="summary">
          <header><h2 id="summary-h">The paper in one minute</h2><span>Oktay (2022), Swiss Journal of Economics and Statistics</span></header>
          <div className="cols">
            <div>
              <h3>Question</h3>
              <p>When the franc suddenly gets stronger, how much cheaper do things get in Swiss shops, and do some products react much more than others?</p>
            </div>
            <div>
              <h3>Data and approach</h3>
              <p>Monthly consumer prices (Eurostat HICP) for Switzerland and 33 European countries, 2014–2015, split into 85 product groups.
                Swiss prices after the shock are compared with a “synthetic Switzerland”: a mix of European countries whose prices moved like Switzerland’s before 2015 but were not hit by the franc.</p>
            </div>
            <div>
              <h3>Takeaways</h3>
              <ul>
                <li><b>Only about 12%</b> of the shock reached consumer prices within a year.</li>
                <li><b>Fuel yes, rent no:</b> imported, traded goods got much cheaper, local services hardly.</li>
                <li><b>Imports were faster</b>, the rest caught up during 2015 (our extension).</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="station wrap" id="gap" aria-labelledby="h-gap">
        <Kicker no="02">Prices fall behind</Kicker>
        <h2 id="h-gap">Before 2015 Swiss prices moved with Europe’s. Then they broke away.</h2>
        <div className="prose">
          <p>In 2014 Swiss prices rose and fell roughly in step with their neighbours. From February 2015 they slid while prices in the rest of
            Europe went up. The paper compares Switzerland with seven different groups of countries. Switch them on and off: the break is there whichever you pick.</p>
        </div>
        <PriceChart />
      </section>

      <section className="station wrap" id="synthetic" aria-labelledby="h-syn">
        <Kicker no="03">A fair comparison</Kicker>
        <h2 id="h-syn">To measure the effect, Oktay builds a second Switzerland.</h2>
        <div className="prose">
          <p>The question is what Swiss prices would have done <b>without</b> the shock. Nobody can observe that, so the paper constructs it:
            a weighted mix of European countries that, before 2015, moved just like Switzerland. After January 2015 the mix shows the path
            Switzerland would have taken; the distance to the real Switzerland is the effect of the strong franc.</p>
        </div>
        <SyntheticRecipe />
      </section>

      <section className="station wrap" id="result" aria-labelledby="h-res">
        <Kicker no="04">What reached shoppers</Kicker>
        <h2 id="h-res">Of a 10% cheaper euro, about 1.2% showed up in prices.</h2>
        <div className="prose">
          <p>Swiss prices were on average <b>1.23% lower</b> than the synthetic Switzerland after the shock. Measured against the 10% move in the
            exchange rate, that is a pass-through of <b>0.12</b>: most of the windfall was absorbed along the way by importers and retailers, and many prices
            are set at home anyway, such as rents and services. The simpler method in the paper gives a higher number, but that is partly a coding slip (station 06).</p>
        </div>
        <ResultsTable />
      </section>

      <section className="station wrap" id="products" aria-labelledby="h-prod">
        <Kicker no="05">Which products, how fast</Kicker>
        <h2 id="h-prod">Fuel and holidays got cheaper. Rent did not.</h2>
        <div className="prose">
          <p>Behind the average of 0.12 are very different stories. Products bought abroad and easy to compare across borders reacted strongly;
            things made and priced in Switzerland barely moved. Here is what CHF 100 worth of each cost a year later, compared with no shock.</p>
        </div>
        <PriceTags />
        <h3 className="sub">All 84 categories</h3>
        <div className="prose"><p>Rank them, look at them against how much is imported or how widely they are traded, or open the full table.</p></div>
        <CategoryChart />
        <h3 className="sub">Our extension: imported goods reacted first</h3>
        <div className="prose">
          <p>The paper reports one number per product for the whole year and names the speed of adjustment as an open question. We split the
            effect month by month. Highly imported goods got cheaper within a few months; the rest caught up during 2015, so by December the import share
            no longer made a difference.</p>
        </div>
        <SpeedChart />
      </section>

      <section className="station wrap" id="check" aria-labelledby="h-check">
        <Kicker no="06">We checked the numbers</Kicker>
        <h2 id="h-check">We rebuilt the analysis from the raw data.</h2>
        <div className="prose">
          <p>Every number on this page comes from our own replication in R, starting from the raw price data in the author’s replication package.
            The headline result is solid. Along the way we found a few things the published text does not show.</p>
        </div>
        <Check />
      </section>

      <section className="station wrap" id="test" aria-labelledby="h-test">
        <Kicker no="07">Test yourself</Kicker>
        <h2 id="h-test">Three exam-style questions</h2>
        <div className="prose"><p>They get harder as you go and question the assumptions behind the results above.</p></div>
        <Questions />
      </section>

      <footer className="wrap about">
        <div>
          <h4>Paper</h4>
          <p>Oktay, A. (2022). Heterogeneity in the exchange rate pass-through to consumer prices: the Swiss franc appreciation of 2015.
            <i> Swiss Journal of Economics and Statistics</i>, 158, 21. <a href="https://doi.org/10.1186/s41937-022-00102-7">doi.org/10.1186/s41937-022-00102-7</a></p>
          <h4>Code</h4>
          <p>Replication and website: <a href="https://github.com/ddreie/franc-shock-2015">github.com/ddreie/franc-shock-2015</a>. Author’s package: <a href="https://github.com/AlexOktay/ERPT-Switzerland">AlexOktay/ERPT-Switzerland</a>.</p>
        </div>
        <div>
          <h4>Data</h4>
          <p>Eurostat HICP (prc_hicp_midx) and SFSO import shares via the author’s package; EUR/CHF from the Swiss National Bank.</p>
          <h4>About</h4>
          <p>Franc Shock 2015 is a student team in the course Empirical Methods, University of Zurich, autumn 2026. Not affiliated with the author or the SNB.</p>
        </div>
      </footer>
    </>
  );
}
