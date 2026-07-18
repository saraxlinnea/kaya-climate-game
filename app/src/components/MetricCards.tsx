import type { KayaRow } from '../types'
import { buildNarrative, formatCompact, formatPct, pctChange } from '../lib/narrative'

type Props = {
  series: KayaRow[]
}

function deltaClass(pct: number, invertGood: boolean): string {
  if (Math.abs(pct) < 1) return 'neutral'
  const improved = invertGood ? pct < 0 : pct > 0
  return improved ? 'down' : 'up'
}

export function MetricCards({ series }: Props) {
  if (series.length < 2) return null
  const start = series[0]
  const end = series[series.length - 1]

  const cards = [
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

  return (
    <dl className="metrics">
      {cards.map((card) => (
        <div className="metric" key={card.label}>
          <dt>{card.label}</dt>
          <dd>
            {card.value}
            <span className={`delta ${deltaClass(card.pct, card.invertGood)}`}>
              {formatPct(card.pct)} since {start.year}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function NarrativePanel({ series }: Props) {
  const narrative = buildNarrative(series)
  if (!narrative) return null
  const start = series[0]
  const end = series[series.length - 1]

  return (
    <section className="panel">
      <h2 className="panel-title">Emissions changed because…</h2>
      <p className="panel-note">
        {start.year} → {end.year}. Factors interact; no single driver “causes” the outcome alone.
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
