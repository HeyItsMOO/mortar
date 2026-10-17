export interface ShareInclude {
  disabledMods: boolean
  fomodChoices: boolean
  notes: boolean
  configFiles: boolean
  problemChoices: boolean
  libraries: boolean
}

export function shareIncludeDefaults(s: {
  shareIncludeDisabledMods?: boolean | null
  shareIncludeFomodChoices?: boolean | null
  shareIncludeNotes?: boolean | null
  shareIncludeConfigFiles?: boolean | null
  shareIncludeProblemChoices?: boolean | null
  shareIncludeLibraries?: boolean | null
}): ShareInclude {
  return {
    disabledMods: s.shareIncludeDisabledMods === true,
    fomodChoices: s.shareIncludeFomodChoices !== false,
    notes: s.shareIncludeNotes !== false,
    configFiles: s.shareIncludeConfigFiles !== false,
    problemChoices: s.shareIncludeProblemChoices !== false,
    libraries: s.shareIncludeLibraries !== false,
  }
}

export function toShareInclude(value: ShareInclude) {
  return {
    disabledMods: value.disabledMods,
    fomodChoices: value.fomodChoices,
    notes: value.notes,
    configFiles: value.configFiles,
    problemChoices: value.problemChoices,
    libraries: value.libraries,
  }
}

// FOMOD choices exist only on entries installed through a FOMOD installer; with none, the option has nothing to carry.
export function offersFomod(
  entries: readonly { fomod?: object | null }[] | null | undefined,
): boolean {
  return (entries ?? []).some((e) => Object.keys(e.fomod ?? {}).length > 0)
}
