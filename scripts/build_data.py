"""Builds src/data/site-data.json for the website.

Inputs:
  data/ours/*.csv               our R replication (analysis/master.R)
  (incl. data/ours/comparison_groups_all_items.csv: price paths of the comparison groups, cf. Fig. 2 of the paper)
  data/raw/eurchf_monthly_snb.csv, data/raw/tradability_bls.csv
"""
import csv, json, pathlib, statistics as st

root = pathlib.Path(__file__).resolve().parents[1]
read = lambda p: list(csv.DictReader(open(root / p, encoding="utf-8-sig")))
num = lambda x: None if x in ("", "NA", None) else round(float(x), 4)
dS = (1.08 - 1.201) / 1.201

groups = {"Food & Beverages": "Food & drink", "Household Products": "Household goods",
          "Services": "Services", "Industrial and Other Goods": "Energy, vehicles & other goods"}
rows = read("data/ours/categories.csv")
cats = [{
    "name": r["name"].replace("–", "-"), "group": groups[r["table"]],
    "passThrough": num(r["pt"]), "paperPassThrough": num(r["p_pt"]),
    "sdid": num(r["sdid"]), "sdidSe": num(r["sdid_se"]),
    "importShare": num(r["importshare"]),
    "ptEarly": num(r["pt_early"]), "ptLate": num(r["pt_late"]),
} for r in rows if r["name"] != "All-items HICP"]
allitems = next(r for r in rows if r["name"] == "All-items HICP")

# Monthly pass-through: all items (with 95% placebo band) and means by import-share group
monthly = read("data/ours/monthly.csv")
share = {c["name"]: c["importShare"] for c in cats}
pos = sorted(v for v in share.values() if v)
med = st.median(pos)
def grp(n):
    s = share.get(n.replace("–", "-"))
    if s is None: return None
    return "Services (nothing imported)" if s == 0 else ("Goods, low import share" if s < med else "Goods, high import share")
labels = [f"{m} 2015" for m in "Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()]
speed = {"months": labels, "allItems": [], "groups": {}}
for r in monthly:
    if r["name"] == "All-items HICP":
        speed["allItems"].append({"pt": num(r["pt"]), "se": num(r["pt_se"])})
acc = {}
for r in monthly:
    g = grp(r["name"])
    if g and r["name"] != "All-items HICP":
        acc.setdefault(g, {}).setdefault(int(r["month"]), []).append(float(r["pt"]))
for g, d in acc.items():
    speed["groups"][g] = {"values": [round(st.mean(d[m]), 4) for m in sorted(d)], "n": len(d[min(d)])}
speed["medianImportShare"] = med

summary = {r["statistic"]: num(r["value"]) for r in read("analysis/output/report_numbers.csv")}
ext = {r["dep"]: {"b": num(r["b"]), "se": num(r["se"]), "n": int(r["n"])} for r in read("data/ours/extension_regressions.csv")}

series = []
rowsg = read("data/ours/comparison_groups_all_items.csv")
mlabels = [f"{m} {y}" for y in (2014, 2015) for m in "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()]
keys = ["Switzerland", "Europe", "EU", "Eurozone", "Direct neighbours", "Germanic", "Exclud southern", "Non-EUR", "High Gdp"]
for i, r in enumerate(rowsg):
    series.append({"month": mlabels[i], **{k: round(float(r[k]), 3) for k in keys}})

# EUR/CHF monthly averages (SNB)
fx = [{"month": r["month"], "rate": float(r["eurchf"])} for r in read("data/raw/eurchf_monthly_snb.csv")]

# Synthetic control for the all-items index: path and country weights
path = read("data/ours/synthetic_path_all_items.csv")
synth = {"switzerland": [round(float(r["Switzerland"]), 3) for r in path],
         "synthetic": [round(float(r["Synthetic"]), 3) for r in path],
         "lambda": [round(float(r["lambda"]), 4) for r in path],
         "weights": sorted([{"country": r["country"], "weight": round(float(r["weight"]), 4)}
                            for r in read("data/ours/synthetic_weights_all_items.csv")], key=lambda d: -d["weight"])}

# International tradability (author's package, Fig. 5), matched by category name
norm = lambda x: x.lower().replace("–", "-").replace(", and", " and").replace("é", "e").strip()
trad = {norm(r["category"]): float(r["tradability"]) for r in read("data/raw/tradability_bls.csv")}
for c in cats:
    c["tradability"] = trad.get(norm(c["name"]))

out = {"exchangeRateChange": dS, "categories": cats, "prices": series, "speed": speed, "summary": summary,
       "extension": ext, "fx": fx, "synth": synth,
       "robustness": [{"spec": r["spec"], "sdid": num(r["sdid"]), "pt": num(r["pt"])} for r in read("data/ours/robustness_all_items.csv")],
       "allItems": {"sdid": num(allitems["sdid"]), "sdidSe": num(allitems["sdid_se"]), "pt": num(allitems["pt"]),
                    "didHighgdp": num(allitems["did_highgdp"]), "didHighgdpSe": num(allitems["did_highgdp_se"]),
                    "didEurope33": num(allitems["did_europe33"]), "didEurope33Se": num(allitems["did_europe33_se"])},
       "source": "Our R replication (analysis/) of Oktay (2022) from the raw data in the author's replication package"}
(root / "src/data/site-data.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
print(sum(c["tradability"] is not None for c in cats), "with tradability;", len(cats), "categories;", {g: v["n"] for g, v in speed["groups"].items()}, "categories per import group")
