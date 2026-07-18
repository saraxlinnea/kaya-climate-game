import { lazy, Suspense, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CountryOption, KayaRow, ScoreRow } from '../types'
import { seriesForCountry } from '../lib/loadData'
import { MetricCards, NarrativePanel } from './MetricCards'
import { ScorePanel } from './ScorePanel'

const EmissionsChart = lazy(() =>
  import('./Charts').then((m) => ({ default: m.EmissionsChart })),
)
const FactorsChart = lazy(() =>
  import('./Charts').then((m) => ({ default: m.FactorsChart })),
)

type Props = {
  countries: CountryOption[]
  rows: KayaRow[]
  scores: ScoreRow[]
  iso: string
}

export function CountryExplorer({ countries, rows, scores, iso }: Props) {
  const navigate = useNavigate()
  const series = useMemo(() => seriesForCountry(rows, iso, 1990), [rows, iso])
  const score = scores.find((s) => s.iso_code === iso)
  const countryName =
    series[0]?.country ?? countries.find((c) => c.iso_code === iso)?.country ?? iso
  const startYear = series[0]?.year
  const endYear = series[series.length - 1]?.year

  return (
    <div className="app-shell">
      <header className="brand-bar">
        <div>
          <p className="brand-mark">
            KAYA <span>Climate</span>
          </p>
        </div>
        <p className="brand-sub">
          Country explorer: see how population, prosperity, energy intensity, and carbon intensity
          reshape CO₂ over time.
        </p>
      </header>

      <section className="panel">
        <div className="controls">
          <div className="field">
            <label htmlFor="country">Country</label>
            <select
              id="country"
              value={iso}
              onChange={(e) => navigate(`/country/${e.target.value}`)}
            >
              {countries.map((c) => (
                <option key={c.iso_code} value={c.iso_code}>
                  {c.country}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Window</label>
            <div className="muted" style={{ padding: '0.65rem 0' }}>
              {startYear && endYear ? `${startYear} → ${endYear} (latest available)` : '—'}
            </div>
          </div>
        </div>

        {series.length < 2 ? (
          <p className="error">Not enough years of complete Kaya data for this country.</p>
        ) : (
          <>
            <h1 className="panel-title" style={{ marginTop: '1.25rem' }}>
              {countryName}
            </h1>
            <MetricCards series={series} />
          </>
        )}
      </section>

      {series.length >= 2 && (
        <>
          <div className="layout-split" style={{ marginTop: '1rem' }}>
            <section className="panel">
              <Suspense fallback={<p className="status">Loading chart…</p>}>
                <EmissionsChart series={series} country={countryName} />
              </Suspense>
            </section>
            <ScorePanel score={score} />
          </div>

          <section className="panel">
            <Suspense fallback={<p className="status">Loading chart…</p>}>
              <FactorsChart series={series} country={countryName} />
            </Suspense>
          </section>

          <NarrativePanel series={series} />
        </>
      )}
    </div>
  )
}
