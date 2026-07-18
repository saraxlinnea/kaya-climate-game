import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { CountryOption, KayaRow, ScoreRow } from '../types'
import { seriesForCountry } from '../lib/loadData'
import { usePageTitle } from '../lib/usePageTitle'
import { BrandHeader } from './BrandHeader'
import { EmissionsChart, FactorsChart } from './Charts'
import { DecompositionChart } from './DecompositionChart'
import { MetricCards, NarrativePanel } from './MetricCards'
import { ScorePanel } from './ScorePanel'
import { SiteFooter } from './SiteFooter'

type Props = {
  countries: CountryOption[]
  rows: KayaRow[]
  scores: ScoreRow[]
  iso: string
}

export function CountryExplorer({ countries, rows, scores, iso }: Props) {
  const navigate = useNavigate()
  const [co2Mode, setCo2Mode] = useState<'territorial' | 'consumption'>('territorial')
  const series = useMemo(() => seriesForCountry(rows, iso, 1990), [rows, iso])
  const score = scores.find((s) => s.iso_code === iso)
  const countryName =
    series[0]?.country ?? countries.find((c) => c.iso_code === iso)?.country ?? iso
  const startYear = series[0]?.year
  const endYear = series[series.length - 1]?.year
  const hasConsumption = series.some(
    (r) => r.consumption_co2 != null && Number.isFinite(r.consumption_co2),
  )

  usePageTitle(`${countryName} — Kaya Climate`)

  return (
    <div className="app-shell page-enter">
      <BrandHeader subtitle="Country explorer: see how population, prosperity, energy intensity, and carbon intensity reshape CO₂ over time." />

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
              {hasConsumption && (
                <div className="filter-row" style={{ marginBottom: '0.75rem' }}>
                  <button
                    type="button"
                    className={co2Mode === 'territorial' ? 'filter-chip active' : 'filter-chip'}
                    onClick={() => setCo2Mode('territorial')}
                  >
                    Territorial CO₂
                  </button>
                  <button
                    type="button"
                    className={co2Mode === 'consumption' ? 'filter-chip active' : 'filter-chip'}
                    onClick={() => setCo2Mode('consumption')}
                  >
                    Consumption CO₂
                  </button>
                </div>
              )}
              <EmissionsChart series={series} country={countryName} mode={co2Mode} />
              {hasConsumption && (
                <p className="muted" style={{ marginTop: '0.5rem' }}>
                  Territorial = produced inside borders. Consumption adjusts for trade — useful when
                  industry moved offshore.
                </p>
              )}
            </section>
            <ScorePanel score={score} />
          </div>

          <p className="muted" style={{ marginTop: '0.85rem' }}>
            <Link className="country-link" to={`/battle/${iso}`}>
              Fight as {countryName}
            </Link>
            {' — country-seeded combat · '}
            <Link className="country-link" to={`/compare?a=${iso}&b=CHN`}>
              Compare
            </Link>
          </p>

          <section className="panel" style={{ marginTop: '1rem' }}>
            <FactorsChart series={series} country={countryName} />
          </section>

          <div style={{ marginTop: '1rem' }}>
            <DecompositionChart series={series} country={countryName} />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <NarrativePanel series={series} />
          </div>
        </>
      )}

      <SiteFooter />
    </div>
  )
}
