# Standard DID (paper eq. 3) and pre-trend tests (eq. 1-2) against an aggregate European control series.
# Two control series:
#   "europe33": the author's GDP-weighted 33-country aggregate (dataset_final_normalized2015.dta),
#               which is what the paper describes;
#   "highgdp":  the 10-country high-GDP aggregate (alternative_highgdp.dta), which the author's code
#               actually uses, because the loop in section 3 of "Main analysis.Rmd" overwrites df.
# Standard errors: HAC (sandwich::vcovHAC defaults), as in Table 4 "Standard with HAC".

load_aggregate <- function(file) {
  d <- read_dta(file.path(DATA_AUTHOR, file)) |> zap_labels()
  d |> mutate(group = ifelse(country == 2, "Switzerland", "Control")) |>
    select(group, month, starts_with("x_")) |>
    pivot_longer(starts_with("x_"), names_to = "code", values_to = "value") |>
    mutate(code = as.integer(sub("x_", "", code)))
}

std_did <- function(agg, code) {
  d <- agg[agg$code == code, ] |>
    mutate(post = as.integer(month > T0), ch = as.integer(group == "Switzerland"))
  if (anyNA(d$value) || nrow(d) != 48) return(tibble(did = NA_real_, did_se = NA_real_))
  m <- lm(value ~ ch + post + ch:post, data = d)
  ct <- coeftest(m, vcov. = vcovHAC(m))
  tibble(did = ct["ch:post", 1], did_se = ct["ch:post", 2])
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
  agg <- load_aggregate(c(europe33 = "dataset_final_normalized2015.dta", highgdp = "alternative_highgdp.dta")[ctrl])
  std[[ctrl]] <- bind_rows(lapply(catmap$code, function(k) bind_cols(std_did(agg, k), pretrend(agg, k)))) |>
    mutate(name = catmap$name, control = ctrl, .before = 1)
}
std <- bind_rows(std)
s <- std |> filter(name == "All-items HICP")
cat("Standard DID, all items:", paste0(s$control, " ", round(s$did, 2), " (", round(s$did_se, 2), ")", collapse = "; "), "\n")
