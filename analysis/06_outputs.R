# Write results: CSVs for the website (data/ours), LaTeX tables and figures for the report (analysis/output).
suppressPackageStartupMessages(library(ggplot2))

# --- Category results: ours vs paper ---------------------------------------------------------------
categories <- catmap |> select(name, eurostat_label, sfso_label) |>
  left_join(paper |> select(table, name, p_pretrend = pretrend, p_did = did, p_did_se = did_se,
                            p_sdid = sdid, p_sdid_se = sdid_se, p_pt = pt), by = "name") |>
  left_join(sdid |> select(name, sdid, sdid_se, pt, n_controls), by = "name") |>
  left_join(std |> filter(control == "highgdp") |> select(name, did_highgdp = did, did_highgdp_se = did_se,
                                                          pretrend_highgdp = pretrend, pretrend_highgdp_se = pretrend_se), by = "name") |>
  left_join(std |> filter(control == "europe33") |> select(name, did_europe33 = did, did_europe33_se = did_se,
                                                           pretrend_europe33 = pretrend, pretrend_europe33_se = pretrend_se), by = "name") |>
  left_join(isfso, by = c("sfso_label" = "Goodtype")) |>
  left_join(speed |> select(name, pt_early, pt_late, pt_change), by = "name")
write_csv(categories, file.path(DATA_OURS, "categories.csv"))
write_csv(monthly, file.path(DATA_OURS, "monthly.csv"))
write_csv(ext_table, file.path(DATA_OURS, "extension_regressions.csv"))
write_csv(rob_all, file.path(DATA_OURS, "robustness_all_items.csv"))

# --- Summary of the replication (Table 4 style) ----------------------------------------------------
summ <- tibble(
  statistic = c("All-items synthetic DID", "All-items placebo SE", "All-items pass-through",
                "Categories reproduced to +-0.01 (synthetic DID)", "Mean pass-through (85 categories)",
                "Mean synthetic DID SE", "Min pass-through", "Max pass-through", "Significant at 5% (synthetic DID)",
                "Standard DID all items, 10-country high-GDP control (code)", "Standard DID all items, 33-country Europe (text)",
                "Categories reproduced to +-0.01 (standard DID, high-GDP)", "Categories reproduced to +-0.01 (pre-trend, high-GDP)"),
  ours = c(sdid$sdid[1], sdid$sdid_se[1], sdid$pt[1],
           sum(abs(categories$sdid - categories$p_sdid) <= 0.0101), mean(sdid$pt), mean(sdid$sdid_se),
           min(sdid$pt), max(sdid$pt), sum(abs(sdid$sdid / sdid$sdid_se) > 1.96),
           categories$did_highgdp[1], categories$did_europe33[1],
           sum(abs(categories$did_highgdp - categories$p_did) <= 0.0101, na.rm = TRUE),
           sum(abs(categories$pretrend_highgdp - categories$p_pretrend) <= 0.0101, na.rm = TRUE)),
  paper = c(-1.23, 0.48, 0.12, 85, 0.18, 1.23, -0.31, 0.80, sum(abs(paper$sdid / paper$sdid_se) > 1.96),
            -1.64, NA, 85, 85)
)
write_csv(summ, file.path(DATA_OURS, "replication_summary.csv"))
print(summ, n = Inf)

# --- LaTeX: main table ---------------------------------------------------------------------------
f2 <- function(x) formatC(x, format = "f", digits = 2)
cell <- function(est, se) paste0("$", f2(est), "^{", stars(est, se), "}$ & ")
a <- categories[1, ]
tex_main <- c(
  "\\begin{tabular}{lccc}", "\\toprule",
  " & (1) Paper & (2) Replication & (3) 33-country / pre-period rule \\\\", "\\midrule",
  "\\multicolumn{4}{l}{\\textit{Panel A: all-items HICP}} \\\\",
  paste0("Synthetic DID & $", f2(a$p_sdid), "^{", stars(a$p_sdid, a$p_sdid_se), "}$ & $", f2(a$sdid), "^{", stars(a$sdid, a$sdid_se),
         "}$ & $", f2(rob_all$sdid[2]), "$ \\\\"),
  paste0(" & (", f2(a$p_sdid_se), ") & (", f2(a$sdid_se), ") & \\\\"),
  paste0("Implied pass-through & ", f2(a$p_pt), " & ", f2(a$pt), " & ", f2(rob_all$pt[2]), " \\\\"),
  paste0("Standard DID & $", f2(a$p_did), "^{", stars(a$p_did, a$p_did_se), "}$ & $", f2(a$did_highgdp), "^{", stars(a$did_highgdp, a$did_highgdp_se),
         "}$ & $", f2(a$did_europe33), "^{", stars(a$did_europe33, a$did_europe33_se), "}$ \\\\"),
  paste0(" & (", f2(a$p_did_se), ") & (", f2(a$did_highgdp_se), ") & (", f2(a$did_europe33_se), ") \\\\"),
  paste0("Pre-trend difference & ", f2(a$p_pretrend), " & ", f2(a$pretrend_highgdp), " & ", f2(a$pretrend_europe33), " \\\\"),
  "\\midrule",
  "\\multicolumn{4}{l}{\\textit{Panel B: 85 categories, synthetic DID}} \\\\",
  paste0("Mean pass-through & 0.18 & ", f2(mean(sdid$pt)), " & \\\\"),
  paste0("Mean standard error & 1.23 & ", f2(mean(sdid$sdid_se)), " & \\\\"),
  paste0("Range of pass-through & $-0.31$ to $0.80$ & $", f2(min(sdid$pt)), "$ to $", f2(max(sdid$pt)), "$ & \\\\"),
  paste0("Estimates reproduced ($\\pm 0.01$) & & ", summ$ours[4], "/85 & \\\\"),
  "\\bottomrule", "\\end{tabular}")
