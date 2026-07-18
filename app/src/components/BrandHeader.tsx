import { NavLink, useLocation } from 'react-router-dom'

export function SiteNav() {
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const onExplorer = pathname.startsWith('/country')
  const onRankings = pathname.startsWith('/rankings')
  const onMap = pathname.startsWith('/map')
  const onCompare = pathname.startsWith('/compare')
  const onBattle = pathname.startsWith('/battle')
  const onMethods = pathname.startsWith('/methods')

  return (
    <nav className="site-nav" aria-label="Primary">
      <NavLink to="/" className={() => (onHome ? 'active' : undefined)} end>
        Home
      </NavLink>
      <NavLink to="/country/USA" className={() => (onExplorer ? 'active' : undefined)}>
        Explorer
      </NavLink>
      <NavLink to="/compare" className={() => (onCompare ? 'active' : undefined)}>
        Compare
      </NavLink>
      <NavLink to="/map" className={() => (onMap ? 'active' : undefined)}>
        Map
      </NavLink>
      <NavLink to="/rankings" className={() => (onRankings ? 'active' : undefined)}>
        Leaderboard
      </NavLink>
      <NavLink to="/battle/USA" className={() => (onBattle ? 'active' : undefined)}>
        Combat
      </NavLink>
      <NavLink to="/methods" className={() => (onMethods ? 'active' : undefined)}>
        Methods
      </NavLink>
    </nav>
  )
}

export function BrandHeader({ subtitle }: { subtitle: string }) {
  return (
    <header className="brand-bar">
      <div>
        <p className="brand-mark">
          KAYA <span>Climate</span>
        </p>
        <SiteNav />
      </div>
      <p className="brand-sub">{subtitle}</p>
    </header>
  )
}
