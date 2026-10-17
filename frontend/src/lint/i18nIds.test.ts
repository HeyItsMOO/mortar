import { expect, test } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { transform } from '@lingui/native-tools'
import { messages } from '../locales/en/messages.ts'

const SRC = join(import.meta.dir, '..')

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((ent) => {
    const p = join(dir, ent.name)
    if (ent.isDirectory()) {
      return ent.name === 'locales' ? [] : walk(p)
    }
    return /\.tsx?$/.test(ent.name) && !/\.test\.tsx?$/.test(ent.name) ? [p] : []
  })
}

// Runs every file through the macro transform the production build uses, so a
// message the build looks up under an id the catalog lacks shows here, not as a
// raw id on screen.
test('every message id the build emits is in the catalog, and no macro is left untransformed', async () => {
  const problems: string[] = []
  for (const file of walk(SRC)) {
    const code = readFileSync(file, 'utf8')
    if (!code.includes('@lingui/') || !code.includes('/macro')) {
      continue
    }
    const out = (await transform(code, file, { macro: { descriptorFields: 'id-only' } })).code
    const name = relative(SRC, file)
    for (const [, id] of out.matchAll(/\bid: "([^"]+)"/g)) {
      if (id === undefined || !(id in messages)) {
        problems.push(`${name}: id ${id} is not in the catalog`)
      }
    }
    if (/\$__`|(?<![\w$.])(t|msg)`/.test(out)) {
      problems.push(`${name}: a t or msg template is nested in another and was not transformed`)
    }
  }
  expect(problems).toEqual([])
})
