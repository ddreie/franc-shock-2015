# Write all results:
#   analysis/output/tables/   LaTeX tables used in the report (\input{tables/...})
#   analysis/output/figures/  PDF figures used in the report (\includegraphics{figures/...})
#   analysis/output/report_numbers.csv   every number quoted in the report, with the script that produces it
#   data/ours/                CSVs read by the website (scripts/build_data.py)

f2 <- function(x) formatC(x, format = "f", digits = 2)
neg <- function(s) gsub("-", "$-$", s, fixed = TRUE)
est_cell <- function(est, se) paste0(neg(f2(est)), "$^{", stars(est, se), "}$")

# --- Category results: ours vs paper (website + basis for tables) ----------------------------------
categories <- catmap |> select(name, eurostat_label, sfso_label) |>
  left_join(paper |> select(table, name, p_pretrend = pretrend, p_pretrend_se = pretrend_se, p_did = did, p_did_se = did_se,
                            p_sdid = sdid, p_sdid_se = sdid_se, p_pt = pt), by = "name") |>
  left_join(sdid |> select(name, sdid, sdid_se, pt, n_controls), by = "name") |>
  left_join(std |> filter(control == "highgdp") |> select(name, did_highgdp = did, did_highgdp_se = did_se,
                                                          pretrend_highgdp = pretrend, pretrend_highgdp_se = pretrend_se), by = "name") |>
  left_join(std |> filter(control == "europe33") |> select(name, did_europe33 = did, did_europe33_se = did_se,
                                                           pretrend_europe33 = pretrend, pretrend_europe33_se = pretrend_se), by = "name") |>
  left_join(prerule |> select(name, pt_prerule = pt), by = "name") |>
  left_join(isfso, by = c("sfso_label" = "Goodtype")) |>
  left_join(speed |> select(name, pt_early, pt_late, pt_change, pt_change_se), by = "name")
write_csv(categories, file.path(DATA_OURS, "categories.csv"))
write_csv(monthly, file.path(DATA_OURS, "monthly.csv"))
write_csv(ext_table, file.path(DATA_OURS, "extension_regressions.csv"))
write_csv(rob_all, file.path(DATA_OURS, "robustness_all_items.csv"))

a <- categories[1, ]
match01 <- function(x, y) sum(abs(x - y) <= 0.0101, na.rm = TRUE)
ok <- categories$name != "Audio–visual equipment repair"   # paper row is a copy of the row above

