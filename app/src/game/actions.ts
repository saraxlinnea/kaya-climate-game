/** Kaya Combat actions: each maps to Kaya factors plus tradeoffs. */

export type FactorKey = 'population' | 'affluence' | 'energyIntensity' | 'carbonIntensity'

export type GameFactors = Record<FactorKey, number>

/** Fixed action buckets for UI grouping (Pass B) and catalog clarity. */
export type ActionCategory =
  | 'clean_power'
  | 'efficiency'
  | 'electrify'
  | 'demand'
  | 'economy'
  | 'hail_mary'

export const CATEGORY_LABELS: Record<ActionCategory, string> = {
  clean_power: 'Clean power',
  efficiency: 'Efficiency',
  electrify: 'Electrify',
  demand: 'Demand',
  economy: 'Economy',
  hail_mary: 'Hail mary',
}

/** Display order for grouped policy moves. */
export const CATEGORY_ORDER: ActionCategory[] = [
  'clean_power',
  'efficiency',
  'electrify',
  'demand',
  'economy',
  'hail_mary',
]

export type ClimateAction = {
  id: string
  name: string
  category: ActionCategory
  blurb: string
  kayaTarget: string
  /** Multiplicative deltas applied to factor indices (1 = no change). */
  effects: Partial<GameFactors>
  tradeoff: string
  /** Quiet caveat: game multiplier vs real-world systems. */
  realWorld: string
  /**
   * Risky / satirical / decoy moves. Kept in sync with category === 'hail_mary'
   * for existing Battle filters and CSS.
   */
  spicy?: boolean
}

export function isHailMary(action: ClimateAction): boolean {
  return action.category === 'hail_mary' || action.spicy === true
}

/**
 * Factor bars are country-seeded (EI/CI vs peer median).
 * Emissions pressure = 100 × product(current) / product(start).
 */
