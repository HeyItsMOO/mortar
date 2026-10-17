import type { Mod } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/savedgroups/models.ts'
import type { Want } from '../queue/actions.ts'

// The download for one saved group mod; a mod with no Nexus or GitHub source cannot be fetched.
function savedGroupModWant({ name, source, implicit }: Mod): Want | null {
  const reason = implicit ? { implicit: true } : {}
  if (source.kind === 'nexus' && source.modId) {
    return {
      kind: 'install',
      ...reason,
      name,
      modId: source.modId,
      fileId: source.fileId ?? 0,
      version: source.version ?? '',
    }
  }
  if (source.kind === 'github' && source.repo) {
    return {
      kind: 'install',
      ...reason,
      name,
      repo: source.repo,
      tag: source.tag ?? '',
      asset: source.asset ?? '',
      version: source.version ?? '',
    }
  }
  return null
}

// Downloads for saved group or template mods the store no longer holds, one per archive.
export function savedGroupWants(mods: Mod[] | null | undefined): Want[] {
  const wants = new Map<string, Want>()
  for (const mod of mods ?? []) {
    const want = wants.has(mod.entryKey) ? null : savedGroupModWant(mod)
    if (want) {
      wants.set(mod.entryKey, want)
    }
  }
  return [...wants.values()]
}
