import type { KayaRow } from '../types'

export function pctChange(start: number, end: number): number {
  return ((end - start) / start) * 100
}

export function formatPct(value: number, digits = 1): string {
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
    `Population ${pop >= 0 ? 'increased' : 'decreased'} (${formatPct(pop)})`,
    `GDP per capita ${gdpPc >= 0 ? 'increased' : 'decreased'} (${formatPct(gdpPc)})`,
    `Energy intensity ${ei < 0 ? 'improved' : 'worsened'} (${formatPct(ei)}; energy per dollar of GDP)`,
    `Carbon intensity ${ci < 0 ? 'improved' : 'worsened'} (${formatPct(ci)}; CO₂ per unit energy)`,
  ]

  let result: string
  if (co2 < -2 && gdpPc > 0) {
    result = `Result: emissions fell while prosperity rose — a decoupling pattern over ${start.year}–${end.year}.`
  } else if (belowPeak && gdpPc > 0) {
    result = `Result: emissions peaked in ${peak.year} and later declined even as the economy grew.`
  } else if (co2 > 5 && (ei < 0 || ci < 0)) {
    result = `Result: emissions still rose overall, even though intensity improved — scale outpaced efficiency.`
  } else if (co2 > 5) {
    result = `Result: emissions increased over ${start.year}–${end.year}; growth and/or dirtier energy dominated.`
  } else {
    result = `Result: emissions changed by ${formatPct(co2)} from ${start.year} to ${end.year} through interacting Kaya factors.`
  }

  return { bullets, result }
}
