import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        Named for Yoichi Kaya’s identity, which splits CO₂ into four measurable parts. Data via{' '}
        <a href="https://ourworldindata.org/" target="_blank" rel="noreferrer">
          Our World in Data
        </a>
        . The equation helps show how several parts work together, not one single cause.
      </p>
      <p>
        <Link to="/methods">Methods</Link>
        {' · '}
        <Link to="/">Home</Link>
      </p>
    </footer>
  )
}
