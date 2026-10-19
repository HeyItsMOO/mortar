import { expect, test } from 'bun:test'
import type { Result } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/problems/models.ts'
import { problemCount, problemsOf } from './lookup.ts'
import { problemSections } from './problemGroups.ts'

const result = {
  longPaths: [
    { key: 'nexus-1-2', name: 'Pack', files: 1, longest: 'x', length: 270, placed: false },
  ],
} as Result

test('a mod with a path too long for Windows is a counted problem with its own section', () => {
  expect(problemsOf(result).map((p) => p.kind)).toEqual(['longPath'])
  expect(problemCount(result)).toBe(1)
  expect(problemSections(result).map((s) => s.id)).toEqual(['longPaths'])
})
