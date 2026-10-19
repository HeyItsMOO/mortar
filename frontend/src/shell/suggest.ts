import { create } from 'zustand'

export const useSuggest = create<{ open: boolean }>(() => ({ open: false }))

// Opens the Suggest a feature dialog, which sends the idea to Discord or GitHub.
export function suggestFeature(): void {
  useSuggest.setState({ open: true })
}
