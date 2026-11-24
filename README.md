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
| `data/author/` | Inputs aus dem Replication Package des Autors (vorläufige Datenquelle) |
| `analysis/` | Unsere R-Replikation (folgt) |
| `CLAUDE.md` | Anleitung für Claude: Aufbau, Regeln, wie eine Änderung live geht |

## Arbeiten

Jede Person beschreibt Änderungen in ihrem eigenen Claude-Chat. Claude ändert den Code, testet ihn und lädt ihn auf
GitHub; Vercel veröffentlicht `main` automatisch. Lokal geht es auch: `npm install`, dann `npm run dev`.
