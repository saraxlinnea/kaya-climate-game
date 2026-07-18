export type KayaRow = {
  country: string
  iso_code: string
  year: number
  co2: number
  population: number
  gdp: number
  gdp_per_capita: number
  energy_consumption: number
  energy_intensity: number
  carbon_intensity: number
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