# --- Table 1 (report): main result -----------------------------------------------------------------
pre <- rob_all[rob_all$spec == "Volatility measured Jan 2014 - Jan 2015 only", ]
tex_main <- c(
  "\\begin{tabular}{lccc}", "\\toprule",
  " & (1) Paper & (2) Replication & (3) Alternative \\\\", "\\midrule",
  "\\multicolumn{4}{l}{\\textit{Panel A: all-items HICP}} \\\\",
  paste0("Synthetic DID & ", est_cell(a$p_sdid, a$p_sdid_se), " & ", est_cell(a$sdid, a$sdid_se), " & ", est_cell(pre$sdid, pre$se), " \\\\"),
  paste0(" & (", f2(a$p_sdid_se), ") & (", f2(a$sdid_se), ") & (", f2(pre$se), ") \\\\"),
  paste0("Implied pass-through & ", f2(a$p_pt), " & ", f2(a$pt), " & ", f2(pre$pt), " \\\\"),
  paste0("Standard DID & ", est_cell(a$p_did, a$p_did_se), " & ", est_cell(a$did_highgdp, a$did_highgdp_se), " & ",
         est_cell(a$did_europe33, a$did_europe33_se), " \\\\"),
  paste0(" & (", f2(a$p_did_se), ") & (", f2(a$did_highgdp_se), ") & (", f2(a$did_europe33_se), ") \\\\"),
  paste0("Implied pass-through & ", f2(pass_through(a$p_did)), " & ", f2(pass_through(a$did_highgdp)), " & ", f2(pass_through(a$did_europe33)), " \\\\"),
  paste0("Pre-trend difference & ", neg(f2(a$p_pretrend)), " & ", neg(f2(a$pretrend_highgdp)), " & ", neg(f2(a$pretrend_europe33)), " \\\\"),
  paste0(" & (", f2(a$p_pretrend_se), ") & (", f2(a$pretrend_highgdp_se), ") & (", f2(a$pretrend_europe33_se), ") \\\\"),
  "\\midrule",
  "\\multicolumn{4}{l}{\\textit{Panel B: 85 categories, synthetic DID}} \\\\",
  paste0("Mean pass-through & ", f2(mean(paper$pt)), " & ", f2(mean(sdid$pt)), " & ", f2(mean(prerule$pt)), " \\\\"),
  paste0("Mean standard error & ", f2(mean(paper$sdid_se)), " & ", f2(mean(sdid$sdid_se)), " & \\\\"),
  paste0("Range of pass-through & ", neg(f2(min(paper$pt))), " to ", f2(max(paper$pt)), " & ", neg(f2(min(sdid$pt))), " to ", f2(max(sdid$pt)),
         " & ", neg(f2(min(prerule$pt))), " to ", f2(max(prerule$pt)), " \\\\"),
  paste0("Significant at 5\\% & ", sum(abs(paper$sdid / paper$sdid_se) > 1.96), " & ", sum(abs(sdid$sdid / sdid$sdid_se) > 1.96), " & \\\\"),
  paste0("Estimates reproduced ($\\pm 0.01$) & & ", match01(categories$sdid, categories$p_sdid), "/85 & \\\\"),
  "\\bottomrule", "\\end{tabular}")
writeLines(tex_main, file.path(TAB, "tab_main.tex"))

# --- Table 4 of the paper: comparison of DID methods (ours, paper in brackets) -----------------------
p4 <- read_csv(file.path(DATA_PAPER, "paper_table4.csv"), show_col_types = FALSE)
t4_row <- function(label, all_pt, pts, ses, pm = NULL) {
  br <- function(x) if (is.null(pm)) "" else paste0(" [", neg(f2(x)), "]")
  paste0(label, " & ", f2(all_pt), br(pm$all_items_pt), " & ", f2(mean(pts, na.rm = TRUE)), br(pm$mean_pt), " & ",
         f2(mean(ses, na.rm = TRUE)), br(pm$mean_se), " & ", neg(f2(min(pts, na.rm = TRUE))), " to ", f2(max(pts, na.rm = TRUE)),
         if (is.null(pm)) "" else paste0(" [", neg(f2(pm$min_pt)), " to ", f2(pm$max_pt), "]"), " \\\\")
}
hg <- std |> filter(control == "highgdp")
e33 <- std |> filter(control == "europe33")
syn_rows <- sapply(c(0, 5, 10, 15), function(k) {
  s <- sdid_k[sdid_k$k == k, ]
  t4_row(if (k == 0) "\\quad all controls" else paste0("\\quad excl. ", k, " countries"), s$pt[s$name == "All-items HICP"], s$pt, s$sdid_se,
         p4[p4$method == if (k == 0) "Synthetic" else paste0("Synthetic excl. ", k, " countries"), ])
})
t4 <- c(
  "\\begin{tabular}{lcccc}", "\\toprule",
  "Method & All-items PT & Mean PT & Mean SE & Range of PT \\\\", "\\midrule",
  "\\multicolumn{5}{l}{\\textit{Standard DID, 10-country high-GDP control (as in the author's code)}} \\\\",
  t4_row("\\quad OLS SE", hg$pt[1], hg$pt, hg$did_se_ols, p4[p4$method == "Standard", ]),
  t4_row("\\quad HAC SE", hg$pt[1], hg$pt, hg$did_se, p4[p4$method == "Standard with HAC", ]),
  "\\multicolumn{5}{l}{\\textit{Standard DID, 33-country European aggregate (as described in the paper)}} \\\\",
  t4_row("\\quad OLS SE", e33$pt[1], e33$pt, e33$did_se_ols), t4_row("\\quad HAC SE", e33$pt[1], e33$pt, e33$did_se),
  "\\multicolumn{5}{l}{\\textit{Synthetic DID}} \\\\", syn_rows,
  "\\bottomrule", "\\end{tabular}")
