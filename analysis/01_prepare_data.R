# Raw HICP data -> long panel (country x category x month).
# Mirrors the author's Stata step (data_preparation_synthetic.do) in R:
# categories are numbered alphabetically as in Codebook.csv; non-numeric entries become missing.

raw <- read_csv(file.path(DATA_RAW, "Dataset_normalized2015.csv"), show_col_types = FALSE,
                col_types = cols(.default = col_character()))
names(raw)[1:2] <- c("country", "label")
codebook <- read_csv(file.path(DATA_RAW, "Codebook.csv"), show_col_types = FALSE)
names(codebook) <- c("code", "label")
codebook$label <- sub("caf\\S*s and", "caf\u00e9s and", codebook$label)  # repair mis-encoded "cafés" in the codebook

panel <- raw |>
  pivot_longer(-c(country, label), names_to = "mlab", values_to = "value") |>
  mutate(month = match(mlab, names(raw)[-(1:2)]),
         value = suppressWarnings(as.numeric(value))) |>
  left_join(codebook, by = "label") |>
  select(country, code, label, month, value)

stopifnot(!any(is.na(panel$code)), n_distinct(panel$country) == 34, max(panel$month) == 24)

# The 85 categories of Tables 5-8 and their Eurostat series (see category_map.csv for the choices made)
catmap <- read_csv("analysis/category_map.csv", show_col_types = FALSE) |>
  left_join(codebook, by = c("eurostat_label" = "label"))
stopifnot(!any(is.na(catmap$code)), nrow(catmap) == 85)

paper <- read_csv(file.path(DATA_PAPER, "paper_tables_5to8.csv"), show_col_types = FALSE)
cat("Panel:", n_distinct(panel$country), "countries,", n_distinct(panel$code), "series, 24 months\n")
