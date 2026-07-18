import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { CountryOption, KayaRow } from '../types'
import {
  ACTIONS,
  MAX_ACTION_USES,
  MAX_TURNS,
  MIN_AFFLUENCE,
  WIN_CO2,
} from '../game/actions'
import {
  actionUsesRemaining,
  applyAction,
  emissionsPressure,
  estimatedCo2Mt,
  FACTOR_LABELS,
  medianOf,
  previewAction,
  prosperityIndex,
  seedFromContext,
  type ActionPreview,
  type GameState,
} from '../game/engine'
import { buildHistoryCompare } from '../game/historyCompare'
import { buildRunReport } from '../game/reportCard'
import { COMBAT_SCENARIOS } from '../game/scenarios'
import { seriesForCountry } from '../lib/loadData'
import { usePageTitle } from '../lib/usePageTitle'
import { BrandHeader } from './BrandHeader'
import { HistoryComparePanel } from './HistoryComparePanel'
import { RunReportPanel } from './RunReportPanel'
import { SiteFooter } from './SiteFooter'

type Props = {
  countries: CountryOption[]
  rows: KayaRow[]
  iso: string
}

function barWidth(value: number, scaleMax = 100): string {
  return `${Math.min(100, Math.max(0, (value / scaleMax) * 100))}%`
}

