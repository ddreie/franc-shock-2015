# Franc Shock 2015: replication of Oktay (2022)

Replication package and website for Problem Sets 3 and 4 of *Empirical Methods* (University of Zurich, autumn 2026).

We replicate and extend

> Oktay, A. (2022). Heterogeneity in the exchange rate pass-through to consumer prices: the Swiss franc appreciation
> of 2015. *Swiss Journal of Economics and Statistics*, 158, 21. https://doi.org/10.1186/s41937-022-00102-7

- **Original replication package** (not included here, we only use its input data): https://github.com/AlexOktay/ERPT-Switzerland
- **Website (Problem Set 4):** https://franc-shock-2015.vercel.app

## Reproducing the report

```sh
Rscript analysis/install_packages.R   # once: installs the R packages (synthdid from GitHub, pinned commit)
Rscript analysis/master.R             # runs the whole analysis from the raw data
```

Run both commands from the repository root; all paths are relative. Software: R 4.3.3 and `synthdid` 0.0.9, plus
`dplyr`, `tidyr`, `readr`, `haven`, `sandwich`, `lmtest` and `ggplot2` (versions in `analysis/install_packages.R`
and `analysis/output/sessionInfo.txt`).

Runtime: the placebo standard errors of the synthetic DID are slow (about 2.5 hours on one core for all
specifications; categories run in parallel on Linux/macOS). The results of these steps are stored in
`analysis/output/cache/`, so `master.R` finishes in seconds. To recompute everything from scratch, delete that folder
(or start R with `FORCE <- TRUE` and `source("analysis/master.R")`). Random seeds are fixed (2015 + category number).

## Which script produces what

| Script | What it does | Output used in the report |
|---|---|---|
| `analysis/00_setup.R` | packages, paths, constants (EUR/CHF change, treatment month, seeds) | – |
| `analysis/01_prepare_data.R` | raw HICP extract → panel of 34 countries × 468 series × 24 months; maps the paper's 85 categories to Eurostat series (`analysis/category_map.csv`) | – |
| `analysis/02_synthetic_did.R` | synthetic DID (Arkhangelsky et al., 2021) for 85 categories, placebo SEs | Table 1 col. (2), Panel B |
| `analysis/03_standard_did.R` | standard DID (HAC SEs) and pre-trend tests with two control series | Table 1 rows *Standard DID*, *Pre-trend*; counts of failed pre-trend tests |
| `analysis/04_robustness.R` | excluding 0/5/10/15 volatile countries (Table 4 of the paper), volatility measured pre-period only, January 2015 treated | Table 1 col. (3); `tab_table4.tex` |
| `analysis/05_extension.R` | monthly pass-through with the main weights; regressions on import shares; monthly-EUR/CHF variant | Table 2; Figure 3 |
| `analysis/06_outputs.R` | writes all tables, figures and the list of numbers | see below |
| `analysis/master.R` | runs 00–06 in this order | |

Outputs in `analysis/output/`:

| File | In the report |
|---|---|
| `tables/tab_main.tex` | Table 1: main result (paper vs. replication vs. alternative) |
| `tables/tab_ext.tex` | Table 2: extension, import share and speed of pass-through |
| `tables/tab_table4.tex`, `tables/tab_table2.tex` | replication of Tables 4 and 2 of the paper |
| `figures/fig1a_prices.pdf`, `figures/fig1b_eurchf.pdf` | Figure 1 (a) prices and (c) EUR/CHF (cf. Fig. 1 of the paper) |
| `figures/fig4_replication.pdf` | Figure 1 (b) (cf. Fig. 4 of the paper): Switzerland and its synthetic control |
| `figures/fig_ext_a.pdf`, `figures/fig_ext_b.pdf` | Figure 2: monthly pass-through, all items and by import share |
| `report_numbers.csv` | every number quoted in the text, with the script that produces it |

## Data

| Folder / file | Content | Source and how we obtained it |
|---|---|---|
| `data/raw/Dataset_normalized2015.csv` | HICP monthly price indices, 34 countries × 468 COICOP series, Jan 2014–Dec 2015, January 2015 = 100 | Eurostat, `prc_hicp_midx`. Extract taken from the original replication package (`Inputs/`), where the author normalised it to January 2015 = 100. Not modified. |
| `data/raw/Codebook.csv` | names of the 468 HICP series | original replication package (`Inputs/`) |
| `data/raw/SFSO_import_shares_data.csv` | import share of Swiss consumption by HICP category | Swiss Federal Statistical Office (unpublished), via the original replication package. Encoding CP437 |
| `data/raw/tradability_bls.csv` | international tradability index by category | Johnson (2017) BLS tradability index as used in the paper; the column `Tradability` of `Inputs/tradability_data.csv` in the original package (the author's estimates in that file are not included) |
| `data/raw/eurchf_monthly_snb.csv` | EUR/CHF, monthly averages 2014–2015 | Swiss National Bank data portal, cube `devkum`, series EUR1/M0, https://data.snb.ch/api/cube/devkum/data/csv/en, downloaded 24 Nov 2026 |
| `data/author_prepared/` | aggregated control series: GDP-weighted 33-country Europe (`dataset_final_normalized2015.dta`), 10 high-GDP countries (`alternative_highgdp.dta`), all-items paths of the paper's seven comparison groups (`control_graph_data.csv`) | **prepared by the author** in the original package (`Inputs/`), used unchanged. We use them for the standard DID and the pre-trend tests, where they let us show that the author's code uses the 10-country group instead of the 33-country aggregate described in the paper, and for the comparison-group chart on the website |
| `data/paper/paper_tables_5to8.csv` | published estimates of Tables 5–8 | typed by us from the paper, only used as a benchmark |
| `data/ours/` | our results as CSV | written by `06_outputs.R`; read by the website |

## How our replication differs from the original

- The author prepares the data in Stata and runs the analysis in R Markdown; we do everything in R, starting from the
  raw extract, with one master script.
- Categories are matched to Eurostat series through an explicit, documented mapping (`analysis/category_map.csv`);
  the original relabels series by hand.
- The standard DID is run with both control series. The published standard DID and pre-trend columns are reproduced
  only with the 10-country high-GDP group, because a loop in the original code overwrites the data frame.
- Placebo standard errors use fixed seeds, so they are reproducible.
- Robustness checks (exclusion rule measured on pre-period data only, timing of the treatment) and an extension on the
  speed of pass-through, which the paper names as an open question.

Result: 84 of 85 synthetic DID estimates match the paper to ±0.01 (the exception is a duplicated row in the paper),
and the main pass-through of 0.12 is reproduced exactly.

## Website

The interactive website (Problem Set 4) lives in the same repository: `src/` (React + TypeScript, Vite), data built
by `scripts/build_data.py` from `data/ours/`. `npm install && npm run build` builds it; Vercel deploys `main`
automatically. Design and contribution rules for the team are in `CLAUDE.md`.
