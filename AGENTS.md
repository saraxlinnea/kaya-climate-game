# AGENTS.md — Kaya Climate Game

Guidance for AI agents working in this repository. Follow this brief unless the user overrides it.

## Overview

Build an interactive climate education and data visualization website based on the **Kaya Identity** (Yoichi Kaya), which decomposes CO₂ emissions into four drivers:

\[
CO_2 = Population \times \frac{GDP}{Population} \times \frac{Energy}{GDP} \times \frac{CO_2}{Energy}
\]

Goal: a scientifically grounded but fun experience that helps users understand why countries' emissions rise or fall, and how climate solutions map to different parts of the system.

Combine:

- climate science
- data visualization
- climate policy literacy
- game mechanics
- storytelling

Tone:

- engaging, **satirical**, and intentionally a bit simplistic in the **game** layer so people can play
- scientifically rigorous in the **data / explorer / explanations** layer
- accessible to non-experts

Reference feel: Bloomberg-style data viz + climate science communication + satirical interactive game mechanics.

**Dual register:** the game can be blunt and cartoonish (including population-policy levers). The explorer and copy must still show systems, tradeoffs, and avoid treating any single lever as “the answer.”

## Core Concept

Working title: **"Kaya Combat: Fight the CO₂ Monster"**

The user explores how countries change their emissions over time.

In educational surfaces, avoid simplistic claims such as:

- "population is the problem" (as the sole framing)
- "individual choices solve climate change"
- "renewables solve everything"

In the **game**, players may still pull blunt levers (including satirical population policies). Every action must map to a Kaya variable and surface tradeoffs.

| Solution / action | Main Kaya impact |
| --- | --- |
| Solar energy | Decreases carbon intensity |
| Energy efficiency | Decreases energy intensity |
| Electrification | Decreases carbon intensity if electricity becomes cleaner |
| Economic development | Increases GDP per capita; may raise emissions unless paired with efficiency/decarbonization |
| One-child / fertility policy (satirical game lever) | Decreases population trajectory; show social/ethical/economic tradeoffs, not a free win |
| Reduce consumption | Decreases energy demand (clarify vs reducing economic activity / GDP framing) |

## Main User Experiences

### 1. Country Explorer

User selects a country (e.g. United States) and views roughly **1990 → latest available year** (do not hard-code 2024; use `max(year)` available per series).

Metrics:

- Population — how population changed
- GDP per capita — how wealth changed
- Energy intensity — how efficiently the economy uses energy
- Carbon intensity — how clean the energy system is
- Total CO₂ emissions

Then explain: **"Emissions changed because..."**

Example narrative (United States):

- population increased
- GDP increased
- energy efficiency improved
- electricity became cleaner
- Result: emissions declined after peak despite economic growth

### 2. Kaya Score

Ranking system. Do **not** rank countries simply by lowest emissions (a small poor country should not automatically win).

Evaluate:

- **Decarbonization** — Did CO₂ emissions decrease?
- **Prosperity** — Did GDP per capita increase?
- **Efficiency** — Did energy intensity decrease?
- **Clean energy** — Did carbon intensity decrease?

Goal: highlight countries that achieved **economic growth + emissions reduction**.

**Method (locked in Phase 2):** see [`SCORING.md`](SCORING.md) and `src/kaya_score.py`.

- Window: **2000 → latest year ≥ 2018** (currently 2022)
- Rates of change (not levels); clip-mapped to 0–100; weights **30 / 25 / 20 / 25**
- Default eligibility: population ≥ 1e6 and CO₂ ≥ 5 Mt in 2000
- Notebook: `notebooks/02_kaya_score.ipynb`

### 3. Climate Solution Game

Satirical / simplistic combat framing is intentional. The CO₂ Monster has four health bars:

- Population
- Energy intensity
- Carbon intensity
- Economic activity

Example actions:

| Action | Effect |
| --- | --- |
| Build solar | Carbon intensity decreases |
| Improve buildings | Energy intensity decreases |
| Electrify vehicles | Transportation carbon intensity decreases |
| Reduce consumption | Decreases energy demand (map explicitly; do not silently equate to “GDP is bad”) |
| One-child policy (satirical) | Slows/reduces population; must show sharp tradeoffs (rights, aging, economy), not a pure climate win |

Population levers are allowed in the game. They must still teach that population is only one interacting factor, not a silver bullet.

## Data Requirements

Use reliable public datasets. Primary source: **Our World in Data**.

Prefer a **small number of trusted OWID downloads** (often one energy/CO₂ bulk extract already includes many fields) over four brittle separate merges when the columns already exist. Still keep a clear pipeline: download → clean → calculate.

Required variables (concepts):

| Domain | Fields |
| --- | --- |
| CO₂ emissions | country, year, annual CO₂ emissions |
| Population | country, year, population |
| GDP | country, year, **total GDP (PPP)** and GDP per capita (PPP) |
| Energy | country, year, primary energy consumption |

## Data Pipeline

`data/raw/` — original downloads (filenames may be one bulk file or splits such as `co2.csv`, `population.csv`, `gdp.csv`, `energy.csv`). Document sources and URLs in code or README when added.

