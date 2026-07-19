import { Link } from 'react-router-dom'
import { usePageTitle } from '../lib/usePageTitle'
import { BrandHeader } from './BrandHeader'
import { SiteFooter } from './SiteFooter'

export function Methodology() {
  usePageTitle('Methods — Kaya Climate')
  return (
    <div className="app-shell">
      <BrandHeader subtitle="How the numbers are built — and what they are not." />

      <article className="panel methods-doc">
        <h1 className="panel-title">Methodology</h1>
        <p className="panel-note">
          Short version for credibility. Full scoring detail lives in the repo’s{' '}
          <code>SCORING.md</code> and <code>DATA_SOURCES.md</code>.
        </p>

        <h2>Kaya identity</h2>
        <p>
          Annual CO₂ is framed as the product of population, GDP per capita, energy intensity
          (energy / GDP), and carbon intensity (CO₂ / energy). Factors interact — no single bar
          “causes” the outcome alone.
        </p>

        <h2>Data</h2>
        <p>
          Primary source: <strong>Our World in Data</strong> CO₂ bulk extract (Global Carbon Project,
          Energy Institute, World Bank, UN population inputs). Country rows use ISO3 codes; aggregates
          are dropped. Missing years are not interpolated.
        </p>

        <h2>Territorial vs consumption CO₂</h2>
        <p>
          Default charts and the Kaya identity use <strong>territorial</strong> (production-based)
          CO₂ — emissions from fuels burned and processes inside borders. OWID also publishes{' '}
          <strong>consumption-based</strong> CO₂, which reallocates emissions embodied in traded
          goods. When that series exists, the explorer overlays both lines and adds a short
          territorial-vs-consumption narrative.
        </p>
        <p>
          A falling territorial series can reflect cleaner energy <em>or</em> offshoring of industry.
          Consumption CO₂ is a footprint check for that question. It does <strong>not</strong>{' '}
          rewrite Kaya Champion scores (still territorial) and is not a full multi-regional input–output
          model.
        </p>

        <h2>Kaya Champion score</h2>
        <p>
          Window <strong>2000 → latest ≥ 2018</strong> (currently 2022). Eligibility: population ≥ 1M
          and CO₂ ≥ 5 Mt in 2000. Score rewards trajectories — lower CO₂, higher GDP/capita, lower
          energy and carbon intensity — with fixed weights 30 / 25 / 20 / 25. Not a ranking of lowest
          absolute emissions or historical responsibility.
        </p>

        <h2>Combat game</h2>
        <p>
          Satirical and simplified. Energy and carbon intensity bars are seeded from the country’s
          levels relative to peer medians; each turn applies historical population/prosperity drift
          (BAU). Actions have diminishing returns (max three uses). After a run, compare your path to
          that country’s real 2000→latest record. Population policies are allowed as blunt instruments,
          not recommended solutions.
        </p>

        <h2>Limitations</h2>
        <ul>
          <li>
            Production-based CO₂ drives scores and the main “emissions changed because…” narrative;
            consumption overlay is available when OWID provides it.
          </li>
          <li>
            Primary-energy carbon intensity plus optional Ember <em>electricity</em> intensity
            (gCO₂e/kWh) for grid-aware EV combat.
          </li>
          <li>Score clip bounds are product choices for v1, not physical constants.</li>
          <li>GDP series often lags energy/CO₂ — latest complete Kaya years may trail the calendar.</li>
          <li>
            Coarse world map outlines omit some tiny jurisdictions; Hong Kong and Singapore appear as
            markers when scored.
          </li>
        </ul>

        <p className="methods-links">
          <Link className="country-link" to="/country/USA">
            Back to explorer
          </Link>
          {' · '}
          <Link className="country-link" to="/rankings">
            Leaderboard
          </Link>
        </p>
      </article>

      <SiteFooter />
    </div>
  )
}
