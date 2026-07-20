import type { HistoryCompare } from '../game/historyCompare'
import { formatSignedPct } from '../game/historyCompare'

type Props = {
  compare: HistoryCompare
}

export function HistoryComparePanel({ compare }: Props) {
  return (
    <section className="panel compare-panel">
      <h2 className="panel-title">Your run vs history</h2>
      <p className="panel-note">
        Player path ({compare.playerWindow}) vs real recorded change ({compare.historyWindow}).
        Illustrative only. Not a detailed forecast.
      </p>

      <table className="compare-table">
        <thead>
          <tr>
            <th scope="col">Metric</th>
            <th scope="col">You</th>
            <th scope="col">History</th>
          </tr>
        </thead>
        <tbody>
          {compare.metrics.map((m) => (
            <tr key={m.key}>
              <td>{m.label}</td>
              <td className={m.playerPct < 0 ? 'delta-neg' : m.playerPct > 0 ? 'delta-pos' : undefined}>
                {formatSignedPct(m.playerPct)}
              </td>
              <td
                className={m.historyPct < 0 ? 'delta-neg' : m.historyPct > 0 ? 'delta-pos' : undefined}
              >
                {formatSignedPct(m.historyPct)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="narrative-result" style={{ marginTop: '1rem' }}>
        {compare.summary}
      </p>
    </section>
  )
}