writeLines(t4, file.path(TAB, "tab_table4.tex"))
write_csv(sdid_k |> group_by(k) |> summarise(all_items_pt = pt[name == "All-items HICP"], mean_pt = mean(pt), mean_se = mean(sdid_se),
                                              min_pt = min(pt), max_pt = max(pt)), file.path(DATA_OURS, "table4_synthetic.csv"))

# --- Table 2 of the paper: pass-through by group (ours, paper in brackets) ---------------------------
TOURISM <- c("Accommodation services", "Package holidays", "Passenger transport by air", "Restaurants and hotels",
             "Services related to holidays and accommodation")   # our definition; the paper does not list the categories
cats_pt <- categories |> filter(name != "All-items HICP")
grp <- bind_rows(
  cats_pt |> group_by(group = table) |> summarise(mean = mean(pt), median = median(pt), n = n(), .groups = "drop"),
  cats_pt |> filter(table == "Services", !name %in% TOURISM) |> summarise(group = "Services excl. tourism", mean = mean(pt), median = median(pt), n = n()),
  cats_pt |> summarise(group = "All categories (unweighted)", mean = mean(pt), median = median(pt), n = n()),
  tibble(group = "All-items index (HICP weights)", mean = a$pt, median = NA, n = 1)) |>
  left_join(read_csv(file.path(DATA_PAPER, "paper_table2.csv"), show_col_types = FALSE) |> rename(p_mean = mean_pt, p_median = median_pt), by = "group")
write_csv(grp, file.path(DATA_OURS, "group_means.csv"))
writeLines(c("\\begin{tabular}{lccc}", "\\toprule", "Group & Mean PT & Median PT & N \\\\", "\\midrule",
  paste0(gsub("&", "\\&", grp$group, fixed = TRUE), " & ", f2(grp$mean), " [", f2(grp$p_mean), "] & ",
         ifelse(is.na(grp$median), "", paste0(f2(grp$median), " [", f2(grp$p_median), "]")), " & ", grp$n, " \\\\"),
  "\\bottomrule", "\\end{tabular}"), file.path(TAB, "tab_table2.tex"))

# --- Table 2 (report): extension --------------------------------------------------------------------
e <- ext_table
writeLines(c(
  "\\begin{tabular}{lccccc}", "\\toprule",
  " & (1) $|PT^{1y}|$ & (2) $PT^{1y}$ & (3) $PT^{early}$ & (4) $PT^{late}$ & (5) Late $-$ early \\\\", "\\midrule",
  paste0("Import share & ", paste(est_cell(e$b, e$se), collapse = " & "), " \\\\"),
  paste0(" & ", paste0("(", f2(e$se), ")", collapse = " & "), " \\\\"),
  paste0("Constant & ", paste(est_cell(e$a, e$a_se), collapse = " & "), " \\\\"),
  paste0(" & ", paste0("(", f2(e$a_se), ")", collapse = " & "), " \\\\"),
  paste0("Observations & ", paste(e$n, collapse = " & "), " \\\\"),
  paste0("$R^2$ & ", paste(f2(e$r2), collapse = " & "), " \\\\"),
  "\\bottomrule", "\\end{tabular}"), file.path(TAB, "tab_ext.tex"))

# --- Figures ---------------------------------------------------------------------------------------
theme_set(theme_minimal(base_size = 10) + theme(panel.grid.minor = element_blank(), legend.position = "bottom"))
mlab <- format(seq(as.Date("2014-01-01"), by = "month", length.out = 24), "%b %y")

