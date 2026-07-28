# Claims inventory (credibility)

Lightweight claim list for user-facing facts on Landing, Methods, explorer score UI, and related copy.
Statuses follow wildfire-style discipline without a full PASS/FAIL audit log yet.

| Status | Meaning |
| --- | --- |
| **Supported** | Tied to OWID/Ember (or other cited public data) or to a locked site method file |
| **Site method** | Homemade ranking or product rule documented in `SCORING.md` / app code |
| **Modeled** | Toy combat indices or illustrative game outputs, not forecasts |
| **Editorial** | Framing, navigation, or teaching language (not a numeric claim) |

Confidence: **high** / **medium** / **low**.

Update this file when landing, Methods, score UI, or explorer narrative wording changes in a material way.

---

## Landing

| ID | Claim | Source | Status | Confidence |
| --- | --- | --- | --- | --- |
| C-L01 | CO₂ can be written as the product of population, income per person, energy per dollar of output, and CO₂ per unit of energy (Kaya identity). | Kaya (1990); IPCC/IEA-style accounting; Methods | Supported | high |
| C-L02 | The Kaya identity helps explain which parts of the system moved when emissions changed; it does not predict the future. | Methods; standard use of identity | Supported | high |
| C-L03 | Kaya Champion is this site’s own score: rewards cutting emissions while raising living standards and improving efficiency since 2000. | `SCORING.md`; Methods | Site method | high |
| C-L04 | Other dashboards (per-person emissions, CO₂ per GDP, consumption footprints) answer different questions than trajectory scoring. | Methods | Supported | high |
| C-L05 | Combat fights start from real country energy intensity and carbon intensity; the game is a learning puzzle, not advice. | Combat seed (`engine.ts`); Methods combat section | Modeled (seeded) | high |
| C-L06 | Leaderboard ranks growth with cleaner energy, not lowest absolute emissions. | `SCORING.md`; Leaderboard copy | Site method | high |

---

## Methods

| ID | Claim | Source | Status | Confidence |
| --- | --- | --- | --- | --- |
| C-M01 | IPCC and IEA use Kaya-style / factor accounting to explain emissions change (not as a single-cause story). | Methods prose; IPCC/IEA practice (general) | Supported | medium |
| C-M02 | Champion score is not an official IPCC or IEA indicator. | `SCORING.md`; Methods | Site method | high |
| C-M03 | Champion rewards rates of change, not already being clean or low emissions per person today. | `SCORING.md`; Methods | Site method | high |
| C-M04 | From 2000 to 2022, U.S. territorial emissions fell about 16% and Canada’s about 3%, with similar income growth (Methods example). | OWID-derived `kaya_dataset` / explorer; Methods | Supported | medium |
| C-M05 | Primary data: Our World in Data CO₂ bulk extract (GCP, Energy Institute, World Bank, UN population). | `DATA_SOURCES.md`; `download_data.py` | Supported | high |
| C-M06 | Charts and the identity use territorial CO₂; consumption CO₂ is an overlay when OWID provides it; Champion stays territorial. | `DATA_SOURCES.md`; Methods; `SCORING.md` | Supported | high |
| C-M07 | Score window: 2000 through latest year ≥ 2018 (currently 2022 for eligible countries). | `SCORING.md` | Site method | high |
| C-M08 | Eligibility: population ≥ 1e6 and CO₂ ≥ 5 Mt in 2000. | `SCORING.md` | Site method | high |
| C-M09 | Weights: decarbonization 30, prosperity 25, efficiency 20, clean energy 25. | `SCORING.md`; Methods | Site method | high |
| C-M10 | Ember electricity carbon intensity (gCO₂e/kWh) is optional and used for grid-aware EV/heat-pump payoffs in combat. | `DATA_SOURCES.md`; `process_ember.py`; combat engine | Supported / Modeled | high |
| C-M11 | Combat outputs are modeled / satirical toy indices, not calibrated forecasts. | Combat UI labels; Methods | Modeled | high |
| C-M12 | `validate_kaya.py` checks schema, ISO concordance, identity reconstruction, and a US peak-and-decline spot-check. | `src/validate_kaya.py` | Supported | high |

---

## Explorer score UI and rankings / map

| ID | Claim | Source | Status | Confidence |
| --- | --- | --- | --- | --- |
| C-S01 | Kaya Champion is a trajectory score for a stated window, not lowest absolute emissions and not “how clean today.” | ScorePanel / Leaderboard / map disclaimer; `SCORING.md` | Site method | high |
| C-S02 | Countries missing from scores fail default eligibility (population / emissions size in 2000) or lack complete data. | `SCORING.md`; ScorePanel empty state | Site method | high |
| C-S03 | Transition economies often rank high after 2000 because efficiency and growth both improved; that is a feature of the method. | `SCORING.md`; Leaderboard note | Site method | medium |
| C-S04 | Map color is relative among scored countries for the chosen metric, not absolute emissions. | WorldMap copy | Site method | high |

---

## Explorer narratives (mechanical)

| ID | Claim | Source | Status | Confidence |
| --- | --- | --- | --- | --- |
| C-N01 | “Emissions changed because…” bullets are percent changes of Kaya factors and CO₂ from the loaded country series (first→last year in the explorer window). | `narrative.ts` + `kaya_dataset` | Supported | high |
| C-N02 | Chart peak / “GDP up, CO₂ down” callouts are derived only from that country’s series. | `co2ChartAnnotations` in `narrative.ts` | Supported | high |
| C-N03 | Curated country blurbs and external links are tied to OWID / Ember / Carbon Brief profiles where listed. | `countrySources.ts` | Supported | medium |

---

## Combat (inventory only; no feature work this pass)

| ID | Claim | Source | Status | Confidence |
| --- | --- | --- | --- | --- |
| C-G01 | Pressure, prosperity, and action deltas in combat are modeled estimates. | Battle UI badges | Modeled | high |
| C-G02 | Factor bars are seeded from country EI/CI vs peer medians; population and prosperity start at 100. | `engine.ts` seed | Modeled | high |

---

## How to extend

1. Add a row before shipping a new numeric or causal sentence on Landing, Methods, explorer, rankings, or map.
2. Prefer **Supported** with a file or URL; use **Site method** for Champion rules; **Modeled** for combat.
3. After material copy changes, skim this file and Methods “How we check ourselves.”
