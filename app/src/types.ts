export type KayaRow = {
  country: string
  iso_code: string
  year: number
  co2: number
  /** Consumption-based CO₂ (Mt); may be missing. */
  consumption_co2?: number | null
  population: number
  gdp: number
  gdp_per_capita: number
  energy_consumption: number
  energy_intensity: number
  carbon_intensity: number
  /** Ember grid intensity (gCO2e/kWh); may be missing. */
  electricity_carbon_intensity?: number | null
}

export type ScoreRow = {
  country: string
  iso_code: string
  start_year: number
  end_year: number
  co2_pct: number
  gdp_per_capita_pct: number
  energy_intensity_pct: number
  carbon_intensity_pct: number
  score_decarbonization: number
  score_prosperity: number
  score_efficiency: number
  score_clean: number
  kaya_score: number
}

export type CountryOption = {
  iso_code: string
  country: string
}