# Figure 1 (cf. Fig. 1 and 4 of the paper): prices, exchange rate (separate panel instead of a second y-axis), synthetic control
agg33 <- load_aggregate("dataset_final_normalized2015.dta") |> filter(code == catmap$code[1]) |>
  group_by(group) |> mutate(value = 100 * value / value[month == 1]) |> ungroup() |>
  mutate(group = ifelse(group == "Control", "Europe (33 countries)", "Switzerland"))
fxm <- read_csv(file.path(DATA_RAW, "eurchf_monthly_snb.csv"), show_col_types = FALSE) |> mutate(month = row_number())
p1a <- ggplot(agg33, aes(month, value, colour = group)) + geom_vline(xintercept = 13, linetype = "dotted") +
  geom_line(linewidth = 0.8) + scale_colour_manual(values = c("Switzerland" = "#d52b1e", "Europe (33 countries)" = "#2a5d9f"), name = NULL) +
  scale_x_continuous(breaks = seq(1, 24, 6), labels = mlab[seq(1, 24, 6)]) + labs(x = NULL, y = "HICP, Jan 2014 = 100", title = "(a) Consumer prices, all items")
p1b <- ggplot(fxm, aes(month, eurchf)) + geom_vline(xintercept = 13, linetype = "dotted") + geom_hline(yintercept = 1.2, colour = "grey50") +
  geom_line(linewidth = 0.8, colour = "#141414") + scale_x_continuous(breaks = seq(1, 24, 6), labels = mlab[seq(1, 24, 6)]) +
  labs(x = NULL, y = "CHF per EUR", title = "(b) EUR/CHF, monthly average")
small <- theme(plot.title = element_text(size = 9), axis.title = element_text(size = 8), axis.text = element_text(size = 7),
               legend.text = element_text(size = 7))
ggsave(file.path(FIG, "fig1a_prices.pdf"), p1a + labs(title = "Consumer prices, all items") + small, width = 3.3, height = 2.7)
ggsave(file.path(FIG, "fig1b_eurchf.pdf"), p1b + labs(title = "EUR/CHF, monthly average") + small, width = 3.3, height = 2.7)

# Figure 2 (cf. Fig. 4 of the paper): Switzerland and its synthetic control, all items
r1 <- sdid_category(catmap$code[1], reps = 2); w <- attr(r1$est, "weights")
fig4 <- tibble(month = 1:24, Switzerland = r1$setup$Y[r1$setup$N0 + 1, ],
               Synthetic = colSums(w$omega * r1$setup$Y[1:r1$setup$N0, ])) |> pivot_longer(-month, names_to = "series")
g4 <- ggplot(fig4, aes(month, value, colour = series)) + geom_vline(xintercept = 13, linetype = "dotted") +
  geom_line(linewidth = 0.8) + scale_colour_manual(values = c(Switzerland = "#d52b1e", Synthetic = "#2a5d9f"), name = NULL) +
  scale_x_continuous(breaks = seq(1, 24, 6), labels = mlab[seq(1, 24, 6)]) +
  labs(x = NULL, y = "HICP, Jan 2015 = 100", title = "Switzerland and its synthetic control")
ggsave(file.path(FIG, "fig4_replication.pdf"), g4 + labs(title = "Switzerland and its synthetic control") + small, width = 3.3, height = 2.7)
write_csv(tibble(country = rownames(r1$setup$Y)[1:r1$setup$N0], weight = w$omega), file.path(DATA_OURS, "synthetic_weights_all_items.csv"))
write_csv(fig4 |> pivot_wider(names_from = series, values_from = value) |>
            mutate(lambda = c(w$lambda, rep(0, 24 - length(w$lambda)))), file.path(DATA_OURS, "synthetic_path_all_items.csv"))

