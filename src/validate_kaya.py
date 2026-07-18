"""Phase 1b validation: concordance, missingness, units, US spot-check.

Reads: data/processed/kaya_dataset.csv
Writes: data/processed/validation_report.txt
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

PROCESSED_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"
DATASET = PROCESSED_DIR / "kaya_dataset.csv"
REPORT = PROCESSED_DIR / "validation_report.txt"

REQUIRED_COLS = [
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


def section(title: str) -> str:
    return f"\n## {title}\n"


def validate(df: pd.DataFrame) -> str:
    lines: list[str] = ["# Kaya dataset validation report", ""]

    # --- schema ---
    lines.append(section("Schema"))
    missing_cols = [c for c in REQUIRED_COLS if c not in df.columns]
    if missing_cols:
        lines.append(f"FAIL missing columns: {missing_cols}")
    else:
        lines.append("OK required columns present")
    lines.append(f"rows={len(df):,} countries={df['iso_code'].nunique()} "
                 f"years={df['year'].min()}–{df['year'].max()}")

    # --- concordance ---
    lines.append(section("Country concordance"))
    iso_ok = df["iso_code"].astype(str).str.match(r"^[A-Z]{3}$").all()
    lines.append(f"{'OK' if iso_ok else 'FAIL'} all iso_code values are ISO3")
    dupes = df.duplicated(subset=["iso_code", "year"]).sum()
    lines.append(f"{'OK' if dupes == 0 else 'FAIL'} duplicate iso_code-year rows: {dupes}")
    name_map = df.groupby("iso_code")["country"].nunique()
    multi_name = name_map[name_map > 1]
    if multi_name.empty:
        lines.append("OK each iso_code maps to a single country name")
    else:
        lines.append(f"WARN iso_codes with multiple names: {list(multi_name.index)}")

    # --- missingness / coverage ---
    lines.append(section("Missingness and coverage"))
    nulls = df[REQUIRED_COLS].isna().sum()
    lines.append("null counts:\n" + nulls.to_string())
    since_1990 = df[df["year"] >= 1990]
    years_per = since_1990.groupby("iso_code").size()
    lines.append(
        f"countries with ≥20 complete years since 1990: "
        f"{(years_per >= 20).sum()} / {years_per.size}"
    )
    lines.append(
        f"countries with ≥10 complete years since 1990: "
        f"{(years_per >= 10).sum()} / {years_per.size}"
    )

    # --- units sanity ---
    lines.append(section("Units sanity (USA 2019 if available)"))
    us = df[(df["iso_code"] == "USA") & (df["year"] == 2019)]
    if us.empty:
        lines.append("WARN no USA 2019 row")
    else:
        row = us.iloc[0]
        lines.append(
            f"population={row['population']:,.0f} "
            f"(expect ~3.3e8)\n"
            f"gdp={row['gdp']:.3e} intl-$ "
            f"(expect ~1e13)\n"
            f"gdp_per_capita={row['gdp_per_capita']:,.0f} "
            f"(expect ~5e4)\n"
            f"co2={row['co2']:,.1f} Mt "
            f"(expect ~5000)\n"
            f"energy_consumption={row['energy_consumption']:,.1f} TWh "
            f"(expect ~2.5e4)\n"
            f"energy_intensity={row['energy_intensity']:.3e} TWh/intl-$\n"
            f"carbon_intensity={row['carbon_intensity']:.4f} Mt/TWh"
        )
        pop_ok = 2.5e8 < row["population"] < 4e8
        gdp_ok = 1e13 < row["gdp"] < 3e13
        co2_ok = 4000 < row["co2"] < 7000
        energy_ok = 20000 < row["energy_consumption"] < 35000
        lines.append(
            f"{'OK' if pop_ok and gdp_ok and co2_ok and energy_ok else 'FAIL'} "
            "USA 2019 magnitudes in expected ballpark"
        )

    # identity check: co2 ≈ pop * (gdp/pop) * (E/gdp) * (co2/E)
    lines.append(section("Kaya identity reconstruction"))
    recon = (
        df["population"]
        * df["gdp_per_capita"]
        * df["energy_intensity"]
        * df["carbon_intensity"]
    )
    rel_err = (recon - df["co2"]).abs() / df["co2"]
    lines.append(
        f"max relative reconstruction error={rel_err.max():.2e}, "
        f"median={rel_err.median():.2e}"
    )
    lines.append(
        f"{'OK' if rel_err.max() < 1e-9 else 'FAIL'} "
        "identity reconstructs co2 (floating-point tolerance)"
    )

    # --- US spot-check narrative ---
    lines.append(section("Spot-check: United States peak-and-decline"))
    us_all = df[df["iso_code"] == "USA"].sort_values("year")
    if us_all.empty:
        lines.append("FAIL no USA rows")
    else:
        window = us_all[us_all["year"] >= 1990]
        peak_year = int(window.loc[window["co2"].idxmax(), "year"])
        peak_co2 = float(window["co2"].max())
        start = window.iloc[0]
        end = window.iloc[-1]

        def pct(a: float, b: float) -> float:
            return 100.0 * (b - a) / a

        lines.append(
            f"window {int(start['year'])}–{int(end['year'])}\n"
            f"CO2 peak year={peak_year} at {peak_co2:,.1f} Mt\n"
            f"population change={pct(start['population'], end['population']):+.1f}%\n"
            f"gdp_per_capita change={pct(start['gdp_per_capita'], end['gdp_per_capita']):+.1f}%\n"
            f"energy_intensity change={pct(start['energy_intensity'], end['energy_intensity']):+.1f}%\n"
            f"carbon_intensity change={pct(start['carbon_intensity'], end['carbon_intensity']):+.1f}%\n"
            f"co2 change={pct(start['co2'], end['co2']):+.1f}%"
        )

        # Known story: US emissions peaked ~2000s, later below earlier levels
        # while population and GDP/person rose; intensities fell.
        peaked_mid = 2000 <= peak_year <= 2008
        pop_up = end["population"] > start["population"]
        gdp_up = end["gdp_per_capita"] > start["gdp_per_capita"]
        ei_down = end["energy_intensity"] < start["energy_intensity"]
        ci_down = end["carbon_intensity"] < start["carbon_intensity"]
        co2_down_from_peak = end["co2"] < peak_co2 * 0.95

        checks = {
            "peak around 2000–2008": peaked_mid,
            "population up": pop_up,
            "gdp_per_capita up": gdp_up,
            "energy_intensity down": ei_down,
            "carbon_intensity down": ci_down,
            "latest CO2 clearly below peak": co2_down_from_peak,
        }
        for label, ok in checks.items():
            lines.append(f"{'OK' if ok else 'FAIL'} {label}")

        if all(checks.values()):
            lines.append(
                "PASS US narrative: emissions fell from peak despite growth, "
                "via lower energy and carbon intensity."
            )
        else:
            lines.append("FAIL US narrative checks; inspect series before UI work.")

    # France / China quick glances (informational)
    lines.append(section("Informational: France and China carbon intensity"))
    for iso in ("FRA", "CHN"):
        sub = df[(df["iso_code"] == iso) & (df["year"] >= 1990)].sort_values("year")
        if len(sub) < 2:
            lines.append(f"{iso}: insufficient data")
            continue
        s, e = sub.iloc[0], sub.iloc[-1]
        lines.append(
            f"{iso} {int(s['year'])}–{int(e['year'])}: "
            f"carbon_intensity {s['carbon_intensity']:.4f} → {e['carbon_intensity']:.4f}, "
            f"co2 {s['co2']:.1f} → {e['co2']:.1f} Mt"
        )

    return "\n".join(lines).strip() + "\n"


def main() -> None:
    if not DATASET.exists():
        raise FileNotFoundError(
            f"Missing {DATASET}. Run: python src/calculate_kaya.py"
        )
    df = pd.read_csv(DATASET)
    report = validate(df)
    REPORT.write_text(report)
    print(report)
    print(f"Wrote {REPORT}")
    if "FAIL" in report:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