export const ACTIONS: ClimateAction[] = [
  // --- Clean power ---
  {
    id: 'solar',
    name: 'Build solar farms',
    category: 'clean_power',
    blurb: 'Add lots of solar panels. Lowers how dirty the energy is. Weaker each time you repeat it.',
    kayaTarget: 'Carbon intensity ↓',
    effects: { carbonIntensity: 0.88 },
    tradeoff: 'Needs land, materials, and a grid that can take the power. Still only one part of the system.',
    realWorld:
      'In the game this lowers carbon intensity. Real solar also needs good locations, power lines, and materials.',
  },
  {
    id: 'wind',
    name: 'Build wind farms',
    category: 'clean_power',
    blurb: 'Add wind turbines. Another way to clean the power mix, with different siting limits than solar.',
    kayaTarget: 'Carbon intensity ↓',
    effects: { carbonIntensity: 0.89 },
    tradeoff: 'Wind needs good sites, transmission, and backup when the wind is calm.',
    realWorld:
      'Wind lowers carbon intensity in the model like other clean generation. Real projects face grid queues and local opposition.',
  },
  {
    id: 'coal_retire',
    name: 'Retire coal',
    category: 'clean_power',
    blurb: 'Shut the dirtiest power plants. Strongly lowers carbon intensity.',
    kayaTarget: 'Carbon intensity ↓↓',
    effects: { carbonIntensity: 0.82 },
    tradeoff: 'Jobs, reliability, and politics matter. You still need other power to replace coal.',
    realWorld:
      'In the game this is a big carbon-intensity cut. Real coal exits need replacement power, grids, and plans for workers.',
  },
  {
    id: 'nuclear',
    name: 'Go nuclear',
    category: 'clean_power',
    blurb: 'Firm low-carbon power. Lowers carbon intensity.',
    kayaTarget: 'Carbon intensity ↓',
    effects: { carbonIntensity: 0.85 },
    tradeoff: 'Cost, politics, and long build times. Still does not fix leaky buildings by itself.',
    realWorld:
      'Nuclear cuts carbon intensity in the model. Real plants take years and do not replace efficiency work.',
  },
  {
    id: 'grid_storage',
    name: 'Add grid storage',
    category: 'clean_power',
    blurb: 'Batteries and other storage help soak up variable renewables. A modest carbon-intensity cut on its own.',
    kayaTarget: 'Carbon intensity ↓ (enabler)',
    effects: { carbonIntensity: 0.94 },
    tradeoff: 'Costly hardware. Helps most when you also build clean power, not as a solo silver bullet.',
    realWorld:
      'Storage supports cleaner grids. It does not by itself replace cutting coal or adding generation.',
  },
  {
    id: 'methane_leaks',
    name: 'Fix methane leaks',
    category: 'clean_power',
    blurb: 'Plug leaks from oil, gas, and coal systems. Methane is a potent warmer; the game maps this as cleaner energy.',
    kayaTarget: 'Carbon intensity ↓',
    effects: { carbonIntensity: 0.9 },
    tradeoff: 'Does not replace leaving fossil fuels in the ground. Monitoring and enforcement are hard.',
    realWorld:
      'Methane cuts are real near-term wins. The Kaya toy maps them into carbon intensity; chemistry and time horizons are richer than this bar.',
  },
  {
    id: 'green_hydrogen',
    name: 'Green hydrogen for industry',
    category: 'clean_power',
    blurb: 'Make hydrogen with clean electricity for hard-to-electrify processes. Expensive and still maturing.',
    kayaTarget: 'Carbon intensity ↓ · Affluence soft hit',
    effects: { carbonIntensity: 0.92, affluence: 0.98 },
    tradeoff: 'Needs lots of clean power and new equipment. Easy to waste if the grid is still dirty.',
    realWorld:
      'Green hydrogen can cut process emissions where electrons are not enough. Cost and clean supply are the real bottlenecks.',
  },

  // --- Efficiency ---
  {
    id: 'buildings',
    name: 'Insulate everything',
    category: 'efficiency',
    blurb: 'Make buildings hold heat better. Lowers how much energy the economy needs.',
    kayaTarget: 'Energy intensity ↓',
    effects: { energyIntensity: 0.9 },
    tradeoff: 'Costs money up front and can disrupt homes. Does not clean the power you still use.',
    realWorld:
      'Efficiency lowers energy per dollar of GDP in the model. Real retrofits take time, and people may use more energy if it gets cheaper.',
  },
  {
    id: 'efficiency_industry',
    name: 'Efficiency blitz',
    category: 'efficiency',
    blurb: 'Fix factories and leaky systems. Classic way to cut energy use per dollar of output.',
    kayaTarget: 'Energy intensity ↓',
    effects: { energyIntensity: 0.92 },
    tradeoff: 'If energy services get cheaper, people and firms may use more of them.',
    realWorld:
      'Industrial efficiency lowers energy intensity in the Kaya identity. It does not by itself clean the fuel mix.',
  },
  {
    id: 'industrial_heat',
    name: 'Cleaner industrial heat',
    category: 'efficiency',
    blurb: 'Upgrade boilers, heat recovery, and process heat so factories use less fuel per unit of output.',
    kayaTarget: 'Energy intensity ↓',
    effects: { energyIntensity: 0.91 },
    tradeoff: 'Capital cost and industry politics. Does not automatically clean electricity.',
    realWorld:
      'Process heat is a big industrial energy slice. Efficiency here lowers energy intensity; fuel switching is a separate fight.',
  },

  // --- Electrify ---
  {
    id: 'evs',
    name: 'Electrify vehicles',
    category: 'electrify',
    blurb: 'Swap gas cars for electric ones. Helps more when the power grid is already clean.',
    kayaTarget: 'Carbon intensity ↓ (grid-sensitive)',
    effects: { carbonIntensity: 0.93, energyIntensity: 0.98 },
    tradeoff: 'If electricity is dirty, you partly move pollution to the power plant.',
    realWorld:
      'Electric cars shift emissions to the power sector. A clean grid helps. A coal grid mostly moves the problem.',
  },
  {
    id: 'heat_pumps',
    name: 'Heat-pump the suburbs',
    category: 'electrify',
    blurb: 'Swap furnaces for heat pumps. Like EVs, the climate help depends on how clean the grid is.',
    kayaTarget: 'Carbon intensity ↓ (grid-sensitive) · Energy intensity ↓',
    effects: { carbonIntensity: 0.91, energyIntensity: 0.96 },
    tradeoff: 'Cold climates, upfront cost, and a grid that must keep up.',
    realWorld:
      'Heat pumps cut building fuel use. How much they help the climate still depends on how dirty the electricity is.',
  },
  {
    id: 'transit',
    name: 'Expand public transit',
    category: 'electrify',
    blurb: 'Buses, trains, and denser trips. Cuts some transport energy and can nudge carbon intensity down.',
    kayaTarget: 'Energy intensity ↓ · Carbon intensity ↓',
    effects: { energyIntensity: 0.95, carbonIntensity: 0.97 },
    tradeoff: 'Slow to build, needs ridership, and does not erase freight or flying.',
    realWorld:
      'Transit can lower energy demand per trip. Land use and decades of investment matter more than one game turn.',
  },

  // --- Demand ---
  {
    id: 'consume_less',
    name: 'Reduce consumption',
    category: 'demand',
    blurb: 'Use less stuff that takes energy to make and move. Can also pinch economic activity.',
    kayaTarget: 'Energy demand ↓ (via intensity + activity)',
    effects: { energyIntensity: 0.94, affluence: 0.97 },
    tradeoff:
      'This is not “GDP is evil.” It is lower energy use. Prosperity may dip. Pair it with cleaner growth.',
    realWorld:
      'Using less can lower energy demand. What counts as “enough,” and who cuts back, are political questions.',
  },
  {
    id: 'plant_rich_diet',
    name: 'Shift toward plant-rich diets',
    category: 'demand',
    blurb: 'Lower livestock and land pressure in the toy model. A modest intensity nudge with social tradeoffs.',
    kayaTarget: 'Energy intensity ↓ · Carbon intensity ↓ (small)',
    effects: { energyIntensity: 0.97, carbonIntensity: 0.98 },
    tradeoff: 'Food culture, farmer livelihoods, and nutrition. Not a substitute for cleaning power.',
    realWorld:
      'Diet shifts can cut food-system emissions. Kaya’s energy frame only partly captures land and methane; treat this as a weak teaching lever.',
  },

  // --- Economy ---
  {
    id: 'carbon_price',
    name: 'Add a carbon price',
    category: 'economy',
    blurb: 'Make pollution cost money. Efficiency rises, but wallets may feel it.',
    kayaTarget: 'Energy intensity ↓ · Affluence soft hit',
    effects: { energyIntensity: 0.91, affluence: 0.96 },
    tradeoff: 'Politics, leakage to other countries, and who pays. A price is a signal, not a full plan.',
    realWorld:
      'Modeled as lower energy intensity with a small prosperity dip. Real carbon prices vary a lot by design and coverage.',
  },
  {
    id: 'grow',
    name: 'Grow the economy',
    category: 'economy',
    blurb: 'Raise income per person. Emissions pressure rises unless you also cut intensity.',
    kayaTarget: 'Affluence ↑',
    effects: { affluence: 1.08 },
    tradeoff: 'Raises CO₂ unless you also cut intensity. Growing cleaner is the point of the game.',
    realWorld:
      'Growth raises the income term in Kaya. Without intensity cuts, pressure climbs. That is the puzzle.',
  },

  // --- Hail mary ---
  {
    id: 'one_child',
    name: 'One-child policy',
    category: 'hail_mary',
    spicy: true,
    blurb: 'Slows population growth. Small climate effect here, with sharp social and economic tradeoffs.',
    kayaTarget: 'Population ↓',
    effects: { population: 0.97, affluence: 0.95 },
    tradeoff:
      'Rights, aging societies, coercion, and economic strain. Not a free climate win. Population is one interacting factor, not the whole story.',
    realWorld:
      'Fertility policy is a weak lever here on purpose. Real population ethics are not a climate cheat code.',
  },
  {
    id: 'fusion',
    name: 'Figure out nuclear fusion',
    category: 'hail_mary',
    spicy: true,
    blurb: 'Very clean power someday. Huge carbon-intensity win in the game if you pretend it works now.',
    kayaTarget: 'Carbon intensity ↓↓ (long-shot)',
    effects: { carbonIntensity: 0.78, affluence: 0.97 },
    tradeoff: 'Cost, timelines, and still no commercial fleet. Research spending can pinch prosperity while you wait.',
    realWorld:
      'Fusion is not a deployed climate tool today. The game lets you try a “miracle tech” path so you can see the temptation.',
  },
  {
    id: 'dac',
    name: 'Direct air capture',
    category: 'hail_mary',
    spicy: true,
    blurb: 'Pull CO₂ back out of the air. Expensive and slow. Not a free pass to keep burning fuels.',
    kayaTarget: 'Carbon intensity ↓ · Affluence hit',
    effects: { carbonIntensity: 0.9, affluence: 0.93 },
    tradeoff: 'Machines use lots of energy and money. Better as a helper than as a replacement for cutting pollution.',
    realWorld:
      'Direct air capture can remove CO₂ but at high cost and energy use. It does not replace cutting fossil fuels at the source.',
  },
  {
    id: 'reforest',
    name: 'Plant massive forests',
    category: 'hail_mary',
    spicy: true,
    blurb: 'Trees store carbon slowly. A weak pressure cut here on purpose so land is not a free win.',
    kayaTarget: 'Carbon intensity ↓ (weak / slow)',
    effects: { carbonIntensity: 0.97 },
    tradeoff: 'Land, water, permanence, and wildfire risk. Cannot offset endless fossil burning.',
    realWorld:
      'Forests matter, but removals are slow and reversible. The game keeps this lever weak so it cannot replace cutting energy emissions.',
  },
  {
    id: 'seawalls',
    name: 'Build seawalls and adapt',
    category: 'hail_mary',
    spicy: true,
    blurb: 'Protect coasts from climate damage. Adaptation can save lives. It barely moves emissions pressure.',
    kayaTarget: 'Almost no mitigation (decoy)',
    effects: { affluence: 0.99 },
    tradeoff: 'Costly and necessary in places, but it is not the same as cutting CO₂.',
    realWorld:
      'Adaptation and mitigation are different jobs. This move is here so you can feel a policy that does not beat the monster.',
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
