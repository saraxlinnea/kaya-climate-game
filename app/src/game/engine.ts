import type { KayaRow } from '../types'
import {
  ACTIONS,
  DIMINISH_FACTOR,
  MAX_ACTION_USES,
  MAX_TURNS,
  MIN_AFFLUENCE,
  WIN_CO2,
  type ClimateAction,
  type FactorKey,
  type GameFactors,
} from './actions'

export type GameStatus = 'playing' | 'won' | 'lost_turns' | 'lost_economy'

export type BauDrift = {
  /** Multiplier applied to population each turn (from historical annualized rate). */
  population: number
  /** Multiplier applied to affluence each turn. */
  affluence: number
}

export type GameState = {
  iso: string
  country: string
  year: number
  turn: number
  factors: GameFactors
  /** Factor levels at fight start (country-seeded). */
  startFactors: GameFactors
  baselineCo2Mt: number
  /** Ember electricity carbon intensity (gCO2e/kWh), if available. */
  gridIntensity: number | null
  medianGridIntensity: number | null
  bau: BauDrift
  actionUses: Record<string, number>
  log: string[]
  status: GameStatus
}

export type SeedContext = {
  /** Latest-year row for the arena country. */
  row: KayaRow
  /** Peer medians for EI/CI (typically latest year across countries). */
  medianEnergyIntensity: number
  medianCarbonIntensity: number
  /** Ember grid intensity median (gCO2e/kWh), latest year peers. */
  medianElectricityCarbonIntensity?: number
  /** Optional history for BAU drift (e.g. 2000 → latest). */
  historyStart?: KayaRow
  historyEnd?: KayaRow
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

function product(factors: GameFactors): number {
  return (
    factors.population *
    factors.affluence *
    factors.energyIntensity *
    factors.carbonIntensity
  )
}

/** Emissions pressure relative to this fight’s starting product (100 at start). */
export function emissionsPressure(state: GameState): number {
  return (100 * product(state.factors)) / product(state.startFactors)
}

/** Affluence relative to start (100 at start). */
export function prosperityIndex(state: GameState): number {
  return (100 * state.factors.affluence) / state.startFactors.affluence
}

export function estimatedCo2Mt(state: GameState): number {
  return (state.baselineCo2Mt * emissionsPressure(state)) / 100
}

/** @deprecated use emissionsPressure — kept name for fewer call-site renames via alias */
export function co2Index(state: GameState): number {
  return emissionsPressure(state)
}

function annualizedRatio(start: number, end: number, years: number): number {
  if (years <= 0 || start <= 0 || end <= 0) return 1
  return Math.pow(end / start, 1 / years)
}

export function computeBauDrift(start?: KayaRow, end?: KayaRow): BauDrift {
  if (!start || !end || end.year <= start.year) {
    return { population: 1.006, affluence: 1.012 }
  }
  const years = end.year - start.year
  return {
    population: clamp(annualizedRatio(start.population, end.population, years), 0.985, 1.025),
    affluence: clamp(
      annualizedRatio(start.gdp_per_capita, end.gdp_per_capita, years),
      0.97,
      1.06,
    ),
  }
}

function seedIntensity(value: number, median: number): number {
  if (median <= 0 || !Number.isFinite(value)) return 100
  // Peer-relative: dirtier/less efficient than median → higher monster bar.
  return clamp(100 * (value / median), 55, 150)
}

export function seedFactors(ctx: SeedContext): GameFactors {
  const { row, medianEnergyIntensity, medianCarbonIntensity } = ctx
  return {
    population: 100,
    affluence: 100,
    energyIntensity: seedIntensity(row.energy_intensity, medianEnergyIntensity),
    carbonIntensity: seedIntensity(row.carbon_intensity, medianCarbonIntensity),
  }
}

export function medianOf(values: number[]): number {
  const sorted = values.filter((v) => Number.isFinite(v) && v > 0).sort((a, b) => a - b)
  if (!sorted.length) return 1
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

export function seedFromContext(ctx: SeedContext): GameState {
  const factors = seedFactors(ctx)
  const bau = computeBauDrift(ctx.historyStart, ctx.historyEnd)
  const grid =
    ctx.row.electricity_carbon_intensity != null &&
    Number.isFinite(ctx.row.electricity_carbon_intensity)
      ? Number(ctx.row.electricity_carbon_intensity)
      : null
  const medianGrid =
    ctx.medianElectricityCarbonIntensity != null &&
    Number.isFinite(ctx.medianElectricityCarbonIntensity)
      ? ctx.medianElectricityCarbonIntensity
      : null

  const eiNote =
    factors.energyIntensity >= 115
      ? 'Energy intensity starts high vs peers.'
      : factors.energyIntensity <= 85
        ? 'Energy intensity starts lean vs peers.'
        : 'Energy intensity near peer median.'
  const ciNote =
    factors.carbonIntensity >= 115
      ? 'Carbon intensity starts dirty vs peers.'
      : factors.carbonIntensity <= 85
        ? 'Carbon intensity starts relatively clean vs peers.'
        : 'Carbon intensity near peer median.'

  let gridNote =
    'No electricity carbon number for this year. Electric-vehicle payoff uses primary-energy carbon intensity instead.'
  if (grid != null && medianGrid != null && medianGrid > 0) {
    const ratio = grid / medianGrid
    if (ratio <= 0.7) {
      gridNote = `The power grid is clean (about ${grid.toFixed(0)} gCO₂e/kWh vs peer median ${medianGrid.toFixed(0)}). Electrifying vehicles helps more.`
    } else if (ratio >= 1.3) {
      gridNote = `The power grid is dirty (about ${grid.toFixed(0)} gCO₂e/kWh vs peer median ${medianGrid.toFixed(0)}). Electric vehicles mostly move pollution to the power plant.`
    } else {
      gridNote = `Grid intensity about ${grid.toFixed(0)} gCO₂e/kWh (peer median ${medianGrid.toFixed(0)}).`
    }
  }

  return {
    iso: ctx.row.iso_code,
    country: ctx.row.country,
    year: ctx.row.year,
    turn: 0,
    factors,
    startFactors: { ...factors },
    baselineCo2Mt: ctx.row.co2,
    gridIntensity: grid,
    medianGridIntensity: medianGrid,
    bau,
    actionUses: {},
    log: [
      `The CO₂ Monster awakens in ${ctx.row.country} (${ctx.row.year}). ${eiNote} ${ciNote}`,
      gridNote,
      `Each turn adds usual growth from this country’s history: population ×${bau.population.toFixed(3)}, prosperity ×${bau.affluence.toFixed(3)}. Cut emissions pressure to ${WIN_CO2} or less without dropping prosperity below ${MIN_AFFLUENCE}.`,
    ],
    status: 'playing',
  }
}

/** Soften a multiplier toward 1.0 based on prior uses. */
export function diminishMultiplier(base: number, priorUses: number): number {
  if (priorUses <= 0) return base
  const delta = base - 1
  return 1 + delta * Math.pow(DIMINISH_FACTOR, priorUses)
}

function applyEffects(factors: GameFactors, effects: Partial<GameFactors>): GameFactors {
  const next = { ...factors }
  for (const key of Object.keys(effects) as FactorKey[]) {
    const mult = effects[key]
    if (mult == null) continue
    next[key] = clamp(factors[key] * mult, 35, 175)
  }
  return next
}

function applyBau(factors: GameFactors, bau: BauDrift): GameFactors {
  return {
    ...factors,
    population: clamp(factors.population * bau.population, 35, 175),
    affluence: clamp(factors.affluence * bau.affluence, 35, 175),
  }
}

export function actionUsesRemaining(state: GameState, actionId: string): number {
  return MAX_ACTION_USES - (state.actionUses[actionId] ?? 0)
}

export function previewEffects(
  state: GameState,
  actionId: string,
): Partial<GameFactors> | null {
  const action = ACTIONS.find((a) => a.id === actionId)
  if (!action) return null
  const used = state.actionUses[actionId] ?? 0
  if (used >= MAX_ACTION_USES) return null

  let effects: Partial<GameFactors> = {}
  for (const key of Object.keys(action.effects) as FactorKey[]) {
    const base = action.effects[key]
    if (base == null) continue
    effects[key] = diminishMultiplier(base, used)
  }

  if (actionId === 'evs' || actionId === 'heat_pumps') {
    // Prefer Ember electricity carbon intensity when available.
    if (
      state.gridIntensity != null &&
      state.medianGridIntensity != null &&
      state.medianGridIntensity > 0
    ) {
      const ratio = state.gridIntensity / state.medianGridIntensity
      let base = actionId === 'heat_pumps' ? 0.91 : 0.93
      if (ratio <= 0.7) base = actionId === 'heat_pumps' ? 0.86 : 0.88
      else if (ratio <= 0.9) base = actionId === 'heat_pumps' ? 0.88 : 0.9
      else if (ratio >= 1.5) base = actionId === 'heat_pumps' ? 0.98 : 0.985
      else if (ratio >= 1.3) base = actionId === 'heat_pumps' ? 0.96 : 0.97
      effects = {
        ...effects,
        carbonIntensity: diminishMultiplier(base, used),
      }
    } else if (actionId === 'evs') {
      const ciRatio = state.factors.carbonIntensity / state.startFactors.carbonIntensity
      if (ciRatio > 1.05 || state.factors.carbonIntensity > 110) {
        effects = {
          ...effects,
          carbonIntensity: diminishMultiplier(0.97, used),
        }
      }
    }
  }

  return effects
}

export type ActionPreview = {
  pressureNow: number
  pressureNext: number
  pressureDelta: number
  prosperityNow: number
  prosperityNext: number
  prosperityDelta: number
  usesLeft: number
}

/** Preview pressure/prosperity after action + BAU (does not mutate state). */
export function previewAction(state: GameState, actionId: string): ActionPreview | null {
  const effects = previewEffects(state, actionId)
  if (!effects) return null

  let factors = applyEffects(state.factors, effects)
  factors = applyBau(factors, state.bau)
  const next: GameState = { ...state, factors }

  const pressureNow = emissionsPressure(state)
  const pressureNext = emissionsPressure(next)
  const prosperityNow = prosperityIndex(state)
  const prosperityNext = prosperityIndex(next)

  return {
    pressureNow,
    pressureNext,
    pressureDelta: pressureNext - pressureNow,
    prosperityNow,
    prosperityNext,
    prosperityDelta: prosperityNext - prosperityNow,
    usesLeft: actionUsesRemaining(state, actionId),
  }
}

export function applyAction(state: GameState, actionId: string): GameState {
  if (state.status !== 'playing') return state
  const action = ACTIONS.find((a) => a.id === actionId)
  if (!action) return state

  const used = state.actionUses[actionId] ?? 0
  if (used >= MAX_ACTION_USES) {
    return {
      ...state,
      log: [...state.log, `${action.name} is exhausted (max ${MAX_ACTION_USES} uses).`],
    }
  }

  const effects = previewEffects(state, actionId)
  if (!effects) return state

  const pressureBefore = emissionsPressure(state)
  const prosperityBefore = prosperityIndex(state)

  let factors = applyEffects(state.factors, effects)
  factors = applyBau(factors, state.bau)

  const turn = state.turn + 1
  const actionUses = { ...state.actionUses, [actionId]: used + 1 }
  const nextState: GameState = {
    ...state,
    factors,
    turn,
    actionUses,
    log: state.log,
    status: 'playing',
  }

  const pressure = emissionsPressure(nextState)
  const prosperity = prosperityIndex(nextState)
  const strengthNote =
    used > 0 ? ` (diminished use #${used + 1} of ${MAX_ACTION_USES})` : ''

  const factorBits: string[] = []
  for (const key of Object.keys(effects) as FactorKey[]) {
    const before = state.factors[key]
    const after = factors[key]
    if (Math.abs(after - before) < 0.05) continue
    const label = FACTOR_LABELS[key]
    factorBits.push(
      `${label} ${before.toFixed(0)}→${after.toFixed(0)} (${after >= before ? '+' : ''}${(after - before).toFixed(0)})`,
    )
  }

  const dP = pressure - pressureBefore
  const dPr = prosperity - prosperityBefore
  const logLine = [
    `Turn ${turn}: ${action.name}${strengthNote}.`,
    `Emissions pressure ${pressureBefore.toFixed(0)} → ${pressure.toFixed(0)} (${dP >= 0 ? '+' : ''}${dP.toFixed(0)}).`,
    `Prosperity ${prosperityBefore.toFixed(0)} → ${prosperity.toFixed(0)} (${dPr >= 0 ? '+' : ''}${dPr.toFixed(0)}).`,
    `Kaya target: ${action.kayaTarget}.`,
    factorBits.length ? `Bars after usual growth: ${factorBits.join('; ')}.` : null,
    `What it means: ${action.tradeoff}`,
    `In the real world: ${action.realWorld}`,
  ]
    .filter(Boolean)
    .join(' ')

  const log = [...state.log, logLine]

  let status: GameStatus = 'playing'
  if (pressure <= WIN_CO2 && prosperity >= MIN_AFFLUENCE) {
    status = 'won'
    log.push(
      `Result: you won. Emissions pressure ${pressure.toFixed(0)} (need ${WIN_CO2} or less) with prosperity ${prosperity.toFixed(0)} (need ${MIN_AFFLUENCE} or more). You cut intensity hard enough that usual growth did not erase the win. This is a practice game, not advice.`,
    )
  } else if (prosperity < MIN_AFFLUENCE) {
    status = 'lost_economy'
    log.push(
      `Result: you lost. Prosperity ${prosperity.toFixed(0)} fell below ${MIN_AFFLUENCE}. Cutting emissions by making people much poorer fails the mission on purpose.`,
    )
  } else if (turn >= MAX_TURNS) {
    status = 'lost_turns'
    log.push(
      `Result: you lost. Out of turns with pressure ${pressure.toFixed(0)} (need ${WIN_CO2} or less). Usual population and prosperity growth outran your intensity cuts.`,
    )
  }

  return { ...nextState, log, status }
}

export function getAction(actionId: string): ClimateAction | undefined {
  return ACTIONS.find((a) => a.id === actionId)
}

export const FACTOR_LABELS: Record<FactorKey, string> = {
  population: 'Population',
  affluence: 'Economic activity',
  energyIntensity: 'Energy intensity',
  carbonIntensity: 'Carbon intensity',
}
