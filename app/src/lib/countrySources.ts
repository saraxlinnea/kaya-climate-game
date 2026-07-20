/**
 * Curated external context for the explorer — links + short sourced blurbs only.
 * Do not invent causal claims; keep notes tied to the cited page.
 */

export type CountrySource = {
  title: string
  url: string
  source: string
  note?: string
}

/** ISO3 → OWID country slug (only when the path is known-safe). */
const OWID_SLUG: Record<string, string> = {
  USA: 'united-states',
  CAN: 'canada',
  CHN: 'china',
  IND: 'india',
  DEU: 'germany',
  FRA: 'france',
  GBR: 'united-kingdom',
  AUS: 'australia',
  JPN: 'japan',
  BRA: 'brazil',
  POL: 'poland',
  SWE: 'sweden',
  NOR: 'norway',
  ZAF: 'south-africa',
  MEX: 'mexico',
  KOR: 'south-korea',
  ITA: 'italy',
  ESP: 'spain',
  NLD: 'netherlands',
  IDN: 'indonesia',
  TUR: 'turkey',
  SAU: 'saudi-arabia',
  ARG: 'argentina',
  RUS: 'russia',
  HKG: 'hong-kong',
  SGP: 'singapore',
}

type Curated = {
  sources: CountrySource[]
  /** One or two sentences grounded in the linked sources — not original research. */
  blurb?: string
}

