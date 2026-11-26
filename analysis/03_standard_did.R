# Standard DID (paper eq. 3) and pre-trend tests (eq. 1-2) against an aggregate European control series.
# Two control series:
#   "europe33": the GDP-weighted 33-country aggregate described in the paper. Prepared by the author
#               (data/author_prepared/dataset_final_normalized2015.dta); the GDP weights are not in the original
#               package, so this series cannot be rebuilt from the raw data and is used unchanged.
#   "highgdp":  the 10-country high-GDP aggregate, which the author's code actually uses, because the loop in section 3
#               of "Main analysis.Rmd" overwrites df before the DID in section 4. Rebuilt here from the raw panel.
# Standard errors: OLS and HAC (sandwich::vcovHAC defaults), cf. Table 4 rows "Standard" and "Standard with HAC".
# Output: std (85 categories x 2 control series), pretrend_fail (counts of failed pre-trend tests).

load_aggregate <- function(file) {
  d <- read_dta(file.path(DATA_PREP, file)) |> zap_labels()
  d |> mutate(group = ifelse(country == 2, "Switzerland", "Control")) |>
    select(group, month, starts_with("x_")) |>
    pivot_longer(starts_with("x_"), names_to = "code", values_to = "value") |>
    mutate(code = as.integer(sub("x_", "", code)))
}

# 10 countries with the highest GDP per capita (paper, section 6): simple mean per month over the countries with data,
# as in the author's data_preparation_alternative_controls.do. As there, a series with 15 or more missing values
# (out of 48: control mean and Switzerland) is dropped.
HIGHGDP <- c("Luxembourg", "Ireland", "Norway", "Denmark", "Netherlands", "Iceland", "Austria", "Sweden", "Germany", "Belgium")
highgdp_aggregate <- function() {
  ctrl <- panel |> filter(country %in% HIGHGDP) |> group_by(code, month) |>
    summarise(value = mean(value, na.rm = TRUE), .groups = "drop") |>
    mutate(group = "Control", value = ifelse(is.nan(value), NA_real_, value))
  ch <- panel |> filter(country == "Switzerland") |> mutate(group = "Switzerland")
  bind_rows(ctrl, ch) |> select(group, month, code, value) |>
    group_by(code) |> mutate(value = if (sum(is.na(value)) >= 15) NA_real_ else value) |> ungroup()
}

std_did <- function(agg, code) {
  d <- agg[agg$code == code, ] |>
    mutate(post = as.integer(month > T0), ch = as.integer(group == "Switzerland"))
  if (anyNA(d$value) || nrow(d) != 48) return(tibble(did = NA_real_, did_se_ols = NA_real_, did_se = NA_real_))
  m <- lm(value ~ ch + post + ch:post, data = d)
  tibble(did = coef(m)[["ch:post"]],
         did_se_ols = sqrt(vcov(m)["ch:post", "ch:post"]),
         did_se = sqrt(vcovHAC(m)["ch:post", "ch:post"]))
}

pretrend <- function(agg, code) {
  d <- agg[agg$code == code & agg$month <= 12, ]
  if (anyNA(d$value) || nrow(d) != 24) return(tibble(pretrend = NA_real_, pretrend_se = NA_real_))
  f <- function(g) summary(lm(value ~ month, data = d[d$group == g, ]))$coefficients[2, 1:2]
  eu <- f("Control"); ch <- f("Switzerland")
  tibble(pretrend = eu[1] - ch[1], pretrend_se = sqrt(eu[2]^2 + ch[2]^2))
}

std <- list()
for (ctrl in c("europe33", "highgdp")) {
  agg <- if (ctrl == "europe33") load_aggregate("dataset_final_normalized2015.dta") else highgdp_aggregate()
  std[[ctrl]] <- bind_rows(lapply(catmap$code, function(k) bind_cols(std_did(agg, k), pretrend(agg, k)))) |>
    mutate(name = catmap$name, control = ctrl, .before = 1)
}
std <- bind_rows(std) |> mutate(pt = pass_through(did))

# Number of categories whose pre-trend difference is significant (two-sided z-test) at 1/5/10 %
pretrend_fail <- std |> filter(!is.na(pretrend)) |> group_by(control) |>
  summarise(n = n(), fail_1 = sum(abs(pretrend / pretrend_se) > qnorm(0.995)),
            fail_5 = sum(abs(pretrend / pretrend_se) > qnorm(0.975)),
            fail_10 = sum(abs(pretrend / pretrend_se) > qnorm(0.95)), .groups = "drop")
paper_fail <- paper |> filter(!is.na(pretrend)) |>
  summarise(control = "paper", n = n(), fail_1 = sum(abs(pretrend / pretrend_se) > qnorm(0.995)),
            fail_5 = sum(abs(pretrend / pretrend_se) > qnorm(0.975)), fail_10 = sum(abs(pretrend / pretrend_se) > qnorm(0.95)))
pretrend_fail <- bind_rows(pretrend_fail, paper_fail)
s <- std |> filter(name == "All-items HICP")
cat("Standard DID, all items:", paste0(s$control, " ", round(s$did, 2), " (", round(s$did_se, 2), ")", collapse = "; "), "\n")
