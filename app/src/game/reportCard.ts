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
      ? 'Victory: you cut emissions pressure while holding prosperity'
      : state.status === 'lost_economy'
        ? 'Defeat: prosperity fell too far'
        : state.status === 'lost_turns'
          ? 'Defeat: out of turns'
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
      detail: 'You lowered the meter by making people poorer. That is not the win condition.',
    })
  }
  const intensityUses =
    (state.actionUses.solar ?? 0) +
    (state.actionUses.nuclear ?? 0) +
    (state.actionUses.buildings ?? 0) +
    (state.actionUses.efficiency_industry ?? 0) +
    (state.actionUses.coal_retire ?? 0) +
    (state.actionUses.heat_pumps ?? 0) +
    (state.actionUses.carbon_price ?? 0) +
    (state.actionUses.fusion ?? 0) +
    (state.actionUses.dac ?? 0)
  const popUses = state.actionUses.one_child ?? 0
  if (intensityUses >= 3 && popUses === 0) {
    badges.push({
      id: 'intensity',
      label: 'Intensity specialist',
      detail: 'You focused on energy and carbon intensity, not population policy.',
    })
  }
  if (popUses >= 2) {
    badges.push({
      id: 'pop_focus',
      label: 'Population focus',
      detail: 'You leaned hard on fertility policy. It has sharp tradeoffs and is not a silver bullet.',
    })
  }
  if ((state.actionUses.grow ?? 0) >= 2) {
    badges.push({
      id: 'growth',
      label: 'Growth focus',
      detail: 'You kept raising income. Cleaner growth only works if intensity falls faster than scale rises.',
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
        ? 'You electrified on a relatively clean grid, where electric vehicles help more.'
        : 'You tried electric vehicles on a dirtier grid, which mostly moves pollution to the power plant.',
    })
  }
  if (state.status === 'lost_turns' && pressure > 85) {
    badges.push({
      id: 'bau',
      label: 'Usual growth won',
      detail: 'Historical population and prosperity growth ate your gains.',
    })
  }

  const shareText = [
    `Kaya Combat: ${state.country}`,
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
