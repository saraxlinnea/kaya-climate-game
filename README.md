# Kaya Climate Game

Exploring the Kaya identity and climate data.

## Build status (what works today)

**Live site:** [https://saraxlinnea.github.io/kaya-climate-game/](https://saraxlinnea.github.io/kaya-climate-game/)

| Surface | Status | What a visitor can do |
| --- | --- | --- |
| Data pipeline (`src/`) | Complete | Reproducible OWID + Ember → Kaya CSVs. Demo CSVs ship in `app/public/data/` so the site runs without re-downloading. |
| Country explorer | Complete | Charts, narrative, score for a country |
| Compare / map / rankings / methods | Complete | Side-by-side pairs, world map, leaderboard, sources and scoring |
| Kaya Combat (`/battle/:iso`) | Playable; polish and labeling in progress | Country-seeded toy policy game. Pressure, bars, and move effects are **modeled / satirical**, not forecasts. Sparse or cartoonish UI is unfinished polish, not a failed data load. |

**Demo links (open on the live site):**

- Explorer: [`/country/USA`](https://saraxlinnea.github.io/kaya-climate-game/country/USA)
- Compare: [`/compare?a=USA&b=CHN`](https://saraxlinnea.github.io/kaya-climate-game/compare?a=USA&b=CHN)
- Combat: [`/battle/USA`](https://saraxlinnea.github.io/kaya-climate-game/battle/USA)

Those same paths are linked from the homepage.

## Project structure

```
kaya-climate-game/
├── data/
│   ├── raw/          # Original downloaded data
│   └── processed/    # Cleaned / derived datasets
├── notebooks/        # Exploratory analysis
├── src/              # Data download, cleaning, and Kaya calculations
├── tests/            # pytest for pipeline math / validation
├── test/             # Node citation + credibility checks
├── research/         # claims inventory (credibility)
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
- `/country/:iso` — explorer for that ISO3 code (try `/country/USA`)
- `/compare` — side-by-side country trajectories (`?a=USA&b=CHN`)
- `/map` — world choropleth of Kaya Champion scores (click a country → explorer)
- `/rankings` — Kaya Champion leaderboard (filter by decoupling, CO₂ cut, prosperity, efficiency, clean energy)
- `/battle/:iso` — Kaya Combat mini-game (modeled / satirical policy levers; not forecasts)
- `/methods` — data sources, scoring, limitations

Explorer shows metrics, CO₂ timeline (territorial / consumption when available), indexed Kaya factors, log decomposition, auto narrative, territorial-vs-consumption story when data exist, and Kaya Score when eligible.

## Tests

```bash
# Pipeline math (no network; tiny fixtures)
pytest

# Every dataset URL cited in DATA_SOURCES.md must appear in app/, src/, or Methods
node --test test/citations.test.js

# Kaya Combat engine invariants + light balance smoke (demo CSV)
cd app && npm test
```

CI runs the app build, app combat tests, pytest, and the Node citation test on push/PR.

Combat difficulty notes: [`COMBAT_BALANCE.md`](COMBAT_BALANCE.md).

## Deploy (GitHub Pages)

Workflows:

- `.github/workflows/ci.yml` — app build, combat Vitest, pytest, citation test on push/PR
- `.github/workflows/deploy-pages.yml` — build with `VITE_BASE=/kaya-climate-game/` and publish

One-time repo setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Live URL (after first successful deploy): `https://saraxlinnea.github.io/kaya-climate-game/`
