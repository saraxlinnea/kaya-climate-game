import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Battle } from './components/Battle'
import { CompareCountries } from './components/CompareCountries'
import { CountryExplorer } from './components/CountryExplorer'
import { Landing } from './components/Landing'
import { Leaderboard } from './components/Leaderboard'
import { Methodology } from './components/Methodology'
import { WorldMap } from './components/WorldMap'
import { listCountries, loadKayaDataset, loadKayaScores } from './lib/loadData'
import type { CountryOption, KayaRow, ScoreRow } from './types'

const DEFAULT_ISO = 'USA'

const routerBasename = (() => {
  const base = import.meta.env.BASE_URL
  if (!base || base === '/') return undefined
  return base.replace(/\/$/, '')
})()

function useIsoParam(countries: CountryOption[]) {
  const { iso } = useParams()
  const code = (iso ?? DEFAULT_ISO).toUpperCase()
  const valid = countries.some((c) => c.iso_code === code)
  return { code, valid }
}

function ExplorerRoute({
  countries,
  rows,
  scores,
}: {
  countries: CountryOption[]
  rows: KayaRow[]
  scores: ScoreRow[]
}) {
  const { code, valid } = useIsoParam(countries)
  if (!valid) return <Navigate to={`/country/${DEFAULT_ISO}`} replace />
  return <CountryExplorer countries={countries} rows={rows} scores={scores} iso={code} />
}

function BattleRoute({ countries, rows }: { countries: CountryOption[]; rows: KayaRow[] }) {
  const { code, valid } = useIsoParam(countries)
  if (!valid) return <Navigate to={`/battle/${DEFAULT_ISO}`} replace />
  return <Battle countries={countries} rows={rows} iso={code} />
}

export default function App() {
  const [rows, setRows] = useState<KayaRow[] | null>(null)
  const [scores, setScores] = useState<ScoreRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([loadKayaDataset(), loadKayaScores()])
      .then(([dataset, scoreRows]) => {
        if (cancelled) return
        setRows(dataset)
        setScores(scoreRows)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load data')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const countries = useMemo(() => (rows ? listCountries(rows) : []), [rows])

  if (error) {
    return (
      <div className="app-shell">
        <p className="brand-mark">
          KAYA <span>Climate</span>
        </p>
        <p className="error">{error}</p>
        <p className="muted">
          Run <code>python src/export_app_data.py</code> after the data pipeline, then restart the
          app.
        </p>
      </div>
    )
  }

  if (!rows || !scores) {
    return (
      <div className="app-shell">
        <p className="brand-mark">
          KAYA <span>Climate</span>
        </p>
        <p className="status">Loading country data…</p>
      </div>
    )
  }

  return (
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/country/:iso"
          element={<ExplorerRoute countries={countries} rows={rows} scores={scores} />}
        />
        <Route path="/rankings" element={<Leaderboard scores={scores} />} />
        <Route path="/map" element={<WorldMap scores={scores} />} />
        <Route
          path="/compare"
          element={<CompareCountries countries={countries} rows={rows} scores={scores} />}
        />
        <Route
          path="/battle/:iso"
          element={<BattleRoute countries={countries} rows={rows} />}
        />
        <Route path="/battle" element={<Navigate to={`/battle/${DEFAULT_ISO}`} replace />} />
        <Route path="/methods" element={<Methodology />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
