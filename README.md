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

## Scripts

- `src/download_data.py` — fetch raw data into `data/raw/`
- `src/clean_data.py` — clean raw data into `data/processed/`
- `src/calculate_kaya.py` — compute Kaya identity components
