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
    blurb: 'Large emitter with a middling-clean grid. A classic puzzle: grow or live well while cutting emissions.',
  },
  {
    id: 'fra',
    iso: 'FRA',
    label: 'France',
    blurb: 'Clean nuclear grid. Switching cars to electricity helps more here.',
  },
  {
    id: 'pol',
    iso: 'POL',
    label: 'Poland',
    blurb: 'Lots of coal power. Electric cars struggle until the grid gets cleaner.',
  },
  {
    id: 'chn',
    iso: 'CHN',
    label: 'China',
    blurb: 'Big scale and fast growth. Intensity cuts must outrun rising income and activity.',
  },
  {
    id: 'swe',
    iso: 'SWE',
    label: 'Sweden',
    blurb: 'Already efficient and fairly clean. Extra wins are harder.',
  },
  {
    id: 'deu',
    iso: 'DEU',
    label: 'Germany',
    blurb: 'Industry plus a shift to cleaner power. Efficiency and clean electricity work together.',
  },
  {
    id: 'ind',
    iso: 'IND',
    label: 'India',
    blurb: 'Rising incomes and population. Growth under carbon pressure.',
  },
  {
    id: 'aus',
    iso: 'AUS',
    label: 'Australia',
    blurb: 'High incomes and fossil-heavy energy. Cleaning the energy mix is the main fight.',
  },
  {
    id: 'jpn',
    iso: 'JPN',
    label: 'Japan',
    blurb: 'Dense and already efficient. Gains come from the last bits of intensity.',
  },
  {
    id: 'zaf',
    iso: 'ZAF',
    label: 'South Africa',
    blurb: 'Coal-dominated power. Cleaning the grid unlocks electrification.',
  },
  {
    id: 'nor',
    iso: 'NOR',
    label: 'Norway',
    blurb: 'Very clean hydro power plus oil wealth. Electric cars help a lot; oil exports are outside this Kaya game.',
  },
  {
    id: 'sgp',
    iso: 'SGP',
    label: 'Singapore',
    blurb: 'City-state trade hub. Emissions inside the borders understate the footprint of what people buy.',
  },
]
