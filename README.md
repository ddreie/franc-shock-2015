# Franc Shock 2015

Interaktive Website zu unserer Replikation von Oktay (2022) für Problem Set 4, Empirical Methods (UZH, HS 2026).

- **Live:** https://franc-shock-2015.vercel.app
- **Paper:** https://doi.org/10.1186/s41937-022-00102-7
- **Replication package des Autors:** https://github.com/AlexOktay/ERPT-Switzerland

## Aufbau

| Ordner | Inhalt |
|---|---|
| `src/` | Website (React + TypeScript, Vite). Grafiken in `src/components/` |
| `src/data/site-data.json` | Zahlen, die die Website anzeigt (erzeugt mit `python3 scripts/build_data.py`) |
| `data/author/` | Rohdaten aus dem Replication Package des Autors (unverändert) und die Tabellen 5–8 des Papers |
| `analysis/` | Unsere R-Replikation: `Rscript analysis/master.R` rechnet alles ab den Rohdaten (~35 Min.) |
| `analysis/category_map.csv` | Zuordnung Paper-Kategorie → Eurostat-Serie → SFSO-Importanteil |
| `analysis/output/` | LaTeX-Tabellen (`tab_main.tex`, `tab_ext.tex`) und Grafiken für den Bericht |
| `data/ours/` | Unsere Resultate als CSV (daraus liest die Website) |
| `CLAUDE.md` | Anleitung für Claude: Aufbau, Regeln, wie eine Änderung live geht |

## Arbeiten

Jede Person beschreibt Änderungen in ihrem eigenen Claude-Chat. Claude ändert den Code, testet ihn und lädt ihn auf
GitHub; Vercel veröffentlicht `main` automatisch. Lokal geht es auch: `npm install`, dann `npm run dev`.

## Replikation (PS3)

Software: R 4.3.3, `synthdid` 0.0.9 (`git clone https://github.com/synth-inference/synthdid && R CMD INSTALL synthdid`),
`sandwich`, `lmtest`, `dplyr`, `tidyr`, `readr`, `haven`, `ggplot2`. Alle Pfade sind relativ zum Repository-Ordner,
Seeds sind gesetzt (2015 + Kategorie-Nummer). Danach `python3 scripts/build_data.py`, um die Website zu aktualisieren.
