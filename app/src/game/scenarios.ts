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
  {
    id: 'deu',
    iso: 'DEU',
    label: 'Germany',
    blurb: 'Industrial base + Energiewende — efficiency and clean power together.',
  },
  {
    id: 'ind',
    iso: 'IND',
    label: 'India',
    blurb: 'Rising prosperity and population — growth under carbon pressure.',
  },
  {
    id: 'aus',
    iso: 'AUS',
    label: 'Australia',
    blurb: 'High prosperity, fossil-tilted energy — carbon intensity is the fight.',
  },
  {
    id: 'jpn',
    iso: 'JPN',
    label: 'Japan',
    blurb: 'Dense, efficient economy — gains come from the last miles of intensity.',
  },
  {
    id: 'zaf',
    iso: 'ZAF',
    label: 'South Africa',
    blurb: 'Coal-dominated power — grid cleanup unlocks electrification.',
  },
  {
    id: 'nor',
    iso: 'NOR',
    label: 'Norway',
    blurb: 'Hydro-clean power meets oil wealth — EV payoff is real; export story is not in Kaya.',
  },
  {
    id: 'sgp',
    iso: 'SGP',
    label: 'Singapore',
    blurb: 'City-state trade hub — territorial CO₂ understates consumption footprint.',
  },
]
