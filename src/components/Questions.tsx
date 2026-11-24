const questions = [
  {
    level: 'Warm-up',
    q: 'The synthetic difference-in-differences estimate for the all-items index is −1.23 (placebo standard error 0.48). Interpret the coefficient precisely and convert it into a pass-through. Is the effect statistically significant at the 5% level?',
    a: [
      'Between February and December 2015, Swiss consumer prices were on average 1.23% lower than they would have been without the removal of the minimum exchange rate, measured against the weighted synthetic control and holding everything else in the model constant.',
      'Pass-through = (−1.23/100) / (−0.1007) ≈ 0.12: a 1% appreciation of the franc lowered the expected Swiss price level by about 0.12% within the first year, so pass-through is far from complete.',
      't = −1.23 / 0.48 ≈ −2.56, so |t| > 1.96: significant at 5%. With a single treated country, however, this rests on placebo inference, i.e. on Switzerland behaving like the control countries in the absence of treatment.',
    ],
  },
  {
    level: 'Identification',
    q: 'Write down the simple difference-in-differences regression the paper estimates. Which assumption gives δ a causal interpretation, how does the synthetic version try to make it more credible, and what can a pre-trend test not tell you?',
    a: [
      'p_it = α + β·CH_i + γ·Post_t + δ·(CH_i × Post_t) + ε_it, estimated by OLS on Switzerland and the European control series; δ is the difference in the before/after change between Switzerland and the controls.',
      'Key assumption: parallel trends. Without the shock, Swiss prices would have moved like the control group’s. Synthetic DiD chooses country weights so that the weighted controls track Switzerland before 2015, and time weights that emphasise the most informative pre-period months.',
      'A pre-trend test only checks the period before the shock. It cannot rule out a shock that hits Switzerland or the control group differently after January 2015, which is exactly what a violation of parallel trends in the post-period would be.',
    ],
  },
  {
    level: 'Challenge',
    q: 'In March 2015 the ECB started quantitative easing, which raised demand and prices in the euro area but not in Switzerland. Use the omitted variable bias formula to sign the bias in δ̂. Is the pass-through over- or understated? Would cross-border shopping by Swiss consumers change your answer?',
    a: [
      'True model: p_it = … + δ·DID_it + γ·w_it + ε_it, with w = euro-area demand shock after March 2015. w raises prices (γ > 0) and is higher in the control group after treatment, so it is negatively correlated with the Swiss post-treatment dummy (Cov(DID, w) < 0).',
      'E(δ̂) = δ + γ·b_w,DID < δ: the estimate is too negative, i.e. biased away from zero. The paper therefore tends to overstate pass-through. Synthetic weights do not help, because they are fitted on pre-2015 data.',
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
          <p>{x.q}</p>
          <details>
            <summary>Show suggested answer</summary>
            {x.a.map((p, k) => <p key={k}>{p}</p>)}
          </details>
        </li>
      ))}
    </ol>
  );
}
