import type { KayaRow } from '../types'
import {
  buildConsumptionNarrative,
  buildNarrative,
  formatCompact,
  formatPct,
  kayaProduct,
  pctChange,
} from '../lib/narrative'
import { getCountryContext } from '../lib/countrySources'

type Props = {
  series: KayaRow[]
}

function deltaClass(pct: number | null, invertGood: boolean): string {
  if (pct == null || Math.abs(pct) < 1) return 'neutral'
  const improved = invertGood ? pct < 0 : pct > 0
  return improved ? 'down' : 'up'
}

export function MetricCards({ series }: Props) {
  if (series.length < 2) return null
  const start = series[0]
  const end = series[series.length - 1]

  const cards: {
    label: string
    value: string
    pct: number | null
    invertGood: boolean
    sinceYear?: number
  }[] = [
    {
      label: 'Population',
      value: formatCompact(end.population, 'people'),
      pct: pctChange(start.population, end.population),
      invertGood: false,
    },
    {
      label: 'GDP per capita',
      value: formatCompact(end.gdp_per_capita, 'money'),
      pct: pctChange(start.gdp_per_capita, end.gdp_per_capita),
      invertGood: false,
    },
    {
      label: 'Energy intensity',
      value: formatCompact(end.energy_intensity, 'raw'),
      pct: pctChange(start.energy_intensity, end.energy_intensity),
      invertGood: true,
    },
    {
      label: 'Carbon intensity',
      value: formatCompact(end.carbon_intensity, 'raw'),
      pct: pctChange(start.carbon_intensity, end.carbon_intensity),
      invertGood: true,
    },
    {
      label: 'CO₂ emissions',
      value: formatCompact(end.co2, 'mt'),
      pct: pctChange(start.co2, end.co2),
      invertGood: true,
    },
  ]

  const withGrid = series.filter(
    (r) =>
      r.electricity_carbon_intensity != null &&
      Number.isFinite(r.electricity_carbon_intensity) &&
      r.electricity_carbon_intensity > 0,
  )
  if (withGrid.length >= 2) {
    const g0 = withGrid[0]
    const g1 = withGrid[withGrid.length - 1]
    cards.splice(4, 0, {
      label: 'Grid intensity',
      value: `${Number(g1.electricity_carbon_intensity).toFixed(0)} g/kWh`,
      pct: pctChange(
        Number(g0.electricity_carbon_intensity),
        Number(g1.electricity_carbon_intensity),
      ),
      invertGood: true,
      sinceYear: g0.year,
    })
  }

  // Level lenses (not the Champion trajectory score)
  const co2Pc = end.co2 / (end.population / 1e6) // Mt per million people = t/person
  const co2PerGdp = end.co2 / (end.gdp / 1e9) // Mt per billion $

  return (
    <>
      <dl className="metrics">
        {cards.map((card) => (
          <div className="metric" key={card.label}>
            <dt>{card.label}</dt>
            <dd>
              {card.value}
              <span className={`delta ${deltaClass(card.pct, card.invertGood)}`}>
                {formatPct(card.pct)} since {card.sinceYear ?? start.year}
              </span>
            </dd>
          </div>
        ))}
      </dl>
      <dl className="metrics metrics-levels">
        <div className="metric">
          <dt>CO₂ per person (today)</dt>
          <dd>
            {co2Pc.toFixed(1)} t/person
            <span className="delta neutral">A level metric, not the Champion score</span>
          </dd>
        </div>
        <div className="metric">
          <dt>CO₂ per dollar of GDP (today)</dt>
          <dd>
            {co2PerGdp.toFixed(2)} Mt / $B
            <span className="delta neutral">How carbon-heavy the economy is now</span>
          </dd>
        </div>
      </dl>
    </>
  )
}

