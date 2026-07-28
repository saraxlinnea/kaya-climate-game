import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { CountryOption, KayaRow } from '../types'
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  MAX_ACTION_USES,
  MAX_TURNS,
  MIN_AFFLUENCE,
  WIN_CO2,
  isHailMary,
  type ActionCategory,
  type ClimateAction,
} from '../game/actions'
import {
  COMBAT_CHALLENGES,
  battlePath,
  challengeById,
  isActionBanned,
  rulesFromChallenge,
} from '../game/challenges'
import {
  actionUsesRemaining,
  applyAction,
  crossedLimbThresholds,
  emissionsPressure,
  endStateOneLiner,
  estimatedCo2Mt,
  FACTOR_LABELS,
  limbMilestoneMessage,
  medianOf,
  previewAction,
  prosperityIndex,
  seedFromContext,
  type ActionPreview,
  type GameState,
} from '../game/engine'
import {
  actionLowersFactor,
  actionsInCategory,
  cleanPowerElectrifyHint,
  electrifyGridSynergyNote,
  worstFactorKey,
} from '../game/synergy'
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

function prefersCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: none)').matches
}

const CATEGORY_BLURBS: Partial<Record<ActionCategory, string>> = {
  clean_power: 'Cleaner electricity and fuels. Hits carbon intensity.',
  efficiency: 'Use less energy per dollar of output.',
  electrify: 'Shift cars and heat to electricity. Payoff follows the country’s grid data.',
  demand: 'Use less energy-hungry stuff and activity.',
  economy: 'Prices and growth. Watch prosperity.',
  hail_mary: 'Big, risky, slow, or decoy ideas. Expand a card to see why.',
}

type ActionMoveProps = {
  action: ClimateAction
  state: GameState
  playing: boolean
  preview: ActionPreview | null
  spotlight: boolean
  highlight: boolean
  banned: boolean
  onPreview: (actionId: string, preview: ActionPreview | null) => void
  onPlay: (actionId: string) => void
}

function ActionMove({
  action,
  state,
  playing,
  preview,
  spotlight,
  highlight,
  banned,
  onPreview,
  onPlay,
}: ActionMoveProps) {
  const [expanded, setExpanded] = useState(false)
  const left = actionUsesRemaining(state, action.id)
  const exhausted = left <= 0 || banned
  const synergy = electrifyGridSynergyNote(state, action.id)

  function showPreview() {
    if (!playing || exhausted) return
    onPreview(action.id, previewAction(state, action.id))
  }

  function clearPreview() {
    onPreview(action.id, null)
  }

  function handleClick() {
    if (!playing || exhausted) return
    if (prefersCoarsePointer() && !expanded) {
      setExpanded(true)
      showPreview()
      return
    }
    setExpanded(false)
    clearPreview()
    onPlay(action.id)
  }

  const dimmed = spotlight && !highlight && !exhausted

  return (
    <button
      type="button"
      className={`action-card compact${isHailMary(action) ? ' spicy' : ''}${
        exhausted ? ' exhausted' : ''
      }${banned ? ' banned' : ''}${expanded ? ' expanded' : ''}${
        highlight && spotlight ? ' spotlight-hit' : ''
      }${dimmed ? ' spotlight-dim' : ''}`}
      disabled={!playing || exhausted}
      aria-expanded={expanded}
      onMouseEnter={showPreview}
      onMouseLeave={() => {
        if (!prefersCoarsePointer()) clearPreview()
      }}
      onFocus={showPreview}
      onBlur={() => {
        if (!prefersCoarsePointer()) {
          clearPreview()
          setExpanded(false)
        }
      }}
      onClick={handleClick}
    >
      <span className="action-card-main">
        <strong>{action.name}</strong>
        <span className="action-target">
          {action.kayaTarget}
          {' · '}
          {banned ? 'locked' : exhausted ? 'exhausted' : `${left} left`}
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
        {synergy && (
          <span className="action-synergy">
            <em>Synergy:</em> {synergy}
          </span>
        )}
        {preview && (
          <span className="action-card-preview">
            <span className="modeled-badge">Modeled estimate</span>
            {' '}
            This turn: pressure {preview.pressureDelta >= 0 ? '+' : ''}
            {preview.pressureDelta.toFixed(1)}
            {' · prosperity '}
            {preview.prosperityDelta >= 0 ? '+' : ''}
            {preview.prosperityDelta.toFixed(1)}
            {prefersCoarsePointer() && expanded ? ' · Tap again to play' : ''}
          </span>
        )}
      </span>
    </button>
  )
}