export function Battle({ countries, rows, iso }: Props) {
  const navigate = useNavigate()
  const series = useMemo(() => seriesForCountry(rows, iso, 1965), [rows, iso])
  const seedRow = series.length ? series[series.length - 1] : null

  const peerMedians = useMemo(() => {
    const byIso = new Map<string, KayaRow>()
    for (const row of rows) {
      const prev = byIso.get(row.iso_code)
      if (!prev || row.year > prev.year) byIso.set(row.iso_code, row)
    }
    const latest = [...byIso.values()]
    const gridValues = latest
      .map((r) => r.electricity_carbon_intensity)
      .filter((v): v is number => v != null && Number.isFinite(v))
    return {
      medianEnergyIntensity: medianOf(latest.map((r) => r.energy_intensity)),
      medianCarbonIntensity: medianOf(latest.map((r) => r.carbon_intensity)),
      medianElectricityCarbonIntensity: gridValues.length
        ? medianOf(gridValues)
        : undefined,
    }
  }, [rows])

  const historyStart = useMemo(
    () => series.find((r) => r.year === 2000) ?? series[0],
    [series],
  )

  const [state, setState] = useState<GameState | null>(null)
  const [hoverPreview, setHoverPreview] = useState<{
    id: string
    name: string
    preview: ActionPreview
  } | null>(null)

  useEffect(() => {
    if (!seedRow) {
      setState(null)
      return
    }
    setState(
      seedFromContext({
        row: seedRow,
        ...peerMedians,
        historyStart,
        historyEnd: seedRow,
      }),
    )
  }, [iso, seedRow, historyStart, peerMedians])

  usePageTitle(seedRow ? `Combat — ${seedRow.country}` : 'Combat — Kaya Climate')

  const compare = useMemo(() => {
    if (!state || state.status === 'playing') return null
    return buildHistoryCompare(state, series)
  }, [state, series])

  const report = useMemo(() => {
    if (!state || state.status === 'playing') return null
    return buildRunReport(state)
  }, [state])

  const availableScenarios = useMemo(() => {
    const isos = new Set(countries.map((c) => c.iso_code))
    return COMBAT_SCENARIOS.filter((s) => isos.has(s.iso))
  }, [countries])

  function resetFight() {
    if (!seedRow) return
    setState(
      seedFromContext({
        row: seedRow,
        ...peerMedians,
        historyStart,
        historyEnd: seedRow,
      }),
    )
  }

  if (!seedRow || !state) {
    return (
      <div className="app-shell">
        <BrandHeader subtitle="Kaya Combat — satirical policy arena." />
        <p className="error">No Kaya data for this country.</p>
      </div>
    )
  }

  const pressure = emissionsPressure(state)
  const prosperity = prosperityIndex(state)
  const playing = state.status === 'playing'

  return (
    <div className="app-shell page-enter">
      <BrandHeader subtitle="Kaya Combat: country-seeded monster, diminishing returns, then compare to history." />

      <section className="panel">
        <div className="controls">
          <div className="field">
            <label htmlFor="battle-country">Arena country</label>
            <select
              id="battle-country"
              value={iso}
              onChange={(e) => navigate(`/battle/${e.target.value}`)}
            >
              {countries.map((c) => (
                <option key={c.iso_code} value={c.iso_code}>
                  {c.country}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Mission</label>
            <div className="muted" style={{ padding: '0.65rem 0' }}>
              Cut pressure to ≤{WIN_CO2} in {MAX_TURNS} turns · keep prosperity ≥{MIN_AFFLUENCE} ·
              each action max {MAX_ACTION_USES}×
            </div>
          </div>
        </div>

        <div className="scenario-row" style={{ marginTop: '1rem' }}>
          <p className="muted" style={{ margin: '0 0 0.5rem' }}>
            Scenario presets
          </p>
          <div className="filter-row">
            {availableScenarios.map((s) => (
              <button
                key={s.id}
                type="button"
                className={iso === s.iso ? 'filter-chip active' : 'filter-chip'}
                title={s.blurb}
                onClick={() => navigate(`/battle/${s.iso}`)}
              >
                {s.label}
              </button>
            ))}
          </div>
          {availableScenarios.find((s) => s.iso === iso) && (
            <p className="muted" style={{ marginTop: '0.55rem' }}>
              {availableScenarios.find((s) => s.iso === iso)?.blurb}
            </p>
          )}
        </div>
      </section>

      <div className="layout-split" style={{ marginTop: '1rem' }}>
        <section className="panel monster-panel">
          <div className="monster-face" aria-hidden>
            <div className="monster-eye" />
            <div className="monster-eye" />
            <div className="monster-mouth" />
          </div>
          <h1 className="panel-title">CO₂ Monster — {state.country}</h1>
          <p className="panel-note">
            Seeded from {state.year} ({state.baselineCo2Mt.toFixed(0)} Mt). Energy & carbon bars
            start relative to peer medians; population & prosperity start at 100. Each turn also
            applies this country’s historical BAU drift.
          </p>

          <div className="monster-meter">
            <div className="monster-meter-label">
              <span>Emissions pressure</span>
              <strong>{pressure.toFixed(0)}</strong>
            </div>
            <div className="score-track monster-co2-track">
              <div className="score-fill monster-co2-fill" style={{ width: barWidth(pressure) }} />
            </div>
            <p className="muted">
              ~{estimatedCo2Mt(state).toFixed(0)} Mt implied · Prosperity {prosperity.toFixed(0)} ·
              Turn {state.turn}/{MAX_TURNS}
            </p>
          </div>

          <div className="health-bars">
            {(Object.keys(FACTOR_LABELS) as (keyof typeof FACTOR_LABELS)[]).map((key) => (
              <div className="health-row" key={key}>
                <span>{FACTOR_LABELS[key]}</span>
                <div className="score-track">
                  <div
                    className={`score-fill health-${key}`}
                    style={{ width: barWidth(state.factors[key], 150) }}
                  />
                </div>
                <output>{state.factors[key].toFixed(0)}</output>
              </div>
            ))}
          </div>

          {state.status === 'won' && (
            <p className="battle-banner win">You weakened the monster without torching prosperity.</p>
          )}
          {state.status === 'lost_turns' && (
            <p className="battle-banner lose">Out of turns. BAU growth outran your cuts.</p>
          )}
          {state.status === 'lost_economy' && (
            <p className="battle-banner lose">Prosperity cratered. That’s not the win.</p>
          )}

          <div className="battle-actions-row">
            <button type="button" className="filter-chip" onClick={resetFight}>
              Reset fight
            </button>
            <Link className="country-link" to={`/country/${iso}`}>
              Open explorer
            </Link>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Policy moves</h2>
          <p className="panel-note">
            Hover a move to preview Δ pressure / prosperity (includes BAU). Repeats weaken;{' '}
            {MAX_ACTION_USES} uses max.
          </p>
          {hoverPreview && playing && (
            <p className="action-preview" aria-live="polite">
              <strong>{hoverPreview.name}</strong>
              {' → pressure '}
              <span className={hoverPreview.preview.pressureDelta <= 0 ? 'delta-neg' : 'delta-pos'}>
                {hoverPreview.preview.pressureDelta >= 0 ? '+' : ''}
                {hoverPreview.preview.pressureDelta.toFixed(1)}
              </span>
              {' · prosperity '}
              <span
                className={hoverPreview.preview.prosperityDelta >= 0 ? 'delta-pos' : 'delta-neg'}
              >
                {hoverPreview.preview.prosperityDelta >= 0 ? '+' : ''}
                {hoverPreview.preview.prosperityDelta.toFixed(1)}
              </span>
              <span className="muted">
                {' '}
                ({hoverPreview.preview.usesLeft} use
                {hoverPreview.preview.usesLeft === 1 ? '' : 's'} left)
              </span>
            </p>
          )}
          <div className="action-grid">
            {ACTIONS.map((action) => {
              const left = actionUsesRemaining(state, action.id)
              const exhausted = left <= 0
              return (
                <button
                  key={action.id}
                  type="button"
                  className={`action-card${action.spicy ? ' spicy' : ''}${exhausted ? ' exhausted' : ''}`}
                  disabled={!playing || exhausted}
                  onMouseEnter={() => {
                    if (!playing || exhausted) return
                    const preview = previewAction(state, action.id)
                    if (preview) setHoverPreview({ id: action.id, name: action.name, preview })
                  }}
                  onMouseLeave={() =>
                    setHoverPreview((prev) => (prev?.id === action.id ? null : prev))
                  }
                  onFocus={() => {
                    if (!playing || exhausted) return
                    const preview = previewAction(state, action.id)
                    if (preview) setHoverPreview({ id: action.id, name: action.name, preview })
                  }}
                  onBlur={() =>
                    setHoverPreview((prev) => (prev?.id === action.id ? null : prev))
                  }
                  onClick={() => {
                    setHoverPreview(null)
                    setState((prev) => (prev ? applyAction(prev, action.id) : prev))
                  }}
                >
                  <strong>{action.name}</strong>
                  <span className="action-target">
                    {action.kayaTarget}
                    {' · '}
                    {exhausted ? 'exhausted' : `${left} left`}
                  </span>
                  <span className="action-blurb">{action.blurb}</span>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      {report && (
        <div style={{ marginTop: '1rem' }}>
          <RunReportPanel report={report} />
        </div>
      )}

      {compare && (
        <div style={{ marginTop: '1rem' }}>
          <HistoryComparePanel compare={compare} />
        </div>
      )}

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2 className="panel-title">Battle log</h2>
        <ul className="battle-log">
          {[...state.log].reverse().map((line, i) => (
            <li key={`${i}-${line.slice(0, 24)}`}>{line}</li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </div>
  )
}
