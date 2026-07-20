import type { ReactNode } from 'react'
import type { KayaRow } from '../types'
import { formatPct, pctChange } from '../lib/narrative'

type SeriesChartProps = {
  series: KayaRow[]
  country: string
}

function extent(values: number[]): [number, number] {
  let min = values[0]
  let max = values[0]
  for (const v of values) {
    if (v < min) min = v
    if (v > max) max = v
  }
  if (min === max) {
    return [min * 0.9, max * 1.1 || 1]
  }
  const pad = (max - min) * 0.08
  return [min - pad, max + pad]
}

function buildPath(
  xs: number[],
  ys: number[],
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  w: number,
  h: number,
  pad: { l: number; r: number; t: number; b: number },
): string {
  const iw = w - pad.l - pad.r
  const ih = h - pad.t - pad.b
  return ys
    .map((y, i) => {
      const px = pad.l + ((xs[i] - x0) / (x1 - x0)) * iw
      const py = pad.t + (1 - (y - y0) / (y1 - y0)) * ih
      return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`
    })
    .join(' ')
}

const PAD = { l: 44, r: 12, t: 28, b: 36 }

function ChartCaption({ children }: { children: ReactNode }) {
  return <figcaption className="chart-caption">{children}</figcaption>
}

export function EmissionsChart({
  series,
  country,
  mode = 'territorial',
}: SeriesChartProps & { mode?: 'territorial' | 'consumption' }) {
  const w = 640
  const h = 280
  const terrPoints = series
    .map((r) => ({ year: r.year, value: r.co2 }))
    .filter((p) => Number.isFinite(p.value))
  const consPoints = series
    .map((r) => ({ year: r.year, value: r.consumption_co2 }))
    .filter((p) => p.value != null && Number.isFinite(p.value)) as {
    year: number
    value: number
  }[]
  const primary = mode === 'consumption' ? consPoints : terrPoints
  const showBoth = terrPoints.length >= 2 && consPoints.length >= 2

  if (primary.length < 2) {
    return (
      <div className="chart-wrap">
        <p className="muted">
          {mode === 'consumption'
            ? 'Consumption-based CO₂ is not available for enough years in this country.'
            : 'Not enough emissions points to chart.'}
        </p>
      </div>
    )
  }

  const years = primary.map((p) => p.year)
  const [x0, x1] = [years[0], years[years.length - 1]]
  const yVals = showBoth
    ? [...terrPoints.map((p) => p.value), ...consPoints.map((p) => p.value)]
    : primary.map((p) => p.value)
  const [y0, y1] = extent(yVals)
  const terrPath = showBoth
    ? buildPath(
        terrPoints.map((p) => p.year),
        terrPoints.map((p) => p.value),
        x0,
        x1,
        y0,
        y1,
        w,
        h,
        PAD,
      )
    : null
  const consPath = showBoth
    ? buildPath(
        consPoints.map((p) => p.year),
        consPoints.map((p) => p.value),
        x0,
        x1,
        y0,
        y1,
        w,
        h,
        PAD,
      )
    : null
  const singlePath =
    !showBoth &&
    buildPath(
      primary.map((p) => p.year),
      primary.map((p) => p.value),
      x0,
      x1,
      y0,
      y1,
      w,
      h,
      PAD,
    )
  const title = showBoth
    ? `${country}: territorial and consumption CO₂`
    : mode === 'consumption'
      ? `${country}: consumption CO₂`
      : `${country}: territorial CO₂`

  return (
    <figure className="chart-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} className="svg-chart" role="img" aria-label={title}>
        <text x={PAD.l} y={18} className="chart-title">
          {title}
        </text>
        <line
          x1={PAD.l}
          y1={h - PAD.b}
          x2={w - PAD.r}
          y2={h - PAD.b}
          className="chart-axis"
        />
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={h - PAD.b} className="chart-axis" />
        {showBoth && terrPath && (
          <path
            d={terrPath}
            className={`chart-line chart-line-co2${mode === 'consumption' ? ' chart-line-dim' : ''}`}
          />
        )}
        {showBoth && consPath && (
          <path
            d={consPath}
            className={`chart-line chart-line-cons${mode === 'territorial' ? ' chart-line-dim' : ''}`}
          />
        )}
        {!showBoth && singlePath && (
          <path
            d={singlePath}
            className={`chart-line ${mode === 'consumption' ? 'chart-line-cons' : 'chart-line-co2'}`}
          />
        )}
        <text x={PAD.l} y={h - 10} className="chart-label">
          {x0}
        </text>
        <text x={w - PAD.r} y={h - 10} className="chart-label" textAnchor="end">
          {x1}
        </text>
        <text x={8} y={PAD.t + 4} className="chart-label">
          {y1.toFixed(0)} Mt
        </text>
        <text x={8} y={h - PAD.b} className="chart-label">
          {y0.toFixed(0)}
        </text>
      </svg>
      {showBoth && (
        <div className="chart-legend">
          <span>
            <i className="swatch chart-line-co2" /> Territorial
          </span>
          <span>
            <i className="swatch chart-line-cons" /> Consumption
          </span>
        </div>
      )}
      <ChartCaption>
        Million tonnes of CO₂ from {x0} to {x1}. Territorial emissions are produced inside the
        country’s borders. Consumption emissions adjust for trade in goods. The Kaya Champion score
        uses territorial totals only. The toggle above highlights one series when both are drawn.
      </ChartCaption>
    </figure>
  )
}

const FACTOR_SERIES: {
  key: keyof KayaRow
  label: string
  className: string
}[] = [
  { key: 'population', label: 'Population', className: 'chart-line-pop' },
  { key: 'gdp_per_capita', label: 'Income per person', className: 'chart-line-gdp' },
  { key: 'energy_intensity', label: 'Energy intensity', className: 'chart-line-ei' },
  { key: 'carbon_intensity', label: 'Carbon intensity', className: 'chart-line-ci' },
]

function factorsReadingLine(series: KayaRow[]): string | null {
  if (series.length < 2) return null
  const start = series[0]
  const end = series[series.length - 1]
  const bits: string[] = []
  const gdp = pctChange(start.gdp_per_capita, end.gdp_per_capita)
  const ei = pctChange(start.energy_intensity, end.energy_intensity)
  const ci = pctChange(start.carbon_intensity, end.carbon_intensity)
  const co2 = pctChange(start.co2, end.co2)
  if (gdp != null && gdp > 2) bits.push(`income per person rose ${formatPct(gdp, 0)}`)
  else if (gdp != null && gdp < -2) bits.push(`income per person fell ${formatPct(gdp, 0)}`)
  if (ei != null && ei < -2) bits.push(`energy intensity fell ${formatPct(ei, 0)}`)
  if (ci != null && ci < -2) bits.push(`carbon intensity fell ${formatPct(ci, 0)}`)
  if (co2 != null) bits.push(`total CO₂ changed ${formatPct(co2, 0)}`)
  if (bits.length === 0) return null
  return `Over this window, ${bits.join('; ')}.`
}

export function FactorsChart({ series, country }: SeriesChartProps) {
  const w = 640
  const h = 300
  const years = series.map((r) => r.year)
  const [x0, x1] = [years[0], years[years.length - 1]]
  const indexed = FACTOR_SERIES.map((f) => {
    const base = Number(series[0][f.key])
    return series.map((r) => (Number(r[f.key]) / base) * 100)
  })
  const all = indexed.flat()
  const [y0, y1] = extent(all)
  const reading = factorsReadingLine(series)
  const title = `How four parts of the Kaya identity changed in ${country}`

  return (
    <figure className="chart-wrap">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="svg-chart"
        role="img"
        aria-label={title}
      >
        <text x={PAD.l} y={18} className="chart-title">
          {title}
        </text>
        <line
          x1={PAD.l}
          y1={h - PAD.b}
          x2={w - PAD.r}
          y2={h - PAD.b}
          className="chart-axis"
        />
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={h - PAD.b} className="chart-axis" />
        {indexed.map((ys, i) => (
          <path
            key={FACTOR_SERIES[i].key}
            d={buildPath(years, ys, x0, x1, y0, y1, w, h, PAD)}
            className={`chart-line ${FACTOR_SERIES[i].className}`}
          />
        ))}
        <text x={PAD.l} y={h - 10} className="chart-label">
          {x0}
        </text>
        <text x={w - PAD.r} y={h - 10} className="chart-label" textAnchor="end">
          {x1}
        </text>
      </svg>
      <ul className="chart-legend">
        {FACTOR_SERIES.map((f) => (
          <li key={f.key}>
            <span className={`swatch ${f.className}`} />
            {f.label}
          </li>
        ))}
      </ul>
      <ChartCaption>
        Each line starts at 100 in {x0}, then tracks relative change through {x1}. A line above 100
        means that part of the identity is larger than at the start; below 100 means it is smaller.
        Rising population and income tend to push emissions up. Falling energy intensity (less energy
        per dollar of GDP) and falling carbon intensity (less CO₂ per unit of energy) tend to pull
        emissions down. Total CO₂ is the product of these four terms in the Kaya identity; other
        forces (for example land use) are outside this frame, so the lines need not move together.
        {reading ? ` ${reading}` : ''} This chart explains the accounting story. It is not the Kaya
        Champion score, which uses rates of change from 2000 to the latest year under fixed weights.
      </ChartCaption>
    </figure>
  )
}
