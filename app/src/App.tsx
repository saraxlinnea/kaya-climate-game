import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { CountryExplorer } from './components/CountryExplorer'
import { listCountries, loadKayaDataset, loadKayaScores } from './lib/loadData'
import type { CountryOption, KayaRow, ScoreRow } from './types'

const DEFAULT_ISO = 'USA'

function ExplorerRoute({
  countries,
  rows,
  scores,
}: {
  countries: CountryOption[]
  rows: KayaRow[]
  scores: ScoreRow[]
}) {
  const { iso } = useParams()
  const code = (iso ?? DEFAULT_ISO).toUpperCase()
  const valid = countries.some((c) => c.iso_code === code)
  if (!valid) {
    return <Navigate to={`/country/${DEFAULT_ISO}`} replace />
  }
  return <CountryExplorer countries={countries} rows={rows} scores={scores} iso={code} />
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/country/${DEFAULT_ISO}`} replace />} />
        <Route
          path="/country/:iso"
          element={<ExplorerRoute countries={countries} rows={rows} scores={scores} />}
        />
        <Route path="*" element={<Navigate to={`/country/${DEFAULT_ISO}`} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
