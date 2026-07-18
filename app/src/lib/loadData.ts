import Papa from 'papaparse'
import type { CountryOption, KayaRow, ScoreRow } from '../types'

function num(value: string | undefined): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : NaN
}

async function fetchCsv<T>(url: string, mapRow: (row: Record<string, string>) => T): Promise<T[]> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to load ${url} (${res.status})`)
  }
  const text = await res.text()
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })
  if (parsed.errors.length) {
    throw new Error(`CSV parse error in ${url}: ${parsed.errors[0]?.message}`)
  }
  return parsed.data.map(mapRow).filter(Boolean)
}

export async function loadKayaDataset(): Promise<KayaRow[]> {
  return fetchCsv('/data/kaya_dataset.csv', (row) => ({
    country: row.country,
    iso_code: row.iso_code,
    year: num(row.year),
    co2: num(row.co2),
    population: num(row.population),
    gdp: num(row.gdp),
    gdp_per_capita: num(row.gdp_per_capita),
    energy_consumption: num(row.energy_consumption),
    energy_intensity: num(row.energy_intensity),
    carbon_intensity: num(row.carbon_intensity),
  }))
}

export async function loadKayaScores(): Promise<ScoreRow[]> {
  return fetchCsv('/data/kaya_scores.csv', (row) => ({
    country: row.country,
    iso_code: row.iso_code,
    start_year: num(row.start_year),
    end_year: num(row.end_year),
    co2_pct: num(row.co2_pct),
    gdp_per_capita_pct: num(row.gdp_per_capita_pct),
    energy_intensity_pct: num(row.energy_intensity_pct),
    carbon_intensity_pct: num(row.carbon_intensity_pct),
    score_decarbonization: num(row.score_decarbonization),
    score_prosperity: num(row.score_prosperity),
    score_efficiency: num(row.score_efficiency),
    score_clean: num(row.score_clean),
    kaya_score: num(row.kaya_score),
  }))
}

export function listCountries(rows: KayaRow[]): CountryOption[] {
  const map = new Map<string, string>()
  for (const row of rows) {
    if (!map.has(row.iso_code)) {
      map.set(row.iso_code, row.country)
    }
  }
  return [...map.entries()]
    .map(([iso_code, country]) => ({ iso_code, country }))
    .sort((a, b) => a.country.localeCompare(b.country))
}

export function seriesForCountry(rows: KayaRow[], iso: string, fromYear = 1990): KayaRow[] {
  return rows
    .filter((r) => r.iso_code === iso && r.year >= fromYear)
    .sort((a, b) => a.year - b.year)
}
