import { useLingui } from '@lingui/react/macro'
import { IconButton } from '@mui/material'
import { Star } from 'lucide-react'
import { useCurrentGame } from '../nav/currentGame.ts'
import { setStarred, useStarred } from './favourites.ts'

const SIZE = 15

// The star on a mod: filled when the game stars the mod, a click toggles it. It is for a mod with a key (a site).
export function FavouriteStar({ starKey }: { starKey: string }) {
  const { t } = useLingui()
  const game = useCurrentGame()
  const on = useStarred(game, starKey)
  if (starKey === '') {
    return null
  }
  return (
    <IconButton
      size="small"
      aria-pressed={on}
      aria-label={on ? t`Remove from favourites` : t`Add to favourites`}
      onClick={(e) => {
        e.stopPropagation()
        setStarred(game, starKey, !on)
      }}
      sx={{ p: 0.25, color: on ? 'warning.main' : 'text.disabled' }}
    >
      <Star size={SIZE} fill={on ? 'currentColor' : 'none'} aria-hidden={true} />
    </IconButton>
  )
}
