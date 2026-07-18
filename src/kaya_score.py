"""Kaya Champion score — Phase 2 locked method.

Window: 2000 → latest available year (must be ≥ 2018).
Components (rates of change, not levels):
  - Decarbonization (30): CO₂ % change (decrease rewarded)
  - Prosperity (25): GDP per capita % change (increase rewarded)
  - Efficiency (20): energy intensity % change (decrease rewarded)
  - Clean energy (25): carbon intensity % change (decrease rewarded)

See SCORING.md for full specification.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd

PROCESSED_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"
DEFAULT_DATASET = PROCESSED_DIR / "kaya_dataset.csv"

START_YEAR = 2000
MIN_END_YEAR = 2018

# Component weights (sum = 1.0)
WEIGHT_DECARBONIZATION = 0.30
WEIGHT_PROSPERITY = 0.25
WEIGHT_EFFICIENCY = 0.20
WEIGHT_CLEAN = 0.25

# Clip bounds for mapping % change → 0–100 component scores
# For invert=True metrics, lo (more negative) → 100, hi → 0
CLIP_CO2 = (-0.40, 0.80)  # −40% → 100, +80% → 0
CLIP_GDP_PC = (-0.10, 1.00)  # −10% → 0, +100% → 100
CLIP_EI = (-0.50, 0.20)  # −50% → 100, +20% → 0
CLIP_CI = (-0.40, 0.30)  # −40% → 100, +30% → 0

# Default leaderboard eligibility (start-year thresholds)
MIN_POPULATION = 1_000_000
MIN_CO2_MT = 5.0


@dataclass(frozen=True)
class ScoreConfig:
    start_year: int = START_YEAR
    min_end_year: int = MIN_END_YEAR
    min_population: float | None = MIN_POPULATION
    min_co2_mt: float | None = MIN_CO2_MT


def pct_change(start: float, end: float) -> float:
    return (end - start) / start


def clip_score(value: float, low: float, high: float, *, invert: bool) -> float:
    """Map value in [low, high] to [0, 100]."""
    if high == low:
        return 0.0
    if invert:
        score = 100.0 * (high - value) / (high - low)
    else:
        score = 100.0 * (value - low) / (high - low)
    return float(np.clip(score, 0.0, 100.0))


def _end_row(group: pd.DataFrame, min_end_year: int) -> pd.Series | None:
    recent = group[group["year"] >= min_end_year]
    if recent.empty:
        return None
    return recent.sort_values("year").iloc[-1]


def country_window_metrics(
    df: pd.DataFrame, config: ScoreConfig | None = None
) -> pd.DataFrame:
    """One row per eligible country with start/end levels and % changes."""
    cfg = config or ScoreConfig()
    rows: list[dict] = []

    for iso, group in df.groupby("iso_code"):
        group = group.sort_values("year")
        start = group[group["year"] == cfg.start_year]
        if start.empty:
            continue
        start_row = start.iloc[0]
        end_row = _end_row(group, cfg.min_end_year)
        if end_row is None:
            continue

        if cfg.min_population is not None and start_row["population"] < cfg.min_population:
            continue
        if cfg.min_co2_mt is not None and start_row["co2"] < cfg.min_co2_mt:
            continue

        rows.append(
            {
                "country": start_row["country"],
                "iso_code": iso,
                "start_year": int(start_row["year"]),
                "end_year": int(end_row["year"]),
                "population_start": float(start_row["population"]),
                "co2_start": float(start_row["co2"]),
                "co2_end": float(end_row["co2"]),
                "gdp_per_capita_start": float(start_row["gdp_per_capita"]),
                "gdp_per_capita_end": float(end_row["gdp_per_capita"]),
                "energy_intensity_start": float(start_row["energy_intensity"]),
                "energy_intensity_end": float(end_row["energy_intensity"]),
                "carbon_intensity_start": float(start_row["carbon_intensity"]),
                "carbon_intensity_end": float(end_row["carbon_intensity"]),
                "co2_pct": pct_change(start_row["co2"], end_row["co2"]),
                "gdp_per_capita_pct": pct_change(
                    start_row["gdp_per_capita"], end_row["gdp_per_capita"]
                ),
                "energy_intensity_pct": pct_change(
                    start_row["energy_intensity"], end_row["energy_intensity"]
                ),
                "carbon_intensity_pct": pct_change(
                    start_row["carbon_intensity"], end_row["carbon_intensity"]
                ),
            }
        )

    return pd.DataFrame(rows)


def score_countries(
    df: pd.DataFrame, config: ScoreConfig | None = None
) -> pd.DataFrame:
    """Return scored country table sorted by kaya_score descending."""
    metrics = country_window_metrics(df, config)
    if metrics.empty:
        return metrics

    out = metrics.copy()
    out["score_decarbonization"] = [
        clip_score(v, *CLIP_CO2, invert=True) for v in out["co2_pct"]
    ]
    out["score_prosperity"] = [
        clip_score(v, *CLIP_GDP_PC, invert=False) for v in out["gdp_per_capita_pct"]
    ]
    out["score_efficiency"] = [
        clip_score(v, *CLIP_EI, invert=True) for v in out["energy_intensity_pct"]
    ]
    out["score_clean"] = [
        clip_score(v, *CLIP_CI, invert=True) for v in out["carbon_intensity_pct"]
    ]
    out["kaya_score"] = (
        WEIGHT_DECARBONIZATION * out["score_decarbonization"]
        + WEIGHT_PROSPERITY * out["score_prosperity"]
        + WEIGHT_EFFICIENCY * out["score_efficiency"]
        + WEIGHT_CLEAN * out["score_clean"]
    )
    return out.sort_values("kaya_score", ascending=False).reset_index(drop=True)


def log_kaya_decomposition(start: pd.Series, end: pd.Series) -> dict[str, float]:
    """Additive log decomposition of CO₂ change across Kaya factors."""

    def dln(a: float, b: float) -> float:
        return float(np.log(b) - np.log(a))

    parts = {
        "dln_population": dln(start["population"], end["population"]),
        "dln_gdp_per_capita": dln(start["gdp_per_capita"], end["gdp_per_capita"]),
        "dln_energy_intensity": dln(start["energy_intensity"], end["energy_intensity"]),
        "dln_carbon_intensity": dln(start["carbon_intensity"], end["carbon_intensity"]),
    }
    parts["dln_co2"] = dln(start["co2"], end["co2"])
    parts["dln_co2_sum_parts"] = sum(
        parts[k]
        for k in (
            "dln_population",
            "dln_gdp_per_capita",
            "dln_energy_intensity",
            "dln_carbon_intensity",
        )
    )
    return parts


def load_kaya_dataset(path: Path | None = None) -> pd.DataFrame:
    dataset = path or DEFAULT_DATASET
    if not dataset.exists():
        raise FileNotFoundError(
            f"Missing {dataset}. Run the Phase 1 pipeline first."
        )
    return pd.read_csv(dataset)


def main() -> None:
    df = load_kaya_dataset()
    scored = score_countries(df)
    out = PROCESSED_DIR / "kaya_scores.csv"
    scored.to_csv(out, index=False)
    print(f"Wrote {out} ({len(scored)} countries)")
    print(scored.head(10)[["country", "kaya_score", "co2_pct", "gdp_per_capita_pct"]].to_string(index=False))


if __name__ == "__main__":
    main()
