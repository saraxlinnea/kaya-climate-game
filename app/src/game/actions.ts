/** Satirical Kaya Combat actions — each maps to Kaya factors + tradeoffs. */

export type FactorKey = 'population' | 'affluence' | 'energyIntensity' | 'carbonIntensity'

export type GameFactors = Record<FactorKey, number>

export type ClimateAction = {
  id: string
  name: string
  blurb: string
  kayaTarget: string
  /** Multiplicative deltas applied to factor indices (1 = no change). */
  effects: Partial<GameFactors>
  tradeoff: string
  spicy?: boolean
}

/**
 * Factor bars are country-seeded (EI/CI vs peer median).
 * Emissions pressure = 100 × product(current) / product(start).
 */
export const ACTIONS: ClimateAction[] = [
  {
    id: 'solar',
    name: 'Build solar farms',
    blurb: 'Flood the grid with panels. Hits carbon intensity — weaker each repeat.',
    kayaTarget: 'Carbon intensity ↓',
    effects: { carbonIntensity: 0.88 },
    tradeoff: 'Needs land, minerals, and a grid that can take the juice — still only one lever.',
  },
  {
    id: 'buildings',
    name: 'Insulate everything',
    blurb: 'Wrap buildings until heat bills cry. Hits energy intensity hard.',
    kayaTarget: 'Energy intensity ↓',
    effects: { energyIntensity: 0.9 },
    tradeoff: 'Upfront cost and disruption; doesn’t clean the electrons you still use.',
  },
  {
    id: 'evs',
    name: 'Electrify vehicles',
    blurb: 'Swap tailpipes for plugs. Payoff tracks Ember grid carbon intensity when available.',
    kayaTarget: 'Carbon intensity ↓ (conditional)',
    effects: { carbonIntensity: 0.93, energyIntensity: 0.98 },
    tradeoff: 'If energy is dirty, you partly move the smog upstream.',
  },
  {
    id: 'efficiency_industry',
    name: 'Efficiency blitz',
    blurb: 'Factory tune-ups and leaky-pipe drama. Classic energy-intensity play.',
    kayaTarget: 'Energy intensity ↓',
    effects: { energyIntensity: 0.92 },
    tradeoff: 'Rebound risk: cheaper energy services can invite more use.',
  },
  {
    id: 'consume_less',
    name: 'Reduce consumption',
    blurb: 'Buy fewer stuff-shaped emissions. Cuts demand — and can pinch activity.',
    kayaTarget: 'Energy demand ↓ (via intensity + activity)',
    effects: { energyIntensity: 0.94, affluence: 0.97 },
    tradeoff:
      'This is not “GDP is evil” — it’s lower energy services. Prosperity may dip; pair with cleaner growth.',
  },
  {
    id: 'grow',
    name: 'Grow the economy',
    blurb: 'More GDP per person. Fun until the monster eats the extra affluence.',
    kayaTarget: 'Affluence ↑',
    effects: { affluence: 1.08 },
    tradeoff: 'Raises CO₂ unless you also cut intensity. Decoupling is the point of the game.',
  },
  {
    id: 'one_child',
    name: 'One-child policy',
    blurb: 'Satirical blunt instrument. Small, slow population hit with sharp collateral.',
    kayaTarget: 'Population ↓',
    // Weaker than intensity levers on purpose — not the meta.
    effects: { population: 0.97, affluence: 0.95 },
    tradeoff:
      'Rights, aging societies, gender coercion, economic strain — not a free climate win. Population is one interacting factor, not the villain origin story.',
    spicy: true,
  },
  {
    id: 'nuclear',
    name: 'Go nuclear (loudly)',
    blurb: 'Firm low-carbon power. Carbon intensity takes a punch.',
    kayaTarget: 'Carbon intensity ↓',
    effects: { carbonIntensity: 0.85 },
    tradeoff: 'Cost, politics, timelines. Still doesn’t fix inefficient buildings by itself.',
  },
]

export const MAX_TURNS = 8
/** Win when emissions pressure ≤ this % of the country’s starting pressure. */
export const WIN_CO2 = 60
/** Affluence relative to country start (100 = starting prosperity). */
export const MIN_AFFLUENCE = 70
/** After this many uses, the action is exhausted. */
export const MAX_ACTION_USES = 3
/** Each prior use multiplies the *change* toward 1.0 (diminishing returns). */
export const DIMINISH_FACTOR = 0.55
