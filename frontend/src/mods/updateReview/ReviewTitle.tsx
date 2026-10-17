import { plural } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { Box, DialogTitle, IconButton, Typography } from '@mui/material'
import { X } from 'lucide-react'
import { space } from '../../theme/density.ts'

export function ReviewTitle({
  count,
  profileName,
  checkedLabel,
  onClose,
}: {
  count: number
  profileName: string
  checkedLabel: string
  onClose: () => void
}) {
  const { t } = useLingui()
  return (
    <DialogTitle
      component="div"
      sx={{ display: 'flex', alignItems: 'center', gap: space.pad, p: space.pad }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography component="h2" sx={{ fontSize: 22, fontWeight: 700 }}>
          {plural(count, {
            one: `# update for ${profileName}`,
            other: `# updates for ${profileName}`,
          })}
        </Typography>
        <Typography sx={{ fontSize: 13 }}>{checkedLabel}</Typography>
      </Box>
      <IconButton aria-label={t`Close`} onClick={onClose}>
        <X size={16} />
      </IconButton>
    </DialogTitle>
  )
}
