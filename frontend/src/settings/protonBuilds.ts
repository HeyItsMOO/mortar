import { useEffect, useState } from 'react'
import { ProtonBuilds } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/game/service.ts'
import { reportUnexpected } from '../toasts/report.ts'

// The Proton builds Steam has that the game's copy could run through; none unless it is a Windows copy outside Steam
// on Linux.
export function useProtonBuilds(game: string): string[] {
  const [builds, setBuilds] = useState<string[]>([])
  useEffect(() => {
    if (game === '') {
      return
    }
    ProtonBuilds(game)
      .then((b) => setBuilds(b ?? []))
      .catch(reportUnexpected)
  }, [game])
  return builds
}
