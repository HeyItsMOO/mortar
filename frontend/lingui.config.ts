import { defineConfig } from '@lingui/conf'
import { createSwcExtractor } from '@lingui/native-tools'
import { availableLocales } from './src/i18n/locales.ts'

export default defineConfig({
  sourceLocale: 'en',
  orderBy: 'messageId',
  locales: [...availableLocales],
  extractors: [createSwcExtractor()],
  catalogs: [{ path: '<rootDir>/src/locales/{locale}/messages', include: ['src'] }],
})
