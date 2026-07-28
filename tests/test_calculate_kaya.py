"""Unit tests for Kaya intensity calculation (no network, no full OWID)."""

from __future__ import annotations

import pandas as pd

from calculate_kaya import calculate


def test_calculate_intensities_known_values() -> None:
    df = pd.DataFrame(
        [
            {
                "country": "Testland",
                "iso_code": "TST",
                "year": 2020,
                "co2": 100.0,
                "consumption_co2": 110.0,
                "population": 10_000_000.0,
                "gdp": 500_000_000_000.0,
                "energy_consumption": 1000.0,
            }
        ]
    )
    out = calculate(df)
    assert out.loc[0, "gdp_per_capita"] == 50_000.0
    assert out.loc[0, "energy_intensity"] == 1000.0 / 500_000_000_000.0
    assert out.loc[0, "carbon_intensity"] == 100.0 / 1000.0


def test_kaya_identity_reconstructs_co2() -> None:
    df = pd.DataFrame(
        [
            {
                "country": "A",
                "iso_code": "AAA",
                "year": 2019,
                "co2": 5055.0,
                "consumption_co2": None,
                "population": 330_000_000.0,
                "gdp": 2.0e13,
                "energy_consumption": 25000.0,
            },
            {
                "country": "B",
                "iso_code": "BBB",
                "year": 2019,
                "co2": 200.0,
                "consumption_co2": 180.0,
                "population": 20_000_000.0,
                "gdp": 8.0e11,
                "energy_consumption": 800.0,
            },
        ]
    )
    out = calculate(df)
    recon = (
        out["population"]
        * out["gdp_per_capita"]
        * out["energy_intensity"]
        * out["carbon_intensity"]
    )
    rel_err = (recon - out["co2"]).abs() / out["co2"]
    assert float(rel_err.max()) < 1e-12
