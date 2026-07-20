import type { KayaRow } from '../types'

/**
 * Percent change start→end. Returns null when the baseline is zero/missing
 * so UI never renders Infinity% or NaN%.
 */
export function pctChange(start: number, end: number): number | null {
  if (!Number.isFinite(start) || !Number.isFinite(end) || start === 0) return null
  return ((end - start) / start) * 100
}

export function formatPct(value: number | null | undefined, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}%`
}

export function formatCompact(value: number, kind: 'people' | 'money' | 'mt' | 'raw'): string {
  if (kind === 'people') {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    return value.toLocaleString()
  }
  if (kind === 'money') {
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}k`
    return `$${value.toFixed(0)}`
  }
  if (kind === 'mt') {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} Mt`
  }
  return value.toPrecision(3)
}

export type Narrative = {
  bullets: string[]
  result: string
}

function dirWord(pct: number | null, up: string, down: string): string {
  if (pct == null) return 'changed'
  return pct >= 0 ? up : down
}

/** Build a short systems narrative from first→last rows in the explorer window. */
export function buildNarrative(series: KayaRow[]): Narrative | null {
  if (series.length < 2) return null
  const start = series[0]
  const end = series[series.length - 1]
  const peak = series.reduce((best, row) => (row.co2 > best.co2 ? row : best), series[0])

  const pop = pctChange(start.population, end.population)
  const gdpPc = pctChange(start.gdp_per_capita, end.gdp_per_capita)
  const ei = pctChange(start.energy_intensity, end.energy_intensity)
  const ci = pctChange(start.carbon_intensity, end.carbon_intensity)
  const co2 = pctChange(start.co2, end.co2)
  const belowPeak = end.co2 < peak.co2 * 0.98 && peak.year !== end.year

  const bullets = [
    `Population ${dirWord(pop, 'increased', 'decreased')} (${formatPct(pop)})`,
    `GDP per capita ${dirWord(gdpPc, 'increased', 'decreased')} (${formatPct(gdpPc)})`,
    `Energy intensity ${ei != null && ei < 0 ? 'improved' : 'worsened'} (${formatPct(ei)}; energy per dollar of GDP)`,
    `Carbon intensity ${ci != null && ci < 0 ? 'improved' : 'worsened'} (${formatPct(ci)}; CO₂ per unit energy)`,
  ]

  let result: string
  if (co2 != null && co2 < -2 && gdpPc != null && gdpPc > 0) {
    result = `From ${start.year} to ${end.year}, emissions fell while income per person rose. That combination is often called decoupling.`
  } else if (belowPeak && gdpPc != null && gdpPc > 0) {
    result = `Emissions peaked in ${peak.year} and later declined even as the economy grew.`
  } else if (co2 != null && co2 > 5 && ((ei != null && ei < 0) || (ci != null && ci < 0))) {
    result = `Emissions still rose overall, even though intensity improved. Scale outpaced efficiency.`
  } else if (co2 != null && co2 > 5) {
    result = `Emissions increased from ${start.year} to ${end.year}. Growth, dirtier energy, or both outweighed efficiency gains.`
  } else {
    result = `Emissions changed by ${formatPct(co2)} from ${start.year} to ${end.year}. The Kaya factors moved in different directions.`
  }

  return { bullets, result }
}

export type ConsumptionNarrative = {
  bullets: string[]
  result: string
}

/**
 * Trade-adjusted CO₂ story when consumption_co2 is available.
 * Does not rewrite the territorial Kaya identity narrative.
 */
export function buildConsumptionNarrative(series: KayaRow[]): ConsumptionNarrative | null {
  const paired = series.filter(
    (r) =>
      r.consumption_co2 != null &&
      Number.isFinite(r.consumption_co2) &&
      Number.isFinite(r.co2),
  )
  if (paired.length < 2) return null

  const start = paired[0]
  const end = paired[paired.length - 1]
  const c0 = Number(start.consumption_co2)
  const c1 = Number(end.consumption_co2)
  const t0 = start.co2
  const t1 = end.co2
  const gapStart = c0 - t0
  const gapEnd = c1 - t1
  const consPct = pctChange(c0, c1)
  const terrPct = pctChange(t0, t1)
  const gapPctOfTerr = t1 !== 0 ? (gapEnd / t1) * 100 : 0

  const bullets = [
    `Territorial CO₂ ${formatPct(terrPct)} from ${start.year} → ${end.year}`,
    `Consumption CO₂ ${formatPct(consPct)} over the same window (trade-adjusted)`,
  ]

  if (gapEnd > t1 * 0.05) {
    bullets.push(
      `Latest gap: consumption is ${formatCompact(gapEnd, 'mt')} higher than territorial (${formatPct(gapPctOfTerr, 0)} of production). This country is a net importer of emissions in traded goods.`,
    )
  } else if (gapEnd < -t1 * 0.05) {
    bullets.push(
      `Latest gap: consumption is ${formatCompact(Math.abs(gapEnd), 'mt')} lower than territorial. This country is a net exporter of emissions in traded goods.`,
    )
  } else {
    bullets.push('Latest territorial and consumption totals are close. Trade is not the main story here.')
  }

  const gapWidened = Math.abs(gapEnd) > Math.abs(gapStart) * 1.15
  let result: string
  if (gapEnd > 0 && terrPct != null && terrPct < -2 && (consPct == null || consPct > -2)) {
    result =
      'Production fell faster than the consumption footprint. Offshoring can improve the territorial chart without shrinking demand at home.'
  } else if (gapEnd < 0 && terrPct != null && terrPct > 2) {
    result =
      'Territorial emissions rose while consumption stayed lower. Export-oriented production can inflate the production ledger.'
  } else if (gapWidened && Math.abs(gapEnd) > Math.abs(t1) * 0.08) {
    result =
      'The gap between territorial and consumption emissions widened. Trade composition matters alongside intensity.'
  } else {
    result =
      'Both series move together more than they diverge. Still check the gap before treating production as the whole footprint.'
  }

  return { bullets, result }
}

/** Reconstruct territorial CO₂ from Kaya factors (mechanical identity check). */
export function kayaProduct(row: KayaRow): number {
  return row.population * row.gdp_per_capita * row.energy_intensity * row.carbon_intensity
}
