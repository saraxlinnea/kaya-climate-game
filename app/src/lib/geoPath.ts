/** Minimal GeoJSON → SVG path (equirectangular). No d3 dependency. */

export type Position = [number, number]
export type Ring = Position[]
export type Polygon = Ring[]
export type MultiPolygon = Polygon[]

export type GeoGeometry =
  | { type: 'Polygon'; coordinates: Polygon }
  | { type: 'MultiPolygon'; coordinates: MultiPolygon }

export type GeoFeature = {
  type: 'Feature'
  properties: { iso: string; name: string }
  geometry: GeoGeometry | null
}

export type GeoCollection = {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

const WIDTH = 960
const HEIGHT = 480

export function project([lon, lat]: Position): Position {
  const x = ((lon + 180) / 360) * WIDTH
  const y = ((90 - lat) / 180) * HEIGHT
  return [x, y]
}

function ringPath(ring: Ring): string {
  if (ring.length === 0) return ''
  const [x0, y0] = project(ring[0])
  let d = `M${x0.toFixed(1)},${y0.toFixed(1)}`
  for (let i = 1; i < ring.length; i++) {
    const [x, y] = project(ring[i])
    d += `L${x.toFixed(1)},${y.toFixed(1)}`
  }
  return `${d}Z`
}

export function geometryToPath(geometry: GeoGeometry | null): string {
  if (!geometry) return ''
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map(ringPath).join('')
  }
  return geometry.coordinates.flatMap((poly) => poly.map(ringPath)).join('')
}

export const MAP_VIEWBOX = `0 0 ${WIDTH} ${HEIGHT}`
export const MAP_WIDTH = WIDTH
export const MAP_HEIGHT = HEIGHT
