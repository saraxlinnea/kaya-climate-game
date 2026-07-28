"""Unit tests for validate_kaya.validate() OK / FAIL paths (tiny fixtures)."""

from __future__ import annotations

import pandas as pd

from calculate_kaya import calculate
from validate_kaya import validate


def _base_row(**overrides: object) -> dict:
    row = {
        "country": "United States",
        "iso_code": "USA",
        "year": 2019,
        "co2": 5055.0,
        "consumption_co2": 5500.0,
        "population": 330_000_000.0,
        "gdp": 2.1e13,
        "energy_consumption": 25000.0,
    }
    row.update(overrides)
    return row


def test_validate_ok_on_clean_fixture() -> None:
    years = list(range(1990, 2021))
    rows = []
    for y in years:
        # Mild peak-and-decline so US spot-check narrative stays sensible
        co2 = 5500.0 if y < 2005 else 5055.0 - (y - 2005) * 10
        rows.append(
            _base_row(
                year=y,
                co2=co2,
                population=280_000_000.0 + (y - 1990) * 1_500_000.0,
                gdp=1.2e13 + (y - 1990) * 2e11,
                energy_consumption=24000.0 + (y - 1990) * 20.0,
            )
        )
    df = calculate(pd.DataFrame(rows))
    report = validate(df)
    assert "OK required columns present" in report
    assert "OK all iso_code values are ISO3" in report
    assert "OK identity reconstructs co2" in report
    assert "FAIL missing columns" not in report
    assert "FAIL duplicate iso_code-year rows" not in report
    assert "FAIL all iso_code values are ISO3" not in report


def test_validate_fail_on_bad_iso_and_duplicate() -> None:
    good = _base_row()
    bad_iso = _base_row(country="Bad", iso_code="us", year=2020)
    dup = _base_row(year=2019)  # same USA 2019
    df = calculate(pd.DataFrame([good, bad_iso, dup]))
    report = validate(df)
    assert "FAIL all iso_code values are ISO3" in report
    assert "FAIL duplicate iso_code-year rows" in report


def test_validate_fail_missing_column() -> None:
    df = pd.DataFrame(
        [
            {
                "country": "X",
                "iso_code": "XXX",
                "year": 2000,
                "co2": 1.0,
                "population": 1.0,
                "gdp": 1.0,
                # missing energy and derived cols on purpose
            }
        ]
    )
    report = validate(df)
    assert "FAIL missing columns" in report
