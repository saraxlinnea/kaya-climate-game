import { Link } from 'react-router-dom'
import type { ScoreRow } from '../types'

const PARTS: { key: keyof ScoreRow; label: string }[] = [
  { key: 'score_decarbonization', label: 'Cutting CO₂' },
  { key: 'score_prosperity', label: 'Raising income' },
  { key: 'score_efficiency', label: 'Using less energy per $' },
  { key: 'score_clean', label: 'Cleaning the energy mix' },
]

type Props = {
  score: ScoreRow | undefined
}

export function ScorePanel({ score }: Props) {
  if (!score) {
    return (
      <section className="panel">
        <h2 className="panel-title">Kaya Champion score</h2>
        <p className="panel-note">
          This country is not scored under the default eligibility rules (population and emissions
          size in 2000). See Methods for details.
        </p>
        <p className="muted">
          <Link className="country-link" to="/rankings">
            View the leaderboard
          </Link>
        </p>
      </section>
    )
  }

  return (
    <section className="panel">
      <h2 className="panel-title">Kaya Champion score</h2>
      <p className="panel-note">
        Our site score for {score.start_year} to {score.end_year}. It rewards cutting emissions while
        raising income and improving intensity. It is not a ranking of lowest absolute emissions or
        of how clean the country is today.{' '}
        <Link className="country-link" to="/rankings">
          Full rankings
        </Link>
      </p>
      <div className="score-hero">
        <strong>{score.kaya_score.toFixed(0)}</strong>
        <span>/ 100</span>
      </div>
      <div className="score-bars">
        {PARTS.map(({ key, label }) => {
          const value = Number(score[key])
          return (
            <div className="score-row" key={key}>
              <span>{label}</span>
              <div className="score-track" aria-hidden>
                <div
                  className="score-fill"
                  style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
              </div>
              <output>{value.toFixed(0)}</output>
            </div>
          )
        })}
      </div>
    </section>
  )
}
