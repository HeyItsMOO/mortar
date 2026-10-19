import React from 'react'
import { SystemAccent } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/settings/service.ts'
import { type AccentName, accents, defaultAccent } from '../theme/accents.ts'

export const SYSTEM_ACCENT = 'system'

export function isAccent(value: string): value is AccentName {
  return value in accents
}

/** The accent colour for a stored accent choice; "system" takes the desktop's colour when it gave one. */
export function accentColour(accent: string, system: string): string {
  if (accent === SYSTEM_ACCENT && system !== '') {
    return system
  }
  return accents[isAccent(accent) ? accent : defaultAccent]
}

/** The desktop's accent colour as "#rrggbb", empty until read or when the desktop has none. */
export function useSystemAccent(): string {
  const [colour, setColour] = React.useState('')
  React.useEffect(() => {
    SystemAccent()
      .then(setColour)
      .catch(() => setColour(''))
  }, [])
  return colour
}
