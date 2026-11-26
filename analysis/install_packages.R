# Installs the packages used by the replication (versions used for the report in brackets).
# R 4.3.3. synthdid is not on CRAN: it is installed from GitHub at the commit we used (version 0.0.9).
cran <- c("dplyr",    # 1.1.4
          "tidyr",    # 1.3.1
          "readr",    # 2.1.5
          "haven",    # 2.5.4
          "sandwich", # 3.1.0
          "lmtest",   # 0.9-40
          "ggplot2",  # 3.4.4
          "remotes")
missing <- cran[!vapply(cran, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing)) install.packages(missing, repos = "https://cloud.r-project.org")
if (!requireNamespace("synthdid", quietly = TRUE) || packageVersion("synthdid") != "0.0.9")
  remotes::install_github("synth-inference/synthdid@70c1ce3eac58e28c30b67435ca377bb48baa9b8a", upgrade = "never")
