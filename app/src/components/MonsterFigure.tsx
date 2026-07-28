/** SVG CO₂ monster: body parts drop as emissions pressure falls; fill color tracks pressure. */

import type { CSSProperties } from 'react'

type Props = {
  pressure: number
  scale: number
  /** Combat caption under the figure. Default true. */
  showHint?: boolean
}

const WIN_ZONE = 60
const BASE_W = 148
const BASE_H = 172

/** High pressure → copper; low pressure → teal (same family as the meter). */
export function pressureFill(pressure: number): string {
  const p = Math.max(0, Math.min(1.15, pressure / 100))
  const t = Math.min(1, p)
  const r = Math.round(15 + (196 - 15) * t)
  const g = Math.round(122 + (90 - 122) * t)
  const b = Math.round(99 + (26 - 99) * t)
  return `rgb(${r}, ${g}, ${b})`
}

export function MonsterFigure({ pressure, scale, showHint = true }: Props) {
  const fill = pressureFill(pressure)
  const showArmL = pressure >= 90
  const showArmR = pressure >= 80
  const showLegL = pressure >= 70
  const showLegR = pressure >= 60
  const showTorso = pressure >= 52
  const limp = pressure <= WIN_ZONE
  const highPressure = pressure >= 85
  const width = Math.round(BASE_W * scale)
  const height = Math.round(BASE_H * scale)

  return (
    <div
      className={`monster-figure-wrap${limp ? ' limp' : ''}${highPressure ? ' menace' : ''}`}
      style={{ ['--monster-fill']: fill } as CSSProperties}
      aria-hidden
    >
      <svg
        className="monster-figure"
        viewBox="0 0 120 150"
        width={width}
        height={height}
        role="presentation"
      >
        <rect className="monster-part monster-stack" x="54" y="10" width="12" height="14" rx="2" />
        <rect className="monster-part monster-stack-cap" x="50" y="6" width="20" height="6" rx="2" />

        {/* Soft devil horns */}
        <path className="monster-part monster-horn" d="M38 26 L32 14 L46 24 Z" />
        <path className="monster-part monster-horn" d="M82 26 L88 14 L74 24 Z" />

        {/* Wings behind torso */}
        {showArmL && (
          <path
            className="monster-part monster-wing"
            d="M40 52
               L28 38
               L10 44
               L16 52
               L12 62
               L26 56
               L38 58 Z"
            opacity={0.82}
          />
        )}
        {showArmR && (
          <path
            className="monster-part monster-wing"
            d="M80 52
               L92 38
               L110 44
               L104 52
               L108 62
               L94 56
               L82 58 Z"
            opacity={0.82}
          />
        )}

        {/* Legs under hip (no live rotate — CSS transform-origin breaks SVG pivots) */}
        {showLegL && (
          <g className="monster-part">
            <rect className="monster-leg" x="46" y="105" width="12" height="31" rx="3" />
            <path className="monster-hoof" d="M46 134 L43 141 L52 138 L61 141 L58 134 Z" />
          </g>
        )}
        {showLegR && (
          <g className="monster-part">
            <rect className="monster-leg" x="62" y="105" width="12" height="31" rx="3" />
            <path className="monster-hoof" d="M62 134 L59 141 L68 138 L77 141 L74 134 Z" />
          </g>
        )}

        {/* Flat-ish hip */}
        {showTorso && (
          <path
            className="monster-part monster-torso"
            d="M38 52
               Q60 50 82 52
               L86 78
               L80 100
               L76 108
               L44 108
               L40 100
               L34 78 Z"
          />
        )}

        {/* Arms: baked angles; inner edge overlaps torso ~2–3px (no live rotate) */}
        {showArmL && (
          <path
            className="monster-part monster-arm"
            d="M6 61 L39 54 L41 64 L8 72 Z"
          />
        )}
        {showArmR && (
          <path
            className="monster-part monster-arm"
            d="M81 54 L114 61 L112 72 L79 64 Z"
          />
        )}

        {/* Head on top */}
        <path
          className="monster-part monster-head"
          d="M32 28
             Q36 20 60 20
             Q84 20 88 28
             L86 48
             Q60 54 34 48 Z"
        />

        <circle className="monster-eye-dot" cx="48" cy="36" r="5" />
        <circle className="monster-eye-dot" cx="72" cy="36" r="5" />

        <rect className="monster-mouth-bar" x="51" y="44" width="18" height="4" rx="1.5" />
      </svg>
      {showHint ? (
        <p className="monster-figure-hint">
          {pressure >= 90
            ? 'Fully formed. Pressure is high.'
            : pressure >= 60
              ? 'Losing limbs as pressure falls.'
              : 'Win zone. The monster is falling apart.'}
        </p>
      ) : null}
    </div>
  )
}
