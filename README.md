# Kaya Climate Game

Exploring the Kaya identity and climate data.

## Project structure

```
kaya-climate-game/
├── data/
│   ├── raw/          # Original downloaded data
│   └── processed/    # Cleaned / derived datasets
├── notebooks/        # Exploratory analysis
├── src/              # Data download, cleaning, and Kaya calculations
└── app/              # Future website
```

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Data pipeline (Phase 1)

See [DATA_SOURCES.md](DATA_SOURCES.md) for URLs, units, and inclusion rules.

```bash
python src/download_data.py
python src/clean_data.py
python src/calculate_kaya.py
python src/validate_kaya.py
```

- `src/download_data.py` — OWID CO₂ + energy bulk CSVs → `data/raw/`
- `src/clean_data.py` — ISO3 filter, drop incomplete rows → `kaya_cleaned.csv`
- `src/calculate_kaya.py` — Kaya intensities → `kaya_dataset.csv`
- `src/validate_kaya.py` — Phase 1b checks (US peak-and-decline, identity, coverage)
