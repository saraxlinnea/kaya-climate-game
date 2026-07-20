import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { CountryOption, KayaRow, ScoreRow } from '../types'
import { seriesForCountry } from '../lib/loadData'
import { formatPct, pctChange } from '../lib/narrative'
import { usePageTitle } from '../lib/usePageTitle'
import { BrandHeader } from './BrandHeader'
import { SiteFooter } from './SiteFooter'

type Props = {
  countries: CountryOption[]
  rows: KayaRow[]
  scores: ScoreRow[]
}

function latestComplete(series: KayaRow[]): { start: KayaRow; end: KayaRow } | null {
  if (series.length < 2) return null
  return { start: series[0], end: series[series.length - 1] }
}

type Snapshot = {
  iso: string
  name: string
  window: string
  co2Pct: number | null
  gdpPcPct: number | null
  eiPct: number | null
  ciPct: number | null
  gridEnd: number | null
  gridPct: number | null
  co2PerCapita: number
  co2PerGdp: number
  consGapPct: number | null
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
    (r) =>
      r.electricity_carbon_intensity != null &&
      Number.isFinite(r.electricity_carbon_intensity) &&
      (r.electricity_carbon_intensity as number) > 0,
  )
  let gridEnd: number | null = null
  let gridPct: number | null = null
  if (withGrid.length >= 2) {
    const g0 = Number(withGrid[0].electricity_carbon_intensity)
    const g1 = Number(withGrid[withGrid.length - 1].electricity_carbon_intensity)
    gridEnd = g1
    gridPct = pctChange(g0, g1)
  } else if (withGrid.length === 1) {
    gridEnd = Number(withGrid[0].electricity_carbon_intensity)
  }

  let consGapPct: number | null = null
  if (
    end.consumption_co2 != null &&
    Number.isFinite(end.consumption_co2) &&
    end.co2 !== 0
  ) {
    consGapPct = ((Number(end.consumption_co2) - end.co2) / end.co2) * 100
  }

  return {
    iso,
    name: end.country,
    window: `${start.year} to ${end.year}`,
    co2Pct: pctChange(start.co2, end.co2),
    gdpPcPct: pctChange(start.gdp_per_capita, end.gdp_per_capita),
    eiPct: pctChange(start.energy_intensity, end.energy_intensity),
    ciPct: pctChange(start.carbon_intensity, end.carbon_intensity),
    gridEnd,
    gridPct,
    co2PerCapita: end.co2 / (end.population / 1e6),
    co2PerGdp: end.co2 / (end.gdp / 1e9),
    consGapPct,
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

  usePageTitle('Compare: Kaya Climate')

  const a = useMemo(() => snapshot(isoA, rows, scores), [isoA, rows, scores])
  const b = useMemo(() => snapshot(isoB, rows, scores), [isoB, rows, scores])

  function syncUrl(nextA: string, nextB: string) {
    navigate(`/compare?a=${nextA}&b=${nextB}`, { replace: true })
  }

  function betterLower(
    left: number | null,
    right: number | null,
  ): 'left' | 'right' | 'tie' | null {
    if (left == null || right == null) return null
    if (Math.abs(left - right) < 0.5) return 'tie'
    return left < right ? 'left' : 'right'
  }

  function betterHigher(
    left: number | null,
    right: number | null,
  ): 'left' | 'right' | 'tie' | null {
    if (left == null || right == null) return null
    if (Math.abs(left - right) < 0.5) return 'tie'
    return left > right ? 'left' : 'right'
  }

  return (
    <div className="app-shell page-enter">
      <BrandHeader subtitle="Compare two countries on the same years. Look at how things changed, not only how they look today." />

      <section className="panel">
        <h1 className="panel-title">Country compare</h1>
        <p className="panel-note">
          Percent changes since about 1990 (or the first complete year), plus latest levels.
          Highlight means “better” for that row: lower emissions or intensity, higher income or
          Champion score. The Champion score rewards change since 2000. Emissions per person and
          carbon per dollar of GDP are levels today.
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
                label="CO₂ Δ (trajectory)"
                left={formatPct(a.co2Pct, 0)}
                right={formatPct(b.co2Pct, 0)}
                better={betterLower(a.co2Pct, b.co2Pct)}
              />
              <Cell
                label="GDP/capita Δ"
                left={formatPct(a.gdpPcPct, 0)}
                right={formatPct(b.gdpPcPct, 0)}
                better={betterHigher(a.gdpPcPct, b.gdpPcPct)}
              />
              <Cell
                label="Energy intensity Δ"
                left={formatPct(a.eiPct, 0)}
                right={formatPct(b.eiPct, 0)}
                better={betterLower(a.eiPct, b.eiPct)}
              />
              <Cell
                label="Carbon intensity Δ"
                left={formatPct(a.ciPct, 0)}
                right={formatPct(b.ciPct, 0)}
                better={betterLower(a.ciPct, b.ciPct)}
              />
              <Cell
                label="Grid intensity (latest)"
                left={a.gridEnd != null ? `${a.gridEnd.toFixed(0)} g/kWh` : '—'}
                right={b.gridEnd != null ? `${b.gridEnd.toFixed(0)} g/kWh` : '—'}
                better={betterLower(a.gridEnd, b.gridEnd)}
              />
              <Cell
                label="Grid intensity Δ"
                left={formatPct(a.gridPct, 0)}
                right={formatPct(b.gridPct, 0)}
                better={betterLower(a.gridPct, b.gridPct)}
              />
              <Cell
                label="CO₂ per capita (level)"
                left={`${a.co2PerCapita.toFixed(1)} t`}
                right={`${b.co2PerCapita.toFixed(1)} t`}
                better={betterLower(a.co2PerCapita, b.co2PerCapita)}
              />
              <Cell
                label="CO₂ / GDP (level)"
                left={`${a.co2PerGdp.toFixed(2)} Mt/$B`}
                right={`${b.co2PerGdp.toFixed(2)} Mt/$B`}
                better={betterLower(a.co2PerGdp, b.co2PerGdp)}
              />
              <Cell
                label="Consumption − territorial"
                left={a.consGapPct != null ? formatPct(a.consGapPct, 0) : '—'}
                right={b.consGapPct != null ? formatPct(b.consGapPct, 0) : '—'}
                better={null}
              />
              <Cell
                label="Kaya Champion score"
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
            Under our trajectory score, the United States can outrank Canada because it cut total
            emissions more after 2000. Canada can still look higher on emissions per person. Those
            are different questions.
            {' · '}
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
