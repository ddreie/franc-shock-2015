# Setup: packages, paths and constants. Sourced by master.R; run everything from the repository root.
invisible(Sys.setlocale("LC_CTYPE", "C.UTF-8"))
suppressPackageStartupMessages({
  library(dplyr); library(tidyr); library(readr); library(haven)
  library(sandwich); library(lmtest); library(synthdid); library(parallel)
})

DATA_AUTHOR <- "data/author"    # raw inputs from the author's replication package (unchanged)
DATA_OURS   <- "data/ours"      # our results, read by the website
OUT         <- "analysis/output"
dir.create(DATA_OURS, showWarnings = FALSE, recursive = TRUE)
dir.create(OUT, showWarnings = FALSE, recursive = TRUE)

# Exchange rate change used for the pass-through (paper eq. 4): EUR/CHF 14.01.2015 -> 31.12.2015
DELTA_S <- (1.08 - 1.201) / 1.201   # -10.07 %
T0      <- 13                       # pre-treatment months: Jan 2014 - Jan 2015 (treatment from Feb 2015, as in the code)
K_EXCL  <- 10                       # number of most volatile control countries dropped per category
REPS    <- 200                      # placebo replications for synthetic DID standard errors
SEED    <- 2015                     # base seed (category i uses SEED + i)

pass_through <- function(tau) (tau / 100) / DELTA_S
stars <- function(est, se) { t <- abs(est / se); ifelse(t > 2.576, "***", ifelse(t > 1.96, "**", ifelse(t > 1.645, "*", ""))) }

# Cache for slow steps (placebo SEs): results are stored in analysis/output/cache/.
# Delete that folder, or set FORCE <- TRUE before sourcing, to recompute everything from scratch.
if (!exists("FORCE")) FORCE <- FALSE
cached <- function(name, expr) {
  f <- file.path(OUT, "cache", paste0(name, ".rds"))
  if (!FORCE && file.exists(f)) return(readRDS(f))
  x <- expr; dir.create(dirname(f), showWarnings = FALSE); saveRDS(x, f); x
}

# Categories are independent and each sets its own seed, so they can run in parallel (Linux/macOS).
CORES <- if (.Platform$OS.type == "unix") max(1, detectCores() - 1) else 1
plapply <- function(X, FUN) mclapply(X, FUN, mc.cores = CORES, mc.set.seed = FALSE)
