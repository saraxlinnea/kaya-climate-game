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
└── app/              # React + Vite country explorer
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
python src/process_ember.py
python src/calculate_kaya.py
python src/validate_kaya.py
python src/kaya_score.py
python src/export_app_data.py
```

- `src/download_data.py` — OWID CO₂ + energy bulk CSVs → `data/raw/`
- `src/clean_data.py` — ISO3 filter, drop incomplete rows → `kaya_cleaned.csv`
- `src/calculate_kaya.py` — Kaya intensities → `kaya_dataset.csv`
- `src/validate_kaya.py` — Phase 1b checks
- `src/kaya_score.py` — locked Kaya Champion score → `kaya_scores.csv`
- `src/export_app_data.py` — copy CSVs into `app/public/data/` for the explorer

Scoring spec: [SCORING.md](SCORING.md). Analysis notebook: `notebooks/02_kaya_score.ipynb`.

## Country explorer (Phase 3)

```bash
python src/export_app_data.py   # if public data is missing
cd app
npm install
npm run dev
```

Open the local URL (usually http://localhost:5173). Routes:

- `/` — landing
- `/country/:iso` — explorer for that ISO3 code
- `/compare` — side-by-side country trajectories (`?a=USA&b=CHN`)
- `/map` — world choropleth of Kaya Champion scores (click a country → explorer)
- `/rankings` — Kaya Champion leaderboard (filter by decoupling, CO₂ cut, prosperity, efficiency, clean energy)
- `/battle/:iso` — Kaya Combat mini-game (satirical policy levers + tradeoffs)
- `/methods` — data sources, scoring, limitations

Explorer shows metrics, CO₂ timeline (territorial / consumption when available), indexed Kaya factors, log decomposition, auto narrative, territorial-vs-consumption story when data exist, and Kaya Score when eligible.

## Deploy (GitHub Pages)

Workflows:

- `.github/workflows/ci.yml` — `npm run build` on push/PR
- `.github/workflows/deploy-pages.yml` — build with `VITE_BASE=/kaya-climate-game/` and publish

One-time repo setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Live URL (after first successful deploy): `https://saraxlinnea.github.io/kaya-climate-game/`

