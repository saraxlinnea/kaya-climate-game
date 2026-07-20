import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ScoreRow } from '../types'
import {
  geometryToPath,
  MAP_VIEWBOX,
  project,
  type GeoCollection,
  type GeoFeature,
} from '../lib/geoPath'
import { MAP_POINT_MARKERS } from '../lib/mapMarkers'
import { publicUrl } from '../lib/publicUrl'
import { usePageTitle } from '../lib/usePageTitle'
import { BrandHeader } from './BrandHeader'
import { SiteFooter } from './SiteFooter'

type MetricKey =
  | 'kaya_score'
  | 'score_decarbonization'
  | 'score_prosperity'
  | 'score_efficiency'
  | 'score_clean'

const METRICS: { key: MetricKey; label: string; blurb: string }[] = [
  {
    key: 'kaya_score',
    label: 'Kaya score',
    blurb: 'Overall decoupling: prosperity growth plus emissions and intensity progress.',
  },
  {
    key: 'score_decarbonization',
    label: 'CO₂ cut',
    blurb: 'How much total CO₂ fell from 2000 to latest.',
  },
  {
    key: 'score_prosperity',
    label: 'Prosperity',
    blurb: 'GDP per capita growth component.',
  },
  {
    key: 'score_efficiency',
    label: 'Efficiency',
    blurb: 'Energy intensity improvement.',
  },
  {
    key: 'score_clean',
    label: 'Clean energy',
    blurb: 'Carbon intensity improvement.',
  },
]

/** Teal → copper: higher score = greener. */
function scoreColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t))
  const r = Math.round(196 + (15 - 196) * clamped)
  const g = Math.round(90 + (122 - 90) * clamped)
  const b = Math.round(26 + (99 - 26) * clamped)
  return `rgb(${r},${g},${b})`
}

type Props = {
  scores: ScoreRow[]
}

