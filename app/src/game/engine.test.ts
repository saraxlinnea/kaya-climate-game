import { describe, expect, it } from 'vitest'
import type { KayaRow } from '../types'
import {
  ACTIONS,
  DIMINISH_FACTOR,
  MAX_ACTION_USES,
  MIN_AFFLUENCE,
  WIN_CO2,
} from './actions'
import { DEFAULT_FIGHT_RULES } from './challenges'
import {
  applyAction,
  diminishMultiplier,
  emissionsPressure,
  previewEffects,
  prosperityIndex,
  seedFromContext,
  type GameState,
} from './engine'
import { pctChange } from '../lib/narrative'

function row(overrides: Partial<KayaRow> & Pick<KayaRow, 'iso_code' | 'country'>): KayaRow {
  return {
    year: 2022,
    co2: 1000,
    population: 50_000_000,
    gdp: 1e12,
    gdp_per_capita: 20_000,
    energy_consumption: 1000,
    energy_intensity: 1e-9,
    carbon_intensity: 0.5,
    electricity_carbon_intensity: 400,
    ...overrides,
  }
}

function seedNeutral(extra?: Partial<Parameters<typeof seedFromContext>[0]>): GameState {
  const r = row({ iso_code: 'TST', country: 'Testland' })
  return seedFromContext({
    row: r,
    medianEnergyIntensity: r.energy_intensity,
    medianCarbonIntensity: r.carbon_intensity,
    medianElectricityCarbonIntensity: 400,
    historyStart: { ...r, year: 2000, population: 45_000_000, gdp_per_capita: 15_000 },
    historyEnd: r,
    ...extra,
  })
}

