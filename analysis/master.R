# Replication of Oktay (2022), "Heterogeneity in the exchange rate pass-through to consumer prices:
# the Swiss franc appreciation of 2015", Swiss Journal of Economics and Statistics 158:21.
#
# Run from the repository root:   Rscript analysis/master.R
# First time: Rscript analysis/install_packages.R
# Runtime: a few seconds with the stored results in analysis/output/cache/; about 2.5 hours from scratch
# (placebo standard errors). To recompute everything: delete analysis/output/cache/ or run with FORCE <- TRUE.
#
# Script                  produces
# 01_prepare_data.R       panel of 34 countries x 468 HICP series x 24 months; mapping of the paper's 85 categories
# 02_synthetic_did.R      synthetic DID for 85 categories                      -> Table 1 col. (2), Panel B
# 03_standard_did.R       standard DID and pre-trend tests, two control series -> Table 1 rows "Standard DID", "Pre-trend"
# 04_robustness.R         exclusion rules (Table 4 of the paper), pre-period rule, timing -> Table 1 col. (3), robustness
# 05_extension.R          monthly pass-through and import-share regressions    -> Table 2, Figure 2
# 06_outputs.R            writes tables/, figures/, report_numbers.csv and data/ours/

source("analysis/00_setup.R")
source("analysis/01_prepare_data.R")
source("analysis/02_synthetic_did.R")
source("analysis/03_standard_did.R")
source("analysis/04_robustness.R")
source("analysis/05_extension.R")
source("analysis/06_outputs.R")
writeLines(capture.output(sessionInfo()), file.path(OUT, "sessionInfo.txt"))
