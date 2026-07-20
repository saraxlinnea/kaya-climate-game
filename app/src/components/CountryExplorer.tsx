import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { CountryOption, KayaRow, ScoreRow } from '../types'
import { seriesForCountry } from '../lib/loadData'
import { usePageTitle } from '../lib/usePageTitle'
import { BrandHeader } from './BrandHeader'
import { EmissionsChart, FactorsChart } from './Charts'
import { DecompositionChart } from './DecompositionChart'
import {
  MetricCards,
  NarrativePanel,
  ConsumptionNarrativePanel,
  KayaMathPanel,
  ExternalContextPanel,
} from './MetricCards'
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

  usePageTitle(`${countryName}: Kaya Climate`)

  return (
    <div className="app-shell page-enter">
      <BrandHeader subtitle="Follow one country through four parts of emissions: people, income, energy use, and how dirty the energy is." />

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
            <label>Years shown</label>
            <div className="muted" style={{ padding: '0.65rem 0' }}>
              {startYear && endYear ? `${startYear} to ${endYear} (latest complete year)` : '—'}
            </div>
          </div>
        </div>

        {series.length < 2 ? (
          <p className="error">Not enough years of complete data for this country.</p>
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
            </section>
            <ScorePanel score={score} />
          </div>

          <section className="panel" style={{ marginTop: '1rem' }}>
            <h2 className="panel-title">How this relates to the Champion score</h2>
            <p className="panel-note">
              The charts on this page show what happened to population, income, energy intensity,
              carbon intensity, and total CO₂ over the years available for {countryName}. The Kaya
              Champion score answers a narrower question: from 2000 to the latest year, did the
              country cut total emissions, raise income per person, and improve those intensities?
              A country can look cleaner on parts of this page and still score poorly if total CO₂
              kept rising after 2000. The score is our own ranking for this site. It is not an
              official IPCC measure.{' '}
              <Link className="country-link" to="/methods">
                Methods
              </Link>
              {' · '}
              <Link className="country-link" to={`/battle/${iso}`}>
                Combat as {countryName}
              </Link>
              {' · '}
              <Link className="country-link" to={`/compare?a=${iso}&b=CAN`}>
                Compare
              </Link>
            </p>
          </section>

          <section className="panel" style={{ marginTop: '1rem' }}>
            <FactorsChart series={series} country={countryName} />
          </section>

          <div style={{ marginTop: '1rem' }}>
            <KayaMathPanel series={series} />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <DecompositionChart series={series} country={countryName} />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <NarrativePanel series={series} />
          </div>

          {hasConsumption && (
            <div style={{ marginTop: '1rem' }}>
              <ConsumptionNarrativePanel series={series} />
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            <ExternalContextPanel iso={iso} countryName={countryName} />
          </div>
        </>
      )}

      <SiteFooter />
    </div>
  )
}
