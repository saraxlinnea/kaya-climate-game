import type { ScoreRow } from '../types'

const PARTS: { key: keyof ScoreRow; label: string }[] = [
  { key: 'score_decarbonization', label: 'Decarbonization' },
  { key: 'score_prosperity', label: 'Prosperity' },
  { key: 'score_efficiency', label: 'Efficiency' },
  { key: 'score_clean', label: 'Clean energy' },
]

type Props = {
  score: ScoreRow | undefined
}

export function ScorePanel({ score }: Props) {
  if (!score) {
    return (
      <section className="panel">
        <h2 className="panel-title">Kaya Score</h2>
        <p className="panel-note">
          No score for this country under the default eligibility rules (see SCORING.md).
        </p>
      </section>
    )
  }

  return (
    <section className="panel">
      <h2 className="panel-title">Kaya Score</h2>
      <p className="panel-note">
        Decoupling score for {score.start_year}–{score.end_year} (not “lowest emissions”).
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
                <div className="score-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
              </div>
              <output>{value.toFixed(0)}</output>
            </div>
          )
        })}
      </div>
    </section>
  )
}