describe('combat engine invariants', () => {
  it('starts emissions pressure and prosperity at 100', () => {
    const state = seedNeutral()
    expect(emissionsPressure(state)).toBe(100)
    expect(prosperityIndex(state)).toBe(100)
  })

  it('tracks pressure as product ratio vs start', () => {
    let state = seedNeutral()
    state = {
      ...state,
      factors: {
        ...state.factors,
        carbonIntensity: state.factors.carbonIntensity * 0.5,
      },
    }
    const expected =
      (100 *
        (state.factors.population *
          state.factors.affluence *
          state.factors.energyIntensity *
          state.factors.carbonIntensity)) /
      (state.startFactors.population *
        state.startFactors.affluence *
        state.startFactors.energyIntensity *
        state.startFactors.carbonIntensity)
    expect(emissionsPressure(state)).toBeCloseTo(expected, 10)
  })

  it('softens multipliers toward 1.0 with diminishing returns', () => {
    const base = 0.88
    expect(diminishMultiplier(base, 0)).toBe(base)
    const once = diminishMultiplier(base, 1)
    const twice = diminishMultiplier(base, 2)
    expect(once).toBeGreaterThan(base)
    expect(once).toBeLessThan(1)
    expect(twice).toBeGreaterThan(once)
    expect(twice).toBeLessThan(1)
    expect(once).toBeCloseTo(1 + (base - 1) * DIMINISH_FACTOR, 12)
  })

  it('exhausts an action after MAX_ACTION_USES', () => {
    let state = seedNeutral()
    for (let i = 0; i < MAX_ACTION_USES; i++) {
      state = applyAction(state, 'solar')
      expect(state.status).toBe('playing')
    }
    const blocked = applyAction(state, 'solar')
    expect(blocked.turn).toBe(state.turn)
    expect(blocked.actionUses.solar).toBe(MAX_ACTION_USES)
    expect(blocked.log.at(-1)).toMatch(/exhausted/)
  })

  it('wins when pressure ≤ WIN_CO2 with prosperity held', () => {
    let state = seedNeutral({
      row: row({ iso_code: 'WIN', country: 'Winnable' }),
      historyStart: row({
        iso_code: 'WIN',
        country: 'Winnable',
        year: 2000,
        population: 50_000_000,
        gdp_per_capita: 20_000,
      }),
    })
    state = { ...state, bau: { population: 1, affluence: 1 } }

    const path = [
      'coal_retire',
      'coal_retire',
      'coal_retire',
      'solar',
      'solar',
      'solar',
      'nuclear',
      'nuclear',
    ]
    for (const id of path) {
      if (state.status !== 'playing') break
      state = applyAction(state, id)
    }
    expect(state.status).toBe('won')
    expect(emissionsPressure(state)).toBeLessThanOrEqual(WIN_CO2)
    expect(prosperityIndex(state)).toBeGreaterThanOrEqual(MIN_AFFLUENCE)
  })

  it('loses on prosperity floor', () => {
    let state = seedNeutral()
    state = {
      ...state,
      bau: { population: 1, affluence: 1 },
      factors: { ...state.factors, affluence: 71 },
      startFactors: { ...state.startFactors, affluence: 100 },
    }
    state = applyAction(state, 'dac')
    expect(state.status).toBe('lost_economy')
    expect(prosperityIndex(state)).toBeLessThan(MIN_AFFLUENCE)
  })

  it('loses when turn cap is hit without a win', () => {
    let state = seedNeutral()
    state = {
      ...state,
      bau: { population: 1.02, affluence: 1.03 },
      rules: { ...DEFAULT_FIGHT_RULES, maxTurns: 2, bannedActionIds: [] },
    }
    state = applyAction(state, 'grow')
    expect(state.status).toBe('playing')
    state = applyAction(state, 'grow')
    expect(state.status).toBe('lost_turns')
    expect(state.turn).toBe(2)
  })

  it('cuts EV carbon intensity more on a clean Ember grid than a dirty one', () => {
    const baseRow = row({ iso_code: 'EV', country: 'Evland' })
    const clean = seedFromContext({
      row: { ...baseRow, electricity_carbon_intensity: 200 },
      medianEnergyIntensity: baseRow.energy_intensity,
      medianCarbonIntensity: baseRow.carbon_intensity,
      medianElectricityCarbonIntensity: 400,
    })
    const dirty = seedFromContext({
      row: { ...baseRow, electricity_carbon_intensity: 800 },
      medianEnergyIntensity: baseRow.energy_intensity,
      medianCarbonIntensity: baseRow.carbon_intensity,
      medianElectricityCarbonIntensity: 400,
    })
    const cleanFx = previewEffects(clean, 'evs')
    const dirtyFx = previewEffects(dirty, 'evs')
    expect(cleanFx?.carbonIntensity).toBeDefined()
    expect(dirtyFx?.carbonIntensity).toBeDefined()
    expect(cleanFx!.carbonIntensity!).toBeLessThan(dirtyFx!.carbonIntensity!)
  })

  it('pctChange returns null for zero or non-finite baselines', () => {
    expect(pctChange(0, 10)).toBeNull()
    expect(pctChange(Number.NaN, 10)).toBeNull()
    expect(pctChange(100, 110)).toBe(10)
  })

  it('does not advance the turn for banned challenge actions', () => {
    let state = seedNeutral()
    state = {
      ...state,
      rules: { maxTurns: 8, bannedActionIds: ['evs'] },
    }
    const next = applyAction(state, 'evs')
    expect(next.turn).toBe(0)
    expect(next.actionUses.evs).toBeUndefined()
    expect(next.log.at(-1)).toMatch(/locked/)
  })

  it('gives every action a category and at least one effect', () => {
    expect(ACTIONS.length).toBeGreaterThanOrEqual(12)
    for (const a of ACTIONS) {
      expect(a.category, a.id).toBeTruthy()
      expect(Object.keys(a.effects).length, a.id).toBeGreaterThan(0)
      expect(a.blurb && a.tradeoff && a.realWorld, a.id).toBeTruthy()
    }
  })
})
