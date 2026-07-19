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
          See what actually moves CO₂
        </h1>
        <p className="hero-lede">
          Population, prosperity, energy intensity, and carbon intensity — four levers, one identity.
          Explore countries, rank decoupling, then fight the monster.
        </p>
        <div className="hero-ctas">
          <Link className="btn-primary" to="/country/USA">
            Explore countries
          </Link>
          <Link className="btn-ghost" to="/battle/FRA">
            Combat: clean grid (France)
          </Link>
        </div>
      </section>

      <section className="landing-paths">
        <Link className="path-link" to="/country/USA">
          <strong>Explorer</strong>
          <span>Decompose emissions over time for any country.</span>
        </Link>
        <Link className="path-link" to="/compare?a=USA&b=CHN">
          <strong>Compare</strong>
          <span>USA vs China (or any pair) on the same metrics.</span>
        </Link>
        <Link className="path-link" to="/map">
          <strong>Map</strong>
          <span>Choropleth of decoupling scores — click into any country.</span>
        </Link>
        <Link className="path-link" to="/rankings">
          <strong>Leaderboard</strong>
          <span>Rank growth + cleaner energy — not lowest absolute CO₂.</span>
        </Link>
        <Link className="path-link" to="/battle/USA">
          <strong>Combat</strong>
          <span>Satirical policy levers with country-seeded tradeoffs.</span>
        </Link>
        <Link className="path-link" to="/methods">
          <strong>Methods</strong>
          <span>Data sources, Kaya identity, scoring rules.</span>
        </Link>
      </section>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2 className="panel-title">Kaya comparisons</h2>
        <p className="panel-note">
          Side-by-side stories that teach different systems lessons. Open any pair in Compare.
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

      <section className="panel" style={{ marginTop: '1rem' }}>
        <h2 className="panel-title">Combat scenarios</h2>
        <p className="panel-note">Each arena teaches a different systems lesson.</p>
        <div className="filter-row">
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
