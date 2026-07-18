/// <reference types="vite/client" />

declare module 'plotly.js/dist/plotly.min.js' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Plotly: any
  export default Plotly
}

declare module 'react-plotly.js/factory' {
  import type { PlotParams } from 'react-plotly.js'
  import type { ComponentType } from 'react'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default function createPlotlyComponent(plotly: any): ComponentType<PlotParams>
}