# Figure 3 (extension): monthly pass-through, all items and by import-share group
all_m <- monthly |> filter(name == "All-items HICP")
g1 <- ggplot(all_m, aes(month, pt)) +
  geom_hline(yintercept = 0, colour = "grey60") + geom_hline(yintercept = sdid$pt[1], linetype = "dashed", colour = "#d52b1e") +
  geom_ribbon(aes(ymin = pt - 1.96 * pt_se, ymax = pt + 1.96 * pt_se), fill = "#d52b1e", alpha = 0.12) +
  geom_line(colour = "#d52b1e", linewidth = 0.8) + geom_point(colour = "#d52b1e", size = 1.6) +
  scale_x_continuous(breaks = seq(14, 24, 2), labels = mlab[seq(14, 24, 2)]) + labs(x = NULL, y = "Pass-through", title = "All-items HICP: monthly pass-through")
ggsave(file.path(FIG, "fig_ext_a.pdf"), g1, width = 4.2, height = 3.2)
med_goods <- median(categories$importshare[categories$name != "All-items HICP" & categories$importshare > 0], na.rm = TRUE)
grp_ext <- categories |> filter(name != "All-items HICP", !is.na(importshare)) |>
  mutate(group = case_when(importshare == 0 ~ "Services (import share 0)", importshare < med_goods ~ "Goods, low import share",
                           TRUE ~ "Goods, high import share")) |> select(name, group)
g2d <- monthly |> inner_join(grp_ext, by = "name") |> group_by(group, month) |> summarise(pt = mean(pt), .groups = "drop")
g2 <- ggplot(g2d, aes(month, pt, colour = group, linetype = group)) +
  geom_hline(yintercept = 0, colour = "grey60") + geom_line(linewidth = 0.8) + geom_point(size = 1.4) +
  scale_colour_manual(values = c("#2a5d9f", "#b77a00", "#141414"), name = NULL) + scale_linetype_manual(values = c("solid", "solid", "dashed"), name = NULL) +
  scale_x_continuous(breaks = seq(14, 24, 2), labels = mlab[seq(14, 24, 2)]) + labs(x = NULL, y = "Mean pass-through", title = "By import share") +
  guides(colour = guide_legend(nrow = 2), linetype = guide_legend(nrow = 2))
ggsave(file.path(FIG, "fig_ext_b.pdf"), g2, width = 4.2, height = 3.2)