export function WorldMap({ scores }: Props) {
  const navigate = useNavigate()
  const [metric, setMetric] = useState<MetricKey>('kaya_score')
  const [geo, setGeo] = useState<GeoCollection | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [hover, setHover] = useState<{ iso: string; name: string; x: number; y: number } | null>(
    null,
  )
  const active = METRICS.find((m) => m.key === metric) ?? METRICS[0]
  usePageTitle('World map: Kaya Climate')

  useEffect(() => {
    let cancelled = false
    fetch(publicUrl('data/world.geojson'))
      .then((r) => {
        if (!r.ok) throw new Error(`Map data HTTP ${r.status}`)
        return r.json() as Promise<GeoCollection>
      })
      .then((data) => {
        if (!cancelled) setGeo(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load map')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const byIso = useMemo(() => {
    const map = new Map<string, ScoreRow>()
    for (const s of scores) map.set(s.iso_code, s)
    return map
  }, [scores])

  const { min, max } = useMemo(() => {
    let lo = Infinity
    let hi = -Infinity
    for (const s of scores) {
      const v = Number(s[metric])
      if (!Number.isFinite(v)) continue
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
    if (!Number.isFinite(lo)) return { min: 0, max: 100 }
    return { min: lo, max: hi === lo ? lo + 1 : hi }
  }, [scores, metric])

  const paths = useMemo(() => {
    if (!geo) return [] as { feature: GeoFeature; d: string; score: ScoreRow | undefined }[]
    return geo.features.map((feature) => ({
      feature,
      d: geometryToPath(feature.geometry),
      score: byIso.get(feature.properties.iso),
    }))
  }, [geo, byIso])

  const hoverScore = hover ? byIso.get(hover.iso) : undefined
  const windowLabel =
    scores.length > 0 ? `${scores[0].start_year} → ${scores[0].end_year}` : '2000 → latest'

  return (
    <div className="app-shell page-enter">
      <BrandHeader subtitle="A map of Champion scores. Click a country to open the explorer." />

      <section className="panel">
        <h1 className="panel-title">Decoupling around the world</h1>
        <p className="panel-note">
          Window {windowLabel}. Color shows relative {active.label.toLowerCase()} among scored
          countries, not absolute emissions. Coarse outlines omit some tiny jurisdictions. Hong Kong
          and Singapore appear as markers when they have a score.
        </p>

        <div className="filter-row" style={{ marginBottom: '0.85rem' }}>
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              className={metric === m.key ? 'filter-chip active' : 'filter-chip'}
              onClick={() => setMetric(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="muted" style={{ marginBottom: '0.75rem' }}>
          {active.blurb}
        </p>

        {loadError && <p className="error">{loadError}</p>}
        {!geo && !loadError && <p className="status">Loading map…</p>}

        {geo && (
          <div className="world-map-wrap">
            <svg
              className="world-map"
              viewBox={MAP_VIEWBOX}
              role="img"
              aria-label="World choropleth of Kaya scores"
            >
              <rect width="100%" height="100%" className="world-map-ocean" />
              {paths.map(({ feature, d, score }) => {
                const iso = feature.properties.iso
                const hasScore = score != null
                const t = hasScore ? (Number(score[metric]) - min) / (max - min) : 0
                const fill = hasScore ? scoreColor(t) : 'rgba(16, 36, 31, 0.08)'
                return (
                  <path
                    key={iso}
                    d={d}
                    fill={fill}
                    className={hasScore ? 'world-map-country scored' : 'world-map-country'}
                    tabIndex={hasScore ? 0 : undefined}
                    role={hasScore ? 'link' : undefined}
                    aria-label={
                      hasScore
                        ? `${feature.properties.name}, score ${Number(score[metric]).toFixed(0)}`
                        : feature.properties.name
                    }
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGPathElement).ownerSVGElement?.getBoundingClientRect()
                      if (!rect) return
                      setHover({
                        iso,
                        name: feature.properties.name,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      })
                    }}
                    onMouseMove={(e) => {
                      const rect = (e.target as SVGPathElement).ownerSVGElement?.getBoundingClientRect()
                      if (!rect) return
                      setHover({
                        iso,
                        name: feature.properties.name,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      })
                    }}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => {
                      if (hasScore) navigate(`/country/${iso}`)
                    }}
                    onKeyDown={(e) => {
                      if (hasScore && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        navigate(`/country/${iso}`)
                      }
                    }}
                  />
                )
              })}
              {MAP_POINT_MARKERS.map((m) => {
                const score = byIso.get(m.iso)
                if (!score) return null
                const [x, y] = project([m.lon, m.lat])
                const t = (Number(score[metric]) - min) / (max - min)
                const fill = scoreColor(t)
                return (
                  <g key={`marker-${m.iso}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={5.5}
                      fill={fill}
                      className="world-map-marker scored"
                      tabIndex={0}
                      role="link"
                      aria-label={`${m.name}, score ${Number(score[metric]).toFixed(0)}`}
                      onMouseEnter={(e) => {
                        const rect = (e.target as SVGCircleElement).ownerSVGElement?.getBoundingClientRect()
                        if (!rect) return
                        setHover({
                          iso: m.iso,
                          name: m.name,
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        })
                      }}
                      onMouseMove={(e) => {
                        const rect = (e.target as SVGCircleElement).ownerSVGElement?.getBoundingClientRect()
                        if (!rect) return
                        setHover({
                          iso: m.iso,
                          name: m.name,
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        })
                      }}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => navigate(`/country/${m.iso}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/country/${m.iso}`)
                        }
                      }}
                    />
                  </g>
                )
              })}
            </svg>

            {hover && (
              <div
                className="world-map-tooltip"
                style={{ left: hover.x + 12, top: hover.y + 12 }}
              >
                <strong>{hoverScore?.country ?? hover.name}</strong>
                {hoverScore ? (
                  <span>
                    {active.label}: {Number(hoverScore[metric]).toFixed(1)}
                  </span>
                ) : (
                  <span>No Kaya score (eligibility or data gap)</span>
                )}
              </div>
            )}

            <div className="world-map-legend" aria-hidden>
              <span>Lower</span>
              <div className="world-map-legend-bar" />
              <span>Higher</span>
            </div>
          </div>
        )}

        <p className="muted" style={{ marginTop: '0.85rem' }}>
          Prefer a table?{' '}
          <Link className="country-link" to="/rankings">
            Open the leaderboard
          </Link>
          .
        </p>
      </section>

      <SiteFooter />
    </div>
  )
}
