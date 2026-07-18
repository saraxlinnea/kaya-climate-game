"""Clean and harmonize OWID raw data into a country-year table.

Primary source: owid-co2-data.csv (already contains CO₂, population, GDP,
and primary energy). ISO3 is the join key; country names are display-only.

Writes: data/processed/kaya_cleaned.csv
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
PROCESSED_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"

CO2_FILE = RAW_DIR / "owid-co2-data.csv"
ENERGY_FILE = RAW_DIR / "owid-energy-data.csv"
OUTPUT_FILE = PROCESSED_DIR / "kaya_cleaned.csv"

# Core OWID columns used for the Kaya pipeline.
CO2_COLUMNS = [
    "country",
    "year",
    "iso_code",
    "population",
    "gdp",
    "co2",
    "primary_energy_consumption",
]

# Aggregates / regions in OWID often lack a true 3-letter ISO code.
MIN_ISO_LEN = 3
MAX_ISO_LEN = 3


def load_co2() -> pd.DataFrame:
    if not CO2_FILE.exists():
        raise FileNotFoundError(
            f"Missing {CO2_FILE}. Run: python src/download_data.py"
        )
    df = pd.read_csv(CO2_FILE, usecols=CO2_COLUMNS)
    return df.rename(
        columns={
            "gdp": "gdp",
            "co2": "co2",
            "primary_energy_consumption": "energy_consumption",
        }
    )


def is_country_row(iso_code: pd.Series) -> pd.Series:
    """Keep sovereign/territory rows with standard ISO3 codes."""
    code = iso_code.fillna("").astype(str)
    return code.str.len().eq(MIN_ISO_LEN) & code.str.match(r"^[A-Z]{3}$")


def clean(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out = out[is_country_row(out["iso_code"])].copy()
    out["year"] = out["year"].astype(int)

    # Require all Kaya inputs present; do not interpolate gaps.
    required = ["population", "gdp", "co2", "energy_consumption"]
    before = len(out)
    out = out.dropna(subset=required)
    # Intensities need positive denominators / emissions scale.
    out = out[
        (out["population"] > 0)
        & (out["gdp"] > 0)
        & (out["co2"] > 0)
        & (out["energy_consumption"] > 0)
    ]
    print(
        f"Dropped {before - len(out):,} rows with missing/non-positive "
        f"population, gdp, co2, or energy."
    )

    out = out.sort_values(["iso_code", "year"]).reset_index(drop=True)
    out = out[
        [
            "country",
            "iso_code",
            "year",
            "population",
            "gdp",
            "co2",
            "energy_consumption",
        ]
    ]
    return out


def crosscheck_energy(cleaned: pd.DataFrame) -> None:
    """Optional sanity check against the OWID energy bulk file."""
    if not ENERGY_FILE.exists():
        print("Energy file not found; skipping cross-check.")
        return

    energy = pd.read_csv(
        ENERGY_FILE,
        usecols=["iso_code", "year", "primary_energy_consumption"],
    )
    energy = energy.rename(columns={"primary_energy_consumption": "energy_alt"})
    energy = energy[is_country_row(energy["iso_code"])]
    merged = cleaned.merge(energy, on=["iso_code", "year"], how="inner")
    merged = merged.dropna(subset=["energy_alt"])
    if merged.empty:
        print("Energy cross-check: no overlapping rows.")
        return

    rel_diff = (
        (merged["energy_consumption"] - merged["energy_alt"]).abs()
        / merged["energy_consumption"]
    )
    max_diff = float(rel_diff.max())
    mean_diff = float(rel_diff.mean())
    print(
        f"Energy cross-check vs owid-energy-data.csv: "
        f"mean rel diff={mean_diff:.2e}, max={max_diff:.2e} "
        f"(n={len(merged):,})"
    )


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    raw = load_co2()
    cleaned = clean(raw)
    crosscheck_energy(cleaned)
    cleaned.to_csv(OUTPUT_FILE, index=False)
    print(
        f"Wrote {OUTPUT_FILE} "
        f"({len(cleaned):,} rows, {cleaned['iso_code'].nunique()} countries, "
        f"{cleaned['year'].min()}–{cleaned['year'].max()})"
    )


if __name__ == "__main__":
    main()
