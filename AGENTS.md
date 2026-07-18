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

**Method (define in Phase 2, before Phase 4 UI):**

- Fixed time window (e.g. 2000 → latest available), documented in the notebook
- Prefer rates of change / trajectories over raw levels where fairer
- Avoid punishing late developers solely for higher current intensity
- Document scoring formulas so the leaderboard is reproducible

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
- `co2`
- `population`
- `gdp` (total, PPP)
- `gdp_per_capita`
- `energy_consumption`
- `energy_intensity` (= `energy_consumption / gdp`)
- `carbon_intensity` (= `co2 / energy_consumption`)

## Technical Requirements

### Backend / data (Python)

Libraries: `pandas`, `numpy`, `matplotlib`, `requests`

Scripts in `src/`:

| Script | Responsibility |
| --- | --- |
| `download_data.py` | Retrieve datasets into `data/raw/` |
| `clean_data.py` | ISO3 filter; harmonize; export `kaya_cleaned.csv` |
| `calculate_kaya.py` | Compute Kaya variables; export `kaya_dataset.csv` |
| `validate_kaya.py` | Phase 1b: coverage, units, identity, US spot-check |

### Frontend (later)

- React + Vite
- Default viz stack: **Plotly** (or Observable Plot) for charts; **Mapbox** or a lighter map lib for the world map
- Add **D3** only if a custom decomposition viz needs it

Priority visuals:

1. Kaya decomposition chart
2. Country comparison chart
3. Interactive world map
4. Climate solution simulator

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
3. **Phase 2** — Notebook analyzing countries; lock Kaya Score method
4. **Phase 3** — Interactive country explorer
5. **Phase 4** — Leaderboard (Kaya Score)
6. **Phase 5** — Game mechanics (satirical levers OK)
7. **Phase 6** — Polish / design

## Agent Working Rules

- Prefer smallest change that advances the current phase.
- Do not invent data, citations, or causal claims.
- Map every UI/game lever to an explicit Kaya variable when possible.
- Keep empty data directories tracked with `.gitkeep`; ignore real data files via `.gitignore`.
- Ask before expanding scope beyond the current phase.