export function Battle({ countries, rows, iso }: Props) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const challengeParam = params.get('challenge')
  const challenge = useMemo(() => {
    const c = challengeById(challengeParam)
    if (!c) return undefined
    // Challenge must match arena; otherwise ignore stale query
    return c.iso === iso ? c : undefined
  }, [challengeParam, iso])
  const fightRules = useMemo(() => rulesFromChallenge(challenge), [challenge])

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
  const [hitFlash, setHitFlash] = useState(false)
  const [spotlight, setSpotlight] = useState(false)
  const [milestone, setMilestone] = useState<string | null>(null)
  const prevPressureRef = useRef<number | null>(null)

  function seedFight() {
    if (!seedRow) return null
    return seedFromContext({
      row: seedRow,
      ...peerMedians,
      historyStart,
      historyEnd: seedRow,
      rules: fightRules,
    })
  }

  useEffect(() => {
    if (!seedRow) {
      setState(null)
      return
    }
    setState(seedFight())
    setHitFlash(false)
    setMilestone(null)
    prevPressureRef.current = 100
    // If URL challenge points at another arena, jump there
    const raw = challengeById(challengeParam)
    if (raw && raw.iso !== iso) {
      navigate(battlePath(raw.iso, raw.id), { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reseed on arena/challenge change
  }, [iso, seedRow, historyStart, peerMedians, fightRules, challengeParam])

  useEffect(() => {
    if (!hitFlash) return
    const id = window.setTimeout(() => setHitFlash(false), 480)
    return () => window.clearTimeout(id)
  }, [hitFlash])

  useEffect(() => {
    if (!milestone) return
    const id = window.setTimeout(() => setMilestone(null), 3200)
    return () => window.clearTimeout(id)
  }, [milestone])

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

  const activeScenario = availableScenarios.find((s) => s.iso === iso)

  function resetFight() {
    if (!seedRow) return
    setHitFlash(false)
    setMilestone(null)
    prevPressureRef.current = 100
    setState(seedFight())
  }

  function playMove(actionId: string) {
    setHoverPreview(null)
    setState((prev) => {
      if (!prev) return prev
      const before = emissionsPressure(prev)
      const next = applyAction(prev, actionId)
      const after = emissionsPressure(next)
      const crossed = crossedLimbThresholds(before, after)
      if (crossed.length) {
        const lowest = crossed[crossed.length - 1]
        setMilestone(limbMilestoneMessage(lowest))
      }
      prevPressureRef.current = after
      return next
    })
    setHitFlash(true)
  }

  function selectChallenge(id: string | null) {
    navigate(battlePath(iso, id))
  }

  if (!seedRow || !state) {
    return (
      <div className="app-shell">
        <BrandHeader subtitle="Kaya Combat is a practice game about the four parts of emissions." />
        <p className="error">No Kaya data for this country.</p>
      </div>
    )
  }

  const fight = state
  const pressure = emissionsPressure(fight)
  const prosperity = prosperityIndex(fight)
  const monsterScale = Math.max(1.55, Math.min(2.2, 1.2 + pressure / 140))
  const playing = fight.status === 'playing'
  const meterColor = pressureFill(pressure)
  const flag = flagEmoji(fight.iso)
  const worstKey = worstFactorKey(fight)
  const electrifyHint = cleanPowerElectrifyHint(fight)
  const turnCap = fight.rules.maxTurns
  const whyLine = !playing ? endStateOneLiner(fight) : ''

  function renderAction(action: ClimateAction) {
    return (
      <ActionMove
        key={action.id}
        action={action}
        state={fight}
        playing={playing}
        preview={hoverPreview?.id === action.id ? hoverPreview.preview : null}
        spotlight={spotlight}
        highlight={actionLowersFactor(action, worstKey)}
        banned={isActionBanned(action, fight.rules)}
        onPreview={(id, next) => {
          if (!next) {
            setHoverPreview((prev) => (prev?.id === id ? null : prev))
            return
          }
          setHoverPreview({ id, name: action.name, preview: next })
        }}
        onPlay={playMove}
      />
    )
  }

  return (
    <div className="app-shell page-enter battle-page">
      <BrandHeader subtitle="Practice arena: policy moves on a CO₂ monster seeded from real country data." />

      <p className="modeled-banner" role="note">
        Modeled / satirical · Not a forecast or policy advice
      </p>

      <div className="battle-strip">
        <div className="battle-strip-main">
          <div className="field battle-strip-field">
            <label htmlFor="battle-country">Arena</label>
            <select
              id="battle-country"
              value={iso}
              onChange={(e) => navigate(battlePath(e.target.value))}
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
          <p className="battle-goal-chip">
            Pressure ≤ {WIN_CO2} · Prosperity ≥ {MIN_AFFLUENCE} · {turnCap} turns · max{' '}
            {MAX_ACTION_USES} uses each
          </p>
          <button type="button" className="filter-chip" onClick={resetFight}>
            Reset
          </button>
        </div>
        <details className="battle-country-details">
          <summary>Change country / suggested arenas</summary>
          <div className="filter-row" style={{ marginTop: '0.65rem' }}>
            {availableScenarios.map((s) => {
              const scenarioFlag = flagEmoji(s.iso)
              return (
                <button
                  key={s.id}
                  type="button"
                  className={iso === s.iso ? 'filter-chip active' : 'filter-chip'}
                  title={s.blurb}
                  onClick={() => navigate(battlePath(s.iso, challenge?.iso === s.iso ? challenge.id : null))}
                >
                  {scenarioFlag ? `${scenarioFlag} ${s.label}` : s.label}
                </button>
              )
            })}
          </div>
          {activeScenario && (
            <p className="muted" style={{ marginTop: '0.55rem' }}>
              {activeScenario.blurb}
            </p>
          )}
        </details>
        <div className="battle-challenge-row">
          <p className="battle-challenge-label">Named challenges</p>
          <div className="filter-row">
            <button
              type="button"
              className={!challenge ? 'filter-chip active' : 'filter-chip'}
              onClick={() => selectChallenge(null)}
            >
              Free play
            </button>
            {COMBAT_CHALLENGES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={challenge?.id === c.id ? 'filter-chip active' : 'filter-chip'}
                title={c.blurb}
                onClick={() => navigate(battlePath(c.iso, c.id))}
              >
                {c.label}
              </button>
            ))}
          </div>
          {challenge ? (
            <p className="panel-note" style={{ marginTop: '0.55rem', marginBottom: 0 }}>
              {challenge.blurb}
            </p>
          ) : (
            <p className="muted" style={{ marginTop: '0.55rem' }}>
              Free play uses all moves and {MAX_TURNS} turns. Challenges lock moves or shorten the
              clock.
            </p>
          )}
        </div>
      </div>

      <section className="panel monster-panel" aria-labelledby="monster-title">
        <div className="monster-panel-head">
          <h1 id="monster-title" className="panel-title">
            CO₂ Monster: {flag ? `${flag} ` : ''}
            {state.country}
          </h1>
          <p className="monster-seed-note">
            Seeded from {state.year} ({state.baselineCo2Mt.toFixed(0)} Mt). Color and limbs track
            emissions pressure, not the Champion score.{' '}
            <Link className="country-link" to={`/country/${iso}`}>
              Explorer
            </Link>
          </p>
        </div>

        <div className={`monster-arena${hitFlash ? ' hit' : ''}`}>
          <div className="monster-arena-stage">
            <MonsterFigure pressure={pressure} scale={monsterScale} />
          </div>
          <div className="monster-arena-stats">
            <div className="monster-meter">
              <div className="monster-meter-label">
                <span>
                  Emissions pressure{' '}
                  <span className="modeled-badge">Modeled index</span>
                </span>
                <strong style={{ color: meterColor }}>{pressure.toFixed(0)}</strong>
              </div>
              <div className="score-track monster-co2-track">
                <div
                  className="score-fill monster-co2-fill"
                  style={{ width: barWidth(pressure), background: meterColor }}
                />
              </div>
              <p className="muted">
                ~{estimatedCo2Mt(state).toFixed(0)} Mt implied · Prosperity {prosperity.toFixed(0)} ·
                Turn {state.turn}/{turnCap}
              </p>
            </div>

            {milestone && (
              <p className="limb-milestone" role="status" aria-live="polite">
                {milestone}
              </p>
            )}

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
      </section>

      {playing && (
        <section className="panel battle-moves" style={{ marginTop: '1rem' }}>
          <div className="battle-moves-head">
            <div>
              <h2 className="panel-title">Policy moves</h2>
              <p className="panel-note">
                Grouped by kind of lever. Tap or hover for tradeoffs and this turn’s modeled change.
                Repeats get weaker.
              </p>
            </div>
            <button
              type="button"
              className={spotlight ? 'filter-chip active' : 'filter-chip'}
              aria-pressed={spotlight}
              onClick={() => setSpotlight((v) => !v)}
              title={`Highlight moves that lower ${FACTOR_LABELS[worstKey]}`}
            >
              Spotlight: {FACTOR_LABELS[worstKey]}
            </button>
          </div>
          {spotlight && (
            <p className="panel-note spotlight-note">
              Highlighting moves that lower the highest bar right now (
              {FACTOR_LABELS[worstKey]}). Other cards are dimmed, not disabled.
            </p>
          )}
          {electrifyHint && (
            <p className="panel-note synergy-banner" role="note">
              {electrifyHint}
            </p>
          )}

          {CATEGORY_ORDER.map((category) => {
            const group = actionsInCategory(category)
            if (group.length === 0) return null
            return (
              <div className="action-category" key={category}>
                <h3 className="action-group-title">{CATEGORY_LABELS[category]}</h3>
                {CATEGORY_BLURBS[category] && (
                  <p className="panel-note action-category-blurb">{CATEGORY_BLURBS[category]}</p>
                )}
                <div className="action-grid action-grid-compact">{group.map(renderAction)}</div>
              </div>
            )
          })}
        </section>
      )}

      {!playing && (
        <section className="panel battle-result" style={{ marginTop: '1rem' }} aria-live="polite">
          <p className="battle-result-kicker">Fight over</p>
          {state.status === 'won' && (
            <>
              <h2 className="battle-result-title win">Victory</h2>
              <p className="battle-result-lede">
                You cut emissions pressure to {pressure.toFixed(0)} (need {WIN_CO2} or less) while
                keeping prosperity at {prosperity.toFixed(0)}.
              </p>
            </>
          )}
          {state.status === 'lost_turns' && (
            <>
              <h2 className="battle-result-title lose">Out of turns</h2>
              <p className="battle-result-lede">
                Pressure finished at {pressure.toFixed(0)}; you needed {WIN_CO2} or less.
              </p>
            </>
          )}
          {state.status === 'lost_economy' && (
            <>
              <h2 className="battle-result-title lose">Prosperity collapsed</h2>
              <p className="battle-result-lede">
                Prosperity fell to {prosperity.toFixed(0)} (floor {MIN_AFFLUENCE}).
              </p>
            </>
          )}
          {whyLine && <p className="battle-why">{whyLine}</p>}
          <div className="hero-ctas" style={{ marginTop: '1.1rem' }}>
            <Link className="btn-primary" to={`/country/${iso}`}>
              Open explorer for {state.country}
            </Link>
            <button type="button" className="btn-ghost" onClick={resetFight}>
              {challenge ? 'Fight again with same challenge' : 'Fight again'}
            </button>
          </div>
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
          Each turn: pressure and prosperity changes, bar moves after usual growth, and what the move
          means in the game versus real life.
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
