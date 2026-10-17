import { useLayoutEffect } from 'react'
import { create } from 'zustand'
import { prefMatches } from './prefFilter.ts'

// The settings search, held outside React so each row selects only its own answer: typing re-renders the rows whose
// match changed, not every row on the page.
const useSettingsQuery = create<{ query: string }>(() => ({ query: '' }))

export function useSettingsSearch(): string {
  return useSettingsQuery((s) => s.query)
}

export function useSettingsSearching(): boolean {
  return useSettingsQuery((s) => s.query.trim() !== '')
}

export function useSettingsMatch(label: string, description = ''): boolean {
  return useSettingsQuery((s) => prefMatches(s.query, label, description))
}

export const setSettingsQuery = (query: string) => useSettingsQuery.setState({ query })

/** The shell's query: starts at initial and clears when the shell closes. */
export function useShellQuery(initial: string): string {
  useLayoutEffect(() => {
    setSettingsQuery(initial)
    return () => setSettingsQuery('')
  }, [initial])
  return useSettingsSearch()
}
