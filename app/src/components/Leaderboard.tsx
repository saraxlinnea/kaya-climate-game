import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ScoreRow } from '../types'
import { explainRank, type RankSortKey } from '../lib/rankExplain'
import { usePageTitle } from '../lib/usePageTitle'
import { BrandHeader } from './BrandHeader'
import { SiteFooter } from './SiteFooter'

type SortKey = RankSortKey

const FILTERS: { key: SortKey; label: string; blurb: string }[] = [
  {
    key: 'kaya_score',
    label: 'Best decoupling',
    blurb: 'Overall Kaya Champion score (growth + emissions/intensity progress).',
  },
  {
    key: 'score_decarbonization',
    label: 'Biggest CO₂ cut',
    blurb: 'Component score for reducing total CO₂ (2000 → latest).',
  },
  {
    key: 'score_prosperity',
    label: 'Prosperity growth',
    blurb: 'Component score for rising GDP per capita.',
  },
  {
    key: 'score_efficiency',
    label: 'Efficiency gains',
    blurb: 'Component score for falling energy intensity.',
  },
  {
    key: 'score_clean',
    label: 'Cleaner energy',
    blurb: 'Component score for falling carbon intensity.',
  },
]

function formatPct(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(0)}%`
}

type Props = {
  scores: ScoreRow[]
}

export function Leaderboard({ scores }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('kaya_score')
  const [query, setQuery] = useState('')
  const [openIso, setOpenIso] = useState<string | null>(null)
  const active = FILTERS.find((f) => f.key === sortKey) ?? FILTERS[0]
  usePageTitle('Leaderboard: Kaya Climate')

  const ranked = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? scores.filter(
          (s) =>
            s.country.toLowerCase().includes(q) || s.iso_code.toLowerCase().includes(q),
        )
      : scores
    return [...filtered].sort((a, b) => Number(b[sortKey]) - Number(a[sortKey]))
  }, [scores, sortKey, query])

  const windowLabel =
    scores.length > 0 ? `${scores[0].start_year} → ${scores[0].end_year}` : '2000 → latest'

  function toggleRow(iso: string) {
    setOpenIso((prev) => (prev === iso ? null : iso))
  }

  return (
    <div className="app-shell page-enter">
      <BrandHeader subtitle="Countries ranked on cutting emissions while raising living standards, not on lowest absolute emissions." />

      <section className="panel">
        <h1 className="panel-title">Kaya Champion rankings</h1>
        <p className="panel-note">
          Window {windowLabel}. Click a row for a short explanation of the rank. Transition economies
          often place high after 2000 because efficiency and growth both improved. That is a feature
          of the method, not an error.
        </p>

        <div className="filter-row" role="tablist" aria-label="Ranking mode">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={sortKey === f.key}
              className={sortKey === f.key ? 'filter-chip active' : 'filter-chip'}
              onClick={() => {
                setSortKey(f.key)
                setOpenIso(null)
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="field" style={{ marginTop: '1rem', maxWidth: '20rem' }}>
          <label htmlFor="rank-search">Find country</label>
          <input
            id="rank-search"
            className="text-input"
            type="search"
            placeholder="Name or ISO…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <p className="muted" style={{ marginTop: '0.75rem' }}>
          {active.blurb}
        </p>
      </section>

      <section className="panel" style={{ marginTop: '1rem', overflowX: 'auto' }}>
        <table className="rank-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Country</th>
              <th scope="col">Score</th>
              <th scope="col">Decarb</th>
              <th scope="col">Prosperity</th>
              <th scope="col">Efficiency</th>
              <th scope="col">Clean</th>
              <th scope="col">CO₂ Δ</th>
              <th scope="col">GDP/cap Δ</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((row, i) => {
              const rank = i + 1
              const open = openIso === row.iso_code
              const why = open ? explainRank(row, rank, sortKey) : null
              return (
                <tr key={row.iso_code} className={open ? 'rank-open' : undefined}>
                  <td className="rank-num">{rank}</td>
                  <td>
                    <button
                      type="button"
                      className="rank-why-btn"
                      aria-expanded={open}
                      onClick={() => toggleRow(row.iso_code)}
                    >
                      {row.country}
                      <span className="muted"> {open ? '▾' : '▸'}</span>
                    </button>
                    {why && (
                      <div className="rank-explain">
                        <p className="rank-explain-head">{why.headline}</p>
                        <ul>
                          {why.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                        {why.context && <p className="rank-explain-context">{why.context}</p>}
                        <p className="rank-explain-links">
                          <Link className="country-link" to={`/country/${row.iso_code}`}>
                            Explorer
                          </Link>
                          {' · '}
                          <Link className="country-link" to={`/battle/${row.iso_code}`}>
                            Combat
                          </Link>
                        </p>
                      </div>
                    )}
                  </td>
                  <td className={sortKey === 'kaya_score' ? 'col-active' : undefined}>
                    <strong>{row.kaya_score.toFixed(0)}</strong>
                  </td>
                  <td className={sortKey === 'score_decarbonization' ? 'col-active' : undefined}>
                    {row.score_decarbonization.toFixed(0)}
                  </td>
                  <td className={sortKey === 'score_prosperity' ? 'col-active' : undefined}>
                    {row.score_prosperity.toFixed(0)}
                  </td>
                  <td className={sortKey === 'score_efficiency' ? 'col-active' : undefined}>
                    {row.score_efficiency.toFixed(0)}
                  </td>
                  <td className={sortKey === 'score_clean' ? 'col-active' : undefined}>
                    {row.score_clean.toFixed(0)}
                  </td>
                  <td>{formatPct(row.co2_pct)}</td>
                  <td>{formatPct(row.gdp_per_capita_pct)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="muted" style={{ marginTop: '1rem' }}>
          Showing {ranked.length}
          {query ? ` match${ranked.length === 1 ? '' : 'es'}` : ` of ${scores.length} eligible`}{' '}
          (population ≥ 1M and CO₂ ≥ 5 Mt in 2000).
        </p>
      </section>

      <SiteFooter />
    </div>
  )
}
