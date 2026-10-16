import { create } from 'zustand'
import type { ReleaseNotes } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/updatesvc/models.ts'

// The release the What's new dialog shows; fallback is the notes the updater already holds, used when GitHub is
// unreachable, and earlier the releases skipped since Mortar last ran, newest first.
export const useWhatsNew = create<{
  version: string
  fallback: string
  earlier: ReleaseNotes[]
} | null>(() => null)

export function showWhatsNew(version: string, fallback = '', earlier: ReleaseNotes[] = []): void {
  useWhatsNew.setState({ version, fallback, earlier }, true)
}
