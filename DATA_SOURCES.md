# Data sources

Primary provider: [Our World in Data](https://ourworldindata.org/).

## Downloads (`data/raw/`)

| File | URL | Role |
| --- | --- | --- |
| `owid-co2-data.csv` | https://owid-public.owid.io/data/co2/owid-co2-data.csv | **Primary** country-year extract: CO₂, population, GDP, primary energy |
| `owid-energy-data.csv` | https://owid-public.owid.io/data/energy/owid-energy-data.csv | Cross-check for primary energy; reserve for later electricity metrics |

Underlying OWID inputs include Global Carbon Project, Energy Institute Statistical Review, World Bank, and UN population estimates (see OWID codebooks).

## Units

| Field | Unit |
| --- | --- |
| `co2` | Million tonnes of CO₂ per year (territorial / production-based) |
| `population` | Persons |
| `gdp` | Total GDP, international-$ (PPP) |
| `energy_consumption` | Primary energy consumption, TWh |
| `gdp_per_capita` | International-$ per person (`gdp / population`) |
| `energy_intensity` | TWh per international-$ (`energy_consumption / gdp`) |
| `carbon_intensity` | Mt CO₂ per TWh (`co2 / energy_consumption`) |

## Inclusion rules

- Keep rows with a standard **ISO3** code (`^[A-Z]{3}$`); drop regional aggregates (World, continents, etc.).
- Require non-null, positive `population`, `gdp`, `co2`, and `energy_consumption`.
- **Do not interpolate** missing years.
- Complete Kaya rows currently span roughly **1965–2022** (GDP often lags energy/CO₂).
- Primary energy is taken from the **CO₂** bulk file. A cross-check against `owid-energy-data.csv` matches closely for most rows; a few conflict-affected countries (e.g. Yemen, Congo) can diverge by tens of percent in recent years.

## Pipeline

```bash
python src/download_data.py
python src/clean_data.py
python src/calculate_kaya.py
python src/validate_kaya.py
```

Outputs:

- `data/processed/kaya_cleaned.csv` — harmonized inputs
- `data/processed/kaya_dataset.csv` — Kaya metrics for analysis / app
- `data/processed/validation_report.txt` — Phase 1b checks

Raw and processed CSVs are gitignored; re-run the pipeline locally after clone.
