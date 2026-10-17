import { useEffect, useState } from 'react'
import { Runs } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/launchsvc/service.ts'
import type { Profile } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'
import type { Played } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/settings/models.ts'
import { runBackgroundBadgeChecks } from '../mods/badgeDisplay.ts'
import { useBadges } from '../mods/badges.ts'
import { useSettings } from '../settings/store.ts'

export function useProfileCardsMeta(
  gameId: string,
  profiles: Profile[],
  visible: Profile[],
  lastPlayed: Played | undefined,
) {
  const sidebarBadges = useSettings((s) => s.sidebarBadges)
  const backgroundBadgeChecks = useSettings((s) => s.backgroundBadgeChecks)
  const loadBadges = useBadges((s) => s.loadAll)
  const [runStarted, setRunStarted] = useState<Record<string, string>>({})
  const stamp = visible.map((p) => p.id).join(',')

  useEffect(() => {
    if (!(stamp && runBackgroundBadgeChecks(sidebarBadges, backgroundBadgeChecks))) {
      return
    }
    loadBadges(gameId, profiles, '').catch(() => {
      // Badges stay empty; opening the profile reports failures.
    })
  }, [gameId, profiles, loadBadges, stamp, sidebarBadges, backgroundBadgeChecks])

  // Keyed on the ids and the last-played fields: the visible cards are a fresh slice every render, and loading on each
  // one called Runs for every card in a loop.
  const playedProfile = lastPlayed?.profile ?? ''
  const playedAt = lastPlayed?.at ?? ''
  useEffect(() => {
    if (!stamp) {
      return
    }
    let cancelled = false
    const load = async () => {
      const next: Record<string, string> = {}
      for (const id of stamp.split(',')) {
        if (playedProfile === id && playedAt) {
          next[id] = playedAt
        } else {
          try {
            const runs = await Runs(gameId, id)
            const started = runs?.[0]?.started ?? ''
            if (started) {
              next[id] = started
            }
          } catch {
            // Omit last played for this card when runs cannot be read.
          }
        }
      }
      if (!cancelled) {
        setRunStarted(next)
      }
    }
    load().catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [gameId, stamp, playedProfile, playedAt])

  return runStarted
}
