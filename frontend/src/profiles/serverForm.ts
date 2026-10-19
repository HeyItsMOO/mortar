import type { ServerSetting } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/packsvc/models.ts'

export type ServerFieldError = 'required' | 'invalid'

// The catalog's pattern must match the whole value (the Go side anchors it the same way). A pattern the browser cannot
// read is left to the backend, which rejects a bad value on save.
const anchored = (pattern: string) => {
  try {
    return new RegExp(`^(?:${pattern})$`, 'u')
  } catch {
    return
  }
}

// What is wrong with value for a server setting, or undefined. Empty is fine unless the setting is required and
// nothing is saved yet: empty means "use the default" (or, for a saved secret, "keep it").
export function serverFieldError(
  setting: ServerSetting,
  value: string,
): ServerFieldError | undefined {
  if (value === '') {
    return setting.required && !setting.default && !setting.set && setting.value === ''
      ? 'required'
      : undefined
  }
  if (setting.pattern && !anchored(setting.pattern)?.test(value)) {
    return 'invalid'
  }
  return undefined
}

// Whether committing draft changes anything: a secret's saved value is never shown, so any typed text is a change.
export function serverFieldChanged(setting: ServerSetting, draft: string): boolean {
  return setting.secret ? draft !== '' : draft !== setting.value
}
