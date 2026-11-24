# Replication of Oktay (2022) – runs the whole analysis from the raw data.
# Run from the repository root:  Rscript analysis/master.R   (about 35 minutes; the placebo SEs take most of it)
# Software: R 4.3.3, synthdid 0.0.9 (github.com/synth-inference/synthdid), sandwich, lmtest, dplyr, tidyr, readr, haven, ggplot2.

source("analysis/00_setup.R")
source("analysis/01_prepare_data.R")   # raw HICP -> panel; category mapping
source("analysis/02_synthetic_did.R")  # main result: synthetic DID for 85 categories
source("analysis/03_standard_did.R")   # standard DID and pre-trend tests (two control series)
source("analysis/04_robustness.R")     # exclusion rule and timing
source("analysis/05_extension.R")      # extension: speed of pass-through
source("analysis/06_outputs.R")        # CSVs for the website, tables and figures for the report
writeLines(capture.output(sessionInfo()), file.path(OUT, "sessionInfo.txt"))
