import { useEffect, useRef, useState } from 'react'
import type { GameInfo } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/game/models.ts'
import { isTypingTarget } from '../settings/shortcuts.ts'
import { TYPE_RESET_MS, typedKey, typedMatch } from '../shell/typeahead.ts'

type Game = GameInfo

// The list is virtual: with every catalog game mounted, scrolling through them all kept each row's decoded art.
export type Item =
  | { kind: 'heading'; key: string; label: string; count: number }
  | { kind: 'game'; key: string; game: Game }

export function listItems(groups: { label: string; games: Game[] }[]): Item[] {
  const out: Item[] = []
  for (const { label, games } of groups) {
    if (games.length > 0) {
      out.push({ kind: 'heading', key: `h:${label}`, label, count: games.length })
      for (const game of games) {
        out.push({ kind: 'game', key: game.id, game })
      }
    }
  }
  return out
}

// Typing a hidden game's name shows the hidden games first, then scrolls to the game once the list holds it.
export function useFindGame(args: {
  hidden: readonly string[] | null | undefined
  showHidden: boolean
  setShowHidden: (show: boolean) => void
  listed: (id: string) => boolean
  reveal: (id: string) => void
}) {
  const latest = useRef(args)
  latest.current = args
  const [want, setWant] = useState('')
  useEffect(() => {
    if (want !== '' && latest.current.listed(want)) {
      latest.current.reveal(want)
      setWant('')
    }
  }, [want])
  return (id: string) => {
    if (args.hidden?.includes(id) && !args.showHidden) {
      args.setShowHidden(true)
      setWant(id)
      return
    }
    args.reveal(id)
  }
}

// Typing a game's name anywhere on the page jumps to it. The listener reads the list through a ref so the letters
// typed so far survive the page's re-renders.
export function useTypeToScroll(games: Game[], reveal: (id: string) => void) {
  const list = useRef({ games, reveal })
  list.current = { games, reveal }
  useEffect(() => {
    let typed = ''
    let at = 0
    const onKey = (e: KeyboardEvent) => {
      const { target } = e
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.key.length !== 1 ||
        isTypingTarget(target instanceof HTMLElement ? target : null) ||
        document.querySelector('[role="dialog"], [role="menu"]')
      ) {
        return
      }
      const fresh = e.timeStamp - at > TYPE_RESET_MS
      if (!typedKey(e.key)) {
        // A space inside a name being typed would otherwise press the row that typing just focused.
        if (e.key === ' ' && !fresh) {
          e.preventDefault()
        }
        return
      }
      typed = fresh ? e.key : typed + e.key
      at = e.timeStamp
      const hit = typedMatch(list.current.games, typed, (g) => g.name)
      if (hit) {
        list.current.reveal(hit.id)
      }
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [])
}
