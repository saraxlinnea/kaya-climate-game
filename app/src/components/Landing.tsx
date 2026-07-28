import { Link } from 'react-router-dom'
import { COMBAT_SCENARIOS } from '../game/scenarios'
import { COMPARE_STORIES } from '../lib/compareStories'
import { publicUrl } from '../lib/publicUrl'
import { usePageTitle } from '../lib/usePageTitle'
import { SiteNav } from './BrandHeader'
import { MonsterFigure } from './MonsterFigure'
import { SiteFooter } from './SiteFooter'

/** Featured arenas on the landing invite (full list stays in combat). */
const LANDING_ARENAS = COMBAT_SCENARIOS.filter((s) =>
  ['usa', 'fra', 'pol', 'chn', 'nor', 'ind'].includes(s.id),
)

export function Landing() {
  usePageTitle('Kaya Climate')

  return (
    <div className="landing">
      <header className="landing-band landing-band-nav">
        <div className="landing-inner">
          <SiteNav />
        </div>
      </header>

      <section className="hero-plane" aria-labelledby="hero-title">
        <div className="hero-photo" aria-hidden>
          <img
            src={publicUrl('images/horizon-sunrise.jpg')}
            alt=""
            width={2400}
            height={1600}
            decoding="async"
          />
        </div>
        <div className="hero-visual" aria-hidden>
          <MonsterFigure pressure={100} scale={3.2} showHint={false} />
        </div>
        <div className="hero-copy">
          <p className="hero-brand">
            KAYA <span>Climate</span>
          </p>
          <h1 id="hero-title" className="hero-title">
            Fight the CO₂ monster
          </h1>
          <p className="hero-lede">
            A satirical combat game seeded with real country data, plus a serious explorer for why
            emissions rise or fall.
          </p>
          <div className="hero-ctas">
            <Link className="btn-primary" to="/battle/USA">
              Play combat
            </Link>
            <Link className="btn-ghost" to="/country/USA">
              Explore a country
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-band landing-band-paths" aria-label="Ways in">
        <div className="landing-inner">
          <p className="demo-strip" aria-label="Demo links">
            <span className="demo-strip-label">Try</span>
            <Link className="country-link" to="/country/USA">
              United States explorer
            </Link>
            <span className="muted">·</span>
            <Link className="country-link" to="/compare?a=USA&b=CHN">
              USA vs China
            </Link>
            <span className="muted">·</span>
            <Link className="country-link" to="/battle/USA">
              Combat (USA)
            </Link>
          </p>

          <div className="landing-paths">
            <Link className="path-link" to="/country/USA">
              <strong>Explorer</strong>
              <span>Follow one country’s emissions through four Kaya factors.</span>
            </Link>
            <Link className="path-link" to="/compare?a=USA&b=CHN">
              <strong>Compare</strong>
              <span>United States and China on the same table of changes.</span>
            </Link>
            <Link className="path-link" to="/map">
              <strong>Map</strong>
              <span>Champion scores worldwide, then open any country.</span>
            </Link>
            <Link className="path-link" to="/rankings">
              <strong>Leaderboard</strong>
              <span>Growth with cleaner energy, not lowest absolute emissions.</span>
            </Link>
            <Link className="path-link" to="/methods">
              <strong>Methods</strong>
              <span>Data sources, the equation, and how the score is built.</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-band landing-band-arenas" aria-labelledby="combat-invite-title">
        <div className="landing-inner">
          <h2 id="combat-invite-title" className="panel-title">
            Pick an arena
          </h2>
          <p className="panel-note">
            Each fight starts from a real country’s energy intensity and carbon intensity. Win by
            cutting emissions pressure without crashing prosperity. It is a learning puzzle, not
            advice.
          </p>
          <div className="filter-row">
            {LANDING_ARENAS.map((s) => (
              <Link key={s.id} className="filter-chip" to={`/battle/${s.iso}`} title={s.blurb}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-band landing-band-compare" aria-labelledby="compare-gallery-title">
        <div className="landing-inner">
          <h2 id="compare-gallery-title" className="panel-title">
            Country pairs worth comparing
          </h2>
          <p className="panel-note">
            Each pair highlights a different pattern. Open any pair to see the numbers side by side.
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
        </div>
      </section>

      <section className="landing-band landing-band-math" aria-labelledby="math-title">
        <div className="landing-inner">
          <h2 id="math-title" className="panel-title">
            The math behind it
          </h2>
          <p className="kaya-equation" aria-label="Kaya identity equation">
            CO<sub>2</sub> = P × (GDP/P) × (E/GDP) × (CO<sub>2</sub>/E)
          </p>
          <p className="panel-note">
            Population, income per person, energy per dollar of output, and CO₂ per unit of energy.
            Analysts use versions of this identity to explain which parts of the system moved when
            emissions changed. It does not predict the future.
          </p>
          <p className="panel-note">
            Kaya Champion is this site’s own score: it rewards cutting emissions while raising living
            standards and improving efficiency since 2000. It is a trajectory score, not an official
            IPCC or IEA ranking and not “cleanest country today.” Other dashboards rank by emissions
            per person, CO₂ per dollar of GDP, or consumption footprints. Those answer different
            questions.{' '}
            <Link className="country-link" to="/methods">
              Read the methods
            </Link>
            {' · '}
            <Link className="country-link" to="/compare?a=USA&b=CAN">
              Compare USA and Canada
            </Link>
          </p>
        </div>
      </section>

      <div className="landing-band landing-band-footer">
        <div className="landing-inner">
          <SiteFooter />
        </div>
      </div>
    </div>
  )
}
