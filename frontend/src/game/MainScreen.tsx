import { Box } from '@mui/material'
import { useEffect } from 'react'
import { HelpDialog } from '../console/HelpDialog.tsx'
import { LoaderBanner } from '../loader/Banner.tsx'
import { useProfiles } from '../profiles/store.ts'
import { Detail } from './Detail.tsx'
import { Sidebar } from './Sidebar.tsx'
import { useSidebarBadges } from './useSidebarProfiles.ts'

// Its own component: the badge loader follows every profile and mod change, which must not re-render the screen.
function SidebarBadges({ game }: { game: string }) {
  useSidebarBadges(game)
  return null
}

export function MainScreen({ game }: { game: string }) {
  const load = useProfiles((s) => s.load)
  useEffect(() => {
    load(game)
  }, [game, load])
  return (
    <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SidebarBadges game={game} />
      <LoaderBanner game={game} />
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <Sidebar game={game} />
        <Detail />
      </Box>
      <HelpDialog game={game} />
    </Box>
  )
}
