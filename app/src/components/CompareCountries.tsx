import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { CountryOption, KayaRow, ScoreRow } from '../types'
import { seriesForCountry } from '../lib/loadData'
import { usePageTitle } from '../lib/usePageTitle'
import { BrandHeader } from './BrandHeader'
import { SiteFooter } from './SiteFooter'

type Props = {
  countries: CountryOption[]
  rows: KayaRow[]
  scores: ScoreRow[]
}

function formatPct(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(0)}%`
}

function pct(a: number, b: number): number {
  return ((b - a) / a) * 100
}

function latestComplete(series: KayaRow[]): { start: KayaRow; end: KayaRow } | null {
  if (series.length < 2) return null
  return { start: series[0], end: series[series.length - 1] }
}

type Snapshot = {
  iso: string
  name: string
  window: string
  co2Pct: number
  gdpPcPct: number
  eiPct: number
  ciPct: number
  gridEnd: number | null
  gridPct: number | null
  score: ScoreRow | undefined
}

function snapshot(
  iso: string,
  rows: KayaRow[],
  scores: ScoreRow[],
): Snapshot | null {
  const series = seriesForCountry(rows, iso, 1990)
  const ends = latestComplete(series)
  if (!ends) return null
  const { start, end } = ends
  const withGrid = series.filter(
    (r) => r.electricity_carbon_intensity != null && Number.isFinite(r.electricity_carbon_intensity),
  )
  let gridEnd: number | null = null
  let gridPct: number | null = null
  if (withGrid.length >= 2) {
    const g0 = Number(withGrid[0].electricity_carbon_intensity)
    const g1 = Number(withGrid[withGrid.length - 1].electricity_carbon_intensity)
    gridEnd = g1
    gridPct = pct(g0, g1)
  } else if (withGrid.length === 1) {
    gridEnd = Number(withGrid[0].electricity_carbon_intensity)
  }

  return {
    iso,
    name: end.country,
    window: `${start.year}–${end.year}`,
    co2Pct: pct(start.co2, end.co2),
    gdpPcPct: pct(start.gdp_per_capita, end.gdp_per_capita),
    eiPct: pct(start.energy_intensity, end.energy_intensity),
    ciPct: pct(start.carbon_intensity, end.carbon_intensity),
    gridEnd,
    gridPct,
    score: scores.find((s) => s.iso_code === iso),
  }
}

function Cell({
  label,
  left,
  right,
  better,
}: {
  label: string
  left: string
  right: string
  better?: 'left' | 'right' | 'tie' | null
}) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td className={better === 'left' ? 'col-active' : undefined}>{left}</td>
      <td className={better === 'right' ? 'col-active' : undefined}>{right}</td>
    </tr>
  )
}

export function CompareCountries({ countries, rows, scores }: Props) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const defaultA = params.get('a')?.toUpperCase() || 'USA'
  const defaultB = params.get('b')?.toUpperCase() || 'CHN'
  const [isoA, setIsoA] = useState(defaultA)
  const [isoB, setIsoB] = useState(defaultB)

  usePageTitle('Compare — Kaya Climate')

  const a = useMemo(() => snapshot(isoA, rows, scores), [isoA, rows, scores])
  const b = useMemo(() => snapshot(isoB, rows, scores), [isoB, rows, scores])

  function syncUrl(nextA: string, nextB: string) {
    navigate(`/compare?a=${nextA}&b=${nextB}`, { replace: true })
  }

  function betterLower(left: number, right: number): 'left' | 'right' | 'tie' {
    if (Math.abs(left - right) < 0.5) return 'tie'
    return left < right ? 'left' : 'right'
  }

  function betterHigher(left: number, right: number): 'left' | 'right' | 'tie' {
    if (Math.abs(left - right) < 0.5) return 'tie'
    return left > right ? 'left' : 'right'
  }

  return (
    <div className="app-shell page-enter">
      <BrandHeader subtitle="Compare two countries on the same window — trajectories, not vibes." />

      <section className="panel">
        <h1 className="panel-title">Country compare</h1>
        <p className="panel-note">
          Side-by-side % changes since ~1990 (or first complete year). Highlight = “better” for that
          metric (lower emissions/intensity growth, higher prosperity / Kaya score).
        </p>
        <div className="controls">
          <div className="field">
            <label htmlFor="cmp-a">Country A</label>
            <select
              id="cmp-a"
              value={isoA}
              onChange={(e) => {
                const v = e.target.value
                setIsoA(v)
                syncUrl(v, isoB)
              }}
            >
              {countries.map((c) => (
                <option key={c.iso_code} value={c.iso_code}>
                  {c.country}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="cmp-b">Country B</label>
            <select
              id="cmp-b"
              value={isoB}
              onChange={(e) => {
                const v = e.target.value
                setIsoB(v)
                syncUrl(isoA, v)
              }}
            >
              {countries.map((c) => (
                <option key={c.iso_code} value={c.iso_code}>
                  {c.country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {!a || !b ? (
        <p className="error">Need complete series for both countries.</p>
      ) : (
        <section className="panel" style={{ marginTop: '1rem', overflowX: 'auto' }}>
          <table className="rank-table compare-countries-table">
            <thead>
              <tr>
                <th scope="col">Metric</th>
                <th scope="col">
                  <Link className="country-link" to={`/country/${a.iso}`}>
                    {a.name}
                  </Link>
                  <div className="muted">{a.window}</div>
                </th>
                <th scope="col">
                  <Link className="country-link" to={`/country/${b.iso}`}>
                    {b.name}
                  </Link>
                  <div className="muted">{b.window}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <Cell
                label="CO₂ Δ"
                left={formatPct(a.co2Pct)}
                right={formatPct(b.co2Pct)}
                better={betterLower(a.co2Pct, b.co2Pct)}
              />
              <Cell
                label="GDP/capita Δ"
                left={formatPct(a.gdpPcPct)}
                right={formatPct(b.gdpPcPct)}
                better={betterHigher(a.gdpPcPct, b.gdpPcPct)}
              />
              <Cell
                label="Energy intensity Δ"
                left={formatPct(a.eiPct)}
                right={formatPct(b.eiPct)}
                better={betterLower(a.eiPct, b.eiPct)}
              />
              <Cell
                label="Carbon intensity Δ"
                left={formatPct(a.ciPct)}
                right={formatPct(b.ciPct)}
                better={betterLower(a.ciPct, b.ciPct)}
              />
              <Cell
                label="Grid intensity (latest)"
                left={a.gridEnd != null ? `${a.gridEnd.toFixed(0)} g/kWh` : '—'}
                right={b.gridEnd != null ? `${b.gridEnd.toFixed(0)} g/kWh` : '—'}
                better={
                  a.gridEnd != null && b.gridEnd != null
                    ? betterLower(a.gridEnd, b.gridEnd)
                    : null
                }
              />
              <Cell
                label="Grid intensity Δ"
                left={a.gridPct != null ? formatPct(a.gridPct) : '—'}
                right={b.gridPct != null ? formatPct(b.gridPct) : '—'}
                better={
                  a.gridPct != null && b.gridPct != null
                    ? betterLower(a.gridPct, b.gridPct)
                    : null
                }
              />
              <Cell
                label="Kaya score"
                left={a.score ? a.score.kaya_score.toFixed(0) : '—'}
                right={b.score ? b.score.kaya_score.toFixed(0) : '—'}
                better={
                  a.score && b.score
                    ? betterHigher(a.score.kaya_score, b.score.kaya_score)
                    : null
                }
              />
            </tbody>
          </table>
          <p className="muted" style={{ marginTop: '0.85rem' }}>
            <Link className="country-link" to={`/battle/${a.iso}`}>
              Combat {a.name}
            </Link>
            {' · '}
            <Link className="country-link" to={`/battle/${b.iso}`}>
              Combat {b.name}
            </Link>
          </p>
        </section>
      )}

      <SiteFooter />
    </div>
  )
}
