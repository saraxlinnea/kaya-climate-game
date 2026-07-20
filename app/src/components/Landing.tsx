import { Link } from 'react-router-dom'
import { COMBAT_SCENARIOS } from '../game/scenarios'
import { COMPARE_STORIES } from '../lib/compareStories'
import { usePageTitle } from '../lib/usePageTitle'
import { SiteNav } from './BrandHeader'
import { SiteFooter } from './SiteFooter'

export function Landing() {
  usePageTitle('Kaya Climate')

  return (
    <div className="app-shell landing">
      <div className="landing-top">
        <SiteNav />
      </div>

      <section className="hero-plane" aria-labelledby="hero-title">
        <p className="hero-brand">
          KAYA <span>Climate</span>
        </p>
        <h1 id="hero-title" className="hero-title">
          Why emissions rise or fall
        </h1>
        <p className="hero-lede">
          Carbon dioxide can be written as the product of four measurable parts: how many people live
          in a country, how rich they are, how much energy the economy uses, and how dirty that energy
          is. This site uses that math to show what changed.
        </p>
        <div className="hero-ctas">
          <Link className="btn-primary" to="/country/USA">
            Explore a country
          </Link>
          <Link className="btn-ghost" to="/methods">
            Read the methods
          </Link>
        </div>
      </section>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2 className="panel-title">The Kaya identity</h2>
        <p className="kaya-equation" aria-label="Kaya identity equation">
          CO<sub>2</sub> = P × (GDP/P) × (E/GDP) × (CO<sub>2</sub>/E)
        </p>
        <ul className="kaya-gloss">
          <li>
            <strong>P</strong>: population
          </li>
          <li>
            <strong>GDP/P</strong>: income per person (GDP per capita, PPP)
          </li>
          <li>
            <strong>E/GDP</strong>: energy use per dollar of economic output
          </li>
          <li>
            <strong>CO₂/E</strong>: carbon dioxide released per unit of energy
          </li>
        </ul>
        <p className="panel-note">
          Climate analysts use this equation the way accountants use a balance sheet. It does not
          predict the future. It helps explain which parts of the system moved when emissions
          changed. The Intergovernmental Panel on Climate Change and the International Energy Agency
          rely on versions of this approach in reports and energy analysis.
        </p>
        <p className="panel-note">
          The ranking we call Kaya Champion is our own score for this site. It rewards countries that
          cut emissions while raising living standards and improving efficiency from 2000 to the
          latest year. The equation above is standard. The score is not an official IPCC or IEA
          measure.{' '}
          <Link className="country-link" to="/methods">
            Read the methods
          </Link>
        </p>
      </section>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2 className="panel-title">Other ways people measure progress</h2>
        <p className="panel-note">
          Many dashboards rank countries by emissions per person, by how much carbon the economy
          emits per dollar of GDP, or by a consumption footprint that adjusts for trade. Those answer
          different questions from “who improved the most since 2000.” The explorer and compare pages
          show both kinds of numbers so you can see the contrast. The United States, for example, cut
          total emissions more than Canada after 2000 on our score, while Canada can still look higher
          on a per-person basis.
        </p>
        <div className="filter-row">
          <Link className="filter-chip" to="/compare?a=USA&b=CAN">
            Compare United States and Canada
          </Link>
          <Link className="filter-chip" to="/country/USA">
            Open the United States explorer
          </Link>
          <Link className="filter-chip" to="/methods">
            Score versus the equation
          </Link>
        </div>
      </section>

      <section className="landing-paths">
        <Link className="path-link" to="/country/USA">
          <strong>Explorer</strong>
          <span>Follow one country’s emissions through the Kaya identity factors.</span>
        </Link>
        <Link className="path-link" to="/compare?a=USA&b=CHN">
          <strong>Compare</strong>
          <span>Put two countries on the same table of changes and levels.</span>
        </Link>
        <Link className="path-link" to="/map">
          <strong>Map</strong>
          <span>See Champion scores around the world, then open a country.</span>
        </Link>
        <Link className="path-link" to="/rankings">
          <strong>Leaderboard</strong>
          <span>Rank on growth with cleaner energy, not on lowest absolute emissions.</span>
        </Link>
        <Link className="path-link" to="/battle/USA">
          <strong>Combat</strong>
          <span>A practice game: try policy moves on a CO₂ monster built from real country data.</span>
        </Link>
        <Link className="path-link" to="/methods">
          <strong>Methods</strong>
          <span>Data sources, the equation, and how the score is built.</span>
        </Link>
      </section>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2 className="panel-title">Country pairs worth comparing</h2>
        <p className="panel-note">
          Each pair highlights a different pattern in the data. Open any pair to see the numbers side
          by side.
        </p>
        <div className="compare-gallery">
          {COMPARE_STORIES.map((s) => (
            <Link
              key={s.id}
              className="compare-story"
              to={`/compare?a=${s.a}&b=${s.b}`}
            >
              <strong>{s.label}</strong>
              <span>{s.lesson}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel combat-lab" style={{ marginTop: '1rem' }} aria-labelledby="combat-lab-title">
        <p className="combat-lab-kicker">A practice game, separate from the data pages</p>
        <h2 id="combat-lab-title" className="panel-title">
          Kaya Combat
        </h2>
        <p className="panel-note">
          Fight a CO₂ monster using simple policy moves. The starting numbers come from a real
          country’s energy use and how dirty its energy is. You win by lowering emissions pressure
          without crashing how well people live (prosperity). It is a learning puzzle, not advice, and
          it does not replace the explorer.
        </p>
        <p className="panel-note">
          Moves include solar, insulating buildings, retiring coal, heat pumps, and a carbon price.
          As pressure falls, the monster loses limbs and cools from copper to teal.
        </p>
        <div className="hero-ctas" style={{ marginTop: '0.85rem' }}>
          <Link className="btn-primary" to="/battle/USA">
            Play with United States data
          </Link>
          <Link className="btn-ghost" to="/battle/FRA">
            Play with France (cleaner grid)
          </Link>
        </div>
        <div className="filter-row" style={{ marginTop: '1rem' }}>
          {COMBAT_SCENARIOS.map((s) => (
            <Link key={s.id} className="filter-chip" to={`/battle/${s.iso}`} title={s.blurb}>
              {s.label}
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
