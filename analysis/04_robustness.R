# Robustness of the synthetic DID (all items and category means):
# (a) no exclusion of volatile countries, (b) volatility measured over the pre-period only,
# (c) January 2015 counted as treated.

rob_spec <- function(label, ...) {
  r <- plapply(seq_len(nrow(catmap)), function(i) sdid_category(catmap$code[i], seed = SEED + i, ...)$tau)
  tibble(spec = label, name = catmap$name, sdid = unlist(r))
}
rob <- cached("robustness", bind_rows(
  rob_spec("No exclusion of volatile countries", k = 0, reps = 2),
  rob_spec("Volatility measured Jan 2014 - Jan 2015 only", var_months = 1:T0, reps = 2)
))
# January treated: shift T0 by one month for the all-items series only
T0_main <- T0; T0 <- 12
jan <- cached("jan_treated", sdid_category(catmap$code[1], seed = SEED + 1)[c("tau", "se")])
T0 <- T0_main
rob_all <- rob |> filter(name == "All-items HICP") |> select(spec, sdid) |>
  bind_rows(tibble(spec = "January 2015 treated (T0 = 12)", sdid = jan$tau)) |>
  mutate(pt = pass_through(sdid))
print(rob_all)
