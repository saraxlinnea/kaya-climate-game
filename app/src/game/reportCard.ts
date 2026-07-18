import { ACTIONS } from './actions'
import type { GameState } from './engine'
import { emissionsPressure, prosperityIndex } from './engine'

export type Badge = {
  id: string
  label: string
  detail: string
}

export type RunReport = {
  outcome: string
  pressure: number
  prosperity: number
  turns: number
  strategyLine: string
  badges: Badge[]
  shareText: string
}

function usedNames(state: GameState): string[] {
  return ACTIONS.filter((a) => (state.actionUses[a.id] ?? 0) > 0).map((a) => {
    const n = state.actionUses[a.id] ?? 0
    return n > 1 ? `${a.name}×${n}` : a.name
  })
}

export function buildRunReport(state: GameState): RunReport {
  const pressure = emissionsPressure(state)
  const prosperity = prosperityIndex(state)
  const names = usedNames(state)

  const outcome =
    state.status === 'won'
      ? 'Victory — decoupling under a turn limit'
      : state.status === 'lost_economy'
        ? 'Defeat — prosperity collapsed'
        : state.status === 'lost_turns'
          ? 'Defeat — out of turns'
          : 'In progress'

  const strategyLine =
    names.length > 0 ? `Strategy: ${names.join(' · ')}` : 'Strategy: no moves logged'

  const badges: Badge[] = []
  if (state.status === 'won') {
    badges.push({
      id: 'decoupler',
      label: 'Decoupler',
      detail: 'Cut emissions pressure while holding prosperity.',
    })
  }
  if (state.status === 'lost_economy') {
    badges.push({
      id: 'austerity',
      label: 'Austerity trap',
      detail: 'You smashed the meter by making people poorer. Not the win condition.',
    })
  }
  const intensityUses =
    (state.actionUses.solar ?? 0) +
    (state.actionUses.nuclear ?? 0) +
    (state.actionUses.buildings ?? 0) +
    (state.actionUses.efficiency_industry ?? 0)
  const popUses = state.actionUses.one_child ?? 0
  if (intensityUses >= 3 && popUses === 0) {
    badges.push({
      id: 'intensity',
      label: 'Intensity specialist',
      detail: 'Leaned on energy/carbon intensity — not population policy.',
    })
  }
  if (popUses >= 2) {
    badges.push({
      id: 'pop_fetish',
      label: 'Population fetish',
      detail: 'Leaned hard on fertility policy. Satire with sharp tradeoffs — not a silver bullet.',
    })
  }
  if ((state.actionUses.grow ?? 0) >= 2) {
    badges.push({
      id: 'growth',
      label: 'Growth junkie',
      detail: 'Kept stoking affluence. Decoupling only works if intensity outruns scale.',
    })
  }
  if ((state.actionUses.evs ?? 0) >= 1 && state.gridIntensity != null) {
    const clean =
      state.medianGridIntensity != null &&
      state.gridIntensity / state.medianGridIntensity <= 0.85
    badges.push({
      id: clean ? 'grid_ally' : 'grid_realist',
      label: clean ? 'Clean-grid ally' : 'Grid realist',
      detail: clean
        ? 'Electrified on a relatively clean grid — where EVs actually help.'
        : 'Tried EVs; dirty grids move smog upstream. Ember intensity mattered.',
    })
  }
  if (state.status === 'lost_turns' && pressure > 85) {
    badges.push({
      id: 'bau',
      label: 'BAU got you',
      detail: 'Historical population/prosperity drift ate your gains.',
    })
  }

  const shareText = [
    `Kaya Combat — ${state.country}`,
    outcome,
    `Pressure ${pressure.toFixed(0)} · Prosperity ${prosperity.toFixed(0)} · ${state.turn} turns`,
    strategyLine,
    badges.length ? `Badges: ${badges.map((b) => b.label).join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return {
    outcome,
    pressure,
    prosperity,
    turns: state.turn,
    strategyLine,
    badges,
    shareText,
  }
}
