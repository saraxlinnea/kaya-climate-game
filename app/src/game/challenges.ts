/** Named Kaya Combat challenges: same arenas, extra constraints. No new actions. */

import { ACTIONS, MAX_TURNS, isHailMary, type ClimateAction } from './actions'

export type FightRules = {
  maxTurns: number
  bannedActionIds: string[]
}

export type CombatChallenge = {
  id: string
  /** Arena ISO3 this challenge is built for. */
  iso: string
  label: string
  blurb: string
  /** Shorter turn clock when set; otherwise default MAX_TURNS. */
  maxTurns?: number
  /** Explicit action ids banned for this challenge. */
  banActionIds?: string[]
  /** Ban every hail_mary / spicy action. */
  banHailMary?: boolean
}

export const DEFAULT_FIGHT_RULES: FightRules = {
  maxTurns: MAX_TURNS,
  bannedActionIds: [],
}

/**
 * Curated challenges using existing arenas.
 * URL: /battle/:iso?challenge=<id>
 */
export const COMBAT_CHALLENGES: CombatChallenge[] = [
  {
    id: 'pol-no-ev',
    iso: 'POL',
    label: 'Poland: no EVs',
    blurb: 'Win on a coal-heavy grid without electrifying vehicles. Clean power and efficiency have to do the work.',
    banActionIds: ['evs'],
  },
  {
    id: 'fra-sprint',
    iso: 'FRA',
    label: 'France in 6 turns',
    blurb: 'Clean-grid sprint. Cut pressure to the win zone in six turns instead of eight.',
    maxTurns: 6,
  },
  {
    id: 'no-hail',
    iso: 'USA',
    label: 'United States: no hail mary',
    blurb: 'Win with mainstream levers only. Fusion, DAC, fertility policy, and grow-the-economy are locked.',
    banHailMary: true,
  },
]

export function challengeById(id: string | null | undefined): CombatChallenge | undefined {
  if (!id) return undefined
  return COMBAT_CHALLENGES.find((c) => c.id === id)
}

/** Challenges that match the current arena (and optional free-play “none”). */
export function challengesForIso(iso: string): CombatChallenge[] {
  return COMBAT_CHALLENGES.filter((c) => c.iso === iso)
}

export function rulesFromChallenge(challenge: CombatChallenge | undefined): FightRules {
  if (!challenge) return { ...DEFAULT_FIGHT_RULES, bannedActionIds: [] }

  const banned = new Set<string>(challenge.banActionIds ?? [])
  if (challenge.banHailMary) {
    for (const a of ACTIONS) {
      if (isHailMary(a)) banned.add(a.id)
    }
  }

  return {
    maxTurns: challenge.maxTurns ?? MAX_TURNS,
    bannedActionIds: [...banned],
  }
}

export function isActionBanned(action: ClimateAction, rules: FightRules): boolean {
  return rules.bannedActionIds.includes(action.id)
}

export function battlePath(iso: string, challengeId?: string | null): string {
  if (!challengeId) return `/battle/${iso}`
  return `/battle/${iso}?challenge=${encodeURIComponent(challengeId)}`
}
