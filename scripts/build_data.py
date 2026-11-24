"""Builds src/data/site-data.json from the inputs in data/.

Temporary source: the author's replication package (github.com/AlexOktay/ERPT-Switzerland, Inputs/).
Replace with the output of our own R replication (analysis/) once it exists.
"""
import csv, json, pathlib

root = pathlib.Path(__file__).resolve().parents[1]
dS = (1.08 - 1.201) / 1.201  # EUR/CHF 14.01.2015 -> 31.12.2015, about -10.07 %

groups = {"HH": "Household goods & housing", "RETAIL": "Food & drink", "SER": "Services", "OTHER": "Energy, vehicles & electronics"}
cats = []
with open(root / "data/author/tradability_data.csv", encoding="utf-8-sig") as f:
    for r in csv.DictReader(f):
        def num(k):
            try: return round(float(r[k]), 4)
            except ValueError: return None
        cats.append({
            "name": r["Goodtype"], "group": groups[r["Cat"]],
            "passThrough": num("elasticity"),          # paper's reported 1-year pass-through (synthetic DID)
            "did": num("DiD_estimate"), "didSe": num("Std._Error"), "didP": num("P_value"),
            "importShare": num("importshare"),
        })

series = []
with open(root / "data/author/control_graph_data.csv", encoding="utf-8-sig") as f:
    rows = list(csv.DictReader(f))
labels = [f"{m} {y}" for y in (2014, 2015) for m in "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()]
keys = ["Switzerland", "Europe", "EU", "Eurozone", "Direct neighbours", "Germanic", "Exclud southern", "Non-EUR", "High Gdp"]
for i, r in enumerate(rows):
    series.append({"month": labels[i], **{k: round(float(r[k]), 3) for k in keys}})

out = {"exchangeRateChange": dS, "categories": cats, "prices": series,
       "source": "Oktay (2022) replication package, Inputs/tradability_data.csv and control_graph_data.csv"}
(root / "src/data/site-data.json").write_text(json.dumps(out, indent=1))
print(len(cats), "categories,", len(series), "months")
