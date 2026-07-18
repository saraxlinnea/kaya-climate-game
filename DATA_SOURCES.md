# Data sources

Primary provider: [Our World in Data](https://ourworldindata.org/).  
Electricity layer: [Ember](https://ember-energy.org/).

## Downloads (`data/raw/`)

| File | URL | Role |
| --- | --- | --- |
| `owid-co2-data.csv` | https://owid-public.owid.io/data/co2/owid-co2-data.csv | **Primary** country-year extract: CO₂, population, GDP, primary energy |
| `owid-energy-data.csv` | https://owid-public.owid.io/data/energy/owid-energy-data.csv | Cross-check for primary energy |
| `ember_yearly_electricity.csv` | https://files.ember-energy.org/public-downloads/generation/outputs/release_generation_yearly_global.csv | Grid / power-sector emissions intensity (gCO₂e/kWh) |

Underlying OWID inputs include Global Carbon Project, Energy Institute Statistical Review, World Bank, and UN population estimates (see OWID codebooks). Ember aggregates national and multi-country electricity statistics (CC-BY-4.0).

## Units

| Field | Unit |
| --- | --- |
| `co2` | Million tonnes of CO₂ per year (territorial / production-based) |
| `consumption_co2` | Million tonnes (consumption-based; trade-adjusted; often missing) |
| `population` | Persons |
| `gdp` | Total GDP, international-$ (PPP) |
| `energy_consumption` | Primary energy consumption, TWh |
| `gdp_per_capita` | International-$ per person (`gdp / population`) |
| `energy_intensity` | TWh per international-$ (`energy_consumption / gdp`) |
| `carbon_intensity` | Mt CO₂ per TWh (`co2 / energy_consumption`) |
| `electricity_carbon_intensity` | gCO₂e/kWh (Ember total-generation intensity; may be missing) |

## Inclusion rules

- Keep rows with a standard **ISO3** code (`^[A-Z]{3}$`); drop regional aggregates (World, continents, etc.).
- Require non-null, positive `population`, `gdp`, `co2`, and `energy_consumption`.
- **Do not interpolate** missing years.
- Complete Kaya rows currently span roughly **1965–2022** (GDP often lags energy/CO₂).
- Primary energy is taken from the **CO₂** bulk file. A cross-check against `owid-energy-data.csv` matches closely for most rows; a few conflict-affected countries (e.g. Yemen, Congo) can diverge by tens of percent in recent years.
- Ember intensity is joined on `iso_code` + `year` (left join). Combat EV payoff uses it when present.

## Pipeline

```bash
python src/download_data.py
python src/clean_data.py
python src/process_ember.py
python src/calculate_kaya.py
python src/validate_kaya.py
python src/kaya_score.py
python src/export_app_data.py
```

Outputs:

- `data/processed/kaya_cleaned.csv` — harmonized OWID inputs
- `data/processed/ember_grid_intensity.csv` — Ember country-year grid intensity
- `data/processed/kaya_dataset.csv` — Kaya metrics (+ optional grid intensity) for analysis / app
- `data/processed/validation_report.txt` — Phase 1b checks

Raw and processed CSVs are gitignored; re-run the pipeline locally after clone.