const CURATED: Record<string, Curated> = {
  USA: {
    blurb:
      'U.S. territorial CO₂ peaked and later declined while GDP grew. Coal-to-gas switching and renewables reduced the carbon intensity of energy (Our World in Data; Ember).',
    sources: [
      {
        title: 'United States: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/united-states',
        source: 'Our World in Data',
        note: 'Charts for production and consumption emissions.',
      },
      {
        title: 'United States electricity data',
        url: 'https://ember-energy.org/countries-and-regions/united-states/',
        source: 'Ember',
        note: 'Power-sector intensity trends.',
      },
    ],
  },
  CAN: {
    blurb:
      'Canada’s emissions per person remain high. Oil and gas extraction weigh on territorial totals even when intensity improves (Our World in Data). Since 2000, Canada’s cut in total CO₂ has been smaller than the United States’ cut.',
    sources: [
      {
        title: 'Canada: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/canada',
        source: 'Our World in Data',
      },
      {
        title: 'Canada electricity data',
        url: 'https://ember-energy.org/countries-and-regions/canada/',
        source: 'Ember',
      },
    ],
  },
  CHN: {
    blurb:
      'China’s absolute CO₂ rose with scale and rising incomes. Energy and carbon intensity improved, but total emissions still climbed for much of the period (Our World in Data).',
    sources: [
      {
        title: 'China: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/china',
        source: 'Our World in Data',
      },
      {
        title: 'The Carbon Brief Profile: China',
        url: 'https://www.carbonbrief.org/the-carbon-brief-profile-china/',
        source: 'Carbon Brief',
        note: 'Long-form policy and energy-system narrative.',
      },
    ],
  },
  IND: {
    blurb:
      'India’s emissions rose with development and population. Emissions per person remain far below rich-country averages (Our World in Data).',
    sources: [
      {
        title: 'India: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/india',
        source: 'Our World in Data',
      },
      {
        title: 'The Carbon Brief Profile: India',
        url: 'https://www.carbonbrief.org/the-carbon-brief-profile-india/',
        source: 'Carbon Brief',
      },
    ],
  },
  DEU: {
    blurb:
      'Germany’s energy transition and industrial base make efficiency and power-mix shifts central to its path (Our World in Data; Ember).',
    sources: [
      {
        title: 'Germany: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/germany',
        source: 'Our World in Data',
      },
      {
        title: 'Germany electricity data',
        url: 'https://ember-energy.org/countries-and-regions/germany/',
        source: 'Ember',
      },
    ],
  },
  FRA: {
    blurb:
      'France’s electricity is largely low-carbon because of nuclear power. Electrification can cut carbon intensity of energy more than in coal-heavy grids (Ember; Our World in Data).',
    sources: [
      {
        title: 'France: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/france',
        source: 'Our World in Data',
      },
      {
        title: 'France electricity data',
        url: 'https://ember-energy.org/countries-and-regions/france/',
        source: 'Ember',
      },
    ],
  },
  GBR: {
    blurb:
      'The United Kingdom cut coal power sharply. Territorial CO₂ fell while GDP rose over parts of the recent record (Our World in Data; Ember).',
    sources: [
      {
        title: 'United Kingdom: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/united-kingdom',
        source: 'Our World in Data',
      },
      {
        title: 'The Carbon Brief Profile: UK',
        url: 'https://www.carbonbrief.org/the-carbon-brief-profile-uk/',
        source: 'Carbon Brief',
      },
    ],
  },
  AUS: {
    blurb:
      'Australia combines high incomes with a fossil-tilted energy mix. Carbon intensity of energy is a central lever in the data (Our World in Data; Ember).',
    sources: [
      {
        title: 'Australia: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/australia',
        source: 'Our World in Data',
      },
      {
        title: 'Australia electricity data',
        url: 'https://ember-energy.org/countries-and-regions/australia/',
        source: 'Ember',
      },
    ],
  },
  JPN: {
    blurb:
      'Japan is already relatively energy-efficient. Further cuts often come from the remaining intensity and power-mix gains (Our World in Data).',
    sources: [
      {
        title: 'Japan: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/japan',
        source: 'Our World in Data',
      },
    ],
  },
  BRA: {
    blurb:
      'Brazil’s emissions story mixes energy with land use. Territorial CO₂ alone understates forestry dynamics (Our World in Data).',
    sources: [
      {
        title: 'Brazil: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/brazil',
        source: 'Our World in Data',
      },
    ],
  },
  POL: {
    blurb:
      'Poland’s coal-heavy power sector keeps grid intensity high. Electric vehicles help less until the grid cleans up (Ember).',
    sources: [
      {
        title: 'Poland: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/poland',
        source: 'Our World in Data',
      },
      {
        title: 'Poland electricity data',
        url: 'https://ember-energy.org/countries-and-regions/poland/',
        source: 'Ember',
      },
    ],
  },
  SWE: {
    blurb:
      'Sweden already runs a low-carbon power system. Further intensity gains are harder from that starting point (Ember; Our World in Data).',
    sources: [
      {
        title: 'Sweden: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/sweden',
        source: 'Our World in Data',
      },
    ],
  },
  NOR: {
    blurb:
      'Norway’s domestic power is largely hydro. Oil and gas exports sit outside a simple territorial accounting story (Our World in Data; Ember).',
    sources: [
      {
        title: 'Norway: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/norway',
        source: 'Our World in Data',
      },
    ],
  },
  ZAF: {
    blurb:
      'South Africa’s coal-dominated electricity keeps the carbon intensity of energy elevated (Ember; Our World in Data).',
    sources: [
      {
        title: 'South Africa: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/south-africa',
        source: 'Our World in Data',
      },
      {
        title: 'South Africa electricity data',
        url: 'https://ember-energy.org/countries-and-regions/south-africa/',
        source: 'Ember',
      },
    ],
  },
  SGP: {
    blurb:
      'As a trade hub, Singapore’s consumption-based CO₂ can diverge from territorial production (Our World in Data).',
    sources: [
      {
        title: 'Singapore: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/singapore',
        source: 'Our World in Data',
      },
    ],
  },
  HKG: {
    blurb:
      'Hong Kong is a dense trade hub. Consumption versus territorial CO₂ matters for footprint framing (Our World in Data).',
    sources: [
      {
        title: 'Hong Kong: CO₂ country profile',
        url: 'https://ourworldindata.org/co2/country/hong-kong',
        source: 'Our World in Data',
      },
    ],
  },
}

function owidFallback(iso: string, countryName: string): CountrySource[] {
  const slug = OWID_SLUG[iso]
  if (slug) {
    return [
      {
        title: `${countryName}: CO₂ country profile`,
        url: `https://ourworldindata.org/co2/country/${slug}`,
        source: 'Our World in Data',
        note: 'Production and (where available) consumption emissions.',
      },
    ]
  }
  return [
    {
      title: 'Browse OWID CO₂ by country',
      url: 'https://ourworldindata.org/co2-and-greenhouse-gas-emissions',
      source: 'Our World in Data',
      note: 'Search for this country on OWID or Carbon Brief for deeper narrative.',
    },
    {
      title: 'Carbon Brief country profiles',
      url: 'https://www.carbonbrief.org/',
      source: 'Carbon Brief',
      note: 'Long-form profiles exist for selected countries only.',
    },
  ]
}

export function getCountryContext(
  iso: string,
  countryName: string,
): { blurb?: string; sources: CountrySource[] } {
  const curated = CURATED[iso]
  if (curated) return curated
  return { sources: owidFallback(iso, countryName) }
}
