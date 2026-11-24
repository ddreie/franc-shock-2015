import PriceChart from './components/PriceChart';
import CategoryChart from './components/CategoryChart';
import ResultsTable from './components/ResultsTable';
import Questions from './components/Questions';
import SpeedChart from './components/SpeedChart';

export default function App() {
  return (
    <>
      <header className="hero">
        <div className="wrap">
          <p className="eyebrow">Franc Shock 2015 · A replication of Oktay (2022)</p>
          <h1>The franc jumped 10% overnight. Did Swiss prices follow?</h1>
          <p className="lede">
            On 15 January 2015 the Swiss National Bank dropped its minimum exchange rate of 1.20 francs per euro.
            Imports became cheaper at a stroke. We look at how much of that reached shoppers, and for which products.
          </p>
        </div>
      </header>

      <main className="wrap">
        <section className="summary" aria-labelledby="summary-h">
          <h2 id="summary-h">The paper in one minute</h2>
          <div className="summary-grid">
            <div>
              <h3>Question</h3>
              <p>When the Swiss franc suddenly becomes stronger, how much cheaper do things get in Swiss shops, and do
                some products react much more than others?</p>
              <h3>Approach</h3>
              <p>Compare how Swiss consumer prices moved after the shock with a “synthetic Switzerland”: a weighted mix of
                European countries whose prices behaved like Switzerland’s before 2015 but were not hit by the franc shock.</p>
            </div>
            <div>
              <h3>Takeaways</h3>
              <ul>
                <li><b>Only about 12%</b> of the exchange-rate change showed up in consumer prices within a year.</li>
                <li><b>Huge differences between products:</b> fuels, vehicles and package holidays got much cheaper; rents,
                  health and education hardly moved.</li>
                <li><b>Imported products reacted faster:</b> they got cheaper within months, while other products caught up later in the year (our extension).</li>
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="s1">
          <h2 id="s1">A sudden break: Swiss prices fall behind Europe’s</h2>
          <p>
            Before 2015, Swiss prices moved roughly in step with the rest of Europe. After the franc jumped, they dipped
            while European prices kept rising. Pick a comparison group to see how robust that picture is.
          </p>
          <PriceChart />
        </section>

        <section aria-labelledby="s2">
          <h2 id="s2">How much of the cheaper euro reached shoppers?</h2>
          <p>
            The two methods ask the same question: how much lower were Swiss prices than they would have been without
            the shock? The simple method compares Switzerland with a European average; the synthetic method builds a
            better-matching comparison group. Switch between the effect on prices and the pass-through.
          </p>
          <ResultsTable />
        </section>

        <section aria-labelledby="s3">
          <h2 id="s3">Fuel yes, rent no: which products got cheaper?</h2>
          <p>
            Pass-through varies enormously across the basket. Filter by product group, or plot pass-through against how
            much of each product is imported.
          </p>
          <CategoryChart />
        </section>

        <section aria-labelledby="s3b">
          <h2 id="s3b">Fast and slow: imported goods got cheaper first</h2>
          <p>
            The paper reports one number per product for the whole year. We split it up month by month to see how quickly
            the cheaper euro arrived on price tags, and whether imported products were simply quicker.
          </p>
          <SpeedChart />
        </section>

        <section aria-labelledby="s4">
          <h2 id="s4">Test yourself: three exam-style questions</h2>
          <p>The questions get harder and challenge the assumptions behind the results above.</p>
          <Questions />
        </section>

        <section className="about" aria-labelledby="s5">
          <h2 id="s5">About this page</h2>
          <p>
            Paper: Oktay, A. (2022). Heterogeneity in the exchange rate pass-through to consumer prices: the Swiss franc
            appreciation of 2015. <i>Swiss Journal of Economics and Statistics</i>, 158, 21.{' '}
            <a href="https://doi.org/10.1186/s41937-022-00102-7">doi.org/10.1186/s41937-022-00102-7</a>
          </p>
          <p>
            All estimates on this page come from our own replication in R, starting from the raw data; the code is in the{' '}
            <a href="https://github.com/ddreie/franc-shock-2015">GitHub repository</a>.
          </p>
          <p>
            Data: Eurostat HICP (prc_hicp_midx), SNB exchange rates and SFSO import shares, as provided in the author’s{' '}
            <a href="https://github.com/AlexOktay/ERPT-Switzerland">replication package</a>. Built by team Franc Shock 2015
            for the course Empirical Methods (University of Zurich, autumn 2026).
          </p>
        </section>
      </main>
      <footer className="wrap foot">Franc Shock 2015 · Student project · Not affiliated with the author or the SNB</footer>
    </>
  );
}