export function KayaMathPanel({ series }: Props) {
  if (series.length < 1) return null
  const end = series[series.length - 1]
  const start = series[0]
  const product = kayaProduct(end)
  const match = Math.abs(product - end.co2) / end.co2 < 1e-6

  return (
    <section className="panel">
      <h2 className="panel-title">
        The math for {end.country}, {end.year}
      </h2>
      <p className="panel-note">
        These four numbers multiply to territorial CO₂. That is an accounting identity, not a claim
        that one factor caused the outcome.
      </p>
      <p className="kaya-equation" aria-label="Kaya identity">
        CO<sub>2</sub> = P × (GDP/P) × (E/GDP) × (CO<sub>2</sub>/E)
      </p>
      <table className="rank-table kaya-math-table">
        <thead>
          <tr>
            <th scope="col">Factor</th>
            <th scope="col">{end.year}</th>
            {series.length >= 2 && <th scope="col">{start.year}</th>}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Population (P)</th>
            <td>{formatCompact(end.population, 'people')}</td>
            {series.length >= 2 && <td>{formatCompact(start.population, 'people')}</td>}
          </tr>
          <tr>
            <th scope="row">Income per person (GDP/P)</th>
            <td>{formatCompact(end.gdp_per_capita, 'money')} PPP</td>
            {series.length >= 2 && (
              <td>{formatCompact(start.gdp_per_capita, 'money')} PPP</td>
            )}
          </tr>
          <tr>
            <th scope="row">Energy intensity (E/GDP)</th>
            <td>{formatCompact(end.energy_intensity, 'raw')} TWh / $</td>
            {series.length >= 2 && (
              <td>{formatCompact(start.energy_intensity, 'raw')} TWh / $</td>
            )}
          </tr>
          <tr>
            <th scope="row">Carbon intensity (CO₂/E)</th>
            <td>{formatCompact(end.carbon_intensity, 'raw')} Mt / TWh</td>
            {series.length >= 2 && (
              <td>{formatCompact(start.carbon_intensity, 'raw')} Mt / TWh</td>
            )}
          </tr>
          <tr>
            <th scope="row">Product (equals territorial CO₂)</th>
            <td>
              {formatCompact(product, 'mt')}
              {match ? ' ✓' : ''}
            </td>
            {series.length >= 2 && <td>{formatCompact(kayaProduct(start), 'mt')}</td>}
          </tr>
          <tr>
            <th scope="row">Reported territorial CO₂</th>
            <td>{formatCompact(end.co2, 'mt')}</td>
            {series.length >= 2 && <td>{formatCompact(start.co2, 'mt')}</td>}
          </tr>
        </tbody>
      </table>
      <p className="chart-caption">
        Units: population in people; income in international dollars (PPP); energy intensity as
        terawatt-hours per dollar of GDP; carbon intensity as million tonnes of CO₂ per terawatt-hour.
      </p>
    </section>
  )
}

export function NarrativePanel({ series }: Props) {
  const narrative = buildNarrative(series)
  if (!narrative) return null
  const start = series[0]
  const end = series[series.length - 1]

  return (
    <section className="panel">
      <h2 className="panel-title">What changed in the data</h2>
      <p className="panel-note">
        From {start.year} to {end.year}, using territorial CO₂. These bullets describe the four
        Kaya identity factors. They do not claim those are the only things that move emissions.
      </p>
      <ul className="narrative-list">
        {narrative.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <p className="narrative-result">{narrative.result}</p>
    </section>
  )
}

export function ConsumptionNarrativePanel({ series }: Props) {
  const narrative = buildConsumptionNarrative(series)
  if (!narrative) return null
  const start = series[0]
  const end = series[series.length - 1]

  return (
    <section className="panel">
      <h2 className="panel-title">Production versus consumption</h2>
      <p className="panel-note">
        From {start.year} to {end.year}. Consumption-based CO₂ adjusts for trade. The Champion score
        still uses territorial CO₂. This panel is a footprint check, not a rescoring.
      </p>
      <ul className="narrative-list">
        {narrative.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <p className="narrative-result">{narrative.result}</p>
    </section>
  )
}

export function ExternalContextPanel({
  iso,
  countryName,
}: {
  iso: string
  countryName: string
}) {
  const { blurb, sources } = getCountryContext(iso, countryName)
  return (
    <section className="panel">
      <h2 className="panel-title">Further reading</h2>
      <p className="panel-note">
        Links to outside sources. The bullets above are mechanical summaries from our dataset, not
        original reporting.
      </p>
      {blurb && <p className="narrative-result">{blurb}</p>}
      <ul className="source-list">
        {sources.map((s) => (
          <li key={s.url}>
            <a className="country-link" href={s.url} target="_blank" rel="noopener noreferrer">
              {s.title}
            </a>
            <span className="muted"> Source: {s.source}</span>
            {s.note && <div className="muted source-note">{s.note}</div>}
          </li>
        ))}
      </ul>
    </section>
  )
}
