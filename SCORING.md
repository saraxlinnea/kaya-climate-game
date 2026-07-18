# Kaya Champion scoring

Locked in Phase 2. Implementation: `src/kaya_score.py`.  
Exploration: `notebooks/02_kaya_score.ipynb`.

## Goal

Rank countries on **successful decoupling**: prosperity up while emissions and intensities improve — **not** lowest absolute emissions.

## Time window

| Parameter | Value |
| --- | --- |
| Start year | **2000** (fixed) |
| End year | Latest available year for that country, must be **≥ 2018** |
| Current data | End year is **2022** for eligible countries |

Rates of change use start vs end levels. Missing start or end → country ineligible.

## Eligibility (default leaderboard)

At **start year (2000)**:

- Standard ISO3 country (already enforced in `kaya_dataset.csv`)
- Population ≥ **1,000,000**
- CO₂ ≥ **5 Mt**

Size filters reduce tiny-emitter % volatility. For research, call `score_countries(..., ScoreConfig(min_population=None, min_co2_mt=None))`.

## Components and weights

| Component | Metric | Direction rewarded | Weight |
| --- | --- | --- | --- |
| Decarbonization | % change in total CO₂ | Decrease | **30%** |
| Prosperity | % change in GDP per capita (PPP) | Increase | **25%** |
| Efficiency | % change in energy intensity (E/GDP) | Decrease | **20%** |
| Clean energy | % change in carbon intensity (CO₂/E) | Decrease | **25%** |

\[
\text{kaya\_score} = 0.30\,S_{\text{dec}} + 0.25\,S_{\text{pros}} + 0.20\,S_{\text{eff}} + 0.25\,S_{\text{clean}}
\]

Each \(S\) is on a **0–100** scale. Total score is also **0–100**.

## Mapping % change → component score

Linear clip maps (product choice, locked for v1):

| Component | 100 pts at | 0 pts at | Invert |
| --- | --- | --- | --- |
| Decarbonization | CO₂ −40% | CO₂ +80% | yes |
| Prosperity | GDP/cap +100% | GDP/cap −10% | no |
| Efficiency | EI −50% | EI +20% | yes |
| Clean energy | CI −40% | CI +30% | yes |

Values outside the interval clamp to 0 or 100.

```text
pct = (end - start) / start
# invert=True (lower pct is better):
S = clip(100 * (high - pct) / (high - low), 0, 100)
# invert=False (higher pct is better):
S = clip(100 * (pct - low) / (high - low), 0, 100)
```

## What this does / does not claim

- Rewards **trajectories**, not current cleanliness levels (so late developers are not punished only for high intensity today).
- Does **not** measure historical responsibility, consumption-based emissions, or equity of carbon budgets.
- Eastern European “transition” economies often rank high: real efficiency gains + growth after 2000 — call that out in UI copy, don’t hide it.
- Fast-growing emitters (e.g. China, India in this window) can score well on prosperity/efficiency and poorly on decarbonization → **mixed** total by design.

## Reproduce

```bash
python src/calculate_kaya.py   # if needed
python src/kaya_score.py       # writes data/processed/kaya_scores.csv
```

## Future (not locked yet)

Possible v2 knobs: alternate windows (1990 / peak-to-present), percentile ranks instead of clips, separate “most improved” vs “best decoupling” boards. Change only with a version bump in this file and `AGENTS.md`.
