import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        Data via{' '}
        <a href="https://ourworldindata.org/" target="_blank" rel="noreferrer">
          Our World in Data
        </a>
        . The Kaya identity helps show how several parts work together, not one single cause.
      </p>
      <p>
        <Link to="/methods">Methods</Link>
        {' · '}
        <Link to="/">Home</Link>
      </p>
    </footer>
  )
}
