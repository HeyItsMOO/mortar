import type { Profile } from '../../bindings/github.com/Rethunk-Tech/mortar/internal/profile/models.ts'

// The reason the app writes on the pins a freeze makes (profile.FrozenPinReason).
const FROZEN_PIN_REASON = 'Frozen with the profile'

/** Whether the profile is frozen: every mod is held at its version, and a freeze made at least one of the holds. */
function isFrozen(profile: Profile | null | undefined): boolean {
  const entries = (profile?.entries ?? []).filter((e) => !e.overlayOf)
  return (
    entries.length > 0 &&
    entries.every((e) => e.pinned) &&
    entries.some((e) => e.pinReason === FROZEN_PIN_REASON)
  )
}

export { isFrozen }
