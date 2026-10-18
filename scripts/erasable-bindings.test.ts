import { expect, test } from 'bun:test'
import { rewriteEnums } from './erasable-bindings.ts'

test('rewriteEnums turns a generated string enum into a const object', () => {
  const out = rewriteEnums(`export enum Hint {
    $zero = "",
    HintSteam = "steam",
};
`)
  expect(out).toContain('export const Hint = {')
  expect(out).toContain('$zero: ""')
  expect(out).toContain('HintSteam: "steam"')
  expect(out).toContain('export type Hint = (typeof Hint)[keyof typeof Hint]')
  expect(out).not.toContain('export enum')
})
