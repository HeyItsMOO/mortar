import { expect, test } from 'bun:test'
import { cachedPictureSrc, pictureSrc } from './pictureSrc.ts'

test('pictureSrc routes a remote picture through the local cache, escaped', () => {
  expect(pictureSrc('https://cdn.modrinth.com/data/a b/icon.png?x=1')).toBe(
    '/mod-picture/?u=https%3A%2F%2Fcdn.modrinth.com%2Fdata%2Fa%20b%2Ficon.png%3Fx%3D1',
  )
})

test('cachedPictureSrc refuses a host the picture cache does not fetch', () => {
  expect(cachedPictureSrc('https://evil.example/a.png')).toBeUndefined()
  expect(cachedPictureSrc('https://cdn.modrinth.com/data/x/icon.png')).toBe(
    '/mod-picture/?u=https%3A%2F%2Fcdn.modrinth.com%2Fdata%2Fx%2Ficon.png',
  )
})
