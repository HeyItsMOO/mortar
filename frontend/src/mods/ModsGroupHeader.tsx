import { useLingui } from '@lingui/react/macro'
import { Box, Button, Switch, Typography } from '@mui/material'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { CoverButton } from '../shell/CoverButton.tsx'
import { space } from '../theme/density.ts'
import { reportUnexpected } from '../toasts/report.ts'
import { usePending } from '../toasts/usePending.ts'
import { GroupMenu } from './GroupMenu.tsx'
import { toggleCollapsed } from './group.ts'
import { LockedReason } from './LockedReason.tsx'
import type { ListRow } from './listColumns.ts'
import { useMods } from './store.ts'
import { findSources } from './storeEntries.ts'
import { setGroupEnabled } from './storeGroups.ts'
import { useLocked } from './useLocked.ts'

function ModsGroupHeader({
  label,
  count,
  open,
  onToggle,
  hint,
  enabled,
  onEnabled,
  menu,
}: {
  label: string
  count: number
  open: boolean
  onToggle: () => void
  hint?: string
  enabled?: boolean
  onEnabled?: (on: boolean) => void
  menu?: ReactNode
}) {
  const locked = useLocked()
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        width: '100%',
        px: space.pad,
        py: 0.75,
        bgcolor: 'var(--mortar-hairline-ghost)',
        borderBottom: '1px solid var(--mortar-hairline-muted)',
        '& > :not(.MuiButtonBase-root, [data-control])': { pointerEvents: 'none' },
      }}
    >
      <CoverButton onClick={onToggle} aria-expanded={open} aria-label={label} title={hint} />
      {open ? (
        <ChevronDown size={14} aria-hidden={true} />
      ) : (
        <ChevronRight size={14} aria-hidden={true} />
      )}
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{label}</Typography>
      <Box component="span" sx={{ fontSize: 12, color: 'text.secondary' }}>
        {count}
      </Box>
      {menu || onEnabled ? (
        <Box
          data-control={true}
          sx={{ ml: 'auto', position: 'relative', display: 'flex', alignItems: 'center' }}
        >
          {menu}
          {onEnabled ? (
            <LockedReason locked={locked}>
              <Switch
                size="small"
                checked={enabled === true}
                disabled={locked}
                onChange={(_, on) => onEnabled(on)}
                slotProps={{ input: { 'aria-label': label } }}
              />
            </LockedReason>
          ) : null}
        </Box>
      ) : null}
    </Box>
  )
}

// The button on a source group that holds mods with no recorded site: looks each one up on Nexus.
function FindSourcesButton() {
  const { t } = useLingui()
  const locked = useLocked()
  const [pending, run] = usePending()
  return (
    <LockedReason locked={locked}>
      <Button
        size="small"
        // The list gives every group header one fixed height, which a small button's own padding overflows.
        sx={{ height: 20, minHeight: 0, py: 0 }}
        disabled={locked || pending}
        startIcon={<Search size={14} aria-hidden={true} />}
        onClick={() => run(findSources, { errorTitle: t`Could not look these mods up on Nexus` })}
      >
        {t`Find on Nexus`}
      </Button>
    </LockedReason>
  )
}

function GroupHeaderRow({
  groupKey,
  count,
  label,
  collapsed,
  gameId,
  setCollapsed,
  groupBy,
  tagHint,
  groups,
}: {
  groupKey: string
  count: number
  label: string
  collapsed: Record<string, boolean>
  gameId: string
  setCollapsed: (fn: (cur: Record<string, boolean>) => Record<string, boolean>) => void
  groupBy: string
  tagHint: string
  groups: readonly { key: string; items: readonly ListRow[] }[]
}) {
  const open = collapsed[groupKey] !== true
  return (
    <ModsGroupHeader
      label={label}
      count={count}
      open={open}
      onToggle={() => setCollapsed((cur) => toggleCollapsed(gameId, cur, groupKey, open))}
      {...(groupBy === 'tag' ? { hint: tagHint } : {})}
      {...(groupBy === 'group' && groupKey !== ''
        ? {
            enabled:
              groups.find((g) => g.key === groupKey)?.items.every((r) => r.mod.enabled) === true,
            menu: <GroupMenu name={groupKey} />,
            onEnabled: (on: boolean) => {
              setGroupEnabled(groupKey, on)
                .then(() => useMods.getState().load())
                .catch(reportUnexpected)
            },
          }
        : {})}
      {...(groupBy === 'source' &&
      groups.find((g) => g.key === groupKey)?.items.some((r) => r.unsourced === true) === true
        ? { menu: <FindSourcesButton /> }
        : {})}
    />
  )
}

// The open group's header pinned over the top of a scrolled list, on a solid surface so rows do not show through it.
function StickyGroupSlot({ shift, children }: { shift: number; children: ReactNode }) {
  return (
    <Box sx={{ position: 'sticky', top: 0, height: 0, zIndex: 2 }}>
      <Box sx={{ transform: `translateY(${shift}px)`, bgcolor: 'var(--mortar-menu)' }}>
        {children}
      </Box>
    </Box>
  )
}

export { GroupHeaderRow, StickyGroupSlot }
