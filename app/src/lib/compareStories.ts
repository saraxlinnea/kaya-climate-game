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
    lesson: 'Peak-and-decline vs scale and growth — intensity must outrun affluence.',
  },
  {
    id: 'deu-pol',
    a: 'DEU',
    b: 'POL',
    label: 'Germany · Poland',
    lesson: 'Neighbors on different coal and industrial paths.',
  },
  {
    id: 'fra-pol',
    a: 'FRA',
    b: 'POL',
    label: 'France · Poland',
    lesson: 'Clean nuclear grid vs coal-heavy power — electrify only helps if electrons are clean.',
  },
  {
    id: 'gbr-aus',
    a: 'GBR',
    b: 'AUS',
    label: 'United Kingdom · Australia',
    lesson: 'Post-industrial cut vs resource-exporter economy.',
  },
  {
    id: 'swe-ind',
    a: 'SWE',
    b: 'IND',
    label: 'Sweden · India',
    lesson: 'Already-lean intensities vs development pathway under rising demand.',
  },
  {
    id: 'hkg-sgp',
    a: 'HKG',
    b: 'SGP',
    label: 'Hong Kong · Singapore',
    lesson: 'Trade hubs — watch consumption vs territorial CO₂, not just production.',
  },
]