# --- Every number quoted in the report -------------------------------------------------------------
sp <- speed |> filter(name != "All-items HICP", !is.na(importshare))
sa <- speed |> filter(name == "All-items HICP")
k0 <- sdid_k |> filter(k == 0)
num <- function(stat, value, script, where) tibble(statistic = stat, value = value, script = script, report = where)
report_numbers <- bind_rows(
  num("Synthetic DID, all items", a$sdid, "02_synthetic_did.R", "Intro; Table 1 A(2); Interpretation"),
  num("Placebo SE, all items", a$sdid_se, "02_synthetic_did.R", "Table 1 A(2)"),
  num("t-statistic, all items", a$sdid / a$sdid_se, "02_synthetic_did.R", "Interpretation"),
  num("Pass-through, all items", a$pt, "02_synthetic_did.R", "Intro; Table 1; Interpretation"),
  num("Categories reproduced +-0.01 (synthetic DID)", match01(categories$sdid, categories$p_sdid), "02_synthetic_did.R", "Intro; Table 1 B"),
  num("Audio-visual equipment repair: our synthetic DID", categories$sdid[categories$name == "Audio–visual equipment repair"], "02_synthetic_did.R", "Table 1 notes; A.3"),
  num("Mean pass-through, 85 categories", mean(sdid$pt), "02_synthetic_did.R", "Table 1 B"),
  num("Min pass-through", min(sdid$pt), "02_synthetic_did.R", "Table 1 B"),
  num("Max pass-through", max(sdid$pt), "02_synthetic_did.R", "Table 1 B"),
  num("Mean placebo SE, 85 categories", mean(sdid$sdid_se), "02_synthetic_did.R", "Table 1 B"),
  num("Categories significant at 5% (synthetic DID)", sum(abs(sdid$sdid / sdid$sdid_se) > 1.96), "02_synthetic_did.R", "Table 1 B; Interpretation"),
  num("Standard DID, all items, high-GDP control", a$did_highgdp, "03_standard_did.R", "Table 1 A(2)"),
  num("Standard DID SE (HAC), high-GDP control", a$did_highgdp_se, "03_standard_did.R", "Table 1 A(2)"),
  num("Standard DID, all items, 33-country Europe", a$did_europe33, "03_standard_did.R", "Intro; Table 1 A(3)"),
  num("Standard DID SE (HAC), 33-country Europe", a$did_europe33_se, "03_standard_did.R", "Table 1 A(3)"),
  num("Standard DID pass-through, 33-country Europe", pass_through(a$did_europe33), "03_standard_did.R", "Interpretation; Critical evaluation"),
  num("Categories reproduced +-0.01 (standard DID, high-GDP)", match01(categories$did_highgdp, categories$p_did), "03_standard_did.R", "Replication text"),
  num("Categories reproduced +-0.01 (HAC SE, high-GDP)", match01(categories$did_highgdp_se, categories$p_did_se), "03_standard_did.R", "Replication text; A.3"),
  num("Categories reproduced +-0.01 (pre-trend, high-GDP)", match01(categories$pretrend_highgdp, categories$p_pretrend), "03_standard_did.R", "Replication text"),
  num("Pre-trend difference, all items, 33-country Europe", a$pretrend_europe33, "03_standard_did.R", "Critical evaluation"),
  num("Pre-trend SE, all items, 33-country Europe", a$pretrend_europe33_se, "03_standard_did.R", "Critical evaluation"),
  pretrend_fail |> pivot_longer(starts_with("fail"), names_to = "level") |>
    transmute(statistic = paste0("Failed pre-trend tests at ", sub("fail_", "", level), "%, ", control), value, script = "03_standard_did.R", report = "Replication text"),
  num("Synthetic DID, no exclusion (all controls), all items", rob_all$sdid[1], "04_robustness.R", "Table 4 replication"),
  num("Synthetic DID, pre-period volatility rule, all items", pre$sdid, "04_robustness.R", "Table 1 A(3); Critical evaluation"),
  num("Placebo SE, pre-period volatility rule", pre$se, "04_robustness.R", "Table 1 A(3)"),
  num("Pass-through, pre-period volatility rule", pre$pt, "04_robustness.R", "Critical evaluation; Conclusion"),
  num("Correlation of category estimates, pre-period rule vs main", cor(prerule$sdid, sdid$sdid), "04_robustness.R", "Critical evaluation"),
  num("Mean pass-through, pre-period rule", mean(prerule$pt), "04_robustness.R", "Critical evaluation"),
  num("Synthetic DID, January 2015 treated, all items", rob_all$sdid[3], "04_robustness.R", "Critical evaluation"),
  num("Pass-through, January 2015 treated", rob_all$pt[3], "04_robustness.R", "Critical evaluation"),
  num("All controls: mean SE over 85 categories", mean(k0$sdid_se), "04_robustness.R", "Replication text (Table 4)"),
  num("All controls: max pass-through", max(k0$pt), "04_robustness.R", "Replication text (Table 4)"),
  grp |> transmute(statistic = paste0("Group mean pass-through: ", group), value = mean, script = "06_outputs.R", report = "Interpretation (Table 2 of paper)"),
  num("All items: pass-through Feb-Apr", sa$pt_early, "05_extension.R", "Extension"),
  num("All items: SE Feb-Apr", sa$pt_early_se, "05_extension.R", "Extension"),
  num("All items: pass-through Oct-Dec", sa$pt_late, "05_extension.R", "Extension; Conclusion"),
  num("All items: SE Oct-Dec", sa$pt_late_se, "05_extension.R", "Extension"),
  num("All items: change late - early", sa$pt_change, "05_extension.R", "Extension"),
  num("All items: SE of change", sa$pt_change_se, "05_extension.R", "Extension"),
  num("All items: share of late level reached in Feb-Apr", sa$pt_early / sa$pt_late, "05_extension.R", "Extension"),
  num("All items, monthly EUR/CHF: pass-through Feb-Apr", mean(fx_variant$pt_monthly_fx[1:3]), "05_extension.R", "Extension"),
  num("All items, monthly EUR/CHF: pass-through Oct-Dec", mean(fx_variant$pt_monthly_fx[9:11]), "05_extension.R", "Extension"),
  num("Categories with import share (extension sample)", nrow(sp), "05_extension.R", "Data; Extension"),
  num("Mean pass-through Feb-Apr, 71 categories", mean(sp$pt_early), "05_extension.R", "Extension"),
  num("Mean pass-through Oct-Dec, 71 categories", mean(sp$pt_late), "05_extension.R", "Extension"),
  num("Share of categories with late > early", mean(sp$pt_late > sp$pt_early), "05_extension.R", "Extension"),
  num("Categories with late > early, significant at 5%", sum(sp$pt_change / sp$pt_change_se > 1.96), "05_extension.R", "Extension"),
  num("Median import share among goods", med_goods, "06_outputs.R", "Figure 3 notes"),
  ext_table |> transmute(statistic = paste0("Extension regression ", dep, ": import share coefficient"), value = b, script = "05_extension.R", report = "Table 2; Extension"),
  ext_table |> transmute(statistic = paste0("Extension regression ", dep, ": HC1 SE"), value = se, script = "05_extension.R", report = "Table 2; Extension")
) |> mutate(value = round(value, 4))
write_csv(report_numbers, file.path(OUT, "report_numbers.csv"))

