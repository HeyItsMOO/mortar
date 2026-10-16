import { parseInstructions } from '../share/instructions.ts'

export type NoteLine = ReturnType<typeof parseInstructions>[number]
export type NoteKind = 'new' | 'changed' | 'fixed'

interface NoteItem {
  kind: NoteKind
  line: NoteLine
}

/** A group of a release's notes: an area ("### Games") holding new and fixed lines, or, for notes written without
 * areas, one of the New, Changed and Fixed lists (byKind). */
export interface NoteArea {
  title: string
  byKind: boolean
  items: NoteItem[]
}

const HEADING = /^(#{2,3})\s*(.*)$/
const BULLET = /^[-*]\s+/
const KIND_ORDER: NoteKind[] = ['new', 'changed', 'fixed']

const kindOf = (title: string): NoteKind | undefined =>
  KIND_ORDER.find((k) => k === title.trim().toLowerCase())

const firstText = (line: NoteLine) => line.parts[0]?.text ?? ''

/** Splits release notes Markdown (the shape build/release/notes.sh writes) into areas and the closing paragraphs. */
export function groupNotes(text: string): { areas: NoteArea[]; extra: NoteLine[] } {
  const areas: NoteArea[] = []
  const extra: NoteLine[] = []
  let kind: NoteKind | undefined
  let area: NoteArea | undefined
  const areaNamed = (title: string, byKind: boolean) => {
    let found = areas.find((a) => a.title === title && a.byKind === byKind)
    if (!found) {
      found = { title, byKind, items: [] }
      areas.push(found)
    }
    return found
  }
  for (const line of parseInstructions(text)) {
    const heading = HEADING.exec(firstText(line))
    if (heading) {
      const [, marks, title = ''] = heading
      if (marks === '##') {
        kind = kindOf(title)
        area = undefined
      } else if (kind) {
        area = areaNamed(title.trim(), false)
      }
      continue
    }
    if (BULLET.test(firstText(line)) && kind) {
      const target = area ?? areaNamed(kind, true)
      target.items.push({ kind, line })
      continue
    }
    if (line.parts.some((p) => p.text.trim() !== '')) {
      extra.push(line)
    }
  }
  for (const a of areas) {
    a.items.sort((x, y) => KIND_ORDER.indexOf(x.kind) - KIND_ORDER.indexOf(y.kind))
  }
  return { areas, extra }
}
