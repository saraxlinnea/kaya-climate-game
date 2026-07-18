"""Extract Ember country-year electricity carbon intensity.

Reads: data/raw/ember_yearly_electricity.csv
Writes: data/processed/ember_grid_intensity.csv

Columns: iso_code, year, electricity_carbon_intensity (gCO2e/kWh)
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

RAW = Path(__file__).resolve().parents[1] / "data" / "raw" / "ember_yearly_electricity.csv"
OUT = Path(__file__).resolve().parents[1] / "data" / "processed" / "ember_grid_intensity.csv"


def process(df: pd.DataFrame) -> pd.DataFrame:
    countries = df["Area type"].eq("Country or economy")
    total = df["Electricity source"].eq("Total generation")
    out = df.loc[countries & total, ["ISO 3 code", "Year", "Emissions intensity (gCO2e/kWh)"]].copy()
    out = out.rename(
        columns={
            "ISO 3 code": "iso_code",
            "Year": "year",
            "Emissions intensity (gCO2e/kWh)": "electricity_carbon_intensity",
        }
    )
    out = out.dropna(subset=["iso_code", "year", "electricity_carbon_intensity"])
    out["iso_code"] = out["iso_code"].astype(str).str.upper()
    out = out[out["iso_code"].str.match(r"^[A-Z]{3}$")]
    out["year"] = out["year"].astype(int)
    out = out.sort_values(["iso_code", "year"]).drop_duplicates(["iso_code", "year"])
    return out.reset_index(drop=True)


def main() -> None:
    if not RAW.exists():
        raise FileNotFoundError(f"Missing {RAW}. Run: python src/download_data.py")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    raw = pd.read_csv(RAW, low_memory=False)
    cleaned = process(raw)
    cleaned.to_csv(OUT, index=False)
    print(
        f"Wrote {OUT} ({len(cleaned):,} rows, {cleaned['iso_code'].nunique()} countries, "
        f"{cleaned['year'].min()}–{cleaned['year'].max()})"
    )


if __name__ == "__main__":
    main()
