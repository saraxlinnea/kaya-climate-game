/** Curated country pairs for the landing compare gallery. */
export type CompareStory = {
  id: string
  a: string
  b: string
  label: string
  lesson: string
}

export const COMPARE_STORIES: CompareStory[] = [
  {
    id: 'usa-chn',
    a: 'USA',
    b: 'CHN',
    label: 'United States · China',
    lesson:
      'One large emitter with a peak-and-decline pattern; another where scale and growth still dominate totals.',
  },
  {
    id: 'deu-pol',
    a: 'DEU',
    b: 'POL',
    label: 'Germany · Poland',
    lesson: 'Neighbors with different coal and industrial paths over the same decades.',
  },
  {
    id: 'fra-pol',
    a: 'FRA',
    b: 'POL',
    label: 'France · Poland',
    lesson:
      'A nuclear-heavy grid versus coal-heavy power. Electrifying vehicles helps more where the grid is already clean.',
  },
  {
    id: 'gbr-aus',
    a: 'GBR',
    b: 'AUS',
    label: 'United Kingdom · Australia',
    lesson: 'A post-industrial cut in coal power versus a resource-oriented energy mix.',
  },
  {
    id: 'swe-ind',
    a: 'SWE',
    b: 'IND',
    label: 'Sweden · India',
    lesson:
      'An already-lean energy system versus a development pathway under rising demand.',
  },
  {
    id: 'hkg-sgp',
    a: 'HKG',
    b: 'SGP',
    label: 'Hong Kong · Singapore',
    lesson:
      'Trade hubs where consumption-based emissions can diverge from what is produced on site.',
  },
]
