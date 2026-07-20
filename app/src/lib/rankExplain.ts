import type { ScoreRow } from '../types'

export type RankSortKey =
  | 'kaya_score'
  | 'score_decarbonization'
  | 'score_prosperity'
  | 'score_efficiency'
  | 'score_clean'

const WEIGHTS = {
  score_decarbonization: 0.3,
  score_prosperity: 0.25,
  score_efficiency: 0.2,
  score_clean: 0.25,
} as const

/** Rough set of post-2000 transition / EU-accession economies that often top trajectory ranks. */
const TRANSITION_ISO = new Set([
  'HUN',
  'CZE',
  'SVK',
  'POL',
  'ROU',
  'BGR',
  'EST',
  'LVA',
  'LTU',
  'HRV',
  'SVN',
  'MKD',
])

function formatPct(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(0)}%`
}

function topDrivers(row: ScoreRow): string[] {
  const parts: { label: string; score: number; weight: number }[] = [
    { label: 'decarbonization', score: row.score_decarbonization, weight: WEIGHTS.score_decarbonization },
    { label: 'prosperity', score: row.score_prosperity, weight: WEIGHTS.score_prosperity },
    { label: 'efficiency', score: row.score_efficiency, weight: WEIGHTS.score_efficiency },
    { label: 'clean energy', score: row.score_clean, weight: WEIGHTS.score_clean },
  ]
  return parts
    .map((p) => ({ ...p, contrib: p.score * p.weight }))
    .sort((a, b) => b.contrib - a.contrib)
    .slice(0, 2)
    .map((p) => p.label)
}

export type RankExplanation = {
  headline: string
  bullets: string[]
  context: string | null
}

export function explainRank(
  row: ScoreRow,
  rank: number,
  sortKey: RankSortKey,
): RankExplanation {
  const window = `${row.start_year} to ${row.end_year}`
  const drivers = topDrivers(row)

  const bullets = [
    `CO₂ changed ${formatPct(row.co2_pct)} (decarb score ${row.score_decarbonization.toFixed(0)}/100)`,
    `GDP/capita changed ${formatPct(row.gdp_per_capita_pct)} (prosperity ${row.score_prosperity.toFixed(0)}/100)`,
    `Energy intensity ${formatPct(row.energy_intensity_pct)} (efficiency ${row.score_efficiency.toFixed(0)}/100)`,
    `Carbon intensity ${formatPct(row.carbon_intensity_pct)} (clean ${row.score_clean.toFixed(0)}/100)`,
  ]

  let headline: string
  if (sortKey === 'kaya_score') {
    headline = `#${rank} overall: ${row.kaya_score.toFixed(0)}/100. Strongest pulls from ${drivers.join(' + ')} (${window}).`
  } else if (sortKey === 'score_decarbonization') {
    headline = `#${rank} on CO₂ cuts: ${formatPct(row.co2_pct)} over ${window}.`
  } else if (sortKey === 'score_prosperity') {
    headline = `#${rank} on prosperity: GDP/capita ${formatPct(row.gdp_per_capita_pct)} over ${window}.`
  } else if (sortKey === 'score_efficiency') {
    headline = `#${rank} on efficiency: energy intensity ${formatPct(row.energy_intensity_pct)} over ${window}.`
  } else {
    headline = `#${rank} on cleaner energy: carbon intensity ${formatPct(row.carbon_intensity_pct)} over ${window}.`
  }

  let context: string | null = null
  if (
    TRANSITION_ISO.has(row.iso_code) &&
    row.score_efficiency >= 70 &&
    row.gdp_per_capita_pct > 0.3
  ) {
    context =
      'Often ranks high after 2000 because of real efficiency gains and rising incomes after economic transition and EU integration. This score rewards change over time, not already being richest or cleanest.'
  } else if (row.co2_pct > 0.5 && row.gdp_per_capita_pct > 0.8) {
    context =
      'Fast scale-up: prosperity soared while total CO₂ still rose. Intensity may have improved, but volume outran it. That leads to a mixed Champion score by design.'
  } else if (row.co2_pct < -0.15 && row.gdp_per_capita_pct > 0.1) {
    context =
      'Classic cleaner-growth pattern in this window: emissions down while GDP per person up.'
  }

  return { headline, bullets, context }
}
