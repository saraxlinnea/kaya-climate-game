import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { CountryOption, KayaRow } from '../types'
import {
  ACTIONS,
  MAX_ACTION_USES,
  MAX_TURNS,
  MIN_AFFLUENCE,
  WIN_CO2,
  type ClimateAction,
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
import { flagEmoji } from '../lib/flagEmoji'
import { seriesForCountry } from '../lib/loadData'
import { usePageTitle } from '../lib/usePageTitle'
import { BrandHeader } from './BrandHeader'
import { HistoryComparePanel } from './HistoryComparePanel'
import { MonsterFigure, pressureFill } from './MonsterFigure'
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

const MAIN_ACTIONS = ACTIONS.filter((a) => !a.spicy)
const HAIL_MARY_ACTIONS = ACTIONS.filter((a) => a.spicy)

type ActionMoveProps = {
  action: ClimateAction
  state: GameState
  playing: boolean
  preview: ActionPreview | null
  onPreview: (actionId: string, preview: ActionPreview | null) => void
  onPlay: (actionId: string) => void
}

function ActionMove({ action, state, playing, preview, onPreview, onPlay }: ActionMoveProps) {
  const left = actionUsesRemaining(state, action.id)
  const exhausted = left <= 0

  function showPreview() {
    if (!playing || exhausted) return
    onPreview(action.id, previewAction(state, action.id))
  }

  return (
    <button
      type="button"
      className={`action-card compact${action.spicy ? ' spicy' : ''}${exhausted ? ' exhausted' : ''}`}
      disabled={!playing || exhausted}
      onMouseEnter={showPreview}
      onMouseLeave={() => onPreview(action.id, null)}
      onFocus={showPreview}
      onBlur={() => onPreview(action.id, null)}
      onClick={() => onPlay(action.id)}
    >
      <span className="action-card-main">
        <strong>{action.name}</strong>
        <span className="action-target">
          {action.kayaTarget}
          {' · '}
          {exhausted ? 'exhausted' : `${left} left`}
        </span>
      </span>
      <span className="action-details">
        <span className="action-blurb">{action.blurb}</span>
        <span className="action-tradeoff">
          <em>Tradeoff:</em> {action.tradeoff}
        </span>
        <span className="action-realworld">
          <em>In the real world:</em> {action.realWorld}
        </span>
        {preview && (
          <span className="action-card-preview">
            This turn: pressure {preview.pressureDelta >= 0 ? '+' : ''}
            {preview.pressureDelta.toFixed(1)}
            {' · prosperity '}
            {preview.prosperityDelta >= 0 ? '+' : ''}
            {preview.prosperityDelta.toFixed(1)}
          </span>
        )}
      </span>
    </button>
  )
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

  usePageTitle(seedRow ? `Combat: ${seedRow.country}` : 'Combat: Kaya Climate')

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
        <BrandHeader subtitle="Kaya Combat is a practice game about the four parts of emissions." />
        <p className="error">No Kaya data for this country.</p>
      </div>
    )
  }

  const pressure = emissionsPressure(state)
  const prosperity = prosperityIndex(state)
  const monsterScale = Math.max(0.72, Math.min(1.12, pressure / 100))
  const playing = state.status === 'playing'
  const meterColor = pressureFill(pressure)
  const flag = flagEmoji(state.iso)

  return (
    <div className="app-shell page-enter">
      <BrandHeader subtitle="Kaya Combat is a practice game. Pick a country, try policy moves, then compare your path to real history." />

      <section className="panel">
        <div className="controls">
          <div className="field">
            <label htmlFor="battle-country">Country</label>
            <select
              id="battle-country"
              value={iso}
              onChange={(e) => navigate(`/battle/${e.target.value}`)}
            >
              {countries.map((c) => {
                const f = flagEmoji(c.iso_code)
                return (
                  <option key={c.iso_code} value={c.iso_code}>
                    {f ? `${f} ${c.country}` : c.country}
                  </option>
                )
              })}
            </select>
          </div>
          <div className="field">
            <label>Goal</label>
            <div className="muted" style={{ padding: '0.65rem 0' }}>
              Lower emissions pressure to {WIN_CO2} or less in {MAX_TURNS} turns. Keep prosperity at{' '}
              {MIN_AFFLUENCE} or higher. You can use each move up to {MAX_ACTION_USES} times.
            </div>
          </div>
        </div>

        <div className="scenario-row" style={{ marginTop: '1rem' }}>
          <p className="muted" style={{ margin: '0 0 0.5rem' }}>
            Suggested countries
          </p>
          <div className="filter-row">
            {availableScenarios.map((s) => {
              const scenarioFlag = flagEmoji(s.iso)
              return (
                <button
                  key={s.id}
                  type="button"
                  className={iso === s.iso ? 'filter-chip active' : 'filter-chip'}
                  title={s.blurb}
                  onClick={() => navigate(`/battle/${s.iso}`)}
                >
                  {scenarioFlag ? `${scenarioFlag} ${s.label}` : s.label}
                </button>
              )
            })}
          </div>
          {availableScenarios.find((s) => s.iso === iso) && (
            <p className="muted" style={{ marginTop: '0.55rem' }}>
              {availableScenarios.find((s) => s.iso === iso)?.blurb}
            </p>
          )}
        </div>
      </section>

      <section className="panel monster-panel" style={{ marginTop: '1rem' }}>
        <h1 className="panel-title">
          CO₂ Monster: {flag ? `${flag} ` : ''}
          {state.country}
        </h1>
        <p className="panel-note monster-seed-note">
          This fight starts from {state.year} data ({state.baselineCo2Mt.toFixed(0)} Mt of CO₂). Energy
          use and dirty energy start relative to other countries. Population and prosperity start at
          100. Each turn also adds the usual growth this country has seen in history. The monster’s
          color and limbs follow emissions pressure (not the Champion ranking score).
        </p>

        <div className="monster-arena">
          <MonsterFigure pressure={pressure} scale={monsterScale} />
          <div className="monster-arena-stats">
            <div className="monster-meter">
              <div className="monster-meter-label">
                <span>Emissions pressure</span>
                <strong style={{ color: meterColor }}>{pressure.toFixed(0)}</strong>
              </div>
              <div className="score-track monster-co2-track">
                <div
                  className="score-fill monster-co2-fill"
                  style={{ width: barWidth(pressure), background: meterColor }}
                />
              </div>
              <p className="muted">
                About {estimatedCo2Mt(state).toFixed(0)} Mt implied · Prosperity {prosperity.toFixed(0)} ·
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
          </div>
        </div>

        <div className="battle-actions-row">
          <button type="button" className="filter-chip" onClick={resetFight}>
            Reset fight
          </button>
          <Link className="country-link" to={`/country/${iso}`}>
            Open explorer
          </Link>
        </div>
      </section>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2 className="panel-title">Policy moves</h2>
        <p className="panel-note">
          Hover or focus a card to see what it means, what it costs, and how pressure and prosperity
          would change this turn (including usual growth). Moves get weaker if you repeat them. Max{' '}
          {MAX_ACTION_USES} uses each. This is a learning game, not advice.
        </p>
        <div className="action-grid action-grid-compact">
          {MAIN_ACTIONS.map((action) => (
            <ActionMove
              key={action.id}
              action={action}
              state={state}
              playing={playing}
              preview={hoverPreview?.id === action.id ? hoverPreview.preview : null}
              onPreview={(id, next) => {
                if (!next) {
                  setHoverPreview((prev) => (prev?.id === id ? null : prev))
                  return
                }
                setHoverPreview({ id, name: action.name, preview: next })
              }}
              onPlay={(id) => {
                setHoverPreview(null)
                setState((prev) => (prev ? applyAction(prev, id) : prev))
              }}
            />
          ))}
        </div>

        <h3 className="action-group-title">Hail mary moves</h3>
        <p className="panel-note">
          These are big, risky, or slow ideas. Hover to see why they often do not win by themselves.
        </p>
        <div className="action-grid action-grid-compact">
          {HAIL_MARY_ACTIONS.map((action) => (
            <ActionMove
              key={action.id}
              action={action}
              state={state}
              playing={playing}
              preview={hoverPreview?.id === action.id ? hoverPreview.preview : null}
              onPreview={(id, next) => {
                if (!next) {
                  setHoverPreview((prev) => (prev?.id === id ? null : prev))
                  return
                }
                setHoverPreview({ id, name: action.name, preview: next })
              }}
              onPlay={(id) => {
                setHoverPreview(null)
                setState((prev) => (prev ? applyAction(prev, id) : prev))
              }}
            />
          ))}
        </div>
      </section>

      {!playing && (
        <section className="panel" style={{ marginTop: '1rem' }}>
          <h2 className="panel-title">Resolution</h2>
          {state.status === 'won' && (
            <p className="battle-banner win">
              Victory. You cut emissions pressure to {pressure.toFixed(0)} (need {WIN_CO2} or less)
              while keeping prosperity at {prosperity.toFixed(0)} (need {MIN_AFFLUENCE} or more).
            </p>
          )}
          {state.status === 'lost_turns' && (
            <p className="battle-banner lose">
              Out of turns. Pressure finished at {pressure.toFixed(0)}; you needed {WIN_CO2} or less.
              Usual growth outran your cuts.
            </p>
          )}
          {state.status === 'lost_economy' && (
            <p className="battle-banner lose">
              Prosperity fell to {prosperity.toFixed(0)} (floor {MIN_AFFLUENCE}). Making people much
              poorer is not the win.
            </p>
          )}
        </section>
      )}

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
        <p className="panel-note">
          Each turn shows how pressure and prosperity changed, which bars moved after usual growth,
          and what the move means in the game and in real life.
        </p>
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
