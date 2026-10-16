import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import type { ReactNode } from 'react'
import { destructiveSx } from './destructive.ts'

export function MenuAction({
  icon,
  label,
  disabled,
  reason,
  tone,
  onClick,
}: {
  icon: ReactNode
  label: ReactNode
  disabled?: boolean | undefined
  // Why the item is disabled, shown under its label; a disabled item cannot be hovered reliably for a tooltip.
  reason?: string | undefined
  tone?: 'error' | undefined
  onClick: () => void
}) {
  return (
    <MenuItem disabled={disabled} onClick={onClick} sx={tone ? destructiveSx : undefined}>
      <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>
      {disabled && reason ? (
        <ListItemText
          secondary={reason}
          slotProps={{ secondary: { sx: { whiteSpace: 'normal' } } }}
        >
          {label}
        </ListItemText>
      ) : (
        <ListItemText>{label}</ListItemText>
      )}
    </MenuItem>
  )
}
