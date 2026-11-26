# Robustness of the synthetic DID.
# (a) Table 4 of the paper: synthetic DID excluding 0 / 5 / 10 / 15 of the most volatile countries, all 85 categories,
#     with placebo standard errors (k = 10 is the main specification from 02_synthetic_did.R).
# (b) Volatility measured over the pre-period only (Jan 2014 - Jan 2015) instead of all 24 months.
# (c) January 2015 counted as treated (T0 = 12).
# Output: sdid_k (Table 4 rows), rob_all (all-items robustness, Table 1 col. 3 and text), prerule (85 categories).

sdid_k <- bind_rows(lapply(c(0, 5, 15), function(k) cached(paste0("sdid_k", k), plapply(seq_len(nrow(catmap)), function(i) {
  r <- sdid_category(catmap$code[i], k = k, seed = SEED + i)
  tibble(name = catmap$name[i], sdid = r$tau, sdid_se = r$se)
}) |> bind_rows() |> mutate(k = k, pt = pass_through(sdid))))) |>
  bind_rows(sdid |> select(name, sdid, sdid_se, pt) |> mutate(k = K_EXCL))

prerule <- cached("prerule_categories", plapply(seq_len(nrow(catmap)), function(i) {
  tibble(name = catmap$name[i], sdid = sdid_category(catmap$code[i], var_months = 1:T0, reps = 2)$tau)
}) |> bind_rows() |> mutate(pt = pass_through(sdid)))

pre_all <- cached("prerule_allitems", sdid_category(catmap$code[1], var_months = 1:T0, seed = SEED + 1)[c("tau", "se")])
jan_all <- cached("jan_treated", sdid_category(catmap$code[1], seed = SEED + 1, t0 = 12)[c("tau", "se")])
k0_all  <- sdid_k |> filter(k == 0, name == "All-items HICP")

rob_all <- tibble(
  spec = c("No exclusion of volatile countries", "Volatility measured Jan 2014 - Jan 2015 only", "January 2015 treated (T0 = 12)"),
  sdid = c(k0_all$sdid, pre_all$tau, jan_all$tau),
  se   = c(k0_all$sdid_se, pre_all$se, jan_all$se)) |>
  mutate(pt = pass_through(sdid))
print(rob_all)
