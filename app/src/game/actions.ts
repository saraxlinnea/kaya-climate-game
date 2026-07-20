/** Kaya Combat actions: each maps to Kaya factors plus tradeoffs. */

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
  /** Quiet caveat: game multiplier vs real-world systems. */
  realWorld: string
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
    blurb: 'Add lots of solar panels. Lowers how dirty the energy is. Weaker each time you repeat it.',
    kayaTarget: 'Carbon intensity ↓',
    effects: { carbonIntensity: 0.88 },
    tradeoff: 'Needs land, materials, and a grid that can take the power. Still only one part of the system.',
    realWorld:
      'In the game this lowers carbon intensity. Real solar also needs good locations, power lines, and materials.',
  },
  {
    id: 'buildings',
    name: 'Insulate everything',
    blurb: 'Make buildings hold heat better. Lowers how much energy the economy needs.',
    kayaTarget: 'Energy intensity ↓',
    effects: { energyIntensity: 0.9 },
    tradeoff: 'Costs money up front and can disrupt homes. Does not clean the power you still use.',
    realWorld:
      'Efficiency lowers energy per dollar of GDP in the model. Real retrofits take time, and people may use more energy if it gets cheaper.',
  },
  {
    id: 'evs',
    name: 'Electrify vehicles',
    blurb: 'Swap gas cars for electric ones. Helps more when the power grid is already clean.',
    kayaTarget: 'Carbon intensity ↓ (grid-sensitive)',
    effects: { carbonIntensity: 0.93, energyIntensity: 0.98 },
    tradeoff: 'If electricity is dirty, you partly move pollution to the power plant.',
    realWorld:
      'Electric cars shift emissions to the power sector. A clean grid helps. A coal grid mostly moves the problem.',
  },
  {
    id: 'efficiency_industry',
    name: 'Efficiency blitz',
    blurb: 'Fix factories and leaky systems. Classic way to cut energy use per dollar of output.',
    kayaTarget: 'Energy intensity ↓',
    effects: { energyIntensity: 0.92 },
    tradeoff: 'If energy services get cheaper, people and firms may use more of them.',
    realWorld:
      'Industrial efficiency lowers energy intensity in the Kaya identity. It does not by itself clean the fuel mix.',
  },
  {
    id: 'coal_retire',
    name: 'Retire coal',
    blurb: 'Shut the dirtiest power plants. Strongly lowers carbon intensity.',
    kayaTarget: 'Carbon intensity ↓↓',
    effects: { carbonIntensity: 0.82 },
    tradeoff: 'Jobs, reliability, and politics matter. You still need other power to replace coal.',
    realWorld:
      'In the game this is a big carbon-intensity cut. Real coal exits need replacement power, grids, and plans for workers.',
  },
  {
    id: 'heat_pumps',
    name: 'Heat-pump the suburbs',
    blurb: 'Swap furnaces for heat pumps. Like EVs, the climate help depends on how clean the grid is.',
    kayaTarget: 'Carbon intensity ↓ (grid-sensitive) · Energy intensity ↓',
    effects: { carbonIntensity: 0.91, energyIntensity: 0.96 },
    tradeoff: 'Cold climates, upfront cost, and a grid that must keep up.',
    realWorld:
      'Heat pumps cut building fuel use. How much they help the climate still depends on how dirty the electricity is.',
  },
  {
    id: 'carbon_price',
    name: 'Add a carbon price',
    blurb: 'Make pollution cost money. Efficiency rises, but wallets may feel it.',
    kayaTarget: 'Energy intensity ↓ · Affluence soft hit',
    effects: { energyIntensity: 0.91, affluence: 0.96 },
    tradeoff: 'Politics, leakage to other countries, and who pays. A price is a signal, not a full plan.',
    realWorld:
      'Modeled as lower energy intensity with a small prosperity dip. Real carbon prices vary a lot by design and coverage.',
  },
  {
    id: 'consume_less',
    name: 'Reduce consumption',
    blurb: 'Use less stuff that takes energy to make and move. Can also pinch economic activity.',
    kayaTarget: 'Energy demand ↓ (via intensity + activity)',
    effects: { energyIntensity: 0.94, affluence: 0.97 },
    tradeoff:
      'This is not “GDP is evil.” It is lower energy use. Prosperity may dip. Pair it with cleaner growth.',
    realWorld:
      'Using less can lower energy demand. What counts as “enough,” and who cuts back, are political questions.',
  },
  {
    id: 'grow',
    name: 'Grow the economy',
    blurb: 'Raise income per person. Emissions pressure rises unless you also cut intensity.',
    kayaTarget: 'Affluence ↑',
    effects: { affluence: 1.08 },
    tradeoff: 'Raises CO₂ unless you also cut intensity. Growing cleaner is the point of the game.',
    realWorld:
      'Growth raises the income term in Kaya. Without intensity cuts, pressure climbs. That is the puzzle.',
    spicy: true,
  },
  {
    id: 'one_child',
    name: 'One-child policy',
    blurb: 'Slows population growth. Small climate effect here, with sharp social and economic tradeoffs.',
    kayaTarget: 'Population ↓',
    effects: { population: 0.97, affluence: 0.95 },
    tradeoff:
      'Rights, aging societies, coercion, and economic strain. Not a free climate win. Population is one interacting factor, not the whole story.',
    realWorld:
      'Fertility policy is a weak lever here on purpose. Real population ethics are not a climate cheat code.',
    spicy: true,
  },
  {
    id: 'fusion',
    name: 'Figure out nuclear fusion',
    blurb: 'Very clean power someday. Huge carbon-intensity win in the game if you pretend it works now.',
    kayaTarget: 'Carbon intensity ↓↓ (long-shot)',
    effects: { carbonIntensity: 0.78, affluence: 0.97 },
    tradeoff: 'Cost, timelines, and still no commercial fleet. Research spending can pinch prosperity while you wait.',
    realWorld:
      'Fusion is not a deployed climate tool today. The game lets you try a “miracle tech” path so you can see the temptation.',
    spicy: true,
  },
  {
    id: 'dac',
    name: 'Direct air capture',
    blurb: 'Pull CO₂ back out of the air. Expensive and slow. Not a free pass to keep burning fuels.',
    kayaTarget: 'Carbon intensity ↓ · Affluence hit',
    effects: { carbonIntensity: 0.9, affluence: 0.93 },
    tradeoff: 'Machines use lots of energy and money. Better as a helper than as a replacement for cutting pollution.',
    realWorld:
      'Direct air capture can remove CO₂ but at high cost and energy use. It does not replace cutting fossil fuels at the source.',
    spicy: true,
  },
  {
    id: 'nuclear',
    name: 'Go nuclear',
    blurb: 'Firm low-carbon power. Lowers carbon intensity.',
    kayaTarget: 'Carbon intensity ↓',
    effects: { carbonIntensity: 0.85 },
    tradeoff: 'Cost, politics, and long build times. Still does not fix leaky buildings by itself.',
    realWorld:
      'Nuclear cuts carbon intensity in the model. Real plants take years and do not replace efficiency work.',
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
