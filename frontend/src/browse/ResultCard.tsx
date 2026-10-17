import { useLingui } from '@lingui/react/macro'
import { Box, ButtonBase, Card, Typography } from '@mui/material'
import { type MouseEvent, memo, useState } from 'react'
import { formatAuthors } from '../mods/authorNormalize.ts'
import { useSettings } from '../settings/store.ts'
import { BUTTON_RADIUS_PX, BUTTON_SMALL_HEIGHT } from '../theme/theme.ts'
import { GRAY_OPACITY, PICTURE_PX, ROW_PICTURE_PX } from './browseConstants.ts'

import type { BrowseModes } from './browseModes.ts'
import type { BrowseItem, ResultCardProps } from './browseTypes.ts'
import { pictureSrc } from './pictureSrc.ts'
import { SourceBadges } from './SourceBadges.tsx'
import { hitKey, useBrowseSelection } from './selection.ts'
import { parseCardStats, useCardStats } from './stats.ts'
import { useCardAction } from './useCardAction.tsx'

function CardPicture({ picture, size, dim }: { picture: string; size: number; dim: number }) {
  const sx = { width: size, height: size, flexShrink: 0, borderRadius: '4px', opacity: dim }
  const [failed, setFailed] = useState(false)
  if (picture === '' || failed) {
    return <Box sx={{ ...sx, bgcolor: 'var(--mortar-raised)' }} />
  }
  return (
    <Box
      component="img"
      src={pictureSrc(picture)}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      sx={{ ...sx, objectFit: 'cover' }}
    />
  )
}

// Gray out dims the mod's picture and text; the action and its chip stay readable.
function isGray(modes: BrowseModes, item: BrowseItem, installed: boolean): boolean {
  return (
    (modes.installed === 'gray' && installed) ||
    (modes.obsolete === 'gray' && item.obsolete) ||
    (modes.broken === 'gray' && item.broken)
  )
}

// Under a grid card's picture the action is as wide as the picture: a button's label wraps rather than widening the
// column, and drops its icon to fit.
const underPictureSx = {
  '& .MuiButton-root': {
    width: '100%',
    minWidth: 0,
    height: 'auto',
    minHeight: BUTTON_SMALL_HEIGHT,
    px: 0.5,
    py: 0.5,
    whiteSpace: 'normal',
    lineHeight: 1.2,
  },
  '& .MuiButton-startIcon': { display: 'none' },
  // A status chip (Added, Loader) takes the button's place and shape.
  '& .MuiChip-root': {
    width: '100%',
    height: BUTTON_SMALL_HEIGHT,
    borderRadius: `${BUTTON_RADIUS_PX}px`,
  },
} as const

// A click on the card's own buttons and links does what they say, not select the card.
const onControl = (e: MouseEvent<HTMLElement>) =>
  e.target instanceof Element && e.target.closest('button, a, [role="button"]') !== null

const ResultCard = memo(function BrowseResultCard(props: ResultCardProps) {
  const { row, item, modes, sourceNames } = props
  const { t } = useLingui()
  const { name, summary, author } = item
  // The same mod found on several sources is one card; its first source is the default and a badge picks another.
  const sources = [item.source, ...(item.alts ?? []).map((a) => a.source)]
  const [picked, setPicked] = useState(item.source)
  const source = sources.includes(picked) ? picked : item.source
  const { shownItem, installed, action } = useCardAction(props, item, source)
  const shownStats = parseCardStats(useSettings((s) => s.browseCardStats))
  const stats = useCardStats(shownItem, shownStats)
  const selected = useBrowseSelection(
    (s) => s.selected !== null && hitKey(s.selected.item) === hitKey(item),
  )
  const dim = isGray(modes, shownItem, installed) ? GRAY_OPACITY : 1
  return (
    <Card
      data-hit={hitKey(item)}
      aria-current={selected ? 'true' : undefined}
      onClick={(e) => {
        if (!onControl(e)) {
          useBrowseSelection.getState().select({ item, source })
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        useBrowseSelection
          .getState()
          .openMenu({ item, source }, { top: e.clientY, left: e.clientX })
      }}
      sx={{
        display: 'flex',
        alignItems: row ? 'center' : 'stretch',
        gap: 1.25,
        p: 1,
        borderRadius: '6px',
        minWidth: 0,
        cursor: 'pointer',
        outline: selected ? '2px solid' : 'none',
        outlineColor: 'primary.main',
        outlineOffset: '-2px',
      }}
    >
      {row ? (
        <CardPicture picture={item.picture} size={ROW_PICTURE_PX} dim={dim} />
      ) : (
        <Box
          sx={{
            width: PICTURE_PX,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
            ...underPictureSx,
          }}
        >
          <CardPicture picture={item.picture} size={PICTURE_PX} dim={dim} />
          {action}
        </Box>
      )}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          opacity: dim,
        }}
      >
        {/* The title is the card's keyboard stop: Enter opens the details, the menu key the card's menu. */}
        <ButtonBase
          aria-label={t`Details of ${item.name}`}
          onClick={() => useBrowseSelection.getState().select({ item, source })}
          sx={{ display: 'block', minWidth: 0, textAlign: 'left', fontFamily: 'inherit' }}
        >
          <Typography noWrap={true} title={name} sx={{ fontSize: 15, fontWeight: 600 }}>
            {name}
          </Typography>
        </ButtonBase>
        {author === '' ? null : (
          <Typography noWrap={true} sx={{ fontSize: 12, fontWeight: 500, color: 'primary.light' }}>
            {formatAuthors(author)}
          </Typography>
        )}
        <Typography
          title={summary}
          sx={{
            fontSize: 13,
            color: 'var(--mortar-ink-85)',
            display: '-webkit-box',
            WebkitLineClamp: row ? 1 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {summary}
        </Typography>
        {stats.length === 0 ? null : (
          // Each stat stays whole and the line wraps between them on a narrow card.
          <Typography
            sx={{
              fontSize: 12,
              color: 'var(--mortar-ink-dim-60)',
              fontVariantNumeric: 'tabular-nums',
              display: 'flex',
              flexWrap: 'wrap',
              columnGap: 0.75,
            }}
          >
            {stats.map((s, i) => (
              <Box component="span" key={s} sx={{ whiteSpace: 'nowrap' }}>
                {i === 0 ? s : `· ${s}`}
              </Box>
            ))}
          </Typography>
        )}
        <SourceBadges sources={sources} picked={source} names={sourceNames} onPick={setPicked} />
      </Box>
      {row ? action : null}
    </Card>
  )
})

export { CardPicture, ResultCard }
