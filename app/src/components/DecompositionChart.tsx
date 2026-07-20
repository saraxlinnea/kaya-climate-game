import type { KayaRow } from '../types'

export type LogParts = {
  dlnPopulation: number
  dlnGdpPerCapita: number
  dlnEnergyIntensity: number
  dlnCarbonIntensity: number
  dlnCo2: number
  startYear: number
  endYear: number
}

/** Additive log decomposition: Δln(CO₂) ≈ sum of Δln(factors). */
export function logDecomposition(series: KayaRow[]): LogParts | null {
  if (series.length < 2) return null
  const start = series[0]
  const end = series[series.length - 1]
  const dln = (a: number, b: number) => Math.log(b) - Math.log(a)

  const dlnPopulation = dln(start.population, end.population)
  const dlnGdpPerCapita = dln(start.gdp_per_capita, end.gdp_per_capita)
  const dlnEnergyIntensity = dln(start.energy_intensity, end.energy_intensity)
  const dlnCarbonIntensity = dln(start.carbon_intensity, end.carbon_intensity)

  return {
    dlnPopulation,
    dlnGdpPerCapita,
    dlnEnergyIntensity,
    dlnCarbonIntensity,
    dlnCo2: dln(start.co2, end.co2),
    startYear: start.year,
    endYear: end.year,
  }
}

const DECOMP_ROWS: { key: keyof LogParts; label: string; className: string }[] = [
  { key: 'dlnPopulation', label: 'Population', className: 'decomp-pop' },
  { key: 'dlnGdpPerCapita', label: 'GDP/capita', className: 'decomp-gdp' },
  { key: 'dlnEnergyIntensity', label: 'Energy intensity', className: 'decomp-ei' },
  { key: 'dlnCarbonIntensity', label: 'Carbon intensity', className: 'decomp-ci' },
]

type DecompositionProps = {
  series: KayaRow[]
  country: string
}

export function DecompositionChart({ series, country }: DecompositionProps) {
  const parts = logDecomposition(series)
  if (!parts) return null

  const values = DECOMP_ROWS.map((r) => Number(parts[r.key]))
  const maxAbs = Math.max(...values.map((v) => Math.abs(v)), Math.abs(parts.dlnCo2), 0.05)

  return (
    <section className="panel">
      <h2 className="panel-title">What pushed emissions up or down?</h2>
      <p className="panel-note">
        For {country} from {parts.startYear} to {parts.endYear}, each bar is that factor’s
        contribution to the change in emissions (on a log scale), within the Kaya identity. The bars
        add up, within rounding, to the total change in CO₂.
      </p>
      <figure>
        <div className="decomp-chart" role="img" aria-label="Contribution of each driver to the change in emissions">
          {DECOMP_ROWS.map((row, i) => {
            const v = values[i]
            const pct = (Math.abs(v) / maxAbs) * 50
            return (
              <div className="decomp-row" key={row.key}>
                <span className="decomp-label">{row.label}</span>
                <div className="decomp-track">
                  <div className="decomp-zero" />
                  <div
                    className={`decomp-bar ${row.className} ${v >= 0 ? 'pos' : 'neg'}`}
                    style={
                      v >= 0
                        ? { left: '50%', width: `${pct}%` }
                        : { right: '50%', width: `${pct}%` }
                    }
                  />
                </div>
                <output className={v >= 0 ? 'delta-pos' : 'delta-neg'}>
                  {v >= 0 ? '+' : ''}
                  {v.toFixed(2)}
                </output>
              </div>
            )
          })}
          <div className="decomp-row decomp-total">
            <span className="decomp-label">Total CO₂ change</span>
            <div className="decomp-track">
              <div className="decomp-zero" />
              <div
                className={`decomp-bar decomp-co2 ${parts.dlnCo2 >= 0 ? 'pos' : 'neg'}`}
                style={
                  parts.dlnCo2 >= 0
                    ? { left: '50%', width: `${(Math.abs(parts.dlnCo2) / maxAbs) * 50}%` }
                    : { right: '50%', width: `${(Math.abs(parts.dlnCo2) / maxAbs) * 50}%` }
                }
              />
            </div>
            <output className={parts.dlnCo2 >= 0 ? 'delta-pos' : 'delta-neg'}>
              {parts.dlnCo2 >= 0 ? '+' : ''}
              {parts.dlnCo2.toFixed(2)}
            </output>
          </div>
        </div>
        <figcaption className="chart-caption">
          Bars that extend to the right raised emissions. Bars that extend to the left lowered them.
          Population and income often push right. Falling energy or carbon intensity push left. This
          is only the Kaya identity breakdown; other forces can matter too. No single bar is the
          whole story, and this chart is not the Champion score.
        </figcaption>
      </figure>
    </section>
  )
}
