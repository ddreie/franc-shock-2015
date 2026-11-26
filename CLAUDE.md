# Franc Shock 2015 – instructions for Claude

Interactive website for Problem Set 4 of the course Empirical Methods (University of Zurich, HS 2026).
It presents our replication of Oktay (2022), "Heterogeneity in the exchange rate pass-through to consumer prices:
the Swiss franc appreciation of 2015", for a general audience. Three team members work on it, each in their own
Claude chat. Talk to them in German (Swiss spelling, no ß) unless they write in another language; the website itself
is in English. The site is public and runs under the team pseudonym "Franc Shock 2015": never put our real names,
student IDs or e-mail addresses on the page or in commits' visible content.

## Architecture

| Part | Where | Notes |
|---|---|---|
| Frontend | `src/` – React + TypeScript (Vite), no chart library: charts are hand-written SVG | Hosted on Vercel, project `franc-shock-2015` |
| Replication code | `analysis/` (R). `Rscript analysis/master.R` runs everything from `data/raw/` (seconds with the cache in `analysis/output/cache/`, ~2.5 h from scratch) | Writes CSVs to `data/ours/`, `analysis/output/tables/`, `analysis/output/figures/` and `analysis/output/report_numbers.csv`. R 4.3.3, synthdid 0.0.9 (install from GitHub source) |
| Category mapping | `analysis/category_map.csv` | Paper category name -> Eurostat series -> SFSO import-share label. Choices are documented in the `note` column |
| Data for the site | `src/data/site-data.json`, built by `scripts/build_data.py` from `data/ours/`, `analysis/output/report_numbers.csv`, `data/raw/` and `data/author_prepared/control_graph_data.csv` | Re-run the script after the R analysis changes |
| Paper benchmark | `data/paper/paper_tables_5to8.csv` | Tables 5-8 of the paper, typed from the PDF, for comparisons |
| Deploy | Vercel's GitHub integration | Every push to `main` goes live in ~1 minute; other branches get a preview URL (shown on the commit / PR on GitHub). The repo is public, so commits by all collaborators deploy on the free plan |

## Requirements from the assignment (do not break these)

- Paper summary box in non-technical language; intuitive headlines for every section.
- At least one table and one chart with dynamic functionality (filters, toggles, sliders).
- Three exam-style questions below the charts, getting progressively harder (`src/components/Questions.tsx`).
- Aimed at a general audience: avoid jargon in the running text; technical detail belongs in captions and questions.

## How to deliver a change

1. `git pull --rebase origin main` first – other team members push to the same repository.
2. Change the code. If you changed the analysis, run `Rscript analysis/master.R` and then `python3 scripts/build_data.py`.
3. Run `npm install` (first time) and `npm run build` (type-check + build). For visual changes, serve `dist/`
   (`npx vite preview`) and look at a Playwright screenshot before pushing.
4. Commit with a clear message and push to `main`. For larger redesigns push to a branch first and share the preview URL.
5. Tell the user the live URL once Vercel has deployed it.

## Conventions

- Design: Swiss grid identity. Fonts Instrument Sans (text) and IBM Plex Mono (numbers, labels); tokens at the top of
  `src/styles.css`. Red is reserved for Switzerland and the guiding line, the single blue for Europe / the comparison,
  everything else ink and grey. Keep Switzerland red in every chart. No extra colours, gradients or decorative motion.
- Structure: seven stations (`src/stations.ts`), the rail on the left thins from 100% to 12% (the pass-through).
  Each section = kicker, headline, short plain-language text, one figure with caption and source.
- Every number on the page must come from the paper, the author's package or our replication, with the source in the
  figure caption. Never invent numbers.
- The README (English, part of the PS3 submission) explains the replication package; update it when the setup changes.
- Do not add the original author's code or outputs to the repository (submission rule); only data, documented in the README.