`data/processed/` — derived output:

- `kaya_dataset.csv`

Processed columns:

- `country`
- `year`
- `co2` (territorial)
- `consumption_co2` (trade-adjusted; often missing)
- `population`
- `gdp` (total, PPP)
- `gdp_per_capita`
- `energy_consumption`
- `energy_intensity` (= `energy_consumption / gdp`)
- `carbon_intensity` (= `co2 / energy_consumption`)
- `electricity_carbon_intensity` (Ember gCO₂e/kWh; may be missing)

## Technical Requirements

### Backend / data (Python)

Libraries: `pandas`, `numpy`, `matplotlib`, `requests`

Scripts in `src/`:

| Script | Responsibility |
| --- | --- |
| `download_data.py` | Retrieve datasets into `data/raw/` |
| `clean_data.py` | ISO3 filter; harmonize; export `kaya_cleaned.csv` |
| `process_ember.py` | Extract Ember grid intensity → `ember_grid_intensity.csv` |
| `calculate_kaya.py` | Compute Kaya variables; join Ember; export `kaya_dataset.csv` |
| `validate_kaya.py` | Phase 1b: coverage, units, identity, US spot-check |
| `kaya_score.py` | Locked Kaya Champion score; optional `kaya_scores.csv` export |
| `export_app_data.py` | Copy processed CSVs into `app/public/data/` |

### Frontend

- React + Vite in `app/`
- Default viz: lightweight SVG charts (Plotly dropped in Phase 6 for bundle size)
- Sync data with `python src/export_app_data.py`

Routes:

| Path | Surface |
| --- | --- |
| `/` | Landing |
| `/country/:iso` | Country explorer |
| `/compare` | Side-by-side compare (`?a=&b=`) |
| `/map` | World choropleth of Kaya scores |
| `/rankings` | Leaderboard (locked `kaya_scores.csv`) |
| `/battle/:iso` | Combat mini-game |
| `/methods` | Data sources, scoring, limitations |

Priority visuals:

1. Kaya factor index chart — **done** (explorer)
2. CO₂ timeline — **done** (explorer)
3. Interactive world map — **done** (`/map`)
4. Climate solution simulator — **done** (combat)

### Combat contract (do not re-invent casually)

- Seed intensity/carbon starting pressure from the country’s latest EI/CI vs peer medians.
- BAU drift each turn; diminishing returns (max **3** uses per action).
- Win: emissions pressure ≤ 60 vs start, prosperity ≥ 70, within 8 turns.
- EV payoff uses Ember `electricity_carbon_intensity` when present.

## Scientific Requirements

Do **not** claim (especially in explorer / explainers):

- one factor alone causes emissions
- population reduction is a free or simple climate solution (even if the game lets you try it)
- GDP growth is always bad

Explain that Kaya factors **interact**. Purpose: systems understanding. Satire in the game is fine; misleading causal claims in the data product are not.

## Development Priorities

Build in this order. Do **not** build animations before the data is validated.

1. **Phase 1a** — Data pipeline (download / clean / merge / calculate)
2. **Phase 1b** — Validate country concordance, units, missingness; spot-check known stories (e.g. US peak-and-decline)
3. **Phase 2** — Notebook analyzing countries; lock Kaya Score method — **done** (`SCORING.md`, `src/kaya_score.py`, `notebooks/02_kaya_score.ipynb`)
4. **Phase 3** — Interactive country explorer — **done** (`app/`)
5. **Phase 4** — Leaderboard (Kaya Score) — **done** (`/rankings`, uses locked scores)
6. **Phase 5** — Game mechanics — **done** (`/battle/:iso`)
7. **Phase 6** — Polish / design — **done** (landing, methods, SVG charts, motion)

## Project status

**MVP shipped** (Phases 1–6 + post-phase polish). Demo CSVs live under `app/public/data/` for local `npm run dev` without re-running the full pipeline.

### Shipped post-phase work

- Country-seeded combat + BAU drift + diminishing returns
- Historical compare after combat; action hover preview; run report + badges + scenario presets
- Explorer log-decomposition chart; leaderboard “why this rank?”
- Ember grid intensity + EV payoff
- Country compare (`/compare`); consumption CO₂ toggle; world map (`/map`)
- Landing compare gallery + expanded combat scenarios
- Consumption narrative panel + Methods section; HKG/SGP map markers
- GitHub Actions CI + Pages deploy workflow

### Future / out of scope (ask before starting)

- ~~Deploy target (GitHub Pages / static host) and CI~~ — workflows in `.github/workflows/` (enable Pages in repo settings)
- Other microstates still missing from 110m polygons (beyond HKG/SGP markers)
- Rescoring on consumption CO₂ (explicitly not done; territorial scores stay canonical)

## Agent Working Rules

- Prefer smallest change that advances an **explicit** user request or agreed future item.
- Do not invent data, citations, or causal claims.
- Map every UI/game lever to an explicit Kaya variable when possible.
- Keep empty data directories tracked with `.gitkeep`; ignore real data files via `.gitignore` (demo CSVs under `app/public/data/` may be committed).
- Ask before expanding scope into “Future / out of scope.”
- Commit / push only when the user asks.
