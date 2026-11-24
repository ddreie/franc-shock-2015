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
| Data for the site | `src/data/site-data.json`, built by `scripts/build_data.py` from `data/` | Currently from the author's replication package (`data/author/`). Will be replaced by the output of our own R replication |
| Replication code | `analysis/` (R, to be added) | Should write CSVs into `data/ours/`; then point `scripts/build_data.py` at them |
| Hand-typed numbers | `mainResults` in `src/data.ts` | Main table (paper vs. our replication). Keep in sync with the report |
| Deploy | Vercel's GitHub integration | Every push to `main` goes live in ~1 minute; other branches get a preview URL (shown on the commit / PR on GitHub). The repo is public, so commits by all collaborators deploy on the free plan |

## Requirements from the assignment (do not break these)

- Paper summary box in non-technical language; intuitive headlines for every section.
- At least one table and one chart with dynamic functionality (filters, toggles, sliders).
- Three exam-style questions below the charts, getting progressively harder (`src/components/Questions.tsx`).
- Aimed at a general audience: avoid jargon in the running text; technical detail belongs in captions and questions.

## How to deliver a change

1. `git pull --rebase origin main` first – other team members push to the same repository.
2. Change the code. If you changed data inputs, run `python3 scripts/build_data.py`.
3. Run `npm install` (first time) and `npm run build` (type-check + build). For visual changes, serve `dist/`
   (`npx vite preview`) and look at a Playwright screenshot before pushing.
4. Commit with a clear message and push to `main`. For larger redesigns push to a branch first and share the preview URL.
5. Tell the user the live URL once Vercel has deployed it.

## Conventions

- Colours: tokens at the top of `src/styles.css` (Swiss red accent; blue = Switzerland, orange = comparison group).
  Keep Switzerland blue in every chart.
- Every number on the page must come from the paper, the author's package or our replication, with the source in the
  figure caption. Never invent numbers.
- The README (German) explains the setup for the team; update it when the setup changes.
