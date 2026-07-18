import createPlotlyComponent from 'react-plotly.js/factory'
import Plotly from 'plotly.js/dist/plotly.min.js'
import type { KayaRow } from '../types'

const Plot = createPlotlyComponent(Plotly)

const layoutBase = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { family: 'IBM Plex Sans, sans-serif', color: '#10241f', size: 12 },
  margin: { t: 36, r: 16, b: 40, l: 52 },
  hovermode: 'x unified' as const,
}

type Props = {
  series: KayaRow[]
  country: string
}

export function EmissionsChart({ series, country }: Props) {
  return (
    <div className="chart-wrap">
      <Plot
        data={[
          {
            x: series.map((r) => r.year),
            y: series.map((r) => r.co2),
            type: 'scatter',
            mode: 'lines',
            name: 'CO₂',
            line: { color: '#c45a1a', width: 2.5 },
            hovertemplate: '%{x}: %{y:.1f} Mt<extra></extra>',
          },
        ]}
        layout={{
          ...layoutBase,
          title: { text: `${country} — annual CO₂`, font: { size: 14 } },
          yaxis: { title: { text: 'Mt CO₂' }, gridcolor: 'rgba(16,36,31,0.08)' },
          xaxis: { gridcolor: 'rgba(16,36,31,0.08)' },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler
      />
    </div>
  )
}

export function FactorsChart({ series, country }: Props) {
  const years = series.map((r) => r.year)
  const norm = (values: number[]) => {
    const base = values[0]
    return values.map((v) => (v / base) * 100)
  }

  return (
    <div className="chart-wrap">
      <Plot
        data={[
          {
            x: years,
            y: norm(series.map((r) => r.population)),
            type: 'scatter',
            mode: 'lines',
            name: 'Population',
            line: { color: '#4C78A8', width: 2 },
          },
          {
            x: years,
            y: norm(series.map((r) => r.gdp_per_capita)),
            type: 'scatter',
            mode: 'lines',
            name: 'GDP/capita',
            line: { color: '#F58518', width: 2 },
          },
          {
            x: years,
            y: norm(series.map((r) => r.energy_intensity)),
            type: 'scatter',
            mode: 'lines',
            name: 'Energy intensity',
            line: { color: '#54A24B', width: 2 },
          },
          {
            x: years,
            y: norm(series.map((r) => r.carbon_intensity)),
            type: 'scatter',
            mode: 'lines',
            name: 'Carbon intensity',
            line: { color: '#E45756', width: 2 },
          },
        ]}
        layout={{
          ...layoutBase,
          title: {
            text: `${country} — Kaya factors (indexed to start = 100)`,
            font: { size: 14 },
          },
          yaxis: { title: { text: 'Index' }, gridcolor: 'rgba(16,36,31,0.08)' },
          xaxis: { gridcolor: 'rgba(16,36,31,0.08)' },
          legend: { orientation: 'h', y: -0.2 },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler
      />
    </div>
  )
}
