import type { KayaRow } from '../types'
import type { FactorKey, GameFactors } from './actions'
import type { GameState } from './engine'
import { FACTOR_LABELS, prosperityIndex, emissionsPressure } from './engine'

export type CompareMetric = {
  key: string
  label: string
  playerPct: number
  historyPct: number
}

export type HistoryCompare = {
  historyWindow: string
  playerWindow: string
  metrics: CompareMetric[]
  summary: string
}

function pct(start: number, end: number): number {
  if (start === 0) return 0
  return ((end - start) / start) * 100
}

function factorPct(start: GameFactors, end: GameFactors, key: FactorKey): number {
  return pct(start[key], end[key])
}

/**
 * Compare the player's factor path to the country's historical path
 * (default 2000 → latest available in series).
 */
export function buildHistoryCompare(
  state: GameState,
  series: KayaRow[],
): HistoryCompare | null {
  if (series.length < 2) return null

  const with2000 = series.find((r) => r.year === 2000)
  const start = with2000 ?? series[0]
  const end = series[series.length - 1]
  if (start.year >= end.year) return null

  const playerCo2 = emissionsPressure(state) - 100
  const playerAff = prosperityIndex(state) - 100

  const metrics: CompareMetric[] = [
    {
      key: 'co2',
      label: 'CO₂ / emissions pressure',
      playerPct: playerCo2,
      historyPct: pct(start.co2, end.co2),
    },
    {
      key: 'affluence',
      label: FACTOR_LABELS.affluence,
      playerPct: playerAff,
      historyPct: pct(start.gdp_per_capita, end.gdp_per_capita),
    },
    {
      key: 'population',
      label: FACTOR_LABELS.population,
      playerPct: factorPct(state.startFactors, state.factors, 'population'),
      historyPct: pct(start.population, end.population),
    },
    {
      key: 'energyIntensity',
      label: FACTOR_LABELS.energyIntensity,
      playerPct: factorPct(state.startFactors, state.factors, 'energyIntensity'),
      historyPct: pct(start.energy_intensity, end.energy_intensity),
    },
    {
      key: 'carbonIntensity',
      label: FACTOR_LABELS.carbonIntensity,
      playerPct: factorPct(state.startFactors, state.factors, 'carbonIntensity'),
      historyPct: pct(start.carbon_intensity, end.carbon_intensity),
    },
  ]

  const histDecouple = metrics[0].historyPct < 0 && metrics[1].historyPct > 0
  const playerDecouple = metrics[0].playerPct < -15 && metrics[1].playerPct > -5

  let summary: string
  if (state.status === 'won' && histDecouple) {
    summary = `History already showed decoupling (${start.year}–${end.year}). Your run pushed pressure further on a compressed timeline.`
  } else if (state.status === 'won' && !histDecouple) {
    summary = `Historically, ${state.country} did not fully decouple over ${start.year}–${end.year}. Your winning path is a counterfactual — intensity had to outrun scale.`
  } else if (playerDecouple && !histDecouple) {
    summary = `You bent intensity harder than history, but didn’t hit the win target in time (or prosperity slipped).`
  } else {
    summary = `Side-by-side: your short scenario vs ${state.country}’s real ${start.year}–${end.year} path. History is not a turn-based game — treat this as intuition, not proof.`
  }

  return {
    historyWindow: `${start.year}–${end.year}`,
    playerWindow: `${state.turn} turns from ${state.year} seed`,
    metrics,
    summary,
  }
}

export function formatSignedPct(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(0)}%`
}