writeLines(tex_main, file.path(OUT, "tab_main.tex"))

# --- LaTeX: extension table ------------------------------------------------------------------------
e <- ext_table
tex_ext <- c(
  "\\begin{tabular}{lccccc}", "\\toprule",
  " & (1) $|PT^{1y}|$ & (2) $PT^{1y}$ & (3) $PT^{early}$ & (4) $PT^{late}$ & (5) Late $-$ early \\\\", "\\midrule",
  paste0("Import share & ", paste0("$", f2(e$b), "^{", stars(e$b, e$se), "}$", collapse = " & "), " \\\\"),
  paste0(" & ", paste0("(", f2(e$se), ")", collapse = " & "), " \\\\"),
  paste0("Constant & ", paste0("$", f2(e$a), "^{", stars(e$a, e$a_se), "}$", collapse = " & "), " \\\\"),
  paste0(" & ", paste0("(", f2(e$a_se), ")", collapse = " & "), " \\\\"),
  paste0("Observations & ", paste(e$n, collapse = " & "), " \\\\"),
  paste0("$R^2$ & ", paste(f2(e$r2), collapse = " & "), " \\\\"),
  "\\bottomrule", "\\end{tabular}")
writeLines(tex_ext, file.path(OUT, "tab_ext.tex"))

# --- Figures -------------------------------------------------------------------------------------
theme_set(theme_minimal(base_size = 10) + theme(panel.grid.minor = element_blank(), legend.position = "bottom"))
mlab <- format(seq(as.Date("2014-01-01"), by = "month", length.out = 24), "%b %y")

all_m <- monthly |> filter(name == "All-items HICP")
g1 <- ggplot(all_m, aes(month, pt)) +
  geom_hline(yintercept = 0, colour = "grey60") +
  geom_hline(yintercept = sdid$pt[1], linetype = "dashed", colour = "#c8102e") +
  geom_ribbon(aes(ymin = pt - 1.96 * pt_se, ymax = pt + 1.96 * pt_se), fill = "#2a78d6", alpha = 0.15) +
  geom_line(colour = "#2a78d6", linewidth = 0.8) + geom_point(colour = "#2a78d6", size = 1.6) +
  scale_x_continuous(breaks = 14:24, labels = mlab[14:24]) +
  labs(x = NULL, y = "Pass-through", title = "All-items HICP: monthly pass-through")
ggsave(file.path(OUT, "fig_ext_a.pdf"), g1, width = 4.2, height = 3.2)

grp <- categories |> filter(name != "All-items HICP", !is.na(importshare)) |>
  mutate(group = case_when(importshare == 0 ~ "Services (import share 0)",
                           importshare < median(importshare[importshare > 0]) ~ "Goods, low import share",
                           TRUE ~ "Goods, high import share")) |> select(name, group)
g2d <- monthly |> inner_join(grp, by = "name") |> group_by(group, month) |> summarise(pt = mean(pt), .groups = "drop")
g2 <- ggplot(g2d, aes(month, pt, colour = group)) +
  geom_hline(yintercept = 0, colour = "grey60") + geom_line(linewidth = 0.8) + geom_point(size = 1.4) +
  scale_colour_manual(values = c("#eb6834", "#2a78d6", "#1baf7a"), name = NULL) +
  scale_x_continuous(breaks = 14:24, labels = mlab[14:24]) +
  labs(x = NULL, y = "Mean pass-through", title = "By import share") + guides(colour = guide_legend(nrow = 2))
ggsave(file.path(OUT, "fig_ext_b.pdf"), g2, width = 4.2, height = 3.2)

# Synthetic control vs Switzerland, all items (cf. Fig. 4 of the paper)
r1 <- sdid_category(catmap$code[1], reps = 2); w <- attr(r1$est, "weights")
fig4 <- tibble(month = 1:24, Switzerland = r1$setup$Y[r1$setup$N0 + 1, ],
               Synthetic = colSums(w$omega * r1$setup$Y[1:r1$setup$N0, ])) |>
  pivot_longer(-month, names_to = "series")
g4 <- ggplot(fig4, aes(month, value, colour = series)) + geom_vline(xintercept = 13, linetype = "dotted") +
  geom_line(linewidth = 0.8) + scale_colour_manual(values = c(Switzerland = "#2a78d6", Synthetic = "#eb6834"), name = NULL) +
  scale_x_continuous(breaks = seq(1, 24, 3), labels = mlab[seq(1, 24, 3)]) +
  labs(x = NULL, y = "HICP, Jan 2015 = 100", title = "Switzerland and its synthetic control")
ggsave(file.path(OUT, "fig4_replication.pdf"), g4, width = 4.2, height = 3.2)
write_csv(tibble(country = rownames(r1$setup$Y)[1:r1$setup$N0], weight = w$omega), file.path(DATA_OURS, "synthetic_weights_all_items.csv"))
cat("Outputs written to", DATA_OURS, "and", OUT, "\n")
