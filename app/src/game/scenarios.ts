export type CombatScenario = {
  id: string
  iso: string
  label: string
  blurb: string
}

/** Curated arenas that teach different Kaya / grid lessons. */
export const COMBAT_SCENARIOS: CombatScenario[] = [
  {
    id: 'usa',
    iso: 'USA',
    label: 'United States',
    blurb: 'Large emitter; moderate grid — classic decoupling puzzle.',
  },
  {
    id: 'fra',
    iso: 'FRA',
    label: 'France',
    blurb: 'Clean nuclear grid — electrify vehicles actually bites.',
  },
  {
    id: 'pol',
    iso: 'POL',
    label: 'Poland',
    blurb: 'Coal-heavy power — EVs struggle until the grid cleans up.',
  },
  {
    id: 'chn',
    iso: 'CHN',
    label: 'China',
    blurb: 'Scale + growth pressure — intensity must outrun affluence.',
  },
  {
    id: 'swe',
    iso: 'SWE',
    label: 'Sweden',
    blurb: 'Already-lean intensities — harder to look like a hero.',
  },
]
