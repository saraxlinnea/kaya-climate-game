# Combat balance notes

Light, qualitative notes from the Pass D smoke test (`test/combat-balance.test.ts`).
This is **not** a calibrated win-rate study. Numbers change when demo CSVs or action multipliers change.

## Contract (locked)

- Win: emissions pressure ≤ 60 and prosperity ≥ 70 within the turn cap (default 8).
- Each action: max 3 uses, diminishing returns.
- EV / heat-pump strength follows Ember grid intensity vs peers when present (not in-fight clean-power moves).
- BAU drift each turn from country history (population + affluence).

## Smoke method

For **USA, FRA, POL, CHN** (latest year in `app/public/data/kaya_dataset.csv`):

1. Seed with peer medians for energy intensity, carbon intensity, and Ember grid.
2. Run a fixed intensity-first script (no hail-mary, no grow):

   `coal_retire → solar → buildings → coal_retire → nuclear → efficiency_industry → solar → buildings`

3. Check pressure/prosperity stay finite and pressure falls below 100.

## What to expect (qualitative)

| Arena | Typical seed feel | Script notes |
| --- | --- | --- |
| **FRA** | Cleaner carbon / grid vs peers | Often the easiest of the four for electrify payoff; intensity script should land well |
| **USA** | Mid pack | Winnable with clean power + efficiency; BAU growth still bites |
| **POL** | Dirtier carbon / coal-heavy grid | Harder EV path; coal retire + clean power matter more |
| **CHN** | Scale + growth BAU | Intensity must outrun affluence/population drift; script may not always win |

Re-run after multiplier or CSV updates:

```bash
cd app && npm test
```

If FRA no longer seeds cleaner than POL, or EV preview no longer favors FRA’s grid, treat that as a data or seeding bug before retuning actions.

## When to retune

Only if smoke shows an obvious break, for example:

- Script leaves pressure ≥ 100 on every arena (cuts too weak or BAU absurd).
- Easy free wins with one action repeated three times and flat BAU.
- Prosperity collapses from normal efficiency moves (floor too harsh).

Prefer documenting over silent retunes. Version narrative in this file if you change multipliers.
