import katex from 'katex';
import 'katex/dist/katex.min.css';

/** Renders text with inline math in $...$ and display math in $$...$$ (KaTeX). */
function Tex({ children, as: Tag = 'p' }: { children: string; as?: 'p' | 'div' }) {
  const html = children
    .split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g)
    .map(part => {
      if (part.startsWith('$$')) return katex.renderToString(part.slice(2, -2), { displayMode: true, throwOnError: false });
      if (part.startsWith('$')) return katex.renderToString(part.slice(1, -1), { throwOnError: false });
      return part.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    })
    .join('');
  return <Tag dangerouslySetInnerHTML={{ __html: html }} />;
}

const questions = [
  {
    level: 'Warm-up',
    q: 'The synthetic difference-in-differences estimate for the all-items index is $\\hat\\tau = -1.23$ (placebo standard error 0.48). Interpret the coefficient precisely and convert it into a pass-through. Is the effect statistically significant at the 5% level?',
    a: [
      'Between February and December 2015, Swiss consumer prices were on average 1.23% lower than they would have been without the removal of the minimum exchange rate, measured against the weighted synthetic control and holding everything else in the model constant.',
      'With the 10.07% appreciation of the franc, $$\\text{PT} = \\frac{\\hat\\tau/100}{\\Delta S} = \\frac{-0.0123}{-0.1007} \\approx 0.12 .$$ A 1% appreciation lowered the expected Swiss price level by about 0.12% within the first year, so pass-through is far from complete.',
      '$t = -1.23/0.48 \\approx -2.56$, so $|t| > 1.96$: significant at 5%. With a single treated country, however, this rests on placebo inference, i.e. on Switzerland behaving like the control countries in the absence of treatment.',
    ],
  },
  {
    level: 'Identification',
    q: 'Write down the simple difference-in-differences regression the paper estimates. Which assumption gives $\\delta$ a causal interpretation, how does the synthetic version try to make it more credible, and what can a pre-trend test not tell you?',
    a: [
      '$$p_{it} = \\alpha + \\beta\\, CH_i + \\gamma\\, Post_t + \\delta\\, (CH_i \\times Post_t) + \\varepsilon_{it},$$ estimated by OLS on Switzerland and the European control series; $\\delta$ is the difference in the before/after change between Switzerland and the controls.',
      'Key assumption: parallel trends. Without the shock, Swiss prices would have moved like the control group’s. Synthetic DiD chooses country weights $\\hat\\omega_i$ so that the weighted controls track Switzerland before 2015, and time weights $\\hat\\lambda_t$ that emphasise the most informative pre-period months.',
      'A pre-trend test only checks the period before the shock. It cannot rule out a shock that hits Switzerland or the control group differently after January 2015, which is exactly what a violation of parallel trends in the post-period would be.',
    ],
  },
  {
    level: 'Challenge',
    q: 'In March 2015 the ECB started quantitative easing, which raised demand and prices in the euro area but not in Switzerland. Use the omitted variable bias formula to sign the bias in $\\hat\\delta$. Is the pass-through over- or understated? Would cross-border shopping by Swiss consumers change your answer?',
    a: [
      'True model: $p_{it} = \\ldots + \\delta\\, DID_{it} + \\gamma\\, w_{it} + \\varepsilon_{it}$, with $w$ the euro-area demand shock after March 2015. It raises prices ($\\gamma > 0$) and is higher in the control group after treatment, so it is negatively correlated with the Swiss treatment dummy: $\\operatorname{Cov}(DID, w) < 0$.',
      '$$E(\\hat\\delta) = \\delta + \\gamma\\, \\hat b_{w \\sim DID} < \\delta .$$ The estimate is too negative, i.e. biased away from zero, so the paper tends to overstate pass-through. Synthetic weights do not help, because they are fitted on pre-2015 data.',
      'Cross-border shopping raises demand and prices in neighbouring countries because of the treatment (a spillover, violating SUTVA). Control prices rise, the gap widens, and pass-through is again overstated: the bias goes in the same direction.',
    ],
  },
];

export default function Questions() {
  return (
    <ol className="questions">
      {questions.map((x, i) => (
        <li key={i}>
          <span className="level">Question {i + 1} · {x.level}</span>
          <Tex>{x.q}</Tex>
          <details>
            <summary>Show suggested answer</summary>
            {x.a.map((p, k) => <Tex key={k} as="div">{p}</Tex>)}
          </details>
        </li>
      ))}
    </ol>
  );
}
