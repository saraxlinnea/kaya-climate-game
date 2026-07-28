/**
 * Light combat UI helpers: synergy copy and factor spotlight.
 * Electrify strength still comes from engine previewEffects (Ember grid ratio).
 * In-fight clean-power moves do NOT retune EV/heat-pump multipliers.
 */

import {
  ACTIONS,
  type ActionCategory,
  type ClimateAction,
  type FactorKey,
} from './actions'
import type { GameState } from './engine'

const CLEAN_POWER_IDS = new Set(
  ACTIONS.filter((a) => a.category === 'clean_power').map((a) => a.id),
)

/** Highest current factor bar (the loudest pressure contributor). */
export function worstFactorKey(state: GameState): FactorKey {
  const keys: FactorKey[] = [
    'population',
    'affluence',
    'energyIntensity',
    'carbonIntensity',
  ]
  return keys.reduce((best, key) =>
    state.factors[key] > state.factors[best] ? key : best,
  )
}

/** True if this move’s base effects lower the given factor. */
export function actionLowersFactor(action: ClimateAction, key: FactorKey): boolean {
  const mult = action.effects[key]
  return mult != null && mult < 1
}

export function usedCleanPowerThisFight(state: GameState): boolean {
  return [...CLEAN_POWER_IDS].some((id) => (state.actionUses[id] ?? 0) > 0)
}

/**
 * Messaging only. Reflects existing Ember grid logic in previewEffects.
 * No new multipliers.
 */
export function electrifyGridSynergyNote(
  state: GameState,
  actionId: string,
): string | null {
  if (actionId !== 'evs' && actionId !== 'heat_pumps') return null

  if (
    state.gridIntensity != null &&
    state.medianGridIntensity != null &&
    state.medianGridIntensity > 0
  ) {
    const ratio = state.gridIntensity / state.medianGridIntensity
    if (ratio <= 0.9) {
      return 'Grid payoff: this country’s electricity is relatively clean (Ember vs peers), so electrify cuts more carbon intensity in the model.'
    }
    if (ratio >= 1.3) {
      return 'Grid payoff: this country’s electricity is relatively dirty (Ember vs peers), so electrify helps less. Pollution partly moves to power plants.'
    }
    return 'Grid payoff: EV and heat-pump strength follow this country’s Ember grid intensity versus peers, not your in-fight moves.'
  }

  if (
    state.factors.carbonIntensity > 110 ||
    state.factors.carbonIntensity / state.startFactors.carbonIntensity > 1.05
  ) {
    return 'Grid payoff: without Ember data, a dirtier carbon-intensity bar weakens the EV cut in the model.'
  }

  return 'Grid payoff: Ember grid data missing; electrify uses the default toy multipliers.'
}

/** Honest note when clean power was played but EV payoff still uses Ember seed. */
export function cleanPowerElectrifyHint(state: GameState): string | null {
  if (!usedCleanPowerThisFight(state)) return null
  return 'You already played clean-power moves. In life that helps EVs and heat pumps. In this game their strength still follows Ember grid data for the country, not those fight moves.'
}

export function actionsInCategory(category: ActionCategory): ClimateAction[] {
  return ACTIONS.filter((a) => a.category === category)
}
