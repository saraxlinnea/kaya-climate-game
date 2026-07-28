import { useState } from 'react'
import type { RunReport } from '../game/reportCard'

type Props = {
  report: RunReport
}

export function RunReportPanel({ report }: Props) {
  const [copied, setCopied] = useState(false)

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(report.shareText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="panel report-panel">
      <h2 className="panel-title">Run report</h2>
      <p className="modeled-banner compact" role="note">
        Modeled / satirical · Pressure and prosperity below are game indices, not forecasts
      </p>
      <p className="panel-note">{report.outcome}</p>

      <div className="report-stats">
        <div>
          <span className="muted">
            Pressure <span className="modeled-badge">Modeled estimate</span>
          </span>
          <strong>{report.pressure.toFixed(0)}</strong>
        </div>
        <div>
          <span className="muted">
            Prosperity <span className="modeled-badge">Modeled estimate</span>
          </span>
          <strong>{report.prosperity.toFixed(0)}</strong>
        </div>
        <div>
          <span className="muted">Turns</span>
          <strong>{report.turns}</strong>
        </div>
      </div>

      <p className="report-strategy">{report.strategyLine}</p>

      {report.badges.length > 0 && (
        <ul className="badge-list">
          {report.badges.map((b) => (
            <li key={b.id}>
              <strong>{b.label}</strong>
              <span>{b.detail}</span>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="filter-chip" onClick={copyShare}>
        {copied ? 'Copied' : 'Copy summary'}
      </button>
    </section>
  )
}