# --- Website only: all-items price paths of the paper's comparison groups (cf. Fig. 2 of the paper) ---------------------
# Simple means over countries with data, rebuilt from the raw panel as in the author's data_preparation_alternative_controls.do.
# "Europe" is the GDP-weighted 33-country aggregate (author_prepared, see 03_standard_did.R). The author's "Eurozone"
# line averages the 19 euro countries of 2015 without Ireland; we follow this so that the chart matches Fig. 2.
eu28 <- c("Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France",
          "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands",
          "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden", "United Kingdom")
comparison <- list(
  "EU" = eu28,
  "Eurozone" = c("Austria", "Belgium", "Cyprus", "Estonia", "Finland", "France", "Germany", "Greece", "Italy", "Latvia",
                 "Lithuania", "Luxembourg", "Malta", "Netherlands", "Portugal", "Slovakia", "Slovenia", "Spain"),
  "Direct neighbours" = c("Austria", "Germany", "France", "Italy"),
  "Germanic" = c("Austria", "Germany"),
  "Exclud southern" = setdiff(unique(panel$country), c("Portugal", "Greece", "Spain", "Italy", "Switzerland")),
  "Non-EUR" = c("United Kingdom", "Bulgaria", "Czech Republic", "Denmark", "Croatia", "Hungary", "Poland", "Romania", "Sweden"),
  "High Gdp" = HIGHGDP)
ai <- panel[panel$code == catmap$code[1], ]
groups_path <- bind_cols(
  tibble(month = 1:24, Switzerland = ai$value[ai$country == "Switzerland"][order(ai$month[ai$country == "Switzerland"])],
         Europe = load_aggregate("dataset_final_normalized2015.dta") |> filter(code == catmap$code[1], group == "Control") |>
           arrange(month) |> pull(value)),
  as_tibble(lapply(comparison, function(cs) ai |> filter(country %in% cs) |> group_by(month) |>
                     summarise(v = mean(value, na.rm = TRUE)) |> arrange(month) |> pull(v))))
write_csv(groups_path, file.path(DATA_OURS, "comparison_groups_all_items.csv"))
cat("Outputs written to", TAB, FIG, "and", DATA_OURS, "\n")
