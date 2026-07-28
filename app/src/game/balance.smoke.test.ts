/**
 * Light combat balance smoke using demo kaya_dataset.csv.
 * See ../../../../COMBAT_BALANCE.md (repo root) for qualitative notes.
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { KayaRow } from '../types'
import { MIN_AFFLUENCE, WIN_CO2 } from './actions'
import {
  applyAction,
  emissionsPressure,
  medianOf,
  previewEffects,
  prosperityIndex,
  seedFromContext,
  type GameState,
} from './engine'

const CSV = join(dirname(fileURLToPath(import.meta.url)), '../../public/data/kaya_dataset.csv')
const ARENAS = ['USA', 'FRA', 'POL', 'CHN'] as const
const SCRIPT = [
  'coal_retire',
  'solar',
  'buildings',
  'coal_retire',
  'nuclear',
  'efficiency_industry',
  'solar',
  'buildings',
] as const

function parseCsv(text: string): KayaRow[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim())
  const rows: KayaRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i])
    if (cols.length < headers.length) continue
    const obj: Record<string, string> = {}
    headers.forEach((h, j) => {
      obj[h] = cols[j] ?? ''
    })
    const num = (k: string) => {
      const v = Number(obj[k])
      return Number.isFinite(v) ? v : NaN
    }
    const co2 = num('co2')
    if (!Number.isFinite(co2)) continue
    rows.push({
      country: obj.country,
      iso_code: obj.iso_code,
      year: num('year'),
      co2,
      consumption_co2: obj.consumption_co2 === '' ? null : num('consumption_co2'),
      population: num('population'),
      gdp: num('gdp'),
      gdp_per_capita: num('gdp_per_capita'),
      energy_consumption: num('energy_consumption'),
      energy_intensity: num('energy_intensity'),
      carbon_intensity: num('carbon_intensity'),
      electricity_carbon_intensity:
        obj.electricity_carbon_intensity === '' || obj.electricity_carbon_intensity == null
          ? null
          : num('electricity_carbon_intensity'),
    })
  }
  return rows
}

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

function latestByIso(rows: KayaRow[]): Map<string, KayaRow> {
  const map = new Map<string, KayaRow>()
  for (const r of rows) {
    const prev = map.get(r.iso_code)
    if (!prev || r.year > prev.year) map.set(r.iso_code, r)
  }
  return map
}

function rowInYear(rows: KayaRow[], iso: string, year: number): KayaRow | undefined {
  return rows.find((r) => r.iso_code === iso && r.year === year)
}

function runScript(state: GameState): GameState {
  let s = state
  for (const id of SCRIPT) {
    if (s.status !== 'playing') break
    s = applyAction(s, id)
  }
  return s
}

describe('combat balance smoke (demo CSV)', () => {
  it('finds the demo kaya_dataset.csv', () => {
    expect(existsSync(CSV)).toBe(true)
  })

  it('seeds USA/FRA/POL/CHN and keeps a scripted fight finite', () => {
    const rows = parseCsv(readFileSync(CSV, 'utf8'))
    expect(rows.length).toBeGreaterThan(100)
    const latest = latestByIso(rows)
    const peers = [...latest.values()]
    const medianEI = medianOf(peers.map((r) => r.energy_intensity))
    const medianCI = medianOf(peers.map((r) => r.carbon_intensity))
    const gridValues = peers
      .map((r) => r.electricity_carbon_intensity)
      .filter((v): v is number => v != null && Number.isFinite(v))
    const medianGrid = gridValues.length ? medianOf(gridValues) : undefined

    const results: {
      iso: string
      startCI: number
      status: string
      pressure: number
      prosperity: number
    }[] = []

    for (const iso of ARENAS) {
      const end = latest.get(iso)
      expect(end, iso).toBeDefined()
      const start = rowInYear(rows, iso, 2000) ?? rows.find((r) => r.iso_code === iso)
      expect(start, iso).toBeDefined()

      let state = seedFromContext({
        row: end!,
        medianEnergyIntensity: medianEI,
        medianCarbonIntensity: medianCI,
        medianElectricityCarbonIntensity: medianGrid,
        historyStart: start,
        historyEnd: end,
      })

      expect(Number.isFinite(emissionsPressure(state))).toBe(true)
      expect(Number.isFinite(prosperityIndex(state))).toBe(true)

      state = runScript(state)
      const pressure = emissionsPressure(state)
      const prosperity = prosperityIndex(state)
      expect(Number.isFinite(pressure), iso).toBe(true)
      expect(Number.isFinite(prosperity), iso).toBe(true)
      expect(['playing', 'won', 'lost_turns', 'lost_economy']).toContain(state.status)

      results.push({
        iso,
        startCI: state.startFactors.carbonIntensity,
        status: state.status,
        pressure,
        prosperity,
      })
    }

    const fra = results.find((r) => r.iso === 'FRA')!
    const pol = results.find((r) => r.iso === 'POL')!
    expect(fra.startCI).toBeLessThan(pol.startCI)

    const fraState = seedFromContext({
      row: latest.get('FRA')!,
      medianEnergyIntensity: medianEI,
      medianCarbonIntensity: medianCI,
      medianElectricityCarbonIntensity: medianGrid,
    })
    const polState = seedFromContext({
      row: latest.get('POL')!,
      medianEnergyIntensity: medianEI,
      medianCarbonIntensity: medianCI,
      medianElectricityCarbonIntensity: medianGrid,
    })
    if (
      fraState.gridIntensity != null &&
      polState.gridIntensity != null &&
      fraState.medianGridIntensity != null
    ) {
      const fraEv = previewEffects(fraState, 'evs')?.carbonIntensity
      const polEv = previewEffects(polState, 'evs')?.carbonIntensity
      expect(fraEv).toBeDefined()
      expect(polEv).toBeDefined()
      expect(fraEv!).toBeLessThan(polEv!)
    }

    for (const r of results) {
      expect(r.pressure, r.iso).toBeLessThan(100)
      if (r.status === 'won') {
        expect(r.pressure).toBeLessThanOrEqual(WIN_CO2)
        expect(r.prosperity).toBeGreaterThanOrEqual(MIN_AFFLUENCE)
      }
    }
  })
})
