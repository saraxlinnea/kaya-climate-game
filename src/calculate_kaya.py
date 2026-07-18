"""Calculate Kaya identity components and export the final dataset.

Kaya identity:
    CO2 = Population × (GDP / Population) × (Energy / GDP) × (CO2 / Energy)

Units (from OWID):
    co2                 million tonnes (Mt)
    population          persons
    gdp                 total GDP, international-$ (PPP)
    energy_consumption  primary energy, TWh
    gdp_per_capita      international-$ per person
    energy_intensity    TWh per international-$
    carbon_intensity    Mt CO2 per TWh

Writes: data/processed/kaya_dataset.csv
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

PROCESSED_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"
INPUT_FILE = PROCESSED_DIR / "kaya_cleaned.csv"
OUTPUT_FILE = PROCESSED_DIR / "kaya_dataset.csv"

OUTPUT_COLUMNS = [
    "country",
    "iso_code",
    "year",
    "co2",
    "population",
    "gdp",
    "gdp_per_capita",
    "energy_consumption",
    "energy_intensity",
    "carbon_intensity",
]


def calculate(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["gdp_per_capita"] = out["gdp"] / out["population"]
    out["energy_intensity"] = out["energy_consumption"] / out["gdp"]
    out["carbon_intensity"] = out["co2"] / out["energy_consumption"]
    return out[OUTPUT_COLUMNS].sort_values(["iso_code", "year"]).reset_index(drop=True)


def main() -> None:
    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Missing {INPUT_FILE}. Run: python src/clean_data.py"
        )

    cleaned = pd.read_csv(INPUT_FILE)
    kaya = calculate(cleaned)
    kaya.to_csv(OUTPUT_FILE, index=False)
    print(
        f"Wrote {OUTPUT_FILE} "
        f"({len(kaya):,} rows, {kaya['iso_code'].nunique()} countries, "
        f"{kaya['year'].min()}–{kaya['year'].max()})"
    )


if __name__ == "__main__":
    main()
