/** SVG CO₂ monster: body parts drop as emissions pressure falls; fill color tracks pressure. */

import type { CSSProperties } from 'react'

type Props = {
  pressure: number
  scale: number
}

const WIN_ZONE = 60
const BASE_W = 140
const BASE_H = 163

/** High pressure → copper; low pressure → teal (same family as the meter). */
export function pressureFill(pressure: number): string {
  const p = Math.max(0, Math.min(1.15, pressure / 100))
  const t = Math.min(1, p)
  const r = Math.round(15 + (196 - 15) * t)
  const g = Math.round(122 + (90 - 122) * t)
  const b = Math.round(99 + (26 - 99) * t)
  return `rgb(${r}, ${g}, ${b})`
}

export function MonsterFigure({ pressure, scale }: Props) {
  const fill = pressureFill(pressure)
  const showArmL = pressure >= 90
  const showArmR = pressure >= 80
  const showLegL = pressure >= 70
  const showLegR = pressure >= 60
  const showTorso = pressure >= 52
  const limp = pressure <= WIN_ZONE
  const width = Math.round(BASE_W * scale)
  const height = Math.round(BASE_H * scale)

  return (
    <div
      className={`monster-figure-wrap${limp ? ' limp' : ''}`}
      style={{ ['--monster-fill']: fill } as CSSProperties}
      aria-hidden
    >
      <svg
        className="monster-figure"
        viewBox="0 0 120 140"
        width={width}
        height={height}
        role="presentation"
      >
        {showLegL && (
          <rect className="monster-part" x="38" y="95" width="14" height="36" rx="4" />
        )}
        {showLegR && (
          <rect className="monster-part" x="68" y="95" width="14" height="36" rx="4" />
        )}
        {showArmL && (
          <rect
            className="monster-part"
            x="12"
            y="48"
            width="22"
            height="12"
            rx="4"
            transform="rotate(-18 23 54)"
          />
        )}
        {showArmR && (
          <rect
            className="monster-part"
            x="86"
            y="48"
            width="22"
            height="12"
            rx="4"
            transform="rotate(18 97 54)"
          />
        )}
        {showTorso && (
          <rect className="monster-part monster-torso" x="34" y="42" width="52" height="56" rx="8" />
        )}
        <rect className="monster-part monster-stack" x="52" y="4" width="16" height="18" rx="2" />
        <rect className="monster-part monster-stack-cap" x="48" y="2" width="24" height="6" rx="2" />
        <rect className="monster-part monster-head" x="30" y="18" width="60" height="32" rx="6" />
        <circle className="monster-eye-dot" cx="48" cy="34" r="4" />
        <circle className="monster-eye-dot" cx="72" cy="34" r="4" />
        <rect className="monster-mouth-bar" x="50" y="42" width="20" height="5" rx="1" />
      </svg>
      <p className="monster-figure-hint">
        {pressure >= 90
          ? 'Fully formed. Pressure is high.'
          : pressure >= 60
            ? 'Losing limbs as pressure falls.'
            : 'Win zone. The monster is falling apart.'}
      </p>
    </div>
  )
}
