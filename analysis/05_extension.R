# Extension: speed of pass-through. Month-by-month synthetic DID effects with the weights of the main
# specification (eq. curve in the report), then a cross-category OLS of early / late pass-through on the SFSO import share.
# Output: monthly (85 categories x 11 months), speed (early/late per category with placebo SEs), ext_table (Table 2 of
# the report), fx_variant (all-items pass-through with the monthly EUR/CHF change instead of the fixed -10.07 %).

monthly_effects <- function(est, setup) {
  w <- attr(est, "weights"); Y <- setup$Y; N0 <- setup$N0; T0 <- setup$T0
  gap <- Y[N0 + 1, ] - colSums(w$omega * Y[1:N0, , drop = FALSE])     # Switzerland minus synthetic control
  gap[(T0 + 1):ncol(Y)] - sum(w$lambda * gap[1:T0])                   # tau_s for each post month
}

# Placebo distribution of the monthly effects: each control country in turn plays Switzerland,
# weights are re-estimated among the remaining controls (as in synthdid's placebo method).
monthly_placebo <- function(setup) {
  Yc <- setup$Y[1:setup$N0, ]
  sapply(seq_len(nrow(Yc)), function(j) {
    Yp <- rbind(Yc[-j, ], Yc[j, ])
    e <- synthdid_estimate(Yp, nrow(Yp) - 1, setup$T0)
    monthly_effects(e, list(Y = Yp, N0 = nrow(Yp) - 1, T0 = setup$T0))
  })                                                                  # 11 months x N0 placebo draws
}

EARLY <- 14:16; LATE <- 22:24   # Feb-Apr and Oct-Dec 2015
mo <- cached("monthly_v2", plapply(seq_len(nrow(catmap)), function(i) {
  r <- sdid_category(catmap$code[i], reps = 2)
  tau_s <- monthly_effects(r$est, r$setup)
  P <- monthly_placebo(r$setup)
  e <- EARLY - T0; l <- LATE - T0
  list(monthly = tibble(name = catmap$name[i], month = (T0 + 1):24, tau = tau_s, se = apply(P, 1, sd)),
       window = tibble(name = catmap$name[i],
                       tau_early = mean(tau_s[e]), tau_late = mean(tau_s[l]),
                       se_early = sd(colMeans(P[e, , drop = FALSE])), se_late = sd(colMeans(P[l, , drop = FALSE])),
                       se_change = sd(colMeans(P[l, , drop = FALSE]) - colMeans(P[e, , drop = FALSE]))))
}))
monthly <- bind_rows(lapply(mo, `[[`, "monthly")) |> mutate(pt = pass_through(tau), pt_se = abs(se / 100 / DELTA_S))
chk <- monthly |> group_by(name) |> summarise(m = mean(tau)) |> left_join(sdid, by = "name")
stopifnot(max(abs(chk$m - chk$sdid)) < 1e-6)  # the 11 monthly effects average to the main estimate

isfso <- read_csv(file.path(DATA_RAW, "SFSO_import_shares_data.csv"), locale = locale(encoding = "CP437"), show_col_types = FALSE)
to_pt <- function(x) x / 100 / DELTA_S
speed <- bind_rows(lapply(mo, `[[`, "window")) |>
  mutate(pt_early = to_pt(tau_early), pt_late = to_pt(tau_late), pt_change = pt_late - pt_early,
         pt_early_se = abs(to_pt(se_early)), pt_late_se = abs(to_pt(se_late)), pt_change_se = abs(to_pt(se_change))) |>
  left_join(sdid |> select(name, pt_1y = pt), by = "name") |>
  left_join(catmap |> select(name, sfso_label), by = "name") |>
  left_join(isfso, by = c("sfso_label" = "Goodtype"))

ext_data <- speed |> filter(!is.na(importshare), name != "All-items HICP")
ext_models <- list(
  "|PT 1y|" = lm(abs(pt_1y) ~ importshare, ext_data),
  "PT 1y"   = lm(pt_1y ~ importshare, ext_data),
  "PT early"= lm(pt_early ~ importshare, ext_data),
  "PT late" = lm(pt_late ~ importshare, ext_data),
  "Change"  = lm(pt_change ~ importshare, ext_data)
)
ext_table <- bind_rows(lapply(names(ext_models), function(n) {
  m <- ext_models[[n]]; ct <- coeftest(m, vcov. = vcovHC(m, type = "HC1"))
  tibble(dep = n, b = ct["importshare", 1], se = ct["importshare", 2], a = ct[1, 1], a_se = ct[1, 2],
         n = nobs(m), r2 = summary(m)$r.squared)
}))

# Variant: pass-through with the monthly EUR/CHF change (monthly averages, SNB) relative to 14.01.2015
fx <- read_csv(file.path(DATA_RAW, "eurchf_monthly_snb.csv"), show_col_types = FALSE)
dS_m <- (fx$eurchf[(T0 + 1):24] - FX_BEFORE) / FX_BEFORE
all_m <- monthly |> filter(name == "All-items HICP")
fx_variant <- tibble(month = all_m$month, pt_fixed = all_m$pt, pt_monthly_fx = (all_m$tau / 100) / dS_m)
print(ext_table)
