# Extension: speed of pass-through. Month-by-month synthetic DID effects with the weights of the main
# specification, then a cross-category regression of early / late pass-through on the SFSO import share.

monthly_effects <- function(est, setup) {
  w <- attr(est, "weights"); Y <- setup$Y; N0 <- setup$N0; T0 <- setup$T0
  gap <- Y[N0 + 1, ] - colSums(w$omega * Y[1:N0, , drop = FALSE])     # Switzerland minus synthetic control
  gap[(T0 + 1):ncol(Y)] - sum(w$lambda * gap[1:T0])                   # tau_s for each post month
}

# Placebo standard errors for the monthly effects: each control country in turn plays Switzerland,
# weights are re-estimated among the remaining controls (as in synthdid's placebo method).
monthly_placebo_se <- function(setup) {
  Yc <- setup$Y[1:setup$N0, ]
  reps <- sapply(seq_len(nrow(Yc)), function(j) {
    Yp <- rbind(Yc[-j, ], Yc[j, ])
    e <- synthdid_estimate(Yp, nrow(Yp) - 1, setup$T0)
    monthly_effects(e, list(Y = Yp, N0 = nrow(Yp) - 1, T0 = setup$T0))
  })
  apply(reps, 1, sd)
}

isfso <- read_csv(file.path(DATA_AUTHOR, "SFSO_import_shares_data.csv"), locale = locale(encoding = "CP437"),
                  show_col_types = FALSE)

monthly <- cached("monthly", plapply(seq_len(nrow(catmap)), function(i) {
  r <- sdid_category(catmap$code[i], reps = 2)
  tau_s <- monthly_effects(r$est, r$setup)
  se_s <- monthly_placebo_se(r$setup)
  tibble(name = catmap$name[i], month = (T0 + 1):24, tau = tau_s, se = se_s)
}) |> bind_rows() |>
  mutate(pt = pass_through(tau), pt_se = abs(se / 100 / DELTA_S)))

chk <- monthly |> group_by(name) |> summarise(m = mean(tau)) |> left_join(sdid, by = "name")
stopifnot(max(abs(chk$m - chk$sdid)) < 1e-6)  # the 11 monthly effects average to the main estimate

speed <- monthly |>
  mutate(window = case_when(month %in% 14:16 ~ "early", month %in% 22:24 ~ "late")) |>
  filter(!is.na(window)) |>
  group_by(name, window) |> summarise(pt = mean(pt), .groups = "drop") |>
  pivot_wider(names_from = window, values_from = pt, names_prefix = "pt_") |>
  mutate(pt_change = pt_late - pt_early) |>
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
print(ext_table)
