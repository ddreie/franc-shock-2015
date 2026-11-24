# Synthetic DID (Arkhangelsky et al., 2021) for each category, following section 5 of the author's code:
# drop the K_EXCL control countries with the highest price variance (over all 24 months, as in the code),
# drop countries with missing months, estimate with synthdid, placebo standard errors.

sdid_category <- function(code, k = K_EXCL, var_months = 1:24, seed = SEED, reps = REPS) {
  d <- panel[panel$code == code, c("country", "month", "value")]
  v <- d |> filter(country != "Switzerland", month %in% var_months) |>
    group_by(country) |> summarise(v = var(value), .groups = "drop") |> arrange(desc(v))  # NA variance sorts last
  drop_vol <- if (k > 0) head(v$country[!is.na(v$v)], k) else character(0)
  complete <- d |> group_by(country) |> summarise(ok = all(!is.na(value)), .groups = "drop") |> filter(ok) |> pull(country)
  d <- d |> filter(!country %in% drop_vol, country %in% complete) |>
    mutate(treated = as.integer(country == "Switzerland" & month > T0)) |> as.data.frame()
  setup <- panel.matrices(d, unit = "country", time = "month", outcome = "value", treatment = "treated")
  est <- synthdid_estimate(setup$Y, setup$N0, setup$T0)
  set.seed(seed)
  se <- sqrt(vcov(est, method = "placebo", replications = reps))[1]
  list(tau = as.numeric(est), se = se, n_controls = setup$N0, est = est, setup = setup)
}

sdid <- cached("sdid_main", plapply(seq_len(nrow(catmap)), function(i) {
  r <- sdid_category(catmap$code[i], seed = SEED + i)
  tibble(name = catmap$name[i], code = catmap$code[i], sdid = r$tau, sdid_se = r$se, n_controls = r$n_controls)
}) |> bind_rows() |> mutate(pt = pass_through(sdid)))

cat("Synthetic DID, all items:", round(sdid$sdid[1], 2), "(", round(sdid$sdid_se[1], 2), "), pass-through",
    round(sdid$pt[1], 2), "\n")
