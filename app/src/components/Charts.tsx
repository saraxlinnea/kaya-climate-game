import type { KayaRow } from '../types'

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

export function EmissionsChart({
  series,
  country,
  mode = 'territorial',
}: SeriesChartProps & { mode?: 'territorial' | 'consumption' }) {
  const w = 640
  const h = 280
  const useConsumption = mode === 'consumption'
  const points = series
    .map((r) => ({
      year: r.year,
      value: useConsumption ? r.consumption_co2 : r.co2,
    }))
    .filter((p) => p.value != null && Number.isFinite(p.value)) as {
    year: number
    value: number
  }[]

  if (points.length < 2) {
    return (
      <div className="chart-wrap">
        <p className="muted">
          {useConsumption
            ? 'Consumption-based CO₂ not available for enough years in this country.'
            : 'Not enough emissions points to chart.'}
        </p>
      </div>
    )
  }

  const years = points.map((p) => p.year)
  const co2 = points.map((p) => p.value)
  const [x0, x1] = [years[0], years[years.length - 1]]
  const [y0, y1] = extent(co2)
  const path = buildPath(years, co2, x0, x1, y0, y1, w, h, PAD)
  const title = useConsumption
    ? `${country} — consumption CO₂`
    : `${country} — territorial CO₂`

  return (
    <div className="chart-wrap">
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
        <path
          d={path}
          className={`chart-line ${useConsumption ? 'chart-line-cons' : 'chart-line-co2'}`}
        />
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
    </div>
  )
}

const FACTOR_SERIES: {
  key: keyof KayaRow
  label: string
  className: string
}[] = [
  { key: 'population', label: 'Population', className: 'chart-line-pop' },
  { key: 'gdp_per_capita', label: 'GDP/capita', className: 'chart-line-gdp' },
  { key: 'energy_intensity', label: 'Energy intensity', className: 'chart-line-ei' },
  { key: 'carbon_intensity', label: 'Carbon intensity', className: 'chart-line-ci' },
]

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

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="svg-chart"
        role="img"
        aria-label={`${country} Kaya factors indexed`}
      >
        <text x={PAD.l} y={18} className="chart-title">
          {country} — Kaya factors (start = 100)
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
    </div>
  )
}
